import { NextResponse } from "next/server";

/**
 * Inquiry endpoint used by the contact sheet.
 * Validates, drops bots (honeypot), and forwards to email when RESEND_API_KEY + INQUIRY_TO are set.
 * Without those env vars it logs the inquiry server-side (development).
 * TODO(client): confirm the destination inbox / CRM (brief §7 Q3).
 */
type Body = Record<string, unknown>;

const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }
  if (str(body.company_website)) return NextResponse.json({ ok: true }); // honeypot

  const inquiry = {
    name: str(body.name, 120),
    phone: str(body.phone, 40),
    branch: str(body.branch, 40),
    farm: str(body.farm, 120),
    message: str(body.message, 2000),
    topic: str(body.topic, 200),
    detail: str(body.detail, 300),
    kind: str(body.kind, 20),
    page: str(body.page, 300),
    locale: str(body.locale, 5),
    at: new Date().toISOString(),
  };
  if (!inquiry.name || inquiry.phone.replace(/\D/g, "").length < 7) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 422 });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_TO;
  if (key && to) {
    const text = Object.entries(inquiry)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.INQUIRY_FROM ?? "Ghargrow website <website@ghargrow.com>",
        to: [to],
        subject: `Website inquiry — ${inquiry.topic || "General"} (${inquiry.branch})`,
        text,
      }),
    });
    if (!r.ok) return NextResponse.json({ ok: false, error: "mail_failed" }, { status: 502 });
  } else {
    console.log("[inquiry]", inquiry);
  }
  return NextResponse.json({ ok: true });
}
