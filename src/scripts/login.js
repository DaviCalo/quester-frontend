document.addEventListener("DOMContentLoaded", async function () {
    const userId = localStorage.getItem("userId");
    const occupation = localStorage.getItem("occupation");
    const token = localStorage.getItem("token");

    if (userId && occupation && token) {
        window.location.href = "./src/pages/home.html";
    }
});

document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("https://quester-backend.onrender.com/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            const userId = data._id;
            const token = data.token;

            localStorage.setItem("userId", userId);
            localStorage.setItem("token", token);

            window.location.href = "./src/pages/home.html";
        } else {
            document.getElementById("email-error").textContent = "Email ou senha invalido" || "Erro ao fazer login";
        }
    } catch (error) {
        console.error("Erro:", error);
        document.getElementById("email-error").textContent = "Erro ao fazer login";
    }
});