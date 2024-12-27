document.addEventListener("DOMContentLoaded", async function () {
    const userId = localStorage.getItem("userId");
    const occupation = localStorage.getItem("occupation");
    let dataMatch = {};
    if (!userId || !occupation) {
        localStorage.removeItem("userId");
        localStorage.removeItem("occupation");
        window.location.href = "../../index.html";
    }

    const setphoto = await getPhoto(userId);

    const idMatch = localStorage.getItem("reportMatchID");

    if (!idMatch) {
        window.location.href = "../../index.html";
    }

    setInformationMatch(idMatch).then((data) => {
        dataMatch = data;
        setInformationMatchHTML(dataMatch);
    })

    const logoutButton = document.getElementById("logout");
        logoutButton.addEventListener("click", function () {
        localStorage.removeItem("userId");
        localStorage.removeItem("occupation");
    });
});

const setInformationMatch = async (idMatch) => {
    const getInformationMatch = await fetch(`http://localhost:3000/match/${idMatch}`).then((response) => {
        return response.json();
    }).catch((error) => {
        console.error('Erro ao buscar informações do Match:', error);
        window.location.href = "../../index.html";
    })
    return getInformationMatch;
}

const setInformationMatchHTML = (dataMatch) => {
    const nameMatch = document.getElementById("name-match");
    nameMatch.innerHTML = capitalizeFirstLetter(dataMatch.name);

    const descriptionMatch = document.getElementById("description-match");
    if(dataMatch.description === undefined) {
        descriptionMatch.style.display = "none";
    } else {
        descriptionMatch.innerHTML = capitalizeFirstLetter(dataMatch.description);
    }

    const timerMatch = document.getElementById("timer-match");
    timerMatch.innerHTML = `${dataMatch.data} - ${dataMatch.time}`;

    const numberQuestions = document.getElementById("number-questions");
    numberQuestions.innerHTML = `${dataMatch.questions.length} perguntas`;

    const timerQuestions = document.getElementById("timer-questions");
    timerQuestions.innerHTML = `${dataMatch.question_times} segundos por questão`;

    const numberPlayers = document.getElementById("number-players");
    numberPlayers.innerHTML = `${dataMatch.players.length} jogadores`;

    const questionsContainer = document.getElementById("section-list");
    
    dataMatch.questions.forEach((question, index) => {
        let correctCount = 0;
        let incorrectCount = 0;

        dataMatch.players.forEach((player) => {
            const playerAnswer = player.answers[index];
            if (playerAnswer) {
                correctCount++;
            } else {
                incorrectCount++;
            }
        })

        const correctPercentage = (correctCount / dataMatch.players.length) * 100;
        const incorrectPercentage = (incorrectCount / dataMatch.players.length) * 100;

        const questionContainer = createQuestionContainer(
            question.question,
            question.correct_item,
            correctPercentage,
            incorrectPercentage
        )

        questionsContainer.appendChild(questionContainer);
    });
}

const createQuestionContainer = (questionText, answerText, correctPercentage, wrongPercentage) => {
    const questionContainer = document.createElement('div');
    questionContainer.className = 'question-container';

    const contentContainer = document.createElement('div');
    contentContainer.className = 'content-container';

    const question = document.createElement('p');
    question.className = 'question';
    question.textContent = questionText;

    const answer = document.createElement('p');
    answer.className = 'answer';
    answer.textContent = answerText;

    const reportList = document.createElement('div');
    reportList.className = 'report-list';

    const resultCorrect = document.createElement('div');
    resultCorrect.className = 'result correct';

    const correctDiv = document.createElement('div');

    const correctImg = document.createElement('img');
    correctImg.src = '../../assets/icon/checkmark green circle.svg';

    const correctPercentageP = document.createElement('p');
    correctPercentageP.className = 'percentage';
    correctPercentageP.innerHTML = `<span>${correctPercentage}%</span> Acertaram`;

    const correctExpandImg = document.createElement('img');
    correctExpandImg.src = '/frontend/assets/icon/Arrow Expand.svg';

    correctDiv.appendChild(correctImg);
    correctDiv.appendChild(correctPercentageP);
    resultCorrect.appendChild(correctDiv);
    resultCorrect.appendChild(correctExpandImg);

    const resultWrong = document.createElement('div');
    resultWrong.className = 'result wrong';

    const wrongDiv = document.createElement('div');

    const wrongImg = document.createElement('img');
    wrongImg.src = '../../assets/icon/checkmark red circle.svg';

    const wrongPercentageP = document.createElement('p');
    wrongPercentageP.className = 'percentage';
    wrongPercentageP.innerHTML = `<span>${wrongPercentage}%</span> Erraram`;

    const wrongExpandImg = document.createElement('img');
    wrongExpandImg.src = '../../assets/icon/Arrow Expand.svg';

    wrongDiv.appendChild(wrongImg);
    wrongDiv.appendChild(wrongPercentageP);
    resultWrong.appendChild(wrongDiv);
    resultWrong.appendChild(wrongExpandImg);

    reportList.appendChild(resultCorrect);
    reportList.appendChild(resultWrong);
    contentContainer.appendChild(question);
    contentContainer.appendChild(answer);
    contentContainer.appendChild(reportList);
    questionContainer.appendChild(contentContainer);

    return questionContainer;
}


function capitalizeFirstLetter(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

const getPhoto = async (idUSer) => {    
    try {
        const response = await fetch(`http://localhost:3000/profile-photo/${idUSer}`, {
        headers: {'Content-Type': 'multipart/form-data',},
    });
        if (response.ok) {
            const blob = await response.blob();
            const imgURL = URL.createObjectURL(blob);
            localStorage.setItem("profilePhoto", imgURL);
            const img = document.getElementById("profile-photo");
            img.src = imgURL;
        } else {
            console.error('Erro ao enviar o arquivo:', response.statusText);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
}