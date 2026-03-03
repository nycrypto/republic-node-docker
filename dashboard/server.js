import express from "express";
import helmet from "helmet";

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.static(new URL("./web/", import.meta.url).pathname));

const RPC = process.env.NODE_RPC_HTTP_URL || "http://127.0.0.1:26657";
const REST = process.env.REST_HTTP_URL || "http://127.0.0.1:1317";
const PORT = Number(process.env.PORT || 3000);

async function fetchJson(url) {
  const r = await fetch(url, { method: "GET" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return await r.json();
}

app.get("/api/node/status", async (req, res) => {
  try {
    const j = await fetchJson(`${RPC}/status`);
    const out = {
      latest_block_height: j?.result?.sync_info?.latest_block_height ?? null,
      catching_up: j?.result?.sync_info?.catching_up ?? null,
      moniker: j?.result?.node_info?.moniker ?? null
    };
    res.json(out);
  } catch (e) {
    res.status(502).json({ error: "RPC status failed" });
  }
});

app.get("/api/node/peers", async (req, res) => {
  try {
    const j = await fetchJson(`${RPC}/net_info`);
    res.json({ n_peers: j?.result?.n_peers ?? null });
  } catch (e) {
    res.status(502).json({ error: "RPC net_info failed" });
  }
});
function isSafeAddress(a) {
  return typeof a === "string" && /^[a-z0-9]{10,80}$/.test(a);
}

app.get("/api/wallet/:address/balance", async (req, res) => {
  const address = req.params.address;
  if (!isSafeAddress(address)) return res.status(400).json({ error: "Invalid address" });

  try {
    const j = await fetchJson(`${REST}/cosmos/bank/v1beta1/balances/${address}`);
    res.json({ balances: j?.balances ?? [] });
  } catch (e) {
    res.status(502).json({ error: "REST balance failed" });
  }
});

app.get("/api/wallet/:address/delegation/:valoper", async (req, res) => {
  const address = req.params.address;
  const valoper = req.params.valoper;
  if (!isSafeAddress(address) || !isSafeAddress(valoper)) return res.status(400).json({ error: "Invalid address" });

  try {
    const j = await fetchJson(`${REST}/cosmos/staking/v1beta1/validators/${valoper}/delegations/${address}`);
    res.json(j);
  } catch (e) {
    res.status(502).json({ error: "REST delegation failed" });
  }
});

app.get("/api/validator/:valoper", async (req, res) => {
  const valoper = req.params.valoper;
  if (!isSafeAddress(valoper)) return res.status(400).json({ error: "Invalid valoper" });

  try {
    const j = await fetchJson(`${REST}/cosmos/staking/v1beta1/validators/${valoper}`);
    res.json(j);
  } catch (e) {
    res.status(502).json({ error: "REST validator failed" });
  }
});
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Dashboard listening on ${PORT}`);
});
