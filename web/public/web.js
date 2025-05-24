
const ventanaID = Date.now() + "_" + Math.random().toString(36).slice(2);
let timeoutVerificacion = null;

window.addEventListener('load', () => {
  let abiertas = JSON.parse(localStorage.getItem('pestanas_abiertas') || '[]');
  abiertas.push(ventanaID);
  localStorage.setItem('pestanas_abiertas', JSON.stringify(abiertas));
  notificarCambio();
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