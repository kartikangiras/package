import express, { Request, Response } from 'express';
import cors from 'cors';
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
  clusterApiUrl,
} from '@solana/web3.js';
import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
} from '@solana/actions';

const app = express();
app.use(express.json());

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Content-Encoding', 'Accept-Encoding', 'x-action-version', 'x-blockchain-ids'],
  exposedHeaders: ['x-action-version', 'x-blockchain-ids'],
}));

const actionHeaders = {
  "x-action-version": "2.1.3",
  "x-blockchain-ids": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1", 
};

app.get('/api/donate', (req: Request, res: Response) => {
  const baseUrl = "https://ca3d3acc6746e3.lhr.life";

  const response: ActionGetResponse = {
    icon: "https://solana.com/src/img/branding/solanaLogoMark.png",
    title: "Support the Project",
    description: "Your SOL donation helps fund continuous development.",
    label: "Donate SOL",
    links: {
      actions: [
        {
          type: "transaction",
          label: "0.1 SOL",
          href: `${baseUrl}/api/donate?amount=0.1` 
        },
        {
          type: "transaction",
          label: "Custom Amount",
          href: `${baseUrl}/api/donate?amount={amount}`, 
          parameters: [
            {
              name: "amount",
              label: "Enter SOL amount"
            }
          ]
        }
      ]
    }
  };

  res.set(actionHeaders);
  res.status(200).json(response);
});

app.post('/api/donate', async (req: Request, res: Response) => {
  try {
    const body: ActionPostRequest = req.body;
    const donorPubkey = new PublicKey(body.account);
    const amountStr = req.query.amount as string;
    const amount = parseFloat(amountStr) || 0.1;

    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

    const DONATION_DESTINATION_WALLET = new PublicKey("EKW4ymUJBr2f6nksSRi1Gh46HxwP96LbfHo7A6"); 

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
    const serializedTransaction = Buffer.from(transaction.serialize()).toString('base64');

    const response: ActionPostResponse = {
      type: "transaction",
      transaction: serializedTransaction,
      message: `Thank you for donating ${amount} SOL!`,
    };

    res.set(actionHeaders);
    res.status(200).json(response);

  } catch (err) {
    console.error(err);
    res.set(actionHeaders);
    res.status(500).json({ error: "Failed to build transaction" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Blink Server running on port ${PORT}`);
});