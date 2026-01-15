import sqlite3
import os
from datetime import datetime

# Caminho para o banco de dados
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'agendamentos.db')


def _connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _column_exists(cursor, table_name, column_name):
    cursor.execute(f"PRAGMA table_info({table_name})")
    cols = cursor.fetchall()
    return any(col[1] == column_name for col in cols)

def init_db():
    """Inicializa o banco de dados e cria a tabela de agendamentos se não existir"""
    conn = None
    try:
        # Garante que o diretório do banco de dados existe
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Cria a tabela de agendamentos
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS agendamentos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            telefone TEXT NOT NULL,
            data_agendamento DATE NOT NULL,
            horario TIME NOT NULL,
            servico TEXT NOT NULL,
            mensagem TEXT,
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')

        if not _column_exists(cursor, 'agendamentos', 'status'):
            cursor.execute("ALTER TABLE agendamentos ADD COLUMN status TEXT NOT NULL DEFAULT 'novo'")

        if not _column_exists(cursor, 'agendamentos', 'data_atualizacao'):
            cursor.execute("ALTER TABLE agendamentos ADD COLUMN data_atualizacao TIMESTAMP")

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS portfolio_itens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            categoria TEXT NOT NULL,
            titulo TEXT NOT NULL,
            descricao TEXT,
            media_tipo TEXT NOT NULL,
            media_src TEXT NOT NULL,
            link_url TEXT,
            ativo INTEGER NOT NULL DEFAULT 1,
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            data_atualizacao TIMESTAMP
        )
        ''')

        cursor.execute("SELECT COUNT(1) FROM portfolio_itens")
        qtd_portfolio = cursor.fetchone()[0]
        if qtd_portfolio == 0:
            cursor.executemany(
                """
                INSERT INTO portfolio_itens (categoria, titulo, descricao, media_tipo, media_src, link_url, ativo)
                VALUES (?, ?, ?, ?, ?, ?, 1)
                """,
                [
                    (
                        'drone',
                        'Filmagem de Imóveis em Tamandaré',
                        'Filmagem aérea em 4K - Pernambuco',
                        'video',
                        'images/FIMI0031.MP4',
                        None,
                    ),
                    (
                        'fotografia',
                        'Paisagem de Tamandaré',
                        'Fotografia profissional',
                        'image',
                        'images/3963269788d0fe908af98a5d3e30c814.jpg',
                        None,
                    ),
                    (
                        'sites',
                        'Menu Online Digital',
                        'Sistema de cardápio para restaurantes',
                        'custom',
                        'menu_preview',
                        None,
                    ),
                    (
                        'drone',
                        'Filmagem de Imóveis',
                        'Filmagem aérea profissional',
                        'video',
                        'images/zaidan.mp4',
                        None,
                    ),
                ],
            )
        
        conn.commit()
        print("Banco de dados inicializado com sucesso!")
        
    except sqlite3.Error as e:
        print(f"Erro ao inicializar o banco de dados: {e}")
    finally:
        if conn:
            conn.close()


def atualizar_status_agendamento(agendamento_id, status):
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE agendamentos SET status = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?",
            (status, agendamento_id),
        )
        conn.commit()
        return cursor.rowcount > 0
    except sqlite3.Error:
        return False
    finally:
        if conn:
            conn.close()


def excluir_agendamento(agendamento_id):
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM agendamentos WHERE id = ?", (agendamento_id,))
        conn.commit()
        return cursor.rowcount > 0
    except sqlite3.Error:
        return False
    finally:
        if conn:
            conn.close()


def listar_portfolio(ativo_apenas=True):
    conn = None
    try:
        conn = _connect()
        cursor = conn.cursor()
        if ativo_apenas:
            cursor.execute(
                "SELECT * FROM portfolio_itens WHERE ativo = 1 ORDER BY id DESC"
            )
        else:
            cursor.execute("SELECT * FROM portfolio_itens ORDER BY id DESC")
        return cursor.fetchall()
    except sqlite3.Error:
        return []
    finally:
        if conn:
            conn.close()


def criar_portfolio_item(categoria, titulo, descricao, media_tipo, media_src, link_url=None, ativo=1):
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO portfolio_itens (categoria, titulo, descricao, media_tipo, media_src, link_url, ativo)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (categoria, titulo, descricao, media_tipo, media_src, link_url, 1 if ativo else 0),
        )
        conn.commit()
        return True, cursor.lastrowid
    except sqlite3.Error as e:
        return False, str(e)
    finally:
        if conn:
            conn.close()


def atualizar_portfolio_item(item_id, categoria, titulo, descricao, media_tipo, media_src, link_url=None, ativo=1):
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE portfolio_itens
            SET categoria = ?, titulo = ?, descricao = ?, media_tipo = ?, media_src = ?, link_url = ?, ativo = ?, data_atualizacao = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (categoria, titulo, descricao, media_tipo, media_src, link_url, 1 if ativo else 0, item_id),
        )
        conn.commit()
        return cursor.rowcount > 0
    except sqlite3.Error:
        return False
    finally:
        if conn:
            conn.close()


def excluir_portfolio_item(item_id):
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM portfolio_itens WHERE id = ?", (item_id,))
        conn.commit()
        return cursor.rowcount > 0
    except sqlite3.Error:
        return False
    finally:
        if conn:
            conn.close()

def salvar_agendamento(nome, telefone, data_agendamento, horario, servico, mensagem=None):
    """Salva um novo agendamento no banco de dados"""
    conn = None
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
        INSERT INTO agendamentos (nome, telefone, data_agendamento, horario, servico, mensagem)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (nome, telefone, data_agendamento, horario, servico, mensagem))
        
        conn.commit()
        return True, "Agendamento salvo com sucesso!"
        
    except sqlite3.Error as e:
        return False, f"Erro ao salvar agendamento: {e}"
    finally:
        if conn:
            conn.close()

def listar_agendamentos():
    """Lista todos os agendamentos cadastrados"""
    conn = None
    try:
        conn = _connect()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM agendamentos ORDER BY data_agendamento, horario')
        return cursor.fetchall()
        
    except sqlite3.Error as e:
        print(f"Erro ao listar agendamentos: {e}")
        return []
    finally:
        if conn:
            conn.close()

# Inicializa o banco de dados quando o módulo for importado
if __name__ == "__main__":
    init_db()
