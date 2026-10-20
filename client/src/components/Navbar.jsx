import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Navbar = ({ currentUser }) => {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await axios.post(
        "http://localhost:5000/api/v1/auth/logout",
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Clear any stored data and redirect to login
      localStorage.clear();
      sessionStorage.clear();
      setLoggingOut(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-sm shadow-sky-500/20">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-neutral-900">
                Pay<span className="text-sky-600">TM</span>
              </span>
              <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700 ring-1 ring-inset ring-sky-600/20">
                Wallet
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: User Info & Logout Button */}
        <div className="flex items-center gap-3 sm:gap-4">
          {currentUser?.username && (
            <div className="hidden items-center gap-2 rounded-full border border-neutral-200/80 bg-neutral-50/80 px-3 py-1 sm:flex">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 text-[11px] font-bold text-white uppercase">
                {currentUser.username.charAt(0)}
              </div>
              <span className="max-w-[120px] truncate text-xs font-medium text-neutral-700">
                {currentUser.username}
              </span>
            </div>
          )}

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            aria-label="Log out of account"
            className="group inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 shadow-xs transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95 disabled:opacity-60"
          >
            {loggingOut ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4 text-neutral-500 transition group-hover:text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
