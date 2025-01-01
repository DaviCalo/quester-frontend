const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");

document.addEventListener("DOMContentLoaded", async function () {

    if (!userId && !token) {
        localStorage.clear()
        window.location.href = "../../index.html";
        return;
    }
        
    fetchMatchesHistory(userId);

    const setphoto = await getPhoto(userId);

    // Carregar a seleção do histórico ao abrir a página
    const selectedHistory =
        localStorage.getItem("selectedHistory") || "host"; // 'host' é o padrão
    updateHistorySelection(selectedHistory);

    // Adicionar evento de clique nos botões
    document
        .getElementById("toggleHost")
        .addEventListener("click", function () {
            updateHistorySelection("host");
            localStorage.setItem("selectedHistory", "host"); // Armazena a seleção
        });

    document
        .getElementById("toggleParticipante")
        .addEventListener("click", function () {
            updateHistorySelection("participante");
            localStorage.setItem("selectedHistory", "participante"); // Armazena a seleção
        });
});

async function fetchMatchesHistory(userId) {
    try {
        const response = await fetch(
            `https://quester-backend.onrender.com/match/history/${userId}`, {
            headers: { 'Content-Type': 'multipart/form-data', "Authorization": `Bearer ${token}`, },
        });
        if (!response.ok) {
            throw new Error("Erro ao buscar o histórico de partidas");
        }
        const data = await response.json();
        displayMatches(data);
    } catch (error) {
        console.error("Erro:", error);
    }
}

function displayMatches(data) {
    const hostContainer = document.querySelector(
        ".historico-host .grid-container"
    );
    const participantContainer = document.querySelector(
        ".historico-participante .grid-container"
    );

    // Limpar os conteúdos existentes
    hostContainer.innerHTML = "";
    participantContainer.innerHTML = "";

    // Exibir partidas criadas
    data.created_matches.forEach((match) => {
        const matchElement = document.createElement("div");
        matchElement.className = "card";
        matchElement.setAttribute("data-semester", match.semester);

        matchElement.innerHTML = `
        <h3 class="partida-name">${match.name}</h3>
        <p class="partida-description">${match.description}</p>
        <p class="partida-data">Data: ${match.data} - ${match.time} min</p>
        <p class="partida-players">Quantidade de Jogadores: ${match.players.length}</p>
        <p class="partida-questions">${match.questions.length} Questões de ${match.question_times} seg.</p>
      `;

        // Cria o botão de visualizar
        const visualizar = document.createElement("span");
        visualizar.classList.add("visualizar");
        visualizar.setAttribute("data-idmatch", match._id); // Atribui o ID da partida
        visualizar.textContent = `Visualizar`; // Texto do botão

        // Adiciona um evento de clique ao botão "Visualizar"
        visualizar.addEventListener("click", () => {
            localStorage.setItem("reportMatchID", match._id);
            if (localStorage.getItem("selectedHistory") === 'host') {
                window.location.href = "../pages/reportHostStudent.html";
            } else if (localStorage.getItem("selectedHistory") === 'participated') {
                window.location.href = "../pages/reportPlayerStudent.html";
            }
        });

        // Adiciona o botão ao card
        matchElement.appendChild(visualizar);
        hostContainer.appendChild(matchElement); // Adiciona o card ao container de host
    });

    // Exibir partidas em que o usuário participou
    data.participated_matches.forEach((match) => {
        const matchElement = document.createElement("div");
        matchElement.className = "card";
        matchElement.setAttribute("data-semester", match.semester);

        // Encontra o usuário atual na lista de jogadores
        const userId = localStorage.getItem("userId");
        const currentPlayer = match.players.find(
            (player) => player._id === userId
        );

        // Se o jogador atual for encontrado, exibe a posição no ranking
        let rankPositionHTML = "";
        if (currentPlayer) {
            rankPositionHTML = `<p class="partida-rank">Ficou em ${currentPlayer.rank_position}° lugar</p>`;
        }

        matchElement.innerHTML = `
<h3 class="partida-name">${match.name}</h3>
<p class="partida-description">${match.description}</p>
${rankPositionHTML}
<p class="partida-data">Data: ${match.data} - ${match.time} min</p>
<p class="partida-questions">${match.questions.length} Questões de ${match.question_times} seg.</p>
`;

        // Cria o botão de visualizar
        const visualizar = document.createElement("span");
        visualizar.classList.add("visualizar");
        visualizar.setAttribute("data-idmatch", match._id); // Atribui o ID da partida
        visualizar.textContent = `Visualizar`; // Texto do botão

        // Adiciona um evento de clique ao botão
        visualizar.addEventListener("click", () => {
            // Lógica para visualizar a partida
            console.log(`Visualizando partida: ${match._id}`);
        });

        // Adiciona o botão ao card
        matchElement.appendChild(visualizar);
        participantContainer.appendChild(matchElement); // Adiciona o card ao container de participante
    });
}

// Função para atualizar a seleção de histórico
function updateHistorySelection(selected) {
    if (selected === "host") {
        document.querySelector(".historico-host").style.display = "block";
        document.querySelector(".historico-participante").style.display =
            "none";
        document.getElementById("toggleHost").classList.add("selected");
        document
            .getElementById("toggleParticipante")
            .classList.remove("selected");
    } else {
        document.querySelector(".historico-participante").style.display =
            "block";
        document.querySelector(".historico-host").style.display = "none";
        document
            .getElementById("toggleParticipante")
            .classList.add("selected");
        document.getElementById("toggleHost").classList.remove("selected");
    }
}

// No final do seu script, adicione isso:
document
    .getElementById("pesquisarPartida")
    .addEventListener("input", function () {
        const filterValue = this.value.toLowerCase(); // Captura o valor digitado e converte para minúsculas
        filterMatches(filterValue); // Chama a função de filtro
    });

// Função para filtrar as partidas
function filterMatches(filterValue) {
    const hostContainer = document.querySelector(
        ".historico-host .grid-container"
    );
    const participantContainer = document.querySelector(
        ".historico-participante .grid-container"
    );

    // Filtra partidas criadas
    const hostCards = hostContainer.querySelectorAll(".card");
    hostCards.forEach((card) => {
        const title = card
            .querySelector(".partida-name")
            .textContent.toLowerCase();
        if (title.includes(filterValue)) {
            card.style.display = ""; // Mostra o card se o título corresponder ao filtro
        } else {
            card.style.display = "none"; // Esconde o card se não corresponder
        }
    });

    // Filtra partidas participadas
    const participantCards = participantContainer.querySelectorAll(".card");
    participantCards.forEach((card) => {
        const title = card
            .querySelector(".partida-name")
            .textContent.toLowerCase();
        if (title.includes(filterValue)) {
            card.style.display = ""; // Mostra o card se o título corresponder ao filtro
        } else {
            card.style.display = "none"; // Esconde o card se não corresponder
        }
    });
}

// Adicione isso ao final do seu script
document
    .getElementById("filtroSemestre")
    .addEventListener("change", function () {
        const selectedSemester = this.value; // Captura o valor selecionado
        filterBySemester(selectedSemester); // Chama a função de filtro
    });

// Função para filtrar as partidas por semestre
function filterBySemester(selectedSemester) {
    const hostContainer = document.querySelector(
        ".historico-host .grid-container"
    );
    const participantContainer = document.querySelector(
        ".historico-participante .grid-container"
    );

    // Filtra partidas criadas
    const hostCards = hostContainer.querySelectorAll(".card");
    hostCards.forEach((card) => {
        const semester = card.getAttribute("data-semester"); // Supondo que você tenha um data-semester no card
        if (selectedSemester === "" || semester === selectedSemester) {
            card.style.display = ""; // Mostra o card se o semestre corresponder
        } else {
            card.style.display = "none"; // Esconde o card se não corresponder
        }
    });

    // Filtra partidas participadas
    const participantCards = participantContainer.querySelectorAll(".card");
    participantCards.forEach((card) => {
        const semester = card.getAttribute("data-semester"); // Supondo que você tenha um data-semester no card
        if (selectedSemester === "" || semester === selectedSemester) {
            card.style.display = ""; // Mostra o card se o semestre corresponder
        } else {
            card.style.display = "none"; // Esconde o card se não corresponder
        }
    });
}

const getPhoto = async (idUSer) => {
    try {
        const response = await fetch(`https://quester-backend.onrender.com/profile-photo/${idUSer}`, {
            headers: { 'Content-Type': 'multipart/form-data', "Authorization": `Bearer ${token}` },
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
const logoutButton = document.getElementById("logout");
logoutButton.addEventListener("click", function () {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
});