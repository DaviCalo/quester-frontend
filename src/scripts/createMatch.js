document.addEventListener("DOMContentLoaded", async function () {
  const selecionaTipo = document.getElementById("tipoDePergunta");
  const card = document.getElementById("card");
  const OPEN = document.getElementById("OPEN");
  const alternativas = document.getElementById("alternativas");
  const pesquisaTagInput = document.getElementById("pesquisaTag");

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  if (!userId && !token) {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    window.location.href = "../../index.html";
    return;
  }

  loadQuestions();

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

  document.getElementById("criarQuestao").addEventListener("click", async () => {
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

      items = Array.from(alternativasInputs).map((input) => input.value.trim());

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

    try {
      const response = await fetch(
        "https://quester-backend.onrender.com/question",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(questionData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await loadQuestions();

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
      } else {
        alert(data.error || "Erro ao criar questão.");
      }
    } catch (err) {
      console.error("Erro ao criar questão:", err);
      alert("Erro ao criar questão.");
    }
  });

  const logoutButton = document.getElementById("logout");

  logoutButton.addEventListener("click", function () {
    localStorage.removeItem("userId");
    localStorage.removeItem("occupation");
  });

  const getPhoto = async (idUSer) => {
    const token = localStorage.getItem("token");

    if(!localStorage.getItem("profilePhoto")){
      
    }
    try {
      const response = await fetch(`https://quester-backend.onrender.com/profile-photo/${idUSer}`, {
        headers: {
          'Content-Type': 'multipart/form-data',
          "Authorization": `Bearer ${token}`,
        },
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
      console.error("Usuário não autenticado");
      console.error('Erro na requisição:', error);
    }
  }

  await getPhoto(userId);

  async function loadQuestions() {
    const userId = localStorage.getItem("userId");

    try {
      const response = await fetch(
        `https://quester-backend.onrender.com/question/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        const questoesMatch = document.getElementById("questoesMatch");
        questoesMatch.innerHTML = "";

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
            itemsHTML += `<p>Resposta: ${questao.correct_item}</p>`;
          }

          questionDiv.innerHTML = `
    <h3>${questao.question}</h3>
    ${itemsHTML}
    <div class="tags">
      <h4>Tags:</h4>
      <p>${questao.tags.join(", ")}</p>
    </div>
  `;

          questionDiv.prepend(label);
          questionDiv.prepend(checkbox);
          questoesMatch.appendChild(questionDiv);
        });
      } else {
        alert(`Erro ao carregar questões: ${data.error}`);
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro ao carregar questões.");
    }
  }

  document.getElementById("iniciar").addEventListener("click", async () => {
    const selectedQuestions = Array.from(
      document.querySelectorAll(".question-checkbox:checked")
    ).map((checkbox) => checkbox.value);

    const title = document
      .querySelector("input[placeholder='Título da partida']")
      .value.trim();
    const description = document
      .querySelector("input[placeholder='Descrição']")
      .value.trim();
    const semester = document.getElementById("semestre").value;
    const questionTime = document.getElementById("tempoPergunta").value;
    const chatAvailability = document.getElementById("toggle1").checked;
    const userId = localStorage.getItem("userId");

    if (
      !title ||
      !description ||
      !semester ||
      !questionTime ||
      selectedQuestions.length === 0
    ) {
      alert(
        "Por favor, preencha todos os campos e selecione pelo menos uma questão."
      );
      return;
    }

    const matchData = {
      _id: userId,
      name: title,
      description: description,
      semester: semester,
      question_times: questionTime,
      chat_availability: chatAvailability,
      questions: selectedQuestions,
    };

    try {
      const response = await fetch("https://quester-backend.onrender.com/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(matchData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("matchId", data.id_match);
        localStorage.setItem("matchRole", "HOST");
        //window.location.href = "../pages/MatchScreen.html";
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro ao criar a partida.");
    }
  });

  document.getElementById("guardar").addEventListener("click", async () => {
    const title = document
      .querySelector("input[placeholder='Título da partida']")
      .value.trim();
    const description = document
      .querySelector("input[placeholder='Descrição']")
      .value.trim();
    const semester = document.getElementById("semestre").value;
    const questionTime = document.getElementById("tempoPergunta").value;
    const chatAvailability = document.getElementById("toggle1").checked;
    const userId = localStorage.getItem("userId");

    const selectedQuestions = Array.from(
      document.querySelectorAll(".question-checkbox:checked")
    ).map((checkbox) => checkbox.value);

    if (
      !title ||
      !description ||
      !semester ||
      !questionTime ||
      selectedQuestions.length === 0
    ) {
      alert(
        "Por favor, preencha todos os campos e selecione pelo menos uma questão."
      );
      return;
    }

    const matchData = {
      _id: userId,
      name: title,
      description: description,
      semester: semester,
      question_times: questionTime,
      chat_availability: chatAvailability,
      questions: selectedQuestions,
    };

    try {
      const response = await fetch(
        "https://quester-backend.onrender.com/waiting-match",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(matchData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Partida guardada com sucesso!");
        //window.location.href = "./savedMatch.html";
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro ao guardar partida.");
    }
  });

  function filterQuestionsByTags(tags) {
    const questoesList = document.getElementById("questoesMatch");
    const allQuestions = questoesList.querySelectorAll(
      ".card-questao-aberta-feita, .card-questao-fechada-feita"
    );

    allQuestions.forEach((questionDiv) => {
      const questionTags = questionDiv
        .querySelector(".tags p")
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
});