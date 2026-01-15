from flask import Flask, request, jsonify, send_from_directory, send_file, abort
from werkzeug.utils import secure_filename
from database.db import (
    init_db,
    salvar_agendamento,
    listar_agendamentos,
    atualizar_status_agendamento,
    excluir_agendamento,
    listar_portfolio,
    criar_portfolio_item,
    atualizar_portfolio_item,
    excluir_portfolio_item,
)
from flask_cors import CORS
import os
import uuid
from pathlib import Path

# Obtém o diretório raiz do projeto
BASE_DIR = Path(__file__).parent.parent

app = Flask(__name__)
CORS(app)

# Configurações
app.config['SECRET_KEY'] = 'sua_chave_secreta_aqui'
app.config['UPLOAD_FOLDER'] = BASE_DIR / 'images' / 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size

# Garante que a pasta de uploads exista
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Extensões permitidas
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'webm', 'mov'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def _admin_token_valid():
    expected = os.getenv('ADMIN_TOKEN', '')
    if not expected:
        expected = 'Adm1nT0k3nC0mpl3x0!'
    provided = request.headers.get('X-Admin-Token') or request.args.get('token')
    return provided == expected


def _require_admin():
    if not _admin_token_valid():
        return jsonify({'sucesso': False, 'mensagem': 'Não autorizado'}), 401
    return None

# Rota para a página inicial
@app.route('/')
def index():
    return send_file(os.path.join(BASE_DIR, 'index.html'))


@app.route('/admin')
def admin_page():
    return send_file(os.path.join(BASE_DIR, 'admin.html'))

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


@app.route('/api/portfolio', methods=['GET'])
def portfolio_publico():
    try:
        itens = listar_portfolio(ativo_apenas=True)
        return jsonify([dict(i) for i in itens])
    except Exception as e:
        return jsonify({'sucesso': False, 'mensagem': str(e)}), 500

# Rota para listar agendamentos (protegida)
@app.route('/api/agendamentos', methods=['GET'])
def listar():
    try:
        # Aqui você pode adicionar autenticação se necessário
        agendamentos = listar_agendamentos()
        return jsonify([dict(agendamento) for agendamento in agendamentos])
    except Exception as e:
        return jsonify({'erro': str(e)}), 500


@app.route('/api/admin/agendamentos', methods=['GET'])
def admin_listar_agendamentos():
    auth = _require_admin()
    if auth:
        return auth
    try:
        agendamentos = listar_agendamentos()
        return jsonify([dict(agendamento) for agendamento in agendamentos])
    except Exception as e:
        return jsonify({'sucesso': False, 'mensagem': str(e)}), 500


@app.route('/api/admin/agendamentos/<int:agendamento_id>', methods=['PATCH'])
def admin_atualizar_agendamento(agendamento_id):
    auth = _require_admin()
    if auth:
        return auth
    data = request.get_json(silent=True) or {}
    status = (data.get('status') or '').strip().lower()
    if status not in ['novo', 'em_contato', 'fechado', 'cancelado']:
        return jsonify({'sucesso': False, 'mensagem': 'Status inválido'}), 400
    ok = atualizar_status_agendamento(agendamento_id, status)
    if not ok:
        return jsonify({'sucesso': False, 'mensagem': 'Agendamento não encontrado'}), 404
    return jsonify({'sucesso': True})


@app.route('/api/admin/agendamentos/<int:agendamento_id>', methods=['DELETE'])
def admin_excluir_agendamento(agendamento_id):
    auth = _require_admin()
    if auth:
        return auth
    ok = excluir_agendamento(agendamento_id)
    if not ok:
        return jsonify({'sucesso': False, 'mensagem': 'Agendamento não encontrado'}), 404
    return jsonify({'sucesso': True})


@app.route('/api/admin/upload', methods=['POST'])
def admin_upload_file():
    auth = _require_admin()
    if auth:
        return auth
    
    if 'file' not in request.files:
        return jsonify({'sucesso': False, 'mensagem': 'Nenhum arquivo enviado'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'sucesso': False, 'mensagem': 'Nenhum arquivo selecionado'}), 400
    
    if file and allowed_file(file.filename):
        # Gera nome único para o arquivo
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        file_path = app.config['UPLOAD_FOLDER'] / unique_filename
        
        try:
            file.save(str(file_path))
            # Retorna o caminho relativo para ser usado no frontend
            relative_path = f"images/uploads/{unique_filename}"
            return jsonify({
                'sucesso': True, 
                'arquivo': relative_path,
                'mensagem': 'Arquivo enviado com sucesso'
            })
        except Exception as e:
            return jsonify({'sucesso': False, 'mensagem': f'Erro ao salvar arquivo: {str(e)}'}), 500
    
    return jsonify({'sucesso': False, 'mensagem': 'Tipo de arquivo não permitido'}), 400


@app.route('/api/admin/portfolio', methods=['GET'])
def admin_listar_portfolio():
    auth = _require_admin()
    if auth:
        return auth
    try:
        itens = listar_portfolio(ativo_apenas=False)
        return jsonify([dict(i) for i in itens])
    except Exception as e:
        return jsonify({'sucesso': False, 'mensagem': str(e)}), 500


@app.route('/api/admin/portfolio', methods=['POST'])
def admin_criar_portfolio():
    auth = _require_admin()
    if auth:
        return auth
    data = request.get_json(silent=True) or {}
    categoria = (data.get('categoria') or '').strip().lower()
    titulo = (data.get('titulo') or '').strip()
    descricao = (data.get('descricao') or '').strip()
    media_tipo = (data.get('media_tipo') or '').strip().lower()
    media_src = (data.get('media_src') or '').strip()
    link_url = (data.get('link_url') or '').strip() or None
    ativo = 1 if data.get('ativo', True) else 0

    if categoria not in ['drone', 'fotografia', 'sites']:
        return jsonify({'sucesso': False, 'mensagem': 'Categoria inválida'}), 400
    if media_tipo not in ['video', 'image', 'custom']:
        return jsonify({'sucesso': False, 'mensagem': 'media_tipo inválido'}), 400
    if not titulo or not media_src:
        return jsonify({'sucesso': False, 'mensagem': 'Dados incompletos'}), 400

    ok, result = criar_portfolio_item(categoria, titulo, descricao, media_tipo, media_src, link_url, ativo)
    if not ok:
        return jsonify({'sucesso': False, 'mensagem': str(result)}), 500
    return jsonify({'sucesso': True, 'id': result})


@app.route('/api/admin/portfolio/<int:item_id>', methods=['PUT'])
def admin_atualizar_portfolio(item_id):
    auth = _require_admin()
    if auth:
        return auth
    data = request.get_json(silent=True) or {}
    categoria = (data.get('categoria') or '').strip().lower()
    titulo = (data.get('titulo') or '').strip()
    descricao = (data.get('descricao') or '').strip()
    media_tipo = (data.get('media_tipo') or '').strip().lower()
    media_src = (data.get('media_src') or '').strip()
    link_url = (data.get('link_url') or '').strip() or None
    ativo = 1 if data.get('ativo', True) else 0

    if categoria not in ['drone', 'fotografia', 'sites']:
        return jsonify({'sucesso': False, 'mensagem': 'Categoria inválida'}), 400
    if media_tipo not in ['video', 'image', 'custom']:
        return jsonify({'sucesso': False, 'mensagem': 'media_tipo inválido'}), 400
    if not titulo or not media_src:
        return jsonify({'sucesso': False, 'mensagem': 'Dados incompletos'}), 400

    ok = atualizar_portfolio_item(item_id, categoria, titulo, descricao, media_tipo, media_src, link_url, ativo)
    if not ok:
        return jsonify({'sucesso': False, 'mensagem': 'Item não encontrado'}), 404
    return jsonify({'sucesso': True})


@app.route('/api/admin/portfolio/<int:item_id>', methods=['DELETE'])
def admin_excluir_portfolio(item_id):
    auth = _require_admin()
    if auth:
        return auth
    ok = excluir_portfolio_item(item_id)
    if not ok:
        return jsonify({'sucesso': False, 'mensagem': 'Item não encontrado'}), 404
    return jsonify({'sucesso': True})

if __name__ == '__main__':
    # Inicializa o banco de dados
    init_db()
    
    # Inicia o servidor
    app.run(host='0.0.0.0', port=5000, debug=True)
