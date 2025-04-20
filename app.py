import math
from flask import Flask, render_template, request, jsonify
import numpy as np
import sympy as sp
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application
from sympy.parsing.sympy_parser import standard_transformations, implicit_multiplication_application
transformations = standard_transformations + (implicit_multiplication_application,)

app = Flask(__name__)

# Transformaciones para analizar expresiones polinómicas
transformations = (standard_transformations + (implicit_multiplication_application,))

@app.route('/')
def index():
    return render_template('index.html')

# ******************************************
# *         OPERACIONES CON MATRICES       *
# ******************************************
@app.route('/matrix_operation', methods=['POST'])
def matrix_operation():
    data = request.json
    operation = data['operation']
    matrix_a = np.array(data['matrixA'])
    matrix_b = np.array(data['matrixB']) if 'matrixB' in data else None
    
    try:
        # Validaciones comunes
        if operation in ['add', 'subtract']:
            if matrix_a.shape != matrix_b.shape:
                raise ValueError("Las matrices deben tener las mismas dimensiones")
        
        if operation in ['multiply']:
            if matrix_a.shape[1] != matrix_b.shape[0]:
                raise ValueError("El número de columnas de A debe coincidir con filas de B")
        
        if operation in ['determinant', 'inverse', 'trace']:
            if matrix_a.shape[0] != matrix_a.shape[1]:
                raise ValueError("La matriz debe ser cuadrada")

        # Operaciones
        if operation == 'add':
            result = (matrix_a + matrix_b).tolist()
        elif operation == 'subtract':
            result = (matrix_a - matrix_b).tolist()
        elif operation == 'multiply':
            result = np.dot(matrix_a, matrix_b).tolist()
        elif operation == 'determinant':
            result = float(np.linalg.det(matrix_a))
        elif operation == 'inverse':
            result = np.linalg.inv(matrix_a).tolist()
        elif operation == 'transpose':
            result = matrix_a.T.tolist()
        elif operation == 'trace':
            result = float(np.trace(matrix_a))
        elif operation == 'rank':
            result = int(np.linalg.matrix_rank(matrix_a))
        else:
            raise ValueError("Operación no soportada")
        
        return jsonify({
            'success': True,
            'result': result,
            'details': f"Operación {operation} completada"
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'details': "Error en operación matricial"
        })

# ********************************************
# *         OPERACIONES CON POLINOMIOS       *
# ********************************************
@app.route('/polynomial_operation', methods=['POST'])
def polynomial_operation():
    data = request.json
    operation = data['operation']
    poly1_str = data['poly1'].replace('^', '**')
    poly2_str = data.get('poly2', '').replace('^', '**') if 'poly2' in data else None
    
    x = sp.symbols('x')
    
    try:
        poly1 = parse_expr(poly1_str, transformations=transformations)
        poly2 = parse_expr(poly2_str, transformations=transformations) if poly2_str else None  
        result = None
        details = ""
        if operation == 'add':
            result = sp.expand(poly1 + poly2)
            details = f"({sp.latex(poly1)}) + ({sp.latex(poly2)})"
        elif operation == 'subtract':
            result = sp.expand(poly1 - poly2)
            details = f"({sp.latex(poly1)}) - ({sp.latex(poly2)})"
        elif operation == 'multiply':
            result = sp.expand(poly1 * poly2)
            details = f"({sp.latex(poly1)}) \\times ({sp.latex(poly2)})"
        elif operation == 'derivative':
            result = sp.diff(poly1, x)
            details = f"\\frac{{d}}{{dx}}({sp.latex(poly1)})"
        elif operation == 'integral':
            result = sp.integrate(poly1, x)
            details = f"\\int ({sp.latex(poly1)}) \\, dx"
            if not result.has(sp.Integral):
                result = sp.Add(result, sp.Symbol('C'), evaluate=False)
        elif operation == 'roots':
            roots = sp.roots(poly1, x)
            if roots:
                result = sp.FiniteSet(*roots.keys())
                details = f"Roots\\ of\\ {sp.latex(poly1)}"
            else:
                result = "No roots found"
                details = f"Could not find roots for {sp.latex(poly1)}"    
        return jsonify({
            'success': True,
            'result': sp.latex(result) if result is not None else "",
            'details': details,
            'operation': operation
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'operation': operation
        })

# ********************************************
# *         OPERACIONES CON VECTORES         *
# ********************************************
@app.route('/vector_operation', methods=['POST'])
def vector_operation():
    data = request.json
    operation = data['operation']
    
    try:
        # Parsear los vectores
        vector1 = [float(x.strip()) for x in data['vector1'].split(',')]
        vector2 = [float(x.strip()) for x in data['vector2'].split(',')] if 'vector2' in data else None
        
        result = None
        details = ""
        latex_result = ""
        
        if operation == 'add':
            if len(vector1) != len(vector2):
                raise ValueError("Los vectores deben tener la misma dimensión")
            result = [a + b for a, b in zip(vector1, vector2)]
            details = f"Suma de vectores"
            latex_result = sp.latex(sp.Matrix(vector1)) + " + " + sp.latex(sp.Matrix(vector2)) + " = " + sp.latex(sp.Matrix(result))
            
        elif operation == 'subtract':
            if len(vector1) != len(vector2):
                raise ValueError("Los vectores deben tener la misma dimensión")
            result = [a - b for a, b in zip(vector1, vector2)]
            details = f"Resta de vectores"
            latex_result = sp.latex(sp.Matrix(vector1)) + " - " + sp.latex(sp.Matrix(vector2)) + " = " + sp.latex(sp.Matrix(result))
            
        elif operation == 'dot':
            if len(vector1) != len(vector2):
                raise ValueError("Los vectores deben tener la misma dimensión")
            result = sum(a * b for a, b in zip(vector1, vector2))
            details = f"Producto punto"
            latex_result = sp.latex(sp.Matrix(vector1)) + " \\cdot " + sp.latex(sp.Matrix(vector2)) + " = " + sp.latex(result)
            
        elif operation == 'cross':
            if len(vector1) != 3 or len(vector2) != 3:
                raise ValueError("El producto cruz solo está definido para vectores 3D")
            result = [
                vector1[1]*vector2[2] - vector1[2]*vector2[1],
                vector1[2]*vector2[0] - vector1[0]*vector2[2],
                vector1[0]*vector2[1] - vector1[1]*vector2[0]
            ]
            details = f"Producto cruz"
            latex_result = sp.latex(sp.Matrix(vector1)) + " \\times " + sp.latex(sp.Matrix(vector2)) + " = " + sp.latex(sp.Matrix(result))
            
        elif operation == 'magnitude':
            result = math.sqrt(sum(x**2 for x in vector1))
            details = f"Magnitud del vector"
            latex_result = "\\|" + sp.latex(sp.Matrix(vector1)) + "\\| = " + sp.latex(result)
            
        elif operation == 'angle':
            if len(vector1) != len(vector2):
                raise ValueError("Los vectores deben tener la misma dimensión")
            dot_product = sum(a * b for a, b in zip(vector1, vector2))
            mag1 = math.sqrt(sum(x**2 for x in vector1))
            mag2 = math.sqrt(sum(x**2 for x in vector2))
            angle_rad = math.acos(dot_product / (mag1 * mag2))
            result = math.degrees(angle_rad)
            details = f"Ángulo entre vectores (grados)"
            latex_result = "\\theta = \\arccos\\left(\\frac{" + sp.latex(sp.Matrix(vector1)) + " \\cdot " + sp.latex(sp.Matrix(vector2)) + "}{\\|" + sp.latex(sp.Matrix(vector1)) + "\\| \\cdot \\|" + sp.latex(sp.Matrix(vector2)) + "\\|}\\right) = " + sp.latex(result) + "^\\circ"
            
        elif operation == 'normalize':
            magnitude = math.sqrt(sum(x**2 for x in vector1))
            result = [x/magnitude for x in vector1]
            details = f"Vector normalizado"
            latex_result = "\\hat{" + sp.latex(sp.Matrix(vector1)) + "} = \\frac{" + sp.latex(sp.Matrix(vector1)) + "}{\\|" + sp.latex(sp.Matrix(vector1)) + "\\|} = " + sp.latex(sp.Matrix(result))
            
        return jsonify({
            'success': True,
            'result': result,
            'latex_result': latex_result,
            'details': details,
            'operation': operation
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'operation': operation
        })

# ******************************************
# *         GRÁFICAS DE GRÁFICAS           *
# ******************************************
@app.route('/plot_function', methods=['POST'])
def plot_function():
    data = request.json
    plot_type = data['type']
    func_str = data['function'].replace('^', '**')
    
    try:
        x = sp.symbols('x')
        y = sp.symbols('y')
        
        # Parsear la función
        func = parse_expr(func_str, transformations=transformations)
        
        if plot_type == '2d':
            x_min = float(data.get('x_min', -10))
            x_max = float(data.get('x_max', 10))
            
            # Crear datos para el gráfico
            x_vals = np.linspace(x_min, x_max, 400)
            y_vals = [float(func.subs(x, val).evalf()) for val in x_vals]
            
            return jsonify({
                'success': True,
                'type': '2d',
                'x': x_vals.tolist(),
                'y': y_vals,
                'function': sp.latex(func),
                'x_range': [x_min, x_max]
            })
            
        elif plot_type == '3d':
            x_min = float(data.get('x_min', -5))
            x_max = float(data.get('x_max', 5))
            y_min = float(data.get('y_min', -5))
            y_max = float(data.get('y_max', 5))
            
            # Crear datos para el gráfico 3D
            x_vals = np.linspace(x_min, x_max, 50)
            y_vals = np.linspace(y_min, y_max, 50)
            X, Y = np.meshgrid(x_vals, y_vals)
            
            # Evaluar la función en la malla
            Z = np.zeros_like(X)
            for i in range(X.shape[0]):
                for j in range(X.shape[1]):
                    try:
                        Z[i,j] = float(func.subs({x: X[i,j], y: Y[i,j]}).evalf())
                    except:
                        Z[i,j] = np.nan
            
            return jsonify({
                'success': True,
                'type': '3d',
                'x': X.tolist(),
                'y': Y.tolist(),
                'z': Z.tolist(),
                'function': sp.latex(func),
                'x_range': [x_min, x_max],
                'y_range': [y_min, y_max]
            })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'type': plot_type
        })

# ******************************************
# *         OPERACIONES DE CÁLCULO         *
# ******************************************
@app.route('/calculus_operation', methods=['POST'])
def calculus_operation():
    data = request.json
    operation = data['operation']
    func_str = data['function'].replace('^', '**')
    
    x = sp.symbols('x')
    
    try:
        func = parse_expr(func_str, transformations=transformations)
        result = None
        details = ""
        
        if operation == 'derivative':
            result = sp.diff(func, x)
            details = f"\\frac{{d}}{{dx}}\\left({sp.latex(func, ln_notation=True)}\\right)"
        elif operation == 'integral':
            result = sp.integrate(func, x)
            details = f"\\int \\left({sp.latex(func, ln_notation=True)}\\right) \\, dx"
            if not result.has(sp.Integral):
                result = sp.Add(result, sp.Symbol('C'), evaluate=False)
        return jsonify({
            'success': True,
            'result': sp.latex(result, ln_notation=True) if result is not None else "",
            'details': details,
            'operation': operation
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'operation': operation
        })

if __name__ == '__main__':
    app.run(debug=True)