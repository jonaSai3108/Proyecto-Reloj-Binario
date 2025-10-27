// funcion fetchTime se encarga de obtener la hora actual en diferentes formatos desde el servidor y actualizar el contenido HTML correspondiente.
async function fetchTime() {
    try{
        const response = await fetch('/api/tiempo');
        const data = await response.json();
        const decimal = data.decimal;
        const binario = data.binario;
        const hexadecimal = data.hexadecimal;
        const octal = data.octal; 

  // Los IDs en el HTML son: dec-time, bin-time, oct-time, hex-time
  const decEl = document.getElementById('dec-time');
  const binEl = document.getElementById('bin-time');
  const octEl = document.getElementById('oct-time');
  const hexEl = document.getElementById('hex-time');

  if (decEl) decEl.innerText = `${String(decimal.h).padStart(2,'0')}: ${String(decimal.m).padStart(2,'0')}: ${String(decimal.s).padStart(2,'0')}`;
  // actualizar hero (hora grande) si existe
  const heroEl = document.getElementById('hero-time');
  if (heroEl) heroEl.innerText = `${String(decimal.h).padStart(2,'0')}:${String(decimal.m).padStart(2,'0')}:${String(decimal.s).padStart(2,'0')}`;
  if (binEl) binEl.innerText = `${binario.h}: ${binario.m}: ${binario.s}`;
  if (hexEl) hexEl.innerText = `${hexadecimal.h}: ${hexadecimal.m}: ${hexadecimal.s}`;
  if (octEl) octEl.innerText = `${octal.h}: ${octal.m}: ${octal.s}`;
    } catch (error) {
        console.error('Error fetching time data:', error);
    }
}

async function compute(op) {
  const hours_bin = document.getElementById('hours-bin').value.trim() || '0';
  const minutes_bin = document.getElementById('minutes-bin').value.trim() || '0';
  const format24 = document.getElementById('format-24').value === 'true';

  // mapear operaciones a los valores que espera backend
  const operacion = op === 'add' ? 'sumar' : 'restar';

  const resp = await fetch('/api/calcular', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      operacion: operacion,
      horas_binario: hours_bin,
      minutos_binario: minutes_bin,
      formato_24: format24
    })
  });
  const data = await resp.json();
  if (data.error) {
    alert('Error: ' + data.error);
    return;
  }
  // Actualizar el resultado en el HTML
  document.getElementById('display-result').innerText = data.formatted?.display || '';
  document.getElementById('res-dec').innerText = `${data.resultado_decimal.h}:${data.resultado_decimal.m}:${data.resultado_decimal.s}`;
  document.getElementById('res-bin').innerText = `${data.resultado_binario.h}:${data.resultado_binario.m}:${data.resultado_binario.s}`;
  document.getElementById('res-oct').innerText = `${data.resultado_octal.h}:${data.resultado_octal.m}:${data.resultado_octal.s}`;
  document.getElementById('res-hex').innerText = `${data.resultado_hexadecimal.h}:${data.resultado_hexadecimal.m}:${data.resultado_hexadecimal.s}`;
}


// Actualizar la hora cada segundo
fetchTime();
setInterval(fetchTime, 1000);

// Conectar botones 'Sumar' y 'Restar' a la función compute
const btnAdd = document.getElementById('btn-add');
const btnSub = document.getElementById('btn-sub');
if (btnAdd) btnAdd.addEventListener('click', (e) => { e.preventDefault(); compute('add'); });
if (btnSub) btnSub.addEventListener('click', (e) => { e.preventDefault(); compute('sub'); });

// Navegación entre pantallas (SPA): mostrar/ocultar secciones
function showScreen(screenId) {
  const home = document.getElementById('screen-home');
  const ops = document.getElementById('screen-ops');
  if (!home || !ops) return;
  if (screenId === 'home') {
    home.classList.remove('hidden');
    ops.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (screenId === 'ops') {
    ops.classList.remove('hidden');
    home.classList.add('hidden');
    // focus al formulario
    setTimeout(() => { const h = document.getElementById('hours-bin'); if (h) h.focus(); }, 250);
  }
}

// listeners del navbar
const navHome = document.getElementById('nav-home');
const navOps = document.getElementById('nav-ops');
const goOps = document.getElementById('go-ops');
const backHome = document.getElementById('back-home');
if (navHome) navHome.addEventListener('click', () => showScreen('home'));
if (navOps) navOps.addEventListener('click', () => showScreen('ops'));
if (goOps) goOps.addEventListener('click', () => showScreen('ops'));
if (backHome) backHome.addEventListener('click', () => showScreen('home'));

// mostrar pantalla inicial por defecto
document.addEventListener('DOMContentLoaded', () => { showScreen('home'); });

