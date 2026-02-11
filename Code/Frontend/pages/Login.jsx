import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../utils/axios";
import "./Login.css";
import "../App.css";
import { ThemeContext } from "../context/ThemeContext";
import NotificationModal from "../components/NotificationModal";
import { useNotification } from "../hooks/useNotification";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import Loading from "../components/Loading";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const navigate = useNavigate();
    const { changeTheme } = useContext(ThemeContext);

    // Notification system
    const { notification, showError, hideNotification } = useNotification();

    // Real-time validation
    const validateField = (name, value) => {
        const newErrors = { ...errors };
        switch (name) {
            case 'email':
                if (!value) {
                    newErrors.email = 'Email is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    newErrors.email = 'Please enter a valid email';
                } else {
                    delete newErrors.email;
                }
                break;
            case 'password':
                if (!value) {
                    newErrors.password = 'Password is required';
                } else if (value.length < 6) {
                    newErrors.password = 'Password must be at least 6 characters';
                } else {
                    delete newErrors.password;
                }
                break;
            default:
                break;
        }
        setErrors(newErrors);
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched({ ...touched, [name]: true });
        validateField(name, value);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'email') setEmail(value);
        if (name === 'password') setPassword(value);

        if (touched[name]) {
            validateField(name, value);
        }
    };

    // Keyboard shortcuts
    useKeyboardShortcuts({
        'Enter': (e) => {
            // Only submit if not already in a button and form is valid
            const target = e.target;
            if (target.tagName !== 'BUTTON' &&
                target.tagName !== 'TEXTAREA' &&
                email && password) {
                const form = target.closest('form');
                if (form && form.checkValidity()) {
                    e.preventDefault();
                    form.requestSubmit();
                }
            }
        },
    }, [email, password]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`/api/users/login`, { email, password }, {
                headers: { "Content-Type": "application/json" }
            });
            // ✅ Save token and user to localStorage
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            // ✅ Apply theme immediately after login
            const userTheme = res.data.user.selectedTheme || "Default";
            changeTheme(userTheme);

            // ✅ Navigate based on role
            if (res.data.user.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/");
            }
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            showError("Login Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modern-auth-container">
            {/* Background Elements */}
            <div className="auth-bg-gradient"></div>
            <div className="floating-elements">
                <div className="floating-orb orb-1"></div>
                <div className="floating-orb orb-2"></div>
                <div className="floating-orb orb-3"></div>
            </div>

            {/* Main Content */}
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Welcome</h1>
                    <p>Sign in to your account</p>
                </div>

                <form onSubmit={handleLogin} className="auth-form">
                    <div className={`input-group ${touched.email && errors.email ? 'input-error' : ''} ${touched.email && !errors.email && email ? 'input-valid' : ''}`}>
                        <label htmlFor="email">Email</label>
                        <div className="input-wrapper">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Enter your email"
                                required
                                disabled={loading}
                                aria-label="Email address"
                                aria-required="true"
                                aria-invalid={touched.email && errors.email ? 'true' : 'false'}
                                aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
                                autoComplete="email"
                            />
                            {touched.email && !errors.email && email && (
                                <span className="input-check-icon">✓</span>
                            )}
                        </div>
                        {touched.email && errors.email && (
                            <span id="email-error" className="error-message" role="alert">{errors.email}</span>
                        )}
                    </div>

                    <div className={`input-group ${touched.password && errors.password ? 'input-error' : ''} ${touched.password && !errors.password && password ? 'input-valid' : ''}`}>
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Enter your password"
                                required
                                disabled={loading}
                                aria-label="Password"
                                aria-required="true"
                                aria-invalid={touched.password && errors.password ? 'true' : 'false'}
                                aria-describedby={touched.password && errors.password ? 'password-error' : undefined}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                tabIndex={-1}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                            {touched.password && !errors.password && password && (
                                <span className="input-check-icon">✓</span>
                            )}
                        </div>
                        {touched.password && errors.password && (
                            <span id="password-error" className="error-message" role="alert">{errors.password}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="auth-btn primary"
                        disabled={loading}
                        aria-label="Sign in to your account"
                        aria-busy={loading}
                    >
                        <span>Sign In</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/register">Create one</Link></p>
                </div>
            </div>

            {/* Full Screen Loader */}
            {loading && <Loading fullScreen={true} />}

            {/* Notification Modal */}
            <NotificationModal
                isOpen={notification.isOpen}
                message={notification.message}
                type={notification.type}
                onClose={hideNotification}
                autoClose={notification.autoClose}
            />
        </div>
    );
};

export default Login;
