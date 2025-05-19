import math
from flask import Blueprint, request, jsonify
import numpy as np

eigen_bp = Blueprint('eigen_bp', __name__)


# =============================================
# *       VALORES Y VECTORES PROPIOS          *
# =============================================
@eigen_bp.route('/solve_diffeq', methods=['POST'])
def solve_diffeq():
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'error': 'No se recibieron datos', 'details': ''}), 400

    try:
        # Obtener parámetros
        method = data.get('method', 'euler')
        equations = data.get('equations', [])
        initial_conditions = data.get('initialConditions', [])
        h = float(data.get('h', 1))
        t_start = float(data.get('tStart', 0))
        t_end = float(data.get('tEnd', 5))
        matrixA = data.get('matrixA', None)

        # Validaciones básicas
        if not equations:
            return jsonify({'success': False, 'error': 'No se proporcionaron ecuaciones', 'details': ''}), 400
        if len(equations) != len(initial_conditions):
            return jsonify({'success': False, 'error': 'El número de ecuaciones no coincide con las condiciones iniciales', 'details': ''}), 400
        if h <= 0:
            return jsonify({'success': False, 'error': 'El paso de tiempo h debe ser positivo', 'details': ''}), 400
        if t_end <= t_start:
            return jsonify({'success': False, 'error': 'El tiempo final debe ser mayor que el inicial', 'details': ''}), 400

        # Análisis de valores y vectores propios (si se proporciona matrixA)
        eigen_analysis = None
        if matrixA is not None:
            try:
                matrixA_np = np.array(matrixA, dtype=float)
                eigenvals, eigenvecs = np.linalg.eig(matrixA_np)
                # Ecuación característica en formato LaTeX
                char_poly = np.poly(matrixA_np)
                char_eq = f"\\lambda^{len(char_poly)-1}"
                for i, coeff in enumerate(char_poly[1:-1], 1):
                    if coeff != 0:
                        char_eq += (" + " if coeff > 0 else " - ") + f"{abs(coeff):.4f}\\lambda^{len(char_poly)-1-i}"
                # Término independiente
                if char_poly[-1] != 0:
                    char_eq += f" {'+' if char_poly[-1] > 0 else '-'} {abs(char_poly[-1]):.4f}"
                char_eq += " = 0"
                eigen_analysis = {
                    'matrix': matrixA_np.tolist(),
                    'characteristicEquation': char_eq,
                    'eigenvalues': eigenvals.tolist(),
                    'eigenvectors': eigenvecs.T.tolist()  # Cada vector propio como fila
                }
            except Exception as e:
                eigen_analysis = {
                    'matrix': matrixA,
                    'characteristicEquation': "Error al calcular",
                    'eigenvalues': [],
                    'eigenvectors': [],
                    'error': str(e)
                }

        # Preparar el sistema
        n = len(equations)
        t = np.arange(t_start, t_end + h, h)

        if method in ['euler', 'rk4']:
            # Definir función del sistema
            def system(y, t):
                try:
                    dydt = []
                    for i, eq in enumerate(equations):
                        env = {
                            'y': y,
                            't': t,
                            'np': np,
                            'math': math,
                            'exp': math.exp,
                            'sin': math.sin,
                            'cos': math.cos,
                            'tan': math.tan,
                            'log': math.log
                        }
                        expr = eq
                        for j in range(n):
                            expr = expr.replace(f'X{j+1}', f'y[{j}]')
                        dydt.append(eval(expr, {'__builtins__': None}, env))
                    return dydt
                except Exception as e:
                    raise ValueError(f"Error al evaluar las ecuaciones: {str(e)}")

            y0 = np.array(initial_conditions, dtype=float)
            steps = []

            try:
                if method == 'euler':
                    y = np.zeros((len(t), n))
                    y[0] = y0
                    for i in range(1, len(t)):
                        f = np.array(system(y[i-1], t[i-1]))
                        y[i] = y[i-1] + h * f
                        paso = {
                            'paso': i,
                            't': float(t[i-1]),
                            'y_anterior': y[i-1].tolist(),
                            'f': f.tolist(),
                            'y_nuevo': y[i].tolist(),
                            'formula': "y(i) = y(i-1) + h·f(y(i-1), t(i-1))"
                        }
                        steps.append(paso)
                elif method == 'rk4':
                    y = np.zeros((len(t), n))
                    y[0] = y0
                    for i in range(1, len(t)):
                        k1 = np.array(system(y[i-1], t[i-1]))
                        k2 = np.array(system(y[i-1] + h/2 * k1, t[i-1] + h/2))
                        k3 = np.array(system(y[i-1] + h/2 * k2, t[i-1] + h/2))
                        k4 = np.array(system(y[i-1] + h * k3, t[i-1] + h))
                        y[i] = y[i-1] + h/6 * (k1 + 2*k2 + 2*k3 + k4)
                        paso = {
                            'paso': i,
                            't': float(t[i-1]),
                            'y_anterior': y[i-1].tolist(),
                            'k1': k1.tolist(),
                            'k2': k2.tolist(),
                            'k3': k3.tolist(),
                            'k4': k4.tolist(),
                            'y_nuevo': y[i].tolist(),
                            'formula': "y(i) = y(i-1) + h/6·(k1 + 2k2 + 2k3 + k4)"
                        }
                        steps.append(paso)
                else:
                    return jsonify({'success': False, 'error': 'Método no soportado', 'details': ''}), 400

                # Formatear resultados
                solution = []
                for i in range(len(t)):
                    sol = {'t': float(t[i])}
                    for j in range(n):
                        sol[f'x{j}'] = float(y[i][j])
                    solution.append(sol)

                return jsonify({
                    'success': True,
                    'solution': solution,
                    'steps': steps,
                    'eigenAnalysis': eigen_analysis,
                    'details': f"Solución usando método {method}"
                })

            except Exception as e:
                return jsonify({
                    'success': False,
                    'error': f"Error en el método numérico: {str(e)}",
                    'details': "Revise las ecuaciones y parámetros"
                }), 400

        else:
            return jsonify({'success': False, 'error': 'Método no soportado', 'details': ''}), 400

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f"Error en el servidor: {str(e)}",
            'details': "Contacte al administrador"
        }), 500
