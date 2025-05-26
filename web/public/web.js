
const ventanaID = Date.now() + "_" + Math.random().toString(36).slice(2);
let timeoutVerificacion = null;


window.addEventListener('load', () => {
  let abiertas = JSON.parse(localStorage.getItem('pestanas_abiertas') || '[]');
  abiertas.push(ventanaID);
  localStorage.setItem('pestanas_abiertas', JSON.stringify(abiertas));
  notificarCambio();
  if (window.location.pathname == "/index.html"){
    LoopIndex();
}
});

window.addEventListener('beforeunload', () => {
  let abiertas = JSON.parse(localStorage.getItem('pestanas_abiertas') || '[]');
  abiertas = abiertas.filter(id => id !== ventanaID);
  localStorage.setItem('pestanas_abiertas', JSON.stringify(abiertas));
  notificarCambio();
});

window.addEventListener('storage', () => {
  notificarCambio();
});

function notificarCambio() {
  const abiertas = JSON.parse(localStorage.getItem('pestanas_abiertas') || '[]');
  console.log(`🪟 Pestañas detectadas: ${abiertas.length}`);

  if (timeoutVerificacion) clearTimeout(timeoutVerificacion);

  // Esperamos 500 ms antes de confirmar si no queda ninguna
  timeoutVerificacion = setTimeout(() => {
    const recheck = JSON.parse(localStorage.getItem('pestanas_abiertas') || '[]');
    if (recheck.length === 0) {
      console.log("🔥 ¡Confirmado! Ya no hay ninguna pestaña abierta.");
      logoutUsuario();
    }
  }, 500); // Puedes ajustar este tiempo según lo sensible que quieras
}


function openSesion(usuario) {
  localStorage.setItem("Online", usuario);
  console.log(`Sesión abierta para ${usuario}`);
  window.location.href = "index.html";
}

function logoutUsuario() {
  if (localStorage.getItem("Online") == "") {
    console.log("No hay sesión abierta");
  }
  else {localStorage.setItem("Online", "");
    console.log("Sesión cerrada");
    window.location.href = "register.html"; // Redirigir a login
  }
}

function showLogin() {
    document.getElementById("login-form").style.display = "block";
    document.getElementById("register-form").style.display = "none";
    document.getElementById("show-login").style.backgroundColor = "yellow";
    document.getElementById("show-register").style.backgroundColor = "white";
}
function showRegister() {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("register-form").style.display = "block";
        document.getElementById("show-login").style.backgroundColor = "white";
    document.getElementById("show-register").style.backgroundColor = "yellow";
}

function LoopIndex(){
  const medias = JSON.parse(localStorage.getItem("general_data") || "{}");
  for( const ciudad in medias) {
    showTotal(ciudad, medias[ciudad]);
  }
}

function showTotal(ciudad, nota){
  let variable = "id-" + ciudad;
  let elemento = document.getElementById(variable);

  if (!nota || typeof nota.total !== "number" || isNaN(nota.total)) {
    elemento.innerHTML = "NOT ENOUGH DATA";
  }

  elemento.innerHTML = nota["total"];
}

// general_data desde backend
fetch("/api/general_data")
  .then(r => r.json())
  .then(data => localStorage.setItem("general_data", JSON.stringify(data)));


fetch("/api/gepeto_reviews")
  .then(res => res.json())
  .then(data => {
    localStorage.setItem("Gepeto_reviews", JSON.stringify(data));
  });

