import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"))
const RESEND_KEY = Deno.env.get("RESEND_API_KEY")
const FROM = "Sell Like Crazy <sales@selllikecrazy.app>"
const hdr = "<div style='background:linear-gradient(135deg,#FF2D55,#FF6B00);padding:24px;border-radius:12px 12px 0 0;text-align:center'><h1 style='color:white;margin:0;font-size:22px'>Sell Like Crazy</h1></div>"
const ftr = "<p style='color:#AEAEB2;font-size:11px;margin-top:20px;text-align:center'>Sell Like Crazy - <a href='https://selllikecrazy.app' style='color:#FF2D55'>selllikecrazy.app</a></p>"
const wrap = (c) => "<div style='font-family:sans-serif;max-width:500px;margin:0 auto'>" + hdr + "<div style='background:white;padding:24px;border:1px solid #E8E8ED;border-radius:0 0 12px 12px'>" + c + ftr + "</div></div>"
const btn = (url, label) => "<a href='" + url + "' style='display:block;background:linear-gradient(135deg,#FF2D55,#FF6B00);color:white;text-decoration:none;padding:14px;border-radius:10px;text-align:center;font-weight:700;margin-top:16px'>" + label + "</a>"
const TEMPLATES = {
  NEW_MESSAGE: (d) => ({ subject: "New message from " + d.senderName + " - Sell Like Crazy", html: wrap("<h2 style='color:#0A0A0F'>New message</h2><p style='color:#6E6E73'><strong>" + d.senderName + "</strong> sent you a message about <strong>" + d.listingTitle + "</strong>:</p><div style='background:#FFF0F3;border-left:4px solid #FF2D55;padding:12px;border-radius:0 8px 8px 0;font-style:italic;color:#0A0A0F'>\"" + d.messagePreview + "\"</div>" + btn("https://selllikecrazy.app/messages", "Reply now")) }),
  LISTING_SOLD: (d) => ({ subject: "Your item sold! - Sell Like Crazy", html: wrap("<h2 style='color:#0A0A0F'>Item sold!</h2><p style='color:#6E6E73'>Your listing has been purchased:</p><div style='background:#F0FFF4;border-radius:10px;padding:14px;margin:16px 0'><strong>" + d.listingTitle + "</strong><br><span style='color:#34C759;font-weight:700'>$" + d.price + "</span></div><p style='color:#6E6E73'>Payment goes to your Stripe account within 2 business days.</p>" + btn("https://selllikecrazy.app/dashboard", "View dashboard")) }),
  LISTING_EXPIRED: (d) => ({ subject: "Your listing expired - Sell Like Crazy", html: wrap("<h2 style='color:#0A0A0F'>Listing expired</h2><p style='color:#6E6E73'>Your 30-day listing has ended:</p><div style='background:#F5F5F7;border-radius:10px;padding:14px;margin:16px 0'><strong>" + d.listingTitle + "</strong></div><p style='color:#6E6E73'>Relist it in seconds from My Listings.</p>" + btn("https://selllikecrazy.app/my-listings", "Relist now")) }),
  LISTING_EXPIRING_SOON: (d) => ({ subject: "Your listing expires in " + d.daysLeft + " days - Sell Like Crazy", html: wrap("<h2 style='color:#0A0A0F'>Listing expiring soon</h2><p style='color:#6E6E73'>Your listing expires in <strong>" + d.daysLeft + " days</strong>:</p><div style='background:#F5F5F7;border-radius:10px;padding:14px;margin:16px 0'><strong>" + d.listingTitle + "</strong></div>" + btn("https://selllikecrazy.app/my-listings", "View my listings")) }),
}
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type" } })
  try {
    const body = await req.json()
    console.log("received:", body.type, body.recipient_id)
    const templateFn = TEMPLATES[body.type]
    if (!templateFn) { console.error("unknown type:", body.type); return new Response(JSON.stringify({ error: "unknown type" }), { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }) }
    const template = templateFn(body.data || {})
    const { data: au } = await supabase.auth.admin.getUserById(body.recipient_id)
    const email = au?.user?.email
    console.log("email:", email)
    if (email && RESEND_KEY) {
      const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { "Authorization": "Bearer " + RESEND_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ from: FROM, to: email, subject: template.subject, html: template.html }) })
      const d = await r.json()
      console.log("resend:", JSON.stringify(d))
    }
    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } })
  } catch (err) {
    console.error("error:", err.message)
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } })
  }
})