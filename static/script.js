// --- CONFIGURACIÓN DE TAILWIND INTEGRADA ---
// La configuración de Tailwind se mueve aquí para reducir el número de archivos.
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
// --- FIN DE CONFIGURACIÓN DE TAILWIND ---


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
const navigateTo = (targetScreen) => {
    if (targetScreen === 'home') {
        screens.home.classList.remove('hidden');
        screens.ops.classList.add('hidden');
    } else {
        screens.home.classList.add('hidden');
        screens.ops.classList.remove('hidden');
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
            // Actualizar la sección de resultados
            document.getElementById('display-result').textContent = result.formatted.display;
            document.getElementById('res-dec').textContent = `${result.resultado_decimal.h.padStart(2, '0')}:${result.resultado_decimal.m.padStart(2, '0')}:${result.resultado_decimal.s.padStart(2, '0')}`;
            document.getElementById('res-bin').textContent = `${result.resultado_binario.h}:${result.resultado_binario.m}:${result.resultado_binario.s}`;
            document.getElementById('res-oct').textContent = `${result.resultado_octal.h}:${result.resultado_octal.m}:${result.resultado_octal.s}`;
            document.getElementById('res-hex').textContent = `${result.resultado_hexadecimal.h}:${result.resultado_hexadecimal.m}:${result.resultado_hexadecimal.s}`;
        } else {
            // Manejo de errores del servidor (ej: entrada binaria inválida)
            document.getElementById('display-result').textContent = 'Error';
            console.error('Error del servidor:', result.error);
            alert(`Error de cálculo: ${result.error}`);
        }

    } catch (error) {
        console.error('Error al enviar la solicitud de cálculo:', error);
        alert('Ocurrió un error al intentar comunicarse con el servidor.');
    }
};

// Asignar eventos a los botones de sumar/restar
document.getElementById('btn-add').addEventListener('click', () => handleCalculation('sumar'));
document.getElementById('btn-sub').addEventListener('click', () => handleCalculation('restar'));

// Iniciar el reloj y configurar el intervalo
window.onload = function() {
    fetchTime();
    setInterval(fetchTime, 1000);
};
