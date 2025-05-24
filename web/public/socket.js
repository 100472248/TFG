let usuarioActual = localStorage.getItem("Online"); // Puedes asignar dinámicamente desde un input o login

window.onload = function() {
if (usuarioActual === "") {
    document.getElementById("login-button").style.display = "block";
    document.getElementById("logout-button").style.display = "none";
}
else{   
    document.getElementById("login-button").style.display = "none";
    document.getElementById("logout-button").style.display = "block";}
document.getElementById("username").innerHTML= usuarioActual;
}
async function guardarEnServidor() {
    if (!usuarioActual) {
        alert('usuarioActual no definido');
        window.location.href = "register.html"; // Redirigir a login si no hay usuario
        return;
    }

    const points = localStorage.getItem(`${usuarioActual}_points`);
    const reviews = localStorage.getItem(`${usuarioActual}_reviews`);

    if (!points || !reviews) return alert('Faltan datos en localStorage');

    const body = {
        points: JSON.parse(points),
        reviews: JSON.parse(reviews)
    };

    const res = await fetch(`/save/${usuarioActual}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const msg = await res.text();
    console.log(msg);
}

async function cargarDesdeServidor() {
    if (!usuarioActual) {
        alert('usuarioActual no definido');
        window.location.href = "register.html"; // Redirigir a login si no hay usuario
        return;
    }

    const res = await fetch(`/load/${usuarioActual}`);
    if (!res.ok) return alert('No se pudo cargar del servidor');

    const data = await res.json();
    localStorage.setItem(`${usuarioActual}_points`, JSON.stringify(data.points));
    localStorage.setItem(`${usuarioActual}_reviews`, JSON.stringify(data.reviews));

    console.log(`Datos cargados en localStorage para ${usuarioActual}`);
}

// Se le pasan los archivos como FileList desde un input file
function subirDesdeArchivos(files) {
    if (!usuarioActual) {
        alert('usuarioActual no definido');
        window.location.href = "register.html"; // Redirigir a login si no hay usuario
        return;
    }
    if (files.length < 2) {
        alert('Falta usuarioActual o archivos insuficientes');
        return;
    }

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
            const data = JSON.parse(reader.result);
            if (file.name.includes('points')) {
                localStorage.setItem(`${usuarioActual}_points`, JSON.stringify(data));
                console.log('Cargado points desde archivo');
            } else if (file.name.includes('reviews')) {
                localStorage.setItem(`${usuarioActual}_reviews`, JSON.stringify(data));
                console.log('Cargado reviews desde archivo');
            }
        };
        reader.readAsText(file);
    });
}

async function registrarUsuario(profile) {
    const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
    });

    const msg = await res.text();
    console.log(msg);
    openSesion(profile.username);
}

async function loginUsuario(profile) {
    usuario = profile.username
    password = profile.password
    const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({username, password })
    });

    const data = await res.json();
    openSesion(profile.username);

    if (data.success) {
        // Guarda el usuario actual en memoria o en sessionStorage/localStorage (si quieres)
        usuarioActual = data.username;
        console.log(`Login correcto: ${usuarioActual}`);
        return true;
    } else {
        console.log(`Login fallido: ${data.message}`);
        return false;
    }
}