import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
} from "@solana/actions";
import {
  PublicKey,
  clusterApiUrl,
} from "@solana/web3.js";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fetchCandyMachine, mintV2, mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
import { 
  createNoopSigner, 
  generateSigner, 
  publicKey,
  transactionBuilder,
  Umi
} from "@metaplex-foundation/umi";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import { toWeb3JsTransaction } from "@metaplex-foundation/umi-web3js-adapters";

const headers = {
  ...ACTIONS_CORS_HEADERS,
  "x-action-version": "2.1.3",
  "x-blockchain-ids": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
};

export async function OPTIONS() {
  return new Response(null, { headers });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const payload: ActionGetResponse = {
    type: "action",
    icon: "https://upload.wikimedia.org/wikipedia/commons/3/34/Solana_cryptocurrency_two.png",
    title: "Mint Your Exclusive NFT",
    description: "Mint directly from this Blink using our Metaplex Candy Machine.",
    label: "Mint NFT",
    links: {
      actions: [
        { 
          type: "transaction", 
          label: "Mint 1 NFT", 
          href: `${baseUrl}/api/mint` 
        }
      ],
    },
  };

  return Response.json(payload, { headers });
}

export async function POST(req: Request) {
  try {
    const body: ActionPostRequest = await req.json();
    const umi = createUmi(clusterApiUrl("devnet")).use(mplCandyMachine());
    const minterPubkey = new PublicKey(body.account);

    const cmPubkey = publicKey("{{CANDY_MACHINE_ID}}"); 

    umi.use({
    install(umi: Umi) {
      umi.payer = createNoopSigner(publicKey(minterPubkey.toString()));
    }
    });

    const candyMachine = await fetchCandyMachine(umi, cmPubkey);

    const nftSigner = generateSigner(umi);

    const builder = transactionBuilder()
      .add(setComputeUnitLimit(umi, { units: 800_000 })) 
      .add(
        mintV2(umi, {
          candyMachine: candyMachine.publicKey,
          nftMint: nftSigner,
          collectionMint: candyMachine.collectionMint,
          collectionUpdateAuthority: candyMachine.authority,
        })
      );

    const umiTransaction = await builder.buildAndSign(umi);

    const web3Transaction = toWeb3JsTransaction(umiTransaction);
    
    const serializedTransaction = Buffer.from(web3Transaction.serialize()).toString("base64");

    const payload: ActionPostResponse = {
      type: "transaction",
      transaction: serializedTransaction,
      message: `Successfully minted NFT! Address: ${nftSigner.publicKey.toString().slice(0, 8)}...`,
    };

    return Response.json(payload, { headers });
  } catch (err) {
    console.error("Minting Error:", err);
    return Response.json({ error: "Failed to build mint transaction." }, { status: 500, headers });
  }
}