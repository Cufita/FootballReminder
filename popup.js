const apiUrl = "https://api-football-v1.p.rapidapi.com/v3/timezone";
const apiKey = "8a222fbd64msh2971d22cb3bd301p111d86jsnd32865f0f6ab";

const equipoSelect = document.getElementById("equipo");
const partidoDiv = document.getElementById("partido");

// Obtener los equipos argentinos de la API
fetch(apiUrl + "competitions/SA/teams", {
  headers: { "X-Auth-Token": apiKey },
})
  .then((response) => response.json())
  .then((data) => {
    const equipos = data.teams.filter((equipo) =>
      equipo.area.name.includes("Argentina")
    );

    equipos.forEach((equipo) => {
      const option = document.createElement("option");
      option.value = equipo.id;
      option.text = equipo.name;
      equipoSelect.appendChild(option);
    });
  });

// Mostrar información sobre el próximo partido del equipo elegido
equipoSelect.addEventListener("change", () => {
  const equipoId = equipoSelect.value;
  if (equipoId) {
    fetch(apiUrl + `teams/${equipoId}/matches`, {
      headers: { "X-Auth-Token": apiKey },
    })
      .then((response) => response.json())
      .then((data) => {
        const partido = data.matches.find(
          (match) =>
            (match.homeTeam.id == equipoId || match.awayTeam.id == equipoId) &&
            match.status == "SCHEDULED"
        );

        if (partido) {
          const fecha = new Date(partido.utcDate);
          const fechaString = `${fecha.getDate()}/${
            fecha.getMonth() + 1
          }/${fecha.getFullYear()}`;
          const horaString = `${fecha.getHours()}:${fecha.getMinutes()}`;
          partidoDiv.textContent = `El próximo partido del ${partido.homeTeam.name} es el ${fechaString} a las ${horaString} (hora local).`;
        } else {
          partidoDiv.textContent = "No se encontraron partidos próximos.";
        }
      })
      .catch((error) => {
        console.error("Error al buscar los partidos:", error);
        partidoDiv.textContent =
          "Ocurrió un error al buscar los partidos. Por favor, inténtalo nuevamente más tarde.";
      });
  }
});

// Mostrar el tiempo y el marcador del partido en vivo
function mostrarPartido(partido) {
  const minutos = partido.minutes;
  const marcador = `${partido.homeTeam.name} ${partido.score.fullTime.homeTeam} - ${partido.score.fullTime.awayTeam} ${partido.awayTeam.name}`;
  partidoDiv.textContent = `En vivo: ${marcador}. Minuto ${minutos}.`;
}

// Actualizar el partido en vivo cada minuto
setInterval(() => {
  const equipoId = equipoSelect.value;
  if (equipoId) {
    fetch(apiUrl + `teams/${equipoId}/matches?status=LIVE`, {
      headers: { "X-Auth-Token": apiKey },
    })
      .then((response) => response.json())
      .then((data) => {
        const partido = data.matches.find(
          (match) =>
            match.homeTeam.id == equipoId || match.awayTeam.id == equipoId
        );

        if (partido) {
          mostrarPartido(partido);
        }
      })
      .catch((error) => {
        console.error("Error al buscar el partido en vivo:", error);
        partidoDiv.textContent =
          "Ocurrió un error al buscar el partido en vivo. Por favor, inténtalo nuevamente más tarde.";
      });
  }
}, 60000); // actualizar cada 1 minuto
