function getToken() {
    return localStorage.getItem('adminToken') || '';
}

function setToken(token) {
    localStorage.setItem('adminToken', token);
}

function apiBase() {
    return window.location.protocol.startsWith('http') ? '' : 'http://localhost:5000';
}

async function apiFetch(path, options = {}) {
    const headers = Object.assign({}, options.headers || {});
    const token = getToken();
    if (token) headers['X-Admin-Token'] = token;
    return fetch(`${apiBase()}${path}`, Object.assign({}, options, { headers }));
}

function showStatus(el, text, ok) {
    el.textContent = text;
    el.style.display = 'block';
    el.style.color = ok ? 'green' : 'red';
}

function clearPortfolioForm() {
    document.getElementById('portfolio-id').value = '';
    document.getElementById('portfolio-categoria').value = 'drone';
    document.getElementById('portfolio-media-tipo').value = 'video';
    document.getElementById('portfolio-titulo').value = '';
    document.getElementById('portfolio-descricao').value = '';
    document.getElementById('portfolio-media-src').value = '';
    document.getElementById('portfolio-link').value = '';
    document.getElementById('portfolio-ativo').value = '1';
    const fileInput = document.getElementById('portfolio-file-upload');
    if (fileInput) fileInput.value = '';
}

async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiFetch('/api/admin/upload', {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.mensagem || 'Erro ao fazer upload do arquivo');
    }
    
    const result = await response.json();
    if (!result.sucesso) {
        throw new Error(result.mensagem || 'Erro ao fazer upload do arquivo');
    }
    
    return result.arquivo;
}

function formatDataHora(a) {
    const data = a.data_agendamento || '';
    const hora = a.horario || '';
    return `${data} ${hora}`.trim();
}

async function carregarAgendamentos() {
    const body = document.getElementById('agendamentos-body');
    body.innerHTML = '';

    const res = await apiFetch('/api/admin/agendamentos');
    if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.mensagem || 'Falha ao carregar agendamentos');
    }

    const itens = await res.json();
    itens.forEach(a => {
        const tr = document.createElement('tr');

        const statusAtual = a.status || 'novo';

        tr.innerHTML = `
            <td style="padding:10px; border-bottom:1px solid #f2f2f2;">${a.id}</td>
            <td style="padding:10px; border-bottom:1px solid #f2f2f2;">${a.nome || ''}</td>
            <td style="padding:10px; border-bottom:1px solid #f2f2f2;">${a.telefone || ''}</td>
            <td style="padding:10px; border-bottom:1px solid #f2f2f2;">${formatDataHora(a)}</td>
            <td style="padding:10px; border-bottom:1px solid #f2f2f2;">${a.servico || ''}</td>
            <td style="padding:10px; border-bottom:1px solid #f2f2f2;">
                <select data-id="${a.id}" class="ag-status" style="padding:8px; border-radius:8px; border:1px solid #e1e5e9;">
                    <option value="novo">novo</option>
                    <option value="em_contato">em_contato</option>
                    <option value="fechado">fechado</option>
                    <option value="cancelado">cancelado</option>
                </select>
            </td>
            <td style="padding:10px; border-bottom:1px solid #f2f2f2; display:flex; gap:10px;">
                <button class="btn" type="button" data-action="salvar" data-id="${a.id}" style="padding:10px 14px;">Salvar</button>
                <button class="btn" type="button" data-action="excluir" data-id="${a.id}" style="padding:10px 14px; background: #e74c3c; box-shadow:none;">Excluir</button>
            </td>
        `;

        body.appendChild(tr);
        const sel = tr.querySelector('.ag-status');
        sel.value = statusAtual;

        tr.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                const action = btn.getAttribute('data-action');

                if (action === 'salvar') {
                    const novoStatus = sel.value;
                    const r = await apiFetch(`/api/admin/agendamentos/${id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: novoStatus })
                    });
                    if (!r.ok) {
                        const p = await r.json().catch(() => ({}));
                        throw new Error(p.mensagem || 'Erro ao salvar status');
                    }
                }

                if (action === 'excluir') {
                    const ok = confirm('Tem certeza que deseja excluir este agendamento?');
                    if (!ok) return;
                    const r = await apiFetch(`/api/admin/agendamentos/${id}`, { method: 'DELETE' });
                    if (!r.ok) {
                        const p = await r.json().catch(() => ({}));
                        throw new Error(p.mensagem || 'Erro ao excluir');
                    }
                }

                await carregarAgendamentos();
            });
        });
    });
}

async function carregarPortfolio() {
    const body = document.getElementById('portfolio-body');
    body.innerHTML = '';

    const res = await apiFetch('/api/admin/portfolio');
    if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.mensagem || 'Falha ao carregar portfólio');
    }

    const itens = await res.json();
    itens.forEach(i => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="padding:10px; border-bottom:1px solid #f2f2f2;">${i.id}</td>
            <td style="padding:10px; border-bottom:1px solid #f2f2f2;">${i.categoria}</td>
            <td style="padding:10px; border-bottom:1px solid #f2f2f2;">${i.titulo}</td>
            <td style="padding:10px; border-bottom:1px solid #f2f2f2;">${i.media_tipo}: ${i.media_src}</td>
            <td style="padding:10px; border-bottom:1px solid #f2f2f2;">${i.ativo ? 'sim' : 'não'}</td>
            <td style="padding:10px; border-bottom:1px solid #f2f2f2; display:flex; gap:10px;">
                <button class="btn" type="button" data-action="editar" data-id="${i.id}" style="padding:10px 14px;">Editar</button>
                <button class="btn" type="button" data-action="excluir" data-id="${i.id}" style="padding:10px 14px; background: #e74c3c; box-shadow:none;">Excluir</button>
            </td>
        `;
        body.appendChild(tr);

        tr.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', async () => {
                const action = btn.getAttribute('data-action');
                if (action === 'editar') {
                    document.getElementById('portfolio-id').value = String(i.id);
                    document.getElementById('portfolio-categoria').value = i.categoria;
                    document.getElementById('portfolio-media-tipo').value = i.media_tipo;
                    document.getElementById('portfolio-titulo').value = i.titulo;
                    document.getElementById('portfolio-descricao').value = i.descricao || '';
                    document.getElementById('portfolio-media-src').value = i.media_src;
                    document.getElementById('portfolio-link').value = i.link_url || '';
                    document.getElementById('portfolio-ativo').value = i.ativo ? '1' : '0';
                    window.location.hash = '#portfolio';
                }

                if (action === 'excluir') {
                    const ok = confirm('Tem certeza que deseja excluir este item do portfólio?');
                    if (!ok) return;
                    const r = await apiFetch(`/api/admin/portfolio/${i.id}`, { method: 'DELETE' });
                    if (!r.ok) {
                        const p = await r.json().catch(() => ({}));
                        throw new Error(p.mensagem || 'Erro ao excluir');
                    }
                    await carregarPortfolio();
                }
            });
        });
    });
}

async function carregarTudo(statusEl) {
    await carregarAgendamentos();
    await carregarPortfolio();
    if (statusEl) showStatus(statusEl, 'Dados carregados com sucesso.', true);
}

document.addEventListener('DOMContentLoaded', function() {
    const tokenInput = document.getElementById('admin-token');
    const btnSalvarToken = document.getElementById('btn-salvar-token');
    const adminStatus = document.getElementById('admin-status');

    tokenInput.value = getToken();

    btnSalvarToken.addEventListener('click', async () => {
        setToken(tokenInput.value.trim());
        try {
            await carregarTudo(adminStatus);
        } catch (e) {
            showStatus(adminStatus, e.message || 'Falha ao carregar', false);
        }
    });

    const portfolioForm = document.getElementById('portfolio-form');
    const portfolioStatus = document.getElementById('portfolio-status');
    const btnCancelar = document.getElementById('portfolio-cancelar');

    btnCancelar.addEventListener('click', () => {
        clearPortfolioForm();
        portfolioStatus.style.display = 'none';
    });

    portfolioForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('portfolio-id').value.trim();
        
        // Verifica se há arquivo para upload
        const fileInput = document.getElementById('portfolio-file-upload');
        const file = fileInput && fileInput.files ? fileInput.files[0] : null;
        
        let mediaSrc = document.getElementById('portfolio-media-src').value.trim();
        
        // Se houver arquivo, faz upload primeiro
        if (file) {
            try {
                portfolioStatus.textContent = 'Fazendo upload do arquivo...';
                portfolioStatus.style.display = 'block';
                portfolioStatus.style.color = 'blue';
                
                mediaSrc = await uploadFile(file);
                document.getElementById('portfolio-media-src').value = mediaSrc;
            } catch (err) {
                showStatus(portfolioStatus, err.message || 'Erro no upload', false);
                return;
            }
        }
        
        const payload = {
            categoria: document.getElementById('portfolio-categoria').value,
            media_tipo: document.getElementById('portfolio-media-tipo').value,
            titulo: document.getElementById('portfolio-titulo').value.trim(),
            descricao: document.getElementById('portfolio-descricao').value.trim(),
            media_src: mediaSrc,
            link_url: document.getElementById('portfolio-link').value.trim(),
            ativo: document.getElementById('portfolio-ativo').value === '1'
        };

        try {
            const path = id ? `/api/admin/portfolio/${id}` : '/api/admin/portfolio';
            const method = id ? 'PUT' : 'POST';
            const r = await apiFetch(path, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const p = await r.json().catch(() => ({}));
            if (!r.ok || !p.sucesso) {
                throw new Error(p.mensagem || 'Falha ao salvar item');
            }
            showStatus(portfolioStatus, 'Item salvo com sucesso.', true);
            clearPortfolioForm();
            await carregarPortfolio();
        } catch (err) {
            showStatus(portfolioStatus, err.message || 'Falha ao salvar', false);
        }
    });

    if (getToken()) {
        carregarTudo().catch(() => {});
    }
});
