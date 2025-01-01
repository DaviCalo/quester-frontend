const selecionaTipo = document.getElementById("tipoDePergunta");
const card = document.getElementById("card");
const OPEN = document.getElementById("OPEN");
const alternativas = document.getElementById("alternativas");

const token = localStorage.getItem("token");

selecionaTipo.addEventListener("change", function () {
    const tipoPergunta = selecionaTipo.value;

    if (tipoPergunta === "OPEN") {
        card.className = "card-questao-aberta";
        OPEN.style.display = "block";
        alternativas.style.display = "none";
    } else if (tipoPergunta === "CLOSE") {
        card.className = "card-questao-fechada";
        OPEN.style.display = "none";
        alternativas.style.display = "block";
    }
});

function validateSingleWord(input) {
    if (input.id === "inputOPEN") {
        const value = input.value;

        if (/\s/.test(value)) {
            input.value = value.replace(/\s/g, "");
            alert("Apenas uma palavra é permitida!");
        }
    }
}

document
    .getElementById("criarQuestao")
    .addEventListener("click", async () => {
        const tipoPergunta = selecionaTipo.value;
        const pergunta = document.getElementById("pergunta").value.trim();
        const tags = document
            .querySelector(".criar-tag")
            .value.split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag);

        let items = [];
        let correctItem = "";

        if (!pergunta) {
            alert("Por favor, preencha a pergunta.");
            return;
        }

        if (tipoPergunta === "CLOSE") {
            const alternativasInputs = document.querySelectorAll(
                ".alternativa input[type='text']"
            );
            const selectedAlternative = document.querySelector(
                ".alternativa input[type='radio']:checked"
            );

            items = Array.from(alternativasInputs).map((input, index) => {
                if (index < 4) {
                    console.log(input.value.trim())
                    return input.value.trim()
                }
            }
            );

            items.splice(4, 4);

            if (items.some((item) => !item)) {
                console.log(items);
                alert("Por favor, preencha todas as alternativas.");
                return;
            }

            correctItem = selectedAlternative
                ? selectedAlternative.parentNode
                    .querySelector('input[type="text"]')
                    .value.trim()
                : "";

            if (!correctItem) {
                alert("Por favor, selecione uma alternativa correta.");
                return;
            }
        } else {
            correctItem = document.querySelector(".resposta").value.trim();
            if (!correctItem) {
                alert("Por favor, preencha a resposta.");
                return;
            }
        }

        if (tags.length === 0) {
            alert("Por favor, preencha pelo menos uma tag.");
            return;
        }

        const userId = localStorage.getItem("userId");

        const questionData = {
            _id: userId,
            type: tipoPergunta,
            question: pergunta,
            item: items,
            correct_item: correctItem,
            tags: tags,
        };

        console.log(questionData);

        try {
            const response = await fetch("https://quester-backend.onrender.com/question", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(questionData),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Questão criada com sucesso!");

                // Limpar os campos após o envio
                document.getElementById("pergunta").value = "";
                document.querySelector(".criar-tag").value = "";

                if (tipoPergunta === "OPEN") {
                    document.querySelector(".resposta").value = "";
                } else {
                    const alternativasInputs = document.querySelectorAll(
                        ".alternativa input[type='text']"
                    );
                    alternativasInputs.forEach((input) => (input.value = ""));
                    const radios = document.querySelectorAll(
                        ".alternativa input[type='radio']"
                    );
                    radios.forEach((radio) => (radio.checked = false));
                }

                loadQuestions();
            } else {
                alert(`Erro: ${data.error}`);
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
            alert("Erro na requisição.");
        }
    });

document.addEventListener("DOMContentLoaded", async () => {
    loadQuestions();
    const setphoto = await getPhoto(localStorage.getItem("userId"));
});

async function loadQuestions() {
    const userId = localStorage.getItem("userId");

    try {
        const response = await fetch(
            `https://quester-backend.onrender.com/question/${userId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            }
        );

        const data = await response.json();

        if (response.ok) {
            const questoesList = document.getElementById("questoesList");
            questoesList.innerHTML = "";

            data.questions.forEach((questao) => {
                const questionDiv = document.createElement("div");

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.value = questao._id;
                checkbox.className = "question-checkbox";
                checkbox.id = `checkbox-${questao._id}`;

                const label = document.createElement("label");
                label.className = "checkbox-label";
                label.htmlFor = `checkbox-${questao._id}`;

                questionDiv.className =
                    questao.type === "CLOSE"
                        ? "card-questao-fechada-feita"
                        : "card-questao-aberta-feita";

                let itemsHTML = "";

                if (questao.type === "CLOSE") {
                    questao.item.forEach((item) => {
                        itemsHTML += `
                    <div class="alternativa">
                      <input type="radio" name="questao-${questao._id}" ${item === questao.correct_item ? "checked" : ""
                            } disabled />
                      <p>${item}</p>
                    </div>`;
                    });
                } else {
                    itemsHTML += `<p class="respostaPronta">${questao.correct_item}</p>`;
                }

                questionDiv.innerHTML = `
        <h3>${questao.question}</h3>
        ${itemsHTML}
        <div class="tags-questao-feita">
          <h4>Tags:</h4>
          <p>${questao.tags.join(", ")}</p>
        </div>
        <div class="used-matches">
          <h4>Usada em:</h4>
          <p>${questao.used_matches.length > 0
                        ? questao.used_matches.join(", ")
                        : "Não foi usada"
                    }</p>
        </div>
      `;

            questionDiv.prepend(label);
            questionDiv.prepend(checkbox);
            questoesList.prepend(questionDiv);
            });
        } else {
            alert(`Erro ao carregar questões: ${data.error}`);
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        alert("Erro ao carregar questões.");
    }
}

document
    .getElementById("excluirQuestao")
    .addEventListener("click", async () => {
        const checkboxes = document.querySelectorAll(
            ".question-checkbox:checked"
        );
        const userId = localStorage.getItem("userId");

        if (checkboxes.length === 0) {
            alert("Selecione pelo menos uma questão para excluir.");
            return;
        }

        const confirmDelete = confirm(
            "Tem certeza que deseja excluir as questões selecionadas?"
        );
        if (confirmDelete) {
            for (const checkbox of checkboxes) {
                const questionId = checkbox.value;

                try {
                    const response = await fetch(
                        `https://quester-backend.onrender.com/question/${userId}/${questionId}`,
                        {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`,
                            },
                        }
                    );

                    if (!response.ok) {
                        const data = await response.json();
                        alert(
                            `Erro ao excluir a questão com ID ${questionId}: ${data.error}`
                        );
                    }
                } catch (error) {
                    console.error("Erro na requisição:", error);
                    alert("Erro ao excluir questões.");
                }
            }
            alert("Questões excluídas com sucesso!");
            loadQuestions();
        }
    });

document
    .getElementById("duplicarQuestao")
    .addEventListener("click", async () => {
        const selectedCheckboxes = document.querySelectorAll(
            ".question-checkbox:checked"
        );

        if (selectedCheckboxes.length === 0) {
            alert("Por favor, selecione pelo menos uma questão para duplicar.");
            return;
        }

        const userId = localStorage.getItem("userId");

        for (const checkbox of selectedCheckboxes) {
            const questionId = checkbox.value;
            const requestData = {
                _id: userId,
                _id_question: questionId,
            };

            try {
                const response = await fetch(
                    "https://quester-backend.onrender.com/duplicate-question",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                        },
                        body: JSON.stringify(requestData),
                    }
                );

                const data = await response.json();

                if (response.ok) {
                    alert(`Questão duplicada com sucesso!`);
                } else {
                    alert(`Erro ao duplicar questão: ${data.error}`);
                }
            } catch (error) {
                console.error("Erro na requisição:", error);
                alert("Erro ao duplicar a questão.");
            }
        }

        loadQuestions();
    });

const pesquisaTagInput = document.getElementById("pesquisaTag");

function filterQuestionsByTags(tags) {
    const questoesList = document.getElementById("questoesList");
    const allQuestions = questoesList.querySelectorAll(
        ".card-questao-aberta-feita, .card-questao-fechada-feita"
    );

    allQuestions.forEach((questionDiv) => {
        console.log(questionDiv);
        const questionTags = questionDiv
            .querySelector(".tags-questao-feita p")
            .textContent.split(",")
            .map((tag) => tag.trim().toLowerCase())
            .filter((tag) => tag); 

        const hasAllTags = tags.every((tag) => questionTags.includes(tag));

        if (hasAllTags) {
            questionDiv.style.display = "block";
        } else {
            questionDiv.style.display = "none";
        }
    });
}

pesquisaTagInput.addEventListener("input", () => {
    const query = pesquisaTagInput.value.trim().toLowerCase();
    const tags = query
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag);

    if (tags.length === 0) {
        loadQuestions();
        return;
    }

    filterQuestionsByTags(tags);
});

const editIcon = document.getElementById("editarQuestao");

// Função para permitir apenas um checkbox selecionado
document.querySelectorAll(".question-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
        if (this.checked) {
            document
                .querySelectorAll(".question-checkbox")
                .forEach((otherCheckbox) => {
                    if (otherCheckbox !== this) {
                        otherCheckbox.checked = false;
                    }
                });
        }
    });
});


document.getElementById("editarQuestao").addEventListener("click", () => {
    const selectedCheckboxes = document.querySelectorAll(
        ".question-checkbox:checked"
    );

    if (selectedCheckboxes.length !== 1) {
        alert("Por favor, selecione apenas uma questão para editar.");
        return;
    }

    const questionId = selectedCheckboxes[0].value;

    fetchQuestionData(questionId);
});

async function fetchQuestionData(questionId) {
    try {
        const response = await fetch(
            `https://quester-backend.onrender.com/question/find/${questionId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            }
        );

        const questionData = await response.json();

        if (response.ok) {
            document.getElementById("editPergunta").value =
                questionData.question;
            document.getElementById("editTags").value =
                questionData.tags.join(", ");
            document.getElementById("editTipoPergunta").value =
                questionData.type;

            if (questionData.type === "OPEN") {
                document.getElementById("editOPEN").style.display = "block";
                document.getElementById("editAlternativas").style.display =
                    "none";
                document.getElementById("editResposta").value =
                    questionData.correct_item;
            } else {
                document.getElementById("editOPEN").style.display = "none";
                document.getElementById("editAlternativas").style.display =
                    "block";

                const alternativasInputs = document.querySelectorAll(
                    "#editAlternativas .alternativa input[type='text']"
                );
                questionData.item.forEach((item, index) => {
                    alternativasInputs[index].value = item;
                });

            
                const radios = document.querySelectorAll(
                    "#editAlternativas input[type='radio']"
                );
                questionData.item.forEach((item, index) => {
                    if (item === questionData.correct_item) {
                        radios[index].checked = true;
                    }
                });
            }

    
            document.getElementById("editQuestionModal").style.display =
                "block";
        } else {
            alert("Erro ao carregar os dados da questão.");
        }
    } catch (error) {
        console.error("Erro ao buscar os dados da questão:", error);
        alert("Erro ao buscar os dados da questão.");
    }
}

document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("editQuestionModal").style.display = "none";
});


window.addEventListener("click", function (event) {
    const editModal = document.getElementById("editQuestionModal");
    if (event.target === editModal) {
        editModal.style.display = "none";
    }
});

document
    .getElementById("saveEditButton")
    .addEventListener("click", async () => {
        const questionId = document.querySelector(
            ".question-checkbox:checked"
        ).value;
        const tipoPergunta =
            document.getElementById("editTipoPergunta").value;
        const pergunta = document.getElementById("editPergunta").value.trim();
        const tags = document
            .getElementById("editTags")
            .value.split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag);

        let items = [];
        let correctItem = "";

        if (!pergunta) {
            alert("Por favor, preencha a pergunta.");
            return;
        }

        if (tipoPergunta === "CLOSE") {
            const alternativasInputs = document.querySelectorAll(
                "#editAlternativas .alternativa input[type='text']"
            );
            const selectedAlternative = document.querySelector(
                "#editAlternativas .alternativa input[type='radio']:checked"
            );

            items = Array.from(alternativasInputs).map((input) =>
                input.value.trim()
            );

            if (items.some((item) => !item)) {
                alert("Por favor, preencha todas as alternativas.");
                return;
            }

            correctItem = selectedAlternative
                ? selectedAlternative.parentNode
                    .querySelector('input[type="text"]')
                    .value.trim()
                : "";

            if (!correctItem) {
                alert("Por favor, selecione uma alternativa correta.");
                return;
            }
        } else {
            correctItem = document.getElementById("editResposta").value.trim();
            if (!correctItem) {
                alert("Por favor, preencha a resposta.");
                return;
            }
        }

        if (tags.length === 0) {
            alert("Por favor, preencha pelo menos uma tag.");
            return;
        }

        const userId = localStorage.getItem("userId");

        const updatedQuestionData = {
            _id: userId,
            _id_question: questionId,
            type: tipoPergunta,
            question: pergunta,
            item: items,
            correct_item: correctItem,
            tags: tags,
        };

        console.log(updatedQuestionData);

        try {
            const response = await fetch("https://quester-backend.onrender.com/question", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(updatedQuestionData),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Questão editada com sucesso!");

                document.getElementById("editQuestionModal").style.display =
                    "none";

                loadQuestions();
            } else {
                alert(`Erro: ${data.error}`);
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
            alert("Erro ao salvar a edição da questão.");
        }
    });

const getPhoto = async (idUSer) => {
    try {
        const response = await fetch(`https://quester-backend.onrender.com/profile-photo/${idUSer}`, {
            headers: { 'Content-Type': 'multipart/form-data', "Authorization": `Bearer ${token}`, },
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