Here's the updated README.md for SCIENCE CALC with the new features and improvements:

```markdown
# SCIENCE CALC - Calculadora Científica Avanzada

<p align="center">
  <img src="https://cdn3d.iconscout.com/3d/premium/thumb/calculadora-4168193-3457124.png?f=webp" width="150" alt="SCIENCE CALC Logo" style="border-radius: 15px;">
  <br>
  <strong>Herramienta matemática avanzada para estudiantes y profesionales</strong>
</p>

<div align="center" style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; margin: 20px 0;">
  <a href="https://drive.google.com/drive/folders/19wBxe_--0iD4wVQFVGS0qkgQbykX_vxg?usp=sharing" target="_blank" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/⬇️_Descargar_Instalador_Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white&border-radius=15px" alt="Descargar Instalador">
  </a>
  <a href="https://drive.google.com/file/d/1Dik0z4n06v4k1JwpVIjHRIvkCqvnykUm/view?usp=sharing" target="_blank" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/📘_Manual_de_Usuario-FF6D01?style=for-the-badge&logo=bookstack&logoColor=white&border-radius=15px" alt="Manual de Usuario">
  </a>
  <a href="https://github.com/AlexisJr2004/calculadora_matricial" target="_blank" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/💻_Repositorio_GitHub-181717?style=for-the-badge&logo=github&logoColor=white&border-radius=15px" alt="Repositorio GitHub">
  </a>
</div>

## 📋 Descripción

**SCIENCE CALC** es una potente calculadora científica desarrollada en Python que ofrece:

- Operaciones matriciales avanzadas
- Manipulación de polinomios
- Cálculos vectoriales
- Graficación 2D/3D
- Cálculo diferencial e integral
- Solución de ecuaciones diferenciales
- Modelos matemáticos aplicados

Con una interfaz intuitiva y capacidades de visualización, es ideal para aplicaciones en modelos matemáticos y simulaciones.

## 🚀 Instalación

### 🔹 Opción 1: Instalador ejecutable (Windows)
Descarga el instalador auto-ejecutable para una instalación sencilla:

<div align="center" style="margin: 20px 0;">
  <a href="https://drive.google.com/drive/folders/19wBxe_--0iD4wVQFVGS0qkgQbykX_vxg?usp=sharing" target="_blank" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/⬇️_Descargar_Instalador-0078D6?style=for-the-badge&logo=windows&logoColor=white&border-radius=15px" alt="Descargar Instalador">
  </a>
</div>

### 🔹 Opción 2: Instalación desde código fuente

#### Requisitos
- Python 3.8+
- pip (gestor de paquetes)

#### Pasos de instalación
```bash
# Clonar el repositorio
git clone https://github.com/AlexisJr2004/calculadora_matricial.git
cd calculadora_matricial

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar la aplicación
python app.py
```

#### Acceso
Abre tu navegador en:
```
http://localhost:5000
```

## 📚 Documentación

Descarga el manual completo de usuario:

<div align="center" style="margin: 20px 0;">
  <a href="https://drive.google.com/file/d/1Dik0z4n06v4k1JwpVIjHRIvkCqvnykUm/view?usp=sharing" target="_blank" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/📘_Manual_de_Usuario-FF6D01?style=for-the-badge&logo=bookstack&logoColor=white&border-radius=15px" alt="Manual de Usuario">
  </a>
</div>

## 🌟 Novedades en la Versión 3.0

### 🔥 Características destacadas:
- **Nuevo módulo de ecuaciones diferenciales** con 4 métodos numéricos:
  - Euler
  - Euler mejorado
  - Runge-Kutta (4to orden)
  - Serie de Taylor
- **Modelos matemáticos aplicados**:
  - Modelo SIR de propagación de epidemias
  - Ecuación de Bernoulli para fluidos
  - Modelo de interceptación de trayectorias
- **Interfaz mejorada** con pestañas intuitivas
- **Visualización gráfica avanzada** con Plotly y Chart.js

## 📊 Características Principales

| Módulo | Operaciones Disponibles |
|--------|-------------------------|
| Matrices | Suma, resta, multiplicación, determinante, inversa, transpuesta, rango, traza |
| Polinomios | Operaciones algebraicas, derivación, integración, raíces |
| Vectores | Productos punto y cruz, magnitud, normalización, ángulo, proyección |
| Gráficas | Visualización 2D/3D de funciones matemáticas |
| Cálculo | Derivación, integración, límites, series de Taylor |
| Ecuaciones Diferenciales | Solución analítica y numérica con visualización gráfica |
| Modelos Matemáticos | SIR, Bernoulli, Interceptación con análisis detallado |

## 🛠 Ejemplos de Uso

### 1. Ecuaciones Diferenciales
```python
# Ejemplo: Resolver y' = x + y con condición inicial y(0) = 1
# Usando el método de Runge-Kutta
1. Seleccionar pestaña "Ecu. Diferenciales"
2. Ingresar la ecuación: y' = x + y
3. Especificar condición inicial: x₀=0, y₀=1
4. Seleccionar método numérico
5. Visualizar solución y gráfica
```

### 2. Modelo SIR
```python
# Simular propagación de epidemia con:
# Población: 1000, Infectados iniciales: 1
# β=0.5 (tasa de infección), γ=0.1 (tasa de recuperación)
1. Seleccionar pestaña "Modelos" → "Modelo SIR"
2. Ingresar parámetros
3. Ejecutar simulación
4. Analizar gráficos de evolución
```

## 📦 Dependencias Técnicas

```plaintext
flask==3.0.3       # Framework web
numpy==2.1.1       # Cálculos numéricos
sympy==1.13.3      # Matemática simbólica
plotly==5.24.1     # Visualización gráfica
scipy==1.13.1      # Integración numérica
chart.js==3.7.1    # Gráficos 2D
mathjax==3.2.0     # Renderizado de fórmulas
```

## 🛠 Soporte y Contacto

Si encuentras algún problema o tienes sugerencias:

<div align="center" style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; margin: 20px 0;">
  <a href="https://github.com/AlexisJr2004/calculadora_matricial/issues" target="_blank" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/📌_Reportar_Issue-181717?style=for-the-badge&logo=github&logoColor=white&border-radius=15px" alt="Reportar Issue">
  </a>
  <a href="mailto:snietod@unemi.edu.ec" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/✉️_Contacto-D14836?style=for-the-badge&logo=gmail&logoColor=white&border-radius=15px" alt="Contacto">
  </a>
</div>

---

📄 **Licencia MIT** © 2025 - [Steven Alexander Nieto Duran](https://github.com/AlexisJr2004)
```