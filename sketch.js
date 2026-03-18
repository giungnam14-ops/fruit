// Classifiers
let appleClassifier;
let generalClassifier;
const appleModelURL = './my_model/';

// Video & State
let video;
let uploadedImg;
let isAnalyzing = false;
let isAppleModelLoaded = false;
let isGeneralModelLoaded = false;
let mode = 'video';
let currentFruit = "";

// Chart.js Instance
let priceChart;

function updateStatus(msg) {
  const el = document.getElementById('label-text');
  if (el) el.innerText = msg;
}

function modelLoaded() {
  if (this === appleClassifier) isAppleModelLoaded = true;
  if (this === generalClassifier) isGeneralModelLoaded = true;
  
  if (isAppleModelLoaded && isGeneralModelLoaded) {
    console.log('All Models Loaded!');
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
    updateStatus("준비 완료! 분석 시작 버튼을 눌러주세요.");
    document.getElementById('start-btn').disabled = false;
    initChart();
  }
}

function setup() {
  const canvas = createCanvas(640, 480);
  canvas.parent('canvas-container');
  
  updateStatus("AI 엔진 초기화 중...");
  
  // Load Models
  appleClassifier = ml5.imageClassifier(appleModelURL + 'model.json', modelLoaded);
  generalClassifier = ml5.imageClassifier('MobileNet', modelLoaded);
  
  const constraints = {
    video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
    audio: false
  };

  video = createCapture(constraints, function(stream) {
    const videoElt = video.elt;
    videoElt.setAttribute('playsinline', '');
    videoElt.setAttribute('muted', '');
    videoElt.muted = true;
    videoElt.play().catch(e => console.warn("Video auto-play blocked:", e));
  });
  video.size(640, 480);
  video.hide();
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
    reader.onload = function(e) {
      uploadedImg = createImg(e.target.result, 'Analysis target', '', function() {
        mode = 'image';
        isAnalyzing = false;
        updateStatus("사진 분석 중...");
        generalClassifier.classify(uploadedImg, (err, results) => {
          handleGeneralResult(err, results, () => {
            uploadedImg.hide();
          });
        });
      });
    };
    reader.readAsDataURL(file);
  }
}

function classifyVideo() {
  if (isAnalyzing && video && mode === 'video') {
    generalClassifier.classify(video, handleGeneralResult);
  }
}

function handleGeneralResult(err, results, callback) {
  if (err) { console.error(err); return; }
  
  if (results && results.length > 0) {
    const topResult = results[0].label.toLowerCase();
    
    // Check if it's apple-related
    if (topResult.includes('apple') || topResult.includes('granny smith')) {
      currentFruit = "apple";
      const target = mode === 'video' ? video : uploadedImg;
      appleClassifier.classify(target, (err, appleResults) => {
        displayResults(appleResults, "Apple Quality");
        updateDynamicContent("Apple");
      });
    } else {
      // General fruit
      currentFruit = results[0].label.split(',')[0];
      displayResults(results, "General Fruit");
      updateDynamicContent(currentFruit);
    }
  }
  
  if (callback) callback();
  if (isAnalyzing && mode === 'video') setTimeout(classifyVideo, 500);
}

function displayResults(results, type) {
  const container = document.getElementById('results-container');
  container.innerHTML = '';
  
  results.slice(0, 3).forEach((res, i) => {
    const div = document.createElement('div');
    div.className = i === 0 ? 'result-item top' : 'result-item';
    div.innerHTML = `<span class="result-name">${res.label}</span><span class="result-prob">${(res.confidence * 100).toFixed(1)}%</span>`;
    container.appendChild(div);
  });
  
  const topLabel = results[0].label;
  updateStatus(`[${type}] 분석 결과: ${topLabel}`);
}

// Recipes & Market Data
const fruitData = {
  "apple": {
    recipes: ["🍏 애플 타르트", "🥗 사과 견과류 샐러드", "🥤 상큼 사과 주스"],
    prices: [1500, 1600, 1550, 1400, 1800, 2100, 2200],
    tags: ["식전 추천", "변비 예방"]
  },
  "banana": {
    recipes: ["🍌 달콤 바나나 브레드", "🥤 바나나 케일 스무디", "🥞 팬케이크 토핑"],
    prices: [800, 850, 900, 820, 750, 700, 650],
    tags: ["에너지 보충", "운동 전후"]
  },
  "orange": {
    recipes: ["🍊 신선한 착즙 오렌지 주스", "🍰 오렌지 파운드 케이크", "🥗 오렌지 드레싱 샐러드"],
    prices: [1200, 1300, 1250, 1400, 1350, 1500, 1600],
    tags: ["비타민 C 충전", "피로 회복"]
  },
  "strawberry": {
    recipes: ["🍓 딸기 생크림 케이크", "🍦 딸기 요거트 파르페", "🍹 수제 딸기 청"],
    prices: [4500, 4200, 4800, 5000, 5200, 4900, 4700],
    tags: ["봄 제철", "디저트 최강"]
  },
  "default": {
    recipes: ["🥣 과일 모듬 요거트", "🍧 과일 화채", "🧃 건강 과일 스무디"],
    prices: [1000, 1100, 1050, 1200, 1150, 1250, 1300],
    tags: ["범용 활용", "수분 보충"]
  }
};

function updateDynamicContent(fruitName) {
  const key = fruitName.toLowerCase().includes('apple') ? 'apple' : 
              fruitName.toLowerCase().includes('banana') ? 'banana' :
              fruitName.toLowerCase().includes('orange') ? 'orange' :
              fruitName.toLowerCase().includes('strawberry') ? 'strawberry' : 'default';
              
  const data = fruitData[key];
  
  // Update Recipes
  const recipeArea = document.getElementById('recipe-content-area');
  let html = `<div class="recipe-card" style="display: block;">`;
  data.tags.forEach(t => html += `<span class="recipe-tag">${t}</span>`);
  html += `<div class="recipe-title" style="margin-top:10px; font-size:1.1rem;">${fruitName} 추천 활용법</div>`;
  html += `<div class="recipe-content"><ul>`;
  data.recipes.forEach(r => html += `<li style="margin-bottom:8px;">${r}</li>`);
  html += `</ul></div></div>`;
  recipeArea.innerHTML = html;
  
  // Update Chart
  updateChart(fruitName, data.prices);
}

function initChart() {
  const ctx = document.getElementById('priceChart').getContext('2d');
  priceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['6일전', '5일전', '4일전', '3일전', '2일전', '작일', '오늘'],
      datasets: [{
        label: '시장 평균가',
        data: fruitData.default.prices,
        borderColor: '#4ecca3',
        backgroundColor: 'rgba(78, 204, 163, 0.2)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#4ecca3',
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: false, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#cbd5e1' } },
        x: { grid: { display: false }, ticks: { color: '#cbd5e1' } }
      }
    }
  });
}

function updateChart(name, prices) {
  if (!priceChart) return;
  priceChart.data.datasets[0].data = prices;
  priceChart.data.datasets[0].label = `${name} 가격 동향`;
  priceChart.update();
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
    let imgRatio = uploadedImg.width / uploadedImg.height;
    let canvasRatio = width / height;
    let w = imgRatio > canvasRatio ? width : height * imgRatio;
    let h = imgRatio > canvasRatio ? width / imgRatio : height;
    image(uploadedImg, (width - w) / 2, (height - h) / 2, w, h);
  }
}
