import axios from "axios";

/**
 * Define the structure of a single wish
 */
export interface Wish {
    FullName: string;
    WishMessage: string;
    PredefinedWish: string;
}

/**
 * Define the shape of the Airtable record
 */
export interface AirtableRecord {
    id: string;
    fields: Wish;
    createdTime: string;
}

/**
 * Airtable API Response structure
 */
export interface AirtableResponse {
    records: AirtableRecord[];
}

/**
 * Fetch all wishes from Airtable
 * @returns Promise<Wish[]>
 */
export async function getWishes(): Promise<Wish[]> {
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY!;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
    const AIRTABLE_TABLE_NAME = "Wish"; // change this if your table name differs

    try {
        const response = await axios.get<AirtableResponse>(
            `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
                AIRTABLE_TABLE_NAME
            )}?maxRecords=10&view=Grid?sort%5B0%5D%5Bfield%5D=CreatedAt?sort%5B0%5D%5Bdirection%5D=desc`,
            {
                headers: {
                    Authorization: `Bearer ${AIRTABLE_API_KEY}`,
                },
            }
        );

        // Map Airtable records to a simple array of wishes
        const wishes: Wish[] = response.data.records.map(
            (record) => record.fields
        );

        return wishes;
    } catch (error: any) {
        console.error("Error fetching wishes:", error.message);
        throw new Error("Failed to fetch wishes from Airtable");
    }
}


// api/getWishes.js
export default async function handler(req, res) {
    // CORS (optional; adjust origin)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.status(204).end();

    if (req.method !== "GET")
        return res.status(405).json({ error: "Method not allowed" });

    try {
        const wishes = await getWishes();

        return res.status(201).json({ ok: true, wishes: [...wishes] });
    } catch (e) {
        return res.status(500).json({ error: "Server error", detail: String(e) });
    }
}
