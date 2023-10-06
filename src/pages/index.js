import Head from 'next/head';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NFTMinter from '@/components/NFTMinter';
import { useWallet } from "@solana/wallet-adapter-react";




const Home = () => {

  const wallet = useWallet();

  return (
    <div>
      <Head>
        <title>Dogecaptial NFTMint</title>
        <meta name="description" content="Connect to Phantom Wallet using Next.js and Tailwind CSS" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="text-3xl font-bold text-center mt-8">Dogecaptial NFTMint</h1>

        <div className="container mx-auto mt-8 flex justify-center">
          {wallet.connected ? <NFTMinter /> : <p>Connect Wallet</p>}
        </div>
        
        <ToastContainer />
      </main>
    </div>
  );
};

export default Home;
