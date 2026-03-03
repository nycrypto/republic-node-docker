import express from "express";
import helmet from "helmet";

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.static(new URL("./web/", import.meta.url).pathname));

const RPC = process.env.NODE_RPC_HTTP_URL || "http://127.0.0.1:26657";
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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Dashboard listening on ${PORT}`);
});
