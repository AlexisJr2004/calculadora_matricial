// =============================================
// OPERACIONES DE CÁLCULO
// =============================================

// Variables globales para la calculadora
let calcCurrentChart = null;
let calcMathInput = "";
let calcCursorPos = 0;

// ===============================
// Funciones de utilidad
// ===============================

/**
 * Obtiene el nombre legible de una operación de cálculo
 */
function getCalculusOperationName(operation) {
    const names = {
        'derivative': 'Derivada',
        'integral': 'Integral',
        'limit': 'Límite',
        'taylor': 'Serie de Taylor'
    };
    return names[operation] || operation;
}

// ===============================
// Funciones de UI y manejo de inputs
// ===============================

/**
 * Limpia el campo de función y los campos asociados
 **/
function clearCalculusFunction() {
    document.getElementById("calculus-function").value = "";
    document.getElementById("limit-point").value = "";
    document.getElementById("taylor-point").value = "";
    document.getElementById("taylor-degree").value = "";
}

/**
 * Muestra las opciones específicas para cada operación de cálculo
 */
function showCalculusOptions(operation) {
    document.getElementById("limit-point-container").classList.add("hidden");
    document.getElementById("taylor-options-container").classList.add("hidden");

    if (operation === "limit") {
        document.getElementById("limit-point-container").classList.remove("hidden");
    } else if (operation === "taylor") {
        document.getElementById("taylor-options-container").classList.remove("hidden");
    }
}

/**
 * Inserta un símbolo matemático en el input de cálculo
 */
function insertCalcMathSymbol(symbol, backSteps = 0) {
    const input = calcMathInput;
    const pos = calcCursorPos;

    if (symbol.endsWith('()')) {
        calcMathInput = input.slice(0, pos) + symbol.slice(0, -1) + '()' + input.slice(pos);
        calcCursorPos = pos + symbol.length - 1;
    } else {
        calcMathInput = input.slice(0, pos) + symbol + input.slice(pos);
        calcCursorPos = pos + symbol.length;
    }

    if (backSteps > 0) {
        calcCursorPos -= backSteps;
    }

    updateCalcMathPreview();
}

/**
 * Inserta la expresión actual en el campo de función de cálculo
 */
function insertIntoCalcFunction() {
    if (!calcMathInput) return;

    const funcInput = document.getElementById("calculus-function");
    const currentValue = funcInput.value;
    const pos = funcInput.selectionStart;

    funcInput.value = currentValue.slice(0, pos) + calcMathInput + currentValue.slice(pos);
    funcInput.focus();

    calcMathInput = "";
    calcCursorPos = 0;
    updateCalcMathPreview();

    funcInput.dispatchEvent(new Event('input'));
}

/**
 * Limpia el input matemático de cálculo
 */
function clearCalcMathInput() {
    calcMathInput = "";
    calcCursorPos = 0;
    updateCalcMathPreview();
}

/**
 * Actualiza la vista previa matemática de cálculo
 */
function updateCalcMathPreview() {
    const preview = document.getElementById("calc-math-preview");

    if (!calcMathInput) {
        preview.innerHTML = '<span class="text-gray-400">Ingresa una expresión matemática</span>';
        return;
    }

    let displayText = calcMathInput
        .replace(/\*\*/g, '^')
        .replace(/sqrt\((.*?)\)/g, '√($1)')
        .replace(/exp\((.*?)\)/g, 'e^{$1}')
        .replace(/pi/g, 'π')
        .replace(/sin\((.*?)\)/g, 'sin($1)')
        .replace(/cos\((.*?)\)/g, 'cos($1)')
        .replace(/tan\((.*?)\)/g, 'tan($1)')
        .replace(/log\((.*?)\)/g, 'log($1)')
        .replace(/ln\((.*?)\)/g, 'ln($1)');

    preview.innerHTML = `\\( ${displayText} \\)`;

    if (typeof MathJax !== 'undefined') {
        try {
            MathJax.typesetPromise([preview]).catch(err => {
                console.error('Error al renderizar MathJax:', err);
                preview.textContent = displayText;
            });
        } catch (e) {
            preview.textContent = displayText;
        }
    }
}

// ===============================
// Operaciones de cálculo y resultados
// ===============================

/**
 * Realiza una operación de cálculo
 */
async function calculusOperation(operation) {
    const func = document.getElementById("calculus-function").value;
    const showSteps = document.getElementById("show-steps-checkbox").checked;

    if (!func) {
        displayCalculusResult("Error: Por favor ingresa una función", "error");
        return;
    }

    displayCalculusResult("Calculando...", "loading");

    const data = {
        operation: operation,
        function: func,
        show_steps: showSteps
    };

    if (operation === "limit") {
        const point = document.getElementById("limit-point").value;
        if (!point) {
            displayCalculusResult("Error: Ingresa un punto para el límite", "error");
            return;
        }
        data.point = point;
    } else if (operation === "taylor") {
        const point = document.getElementById("taylor-point").value;
        const degree = document.getElementById("taylor-degree").value;
        if (!point || !degree) {
            displayCalculusResult("Error: Completa todos los campos para Taylor", "error");
            return;
        }
        data.point = point;
        data.degree = degree;
    }

    try {
        const response = await fetch('/calculus_operation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const resultData = await response.json();

        if (resultData.success) {
            displayCalculusResult(resultData, "success");
        } else {
            displayCalculusResult(`Error: ${resultData.error}`, "error");
        }
    } catch (error) {
        displayCalculusResult(`Error de conexión: ${error.message}`, "error");
    }
}

/**
 * Muestra el resultado de una operación de cálculo
 */
function displayCalculusResult(data, type) {
    const resultDiv = document.getElementById("calculus-result");

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
                    ${getCalculusOperationName(data.operation)}
                </div>
                <div class="text-center text-gray-600 mb-4 border-b pb-3">
                    Función: $$${data.function_latex || data.function}$$
                </div>
                <div class="text-center text-2xl my-4 p-4 bg-white rounded-lg shadow-inner">
                    Resultado: $$${data.result}$$
                </div>
        `;

        if (data.steps && data.steps.length > 0) {
            resultContent += `
                <div class="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p class="text-sm font-medium text-gray-600 mb-2">Proceso paso a paso:</p>
                    <div class="space-y-3">`;

            data.steps.forEach((step, index) => {
                resultContent += `
                    <div class="step p-2 border-l-4 border-indigo-200 bg-white">
                        <div class="font-medium text-gray-700">Paso ${index + 1}:</div>
                        <div class="math-step ml-2">$$${step}$$</div>
                    </div>`;
            });

            resultContent += `</div></div>`;
        }

        resultContent += `</div>`;
        resultDiv.innerHTML = resultContent;

        if (typeof MathJax !== 'undefined') {
            MathJax.typeset();
        }
    }
}

// ===============================
// Inicialización de eventos y MathJax
// ===============================

document.addEventListener('DOMContentLoaded', function() {
    // Event listeners para la sección de cálculo
    document.getElementById("calculus-function").addEventListener('input', function() {
        // Puedes agregar lógica adicional si es necesario
    });

    // Configurar MathJax para la vista previa de cálculo
    if (typeof MathJax !== 'undefined') {
        MathJax = {
            ...MathJax,
            startup: {
                ...MathJax.startup,
                ready() {
                    MathJax.startup.defaultReady();
                    MathJax.startup.promise.then(() => {
                        updateCalcMathPreview();
                    });
                }
            }
        };
    }
});