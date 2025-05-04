import math
import warnings
from flask import Flask, render_template, request, jsonify
import numpy as np
import sympy as sp
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application

from sympy import symbols, parse_expr, log, latex

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
    selected_matrix = data.get('selectedMatrix', 'A')  # 'A' o 'B' por defecto
    
    try:
        # Determinar qué matriz usar para operaciones individuales
        matrix = matrix_a if selected_matrix == 'A' else matrix_b
        
        # Validaciones comunes
        if operation in ['add', 'subtract']:
            if matrix_a.shape != matrix_b.shape:
                raise ValueError("Las matrices deben tener las mismas dimensiones")
        
        if operation in ['multiply']:
            if matrix_a.shape[1] != matrix_b.shape[0]:
                raise ValueError("El número de columnas de A debe coincidir con filas de B")
        
        if operation in ['determinant', 'inverse', 'trace', 'rank']:
            if matrix.shape[0] != matrix.shape[1]:
                raise ValueError("La matriz debe ser cuadrada")
                
        if operation == 'inverse':
            det = np.linalg.det(matrix)
            if abs(det) < 1e-10:  # Tolerancia para valores cercanos a cero
                raise ValueError("La matriz es singular (determinante = 0), no tiene inversa")

        # Operaciones
        if operation == 'add':
            result = (matrix_a + matrix_b).tolist()
        elif operation == 'subtract':
            result = (matrix_a - matrix_b).tolist()
        elif operation == 'multiply':
            result = np.dot(matrix_a, matrix_b).tolist()
        elif operation == 'determinant':
            result = float(np.linalg.det(matrix))
        elif operation == 'inverse':
            result = np.linalg.inv(matrix).tolist()
        elif operation == 'transpose':
            result = matrix.T.tolist()
        elif operation == 'trace':
            result = float(np.trace(matrix))
        elif operation == 'rank':
            result = int(np.linalg.matrix_rank(matrix))
        else:
            raise ValueError("Operación no soportada")
        
        return jsonify({
            'success': True,
            'result': result,
            'details': f"Operación {operation} completada en matriz {selected_matrix}"
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'details': f"Error en operación {operation} con matriz {selected_matrix}"
        })
    
# ********************************************
# *         OPERACIONES CON POLINOMIOS       *
# ********************************************
@app.route('/polynomial_operation', methods=['POST'])
def polynomial_operation():
    data = request.json
    operation = data['operation']
    poly1_str = data['poly1'].replace('^', '**') if 'poly1' in data else None
    poly2_str = data.get('poly2', '').replace('^', '**') if 'poly2' in data else None
    
    x = sp.symbols('x')
    
    try:
        # Validaciones básicas
        if not poly1_str and operation not in ['add', 'subtract', 'multiply']:
            raise ValueError("Se requiere al menos un polinomio")
            
        if operation in ['add', 'subtract', 'multiply'] and not poly2_str:
            raise ValueError("Esta operación requiere dos polinomios")
        
        poly1 = parse_expr(poly1_str, transformations=transformations) if poly1_str else None
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
                details = f"Raíces\\ de\\ {sp.latex(poly1)}"
            else:
                result = "No\\ se\\ encontraron\\ raíces\\ reales"
                details = f"Raíces\\ de\\ {sp.latex(poly1)}"
        
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
            if magnitude == 0:
                raise ValueError("No se puede normalizar el vector cero")
            result = [x/magnitude for x in vector1]
            details = f"Vector normalizado"
            latex_result = "\\hat{" + sp.latex(sp.Matrix(vector1)) + "} = \\frac{" + sp.latex(sp.Matrix(vector1)) + "}{\\|" + sp.latex(sp.Matrix(vector1)) + "\\|} = " + sp.latex(sp.Matrix(result))
            
        elif operation == 'projection':
            if len(vector1) != len(vector2):
                raise ValueError("Los vectores deben tener la misma dimensión")
            dot_product = sum(a * b for a, b in zip(vector1, vector2))
            mag2_squared = sum(x**2 for x in vector2)
            if mag2_squared == 0:
                raise ValueError("No se puede proyectar sobre el vector cero")
            scalar = dot_product / mag2_squared
            result = [x * scalar for x in vector2]
            details = f"Proyección de v1 sobre v2"
            latex_result = "\\text{proj}_{" + sp.latex(sp.Matrix(vector2)) + "}" + sp.latex(sp.Matrix(vector1)) + " = \\left(\\frac{" + sp.latex(sp.Matrix(vector1)) + " \\cdot " + sp.latex(sp.Matrix(vector2)) + "}{\\|" + sp.latex(sp.Matrix(vector2)) + "\\|^2}\\right)" + sp.latex(sp.Matrix(vector2)) + " = " + sp.latex(sp.Matrix(result))
            
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
        function_latex = sp.latex(func, ln_notation=True)
        
        if operation == 'derivative':
            result = sp.diff(func, x)
            details = f"\\frac{{d}}{{dx}}\\left({function_latex}\\right)"
        elif operation == 'integral':
            result = sp.integrate(func, x)
            details = f"\\int \\left({function_latex}\\right) \\, dx"
            if not result.has(sp.Integral):
                result = sp.Add(result, sp.Symbol('C'), evaluate=False)
        elif operation == 'limit':
            point = data['point']
            if point == 'oo':
                point = sp.oo
            elif point == '-oo':
                point = -sp.oo
            else:
                point = float(point)
            result = sp.limit(func, x, point)
            details = f"\\lim_{{x \\to {sp.latex(point)}}} \\left({function_latex}\\right)"
        elif operation == 'taylor':
            point = float(data['point'])
            degree = int(data['degree'])
            result = sp.series(func, x, point, degree).removeO()
            details = f"\\text{{Serie de Taylor alrededor de }} x={point} \\text{{ hasta grado }} {degree}"
        
        return jsonify({
            'success': True,
            'result': sp.latex(result, ln_notation=True) if result is not None else "",
            'details': details,
            'function_latex': function_latex,
            'operation': operation
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'operation': operation
        })

# ********************************************
# *     ECUACIONES DIFERENCIALES             *
# ********************************************
@app.route('/differential_operation', methods=['POST'])
def differential_operation():
    data = request.get_json()
    
    # Validación básica de datos recibidos
    if not data:
        return jsonify({
            'success': False,
            'error': 'No se recibieron datos',
            'method': 'unknown',
            'show_graph': False,
            'graph_data': None
        }), 400

    try:
        # Obtener datos de la solicitud con valores por defecto
        method = data.get('method', 'analytical')
        equation_str = data.get('equation', '').strip()
        initial_x = float(data.get('initial_x', 0))
        initial_y = float(data.get('initial_y', 1))
        step_size = float(data.get('step_size', 0.1))
        num_points = int(data.get('num_points', 10))
        show_graph = bool(data.get('show_graph', True))
        
        # Validación de parámetros
        if not equation_str:
            raise ValueError("La ecuación no puede estar vacía")
        if num_points < 2 or num_points > 100:
            raise ValueError("El número de puntos debe estar entre 2 y 100")
        if step_size <= 0:
            raise ValueError("El paso (h) debe ser mayor que cero")

        # Preprocesamiento de la ecuación
        equation_str = equation_str.replace('^', '**').replace("'", "'")
        
        # Convertir derivadas a formato SymPy
        if "y''" in equation_str:
            equation_str = equation_str.replace("y''", "sp.Derivative(y, x, x)")
        elif "y'" in equation_str:
            equation_str = equation_str.replace("y'", "sp.Derivative(y, x)")
        elif "dy/dx" in equation_str:
            equation_str = equation_str.replace("dy/dx", "sp.Derivative(y, x)")
        elif "dydx" in equation_str:
            equation_str = equation_str.replace("dydx", "sp.Derivative(y, x)")
        
        # Verificar si contiene derivadas
        if "Derivative" not in equation_str:
            raise ValueError("La ecuación debe contener derivadas (use y', y'', dy/dx o Derivative(y, x))")

        # Preparar entorno seguro para eval
        x = sp.symbols('x')
        y = sp.Function('y')(x)
        safe_dict = {
            'sp': sp,
            'y': y,
            'x': x,
            'exp': sp.exp,
            'log': sp.log,
            'sin': sp.sin,
            'cos': sp.cos,
            'tan': sp.tan,
            'sqrt': sp.sqrt,
            '__builtins__': None
        }

        # Parsear la ecuación
        try:
            if '=' in equation_str:
                lhs, rhs = equation_str.split('=', 1)
                eq = sp.Eq(eval(lhs.strip(), safe_dict), eval(rhs.strip(), safe_dict))
            else:
                eq = sp.Eq(eval(equation_str, safe_dict), 0)
        except Exception as e:
            raise ValueError(f"Error al parsear la ecuación: {str(e)}")

        # Verificar que sea una ecuación diferencial
        derivatives = [arg for arg in eq.atoms(sp.Derivative)]
        if not derivatives:
            raise ValueError("No se detectaron derivadas en la ecuación")

        # RESOLVER LA ECUACIÓN
        if method == 'analytical':
            try:
                # Para ecuaciones de primer orden
                if any(d.derivative_count == 1 for d in derivatives):
                    sol = sp.dsolve(eq, y, ics={y.subs(x, initial_x): initial_y})
                # Para ecuaciones de segundo orden
                else:
                    ics = {
                        y.subs(x, initial_x): initial_y,
                        sp.Derivative(y, x).subs(x, initial_x): 0
                    }
                    sol = sp.dsolve(eq, y, ics=ics)
                
                return jsonify({
                    'success': True,
                    'solution': sp.latex(sol.rhs),
                    'equation_latex': sp.latex(eq),
                    'method': method,
                    'initial_x': initial_x,
                    'initial_y': initial_y,
                    'show_graph': False,
                    'graph_data': None
                })
                
            except Exception as e:
                raise ValueError(f"No se pudo resolver analíticamente: {str(e)}")
                
        else:  # MÉTODOS NUMÉRICOS
            # Resolver para y'
            solved = sp.solve(eq, sp.Derivative(y, x))
            if not solved:
                raise ValueError("No se puede resolver la ecuación para y'")
            
            f_sym = solved[0]
            f = sp.lambdify((x, y), f_sym, 'numpy')
            
            # Inicializar arrays
            x_vals = np.linspace(initial_x, initial_x + (num_points-1)*step_size, num_points)
            y_vals = np.zeros(num_points)
            y_vals[0] = initial_y
            
            # Preparar detalles del método
            method_details = []
            method_steps = []
            
            if method == 'euler':
                method_details.append("Fórmula de Euler:")
                method_details.append("yₙ₊₁ = yₙ + h·f(xₙ, yₙ)")
                
                for i in range(1, num_points):
                    f_val = f(x_vals[i-1], y_vals[i-1])
                    y_vals[i] = y_vals[i-1] + step_size * f_val
                    method_details.append(f"Paso {i}: y({x_vals[i]:.4f}) = {y_vals[i-1]:.6f} + {step_size:.6f}·{f_val:.6f} = {y_vals[i]:.6f}")
                    method_steps.append({'f': float(f_val)})
                    
            elif method == 'improved_euler':
                method_details.append("Fórmula de Euler Mejorado (Heun):")
                method_details.append("yₙ₊₁ = yₙ + (h/2)·[f(xₙ, yₙ) + f(xₙ₊₁, yₙ + h·f(xₙ, yₙ))]")
                
                for i in range(1, num_points):
                    k1 = f(x_vals[i-1], y_vals[i-1])
                    y_pred = y_vals[i-1] + step_size * k1
                    k2 = f(x_vals[i], y_pred)
                    y_vals[i] = y_vals[i-1] + (step_size/2) * (k1 + k2)
                    method_details.append(f"Paso {i}:")
                    method_details.append(f"  k1 = f({x_vals[i-1]:.4f}, {y_vals[i-1]:.6f}) = {k1:.6f}")
                    method_details.append(f"  y* = {y_vals[i-1]:.6f} + {step_size:.6f}·{k1:.6f} = {y_pred:.6f}")
                    method_details.append(f"  k2 = f({x_vals[i]:.4f}, {y_pred:.6f}) = {k2:.6f}")
                    method_details.append(f"  y({x_vals[i]:.4f}) = {y_vals[i-1]:.6f} + {step_size/2:.6f}·({k1:.6f} + {k2:.6f}) = {y_vals[i]:.6f}")
                    method_steps.append({'k1': float(k1), 'k2': float(k2)})
                    
            elif method == 'runge_kutta':
                method_details.append("Fórmula de Runge-Kutta (4to orden):")
                method_details.append("k1 = f(xₙ, yₙ)")
                method_details.append("k2 = f(xₙ + h/2, yₙ + (h/2)·k1)")
                method_details.append("k3 = f(xₙ + h/2, yₙ + (h/2)·k2)")
                method_details.append("k4 = f(xₙ + h, yₙ + h·k3)")
                method_details.append("yₙ₊₁ = yₙ + (h/6)·(k1 + 2k2 + 2k3 + k4)")
                
                for i in range(1, num_points):
                    h = step_size
                    k1 = f(x_vals[i-1], y_vals[i-1])
                    k2 = f(x_vals[i-1] + h/2, y_vals[i-1] + (h/2)*k1)
                    k3 = f(x_vals[i-1] + h/2, y_vals[i-1] + (h/2)*k2)
                    k4 = f(x_vals[i-1] + h, y_vals[i-1] + h*k3)
                    y_vals[i] = y_vals[i-1] + (h/6)*(k1 + 2*k2 + 2*k3 + k4)
                    method_details.append(f"Paso {i}:")
                    method_details.append(f"  k1 = f({x_vals[i-1]:.4f}, {y_vals[i-1]:.6f}) = {k1:.6f}")
                    method_details.append(f"  k2 = f({x_vals[i-1]+h/2:.4f}, {y_vals[i-1] + (h/2)*k1:.6f}) = {k2:.6f}")
                    method_details.append(f"  k3 = f({x_vals[i-1]+h/2:.4f}, {y_vals[i-1] + (h/2)*k2:.6f}) = {k3:.6f}")
                    method_details.append(f"  k4 = f({x_vals[i-1]+h:.4f}, {y_vals[i-1] + h*k3:.6f}) = {k4:.6f}")
                    method_details.append(f"  y({x_vals[i]:.4f}) = {y_vals[i-1]:.6f} + {h/6:.6f}·({k1:.6f} + 2·{k2:.6f} + 2·{k3:.6f} + {k4:.6f}) = {y_vals[i]:.6f}")
                    method_steps.append({'k1': float(k1), 'k2': float(k2), 'k3': float(k3), 'k4': float(k4)})
            
            elif method == 'taylor':
                # Configuración inicial
                sp.init_printing(strict=False)
                method_details.append("Método de Taylor (2do orden):")
                method_details.append("yₙ₊₁ = yₙ + h·f(xₙ, yₙ) + (h²/2)·f'(xₙ, yₙ)")
                method_details.append("Donde f' = ∂f/∂x + ∂f/∂y·f(x,y)")
                
                try:
                    # 1. Intentar cálculo simbólico exacto de las derivadas
                    try:
                        df_dx = sp.diff(f_sym, x)
                        df_dy = sp.diff(f_sym, y)
                        
                        # Verificar si hay derivadas de orden superior
                        if df_dx.has(sp.Derivative) or df_dy.has(sp.Derivative):
                            method_details.append("Advertencia: La ecuación contiene derivadas de orden superior")
                            method_details.append("Usando aproximación numérica para las derivadas")
                            raise ValueError("Derivadas de orden superior detectadas")
                            
                        df_total = df_dx + df_dy * f_sym
                        f_prime = sp.lambdify((x, y), df_total, 'numpy')
                        
                    except:
                        # 2. Si falla el método simbólico, usar aproximación numérica
                        method_details.append("Usando aproximación numérica para f'")
                        h_small = 1e-5  # Pequeño paso para derivadas numéricas
                        
                        def f_prime(x_val, y_val):
                            # ∂f/∂x ≈ [f(x+h,y) - f(x-h,y)] / 2h
                            df_dx = (f(x_val + h_small, y_val) - f(x_val - h_small, y_val)) / (2 * h_small)
                            
                            # ∂f/∂y ≈ [f(x,y+h) - f(x,y-h)] / 2h
                            df_dy = (f(x_val, y_val + h_small) - f(x_val, y_val - h_small)) / (2 * h_small)
                            
                            # f' = ∂f/∂x + ∂f/∂y * f(x,y)
                            return df_dx + df_dy * f(x_val, y_val)
                    
                    # Aplicar el método
                    for i in range(1, num_points):
                        h = step_size
                        x_prev = x_vals[i-1]
                        y_prev = y_vals[i-1]
                        
                        try:
                            f_val = f(x_prev, y_prev)
                            f_prime_val = f_prime(x_prev, y_prev)
                            
                            if not np.isfinite(f_val) or not np.isfinite(f_prime_val):
                                raise ValueError("Valores no finitos en el cálculo")
                            
                            y_vals[i] = y_prev + h * f_val + (h**2)/2 * f_prime_val
                            
                            method_details.append(f"Paso {i}:")
                            method_details.append(f"  f({x_prev:.4f}, {y_prev:.6f}) = {f_val:.6f}")
                            method_details.append(f"  f'({x_prev:.4f}, {y_prev:.6f}) = {f_prime_val:.6f}")
                            method_details.append(f"  y({x_vals[i]:.4f}) = {y_prev:.6f} + {h:.6f}·{f_val:.6f} + {h**2/2:.6f}·{f_prime_val:.6f} = {y_vals[i]:.6f}")
                            
                            method_steps.append({
                                'f': float(f_val),
                                'f_prime': float(f_prime_val)
                            })
                            
                        except Exception as e:
                            raise ValueError(f"Error en paso {i}: {str(e)}")
                            
                except Exception as e:
                    # Si todo falla, sugerir otro método
                    raise ValueError(f"""
                        El método Taylor no pudo procesar esta ecuación: {str(e)}
                        Sugerencia: Prueba con Runge-Kutta 4to orden que es más robusto
                        para ecuaciones complejas o con derivadas de orden superior.
                    """)
            
            else:
                raise ValueError(f"Método desconocido: {method}")

            # Preparar datos de respuesta
            response_data = {
                'success': True,
                'solution': [{'x': float(x), 'y': float(y)} for x, y in zip(x_vals, y_vals)],
                'equation_latex': sp.latex(eq),
                'method': method,
                'method_details': method_details,
                'method_steps': method_steps,
                'initial_x': initial_x,
                'initial_y': initial_y,
                'step_size': step_size,
                'num_points': num_points,
                'show_graph': show_graph
            }

            if show_graph:
                response_data['graph_data'] = {
                    'x_values': [float(x) for x in x_vals],
                    'y_values': [float(y) for y in y_vals]
                }

            return jsonify(response_data)
            
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'method': data.get('method', 'unknown'),
            'show_graph': data.get('show_graph', False),
            'graph_data': None
        }), 400
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f"Error inesperado: {str(e)}",
            'method': data.get('method', 'unknown'),
            'show_graph': data.get('show_graph', False),
            'graph_data': None
        }), 500

if __name__ == '__main__':
    app.run(debug=True)