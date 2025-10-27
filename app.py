from flask import Flask, render_template, jsonify, request 
from datetime import datetime, timedelta 
from logic.conversiones import decimal_a_binario, decimal_a_octal, decimal_a_hexadecimal, binario_a_decimal
from logic.binario_math import añadir_binarios as sumar_binarios


app = Flask(__name__)

# Aplicación Flask para mostrar la hora actual en diferentes formatos numéricos.
def formato_tiempo_componentes(h, m, s):
   #Devuelve diccionario con componentes en base 10,2,8,16
   return {
    'decimal': {'h': str(h), 'm': str(m), 's': str(s)},
    'binario': {'h': decimal_a_binario(h), 'm': decimal_a_binario(m), 's': decimal_a_binario(s)},
    'octal': {'h': decimal_a_octal(h), 'm': decimal_a_octal(m), 's': decimal_a_octal(s)},
    'hexadecimal': {'h': decimal_a_hexadecimal(h), 'm': decimal_a_hexadecimal(m), 's': decimal_a_hexadecimal(s)},
   }

#Rutas de la aplicación Flask.
@app.route('/')
def index():
   return render_template('index.html')

#Ruta para obtener la hora actual en diferentes formatos.
@app.route('/api/tiempo')
def api_tiempo():
   #Devuelve la hora actual en formatos decimal, binario, octal y hexadecimal.
   now = datetime.now()
   h, m, s = now.hour, now.minute, now.second
   return jsonify(formato_tiempo_componentes(h, m, s))


@app.route('/api/calcular', methods=['POST'])
def api_calcular():
    """Calcula la hora después de un intervalo dado en segundos."""
    data = request.json
    operacion = data.get('operacion') # 'sumar' o 'restar'
    horas_binario = data.get('horas_binario', '0') # '0' por defecto 
    minutos_binario = data.get('minutos_binario', '0') # '0' por defecto
    formato_24 = data.get('formato_24', True) # True por defecto

    #Obtner la hora catual
    now = datetime.now()
    h0, m0, s0 = now.hour, now.minute, now.second 

    #Convertir inputs binarios a decimal usando la funcion binario_a_decimal
    try:
       add_horas = binario_a_decimal(horas_binario)
       add_minutos = binario_a_decimal(minutos_binario)
    except ValueError:
       return jsonify({'error': 'Entrada binaria inválida.'}), 400
    
    #convertir la hora, minuto y segundo actual a binario (Ejemplo 14 -> 1110)
    h0_binario = decimal_a_binario(h0)
    m0_binario = decimal_a_binario(m0)
    s0_binario = decimal_a_binario(s0)

    #Hacer la operacion binaria: se suman o restan las horas y minutos en binario sin usar conversiones nativas
    #Primero sumamos minutos y horas por separado, luego ajustamos si los minutos exceden 60 o si las horas exceden 24 (o 12 si formato_24 es False)
    if operacion == 'sumar':
       #Sumar minutos
        new_m_binario = sumar_binarios(m0_binario, decimal_a_binario(add_minutos))
        #Ajustar horas si los minutos exceden a 60 minutos
        new_m_decimal = binario_a_decimal(new_m_binario)
        extra_horas = new_m_decimal // 60
        new_m_decimal = new_m_decimal % 60

        #Sumar horas
        new_h_binario = sumar_binarios(h0_binario, decimal_a_binario(add_horas ))
        if extra_horas:
            new_h_binario = sumar_binarios(new_h_binario, decimal_a_binario(extra_horas))

            #Ajustar horas 24 horas o 12 horas
        new_h_decimal = binario_a_decimal(new_h_binario) %24 

    # restar
    elif operacion == 'restar':
       # Restar minutos si el resultado es negativo, tomamos prestada 1 hora (60 minutos)
       # Se realiza la resta binria en minutos, si m0 < add_minutos, restaremos  y añadiremos 60 minutos
       m0_decimal = m0
       if m0_decimal < add_minutos:
           # Tomar prestada 1 hora (60 minutos)
           m_diferencia_decimal = (m0_decimal + 60) - add_minutos
           hora_prestada = 1
       else:
           m_diferencia_decimal = m0_decimal - add_minutos
           hora_prestada = 0

        #Ahora ajustamos la hora
       h0_decimal = h0
       h_diferencia_decimal = (h0_decimal - hora_prestada) % 24
       #convertir a binario
       new_m_decimal = m_diferencia_decimal
       new_h_decimal = h_diferencia_decimal
       new_m_binario = decimal_a_binario(new_m_decimal)
       new_h_binario = decimal_a_binario(new_h_decimal)
    else:
        return jsonify({'error': 'Operación inválida. Use "sumar" o "restar".'}), 400
       
    #preparar las salidas con todas las bases 
    resultado = {
        'resultado_decimal': {'h': str(new_h_decimal), 'm': str(new_m_decimal), 's': str(s0)},
        'resultado_binario': {'h': decimal_a_binario(new_h_decimal), 'm': decimal_a_binario(new_m_decimal), 's': decimal_a_binario(s0)},
        'resultado_octal': {'h': decimal_a_octal(new_h_decimal), 'm': decimal_a_octal(new_m_decimal), 's': decimal_a_octal(s0)},
        'resultado_hexadecimal': {'h': decimal_a_hexadecimal(new_h_decimal), 'm': decimal_a_hexadecimal(new_m_decimal), 's': decimal_a_hexadecimal(s0)},
    
    }
    
    # inicializar campo formateado y rellenar la representación 24h y 12h
    resultado['formatted'] = {}

    # representación en 24 horas
    resultado['formatted']['24'] = f"{new_h_decimal:02d}:{new_m_decimal:02d}:{s0:02d}"

    # calcular 12h si el usuario lo solicita o para mostrar
    h12 = new_h_decimal
    suffix = ''
    # siempre tenemos la versión 24 definida; si el usuario quiere 24h la mostramos
    if formato_24:
        resultado['formatted']['display'] = resultado['formatted']['24']
    else:
        suffix = 'AM' if new_h_decimal < 12 else 'PM'
        h12 = new_h_decimal % 12
        if h12 == 0:
            h12 = 12
        resultado['formatted']['12'] = f"{h12:02d}:{new_m_decimal:02d}:{s0:02d} {suffix}"
        resultado['formatted']['display'] = resultado['formatted']['12']

    return jsonify(resultado)

if __name__ == '__main__':
    app.run(debug=True)


