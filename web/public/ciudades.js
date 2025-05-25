window.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("contenedor-ciudad");

  // 1. Obtener nombre de ciudad desde la URL
  const params = new URLSearchParams(window.location.search);
  const ciudad = params.get("ciudad");

  if (!ciudad) {
    contenedor.innerHTML = "<p>⚠️ No se ha especificado ninguna ciudad.</p>";
    return;
  }

  // 2. Obtener las reviews desde localStorage
  const dataRaw = localStorage.getItem("Gepeto_reviews");
  if (!dataRaw) {
    contenedor.innerHTML = "<p>❌ No hay datos cargados de ciudades.</p>";
    return;
  }

  const reviews = JSON.parse(dataRaw);
  const datosCiudad = reviews[ciudad];

  if (!datosCiudad) {
    contenedor.innerHTML = `<p>❌ No se encontraron datos para la ciudad: ${ciudad}</p>`;
    return;
  }

  // 3. Mostrar los datos de la ciudad
  const seccion = document.createElement("section");
  seccion.classList.add("ciudad");

  const titulo = `<h2>${ciudad}</h2>`;
  const descripcion = Object.entries(datosCiudad)
    .map(([clave, valor]) => `<p><strong>${clave}:</strong> ${valor}</p>`)
    .join("");

  seccion.innerHTML = `${titulo}${descripcion}`;
  contenedor.appendChild(seccion);
});


fetch("Gepeto_reviews.json")
  .then(res => res.json())
  .then(data => {
    localStorage.setItem("data_paginas", JSON.stringify(data));
  });