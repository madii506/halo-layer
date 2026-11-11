# halo

Pick a halo. Get paid in it. A launchpad where every coin is paired with one privacy layer, its halo: Zcash, Monero, Railgun, Nym and the rest, on Raydium LaunchLab.

- `index.html` + `assets/`: the intro and the terminal (wall, feed, pulse, launch, vault, docs, ops). No build step.
- `api/halo.js`: one serverless function. Prices from CoinGecko (optional `CG_KEY` env for a demo key), launches on Raydium LaunchLab, the chain index read from the tag address in `api/halo-config.json`.
- `api/halo-config.json`: every privacy layer halo tracks. A layer pays holders in its own token only when `mint` is set to that token's Solana mint; otherwise in SOL.
- Storage: a Vercel Blob store (`BLOB_READ_WRITE_TOKEN`) for images, metadata, coin cards and the price sheets.

Every transaction is signed in the visitor's own wallet. halo never holds keys or coins.

Live: https://halo-layer.vercel.app
