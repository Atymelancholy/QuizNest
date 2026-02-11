import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../utils/axios";
import "./Sidebar.css";
import NotificationModal from "./NotificationModal";
import { useNotification } from "../hooks/useNotification";
import useResponsive from "../hooks/useResponsive";
import useTouchHandler from "../hooks/useTouchHandler";
import NavModule from "./NavModule";

const Sidebar = ({ isOpen = false, onClose }) => {
    const [user, setUser] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [closeBtnSlide, setCloseBtnSlide] = useState(false);
    const [sidebarSlide, setSidebarSlide] = useState(false);
    const [isUpgrading, setIsUpgrading] = useState(false);
    const navigate = useNavigate();

    // Enhanced mobile responsiveness
    const { isMobile, breakpoints } = useResponsive();
    const { handleSwipe, vibrate, isTouchDevice } = useTouchHandler();

    // Notification system
    const { notification,  showError, showInfo, hideNotification } = useNotification();

    // 🚀 АВТОМАТИЧЕСКИЙ АПГРЕЙД ДО PREMIUM
    useEffect(() => {
        const upgradeUserToPremium = async () => {
            const storedUser = JSON.parse(localStorage.getItem("user"));
            const token = localStorage.getItem("token");

            if (storedUser && token) {
                // Если пользователь с ролью "user" - автоматически апгрейдим до "premium"
                if (storedUser.role === "user") {
                    try {
                        setIsUpgrading(true);
                        const response = await axios.patch(`/api/users/update-role`, {
                            userId: storedUser._id,
                            role: "premium",
                        }, {
                            headers: { Authorization: `Bearer ${token}` }
                        });

                        if (response.status === 200) {
                            const updatedUser = response.data.user;
                            const newToken = response.data.token;

                            // Обновляем localStorage с новыми данными
                            localStorage.setItem("token", newToken);
                            localStorage.setItem("user", JSON.stringify(updatedUser));
                            setUser(updatedUser);

                           }
                    } catch (error) {
                        console.error("Auto-upgrade failed:", error);
                        // Если апгрейд не удался, все равно показываем пользователя
                        setUser(storedUser);
                    } finally {
                        setIsUpgrading(false);
                    }
                } else {
                    // Если уже premium или admin - просто устанавливаем пользователя
                    setUser(storedUser);
                }
            }
        };

        upgradeUserToPremium();
    }, [showInfo]); // Зависимость от showInfo

    // Альтернативный способ: если бэкенд не поддерживает auto-upgrade,
    // делаем форсированный апгрейд на фронтенде
    useEffect(() => {
        const forcePremiumUpgrade = () => {
            const storedUser = JSON.parse(localStorage.getItem("user"));

            if (storedUser && storedUser.role === "user") {
                // Форсированно меняем роль на premium в localStorage
                const upgradedUser = {
                    ...storedUser,
                    role: "premium"
                };

                localStorage.setItem("user", JSON.stringify(upgradedUser));
                setUser(upgradedUser);

                showInfo("✨ Your account has been upgraded to Premium!", 4000);
            }
        };

        // Раскомментируйте если бэкенд не поддерживает апгрейд
        // forcePremiumUpgrade();
    }, [showInfo]);

    // Стабильный обработчик клика вне сайдбара
    const handleClickOutside = useCallback((event) => {
        if (isMobile && isOpen) {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar && !sidebar.contains(event.target)) {
                setIsSidebarOpen(false);
                setCloseBtnSlide(false);
                setSidebarSlide(false);
                if (onClose) onClose();
            }
        }
    }, [isMobile, isOpen, onClose]);

    // Обработка клика вне сайдбара для мобильных устройств
    useEffect(() => {
        if (isMobile && isOpen) {
            const timeoutId = setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
                document.addEventListener('touchstart', handleClickOutside);
            }, 100);

            return () => {
                clearTimeout(timeoutId);
                document.removeEventListener('mousedown', handleClickOutside);
                document.removeEventListener('touchstart', handleClickOutside);
            };
        }
    }, [isMobile, isOpen, handleClickOutside]);

    // Toggle body class when sidebar opens/closes on mobile
    useEffect(() => {
        if (isMobile) {
            if (isOpen) {
                document.body.classList.add('sidebar-open');
            } else {
                document.body.classList.remove('sidebar-open');
            }
            return () => {
                document.body.classList.remove('sidebar-open');
            };
        }
    }, [isMobile, isOpen]);

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    await axios.post("/api/users/logout", {}, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                } catch (error) {
                    console.error("Logout API call failed:", error);
                }
            }
        } catch (error) {
            console.error("Error during logout:", error);
        } finally {
            localStorage.clear();
            navigate("/login");
        }
    };

    const handleLinkClick = () => {
        if (isMobile || breakpoints.mobile || window.innerWidth <= 768) {
            setIsSidebarOpen(false);
            setCloseBtnSlide(false);
            setSidebarSlide(false);
            if (onClose) onClose();
            if (isTouchDevice) {
                vibrate([10]);
            }
        }
    };

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
        if (isTouchDevice) {
            vibrate([5]);
        }
    };

    // Swipe gestures for mobile
    const swipeHandlers = handleSwipe(
        () => {
            setIsSidebarOpen(false);
            if (onClose) onClose();
        },
        () => {
            setIsSidebarOpen(true);
        },
        null,
        null
    );

    // Update role function
    const updateRole = async (newRole) => {
        if (!user) return;
        try {
            setIsUpgrading(true);
            const token = localStorage.getItem("token");
            const response = await axios.patch(`/api/users/update-role`, {
                userId: user._id,
                role: newRole,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                const updatedUser = response.data.user;
                const newToken = response.data.token;

                localStorage.setItem("token", newToken);
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setUser(updatedUser);


            }
        } catch (error) {
            console.error("Failed to update role:", error);
            showError("❌ Failed to update role.");
        } finally {
            setIsUpgrading(false);
        }
    };

    // Premium features list component
    const PremiumFeatures = () => (
        <div className="premium-features">
            <div className="premium-badge">
                <span className="premium-icon">⭐</span>
                <span>PREMIUM</span>
            </div>
            <ul className="premium-features-list">

            </ul>
        </div>
    );

    return (
        <>
            <motion.button
                key="sidebar-toggle"
                className="sidebar-toggle"
                onClick={toggleSidebar}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
                {...(isMobile ? swipeHandlers : {})}
            >
                ☰
            </motion.button>

            <AnimatePresence>
                {/* Mobile overlay */}
                {isMobile && isOpen && (
                    <motion.div
                        key="sidebar-overlay"
                        className="sidebar-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsSidebarOpen(false);
                            setCloseBtnSlide(false);
                            setSidebarSlide(false);
                            if (onClose) onClose();
                        }}
                        transition={{ duration: 0.3 }}
                    />
                )}

                <aside
                    className={`sidebar ${((isMobile || breakpoints.mobile) ? isOpen : isSidebarOpen) ? "open" : ""} ${sidebarSlide ? "slide-left" : ""}`}
                    {...(isMobile ? swipeHandlers : {})}
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <motion.div
                        key="sidebar-header"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        {/* Mobile close button */}
                        {(isMobile || breakpoints.mobile) && (
                            <button
                                className={`close-btn-sidebar${closeBtnSlide ? " slide-left" : ""}`}
                                aria-label="Close sidebar"
                                onClick={() => {
                                    setCloseBtnSlide(true);
                                    setTimeout(() => {
                                        setSidebarSlide(true);
                                        setTimeout(() => {
                                            setIsSidebarOpen(false);
                                            setCloseBtnSlide(false);
                                            setSidebarSlide(false);
                                            if (onClose) onClose();
                                        }, 350);
                                    }, 300);
                                }}
                            >
                                <span>Go Back</span>
                            </button>
                        )}

                        <Link to={user?.role === "admin" ? "/admin" : "/"} id="title">
                            <h2>QuizNest</h2>
                            {user?.role === "premium" && (
                                <span className="premium-title-badge"> </span>
                            )}
                        </Link>

                        {/* Premium welcome message */}

                    </motion.div>

                    <motion.nav
                        key="sidebar-nav"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        {user?.role === "admin" && (
                            <>
                                <NavModule title="Admin" icon="⚙" defaultExpanded={true} delay={0.6}>
                                    <Link to="/admin" onClick={handleLinkClick}>Dashboard</Link>
                                    <Link to="/admin/create" onClick={handleLinkClick}>Create Quiz</Link>
                                    <Link to="/admin/report" onClick={handleLinkClick}>Reports</Link>
                                </NavModule>

                                <NavModule title="Learning" icon="" defaultExpanded={true} delay={0.7}>

                                </NavModule>

                                <NavModule title="Social" icon="" defaultExpanded={false} delay={0.8}>

                                </NavModule>
                            </>
                        )}

                        {/* 🎉 ВСЕ ПОЛЬЗОВАТЕЛИ ТЕПЕРЬ PREMIUM */}
                        {(user?.role === "premium" || user?.role === "user") && (
                            <>
                                {/* Personal Module */}


                                {/* Learning Module - Полный доступ */}
                                <NavModule title="Learning" icon="" defaultExpanded={true} delay={0.7}>
                                    <Link to="/user/test" onClick={handleLinkClick}>Take Quizzes</Link>
                                    <Link to="/premium/quizzes" onClick={handleLinkClick}>Create Quizzes</Link>
                                      </NavModule>

                                {/* Social Module - Полный доступ */}


                                {/* AI Module - Только для premium */}

                                {/* Support Module */}


                                {/* Premium Features Showcase */}


                                {/* Role switch buttons - только если не admin */}

                            </>
                        )}
                    </motion.nav>

                    <motion.button
                        key="logout-btn"
                        className="logout-btn"
                        onClick={handleLogout}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4, duration: 0.5 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Log out
                    </motion.button>
                </aside>
            </AnimatePresence>

            {/* Notification Modal */}
            <NotificationModal
                isOpen={notification.isOpen}
                message={notification.message}
                type={notification.type}
                onClose={hideNotification}
                autoClose={notification.autoClose}
            />
        </>
    );
};

export default Sidebar;