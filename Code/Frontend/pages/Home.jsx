import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./Home.css";
import "../App.css";
import Loading from "../components/Loading";

const Home = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser) {
            navigate("/login");
            return;
        }
        setUser(storedUser);
        setLoading(false);
    }, [navigate]);

    if (loading) return <Loading fullScreen={true} />;

    return (
        <motion.div
            className="home-container"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                textAlign: "center",
                padding: "20px"
            }}
        >
            {/* Первая надпись */}
            <motion.h1
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                style={{
                    fontSize: "3rem",
                    fontWeight: "bold",
                    marginBottom: "20px",
                    color: "var(--text-primary)"
                }}
            >
                Welcome back, {user?.name || "User"}!
            </motion.h1>

            {/* Вторая надпись */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                style={{
                    fontSize: "1.5rem",
                    color: "var(--text-secondary)",
                    maxWidth: "600px",
                    lineHeight: "1.5"
                }}
            >
                Ready to level up your knowledge?
            </motion.p>
        </motion.div>
    );
};

export default Home;