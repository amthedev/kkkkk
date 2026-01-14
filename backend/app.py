from flask import Flask, request, jsonify, send_from_directory, send_file, abort
from database.db import init_db, salvar_agendamento, listar_agendamentos
import os
from pathlib import Path

# Obtém o diretório raiz do projeto
BASE_DIR = Path(__file__).parent.parent

app = Flask(__name__)

# Configurações
app.config['SECRET_KEY'] = 'sua_chave_secreta_aqui'

# Rota para a página inicial
@app.route('/')
def index():
    return send_file(os.path.join(BASE_DIR, 'index.html'))

# Rota para arquivos estáticos (CSS, JS, imagens, etc)
@app.route('/<path:filename>')
def serve_file(filename):
    # Lista de extensões permitidas (incluindo vídeos)
    allowed_extensions = ['.css', '.js', '.jpg', '.jpeg', '.png', '.gif', '.svg', 
                        '.woff', '.woff2', '.ttf', '.eot', '.html', '.ico',
                        '.mp4', '.webm', '.ogg']  # Formatos de vídeo suportados
    
    file_path = os.path.join(BASE_DIR, filename)
    
    # Verifica se o arquivo existe
    if not os.path.exists(file_path):
        return send_file(os.path.join(BASE_DIR, 'index.html'))
        
    # Verifica a extensão do arquivo
    _, ext = os.path.splitext(filename)
    if ext.lower() not in allowed_extensions:
        return abort(403)
        
    return send_from_directory(BASE_DIR, filename)

# Rota para receber os dados do formulário
@app.route('/api/agendar', methods=['POST'])
def agendar():
    try:
        data = request.get_json()
        
        # Validação dos dados
        if not all(key in data for key in ['nome', 'telefone', 'data', 'hora', 'servico']):
            return jsonify({'sucesso': False, 'mensagem': 'Dados incompletos'}), 400
        
        # Salva o agendamento
        sucesso, mensagem = salvar_agendamento(
            nome=data['nome'],
            telefone=data['telefone'],
            data_agendamento=data['data'],
            horario=data['hora'],
            servico=data['servico'],
            mensagem=data.get('mensagem', '')
        )
        
        if sucesso:
            return jsonify({'sucesso': True, 'mensagem': mensagem})
        else:
            return jsonify({'sucesso': False, 'mensagem': mensagem}), 500
            
    except Exception as e:
        return jsonify({'sucesso': False, 'mensagem': f'Erro no servidor: {str(e)}'}), 500

# Rota para listar agendamentos (protegida)
@app.route('/api/agendamentos', methods=['GET'])
def listar():
    try:
        # Aqui você pode adicionar autenticação se necessário
        agendamentos = listar_agendamentos()
        return jsonify([dict(agendamento) for agendamento in agendamentos])
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

if __name__ == '__main__':
    # Inicializa o banco de dados
    init_db()
    
    # Inicia o servidor
    app.run(host='0.0.0.0', port=5000, debug=True)
