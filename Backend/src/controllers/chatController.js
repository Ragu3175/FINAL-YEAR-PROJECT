const aiService = require('../services/aiService');

const Vehicle = require('../models/Vehicle');
const Violation = require('../models/Violation');

/**
 * Chat Controller
 */
const sendMessage = async (req, res) => {
    try {
        const { message, contextData } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        const userId = req.user?.id;
        const userRole = req.user?.role || 'USER';

        let dbHistoryContext = '';
        try {
            let vehicles;
            if (userRole === 'ADMIN') {
                vehicles = await Vehicle.find().limit(5); // Adjust limit as needed
            } else if (userId) {
                vehicles = await Vehicle.find({ owner: userId });
            }

            if (vehicles && vehicles.length > 0) {
                const vehicleIds = vehicles.map(v => v._id);
                const violations = await Violation.find({ vehicle: { $in: vehicleIds } })
                    .sort({ timestamp: -1 })
                    .limit(15)
                    .populate('vehicle', 'vehicleNumber riskLevel');

                if (violations.length > 0) {
                    const historyStrs = violations.map(v => {
                        return `[${new Date(v.timestamp).toLocaleString()}] Vehicle ${v.vehicle?.vehicleNumber || 'Unknown'} - Type: ${v.type}, Severity: ${v.severity}`;
                    });
                    dbHistoryContext = "Recent Violations History:\n" + historyStrs.join("\n");
                } else {
                    dbHistoryContext = "No recent violations found for these vehicles.";
                }
            } else {
                dbHistoryContext = "No vehicles found for the user.";
            }
        } catch (dbErr) {
            console.error("Error fetching db history for chat:", dbErr);
            dbHistoryContext = "Error retrieving historical data.";
        }

        const response = await aiService.generateResponse(message, contextData, dbHistoryContext);

        res.status(200).json({
            success: true,
            reply: response
        });
    } catch (error) {
        console.error('Chat Controller Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error in chat assistant'
        });
    }
};

module.exports = {
    sendMessage
};
