// Input field for products

let selectedIndex = -1;
let renderedResults = [];

searchInput.addEventListener("input", handleSearchInput);

function handleSearchInput() {
  const query = getSanitizedQuery(searchInput.value);
  clearResults();

  if (isQueryEmpty(query)) return hideResults();

  const filteredProfiles = getFilteredProfiles(query);

  if (filteredProfiles.length === 0) {
    hideResults();
    return;
  }

  renderResults(filteredProfiles);
  showResults();
}

function getSanitizedQuery(value) {
  return value.trim().toLowerCase();
}

function isQueryEmpty(query) {
  return query.length === 0;
}

function clearResults() {
  resultsContainer.innerHTML = "";
}

function hideResults() {
  resultsContainer.style.display = "none";
}

function showResults() {
  resultsContainer.style.display = "block";
}

function getFilteredProfiles(query) {
  return profile_descriptions
    .map((bez, i) => ({ bez, id: productIDs[i] }))
    .filter(p => p.bez.toLowerCase().includes(query));
}

function renderResults(profiles) {
  renderedResults = [];
  profiles.forEach((profile, index) => {
    const div = document.createElement("div");
    div.textContent = profile.bez;
    styleResultItem(div);
    addResultItemEvents(div, profile.id);
    resultsContainer.appendChild(div);
    renderedResults.push({ element: div, profile });
  });
  selectedIndex = -1;
}

searchInput.addEventListener("keydown", (e) => {
  if (!renderedResults.length) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    selectedIndex = (selectedIndex + 1) % renderedResults.length;
    updateActiveResult();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    selectedIndex = (selectedIndex - 1 + renderedResults.length) % renderedResults.length;
    updateActiveResult();
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < renderedResults.length) {
      const selectedProfile = renderedResults[selectedIndex].profile;
      addProfileRow(selectedProfile.id);
      searchInput.value = "";
      clearResults();
      hideResults();
    }
  } else if (e.key === "Escape") {
    hideResults();
  }
});

function clearResults() {
  resultsContainer.innerHTML = "";
  renderedResults = [];
  selectedIndex = -1;
}

function updateActiveResult() {
  renderedResults.forEach((item, i) => {
    item.element.style.backgroundColor = i === selectedIndex ? "#cce" : "white";
  });

  const active = renderedResults[selectedIndex];
  if (active) {
    active.element.scrollIntoView({ block: "nearest" });
  }
}

function renderProfileResult(profile) {
  const div = document.createElement("div");
  div.textContent = profile.bez;
  styleResultItem(div);
  addResultItemEvents(div, profile.id);
  resultsContainer.appendChild(div);
}

function styleResultItem(div) {
  div.style.padding = "5px";
  div.style.cursor = "pointer";
}

function addResultItemEvents(div, profileId) {
  div.addEventListener("mouseenter", () => div.style.backgroundColor = "#eef");
  div.addEventListener("mouseleave", () => div.style.backgroundColor = "white");

  div.addEventListener("click", () => {
    addProfileRow(profileId);
    searchInput.value = "";
    hideResults();
  });
}

// checks if added rows exists
document.addEventListener("DOMContentLoaded", () => {
  const firstSelect = getFirstProfileSelect();
  if (shouldPopulateSelect(firstSelect)) {
    populateProfileSelect(firstSelect);
  }
});

function getFirstProfileSelect() {
  return document.querySelector(".profile-select");
}

function shouldPopulateSelect(selectElement) {
  return selectElement && selectElement.options.length === 1;
}

function populateProfileSelect(selectElement) {
  const optionsHTML = profile_descriptions
    .map((bez, i) => `<option value="${productIDs[i]}">${bez}</option>`)
    .join("");
  selectElement.insertAdjacentHTML("beforeend", optionsHTML);
}

function fillProfileDropdowns() {
  const selects = getProfileSelectElements();
  selects.forEach(select => {
    resetDropdownOptions(select);
    addProfileOptions(select);
  });
}

function getProfileSelectElements() {
  return document.querySelectorAll(".profile-select");
}

function resetDropdownOptions(select) {
  select.innerHTML = '<option value="">-- Profil auswählen --</option>';
}

function addProfileOptions(select) {
  profile_descriptions.forEach((description, index) => {
    const option = createOption(productIDs[index], description);
    select.appendChild(option);
  });
}

function createOption(value) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = value;
  return option;
}


document.addEventListener("DOMContentLoaded", fillProfileDropdowns);