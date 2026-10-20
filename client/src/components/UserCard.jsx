import { useState } from "react";
import axios from "axios";

const PRESET_AMOUNTS = [100, 200, 500, 1000];

const UserCard = ({ user }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendMoney = async (e) => {
    e.preventDefault();

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await axios.post(
        `http://localhost:5000/api/v1/money/send/${user.id}`,
        { amount: numericAmount },
        { withCredentials: true }
      );

      setSuccess(
        response.data.message || "Money sent successfully!"
      );
      setAmount("");

      // Notify wallet to sync balance
      window.dispatchEvent(new Event("balanceUpdated"));

      // Auto close after brief display
      setTimeout(() => {
        closeDialog();
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send money."
      );
    } finally {
      setLoading(false);
    }
  };

  const closeDialog = () => {
    if (loading) return;

    setShowDialog(false);
    setAmount("");
    setError("");
    setSuccess("");
  };

  // Generate an avatar color or initial
  const initial = user?.username ? user.username.charAt(0).toUpperCase() : "U";

  return (
    <>
      {/* User Card */}
      <div className="group flex flex-col justify-between rounded-3xl border border-neutral-200/80 bg-white p-5 shadow-xs transition hover:border-neutral-300 hover:shadow-md">
        <div>
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-sm font-bold text-white shadow-xs">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-bold text-neutral-900 group-hover:text-sky-600 transition">
                {user.username}
              </h3>
              <p className="truncate text-xs text-neutral-500">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowDialog(true);
            setError("");
            setSuccess("");
          }}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-4 py-3 text-xs font-bold text-white transition hover:bg-neutral-800 active:scale-98"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
          <span>Send Money</span>
        </button>
      </div>

      {/* Send Money Dialog */}
      {showDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={closeDialog}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`send-money-title-${user.id}`}
            className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 text-black shadow-2xl sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
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
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </div>
                <div>
                  <h2
                    id={`send-money-title-${user.id}`}
                    className="text-xl font-bold tracking-tight text-neutral-900"
                  >
                    Transfer Money
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Send funds directly to recipient
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeDialog}
                disabled={loading}
                aria-label="Close dialog"
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

            {/* Recipient Details Pill */}
            <div className="my-5 flex items-center gap-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-xs font-bold text-white">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-neutral-500">
                  Recipient
                </p>
                <p className="truncate text-sm font-bold text-neutral-900">
                  {user.username}
                </p>
                <p className="truncate text-xs text-neutral-500">
                  {user.email}
                </p>
              </div>
            </div>

            <form onSubmit={handleSendMoney} className="space-y-5">
              <div>
                <label
                  htmlFor={`amount-${user.id}`}
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-600"
                >
                  Amount to Transfer
                </label>

                <div className="relative rounded-2xl border border-neutral-300 bg-white transition focus-within:border-neutral-900 focus-within:ring-2 focus-within:ring-neutral-900/10">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-xl font-bold text-neutral-400">
                    ₹
                  </div>
                  <input
                    id={`amount-${user.id}`}
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
                  Quick amounts:
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
                        ₹{preset}
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

              {success && (
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
                  <span>{success}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={loading}
                  className="flex-1 rounded-2xl border border-neutral-300 py-3.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 active:scale-98 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading || Boolean(success)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-neutral-800 active:scale-98 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
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
                      <span>Sending...</span>
                    </>
                  ) : success ? (
                    "Sent!"
                  ) : (
                    "Confirm Transfer"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserCard;
