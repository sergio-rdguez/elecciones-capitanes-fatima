// Padrón de jugadores ACD Fátima — temporada 2026/2027
// primerCapitan: true => ya es capitán, se muestra en la web pero no es votable como candidato.
const ROSTER = [
  { name: "Pedro Perez Llorente" },
  { name: "Jorge Gutierrez Valdés" },
  { name: "Daniel Moreno Llaguno" },
  { name: "Sergio Rodríguez Martín", primerCapitan: true },
  { name: "Alejandro Cintas" },
  { name: "Felix Mateos Palma" },
  { name: "Alejandro Jimenez Martinez" },
  { name: "Alejandro Arribas Lombana" },
  { name: "Antonio Arribas Lombana" },
  { name: "Javier Torres García" },
  { name: "Rubén Alcón Miño" },
  { name: "Alvaro Jose Elías Rubio" },
  { name: "Sergio Castro Conejo" },
  { name: "Daniel Martín Claudio" },
  { name: "Sergio Vinagre Martinez" },
  { name: "Alejandro Urraco Nieto" },
  { name: "Alvaro Fuentes Ferrer" },
  { name: "Alvaro Gallardo Nuñez" },
  { name: "Ismael Valcarcel Pacios" },
  { name: "Javier Revuelta Ramirez" },
  { name: "Alberto Franco García" },
  { name: "Sergio Hervas Vázquez" },
  { name: "Mario Rivero Herrador" },
  { name: "Javier Andrés Mirallés" },
  { name: "Jose Luis Martin Jimenez" },
];

function slugify(name) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const VOTANTES = ROSTER.map((p) => ({ ...p, id: slugify(p.name) }));
const CANDIDATOS = VOTANTES.filter((p) => !p.primerCapitan);
const PRIMER_CAPITAN = VOTANTES.find((p) => p.primerCapitan);
