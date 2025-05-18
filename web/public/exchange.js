const STORAGE = "./dbs"
const GENERAL = STORAGE + "/general_data.json"
let users_online = []

function registerUser(){
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value;
    const ciudad = document.getElementById("ciudad").value;
    let data = {
        "username": username,
        "password": password,
        "email": email,
        "ciudad": ciudad
    }
    if (username && password && email) {
        // Aquí puedes agregar la lógica para registrar al usuario
        alert(`Usuario ${username} registrado con éxito.`);
        let direccion = `${STORAGE}/${username}/${username}_profile.json`;
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = file.filename;
        document.body.appendChild(a);
        a.click(); // Dispara la descarga automática
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } else {
        alert("Por favor, completa todos los campos.");
    }
}

function loginUser(username) {}

function logoutUser(username) {}

function changeUserData(){}

function makeReview(username, city, category, review, points){}

function deleteReview(username, city, category){}

function updateReview(username, city, category, review, points){}

function updateGeneralData(){}

function loadGeneralData(){}