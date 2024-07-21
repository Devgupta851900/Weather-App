const userTab = document.querySelector("[userWeather]");
const searchTab = document.querySelector("[searchWeather]");

const weatherContainer = document.querySelector(".weatherConatiner");

const grantAccessContainer = document.querySelector(".grantLocation");
const grantAccessButton = document.querySelector(".grantAccessButton");

const searchForm = document.querySelector("[searchForm]");
const searchBar = document.querySelector("[searchBar]");
const searchButton = document.querySelector("[searchButton]");

const loadingScreen = document.querySelector(".loadingContainer");

const weatherInformation = document.querySelector(".weatherInformation");

const locationName = document.querySelector("[locationName]");
const locationFlag = document.querySelector("[locationFlag]");

const weatherDesc = document.querySelector("[weatherDesc]");
const weatherImage = document.querySelector("[weatherImage]");
const temperatureValue = document.querySelector("[temperatureValue]");

const windSpeed = document.querySelector("[windSpeed]");
const humidity = document.querySelector("[humidity]");
const clouds = document.querySelector("[clouds]");

const errorScreen = document.querySelector(".errorScreen");
const errorMessage = document.querySelector("[errorMessage]");

// Intial Conditions
let currentTab = userTab;
currentTab.classList.add("currentTab");
const API_key = "f5e9c06ecf7a3653a32e73bbca9daf54";

// Check if coordinates already present in session at the very beginning
getFromSessionStorage();

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

// To switch between Tabs

// this function take clicked tab as argument and replace it with the tab being currently displayed
function switchTab(clickedTab) {
	if (clickedTab != currentTab) {
		currentTab.classList.remove("currentTab");
		currentTab = clickedTab;
		currentTab.classList.add("currentTab");

		// Since we want to change between tabs we made visible one disappear and made invisible one appear
		if (!searchForm.classList.contains("active")) {
			weatherInformation.classList.remove("active");
			grantAccessContainer.classList.remove("active");
			searchForm.classList.add("active");
		} else {
			searchForm.classList.remove("active");
			weatherInformation.classList.remove("active");
			searchBar.value = "";

			// Here, user current location weather information will be displayed
			// it'll deplayed only if coordinates are present so we'll check for it in local storage.

			getFromSessionStorage();
		}
	}
}

userTab.addEventListener("click", () => {
	// calling switchTab() to switch current tab with tab we passed as argument
	switchTab(userTab);
});

searchTab.addEventListener("click", () => {
	switchTab(searchTab);
});

//
//
//
//
//
//
//
//
//
//
//
//
//

// if coordinates already present in session storage or not
function getFromSessionStorage() {
	const localCoordinates = sessionStorage.getItem("userCoordinates");

	// if coordinates are not present. then, we'll ask for them using grant access page
	if (!localCoordinates) {
		grantAccessContainer.classList.add("active");
	} else {
		// If coordinates are present then we'll use them.
		const coordinates = JSON.parse(localCoordinates);
		fetchUserWeatherInfo(coordinates);
	}
}

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

// to get location access and store coordinates in session strorage

grantAccessButton.addEventListener("click", () => {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				const userCoordinates = {
					lat: position.coords.latitude,
					log: position.coords.longitude,
				};
				sessionStorage.setItem(
					"userCoordinates",
					JSON.stringify(userCoordinates)
				);
				fetchUserWeatherInfo(userCoordinates);
			},
			{
				enableHighAccuracy: true,
			}
		);
	} else {
		errorScreen.classList.add("active");
		errorMessage.innerText = "Unable to get User Current Location";
	}
});

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

async function fetchUserWeatherInfo(coordinates) {
	const { lat, log } = coordinates;

	// make grant location container invisible first
	grantAccessContainer.classList.remove("active");

	// make loading page visible
	loadingScreen.classList.add("active");

	// API call
	try {
		let result = await fetch(
			`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${log}&appid=${API_key}&units=metric`
		);

		// if API throw 404 we'll need to explicitely catch the error
		if (!result.ok) {
			throw new Error("");
		}

		const data = await result.json();

		loadingScreen.classList.remove("active");
		weatherInformation.classList.add("active");

		// To dynamically add data to page
		renderWeatherInformation(data);
	} catch (error) {
		loadingScreen.classList.remove("active");
		errorScreen.classList.add("active");
		errorMessage.innerText = error.message;
	}
}

//
//
//
//
//
//
//
//
//
//
//
//
//

// Dynamically render data to webpage

function renderWeatherInformation(data) {
	locationName.innerText = data?.name;
	locationFlag.src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;
	weatherDesc.innerText = data?.weather?.[0]?.description;
	weatherImage.src = `https://openweathermap.org/img/wn/${data?.weather?.[0]?.icon}.png`;
	temperatureValue.innerText = data?.main?.temp + "℃";
	windSpeed.innerText = `${data?.wind?.speed}m/s`;
	humidity.innerHTML = `${data?.main?.humidity}%`;
	clouds.innerText = data?.clouds?.all;
}

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

// Search Form

searchForm.addEventListener("submit", (e) => {
	e.preventDefault();

	if (searchBar.value === "") return;

	fetchSearchWeatherInfo(searchBar.value);
});

async function fetchSearchWeatherInfo(city) {
	loadingScreen.classList.add("active");
	weatherInformation.classList.remove("active");
	grantAccessContainer.classList.remove("active");

	try {
		let result = await fetch(
			`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}&units=metric`
		);

		// if API throw 404 we'll need to explicitely catch the error
		if (!result.ok) {
			throw new Error("");
		}

		const data = await result.json();
		loadingScreen.classList.remove("active");
		weatherInformation.classList.add("active");
		errorScreen.classList.remove("active");

		renderWeatherInformation(data);
	} catch (e) {
		loadingScreen.classList.remove("active");
		errorScreen.classList.add("active");
		errorMessage.innerText = "City doesn't Exist";
	}
}
