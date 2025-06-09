import express, { Request, Response } from "express";
import { burnTokens, mintTokens, sendNativeTokens } from "./mintTokens";

import { PUBLIC_KEY } from "./address";

const app = express();
app.use(express.json());

const VAULT = PUBLIC_KEY;

app.post("/helius", async (req: any, res: any) => {
  try {
    console.log("Incoming webhook:", JSON.stringify(req.body, null, 2));

    const helius_response = Array.isArray(req.body) ? req.body[0] : req.body;

    if (!helius_response) {
      console.error("Webhook body missing or empty");
      return res.status(400).send("Invalid webhook payload");
    }

    const incomingTxn = (helius_response.nativeTransfers || []).find(
      (transfer: any) =>
        transfer.toUserAccount &&
        transfer.toUserAccount.trim().toLowerCase() === VAULT!.trim().toLowerCase()
    );

    if (!incomingTxn) {
      return res.status(400).send("No matching transfer to vault");
    }

    const senderAddress = incomingTxn.fromUserAccount;
    const lamportsReceived = incomingTxn.amount;

    if (!senderAddress || !lamportsReceived) {
      return res.status(400).send("Invalid transaction data");
    }

    const tokenAmountToMint = lamportsReceived; 
    const tokenAmountToBurn = tokenAmountToMint; 

    console.log("Vault Address:", VAULT);
    console.log("Sender:", senderAddress);
    console.log("Received (lamports):", lamportsReceived);
    console.log("Minting tokens:", tokenAmountToMint);
    console.log("Burning tokens from vault:", tokenAmountToBurn);
    console.log("Sending back Token", tokenAmountToMint);

    // 1. Mint tokens to the sender
    await mintTokens(senderAddress, tokenAmountToMint);

    // 2. Burn some tokens from the vault
    await burnTokens(tokenAmountToBurn);

    // 3. Send back small amount of native tokens to the sender
    await sendNativeTokens(senderAddress, tokenAmountToMint);

    return res.status(200).send("Webhook processed: mint, burn, refund done");
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).send("Internal server error");
  }
});





app.all("*", (req, res) => {
  console.log(`Unknown route: ${req.method} ${req.url}`);
  res.status(404).send("Route not found");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});