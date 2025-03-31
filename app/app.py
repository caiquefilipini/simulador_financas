from flask import Flask, send_from_directory
import webbrowser
import threading
import os

# Caminho base para os arquivos
base_dir = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__, static_folder=os.path.join(base_dir, 'scripts'))

@app.route('/')
def index():
    return send_from_directory(base_dir, 'index.html')

@app.route('/styles.css')
def css():
    return send_from_directory(base_dir, 'styles.css')

@app.route('/dict_indicadores.json')
def dados():
    return send_from_directory(base_dir, 'dict_indicadores.json')

@app.route('/scripts/<path:nome_arquivo>')
def scripts(nome_arquivo):
    return send_from_directory(os.path.join(base_dir, 'scripts'), nome_arquivo)

@app.route('/icone.ico')
def favicon():
    return send_from_directory(os.path.dirname(__file__), 'icone.ico')

def abrir_navegador():
    webbrowser.open('http://127.0.0.1:5000')

if __name__ == '__main__':
    threading.Timer(1, abrir_navegador).start()
    app.run()
