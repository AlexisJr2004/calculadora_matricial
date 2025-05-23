from flaskwebgui import FlaskUI
from flask import Flask, render_template
from routes import (
    matrix_bp, polynomial_bp, vector_bp, plot_bp, calculus_bp, differential_bp, epidemic_bp, eigen_bp, random_bp, simulate_bp, montecarlo_bp
)

app = Flask(__name__)

app.register_blueprint(matrix_bp)
app.register_blueprint(polynomial_bp)
app.register_blueprint(vector_bp)
app.register_blueprint(plot_bp)
app.register_blueprint(calculus_bp)
app.register_blueprint(differential_bp)
app.register_blueprint(epidemic_bp)
app.register_blueprint(eigen_bp)
app.register_blueprint(random_bp)
app.register_blueprint(simulate_bp)
app.register_blueprint(montecarlo_bp)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == "__main__":
    FlaskUI(
        app=app,
        server="flask",
        width=800,
        height=600,
        fullscreen=False,
    ).run()