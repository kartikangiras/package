import { z } from "zod";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { createAction, BlinkServer, generateBlinkImage } from "../src/index.js";

const DonateInputSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
});

const donateAction = createAction({
  path: "/donate",
  meta: {
    title: "Donate SOL",
    icon: "http://localhost:3000/image",
    description: "Send a SOL donation to a developer. Thank you! 🙌",
    label: "Donate",
  },
  validate: DonateInputSchema,
  handler: async ({ account, validatedInput }) => {
    const { amount } = validatedInput;

    const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
    const sender = new PublicKey(account);
    const recipient = new PublicKey("11111111111111111111111111111111");

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: sender,
        toPubkey: recipient,
        lamports: Math.round(amount * LAMPORTS_PER_SOL),
      }),
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = sender;
    const serialized = transaction
      .serialize({ requireAllSignatures: false })
      .toString("base64");

    return {
      transaction: serialized,
      message: `Donating ${amount} SOL — thank you, ${account.slice(0, 8)}…!`,
    };
  },
});

const server = new BlinkServer();
server.register(donateAction);


server.app.get("/image", async (c) => {
  const png = await generateBlinkImage("BlinkKit");
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
});

server.serveActionsJson("http://localhost:3000");

server.start(3000);
