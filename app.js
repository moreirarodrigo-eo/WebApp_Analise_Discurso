const SW=new Set(`a à às ao aos aquele aquela aquelas aqueles aquilo aqui ainda algo algum alguma algumas alguns ali ambos ampla amplo amplas amplos antes após as até com como contra da das de dela delas dele deles depois dessa dessas desse desses desta destas deste destes do dos e é em enquanto entre era eram essa essas esse esses esta está estão estas este estes eu foi foram há isso isto já mais mas me meu meus minha minhas na não nas nem nesse nessa nesta neste no nos nós nossa nossas nosso nossos num numa nunca o os ou outra outras outro outros para pela pelas pelo pelos por porque qual quando quanto que quem se sem ser seu seus sob sobre sua suas também tem tendo tenha tenham tenho te toda todas todo todos tu tua tuas um uma umas uns vai vais vamos você vocês vos`.split(/\s+/));
const POS=new Set(`bom boa positivo positiva sucesso prosperidade melhoria avanço esperança futuro oportunidade benefício benefícios forte força sustentável sustentabilidade adaptação resiliente resiliência proteção preservar preservação cooperação confiança solução soluções desenvolvimento inclusão justiça qualidade crescimento excelência excelente feliz felicidade alegria alegre paz harmonia harmonioso seguro segurança lucro lucrativo riqueza rico construção construir apoiar apoio ajuda solidariedade igualdade equidade transparente transparência honestidade ética ético saúde saudável inovação inovar criatividade inteligente inteligência sabedoria educação aprendizado ecológico conservação limpo eficiência eficiente otimismo otimista vitalidade vital respeito respeitar autonomia liberdade libertação conquista vitória vencedor prosperar brilhante maravilha maravilhoso vida vivo amor amar amizade`.split(/\s+/).map(norm));
const NEG=new Set(`ruim má mau negativo negativa problema problemas crise risco riscos ameaça perda perdas dano danos destruição desmatamento seca estiagem incêndio incendio fogo queimadas conflito dificuldade pobreza vulnerável vulnerabilidade medo insegurança fracasso pior piora prejuízo falta escassez pressão sofrimento dor doente doença triste tristeza raiva ódio violento violência agressão atacar guerra corrupção corrupto desigualdade injustiça roubo fraude mentira falso falência dívida endividado desemprego desempregado morte morrer letal fatal poluição poluir tóxico lixo sujo ignorância ignorante estupidez erro errar culpa culpado terror pânico assustador desastre tragédia trágico fome miséria fraqueza fraco declínio queda colapso ruína inimigo hostil depressão abandono desespero`.split(/\s+/).map(norm));

const SW=new Set(`a à às ao aos aquele aquela aquelas aqueles aquilo aqui ainda algo algum alguma algumas alguns ali ambos ampla amplo amplas amplos antes após as até com como contra da das de dela delas dele deles depois dessa dessas desse desses desta destas deste destes do dos e é em enquanto entre era eram essa essas esse esses esta está estão estas este estes eu foi foram há isso isto já mais mas me meu meus minha minhas na não nas nem nesse nessa nesta neste no nos nós nossa nossas nosso nossos num numa nunca o os ou outra outras outro outros para pela pelas pelo pelos por porque qual quando quanto que quem se sem ser seu seus sob sobre sua suas também tem tendo tenha tenham tenho te toda todas todo todos tu tua tuas um uma umas uns vai vais vamos você vocês vos`.split(/\s+/));
const POS=new Set(`bom boa positivo positiva sucesso prosperidade melhoria avanço esperança futuro oportunidade benefício benefícios forte força sustentável sustentabilidade adaptação resiliente resiliência proteção preservar preservação cooperação confiança solução soluções desenvolvimento inclusão justiça qualidade crescimento excelência excelente feliz felicidade alegria alegre paz harmonia harmonioso seguro segurança lucro lucrativo riqueza rico construção construir apoiar apoio ajuda solidariedade igualdade equidade transparente transparência honestidade ética ético saúde saudável inovação inovar criatividade inteligente inteligência sabedoria educação aprendizado ecológico conservação limpo eficiência eficiente otimismo otimista vitalidade vital respeito respeitar autonomia liberdade libertação conquista vitória vencedor prosperar brilhante maravilha maravilhoso vida vivo amor amar amizade`.split(/\s+/).map(norm));
const NEG=new Set(`ruim má mau negativo negativa problema problemas crise risco riscos ameaça perda perdas dano danos destruição desmatamento seca estiagem incêndio incendio fogo queimadas conflito dificuldade pobreza vulnerável vulnerabilidade medo insegurança fracasso pior piora prejuízo falta escassez pressão sofrimento dor doente doença triste tristeza raiva ódio violento violência agressão atacar guerra corrupção corrupto desigualdade injustiça roubo fraude mentira falso falência dívida endividado desemprego desempregado morte morrer letal fatal poluição poluir tóxico lixo sujo ignorância ignorante estupidez erro errar culpa culpado terror pânico assustador desastre tragédia trágico fome miséria fraqueza fraco declínio queda colapso ruína inimigo hostil depressão abandono desespero`.split(/\s+/).map(norm));

function norm(s){return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function toks(s){return s.replace(/[“”"‘’]/g,'').split(/\s+/).map(x=>x.replace(/^[^\p{L}\p{N}-]+|[^\p{L}\p{N}-]+$/gu,'')).filter(Boolean)}
function bard(x){if(x.length<3||SW.has(x))return false;return !(x.length>5&&['ar','er','ir','ando','endo','indo','ado','ido','ava','avam','aria','asse','esse','isse'].some(e=>x.endsWith(e)))}

function selected(s){
    let exc=new Set(document.getElementById('excluir').value.split(',').map(x=>norm(x.trim())).filter(Boolean));
    return toks(s).filter(x=>{
        let n=norm(x);
        if(exc.has(n)) return false;
        return n.length>1&&!/\d/.test(n)&&(document.querySelector('[name=metodo]:checked').value==='pln'?!SW.has(n):bard(n))
    })
}

function count(a){let m=new Map();a.forEach(x=>{x=norm(x);m.set(x,(m.get(x)||0)+1)});return [...m].map(([palavra,n])=>({palavra,n})).sort((a,b)=>b.n-a.n)}

function ng(a,n){
    let exc=new Set(document.getElementById('excluir').value.split(',').map(x=>norm(x.trim())).filter(Boolean));
    let m=new Map();
    for(let i=0;i<=a.length-n;i++){
        let g=a.slice(i,i+n).map(norm);
        if(g.some(x=>SW.has(x) || exc.has(x)))continue;
        g=g.join(' ');
        m.set(g,(m.get(g)||0)+1)
    }
    return [...m].map(([grama,n])=>({grama,n})).filter(x=>x.n>1).sort((a,b)=>b.n-a.n)
}

let S={text:'',freq:[],ngr:[],kw:[]},C={};

function mk(id,type,data,opt={}){if(C[id])C[id].destroy();C[id]=new Chart(document.getElementById(id),{type,data,options:{responsive:true,maintainAspectRatio:false,...opt}})}
function esc(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')}

function metrics(t,f){let raw=toks(t),u=f.length,total=f.reduce((a,b)=>a+b.n,0),sent=t.split(/[.!?]+/).filter(x=>x.trim()).length,ttr=total?u/total:0;document.getElementById('metricas').innerHTML=[[raw.length,'Tokens'],[u,'Vocabulário'],[(ttr*100).toFixed(1)+'%','Riqueza lexical'],[sent,'Sentenças']].map(x=>`<div class="col-sm-6 col-xl-3"><div class="metric"><b>${x[0]}</b><br><small>${x[1]}</small></div></div>`).join('');mk('perfil','doughnut',{labels:['Top 5','Demais'],datasets:[{data:[f.slice(0,5).reduce((a,b)=>a+b.n,0),Math.max(total-f.slice(0,5).reduce((a,b)=>a+b.n,0),0)]}]},{plugins:{legend:{position:'bottom'}}})}
function renderFreq(){let a=S.freq.slice(0,20).reverse();mk('freqChart','bar',{labels:a.map(x=>x.palavra),datasets:[{data:a.map(x=>x.n),backgroundColor:'#2C3E50'}]},{indexAxis:'y',plugins:{legend:{display:false}}});let d=document.getElementById('cloud');d.innerHTML='';let mx=Math.max(...S.freq.map(x=>x.n),1);WordCloud(d,{list:S.freq.slice(0,100).map(x=>[x.palavra,12+x.n/mx*42]),gridSize:8,fontFamily:'Arial',color:'random-dark',backgroundColor:'white',rotateRatio:.15})}
function renderN(){S.ngr=ng(selected(S.text),+document.getElementById('ng').value);let a=S.ngr.slice(0,20).reverse();mk('ngChart','bar',{labels:a.map(x=>x.grama),datasets:[{data:a.map(x=>x.n),backgroundColor:'#536878'}]},{indexAxis:'y',plugins:{legend:{display:false}}});document.querySelector('#ngTable tbody').innerHTML=S.ngr.map(x=>`<tr><td>${esc(x.grama)}</td><td>${x.n}</td></tr>`).join('');if(window.ngT)ngT.destroy();window.ngT=new DataTable('#ngTable',{pageLength:10,lengthChange:false})}

function renderK(){
    let term=norm(document.getElementById('termo').value),w=+document.getElementById('janela').value,a=toks(S.text),rows=[];
    let exc=new Set(document.getElementById('excluir').value.split(',').map(x=>norm(x.trim())).filter(Boolean));
    a.forEach((x,i)=>{if(norm(x)===term)rows.push({pre:a.slice(Math.max(0,i-w),i).join(' '),keyword:x,post:a.slice(i+1,i+w+1).join(' ')})});
    S.kw=rows;
    document.querySelector('#kwTable tbody').innerHTML=rows.length?rows.map(x=>`<tr><td>${esc(x.pre)}</td><td><b>${esc(x.keyword)}</b></td><td>${esc(x.post)}</td></tr>`).join(''):'';
    
    if(window.kwT)kwT.destroy();
    window.kwT=new DataTable('#kwTable',{pageLength:10,lengthChange:false,ordering:false});
    
    let m=new Map();
    a.forEach((x,i)=>{if(norm(x)===term)a.slice(Math.max(0,i-w),i+w+1).forEach(y=>{let n=norm(y);if(n!==term&&!SW.has(n)&&!exc.has(n))m.set(n,(m.get(n)||0)+1)})});
    let c=[...m].map(([palavra,n])=>({palavra,n})).sort((a,b)=>b.n-a.n).slice(0,20).reverse();
    mk('coocChart','bar',{labels:c.map(x=>x.palavra),datasets:[{data:c.map(x=>x.n),backgroundColor:'#7a5c61'}]},{indexAxis:'y',plugins:{legend:{display:false}}})
}

function sentiment(){let a=selected(S.text),p=0,n=0;a.forEach(x=>{x=norm(x);if(POS.has(x))p++;if(NEG.has(x))n++});mk('sentChart','doughnut',{labels:['Positivo','Negativo','Neutro'],datasets:[{data:[p,n,Math.max(a.length-p-n,0)]}]},{plugins:{legend:{position:'bottom'}}});document.getElementById('sentText').innerHTML=`Foram identificados <b>${p}</b> marcadores positivos e <b>${n}</b> negativos. Resultado lexical exploratório: não detecta ironia, contexto ou pragmática.`}
function coding(){let cats=document.getElementById('cats').value.split(',').map(x=>x.trim()).filter(Boolean),ss=S.text.split(/[.!?]+/).filter(x=>x.trim());document.querySelector('#codTable tbody').innerHTML=cats.map(c=>{let ts=c.split(/\s+/).map(norm),h=ss.filter(s=>ts.some(t=>norm(s).includes(t)));return `<tr><td>${esc(c)}</td><td>${h.length}</td><td>${esc(h.slice(0,5).join(' | ')||'—')}</td></tr>`}).join('')}
function compare(){let a=count(selected(document.getElementById('a').value)),b=count(selected(document.getElementById('b').value)),ma=new Map(a.map(x=>[x.palavra,x.n])),mb=new Map(b.map(x=>[x.palavra,x.n])),k=[...new Set([...a.slice(0,10),...b.slice(0,10)].map(x=>x.palavra))].slice(0,15);mk('compChart','bar',{labels:k,datasets:[{label:'Texto A',data:k.map(x=>ma.get(x)||0)},{label:'Texto B',data:k.map(x=>mb.get(x)||0)}]});document.getElementById('compText').innerHTML='<p class="alert alert-light mt-3">Termos presentes nos dois rankings: '+k.filter(x=>ma.has(x)&&mb.has(x)).join(', ')+'</p>'}
function dl(name,text,type='text/csv'){let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click()}
function csv(a){return a.length?[Object.keys(a[0]).join(','),...a.map(x=>Object.values(x).map(v=>'"'+String(v).replaceAll('"','""')+'"').join(','))].join('\n'):''}

function process(){S.text=document.getElementById('texto').value.trim();if(!S.text)return alert('Insira um texto.');S.freq=count(selected(S.text));metrics(S.text,S.freq);renderFreq();renderN();renderK();sentiment()}

document.getElementById('processar').onclick=process;
document.getElementById('ng').onchange=()=>S.text&&renderN();
document.getElementById('janela').onchange=()=>S.text&&renderK();

// Evento otimizado para atualizar apenas o KWIC enquanto você digita
document.getElementById('termo').addEventListener('input', () => { if (S.text) renderK(); });

document.getElementById('limpar').onclick=()=>document.getElementById('texto').value='';
document.getElementById('codificar').onclick=coding;
document.getElementById('comparar').onclick=compare;
document.getElementById('file').onchange=e=>{let f=e.target.files[0];if(f){let r=new FileReader();r.onload=()=>document.getElementById('texto').value=r.result;r.readAsText(f)}};
document.getElementById('exFreq').onclick=()=>dl('frequencia.csv',csv(S.freq));
document.getElementById('exNg').onclick=()=>dl('ngrams.csv',csv(S.ngr));
document.getElementById('exKw').onclick=()=>dl('kwic.csv',csv(S.kw));
document.getElementById('exHtml').onclick=()=>dl('relatorio.html',`<meta charset="utf-8"><h1>Relatório de Análise de Discurso & PLN</h1><h2>Frequência</h2><table border="1"><tr><th>Termo</th><th>Frequência</th></tr>${S.freq.slice(0,30).map(x=>`<tr><td>${esc(x.palavra)}</td><td>${x.n}</td></tr>`).join('')}</table><h2>KWIC</h2><pre>${S.kw.map(x=>x.pre+' ['+x.keyword+'] '+x.post).join('\n')}</pre>`,'text/html');

// Atualiza e redimensiona os gráficos sempre que uma nova aba do Bootstrap for exibida
document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(el => {
    el.addEventListener('shown.bs.tab', () => {
        Object.values(C).forEach(chart => chart.resize());
    });
});
