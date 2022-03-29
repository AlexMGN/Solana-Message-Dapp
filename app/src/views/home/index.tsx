// Next, React
import {FC, useEffect, useState} from 'react';

// Wallet
import { useWallet, useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';

// Components
import { RequestAirdrop } from '../../components/RequestAirdrop';
import pkg from '../../../package.json';

// Store
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';

// Jokes
import { deleteJoke, fetchJokes, sendJokes, updateJokes } from '../../utils/anchorClient';

export const HomeView: FC = ({ }) => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const wallet = useAnchorWallet()

  const [jokes, setJokes] = useState([{
    post_account: {},
    account: "",
    content: ""
  }]);
  const [joke, setJoke] = useState({
    joke_content: "",
  });
  const [sumbitText, setSubmitText] = useState("send");
  const [jokeAccount, setJokeAccount] = useState();

  const getAllJokes = async () => {
    const jokes = await fetchJokes(wallet, connection);
    const newJokes = [];

    jokes.map(joke => {
      newJokes.push({
        post_account: joke.publicKey,
        account: joke.account.author.toString(),
        content: joke.account.content
      })
    })

    setJokes(newJokes);
  }

  const submitJoke = async (e) => {
    e.preventDefault();

    if (sumbitText !== "update") {
      await sendJokes(wallet, connection, joke);
      await getAllJokes();
    } else {
      await updateJokes(wallet, connection, joke, jokeAccount);
      await getAllJokes();
    }

    setJoke({joke_content: ""})
    setSubmitText((sumbitText === "update") ? "send" : "send");
  }

  const deleteContent = async (post_account) => {
    await deleteJoke(wallet, connection, post_account);
    await getAllJokes();
  }

  const updateContent = async (joke, joke_account) => {
    console.log(joke)
    setSubmitText("update");
    setJoke({ joke_content: joke.content });
    setJokeAccount(joke_account);
  }

  function handleChange(e) {
    setJoke({ ...joke, [e.target.name]: e.target.value });
  }

  useEffect(() => {
    getAllJokes()
  }, [connection, wallet])

  return (

    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center text-5xl md:pl-12 font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
          Libre message (Devnet) <span className='text-sm font-normal align-top text-slate-700'>{jokes.length}</span>
        </h1>
        <form onSubmit={submitJoke} className="text-center">
          <div className="max-w-md mx-auto mockup-code bg-primary p-6 my-2">
            <pre data-prefix=">">
              <code className="truncate">Poster un message librement:  </code>
              <code className="truncate text-center">
                  <div className="mb-6 mt-6 rounded-box text-black pl-7">
                    <input
                        className="shadow appearance-none border rounded w-full pl-6 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        name="joke_content"
                        type="text"
                        placeholder="Nouveau message.."
                        onChange={handleChange}
                        value={joke.joke_content}
                        required
                    />
                  </div>
              </code>
            </pre>
          </div>

          { sumbitText === "send" &&
            <button
                type="submit"
                className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
            >
              Envoyer le message
            </button>
          }
          { sumbitText === "update" &&
            <button
                type="submit"
                className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
            >
              Mettre à jour le message
            </button>
          }
        </form>
        <div className="text-center">
          {publicKey &&
          <div>
            {
              jokes.map((joke, index) =>
                  <div className="flex bg-white shadow-lg rounded-lg md:mx-auto max-w-md md:max-w-2xl mb-6 mt-6" key={index}>
                    <div className="flex items-start px-4 py-6">
                      <div>
                        <div className="flex items-center justify-between">
                          <h2 className="text-sm text-gray-900 -mt-1 mr-6">Posted by: { joke.account }</h2>
                          <small className="text-sm text-gray-700 -mt-4">
                            { publicKey.toString() === joke.account &&
                                <div>
                                  <button className="px-2 py-2" onClick={() => deleteContent(joke.post_account)}>X</button>
                                  <button className="px-2 py-2" onClick={() => updateContent(joke, joke.post_account)}>Update</button>
                                </div>
                            }
                          </small>
                        </div>
                        <p className="mt-3 text-gray-700 text-sm">
                          { joke.content }
                        </p>
                      </div>
                    </div>
                  </div>
              )
            }

            {/*<RequestAirdrop />*/}
          </div>
          }
        </div>
      </div>
    </div>
  );
};
