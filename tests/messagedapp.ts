import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Messagelearn } from '../target/types/messagelearn';
import * as assert from "assert";

describe('Message Contract', () => {
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.Messagelearn as Program<Messagelearn>;
  const messageAccountKeypair = anchor.web3.Keypair.generate();
  const accountGuardKeypair = anchor.web3.Keypair.generate();

  it('It Creates a Message!', async () => {
    const tx = await program.methods.createMessage('Ceci est un message que personne ne verra avec methods')
        .accounts({
          messageAccount: messageAccountKeypair.publicKey,
          messageCreator: program.provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId
        })
        .signers([messageAccountKeypair])
        .rpc();

    //console.log("Your transaction signature", tx);
  });

  it('Content size guard!', async () => {
    try {
      const tx = await program.methods.createMessage('x'.repeat(281))
          .accounts({
            messageAccount: accountGuardKeypair.publicKey,
            messageCreator: program.provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId
          })
          .signers([accountGuardKeypair])
          .rpc()

      //console.log("Your transaction signature", tx);
    } catch (e) {
      assert.equal(e.error.errorMessage, 'The provided content should be 280 characters long maximum.');
      return;
    }
  });

  it('It Update a Message!', async () => {
    const tx = await program.methods.updateMessage('Ceci est un update d\'un message que personne ne verra')
        .accounts({
          messageAccount: messageAccountKeypair.publicKey,
          author: program.provider.wallet.publicKey,
        })
        .signers([])
        .rpc();

    //console.log("Your transaction signature", tx);
  });

  /*it('Get All Messages!', async () => {
    console.log("All messages", await program.account.message.all());
  });*/

  /*it('Get All Messages for an Account!', async () => {
    const messagesForOneWallet = await program.account.message.all([{
      memcmp: {
        offset: 8, // Starting from the 42nd byte.
        bytes: program.provider.wallet.publicKey.toBase58(), // My base-58 encoded public key.
      }
    }]);

    console.log("All messages for one account", messagesForOneWallet)
  });*/

  it('It Delete a Message!', async () => {
    const tx = await program.methods.deleteMessage()
        .accounts({
          messageAccount: messageAccountKeypair.publicKey,
          author: program.provider.wallet.publicKey,
        })
        .signers([])
        .rpc();

    //console.log("Your transaction signature", tx);
  });
});