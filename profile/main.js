import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const db = getFirestore(app);

const clientsContainer = document.getElementById("clients-container");
const clientsCount = document.getElementById("clients-count");
const detailsPopover = document.getElementById("client-details-popover");
const detailName = document.getElementById("detail-client-name");
const detailMeasurements = document.getElementById("detail-measurements");
const detailDescription = document.getElementById("detail-description");
const editClientButton = document.getElementById("edit-client-details");
const deleteClientButton = document.getElementById("delete-client-details");
const saveBtn = document.getElementById("save-client-btn");
const searchInput = document.getElementById("client-search");
const toggleMoreBtn = document.getElementById("toggle-more");
const extraSizesDiv = document.getElementById("extra-sizes-div");
const addMenu = document.getElementById("add-menu");
const addClientButton = document.querySelector(".add-client");
const nameInput = document.getElementById("client-name");
const nameError = document.getElementById("name-error");

// ── Toast ──────────────────────────────────────────
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add("show"));
  });
  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, 3000);
}

let clientsData = [];
let searchText = "";
let activeClientId = null;
let isEditingClient = false;

const measurementFields = [
  { id: "phone",              key: "phone",            label: "Телефон" },
  { id: "height",             key: "height",           label: "Қад" },
  { id: "waist",              key: "waist",            label: "Камар" },
  { id: "bust",               key: "bust",             label: "Қафаси сина" },
  { id: "hips",               key: "hips",             label: "Бон (сурин)" },
  { id: "sh-width",           key: "shoulderWidth",    label: "Бари китф" },
  { id: "sh-length",          key: "shoulderLength",   label: "Дарозии китф" },
  { id: "back-width",         key: "backWidth",        label: "Бари пушт" },
  { id: "back-waist-length",  key: "backWaistLength",  label: "Дарозии пушт то камар" },
  { id: "neck-girth",         key: "neckGirth",        label: "Даври гардан" },
  { id: "sleeve-length",      key: "sleeveLength",     label: "Дарозии остин" },
  { id: "arm-girth",          key: "armGirth",         label: "Даври бозу" },
  { id: "wrist",              key: "wrist",            label: "Банди даст" },
  { id: "inseam",             key: "inseam",           label: "Дарозии пой (дарун)" },
  { id: "outseam",            key: "outseam",          label: "Дарозии пой (берун)" },
  { id: "thigh",              key: "thigh",            label: "Даври рон" },
  { id: "crotch-depth",       key: "crotchDepth",      label: "Чуқурии нишаст" },
  { id: "full-length",        key: "fullLength",       label: "Дарозии пурра" },
];

extraSizesDiv.style.display = "none";

toggleMoreBtn.addEventListener("click", () => {
  const isVisible = extraSizesDiv.style.display === "block";
  extraSizesDiv.style.display = isVisible ? "none" : "block";
  toggleMoreBtn.querySelector("span").textContent = isVisible ? "▽" : "△";
});

function resetAddForm() {
  nameInput.value = "";
  nameInput.classList.remove("input-error");
  nameError.classList.remove("visible");
  document.querySelectorAll(".measurement").forEach((input) => (input.value = ""));
  document.getElementById("description").value = "";
  extraSizesDiv.style.display = "none";
  toggleMoreBtn.querySelector("span").textContent = "▽";
  isEditingClient = false;
  activeClientId = null;
}

function lockBodyScroll() { document.body.style.overflow = "hidden"; }
function unlockBodyScroll() { document.body.style.overflow = ""; }

function showPopover(el) {
  if (typeof el.showPopover === "function") el.showPopover();
  else el.style.display = "block";
}

function hidePopover(el) {
  if (typeof el.hidePopover === "function") el.hidePopover();
  else el.style.display = "none";
}

function openAddMenu(client = null) {
  if (client) {
    document.getElementById("client-name").value = client.name || "";
    measurementFields.forEach(({ id, key }) => {
      document.getElementById(id).value = client.measurements?.[key] || "";
    });
    document.getElementById("description").value = client.description || "";
    extraSizesDiv.style.display = "block";
    toggleMoreBtn.querySelector("span").textContent = "△";
    isEditingClient = true;
    activeClientId = client.id;
  } else {
    resetAddForm();
  }
  showPopover(addMenu);
  lockBodyScroll();
}

function hideAddMenu() {
  hidePopover(addMenu);
  unlockBodyScroll();
}

function hideDetailsPopover() {
  detailsPopover.style.display = "none";
  hidePopover(detailsPopover);
  unlockBodyScroll();
}

document.addEventListener("mousedown", (event) => {
  const target = event.target;
  if (addMenu.style.display !== "none" && !target.closest(".add-client") && !addMenu.contains(target)) {
    hideAddMenu();
  }
  if (detailsPopover.style.display !== "none" && !detailsPopover.contains(target) && !target.closest(".client-card")) {
    hideDetailsPopover();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hideAddMenu();
    hideDetailsPopover();
  }
});

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "../auth.html";
    return;
  }

  const clientsRef = collection(db, "users", user.uid, "clients");
  const clientsQuery = query(clientsRef, orderBy("createdAt", "desc"));

  onSnapshot(clientsQuery, (snapshot) => {
    clientsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    renderClients(clientsData, searchText);
  });
});

searchInput?.addEventListener("input", (e) => {
  searchText = e.target.value.trim().toLowerCase();
  renderClients(clientsData, searchText);
});

addClientButton?.addEventListener("click", (e) => {
  e.stopPropagation();
  openAddMenu(null);
});

editClientButton.addEventListener("click", () => {
  const client = clientsData.find((item) => item.id === activeClientId);
  if (!client) return;
  hidePopover(detailsPopover);
  openAddMenu(client);
});

deleteClientButton.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user || !activeClientId) return;

  if (!confirm("Оё шумо мехоҳед ин муштариро нест кунед?")) return;

  try {
    await deleteDoc(doc(db, "users", user.uid, "clients", activeClientId));
    activeClientId = null;
    hidePopover(detailsPopover);
    showToast("Муштарӣ нест карда шуд.", "info");
  } catch (error) {
    console.error("Ошибка при удалении:", error);
    showToast("Хатогӣ ҳангоми нест кардан.", "error");
  }
});

function renderClients(clients, filter = "") {
  if (!clientsContainer) return;

  const filtered = filter
    ? clients.filter((c) => (c.name || "").toLowerCase().includes(filter))
    : clients;

  // Update counter
  if (clientsCount) {
    clientsCount.textContent = filtered.length > 0 ? `(${filtered.length})` : "";
  }

  if (filtered.length === 0) {
    clientsContainer.innerHTML = '<div class="empty-clients">Муштарӣ ёфт нашуд</div>';
    return;
  }

  clientsContainer.innerHTML = filtered
    .map(
      (client) => `
        <button type="button" class="client-card" data-id="${client.id}">
          <img src="../image/dress-photo.png" alt="Client photo" class="client-card-avatar">
          <div class="client-card-name">${client.name || "Без имени"}</div>
        </button>
      `
    )
    .join("");

  clientsContainer.querySelectorAll(".client-card").forEach((card) => {
    card.addEventListener("click", () => {
      const client = clientsData.find((item) => item.id === card.dataset.id);
      if (!client) return;

      activeClientId = client.id;
      detailName.textContent = client.name || "Без имени";
      detailMeasurements.innerHTML = measurementFields
        .map(({ key, label }) => `<div><strong>${label}</strong>: ${client.measurements?.[key] || "-"}</div>`)
        .join("");
      detailDescription.textContent = client.description || "";

      detailsPopover.style.display = "block";
      detailsPopover.style.zIndex = "1000";
      showPopover(detailsPopover);
      lockBodyScroll();
    });
  });
}

nameInput?.addEventListener("input", () => {
  if (nameInput.value.trim()) {
    nameInput.classList.remove("input-error");
    nameError.classList.remove("visible");
  }
});

saveBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    showToast("Шумо бояд ворид шавед!", "error");
    return;
  }

  // Validation
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.classList.add("input-error");
    nameError.classList.add("visible");
    nameInput.focus();
    return;
  }
  nameInput.classList.remove("input-error");
  nameError.classList.remove("visible");

  const measurements = {};
  measurementFields.forEach(({ id, key }) => {
    measurements[key] = document.getElementById(id).value;
  });

  const clientData = {
    name,
    measurements,
    description: document.getElementById("description").value,
    updatedAt: serverTimestamp(),
  };

  try {
    if (isEditingClient && activeClientId) {
      await updateDoc(doc(db, "users", user.uid, "clients", activeClientId), clientData);
      showToast("Муштарӣ бомуваффақият нав карда шуд!", "success");
    } else {
      await addDoc(collection(db, "users", user.uid, "clients"), {
        ...clientData,
        createdAt: serverTimestamp(),
      });
      showToast("Муштарӣ бомуваффақият сабт шуд!", "success");
    }
    hideAddMenu();
    resetAddForm();
  } catch (error) {
    console.error("Ошибка при сохранении:", error);
    showToast("Хатогӣ ҳангоми сабт кардан.", "error");
  }
});