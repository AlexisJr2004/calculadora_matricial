from flask import Blueprint, request, jsonify
import sympy as sp
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application

calculus_bp = Blueprint('calculus_bp', __name__)

transformations = (standard_transformations + (implicit_multiplication_application,))


# ******************************************
# *         OPERACIONES DE CÁLCULO         *
# ******************************************
@calculus_bp.route('/calculus_operation', methods=['POST'])
def calculus_operation():
    data = request.json
    operation = data['operation']
    func_str = data['function'].replace('^', '**')
    show_steps = data.get('show_steps', False)
    variable = data.get('variable', 'x')  # Obtener la variable del request
    
    # Crear el símbolo dinámicamente según la variable proporcionada
    var_symbol = sp.symbols(variable)
    steps = []
    
    try:
        func = parse_expr(func_str, transformations=transformations)
        result = None
        details = ""
        function_latex = sp.latex(func, ln_notation=True)
        
        if operation == 'derivative':
            if show_steps:
                steps.append(f"f({variable}) = {function_latex}")
                
                derivative_steps = []
                for term in sp.Add.make_args(func):
                    derivative = sp.diff(term, var_symbol)
                    if derivative != 0:
                        term_latex = sp.latex(term, ln_notation=True)
                        deriv_latex = sp.latex(derivative, ln_notation=True)
                        derivative_steps.append(f"\\frac{{d}}{{d{variable}}}({term_latex}) = {deriv_latex}")
                
                steps.extend(derivative_steps)
            
            result = sp.diff(func, var_symbol)
            details = f"\\frac{{d}}{{d{variable}}}\\left({function_latex}\\right)"
            
        elif operation == 'integral':
            if show_steps:
                steps.append(f"\\int \\left({function_latex}\\right) \\, d{variable}")
                
                if func.is_Add:
                    steps.append("\\text{Descomponiendo en integrales más simples:}")
                    for term in sp.Add.make_args(func):
                        term_latex = sp.latex(term, ln_notation=True)
                        steps.append(f"\\int {term_latex} \\, d{variable}")
            
            result = sp.integrate(func, var_symbol)
            details = f"\\int \\left({function_latex}\\right) \\, d{variable}"
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
                
            if show_steps:
                steps.append(f"\\lim_{{{variable} \\to {sp.latex(point)}}} \\left({function_latex}\\right)")
                
                try:
                    direct_eval = func.subs(var_symbol, point)
                    steps.append(f"\\text{{Evaluación directa: }} {sp.latex(direct_eval)}")
                except:
                    steps.append("\\text{Evaluación directa no posible, aplicando reglas de límites}")
            
            result = sp.limit(func, var_symbol, point)
            details = f"\\lim_{{{variable} \\to {sp.latex(point)}}} \\left({function_latex}\\right)"
            
        elif operation == 'taylor':
            point = float(data['point'])
            degree = int(data['degree'])
            
            if show_steps:
                steps.append(f"\\text{{Serie de Taylor de }} {function_latex} \\text{{ alrededor de }} {variable}={point}")
                
                for n in range(degree + 1):
                    derivative = func.diff(var_symbol, n)
                    deriv_at_point = derivative.subs(var_symbol, point)
                    term = (deriv_at_point / sp.factorial(n)) * (var_symbol - point)**n
                    steps.append(
                        f"f^{{(n)}}({point}) = {sp.latex(deriv_at_point)}, "
                        f"\\text{{Término }} n={n}: \\frac{{{sp.latex(deriv_at_point)}}}{{{n}!}}({variable}-{point})^{n} = {sp.latex(term)}"
                    )
            
            result = sp.series(func, var_symbol, point, degree).removeO()
            details = f"\\text{{Serie de Taylor alrededor de }} {variable}={point} \\text{{ hasta grado }} {degree}"
        
        return jsonify({
            'success': True,
            'result': sp.latex(result, ln_notation=True) if result is not None else "",
            'details': details,
            'function_latex': function_latex,
            'operation': operation,
            'steps': steps if show_steps else []
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'operation': operation
        })
    data = request.json
    operation = data['operation']
    func_str = data['function'].replace('^', '**')
    show_steps = data.get('show_steps', False)
    
    x = sp.symbols('x')
    steps = []
    
    try:
        func = parse_expr(func_str, transformations=transformations)
        result = None
        details = ""
        function_latex = sp.latex(func, ln_notation=True)
        
        if operation == 'derivative':
            if show_steps:
                # Paso 1: Mostrar la función original
                steps.append(f"f(x) = {function_latex}")
                
                # Paso 2: Aplicar reglas de derivación
                derivative_steps = []
                for term in sp.Add.make_args(func):
                    derivative = sp.diff(term, x)
                    if derivative != 0:
                        term_latex = sp.latex(term, ln_notation=True)
                        deriv_latex = sp.latex(derivative, ln_notation=True)
                        derivative_steps.append(f"\\frac{{d}}{{dx}}({term_latex}) = {deriv_latex}")
                
                steps.extend(derivative_steps)
            
            result = sp.diff(func, x)
            details = f"\\frac{{d}}{{dx}}\\left({function_latex}\\right)"
            
        elif operation == 'integral':
            if show_steps:
                steps.append(f"\\int \\left({function_latex}\\right) \\, dx")
                
                # Intentar descomponer en integrales más simples
                if func.is_Add:
                    steps.append("\\text{Descomponiendo en integrales más simples:}")
                    for term in sp.Add.make_args(func):
                        term_latex = sp.latex(term, ln_notation=True)
                        steps.append(f"\\int {term_latex} \\, dx")
            
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
                
            if show_steps:
                steps.append(f"\\lim_{{x \\to {sp.latex(point)}}} \\left({function_latex}\\right)")
                
                # Intentar evaluar directamente
                try:
                    direct_eval = func.subs(x, point)
                    steps.append(f"\\text{{Evaluación directa: }} {sp.latex(direct_eval)}")
                except:
                    steps.append("\\text{Evaluación directa no posible, aplicando reglas de límites}")
            
            result = sp.limit(func, x, point)
            details = f"\\lim_{{x \\to {sp.latex(point)}}} \\left({function_latex}\\right)"
            
        elif operation == 'taylor':
            point = float(data['point'])
            degree = int(data['degree'])
            
            if show_steps:
                steps.append(f"\\text{{Serie de Taylor de }} {function_latex} \\text{{ alrededor de }} x={point}")
                
                # Calcular derivadas paso a paso
                for n in range(degree + 1):
                    derivative = func.diff(x, n)
                    deriv_at_point = derivative.subs(x, point)
                    term = (deriv_at_point / sp.factorial(n)) * (x - point)**n
                    steps.append(
                        f"f^{{(n)}}({point}) = {sp.latex(deriv_at_point)}, "
                        f"\\text{{Término }} n={n}: \\frac{{{sp.latex(deriv_at_point)}}}{{{n}!}}(x-{point})^{n} = {sp.latex(term)}"
                    )
            
            result = sp.series(func, x, point, degree).removeO()
            details = f"\\text{{Serie de Taylor alrededor de }} x={point} \\text{{ hasta grado }} {degree}"
        
        return jsonify({
            'success': True,
            'result': sp.latex(result, ln_notation=True) if result is not None else "",
            'details': details,
            'function_latex': function_latex,
            'operation': operation,
            'steps': steps if show_steps else []
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'operation': operation
        })