const serverUrl = "https://lifqj4ergesl.usemoralis.com:2053/server";
const appId = "o9u8dPUQVzTB7ToYIXSGjrCyjDXgoS1O1NGMtMG9";
Moralis.start({ serverUrl, appId });

const login = async () => {
  await Moralis.authenticate().then(async function (user) {
    user.set("name", document.getElementById("user-username").value);
    user.set("email", document.getElementById("user-email").value);
    await user.save();
  });
  window.location.href = "dashboard.html";
};

const logout = async () => {
  await Moralis.User.logOut();
  window.location.href = "index.html";
};

const getTransactions = async () => {
  const options = {
    chain: "rinkeby",
    address: "0x9A924FBA349107FFB652ed04CD51421c3BAee556",
  };
  const transactions = await Moralis.Web3API.account.getTransactions(options);
  if (transactions.total) {
    let table = `
      <table class="table">
        <thead>
          <tr>
            <th scope="col">Transaction</th>
            <th scope="col">Block</th>
            <th scope="col">Age</th>
            <th scope="col">Type</th>
            <th scope="col">Fee</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody id="transactions">
        </tbody>
      </table>
    `;
    document.querySelector("#table-transactions").innerHTML = table;

    transactions.result.forEach((transaction) => {
      let content = `
        <tr>
          <td><a href="https://rinkeby.etherscan.io/tx/${
            transaction.hash
          }" target="_blank" rel="noopener noreferrer">${formatAddress(
        transaction.hash
      )}</a></td>
          <td><a href="https://rinkeby.etherscan.io/block/${
            transaction.block_number
          }" target="_blank" rel="noopener noreferrer">${
        transaction.block_number
      }</a></td>
          <td>${formatTime(
            Date.parse(new Date()) - Date.parse(transaction.block_timestamp)
          )}</td>
          <td>${formatType(transaction.from_address)}</td>
          <td>${((transaction.gas * transaction.gas_price) / 1e18).toFixed(
            5
          )} ETH</td>
          <td>${(transaction.value / 1e18).toFixed(5)} ETH</td>
        </tr>
      `;
      document.querySelector("#transactions").innerHTML += content;
    });
  }
};

const getBalances = async () => {
  const ethBalance = await Moralis.Web3API.account.getNativeBalance();
  const ropstenBalance = await Moralis.Web3API.account.getNativeBalance({
    chain: "ropsten",
  });
  const rinkebyBalance = await Moralis.Web3API.account.getNativeBalance({
    chain: "rinkeby",
  });

  document.querySelector("#table-balances").innerHTML = `
  <table class="table">
    <thead>
      <tr>
        <th scope="col">Chain</th>
        <th scope="col">Balance</th>
      </tr>
    </thead>
    <tbody id="balances">
      <tr>
        <td>Ether</td>
        <td>${(ethBalance.balance / 1e18).toFixed(5)}</td>
      </tr>
      <tr>
        <td>Ropsten</td>
        <td>${(ropstenBalance.balance / 1e18).toFixed(5)}</td>
      </tr>
      <tr>
        <td>Rinkeby</td>
        <td>${(rinkebyBalance.balance / 1e18).toFixed(5)}</td>
      </tr>
    </tbody>
  </table>
  `;
};

const getNfts = async () => {
  const nfts = await Moralis.Web3API.account.getNFTs({ chain: "rinkeby" });
  let nftTable = document.querySelector("#table-nfts");
  if (nfts.result) {
    nfts.result.forEach((nft) => {
      const metadata = JSON.parse(nft.metadata);
      let content = `
        <div class"card col-md-3">
          <img src="${formatNft(
            metadata.image_url
          )}" class="card-img-top" height=300>
          <div class="card-body">
            <h5 class="card-title">${metadata.name}</h5>
            <p class="card-text">${metadata.description}</p>
          </div>
        </div>
      `;
      nftTable.innerHTML += content;
    });
  }
};

const loginBtn = document.querySelector("#btn-login");
if (loginBtn !== null) {
  loginBtn.addEventListener("click", login);
}

const logoutBtn = document.querySelector("#btn-logout");
if (logoutBtn !== null) {
  logoutBtn.addEventListener("click", logout);
}

const transactionsBtn = document.querySelector("#get-transactions-link");
if (transactionsBtn !== null) {
  transactionsBtn.addEventListener("click", getTransactions);
}

const balancesBtn = document.querySelector("#get-balances-link");
if (balancesBtn !== null) {
  balancesBtn.addEventListener("click", getBalances);
}

const nftsBtn = document.querySelector("#get-nfts-link");
if (nftsBtn !== null) {
  nftsBtn.addEventListener("click", getNfts);
}

if (
  Moralis.User.current() == null &&
  !window.location.href.endsWith("index.html")
) {
  document.querySelector("body").style.display = "none";
  window.location.href = "index.html";
}

const formatAddress = (address) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatTime = (ms) => {
  let days = Math.floor(ms / (1000 * 60 * 60 * 24));
  let hours = Math.floor(
    (ms - days * (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  let minutes = Math.floor((ms - hours * (1000 * 60 * 60)) / (1000 * 60));
  if (days < 1) {
    if (hours < 1) {
      if (minutes < 1) {
        return `less than a minute ago`;
      } else return `${minutes.toFixed(0)} minute(s) ago`;
    } else return `${hours.toFixed(0)} hour(s) ago`;
  } else return `${days.toFixed(0)} day(s) ago`;
};

const formatType = (from_address) => {
  const user = Moralis.User.current().get("ethAddress");
  return user === from_address ? "outgoing" : "incoming";
};

const formatNft = (url) => {
  if (url.startsWith("ipfs")) {
    return (
      "https://ipfs.moralis.io:2053/ipfs/" + url.split("ipfs://").slice(-1)
    );
  } else {
    return url + "?format=json";
  }
};
