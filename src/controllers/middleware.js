require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const createContext = (req, res, next) => {
    req.context = {
        models: {
            User
        },
    };
    next();
};

const isLoggedIn = async (req, res, next) => {
    try {
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(" ")[1];
            if (token) {
                const payload = await jwt.verify(token, process.env.SECRET);
                if (payload) {
                    req.user = payload;
                    next();
                } else {
                    res.status(400).json({ error: "token verification failed" });
                }
            } else {
                res.status(400).json({ error: "malformed auth header" });
            }
        } else {
            res.status(400).json({ error: "No authorization header" });
        }
    } catch (error) {
        res.status(400).json({ error });
    }
};

module.exports = {
    isLoggedIn,
    createContext
};