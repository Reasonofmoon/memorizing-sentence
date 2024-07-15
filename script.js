let sentences = [
    {
        english: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
        korean: "삶의 가장 큰 영광은 넘어지지 않는 것에 있지 않고, 매번 일어서는 데에 있다."
    },
    {
        english: "The way to get started is to quit talking and begin doing.",
        korean: "시작하는 방법은 말하기를 그만두고 행동을 시작하는 것이다."
    }
];

let currentSentenceIndex = 0;
let currentStage = 1;
const totalStages = 3;
let attempts = 0;

const sentenceDisplay = document.getElementById('sentence-display');
const translation = document.getElementById('translation');
const userInput = document.getElementById('user-input');
const submitBtn = document.getElementById('submit-btn');
const showAnswerBtn = document.getElementById('show-answer-btn');
const nextBtn = document.getElementById('next-btn');
const hintElement = document.getElementById('hint');
const progressBar = document.getElementById('progress-bar');
const fileInput = document.getElementById('file-input');
const sampleCsvLink = document.getElementById('sample-csv');

function displaySentence() {
    if (sentences.length === 0) {
        sentenceDisplay.textContent = "문장을 불러오는 중 오류가 발생했습니다.";
        return;
    }
    const sentence = sentences[currentSentenceIndex].english;
    const words = sentence.split(' ');
    const displayWords = words.slice(0, Math.ceil(words.length * (currentStage / totalStages)));
    sentenceDisplay.textContent = displayWords.join(' ') + ' ...';
    translation.textContent = sentences[currentSentenceIndex].korean;
    hintElement.textContent = '';
}

function checkAnswer() {
    const userSentence = userInput.value.trim();
    const correctSentence = sentences[currentSentenceIndex].english;
    
    if (userSentence.toLowerCase() === correctSentence.toLowerCase()) {
        showFeedback('정답입니다!', 'success');
        submitBtn.style.display = 'none';
        showAnswerBtn.style.display = 'none';
        nextBtn.style.display = 'inline-block';
        updateProgress();
    } else {
        attempts++;
        const errors = findErrors(userSentence, correctSentence);
        if (errors.length > 0) {
            hintElement.textContent = `힌트: ${errors.join(', ')}`;
        } else {
            hintElement.textContent = '철자와 구두점을 다시 확인해보세요.';
        }
        if (attempts >= 3) {
            showAnswer();
        }
    }
}

function findErrors(userSentence, correctSentence) {
    const userWords = userSentence.toLowerCase().split(' ');
    const correctWords = correctSentence.toLowerCase().split(' ');
    const errors = [];

    for (let i = 0; i < Math.min(userWords.length, correctWords.length); i++) {
        if (userWords[i] !== correctWords[i]) {
            errors.push(`'${correctWords[i]}' 단어를 확인하세요`);
        }
    }

    if (userWords.length < correctWords.length) {
        errors.push('문장이 완성되지 않았습니다');
    } else if (userWords.length > correctWords.length) {
        errors.push('불필요한 단어가 있습니다');
    }

    return errors;
}

function showAnswer() {
    userInput.value = sentences[currentSentenceIndex].english;
    hintElement.textContent = '정답을 확인하세요. "다음 단계" 버튼을 눌러 계속하세요.';
    submitBtn.style.display = 'none';
    showAnswerBtn.style.display = 'none';
    nextBtn.style.display = 'inline-block';
}

function nextStage() {
    currentStage++;
    attempts = 0;
    if (currentStage > totalStages) {
        currentStage = 1;
        currentSentenceIndex++;
        if (currentSentenceIndex >= sentences.length) {
            showFeedback('모든 문장을 완료했습니다! 처음부터 다시 시작합니다.', 'success');
            currentSentenceIndex = 0;
        }
    }
    userInput.value = '';
    submitBtn.style.display = 'inline-block';
    showAnswerBtn.style.display = 'inline-block';
    nextBtn.style.display = 'none';
    displaySentence();
}

function updateProgress() {
    const progress = ((currentSentenceIndex * totalStages + currentStage) / (sentences.length * totalStages)) * 100;
    progressBar.style.width = `${progress}%`;
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const csv = e.target.result;
        sentences = parseCSV(csv);
        currentSentenceIndex = 0;
        currentStage = 1;
        displaySentence();
        updateProgress();
        showFeedback('CSV 파일이 성공적으로 로드되었습니다.', 'success');
    };
    reader.readAsText(file);
}

function parseCSV(csv) {
    const lines = csv.split('\n');
    return lines.map(line => {
        const [english, korean] = line.split(',').map(item => item.trim().replace(/^"|"$/g, ''));
        return { english, korean };
    }).filter(item => item.english && item.korean);
}

function downloadSampleCSV() {
    const csvContent = `"The greatest glory in living lies not in never falling, but in rising every time we fall.","삶의 가장 큰 영광은 넘어지지 않는 것에 있지 않고, 매번 일어서는 데에 있다."
"The way to get started is to quit talking and begin doing.","시작하는 방법은 말하기를 그만두고 행동을 시작하는 것이다."`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "sample_sentences.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function showFeedback(message, type) {
    const feedbackElement = document.createElement('div');
    feedbackElement.textContent = message;
    feedbackElement.className = `feedback ${type}`;
    feedbackElement.style.position = 'fixed';
    feedbackElement.style.top = '20px';
    feedbackElement.style.left = '50%';
    feedbackElement.style.transform = 'translateX(-50%)';
    feedbackElement.style.padding = '10px 20px';
    feedbackElement.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
    feedbackElement.style.color = 'white';
    feedbackElement.style.borderRadius = '5px';
    feedbackElement.style.zIndex = '1000';
    document.body.appendChild(feedbackElement);
    setTimeout(() => {
        feedbackElement.remove();
    }, 3000);
}

submitBtn.addEventListener('click', checkAnswer);
showAnswerBtn.addEventListener('click', showAnswer);
nextBtn.addEventListener('click', nextStage);
fileInput.addEventListener('change', handleFileUpload);
sampleCsvLink.addEventListener('click', downloadSampleCSV);

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    displaySentence();
    updateProgress();
});
