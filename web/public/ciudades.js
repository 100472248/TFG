window.addEventListener("DOMContentLoaded", () => {

  const ciudad = new URLSearchParams(window.location.search).get("ciudad");
  const contenedor = document.getElementById("contenedor-ciudad");

  if (!ciudad || !contenedor) return;


  const descripciones = JSON.parse(localStorage.getItem("Gepeto_reviews") || "{}");
  const medias = JSON.parse(localStorage.getItem("general_data") || "{}");

  console.log(medias[ciudad]);

  const desc = descripciones[ciudad];
  const nota = medias[ciudad];

  if (!desc || !nota) {
    contenedor.innerHTML = `<p>No hay datos para la ciudad: ${ciudad}</p>`;
    return;
  }

  contenedor.appendChild(renderCiudad(ciudad, desc, nota));
});

function renderCiudad(nombre, descripcion, nota) {
  const seccion = document.createElement("section");
  const excluir = ["País", "Comunidad autónoma", "Provincia", "Número de habitantes"];

  // Bloque de datos clave
  const datosClave = Object.entries(descripcion)
    .filter(([clave]) => excluir.includes(clave))
    .map(([clave, valor]) => `<p><strong>${clave}:</strong> ${valor}</p>`)
    .join("");

  // Descripción larga
  const partesDescripcion = Object.entries(descripcion)
    .filter(([clave]) => !excluir.includes(clave))
    .map(([clave, valor]) => valor);

  const descripcionLarga = partesDescripcion.join(" ");

  // Sistema de calificación y comentarios
  const notasFiltradas = Object.entries(nota)
    .filter(([k, v]) =>
      k !== "total" &&
      !excluir.includes(k) &&
      typeof v === "number" && !isNaN(v)
    );

  const bloqueNotas = notasFiltradas
    .map(([k, v]) => `
      <li>
        <strong>${k}:</strong> ${v.toFixed(2)}
        <button class="ver-comentarios-btn" data-categoria="${k}">💬 Ver comentarios</button>
        <div class="comentarios-panel" id="comentarios-${k}" style="display:none; margin-top:8px;"></div>
      </li>
    `)
    .join("");

  const total = (typeof nota.total === "number" && !isNaN(nota.total))
    ? `<p><strong>Nota total:</strong> ${nota.total.toFixed(2)}</p>`
    : `<p><strong>Nota total:</strong> No disponible</p>`;

  seccion.innerHTML = `
    <h2>${nombre}</h2>
    <h3>Datos clave</h3>
    ${datosClave}
    <h3>Descripción general</h3>
    <p>${descripcionLarga}</p>
    <h3>Notas medias por categoría</h3>
    <ul>${bloqueNotas}</ul>
    ${total}
  `;

  // Listeners para comentarios (como antes)
  setTimeout(() => {
    seccion.querySelectorAll(".ver-comentarios-btn").forEach(btn => {
      btn.addEventListener("click", async function() {
        const categoria = btn.getAttribute("data-categoria");
        const panel = document.getElementById(`comentarios-${categoria}`);
        if (panel.style.display === "none") {
          const resp = await fetch(`/api/comentarios/${encodeURIComponent(nombre)}/${encodeURIComponent(categoria)}`);
          let comentarios = await resp.json();
          if (comentarios.length > 3) {
            comentarios = comentarios.sort(() => 0.5 - Math.random()).slice(0, 3);
          }
          panel.innerHTML = comentarios.length
            ? comentarios.map(c => `<div class="comentario"><b>${c.usuario}:</b> ${c.comentario}</div>`).join("")
            : `<div class="comentario">No hay comentarios aún para esta categoría.</div>`;
          panel.style.display = "block";
          btn.textContent = "❌ Ocultar comentarios";
        } else {
          panel.style.display = "none";
          btn.textContent = "💬 Ver comentarios";
        }
      });
    });
  }, 0);

  return seccion;
}


