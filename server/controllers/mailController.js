import Auction from '../models/Auction.js';
import { sendCongratsEmail } from '../utils/mailer.js';

// @desc    Send congratulations email to auction winner
// @route   POST /api/auctions/:id/send-congrats
// @access  Private (Seller only - own auctions)
export const sendCongratsToWinner = async (req, res) => {
  try {
    const auctionId = req.params.id;

    const auction = await Auction.findById(auctionId)
      .populate('seller', 'name email')
      .populate('highestBidder', 'name email');

    if (!auction) {
      return res.status(404).json({
        status: 'error',
        message: 'Auction not found',
      });
    }

    // Ownership check
    if (auction.seller._id.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to send mail for this auction',
      });
    }

    if (auction.status !== 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Auction must be completed before sending congratulations',
      });
    }

    if (!auction.highestBidder) {
      return res.status(400).json({
        status: 'error',
        message: 'No winner found for this auction',
      });
    }

    if (auction.congratsSent) {
      return res.json({
        status: 'success',
        message: 'Congratulations email already sent',
        data: {
          congratsSent: true,
          congratsSentAt: auction.congratsSentAt,
        },
      });
    }

    await sendCongratsEmail({
      to: auction.highestBidder.email,
      bidderName: auction.highestBidder.name,
      sellerName: auction.seller?.name,
      sellerEmail: auction.seller?.email,
      cryptoName: auction.cryptoName,
      cryptoSymbol: auction.cryptoSymbol,
      quantity: auction.quantity,
      winningBid: auction.currentBid || auction.basePrice,
    });

    auction.congratsSent = true;
    auction.congratsSentAt = new Date();
    await auction.save();

    return res.json({
      status: 'success',
      message: 'Congratulations email sent successfully',
      data: {
        congratsSent: true,
        congratsSentAt: auction.congratsSentAt,
      },
    });
  } catch (error) {
    console.error('Send congrats email error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while sending congratulations email',
    });
  }
};
