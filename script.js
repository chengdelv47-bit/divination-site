// =============================================
// 星启占卜 — 主逻辑
// =============================================

// ---------- 状态 ----------
let currentCards = [];
let currentAstro = null;
let apiKey = localStorage.getItem('astro_api_key') || '';
const API_PROXY = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? '/api/proxy'
    : 'https://divination-site.vercel.app/api/proxy';

// ---------- 视图切换 ----------
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + viewId).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- API Key ----------
function openApiModal() {
    document.getElementById('api-modal').classList.add('active');
}
function saveApiKey() {
    const key = document.getElementById('api-key-input').value.trim();
    if (key) {
        apiKey = key;
        localStorage.setItem('astro_api_key', key);
        document.getElementById('api-modal').classList.remove('active');
        showToast('API Key 已保存');
    } else {
        showToast('请输入有效的 API Key');
    }
}
function skipApiKey() {
    document.getElementById('api-modal').classList.remove('active');
}

// ---------- 测试 API 连接 ----------
async function testApiConnection() {
    const key = document.getElementById('api-key-input').value.trim() || apiKey;
    const resultEl = document.getElementById('test-result');
    const btn = document.getElementById('test-api-btn');

    if (!key) {
        resultEl.innerHTML = '<span style="color:#ff6b6b;">请先输入 API Key</span>';
        return;
    }

    btn.disabled = true;
    btn.textContent = '测试中...';
    resultEl.innerHTML = '<span style="color:var(--text-dim);">正在连接...</span>';

    try {
        const res = await fetch(API_PROXY, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + key
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                max_tokens: 50,
                messages: [{ role: 'user', content: '回复"ok"表示连接成功' }]
            })
        });

        if (res.ok) {
            resultEl.innerHTML = '<span style="color:#4ade80;">✓ 连接成功！API Key 有效</span>';
            // 自动保存
            apiKey = key;
            localStorage.setItem('astro_api_key', key);
        } else {
            let errMsg = `HTTP ${res.status}`;
            try {
                const err = await res.json();
                errMsg += `: ${err.error?.message || err.error?.type || JSON.stringify(err)}`;
            } catch { errMsg += await res.text().catch(() => ''); }
            resultEl.innerHTML = `<span style="color:#ff6b6b;">✗ ${errMsg}</span>`;
        }
    } catch (err) {
        resultEl.innerHTML = `<span style="color:#ff6b6b;">✗ 网络错误：${err.message}</span>`;
    }

    btn.disabled = false;
    btn.textContent = '测试连接';
}

// ---------- 复制启动命令 ----------
function copyServerCmd() {
    const el = document.getElementById('server-cmd');
    if (navigator.clipboard) {
        navigator.clipboard.writeText(el.textContent).then(() => {
            showToast('已复制启动命令，请粘贴到终端运行');
        }).catch(() => fallbackCopy(el));
    } else {
        fallbackCopy(el);
    }
}
function fallbackCopy(el) {
    const range = document.createRange();
    range.selectNode(el);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    showToast('已复制启动命令');
}

// ---------- 选择按钮 ----------
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-opt')) {
        document.querySelectorAll('.btn-opt').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
    }
});

// ---------- 加载动画提示 ----------
let loadingTimer = null;
function startLoadingMessages(elId, messages) {
    const el = document.getElementById(elId);
    let i = 0;
    el.textContent = messages[0];
    loadingTimer = setInterval(() => {
        i = (i + 1) % messages.length;
        el.textContent = messages[i];
    }, 5000);
}
function stopLoadingMessages() {
    if (loadingTimer) { clearInterval(loadingTimer); loadingTimer = null; }
}

// ---------- Toast ----------
function showToast(msg, duration) {
    const old = document.querySelector('.toast');
    if (old) old.remove();
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    Object.assign(el.style, {
        position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
        background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--gold)',
        borderRadius: '10px', padding: '12px 24px', zIndex: '2000',
        fontSize: '14px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        animation: 'fadeIn 0.3s ease', maxWidth: '90vw', textAlign: 'center'
    });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), duration || 2500);
}

// =============================================
// 塔罗牌逻辑
// =============================================

function getCardCount() {
    const active = document.querySelector('#card-count-options .btn-opt.active');
    return active ? parseInt(active.dataset.value) : 1;
}

function startTarotReading() {
    const count = getCardCount();

    document.getElementById('tarot-setup').classList.add('hidden');
    document.getElementById('tarot-spread').classList.add('hidden');
    document.getElementById('tarot-interpretation').classList.add('hidden');
    document.getElementById('tarot-shuffle').classList.remove('hidden');

    setTimeout(() => {
        currentCards = drawTarotCards(count);
        renderTarotSpread(currentCards);
        document.getElementById('tarot-shuffle').classList.add('hidden');
        document.getElementById('tarot-spread').classList.remove('hidden');
        window.scrollTo({ top: document.getElementById('card-spread').offsetTop - 80, behavior: 'smooth' });
    }, 2000);
}

function renderTarotSpread(cards) {
    const container = document.getElementById('card-spread');
    container.innerHTML = '';
    cards.forEach((card, i) => {
        const div = document.createElement('div');
        div.className = 'tarot-card';

        const inner = document.createElement('div');
        inner.className = 'tarot-card-inner';

        const face = document.createElement('div');
        face.className = 'tarot-card-face';
        const isRev = card.isReversed;

        face.innerHTML = `
            <div class="tarot-card-icon">${card.emoji || '🃏'}</div>
            <div class="tarot-card-number">${card.arcana === 'major' ? '大阿卡纳 ' + card.number : card.suit + ' ' + card.number}</div>
            <div class="tarot-card-name">${card.name}${isRev ? ' (逆位)' : ''}</div>
            <div class="tarot-card-keywords">${card.keywords}</div>
        `;

        inner.appendChild(face);
        div.appendChild(inner);

        setTimeout(() => { div.classList.add('revealed'); }, 500 + i * 200);

        container.appendChild(div);
    });
}

async function callAnthropicAPI(prompt) {
    console.log('[星启] 正在调用 DeepSeek API...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    try {
        const res = await fetch(API_PROXY, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                max_tokens: 1500,
                messages: [{ role: 'user', content: prompt }]
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            let errMsg = `HTTP ${res.status}`;
            try {
                const errBody = await res.json();
                errMsg += `: ${errBody.error?.message || JSON.stringify(errBody)}`;
            } catch {
                const errText = await res.text().catch(() => '');
                errMsg += errText ? `: ${errText.slice(0, 300)}` : '';
            }
            throw new Error(errMsg);
        }

        const data = await res.json();
        console.log('[星启] API 调用成功');
        return data.choices[0].message.content;
    } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            throw new Error('请求超时，DeepSeek API 响应过慢，请稍后重试');
        }
        throw err;
    }
}

async function interpretTarot() {
    if (!apiKey) { openApiModal(); showToast('请先配置 API Key'); return; }

    const question = document.getElementById('tarot-question').value.trim() || '未指定具体问题';
    document.getElementById('tarot-interpretation').classList.remove('hidden');
    document.getElementById('tarot-reading-text').classList.add('hidden');
    document.getElementById('tarot-loading').classList.remove('hidden');
    window.scrollTo({ top: document.getElementById('tarot-interpretation').offsetTop - 80, behavior: 'smooth' });
    startLoadingMessages('tarot-loading-text', [
        '正在请求 AI 解读...',
        'DeepSeek 正在思考中...',
        '请耐心等待，快要好了...',
        'AI 正在分析牌面...'
    ]);

    const cardsDesc = currentCards.map((c, i) => {
        const pos = ['第1张', '第2张', '第3张', '第4张', '第5张', '第6张', '第7张', '第8张', '第9张', '第10张'][i];
        return `${pos}牌：${c.name}（${c.isReversed ? '逆位' : '正位'}）\n所属：${c.arcana === 'major' ? '大阿卡纳' : c.suit}\n关键词：${c.keywords}\n核心含义：${c.isReversed ? c.reversed : c.upright}`;
    }).join('\n');

    const prompt = `你是一位智慧的塔罗占卜师。请根据以下塔罗牌面，为提问者提供深度解读。

提问者的问题：${question}

抽到的牌（按顺序）：
${cardsDesc}

请提供：
1. **整体能量**：简要总结这组牌面的整体能量和主题
2. **逐牌解读**：每张牌的详细含义及其在问题中的启示
3. **综合建议**：基于这些牌，给提问者的行动建议

注意事项：
- 语气温和而深刻，充满共情与智慧
- 避免绝对化的预言，以启发和引导为主
- 使用中文，语言优美但不过分华丽
- 适当引用塔罗的象征意义`;

    try {
        const text = await callAnthropicAPI(prompt);
        stopLoadingMessages();
        document.getElementById('tarot-question').value = '';
        document.getElementById('tarot-reading-text').textContent = text;
        document.getElementById('tarot-reading-text').classList.remove('hidden');
        document.getElementById('tarot-loading').classList.add('hidden');
    } catch (err) {
        stopLoadingMessages();
        console.error('[星启] API 错误:', err);
        document.getElementById('tarot-loading').classList.add('hidden');
        document.getElementById('tarot-reading-text').classList.remove('hidden');
        document.getElementById('tarot-reading-text').innerHTML = getErrorHTML(err);
    }
}

function getErrorHTML(err) {
    const msg = err.message || String(err);
    let suggestion = '请检查 API Key 是否正确，或稍后重试。';

    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('net::ERR_')) {
        suggestion = '无法连接到代理服务器。请确认已通过 server.py 启动服务。';
    } else if (msg.includes('401') || msg.includes('invalid') || msg.includes('key') || msg.includes('apiKey')) {
        suggestion = 'API Key 无效或已过期，请在右上角重新输入。';
    } else if (msg.includes('403')) {
        suggestion = 'API Key 没有访问权限，请检查密钥是否有效。';
    } else if (msg.includes('529')) {
        suggestion = 'API 负载过高，请稍后重试。';
    } else if (msg.includes('400')) {
        suggestion = '请求参数有误。错误详情：' + msg;
    }

    return `<p style="color:#ff6b6b;">解读出错了</p>
            <p style="color:var(--text-dim);font-size:13px;margin:8px 0;">${msg}</p>
            <p style="color:var(--text-dim);margin-top:12px;font-size:14px;">${suggestion}</p>`;
}

function resetTarot() {
    currentCards = [];
    document.getElementById('tarot-setup').classList.remove('hidden');
    document.getElementById('tarot-spread').classList.add('hidden');
    document.getElementById('tarot-interpretation').classList.add('hidden');
    document.getElementById('tarot-question').value = '';
}

// =============================================
// 星骰逻辑
// =============================================

function rollAstroDice() {
    document.getElementById('astro-setup').classList.add('hidden');
    document.getElementById('astro-result').classList.add('hidden');
    document.getElementById('astro-interpretation').classList.add('hidden');
    document.getElementById('astro-rolling').classList.remove('hidden');

    let count = 0;
    const interval = setInterval(() => {
        const p = PLANETS[Math.floor(Math.random() * PLANETS.length)];
        const s = SIGNS[Math.floor(Math.random() * SIGNS.length)];
        const h = HOUSES[Math.floor(Math.random() * HOUSES.length)];
        document.getElementById('dice-planet').textContent = p.symbol;
        document.getElementById('dice-sign').textContent = s.symbol;
        document.getElementById('dice-house').textContent = h.symbol;
        count++;
        if (count > 12) {
            clearInterval(interval);
            currentAstro = window.rollAstroDice();
            showAstroResult(currentAstro);
            document.getElementById('astro-rolling').classList.add('hidden');
            document.getElementById('astro-result').classList.remove('hidden');
            window.scrollTo({ top: document.getElementById('astro-result').offsetTop - 80, behavior: 'smooth' });
        }
    }, 150);
}

function showAstroResult(astro) {
    document.getElementById('astro-planet').textContent = astro.planet.symbol;
    document.getElementById('astro-planet-name').textContent = astro.planet.name;
    document.getElementById('astro-sign').textContent = astro.sign.symbol;
    document.getElementById('astro-sign-name').textContent = astro.sign.name;
    document.getElementById('astro-house').textContent = astro.house.symbol;
    document.getElementById('astro-house-name').textContent = astro.house.name;

    document.getElementById('astro-combination').innerHTML =
        `<strong>${astro.planet.name}</strong>（${astro.planet.meaning}）在<strong>${astro.sign.name}</strong>（${astro.sign.meaning}），落于<strong>${astro.house.name}</strong>（${astro.house.meaning}）`;
}

async function interpretAstro() {
    if (!apiKey) { openApiModal(); showToast('请先配置 API Key'); return; }

    const question = document.getElementById('astro-question').value.trim() || '未指定具体问题';
    document.getElementById('astro-interpretation').classList.remove('hidden');
    document.getElementById('astro-reading-text').classList.add('hidden');
    document.getElementById('astro-loading').classList.remove('hidden');
    window.scrollTo({ top: document.getElementById('astro-interpretation').offsetTop - 80, behavior: 'smooth' });
    startLoadingMessages('astro-loading-text', [
        '正在请求 AI 解读...',
        'DeepSeek 正在思考中...',
        '请耐心等待，快要好了...',
        'AI 正在解析星辰之语...'
    ]);

    const a = currentAstro;
    const prompt = `你是一位智慧的占星师。请根据以下星骰结果，为提问者提供深度解读。

提问者的问题：${question}

星骰结果：
- 行星：${a.planet.name}（${a.planet.meaning}）
- 星座：${a.sign.name}（${a.sign.meaning}，${a.sign.element}象星座）
- 宫位：${a.house.name}（${a.house.meaning}）

组合含义：${a.planet.name}在${a.sign.name}，落于${a.house.name}

请提供：
1. **核心解读**：简要说明这个星骰组合的核心含义（3-5句话）
2. **详细分析**：从行星能量、星座特质和宫位领域三个层面深入分析
3. **行动指引**：给提问者的建议和注意事项

注意事项：
- 语气温和而深刻，充满共情与智慧
- 避免绝对化的预言，以启发和引导为主
- 使用中文，语言优美但不过分华丽`;

    try {
        const text = await callAnthropicAPI(prompt);
        stopLoadingMessages();
        document.getElementById('astro-question').value = '';
        document.getElementById('astro-reading-text').textContent = text;
        document.getElementById('astro-reading-text').classList.remove('hidden');
        document.getElementById('astro-loading').classList.add('hidden');
    } catch (err) {
        stopLoadingMessages();
        console.error('[星启] API 错误:', err);
        document.getElementById('astro-loading').classList.add('hidden');
        document.getElementById('astro-reading-text').classList.remove('hidden');
        document.getElementById('astro-reading-text').innerHTML = getErrorHTML(err);
    }
}

function resetAstro() {
    currentAstro = null;
    document.getElementById('astro-setup').classList.remove('hidden');
    document.getElementById('astro-result').classList.add('hidden');
    document.getElementById('astro-interpretation').classList.add('hidden');
    document.getElementById('astro-question').value = '';
}

// ---------- 首次加载 ----------
document.addEventListener('DOMContentLoaded', function() {
    if (!apiKey) {
        setTimeout(openApiModal, 500);
    }
});
