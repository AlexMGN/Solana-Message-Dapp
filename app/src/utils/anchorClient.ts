import { Program, Provider, web3 } from '@project-serum/anchor';
import { preflightCommitment, programAddress } from './config';
import * as anchor from "@project-serum/anchor";

const getConnectionProvider = async (wallet, connection) => {
    return new Provider(
        connection,
        wallet,
        {commitment: preflightCommitment});
};

const getProgram = async (wallet, connection) => {
    // Get a connection
    const provider = await getConnectionProvider(wallet, connection);
    // Get metadata about your solana program
    const idl = await Program.fetchIdl(programAddress, provider);
    // Create a program that you can call
    return new Program(idl, programAddress, provider);
};

export const fetchJokes = async (wallet, connection) => {
    const program = await getProgram(wallet, connection);
    return await program.account.joke.all()
}

export const sendJokes = async (wallet, connection, joke) => {
    const program = await getProgram(wallet, connection);

    // On créer un compte pour la joke
    const jokeAccountKeypair = anchor.web3.Keypair.generate();

    console.log(jokeAccountKeypair)

    const tx = await program.rpc.createJoke(joke.joke_content, {
        accounts: {
            jokeAccount: jokeAccountKeypair.publicKey,
            jokeCreator: program.provider.wallet.publicKey,
            systemProgram: web3.SystemProgram.programId,
        },
        signers: [jokeAccountKeypair]
    });
    console.log(tx);
}

export const updateJokes = async (wallet, connection, joke, joke_account) => {
    const program = await getProgram(wallet, connection);

    const tx = await program.rpc.updateJoke(joke.joke_content, {
        accounts: {
            jokeAccount: joke_account,
            author: program.provider.wallet.publicKey,
        },
        signers: []
    });
    console.log(tx);
}

export const deleteJoke = async (wallet, connection, joke_account) => {
    const program = await getProgram(wallet, connection);

    const tx = await program.rpc.deleteJoke({
        accounts: {
            jokeAccount: joke_account,
            author: program.provider.wallet.publicKey,
        },
        signers: []
    });
    console.log(tx);
}