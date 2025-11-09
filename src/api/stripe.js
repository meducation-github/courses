export async function createCheckoutSession(user_id) {
  const response = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id }),
  });

  const data = await response.json();
  return data.id; // Stripe session ID
}
