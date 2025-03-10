"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import "@/cssFiles/homeanimations.css";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user.email.length > 0 && user.password.length > 0) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [user]);

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
  return (
    <>
      <h1 className="text-3xl font-semibold text-center">
        {loading ? "processing" : "LogIn"}
      </h1>
      <h1 className="text-xl text-center mt-5">
        {loading ? "processing" : "Sign in to continue"}
      </h1>
      <form className="mt-6 flex flex-col justify-center items-center">
        <div className="mb-2">
          <label className="block text-sm font-semibold text-left ">
            Email
          </label>
          <Input
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            type="email"
            className="w-40"
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-semibold text-left ">
            Password
          </label>
          <Input
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            type="password"
            className="w-40"
          />
        </div>
        <p className="remember-forgot-link flex text-sm justify-between my-4">
          <Link
            href="/forgotpassword"
            className=" font-semibold hover:underline mr-4"
          >
            Forgot password?
          </Link>
          <label htmlFor="remember" className=" font-semibold">
            <input type="checkbox" id="remember" className="mr-1" />
            Remember me
          </label>
        </p>
        <div className="mt-6">
          <Button
            onClick={(e) => {
              e.preventDefault();
              onLogin();
            }}
            variant="codeeditor"
          >
            Login
          </Button>
        </div>
      </form>
      <p className="register-link text-sm text-center my-4">
        {" "}
        Don't have an account?{" "}
        <Link href="/signup" className='" font-semibold hover:underline'>
          SignUp!
        </Link>
      </p>
    </>
  );
}
