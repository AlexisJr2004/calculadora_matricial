// =============================================
// OPERACIONES CON VECTORES
// =============================================

// ===============================
// Funciones de UI y manejo de inputs
// ===============================

/**
 * Limpia un campo de vector
 */
function clearVector(fieldId) {
    document.getElementById(fieldId).value = "";
}

// ===============================
// Operaciones con vectores y resultados
// ===============================

/**
 * Realiza una operación vectorial
 */
async function vectorOperation(operation) {
    try {
        // Determinar qué vector usar para operaciones individuales
        let selectedVector = document.querySelector('input[name="selectedVector"]:checked').value;

        const vector1 = document.getElementById("vector1").value;
        const vector2 = document.getElementById("vector2").value;

        let requestData = {
            operation: operation,
            vector1: selectedVector === "1" ? vector1 : vector2
        };

        // Operaciones que requieren dos vectores
        if (['add', 'subtract', 'dot', 'cross', 'angle', 'projection'].includes(operation)) {
            if (!vector1 || !vector2) {
                displayVectorResult("Error: Se necesitan ambos vectores para esta operación", "error");
                return;
            }
            requestData.vector1 = vector1;
            requestData.vector2 = vector2;
        } else {
            // Para operaciones individuales, verificar que el vector seleccionado exista
            if ((selectedVector === "1" && !vector1) || (selectedVector === "2" && !vector2)) {
                displayVectorResult(`Error: El vector ${selectedVector} está vacío`, "error");
                return;
            }
        }

        // Mostrar carga
        displayVectorResult("Calculando...", "loading");

        // Enviar al backend
        const response = await fetch('/vector_operation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (data.success) {
            displayVectorResult(data, "success");
        } else {
            displayVectorResult(`Error: ${data.error}`, "error");
        }

    } catch (error) {
        displayVectorResult(`Error: ${error.message}`, "error");
    }
}

/**
 * Muestra el resultado de una operación vectorial
 */
function displayVectorResult(data, type) {
    const resultDiv = document.getElementById("vector-result");

    if (type === "loading") {
        resultDiv.innerHTML = `<div class="text-center p-4">⏳ ${data}</div>`;
        return;
    }

    if (type === "error") {
        resultDiv.innerHTML = `
            <div class="text-center p-4 text-red-500">
                <p class="font-bold">Error</p>
                <p>${data}</p>
            </div>
        `;
        return;
    }

    if (type === "success") {
        let resultContent = `
            <div class="p-4">
                <div class="font-bold mb-2 text-lg text-center text-indigo-600">
                    ${getVectorOperationName(data.operation)}
                </div>
        `;

        if (Array.isArray(data.result)) {
            resultContent += `
                <div class="text-center my-4">
                    <div class="math-result text-xl mb-2">$$${data.latex_result}$$</div>
                    <div class="mt-3 p-3 bg-white rounded-lg shadow-inner border border-gray-200">
                        <p class="text-sm font-medium text-gray-600 mb-1">Forma vectorial:</p>
                        <p class="font-mono text-lg">[${data.result.join(', ')}]</p>
                    </div>
                </div>
            `;
        } else {
            resultContent += `
                <div class="text-center my-4">
                    <div class="math-result text-xl mb-3">$$${data.latex_result}$$</div>
                    <div class="mt-3 p-3 bg-white rounded-lg shadow-inner border border-gray-200">
                        <p class="text-sm font-medium text-gray-600 mb-1">Resultado:</p>
                        <p class="text-2xl font-bold">${data.result}</p>
                    </div>
                </div>
            `;
        }

        resultContent += `</div>`;
        resultDiv.innerHTML = resultContent;

        // Renderizar LaTeX con MathJax
        if (typeof MathJax !== 'undefined') {
            MathJax.typeset();
        }
    }
}

/**
 * Obtiene el nombre legible de una operación vectorial
 */
function getVectorOperationName(operation) {
    const names = {
        'add': 'Suma de Vectores',
        'subtract': 'Resta de Vectores',
        'dot': 'Producto Punto',
        'cross': 'Producto Cruz',
        'magnitude': 'Magnitud del Vector',
        'angle': 'Ángulo entre Vectores',
        'normalize': 'Vector Normalizado',
        'projection': 'Proyección Vectorial'
    };
    return names[operation] || operation;
}