"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UserAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/services/supabaseClient";
import { Mail, Lock, User2Icon, Eye, EyeOff } from "lucide-react";

export function RegisterForm() {
  const { signUpNewUser } = UserAuth();
  const router = useRouter();
  const emailRef = useRef();
  const nameRef = useRef();
  const passwordRef = useRef();
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();

    const email = emailRef.current?.value.trim();
    const name = nameRef.current?.value.trim();
    const password = passwordRef.current?.value;

    if (!email || !name || !password) {
      toast.error("Please fill in all the fields.");
      return;
    }

    if (password.length < 8) {
      toast.error("The password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await signUpNewUser(email, password, {
        name,
        role,
      });

      console.log("Signup result:", result);

      if (result.success) {
        toast.success("Account created! Redirecting...");
        router.push("/login");
      } else {
        setError(result.error);
        toast.error(result.error || "Email already exists.");
      }
    } catch (err) {
      console.error("Catch block error:", err);
      toast.error("An unexpected error occurred.");
    }
  };

  const SignUpWithGoogle = async () => {
    if (!role) {
      toast.error("Please select a role first.");
      return;
    }

    localStorage.setItem("pending_role", role);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error("Google sign-up failed: " + error.message);
    } else {
      toast.success("Redirecting to Google...");
    }
  };

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-8 shadow-sm">
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your details to get started
        </p>
      </div>

      <form onSubmit={handleSignUp} className="flex flex-col gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              ref={emailRef}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="name">Full Name</Label>
          <div className="relative">
            <User2Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              ref={nameRef}
              className={"pl-10"}
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="**********"
              autoComplete="new-password"
              ref={passwordRef}
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="role">Register as</Label>
          <Select onValueChange={setRole} value={role}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="candidate">Candidate</SelectItem>
              <SelectItem value="recruiter">Recruiter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          className="w-full bg-black text-white hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </Button>
      </form>

      <div className="relative text-center text-xs">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <span className="relative bg-card px-3 text-muted-foreground">
          Or continue with
        </span>
      </div>

      <Button
        variant="outline"
        className="w-full flex items-center justify-center gap-2 cursor-pointer"
        onClick={SignUpWithGoogle}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 48 48"
          className="mr-2"
        >
          <path
            fill="#FFC107"
            d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
          ></path>
          <path
            fill="#FF3D00"
            d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
          ></path>
          <path
            fill="#4CAF50"
            d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
          ></path>
          <path
            fill="#1976D2"
            d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
          ></path>
        </svg>
        Register with Google
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <a
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline cursor-pointer"
        >
          Login
        </a>
      </p>
    </div>
  );
}
