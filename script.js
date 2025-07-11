(() => {
  const menu = document.getElementById('menu');
  const gameContainer = document.getElementById('gameContainer');
  const gameTitle = document.getElementById('gameTitle');
  const hintImage = document.getElementById('hintImage');
  const wordDisplay = document.getElementById('wordDisplay');
  const hintContainer = document.getElementById('hintContainer');
  const circleContainer = document.getElementById('circleContainer');
  const svg = document.getElementById('lineCanvas');
  const nextWordBtn = document.getElementById('nextWordBtn');
  const backBtn = document.getElementById('backBtn');

  const btnNormal = document.getElementById('btnNormal');
  const btnDificil = document.getElementById('btnDificil');

  const palavrasNormais = [
    { palavra: "GATO", imagem: "img/gato.png" },
    { palavra: "CACHORRO", imagem: "img/cachorro.png" },
    { palavra: "SOL", imagem: "img/sol.png" },
    { palavra: "MAÇÃ", imagem: "img/maçã.png" }, 
    { palavra: "CELULAR", imagem: "img/celular.png" },
    { palavra: "UVA", imagem: "img/uva.png" },
    { palavra: "PEPINO", imagem: "img/pepino.png" },
    { palavra: "BRÓCOLIS", imagem: "img/brócolis.png" },
    { palavra: "LÁPIS", imagem: "img/lápis.png" },
    { palavra: "AÇAI", imagem: "img/açaí.png" }
  ];

  const palavrasDificeis = [
    { palavra: "METAMORFOSE", dicas: ["Transformação completa de um organismo.", "Associada a borboletas e anfíbios.", "Envolve estágios como lagarta e pupa.", "Muda a forma e função do corpo."] },
    { palavra: "HIPOTENUSA", dicas: ["Lado mais longo do triângulo retângulo.", "É oposto ao ângulo reto.", "Usada no Teorema de Pitágoras.", "Não é um cateto."] },
    { palavra: "PSICANÁLISE", dicas: ["Método terapêutico de Freud.", "Estuda o inconsciente.", "Envolve interpretação dos sonhos.", "Foco na mente e comportamento."] },
    { palavra: "QUANTÍSTICO", dicas: ["Relacionado à física das partículas.", "Envolve energia em pacotes discretos.", "Fundamental para a mecânica quântica.", "Desafia a física clássica."] },
    { palavra: "ANTICONSTITUCIONAL", dicas: ["Algo que vai contra a Constituição.", "Termo muito usado em direito.", "Referente a leis ou atos ilegais.", "Extremamente longo para uma palavra."] }
  ];

  let modoAtual = null;
  let indiceAtual = 0;
  let pontos = [];
  let linhas = [];
  let pathAtual = [];
  let desenhando = false;
  let ultimoPonto = null;
  let linhaAtual = null;

  function ajustarSVG() {
    const rect = circleContainer.getBoundingClientRect();
    svg.setAttribute('width', rect.width);
    svg.setAttribute('height', rect.height);
  }

  function criarLetras(palavra) {
    const letras = palavra.split('');
    const minSize = Math.min(circleContainer.clientWidth, circleContainer.clientHeight);
    const radius = minSize / 2 - 60; // raio menor p/ centralizar melhor

    const centerX = circleContainer.clientWidth / 2;
    const centerY = circleContainer.clientHeight / 2;

    letras.sort(() => Math.random() - 0.5).forEach((letra, i) => {
      const angle = (2 * Math.PI / letras.length) * i - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      const div = document.createElement('div');
      div.className = 'letra';
      div.textContent = letra;
      div.style.left = `${x}px`;
      div.style.top = `${y}px`;
      div.dataset.letra = letra;
      div.dataset.index = i;
      div.style.position = 'absolute';
      div.style.transform = 'translate(-50%, -50%)';
      circleContainer.appendChild(div);

      pontos.push({ x, y, letra, element: div });
    });
  }

  function limparJogo() {
    pontos.forEach(p => circleContainer.removeChild(p.element));
    pontos = [];
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    linhas = [];
    pathAtual = [];
    desenhando = false;
    ultimoPonto = null;
    linhaAtual = null;
    wordDisplay.textContent = "";
    nextWordBtn.style.display = 'none';
    hintContainer.innerHTML = "";
  }

  function distancia(p1, p2) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  }

  function detectarMaisProxima(x, y) {
    let maisProxima = null;
    let minDist = 9999;
    pontos.forEach(ponto => {
      if (pathAtual.includes(ponto)) return;
      const d = distancia({ x, y }, ponto);
      if (d < 40 && d < minDist) {
        minDist = d;
        maisProxima = ponto;
      }
    });
    return maisProxima;
  }

  function getEventPosition(event) {
    const rect = circleContainer.getBoundingClientRect();
    return event.touches
      ? { x: event.touches[0].clientX - rect.left, y: event.touches[0].clientY - rect.top }
      : { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function criarLinha(x1, y1, x2, y2) {
    const linha = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    linha.setAttribute('x1', x1);
    linha.setAttribute('y1', y1);
    linha.setAttribute('x2', x2);
    linha.setAttribute('y2', y2);
    linha.setAttribute('stroke', 'white');
    linha.setAttribute('stroke-width', '4');
    svg.appendChild(linha);
    linhas.push(linha);
    return linha;
  }

  function iniciarDesenho(pos) {
    const ponto = detectarMaisProxima(pos.x, pos.y);
    if (ponto) {
      desenhando = true;
      ultimoPonto = ponto;
      pathAtual.push(ponto);
      wordDisplay.textContent = ponto.letra;
      linhaAtual = criarLinha(ponto.x, ponto.y, ponto.x, ponto.y);
    }
  }

  function moverDesenho(pos) {
    if (!desenhando || !ultimoPonto) return;
    linhaAtual.setAttribute('x2', pos.x);
    linhaAtual.setAttribute('y2', pos.y);
    const pontoAtual = detectarMaisProxima(pos.x, pos.y);
    if (pontoAtual && !pathAtual.includes(pontoAtual)) {
      linhaAtual.setAttribute('x2', pontoAtual.x);
      linhaAtual.setAttribute('y2', pontoAtual.y);
      pathAtual.push(pontoAtual);
      ultimoPonto = pontoAtual;
      linhaAtual = criarLinha(pontoAtual.x, pontoAtual.y, pontoAtual.x, pontoAtual.y);
      wordDisplay.textContent = pathAtual.map(p => p.letra).join('');
    }
  }

  function finalizarDesenho() {
    if (!desenhando) return;
    desenhando = false;
    if (linhaAtual) {
      svg.removeChild(linhaAtual);
      linhas.pop();
      linhaAtual = null;
    }
    const palavraAlvo = (modoAtual === 'normal') ? palavrasNormais[indiceAtual].palavra : palavrasDificeis[indiceAtual].palavra;
    const palavraFormada = pathAtual.map(p => p.letra).join('');
    if (palavraFormada === palavraAlvo) {
      wordDisplay.textContent += ' ✅';
      nextWordBtn.style.display = 'inline-block';
    } else {
      wordDisplay.textContent += ' ❌';
      linhas.forEach(l => svg.removeChild(l));
      linhas = [];
      pathAtual = [];
    }
  }

  circleContainer.addEventListener('mousedown', e => iniciarDesenho(getEventPosition(e)));
  circleContainer.addEventListener('mousemove', e => moverDesenho(getEventPosition(e)));
  circleContainer.addEventListener('mouseup', finalizarDesenho);
  circleContainer.addEventListener('touchstart', e => {
    e.preventDefault();
    iniciarDesenho(getEventPosition(e));
  });
  circleContainer.addEventListener('touchmove', e => {
    e.preventDefault();
    moverDesenho(getEventPosition(e));
  });
  circleContainer.addEventListener('touchend', e => {
    e.preventDefault();
    finalizarDesenho();
  });

  function iniciarJogo() {
    limparJogo();
    let palavraAtual, imagemAtual;
    if (modoAtual === 'normal') {
      palavraAtual = palavrasNormais[indiceAtual].palavra;
      imagemAtual = palavrasNormais[indiceAtual].imagem;
      hintImage.style.display = 'block';
      hintImage.src = imagemAtual;
      hintImage.onerror = () => hintImage.style.display = 'none';
      gameTitle.textContent = "Modo Normal - Fácil";
      hintContainer.style.display = 'none';
    } else {
      palavraAtual = palavrasDificeis[indiceAtual].palavra;
      hintImage.style.display = 'none';
      gameTitle.textContent = "Modo Difícil - Teste seu conhecimento";
      hintContainer.style.display = 'block';
      const dicas = palavrasDificeis[indiceAtual].dicas || [];
      hintContainer.innerHTML = dicas.slice(0, 4).map((dica, i) => `<div>${i + 1}. ${dica}</div>`).join('');
    }

    criarLetras(palavraAtual);
    setTimeout(ajustarSVG, 50);
    wordDisplay.textContent = "";
    document.querySelector('.circuloback').style.display = 'block';
  }

  btnNormal.addEventListener('click', () => {
    modoAtual = 'normal';
    indiceAtual = 0;
    menu.style.display = 'none';
    gameContainer.style.display = 'flex';
    iniciarJogo();
  });

  btnDificil.addEventListener('click', () => {
    modoAtual = 'dificil';
    indiceAtual = 0;
    menu.style.display = 'none';
    gameContainer.style.display = 'flex';
    iniciarJogo();
  });

  nextWordBtn.addEventListener('click', () => {
    indiceAtual++;
    const lista = (modoAtual === 'normal') ? palavrasNormais : palavrasDificeis;
    if (indiceAtual >= lista.length) {
      alert('Parabéns! Você completou todas as palavras do modo ' + (modoAtual === 'normal' ? 'normal!' : 'difícil!'));
      indiceAtual = 0;
    }
    iniciarJogo();
    nextWordBtn.style.display = 'none';
  });

  backBtn.addEventListener('click', () => {
    document.querySelector('.circuloback').style.display = 'none';
    menu.style.display = 'block';
    gameContainer.style.display = 'none';
    limparJogo();
  });

  window.addEventListener('resize', ajustarSVG);
})();
