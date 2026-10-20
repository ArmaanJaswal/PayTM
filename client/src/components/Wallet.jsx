import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/v1";

const PRESET_AMOUNTS = [100, 500, 1000, 2000, 5000];

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch current balance
  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/money/balance`, {
        withCredentials: true,
      });

      setBalance(Number(response.data.balance) || 0);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch balance."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();

    const handleBalanceUpdate = () => {
      fetchBalance();
    };

    window.addEventListener("balanceUpdated", handleBalanceUpdate);
    return () => {
      window.removeEventListener("balanceUpdated", handleBalanceUpdate);
    };
  }, [fetchBalance]);

  // Open and close the Add Money dialog
  const toggleForm = () => {
    setShowForm((previous) => !previous);
    setError("");
    setMessage("");
  };

  const handleOpenWithPreset = (presetValue) => {
    setAmount(String(presetValue));
    setError("");
    setMessage("");
    setShowForm(true);
  };

  // Submit Add Money request
  const handleSubmit = async (e) => {
    e.preventDefault();

    const numericAmount = Number(amount);

    if (
      !amount.trim() ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      setError("Enter a valid amount greater than zero.");
      return;
    }

    try {
      setAdding(true);
      setError("");
      setMessage("");

      const response = await axios.post(
        `${API_URL}/money/add`,
        { amount: numericAmount },
        { withCredentials: true }
      );

      setMessage(
        response.data.message || "Money added successfully."
      );

      setAmount("");
      await fetchBalance();
      window.dispatchEvent(new Event("balanceUpdated"));

      // Brief delay to let the user see the success message
      setTimeout(() => {
        setShowForm(false);
        setMessage("");
      }, 900);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to add money."
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="w-full">
      {/* Current Balance Card */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200/80 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 p-6 text-white shadow-xl shadow-neutral-900/10 sm:p-8">
        {/* Decorative background glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
              <p className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                PayTM Digital Wallet
              </p>
            </div>

            <button
              type="button"
              onClick={fetchBalance}
              disabled={loading}
              title="Refresh Balance"
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700/80 bg-neutral-800/60 px-3 py-1 text-xs font-medium text-neutral-300 backdrop-blur-xs transition hover:border-neutral-600 hover:bg-neutral-700/60 hover:text-white disabled:opacity-50"
            >
              <svg
                className={`h-3.5 w-3.5 ${loading ? "animate-spin text-sky-400" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>{loading ? "Refreshing" : "Refresh"}</span>
            </button>
          </div>

          <div className="mt-6 sm:mt-8">
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Available Balance
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-light text-neutral-400">₹</span>
              <h2 className="break-words text-4xl font-extrabold tracking-tight sm:text-5xl">
                {loading && balance === 0
                  ? "---.--"
                  : balance.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
              </h2>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={toggleForm}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-neutral-900 shadow-md transition hover:bg-neutral-100 active:scale-98"
            >
              <svg
                className="h-5 w-5 text-sky-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>+ Add Money</span>
            </button>

            {/* Quick amount chips right on the card */}
            <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
              <span className="text-xs font-medium text-neutral-400">
                Quick Add:
              </span>
              {PRESET_AMOUNTS.slice(0, 3).map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleOpenWithPreset(amt)}
                  className="rounded-xl border border-neutral-700/80 bg-neutral-800/80 px-3 py-1.5 text-xs font-semibold text-neutral-200 transition hover:border-sky-500 hover:bg-sky-500/20 hover:text-white"
                >
                  +₹{amt}
                </button>
              ))}
            </div>
          </div>

          {error && !showForm && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              <svg
                className="h-4 w-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Modern Add Money Modal Dialog */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={toggleForm}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-money-title"
            className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 text-black shadow-2xl sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <div>
                  <h3 id="add-money-title" className="text-xl font-bold tracking-tight">
                    Add Money
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Deposit funds instantly into your wallet
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleForm}
                disabled={adding}
                aria-label="Close Add Money dialog"
                className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-50"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Current Balance Banner */}
            <div className="my-5 flex items-center justify-between rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3">
              <span className="text-xs font-medium text-neutral-500">
                Current Balance
              </span>
              <span className="text-sm font-bold text-neutral-900">
                ₹
                {balance.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="amount"
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-600"
                >
                  Enter Amount
                </label>

                {/* Amount Input with styled Rupee badge */}
                <div className="relative rounded-2xl border border-neutral-300 bg-white transition focus-within:border-neutral-900 focus-within:ring-2 focus-within:ring-neutral-900/10">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-xl font-bold text-neutral-400">
                    ₹
                  </div>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    autoFocus
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-2xl bg-transparent py-3.5 pl-10 pr-4 text-xl font-bold text-neutral-900 outline-none placeholder:text-neutral-300"
                    required
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <p className="mb-2 text-xs font-medium text-neutral-500">
                  Popular amounts:
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_AMOUNTS.map((preset) => {
                    const isSelected = amount === String(preset);
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(String(preset))}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                          isSelected
                            ? "bg-neutral-900 text-white shadow-xs"
                            : "border border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100"
                        }`}
                      >
                        +₹{preset}
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
                >
                  <svg
                    className="h-4 w-4 shrink-0 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {message && (
                <div
                  role="status"
                  className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-700"
                >
                  <svg
                    className="h-4 w-4 shrink-0 text-emerald-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{message}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={toggleForm}
                  disabled={adding}
                  className="flex-1 rounded-2xl border border-neutral-300 py-3.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 active:scale-98 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={adding || Boolean(message)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-neutral-800 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {adding ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin text-white"
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
                      <span>Adding...</span>
                    </>
                  ) : message ? (
                    "Added!"
                  ) : (
                    "Confirm & Add"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
