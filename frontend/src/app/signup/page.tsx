"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Image from "next/image";
import "@/cssFiles/homeanimations.css";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input"


export default function SignupPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    email: "",
    password: "",
    username: "",
  });

  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    try {
      setLoading(true);
      await axios.post("api/users/login", user).then((response) => {
        if (response.data.success == false) {
          toast.error(response.data.message, { icon: "👏" });
        } else {
          toast.success("Login Successful");
          location.reload();
          router.push("/");
        }
      });
    } catch (error: any) {
      console.log("login failed", error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onSignup = async () => {
    if (user.email == "" || user.password == "" || user.username == "") {
      toast.error("please fill all the fields");
      return;
    }
    try {
      const t = toast.loading("please wait...");
      setLoading(true);
      axios.post("api/users/signup", user).then(() => {
        toast.dismiss(t);
        toast.success("user successfully created");
        onLogin();
      });
    } catch (error: any) {
      toast.error(error.message);
      console.log(error);
    }
  };

  useEffect(() => {
    if (
      user.email.length > 0 &&
      user.username.length > 0 &&
      user.password.length > 0
    ) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-50 p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            {loading ? "Processing..." : "Welcome!"}
          </h1>
          <p className="text-slate-600">Create your account to get started</p>
        </div>

        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Username
              </label>
              <Input
                value={user.username}
                onChange={(e) => setUser({ ...user, username: e.target.value })}
                type="text"
                className="w-full rounded-lg py-3 px-4 border-slate-300 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <Input
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                type="email"
                className="w-full rounded-lg py-3 px-4 border-slate-300 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <Input
                id="password"
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                type="password"
                className="w-full rounded-lg py-3 px-4 border-slate-300 focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-blue-500 rounded border-slate-300"
                />
                <span>Remember me</span>
              </label>
              <Link
                href="/forgotpassword"
                className="text-sm font-medium text-blue-500 hover:text-blue-700"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            variant="codeeditor"
            onClick={(e) => {
              e.preventDefault();
              onSignup();
            }}
            className={`w-full py-3 px-4 text-sm font-medium rounded-lg transition-all ${
              buttonDisabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"
            }`}
          >
            {buttonDisabled ? "Please fill all fields" : "Create Account"}
          </Button>
        </form>

        <div className="text-center text-sm text-slate-600">
          <span className="mr-1">Already have an account?</span>
          <Link
            href="/login"
            className="font-medium text-blue-500 hover:text-blue-700"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
