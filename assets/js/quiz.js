const selectedTheme = document.querySelector(".switch");
selectedTheme.addEventListener("change", () => darkMode({ param: selectedTheme.checked })); 

function darkMode({ param = "null" }) {
  if (param == "null") {
    localStorage.setItem("dark-mode", "off"); 
    if (param && param != "off") {
      document.documentElement.classList.add("dark-mode");
      localStorage.setItem("dark-mode", "on");
    } else {
      document.documentElement.classList.remove("dark-mode");
      localStorage.setItem("dark-mode", "off");
    }
  }
  return param;
}

let response;
async function init() {
  const currentTheme = darkMode({ param: localStorage.getItem("dark-mode") });
  currentTheme === "on" ? (selectedTheme.checked = true) : (selectedTheme.checked = false); 
  response = await fetch("/assets/json/data.json").then((x) => x.json());
  document.querySelectorAll(".quizTypeButton").forEach((element) => {
    element.addEventListener("click", quizTypeButtonHandle);
  });
}
init();

function quizTypeButtonHandle() {
  const quizType = this.getAttribute("data-id"); 
  const questions = response.quizzes.find((x) => x.title == quizType); 
  startQuiz(questions); 
}

let scores = {
  correct: 0,
  incorrect: 0,
};
function startQuiz(quizzes) {
  document.querySelector(".header-title img").src = quizzes.icon; 
  document.querySelector(".header-title h2").innerHTML = quizzes.title; 
  document.querySelectorAll(".header-title *").forEach((element) => (element.style = "display: inherit")); 
  document.querySelector(".main-page").style = "display: none"; 
  document.querySelector(".quiz-page").style = "display: grid"; 
  document.querySelector(".submitNextBtn").innerText = "Sıradaki Soru"; 

  scores = {
    correct: 0,
    incorrect: 0,
  };

  getQuestions({
    quizzes: quizzes,
  });
}

function getQuestions({ quizzes = [], index = 0 }) {
  const questions = quizzes.questions; 

  if (questions.length != 0 && index < questions.length) {
    document.querySelector(".quiz-page-header span").innerHTML = `${questions.length} sorudan ${index + 1}.`; 
    document.querySelector(".quiz-page-header p").innerText = questions[index].question; 
    document.querySelector(".progressStatus").style = `width: ${(index + 1) * 10}%`; 

    let = wordIndex = 0;
    document.querySelector(".quizSectionFormOptions").innerHTML = questions[index].options
      .map((x) => {
        wordIndex++;
        const escapedOption = x.replace(/</g, "&lt;").replace(/>/g, "&gt;"); 
        return `<label><div>${convertOptionToWord(wordIndex - 1)}</div><input type="radio" name="answer" value="${escapedOption}" />${escapedOption}</label>`;
      })
      .join("");
  } else {
    document.querySelector(".quiz-page").style = "display: none"; 
    document.querySelector(".result-page").style = "display: grid"; 
    document.querySelector(".result-user-score h4").innerHTML = `<img src="${quizzes.icon}" />${quizzes.title}`; 
    document.querySelector(".result-user-score h1").innerText = scores.correct; 
    document.querySelector(".result-user-score span").innerText = `${questions.length} soruda`; 
    document.querySelector(".playAgainBtn").onclick = (e) => {
      e.preventDefault();
      document.querySelector('.header-title img').src = ""; 
      document.querySelector('.header-title h2').innerHTML = ""; 
      document.querySelector(".result-page").style = "display: none"; 
      document.querySelector(".main-page").style = "display: grid"; 
    };
  }

  document.querySelector(".submitAnswer").onclick = (e) => {
    e.preventDefault();
    if (index < questions.length && document.querySelector('input[name="answer"]:checked') != null) {
      document.querySelector(".statusMsg").style = "display: none"; 
      if (document.querySelector('input[name="answer"]:checked').value === questions[index].answer) {
        scores.correct++;
        document.querySelector('input[name="answer"]:checked').parentElement.classList.add("correct-answer");
      } else {
        scores.incorrect++;
        document.querySelector('input[name="answer"]:checked').parentElement.classList.add("incorrect-answer");
        document.querySelectorAll('input[name="answer"]').forEach(element => {
          if (element.value === questions[index].answer) {
            element.parentElement.classList.add("show-correct-answer");
          }
        })
      }

      document.querySelectorAll('input[name="answer"]').forEach((element) => {
        element.disabled = true;
      });
      document.querySelector(".submitAnswer").style = "display: none";
      document.querySelector(".submitNextBtn").style = "display: inherit"; 
      if (index + 1 == questions.length) {
        document.querySelector(".submitNextBtn").innerText = "Testi Bitir";
      }
      document.querySelector(".submitNextBtn").onclick = (e) => {
        e.preventDefault();
        document.querySelector(".submitAnswer").style = "display: inherit"; 
        document.querySelector(".submitNextBtn").style = "display: none"; 
        getQuestions({ quizzes: quizzes, index: index + 1 }); 
      };
    }else if (document.querySelector('input[name="answer"]:checked') == null){
      document.querySelector(".statusMsg").style = "display: flex";
    }
  };
}

const optionToWord = { 0: "A", 1: "B", 2: "C", 3: "D" };

const convertOptionToWord = (option) => optionToWord[option];
