// AI Classifier
let classifier;
const modelURL = './my_model/';

// Video & State
let video;
let uploadedImg;
let isAnalyzing = false;
let isModelLoaded = false;
let mode = 'video';

// Chart.js Instance
let priceChart;

// 20 Popular Korean Fruits Data (Including Forecast)
const marketData = {
  "사과": { emoji: "🍎", prices: [2500, 2600, 2400, 2300, 2550, 2800, 3000], forecast: [3100, 3200, 3150, 3300, 3400, 3500, 3600] },
  "배": { emoji: "🍐", prices: [3500, 3400, 3600, 3800, 3700, 3900, 4200], forecast: [4300, 4400, 4250, 4100, 4000, 3900, 3800] },
  "딸기": { emoji: "🍓", prices: [12000, 11500, 11000, 10500, 9800, 9500, 9000], forecast: [8500, 8000, 7800, 7500, 7000, 6800, 6500] },
  "포도": { emoji: "🍇", prices: [8000, 8200, 8500, 8300, 8600, 9000, 9200], forecast: [9300, 9400, 9500, 9600, 9800, 10000, 10500] },
  "귤": { emoji: "🍊", prices: [5000, 4800, 4700, 4900, 5200, 5500, 5800], forecast: [6000, 6200, 6400, 6600, 6800, 7000, 7200] },
  "단감": { emoji: "🍅", prices: [1500, 1600, 1450, 1400, 1550, 1700, 1800], forecast: [1900, 2000, 1950, 1900, 1850, 1800, 1750] },
  "참외": { emoji: "🟡", prices: [4000, 4200, 4500, 4300, 4600, 4800, 5000], forecast: [5200, 5400, 5600, 5800, 6000, 6200, 6500] },
  "수박": { emoji: "🍉", prices: [18000, 17500, 19000, 20000, 22000, 21500, 23000], forecast: [24000, 25000, 26000, 27500, 29000, 30000, 32000] },
  "복숭아": { emoji: "🍑", prices: [3000, 3200, 3100, 3300, 3500, 3800, 4000], forecast: [4200, 4400, 4600, 4800, 5000, 5200, 5500] },
  "자두": { emoji: "🟣", prices: [2000, 2100, 2200, 2150, 2300, 2500, 2600], forecast: [2700, 2800, 2900, 3000, 3100, 3200, 3300] },
  "바나나": { emoji: "🍌", prices: [4500, 4400, 4300, 4200, 4100, 4000, 3900], forecast: [3850, 3800, 3750, 3700, 3650, 3600, 3550] },
  "방울토마토": { emoji: "🍒", prices: [7000, 7200, 7500, 7300, 7600, 7800, 8000], forecast: [8200, 8400, 8600, 8800, 9000, 9200, 9500] },
  "키위": { emoji: "🥝", prices: [1200, 1300, 1250, 1100, 1150, 1200, 1300], forecast: [1350, 1400, 1450, 1500, 1550, 1600, 1700] },
  "파인애플": { emoji: "🍍", prices: [6000, 6200, 6500, 6300, 6600, 6800, 7000], forecast: [7200, 7400, 7600, 7800, 8000, 8200, 8500] },
  "체리": { emoji: "🍒", prices: [15000, 15500, 16000, 15800, 16500, 17000, 17500], forecast: [18000, 18500, 19000, 19500, 20000, 21000, 22000] },
  "망고": { emoji: "🥭", prices: [5000, 5200, 5500, 5300, 5600, 5800, 6000], forecast: [6200, 6400, 6600, 6800, 7000, 7200, 7500] },
  "멜론": { emoji: "🍈", prices: [12000, 12500, 13000, 12800, 13500, 14000, 14500], forecast: [15000, 15500, 16000, 16500, 17000, 17500, 18000] },
  "한라봉": { emoji: "🍊", prices: [8000, 8500, 8300, 8600, 9000, 9500, 10000], forecast: [10500, 11000, 11500, 12000, 12500, 13000, 14000] },
  "블루베리": { emoji: "🫐", prices: [4000, 4200, 4500, 4300, 4600, 4800, 5000], forecast: [5200, 5400, 5300, 5200, 5100, 5000, 4900] },
  "샤인머스캣": { emoji: "💚", prices: [25000, 24000, 26000, 28000, 27000, 29000, 31000], forecast: [32000, 33000, 34000, 35000, 36000, 38000, 40000] }
};

// Recipe Data (Re-linked to quality labels)
const recipeData = {
  "생과용(색 선명 표면 깨끗  형태 균일)": {
    tags: ["상태: 최상", "비타민 가득"],
    title: "신선한 과일 그대로 섭취",
    recipes: ["🍏 생과일 슬라이스", "🥗 과일 요거트 샐러드", "🥛 건강 주스"]
  },
  "주스용(색이 약간 흐림 / 얼룩 있음  약간 무른 느낌  크기 작거나 형태 불균형)": {
    tags: ["상태: 양호", "가공 권장"],
    title: "달콤한 디저트 및 주스 활용",
    recipes: ["🥤 고당도 착즙 주스", "🍯 수제 과일 잼", " Pie 홈베이킹 토핑"]
  },
  "폐기용": {
    tags: ["상태: 불량", "섭취 주의"],
    title: "친환경 배출 및 분리수거",
    recipes: ["⚠️ 곰팡이 주의", "♻️ 음식물 쓰레기 배출", "🌱 식물 비료 활용 가능"]
  }
};

function updateStatus(msg) {
  const el = document.getElementById('label-text');
  if (el) el.innerText = msg;
}

function modelLoaded() {
  console.log('Model Loaded!');
  isModelLoaded = true;
  document.getElementById('loader').style.display = 'none';
  updateStatus("준비 완료! 분석 시작 버튼을 눌러주세요.");
  document.getElementById('start-btn').disabled = false;
  initChart();
  renderMarketList();
}

function setup() {
  const canvas = createCanvas(640, 480);
  canvas.parent('canvas-container');
  updateStatus("AI 엔진 초기화 중...");
  classifier = ml5.imageClassifier(modelURL + 'model.json', modelLoaded);
  
  video = createCapture({ video: { facingMode: "user" }, audio: false }, (s) => {
    video.elt.setAttribute('playsinline', '');
    video.elt.muted = true;
    video.elt.play();
  });
  video.size(640, 480);
  video.hide();
}

function renderMarketList() {
  const grid = document.getElementById('market-list');
  grid.innerHTML = '';
  Object.keys(marketData).forEach((name, i) => {
    const item = document.createElement('div');
    item.className = i === 0 ? 'market-item active' : 'market-item';
    item.innerHTML = `<span>${marketData[name].emoji}</span>${name}`;
    item.onclick = () => {
      document.querySelectorAll('.market-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
      updateChart(name);
    };
    grid.appendChild(item);
  });
}

function startAnalysis() {
  if (!isAnalyzing) {
    mode = 'video';
    isAnalyzing = true;
    document.getElementById('start-btn').innerText = "분석 중지";
    document.getElementById('start-btn').className = "btn-danger";
    classifyVideo();
  } else {
    isAnalyzing = false;
    document.getElementById('start-btn').innerText = "분석 시작";
    document.getElementById('start-btn').className = "";
  }
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImg = createImg(e.target.result, '', '', () => {
        mode = 'image';
        isAnalyzing = false;
        classifier.classify(uploadedImg, (err, res) => {
          gotResult(err, res);
          uploadedImg.hide();
        });
      });
    };
    reader.readAsDataURL(file);
  }
}

function classifyVideo() {
  if (isAnalyzing && video && mode === 'video') {
    classifier.classify(video, gotResult);
  }
}

function gotResult(error, results) {
  if (error) return;
  
  const container = document.getElementById('results-container');
  container.innerHTML = '';
  
  if (results && results.length > 0) {
    results.forEach((res, i) => {
      const item = document.createElement('div');
      item.className = i === 0 ? 'result-item top' : 'result-item';
      item.innerHTML = `<span class="result-name">${res.label}</span><span class="result-prob">${(res.confidence * 100).toFixed(1)}%</span>`;
      container.appendChild(item);
    });
    
    updateStatus(`분석 결과: ${results[0].label}`);
    updateRecipeUI(results[0].label);
  }

  if (isAnalyzing && mode === 'video') classifyVideo();
}

function updateRecipeUI(label) {
  const container = document.getElementById('recipe-content-area');
  const data = recipeData[label];
  if (!data) return;
  
  let html = `<div class="recipe-card" style="display: block;">`;
  data.tags.forEach(t => html += `<span class="recipe-tag">${t}</span>`);
  html += `<div class="recipe-title" style="margin-top:10px; font-size:1.1rem;">${data.title}</div>`;
  html += `<div class="recipe-content"><ul>`;
  data.recipes.forEach(r => html += `<li style="margin-bottom:8px;">${r}</li>`);
  html += `</ul></div></div>`;
  container.innerHTML = html;
}

function initChart() {
  const ctxStatus = document.getElementById('priceChart').getContext('2d');
  const ctxForecast = document.getElementById('forecastChart').getContext('2d');
  
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: false, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#cbd5e1', font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { color: '#cbd5e1', font: { size: 10 } } }
    }
  };

  priceChart = new Chart(ctxStatus, {
    type: 'line',
    data: {
      labels: ['6일전', '5일전', '4일전', '3일전', '2일전', '작일', '오늘'],
      datasets: [{
        label: '과거 가격',
        data: marketData["사과"].prices,
        borderColor: '#4ecca3',
        backgroundColor: 'rgba(78, 204, 163, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4
      }]
    },
    options: commonOptions
  });

  forecastChart = new Chart(ctxForecast, {
    type: 'line',
    data: {
      labels: ['내일', '2일후', '3일후', '4일후', '5일후', '6일후', '7일후'],
      datasets: [{
        label: '예측 가격',
        data: marketData["사과"].forecast,
        borderColor: '#a29bfe',
        backgroundColor: 'rgba(162, 155, 254, 0.1)',
        borderWidth: 3,
        borderDash: [5, 5],
        fill: true,
        tension: 0.4,
        pointRadius: 4
      }]
    },
    options: commonOptions
  });
}

function updateChart(name) {
  if (!priceChart || !forecastChart) return;
  
  priceChart.data.datasets[0].data = marketData[name].prices;
  priceChart.data.datasets[0].label = `${name} 과거 시세`;
  priceChart.update();
  
  forecastChart.data.datasets[0].data = marketData[name].forecast;
  forecastChart.data.datasets[0].label = `${name} 예측 시세`;
  forecastChart.update();
}

function resetAll() {
  isAnalyzing = false;
  mode = 'video';
  uploadedImg = null;
  document.getElementById('start-btn').innerText = "분석 시작";
  document.getElementById('results-container').innerHTML = '';
  document.getElementById('image-input').value = "";
  updateStatus("준비 완료! 분석 시작 버튼을 눌러주세요.");
}

function draw() {
  background(0);
  if (mode === 'video' && video) {
    push(); translate(width, 0); scale(-1, 1); image(video, 0, 0); pop();
  } else if (mode === 'image' && uploadedImg) {
    image(uploadedImg, 0, 0, width, height);
  }
}
