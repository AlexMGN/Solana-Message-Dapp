use anchor_lang::prelude::*;

declare_id!("7PcDh1RrL4FZUEhrA8kiAMXStVXRwMEwFvLb5X4oEWX6"); // ID du programme

#[program]
pub mod messagelearn {
    use super::*;
    // Fonction create joke avec le contexte CreateMessageCtx et le contenu
    pub fn create_message(ctx: Context<CreateMessageCtx>, message_content: String) -> Result<()> {
        *ctx.accounts.message_account = Message {
            author: *ctx.accounts.message_creator.key,
            content: message_content
        };

        // Condition pour appeler l'erreur
        if ctx.accounts.message_account.content.chars().count() > 280 {
            return Err(error!(ErrorCode::ContentTooLong));
        }
        // Le compte du message contient un Message qui contient un auteur et un contenu

        msg!("Autheur du message: {}", ctx.accounts.message_account.author);
        msg!("Message: {}", ctx.accounts.message_account.content);

        Ok(())
    }

    // Fonction update message avec le contexte UpdateMessage et le contenu
    pub fn update_message(ctx: Context<UpdateMessage>, message_content: String) -> Result<()> {
        *ctx.accounts.message_account = Message {
            author: *ctx.accounts.author.key,
            content: message_content
        };

        if ctx.accounts.message_account.content.chars().count() > 280 {
            return Err(error!(ErrorCode::ContentTooLong));
        }

        msg!("Autheur du message: {}", ctx.accounts.message_account.author);
        msg!("Nouveau message: {}", ctx.accounts.message_account.content);

        Ok(())
    }

    // Fonction delete message avec le contexte DeleteMessage
    pub fn delete_message(_ctx: Context<DeleteMessage>) -> Result<()> {
        Ok(())
    }

}

/*
Contexte <CreateMessageCtx>:

On défini tous les comptes dont on a besoin pour notre contexte.
Notre contexte permet à un utilisateur de pouvoir envoyer un message
Tout est compte dans Solana, donc chaque message devra avoir son propre compte

Il faut donc un compte joke_account que nous allons initialiser
Celui qui paye les frais c'est celui qui envoi le message (l'auteur: message_creator)
Et la place qu'on aloue à ce compte est défini dans l'implémentation de Message plus bas
Il est de type account et se base sur la struct Joke

Il faut le compte du createur et on défini mut car ses data vont changés (dans ce cas il va perdre des SOL)
Ce compte est le signer de la transaction

Et il faut le compte du System Program (Token Program si on parle de token)
 */
#[derive(Accounts)]
#[instruction(content: String)]
pub struct CreateMessageCtx<'info> {
    #[account(init, payer = message_creator, space = Message::LEN + (content.len() * 2))]
    pub message_account: Account<'info, Message>,
    #[account(mut)]
    pub message_creator: Signer<'info>,
    pub system_program: Program<'info, System>
}

/*
Contexte <UpdateMessage>:

On défini tous les comptes dont on a besoin pour notre contexte.
Notre contexte permet à un utilisateur de pouvoir update un message

Il faut donc le compte de la joke qui est toujours de type Account avec la struct Message
Il est mutable puisque l'on va modifier ses données
Et on vérifie bien que l'auteur qui signe est bien l'auteur du message (contraint)
 */
#[derive(Accounts)]
pub struct UpdateMessage<'info> {
    #[account(mut, has_one = author)]
    pub message_account: Account<'info, Message>,
    pub author: Signer<'info>,
}

/*
Contexte <DeleteMessage>:

On défini tous les comptes dont on a besoin pour notre contexte.
Notre contexte permet à un utilisateur de pouvoir supprimer un message

Il faut donc le compte de la joke qui est toujours de type Account avec la struct Joke
Il est mutable puisque l'on va modifier ses données
Et on vérifie bien que l'auteur qui signe est bien l'auteur du message (contraint)
Et on rembourse le coût du message à l'auteur (close)
 */
#[derive(Accounts)]
pub struct DeleteMessage<'info> {
    #[account(mut, has_one = author, close = author)]
    pub message_account: Account<'info, Message>,
    pub author: Signer<'info>,
}

/*
On détail le type Message pour l'account message_account
Il contiendra un auteur et un contenu
 */
#[account]
pub struct Message {
    pub author: Pubkey,
    pub content: String
}

// On défini les différentes tailles de ce que nous allons insérer dans la blockchain
const ACCOUNT_DISCRIMINATOR_LENGTH: usize = 8; // Discriminator du compte, sera toujours 8
const PUBLIC_KEY_LENGTH: usize = 32; // Pubkey sera toujours 32
const STRING_LENGTH_PREFIX: usize = 4; // La taille d'une string sera toujours 4

/*
On implémente la struct Message en ajoutant des constantes
 */
impl Message {
    const LEN: usize = ACCOUNT_DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH
        + STRING_LENGTH_PREFIX;
}

/*
On défini des erreurs personnalisées
 */
#[error_code]
pub enum ErrorCode {
    #[msg("The provided content should be 280 characters long maximum.")]
    ContentTooLong
}