"use client";

import { useState } from "react";
import {
  Coins,
  Check,
  Sparkles,
  Users,
  CalendarClock,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useUser } from "@/app/provider";

const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    credits: 10,
    price: 29,
    pricePerCredit: 2.9,
    popular: false,
    description: "Perfect for small teams",
    features: ["10 Interview Credits", "Valid for 12 months", "Email support"],
  },
  {
    id: "professional",
    name: "Professional",
    credits: 25,
    price: 59,
    pricePerCredit: 2.36,
    popular: true,
    description: "Best value for growing teams",
    features: [
      "25 Interview Credits",
      "Valid for 12 months",
      "Priority email support",
      "Bulk interview creation",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    credits: 50,
    price: 99,
    pricePerCredit: 1.98,
    popular: false,
    description: "For large-scale recruitment",
    features: [
      "50 Interview Credits",
      "Valid for 12 months",
      "Priority support",
      "Advanced analytics",
      "Custom integrations",
    ],
  },
];

export default function Billing() {
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[1]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const handlePurchase = async () => {
    if (!user?.email) {
      toast.error("You must be logged in to purchase credits.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          packageName: selectedPackage.name,
          credits: selectedPackage.credits,
          price: selectedPackage.price,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      window.location.href = data.url;
    } catch (error) {
      toast.error("Could not start checkout. Please try again.");
      console.error("Stripe checkout error:", error);
      setLoading(false);
    }
  };

  const credits = user?.credits || 0;

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl dark:text-gray-100">
          Billing
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Purchase interview credits to power your recruitment pipeline.
        </p>
      </div>

      {user && (
        <div className="flex justify-center">
          <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-linear-to-br from-blue-50 to-indigo-50 shadow-md w-full max-w-md">
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-500 to-indigo-500" />
            <div className="px-6 py-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30">
                  <Coins className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                    Your Balance
                  </p>
                  <div className="mt-0.5 flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold tracking-tight text-gray-900">
                      {credits}
                    </span>
                    <span className="text-sm font-medium text-gray-500">
                      credit{credits !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 rounded-full bg-white/80 border border-blue-200 px-3 py-1.5 shadow-sm">
                <Zap className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700 whitespace-nowrap">
                  1 credit = 1 interview
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CREDIT_PACKAGES.map((pkg) => {
          const isSelected = selectedPackage.id === pkg.id;
          return (
            <div
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg)}
              className={`relative cursor-pointer rounded-2xl border bg-white p-6 transition-all duration-200 hover:shadow-lg ${
                isSelected
                  ? "border-blue-500 ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/10"
                  : "border-slate-200 hover:border-slate-300"
              } ${pkg.popular ? "md:-translate-y-2" : ""}`}
            >
              {pkg.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-linear-to-r from-blue-600 to-indigo-600 text-white border-0 px-3 py-1 text-xs font-semibold shadow-md">
                  Most Popular
                </Badge>
              )}

              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-cyan-500">
                    {pkg.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {pkg.description}
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-gray-900">
                    ${pkg.price}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    / {pkg.credits} credits
                  </span>
                </div>

                <p className="text-xs font-medium text-gray-400">
                  ${pkg.pricePerCredit.toFixed(2)} per credit
                </p>

                <ul className="space-y-3 pt-2 border-t border-slate-100">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2.5">
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${isSelected ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"}`}
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </div>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isSelected ? "default" : "outline"}
                  className={`w-full rounded-xl font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-indigo-600 hover:to-blue-500"
                      : "hover:bg-slate-50"
                  }`}
                >
                  {isSelected ? "Selected" : "Select Plan"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_-20px_rgba(15,23,42,0.45)]">
        <div className="p-6 sm:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-5">
            Order Summary
          </h3>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center py-2.5 px-4 bg-slate-50 rounded-xl">
              <span className="text-sm font-medium text-gray-600">Package</span>
              <span className="text-sm font-semibold text-gray-900">
                {selectedPackage.name}
              </span>
            </div>

            <div className="flex justify-between items-center py-2.5 px-4 bg-slate-50 rounded-xl">
              <span className="text-sm font-medium text-gray-600">Credits</span>
              <span className="text-sm font-semibold text-gray-900">
                {selectedPackage.credits} interviews
              </span>
            </div>

            <div className="flex justify-between items-center py-3 px-4 bg-blue-50 rounded-xl border border-blue-100">
              <span className="text-sm font-bold text-gray-900">Total</span>
              <span className="text-xl font-extrabold text-blue-600">
                ${selectedPackage.price}
              </span>
            </div>
          </div>

          <Button
            onClick={handlePurchase}
            disabled={loading}
            size="lg"
            className="w-full group relative overflow-hidden rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-8 font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:from-indigo-600 hover:to-blue-500 hover:shadow-2xl hover:shadow-indigo-500/40 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Processing...
              </span>
            ) : (
              <span className="relative flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                Pay ${selectedPackage.price} - {selectedPackage.credits} Credits
                <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </span>
            )}
          </Button>

          <p className="text-xs text-gray-400 text-center mt-3">
            Powered by Stripe · Secure payment · Credits valid for 12 months
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-5 dark:text-gray-100">
          How Credits Work
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                1 Credit = 1 Interview
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                Each interview creation costs exactly 1 credit from your
                balance.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Unlimited Candidates
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                Share a single interview link with as many candidates as you
                need.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                12 Month Validity
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                All purchased credits stay available for a full year.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
