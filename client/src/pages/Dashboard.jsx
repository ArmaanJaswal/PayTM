import React, { useEffect, useState } from "react";
import axios from "axios";
import Wallet from "../components/Wallet";
import UserPage from "./UserPage";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/v1/auth/me",
          { withCredentials: true }
        );
        if (response.data?.user) {
          setCurrentUser(response.data.user);
        }
      } catch (err) {
        console.error("Failed to load user info:", err);
      }
    };

    fetchMe();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50/50 text-neutral-900">
      {/* Top Navigation Bar with Branding & Logout Button */}
      <Navbar currentUser={currentUser} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">
              Account Overview
            </h1>
            <p className="text-xs text-neutral-500 sm:text-sm">
              Manage your balance, add funds, and transfer money securely.
            </p>
          </div>
        </div>

        {/* Wallet Balance and Add Money */}
        <div className="mb-10">
          <Wallet />
        </div>

        {/* Users List */}
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-xs sm:p-8">
          <UserPage />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
