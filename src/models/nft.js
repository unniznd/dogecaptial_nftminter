import mongoose from 'mongoose';

const nftSchema = new mongoose.Schema({
    nftURI:{
        type: String,
        required: true
    },
    walletAddress:{
        type: String,
        required: true
    }
});

const NFT = mongoose.models.NFTModel || mongoose.model('NFTModel', nftSchema);

export default NFT;
