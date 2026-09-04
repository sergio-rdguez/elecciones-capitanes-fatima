# Elecciones Capitanes ACD Fátima 2026/2027

Web estática (GitHub Pages) para votar al Segundo y Tercer Capitán del equipo.

- El jugador más votado (1º) → **Segundo Capitán**
- El 3º más votado → **Tercer Capitán**
- Sergio Rodríguez Martín ya es el Primer Capitán y no es candidato.
- Cada jugador vota una única vez, eligiendo a 2 compañeros.
- Se registra quién ha votado (control de asistencia), pero no a quién votó.

## Configuración necesaria (una sola vez): Firebase

La web es estática (GitHub Pages no tiene servidor propio), así que los votos se guardan en
**Firebase Firestore** (plan gratuito Spark, sin coste).

1. Ve a https://console.firebase.google.com/ y crea un proyecto nuevo (puedes desactivar Google Analytics, no hace falta).
2. En el menú lateral, entra en **Firestore Database** → **Crear base de datos** → modo **producción** → elige una región (por ejemplo `eur3 (europe-west)`).
3. Ve a la pestaña **Reglas** de Firestore y pega el contenido del fichero [`firestore.rules`](./firestore.rules) de este repo. Publica los cambios.
4. Ve a **Configuración del proyecto** (icono del engranaje) → pestaña **General** → sección "Tus apps" → añade una app **Web** (icono `</>`), ponle un nombre (p. ej. "elecciones-web") y no marques Firebase Hosting.
5. Copia el objeto `firebaseConfig` que te muestra y pégalo en [`assets/firebase-config.js`](./assets/firebase-config.js), sustituyendo los valores `TU_...`.
6. Haz commit y push de `assets/firebase-config.js` (las claves web de Firebase son públicas por diseño; la seguridad real la dan las reglas de Firestore del paso 3).

Con esto, la web ya puede leer y escribir votos compartidos entre todos los que entren a la página.

## Estructura

- `index.html` — portada con las normas de la votación.
- `votar.html` — formulario de voto (selector de votante + 2 candidatos).
- `resultados.html` — ranking de votos en directo y control de asistencia.
- `assets/roster.js` — padrón de los 25 jugadores (nombres y quién es el primer capitán).
- `assets/firebase-config.js` — claves de conexión a tu proyecto Firebase.
- `assets/app.js` — lógica de la votación y de los resultados.
- `firestore.rules` — reglas de seguridad para impedir votos duplicados o manipulados.

## Publicar en GitHub Pages

Si el repositorio se creó con `gh repo create ... --public --source=. --push`, activa Pages con:

```bash
gh api -X POST repos/<usuario>/<repo>/pages -f "source[branch]=main" -f "source[path]=/"
```

La web quedará disponible en `https://<usuario>.github.io/<repo>/`.

## Cómo cambiar/añadir jugadores

Edita el array `ROSTER` en `assets/roster.js` y haz commit + push. Los cambios se reflejan al instante en GitHub Pages.

## Reiniciar la votación (nueva temporada)

Borra todos los documentos de la colección `votes` desde la consola de Firebase (Firestore Database → colección `votes` → seleccionar todo → eliminar).
