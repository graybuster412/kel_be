// api/rsvp.js
export default async function handler(req, res) {
  // CORS (optional; adjust origin)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { fullname, email, status, guests, place, message } = req.body || {};
    // Basic validation
    if (!fullname || !email || !status || !guests || !place) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    // Airtable config
    const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } =
      process.env;
    const AIRTABLE_TABLE_NAME = "RSVP"; // change this if your table name differs

    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
      AIRTABLE_TABLE_NAME
    )}`;

    const payload = {
      records: [
        {
          fields: {
            Fullname: fullname,
            Email: email,
            Status: status,
            Guests: Number(guests),
            Place: place,
            Message: message || "",
            Timestamp: new Date().toISOString(),
          },
        },
      ],
    };

    const r = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(500).json({ error: "Airtable error", detail: text });
    }

    const data = await r.json();
    return res.status(201).json({ ok: true, id: data.records?.[0]?.id });
  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: String(e) });
  }
}
