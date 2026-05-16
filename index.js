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

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/remove-bg", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "image manquante" });

  try {
    // Créer le Blob avec le bon type MIME — sinon la librairie ne reconnaît pas le format
    const blob   = new Blob([req.file.buffer], { type: req.file.mimetype || "image/jpeg" });
    const result = await removeBackground(blob, { output: { format: "image/png" } });
    const base64 = Buffer.from(await result.arrayBuffer()).toString("base64");
    res.json({ result: `data:image/png;base64,${base64}` });
  } catch (err) {
    console.error("Erreur :", err.message || err);
    res.status(500).json({ error: "traitement échoué" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HEL bg-server démarré sur le port ${PORT}`));
