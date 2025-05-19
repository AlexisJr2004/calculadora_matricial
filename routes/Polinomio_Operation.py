from flask import Blueprint, request, jsonify
import sympy as sp
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application

polynomial_bp = Blueprint('polynomial_bp', __name__)

transformations = (standard_transformations + (implicit_multiplication_application,))

# ********************************************
# *         OPERACIONES CON POLINOMIOS       *
# ********************************************
@polynomial_bp.route('/polynomial_operation', methods=['POST'])
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
    