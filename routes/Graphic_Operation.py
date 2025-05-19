from flask import Blueprint, request, jsonify
import numpy as np
import sympy as sp
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application
from sympy import symbols, log, latex

plot_bp = Blueprint('plot_bp', __name__)

# Transformaciones para analizar expresiones polinómicas
transformations = (standard_transformations + (implicit_multiplication_application,))

# ******************************************
# *         GRÁFICAS DE GRÁFICAS           *
# ******************************************
@plot_bp.route('/plot_function', methods=['POST'])
def plot_function():
    data = request.json
    plot_type = data['type']
    func_str = data['function'].replace('^', '**').replace('ln', 'log')
    
    try:
        x, y = symbols('x y')
        
        # Parsear la función
        func = parse_expr(func_str, transformations=transformations, local_dict={'log': log})
        
        if plot_type == '2d':
            x_min = float(data.get('x_min', -10))
            x_max = float(data.get('x_max', 10))
            
            # Ajuste para funciones logarítmicas
            if 'log(x)' in func_str:
                x_min = max(0.0001, x_min)
            
            # Crear datos para el gráfico
            x_vals = np.linspace(x_min, x_max, 400)
            y_vals = []
            for val in x_vals:
                try:
                    y_val = float(func.subs(x, val).evalf())
                    y_vals.append(y_val if abs(y_val) < 1e10 else np.nan)
                except:
                    y_vals.append(np.nan)
            
            return jsonify({
                'success': True,
                'type': '2d',
                'x': x_vals.tolist(),
                'y': y_vals,
                'function': latex(func),
                'x_range': [x_min, x_max]
            })
            
        elif plot_type == '3d':
            x_min = float(data.get('x_min', -5))
            x_max = float(data.get('x_max', 5))
            y_min = float(data.get('y_min', -5))
            y_max = float(data.get('y_max', 5))
            
            # Ajuste para funciones logarítmicas
            if 'log(x)' in func_str:
                x_min = max(0.0001, x_min)
            if 'log(y)' in func_str:
                y_min = max(0.0001, y_min)
            
            # Crear datos para el gráfico 3D
            x_vals = np.linspace(x_min, x_max, 50)
            y_vals = np.linspace(y_min, y_max, 50)
            X, Y = np.meshgrid(x_vals, y_vals)
            
            # Evaluar la función en la malla
            Z = np.zeros_like(X)
            for i in range(X.shape[0]):
                for j in range(X.shape[1]):
                    try:
                        val = float(func.subs({x: X[i,j], y: Y[i,j]}).evalf())
                        Z[i,j] = val if abs(val) < 1e10 else np.nan
                    except:
                        Z[i,j] = np.nan
            
            return jsonify({
                'success': True,
                'type': '3d',
                'x': X.tolist(),
                'y': Y.tolist(),
                'z': Z.tolist(),
                'function': latex(func),
                'x_range': [x_min, x_max],
                'y_range': [y_min, y_max]
            })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'type': plot_type
        })