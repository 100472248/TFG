const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DBS_FOLDER = path.join(__dirname, 'dbs');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


// Ruta: guardar JSON localmente
app.post('/save/:username', (req, res) => {
    const { username } = req.params;
    const { points, reviews } = req.body;

    if (points === undefined || reviews === undefined) {
    return res.status(400).json({ success: false, message: 'Faltan datos points o reviews' });
}

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

app.post('/register', (req, res) => {
    const { username, password, email, ciudad } = req.body;

    if (!username || !password || !email || !ciudad) {
        return res.status(400).send('Faltan datos del perfil');
    }

    const userDir = path.join(DBS_FOLDER, username);
    if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });

    const profilePath = path.join(userDir, `${username}_profile.json`);

    if (fs.existsSync(profilePath)) {
        return res.status(409).send('El usuario ya existe');
    }

    // Crear profile.json
    const profile = { username, password, email, ciudad };
    fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2), 'utf-8');

    // Crear points.json
    const pointsPath = path.join(userDir, `${username}_points.json`);
    fs.writeFileSync(pointsPath, JSON.stringify({ puntos: 0 }, null, 2), 'utf-8');

    // Crear reviews.json
    const reviewsPath = path.join(userDir, `${username}_reviews.json`);
    fs.writeFileSync(reviewsPath, JSON.stringify([], null, 2), 'utf-8');

    res.send('Usuario registrado correctamente con archivos iniciales');
});


app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === undefined || password === undefined) {
        return res.status(400).json({ success: false, message: 'Faltan datos en la petición' });
    }

    const profilePath = path.join(DBS_FOLDER, username, `${username}_profile.json`);
    if (!fs.existsSync(profilePath)) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const profile = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));

    if (profile.password === password) {
        res.json({ success: true, username: profile.username });
    } else {
        res.json({ success: false, message: 'Contraseña incorrecta' });
    }
});


app.get('/favicon.ico', (req, res) => res.status(204).end());
