/**
 * =============================================
 * 🚀      CALCULADORA MATEMÁTICA AVANZADA
 * =============================================
 * 
 * 🏗️ ESTRUCTURA:
 * 1. Operaciones con Matrices
 * 2. Operaciones con Polinomios
 * 3. Operaciones con Vectores
 * 4. Graficación de Funciones
 * 5. Operaciones de Cálculo
 * 6. Ecuaciones Diferenciales
 * 7. Modelos Matemáticos
 * 8. Valores y Vectores Propios
 * 9. Números Aleatorios
 * 10. Simulación de MonteCarlo
 * 11. Acerca de
 */

// =============================================
// 🖥️ GESTIÓN DE INTERFAZ
// =============================================

/**
 * Muestra la ventana de ayuda al usuario
 */
function mostrarAyuda() {
    Swal.fire({
        title: '¿Cómo usar esta calculadora?',
        icon: 'question',
        html: `
            <ol class="space-y-4 text-left" style="padding-left: 20px;">
                <li class="flex items-center">
                    <div class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-3 text-indigo-600 text-sm font-medium">
                        1
                    </div>
                    <span class="text-gray-700">Selecciona una categoría del menú superior</span>
                </li>
                <li class="flex items-center">
                    <div class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-3 text-indigo-600 text-sm font-medium">
                        2
                    </div>
                    <span class="text-gray-700">Ingresa los datos requeridos en los campos correspondientes</span>
                </li>
                <li class="flex items-center">
                    <div class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-3 text-indigo-600 text-sm font-medium">
                        3
                    </div>
                    <span class="text-gray-700">Haz clic en la operación que deseas realizar</span>
                </li>
                <li class="flex items-center">
                    <div class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-3 text-indigo-600 text-sm font-medium">
                        4
                    </div>
                    <span class="text-gray-700">Visualiza los resultados en la sección inferior</span>
                </li>
            </ol>
        `,
        confirmButtonText: 'Entendido',
        customClass: {
            popup: 'rounded-xl',
            confirmButton: 'bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg'
        }
    });
}

/**
 * Cambia la sección visible de la interfaz según la pestaña seleccionada
 */
function showSection(sectionId) {
    // Oculta todas las secciones
    document.querySelectorAll('[id$="-section"]').forEach(section => {
        section.classList.add("hidden");
    });

    // Desactiva todas las pestañas
    document.querySelectorAll('.tab-button').forEach(tab => {
        tab.classList.remove("active");
    });

    // Muestra la sección seleccionada
    document.getElementById(`${sectionId}-section`).classList.remove("hidden");

    // Activa la pestaña seleccionada
    document.getElementById(`${sectionId}Tab`).classList.add("active");

    // Actualiza el título de la página
    const sectionNames = {
        'home': 'Inicio',
        'matrices': 'Matrices',
        'polynomials': 'Polinomios',
        'vectors': 'Vectores',
        'graphs': 'Gráficas',
        'calculus': 'Cálculo',
        'differential': 'Ecu. Diferenciales',
        'models': 'Modelos',
        'vector': 'Vectores y Valores Propios',
        'random-distribution': 'Números Aleatorios y Distribuciones',
        'montecarlo': 'Simulación de MonteCarlo',
        'about': 'Acerca de'
    };

    document.title = `${sectionNames[sectionId]} | SCIENCE CALC`;

    // Inicializar gráficos si es necesario
    if (sectionId === 'random' && typeof randomNumbers !== 'undefined' && randomNumbers.length > 0) {
        updateHistogram(randomNumbers);
    }
    if (sectionId === 'simulation' && typeof simulationChart !== 'undefined' && simulationChart) {
        simulationChart.update();
    }
}

// =============================================
// 🔄 INICIALIZACIÓN AL CARGAR LA PÁGINA
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    showSection("home");
});