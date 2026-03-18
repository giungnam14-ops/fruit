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
  
  // Initialize classifier in setup instead of preload
  classifier = ml5.imageClassifier(imageModelURL + 'model.json', modelLoaded);
  
  // Create the video
  video = createCapture(VIDEO, function(stream) {
    console.log('Video stream started');
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
    updateStatus(`결과: ${label} (${confidence}%)`);
    
    results.forEach(res => {
      const item = document.createElement('div');
      item.className = 'result-item';
      
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
