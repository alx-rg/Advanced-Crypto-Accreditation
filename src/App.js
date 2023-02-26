import { Button, Card, Form, Image, Input, Typography, Avatar, Spin, message } from 'antd'
import React, { useState } from 'react'
import axios from 'axios'
import {Buffer} from 'buffer'
import defaultImage from './university.png'
import DUDegree from './DUDegree.png'
import { NFTStorage, File } from 'nft.storage'
import { ethers } from "ethers";
import config from './config.json';
import NFT from './abiNFT.json';
import './App.css';
import bnb from "./bnb.png"
import walletLogo from "./wallet.png"

function App() {

  const [provider, setProvider] = useState(null);
  const [wallet, setWallet] = useState(null);

  //handle button conect wallet
  const handleConnectWallet = async () => {
      //init provider
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      //get address and balance
      const address = await signer.getAddress();
      const bigBalance = await signer.getBalance();
      const balance = Number.parseFloat(ethers.utils.formatEther(bigBalance))
      setWallet({address, balance}); //set address and balance to state wallet
      setProvider(provider);
  }

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [degree, setDegree] = useState("");
  const [faculty, setFaculty] = useState("");
  const [gradDate, setGradDate] = useState();
  const [image, setImage] = useState(DUDegree);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinted, setIsMinted] = useState(false);

  //url generate image
  const URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2";
  
  //handle generate image => upload image to ipfs => get ipfs url metadata to mint NFT and deploy bsc testnet, opensea
  const handleNFT = async (e) => {
    e.preventDefault();
 
    if(provider == null) {
      message.warning("Please connect your wallet !", 1)
    }
    else {
      //check name, description
      if(!name || !description || !gradDate || !faculty || !degree || (!name && !description)) {
        message.warning("Please input image information !", 1)
      }
      else {
        console.log(name, description, faculty, degree, gradDate);
        setIsLoading(true);
        // Sparkly Diploma from the University of McGill in Dietetics in 2018 laying on a {bed of potatoes}
        const prompt = `This degree is awarded to ${name} ${description} ${degree} ${gradDate}`
        console.log(prompt);
        // get image with name and description from huggingface
        const res = await axios({
          url: URL,
          method: 'POST',
          data: JSON.stringify({
            inputs: description,  options: { wait_for_model: true },
          }),
          responseType: 'arraybuffer',
        })

        console.log(res.data) 
        const dataImg = res.data;
        const base64data = Buffer.from(dataImg).toString('base64')
        const img = `data:image/png;base64,` + base64data 
        setImage(img)//set img = res
        // const dataImg = DUDegree;
        setIsLoading(false);
   
        message.info("Please wait for create metadata URL...", 2)
 
  
        console.log(process.env);

        //init nftstorage through storage key
        const nftstorage = new NFTStorage({token: process.env.REACT_APP_NFT_STORAGE_KEY})
        console.log(nftstorage)

        console.log(` ${name} `)
        //upload image to nftstorage
        const { ipnft } = await nftstorage.store({
          name,
          description,
          image: new File([dataImg], "image", {type: "image/png"}),
        })

        //url metadata to mint nft
        const ipfsURL = `https://ipfs.io/ipfs/${ipnft}/metadata.json` ;
        console.log(ipfsURL)

        //https://ipfs.io/ipfs/QmZ1Uii5sD2zi4dEKTt8cKoM9dXaevCkWbVn28UKV3n2fP?_gl=1*mvhkhn*_ga*NDU2NjE0MzYyLjE2NzcwOTcyNjg.*_ga_5RMPXG14TE*MTY3NzM1MDUzMy40LjAuMTY3NzM1MDUzNS41OC4wLjA.

        //get chainid
        const { chainId } = await provider.getNetwork()
        console.log(chainId);

        //init nft through address and abis
        const nft = new ethers.Contract(config[chainId].nft.address, NFT, provider)


        const signer = await provider.getSigner();
        setIsMinted(true);

        //mint nft
        await nft.connect(signer).mint(ipfsURL)
        message.success("NFT minted successfully !", 1);
        setIsMinted(false);
        console.log('nft minted successfully');

        setName("");
        setDescription("");

      }
    }
  }

  return (
    <div className="App">
      <div className="navbar">
        <div className="logo">
            <Avatar src={defaultImage} size={60}/>
            <h1 className="title">Crypto Accreditation</h1>
        </div>
        <div>
          {
            !wallet ? 
                <Button onClick={handleConnectWallet} type="primary" shape="round" size='large' style={{backgroundColor: "#00677F"}}>
                  <Avatar src={walletLogo} size={20} style={{marginRight: "10px", marginBottom:"3px", zIndex: "1", backgroundColor: "#00A6CE", padding: '2px'}}/>Connect Wallet
                </Button>
            :   <Button style={{borderColor: "#f2e604"}}>
                    <Typography style={{color: '#f2e604', fontWeight:"bold"}}>{wallet?.address} | <Avatar src={bnb} size={22} style={{marginBottom:"3px", zIndex: "1", backgroundColor: "#00A6CE"}}/> {wallet?.balance.toFixed(4)}</Typography>
                </Button>
          }  
        </div>
      </div>
    <div className='container'>
      <Card className="card">
          <div className="body">
            <div>
                <Form className="form-group">
                  <Form.Item>
                      <div className="form-group">
                        <Typography.Text style={{fontWeight: "bolder", fontSize:"16px"}}>Student Name</Typography.Text>
                        <Input style={{border: '2px solid #00A6CE', marginTop: "10px", height:"40px", width: "100%"}} size="medium" placeholder="Create a name..." value={name} onChange={(e)=> setName(e.target.value)}/>
                      </div>
                  </Form.Item>
                  <Form.Item>
                      <Typography.Text style={{fontWeight: "bolder", fontSize:"16px"}}>Description of NFT</Typography.Text>
                      <Input style={{border: '2px solid #00A6CE', marginTop: "10px", height:"40px",  width: "100%"}} size="medium" placeholder="Create a description..." value={description} onChange={(e)=> setDescription(e.target.value)}/>
                  </Form.Item>
                  <Form.Item>
                      <div className="form-group">
                        <Typography.Text style={{fontWeight: "bolder", fontSize:"16px"}}>Degree Name</Typography.Text>
                        <Input style={{border: '2px solid #00A6CE', marginTop: "10px", height:"40px", width: "100%"}} size="medium" placeholder="Degree Name" value={degree} onChange={(e)=> setDegree(e.target.value)}/>
                      </div>
                  </Form.Item>
                  <Form.Item>
                      <Typography.Text style={{fontWeight: "bolder", fontSize:"16px"}}>Faculty</Typography.Text>
                      <Input style={{border: '2px solid #00A6CE', marginTop: "10px", height:"40px",  width: "100%"}} size="medium" placeholder="Faculty" value={faculty} onChange={(e)=> setFaculty(e.target.value)}/>
                  </Form.Item>
                  <Form.Item>
                      <Typography.Text style={{fontWeight: "bolder", fontSize:"16px"}}>Date</Typography.Text>
                      <Input style={{border: '2px solid #00A6CE', marginTop: "10px", height:"40px",  width: "100%"}} size="medium" placeholder="Date" value={gradDate} onChange={(e)=> setGradDate(e.target.value)}/>
                  </Form.Item>
                  <Form.Item>
                    <Button onClick={handleNFT} type="primary" shape="square" size='large' style={{width: "100%", height:"60px", marginTop: "10px", backgroundColor: "#00677F"}}>
                      Generate & Mint
                    </Button>
                  </Form.Item>
                </Form>
            </div>
            <div className='img'>
                <Image
                    width='100%'
                    src={`${image}`}
                  />
            </div>
          </div>
      </Card>
    </div>

    <div className='spin'>
      {
        isLoading && <span>Creating your image... <Spin/></span>
      }
      {
        isMinted && <span>Uploading image to ipfs and minting... <Spin/></span>
      }
    </div>
    </div>
  );
}

export default App;
