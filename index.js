const filterContainer = document.querySelector(".filter-container");
const charactersCountElement = document.querySelector(
  "[data-count-characters]"
);
const locationsCountElement = document.querySelector("[data-count-locations]");
const episodesCountElement = document.querySelector("[data-count-episodes]");

const charactersURL = "https://rickandmortyapi.com/api/character/?page=1";
const character = "https://rickandmortyapi.com/api/character/";
const episodesURL = "https://rickandmortyapi.com/api/episode";
const locationsURL = "https://rickandmortyapi.com/api/location";

async function apiDataLoader(page = 1) {
  const characters = await axios.get(`${charactersURL}`);
  const episodes = await axios.get(`${episodesURL}/?page=${page}`);
  const locations = await axios.get(`${locationsURL}/?page=${page}`);

  return {
    characters: characters.data,
    episodes: episodes.data,
    locations: locations.data,
  };
}

function mountCard(id, image, name, status, species, location) {
  return `
  <div class="col-xl-4 col-md-6">
    <article 
      class="m-auto character-card" 
      data-bs-toggle="modal" 
      data-bs-target="#character-details-modal"
      onclick="getSingleCharacter(${id})"
    >
        <img class="character-image" src="${image}" alt="Character image">
        <div class="character-info">
            <div>
                <h2 class="user-select-none">${name}</h2>
                <h3 class="user-select-none mt-3"><span class="status ${status}"></span>${translateStatus(
    status
  )} - ${translateSpeciesName(species)}</h3>
            </div>
            <div class="last-location">
                <p class="user-select-none">Última localização conhecida:</p>
                <h3 class="user-select-none">${location.name}</h3>
            </div>
            
          </div>
    </article>
  </div>`;
}


function mountCardModal(id, image, name, gender, origin, status, species, location, episode) {
  return `
  <div class="container-fluid overflow-hidden">
    <article 
      class="m-auto row justify-content-center" 
      data-bs-toggle="modal" 
      data-bs-target="#character-details-modal"
      onclick="getSingleCharacter(${id})"
    >
        <img 
          style="max-width: 300px; max-height: 300px" 
          class="character-image p-0 rounded-circle img-fluid rotate-and-pulse-animation" 
          src="${image}"
          alt="Character image"
        >
        <div class="row justify-content-center text-white show-text-animation mt-3">
            <div class="text-center">
                <h2 class="user-select-none fs-4 fw-bold my-4 placeholder-wave">${name}</h2>
                
                <h3 class="user-select-none fs-6 placeholder-wave">
                  <span class="status ${status} placeholder-wave"></span>
                  ${translateStatus(status)} - <strong> ${translateSpeciesName(species)}</strong>
                </h3>
                <h3 class="user-select-none my-3 fs-6 placeholder-wave">Genero - <strong>${gender}</strong></h3>
                <h3 class="user-select-none my-3 fs-6 placeholder-wave">Origem - <strong>${origin['name']}</strong></h3>
            </div>
            <div class="text-center placeholder-wave">
                <p class="user-select-none mb-0">Última localização conhecida - <strong class="user-select-none text-light">${location.name}</strong></p>
            </div>
            <div class="text-center my-3 placeholder-wave">
                <p class="user-select-none mb-0">Visto a última vez em - <strong class="user-select-none text-light">${episode}</strong></p>
            </div>
          </div>
    </article>
  </div>`;
}

function getLoading() {
  return `<div class="d-flex align-items-center justify-content-center gap-2">
  <span class="spinner-grow spinner-grow-sm bg-primary" aria-hidden="true"></span>
  <span class="text-white" role="status">Buscando...</span>
  </div>`;
}

async function fetchLastSeenEpisode(episodes) {
  return await axios.get(episodes[episodes.length - 1]);
}

async function getSingleCharacter(id) {
  const response = await axios.get(character + `/${id}`);
  const { image, name, status, species, location, gender, origin, episode} = response.data;
  
  const episodeName = await fetchLastSeenEpisode(episode);
  modalContent.innerHTML = mountCardModal(
    id,
    image,
    name,
    gender,
    origin,
    status,
    species,
    location,
    episodeName.data.name
  );
}


function divideArray(originalArray) {
  const result = {
      1: [],
      2: [],
      3: [],
      4: [],
  };

  let currentIndex = 1;
  let currentSubarray = result[currentIndex];

  originalArray.forEach(item => {
      currentSubarray.push(item);

      if (currentSubarray.length === 6) {
          currentIndex++;
          currentSubarray = result[currentIndex] = [];
      }
  });

  return result;
}

var dividedObject = {}

function populateContainer(number = 1) {
  container.innerHTML = "";
  dividedObject[number].forEach(({ id, name, status, location, image, species }) => {
      container.innerHTML += mountCard(
        id,
        image,
        name,
        status,
        species,
        location
      );
    }
  );
  window.scrollTo(0, 0);
}

function renderSlides() {
  sectionsContainer.innerHTML = "";
  for (let i = 1; i <= 4 ; i++) {
    if(dividedObject[i].length > 0) {
      sectionsContainer.innerHTML += `<div class="form-check">
      <input class="form-check-input pointer" type="radio" name="flexRadioDefault" onclick="populateContainer(${i})" id="section${i}" 
      ${i === 1 ? 'checked' : ""}
      >
      <label class="form-check-label" for="section${i}"></label>
      </div>`
    }
  }
}

async function fetchCharactersByPage(url) {
  try {
    container.innerHTML = getLoading();

    const response = await axios.get(url);
    const characters = response.data.results;

    changePageContextData(
      response.data.info.pages,
      response.data.info.prev,
      response.data.info.next,
    );

    dividedObject = divideArray(characters);
    renderSlides();
    populateContainer();
    
  } catch (error) {
    renderError("Não foi possível encontrar os personagens!");
  }
}
fetchCharactersByPage(charactersURL);


function getCharactersByName(e) {
  const name = e.target.value;
  fetchCharactersByPage(
    `https://rickandmortyapi.com/api/character/?name=${name}`
  );
}

function changeSearchIcon(element, path) {
  element.setAttribute("src", path);
}

setFilterListener(getCharactersByName, changeSearchIcon);

async function getDataCount(data) {
  const res = await apiDataLoader();
  return res[data].info.count;
}

async function printApiEnpointsInfoAmount() {
  charactersCountElement.textContent = await getDataCount("characters");
  locationsCountElement.textContent = await getDataCount("locations");
  episodesCountElement.textContent = await getDataCount("episodes");
}
printApiEnpointsInfoAmount();
function createErrorContainer(message) {
  container.innerHTML = `<div id="errorContainer">
  <span>${message}</span> <i class="ph ph-smiley-sad"></i>
</div>`;
}

function renderError(message) {
  createErrorContainer(message);
}
filter.addEventListener('focus', () => {
  filterContainer.classList.add('focused');
}) 

filter.addEventListener('blur', () => {
  filterContainer.classList.remove('focused');
})

function setFilterListener(getCharactersByName, changeSearchIcon) {
  filter.addEventListener('keyup', e => {
    getCharactersByName(e)
    
    if(e.target.value) {
      changeSearchIcon(e.target.nextElementSibling, "./imagens/close.svg")
      e.target.nextElementSibling.style.cursor = "pointer"
      e.target.nextElementSibling.addEventListener('click', () => {
        e.target.value = "";
        location.reload();
      })
      return;
    } 
    changeSearchIcon(e.target.nextElementSibling, "./imagens/search.svg")
  }); 
}
let pageContext = {
  lastUrl: "",
  currentPage: 1,
  totalPages: 0,
  previousPage: null,
  nextPage: null,
  pagesToShow: [],
  setCurrentPage () {
    if(!this.previousPage) {
      this.currentPage = 1;
      return;
    }
    if(!this.nextPage) {
      this.currentPage = this.totalPages;
      return;
    } 

    const numberOfNextPage = Number(extractPageNumber(this.previousPage));
    this.currentPage = numberOfNextPage + 1;
  }
}

function extractPageNumber(url) {
    const pageRegex = /page=(\d+)/;
    const match = url.match(pageRegex);
    if(match) {
      return match[1];
    }
}

function changePageContextData(total, previous, next) {
  pageContext.totalPages = total;
  pageContext.previousPage = previous;
  pageContext.nextPage = next;
  pageContext.setCurrentPage();

  if(pageContext.nextPage) {
    pageContext.lastUrl = pageContext.nextPage 
  } else {
    pageContext.lastUrl = pageContext.previousPage
  }

  toogleStatusPageButton()
  populateAllPages();

  document.querySelector(".current-page").innerText = pageContext.currentPage;
}


function populateAllPages() {
  allPages.innerHTML = "";
  for (let i = 1; i <= pageContext.totalPages; i++) {
    allPages.innerHTML += `<li><button class="dropdown-item text-success" onclick="getSpecificPage(${i})">${i}</button></li>`
  }
}

function toogleStatusPageButton() {
  if(!pageContext.previousPage) {
    previousPageButton.classList.add('disabled');
  } else {
    previousPageButton.classList.remove('disabled');
  }
  if(!pageContext.nextPage) {
    nextPageButton.classList.add('disabled');
  } else {
    nextPageButton.classList.remove('disabled');
  }
}
function getPreviousPage(){
  if(pageContext.previousPage) {
    fetchCharactersByPage(pageContext.previousPage);
    window.scrollTo(0, 0);
    resetSections()
  }
}

function getNextPage(){
  if(pageContext.nextPage) {
    fetchCharactersByPage(pageContext.nextPage);
    window.scrollTo(0, 0);
    resetSections()
  }
}

function getSpecificPage(e) {
  const page = e;
  if(pageContext.lastUrl.includes("page")) {
    const lastPage = extractPageNumber(pageContext.lastUrl);
    const urlToGet = pageContext.lastUrl.replace(lastPage, page);
    fetchCharactersByPage(urlToGet);
    window.scrollTo(0, 0);
    return;
  }
}

function resetSections() {
  section1.checked = true;
}
function translateSpeciesName(species){

  const translatedSpecies = {
    "Human": "Humano",
    "Alien": "Alienígena",
    "Humanoid": "Humanóide",
    "Unknown": "Desconhecido",
    "Poopybutthole": "Sr. Poopybutthole",
    "Mythological Creature": "Criatura Mítica",
    "Animal": "Animal",
    "Robot": "Robô",
    "Cronenberg": "Cronenberg",
    "Disease": "Doença",
  };
  
  return translatedSpecies[species] || "Não Definido";
}

function translateStatus(status) {
  const translatedStatus = {
    "Alive": "Vivo",
    "Dead": "Morto",
    "unknown": "Desconhecido"
  }

  return translatedStatus[status] || "Não Definido";
}