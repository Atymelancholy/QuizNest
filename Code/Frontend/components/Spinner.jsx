// Enhanced Spinner.jsx with White & Blue Theme
import React from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import "./Spinner.css";

const Spinner = ({ message = "Loading..." }) => {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    // Beautiful auth loading screen for login/register pages
    if (isAuthPage) {
        return (
            <div className="simple-auth-loader">
                <div className="beautiful-spinner">
                    <div className="spinner-outer"></div>
                    <div className="spinner-inner"></div>
                    <div className="spinner-dots">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Default spinner for other pages
    return (
        <motion.div
            className="enhanced-spinner-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Floating Background Elements */}
            <div className="floating-elements">
                <div className="floating-orb orb-1"></div>
                <div className="floating-orb orb-2"></div>
                <div className="floating-orb orb-3"></div>
                <div className="floating-orb orb-4"></div>
            </div>

            <div className="enhanced-loading-container">
                <motion.div
                    className="enhanced-loading-spinner"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <div className="enhanced-spinner-ring"></div>
                    <div className="enhanced-spinner-inner"></div>
                    <div className="enhanced-spinner-center"></div>
                </motion.div>
                <motion.div
                    className="loading-dots"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                </motion.div>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="enhanced-loading-text"
                >
                    {message}
                </motion.p>
            </div>
        </motion.div>
    );
};

export default Spinner;