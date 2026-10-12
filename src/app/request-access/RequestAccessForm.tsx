"use client";

import { useState, useActionState } from "react";
import { requestAccessAction } from "@/app/actions";

const plans = [
  { id: "1-month", label: "1 month", detail: "A flexible monthly subscription" },
  { id: "6-months", label: "6 months", detail: "Six months of PostFlow access" },
  { id: "1-year", label: "1 year", detail: "A full year of PostFlow access" },
] as const;

export default function RequestAccessForm({ initialPlan }: { initialPlan?: string }) {
  const [state, action, pending] = useActionState(requestAccessAction, null);
  const [selectedPlan, setSelectedPlan] = useState(
    plans.find((plan) => plan.id === initialPlan)?.id ?? "1-month",
  );
  const [showForm, setShowForm] = useState(false);

  if (state?.success) {
    return (
      <div className="request-confirmation" role="status">
        <span className="confirmation-check" aria-hidden="true">✓</span>
        <h2>Request received</h2>
        <p>Thank you. We’ll contact you within 24 hours about your subscription request.</p>
      </div>
    );
  }

  return (
    <>
      <div className="subscription-plans" aria-label="Subscription plans">
        {plans.map((plan) => (
          <button
            type="button"
            key={plan.id}
            className={`subscription-plan${selectedPlan === plan.id ? " selected" : ""}`}
            aria-pressed={selectedPlan === plan.id}
            onClick={() => {
              setSelectedPlan(plan.id);
              setShowForm(false);
            }}
          >
            <strong>{plan.label}</strong>
            <span>{plan.detail}</span>
          </button>
        ))}
      </div>
      {!showForm ? (
        <button
          type="button"
          className="primary-btn request-access-cta"
          disabled={!selectedPlan}
          onClick={() => setShowForm(true)}
        >
          Request Access
        </button>
      ) : (
        <form action={action} className="form-stack subscription-request-form">
          <input type="hidden" name="subscriptionPlan" value={selectedPlan ?? ""} />
          <label>
            <span>Full name</span>
            <input name="name" autoComplete="name" maxLength={100} required />
          </label>
          <label>
            <span>WhatsApp number</span>
            <input name="whatsappNumber" type="tel" autoComplete="tel" placeholder="+1 555 123 4567" required />
          </label>
          <label>
            <span>Email address</span>
            <input name="email" type="email" autoComplete="email" required />
          </label>
          {state?.error && <p className="form-error" role="alert">{state.error}</p>}
          <div className="request-form-actions">
            <button type="submit" className="primary-btn" disabled={pending}>
              {pending ? "Sending request..." : "Submit subscription request"}
            </button>
            <button type="button" className="secondary-btn" onClick={() => setShowForm(false)}>Back to plans</button>
          </div>
        </form>
      )}
    </>
  );
}
