// Ejemplo de datos de ciudades
    const ciudades = {
      barcelona: { nombre: "Barcelona", descripcion: "Ciudad en España, famosa por su arquitectura." },
      madrid: { nombre: "Madrid", descripcion: "Capital de España." }
      // ...más ciudades
    };

    // Obtener parámetro de la URL
    const params = new URLSearchParams(window.location.search);
    const ciudad = params.get("nombre");

    // Mostrar datos de la ciudad
    if (ciudad && ciudades[ciudad]) {
      document.getElementById("titulo").textContent = ciudades[ciudad].nombre;
      document.getElementById("descripcion").textContent = ciudades[ciudad].descripcion;
    } else {
      document.body.innerHTML = "<h2>Ciudad no encontrada</h2>";
    }