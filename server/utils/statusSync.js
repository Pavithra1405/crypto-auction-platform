import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';

export async function syncAuctionStatuses({ sellerId } = {}) {
  const now = new Date();

  const baseFilter = { status: { $ne: 'cancelled' } };
  if (sellerId) baseFilter.seller = sellerId;

  // active -> completed when endDate < now
  const completedFilter = {
    ...baseFilter,
    status: 'active',
    endDate: { $lt: now },
  };

  await Auction.updateMany(completedFilter, { $set: { status: 'completed' } });

  // Finalize bids for auctions that just completed
  await finalizeBidsForCompletedAuctions(completedFilter);
}

async function finalizeBidsForCompletedAuctions(completedAuctionFilter) {
  const auctions = await Auction.find(
    { ...completedAuctionFilter, status: 'completed' },
    { _id: 1, highestBidder: 1 }
  );

  if (!auctions.length) return;

  const auctionIds = auctions.map((a) => a._id);

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

  await Bid.updateMany(
    {
      auction: { $in: auctionIds },
      status: 'active',
    },
    { $set: { status: 'lost' } }
  );
}