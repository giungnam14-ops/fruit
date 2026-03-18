// Classifier Variable
let classifier;
// Model URL
let imageModelURL = './my_model/';

// Video
let video;
let uploadedImg;
// To store the classification
let label = "";
let isAnalyzing = false;
let isModelLoaded = false;
let mode = 'video'; // 'video' or 'image'

function updateStatus(msg) {
  const el = document.getElementById('label-text');
  if (el) el.innerText = msg;
}

function modelLoaded() {
  console.log('Model Loaded!');
  isModelLoaded = true;
  
  // Hide the loader
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'none';

  if (video) {
    updateStatus("모델 로드 완료! '실시간 분석 시작' 버튼을 눌러주세요.");
    document.getElementById('start-btn').disabled = false;
  } else {
    updateStatus("모델 로드 완료! 카메라를 준비 중입니다...");
  }
}

function setup() {
  const canvas = createCanvas(640, 480);
  canvas.parent('canvas-container');
  
  updateStatus("모델 및 라이브러리 초기화 중...");
  
  // Initialize classifier
  classifier = ml5.imageClassifier(imageModelURL + 'model.json', modelLoaded);
  
  // Using more flexible constraints
  const constraints = {
    video: {
      width: { ideal: 640 },
      height: { ideal: 480 },
      facingMode: "user"
    },
    audio: false
  };

  // Create the video
  video = createCapture(constraints, function(stream) {
    console.log('Video stream started');
    
    // Compatibility fixes
    const videoElt = video.elt;
    videoElt.setAttribute('playsinline', '');
    videoElt.setAttribute('muted', '');
    videoElt.muted = true; // Ensure it's muted
    
    // Explicitly call play
    videoElt.play().then(() => {
      console.log("Video playing successfully");
    }).catch(e => {
      console.warn("Video play error (possibly awaiting user interaction):", e);
    });
    
    if (isModelLoaded) {
      updateStatus("카메라 연결 성공! '실시간 분석 시작' 버튼을 눌러주세요.");
      document.getElementById('start-btn').disabled = false;
    } else {
      updateStatus("카메라 연결 성공! 모델이 로드될 때까지 기다려주세요...");
    }
  });
  
  video.size(640, 480);
  video.hide();
}

function startAnalysis() {
  if (isModelLoaded) {
    if (!isAnalyzing) {
      // Start
      mode = 'video';
      isAnalyzing = true;
      document.getElementById('start-btn').innerText = "분석 중지";
      document.getElementById('start-btn').className = "btn-danger"; // Change color to red
      document.getElementById('results-container').style.display = 'block';
      updateStatus("실시간 영상 분석을 시작합니다...");
      classifyVideo();
    } else {
      // Stop
      isAnalyzing = false;
      document.getElementById('start-btn').innerText = "실시간 분석 시작";
      document.getElementById('start-btn').className = ""; // Back to default (green)
      updateStatus("분석 중지됨. '실시간 분석 시작' 버튼을 눌러주세요.");
    }
  }
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file && isModelLoaded) {
    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedImg = createImg(e.target.result, 'Uploaded fruit', '', function() {
        mode = 'image';
        isAnalyzing = false;
        document.getElementById('start-btn').innerText = "실시간 분석 시작";
        document.getElementById('start-btn').disabled = false;
        document.getElementById('results-container').style.display = 'block';
        updateStatus("사진 분석 중...");
        
        // ML5 classification
        classifier.classify(uploadedImg, function(err, results) {
          gotResult(err, results);
          updateStatus("사진 분석 완료!");
        });
        
        uploadedImg.hide();
      });
    };
    reader.readAsDataURL(file);
  } else if (!isModelLoaded) {
    alert("모델이 아직 로드되지 않았습니다. 잠시만 기다려주세요.");
  }
}

function resetAll() {
  isAnalyzing = false;
  mode = 'video';
  uploadedImg = null;
  label = "";
  document.getElementById('start-btn').innerText = "실시간 분석 시작";
  document.getElementById('start-btn').disabled = !isModelLoaded;
  document.getElementById('results-container').style.display = 'none';
  document.getElementById('image-input').value = "";
  updateStatus("카메라 연결 성공! '실시간 분석 시작' 버튼을 눌러주세요.");
}

function draw() {
  background(0);
  
  if (mode === 'video' && video) {
    // Draw the video mirrored
    push();
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0);
    pop();
  } else if (mode === 'image' && uploadedImg) {
    // Draw the static image centered and scaled
    push();
    let imgRatio = uploadedImg.width / uploadedImg.height;
    let canvasRatio = width / height;
    let w, h;
    if (imgRatio > canvasRatio) {
      w = width;
      h = width / imgRatio;
    } else {
      h = height;
      w = height * imgRatio;
    }
    image(uploadedImg, (width - w) / 2, (height - h) / 2, w, h);
    pop();
  }
}

function classifyVideo() {
  if (isAnalyzing && isModelLoaded && video && mode === 'video') {
    classifier.classify(video, gotResult);
  }
}

// Recipe Data
const recipeData = {
  "생과용(색 선명 표면 깨끗  형태 균일)": {
    tags: ["신선도 최상", "선물용", "샐러드용"],
    title: "신선한 사과 그대로 즐기기",
    recipes: [
      "🥗 <b>애플 월도프 샐러드</b>: 아삭한 사과와 호두, 마요네즈 드레싱의 완벽한 조화",
      "🍎 <b>허니 애플 카나페</b>: 크래커 위에 슬라이스 사과와 치즈, 꿀을 얹어 우아한 간식 완성",
      "😋 <b>생과일 슬라이스</b>: 껍질째 얇게 썰어 본연의 단맛과 비타민을 즐기세요"
    ]
  },
  "주스용(색이 약간 흐림 / 얼룩 있음  약간 무른 느낌  크기 작거나 형태 불균형)": {
    tags: ["가공용", "홈베이킹", "고당도"],
    title: "달콤한 홈메이드 디저트 & 주스",
    recipes: [
      "🥤 <b>착즙 사과 주스</b>: 믹서기에 물 없이 갈아 부드러운 순수 사과즙을 만드세요",
      "🍯 <b>시나몬 사과잼</b>: 무른 부분을 제거하고 다져서 시나몬과 함께 졸이면 향긋한 잼 완성",
      "🥧 <b>홈메이드 애플파이</b>: 버터에 볶은 사과를 토핑으로 얹어 오븐에 구워보세요"
    ]
  },
  "폐기용": {
    tags: ["섭취 주의", "재활용", "퇴비"],
    title: "친환경 배출 및 재활용 안내",
    recipes: [
      "⚠️ <b>주의</b>: 곰팡이가 있거나 변질된 사과는 식중독 위험이 있어 섭취하지 않는 것이 좋습니다.",
      "♻️ <b>음식물 쓰레기 배출</b>: 수분을 최대한 제거한 뒤 전용 수거함에 배출해 주세요.",
      "🌱 <b>유기질 비료</b>: 상태가 아주 심하지 않다면 흙과 섞어 화분 비료로 활용할 수 있습니다."
    ]
  }
};

function updateRecipeUI(label) {
  const container = document.getElementById('recipe-content-area');
  const data = recipeData[label];
  
  if (!data) return;
  
  let html = `<div class="recipe-card" style="display: block;">`;
  data.tags.forEach(tag => {
    html += `<span class="recipe-tag">${tag}</span>`;
  });
  html += `<div class="recipe-title" style="margin-top:10px; font-size:1.1rem;">${data.title}</div>`;
  html += `<div class="recipe-content"><ul>`;
  data.recipes.forEach(r => {
    html += `<li style="margin-bottom:8px;">${r}</li>`;
  });
  html += `</ul></div></div>`;
  
  container.innerHTML = html;
}

function gotResult(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  
  const resultsContainer = document.getElementById('results-container');
  resultsContainer.innerHTML = ''; 
  
  if (results && results.length > 0) {
    label = results[0].label;
    let confidence = (results[0].confidence * 100).toFixed(2);
    
    // Update the main status label with the TOP result
    updateStatus(`분석 결과: ${label} (${confidence}%)`);
    
    // Update Recipe UI if confidence is high (> 60%)
    if (results[0].confidence > 0.6) {
      updateRecipeUI(label);
    }
    
    results.forEach((res, index) => {
      const item = document.createElement('div');
      item.className = index === 0 ? 'result-item top' : 'result-item';
      
      const name = document.createElement('span');
      name.className = 'result-name';
      name.innerText = res.label;
      
      const prob = document.createElement('span');
      prob.className = 'result-prob';
      prob.innerText = (res.confidence * 100).toFixed(2) + "%";
      
      item.appendChild(name);
      item.appendChild(prob);
      resultsContainer.appendChild(item);
    });
  }
  
  if (isAnalyzing && mode === 'video') {
    classifyVideo();
  }
}
