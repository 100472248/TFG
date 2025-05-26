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

  // Descripción "larga" sin los campos que NO quieres
  const excluir = ["País", "Comunidad autónoma", "Provincia", "Número de habitantes"];
  const partesDescripcion = Object.entries(descripcion)
    .filter(([clave]) => !excluir.includes(clave))
    .map(([clave, valor]) => valor);

  const descripcionLarga = partesDescripcion.join(" ");

  // Descripción breve para datos clave
  const datosClave = Object.entries(descripcion)
    .filter(([clave]) => excluir.includes(clave))
    .map(([clave, valor]) => `<p><strong>${clave}:</strong> ${valor}</p>`)
    .join("");

  const notasFiltradas = Object.entries(nota)
    .filter(([k, v]) =>
      k !== "total" &&
      !excluir.includes(k) &&
      typeof v === "number" && !isNaN(v)
    );

  const bloqueNotas = notasFiltradas
    .map(([k, v]) => `<li><strong>${k}:</strong> ${v.toFixed(2)}</li>`)
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

  return seccion;
}
