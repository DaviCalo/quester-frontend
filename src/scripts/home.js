document.addEventListener("DOMContentLoaded", async function () {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    await getPhoto(userId);

    if (userId && token) {
        try {
            const response = await fetch("https://quester-backend.onrender.com/user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ _id: userId }),
            });

            if (response.ok) {
                const userData = await response.json();
                document.getElementById("userName").textContent = `${userData.surname}`;
            } else {
                localStorage.clear()
                window.location.href = "../../index.html";
            }
        } catch (error) {
            console.error("Erro ao buscar informações do usuário:", error);
            localStorage.clear()
            window.location.href = "../../index.html";
        }
    } else {
        localStorage.clear()
        window.location.href = "../../index.html";
    }

    const logoutButton = document.getElementById("logout");
    logoutButton.addEventListener("click", function () {
        localStorage.removeItem("userId");
        localStorage.removeItem("occupation");
    });

    const buttonPin = document.getElementById("button-pin");
    buttonPin.addEventListener("click", async function () {
        console.error("Erro na requisição:");
        const pinInput = document.getElementById("pin");
        const pin = pinInput.value;

        if (!pin) {
            return;
        }

        try {
            const response = await fetch(`https://quester-backend.onrender.com/match/enter/${pin}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("matchId", data.id_match);
                localStorage.setItem("matchRole", "PLAYER");
                window.location.href = '../pages/MatchScreen.html';
            } else {
                console.error("Erro na requisição:", error);
                pinInput.style.border = "#ff0000 2px solid"
            }
        } catch (error) {
            console.error("Erro na requisição:", error.message);
            pinInput.style.border = "#ff0000 2px solid"
        }
    });
});

const getPhoto = async (idUSer) => {
    const token = localStorage.getItem("token");

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
        console.error('Erro na requisição:', error);
    }
}