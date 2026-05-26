import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBQigoiucV2HtWdzG-HDsSVJ-mvMsDvC4g",
  authDomain: "tailorbase-bd0a6.firebaseapp.com",
  projectId: "tailorbase-bd0a6",
  storageBucket: "tailorbase-bd0a6.firebasestorage.app",
  messagingSenderId: "457834537708",
  appId: "1:457834537708:web:cd83333948f731a87c7bc9",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.querySelector(".logout")?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "../auth.html";
  } catch (error) {
    alert("Не удалось выйти. Попробуйте ещё раз.");
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("user-name").innerText = user.displayName;
  } else {
    window.location.href = "../auth.html";
  }
});
