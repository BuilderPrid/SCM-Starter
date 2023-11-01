import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";
import css from "styled-jsx/css";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [depositVal, setDepositVal] = useState(0);
  const [withdrawVal, setWithdrawVal] = useState(0);
  const styles = {
    gradientText: {
      background: 'linear-gradient(to right, red, yellow)',
    },
  };
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    }
    else {
      console.log("No account found");
    }
  }

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }

    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts[0]);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  }

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  }

  const deposit = async (val) => {
    console.log(val, 'click')
    if (atm) {
      let tx = await atm.deposit(val, {
        value: ethers.utils.parseEther(val)
      });
      await tx.wait()
      getBalance();
    }
  }

  const withdraw = async (val) => {
    console.log(val, 'withdraw')
    if (atm) {
      let tx = await atm.withdraw(val, {
        value: ethers.utils.parseEther(val)
      });
      await tx.wait()
      getBalance();
    }
  }

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <div style={{
          width: '300px',
          margin: '30px auto',
        }}>
          <input onChange={(e) => setDepositVal(e.target.value)} value={depositVal}></input>
          <button onClick={() => deposit(depositVal)}>Deposit {depositVal} ETH</button><br></br></div>
        <div>
          <input onChange={(e) => setWithdrawVal(e.target.value)} value={withdrawVal}></input>
          <button onClick={() => withdraw(withdrawVal)}>Withdraw {withdrawVal} ETH</button>
        </div>
      </div>
    )
  }

  useEffect(() => { getWallet(); }, []);

  return (
    <main className="container">
      <header><h1 style={styles.gradientText}>Welcome to the Metacrafters ATM!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center
        }
      `}
      </style>
    </main>
  )
}
