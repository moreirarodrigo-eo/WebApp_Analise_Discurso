/* ============================================================
   LABORATÓRIO DE ANÁLISE DE DISCURSO & PLN
   V2.1 - JavaScript
   ============================================================ */

'use strict';

/* ============================================================
   1. NORMALIZAÇÃO E DICIONÁRIOS
   ============================================================ */

function norm(s) {
    return String(s ?? '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}


/* ---------------- STOPWORDS ---------------- */

const SW = new Set(`
a à abaixo acima acolá afim agora aí ainda além algo alguém algum alguma algumas alguns
ali amanhã ambas ambos antes ao aos apenas após aquela aquelas aquele aqueles aquilo
as assim até atrás através bem cada caso cedo cento com como comigo conquanto consigo
consoante contudo contigo contra da das de dela delas dele deles demais depois depressa
desde dessa dessas desse desses desta destas deste destes devagar do dois dos duma dum
e ela elas ele eles em embora enquanto então entre entretanto era eram essa essas esse
esses esta estamos estão estas estava este estes eu fim foi foram fora geral há hoje
isso isto já jamais lá lhe lhes logo longe mais mal mas me meia meio mesma mesmas mesmo
meu meus mil minha minhas muito na nada não nas nem nenhuns nenhuma nenhum ninguém no
nos nossa nossas nosso nossos novamente num numa nunca o onde ontem os ou outra outras
outrem outro outros para pela pelas pelo pelos per perante perto pode podem pois por
porque portanto porém posto pouca pouco poucas poucos primeiro quais qual qualquer
quando quanta quantas quanto quantos quarto que quem quinto sabe se segunda segundo sei
seis sem sempre serei seremos seria seriam será serão seu seus sexta si sim sob sobre
sua suas talvez também tanta tantas tanto tantos te terceira terceiro teu teus ti toda
todas todavia todo todos três tu tua tuas tudo um uma umas uns vai vamos ver vez você
vocês vos vossa vossas vosso vossos vós
`.split(/\s+/).map(norm).filter(Boolean));


/* ---------------- POSITIVAS ---------------- */

const POS = new Set(`
bom boa positivo positiva sucesso prosperidade melhoria avanço esperança futuro
oportunidade benefício benefícios forte força sustentável sustentabilidade adaptação
resiliente resiliência proteção preservar preservação cooperação confiança solução
soluções desenvolvimento inclusão justiça qualidade crescimento excelência excelente
feliz felicidade alegria alegre paz harmonia harmonioso seguro segurança lucro lucrativo
riqueza rico construção construir apoiar apoio ajuda solidariedade igualdade equidade
transparente transparência honestidade ética ético saúde saudável inovação inovar
criatividade inteligente inteligência sabedoria educação aprendizado ecológico conservação
limpo eficiência eficiente otimismo otimista vitalidade vital respeito respeitar autonomia
liberdade libertação conquista vitória vencedor prosperar brilhante maravilha maravilhoso
vida vivo amor amar amizade
`.split(/\s+/).map(norm).filter(Boolean));


/* ---------------- NEGATIVAS ---------------- */

const NEG = new Set(`
ruim má mau negativo negativa problema problemas crise risco riscos ameaça perda perdas
dano danos destruição desmatamento seca estiagem incêndio incendio fogo queimadas conflito
dificuldade pobreza vulnerável vulnerabilidade medo insegurança fracasso pior piora prejuízo
falta escassez pressão sofrimento dor doente doença triste tristeza raiva ódio violento
violência agressão atacar guerra corrupção corrupto desigualdade injustiça roubo fraude
mentira falso falência dívida endividado desemprego desempregado morte morrer letal fatal
poluição poluir tóxico lixo sujo ignorância ignorante estupidez erro errar culpa culpado
terror pânico assustador desastre tragédia trágico fome miséria fraqueza fraco declínio
queda colapso ruína inimigo hostil depressão abandono desespero
`.split(/\s+/).map(norm).filter(Boolean));


/* ============================================================
   2. TOKENIZAÇÃO
   ============================================================ */

function toks(s) {

    if (!s || typeof s !== 'string') {
        return [];
    }

    return s
        .replace(/[“”"‘’]/g, '')
        .split(/\s+/)
        .map(x =>
            x.replace(
                /^[^\p{L}\p{N}-]+|[^\p{L}\p{N}-]+$/gu,
                ''
            )
        )
        .filter(Boolean);
}


/* ============================================================
   3. MODO BARDIN
   ============================================================ */

function bard(x) {

    if (!x) return false;

    if (x.length < 3) return false;

    if (SW.has(x)) return false;

    return true;
}


/* ============================================================
   4. PALAVRAS EXCLUÍDAS
   ============================================================ */

function getExc() {

    const el = document.getElementById('excluir');

    if (!el) {
        return new Set();
    }

    return new Set(
        el.value
            .split(/[\s,;]+/)
            .map(x => norm(x))
            .filter(Boolean)
    );
}


/* ============================================================
   5. SELEÇÃO DE TOKENS
   ============================================================ */

function selected(s) {

    if (!s || typeof s !== 'string') {
        return [];
    }

    const exc = getExc();

    const metodoEl =
        document.querySelector(
            '[name="metodo"]:checked'
        );

    const metodo =
        metodoEl
            ? metodoEl.value
            : 'pln';

    return toks(s).filter(x => {

        const n = norm(x);

        if (!n) return false;

        if (exc.has(n)) return false;

        if (n.length <= 1) return false;

        if (/\d/.test(n)) return false;

        if (metodo === 'pln') {
            return !SW.has(n);
        }

        return bard(n);
    });
}


/* ============================================================
   6. FREQUÊNCIA
   ============================================================ */

function count(a) {

    const m = new Map();

    a.forEach(x => {

        const palavra = norm(x);

        if (!palavra) return;

        m.set(
            palavra,
            (m.get(palavra) || 0) + 1
        );
    });

    return [...m]
        .map(([palavra, n]) => ({
            palavra,
            n
        }))
        .sort((a, b) => b.n - a.n);
}


/* ============================================================
   7. N-GRAMAS
   ============================================================ */

function ng(a, n) {

    const exc = getExc();

    n = Number(n);

    if (!Number.isInteger(n) || n < 1) {
        return [];
    }

    const m = new Map();

    for (let i = 0; i <= a.length - n; i++) {

        let g = a
            .slice(i, i + n)
            .map(norm);

        if (
            g.some(
                x =>
                    !x ||
                    SW.has(x) ||
                    exc.has(x)
            )
        ) {
            continue;
        }

        const grama = g.join(' ');

        m.set(
            grama,
            (m.get(grama) || 0) + 1
        );
    }

    return [...m]
        .map(([grama, n]) => ({
            grama,
            n
        }))
        .filter(x => x.n > 1)
        .sort((a, b) => b.n - a.n);
}


/* ============================================================
   8. ESTADO GLOBAL
   ============================================================ */

let S = {

    text: '',

    freq: [],

    ngr: [],

    kw: [],

    bigramas: []
};

let C = {};

let network = null;

let ngT = null;

let kwT = null;

let prevT = null;

let codT = null;


/* ============================================================
   9. UTILITÁRIOS
   ============================================================ */

function esc(s) {

    return String(s ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}


/* ============================================================
   10. GRÁFICOS
   ============================================================ */

function mk(id, type, data, opt = {}) {

    const canvas =
        document.getElementById(id);

    if (!canvas) {

        throw new Error(
            `Elemento #${id} não foi encontrado no HTML.`
        );
    }

    if (typeof Chart === 'undefined') {

        throw new Error(
            'Chart.js não foi carregado. Verifique a conexão com o CDN.'
        );
    }

    if (C[id]) {

        try {
            C[id].destroy();
        } catch (e) {
            console.warn(
                'Não foi possível destruir o gráfico anterior:',
                e
            );
        }
    }

    C[id] = new Chart(
        canvas,
        {
            type: type,
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                ...opt
            }
        }
    );

    return C[id];
}


/* ============================================================
   11. LOADING / ERROS
   ============================================================ */

function runWithLoading(
    btnId,
    originalText,
    task
) {

    const btn =
        document.getElementById(btnId);

    if (!btn) {

        console.error(
            `Botão #${btnId} não encontrado.`
        );

        return;
    }

    btn.disabled = true;

    btn.innerHTML = `
        <span
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true">
        </span>
        Processando...
    `;

    setTimeout(() => {

        try {

            task();

        } catch (e) {

            console.error(
                '================================'
            );

            console.error(
                'ERRO NA ANÁLISE'
            );

            console.error(
                'Mensagem:',
                e.message
            );

            console.error(
                'Stack:',
                e.stack
            );

            console.error(
                '================================'
            );

            alert(
                'Ocorreu um erro durante a análise.\n\n' +
                e.message +
                '\n\n' +
                'Abra F12 → Console para obter detalhes.'
            );

        } finally {

            btn.disabled = false;

            btn.innerHTML =
                originalText;
        }

    }, 50);
}


/* ============================================================
   12. MÉTRICAS
   ============================================================ */

function metrics(t, f) {

    const raw =
        toks(t);

    const u =
        f.length;

    const total =
        f.reduce(
            (a, b) => a + b.n,
            0
        );

    const sent =
        t
            .split(/[.!?]+/)
            .filter(
                x => x.trim()
            )
            .length;

    const ttr =
        total
            ? u / total
            : 0;

    const metricas =
        document.getElementById(
            'metricas'
        );

    if (!metricas) {

        throw new Error(
            'Elemento #metricas não encontrado.'
        );
    }

    metricas.innerHTML = [

        [
            raw.length,
            'Tokens'
        ],

        [
            u,
            'Vocabulário'
        ],

        [
            (ttr * 100).toFixed(1) + '%',
            'Riqueza lexical'
        ],

        [
            sent,
            'Sentenças'
        ]

    ]
        .map(
            x => `
            <div class="col-sm-6 col-xl-3">

                <div class="metric">

                    <b>${x[0]}</b>

                    <br>

                    <small>
                        ${x[1]}
                    </small>

                </div>

            </div>
            `
        )
        .join('');


    /* Perfil lexical */

    const top5 =
        f
            .slice(0, 5)
            .reduce(
                (a, b) => a + b.n,
                0
            );

    mk(
        'perfil',
        'doughnut',
        {
            labels: [
                'Top 5',
                'Demais'
            ],

            datasets: [
                {
                    data: [
                        top5,
                        Math.max(
                            total - top5,
                            0
                        )
                    ]
                }
            ]
        },
        {
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    );
}


/* ============================================================
   13. NUVEM
   ============================================================ */

function renderCloud() {

    const d =
        document.getElementById(
            'cloud'
        );

    if (!d) {

        throw new Error(
            'Elemento #cloud não encontrado.'
        );
    }

    d.innerHTML = '';

    if (
        typeof WordCloud ===
        'undefined'
    ) {

        throw new Error(
            'WordCloud não foi carregado.'
        );
    }

    if (
        !S.freq ||
        !S.freq.length
    ) {

        d.innerHTML = `
            <div class="text-center text-muted p-5">
                Nenhuma palavra disponível.
            </div>
        `;

        return;
    }

    const mx =
        Math.max(
            ...S.freq.map(
                x => x.n
            ),
            1
        );

    WordCloud(
        d,
        {
            list:
                S.freq
                    .slice(0, 100)
                    .map(
                        x => [
                            x.palavra,
                            12 +
                            (x.n / mx) * 42
                        ]
                    ),

            gridSize: 8,

            fontFamily:
                'Arial',

            color:
                'random-dark',

            backgroundColor:
                'white',

            rotateRatio:
                0.15
        }
    );
}


/* ============================================================
   14. N-GRAMAS
   ============================================================ */

function renderN() {

    const ngEl =
        document.getElementById(
            'ng'
        );

    if (!ngEl) {

        throw new Error(
            'Elemento #ng não encontrado.'
        );
    }

    const tamanho =
        Number(
            ngEl.value
        );

    const tokens =
        selected(
            S.text
        );

    S.ngr =
        ng(
            tokens,
            tamanho
        );

    const a =
        S.ngr
            .slice(0, 20)
            .reverse();


    /* Gráfico */

    mk(
        'ngChart',
        'bar',
        {
            labels:
                a.map(
                    x => x.grama
                ),

            datasets: [
                {
                    label:
                        'Frequência',

                    data:
                        a.map(
                            x => x.n
                        ),

                    backgroundColor:
                        '#536878'
                }
            ]
        },
        {
            indexAxis:
                'y',

            plugins: {
                legend: {
                    display:
                        false
                }
            }
        }
    );


    /* Tabela */

    const totalNg =
        S.ngr.reduce(
            (sum, item) =>
                sum + item.n,
            0
        );

    if (ngT) {

        try {
            ngT.destroy();
        } catch (e) {}
    }

    const tbody =
        document.querySelector(
            '#ngTable tbody'
        );

    if (!tbody) {

        throw new Error(
            'Tabela #ngTable não encontrada.'
        );
    }

    const rowsHtml =
        S.ngr
            .map(x => {

                const rel =
                    totalNg
                        ? (
                            (x.n /
                                totalNg) *
                            100
                        ).toFixed(2)
                        : '0.00';

                return `
                    <tr>

                        <td>
                            ${esc(x.grama)}
                        </td>

                        <td>
                            ${x.n}
                        </td>

                        <td>
                            ${rel}%
                        </td>

                    </tr>
                `;
            })
            .join('');

    tbody.innerHTML =
        rowsHtml ||
        `
        <tr>

            <td
                colspan="3"
                class="text-center text-muted">

                Nenhum dado encontrado.

            </td>

        </tr>
        `;


    if (
        typeof DataTable ===
        'undefined'
    ) {

        throw new Error(
            'DataTables não foi carregado.'
        );
    }

    ngT =
        new DataTable(
            '#ngTable',
            {
                pageLength: 10,
                lengthChange: false,
                destroy: true
            }
        );
}


/* ============================================================
   15. KWIC
   ============================================================ */

function renderK() {

    const termoEl =
        document.getElementById(
            'termo'
        );

    const janelaEl =
        document.getElementById(
            'janela'
        );

    if (!termoEl) {

        throw new Error(
            'Campo #termo não encontrado.'
        );
    }

    if (!janelaEl) {

        throw new Error(
            'Campo #janela não encontrado.'
        );
    }

    const term =
        norm(
            termoEl.value
        );

    const w =
        Number(
            janelaEl.value
        );

    const a =
        toks(
            S.text
        );

    const rows = [];

    if (!term) {

        document.querySelector(
            '#kwTable tbody'
        ).innerHTML = `
            <tr>
                <td colspan="3"
                    class="text-center">
                    Digite um termo.
                </td>
            </tr>
        `;

        return;
    }

    a.forEach(
        (x, i) => {

            if (
                norm(x) ===
                term
            ) {

                rows.push({

                    pre:
                        a
                            .slice(
                                Math.max(
                                    0,
                                    i - w
                                ),
                                i
                            )
                            .join(' '),

                    keyword:
                        x,

                    post:
                        a
                            .slice(
                                i + 1,
                                i + w + 1
                            )
                            .join(' ')
                });
            }
        }
    );

    S.kw =
        rows;


    if (kwT) {

        try {
            kwT.destroy();
        } catch (e) {}
    }

    const tbody =
        document.querySelector(
            '#kwTable tbody'
        );

    if (!tbody) {

        throw new Error(
            'Tabela #kwTable não encontrada.'
        );
    }

    tbody.innerHTML =
        rows
            .map(
                x => `
                <tr>

                    <td>
                        ${esc(x.pre)}
                    </td>

                    <td>
                        <b>
                            ${esc(x.keyword)}
                        </b>
                    </td>

                    <td>
                        ${esc(x.post)}
                    </td>

                </tr>
                `
            )
            .join('') ||

        `
        <tr>

            <td
                colspan="3"
                class="text-center text-muted">

                Termo não encontrado.

            </td>

        </tr>
        `;


    kwT =
        new DataTable(
            '#kwTable',
            {
                pageLength: 10,
                lengthChange: false,
                ordering: false,
                destroy: true
            }
        );
}


/* ============================================================
   16. REDE DE COOCORRÊNCIA
   ============================================================ */

function renderRede() {

    if (
        typeof vis ===
        'undefined'
    ) {

        throw new Error(
            'vis-network não foi carregado.'
        );
    }

    const container =
        document.getElementById(
            'redeNetwork'
        );

    if (!container) {

        throw new Error(
            'Elemento #redeNetwork não encontrado.'
        );
    }

    const topWords =
        S.freq
            .slice(0, 35);


    const nodesArray =
        topWords.map(
            x => ({

                id:
                    x.palavra,

                label:
                    x.palavra,

                value:
                    x.n,

                title:
                    `Frequência: ${x.n}`,

                shape:
                    'dot',

                color: {
                    background:
                        '#8eb3d4',

                    border:
                        '#4e79a7',

                    highlight: {
                        background:
                            '#f28e2b',

                        border:
                            '#e15759'
                    }
                },

                font: {
                    size: 16,

                    face:
                        'Arial'
                }
            })
        );


    const edgesArray = [];

    const sentences =
        S.text
            .split(/[.!?]+/)
            .map(
                s =>
                    selected(s)
                        .map(norm)
            );


    for (
        let i = 0;
        i < topWords.length;
        i++
    ) {

        for (
            let j = i + 1;
            j < topWords.length;
            j++
        ) {

            const w1 =
                topWords[i]
                    .palavra;

            const w2 =
                topWords[j]
                    .palavra;

            let coocorrencias =
                0;

            sentences.forEach(
                sent => {

                    if (
                        sent.includes(w1) &&
                        sent.includes(w2)
                    ) {

                        coocorrencias++;
                    }
                }
            );


            if (
                coocorrencias > 0
            ) {

                edgesArray.push({

                    from:
                        w1,

                    to:
                        w2,

                    value:
                        coocorrencias,

                    title:
                        `Ocorrem juntos ${coocorrencias} vezes`,

                    color: {
                        opacity:
                            0.3
                    }
                });
            }
        }
    }


    if (network) {

        try {
            network.destroy();
        } catch (e) {}
    }


    const data = {

        nodes:
            new vis.DataSet(
                nodesArray
            ),

        edges:
            new vis.DataSet(
                edgesArray
            )
    };


    const options = {

        physics: {

            forceAtlas2Based: {

                gravitationalConstant:
                    -50,

                centralGravity:
                    0.01,

                springLength:
                    100,

                springConstant:
                    0.08
            },

            maxVelocity:
                50,

            solver:
                'forceAtlas2Based',

            timestep:
                0.35,

            stabilization: {
                iterations:
                    150
            }
        },

        interaction: {

            hover:
                true,

            tooltipDelay:
                200
        }
    };


    network =
        new vis.Network(
            container,
            data,
            options
        );
}


/* ============================================================
   17. PREVISÃO DE PRÓXIMA PALAVRA
   ============================================================ */

function renderPrevisao() {

    const termoEl =
        document.getElementById(
            'termoPrev'
        );

    if (!termoEl) {

        throw new Error(
            'Campo #termoPrev não encontrado.'
        );
    }

    const term =
        norm(
            termoEl.value.trim()
        );

    let rows = [];


    if (
        term &&
        S.bigramas.length
    ) {

        const matches =
            S.bigramas.filter(
                x =>
                    x.grama
                        .split(' ')[0]
                    === term
            );


        const total =
            matches.reduce(
                (sum, item) =>
                    sum + item.n,
                0
            );


        rows =
            matches
                .map(x => {

                    const nextWord =
                        x.grama
                            .split(' ')[1];

                    const rel =
                        total
                            ? (
                                (x.n /
                                    total) *
                                100
                            ).toFixed(2)
                            : '0.00';

                    return `
                        <tr>

                            <td>
                                ${esc(term)}
                            </td>

                            <td>
                                <b>
                                    ${esc(nextWord)}
                                </b>
                            </td>

                            <td>
                                ${x.n}
                            </td>

                            <td>
                                ${rel}%
                            </td>

                        </tr>
                    `;
                });
    }


    if (prevT) {

        try {
            prevT.destroy();
        } catch (e) {}
    }


    const tbody =
        document.querySelector(
            '#prevTable tbody'
        );

    if (!tbody) {

        throw new Error(
            'Tabela #prevTable não encontrada.'
        );
    }


    tbody.innerHTML =
        rows.join('') ||
        `
        <tr>

            <td
                colspan="4"
                class="text-center text-muted">

                Nenhum dado encontrado.

            </td>

        </tr>
        `;


    prevT =
        new DataTable(
            '#prevTable',
            {
                pageLength: 10,

                lengthChange:
                    false,

                order: [
                    [2, 'desc']
                ],

                destroy:
                    true
            }
        );
}


/* ============================================================
   18. SENTIMENTO
   ============================================================ */

function sentiment() {

    const a =
        selected(
            S.text
        );

    let p = 0;

    let n = 0;


    a.forEach(
        x => {

            const w =
                norm(x);

            if (
                POS.has(w)
            ) {
                p++;
            }

            if (
                NEG.has(w)
            ) {
                n++;
            }
        }
    );


    mk(
        'sentChart',
        'doughnut',
        {

            labels: [
                'Positivo',
                'Negativo',
                'Neutro'
            ],

            datasets: [
                {
                    data: [
                        p,
                        n,
                        Math.max(
                            a.length -
                            p -
                            n,
                            0
                        )
                    ]
                }
            ]
        },
        {
            plugins: {
                legend: {
                    position:
                        'bottom'
                }
            }
        }
    );


    const sentText =
        document.getElementById(
            'sentText'
        );

    if (sentText) {

        sentText.innerHTML = `
            Foram identificados
            <b>${p}</b>
            marcadores positivos e
            <b>${n}</b>
            negativos.

            <br><br>

            <strong>Interpretação:</strong>
            resultado lexical exploratório.

            <br>

            O método não detecta
            automaticamente ironia,
            contexto, negação,
            sarcasmo ou pragmática.
        `;
    }
}


/* ============================================================
   19. CODIFICAÇÃO TEMÁTICA
   ============================================================ */

function coding() {

    const catsEl =
        document.getElementById(
            'cats'
        );

    if (!catsEl) {

        throw new Error(
            'Campo #cats não encontrado.'
        );
    }


    const cats =
        catsEl.value
            .split(',')
            .map(
                x => x.trim()
            )
            .filter(Boolean);


    const ss =
        S.text
            .split(/[.!?]+/)
            .filter(
                x => x.trim()
            );


    if (codT) {

        try {
            codT.destroy();
        } catch (e) {}
    }


    const codRowsHtml =
        cats
            .map(c => {

                const ts =
                    c.split(/\s+/)
                        .map(norm);


                const h =
                    ss.filter(
                        s =>
                            ts.some(
                                t =>
                                    norm(s)
                                        .includes(t)
                            )
                    );


                return `
                    <tr>

                        <td>
                            ${esc(c)}
                        </td>

                        <td>
                            ${h.length}
                        </td>

                        <td>
                            ${esc(
                                h
                                    .slice(0, 5)
                                    .join(' | ')
                                || '—'
                            )}
                        </td>

                    </tr>
                `;
            })
            .join('');


    const tbody =
        document.querySelector(
            '#codTable tbody'
        );

    if (!tbody) {

        throw new Error(
            'Tabela #codTable não encontrada.'
        );
    }


    tbody.innerHTML =
        codRowsHtml ||
        `
        <tr>

            <td
                colspan="3"
                class="text-center">

                Nenhum dado.

            </td>

        </tr>
        `;


    codT =
        new DataTable(
            '#codTable',
            {
                pageLength:
                    10,

                lengthChange:
                    false,

                destroy:
                    true
            }
        );
}


/* ============================================================
   20. COMPARAÇÃO
   ============================================================ */

function compare() {

    const aEl =
        document.getElementById('a');

    const bEl =
        document.getElementById('b');


    if (!aEl || !bEl) {

        throw new Error(
            'Campos de comparação não encontrados.'
        );
    }


    const textoA =
        aEl.value.trim();

    const textoB =
        bEl.value.trim();


    if (!textoA) {

        alert(
            'Insira o Texto A.'
        );

        return;
    }


    if (!textoB) {

        alert(
            'Insira o Texto B.'
        );

        return;
    }


    const a =
        count(
            selected(textoA)
        );

    const b =
        count(
            selected(textoB)
        );


    const ma =
        new Map(
            a.map(
                x => [
                    x.palavra,
                    x.n
                ]
            )
        );


    const mb =
        new Map(
            b.map(
                x => [
                    x.palavra,
                    x.n
                ]
            )
        );


    const k =
        [
            ...new Set(
                [
                    ...a.slice(0, 10),
                    ...b.slice(0, 10)
                ]
                .map(
                    x =>
                        x.palavra
                )
            )
        ]
        .slice(0, 15);


    mk(
        'compChart',
        'bar',
        {

            labels:
                k,

            datasets: [

                {
                    label:
                        'Texto A',

                    data:
                        k.map(
                            x =>
                                ma.get(x)
                                || 0
                        )
                },

                {
                    label:
                        'Texto B',

                    data:
                        k.map(
                            x =>
                                mb.get(x)
                                || 0
                        )
                }
            ]
        }
    );


    const compText =
        document.getElementById(
            'compText'
        );


    if (compText) {

        const comuns =
            k.filter(
                x =>
                    ma.has(x) &&
                    mb.has(x)
            );


        compText.innerHTML = `
            <p class="alert alert-light mt-3">

                <strong>
                    Termos presentes nos dois rankings:
                </strong>

                ${
                    comuns.length
                        ? esc(
                            comuns.join(', ')
                        )
                        : 'Nenhum'
                }

            </p>
        `;
    }
}


/* ============================================================
   21. EXPORTAÇÃO
   ============================================================ */

function dl(
    name,
    text,
    type = 'text/csv'
) {

    const blob =
        new Blob(
            [text],
            {
                type:
                    type +
                    ';charset=utf-8'
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const a =
        document.createElement(
            'a'
        );


    a.href =
        url;

    a.download =
        name;


    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);


    setTimeout(
        () =>
            URL.revokeObjectURL(
                url
            ),
        1000
    );
}


function csv(a) {

    if (
        !a ||
        !a.length
    ) {
        return '';
    }


    return [
        Object.keys(
            a[0]
        ).join(','),

        ...a.map(
            x =>
                Object.values(x)
                    .map(
                        v =>
                            '"' +
                            String(v ?? '')
                                .replaceAll(
                                    '"',
                                    '""'
                                ) +
                            '"'
                    )
                    .join(',')
        )

    ].join('\n');
}


/* ============================================================
   22. RELATÓRIO HTML
   ============================================================ */

function exportHtml() {

    const freqHtml =
        S.freq
            .slice(0, 50)
            .map(
                x =>
                    `
                    <tr>
                        <td>
                            ${esc(x.palavra)}
                        </td>
                        <td>
                            ${x.n}
                        </td>
                    </tr>
                    `
            )
            .join('');


    const kwicHtml =
        S.kw
            .map(
                x =>
                    `
                    <tr>
                        <td>
                            ${esc(x.pre)}
                        </td>
                        <td>
                            <strong>
                                ${esc(x.keyword)}
                            </strong>
                        </td>
                        <td>
                            ${esc(x.post)}
                        </td>
                    </tr>
                    `
            )
            .join('');


    const html = `
<!DOCTYPE html>

<html lang="pt-BR">

<head>

<meta charset="utf-8">

<title>
Relatório de Análise de Discurso & PLN
</title>

<style>

body {
    font-family: Arial, sans-serif;
    margin: 40px;
    line-height: 1.5;
}

h1, h2 {
    color: #1f4e79;
}

table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 30px;
}

th, td {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: left;
}

th {
    background: #f0f0f0;
}

.kwic {
    font-size: 14px;
}

</style>

</head>

<body>

<h1>
Laboratório de Análise de Discurso & PLN
</h1>

<p>
Relatório gerado automaticamente.
</p>

<h2>
Frequência lexical
</h2>

<table>

<thead>

<tr>
<th>Termo</th>
<th>Frequência</th>
</tr>

</thead>

<tbody>

${freqHtml}

</tbody>

</table>


<h2>
KWIC
</h2>

<table class="kwic">

<thead>

<tr>
<th>Anterior</th>
<th>Termo</th>
<th>Posterior</th>
</tr>

</thead>

<tbody>

${kwicHtml}

</tbody>

</table>

</body>

</html>
`;


    dl(
        'relatorio.html',
        html,
        'text/html'
    );
}


/* ============================================================
   23. PROCESSAMENTO PRINCIPAL
   ============================================================ */

function process() {

    console.log(
        '================================'
    );

    console.log(
        'INÍCIO DO PROCESSAMENTO'
    );

    console.log(
        '================================'
    );


    const textarea =
        document.getElementById(
            'texto'
        );


    if (!textarea) {

        throw new Error(
            'Elemento #texto não encontrado.'
        );
    }


    S.text =
        textarea.value.trim();


    console.log(
        'Caracteres:',
        S.text.length
    );


    if (!S.text) {

        throw new Error(
            'O campo de texto está vazio.'
        );
    }


    if (
        S.text.length < 3
    ) {

        throw new Error(
            'O texto possui menos de 3 caracteres.'
        );
    }


    /* ---------------- TOKENS ---------------- */

    const tokens =
        toks(S.text);


    console.log(
        'Tokens brutos:',
        tokens.length
    );


    if (!tokens.length) {

        throw new Error(
            'Não foi possível identificar palavras no texto.'
        );
    }


    /* ---------------- SELEÇÃO ---------------- */

    const selecionados =
        selected(S.text);


    console.log(
        'Tokens selecionados:',
        selecionados.length
    );


    if (!selecionados.length) {

        console.warn(
            'Nenhuma palavra passou pelo pré-processamento.'
        );

        alert(
            'O texto foi lido, mas nenhuma palavra passou pelo pré-processamento. ' +
            'Experimente selecionar PLN ou remover algumas palavras da lista de exclusão.'
        );

        return;
    }


    /* ---------------- FREQUÊNCIA ---------------- */

    S.freq =
        count(
            selecionados
        );


    console.log(
        'Vocabulário:',
        S.freq.length
    );


    /* ---------------- BIGRAMAS ---------------- */

    S.bigramas =
        ng(
            selecionados,
            2
        );


    console.log(
        'Bigramas:',
        S.bigramas.length
    );


    /* ---------------- MÉTRICAS ---------------- */

    metrics(
        S.text,
        S.freq
    );


    /* ---------------- N-GRAMAS ---------------- */

    renderN();


    /* ---------------- SENTIMENTO ---------------- */

    sentiment();


    console.log(
        '================================'
    );

    console.log(
        'PROCESSAMENTO CONCLUÍDO'
    );

    console.log(
        '================================'
    );
}


/* ============================================================
   24. INICIALIZAÇÃO DOS EVENTOS
   ============================================================ */

function initApp() {

    console.log(
        'Inicializando Laboratório de Análise de Discurso & PLN...'
    );


    /* Verificação das bibliotecas */

    console.log(
        'Chart:',
        typeof Chart
    );

    console.log(
        'DataTable:',
        typeof DataTable
    );

    console.log(
        'WordCloud:',
        typeof WordCloud
    );

    console.log(
        'vis:',
        typeof vis
    );


    /* ---------------- PROCESSAR ---------------- */

    const processar =
        document.getElementById(
            'processar'
        );


    if (processar) {

        processar.onclick =
            () => {

                runWithLoading(
                    'processar',
                    '▶ Processar corpus inteiro',
                    process
                );
            };
    }


    /* ---------------- KWIC ---------------- */

    const btnKwic =
        document.getElementById(
            'btnKwic'
        );


    if (btnKwic) {

        btnKwic.onclick =
            () => {

                if (!S.text) {

                    alert(
                        'Processe o corpus primeiro.'
                    );

                    return;
                }


                if (
                    !document
                        .getElementById(
                            'termo'
                        )
                        .value
                        .trim()
                ) {

                    alert(
                        'Digite um termo no campo acima.'
                    );

                    return;
                }


                runWithLoading(
                    'btnKwic',
                    'Gerar KWIC',
                    renderK
                );
            };
    }


    /* ---------------- NUVEM ---------------- */

    const btnNuvem =
        document.getElementById(
            'btnNuvem'
        );


    if (btnNuvem) {

        btnNuvem.onclick =
            () => {

                if (!S.text) {

                    alert(
                        'Processe o corpus primeiro.'
                    );

                    return;
                }


                runWithLoading(
                    'btnNuvem',
                    '▶ Gerar Nuvem de Palavras',
                    renderCloud
                );
            };
    }


    /* ---------------- REDE ---------------- */

    const btnRede =
        document.getElementById(
            'btnRede'
        );


    if (btnRede) {

        btnRede.onclick =
            () => {

                if (!S.text) {

                    alert(
                        'Processe o corpus primeiro.'
                    );

                    return;
                }


                runWithLoading(
                    'btnRede',
                    '▶ Gerar Grafo de Rede',
                    renderRede
                );
            };
    }


    /* ---------------- PREVISÃO ---------------- */

    const btnPrev =
        document.getElementById(
            'btnPrev'
        );


    if (btnPrev) {

        btnPrev.onclick =
            () => {

                if (!S.text) {

                    alert(
                        'Processe o corpus primeiro.'
                    );

                    return;
                }


                const termo =
                    document
                        .getElementById(
                            'termoPrev'
                        )
                        .value
                        .trim();


                if (!termo) {

                    alert(
                        'Digite um termo para prever.'
                    );

                    return;
                }


                runWithLoading(
                    'btnPrev',
                    '▶ Prever Próxima Palavra',
                    renderPrevisao
                );
            };
    }


    /* ---------------- N-GRAMA ---------------- */

    const ngEl =
        document.getElementById(
            'ng'
        );


    if (ngEl) {

        ngEl.onchange =
            () => {

                if (
                    S.text
                ) {

                    renderN();
                }
            };
    }


    /* ---------------- KWIC JANELA ---------------- */

    const janela =
        document.getElementById(
            'janela'
        );


    if (janela) {

        janela.onchange =
            () => {

                if (
                    S.text &&
                    document
                        .getElementById(
                            'termo'
                        )
                        .value
                ) {

                    renderK();
                }
            };
    }


    /* ---------------- MÉTODO PLN/BARDIN ---------------- */

    document
        .querySelectorAll(
            '[name="metodo"]'
        )
        .forEach(
            el => {

                el.addEventListener(
                    'change',
                    () => {

                        if (
                            S.text
                        ) {

                            S.freq =
                                count(
                                    selected(
                                        S.text
                                    )
                                );

                            S.bigramas =
                                ng(
                                    selected(
                                        S.text
                                    ),
                                    2
                                );

                            metrics(
                                S.text,
                                S.freq
                            );

                            renderN();

                            sentiment();
                        }
                    }
                );
            }
        );


    /* ---------------- EXCLUSÃO DE PALAVRAS ---------------- */

    const excluir =
        document.getElementById(
            'excluir'
        );


    if (excluir) {

        excluir.addEventListener(
            'change',
            () => {

                if (
                    S.text
                ) {

                    S.freq =
                        count(
                            selected(
                                S.text
                            )
                        );

                    S.bigramas =
                        ng(
                            selected(
                                S.text
                            ),
                            2
                        );

                    metrics(
                        S.text,
                        S.freq
                    );

                    renderN();

                    sentiment();
                }
            }
        );
    }


    /* ---------------- LIMPAR ---------------- */

    const limpar =
        document.getElementById(
            'limpar'
        );


    if (limpar) {

        limpar.onclick =
            () => {

                const textarea =
                    document.getElementById(
                        'texto'
                    );

                if (textarea) {
                    textarea.value = '';
                }


                S = {
                    text: '',
                    freq: [],
                    ngr: [],
                    kw: [],
                    bigramas: []
                };


                Object.keys(C)
                    .forEach(
                        id => {

                            if (
                                C[id]
                            ) {

                                try {
                                    C[id].destroy();
                                } catch (e) {}

                                delete C[id];
                            }
                        }
                    );


                if (network) {

                    try {
                        network.destroy();
                    } catch (e) {}

                    network =
                        null;
                }


                [
                    'metricas',
                    'cloud',
                    'sentText',
                    'compText'
                ]
                    .forEach(
                        id => {

                            const el =
                                document.getElementById(
                                    id
                                );

                            if (el) {
                                el.innerHTML = '';
                            }
                        }
                    );


                [
                    '#ngTable tbody',
                    '#kwTable tbody',
                    '#prevTable tbody',
                    '#codTable tbody'
                ]
                    .forEach(
                        selector => {

                            const el =
                                document.querySelector(
                                    selector
                                );

                            if (el) {
                                el.innerHTML = '';
                            }
                        }
                    );


                console.log(
                    'Aplicação limpa.'
                );
            };
    }


    /* ---------------- CODIFICAÇÃO ---------------- */

    const codificar =
        document.getElementById(
            'codificar'
        );


    if (codificar) {

        codificar.onclick =
            () => {

                if (!S.text) {

                    alert(
                        'Processe o corpus primeiro.'
                    );

                    return;
                }


                runWithLoading(
                    'codificar',
                    'Gerar códigos',
                    coding
                );
            };
    }


    /* ---------------- COMPARAÇÃO ---------------- */

    const comparar =
        document.getElementById(
            'comparar'
        );


    if (comparar) {

        comparar.onclick =
            () => {

                runWithLoading(
                    'comparar',
                    'Comparar',
                    compare
                );
            };
    }


    /* ---------------- UPLOAD ---------------- */

    const file =
        document.getElementById(
            'file'
        );


    if (file) {

        file.onchange =
            e => {

                const f =
                    e.target.files[0];

                if (!f) return;


                const reader =
                    new FileReader();


                reader.onload =
                    () => {

                        const textarea =
                            document.getElementById(
                                'texto'
                            );

                        if (
                            textarea
                        ) {

                            textarea.value =
                                reader.result;
                        }


                        console.log(
                            'Arquivo carregado:',
                            f.name
                        );

                        console.log(
                            'Caracteres:',
                            String(
                                reader.result
                            ).length
                        );
                    };


                reader.onerror =
                    () => {

                        alert(
                            'Não foi possível ler o arquivo.'
                        );
                    };


                reader.readAsText(
                    f,
                    'UTF-8'
                );
            };
    }


    /* ---------------- EXPORTAÇÃO ---------------- */

    const exFreq =
        document.getElementById(
            'exFreq'
        );

    if (exFreq) {

        exFreq.onclick =
            () =>
                dl(
                    'frequencia.csv',
                    csv(S.freq)
                );
    }


    const exNg =
        document.getElementById(
            'exNg'
        );

    if (exNg) {

        exNg.onclick =
            () =>
                dl(
                    'ngrams.csv',
                    csv(S.ngr)
                );
    }


    const exKw =
        document.getElementById(
            'exKw'
        );

    if (exKw) {

        exKw.onclick =
            () =>
                dl(
                    'kwic.csv',
                    csv(S.kw)
                );
    }


    const exHtml =
        document.getElementById(
            'exHtml'
        );

    if (exHtml) {

        exHtml.onclick =
            exportHtml;
    }


    /* ---------------- TABS ---------------- */

    document
        .querySelectorAll(
            'button[data-bs-toggle="tab"]'
        )
        .forEach(
            el => {

                el.addEventListener(
                    'shown.bs.tab',
                    () => {

                        Object
                            .values(C)
                            .forEach(
                                chart => {

                                    if (
                                        chart
                                    ) {

                                        try {
                                            chart.resize();
                                        } catch (e) {}
                                    }
                                }
                            );


                        if (
                            network
                        ) {

                            try {
                                network.fit();
                            } catch (e) {}
                        }
                    }
                );
            }
        );


    console.log(
        'Aplicação inicializada com sucesso.'
    );
}


/* ============================================================
   25. START
   ============================================================ */

if (
    document.readyState ===
    'loading'
) {

    document.addEventListener(
        'DOMContentLoaded',
        initApp
    );

} else {

    initApp();
}
