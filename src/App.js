import React, { useState, useEffect } from "react";
import Web3 from "web3";
import XU_Token from "./contracts/XU_Token.json";

function App() {
  const yourSmartContract = "0xc0EF4441a35d487C0C018603d6AE7c9871a82d1b";

  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [xuTokenBalance, setXUTokenBalance] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [xuTokenContract, setXUTokenContract] = useState(null);
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    const loadWeb3 = async () => {
      try {
        if (window.ethereum) {
          window.web3 = new Web3(window.ethereum);
          await window.ethereum.enable();
          setWeb3(window.web3);

          const accounts = await window.web3.eth.getAccounts();
          setAccount(accounts[0]);

          const weiBalance = await window.web3.eth.getBalance(accounts[0]);
          const ethBalance = window.web3.utils.fromWei(weiBalance, "ether");
          setBalance(ethBalance);

          const contract = new window.web3.eth.Contract(
            XU_Token.abi,
            yourSmartContract
          );
          setXUTokenContract(contract);

          const xuTokenBalance = await contract.methods
            .balanceOf(accounts[0])
            .call();
          setXUTokenBalance(parseFloat(xuTokenBalance));
          setConnected(true);
        } else {
          throw new Error("Please install MetaMask!");
        }
      } catch (error) {
        console.error("Web3 connection error:", error);
        setError(error.message);
      }
    };

    loadWeb3();
  }, []);

  const handleConnectWallet = async () => {
    try {
      if (!connected) {
        await window.ethereum.enable();
        const accounts = await window.web3.eth.getAccounts();
        setAccount(accounts[0]);
        setConnected(true);
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      setError(error.message);
    }
  };

  const handleDisconnectWallet = () => {
    setConnected(false);
  };

  const handleTransfer = async () => {
    try {
      if (web3 && account && recipient && amount && xuTokenContract) {
        const weiAmount = web3.utils.toWei(amount, "ether");

        // Check XU Token balance before transfer
        const xuTokenBalanceBefore = await xuTokenContract.methods
          .balanceOf(account)
          .call();
        const parsedXUTokenBalanceBefore = parseFloat(xuTokenBalanceBefore);

        if (parseFloat(amount) > parsedXUTokenBalanceBefore) {
          throw new Error("Insufficient XU Token balance for the transfer.");
        }

        const gasPrice = await web3.eth.getGasPrice();
        console.log("Current gas price:", gasPrice);

        const result = await xuTokenContract.methods
          .transfer(recipient, weiAmount)
          .send({
            from: account,
            gas: 150000, // Adjust gas limit
            gasPrice: gasPrice,
          });

        console.log("Transfer result:", result);

        // Refresh XU Token balance after transfer
        const xuTokenBalanceAfter = await xuTokenContract.methods
          .balanceOf(account)
          .call();
        const parsedXUTokenBalanceAfter = parseFloat(xuTokenBalanceAfter);
        setXUTokenBalance(parsedXUTokenBalanceAfter);

        // Optionally, you can refresh the ETH balance as well
        const newWeiBalance = await web3.eth.getBalance(account);
        const newEthBalance = web3.utils.fromWei(newWeiBalance, "ether");
        setBalance(newEthBalance);

        // Show confirmation message
        setConfirmation("Đã chuyển Token thành công!");

        setError(null);
      }
    } catch (error) {
      console.error("Transfer error:", error);
      setError(error.message);
    }
  };

  return (
    <div className="container mt-5 wrapper">
      <h1 className="mb-4">Ethereum Wallet</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {confirmation && (
        <div className="alert alert-success">{confirmation}</div>
      )}
      <p>Account: {account}</p>
      <p>Balance: {balance} ETH</p>
      <p>XU Token Balance: {xuTokenBalance}</p>

      {!connected && (
        <button className="btn btn-primary" onClick={handleConnectWallet}>
          Chuyển xu
        </button>
      )}

      {connected && (
        <form className="mb-3">
          <div className="form-group">
            <label htmlFor="recipient">Recipient Address</label>
            <input
              type="text"
              className="form-control mt-2"
              id="recipient"
              placeholder="Enter recipient address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>

          <div className="form-group mt-2">
            <label htmlFor="amount">XU (Token)</label>
            <input
              type="number"
              className="form-control mt-2"
              id="amount"
              placeholder="Enter Xu ( Token )"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn btn-primary mt-4"
            onClick={handleTransfer}
          >
            Chuyển Token
          </button>
        </form>
      )}

      {connected && (
        <button className="btn btn-secondary" onClick={handleDisconnectWallet}>
          Ẩn bớt
        </button>
      )}
    </div>
  );
}

export default App;
