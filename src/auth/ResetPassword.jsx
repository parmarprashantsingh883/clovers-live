import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Leaf, Eye, EyeOff } from "lucide-react";
import { api, errMsg } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setIsLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      toast({ title: "Password updated — sign in with your new password" });
      navigate("/login");
    } catch (err) {
      setError(errMsg(err, "This reset link is invalid or has expired."));
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
          <h2 className="text-3xl font-bold text-foreground">Set a new password</h2>
          <p className="mt-2 text-muted-foreground">
            Choose a strong password you haven't used before.
          </p>
        </div>

        {!token ? (
          <div className="bg-card border border-border rounded-2xl p-6 text-center space-y-3">
            <p className="text-foreground font-medium">Missing reset token</p>
            <p className="text-sm text-muted-foreground">
              Use the link from your email, or request a new one.
            </p>
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Request a new link →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {[
              { id: "password", label: "New Password", value: password, set: setPassword },
              { id: "confirm", label: "Confirm Password", value: confirm, set: setConfirm },
            ].map((f) => (
              <div className="space-y-2" key={f.id}>
                <label htmlFor={f.id} className="block text-sm font-medium text-foreground">
                  {f.label}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    id={f.id}
                    type={show ? "text" : "password"}
                    required
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                    placeholder="••••••••"
                  />
                  {f.id === "password" && (
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? "Updating…" : "Update password"}
            </button>
          </form>
        )}

        <p className="text-center text-muted-foreground text-sm">
          Remembered it?{" "}
          <Link to="/login" className="font-semibold text-primary hover:text-primary/80">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
