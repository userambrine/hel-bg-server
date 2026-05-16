const express = require("express");
const multer  = require("multer");
const cors    = require("cors");
const { removeBackground } = require("@imgly/background-removal-node");

const app    = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 15 * 1024 * 1024 },
});

app.use(cors());

// Modèle "small" : ~100MB RAM vs ~800MB pour le modèle par défaut
// Nécessaire pour tenir dans les 512MB du tier gratuit Render
const BG_CONFIG = {
  model: "small",
  output: { format: "image/png" },
};

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/remove-bg", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "image manquante" });

  try {
    console.log(`Traitement image : ${req.file.size} octets`);
    const blob   = await removeBackground(req.file.buffer, BG_CONFIG);
    const base64 = Buffer.from(await blob.arrayBuffer()).toString("base64");
    console.log("Traitement terminé");
    res.json({ result: `data:image/png;base64,${base64}` });
  } catch (err) {
    console.error("Erreur :", err.message || err);
    res.status(500).json({ error: "traitement échoué" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HEL bg-server démarré sur le port ${PORT}`));
