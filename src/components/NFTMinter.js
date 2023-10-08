import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NFTListItem from './NFTListItem'; 
import { useWallet } from "@solana/wallet-adapter-react";
import { useMetaplex } from "../util/useMetaplex";
import { toMetaplexFile } from '@metaplex-foundation/js';

const NFTMinter = () => {
  const [imageFile, setImageFile] = useState(null);
  const [isMinting, setMinting] = useState(false); 
  const [nfts, setNFTs] = useState([]); 
  const [isFetchingNFTs, setFetchingNFTs] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const { metaplex: mx } = useMetaplex();
  const wallet = useWallet();

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };
  
  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };


  const getNFts = async () => {
    if (!wallet.publicKey) {
      return;
    }

    setFetchingNFTs(true);
    try {
      const myNfts = await mx.nfts().findAllByOwner({
        owner: wallet.publicKey.toBase58(),
      });
  
      const nftPromises = myNfts.map(async (nft) => {
        try {
          const response = await fetch(nft.uri);
          const data = await response.json();
          const nftData = {
            imageSrc: data.image,
            title: data.name,
          };
          return nftData;
        } catch (error) {
          console.error(error);
          throw new Error('Error fetching NFT. Please try again later.');
        }
      });
  
      const fetchedNFTs = await Promise.all(nftPromises);
      setNFTs(fetchedNFTs);
      
    } catch (error) {
      console.error(error);
      toast.error('Error fetching NFT. Please try again later.');
    }finally{
      setFetchingNFTs(false);
    }
  };

  async function uploadNFTURI(nftURI, walletAddress) {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
  
      const raw = JSON.stringify({ "nftURI": nftURI, "walletAddress": walletAddress });
  
      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
      };
  
      const response = await fetch("http://localhost:3000/api/nft", requestOptions);
      const data = await response.text();
  
      console.log("Response:", data);
  
      return data; // You can handle the response data accordingly in your application
    } catch (error) {
      console.error('Error:', error);
      throw new Error(error); // Throw the error for handling it in your application
    }
  }
  
  
  


  const mintNFT = async () => {
    if (!imageFile ) {
      console.log("Error");
      toast.error('Please select an image.');
      return;
    }
    if(!title){
      toast.error('Please enter title.');
      return;
    }
    if(!description){
      toast.error('Please enter description.');
      return;
    }

    try {
      // Set minting state to true to indicate the start of minting process
      setMinting(true);

      const mintingNFT = {
        imageSrc: "https://img.freepik.com/free-photo/abstract-surface-textures-white-concrete-stone-wall_74190-8189.jpg?w=2000&t=st=1696525327~exp=1696525927~hmac=c3682581bae49534b2f36a36217c3ef633938e5964e9ac7deec3692377d33738", // Create a temporary URL for the image
        title: 'Minting', // Replace with the actual transaction hash of the minted NFT
      };

      setNFTs([mintingNFT, ...nfts]);

      try {
        await new Promise((resolve, reject) => {
          var reader = new FileReader();
          const fileData = new Blob([imageFile], { type: 'image/png' });
          reader.readAsArrayBuffer(fileData);
          reader.onload = async function (event) {
            try {
              const arrayBuffer = reader.result;
              const { uri, metadata } = await mx.nfts().uploadMetadata({
                name: title,
                description: description,
                image: toMetaplexFile(arrayBuffer, 'image/png'),
              });

              let mintAddress;
      
              const { nftMinted } = await mx.nfts().create({
                uri,
                name: title,
                sellerFeeBasisPoints: 500,
              }).then((data) => {
                mintAddress = data.mintAddress.toBase58();
                return data;
              });
              resolve(nftMinted);

  
              console.log("Mint Address:", nftMinted);
              
              try{
                const data = await uploadNFTURI(mintAddress, wallet.publicKey.toBase58());
                console.log(data);
              }catch(error){
                console.error('Error uploading metadata or minting NFT:', error);
                reject(error);
              }

            } catch (error) {
              console.error('Error uploading metadata or minting NFT:', error);
              reject(error);
            }
          };
        });
      } catch (error) {
        console.error('Error reading image file:', error);
        toast.error('Error processing image file. Please try again later.');
      }
      
      const mintedNFT = {
        imageSrc: URL.createObjectURL(imageFile),
        title: title,
      };

      setNFTs([mintedNFT, ...nfts]);

      setTitle('');
      setDescription('');

      toast.success('NFT minted successfully!');
    } catch (error) {
      setNFTs(nfts.filter((nft) => nft.title !== 'Minting'));
      console.error('Error minting NFT:', error);
      toast.error('Error minting NFT. Please try again later.');
    } finally {
      // Reset minting state to false after the minting process is completed or if there's an error
      setMinting(false);
    }
  };

  useEffect(() => {
    getNFts();
  }, []);

  return (
    <div className="container mx-auto mt-8 grid grid-cols-1 gap-4 items-center">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={handleTitleChange}
        className="p-2 border border-gray-300 rounded"
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={handleDescriptionChange}
        className="p-2 border border-gray-300 rounded"
      />
      <input type="file" onChange={handleImageChange} accept="image/*" />
      <button
        className={`col-span-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isMinting ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={mintNFT}
        disabled={isMinting}
      >
        {isMinting ? 'Minting...' : 'Mint NFT'}
      </button>
      <div className='text-center'> {/* Center align text */}
        <strong className="text-2xl my-4">Your NFTs:</strong>
        {!isFetchingNFTs ? (nfts.length !== 0 ? nfts.map((nft, index) => (
          <NFTListItem key={index} imageSrc={nft.imageSrc} title={nft.title} />
        )) : <p className="text-xl">No NFTs minted yet.</p>) : <p className="text-xl">Fetching NFTs...</p>}
      </div>
    </div>
  );
};

export default NFTMinter;
