from flask import Blueprint, request, jsonify
import numpy as np
import math
import re

montecarlo_bp = Blueprint('montecarlo_bp', __name__)


# ******************************************
# *    MONTECARLO: ÁREA ENTRE FUNCIONES     *
# ******************************************
@montecarlo_bp.route('/montecarlo_area', methods=['POST'])
def montecarlo_area():
    """
    Simulación de Montecarlo para estimar el área entre dos funciones f1(x) y f2(x)
    en un intervalo [a, b]. Devuelve tabla, estadísticos y datos para graficar.
    """
    try:
        data = request.json
        n = int(data.get('simulations', 1000))
        a = float(data.get('a', 0))
        b = float(data.get('b', 1))
        f1_expr = data['f1']
        f2_expr = data['f2']

        # Función segura para evaluar expresiones en x
        def safe_eval(expr, x):
            allowed = {
                'x': x,
                'sin': math.sin, 'cos': math.cos, 'tan': math.tan,
                'exp': math.exp, 'log': math.log, 'sqrt': math.sqrt,
                'pi': math.pi, 'e': math.e
            }
            expr = expr.replace('^', '**')
            if not re.match(r'^[x0-9+\-*/\s().^a-z]+$', expr):
                raise ValueError("Expresión contiene caracteres no permitidos")
            return eval(expr, {"__builtins__": None}, allowed)

        # Generar puntos aleatorios
        xs = np.random.uniform(a, b, n)
        # Evaluar funciones en xs
        y1s = np.array([safe_eval(f1_expr, x) for x in xs])
        y2s = np.array([safe_eval(f2_expr, x) for x in xs])

        # Determinar límites verticales
        y_min = min(np.min(y1s), np.min(y2s), 0)
        y_max = max(np.max(y1s), np.max(y2s), 1)

        ys = np.random.uniform(y_min, y_max, n)

        # Para cada punto, determinar si está entre las dos curvas
        lower = np.minimum(y1s, y2s)
        upper = np.maximum(y1s, y2s)
        inside = (ys >= lower) & (ys <= upper)

        # Área del rectángulo de simulación
        area_rect = (b - a) * (y_max - y_min)
        area_est = np.sum(inside) / n * area_rect

        # Preparar tabla de resultados
        table = []
        for i in range(n):
            table.append({
                'x': float(xs[i]),
                'y1': float(y1s[i]),
                'y2': float(y2s[i]),
                'y_rnd': float(ys[i]),
                'inside': int(inside[i])
            })

        # Fórmulas usadas
        formulas = {
            'area_rect': f"Área del rectángulo = (b-a)·(y_max-y_min) = ({b}-{a})·({y_max}-{y_min}) = {area_rect:.4f}",
            'area_est': r"Área\ estimada = \frac{\text{Puntos\ dentro}}{\text{Total\ de\ puntos}} \times \text{Área\ rectángulo}"
        }

        return jsonify({
            'success': True,
            'table': table,
            'area_est': area_est,
            'inside_count': int(np.sum(inside)),
            'total': n,
            'a': a, 'b': b,
            'y_min': y_min, 'y_max': y_max,
            'f1': f1_expr, 'f2': f2_expr,
            'formulas': formulas
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})
