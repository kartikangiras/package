import express from "express";
import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
} from "@solana/actions";
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
  clusterApiUrl,
} from "@solana/web3.js";

const app = express();
app.use(express.json());

// --- THE BULLETPROOF CORS MIDDLEWARE ---
const ACTION_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Content-Encoding, Accept-Encoding",
  // This next line is what fixes the Dial.to red errors!
  "Access-Control-Expose-Headers": "X-Action-Version, X-Blockchain-Ids",
  "X-Action-Version": "2.1.3",
  "X-Blockchain-Ids": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
};

app.use((req, res, next) => {
  res.set(ACTION_HEADERS);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// --- ACTION.JSON MAPPING ---
app.get("/actions.json", (req, res) => {
  res.json({
    rules: [
      { pathPattern: "/*", apiPath: "/api/donate" },
      { pathPattern: "/api/donate", apiPath: "/api/donate" }
    ]
  });
});

// --- GET: UI METADATA ---
app.get("/api/donate", (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  const payload: ActionGetResponse = {
    type: "action",
    // Clean, professional placeholder icon
    icon: "https://ucarecdn.com/7aa46c85-08a4-4bc7-9376-88ec48bb1f43/-/preview/880x864/-/quality/smart/-/format/auto/", 
    title: "Support the Project",
    description: "Your SOL donation helps fund continuous open-source development.",
    label: "Donate SOL",
    links: {
      actions: [
        {
          type: "transaction",
          label: "Send Donation", // This is the button text
          href: `${baseUrl}/api/donate?amount={amount}`,
          // This creates the single custom input field
          parameters: [
            { 
              name: "amount", 
              label: "Enter SOL amount (e.g. 0.25)", 
              required: true 
            }
          ],
        },
      ],
    },
  };

  res.json(payload);
});

// --- POST: BUILD TRANSACTION ---
app.post("/api/donate", async (req, res) => {
  try {
    const body: ActionPostRequest = req.body;
    const donorPubkey = new PublicKey(body.account);

    const amountStr = req.query.amount as string;
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount entered." });
    }

    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const DONATION_DESTINATION_WALLET = new PublicKey("7xKXtg2CW87d8V6zXKBq7cM8Y2FPHwzaAkxqEqD7x4rH"); 

    const transferIx = SystemProgram.transfer({
      fromPubkey: donorPubkey,
      toPubkey: DONATION_DESTINATION_WALLET,
      lamports: amount * 1_000_000_000,
    });

    const { blockhash } = await connection.getLatestBlockhash();

    const messageV0 = new TransactionMessage({
      payerKey: donorPubkey,
      recentBlockhash: blockhash,
      instructions: [transferIx],
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);
    const serializedTransaction = Buffer.from(transaction.serialize()).toString("base64");

    const payload: ActionPostResponse = {
      type: "transaction",
      transaction: serializedTransaction,
      message: `Successfully donated ${amount} SOL. Thank you!`,
    };

    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to build transaction" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 SolWink Donation Server running on port ${PORT}`);
});