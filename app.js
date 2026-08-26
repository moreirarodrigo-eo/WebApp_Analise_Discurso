function norm(s){return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}

const SW=new Set(`a à abaixo acima acolá afim agora aí ainda além algo alguém algum alguma algumas alguns ali amanhã ambas ambos antes ao aos apenas após aquela aquelas aquele aqueles aquilo as assim até atrás através aí bem cada caso cedo cento com como comigo conquanto consigo consoante contudo contigo contra da das de dela delas dele deles demais depois depressa desde dessa dessas desse desses desta destas deste destes devagar do dois dos duma dum e ela elas ele eles em embora enquanto então entre entretanto era eram essa essas esse esses esta estamos estão estas estava estão este estes eu fim foi foram fora geral há hoje isso isto já jamais lá lhe lhes logo longe mais mal mas me meia meio mesma mesmas mesmo mesmos meu meus mil minha minhas muito na nada não nas nem nenhuns nenhuma nenhum ninguém no nos nossa nossas nosso nossos novamente num numa nunca o onde ontem os ou outra outras outrem outro outros para pela pelas pelo pelos per perante perto pode podem pois por porque portanto porém posto pouca pouco poucas poucos primeiro quais qual qualquer quando quanta quantas quanto quantos quarto que quem quinto sabe se segunda segundo sei seis sem sempre serei seremos seria seriam será serão seu seus sexta si sim sob sobre sua suas talvez também tanta tantas tanto tantos te terceira terceiro teu teus ti tida tido tida tidos toda todas todavia todo todos três tu tua tuas tudo um uma umas uns vai vamos ver vez você vocês vos vossa vossas vosso vossos vós`.split(/\s+/).map(norm));
const POS=new Set(`bom boa positivo positiva sucesso prosperidade melhoria avanço esperança futuro oportunidade benefício benefícios forte força sustentável sustentabilidade adaptação resiliente resiliência proteção preservar preservação cooperação confiança solução soluções desenvolvimento inclusão justiça qualidade crescimento excelência excelente feliz felicidade alegria alegre paz harmonia harmonioso seguro segurança lucro lucrativo riqueza rico construção construir apoiar apoio ajuda solidariedade igualdade equidade transparente transparência honestidade ética ético saúde saudável inovação inovar criatividade inteligente inteligência sabedoria educação aprendizado ecológico conservação limpo eficiência eficiente otimismo otimista vitalidade vital respeito respeitar autonomia liberdade libertação conquista vitória vencedor prosperar brilhante maravilha maravilhoso vida vivo amor amar amizade`.split(/\s+/).map(norm));
const NEG=new Set(`ruim má mau negativo negativa problema problemas crise risco riscos ameaça perda perdas dano danos destruição desmatamento seca estiagem incêndio incendio fogo queimadas conflito dificuldade pobreza vulnerável vulnerabilidade medo insegurança fracasso pior piora prejuízo falta escassez pressão sofrimento dor doente doença triste tristeza raiva ódio violento violência agressão atacar guerra corrupção corrupto desigualdade injustiça roubo fraude mentira falso falência dívida endividado desemprego desempregado morte morrer letal fatal poluição poluir tóxico lixo sujo ignorância ignorante estupidez erro errar culpa culpado terror pânico assustador desastre tragédia trágico fome miséria fraqueza fraco declínio queda colapso ruína inimigo hostil depressão abandono desespero`.split(/\s+/).map(norm));

function toks(s){return s.replace(/[“”"‘’]/g,'').split(/\s+/).map(x=>x.replace(/^[^\p{L}\p{N}-]+|[^\p{L}\p{N}-]+$/gu,'')).filter(Boolean)}
function bard(x){if(x.length<3||SW.has(x)) return false; return true;}
function getExc(){return new Set(document.getElementById('excluir').value.split(/[\s,]+/).map(x=>norm(x)).filter(Boolean));}

function selected(s){
    let exc = getExc();
    return toks(s).filter(x=>{
        let n=norm(x);
        if(exc.has(n)) return false;
        return n.length>1&&!/\d/.test(n)&&(document.querySelector('[name=metodo]:checked').value==='pln'?!SW.has(n):bard(n))
    })
}

function count(a){let m=new Map();a.forEach(x=>{x=norm(x);m.set(x,(m.get(x)||0)+1)});return [...m].map(([palavra,n])=>({palavra,n})).sort((a,b)=>b.n-a.n)}

function ng(a,n){
    let exc = getExc();
    let m=new Map();
    for(let i=0;i<=a.length-n;i++){
        let g=a.slice(i,i+n).map(norm);
        if(g.some(x=>SW.has(x) || exc.has(x)))continue;
        g=g.join(' ');
        m.set(g,(m.get(g)||0)+1)
    }
    return [...m].map(([grama,n])=>({grama,n})).filter(x=>x.n>1).sort((a,b)=>b.n-a.n)
}

let S={text:'',freq:[],ngr:[],kw:[],bigramas:[]},C={};

function mk(id,type,data,opt={}){if(C[id])C[id].destroy();C[id]=new Chart(document.getElementById(id),{type,data,options:{responsive:true,maintainAspectRatio:false,...opt}})}
function esc(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')}

function runWithLoading(btnId, originalText, task) {
    let btn = document.getElementById(btnId);
    if (!btn) return;
    
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processando...`;
    
    setTimeout(() => {
        try {
            task();
        } catch(e) {
            console.error(e);
            alert("Ocorreu um erro interno durante o processamento da análise. Verifique se o texto não está vazio ou muito curto.");
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }, 50); 
}

function metrics(t,f){let raw=toks(t),u=f.length,total=f.reduce((a,b)=>a+b.n,0),sent=t.split(/[.!?]+/).filter(x=>x.trim()).length,ttr=total?u/total:0;document.getElementById('metricas').innerHTML=[[raw.length,'Tokens'],[u,'Vocabulário'],[(ttr*100).toFixed(1)+'%','Riqueza lexical'],[sent,'Sentenças']].map(x=>`<div class="col-sm-6 col-xl-3"><div class="metric"><b>${x[0]}</b><br><small>${x[1]}</small></div></div>`).join('');mk('perfil','doughnut',{labels:['Top 5','Demais'],datasets:[{data:[f.slice(0,5).reduce((a,b)=>a+b.n,0),Math.max(total-f.slice(0,5).reduce((a,b)=>a+b.n,0),0)]}]},{plugins:{legend:{position:'bottom'}}})}

// Nuvem de Palavras separada
function renderCloud(){
    let d=document.getElementById('cloud');
    d.innerHTML='';
    if (!S.freq || !S.freq.length) return;
    let mx=Math.max(...S.freq.map(x=>x.n),1);
    WordCloud(d,{list:S.freq.slice(0,100).map(x=>[x.palavra,12+x.n/mx*42]),gridSize:8,fontFamily:'Arial',color:'random-dark',backgroundColor:'white',rotateRatio:.15});
}

function renderN(){
    S.ngr=ng(selected(S.text),+document.getElementById('ng').value);
    let a=S.ngr.slice(0,20).reverse();
    mk('ngChart','bar',{labels:a.map(x=>x.grama),datasets:[{data:a.map(x=>x.n),backgroundColor:'#536878'}]},{indexAxis:'y',plugins:{legend:{display:false}}});
    
    let totalNg = S.ngr.reduce((sum, item) => sum + item.n, 0);

    // Destroi de forma segura e reescreve a tabela inteira para evitar bugs do DataTable
    if(window.ngT) window.ngT.destroy();
    
    let rowsHtml = S.ngr.map(x=>{
        let rel = totalNg ? ((x.n / totalNg) * 100).toFixed(2) : 0;
        return `<tr><td>${esc(x.grama)}</td><td>${x.n}</td><td>${rel}%</td></tr>`;
    }).join('');
    
    document.querySelector('#ngTable').innerHTML = `<thead><tr><th>Expressão</th><th>Frequência</th><th>%</th></tr></thead><tbody>${rowsHtml}</tbody>`;
    
    window.ngT = new DataTable('#ngTable', {pageLength: 10, lengthChange: false});
}

function renderK(){
    let term=norm(document.getElementById('termo').value),w=+document.getElementById('janela').value,a=toks(S.text),rows=[];
    let exc = getExc();
    a.forEach((x,i)=>{if(norm(x)===term)rows.push({pre:a.slice(Math.max(0,i-w),i).join(' '),keyword:x,post:a.slice(i+1,i+w+1).join(' ')})});
    S.kw=rows;
    
    if(window.kwT) window.kwT.destroy();
    
    let kwRowsHtml = rows.length ? rows.map(x=>`<tr><td>${esc(x.pre)}</td><td><b>${esc(x.keyword)}</b></td><td>${esc(x.post)}</td></tr>`).join('') : '<tr><td colspan="3" class="text-center">Termo não encontrado</td></tr>';
    document.querySelector('#kwTable').innerHTML = `<thead><tr><th>Anterior</th><th>Termo</th><th>Posterior</th></tr></thead><tbody>${kwRowsHtml}</tbody>`;
    
    window.kwT = new DataTable('#kwTable', {pageLength: 10, lengthChange: false, ordering: false});
    
    let m=new Map();
    a.forEach((x,i)=>{if(norm(x)===term)a.slice(Math.max(0,i-w),i+w+1).forEach(y=>{let n=norm(y);if(n!==term&&!SW.has(n)&&!exc.has(n))m.set(n,(m.get(n)||0)+1)})});
    let c=[...m].map(([palavra,n])=>({palavra,n})).sort((a,b)=>b.n-a.n).slice(0,20).reverse();
    mk('coocChart','bar',{labels:c.map(x=>x.palavra),datasets:[{data:c.map(x=>x.n),backgroundColor:'#7a5c61'}]},{indexAxis:'y',plugins:{legend:{display:false}}})
}

// Rede de Coocorrência via Vis.js
function renderRede(){
    let topWords = S.freq.slice(0, 35);
    
    let nodesArray = topWords.map(x => ({
        id: x.palavra,
        label: x.palavra,
        value: x.n,
        title: `Frequência: ${x.n}`,
        shape: 'dot',
        color: { background: '#8eb3d4', border: '#4e79a7', highlight: { background: '#f28e2b', border: '#e15759' } },
        font: { size: 16, face: 'Arial' }
    }));

    let edgesArray = [];
    let sentences = S.text.split(/[.!?]+/).map(s => selected(s).map(norm));
    
    for (let i = 0; i < topWords.length; i++) {
        for (let j = i + 1; j < topWords.length; j++) {
            let w1 = topWords[i].palavra;
            let w2 = topWords[j].palavra;
            let count = 0;
            sentences.forEach(sent => {
                if (sent.includes(w1) && sent.includes(w2)) count++;
            });
            if (count > 0) {
                edgesArray.push({
                    from: w1, to: w2, value: count, title: `Ocorrem juntos ${count} vezes`,
                    color: { opacity: 0.3 }
                });
            }
        }
    }

    let container = document.getElementById('redeNetwork');
    let data = { nodes: new vis.DataSet(nodesArray), edges: new vis.DataSet(edgesArray) };
    let options = {
        physics: { forceAtlas2Based: { gravitationalConstant: -50, centralGravity: 0.01, springLength: 100, springConstant: 0.08 }, maxVelocity: 50, solver: 'forceAtlas2Based', timestep: 0.35, stabilization: { iterations: 150 } },
        interaction: { hover: true, tooltipDelay: 200 }
    };
    
    if(window.network) window.network.destroy();
    window.network = new vis.Network(container, data, options);
}

function renderPrevisao(){
    let term = norm(document.getElementById('termoPrev').value.trim());
    let rows = [];
    if(term && S.bigramas.length){
        let matches = S.bigramas.filter(x => x.grama.split(' ')[0] === term);
        let total = matches.reduce((sum, item) => sum + item.n, 0);
        
        rows = matches.map(x => {
            let nextWord = x.grama.split(' ')[1];
            let rel = ((x.n / total) * 100).toFixed(2);
            return `<tr><td>${esc(term)}</td><td><b>${esc(nextWord)}</b></td><td>${x.n}</td><td>${rel}%</td></tr>`;
        });
    }

    if(window.prevT) window.prevT.destroy();
    
    let prevRowsHtml = rows.length ? rows.join('') : '<tr><td colspan="4" class="text-center">Nenhum dado encontrado para esta palavra.</td></tr>';
    document.querySelector('#prevTable').innerHTML = `<thead><tr><th>Palavra Base</th><th>Próxima Palavra</th><th>Freq. Absoluta</th><th>Freq. Relativa</th></tr></thead><tbody>${prevRowsHtml}</tbody>`;
    
    window.prevT = new DataTable('#prevTable', {pageLength: 10, lengthChange: false, order: [[2, 'desc']]});
}

function sentiment(){let a=selected(S.text),p=0,n=0;a.forEach(x=>{x=norm(x);if(POS.has(x))p++;if(NEG.has(x))n++});mk('sentChart','doughnut',{labels:['Positivo','Negativo','Neutro'],datasets:[{data:[p,n,Math.max(a.length-p-n,0)]}]},{plugins:{legend:{position:'bottom'}}});document.getElementById('sentText').innerHTML=`Foram identificados <b>${p}</b> marcadores positivos e <b>${n}</b> negativos. Resultado lexical exploratório: não detecta ironia, contexto ou pragmática.`}

function coding(){
    let cats=document.getElementById('cats').value.split(',').map(x=>x.trim()).filter(Boolean),
        ss=S.text.split(/[.!?]+/).filter(x=>x.trim());
    
    if(window.codT) window.codT.destroy();
    
    let codRowsHtml = cats.map(c=>{
        let ts=c.split(/\s+/).map(norm),
            h=ss.filter(s=>ts.some(t=>norm(s).includes(t)));
        return `<tr><td>${esc(c)}</td><td>${h.length}</td><td>${esc(h.slice(0,5).join(' | ')||'—')}</td></tr>`;
    }).join('');
    
    document.querySelector('#codTable').innerHTML = `<thead><tr><th>Categoria</th><th>Ocorrências</th><th>Trechos</th></tr></thead><tbody>${codRowsHtml}</tbody>`;
    window.codT = new DataTable('#codTable', {pageLength: 10, lengthChange: false});
}

function compare(){let a=count(selected(document.getElementById('a').value)),b=count(selected(document.getElementById('b').value)),ma=new Map(a.map(x=>[x.palavra,x.n])),mb=new Map(b.map(x=>[x.palavra,x.n])),k=[...new Set([...a.slice(0,10),...b.slice(0,10)].map(x=>x.palavra))].slice(0,15);mk('compChart','bar',{labels:k,datasets:[{label:'Texto A',data:k.map(x=>ma.get(x)||0)},{label:'Texto B',data:k.map(x=>mb.get(x)||0)}]});document.getElementById('compText').innerHTML='<p class="alert alert-light mt-3">Termos presentes nos dois rankings: '+k.filter(x=>ma.has(x)&&mb.has(x)).join(', ')+'</p>'}
function dl(name,text,type='text/csv'){let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click()}
function csv(a){return a.length?[Object.keys(a[0]).join(','),...a.map(x=>Object.values(x).map(v=>'"'+String(v).replaceAll('"','""')+'"').join(','))].join('\n'):''}

function process(){
    S.text=document.getElementById('texto').value.trim();
    if(!S.text) return alert('Insira um texto.');
    
    S.freq = count(selected(S.text));
    S.bigramas = ng(selected(S.text), 2); // Pré-calcula os bigramas em background para a Previsão
    
    metrics(S.text, S.freq);
    renderN();
    sentiment();
}

// Vinculando os botões à função de Loading (para destravar a interface)
document.getElementById('processar').onclick = () => {
    runWithLoading('processar', '▶ Processar corpus inteiro', process);
};

document.getElementById('btnKwic').onclick = () => {
    if (!S.text) return alert('Processe o corpus primeiro.');
    if (!document.getElementById('termo').value) return alert('Digite um termo no campo acima.');
    runWithLoading('btnKwic', 'Gerar KWIC', renderK);
};

document.getElementById('btnCooc').onclick = () => {
    if (!S.text) return alert('Processe o corpus primeiro.');
    if (!document.getElementById('termo').value) return alert('Digite um termo no campo de KWIC/Associação na barra lateral.');
    runWithLoading('btnCooc', '▶ Gerar Associação', renderK);
};

document.getElementById('btnNuvem').onclick = () => {
    if (!S.text) return alert('Processe o corpus primeiro.');
    runWithLoading('btnNuvem', '▶ Gerar Nuvem de Palavras', renderCloud);
};

document.getElementById('btnRede').onclick = () => {
    if (!S.text) return alert('Processe o corpus primeiro.');
    runWithLoading('btnRede', '▶ Gerar Grafo de Rede', renderRede);
};

document.getElementById('btnPrev').onclick = () => {
    if (!S.text) return alert('Processe o corpus primeiro.');
    if (!document.getElementById('termoPrev').value) return alert('Digite um termo para prever.');
    runWithLoading('btnPrev', '▶ Prever Próxima Palavra', renderPrevisao);
};

// Outros eventos
document.getElementById('ng').onchange = () => S.text && renderN();
document.getElementById('janela').onchange = () => { if (S.text && document.getElementById('termo').value) renderK(); };

document.getElementById('limpar').onclick = () => document.getElementById('texto').value='';
document.getElementById('codificar').onclick = coding;
document.getElementById('comparar').onclick = compare;
document.getElementById('file').onchange = e => { let f=e.target.files[0]; if(f){ let r=new FileReader(); r.onload=()=>document.getElementById('texto').value=r.result; r.readAsText(f) }};

// Funções de Exportação
document.getElementById('exFreq').onclick = () => dl('frequencia.csv', csv(S.freq));
document.getElementById('exNg').onclick = () => dl('ngrams.csv', csv(S.ngr));
document.getElementById('exKw').onclick = () => dl('kwic.csv', csv(S.kw));
document.getElementById('exHtml').onclick = () => dl('relatorio.html', `<meta charset="utf-8"><h1>Relatório de Análise de Discurso & PLN</h1><h2>Frequência</h2><table border="1"><tr><th>Termo</th><th>Frequência</th></tr>${S.freq.slice(0,30).map(x=>`<tr><td>${esc(x.palavra)}</td><td>${x.n}</td></tr>`).join('')}</table><h2>KWIC</h2><pre>${S.kw.map(x=>x.pre+' ['+x.keyword+'] '+x.post).join('\n')}</pre>`, 'text/html');

document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(el => {
    el.addEventListener('shown.bs.tab', () => {
        Object.values(C).forEach(chart => { if(chart) chart.resize(); });
    });
});
