"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mintTokens_1 = require("./mintTokens");
const address_1 = require("./address");
const app = (0, express_1.default)();
app.use(express_1.default.json());
const VAULT = address_1.PUBLIC_KEY;
app.post("/helius", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Incoming webhook:", JSON.stringify(req.body, null, 2));
        const helius_response = Array.isArray(req.body) ? req.body[0] : req.body;
        if (!helius_response) {
            console.error("Webhook body missing or empty");
            return res.status(400).send("Invalid webhook payload");
        }
        const incomingTxn = (helius_response.nativeTransfers || []).find((transfer) => transfer.toUserAccount &&
            transfer.toUserAccount.trim().toLowerCase() === VAULT.trim().toLowerCase());
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
        yield (0, mintTokens_1.mintTokens)(senderAddress, tokenAmountToMint);
        // 2. Burn some tokens from the vault
        yield (0, mintTokens_1.burnTokens)(tokenAmountToBurn);
        // 3. Send back small amount of native tokens to the sender
        yield (0, mintTokens_1.sendNativeTokens)(senderAddress, tokenAmountToMint);
        return res.status(200).send("Webhook processed: mint, burn, refund done");
    }
    catch (error) {
        console.error("Error processing webhook:", error);
        return res.status(500).send("Internal server error");
    }
}));
app.all("*", (req, res) => {
    console.log(`Unknown route: ${req.method} ${req.url}`);
    res.status(404).send("Route not found");
});
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
