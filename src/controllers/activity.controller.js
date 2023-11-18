import { getActivityService } from "../services/activity.service.js";

export const getActivityController = async (req, res) => {
    try {
        const { activityTag, userId } = req.query;
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const pageNumber = req.query.pageNumber ? Number(req.query.pageNumber) : 1;

        const activities = await getActivityService(activityTag, userId, limit, pageNumber);
        return res.status(200).json({
            message: "All activities fetched successfully",
            data: activities
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }

}