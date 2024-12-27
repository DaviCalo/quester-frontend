const playersData = [];

export const setInformationMatch = async (idMatch) => {
    const getInformationMatch = await fetch(`http://localhost:3000/match/${idMatch}`).then((response) => {
        return response.json();
    }).catch((error) => {
        console.error('Erro ao buscar informações do Match:', error);
    })

    return getInformationMatch;
}

export const setInformationMatchHTML = (dataMatch) => {
    const pinMatch = document.getElementById('pin-match');
    pinMatch.innerHTML = dataMatch.pin;

    const nameMatch = document.getElementById('title-match');
    nameMatch.innerHTML = capitalizeFirstLetter(dataMatch.name);

    const dateMatch = document.getElementById('question-amount');
    dateMatch.innerHTML = `${dataMatch.questions.length} questões`;

    const timeMatch = document.getElementById('question-timer');
    timeMatch.innerHTML = `${dataMatch.question_times} seg. por questão`;

    if(!dataMatch.chat_availability){
        const noChat = document.getElementById('main-content-right-no-chat');
        const chat = document.getElementById('main-content-right');
        noChat.style.display = 'flex';
        chat.style.display = 'none'; 
    }

    setTimeout(() => {
        const load = document.getElementById('load');
        load.style.display = 'none';
    }, 2000);
}

export const addNewPlayer = (data) => {
    console.log(data);
   data.forEach(async (player,index) => {
        if (!playersData.find((element) => element._id === player._id)) {
            playersData.push({
                _id: player._id,
                surname: player.surname,
                score: player.score,
                photo: await getPhoto(player._id),
                positionPlayer: "-"
            });
            setPlayers(playersData[playersData.length - 1]);
        }
        else {
            console.log('Já existe');
        }
   })
   console.log(playersData);
}

function setPlayers(player){
    const players = document.getElementById('main-content-left-middle');

    const cardPlayer = document.createElement('div');
    cardPlayer.classList.add('card-player');

    const positionPlayer = document.createElement('span');
    positionPlayer.classList.add('position-card-player');
    positionPlayer.textContent = "-";
    cardPlayer.appendChild(positionPlayer);

    const imgPlayer = document.createElement('img');
    imgPlayer.classList.add('img-card-player');
    imgPlayer.src = player.photo;
    cardPlayer.appendChild(imgPlayer);

    const textCardPlayer = document.createElement('div');
    textCardPlayer.classList.add('text-card-player');

    const spanName = document.createElement('span');
    spanName.textContent = player.surname;
    textCardPlayer.appendChild(spanName);

    const spanPoints = document.createElement('span');
    spanPoints.textContent = `${player.score} pts`;
    textCardPlayer.appendChild(spanPoints);

    cardPlayer.appendChild(textCardPlayer);

    players.appendChild(cardPlayer);
}


export const removerPlayer = (idPlayer) => {
    console.log(idPlayer);
    const players = document.getElementById('main-content-left-middle');
    const index = playersData.findIndex((element) => element._id === idPlayer);
    if (index !== -1) {
        playersData.splice(index, 1);
        players.removeChild(players.children[index]);
        setNumberofPlayers(playersData.length);
    }
}

const getPhoto = async (idUSer) => {    
    try {
        const response = await fetch(`http://localhost:3000/profile-photo/${idUSer}`, {
        headers: {'Content-Type': 'multipart/form-data',},
    });
        if (response.ok) {
            const blob = await response.blob();
            const imgURL = URL.createObjectURL(blob);
            return imgURL;
        } else {
            console.error('Erro ao enviar o arquivo:', response.statusText);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
}

export const setNumberofPlayers = (valueNumber) => {
    const numberPlayers = document.getElementById('number-player');

    numberPlayers.textContent = valueNumber;
}


function capitalizeFirstLetter(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function paddedFormat(num) {
    return num.toString().padStart(2, '0');
}

export const initTimer = (time) => {
    const timerCurrent = document.getElementById('timer-current');
    const timerQuestion = document.getElementById('timer-question');
    let duration = time;
    let elapsedTime = 0;

    timerQuestion.textContent = `${paddedFormat(Math.floor(time / 60))}:${paddedFormat(time % 60)}`;
    timerCurrent.style.width = `${elapsedTime/time*100}%`;

    const interval = setInterval(() => {
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;

        timerQuestion.textContent = `${paddedFormat(minutes)}:${paddedFormat(seconds)}`;

        if (duration <= 0) {
            clearInterval(interval);
            timerCurrent.style.width = `${(elapsedTime / time) * 100}%`;
        } else{
            timerCurrent.style.width = `${(elapsedTime / time) * 100}%`;
        }

        duration--;
        elapsedTime ++;
    }, 1000);
}

export const updateRank = (value) => {
    let allScores = 0;
    const rank = document.getElementById('main-content-left-middle');
    playersData.forEach((player, index) => {
        allScores += value.find((element) => element._id === player._id).score;
        rank.children[index].children[0].textContent = value.find((element) => element._id === player._id).rank_position;
        rank.children[index].children[2].children[1].textContent = `${value.find((element) => element._id === player._id).score} pts`;
    })
    console.log(allScores + ' pts');
    const totalPoints = document.getElementById('all-points');
    totalPoints.textContent = allScores;
}