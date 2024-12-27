import { setInformationMatch, setInformationMatchHTML, addNewPlayer, setNumberofPlayers } from './setMatchScript.js';
import { removerPlayer } from './setMatchScript.js';
import { initTimer } from './setMatchScript.js';
import { updateRank } from './setMatchScript.js';


const socket = new WebSocket('ws://localhost:8080');
const idMatch = localStorage.getItem("matchId");
const idUser = localStorage.getItem("userId");
const playerRole = localStorage.getItem("matchRole");
let dataUser = {
    _id: "",
    name: "",
    last_name: "",
    surname: "",
    selected: false,
    profile_photo: "",
    currentQuestion: 0,
    lastReponseQuestion: ""
}

let dataMatch

document.addEventListener("DOMContentLoaded", () => {
    const initButton = document.getElementById('init-match');
    const textWaitMatch = document.getElementById('text-wait-match');
    const contentQuestion = document.getElementById('main-content-middle-question');
    const contentInit = document.getElementById('main-content-middle-init');
    contentQuestion.style.display = 'none';

    if(playerRole === "PLAYER"){
        initButton.style.display = 'none';
        textWaitMatch.textContent = 'Aguardando o início da partida';
    } else if(playerRole === "HOST"){
        initButton.addEventListener('click', () => {
            socket.send(JSON.stringify({ type: 'init' }))
        })
    }

    setInformationMatch(idMatch).then((data) => {
        dataMatch = data;
        setInformationMatchHTML(dataMatch);
    })
    socket.addEventListener('open', (event) => {
        const getInfomationUser = getInformationUser(idUser).then((data) => {
            dataUser = {
                _id: idUser,
                name:  data.name,
                last_name: data.last_name,
                surname:  data.surname,
                profile_photo: data.profile_photo
            }

            if(playerRole === "PLAYER"){
                const infomationUser = {
                    type: 'enter', 
                    value: {
                       _id: idUser,
                       name:  data.name,
                       last_name: data.last_name,
                       surname:  data.surname,
                       profile_photo: data.profile_photo
                    }
               }
               socket.send(JSON.stringify(infomationUser))
            } else if(playerRole === "HOST"){
                console.log(idMatch);
                socket.send(JSON.stringify({ type: 'start', value: idMatch }))
            }
            console.log('Conectado ao servidor WebSocket' + dataUser.surname);
        })
    });

    socket.addEventListener('message', (menssage) => {
        const data = JSON.parse(menssage.data);
        switch(data.type){
            case "chat":
                addMessage(data);
            break

            case "newPlayer":
                addNewPlayer(data.value);
                setNumberofPlayers(data.value.length);
                setAllNumberofPlayers(data.value.length);
            break

            case "totalPlayer":
                setAllNumberofPlayers(data.value);
            break

            case "disconnectPlayer":
                removerPlayer(data.value);
            break

            case "passQuestion":
                initTitle()
                initTimer(dataMatch.question_times - 1);
                passQuestion(data.value);
                contentInit.style.display = 'none';
                contentQuestion.style.display = 'flex';
                unselectQuestion();
            break

            case "responseQuestion":
               setResponseQuestion(data.value);
            break

            case "rank":
               updateRank(data.value);
            break

            case "finishMatch":
                if(playerRole === "PLAYER"){
                    localStorage.removeItem("matchId");
                    localStorage.removeItem("matchRole");
                    localStorage.setItem("reportMatchID", dataMatch._id);
                    window.location.href = "./reportPlayerStudent.html";
                } else if(localStorage.getItem("occupation") === "TEACHER"){
                    localStorage.removeItem("matchId");
                    localStorage.removeItem("matchRole");
                    localStorage.setItem("reportMatchID", dataMatch._id);
                    window.location.href = "./reportTeacher.html";
                } else {
                    localStorage.removeItem("matchId");
                    localStorage.removeItem("matchRole");
                    localStorage.setItem("reportMatchID", dataMatch._id);
                    window.location.href = "./reportHostStudent.html";
                }
            break
        }
    });

    socket.addEventListener('close', (event) => {
        console.log('Desconectado do servidor WebSocket');
    });

    socket.addEventListener('error', (error) => {
        console.error('Erro no WebSocket:', error);
    });
})

const sendChatButton = document.getElementById('send-message').addEventListener('click', () => {
    const message = document.getElementById('input-message')
    socket.send(JSON.stringify(
        { 
            type: 'chat', 
            value: {
                user: dataUser.surname,
                message: message.value
            }
        }
    ));
    message.value = '';
});

const getInformationUser = async (idUSer) => {
    try {
        const response = await fetch(`http://localhost:3000/user`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify({ _id: idUSer }),
        });
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error('Erro ao enviar o arquivo:', response.statusText);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
}

const addMessage = (message) => {
    const chat = document.getElementById('main-content-right-middle');
    const divContainer = document.createElement('div');

    const divContent = document.createElement('div');
    divContent.classList.add('message-content');

    if(message.value.user !== dataUser.surname){
        divContainer.classList.add('message-player-container');
        const spanName = document.createElement('span');
        spanName.classList.add('name-user');
        spanName.textContent = message.value.user;
        divContent.appendChild(spanName);
    } else {
        divContainer.classList.add('message-user-container');
    }
    
    const spanMessage = document.createElement('span');
    spanMessage.classList.add('messages');
    spanMessage.textContent = message.value.mensagem;
    divContent.appendChild(spanMessage)

    divContainer.appendChild(divContent);
    chat.appendChild(divContainer);
}




const getPhoto = async () => {    
    try {
        const idUSer = "66d4746961897cd2cb0ec33a"
        const response = await fetch(`http://localhost:3000/profile-photo/${idUSer}`, {
        headers: {'Content-Type': 'multipart/form-data',},
    });
        if (response.ok) {
            const blob = await response.blob();
            const imgURL = URL.createObjectURL(blob);
            const imgElement = document.getElementById('teste');
            imgElement.src = imgURL;
        } else {
            console.error('Erro ao enviar o arquivo:', response.statusText);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
}

window.addEventListener('beforeunload', (event) => {
    socket.send(JSON.stringify({
        type: 'disconnect',
        value: dataUser._id
    }));
})


const setAllNumberofPlayers = (valueNumber) => {
    const numberAllPlayers = document.getElementById('number-all-player');
    numberAllPlayers.textContent = valueNumber;
}

const selectQuestionMultipleFisrt = document.getElementById('question-multi-fisrt')
selectQuestionMultipleFisrt.addEventListener("click", () => {
    if(playerRole === "PLAYER" && dataUser.selected === false){
        dataUser.selected = true;
        sendResposta(selectQuestionMultipleFisrt.textContent);
    }
})

const selectQuestionMultipleSecond = document.getElementById('question-multi-second')
selectQuestionMultipleSecond.addEventListener("click", () => {
    if(playerRole === "PLAYER" && dataUser.selected === false){
        dataUser.selected = true;
        sendResposta(selectQuestionMultipleSecond.textContent);
    }
})
const selectQuestionMultipleThird = document.getElementById('question-multi-third')
selectQuestionMultipleThird.addEventListener("click", () => {
    if(playerRole === "PLAYER" && dataUser.selected === false){
        dataUser.selected = true;
        sendResposta(selectQuestionMultipleThird.textContent);
    }
})
const selectQuestionMultipleFourth = document.getElementById('question-multi-fourth')
selectQuestionMultipleFourth.addEventListener("click", () => {
    if(playerRole === "PLAYER" && dataUser.selected === false){
        dataUser.selected = true;
        sendResposta(selectQuestionMultipleFourth.textContent);
    }
})


const sendResposta = (resposta) => {
    dataUser.lastReponseQuestion = resposta;
    const reponse = {
        _id: dataUser._id,
        mensage: resposta
    }
    socket.send(JSON.stringify(
        { 
            type: 'answer', 
            value: reponse
        }
    ));
}

const passQuestion = (value) => {
    dataUser.currentQuestion = value;
    const questionOPEN = document.getElementById('question-div-middle');
    const inputQuestion = document.getElementById('question-div-bottom');
    const questionCLOSE = document.getElementById('question-multi-div-middle');
    setQuestionHTML(dataMatch.questions[dataUser.currentQuestion].question, dataUser.currentQuestion);
    if(playerRole === "PLAYER"){
        if(dataMatch.questions[dataUser.currentQuestion].type === "CLOSE"){
            questionOPEN.style.display = 'none';
            questionCLOSE.style.display = 'flex';
            inputQuestion.style.display = 'none';
            console.log(dataMatch.questions[dataUser.currentQuestion].item);
            selectQuestionMultipleFisrt.textContent = dataMatch.questions[dataUser.currentQuestion].item[0];
            selectQuestionMultipleSecond.textContent = dataMatch.questions[dataUser.currentQuestion].item[1];
            selectQuestionMultipleThird.textContent = dataMatch.questions[dataUser.currentQuestion].item[2];
            selectQuestionMultipleFourth.textContent = dataMatch.questions[dataUser.currentQuestion].item[3];
        }else if(dataMatch.questions[dataUser.currentQuestion].type === "OPEN"){
            questionOPEN.style.display = 'flex';
            questionCLOSE.style.display = 'none';
            inputQuestion.style.display = 'flex';
            const inputQuestionText = document.getElementById('send-question');
            inputQuestionText.addEventListener('click', () => {
                const inputQuestionText = document.getElementById('input-question');
                if(inputQuestionText.value.trim() !== "" && dataUser.lastReponseQuestion !== dataMatch.questions[dataUser.currentQuestion].correct_item){
                    sendResposta(inputQuestionText.value);
                    inputQuestionText.value = '';
                }
            })
        }
    } else {
        if(dataMatch.questions[dataUser.currentQuestion].type === "CLOSE"){
            questionOPEN.style.display = 'none';
            questionCLOSE.style.display = 'flex';
            inputQuestion.style.display = 'none';
            console.log(dataMatch.questions[dataUser.currentQuestion].item);
            selectQuestionMultipleFisrt.textContent = dataMatch.questions[dataUser.currentQuestion].item[0];
            selectQuestionMultipleSecond.textContent = dataMatch.questions[dataUser.currentQuestion].item[1];
            selectQuestionMultipleThird.textContent = dataMatch.questions[dataUser.currentQuestion].item[2];
            selectQuestionMultipleFourth.textContent = dataMatch.questions[dataUser.currentQuestion].item[3];
        } else if(dataMatch.questions[dataUser.currentQuestion].type === "OPEN"){
            inputQuestion.style.display = 'none';
            questionOPEN.style.display = 'flex';
            questionCLOSE.style.display = 'none';
            questionOPEN.style.height = '85%';
        }
    }
}

const setQuestionHTML = (questionText, currentQuestion) => {
    const questionDiv = document.getElementById('text-question');
    const afterQuestion = document.getElementById('after-question-div');
    questionDiv.textContent = questionText;
    afterQuestion.textContent = `${currentQuestion + 1}/${dataMatch.questions.length}`;
}

const unselectQuestion = () => {
    dataUser.selected = false;
    dataUser.lastReponseQuestion = "";
    selectQuestionMultipleFisrt.classList.remove("question-multi-correct","question-multi-incorrect");
    selectQuestionMultipleSecond.classList.remove("question-multi-correct","question-multi-incorrect");
    selectQuestionMultipleThird.classList.remove("question-multi-correct","question-multi-incorrect");
    selectQuestionMultipleFourth.classList.remove("question-multi-correct","question-multi-incorrect");
}

const setResponseQuestion = (value) => {
    if(playerRole === "PLAYER"){
        if(dataMatch.questions[dataUser.currentQuestion].type === "CLOSE"){
            if(value.user == dataUser.surname){
               feedbackQuestionClose(value.correct);
            }
        } else if(dataMatch.questions[dataUser.currentQuestion].type === "OPEN"){
            feedbackQuestionOpen(value);
        }
    } else {
        if(dataMatch.questions[dataUser.currentQuestion].type === "OPEN"){
            feedbackQuestionOpenHOST(value);
        }
    }
}

const feedbackQuestionClose = (isCorrect) => {
    switch(dataUser.lastReponseQuestion){
        case selectQuestionMultipleFisrt.textContent:
            if(isCorrect){
                selectQuestionMultipleFisrt.classList.add('question-multi-correct');
            } else {
                selectQuestionMultipleFisrt.classList.add('question-multi-incorrect');
            }
        break

        case selectQuestionMultipleSecond.textContent:
            if(isCorrect){
                selectQuestionMultipleSecond.classList.add('question-multi-correct');
            } else {
                selectQuestionMultipleSecond.classList.add('question-multi-incorrect');
            }
        break

        case selectQuestionMultipleThird.textContent:
            if(isCorrect){
                selectQuestionMultipleThird.classList.add('question-multi-correct');
            } else {
                selectQuestionMultipleThird.classList.add('question-multi-incorrect');
            }
        break

        case selectQuestionMultipleFourth.textContent:
            if(isCorrect){
                selectQuestionMultipleFourth.classList.add('question-multi-correct');
            } else {
                selectQuestionMultipleFourth.classList.add('question-multi-incorrect');
            }
        break
    }
}

const feedbackQuestionOpen = (value) => {
    const divQustionOPEN = document.getElementById('question-div-middle');
    const divQuestionContainer = document.createElement('div');
    const divQuestionContent = document.createElement('div');
    const spanQuestion = document.createElement('span');

    if(value.user == dataUser.surname){
        divQuestionContainer.classList.add('question-user-container');
        divQuestionContent.classList.add('question-user-content');
        if(value.correct){
            spanQuestion.textContent = "Você acertou a questão! Parabéns!";
            dataUser.selected = true;
        } else {
            console.log(value.user + " " + dataUser.surname + " " + value.correct);
            spanQuestion.textContent = value.answer;
        }
        divQuestionContent.appendChild(spanQuestion);
        divQuestionContainer.appendChild(divQuestionContent);
        divQustionOPEN.appendChild(divQuestionContainer);
    } else {
        if(value.correct){
            divQuestionContainer.classList.add('question-correct-container');
            divQuestionContent.classList.add('question-correct-content');
            spanQuestion.textContent = `${value.user} acertou!`;

            divQuestionContent.appendChild(spanQuestion);
            divQuestionContainer.appendChild(divQuestionContent);
            divQustionOPEN.appendChild(divQuestionContainer);
        }else{
            divQuestionContainer.classList.add('question-incorrect-container');
            divQuestionContent.classList.add('question-incorrect-content');
            const spanName = document.createElement('span');
            spanName.classList.add('question-incorrect-content-name');
            spanName.textContent = value.user;
            spanQuestion.classList.add('question-incorrect-content-message');
            spanQuestion.textContent = value.answer;

            divQuestionContent.appendChild(spanName);
            divQuestionContent.appendChild(spanQuestion);
            divQuestionContainer.appendChild(divQuestionContent);
            divQustionOPEN.appendChild(divQuestionContainer);
        }
    }
}

const feedbackQuestionOpenHOST = (value) => {
    const divQustionOPEN = document.getElementById('question-div-middle');
    const divQuestionContainer = document.createElement('div');
    const divQuestionContent = document.createElement('div');
    const spanQuestion = document.createElement('span');

    if(value.correct){
        divQuestionContainer.classList.add('question-correct-container');
        divQuestionContent.classList.add('question-correct-content');
        spanQuestion.textContent = `${value.user} acertou!`;
        divQuestionContent.style.width = '100%';

        divQuestionContent.appendChild(spanQuestion);
        divQuestionContainer.appendChild(divQuestionContent);
        divQustionOPEN.appendChild(divQuestionContainer);
    } else{
        divQuestionContainer.classList.add('question-incorrect-container');
        divQuestionContent.classList.add('question-incorrect-content');
        const spanName = document.createElement('span');
        spanName.classList.add('question-incorrect-content-name');
        spanName.textContent = value.user;
        spanQuestion.classList.add('question-incorrect-content-message');
        spanQuestion.textContent = value.answer;
        divQuestionContent.style.width = '100%';

        divQuestionContent.appendChild(spanName);
        divQuestionContent.appendChild(spanQuestion);
        divQuestionContainer.appendChild(divQuestionContent);
        divQustionOPEN.appendChild(divQuestionContainer);
    }
}


const initTitle = () => {
    const initTitle = document.getElementById('main-tittle-h1');
    initTitle.textContent = "Partida Iniciada";
}
