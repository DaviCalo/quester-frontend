const token = localStorage.getItem("token");
let matchToDelete = null;
let partidas = [];
let userId;

async function fetchUserMatches() {
    userId = localStorage.getItem("userId");

    if (!userId) {
        document.getElementById("mensagemErro").textContent =
            "Erro: ID de usuário não encontrado no localStorage.";
        return;
    }

    try {
        const response = await fetch(
            `https://quester-backend.onrender.com/waiting-match/history/${userId}`, {
            headers: { 'Content-Type': 'multipart/form-data', "Authorization": `Bearer ${token}`, },
        });
        if (!response.ok) {
            throw new Error("Erro na resposta da API");
        }

        partidas = await response.json();
        renderMatches(partidas);
    } catch (error) {
        document.getElementById("mensagemErro").textContent =
            "Erro ao buscar partidas: " + error.message;
    }
}

function renderMatches(matches) {
    const partidasContainer = document.getElementById("partidasContainer");
    const semPartidasContainer = document.getElementById("semPartidas");

    partidasContainer.innerHTML = "";

    if (matches.length === 0) {
        semPartidasContainer.style.display = "block";
        partidasContainer.style.display = "none";
    } else {
        semPartidasContainer.style.display = "none";

        matches.forEach((match) => {
            const card = document.createElement("div");
            card.classList.add("card-partida-guardada");

            const conteudoCard = document.createElement("div");
            conteudoCard.classList.add("conteudo-card");
            conteudoCard.innerHTML = `
    
<h3>${match.name} </h3>
<span>
  <img src="../../assets/icon/Grid.svg" alt="Ícone de Descrição" class="icone-texto" /> 
  ${match.description}
</span>
<span>
  <img src="../../assets/icon/Grid.svg" alt="Ícone de Data" class="icone-texto" /> 
  ${match.data} - ${match.time}
</span>
<span>
  <img src="../../assets/icon/iconDeletar.svg" alt="Ícone de Tempo" class="icone-texto" /> 
  Tempo de questão: ${match.question_times} seg
</span>
<span>
  <img src="caminho/para/icon-questoes.svg" alt="Ícone de Questões" class="icone-texto" /> 
  ${match.questions.length} questões
</span>
console.log(${match.description})
`;

            const botoes = document.createElement("div");
            botoes.classList.add("botoes");

            const iniciar = document.createElement("span");
            iniciar.classList.add("iniciar");
            iniciar.textContent = "Iniciar";
            iniciar.id = "iniciarPartida";

            iniciar.addEventListener("click", async () => {
                localStorage.setItem("waitingMatchId", match._id);
                await startMatch();
            });

            const editar = document.createElement("span");
            editar.classList.add("editar");
            editar.setAttribute("data-id", match._id);
            editar.textContent = "Editar";
            editar.addEventListener("click", () => {
                localStorage.setItem("waitingMatchId", match._id);
                window.location.href = "editarPartida.html";
            });

            const deletar = document.createElement("span");
            deletar.classList.add("deletar");
            deletar.setAttribute("data-idwaiting", match._id);
            deletar.innerHTML = `<img src="../../assets/icon/deletar.svg" alt="Deletar" />`;
            deletar.addEventListener("click", () => {
                openDeleteModal(match._id, card);
            });

            const duplicar = document.createElement("span");
            duplicar.classList.add("duplicar");
            duplicar.textContent = "Duplicar";
            duplicar.addEventListener("click", () => {
                showDuplicateModal(match._id);
            });


            botoes.append(iniciar, editar, deletar, duplicar);
            card.append(conteudoCard, botoes);

            partidasContainer.appendChild(card);
        });
    }
}

let currentMatchId;

function showDuplicateModal(matchId) {
    currentMatchId = matchId;
    document.getElementById("duplicateModal").style.display = "flex";
}

const logoutButton = document.getElementById("logout");
logoutButton.addEventListener("click", function () {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
});

function closeDuplicateModal() {
    document.getElementById("duplicateModal").style.display = "none";
    document.getElementById("matchName").value = "";
}

function submitDuplicate() {
    const matchName = document.getElementById("matchName").value.trim();

    if (!matchName) {
        alert("Por favor, insira um nome para a partida duplicada.");
        return;
    }

    duplicateMatch(currentMatchId, matchName);
    closeDuplicateModal();
}

async function duplicateMatch(matchId, matchName) {
    const userId = localStorage.getItem("userId");
    console.log(
        `Duplicating match with ID: ${matchId}, User ID: ${userId}`
    );

    try {
        const response = await fetch(
            "https://quester-backend.onrender.com/waiting-match/duplicate",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    _id_waiting_match: matchId,
                    name: matchName,
                    _id: userId,
                }),
            }
        );

        if (!response.ok) {
            throw new Error("Erro ao duplicar a partida.");
        }

        const data = await response.json();
        fetchUserMatches();
    } catch (error) {
        console.error(error);
        alert("Ocorreu um erro ao duplicar a partida.");
    }
}
window.onclick = function (event) {
    const modal = document.getElementById("duplicateModal");
    if (event.target === modal) {
        closeDuplicateModal();
    }
};

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeDuplicateModal();
    }
});

function setMatchToDelete(userId, idWaitingMatch, cardElement) {
    matchToDelete = { userId, idWaitingMatch, cardElement };
}

function closeModal() {
    document.getElementById("duplicateModal").style.display = "none";
}

function openModal() {
    document.getElementById("duplicateModal").style.display = "flex";
}

window.onclick = function (event) {
    const modal = document.getElementById("duplicateModal");
    if (event.target === modal) {
        closeModal();
    }
};

function openDeleteModal(idWaitingMatch, cardElement) {
    const modal = document.getElementById("confirmDeleteModal");
    modal.style.display = "flex";
    matchToDelete = { userId, idWaitingMatch, cardElement };
}

function closeDeleteModal() {
    const modal = document.getElementById("confirmDeleteModal");
    modal.style.display = "none";
    matchToDelete = null;
}

async function deleteMatch() {
    if (!matchToDelete) {
        console.error("Nenhuma partida selecionada para deletar.");
        return;
    }

    const { userId, idWaitingMatch, cardElement } = matchToDelete;

    console.log(
        `Deletando a partida: User ID: ${userId}, Waiting Match ID: ${idWaitingMatch}`
    );

    try {
        const response = await fetch(
            `https://quester-backend.onrender.com/waiting-match/${userId}/${idWaitingMatch}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                }
            }
        );

        if (!response.ok) {
            throw new Error("Erro ao deletar a partida.");
        }

        const result = await response.json();
        if (result.status === "waiting match deleted") {
            cardElement.remove();
            closeDeleteModal();
        }
    } catch (error) {
        document.getElementById("mensagemErro").textContent =
            "Erro ao deletar a partida: " + error.message;
    }
}

document
    .querySelector(".cancelar")
    .addEventListener("click", closeDeleteModal);
document.querySelector(".excluir").addEventListener("click", deleteMatch);

document.addEventListener("DOMContentLoaded", fetchUserMatches);

document.addEventListener("DOMContentLoaded", async () => {
    const setphoto = await getPhoto(localStorage.getItem("userId"));
});

const getPhoto = async (idUSer) => {
    try {
        const response = await fetch(`https://quester-backend.onrender.com/profile-photo/${idUSer}`, {
            headers: { 'Content-Type': 'multipart/form-data', "Authorization": `Bearer ${token}`, },
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

const filtroSemestre = document.getElementById("filtroSemestre");
const pesquisarPartida = document.getElementById("pesquisarPartida");
const partidasContainer = document.getElementById("partidasContainer");
const semPartidasContainer = document.getElementById("semPartidas");

function filtrarPartidas() {

    if (!Array.isArray(partidas)) {
        console.error(
            "A variável 'partidas' não está definida ou não é um array."
        );
        return;
    }

    let partidasFiltradas = [...partidas];

    const semestreSelecionado = filtroSemestre.value;
    const filtroTitulo = pesquisarPartida.value.toLowerCase();

    if (filtroTitulo) {
        partidasFiltradas = partidasFiltradas.filter((partida) =>
            partida.name.toLowerCase().includes(filtroTitulo)
        );
    }

    if (semestreSelecionado) {
        partidasFiltradas = partidasFiltradas.filter(
            (partida) => partida.semester === semestreSelecionado
        );
    }

    if (filtroTitulo && partidasFiltradas.length === 0) {
        partidasContainer.innerHTML = "";
        semPartidasContainer.style.display = "none";
    } else {
        renderMatches(partidasFiltradas);
        semPartidasContainer.style.display =
            partidasFiltradas.length === 0 ? "block" : "none";
    }
}

filtroSemestre.addEventListener("change", filtrarPartidas);
pesquisarPartida.addEventListener("input", filtrarPartidas);

async function getWaitingMatchData(waitingMatchId) {
    try {
        const response = await fetch(
            `https://quester-backend.onrender.com/waiting-match/${waitingMatchId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error("Erro ao buscar dados da partida guardada.");
        }

        const waitingMatchData = await response.json();
        return waitingMatchData; // Retorna os dados da waitingMatch
    } catch (error) {
        console.error("Erro ao buscar dados da partida guardada:", error);
        throw error;
    }
}

async function startMatch() {
    const waitingMatchId = localStorage.getItem("waitingMatchId");

    if (!waitingMatchId) {
        console.error("ID da partida guardada não encontrado.");
        return;
    }

    try {
        const waitingMatchData = await getWaitingMatchData(waitingMatchId);;
        const response = await fetch("https://quester-backend.onrender.com/match", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                _id: localStorage.getItem("userId"),
                name: waitingMatchData.name,
                description: waitingMatchData.description,
                question_times: waitingMatchData.question_times,
                chat_availability: waitingMatchData.chat_availability,
                semester: waitingMatchData.semester,
                questions: waitingMatchData.questions.map((q) => q._id),
                _id_waiting_match: waitingMatchId,
            }),
        });
        if (response.ok) {
            const matchResult = await response.json();
            localStorage.setItem("matchId", matchResult.id_match);
            localStorage.setItem("matchRole", "HOST");
            window.location.href = "../pages/MatchScreen.html";
        }
    } catch (error) {
        console.error("Erro ao iniciar a partida:", error);
    }
}

function renderMatches(matches) {
    const partidasContainer = document.getElementById("partidasContainer");
    const semPartidasContainer = document.getElementById("semPartidas");

    partidasContainer.innerHTML = "";

    if (matches.length === 0) {
        semPartidasContainer.style.display = "block";
        partidasContainer.style.display = "none";
    } else {
        semPartidasContainer.style.display = "none";

        matches.forEach((match) => {
            const card = document.createElement("div");
            card.classList.add("card-partida-guardada");

            const conteudoCard = document.createElement("div");
            conteudoCard.classList.add("conteudo-card");
            conteudoCard.innerHTML = `
    <h3>${match.name}</h3>
    <span>${match.description}</span>
    <span>${match.data} - ${match.time}</span>
    <span>Tempo de questão: ${match.question_times} seg</span>
    <span>${match.questions.length} questões</span>
`;

            const botoes = document.createElement("div");
            botoes.classList.add("botoes");

            const iniciar = document.createElement("span");
            iniciar.classList.add("iniciar");
            iniciar.textContent = "Iniciar";
            iniciar.id = "iniciarPartida";

            iniciar.addEventListener("click", async () => {
                localStorage.setItem("waitingMatchId", match._id);
                await startMatch();
            });

            const editar = document.createElement("span");
            editar.classList.add("editar");
            editar.setAttribute("data-id", match._id);
            editar.textContent = "Editar";
            editar.addEventListener("click", () => {
                localStorage.setItem("waitingMatchId", match._id);
                window.location.href = "editarPartida.html";
            });

            const deletar = document.createElement("span");
            deletar.classList.add("deletar");
            deletar.setAttribute("data-idwaiting", match._id);
            deletar.innerHTML = `<img src="../../assets/icon/icon-delete.svg" alt="Deletar" />`;
            deletar.addEventListener("click", () => {
                openDeleteModal(match._id, card);
            });

            const duplicar = document.createElement("span");
            duplicar.classList.add("duplicar");
            duplicar.innerHTML = `<img src="../../assets/icon/bx_duplicate.svg" alt="Duplicar" />`;
            duplicar.addEventListener("click", () => {
                showDuplicateModal(match._id);
            });

            botoes.append(iniciar, editar, duplicar, deletar);
            card.append(conteudoCard, botoes);

            partidasContainer.appendChild(card);
        });
    }
}  