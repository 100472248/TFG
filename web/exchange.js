const STORAGE = "./dbs"
const GENERAL = STORAGE + "/general_data.json"
let users_online = []


function loadUser(username) {
    if (users_online.includes(username)) {
        let fileInputs = [`${STORAGE}/${username}/${username}_points.json`, `${STORAGE}/${username}/${username}_reviews.json`];
        n = 0;
        for (archivo of fileInputs) {
            archivo.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                const json = JSON.parse(evt.target.result);
                nombre = "";
                if (n == 0){
                    nombre = "points";
                }
                else if (n == 1){
                    nombre = "reviews";
                }
                localStorage.setItem(username + "_" + nombre, JSON.stringify(json));
                alert('Datos actualizados en localStorage');
                 n = n + 1;
                } catch (err) {
                alert('Archivo JSON inválido');
                }
            };
            reader.readAsText(file);
            }
        });
        }
    }

}

function refreshUser(username) {
    const files = [
        { key: `${username}_points`, filename: `${username}_points.json` },
        { key: `${username}_reviews`, filename: `${username}_reviews.json` }
    ];

    files.forEach(file => {
        const data = localStorage.getItem(file.key);
        if (!data) {
            alert(`Error al descargar archivo ${file.filename}`);
            return;
        }
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
    });
}

function registerUser(){}

function loginUser(username) {}

function logoutUser(username) {}

function changeUserData(){}

function makeReview(username, city, category, review, points){}

function deleteReview(username, city, category){}

function updateReview(username, city, category, review, points){}

function updateGeneralData(){}

function loadGeneralData(){}