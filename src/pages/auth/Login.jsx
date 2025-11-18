import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../config/env";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { isAccessTokenInUrl, cleanUrlParams } from "../../utils/authUtils";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login"); // 'login' or 'signup'
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login: contextLogin } = useAuth();

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/courses", { replace: true });
    }
  }, [user, navigate]);

  // Check for URL tokens on mount
  useEffect(() => {
    const handleUrlTokens = async () => {
      if (isAccessTokenInUrl()) {
        setLoading(true);
        try {
          // Get tokens from URL
          const urlParams = new URLSearchParams(window.location.search);
          const hashParams = new URLSearchParams(
            window.location.hash.substring(1)
          );

          const access_token =
            urlParams.get("access_token") || hashParams.get("access_token");
          const refresh_token =
            urlParams.get("refresh_token") || hashParams.get("refresh_token");

          if (access_token && refresh_token) {
            console.log("🔑 Setting session with URL tokens");

            // Set the session
            const { data, error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (error) {
              console.error("❌ Error setting session:", error);
              toast.error("Failed to authenticate with provided tokens");
            } else if (data.user) {
              console.log("✅ Successfully authenticated with URL tokens");
              contextLogin(data.user);
              cleanUrlParams();
              toast.success("Successfully logged in!");
              navigate("/courses", { replace: true });
            }
          }
        } catch (error) {
          console.error("Error handling URL tokens:", error);
          toast.error("An error occurred during authentication");
        } finally {
          setLoading(false);
        }
      }
    };

    handleUrlTokens();
  }, [location, navigate, contextLogin]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        toast.error(error.message || "Failed to login");
      } else if (data.user) {
        console.log("✅ Successfully logged in");
        toast.success("Successfully logged in!");
        // Navigate to root which will trigger App.jsx to fetch user data
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("Signup error:", error);
        toast.error(error.message || "Failed to sign up");
      } else if (data.user) {
        console.log("✅ Successfully signed up");
        toast.success(
          "Successfully signed up! Please check your email for verification."
        );
        setMode("login");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  const redirectToExternalLogin = () => {
    window.location.href = "https://meducation.pk/login";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mb-8 text-center">
        <h1
          className="text-5xl font-black text-blue-600 mb-2 tracking-wide"
          style={{ letterSpacing: "0.05em" }}
        >
          MEducation
        </h1>
        <p className="text-gray-600">Course Management System</p>
      </div>

      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {mode === "login" ? "Welcome back" : "Create an account"}
          </CardTitle>
          <CardDescription className="text-center">
            {mode === "login"
              ? "Enter your credentials to access your courses"
              : "Sign up to get started with MEducation"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={mode === "login" ? handleLogin : handleSignup}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? "Please wait..."
                  : mode === "login"
                  ? "Sign In"
                  : "Sign Up"}
              </Button>
            </div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={redirectToExternalLogin}
            type="button"
          >
            Login via MEducation Portal
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {mode === "login"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </CardFooter>
      </Card>

      <div className="mt-8 text-center text-sm text-gray-600">
        <p>For Students and Staff</p>
        <p className="mt-1">Access your courses and materials</p>
      </div>
    </div>
  );
}
