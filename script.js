const app = document.querySelector(".weather-app");
const temp = document.querySelector(".temp");
const dateOutput = document.querySelector(".date");
const timeOutput = document.querySelector(".time");

const conditionOutput = document.querySelector(".condition");
const nameOutput = document.querySelector(".name");
const icon = document.querySelector(".icon");
const cloudOutput = document.querySelector(".cloud");
const humidityOutput = document.querySelector(".humidity");
const windOutput = document.querySelector(".wind");
const form = document.getElementById("locationInput");
const search = document.querySelector(".search");
const btn = document.querySelector(".submit");
const cities = document.querySelectorAll(".city");

let cityinput = "London"; // Default city

// Add click event to each city
cities.forEach((city) => {
    city.addEventListener("click", (e) => {
        cityinput = e.target.innerHTML;
        fetchweatherdata();
    });
});

// Add submit event to form
form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (search.value.length === 0) {
        alert("Please type in a city name.");
    } else {
        cityinput = search.value;
        fetchweatherdata();
        search.value = ""; // Clear input field
    }
});

// Function to fetch weather data from API
function fetchweatherdata() {
    const api_key = "86f15dafdd2927c33b706619954ac652";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityinput}&appid=${api_key}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {
            console.log(data)
            // Display temperature in Celsius
            temp.innerHTML = `${(data.main.temp - 273.15).toFixed(1)}&#176;C`;

            // Display weather condition
            conditionOutput.innerHTML = data.weather[0].main;

            // Display weather icon
            const iconCode = data.weather[0].icon;
            const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
            icon.src = iconUrl;
            icon.alt = data.weather[0].description;

            // Determine time of day based on sunrise and sunset times
            const sunriseTimestamp = data.sys.sunrise * 1000;
            const sunsetTimestamp = data.sys.sunset * 1000;
            const currentTimestamp = new Date().getTime();

            let timeofday = "day"; // Default to day
            if (currentTimestamp < sunriseTimestamp || currentTimestamp > sunsetTimestamp) {
                timeofday = "night";
            }

            // Set background image based on weather condition and time of day
            const code = data.weather[0].id;
            if (code == 800) {
                app.style.backgroundImage = `url(./images/${timeofday}/clear.jpg)`;
            } else if (code >= 801 && code <= 804) {
                app.style.backgroundImage = `url(./images/${timeofday}/cloudy.jpg)`;
            } else if (code >= 500 && code <= 504 || code == 511 || (code >= 520 && code <= 531)) {
                app.style.backgroundImage = `url(./images/${timeofday}/rain.jpg)`;
            } else if (code >= 600 && code <= 622 || code == 612 || code == 613 || code == 615 || code == 616) {
                app.style.backgroundImage = `url(./images/${timeofday}/snow.jpg)`;
            } else if (code >= 701 && code <= 781) {
                app.style.backgroundImage = `url(./images/mist.jpg)`;
            } else {
                app.style.backgroundImage = `url(./images/thunder.jpg)`;
            }

            // Display other weather information
            cloudOutput.innerHTML = `${data.clouds.all}%`;
            windOutput.innerHTML = `${data.wind.speed} Km/H`;
            humidityOutput.innerHTML = `${data.main.humidity}%`;

            // Get latitude and longitude from weather data
            const { lat, lon } = data.coord;

            // Fetch local time using TimeZoneDB API
            const timeZoneApiKey = "9W1SMD55NV52";
            const timeZoneUrl = `http://api.timezonedb.com/v2.1/get-time-zone?key=${timeZoneApiKey}&format=json&by=position&lat=${lat}&lng=${lon}`;

            fetch(timeZoneUrl)
                .then(response => response.json())
                .then(timeZoneData => {
                    console.log(timeZoneData)
                    const localTime = new Date(timeZoneData.formatted);
                    const hours = localTime.getHours();
                    const minutes = (localTime.getMinutes() < 10 ? '0' : '') + localTime.getMinutes();
                    const formattedTime = `${hours}:${minutes}`;

                    // Display date and time
                    dateOutput.innerHTML = `${dayoftheweek(localTime.getDay())} ${localTime.getDate()}, ${localTime.getMonth() + 1} ${localTime.getFullYear()}`;
                    timeOutput.innerHTML = formattedTime;
                })
                .catch(error => {
                    console.error('Error fetching time zone data:', error);
                });

            // Display city name
            nameOutput.innerHTML = data.name;

            // Show weather app container after data is loaded
            app.style.opacity = "1";
        })
        .catch(error => {
            if (error.message === 'City not found') {
                alert("City name not found. Please try again.");
            } else {
                alert("Could not fetch the weather data. Please try again later.");
            }
        });
}

// Function to get day of the week from a given date
function dayoftheweek(dayIndex) {
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return weekday[dayIndex];
}

// Call fetchweatherdata() initially with default city
fetchweatherdata();
