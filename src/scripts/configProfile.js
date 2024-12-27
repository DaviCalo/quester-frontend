const iconButton = document.querySelector("#iconEye");
const typePass = document.querySelector("#password");
const deleteButton = document.querySelector(".delete-button");
const cancelButton = document.querySelector("#cancel-button");
const confirmButton = document.getElementById("configProfile");
const logoutButton = document.getElementById("logout-button");
const logoutButtonIcon = document.getElementById("logout");
const DeleteUserButton = document.getElementById("delete-user-button");
const profilerCircle = document.getElementById("profile-circle");
const inputImge = document.getElementById("imageUpload");

iconButton.addEventListener("click", olhoSenha);

function olhoSenha() {
  if (typePass.type === "password") {
    typePass.setAttribute("type", "text");
    iconButton.classList.replace("bi-eye-fill", "bi-eye-slash-fill");
  } else if (typePass.type === "text") {
    typePass.setAttribute("type", "password");
    iconButton.classList.replace("bi-eye-slash-fill", "bi-eye-fill");
  }
}

const userName = document.getElementById("surname");
const nameInput = document.getElementById("name");
const lastName = document.getElementById("lastname");
const email = document.getElementById("email");
const password = document.getElementById("password");

function setDataUser(surname, nameUser, lastNameUser, emailUser, passwordUser) {
  userName.value = surname;
  nameInput.value = nameUser;
  lastName.value = lastNameUser;
  email.value = emailUser;
  password.value = passwordUser;
}

document.addEventListener("DOMContentLoaded", async function () {
  const userId = localStorage.getItem("userId");
  const occupation = localStorage.getItem("occupation");

  if (!userId || !occupation) {
      localStorage.removeItem("userId");
      localStorage.removeItem("occupation");
      window.location.href = "../../index.html";
  }

  const setphoto = await getPhoto(userId); 

  try {
    const response = await fetch("http://localhost:3000/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ _id: userId }),
    });

    const data = await response.json();

    if (response.ok) {
      setDataUser(
        data.surname,
        data.name,
        data.last_name,
        data.email,
        data.password
      );
      console.log(data);
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
  }

    
  DeleteUserButton.addEventListener("click", async () => {
    try {
      const response = await fetch(`http://localhost:3000/user/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        localStorage.removeItem("userId");
        localStorage.removeItem("occupation");
        window.location.href = "../../index.html";
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  })
});

confirmButton.addEventListener("click", async (e) => {
  e.preventDefault();
  const userUpdate = {
    _id: localStorage.getItem("userId"),
    name: nameInput.value,
    last_name: lastName.value,
    surname: userName.value,
    email: email.value,
    password: password.value,
  };
  try {
    const response = await fetch("http://localhost:3000/user", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userUpdate),
    });
  } catch (error) {
    console.error("Erro na requisição:", error);
  }
});



const getPhoto = async (idUSer) => {    
  try {
      const response = await fetch(`http://localhost:3000/profile-photo/${idUSer}`, {
      headers: {'Content-Type': 'multipart/form-data',},
  });
      if (response.ok) {
          const blob = await response.blob();
          const imgURL = URL.createObjectURL(blob);
          const img = document.getElementById("profile-photo");
          img.src = imgURL;
          profilerCircle.src = imgURL;
      } else {
          console.error('Erro ao enviar o arquivo:', response.statusText);
      }
  } catch (error) {
      console.error('Erro na requisição:', error);
  }
}

logoutButtonIcon.addEventListener("click", function () {
  localStorage.removeItem("userId");
  localStorage.removeItem("occupation");
  window.location.href = "../../index.html";
});

profilerCircle.addEventListener("click", function (e) {
  e.preventDefault();
  inputImge.click();
});

inputImge.addEventListener("change", async function (e) {
  e.preventDefault();
  const formData = new FormData();
  formData.append('profile-photo', inputImge.files[0]);

  try {
      const response = await fetch(`http://localhost:3000/change-profile-photo/${localStorage.getItem("userId")}`, {
          method: 'PUT',
          body: formData,
      });
      if (response.ok) {
        const setphoto = await getPhoto(userId); 
      } else {
          console.error('Erro ao enviar o arquivo:', response.statusText);
      }
  } catch (error) {
      console.error('Erro na requisição:', error);
  }
});