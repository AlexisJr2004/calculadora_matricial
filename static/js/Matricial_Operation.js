// =============================================
// 🔢 OPERACIONES CON MATRICES
// =============================================

// ===============================
// Variables globales
// ===============================
let matrixRows = 3;
let matrixCols = 3;

// ===============================
// Funciones de UI y manejo de inputs
// ===============================

/**
 * Actualiza el tamaño de las matrices según los selectores
 */
function updateMatrixSize() {
    matrixRows = parseInt(document.getElementById("matrix-rows").value);
    matrixCols = parseInt(document.getElementById("matrix-cols").value);
    createMatrixInputs("matrixA");
    createMatrixInputs("matrixB");
}

/**
 * Crea los inputs para una matriz dada
 */
function createMatrixInputs(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    container.style.gridTemplateColumns = `repeat(${matrixCols}, 1fr)`;
    for (let i = 0; i < matrixRows * matrixCols; i++) {
        const input = document.createElement("input");
        input.type = "text";
        input.className = "matrix-input";
        input.placeholder = "0";
        container.appendChild(input);
    }
}

/**
 * Convierte una cadena a número, soportando fracciones tipo "3/4"
 */
function parseFractionOrDecimal(str) {
    str = str.trim().replace(',', '.');
    if (/^\s*-?\d+(\.\d+)?\s*$/.test(str)) {
        return parseFloat(str);
    }
    if (/^\s*-?\d+\s*\/\s*-?\d+\s*$/.test(str)) {
        const [num, den] = str.split('/').map(s => parseFloat(s));
        if (den === 0) return NaN;
        return num / den;
    }
    return NaN;
}

/**
 * Llena una matriz con valores aleatorios entre -5 y 4
 */
function randomizeMatrix(matrix) {
    const inputs = document.querySelectorAll(`#matrix${matrix} input`);
    inputs.forEach(input => {
        input.value = Math.floor(Math.random() * 10) - 5;
    });
}

/**
 * Limpia los valores de una matriz
 */
function clearMatrix(matrix) {
    const inputs = document.querySelectorAll(`#matrix${matrix} input`);
    inputs.forEach(input => input.value = "");
}

/**
 * Obtiene los valores de una matriz como array bidimensional
 */
function getMatrixValues(matrixId) {
    const inputs = document.querySelectorAll(`#${matrixId} input`);
    const matrix = [];
    for (let i = 0; i < matrixRows; i++) {
        const row = [];
        for (let j = 0; j < matrixCols; j++) {
            const index = i * matrixCols + j;
            const value = parseFractionOrDecimal(inputs[index].value) || 0;
            row.push(value);
        }
        matrix.push(row);
    }
    return matrix;
}

// ===============================
// Operaciones con matrices y resultados
// ===============================

/**
 * Realiza una operación matricial y muestra el resultado
 */
async function matrixOperation(operation) {
    try {
        const matrixA = getMatrixValues("matrixA");
        let requestData = { operation, matrixA };
        let selectedMatrix = 'A';

        if (['inverse', 'transpose', 'trace', 'determinant', 'rank'].includes(operation)) {
            selectedMatrix = document.querySelector('input[name="selectedMatrix"]:checked').value;
        }
        if (['add', 'subtract', 'multiply'].includes(operation)) {
            requestData.matrixB = getMatrixValues("matrixB");
        } else {
            if (selectedMatrix === 'B') {
                requestData.matrixB = getMatrixValues("matrixB");
            }
        }
        requestData.selectedMatrix = selectedMatrix;

        displayMatrixResult("Calculando...", "loading");

        const response = await fetch('/matrix_operation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (data.success) {
            displayMatrixResult(
                data.result,
                Array.isArray(data.result) ? "matrix" : "number",
                data.formula,
                data.steps
            );
        } else {
            displayMatrixResult(`Error: ${data.error}`, "error");
        }

    } catch (error) {
        displayMatrixResult(`Error: ${error.message}`, "error");
    }
}

/**
 * Muestra el resultado de una operación matricial
 * @param {Array|number|string} result - Resultado a mostrar
 * @param {string} type - 'matrix', 'number', 'error', 'loading'
 * @param {string} formula - Fórmula matemática
 * @param {Array} steps - Paso a paso
 */
function displayMatrixResult(result, type, formula = null, steps = null) {
    const resultDiv = document.getElementById("matrix-result");

    // Encabezado con fórmula matemática renderizada
    let formulaHtml = '';
    if (formula) {
        formulaHtml = `
            <div class="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <div class="font-bold text-indigo-700 mb-1">Fórmula Matemática:</div>
                <div class="overflow-x-auto">
                    <div class="math-formula text-center p-2 bg-white rounded">
                        ${renderMathFormula(formula)}
                    </div>
                </div>
            </div>
        `;
    }

    // Pasos detallados con formato mejorado
    let stepsHtml = '';
    if (steps && steps.length > 0) {
        stepsHtml = `
            <div class="mt-6">
                <div class="font-bold text-gray-700 mb-3 text-lg border-b pb-2">Procedimiento Detallado</div>
                <div class="space-y-4">
                    ${steps.map((step, i) => {
                        const hasMatrix = step.includes('<table class="matrix">');
                        return `
                            <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                <div class="flex items-center bg-gray-50 px-4 py-2 border-b">
                                    <span class="flex-shrink-0 bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 font-bold">${i+1}</span>
                                    <div class="font-medium text-gray-700">Paso ${i+1}</div>
                                </div>
                                <div class="p-4 ${hasMatrix ? 'overflow-x-auto' : ''}">
                                    ${step.replace(/\n/g, '<br>')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    // Resultado principal con diseño mejorado
    let resultHtml = '';
    if (type === "loading") {
        resultHtml = `
            <div class="text-center p-8">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-3"></div>
                <p class="text-gray-600">Calculando resultado...</p>
            </div>
        `;
    } 
    else if (type === "error") {
        resultHtml = `
            <div class="bg-red-50 border-l-4 border-red-500 p-4">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <i class="fas fa-exclamation-circle text-red-500 text-xl mt-1 mr-3"></i>
                    </div>
                    <div>
                        <h3 class="text-sm font-bold text-red-800">Error en el cálculo</h3>
                        <div class="mt-1 text-sm text-red-700">
                            <p>${result}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } 
    else if (type === "number") {
        resultHtml = `
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-inner border border-blue-100 text-center">
                <div class="text-blue-600 font-bold mb-2">Resultado Numérico</div>
                <div class="text-4xl font-mono font-bold text-blue-800">
                    ${Number(result).toFixed(4)}
                </div>
            </div>
        `;
    } 
    else if (type === "matrix") {
        resultHtml = `
            <div class="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 shadow-inner border border-green-100">
                <div class="text-green-700 font-bold mb-4 text-center">
                    Matriz Resultante (${result.length}×${result[0].length})
                </div>
                <div class="overflow-x-auto">
                    <div class="inline-block border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                        <table class="matrix-result">
                            ${result.map(row => `
                                <tr>
                                    ${row.map(val => `
                                        <td class="px-4 py-2 border border-gray-200 bg-white text-center font-mono">
                                            ${typeof val === "number" ? val.toFixed(4) : val}
                                        </td>
                                    `).join('')}
                                </tr>
                            `).join('')}
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    // Combinar todo
    resultDiv.innerHTML = `
        ${formulaHtml}
        <div class="mb-6">
            ${resultHtml}
        </div>
        ${stepsHtml}
    `;

    // Renderizar fórmulas matemáticas con MathJax si está disponible
    if (typeof MathJax !== 'undefined') {
        MathJax.typeset();
    }
}

/**
 * Renderiza una fórmula matemática en LaTeX
 */
function renderMathFormula(formula) {
    return `\\(${formula}\\)`;
}

// ===============================
// Inicialización de eventos
// ===============================

document.addEventListener('DOMContentLoaded', updateMatrixSize);