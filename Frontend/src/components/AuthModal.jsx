import { useState, useEffect } from "react";
import { X, Mail, Lock, User, ArrowRight, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import {
  loginWithEmail,
  registerWithEmail,
  loginWithOAuth,
} from "../lib/authContext.js";
import { isAppwriteConfigured } from "../lib/appwrite.js";
import "../styles/auth.css";

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = "login",
  theme = "light", // "light" | "dark"
}) {
  const [mode, setMode] = useState(initialMode); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthNotice, setOauthNotice] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || "login");
      setError("");
      setOauthNotice(null);
      setShowPassword(false);
    }
  }, [isOpen, initialMode]);

  // Esc to close + lock page scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isSignup = mode === "signup";

  function switchMode(next) {
    setMode(next);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError("");
    setOauthNotice(null);

    try {
      let user;
      if (mode === "signup") {
        user = await registerWithEmail(email.trim(), password, name.trim());
      } else {
        user = await loginWithEmail(email.trim(), password);
      }

      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
      onClose();
    } catch (err) {
      console.error("Auth error:", err);
      let message = err?.message || "Authentication failed. Please try again.";
      if (message.includes("Invalid credentials") || message.includes("user_invalid_credentials")) {
        message = "Invalid email or password. Please verify your credentials.";
      } else if (message.includes("already exists") || message.includes("user_already_exists")) {
        message = "An account with this email already exists. Try signing in.";
      } else if (message.includes("Password must be")) {
        message = "Password must be at least 8 characters long.";
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSocial(provider) {
    setError("");
    if (!isAppwriteConfigured()) {
      setError("Appwrite Cloud is not configured with an active Project ID in .env.");
      return;
    }

    try {
      setLoading(true);
      setOauthNotice(`Connecting to ${provider}...`);
      await loginWithOAuth(provider);
      // Browser redirects to the OAuth provider
    } catch (err) {
      console.error("OAuth error:", err);
      setError(err?.message || `Failed to initiate ${provider} login.`);
      setLoading(false);
      setOauthNotice(null);
    }
  }

  return (
    <div
      className="ax-overlay"
      data-theme={theme}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="ax-card" role="dialog" aria-modal="true" aria-labelledby="ax-title">
        {/* Header */}
        <div className="ax-head">
          <div className="ax-brand">
            <span className="ax-brand-mark">IP</span>
            <span>
              Idea<b>Pulse</b>
            </span>
          </div>
          <button type="button" className="ax-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="ax-body">
          {/* Mode switch */}
          <div className="ax-seg" data-mode={mode} role="tablist">
            <span className="ax-seg-pill" />
            <button
              type="button"
              role="tab"
              aria-selected={!isSignup}
              onClick={() => switchMode("login")}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isSignup}
              onClick={() => switchMode("signup")}
            >
              Create Account
            </button>
          </div>

          <h3 className="ax-title" id="ax-title">
            {isSignup ? "Start building your venture" : "Welcome back, founder"}
          </h3>
          <p className="ax-sub">
            {isSignup
              ? "Free starter plan • 3 blueprints per week • No credit card required"
              : "Sign in to access your saved blueprints and analysis reports"}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="ax-collapse" data-open={isSignup} aria-hidden={!isSignup}>
              <div>
                <div className="ax-field">
                  <div className="ax-label-row">
                    <label className="ax-label" htmlFor="ax-name">Full Name</label>
                  </div>
                  <div className="ax-input">
                    <User size={16} className="ax-icon" />
                    <input
                      id="ax-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sarah Connor"
                      autoComplete="name"
                      tabIndex={isSignup ? 0 : -1}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="ax-field">
              <div className="ax-label-row">
                <label className="ax-label" htmlFor="ax-email">Email Address</label>
              </div>
              <div className="ax-input">
                <Mail size={16} className="ax-icon" />
                <input
                  id="ax-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="founder@venture.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="ax-field">
              <div className="ax-label-row">
                <label className="ax-label" htmlFor="ax-password">
                  Password<small>(min 8 characters)</small>
                </label>
                {!isSignup && (
                  <button
                    type="button"
                    className="ax-link"
                    onClick={() =>
                      alert("Password reset is managed through your Appwrite project configuration.")
                    }
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="ax-input">
                <Lock size={16} className="ax-icon" />
                <input
                  id="ax-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="ax-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="ax-error" role="alert" key={error}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="ax-primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="ax-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isSignup ? "Create Account" : "Sign In"}</span>
                  <ArrowRight size={15} className="ax-arrow" />
                </>
              )}
            </button>
          </form>

          {/* Social */}
          <div className="ax-divider">Or connect with</div>

          {oauthNotice && (
            <div className="ax-notice">
              <Loader2 size={14} className="ax-spin" />
              <span>{oauthNotice}</span>
            </div>
          )}

          <div className="ax-socials">
            <button
              type="button"
              className="ax-social"
              onClick={() => handleSocial("Google")}
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </button>
            <button
              type="button"
              className="ax-social"
              onClick={() => handleSocial("GitHub")}
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          <button
            type="button"
            className="ax-guest"
            onClick={() => {
              onClose();
              if (typeof window !== "undefined") {
                window.location.pathname = "/app";
              }
            }}
          >
            Continue as Guest <span>(Try 1 Free Idea)</span>
          </button>

          <p className="ax-legal">
            By continuing, you agree to IdeaPulse's Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
