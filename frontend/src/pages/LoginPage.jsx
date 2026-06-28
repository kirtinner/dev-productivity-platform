import { useState } from "react";
import api from "../api/api";

export default function LoginPage({ onLogin }) {
    const [mode, setMode] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const canSubmit = email.trim() !== "" && password !== "" && !submitting;
    const isSignUp = mode === "register";

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!canSubmit) {
            return;
        }

        setErrorMessage("");
        setSubmitting(true);

        try {
            const res = await api.post(isSignUp ? "/auth/register" : "/auth/login", {
                email: email.trim(),
                password
            });

            const token = res.data.token;

            localStorage.setItem("token", token);

            onLogin();
        } catch (error) {
            setErrorMessage(
                error?.response?.data?.message ??
                error?.response?.data?.error ??
                error?.message ??
                (isSignUp ? "Sign up failed." : "Login failed.")
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleModeChange = (nextMode) => {
        if (submitting || mode === nextMode) {
            return;
        }

        setMode(nextMode);
        setErrorMessage("");
    };

    return (
        <div className="tracking-modal-overlay login-modal-overlay" role="presentation">
            <form
                className="tracking-modal tracking-modal-confirm tracking-modal-editor login-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="login-title"
                onSubmit={handleSubmit}
            >
                <div className="tracking-modal-header">
                    <h3 id="login-title">{isSignUp ? "Sign Up" : "Sign In"}</h3>
                </div>

                <div className="tracking-modal-body">
                    <div className="login-mode-switch" role="group" aria-label="Authentication mode">
                        <button
                            type="button"
                            className={mode === "login" ? "login-mode-switch-active" : ""}
                            onClick={() => handleModeChange("login")}
                            disabled={submitting}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            className={mode === "register" ? "login-mode-switch-active" : ""}
                            onClick={() => handleModeChange("register")}
                            disabled={submitting}
                        >
                            Sign Up
                        </button>
                    </div>

                    <div className="tracking-modal-fields">
                        <label className="tracking-modal-field">
                            <span>Email</span>
                            <input
                                type="email"
                                autoComplete="username"
                                autoFocus
                                value={email}
                                onChange={event => setEmail(event.target.value)}
                                disabled={submitting}
                            />
                        </label>

                        <label className="tracking-modal-field">
                            <span>Password</span>
                            <input
                                type="password"
                                autoComplete={isSignUp ? "new-password" : "current-password"}
                                value={password}
                                onChange={event => setPassword(event.target.value)}
                                disabled={submitting}
                            />
                        </label>
                    </div>

                    {errorMessage ? (
                        <div className="tracking-modal-error login-modal-error">{errorMessage}</div>
                    ) : null}
                </div>

                <div className="tracking-modal-actions">
                    <button type="submit" className="tracking-modal-button" disabled={!canSubmit}>
                        {isSignUp ? "Create Account" : "Sign In"}
                    </button>
                </div>
            </form>
        </div>
    );
}
