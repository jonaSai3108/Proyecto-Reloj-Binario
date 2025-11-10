// CONFIGURACIÓN DE TAILWIND 
tailwind.config = {
  theme: {
    extend: {
      // Se define la paleta de colores para el diseño formal
      colors: { 
          primary: '#0ea5a4',      // Teal claro (se mantiene para contraste)
          'accent-dark': '#2f5c5d', // El nuevo color oscuro
          secondary1: '#1e40af',   // Azul oscuro para Horas
          secondary2: '#7c3aed',   // Violeta para Minutos
          secondary3: '#b91c1c'    // Rojo oscuro para Segundos
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(8px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } }
      },
      animation: { fadeIn: 'fadeIn 500ms ease-out both', slideUp: 'slideUp 400ms cubic-bezier(.2,.8,.2,1) both' }
    }
  }
};



// VARIABLES GLOBALES
const screens = {
    home: document.getElementById('screen-home'),
    ops: document.getElementById('screen-ops')
};

const navButtons = {
    home: document.getElementById('nav-home'),
    ops: document.getElementById('nav-ops')
};

const heroTime = document.getElementById('hero-time');

// Temporizador para el resultado de la operación para que siga corriendo
let resultTimer = null;
let resultTime = { h: 0, m: 0, s: 0 };
let resultFormat24 = true; 

// Actualizar los elementos de la hora principal
const updateClockElements = (data) => {
    // Bases individuales
    document.getElementById('binary-hours-text').textContent = data.binario.h.padStart(5, '0');
    document.getElementById('binary-minutes-text').textContent = data.binario.m.padStart(6, '0');
    document.getElementById('binary-seconds-text').textContent = data.binario.s.padStart(6, '0');

    // Bases concatenadas
    document.getElementById('dec-time').textContent = `${data.decimal.h}:${data.decimal.m}:${data.decimal.s}`;
    document.getElementById('bin-time').textContent = `${data.binario.h}:${data.binario.m}:${data.binario.s}`;
    document.getElementById('oct-time').textContent = `${data.octal.h}:${data.octal.m}:${data.octal.s}`;
    document.getElementById('hex-time').textContent = `${data.hexadecimal.h}:${data.hexadecimal.m}:${data.hexadecimal.s}`;
};

// funcion para convertir decimal a binario
function decToBin(n) {
    if (n === 0) return '0';
    let s = '';
    let v = n;
    while (v > 0) {
        s = (v % 2) + s;
        v = Math.floor(v / 2);
    }
    return s;
}

// Convierte el contenido de un input que puede ser decimal a binario automáticamente.
function convertInputDecimalToBinaryIfNeeded(inputEl, kind) {
    if (!inputEl) return;
    const raw = inputEl.value.trim();
    if (raw === '') return;

    // Si contiene solo 0/1 asumimos que ya es binario y no tocamos
    if (/^[01]+$/.test(raw)) return;

    // Si contiene solo dígitos 0-9, lo interpretamos como decimal y lo convertimos
    if (/^\d+$/.test(raw)) {
        const dec = parseInt(raw, 10);
        // Validar rango: horas 0-23, minutos 0-59. Si está fuera de rango no se realiza la conversión
        if (kind === 'minutes') {
            if (dec < 0 || dec > 59) {
                alert('Valor de minutos fuera de rango. Introduce un número entre 0 y 59.');
                return; // no convertir ni sobrescribir el input
            }
        }
        if (kind === 'hours') {
            if (dec < 0 || dec > 23) {
                alert('Valor de horas fuera de rango. Introduce un número entre 0 y 23.');
                return; // no convertir ni sobrescribir el input
            }
        }

        // Si pasa validación, convertir a binario y asignar
        inputEl.value = decToBin(dec);
        return;
    }

    // Si no es ni binario ni decimal, mostrar aviso breve
    // No sobreescribimos para no perder lo que el usuario escribio
    alert('Entrada no reconocida. Ingresa un número decimal (ej. 10) o una cadena binaria (ej. 1010).');
}
// Octal en mayúsculas
function decToOct(n) {
    return n.toString(8);
}
// Hexadecimal en mayúsculas
function decToHex(n) {
    return n.toString(16).toUpperCase();
}
// Padding específico para binario en horas/minutos/segundos
function padBinHours(s) { return s.padStart(5, '0'); }
function padBinMinutesSeconds(s) { return s.padStart(6, '0'); }

function updateResultDisplays() {
    const h = resultTime.h;
    const m = resultTime.m;
    const s = resultTime.s;

    // Decimal
    document.getElementById('res-dec').textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

    // Binario (padded similar al reloj principal)
    document.getElementById('res-bin').textContent = `${padBinHours(decToBin(h))}:${padBinMinutesSeconds(decToBin(m))}:${padBinMinutesSeconds(decToBin(s))}`;

    // aqui se actualizan octal y hexadecimal en la pantalla de resultados
    document.getElementById('res-oct').textContent = `${decToOct(h)}:${decToOct(m)}:${decToOct(s)}`;
    document.getElementById('res-hex').textContent = `${decToHex(h)}:${decToHex(m)}:${decToHex(s)}`;

    // Formato de visualización principal (24h o 12h)
    if (resultFormat24) {
        document.getElementById('display-result').textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    } else {
        const suffix = h < 12 ? 'AM' : 'PM';
        let h12 = h % 12;
        if (h12 === 0) h12 = 12;
        document.getElementById('display-result').textContent = `${String(h12).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')} ${suffix}`;
    }
}

function startResultTimer() {
    // Asegurar que no haya timers duplicados
    if (resultTimer) clearInterval(resultTimer);
    resultTimer = setInterval(() => {
        // incrementar segundo y ajustar minutos/horas (24h)
        resultTime.s += 1;
        if (resultTime.s >= 60) {
            resultTime.s = 0;
            resultTime.m += 1;
        }
        if (resultTime.m >= 60) {
            resultTime.m = 0;
            resultTime.h = (resultTime.h + 1) % 24;
        }
        updateResultDisplays();
    }, 1000);
}

function stopResultTimer() {
    if (resultTimer) {
        clearInterval(resultTimer);
        resultTimer = null;
    }
}


// 1. Obtiene la hora del backend y actualiza el DOM.
const fetchTime = async () => {
    try {
        const response = await fetch('/api/tiempo');
        const data = await response.json();
        
        // Formato HH:MM:SS
        const formattedTime = `${data.decimal.h.padStart(2, '0')}:${data.decimal.m.padStart(2, '0')}:${data.decimal.s.padStart(2, '0')}`;
        
        heroTime.textContent = formattedTime;
        updateClockElements(data);

    } catch (error) {
        console.error('Error fetching time:', error);
        heroTime.textContent = 'Error';
    }
};


// 2. Manejo de la navegación entre pantallas (Home / Operaciones)
const navigateTo = async (targetScreen) => {
    if (targetScreen === 'home') {
        // Al volver al inicio, detener el temporizador del resultado para ahorrar recursos
        stopResultTimer();
        screens.home.classList.remove('hidden');
        screens.ops.classList.add('hidden');
    } else {
        // Al entrar a Operaciones, mostrar inmediatamente la hora actual en el bloque de resultados
        screens.home.classList.add('hidden');
        screens.ops.classList.remove('hidden');

        try {
            const resp = await fetch('/api/tiempo');
            if (!resp.ok) throw new Error('Error fetching time');
            const data = await resp.json();

            // Inicializar el resultado con la hora actual del servidor
            resultTime.h = parseInt(data.decimal.h, 10) || 0;
            resultTime.m = parseInt(data.decimal.m, 10) || 0;
            resultTime.s = parseInt(data.decimal.s, 10) || 0;

            // Leer formato actual seleccionado por el usuario en el formulario (si existe)
            const formatoElem = document.getElementById('format-24');
            resultFormat24 = formatoElem ? (formatoElem.value === 'true') : true;

            updateResultDisplays();
            startResultTimer();

        } catch (err) {
            console.error('No se pudo obtener la hora al entrar a Operaciones:', err);
            // En caso de fallo, detener cualquier temporizador previo
            stopResultTimer();
        }
    }
};

navButtons.home.addEventListener('click', () => navigateTo('home'));
navButtons.ops.addEventListener('click', () => navigateTo('ops'));
document.getElementById('go-ops').addEventListener('click', () => navigateTo('ops'));
document.getElementById('back-home').addEventListener('click', () => navigateTo('home'));


// 3. Manejo de la operación Sumar/Restar
const handleCalculation = async (operation) => {
    const horasBinario = document.getElementById('hours-bin').value || '0';
    const minutosBinario = document.getElementById('minutes-bin').value || '0';
    const formato24 = document.getElementById('format-24').value === 'true';

    // Validación simple de binario (solo 0s y 1s)
    const binRegex = /^[01]*$/;
    if (!binRegex.test(horasBinario) || !binRegex.test(minutosBinario)) {
        alert('Por favor, ingresa solo 0s y 1s en los campos binarios.');
        return;
    }

    try {
        const response = await fetch('/api/calcular', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                operacion: operation,
                horas_binario: horasBinario,
                minutos_binario: minutosBinario,
                formato_24: formato24
            })
        });

        const result = await response.json();

        if (response.ok) {
            // Inicializar valores para que el resultado siga corriendo en el cliente
            // Parsear valores decimales retornados por el servidor
            resultTime.h = parseInt(result.resultado_decimal.h, 10) || 0;
            resultTime.m = parseInt(result.resultado_decimal.m, 10) || 0;
            resultTime.s = parseInt(result.resultado_decimal.s, 10) || 0;

            // Guardar formato (24/12) para la visualización
            resultFormat24 = formato24;

            // Actualizar inmediatamente y arrancar el temporizador que mantendrá el resultado avanzando
            updateResultDisplays();
            startResultTimer();

        } else {
            // Manejo de errores del servidor (ej: entrada binaria inválida)
            document.getElementById('display-result').textContent = 'Error';
            console.error('Error del servidor:', result.error);
            alert(`Error de cálculo: ${result.error}`);
            // Detener cualquier temporizador previo de resultados
            stopResultTimer();
        }

    } catch (error) {
        console.error('Error al enviar la solicitud de cálculo:', error);
        alert('Ocurrió un error al intentar comunicarse con el servidor.');
        // Detener temporizador de resultado si algo falló
        stopResultTimer();
    }
};

// Asignar eventos a los botones de sumar/restar
document.getElementById('btn-add').addEventListener('click', () => handleCalculation('sumar'));
document.getElementById('btn-sub').addEventListener('click', () => handleCalculation('restar'));



// Iniciar el reloj y configurar el intervalo
window.onload = function() {
    // Actualizar formato de salida inmediatamente cuando el usuario cambie la opción
    const formatSelect = document.getElementById('format-24');
    if (formatSelect) {
        formatSelect.addEventListener('change', () => {
            resultFormat24 = formatSelect.value === 'true';
            updateResultDisplays();
        });
    }

    // Convertir automáticamente si el usuario escribe decimal en los inputs de horas/minutos
    const hoursInput = document.getElementById('hours-bin');
    const minutesInput = document.getElementById('minutes-bin');
    if (hoursInput) {
        // aqui evitamos llamadas duplicacdas en las alertas
        hoursInput.addEventListener('blur', () => convertInputDecimalToBinaryIfNeeded(hoursInput, 'hours'));
        // Si el usuario borra el campo regresar a la hora actual
        hoursInput.addEventListener('input', () => {
            if (hoursInput.value.trim() === '') {
                fetchAndSetCurrentResult();
            }
        });
    }
    if (minutesInput) {
        minutesInput.addEventListener('blur', () => convertInputDecimalToBinaryIfNeeded(minutesInput, 'minutes'));
        minutesInput.addEventListener('input', () => {
            if (minutesInput.value.trim() === '') {
                fetchAndSetCurrentResult();
            }
        });
    }

    // Inicializar tooltips info-btn (mostrar solo cuando el cursor esté sobre el botón)
    function initTooltips() {
        const buttons = document.querySelectorAll('.info-btn');
        let activeTooltip = null;
        let showTimer = null;

        function showTooltip(btn) {
            const text = btn.getAttribute('data-tooltip');
            if (!text) return;
            // crear elemento
            const tip = document.createElement('div');
            tip.className = 'js-tooltip';
            tip.textContent = text;
            document.body.appendChild(tip);

            // posicionar sobre el botón
            const rect = btn.getBoundingClientRect();
            const tipRect = tip.getBoundingClientRect();
            const left = rect.left + rect.width / 2 - tipRect.width / 2;
            const top = rect.top - tipRect.height - 10; // 10px gap
            tip.style.left = Math.max(6, left) + 'px';
            tip.style.top = (top < 6 ? rect.bottom + 10 : top) + 'px';

            // mostrar con pequeña animación
            requestAnimationFrame(() => tip.classList.add('show'));
            activeTooltip = tip;
        }

        // funcion para ocultar tooltip esto para cuando el cursor salga del boton
        function hideTooltip() {
            if (showTimer) { clearTimeout(showTimer); showTimer = null; }
            if (!activeTooltip) return;
            activeTooltip.classList.remove('show');
            // remove after transition
            const el = activeTooltip;
            setTimeout(() => { if (el && el.parentNode) el.parentNode.removeChild(el); }, 150);
            activeTooltip = null;
        }

        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                // aqui mostrar tooltip con retraso al pasar el cursor
                showTimer = setTimeout(() => showTooltip(btn), 150);
            });
            btn.addEventListener('mouseleave', () => {
                if (showTimer) { clearTimeout(showTimer); showTimer = null; }
                hideTooltip();
            });
            btn.addEventListener('focus', () => {
                // aqui mostrar tooltip inmediatamente al enfocar con el icono
                if (showTimer) { clearTimeout(showTimer); showTimer = null; }
                showTooltip(btn);
            });
            btn.addEventListener('blur', hideTooltip);
        });
    }

    initTooltips();
    
    // funcion para restaurar la hora actual del servidor al resultado
    async function fetchAndSetCurrentResult() {
        try {
            // detener  temporizador para evitar conflictos esto para la restauración de la hora actual
            stopResultTimer();
            const resp = await fetch('/api/tiempo');
            if (!resp.ok) throw new Error('Error fetching time');
            const data = await resp.json();
            resultTime.h = parseInt(data.decimal.h, 10) || 0;
            resultTime.m = parseInt(data.decimal.m, 10) || 0;
            resultTime.s = parseInt(data.decimal.s, 10) || 0;
            const formatoElem = document.getElementById('format-24');
            resultFormat24 = formatoElem ? (formatoElem.value === 'true') : true;
            updateResultDisplays();
            startResultTimer();
        } catch (err) {
            console.error('No se pudo restaurar la hora actual:', err);
        }
    }

    fetchTime();
    setInterval(fetchTime, 1000);
};
