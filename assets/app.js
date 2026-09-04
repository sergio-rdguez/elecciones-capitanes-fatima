import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app);
const VOTES_COLLECTION = "votes";

function iniciales(nombre) {
  const partes = nombre.trim().split(/\s+/);
  const a = partes[0]?.[0] || "";
  const b = partes[1]?.[0] || "";
  return (a + b).toUpperCase();
}

function mostrarMensaje(el, texto, tipo) {
  el.textContent = texto;
  el.className = `mensaje visible ${tipo}`;
}

function ocultarMensaje(el) {
  el.className = "mensaje";
}

// ---------- Página votar.html ----------
function initVotar() {
  const selectorVotante = document.getElementById("selector-votante");
  const bloqueCandidatos = document.getElementById("bloque-candidatos");
  const listaCandidatos = document.getElementById("lista-candidatos");
  const contador = document.getElementById("contador-seleccion");
  const btnVotar = document.getElementById("btn-votar");
  const mensaje = document.getElementById("mensaje-votar");

  selectorVotante.innerHTML =
    '<option value="">-- Selecciona tu nombre --</option>' +
    VOTANTES.map((v) => `<option value="${v.id}">${v.name}</option>`).join("");

  listaCandidatos.innerHTML = CANDIDATOS.map(
    (c) => `
      <label class="candidato-opcion" data-id="${c.id}">
        <input type="checkbox" value="${c.id}" name="candidato" />
        <span class="avatar">${iniciales(c.name)}</span>
        <span class="candidato-nombre">${c.name}</span>
      </label>`
  ).join("");

  const checkboxes = () =>
    Array.from(listaCandidatos.querySelectorAll('input[type="checkbox"]'));

  function actualizarSeleccion() {
    const marcados = checkboxes().filter((c) => c.checked);
    contador.textContent = `${marcados.length} / 2 seleccionados`;
    checkboxes().forEach((c) => {
      c.disabled = marcados.length >= 2 && !c.checked;
    });
    btnVotar.disabled = marcados.length !== 2 || !selectorVotante.value;
  }

  listaCandidatos.addEventListener("change", actualizarSeleccion);

  selectorVotante.addEventListener("change", async () => {
    ocultarMensaje(mensaje);
    const voterId = selectorVotante.value;
    if (!voterId) {
      bloqueCandidatos.style.display = "none";
      return;
    }
    const ref = doc(db, VOTES_COLLECTION, voterId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      bloqueCandidatos.style.display = "none";
      mostrarMensaje(
        mensaje,
        "Ya has emitido tu voto anteriormente. Solo se permite un voto por jugador.",
        "info"
      );
      return;
    }
    bloqueCandidatos.style.display = "block";
    checkboxes().forEach((c) => (c.checked = false));
    actualizarSeleccion();
  });

  btnVotar.addEventListener("click", async () => {
    const voterId = selectorVotante.value;
    const voterName = VOTANTES.find((v) => v.id === voterId)?.name;
    const marcados = checkboxes()
      .filter((c) => c.checked)
      .map((c) => c.value);

    if (!voterId || marcados.length !== 2) return;

    btnVotar.disabled = true;
    btnVotar.textContent = "Enviando...";

    try {
      const ref = doc(db, VOTES_COLLECTION, voterId);
      await setDoc(ref, {
        voterName,
        candidates: marcados.map(
          (id) => CANDIDATOS.find((c) => c.id === id).name
        ),
        timestamp: serverTimestamp(),
      });
      bloqueCandidatos.style.display = "none";
      selectorVotante.disabled = true;
      mostrarMensaje(
        mensaje,
        "¡Voto registrado correctamente! Gracias por participar.",
        "ok"
      );
    } catch (err) {
      console.error(err);
      btnVotar.disabled = false;
      btnVotar.textContent = "Enviar voto";
      mostrarMensaje(
        mensaje,
        "No se ha podido registrar tu voto (puede que ya conste como emitido). Recarga la página e inténtalo de nuevo.",
        "error"
      );
    }
  });
}

// ---------- Página resultados.html ----------
function initResultados() {
  const cuerpoRanking = document.getElementById("cuerpo-ranking");
  const listaAsistencia = document.getElementById("lista-asistencia");
  const progreso = document.getElementById("progreso-votos");
  const barraProgreso = document.getElementById("barra-progreso-votos");
  const avisoSinVotos = document.getElementById("aviso-sin-votos");

  onSnapshot(collection(db, VOTES_COLLECTION), (snapshot) => {
    const votosPorCandidato = {};
    CANDIDATOS.forEach((c) => (votosPorCandidato[c.name] = 0));

    const votantesQueVotaron = new Set();
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      votantesQueVotaron.add(docSnap.id);
      (data.candidates || []).forEach((nombre) => {
        if (nombre in votosPorCandidato) votosPorCandidato[nombre]++;
      });
    });

    const ranking = Object.entries(votosPorCandidato).sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
    );

    const maxVotos = ranking.length ? ranking[0][1] : 0;
    avisoSinVotos.style.display = maxVotos === 0 ? "block" : "none";

    cuerpoRanking.innerHTML = ranking
      .map(([nombre, votos], i) => {
        const puesto = i + 1;
        // Las etiquetas de capitán solo cuentan cuando hay votos reales:
        // con 0 votos para todos, el orden es alfabético y no debe leerse como un resultado.
        let claseFila = "";
        let etiqueta = "";
        if (votos > 0 && puesto === 1) {
          claseFila = "puesto-1";
          etiqueta = '<span class="medalla-fila">🥈</span>Segundo Capitán';
        } else if (votos > 0 && puesto === 2) {
          claseFila = "puesto-2";
          etiqueta = '<span class="medalla-fila">🥉</span>Tercer Capitán';
        }
        const ancho = maxVotos ? Math.round((votos / maxVotos) * 100) : 0;
        return `
          <div class="ranking-row ${claseFila}">
            <div class="ranking-rank">${puesto}</div>
            <div class="avatar">${iniciales(nombre)}</div>
            <div class="ranking-info">
              <div class="ranking-nombre">${nombre}</div>
              ${etiqueta ? `<div class="ranking-etiqueta">${etiqueta}</div>` : ""}
            </div>
            <div class="ranking-votos">
              <div class="ranking-votos-num">${votos}</div>
              <div class="barra-votos-track">
                <div class="barra-votos-fill" style="width:${ancho}%"></div>
              </div>
            </div>
          </div>`;
      })
      .join("");

    const totalVotantes = VOTANTES.length;
    const pct = Math.round((votantesQueVotaron.size / totalVotantes) * 100);
    progreso.textContent = `${votantesQueVotaron.size} / ${totalVotantes} jugadores han votado`;
    if (barraProgreso) barraProgreso.style.width = `${pct}%`;

    listaAsistencia.innerHTML = VOTANTES.map((v) => {
        const votado = votantesQueVotaron.has(v.id);
        return `<div class="asistencia-item ${votado ? "votado" : "pendiente"}">
          ${votado ? "✅" : "⬜"} ${v.name}
        </div>`;
      })
      .join("");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page === "votar") initVotar();
  if (document.body.dataset.page === "resultados") initResultados();
});
