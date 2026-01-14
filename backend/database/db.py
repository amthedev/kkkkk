import sqlite3
import os
from datetime import datetime

# Caminho para o banco de dados
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database', 'agendamentos.db')

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
        
        conn.commit()
        print("Banco de dados inicializado com sucesso!")
        
    except sqlite3.Error as e:
        print(f"Erro ao inicializar o banco de dados: {e}")
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
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
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
