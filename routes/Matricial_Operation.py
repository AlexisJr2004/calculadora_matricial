from flask import Blueprint, request, jsonify
import numpy as np
from sympy import Matrix, latex

matrix_bp = Blueprint('matrix_bp', __name__)

# ******************************************
# *         OPERACIONES CON MATRICES       *
# ******************************************
FORMULAS = {
    'add': 'C_{ij} = A_{ij} + B_{ij}',
    'subtract': 'C_{ij} = A_{ij} - B_{ij}',
    'multiply': 'C_{ij} = \sum_{k=1}^{n} A_{ik} \cdot B_{kj}',
    'determinant': r'\det(A) = \sum_{\sigma \in S_n} \text{sgn}(\sigma) \prod_{i=1}^{n} a_{i,\sigma(i)}',
    'inverse': 'A^{-1} = \\frac{1}{\det(A)} \cdot \text{adj}(A)',
    'transpose': 'A^T_{ij} = A_{ji}',
    'trace': r'\text{tr}(A) = \sum_{i=1}^{n} a_{ii}',
    'rank': r'\text{rank}(A) = \dim(\text{col}(A)) = \dim(\text{row}(A))'
}

@matrix_bp.route('/matrix_operation', methods=['POST'])
def matrix_operation():
    data = request.json
    operation = data['operation']
    matrix_a = np.array(data['matrixA'], dtype=float)
    matrix_b = np.array(data['matrixB'], dtype=float) if 'matrixB' in data else None
    selected_matrix = data.get('selectedMatrix', 'A')

    try:
        # Validaciones básicas
        if operation in ['add', 'subtract', 'multiply'] and matrix_b is None:
            raise ValueError("Se requieren ambas matrices para esta operación")

        if operation in ['add', 'subtract'] and matrix_a.shape != matrix_b.shape:
            raise ValueError("Las matrices deben tener las mismas dimensiones para suma/resta")

        if operation == 'multiply' and matrix_a.shape[1] != matrix_b.shape[0]:
            raise ValueError(f"No coinciden las dimensiones para multiplicación: {matrix_a.shape} vs {matrix_b.shape}")

        if operation in ['determinant', 'inverse', 'trace']:
            if matrix_a.shape[0] != matrix_a.shape[1]:
                raise ValueError("La matriz debe ser cuadrada para esta operación")

        # Realizar operación
        result, steps = matrix_operation_steps(
            operation, matrix_a, matrix_b, selected_matrix
        )

        return jsonify({
            'success': True,
            'result': result,
            'formula': FORMULAS.get(operation, ""),
            'steps': steps,
            'details': f"Operación {operation} completada en matriz {selected_matrix}"
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'details': f"Error en operación {operation} con matriz {selected_matrix}"
        })
    
def format_matrix(matrix):
    """Formatea una matriz con bordes y alineación"""
    rows, cols = matrix.shape
    if rows > 6 or cols > 6:
        return np.array2string(matrix, precision=4, suppress_small=True)
    
    html = '<div class="matrix-container"><table class="matrix">'
    for row in matrix:
        html += '<tr>'
        for val in row:
            html += f'<td>{round(val, 4) if isinstance(val, (int, float)) else val}</td>'
        html += '</tr>'
    html += '</table></div>'
    return html

def matrix_operation_steps(operation, matrix_a, matrix_b=None, selected_matrix='A'):
    """Genera pasos detallados con formato mejorado"""
    steps = []
    matrix = matrix_a if selected_matrix == 'A' else matrix_b
    
    if operation == 'add':
        steps.append("<b>Paso 1:</b> Verificar dimensiones de las matrices")
        steps.append(f"<b>Matriz A:</b>\n{format_matrix(matrix_a)}")
        steps.append(f"<b>Matriz B:</b>\n{format_matrix(matrix_b)}")
        steps.append("<b>Paso 2:</b> Sumar elementos correspondientes")
        result = matrix_a + matrix_b
        steps.append(f"<b>Resultado:</b>\n{format_matrix(result)}")
        return result.tolist(), steps
        
    elif operation == 'subtract':
        steps.append("<b>Paso 1:</b> Verificar dimensiones de las matrices")
        steps.append(f"<b>Matriz A:</b>\n{format_matrix(matrix_a)}")
        steps.append(f"<b>Matriz B:</b>\n{format_matrix(matrix_b)}")
        steps.append("<b>Paso 2:</b> Restar elementos correspondientes")
        result = matrix_a - matrix_b
        steps.append(f"<b>Resultado:</b>\n{format_matrix(result)}")
        return result.tolist(), steps
        
    elif operation == 'multiply':
        steps.append("<b>Paso 1:</b> Verificar compatibilidad de dimensiones")
        steps.append(f"<b>Matriz A</b> ({matrix_a.shape[0]}×{matrix_a.shape[1]}):\n{format_matrix(matrix_a)}")
        steps.append(f"<b>Matriz B</b> ({matrix_b.shape[0]}×{matrix_b.shape[1]}):\n{format_matrix(matrix_b)}")
        steps.append("<b>Paso 2:</b> Calcular producto punto fila-columna")
        
        if matrix_a.shape[0] <= 3 and matrix_a.shape[1] <= 3 and matrix_b.shape[1] <= 3:
            steps.append("<b>Desglose de cálculos:</b>")
            for i in range(matrix_a.shape[0]):
                for j in range(matrix_b.shape[1]):
                    calc = []
                    for k in range(matrix_a.shape[1]):
                        calc.append(f"{matrix_a[i,k]}×{matrix_b[k,j]}")
                    steps.append(f"Elemento C[{i+1},{j+1}] = {' + '.join(calc)} = {sum(matrix_a[i,k]*matrix_b[k,j] for k in range(matrix_a.shape[1])):.2f}")
        
        result = np.dot(matrix_a, matrix_b)
        steps.append(f"<b>Matriz resultante:</b>\n{format_matrix(result)}")
        return result.tolist(), steps
        
    elif operation == 'determinant':
        steps.append(f"<b>Matriz {selected_matrix}</b> ({matrix.shape[0]}×{matrix.shape[1]}):\n{format_matrix(matrix)}")
        
        if matrix.shape[0] == 2:
            steps.append("<b>Fórmula para 2×2:</b> det = (a·d - b·c)")
            det = matrix[0,0]*matrix[1,1] - matrix[0,1]*matrix[1,0]
            steps.append(f"det = ({matrix[0,0]} × {matrix[1,1]}) - ({matrix[0,1]} × {matrix[1,0]}) = {det}")
        elif matrix.shape[0] == 3:
            steps.append("<b>Regla de Sarrus para 3×3:</b>")
            # Mostrar el cálculo completo
            pos_terms = matrix[0,0]*matrix[1,1]*matrix[2,2] + matrix[0,1]*matrix[1,2]*matrix[2,0] + matrix[0,2]*matrix[1,0]*matrix[2,1]
            neg_terms = matrix[0,2]*matrix[1,1]*matrix[2,0] + matrix[0,0]*matrix[1,2]*matrix[2,1] + matrix[0,1]*matrix[1,0]*matrix[2,2]
            steps.append(f"Términos positivos: {pos_terms:.2f}")
            steps.append(f"Términos negativos: -{neg_terms:.2f}")
            steps.append(f"Determinante: {pos_terms - neg_terms:.2f}")
            det = pos_terms - neg_terms
        else:
            steps.append("<b>Método:</b> Eliminación gaussiana o expansión por cofactores")
            det = np.linalg.det(matrix)
        
        steps.append(f"<b>Resultado final:</b> det(A) = {det:.4f}")
        return float(det), steps
        
    elif operation == 'inverse':
        steps.append(f"<b>Matriz original:</b>\n{format_matrix(matrix)}")
        
        det = np.linalg.det(matrix)
        steps.append(f"<b>Paso 1:</b> Calcular determinante = {det:.4f}")
        
        if abs(det) < 1e-10:
            raise ValueError("La matriz es singular (determinante = 0), no tiene inversa.")
        
        steps.append("<b>Paso 2:</b> Calcular matriz de cofactores")
        steps.append("<b>Paso 3:</b> Transponer para obtener la adjunta")
        steps.append("<b>Paso 4:</b> Dividir cada elemento por el determinante")
        
        inv_matrix = np.linalg.inv(matrix)
        steps.append(f"<b>Matriz inversa resultante:</b>\n{format_matrix(inv_matrix)}")
        return inv_matrix.tolist(), steps
        
    elif operation == 'transpose':
        steps.append(f"<b>Matriz original</b> ({matrix.shape[0]}×{matrix.shape[1]}):\n{format_matrix(matrix)}")
        steps.append("<b>Operación:</b> Intercambiar filas por columnas")
        transposed = matrix.T
        steps.append(f"<b>Matriz transpuesta</b> ({transposed.shape[0]}×{transposed.shape[1]}):\n{format_matrix(transposed)}")
        return transposed.tolist(), steps
        
    elif operation == 'trace':
        steps.append(f"<b>Matriz cuadrada:</b>\n{format_matrix(matrix)}")
        diag = [f"a_{i+1}{i+1} = {matrix[i,i]}" for i in range(matrix.shape[0])]
        steps.append("<b>Elementos diagonales:</b> " + ", ".join(diag))
        trace = np.trace(matrix)
        steps.append(f"<b>Traza:</b> " + " + ".join([str(matrix[i,i]) for i in range(matrix.shape[0])]) + f" = {trace:.4f}")
        return float(trace), steps
        
    elif operation == 'rank':
        steps.append(f"<b>Matriz analizada:</b>\n{format_matrix(matrix)}")
        steps.append("<b>Método:</b> Contar el número de filas no nulas después de la reducción a forma escalonada")
        rank = np.linalg.matrix_rank(matrix)
        steps.append(f"<b>Rango de la matriz:</b> {rank}")
        return int(rank), steps

