document.addEventListener("DOMContentLoaded", async function () {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    let dataMatch = {};
    if (!userId || !token) {
        localStorage.removeItem("userId");
        localStorage.removeItem("token");
        window.location.href = "../../index.html";
    }

    const setphoto = await getPhoto(userId);

    const idMatch = localStorage.getItem("reportMatchID")

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
        localStorage.removeItem("token");
    });
});

const setInformationMatch = async (idMatch) => {
    const getInformationMatch = await fetch(`https://quester-backend.onrender.com/match/${idMatch}`).then((response) => {
        return response.json();
    }).catch((error) => {
        console.error('Erro ao buscar informações do Match:', error);
        window.location.href = "../../index.html";
    })
    return getInformationMatch;
}

const setInformationMatchHTML = (dataMatch) => {
    const userId = localStorage.getItem("userId");
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

    const position = document.getElementById("position");
    let Playens = dataMatch.players;
    Playens = Playens.find((element) => element._id === userId);
    position.innerHTML = `Sua posição: ${Playens.rank_position}°`;

    const numberQuestions = document.getElementById("number-questions");
    numberQuestions.innerHTML = `${dataMatch.questions.length} perguntas`;

    const timerQuestions = document.getElementById("timer-questions");
    timerQuestions.innerHTML = `${dataMatch.question_times} segundos por questão`;

    const numberPlayers = document.getElementById("number-players");
    numberPlayers.innerHTML = `${dataMatch.players.length} jogadores`;

    const questionsContainer = document.getElementById("section-list");
    
    dataMatch.questions.forEach((question, index) => {
        const questionContainer = document.createElement("div");
        questionContainer.classList.add("question-container");

        const img = document.createElement("img");
        if(Playens.answers[index]){
            img.src = "../../assets/icon/checkmark green circle.svg";
        }else{
            img.src = "../../assets/icon/checkmark red circle.svg";
        }
        img.classList.add("icon-checkmark");
        questionContainer.appendChild(img);

        const contentContainer = document.createElement("div");
        contentContainer.classList.add("content-container");

        const questionText = document.createElement("p");
        questionText.classList.add("question");
        questionText.innerHTML = `${index + 1}. ${question.question}`;
        contentContainer.appendChild(questionText);

        const answerText = document.createElement("p");
        answerText.classList.add("answer");
        if(Playens.answers[index]){
            answerText.innerHTML = `${question.correct_item}`;
        } else {
            answerText.innerHTML = `Resposta correta: ${question.correct_item}`;
        }
        contentContainer.appendChild(answerText);

        questionContainer.appendChild(contentContainer);
        questionsContainer.appendChild(questionContainer);
    });
}


function capitalizeFirstLetter(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}


const getPhoto = async (idUSer) => {    
    try {
        const response = await fetch(`https://quester-backend.onrender.com/profile-photo/${idUSer}`, {
        headers: {'Content-Type': 'multipart/form-data',},
    });
        if (response.ok) {
            const blob = await response.blob();
            const imgURL = URL.createObjectURL(blob);
            const img = document.getElementById("profile-photo");
            img.src = imgURL;
        } else {
            console.error('Erro ao enviar o arquivo:', response.statusText);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
}