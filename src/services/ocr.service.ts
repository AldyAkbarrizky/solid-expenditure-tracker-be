import { GoogleGenAI } from "@google/genai";
import { db } from "../db";
import { categories } from "../db/schema";
import { or } from "drizzle-orm";

export const ocrService = {
  async scanReceipt(files: Express.Multer.File[]) {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set");
      }

      const modelName = process.env.GEMINI_MODEL_NAME || "gemini-2.5-flash";
      
      // Fetch available categories
      const availableCategories = await db.select({ name: categories.name }).from(categories);
      const categoryList = availableCategories.map(c => c.name).join(", ");

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
        Analyze these receipt or payment images (which might be multiple pages of a single long receipt) and extract the following information in JSON format:
        - merchantName: The name of the store, merchant, or receiver.
        - date: The date of transaction in YYYY-MM-DD format.
        - totalAmount: The total amount paid (numeric only).
        - items: An array of items purchased.
        - fees: An array of global fees (e.g., Delivery Fee, Service Charge, Tax).
        
        Available Categories: [${categoryList}]

        CRITICAL RULES:
        1. If the image is a QRIS payment proof or a transfer receipt that ONLY shows the total amount and merchant/receiver name (without specific items), create a single item in the 'items' array with:
           - name: "Pembayaran dengan QRIS" (or "Transfer to [Receiver Name]" if it's a transfer)
           - qty: 1
           - price: The total amount.
           - categoryName: Choose the best matching category from the list above (e.g., "Makanan & Minuman" for restaurants, "Transfer" for transfers).
        
        2. If specific items are listed, extract them as usual with name, qty (default 1), and price.
           - IMPORTANT: Keep item names CONCISE. Remove descriptions, sides, modifiers, or options in parentheses.
           - Example: "Paket Komplit Katsu (Nasi, Egg)" -> "Paket Komplit Katsu"
           - categoryName: For EACH item, choose the best matching category from the list above. If unsure, use "Lainnya".
           
           - ITEM DISCOUNTS: If an item has a specific discount listed (e.g., "Item A 50.000 Disc 10%"), extract it:
             - basePrice: The original price BEFORE discount.
             - price: The FINAL price AFTER discount.
             - discountType: "PERCENT" or "NOMINAL".
             - discountValue: The raw value (e.g., 10 for 10%, or 5000 for Rp 5000).
             
        3. FEES & GLOBAL DISCOUNTS:
           - Extract "Delivery Fee", "Service Charge", "Tax", "Packaging Fee" into the 'fees' array.
             - Structure: { name: "Delivery Fee", amount: 10000 }
           - Extract GLOBAL discounts (e.g., "Total Discount", "Voucher", "Promo") into the 'discounts' array.
             - Structure: { name: "Promo Code", amount: 5000, type: "NOMINAL", value: 5000 }
             - If it's a percentage discount (e.g. 10%), set type: "PERCENT", value: 10, and calculate the amount.

        4. If multiple images are provided, treat them as a continuous list of items from the same transaction. Merge the items found in all images.
        5. If the image is not a receipt or payment proof, return null.
        
        Ensure the response is valid JSON without markdown formatting.
      `;

      const contents = files.map((file) => ({
        inlineData: {
          data: file.buffer.toString("base64"),
          mimeType: file.mimetype,
        },
      }));

      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          { role: 'user', parts: [{ text: prompt }] },
          ...contents.map(c => ({ role: 'user', parts: [c] }))
        ]
      });

      const text = response.text ? response.text : null;

      if (!text) {
        throw new Error("No text generated from AI");
      }

      const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
      
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("OCR Error:", error);
      throw new Error("Failed to process receipt image");
    }
  },
};
