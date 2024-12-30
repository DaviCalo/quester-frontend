document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registerForm");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const nomeInput = document.getElementById("nome");
        const sobrenomeInput = document.getElementById("sobrenome");
        const errorElement = document.getElementById("nome-sobrenome-error");
        let isValid = true;
        const pattern = /^[a-zA-Z\s]+$/;

        if (
            nomeInput.value.length < 2 ||
            !pattern.test(nomeInput.value) ||
            sobrenomeInput.value.length < 2 ||
            !pattern.test(sobrenomeInput.value)
        ) {
            errorElement.textContent =
                "Nome e Sobrenome devem ter pelo menos 2 caracteres e conter apenas letras.";
            isValid = false;
        } else {
            errorElement.textContent = "";
        }

        const userInput = document.getElementById("user");
        const userError = document.getElementById("user-error");
        if (userInput.value.length < 2) {
            userError.textContent = "Usuário deve ter pelo menos 2 caracteres.";
            isValid = false;
        } else {
            userError.textContent = "";
        }


        const emailInput = document.getElementById("email");
        const emailError = document.getElementById("email-error");
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(emailInput.value)) {
            emailError.textContent =
                'Por favor, insira um e-mail válido.';
            isValid = false;
        } else {
            emailError.textContent = "";
        }

       
        const passwordInput = document.getElementById("password");
        const passwordError = document.getElementById("password-error");
        if (passwordInput.value.length < 8) {
            passwordError.textContent =
                "Senha deve ter pelo menos 8 caracteres.";
            isValid = false;
        } else {
            passwordError.textContent = "";
        }

        if (!isValid) {
            return;
        }
 

        const userData = {
            name: nomeInput.value,
            last_name: sobrenomeInput.value,
            surname: userInput.value,
            email: emailInput.value,
            password: passwordInput.value,
        };

        try {
            const response = await fetch("https://quester-backend.onrender.com/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            const messageDiv = document.getElementById("message");

            if (response.ok) {
                localStorage.setItem("userId", data._id);
                localStorage.setItem("token", data.token);

                window.location.href = "../pages/home.html";
            } else if (response.status === 409) {
                messageDiv.textContent = "Email já registrado.";
                messageDiv.style.color = "red";
            } else {
                messageDiv.textContent = "Erro: " + data.error;
                messageDiv.style.color = "red";
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
            const messageDiv = document.getElementById("message");
            messageDiv.textContent = "Erro na requisição.";
            messageDiv.style.color = "red";
        }
    });
});