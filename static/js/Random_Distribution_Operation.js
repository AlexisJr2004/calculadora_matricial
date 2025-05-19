// ===============================
// MÓDULO FUSIONADO: ALEATORIOS Y DISTRIBUCIONES
// ===============================

// ===============================
// VARIABLES GLOBALES
// ===============================
let randomNumbers = [];
let randomChart = null;
let distributionChart = null;

// ===============================
// INPUTS Y FORMULARIOS
// ===============================

/**
 * Actualiza los parámetros según el método seleccionado
 */
function updateRandomParams() {
    const method = document.getElementById("random-method").value;
    const paramsDiv = document.getElementById("random-params");
    let html = '';
    switch(method) {
        case 'middle_square':
            html = `
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Semilla (X0)</label>
                    <input id="param-seed" type="number" min="100" value="445" class="w-full input-field">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Dígitos</label>
                    <select id="param-digits" class="w-full input-field">
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4" selected>4</option>
                        <option value="5">5</option>
                    </select>
                </div>
            `;
            break;
        case 'middle_product':
            html = `
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Semilla 1 (X0)</label>
                    <input id="param-seed1" type="number" min="10" value="13" class="w-full input-field">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Semilla 2 (X1)</label>
                    <input id="param-seed2" type="number" min="10" value="15" class="w-full input-field">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Dígitos</label>
                    <select id="param-digits" class="w-full input-field">
                        <option value="2" selected>2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                    </select>
                </div>
            `;
            break;
        case 'constant_multiplier':
            html = `
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Semilla (X0)</label>
                    <input id="param-seed" type="number" min="100" value="327" class="w-full input-field">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Constante (K)</label>
                    <input id="param-constant" type="number" min="1" value="29" class="w-full input-field">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Dígitos</label>
                    <select id="param-digits" class="w-full input-field">
                        <option value="2">2</option>
                        <option value="3" selected>3</option>
                        <option value="4">4</option>
                    </select>
                </div>
            `;
            break;
        case 'linear_congruential':
            html = `
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Semilla (X0)</label>
                    <input id="param-seed" type="number" min="1" value="37" class="w-full input-field">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Multiplicador (a)</label>
                    <input id="param-a" type="number" min="1" value="19" class="w-full input-field">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Constante aditiva (c)</label>
                    <input id="param-c" type="number" min="0" value="33" class="w-full input-field">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Módulo (m)</label>
                    <input id="param-m" type="number" min="2" value="100" class="w-full input-field">
                </div>
            `;
            break;
        case 'multiplicative_congruential':
            html = `
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Semilla (X0, impar)</label>
                    <input id="param-seed" type="number" min="1" step="2" value="17" class="w-full input-field">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Multiplicador (a = 3+8k o 5+8k)</label>
                    <input id="param-a" type="number" min="1" value="21" class="w-full input-field">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Módulo (m = 2^g)</label>
                    <input id="param-m" type="number" min="2" value="32" class="w-full input-field">
                </div>
            `;
            break;
        case 'additive_congruential':
            html = `
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Valores iniciales (separados por comas)</label>
                    <input id="param-initial" type="text" value="65,89,98,3,69" class="w-full input-field">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Módulo (m)</label>
                    <input id="param-m" type="number" min="2" value="100" class="w-full input-field">
                </div>
            `;
            break;
        case 'mixed_congruential':
            html = `
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Semilla (X0)</label>
                    <input id="param-seed" type="number" min="1" value="4" class="w-full input-field">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Multiplicador (a)</label>
                    <input id="param-a" type="number" min="1" value="5" class="w-full input-field">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Constante aditiva (c)</label>
                    <input id="param-c" type="number" min="0" value="7" class="w-full input-field">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Módulo (m)</label>
                    <input id="param-m" type="number" min="2" value="8" class="w-full input-field">
                </div>
            `;
            break;
    }
    paramsDiv.innerHTML = html;
}

/**
 * Actualiza los parámetros de la distribución seleccionada
 */
function updateFormFields() {
    const distribution = document.getElementById("distribution-type").value;
    const paramsDiv = document.getElementById("distribution-params");
    let html = '';
    if (distribution === "poisson") {
        html = `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tasa promedio (λ)</label>
                <input id="poisson-lambda" type="number" min="0.01" step="0.01" value="3" class="w-full input-field">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Intervalo de tiempo</label>
                <input id="poisson-time" type="number" min="0.1" step="0.1" value="1" class="w-full input-field">
            </div>
        `;
    } else if (distribution === "binomial") {
        html = `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Número de ensayos (n)</label>
                <input id="binomial-trials" type="number" min="1" value="20" class="w-full input-field">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Prob. de éxito (p)</label>
                <input id="binomial-prob" type="number" min="0.001" max="0.999" step="0.001" value="0.3" class="w-full input-field">
            </div>
        `;
    } else if (distribution === "exponential") {
        html = `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tasa (λ)</label>
                <input id="exponential-lambda" type="number" min="0.01" step="0.01" value="0.5" class="w-full input-field">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tiempo máximo</label>
                <input id="exponential-max-time" type="number" min="0.1" step="0.1" value="10" class="w-full input-field">
            </div>
        `;
    } else if (distribution === "normal") {
        html = `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Media (μ)</label>
                <input id="normal-mean" type="number" value="0" class="w-full input-field">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Desviación estándar (σ)</label>
                <input id="normal-std" type="number" min="0.01" step="0.01" value="1" class="w-full input-field">
            </div>
        `;
    }
    paramsDiv.innerHTML = html;
}

// ===============================
// GENERACIÓN DE NÚMEROS ALEATORIOS
// ===============================

/**
 * Genera números aleatorios según el método seleccionado
 */
async function generateRandomNumbers() {
    const method = document.getElementById("random-method").value;
    const count = parseInt(document.getElementById("random-count").value);
    const testType = document.getElementById("random-test").value;
    let params = { n: count };
    switch(method) {
        case 'middle_square':
            params.seed = parseInt(document.getElementById("param-seed").value);
            params.digits = parseInt(document.getElementById("param-digits").value);
            break;
        case 'middle_product':
            params.seed1 = parseInt(document.getElementById("param-seed1").value);
            params.seed2 = parseInt(document.getElementById("param-seed2").value);
            params.digits = parseInt(document.getElementById("param-digits").value);
            break;
        case 'constant_multiplier':
            params.seed = parseInt(document.getElementById("param-seed").value);
            params.constant = parseInt(document.getElementById("param-constant").value);
            params.digits = parseInt(document.getElementById("param-digits").value);
            break;
        case 'linear_congruential':
            params.seed = parseInt(document.getElementById("param-seed").value);
            params.a = parseInt(document.getElementById("param-a").value);
            params.c = parseInt(document.getElementById("param-c").value);
            params.m = parseInt(document.getElementById("param-m").value);
            break;
        case 'multiplicative_congruential':
            params.seed = parseInt(document.getElementById("param-seed").value);
            params.a = parseInt(document.getElementById("param-a").value);
            params.m = parseInt(document.getElementById("param-m").value);
            break;
        case 'additive_congruential':
            params.initial_values = document.getElementById("param-initial").value.split(',').map(x => parseInt(x.trim()));
            params.m = parseInt(document.getElementById("param-m").value);
            break;
        case 'mixed_congruential':
            params.seed = parseInt(document.getElementById("param-seed").value);
            params.a = parseInt(document.getElementById("param-a").value);
            params.c = parseInt(document.getElementById("param-c").value);
            params.m = parseInt(document.getElementById("param-m").value);
            break;
    }
    try {
        document.getElementById("random-result").innerHTML = `
            <div class="text-center p-4">
                <p class="text-gray-500">Generando números...</p>
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mt-2"></div>
            </div>
        `;
        const response = await fetch('/random_number_generation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                method,
                params,
                test: testType !== 'none' ? testType : undefined
            })
        });
        const data = await response.json();
        if (data.success) {
            randomNumbers = data.numbers;
            displayRandomResults(randomNumbers);
            showMethodFormula(method);
            if (data.test_results) {
                displayTestResults(data.test_results, testType);
                showTestFormulas(testType);
            } else {
                document.getElementById("test-results").classList.add("hidden");
            }
            updateHistogram(randomNumbers);
        } else {
            document.getElementById("random-result").innerHTML = `
                <div class="text-center p-4 text-red-500">
                    <p class="font-bold">Error</p>
                    <p>${data.error}</p>
                </div>
            `;
        }
    } catch (error) {
        document.getElementById("random-result").innerHTML = `
            <div class="text-center p-4 text-red-500">
                <p class="font-bold">Error</p>
                <p>${error.message}</p>
            </div>
        `;
    }
}

/**
 * Muestra la fórmula del método seleccionado
 */
function showMethodFormula(method) {
    const formulaDiv = document.createElement('div');
    formulaDiv.id = "method-formula";
    formulaDiv.className = "mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200";

    const title = document.createElement('h4');
    title.className = "font-medium text-gray-800 mb-2 flex items-center";
    title.innerHTML = '<i class="fas fa-square-root-alt text-purple-500 mr-2"></i> Fórmula del Método';

    const contentDiv = document.createElement('div');
    contentDiv.id = "formula-content";
    contentDiv.className = "text-sm";

    let formula = '';
    let explanation = '';

    switch(method) {
        case 'middle_square':
            formula = 'X_{n+1} = \\text{medios dígitos de } (X_n)^2';
            explanation = 'Se eleva al cuadrado el número anterior y se toman los dígitos del medio como siguiente número.';
            break;
        case 'middle_product':
            formula = 'X_{n+1} = \\text{medios dígitos de } X_n \\cdot X_{n-1}';
            explanation = 'Se multiplican los dos últimos números y se toman los dígitos del medio.';
            break;
        case 'constant_multiplier':
            formula = 'X_{n+1} = \\text{medios dígitos de } K \\cdot X_n';
            explanation = 'Se multiplica por una constante fija y se toman los dígitos del medio.';
            break;
        case 'linear_congruential':
            formula = 'X_{n+1} = (a \\cdot X_n + c) \\mod m';
            explanation = 'Combinación lineal con módulo. Es el método más utilizado.';
            break;
        case 'multiplicative_congruential':
            formula = 'X_{n+1} = (a \\cdot X_n) \\mod m';
            explanation = 'Versión simplificada del congruencial lineal sin constante aditiva.';
            break;
        case 'additive_congruential':
            formula = 'X_{n+1} = (X_n + X_{n-k}) \\mod m';
            explanation = 'Suma de números anteriores con módulo. Períodos más largos.';
            break;
        case 'mixed_congruential':
            formula = 'X_{n+1} = (a \\cdot X_n + c) \\mod m';
            explanation = 'Similar al lineal pero con diferente normalización (división por m en lugar de m-1).';
            break;
    }

    contentDiv.innerHTML = `
        <div class="mb-2">
            <div class="math-formula">$$${formula}$$</div>
            <p class="text-gray-600 mt-1">${explanation}</p>
        </div>
    `;

    formulaDiv.appendChild(title);
    formulaDiv.appendChild(contentDiv);

    // Eliminar la fórmula anterior si existe
    const oldFormula = document.getElementById("method-formula");
    if (oldFormula) {
        oldFormula.remove();
    }

    // Insertar la nueva fórmula
    const resultDiv = document.getElementById("random-result");
    if (resultDiv) {
        resultDiv.appendChild(formulaDiv);
    }

    if (window.MathJax) MathJax.typeset();
}

// ===============================
// SIMULACIÓN DE DISTRIBUCIONES
// ===============================

/**
 * Simula una distribución usando los números generados
 */
async function runDistributionSimulation() {
    const distribution = document.getElementById("distribution-type").value;
    if (!distribution) return;
    const count = parseInt(document.getElementById("random-count").value);
    let params = {};
    switch(distribution) {
        case "poisson":
            params = {
                lambda: parseFloat(document.getElementById("poisson-lambda").value),
                time: parseFloat(document.getElementById("poisson-time").value)
            };
            break;
        case "binomial":
            params = {
                n: parseInt(document.getElementById("binomial-trials").value),
                p: parseFloat(document.getElementById("binomial-prob").value)
            };
            break;
        case "exponential":
            params = {
                lambda: parseFloat(document.getElementById("exponential-lambda").value),
                max_time: parseFloat(document.getElementById("exponential-max-time").value)
            };
            break;
        case "normal":
            params = {
                mean: parseFloat(document.getElementById("normal-mean").value),
                std: parseFloat(document.getElementById("normal-std").value)
            };
            break;
    }
    // Obtener método y parámetros del generador
    const method = document.getElementById("random-method").value;
    let random_params = { n: count };
    switch(method) {
        case 'middle_square':
            random_params.seed = parseInt(document.getElementById("param-seed").value);
            random_params.digits = parseInt(document.getElementById("param-digits").value);
            break;
        case 'middle_product':
            random_params.seed1 = parseInt(document.getElementById("param-seed1").value);
            random_params.seed2 = parseInt(document.getElementById("param-seed2").value);
            random_params.digits = parseInt(document.getElementById("param-digits").value);
            break;
        case 'constant_multiplier':
            random_params.seed = parseInt(document.getElementById("param-seed").value);
            random_params.constant = parseInt(document.getElementById("param-constant").value);
            random_params.digits = parseInt(document.getElementById("param-digits").value);
            break;
        case 'linear_congruential':
            random_params.seed = parseInt(document.getElementById("param-seed").value);
            random_params.a = parseInt(document.getElementById("param-a").value);
            random_params.c = parseInt(document.getElementById("param-c").value);
            random_params.m = parseInt(document.getElementById("param-m").value);
            break;
        case 'multiplicative_congruential':
            random_params.seed = parseInt(document.getElementById("param-seed").value);
            random_params.a = parseInt(document.getElementById("param-a").value);
            random_params.m = parseInt(document.getElementById("param-m").value);
            break;
        case 'additive_congruential':
            random_params.initial_values = document.getElementById("param-initial").value.split(',').map(x => parseInt(x.trim()));
            random_params.m = parseInt(document.getElementById("param-m").value);
            break;
        case 'mixed_congruential':
            random_params.seed = parseInt(document.getElementById("param-seed").value);
            random_params.a = parseInt(document.getElementById("param-a").value);
            random_params.c = parseInt(document.getElementById("param-c").value);
            random_params.m = parseInt(document.getElementById("param-m").value);
            break;
    }
    // Mostrar carga
    document.getElementById("distribution-result-panel").classList.remove("hidden");
    document.getElementById("distribution-result").innerHTML = `
        <div class="text-center p-6">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            <p class="mt-2 text-gray-600">Simulando distribución...</p>
        </div>
    `;
    try {
        const response = await fetch('/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                distribution,
                count,
                params,
                random_method: method,
                random_params
            })
        });
        const data = await response.json();
        if (data.samples) {
            displayDistributionResults(data);
        } else {
            document.getElementById("distribution-result").innerHTML = `
                <div class="text-center p-4 text-red-500">
                    <p class="font-bold">Error</p>
                    <p>${data.error || 'No se pudo simular la distribución.'}</p>
                </div>
            `;
        }
    } catch (error) {
        document.getElementById("distribution-result").innerHTML = `
            <div class="text-center p-4 text-red-500">
                <p class="font-bold">Error</p>
                <p>${error.message}</p>
            </div>
        `;
    }
}

// ===============================
// RESULTADOS Y VISUALIZACIÓN
// ===============================

/**
 * Muestra los resultados de la distribución simulada
 */
function displayDistributionResults(data) {
    let paramResumen = '';
    if (data.distribution === 'poisson') {
        paramResumen = `<div class="mb-2 text-sm text-indigo-700">
            <b>λ usado:</b> ${data.theoretical_mean.toFixed(2)}
        </div>`;
    } else if (data.distribution === 'binomial') {
        paramResumen = `<div class="mb-2 text-sm text-indigo-700">
            <b>n:</b> ${data.theoretical_mean / data.theoretical_variance} &nbsp; 
            <b>p:</b> ${(data.theoretical_mean / (data.theoretical_mean / data.theoretical_variance)).toFixed(2)}
        </div>`;
    }
    let html = `
        ${paramResumen}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-blue-50 p-3 rounded-lg">
                <h4 class="font-medium text-gray-800 mb-1">Media muestral</h4>
                <p class="text-2xl font-bold">${data.mean.toFixed(4)}</p>
                ${data.theoretical_mean ? `<p class="text-sm text-gray-600">Teórica: ${data.theoretical_mean.toFixed(4)}</p>` : ''}
            </div>
            <div class="bg-green-50 p-3 rounded-lg">
                <h4 class="font-medium text-gray-800 mb-1">Varianza</h4>
                <p class="text-2xl font-bold">${data.variance.toFixed(4)}</p>
                ${data.theoretical_variance ? `<p class="text-sm text-gray-600">Teórica: ${data.theoretical_variance.toFixed(4)}</p>` : ''}
            </div>
            <div class="bg-purple-50 p-3 rounded-lg">
                <h4 class="font-medium text-gray-800 mb-1">Muestra</h4>
                <p class="text-2xl font-bold">${data.sample_size}</p>
            </div>
        </div>
    `;
    document.getElementById("distribution-result").innerHTML = html;
    showDistributionFormula(data.distribution);
    setTimeout(() => {
        renderDistributionChart(data);
    }, 0);
}

/**
 * Muestra los números aleatorios generados
 */
function displayRandomResults(numbers) {
    const resultDiv = document.getElementById("random-result");
    let html = `
        <div class="mb-3">
            <p class="font-medium">Generados ${numbers.length} números en [0,1):</p>
        </div>
        <div class="grid grid-cols-5 sm:grid-cols-10 gap-2">
    `;
    const displayCount = Math.min(numbers.length, 100);
    for (let i = 0; i < displayCount; i++) {
        html += `<div class="text-xs p-1 bg-white border rounded text-center">${numbers[i].toFixed(4)}</div>`;
    }
    html += `</div>`;
    if (numbers.length > 100) {
        html += `<p class="text-sm text-gray-500 mt-2">+ ${numbers.length - 100} números más...</p>`;
    }
    resultDiv.innerHTML = html;
}

/**
 * Muestra los resultados de las pruebas estadísticas
 */
function displayTestResults(results, testType) {
    const testDiv = document.getElementById("test-results-content");
    let html = '';

    if (testType === 'mean' || testType === 'both') {
        const r = testType === 'both' ? results.mean : results;
        html += `
            <div class="mb-6">
                <h4 class="font-medium text-gray-800 mb-2 flex items-center">
                    <i class="fas fa-ruler-combined text-blue-500 mr-2"></i> Prueba de Medias
                </h4>
                <div class="bg-blue-50 p-3 rounded-lg">
                    <table class="w-full text-sm">
                        <tr>
                            <td class="py-1 font-medium">Media muestral:</td>
                            <td class="py-1 text-right">${r.sample_mean.toFixed(6)}</td>
                        </tr>
                        <tr>
                            <td class="py-1 font-medium">Media esperada:</td>
                            <td class="py-1 text-right">0.5</td>
                        </tr>
                        <tr>
                            <td class="py-1 font-medium">Límite inferior:</td>
                            <td class="py-1 text-right">${r.lower_bound.toFixed(6)}</td>
                        </tr>
                        <tr>
                            <td class="py-1 font-medium">Límite superior:</td>
                            <td class="py-1 text-right">${r.upper_bound.toFixed(6)}</td>
                        </tr>
                        <tr>
                            <td class="py-1 font-medium">Valor Z:</td>
                            <td class="py-1 text-right">${r.z_value.toFixed(4)}</td>
                        </tr>
                        <tr>
                            <td class="py-1 font-medium">Z crítico (α=0.05):</td>
                            <td class="py-1 text-right">±${r.z_critical.toFixed(4)}</td>
                        </tr>
                    </table>
                    <div class="mt-3 p-2 rounded ${r.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        <i class="fas fa-${r.passed ? 'check' : 'times'} mr-1"></i>
                        ${r.passed ? 'PASA la prueba de medias' : 'NO PASA la prueba de medias'}
                    </div>
                </div>
            </div>
        `;
    }

    if (testType === 'variance' || testType === 'both') {
        const r = testType === 'both' ? results.variance : results;
        html += `
            <div class="mb-2">
                <h4 class="font-medium text-gray-800 mb-2 flex items-center">
                    <i class="fas fa-ruler-combined text-green-500 mr-2"></i> Prueba de Varianza
                </h4>
                <div class="bg-green-50 p-3 rounded-lg">
                    <table class="w-full text-sm">
                        <tr>
                            <td class="py-1 font-medium">Varianza muestral:</td>
                            <td class="py-1 text-right">${r.sample_variance.toFixed(6)}</td>
                        </tr>
                        <tr>
                            <td class="py-1 font-medium">Varianza esperada:</td>
                            <td class="py-1 text-right">0.0833 (1/12)</td>
                        </tr>
                        <tr>
                            <td class="py-1 font-medium">Límite inferior:</td>
                            <td class="py-1 text-right">${r.lower_bound.toFixed(6)}</td>
                        </tr>
                        <tr>
                            <td class="py-1 font-medium">Límite superior:</td>
                            <td class="py-1 text-right">${r.upper_bound.toFixed(6)}</td>
                        </tr>
                        <tr>
                            <td class="py-1 font-medium">Valor χ²:</td>
                            <td class="py-1 text-right">${r.chi2_value.toFixed(4)}</td>
                        </tr>
                        <tr>
                            <td class="py-1 font-medium">χ² crítico (α=0.05):</td>
                            <td class="py-1 text-right">${r.chi2_critical_lower.toFixed(4)} - ${r.chi2_critical_upper.toFixed(4)}</td>
                        </tr>
                    </table>
                    <div class="mt-3 p-2 rounded ${r.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        <i class="fas fa-${r.passed ? 'check' : 'times'} mr-1"></i>
                        ${r.passed ? 'PASA la prueba de varianza' : 'NO PASA la prueba de varianza'}
                    </div>
                </div>
            </div>
        `;
    }

    testDiv.innerHTML = html;
    document.getElementById("test-results").classList.remove("hidden");
}

/**
 * Muestra las fórmulas de las pruebas estadísticas
 */
function showTestFormulas(testType) {
    const formulaDiv = document.createElement('div');
    formulaDiv.id = "test-formulas";
    formulaDiv.className = "mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200";

    const title = document.createElement('h4');
    title.className = "font-medium text-gray-800 mb-2 flex items-center";
    title.innerHTML = '<i class="fas fa-calculator text-blue-500 mr-2"></i> Fórmulas de Pruebas';

    const contentDiv = document.createElement('div');
    contentDiv.id = "test-formula-content";
    contentDiv.className = "text-sm";

    let formulas = [];

    if (testType === 'mean' || testType === 'both') {
        formulas.push({
            title: "Prueba de Medias",
            formula: "\\overline{r} = \\frac{1}{n}\\sum_{i=1}^{n} r_i \\\\ \\text{Intervalo: } \\frac{1}{2} - Z_{\\alpha/2} \\left( \\frac{1}{\\sqrt{12n}} \\right) < \\overline{r} < \\frac{1}{2} + Z_{\\alpha/2} \\left( \\frac{1}{\\sqrt{12n}} \\right)",
            explanation: "La media debe estar cerca de 0.5 para una distribución uniforme."
        });
    }

    if (testType === 'variance' || testType === 'both') {
        formulas.push({
            title: "Prueba de Varianza",
            formula: "V(r) = \\frac{1}{n-1}\\sum_{i=1}^{n}(r_i - \\overline{r})^2 \\\\ \\text{Intervalo: } \\frac{\\chi^2_{\\alpha/2,n-1}}{12(n-1)} < V(r) < \\frac{\\chi^2_{1-\\alpha/2,n-1}}{12(n-1)}",
            explanation: "La varianza debe ser cercana a 1/12 para una distribución uniforme."
        });
    }

    let html = formulas.map(f => `
        <div class="mb-4">
            <h5 class="font-medium text-gray-700 mb-1">${f.title}</h5>
            <div class="math-formula">$$${f.formula}$$</div>
            <p class="text-gray-600 text-xs mt-1">${f.explanation}</p>
        </div>
    `).join('');

    contentDiv.innerHTML = html;
    formulaDiv.appendChild(title);
    formulaDiv.appendChild(contentDiv);

    // Eliminar las fórmulas anteriores si existen
    const oldFormulas = document.getElementById("test-formulas");
    if (oldFormulas) {
        oldFormulas.remove();
    }

    // Insertar las nuevas fórmulas
    const testResults = document.getElementById("test-results");
    if (testResults) {
        testResults.appendChild(formulaDiv);
    }

    if (window.MathJax) MathJax.typeset();
}

// ===============================
// HISTOGRAMAS Y GRÁFICAS
// ===============================

/**
 * Histograma de números aleatorios generados
 */
function updateHistogram(numbers) {
    const ctx = document.getElementById('random-histogram').getContext('2d');
    const binCount = 10;
    const binSize = 1 / binCount;
    let bins = Array(binCount).fill(0);
    numbers.forEach(num => {
        const binIndex = Math.min(Math.floor(num / binSize), binCount - 1);
        bins[binIndex]++;
    });
    const total = numbers.length;
    const binsPercent = bins.map(count => (count / total) * 100);

    if (randomChart) randomChart.destroy();
    randomChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Array.from({length: binCount}, (_, i) => {
                const start = (i * binSize).toFixed(1);
                const end = ((i + 1) * binSize).toFixed(1);
                return `${start}-${end}`;
            }),
            datasets: [{
                label: 'Porcentaje de números',
                data: binsPercent,
                backgroundColor: 'rgba(99, 102, 241, 0.6)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true },
                title: {
                    display: true,
                    text: 'Histograma de Números Aleatorios Generados'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const cantidad = bins[context.dataIndex];
                            const porcentaje = context.parsed.y.toFixed(2);
                            return `Cantidad: ${cantidad} (${porcentaje}%)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Porcentaje (%)' },
                    max: Math.ceil(Math.max(...binsPercent) / 10) * 10 + 10
                },
                x: { title: { display: true, text: 'Rango de valores' } }
            }
        }
    });

    // Explicación debajo del gráfico
    const explDiv = document.getElementById('random-histogram-explanation');
    if (explDiv) {
        explDiv.innerHTML = `
            <p class="text-xs text-gray-600 mt-2">
                El histograma muestra la distribución de los números aleatorios generados en el intervalo [0, 1).
                Si la generación es uniforme, las barras deberían tener alturas similares.
            </p>
        `;
    }
}

/**
 * Histograma de la distribución simulada
 */
function renderDistributionChart(data) {
    const ctx = document.getElementById('distribution-chart').getContext('2d');
    if (distributionChart) distributionChart.destroy();
    const samples = data.samples;
    const minVal = Math.min(...samples);
    const maxVal = Math.max(...samples);

    let chartData, chartOptions, extraDatasets = [];

    if (data.distribution === 'normal') {
        // Histograma
        const binCount = Math.min(20, Math.ceil(Math.sqrt(samples.length)));
        const range = maxVal - minVal;
        const binSize = range / binCount;
        const bins = Array.from({length: binCount + 1}, (_, i) => minVal + i * binSize);
        const counts = Array(binCount).fill(0);
        samples.forEach(value => {
            let binIndex = Math.floor((value - minVal) / binSize);
            binIndex = Math.min(binIndex, binCount - 1);
            counts[binIndex]++;
        });

        // Curva teórica normal
        const mean = data.mean;
        const std = data.variance ? Math.sqrt(data.variance) : 1;
        const curveY = [];
        const total = samples.length;
        for (let i = 0; i < bins.length - 1; i++) {
            const x = (bins[i] + bins[i + 1]) / 2;
            const density = (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
            curveY.push(density * total * binSize);
        }

        // Línea de la media teórica (si existe)
        let annotations = {};
        if (data.theoretical_mean !== undefined) {
            annotations.media = {
                type: 'line',
                xMin: (data.theoretical_mean - minVal) / binSize - 0.5,
                xMax: (data.theoretical_mean - minVal) / binSize - 0.5,
                borderColor: 'green',
                borderWidth: 2,
                label: {
                    content: 'Media teórica',
                    enabled: true,
                    position: 'start',
                    color: 'green',
                    font: { weight: 'bold' }
                }
            };
        }

        chartData = {
            labels: bins.slice(0, -1).map((bin, i) => `${bin.toFixed(2)} - ${bins[i+1].toFixed(2)}`),
            datasets: [
                {
                    label: 'Frecuencia observada',
                    data: counts,
                    backgroundColor: 'rgba(79, 70, 229, 0.7)',
                    borderColor: 'rgba(79, 70, 229, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Curva Normal Teórica',
                    data: curveY,
                    type: 'line',
                    borderColor: 'red',
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0,
                    tension: 0.4,
                    yAxisID: 'y'
                }
            ]
        };
        chartOptions = {
            responsive: true,
            plugins: {
                legend: { display: true },
                title: {
                    display: true,
                    text: 'Histograma de la Distribución Normal Simulada'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.type === 'line') {
                                return `Curva teórica: ${context.parsed.y.toFixed(2)}`;
                            }
                            return `Frecuencia: ${context.parsed.y}`;
                        }
                    }
                },
                annotation: {
                    annotations
                }
            },
            scales: {
                x: { title: { display: true, text: 'Intervalos' } },
                y: { title: { display: true, text: 'Frecuencia' }, beginAtZero: true }
            }
        };
    } else {
        // Discretas (Poisson, Binomial, etc.)
        const unique = [...new Set(samples)].sort((a, b) => a - b);
        const counts = unique.map(val => samples.filter(x => x === val).length);
        const maxCount = Math.max(...counts);
        const barColors = counts.map(c => c === maxCount ? 'rgba(168, 85, 247, 0.9)' : 'rgba(79, 70, 229, 0.7)');
        chartData = {
            labels: unique.map(String),
            datasets: [{
                label: 'Frecuencia observada',
                data: counts,
                backgroundColor: barColors,
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 1
            }]
        };
        chartOptions = {
            responsive: true,
            plugins: {
                legend: { display: true },
                title: {
                    display: true,
                    text: 'Histograma de la Distribución Simulada'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Frecuencia: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                x: { title: { display: true, text: 'Valor' } },
                y: { title: { display: true, text: 'Frecuencia' }, beginAtZero: true }
            }
        };
    }

    distributionChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: chartOptions
    });
}

/**
 * Muestra la fórmula de la distribución seleccionada
 */
function showDistributionFormula(distribution) {
    let formula = '';
    let explanation = '';
    switch (distribution) {
        case 'normal':
            formula = 'f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}';
            explanation = 'Distribución normal (Gaussiana) con media \\(\\mu\\) y desviación estándar \\(\\sigma\\).';
            break;
        case 'poisson':
            formula = 'P(X=k) = \\frac{e^{-\\lambda} \\lambda^k}{k!}';
            explanation = 'Distribución de Poisson con parámetro \\(\\lambda\\).';
            break;
        case 'binomial':
            formula = 'P(X=k) = \\binom{n}{k} p^k (1-p)^{n-k}';
            explanation = 'Distribución binomial con \\(n\\) ensayos y probabilidad de éxito \\(p\\).';
            break;
        case 'exponential':
            formula = 'f(x) = \\lambda e^{-\\lambda x},\\ x \\geq 0';
            explanation = 'Distribución exponencial con tasa \\(\\lambda\\).';
            break;
    }
    document.getElementById("distribution-formula").innerHTML = `
        <div class="math-formula text-lg mb-2">$$${formula}$$</div>
        <p class="text-gray-600 text-sm">${explanation}</p>
    `;
    if (window.MathJax) MathJax.typeset();
}

// ===============================
// EXPORTACIÓN DE DATOS
// ===============================

/**
 * Exporta los números aleatorios generados a un archivo CSV
 */
function downloadRandomNumbers() {
    if (randomNumbers.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'No hay datos',
            text: 'Primero genera algunos números aleatorios',
            confirmButtonColor: '#4f46e5'
        });
        return;
    }
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Número\n";
    randomNumbers.forEach(num => {
        csvContent += `${num}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "numeros_aleatorios.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ===============================
// INICIALIZACIÓN
// ===============================

document.addEventListener('DOMContentLoaded', function() {
    updateRandomParams();
    updateFormFields();
});