const userService = require("../services/userService");

async function createUser(req, res) {
    try {
        const { name, email, passwordHash } = req.body;

        if (!name || !email || !passwordHash) {
            return res.status(400).json({
                message: "Name, email, and passwordHash are required",
            });
        }

        const user = await userService.createUser(
            name,
            email,
            passwordHash
        );

        res.status(201).json({
            message: "User created successfully",
            user,
        });
    } catch (error) {
        console.error("Create user error:", error);

        res.status(500).json({
            message: "Failed to create user",
        });
    }
}

async function getAllUsers(req, res) {
    try {
        const users = await userService.getAllUsers();

        res.json({
            users,
        });
    } catch (error) {
        console.error("Get users error:", error);

        res.status(500).json({
            message: "Failed to fetch users",
        });
    }
}

async function getUserById(req, res) {
    try {
        const { id } = req.params;

        const user = await userService.getUserById(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.json({
            user,
        });
    } catch (error) {
        console.error("Get user error:", error);

        res.status(500).json({
            message: "Failed to fetch user",
        });
    }
}

async function getCurrentUser(req, res) {
    try {
        const user = await userService.getUserById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.json({
            user,
        });
    } catch (error) {
        console.error("Get current user error:", error);

        res.status(500).json({
            message: "Failed to fetch current user",
        });
    }
}
module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    getCurrentUser,
};