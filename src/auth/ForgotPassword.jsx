import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Leaf, ArrowLeft } from "lucide-react";
import { api, errMsg } from "@/lib/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email: email.trim() });
      setSent(true);
      if (data.devResetUrl) setDevResetUrl(data.devResetUrl); // dev convenience when email is mocked
    } catch (err) {
      setError(errMsg(err, "Something went wrong. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md space-y-8 animate-fade-up">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Forgot password?</h2>
          <p className="mt-2 text-muted-foreground">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {sent ? (
          <div className="bg-card border border-border rounded-2xl p-6 text-center space-y-3">
            <p className="text-foreground font-medium">Check your inbox 📬</p>
            <p className="text-sm text-muted-foreground">
              If an account exists for <b>{email}</b>, a reset link is on its way.
              The link expires in 30 minutes.
            </p>
            {devResetUrl && (
              <a
                href={devResetUrl}
                className="inline-block text-sm text-primary hover:underline break-all"
              >
                Dev shortcut: open reset link →
              </a>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
