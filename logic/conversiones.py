# Convierte un número decimal no negativo a su representación binaria como una cadena de caracteres.
def decimal_a_binario (n: int) -> str:
    if n == 0: # si el numero es 0, retornamos '0'
        return '0'
    if n < 0: # si el numero es negativo, lanzamos un error
        raise ValueError("Solo numeros no negativos")
    bits = [] # lista vacia para almacenar los restos de la division
    while n > 0: # mientras n sea mayor que 0
         # obtenemos el resto de la division entre 2 (0 o 1) y lo añadimos a la lista
        bits.append(str(n % 2)) # agrega ese residuo a la lista de bits
        n = n // 2    # actualizamos n dividiendolo entre 2 (division entera) sin decimales
    return ''.join(reversed(bits)) # unimos la lista en una cadena y la retornamos invertida

# Convierte un número decimal a su representación octal como una cadena de caracteres.
def decimal_a_octal(n: int) -> str:
    if n == 0:
        return '0'
    if n < 0:
        raise ValueError("Solo numeros no negativos")
    octales = []
    while n > 0:
        octales.append(str(n % 8))
        n  //= 8
    return ''.join(reversed(octales))


def decimal_a_hexadecimal(n: int) -> str:
    if n == 0:
        return '0'
    if n < 0:
        raise ValueError("Solo numeros no negativos")
    hexadecimales = '0123456789ABCDEF'
    digitos = []
    while n > 0:
        digitos.append(hexadecimales[n % 16])
        n //= 16
    return ''.join(reversed(digitos))


def binario_a_decimal(b: str) -> int:
    b = b.strip()  # eliminar espacios en blanco al inicio y al final
    if b == '':
        return 0
    if any(ch not in ('0', '1') for ch in b): 
        raise ValueError("cadena no binaria")
    value = 0
    for ch in b:
        value = value * 2 + (1 if ch == '1' else 0)
    return value
        

