import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';

/**
 * Ensure Auction.status reflects startDate/endDate.
 * This is necessary because the model only updates status on save,
 * so read endpoints may return stale statuses otherwise.
 */
export async function syncAuctionStatuses({ sellerId } = {}) {
  const now = new Date();

  const baseFilter = { status: { $ne: 'cancelled' } };
  if (sellerId) baseFilter.seller = sellerId;

  // pending -> active when startDate <= now <= endDate
  await Auction.updateMany(
    {
      ...baseFilter,
      status: 'pending',
      startDate: { $lte: now },
      endDate: { $gte: now },
    },
    { $set: { status: 'active' } }
  );

  // active -> completed when endDate < now
  const completedFilter = {
    ...baseFilter,
    status: 'active',
    endDate: { $lt: now },
  };

  await Auction.updateMany(completedFilter, { $set: { status: 'completed' } });

  // Finalize bids for auctions that just completed
  await finalizeBidsForCompletedAuctions(completedFilter);

  // active -> pending if startDate is in the future (edge case)
  await Auction.updateMany(
    {
      ...baseFilter,
      status: 'active',
      startDate: { $gt: now },
    },
    { $set: { status: 'pending' } }
  );

  // completed -> active if endDate moved to the future (edge case)
  await Auction.updateMany(
    {
      ...baseFilter,
      status: 'completed',
      endDate: { $gt: now },
    },
    { $set: { status: 'active' } }
  );
}

async function finalizeBidsForCompletedAuctions(completedAuctionFilter) {
  // Find recently completed auctions (we use filter matching endDate < now)
  const auctions = await Auction.find(
    { ...completedAuctionFilter, status: 'completed' },
    { _id: 1, highestBidder: 1 }
  );

  if (!auctions.length) return;

  const auctionIds = auctions.map((a) => a._id);

  // Mark winning bidder bids as won
  // (there can be multiple bids by winner, we mark all as won for simplicity)
  const winnerUpdates = auctions
    .filter((a) => a.highestBidder)
    .map((a) => ({
      auction: a._id,
      highestBidder: a.highestBidder,
    }));

  for (const w of winnerUpdates) {
    await Bid.updateMany(
      { auction: w.auction, bidder: w.highestBidder },
      { $set: { status: 'won' } }
    );
  }

  // For all other bidders, any remaining active bids become lost
  await Bid.updateMany(
    {
      auction: { $in: auctionIds },
      status: 'active',
    },
    { $set: { status: 'lost' } }
  );

  // Outbid bids remain outbid.
}

