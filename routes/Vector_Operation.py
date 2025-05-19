from flask import Blueprint, request, jsonify
import math
import sympy as sp

vector_bp = Blueprint('vector_bp', __name__)


# ********************************************
# *         OPERACIONES CON VECTORES         *
# ********************************************

@vector_bp.route('/vector_operation', methods=['POST'])
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