#suma y resta binaria (strings)
def _normalizar(a: str, b: str):
    #eliminar espacios y normalizar longitud
    a= a.strip()
    b= b.strip()
    maxlen = max(len(a), len(b))
    a= a.zfill (maxlen)
    b= b.zfill (maxlen)
    return a, b

def añadir_binarios(a: str, b: str) -> str:
    a, b = _normalizar(a, b)
    carry = 0
    resultado = []
    for i in range(len(a)-1, -1, -1):
        bit_a = int(a[i])
        bit_b = int(b[i])
        total = bit_a + bit_b + carry
        resultado.append('1' if total % 2 == 1 else '0')
        carry = 1 if total > 1 else 0
    if carry:
        resultado.append('1')
    return ''.join(reversed(resultado)).lstrip('0') or '0'


def restar_binarios(a: str, b: str) -> str:
    # Realiza a-b asumiendo que a >= b Operacion en binario  
    #Si a < b, el resultado sera incorrecto  y se producira un error 
    
    a, b = _normalizar(a, b)
    # verificar decimal para comparar
    decimal_a = 0
    decimal_b = 0
    for ch in a :
        decimal_a = decimal_a * 2 + (1 if ch == '1' else 0)
    for ch in b :
        decimal_b = decimal_b * 2 + (1 if ch == '1' else 0)
    if decimal_a < decimal_b:
        raise ValueError("El minuendo debe ser mayor o igual que el sustraendo")

    #Metodo para realizar la resta bit a bit con borrow
    resultado = []
    borrow = 0
    for i in range(len(a)-1, -1, -1):
        bit_a = int(a[i])
        bit_b = int(b[i])
        resta = bit_a - bit_b - borrow
        # Si la resta es negativa, necesitamos pedir prestado
        if resta >= 0:
            resultado.append('1' if resta == 1 else '0') # resultado de la resta
            borrow = 0
            # No necesitamos pedir prestado
        else:
            resultado.append('1' if resta + 2 == 1 else '0')
            borrow = 1

    return ''.join(reversed(resultado)).lstrip('0') or '0'
