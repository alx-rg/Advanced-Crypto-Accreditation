import { Button, Card, Form, Image, Input, Typography, Avatar, Spin, message, Select } from 'antd'
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

  const [studentName, setStudentName] = useState("");
  const [degree, setDegree] = useState("");
  const [faculty, setFaculty] = useState("");
  const [gradDate, setGradDate] = useState();
  const [image, setImage] = useState(DUDegree);
  const [scenery, setScenery] = useState("");
  const [artStyle, setArtStyle] = useState();
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
      if(!studentName || !gradDate || !faculty || !degree) {
        message.warning("Please input image information !", 1)
      }
      else {
        console.log(studentName, faculty, degree, gradDate);
        // setIsLoading(true);
        const prompt = `Person practicing ${degree} in ${scenery} in the style of ${artStyle}`
        // console.log(prompt);
        // // get image from huggingface
        // const res = await axios({
        //   url: URL,
        //   method: 'POST',
        //   data: JSON.stringify({
        //     inputs: prompt,  options: { wait_for_model: true },
        //   }),
        //   responseType: 'arraybuffer',
        // })

        // console.log(res.data) 
        // const dataImg = res.data;
        // const base64data = Buffer.from(dataImg).toString('base64')
        // const img = `data:image/png;base64,` + base64data 
        // setImage(img)//set img = res
        // // const dataImg = DUDegree;
        // setIsLoading(false);
   
        message.info("Please wait for create metadata URL...", 2)
 
  
        console.log(process.env);

        //init nftstorage through storage key
        const nftstorage = new NFTStorage({token: process.env.REACT_APP_NFT_STORAGE_KEY})
        console.log(nftstorage)

        //upload image to nftstorage
        const response = await nftstorage.store({
          name: studentName,
          description: prompt,
          image: new File([dataImg], "image", {type: "image/png"}),
        })

        const {ipnft} = response;

        //url metadata to mint nft
        let ipfsURL = `https://ipfs.io/ipfs/${ipnft}/metadata.json` ;

        // WORKING: https://nftstorage.link/ipfs/bafybeifcaxugncajjxu3d6tik5spkyesqwuvm4uysye4cb6f6sflcxoj2q/testdata.json
        ipfsURL = `https://nftstorage.link/ipfs/${ipnft}/metadata.json`
        console.log(ipfsURL)

        // 

        //degree image: bafkreib525dwem6nkvxpssxcefmn54vkwudplu3hsd432eqk67swizvvue
        // ipfs://bafkreiebcfgprfpcqmodsjglljji7xrq62fcmag636czzws66a7ohyss6u

        //get chainid
        const { chainId, name } = await provider.getNetwork()
        console.log(chainId, name);

        //init nft through address and abis
        const nft = new ethers.Contract(config[chainId].nft.address, NFT, provider)


        const signer = await provider.getSigner();
        setIsMinted(true);

        //mint nft
        await nft.connect(signer).mint(ipfsURL)
        message.success("NFT minted successfully !", 1);
        setIsMinted(false);
        console.log('nft minted successfully');

        setStudentName("");
        setArtStyle();
        setDegree();
        setFaculty();
        setGradDate();

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
                        <Input style={{border: '2px solid #00A6CE', marginTop: "10px", height:"40px", width: "100%"}} size="medium" placeholder="Create a name..." value={studentName} onChange={(e)=> setStudentName(e.target.value)}/>
                      </div>
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
                      <Typography.Text style={{fontWeight: "bolder", fontSize:"16px"}}>Scenery for NFT Image</Typography.Text>
                      <Input style={{border: '2px solid #00A6CE', marginTop: "10px", height:"40px",  width: "100%"}} size="medium" placeholder="Ex snowy mountain, rainforest, postapocalyptic city..." value={scenery} onChange={(e)=> setScenery(e.target.value)}/>
                  </Form.Item>
                  <Form.Item>
                      <Typography.Text style={{fontWeight: "bolder", fontSize:"16px"}}>Art style for NFT</Typography.Text>
                      <Select style={{border: '2px solid #00A6CE', marginTop: "10px", height:"40px",  width: "100%"}} size="medium" placeholder="Choose art style" value={artStyle} 
                        onChange={(e)=> {
                          setArtStyle(e)}
                        } options={[ { value: "Art Deco", label: "Art Deco" },  
                        { value: "Art Nouveau", label: "Art Nouveau" },
                        { value: "Abstract Art", label: "Abstract Art" },
                        { value: "Bauhaus", label: "Bauhaus" }, 
                        { value: "Color Field Painting", label: "Color Field Painting" }, 
                        { value: "Cubism", label: "Cubism" },  
                        { value: "Digital Art", label: "Digital Art" }, 
                        { value: "Futurism", label: "Futurism" },  
                        { value: "Harlem Renaissance", label: "Harlem Renaissance" },  
                        { value: "Impressionism", label: "Impressionism" }, 
                        { value: "Minimalism", label: "Minimalism" },  
                        { value: "Neo-Impressionism", label: "Neo-Impressionism" },  
                        { value: "Neon Art", label: "Neon Art" },  
                        { value: "Op Art", label: "Op Art" },  
                        { value: "Pop Art", label: "Pop Art" },  
                        { value: "Post-Impressionism", label: "Post-Impressionism" },    
                        { value: "Street Art", label: "Street Art" }
                        ]}/>
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
                 <div className='spin'>
                  {
                    isLoading && <span>Creating your image... <Spin/></span>
                  }
                  {
                    isMinted && <span>Uploading image to ipfs and minting... <Spin/></span>
                  }
                </div>
            </div>
          </div>
      </Card>
    </div>
    </div>
  );
}

export default App;
