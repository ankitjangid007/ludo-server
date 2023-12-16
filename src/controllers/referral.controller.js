import { Types } from "mongoose"
import { getAllReferralsWithWalletService } from "../services/referral.service.js";

// Get my all referrals user and along with my referral wallet controller
export const getAllReferralsWithWalletController = async (req, res) => {
    try {
        const userId = new Types.ObjectId(req.decoded.userId);
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const pageNumber = req.query.pageNumber ? Number(req.query.pageNumber) : 1;
        const result = await getAllReferralsWithWalletService(userId, limit, pageNumber)
        return res.status(200).json({ ...result })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}