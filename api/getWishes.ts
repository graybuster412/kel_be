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
  const AIRTABLE_TABLE_NAME = "Wishes"; // change this if your table name differs

  try {
    const response = await axios.get<AirtableResponse>(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
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
