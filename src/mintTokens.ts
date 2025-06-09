import {
    createBurnCheckedInstruction,
    getAssociatedTokenAddress,
    getAccount,
    createAssociatedTokenAccount,
    mintTo,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import {
    Connection,
    PublicKey,
    Keypair,
    Transaction,
    sendAndConfirmTransaction,
    SystemProgram,
    LAMPORTS_PER_SOL
} from "@solana/web3.js";
import { PRIVATE_KEY, TOKEN_MINT_ADDRESS } from "./address";

const connection = new Connection("https://api.devnet.solana.com");
const secret = new Uint8Array(PRIVATE_KEY as any);
const wallet = Keypair.fromSecretKey(secret);
console.log("Wallet Public Key:", wallet.publicKey.toBase58());
const mint = new PublicKey(TOKEN_MINT_ADDRESS!);
console.log("Mint Address:", mint.toBase58());

export const mintTokens = async (toAddress: string, amount: number) => {
    const recipient = new PublicKey(toAddress);
    console.log("Recipient Address:", recipient.toBase58());

    try {
        const ata = await getAssociatedTokenAddress(
            mint,
            recipient,
            true, 
            TOKEN_PROGRAM_ID
        );
        console.log("Associated Token Account:", ata.toBase58());

        try {
            await getAccount(connection, ata, undefined, TOKEN_PROGRAM_ID);
            console.log("Associated token account exists.");
        } catch (e) {
            console.log("Associated token account not found. Creating...");
            await createAssociatedTokenAccount(
                connection,
                wallet,
                mint,
                recipient,
                undefined,
                undefined,
                TOKEN_PROGRAM_ID
            );
            console.log("Created associated token account:", ata.toBase58());
        }

        await mintTo(
            connection,
            wallet,
            mint,
            ata,
            wallet.publicKey,
            amount,
            [],
            undefined,
            TOKEN_PROGRAM_ID
        );
        console.log("Minted tokens to:", ata.toBase58());
    } catch (error) {
        console.error("Error in mintTokens:", error);
        throw error;
    }
};

export const burnTokens = async ( amount: number) => {
    const owner = wallet.publicKey;
    const tokenAccount = await getAssociatedTokenAddress(
        mint,
        owner,
        false,
        TOKEN_PROGRAM_ID
    );

    const transaction = new Transaction().add(
        createBurnCheckedInstruction(
            tokenAccount,
            mint,
            owner,
            amount,
            9,
            [],
            TOKEN_PROGRAM_ID
        )
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [wallet]);
    console.log("Burn transaction signature:", signature);
};

export const sendNativeTokens = async (toAddress: string, amount: number) => {
    const recipient = new PublicKey(toAddress);
    console.log("Sending to:", recipient.toBase58());
    const transaction = new Transaction().add(
        SystemProgram.transfer({//using the SystemProgram to transfer lamports insted of createTransferInstruction since it is native SOL transfers
            fromPubkey: wallet.publicKey,
            toPubkey: recipient,
            lamports: amount
        })
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [wallet]);
    console.log("Transfer transaction signature:", signature);
};
