async function guardarEnServidor() {
    const username = document.getElementById('username').value.trim();
    if (!username) return alert('Introduce un nombre de usuario');

    const points = localStorage.getItem(`${username}_points`);
    const reviews = localStorage.getItem(`${username}_reviews`);

    if (!points || !reviews) return alert('Faltan datos en localStorage');

    const body = {
        points: JSON.parse(points),
        reviews: JSON.parse(reviews)
    };

    const res = await fetch(`/save/${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    alert(await res.text());
}

async function cargarDesdeServidor() {
    const username = document.getElementById('username').value.trim();
    if (!username) return alert('Introduce un nombre de usuario');

    const res = await fetch(`/load/${username}`);
    if (!res.ok) return alert('No se pudo cargar del servidor');

    const data = await res.json();
    localStorage.setItem(`${username}_points`, JSON.stringify(data.points));
    localStorage.setItem(`${username}_reviews`, JSON.stringify(data.reviews));
    alert('Datos cargados en localStorage');
}

function subirDesdeArchivos() {
    const username = document.getElementById('username').value.trim();
    const input = document.getElementById('fileInput');
    const files = input.files;

    if (!username || files.length < 2) return alert('Selecciona usuario y dos archivos');

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
            const data = JSON.parse(reader.result);
            if (file.name.includes('points')) {
                localStorage.setItem(`${username}_points`, JSON.stringify(data));
            } else if (file.name.includes('reviews')) {
                localStorage.setItem(`${username}_reviews`, JSON.stringify(data));
            }
        };
        reader.readAsText(file);
    });

    alert('Archivos subidos a localStorage');
}
