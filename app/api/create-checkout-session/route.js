// import Stripe from "stripe";
// import { NextResponse } from "next/server";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// export async function POST(request) {
//   try {
//     const { packageId, packageName, credits, price, userEmail } =
//       await request.json();

//     if (!packageId || !credits || !price || !userEmail) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 },
//       );
//     }

//     const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "payment",
//       customer_email: userEmail,
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name: `${packageName} – ${credits} Interview Credits`,
//               description: `Purchase ${credits} AI interview credits for your recruitment pipeline.`,
//             },
//             unit_amount: price * 100,
//           },
//           quantity: 1,
//         },
//       ],
//       metadata: {
//         userEmail,
//         packageId,
//         credits: String(credits),
//       },
//       success_url: `${baseUrl}/recruiter/billing/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${baseUrl}/recruiter/billing`,
//     });

//     return NextResponse.json({ url: session.url });
//   } catch (error) {
//     console.error("Stripe checkout error:", error);
//     return NextResponse.json(
//       { error: "Failed to create checkout session" },
//       { status: 500 },
//     );
//   }
// }
