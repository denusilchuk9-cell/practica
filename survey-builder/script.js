let questions = [];
let surveys = JSON.parse(localStorage.getItem('surveys')) || [];
let lastResult = JSON.parse(localStorage.getItem('lastResult')) || null;

function showTab(tabName) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    
    if (tabName === 'builder') {
        document.querySelectorAll('.nav-btn')[0].classList.add('active');
        document.getElementById('builder').classList.add('active');
        renderQuestions();
    } else if (tabName === 'taker') {
        document.querySelectorAll('.nav-btn')[1].classList.add('active');
        document.getElementById('taker').classList.add('active');
        updateSurveySelect();
    } else {
        document.querySelectorAll('.nav-btn')[2].classList.add('active');
        document.getElementById('results').classList.add('active');
        showResults();
    }
}

function addQuestion(type) {
    if (type === 'multiple') {
        questions.push({
            id: Date.now() + Math.random(),
            type: 'multiple',
            text: 'New Question',
            options: ['Option 1', 'Option 2']
        });
    } else {
        questions.push({
            id: Date.now() + Math.random(),
            type: 'text',
            text: 'New Question',
            options: []
        });
    }
    renderQuestions();
}

function renderQuestions() {
    let html = '';
    
    for (let i = 0; i < questions.length; i++) {
        let q = questions[i];
        html += '<div class="question-box">';
        html += '<div class="question-header">';
        html += `<input type="text" value="${q.text}" onchange="updateQuestionText('${q.id}', this.value)">`;
        html += `<span class="type-tag">${q.type}</span>`;
        html += `<button class="delete-btn" onclick="deleteQuestion('${q.id}')">🗑️</button>`;
        html += '</div>';
        html += '<div class="options-area">';
        
        if (q.type === 'multiple') {
            for (let j = 0; j < q.options.length; j++) {
                html += '<div class="option-row">';
                html += `<input type="text" value="${q.options[j]}" onchange="updateOption('${q.id}', ${j}, this.value)">`;
                if (q.options.length > 1) {
                    html += `<button class="remove-opt" onclick="removeOption('${q.id}', ${j})">✕</button>`;
                }
                html += '</div>';
            }
            html += `<button class="add-opt" onclick="addOption('${q.id}')">+ Add Option</button>`;
        } else {
            html += '<input type="text" placeholder="Text answer" disabled style="background:#f5f5f5; padding:0.5rem; width:100%; border-radius:5px;">';
        }
        
        html += '</div>';
        html += '</div>';
    }
    
    if (questions.length === 0) {
        html = '<div class="placeholder">Add your first question</div>';
    }
    
    document.getElementById('questions').innerHTML = html;
}

function updateQuestionText(id, text) {
    let q = questions.find(q => q.id == id);
    if (q) q.text = text;
}

function updateOption(qid, index, value) {
    let q = questions.find(q => q.id == qid);
    if (q && q.options) q.options[index] = value;
}

function addOption(qid) {
    let q = questions.find(q => q.id == qid);
    if (q) q.options.push('Option ' + (q.options.length + 1));
    renderQuestions();
}

function removeOption(qid, index) {
    let q = questions.find(q => q.id == qid);
    if (q && q.options.length > 1) {
        q.options.splice(index, 1);
        renderQuestions();
    }
}

function deleteQuestion(id) {
    questions = questions.filter(q => q.id != id);
    renderQuestions();
}

function publishSurvey() {
    if (questions.length === 0) {
        alert('Add questions first!');
        return;
    }
    
    let title = document.getElementById('surveyTitle').value || 'My Survey';
    
    surveys.push({
        id: Date.now(),
        title: title,
        questions: JSON.parse(JSON.stringify(questions))
    });
    
    localStorage.setItem('surveys', JSON.stringify(surveys));
    
    questions = [];
    document.getElementById('surveyTitle').value = 'My Survey';
    renderQuestions();
    updateSurveySelect();
    
    alert('Survey published!');
}

function updateSurveySelect() {
    let select = document.getElementById('surveySelect');
    select.innerHTML = '<option value="">Choose survey</option>';
    
    for (let s of surveys) {
        select.innerHTML += `<option value="${s.id}">${s.title}</option>`;
    }
}

function selectSurvey(id) {
    if (!id) {
        document.getElementById('surveyContainer').innerHTML = '<div class="placeholder">Select a survey</div>';
        return;
    }
    
    let survey = surveys.find(s => s.id == id);
    if (!survey) return;
    
    let html = '<div class="survey-card">';
    
    for (let i = 0; i < survey.questions.length; i++) {
        let q = survey.questions[i];
        html += '<div class="survey-question">';
        html += `<p>${i+1}. ${q.text}</p>`;
        
        if (q.type === 'text') {
            html += `<input type="text" id="ans_${q.id}" placeholder="Your answer">`;
        } else {
            html += '<div class="radio-group">';
            for (let opt of q.options) {
                html += `<label class="radio-item"><input type="radio" name="ans_${q.id}" value="${opt}"> ${opt}</label>`;
            }
            html += '</div>';
        }
        
        html += '</div>';
    }
    
    html += `<button class="submit-btn" onclick="submitSurvey('${survey.id}')">SUBMIT</button>`;
    html += '</div>';
    
    document.getElementById('surveyContainer').innerHTML = html;
}

function submitSurvey(surveyId) {
    let survey = surveys.find(s => s.id == surveyId);
    if (!survey) return;
    
    let answers = {};
    
    for (let q of survey.questions) {
        if (q.type === 'text') {
            let val = document.getElementById('ans_' + q.id)?.value;
            if (!val) {
                alert('Answer all questions!');
                return;
            }
            answers[q.id] = val;
        } else {
            let selected = document.querySelector(`input[name="ans_${q.id}"]:checked`)?.value;
            if (!selected) {
                alert('Answer all questions!');
                return;
            }
            answers[q.id] = selected;
        }
    }
    
    lastResult = {
        surveyId: survey.id,
        surveyTitle: survey.title,
        submittedAt: new Date().toLocaleString(),
        answers: answers
    };
    
    localStorage.setItem('lastResult', JSON.stringify(lastResult));
    
    alert('Survey submitted!');
    showTab('results');
}

function showResults() {
    let html = '';
    
    if (!lastResult) {
        html = '<div class="placeholder">No results yet</div>';
    } else {
        let survey = surveys.find(s => s.id == lastResult.surveyId);
        if (!survey) {
            html = '<div class="placeholder">Survey not found</div>';
        } else {
            for (let q of survey.questions) {
                html += '<div class="result-item">';
                html += `<div class="result-question">${q.text}</div>`;
                html += `<div class="result-answer">${lastResult.answers[q.id] || 'No answer'}</div>`;
                html += '</div>';
            }
        }
    }
    
    document.getElementById('resultsContainer').innerHTML = html;
}

showTab('builder');