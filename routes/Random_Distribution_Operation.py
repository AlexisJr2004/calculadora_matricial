from flask import Blueprint, request, jsonify
import math
import numpy as np

simulate_bp = Blueprint('simulate_bp', __name__)
random_bp = Blueprint('random_bp', __name__)


# ******************************************
# * GENERADORES DE NÚMEROS PSEUDOALEATORIOS *
# ******************************************
@random_bp.route('/random_number_generation', methods=['POST'])
def random_number_generation():
    data = request.json
    method = data['method']
    params = data.get('params', {})
    test_type = data.get('test', None)
    
    try:
        # Generar números según el método seleccionado
        if method == 'middle_square':
            numbers = middle_square_method(**params)
        elif method == 'middle_product':
            numbers = middle_product_method(**params)
        elif method == 'constant_multiplier':
            numbers = constant_multiplier_method(**params)
        elif method == 'linear_congruential':
            numbers = linear_congruential_method(**params)
        elif method == 'multiplicative_congruential':
            numbers = multiplicative_congruential_method(**params)
        elif method == 'additive_congruential':
            numbers = additive_congruential_method(**params)
        elif method == 'mixed_congruential':
            numbers = mixed_congruential_method(**params)
        else:
            raise ValueError("Método no soportado")
        
        # Realizar pruebas estadísticas si se solicitan
        test_results = {}
        if test_type == 'mean':
            test_results = mean_test(numbers)
        elif test_type == 'variance':
            test_results = variance_test(numbers)
        elif test_type == 'both':
            test_results = {
                'mean': mean_test(numbers),
                'variance': variance_test(numbers)
            }
        elif test_type == 'ks':
            test_results = kolmogorov_smirnov_test(numbers)
        
        return jsonify({
            'success': True,
            'numbers': numbers,
            'test_results': test_results if test_results else None,
            'details': f"Generados {len(numbers)} números usando método {method}"
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'details': f"Error en generación con método {method}"
        })

# Métodos de generación
def middle_square_method(seed, n, digits=4):
    """
    Método de cuadrados medios
    :param seed: Semilla inicial (entero)
    :param n: Cantidad de números a generar
    :param digits: Dígitos a considerar (default 4)
    :return: Lista de números pseudoaleatorios en [0,1)
    """
    numbers = []
    x = seed
    for _ in range(n):
        x_squared = x * x
        x_str = str(x_squared).zfill(2*digits)
        middle = len(x_str) // 2
        x = int(x_str[middle-digits//2 : middle+digits//2])
        numbers.append(x / (10**digits))
    return numbers

def middle_product_method(seed1, seed2, n, digits=2):
    """
    Método de producto medio
    :param seed1: Primera semilla
    :param seed2: Segunda semilla
    :param n: Cantidad de números a generar
    :param digits: Dígitos a considerar (default 2)
    :return: Lista de números pseudoaleatorios en [0,1)
    """
    numbers = []
    x0, x1 = seed1, seed2
    for _ in range(n):
        product = x0 * x1
        product_str = str(product).zfill(2*digits)
        middle = len(product_str) // 2
        x_next = int(product_str[middle-digits//2 : middle+digits//2])
        numbers.append(x_next / (10**digits))
        x0, x1 = x1, x_next
    return numbers

def constant_multiplier_method(seed, constant, n, digits=3):
    """
    Método del multiplicador constante
    :param seed: Semilla inicial
    :param constant: Constante multiplicativa
    :param n: Cantidad de números a generar
    :param digits: Dígitos a considerar (default 3)
    :return: Lista de números pseudoaleatorios en [0,1)
    """
    numbers = []
    x = seed
    for _ in range(n):
        product = constant * x
        product_str = str(product).zfill(2*digits)
        middle = len(product_str) // 2
        x_next = int(product_str[middle-digits//2 : middle+digits//2])
        numbers.append(x_next / (10**digits))
        x = x_next
    return numbers

def linear_congruential_method(seed, a, c, m, n):
    """
    Algoritmo congruencial lineal
    :param seed: Semilla inicial (X0)
    :param a: Constante multiplicativa
    :param c: Constante aditiva
    :param m: Módulo
    :param n: Cantidad de números a generar
    :return: Lista de números pseudoaleatorios en [0,1)
    """
    numbers = []
    x = seed
    for _ in range(n):
        x = (a * x + c) % m
        numbers.append(x / (m-1))
    return numbers

def multiplicative_congruential_method(seed, a, m, n):
    """
    Método congruencial multiplicativo
    :param seed: Semilla inicial (debe ser impar)
    :param a: Constante multiplicativa (3+8k o 5+8k)
    :param m: Módulo (2^g)
    :param n: Cantidad de números a generar
    :return: Lista de números pseudoaleatorios en [0,1)
    """
    numbers = []
    x = seed
    for _ in range(n):
        x = (a * x) % m
        numbers.append(x / (m-1))
    return numbers

def additive_congruential_method(initial_values, m, n):
    """
    Método congruencial aditivo
    :param initial_values: Lista de valores iniciales
    :param m: Módulo
    :param n: Cantidad de números a generar
    :return: Lista de números pseudoaleatorios en [0,1)
    """
    numbers = []
    sequence = initial_values.copy()
    k = len(initial_values)
    
    for _ in range(n):
        next_val = (sequence[-1] + sequence[-k]) % m
        sequence.append(next_val)
        numbers.append(next_val / (m-1))
    
    return numbers[-n:]  # Retornar solo los nuevos generados

def mixed_congruential_method(seed, a, c, m, n):
    """
    Método congruencial mixto (igual que lineal pero con diferente normalización)
    :param seed: Semilla inicial (X0)
    :param a: Constante multiplicativa
    :param c: Constante aditiva
    :param m: Módulo
    :param n: Cantidad de números a generar
    :return: Lista de números pseudoaleatorios en [0,1)
    """
    numbers = []
    x = seed
    for _ in range(n):
        x = (a * x + c) % m
        numbers.append(x / m)  # Normalización diferente al lineal
    return numbers

# Pruebas estadísticas
def mean_test(numbers, alpha=0.05):
    """
    Prueba de medias
    :param numbers: Lista de números pseudoaleatorios
    :param alpha: Nivel de significancia (default 0.05)
    :return: Diccionario con resultados de la prueba
    """
    n = len(numbers)
    mean = sum(numbers) / n
    expected_mean = 0.5
    z_alpha = 1.96  # Para alpha=0.05 (95% confianza)
    
    lower_bound = 0.5 - z_alpha * (1 / math.sqrt(12 * n))
    upper_bound = 0.5 + z_alpha * (1 / math.sqrt(12 * n))
    
    return {
        'sample_mean': mean,
        'expected_mean': expected_mean,
        'lower_bound': lower_bound,
        'upper_bound': upper_bound,
        'passed': lower_bound <= mean <= upper_bound,
        'z_value': (mean - expected_mean) * math.sqrt(12 * n),
        'z_critical': z_alpha
    }

def variance_test(numbers, alpha=0.05):
    """
    Prueba de varianza
    :param numbers: Lista de números pseudoaleatorios
    :param alpha: Nivel de significancia (default 0.05)
    :return: Diccionario con resultados de la prueba
    """
    n = len(numbers)
    mean = sum(numbers) / n
    variance = sum((x - mean)**2 for x in numbers) / (n - 1)
    expected_variance = 1/12
    
    # Valores críticos de chi-cuadrado
    chi2_lower = 70.222  # Ejemplo para n=100, alpha=0.05
    chi2_upper = 129.561  # Debe calcularse según n y alpha
    
    lower_bound = chi2_lower / (12 * (n - 1))
    upper_bound = chi2_upper / (12 * (n - 1))
    
    return {
        'sample_variance': variance,
        'expected_variance': expected_variance,
        'lower_bound': lower_bound,
        'upper_bound': upper_bound,
        'passed': lower_bound <= variance <= upper_bound,
        'chi2_value': (n - 1) * variance * 12,
        'chi2_critical_lower': chi2_lower,
        'chi2_critical_upper': chi2_upper
    }

def kolmogorov_smirnov_test(numbers, alpha=0.05):
    """
    Prueba de Kolmogorov-Smirnov para uniformidad
    """
    n = len(numbers)
    sorted_numbers = sorted(numbers)
    
    # Calcular D+ y D-
    d_plus = max([(i+1)/n - sorted_numbers[i] for i in range(n)])
    d_minus = max([sorted_numbers[i] - i/n for i in range(n)])
    d_stat = max(d_plus, d_minus)
    
    # Valor crítico aproximado para alpha=0.05
    d_critical = 1.36 / math.sqrt(n)
    
    return {
        'd_statistic': d_stat,
        'd_critical': d_critical,
        'passed': d_stat <= d_critical
    }





# ******************************************
# *      SIMULACIÓN DE DISTRIBUCIONES      *
# ******************************************
@simulate_bp.route('/simulate', methods=['POST'])
def simulate():
    data = request.json
    distribution = data['distribution']
    count = data['count']
    params = data['params']
    
    try:
        result = {
            'sample_size': count,
            'distribution': distribution
        }
        
        if distribution == 'poisson':
            lambda_ = params['lambda'] * params['time']
            samples = np.random.poisson(lambda_, count)
            result.update({
                'mean': float(np.mean(samples)),
                'variance': float(np.var(samples)),
                'theoretical_mean': lambda_,
                'theoretical_variance': lambda_,
                'samples': samples.tolist()
            })
            
        elif distribution == 'binomial':
            n = params['n']
            p = params['p']
            samples = np.random.binomial(n, p, count)
            result.update({
                'mean': float(np.mean(samples)),
                'variance': float(np.var(samples)),
                'theoretical_mean': n * p,
                'theoretical_variance': n * p * (1 - p),
                'samples': samples.tolist()
            })
            
        elif distribution == 'exponential':
            lambda_ = params['lambda']
            samples = np.random.exponential(1/lambda_, count)
            samples = samples[samples <= params['max_time']]  # Filtrar por tiempo máximo
            result.update({
                'mean': float(np.mean(samples)),
                'variance': float(np.var(samples)),
                'theoretical_mean': 1/lambda_,
                'theoretical_variance': 1/(lambda_**2),
                'samples': samples.tolist()
            })
            
        elif distribution == 'normal':
            mean = params['mean']
            std = params['std']
            samples = np.random.normal(mean, std, count)
            result.update({
                'mean': float(np.mean(samples)),
                'variance': float(np.var(samples)),
                'theoretical_mean': mean,
                'theoretical_variance': std**2,
                'samples': samples.tolist()
            })
            
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'details': f"Error simulating {distribution} distribution"
        }), 400
