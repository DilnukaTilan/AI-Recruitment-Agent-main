import Stripe from "stripe";
import { NextResponse } from "next/server";
import supabaseAdmin from "@/services/supabaseAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: { bodyParser: false },
};

export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { userEmail, credits } = session.metadata;

    if (!userEmail || !credits) {
      console.error("Missing metadata in checkout session:", session.id);
      return NextResponse.json({ received: true });
    }

    const creditsToAdd = parseInt(credits, 10);

    const { data: users, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("credits")
      .eq("email", userEmail)
      .single();

    if (fetchError || !users) {
      console.error("Failed to fetch user for credit update:", fetchError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newCredits = (users.credits || 0) + creditsToAdd;

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ credits: newCredits })
      .eq("email", userEmail);

    if (updateError) {
      console.error("Failed to update credits:", updateError);
      return NextResponse.json(
        { error: "Failed to update credits" },
        { status: 500 },
      );
    }

    console.log(
      `Credits updated for ${userEmail}: +${creditsToAdd} → total ${newCredits}`,
    );
  }

  return NextResponse.json({ received: true });
}
