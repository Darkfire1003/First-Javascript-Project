let lastFormFocus = null;
let lastBrewFocus = null;

const burger = document.getElementById("burger");
const navBar = document.getElementById("navBar");
if (burger && navBar) {
  burger.addEventListener("click", function () {
    const isOpen = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", isOpen ? "false" : "true");
    burger.classList.toggle("is-active");
    navBar.classList.toggle("hidden");
  });
}

const toggleFormBtn = document.getElementById("toggleFormBtn");
const contactFormSection = document.getElementById("contactFormSection");
if (toggleFormBtn && contactFormSection) {
  toggleFormBtn.addEventListener("click", function () {
    const isHidden = contactFormSection.hidden;
    contactFormSection.hidden = !isHidden;
    contactFormSection.setAttribute("aria-hidden", isHidden ? "false" : "true");
    toggleFormBtn.setAttribute("aria-expanded", isHidden ? "true" : "false");
    if (isHidden) {
      contactFormSection.scrollIntoView({ behavior: "smooth" });
      const heading = document.getElementById("contact-heading");
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus();
      }
    }
  });
}

const contactForm = document.getElementById("contactForm");
if (contactForm) contactForm.addEventListener("submit", handleFormSubmit);

const resetBtn = document.getElementById("resetBtn");
if (resetBtn) resetBtn.addEventListener("click", resetForm);

const popupClose = document.getElementById("popupClose");
if (popupClose) popupClose.addEventListener("click", closeFormPopup);

const popupBrewClose = document.getElementById("popupBrewClose");
if (popupBrewClose) popupBrewClose.addEventListener("click", closeBrewPopup);

function validateForm() {
  let valid = true;

  const name = document.getElementById("inputName");
  const nameErr = document.getElementById("inputName-errorBox");
  if (!name.value.trim()) {
    showFieldError(name, nameErr);
    valid = false;
  } else hideFieldError(name, nameErr);

  const email = document.getElementById("inputEmail");
  const emailErr = document.getElementById("inputEmail-errorBox");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value.trim() || !emailRegex.test(email.value.trim())) {
    showFieldError(email, emailErr);
    valid = false;
  } else hideFieldError(email, emailErr);

  const privacy = document.getElementById("privacyCheck");
  const privacyErr = document.getElementById("privacyCheck-errorBox");
  if (!privacy.checked) {
    privacyErr.hidden = false;
    privacy.setAttribute("aria-invalid", "true");
    valid = false;
  } else {
    privacyErr.hidden = true;
    privacy.removeAttribute("aria-invalid");
  }

  return valid;
}

function showFieldError(input, errBox) {
  errBox.hidden = false;
  input.setAttribute("aria-invalid", "true");
  input.classList.add("border-red-400");
}

function hideFieldError(input, errBox) {
  errBox.hidden = true;
  input.removeAttribute("aria-invalid");
  input.classList.remove("border-red-400");
}

function handleFormSubmit(event) {
  event.preventDefault();

  const errBanner = document.getElementById("formErrors");
  const errBannerText = document.getElementById("formErrorsText");
  const okBanner = document.getElementById("formSuccess");
  errBanner.hidden = true;
  okBanner.hidden = true;

  const valid = validateForm();
  if (!valid) {
    errBannerText.textContent = "Bitte fülle alle Pflichtfelder korrekt aus.";
    errBanner.hidden = false;
    const firstInvalid = document.querySelector("[aria-invalid='true']");
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  const data = {
    name: document.getElementById("inputName").value.trim(),
    email: document.getElementById("inputEmail").value.trim(),
    subject: document.getElementById("inputSubject").value.trim() || "–",
    message: document.getElementById("inputMessage").value.trim() || "–",
    contactMethod:
      document.querySelector('input[name="contactMethod"]:checked').value ===
      "email"
        ? "Per E-Mail"
        : "Per Telefon",
  };

  openFormPopup(data);
}

function openFormPopup(data) {
  const popup = document.getElementById("formPopup");
  const content = document.getElementById("popup-content");

  content.innerHTML = `
    <dl class="divide-y divide-slate-100">
      <div class="flex flex-col py-2">
        <dt class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Name</dt>
        <dd class="text-slate-800 font-medium">${escapeHtml(data.name)}</dd>
      </div>
      <div class="flex flex-col py-2">
        <dt class="text-xs font-semibold text-slate-400 uppercase tracking-wide">E-Mail</dt>
        <dd class="text-slate-800 font-medium">${escapeHtml(data.email)}</dd>
      </div>
      <div class="flex flex-col py-2">
        <dt class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Betreff</dt>
        <dd class="text-slate-800 font-medium">${escapeHtml(data.subject)}</dd>
      </div>
      <div class="flex flex-col py-2">
        <dt class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Nachricht</dt>
        <dd class="text-slate-800 font-medium whitespace-pre-line">${escapeHtml(data.message)}</dd>
      </div>
      <div class="flex flex-col py-2">
        <dt class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Bevorzugter Kontaktweg</dt>
        <dd class="text-slate-800 font-medium">${escapeHtml(data.contactMethod)}</dd>
      </div>
    </dl>
  `;

  lastFormFocus = document.activeElement;
  popup.hidden = false;
  document.body.style.overflow = "hidden";
  popup.addEventListener("keydown", trapFormFocus);
  document.addEventListener("keydown", closeFormOnEscape);
  document.getElementById("popupClose").focus();
}

function closeFormPopup() {
  const popup = document.getElementById("formPopup");
  popup.hidden = true;
  document.body.style.overflow = "";
  popup.removeEventListener("keydown", trapFormFocus);
  document.removeEventListener("keydown", closeFormOnEscape);
  if (lastFormFocus) lastFormFocus.focus();

  resetForm();
  const okBanner = document.getElementById("formSuccess");
  const okBannerText = document.getElementById("formSuccessText");
  okBannerText.textContent =
    "Vielen Dank! Deine Nachricht wurde erfolgreich übermittelt.";
  okBanner.hidden = false;
}

function closeFormOnEscape(e) {
  if (e.key === "Escape") closeFormPopup();
}

function trapFormFocus(e) {
  if (e.key !== "Tab") return;
  const popup = document.getElementById("formPopup");
  const focusable = Array.from(
    popup.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function resetForm() {
  const form = document.getElementById("contactForm");
  if (form) form.reset();
  document.querySelectorAll(".error-box").forEach((el) => (el.hidden = true));
  const errBanner = document.getElementById("formErrors");
  if (errBanner) errBanner.hidden = true;
  document.querySelectorAll("[aria-invalid]").forEach((el) => {
    el.removeAttribute("aria-invalid");
    el.classList.remove("border-red-400");
  });
}
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// =======================
// THEME (Light / Dark)
// =======================
function setTheme(bg, color) {
  document.body.style.backgroundColor = bg;
  document.body.style.color = color;
}

function light() {
  setTheme("gray", "darkgray");
}

function dark() {
  setTheme("black", "gray");
}

// =======================
// FONT SIZE (alle h1)
// =======================
function setFontSizeAll(size) {
  document.querySelectorAll("h1").forEach((h1) => {
    h1.style.fontSize = size;
  });
}

function small() {
  setFontSizeAll("1rem");
}

function big() {
  setFontSizeAll("3rem");
}

// =======================
// RESET (alles zurücksetzen)
// =======================
function reset() {
  document.body.removeAttribute("style");

  document.querySelectorAll("h1").forEach((h1) => {
    h1.removeAttribute("style");
  });

  document.getElementById("output").textContent = "";
  document.getElementById("age").value = "";
  document.getElementById("firstName").value = "";
}

// =======================
// CHECK (Türsteher Logik)
// =======================
function check() {
  const ageValue = document.getElementById("age").value;
  const nameValue = document.getElementById("firstName").value;
  const output = document.getElementById("output");

  if (ageValue === "" || nameValue === "") {
    output.textContent = "Bitte gib Alter und Vorname ein!";
    return;
  }

  const age = Number(ageValue);
  const name = nameValue.trim().toLowerCase();

  if (name === "admin" && age >= 18) {
    output.textContent = "Willkommen Admin! Kostenloser Zutritt";
  } else if (age < 18) {
    output.textContent = "Du bist zu jung. Kein Zutritt!!!";
  } else {
    output.textContent = "Du darfst rein, bitte zahle 10€";
  }
}

// =======================
//     TO DO Liste
// =======================

/* Vorgelegete Einträge */

const toDo = ["Trainieren", "Lernen", "Schlafen", "Repeat"];
removeElement();

/* Der Liste hinzufügen (.pusch) */
function addTo() {
  const addList = document.getElementById("inputList").value;
  toDo.push(addList);
  renderList();
}

/* Liste Aktualisieren + entfernen Button (.join"" wichtig zwischenraum angabe) */
function renderList() {
  const listItems = toDo
    .map(
      (item, index) =>
        `<li>${item} <button onclick="removeElement(${index})">X</button></li>`,
    )
    .join("");

  document.getElementById("listItems").innerHTML = listItems;
}

/* Löschbefehl (1 wichtig das nur eine entfernt wird) */
function removeElement(index) {
  toDo.splice(index, 1);
  renderList();
}

// =======================
//     BMI Rechner
// =======================
let aufzeichnung = [];

/* Beziehen der Daten */
function bmiRechner() {
  let groesse = Number(document.getElementById("inputGroesse").value);
  let gewicht = Number(document.getElementById("inputGewicht").value);

  /* Umrechnen Größe */

  let groesseM = groesse / 100;
  let bmi = gewicht / (groesseM * groesseM);

  /* auf 2 Nachkommastellen runden */
  const bmiGerundet = parseFloat(bmi.toFixed(2));
  const kategorie = klasse(bmiGerundet);

  /* Ausgabe */
  const ergebnisText = `Ihr BMI ist: ${bmiGerundet}<br>${kategorie}`;
  document.getElementById("ergebnis").innerHTML = ergebnisText;
  aufzeichnung.push(`BMI: ${bmiGerundet} (${kategorie})`);

  document.getElementById("historie").innerHTML = aufzeichnung.join("<br>");
}

/* IF Kategorisierung */
function klasse(bmiGerundet) {
  if (bmiGerundet < 18.5) {
    document.getElementById("ergebnis").style.backgroundColor = "red";
    return "Untergewichtig";
  } else if (bmiGerundet >= 18.5 && bmiGerundet <= 24.9) {
    document.getElementById("ergebnis").style.backgroundColor = "green";
    return "Normalgewichtig";
  } else if (bmiGerundet >= 25 && bmiGerundet <= 29.9) {
    document.getElementById("ergebnis").style.backgroundColor = "orange";
    return "Übergewichtig";
  } else if (bmiGerundet >= 30 && bmiGerundet <= 34.9) {
    document.getElementById("ergebnis").style.backgroundColor = "red";
    return "Adipositas Grad I";
  }

  return "unbekannt";
}

// =======================
//     Namens Liste
// =======================

let persons = JSON.parse(localStorage.getItem("persons")) || [];
render();

/* Hinzufügen */
function addPerson() {
  const nameInput = document.getElementById("nameInput");
  const ageInput = document.getElementById("ageInput");

  const name = nameInput.value;
  const age = parseInt(ageInput.value);

  /* Klare aangabe */
  if (!name || name.length < 2) {
    alert("Name muss mindestens 2 Zeichen haben!");
    nameInput.focus();
    return;
  }
  if (isNaN(age) || age < 1 || age > 150) {
    alert("Alter muss eine Zahl zwischen 1 und 150 sein!");
    ageInput.focus();
    return;
  }
  persons.push({ name, age });
  saveToStorage();
  clearInputs();
  render();
}

function deletePerson() {
  const name = document.getElementById("nameInput").value.trim().toLowerCase();
  const ageValue = document.getElementById("ageInput").value.trim();

  if (!name) {
    alert("Name eingeben!");
    return;
  }

  const beforeCount = persons.length;

  /* Löschen der Personen */

  /* FALL 1: Alter angegeben → gezielt löschen */
  if (ageValue !== "") {
    const age = parseInt(ageValue);

    if (isNaN(age)) {
      alert("Alter ungültig!");
      return;
    }

    persons = persons.filter(
      (p) => !(p.name.toLowerCase() === name && p.age === age),
    );
  } else {
    /* FALL 2: kein Alter → alle Namen löschen */
    persons = persons.filter((p) => p.name.toLowerCase() !== name);
  }

  // ❗ nichts gefunden
  if (persons.length === beforeCount) {
    alert("Kein passender Eintrag gefunden!");
    return;
  }

  saveToStorage();
  clearInputs();
  render();
}

/* Liste rendern*/

function render() {
  const list = document.getElementById("addList");
  list.innerHTML = "";

  persons.forEach((p) => {
    const li = document.createElement("li");
    li.className = "py-2 border-b last:border-b-0";
    li.textContent = `${p.name}, ${p.age} Jahre`;
    list.appendChild(li);
  });
}

/* LocalStorage speichern */
function saveToStorage() {
  localStorage.setItem("persons", JSON.stringify(persons));
}

/*  */ /* Inputs leeren */
function clearInputs() {
  document.getElementById("nameInput").value = "";
  document.getElementById("ageInput").value = "";
}
