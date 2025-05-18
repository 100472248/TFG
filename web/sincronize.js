const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DBS_FOLDER = path.join(__dirname, 'dbs');

app.use(express.json());
app.use(express.static('public'));

// Ruta: guardar JSON localmente
app.post('/save/:username', (req, res) => {
    const { username } = req.params;
    const { points, reviews } = req.body;

    if (!points || !reviews) return res.status(400).send('Faltan datos');

    const userDir = path.join(DBS_FOLDER, username);
    if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });

    fs.writeFileSync(path.join(userDir, `${username}_points.json`), JSON.stringify(points, null, 2));
    fs.writeFileSync(path.join(userDir, `${username}_reviews.json`), JSON.stringify(reviews, null, 2));

    res.send(`Datos guardados para ${username}`);
});

// Ruta: cargar JSON desde disco
app.get('/load/:username', (req, res) => {
    const { username } = req.params;
    const userDir = path.join(DBS_FOLDER, username);

    try {
        const points = JSON.parse(fs.readFileSync(path.join(userDir, `${username}_points.json`)));
        const reviews = JSON.parse(fs.readFileSync(path.join(userDir, `${username}_reviews.json`)));
        res.json({ points, reviews });
    } catch (e) {
        res.status(404).send('Archivos no encontrados o error de lectura');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

