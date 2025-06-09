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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNativeTokens = exports.burnTokens = exports.mintTokens = void 0;
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const address_1 = require("./address");
const connection = new web3_js_1.Connection("https://api.devnet.solana.com");
const secret = new Uint8Array(address_1.PRIVATE_KEY);
const wallet = web3_js_1.Keypair.fromSecretKey(secret);
console.log("Wallet Public Key:", wallet.publicKey.toBase58());
const mint = new web3_js_1.PublicKey(address_1.TOKEN_MINT_ADDRESS);
console.log("Mint Address:", mint.toBase58());
const mintTokens = (toAddress, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const recipient = new web3_js_1.PublicKey(toAddress);
    console.log("Recipient Address:", recipient.toBase58());
    try {
        // Step 1: Calculate ATA
        const ata = yield (0, spl_token_1.getAssociatedTokenAddress)(mint, recipient, true, spl_token_1.TOKEN_PROGRAM_ID);
        console.log("Associated Token Account:", ata.toBase58());
        // Step 2: Ensure it exists or create it
        try {
            yield (0, spl_token_1.getAccount)(connection, ata, undefined, spl_token_1.TOKEN_PROGRAM_ID);
            console.log("Associated token account exists.");
        }
        catch (e) {
            console.log("Associated token account not found. Creating...");
            yield (0, spl_token_1.createAssociatedTokenAccount)(connection, wallet, mint, recipient, undefined, undefined, spl_token_1.TOKEN_PROGRAM_ID);
            console.log("Created associated token account:", ata.toBase58());
        }
        // Step 3: Mint tokens to the ATA
        yield (0, spl_token_1.mintTo)(connection, wallet, mint, ata, wallet.publicKey, amount, [], undefined, spl_token_1.TOKEN_PROGRAM_ID);
        console.log("Minted tokens to:", ata.toBase58());
    }
    catch (error) {
        console.error("Error in mintTokens:", error);
        throw error;
    }
});
exports.mintTokens = mintTokens;
const burnTokens = (amount) => __awaiter(void 0, void 0, void 0, function* () {
    const owner = wallet.publicKey;
    const tokenAccount = yield (0, spl_token_1.getAssociatedTokenAddress)(mint, owner, false, spl_token_1.TOKEN_PROGRAM_ID);
    const transaction = new web3_js_1.Transaction().add((0, spl_token_1.createBurnCheckedInstruction)(tokenAccount, mint, owner, amount, 9, [], spl_token_1.TOKEN_PROGRAM_ID));
    const signature = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [wallet]);
    console.log("Burn transaction signature:", signature);
});
exports.burnTokens = burnTokens;
const sendNativeTokens = (toAddress, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const recipient = new web3_js_1.PublicKey(toAddress);
    console.log("Sending to:", recipient.toBase58());
    const transaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: recipient,
        lamports: amount
    }));
    const signature = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [wallet]);
    console.log("Transfer transaction signature:", signature);
});
exports.sendNativeTokens = sendNativeTokens;
