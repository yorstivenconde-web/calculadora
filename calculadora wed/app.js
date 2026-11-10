const pantalla = document.getElementById("pantalla");
const historial = document.getElementById("historial");
const valor = document.getElementById("valor");

let numeroActual = "0";
let numeroAnterior = "";
let operador = null;
let empezarNuevo = false;

let audioCtx = null;

/* ---------- AUDIO ---------- */

function iniciarAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function reproducirSonido(frecuencia = 880, tipo = "sine") {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = tipo;
  osc.frequency.value = frecuencia;

  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.12);
}

/* ---------- INTERFAZ ---------- */

function actualizarPantalla() {
  valor.textContent = numeroActual;
  historial.textContent = numeroAnterior && operador
    ? `${numeroAnterior} ${simboloOperador(operador)}`
    : (numeroAnterior || "0");
}

function simboloOperador(op) {
  switch (op) {
    case "/": return "÷";
    case "*": return "x";
    case "-": return "-";
    case "+": return "+";
    case "%": return "%";
    default: return "";
  }
}

function iluminarBoton(id) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.classList.add("activo");
  setTimeout(() => btn.classList.remove("activo"), 120);
}

function mostrarError() {
  pantalla.classList.add("error");
  valor.textContent = "Error";
  setTimeout(() => pantalla.classList.remove("error"), 400);
  setTimeout(() => borrarTodo(), 800);
}

/* ---------- ENTRADA DE NÚMEROS ---------- */

function agregarNumero(digito) {
  if (empezarNuevo) {
    numeroActual = "";
    empezarNuevo = false;
  }
  if (numeroActual === "0") {
    numeroActual = digito;
  } else {
    numeroActual += digito;
  }
  actualizarPantalla();
}

function agregarPunto() {
  if (empezarNuevo) {
    numeroActual = "0";
    empezarNuevo = false;
  }
  if (!numeroActual.includes(".")) {
    numeroActual += ".";
  }
  actualizarPantalla();
}

function borrarTodo() {
  numeroActual = "0";
  numeroAnterior = "";
  operador = null;
  empezarNuevo = false;
  actualizarPantalla();
}

function borrarUltimo() {
  if (empezarNuevo) return;
  if (numeroActual.length > 1) {
    numeroActual = numeroActual.slice(0, -1);
  } else {
    numeroActual = "0";
  }
  actualizarPantalla();
}

function cambiarSigno() {
  if (numeroActual === "0") return;
  numeroActual = numeroActual.startsWith("-")
    ? numeroActual.slice(1)
    : "-" + numeroActual;
  actualizarPantalla();
}

/* ---------- OPERACIONES ---------- */

function agregarOperador(op) {
  if (operador !== null && !empezarNuevo) {
    calcularResultado();
  }
  numeroAnterior = numeroActual;
  operador = op;
  empezarNuevo = true;
  actualizarPantalla();
}

function calcularResultado() {
  if (operador === null || numeroAnterior === "") return;

  const a = parseFloat(numeroAnterior);
  const b = parseFloat(numeroActual);
  let resultado;

  switch (operador) {
    case "+": resultado = a + b; break;
    case "-": resultado = a - b; break;
    case "*": resultado = a * b; break;
    case "/":
      if (b === 0) { mostrarError(); return; }
      resultado = a / b;
      break;
    case "%": resultado = a % b; break;
    default: return;
  }

  resultado = Math.round(resultado * 1e10) / 1e10;

  numeroActual = String(resultado);
  numeroAnterior = "";
  operador = null;
  empezarNuevo = true;
  actualizarPantalla();
}

function raizCuadrada() {
  const n = parseFloat(numeroActual);
  if (n < 0) { mostrarError(); return; }
  numeroActual = String(Math.round(Math.sqrt(n) * 1e10) / 1e10);
  empezarNuevo = true;
  actualizarPantalla();
}

function elevarAlCuadrado() {
  const n = parseFloat(numeroActual);
  numeroActual = String(Math.round(n * n * 1e10) / 1e10);
  empezarNuevo = true;
  actualizarPantalla();
}

function calcularLog() {
  const n = parseFloat(numeroActual);
  if (n <= 0) { mostrarError(); return; }
  numeroActual = String(Math.round(Math.log10(n) * 1e10) / 1e10);
  empezarNuevo = true;
  actualizarPantalla();
}

function animarResultado() {
  pantalla.classList.add("animar");
  setTimeout (function() {
    pantalla.classList.remove("animar");
  }, 300);
}

actualizarPantalla();


document.addEventListener("keydown", (e) => {
  iniciarAudio();
  const tecla = e.key;

  // Números 0-9
  if (tecla >= "0" && tecla <= "9") {
    reproducirSonido(880, "sine");
    agregarNumero(tecla);
    iluminarBoton("btn-" + tecla);
    return;
  }

  switch (tecla) {
    case ".":
    case ",":
      reproducirSonido(880, "sine");
      agregarPunto();
      iluminarBoton("btn-punto");
      break;

    case "+":
      reproducirSonido(880, "sine");
      agregarOperador("+");
      iluminarBoton("btn-suma");
      break;

    case "-":
      reproducirSonido(880, "sine");
      agregarOperador("-");
      iluminarBoton("btn-resta");
      break;

    case "*":
    case "x":
    case "X":
      reproducirSonido(880, "sine");
      agregarOperador("*");
      iluminarBoton("btn-multiplicacion");
      break;

    case "/":
      e.preventDefault();
      reproducirSonido(880, "triangle");
      agregarOperador("/");
      iluminarBoton("btn-division");
      break;

    case "%":
      reproducirSonido(880, "sine");
      agregarOperador("%");
      iluminarBoton("btn-porcentaje");
      break;

    case "Enter":
    case "=":
      e.preventDefault();
      reproducirSonido(1046, "square");
      calcularResultado();
      iluminarBoton("btn-igual");
      break;

    case "Backspace":
      reproducirSonido(660, "sine");
      borrarUltimo();
      iluminarBoton("btn-borrar");
      break;

    case "Escape":
    case "Delete":
      reproducirSonido(440, "sawtooth");
      borrarTodo();
      iluminarBoton("btn-ac");
      break;

    case "r":
    case "R":
      reproducirSonido(880, "sine");
      raizCuadrada();
      iluminarBoton("btn-raiz");
      break;

    case "q":
    case "Q":
      reproducirSonido(880, "sine");
      elevarAlCuadrado();
      iluminarBoton("btn-cuadrado");
      break;

    case "l":
    case "L":
      reproducirSonido(880, "sine");
      calcularLog();
      iluminarBoton("btn-log");
      break;

    case "n":
    case "N":
      reproducirSonido(880, "sine");
      cambiarSigno();
      iluminarBoton("btn-signo");
      break;

    default:
      break;
  }
});

actualizarPantalla();