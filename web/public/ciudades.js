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
  const excluir = ["País", "Comunidad autónoma", "Provincia", "Número de habitantes", "total"];

  // Datos clave y descripción larga
  const datosClave = Object.entries(descripcion)
    .filter(([clave]) => excluir.includes(clave))
    .map(([clave, valor]) => `<p><strong>${clave}:</strong> ${valor}</p>`)
    .join("");
  const descripcionLarga = Object.entries(descripcion)
    .filter(([clave]) => !excluir.includes(clave))
    .map(([clave, valor]) => valor).join(" ");

  const usuario = localStorage.getItem("Online");
  const points = JSON.parse(localStorage.getItem(`${usuario}_points`) || "{}");
  let userCityPoints = points[nombre] || {};
  let userMedia = userCityPoints.total;
  if (userMedia === undefined) {
    const categoriasUsuario = Object.entries(userCityPoints)
    .filter(([k, v]) => typeof v === "number" && !isNaN(v) && k !== "total");
    if (categoriasUsuario.length > 0) {
      const suma = categoriasUsuario.reduce((acc, [, v]) => acc + v, 0);
      userMedia = Number((suma / categoriasUsuario.length).toFixed(2));
    }
}
const userMediaHTML = (userMedia !== undefined && userMedia !== null)
  ? `<p id="user-media"><strong>Tu nota media:</strong> ${userMedia.toFixed(2)}</p>`
  : "";

  // Sistema de calificación y comentarios (editable)
  const reviews = JSON.parse(localStorage.getItem(`${usuario}_reviews`) || "{}");
  let userCityReviews = reviews[nombre] || {};

  const notasFiltradas = Object.entries(nota)
    .filter(([k, v]) =>
      !excluir.includes(k) &&
      typeof v === "number" && !isNaN(v)
    );

  const bloqueNotas = notasFiltradas
    .map(([k, v]) => {
      const userValor = userCityPoints[k] ?? "";
      const userReview = userCityReviews[k] ?? "";
      let options = "";
      for (let i = 0; i <= 10; i++) {
        let val = i / 2;
        options += `<option value="${val}" ${userValor == val ? "selected" : ""}>${val}</option>`;
      }
      return `
        <li>
          <strong>${k}:</strong> Media: ${v.toFixed(2)}
          <div style="margin-top:6px;">
            <label>Pon tu nota (0-5):</label>
            <select data-categoria="${k}" class="nota-selector">
              <option value="">Sin nota</option>
              ${options}
            </select>
            <br>
            <label>Review:</label>
            <input type="text" data-categoria="${k}" class="review-input" value="${userReview.replace(/"/g, "&quot;")}" style="width:60%">
            <button type="button" class="ver-comentarios-btn" data-categoria="${k}"> Comentarios </button>
            <div class="comentarios-panel" id="comentarios-${k}" style="display:none; margin-top:8px;"></div>
          </div>
        </li>
      `;
    })
    .join("");

  const total = (typeof nota.total === "number" && !isNaN(nota.total))
    ? `<p><strong>Nota total:</strong> ${nota.total.toFixed(2)}</p>`
    : `<p><strong>Nota total:</strong> No disponible</p>`;

seccion.innerHTML = `
    <h2>${nombre}</h2>
    ${userMediaHTML}
    <h3>Datos clave</h3>
    ${datosClave}
    <h3>Descripción general</h3>
    <p>${descripcionLarga}</p>
    <h3>Notas medias por categoría</h3>
    <form id="valoracion-form">
      <ul>${bloqueNotas}</ul>
      <button type="submit">Guardar datos</button>
    </form>
    ${total}
    <div id="msg-valoracion"></div>
  `;

  // Guardar valoraciones del usuario
  seccion.querySelector("#valoracion-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const nuevosPuntos = {};
    const nuevasReviews = {};

    seccion.querySelectorAll(".nota-selector").forEach(sel => {
      const cat = sel.getAttribute("data-categoria");
      const val = sel.value;
      if (val !== "") nuevosPuntos[cat] = Number(val);
    });
    seccion.querySelectorAll(".review-input").forEach(inp => {
      const cat = inp.getAttribute("data-categoria");
      const txt = inp.value.trim();
      if (txt) nuevasReviews[cat] = txt;
    });

    // 👉 Calcula y guarda la nota total del usuario para esta ciudad
    const categoriasUsuario = Object.entries(nuevosPuntos)
      .filter(([k, v]) => typeof v === "number" && !isNaN(v));
    if (categoriasUsuario.length > 0) {
      const suma = categoriasUsuario.reduce((acc, [, v]) => acc + v, 0);
      nuevosPuntos["total"] = Number((suma / categoriasUsuario.length).toFixed(2));
    } else {
      delete nuevosPuntos["total"];
    }

    // Actualiza localStorage
    const allPoints = JSON.parse(localStorage.getItem(`${usuario}_points`) || "{}");
    allPoints[nombre] = nuevosPuntos;
    localStorage.setItem(`${usuario}_points`, JSON.stringify(allPoints));

    const allReviews = JSON.parse(localStorage.getItem(`${usuario}_reviews`) || "{}");
    allReviews[nombre] = nuevasReviews;
    localStorage.setItem(`${usuario}_reviews`, JSON.stringify(allReviews));

    // Enviar al backend
    await fetch(`/save/${usuario}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points: allPoints, reviews: allReviews })
    });

    // Actualiza general_data (en local y en backend)
  // Espera un poco antes de pedir el recálculo de medias
  setTimeout(() => {
    fetch("/api/general_data")
      .then(res => res.json())
      .then(data => {
        localStorage.setItem("general_data", JSON.stringify(data));
        seccion.querySelector("#msg-valoracion").innerHTML = "<span style='color:green'>¡Guardado y medias recalculadas!</span>";
      });
  }, 500); // medio segundo

    seccion.querySelector("#msg-valoracion").innerHTML = "<span style='color:green'>¡Guardado y recalculado!</span>";

    if (nuevosPuntos["total"] !== undefined) {
  let mediaElem = seccion.querySelector("#user-media");
  const nuevaHTML = `<p id="user-media"><strong>Tu nota media:</strong> ${nuevosPuntos["total"].toFixed(2)}</p>`;
  if (mediaElem) {
    mediaElem.outerHTML = nuevaHTML;
  } else {
    seccion.insertAdjacentHTML('afterbegin', nuevaHTML);
  }
}
  });

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



