const { NFT } = require("rmrk-tools");
const { ApiPromise, WsProvider, Keyring } = require("@polkadot/api");
const { stringToHex } = require("@polkadot/util");
const { waitReady } = require("@polkadot/wasm-crypto");

const provider = new WsProvider("wss://node.rmrk.app");

const collectionId = "FIXME";
const senderPhrase = "FIXME"; // Do not commit this

const data = [
  [
    1,
    "ipfs://ipfs/bafkreidbs6tcyil2exo4yj7i4jlq3qlyadvzqctvi3rvqphiqnzohtevvi",
  ],
  [
    2,
    "ipfs://ipfs/bafkreib4yflp7bqfdnlgj3s24jjp2llw3xrutxl6phbbutv4rkkpnwxska",
  ],
];

const main = async () => {
  await waitReady();
  const keyring = new Keyring({ type: "sr25519" });
  const sender = keyring.addFromUri(senderPhrase);

  const remarkBodies = data.map(([id, metadata]) => {
    const nft = new NFT(
      1234567, // FIXME: Fill the block number
      collectionId,
      `Your NFT name #${id}`, // name
      `YOUR_NFT_NAME_${id}`, // instance
      1, // transferable
      `000000000000000${id}`.slice(-16), // sn
      metadata
    );
    return stringToHex(nft.list(10000000000)); // in plancks
  });

  const api = await ApiPromise.create({ provider });

  const hash = await api.tx.utility
    .batchAll(remarkBodies.map((body) => api.tx.system.remark(body)))
    .signAndSend(sender);
  console.log(hash.toString());

  process.exit();
};

main().catch(console.error);
