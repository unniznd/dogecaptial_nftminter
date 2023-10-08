import connectToDatabase from '../../util/mongodb'; // Import MongoDB connection
import NFT from '../../models/nft'; // Import MongoDB model

export default async function handler(req, res) {
  if (req.method === 'POST') {
    console.log(req.body);
    const { nftURI, walletAddress } = req.body;

    try {
      await connectToDatabase();
      const newNFT = new NFT({ nftURI: nftURI, walletAddress: walletAddress });
      await newNFT.save();

      res.status(200).json({ 
        success: true, 
        message: 'NFT minted and data stored successfully.' ,
        id:newNFT._id
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }else if(req.method === 'DELETE'){
    const { id } = req.body;
    try {
      await connectToDatabase();
      await NFT.findByIdAndDelete(id);
      res.status(200).json({ 
        success: true, 
        message: 'NFT deleted successfully.' 
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  } else if (req.method === 'GET') {
    // response full nfts in schema
    try {
      await connectToDatabase();
      const nfts = await NFT.find({});
      // create key-value pair with nftURI as key and walletAddress as value
      const nftsMap = nfts.reduce((map, nft) => {
        map[nft.nftURI] = nft.walletAddress;
        return map;
      }, {});

      res.status(200).json({ success: true, nfts: nftsMap });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
