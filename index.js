const express = require("express");
const multer  = require("multer");
const cors    = require("cors");
const { removeBackground } = require("@imgly/background-removal-node");

const app    = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 15 * 1024 * 1024 }, // 15 Mo max
});

app.use(cors());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/remove-bg", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "image manquante" });

  try {
    const blob   = await removeBackground(req.file.buffer);
    const base64 = Buffer.from(await blob.arrayBuffer()).toString("base64");
    res.json({ result: `data:image/png;base64,${base64}` });
  } catch (err) {
    console.error("Erreur background removal :", err);
    res.status(500).json({ error: "traitement échoué" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HEL bg-server démarré sur le port ${PORT}`));
