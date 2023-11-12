var apiKeyOWM = "fba95e547d364b69bffed66389db1511";
var apiKeyTZDB = "AHLS5N3Z8DGK";
var defaultCity = {name: 'Guelph', lat: 43.5460516, lon: -80.2493276};
var prevCities;

$(document).ready(function () {
    function init() {
    // Retrieve prevCitiesList from local storage
    prevCities = JSON.parse(localStorage.getItem("prevCities")) || [];
  
    // Render the prevCities list
    renderPrevCities();

    $("#search").click(function(e) {
        e.preventDefault();
        var cityName = $("#input-city").val(); 
        // Call the disambiguateCity function to get the specifiedCityName
        disambiguateCity(cityName); 
        });
  
    // Call getWeather for the default city (Guelph) to render current and 5-day weather
    getWeather(defaultCity);
  }
  
  // Call init on page load
  init();
  //Check what's in my prevCities array in local storage
  console.log(prevCities); 
});
  


  // Function to disambiguate the city name
  function disambiguateCity(cityName) {
    // Create a fetch URL for disambiguating the city name
    console.log(cityName);
    var matchingCitiesURL = "https://api.openweathermap.org/geo/1.0/direct?q=" + cityName +  "&limit=7&appid=" + apiKeyOWM;
  
    // Send a fetch request to disambiguate the city name
    fetch(matchingCitiesURL)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        var selectedCity;
        // Check if there are multiple options
        if (data.length > 1) {
          // Prompt the user to select an option
          var option = prompt("Please enter THE NUMBER of the city you want from the list below:\n\n" + data.map(function (city, index) {
                  return (index + 1 + ". " + city.name + ", " + city.state + ", " + city.country);
                }).join("\n")
          );
          // Handle the user's choice (assuming a valid option)
        selectedCity = data[parseInt(option) - 1];
        if (selectedCity) {
          console.log("You specified: " + selectedCity.name + ", " + selectedCity.state + ", " + selectedCity.country);
          console.log(selectedCity);
          // Save selectedCity to local storage
          localStorage.setItem("selectedCity", JSON.stringify(selectedCity));
          //call the saveCityToLocalStorage function
          saveCityToLocalStorage(selectedCity);
          // Call getWeather after selectedCity is set
          getWeather(selectedCity);
          // Render the previous cities after selecting and saving a city
          renderPrevCities();
        } else {
          console.log("Invalid option.");
        }
      } else if (data.length === 1) {
        // If there's only one match, use that city
        console.log("City disambiguated: " + data[0].name + ", " + data[0].state + ", " + data[0].country);
        selectedCity = data[0];
        // Save selectedCity to local storage
        localStorage.setItem("selectedCity", JSON.stringify(selectedCity));
        //call the saveCityToLocalStorage function
        saveCityToLocalStorage(selectedCity);
        // Call getWeather after selectedCity is set
        getWeather(selectedCity);
        // Render the previous cities after selecting and saving a city
        renderPrevCities();
      } else {
        // No matching cities found
        console.log("No matching cities found.");
      }
      console.log(selectedCity);
    })
    .catch(function (error) {
      // Handle fetch errors
      console.error("An error occurred: " + error.message);
    });
}

    // Event handler for previously entered cities
    $(document).on("click", ".prev-city-btn", function (e) { //event delegation because the buttons don't exist until they're dynamically generated
    e.preventDefault();
    var city = $(this).val();
    // Call the getWeather function with the specifiedCity
    getWeather(city);
    });

//Function that gets weather and dateTimeZone data from apis and formats it for rendering by the renderWeatherData and renderFiveDayForecast functions which it calls
function getWeather(selectedCity) {
    var lat = selectedCity.lat;
    var lon = selectedCity.lon;
  
    var currentWeatherURL = 'https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&appid=' + apiKeyOWM + '&units=metric' + '&lang=en';
    var fiveDayForecastURL = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon + '&appid=' + apiKeyOWM + '&cnt=40&units=metric&lang=en';
    var currentDateTimeZoneURL = 'http://api.timezonedb.com/v2.1/get-time-zone?key=' + apiKeyTZDB + '&format=json&by=position&lat=' + lat + '&lng=' + lon;
  
    Promise.all([
      fetch(currentWeatherURL).then(function (response) {
        return response.json();
      }),
      fetch(currentDateTimeZoneURL).then(function (response) {
        return response.json();
      })
    ]).then(function (responses) {
      var weatherResponse = responses[0];
      var timeZoneResponse = responses[1];
  
      var weatherData = {
        targetCity: weatherResponse.name,
        currentWeatherIcon: weatherResponse.weather[0].icon,
        currentTemp: weatherResponse.main.temp,
        currentWind: weatherResponse.wind.speed,
        currentHumidity: weatherResponse.main.humidity
      };
  
      var dateTimeFormatted = dayjs(timeZoneResponse.formatted)
        .format("MMMM DD, YYYY HH:mm:ss");
      var zoneAbbreviation = timeZoneResponse.abbreviation;
  
      var currentDateTimeZone = {
        dateTimeFormatted: dateTimeFormatted,
        zoneAbbreviation: zoneAbbreviation
      };
  
      renderWeatherData(selectedCity, currentDateTimeZone, weatherData);
  
      fetch(fiveDayForecastURL).then(function (response) {
        return response.json();
      }).then(function (fiveDayForecastResponse) {
        var fullFiveDayArray = fiveDayForecastResponse.list.filter(function (_, i) {
          return i % 8 === 5;
        });
  
        var selectFiveDayArray = fullFiveDayArray.map(function (item) {
          return {
            dt_text: dayjs(item.dt_txt).format("MMM DD, YYYY"),
            icon: item.weather[0].icon,
            temp: item.main.temp,
            speed: item.wind.speed,
            humidity: item.main.humidity
          };
        });
  
        renderFiveDayForecast(selectFiveDayArray);
      }).catch(function (error) {
        console.error('An error occurred during five day forecast:', error.message);
      });
  
    }).catch(function (error) {
      console.error('An error occurred during weather data retrieval:', error.message);
    });
  }
  
  
  function saveCityToLocalStorage(selectedCity) {
    // Retrieve prevCities from local storage or initialize an empty array
    prevCities = JSON.parse(localStorage.getItem("prevCities")) || [];
  
    // Check if the city is already in the list
    var existingCityIndex = prevCities.findIndex(function (city) {
      return city.name === selectedCity.name;
    });
  
    if (existingCityIndex === -1) {
      // If the city is not in the list, add it
      prevCities.push({
        name: selectedCity.name,
        state: selectedCity.state || "", // Use an empty string if state is undefined
        country: selectedCity.country,
        lat: selectedCity.lat,
        lon: selectedCity.lon,
      });
  
      // Save the updated list to local storage
      localStorage.setItem("prevCities", JSON.stringify(prevCities));
  
      // Render the updated list
      renderPrevCities(prevCities);
    }
  }
  

function renderPrevCities() {
    console.log("Rendering previous cities."); // Check if this line is reached
    
    // Select the ul element to append the list of previous cities
    var prevCitiesList = $("#prev-cities-list ul");
  
    // Clear any existing items in the list
    prevCitiesList.empty();
  
    // Loop through the previous cities and create li and button elements
    prevCities.forEach(function (city, index) {
        var listItem = $("<li>").addClass("prev-city-item"); // Add a specific class
        var button = $("<button>").addClass("prev-city-btn").attr("value", city.name).text(city.name + ", " + city.state + ", " + city.country);
        listItem.append(button);
        prevCitiesList.append(listItem);
    });
  }
  console.log("Finished rendering previous cities."); // Check if this line is reached



function renderWeatherData(selectedCity, currentDateTimeZone, weatherData) {
    renderCurrentWeather(
      selectedCity.name,
      currentDateTimeZone.dateTimeFormatted + ' ' + currentDateTimeZone.zoneAbbreviation,
      weatherData.currentWeatherIcon,
      weatherData.currentTemp,
      weatherData.currentWind,
      weatherData.currentHumidity
    );
  }

function renderCurrentWeather(targetCity, currentDateTimeZone, currentWeatherIcon, currentTemp, currentWind, currentHumidity) {
  $("#target-city").text(targetCity);
  $("#current-date-time-zone").text(currentDateTimeZone);
  $("#current-weather-icon").attr('src', 'https://openweathermap.org/img/wn/' + currentWeatherIcon + '.png');
  $("#current-temp").text(currentTemp);
  $("#current-wind").text(currentWind);
  $("#current-humidity").text(currentHumidity);
}


function renderFiveDayForecast(selectFiveDayArray) {
    console.log(selectFiveDayArray);
  
    // Iterate through the selectFiveDayArray and update the elements
    for (var i = 0; i < selectFiveDayArray.length; i++) {
      // Update the date
      $(".five-day-date").eq(i).text(selectFiveDayArray[i].dt_text);
  
      // Update the image source
      $(".five-day-img").eq(i).attr("src", "https://openweathermap.org/img/wn/" + selectFiveDayArray[i].icon + ".png");
  
      // Update temperature
      $(".five-day-temp").eq(i).text(selectFiveDayArray[i].temp);
  
      // Update wind speed
      $(".five-day-wind").eq(i).text(selectFiveDayArray[i].speed);
  
      // Update humidity
      $(".five-day-humid").eq(i).text(selectFiveDayArray[i].humidity);
    }
  }
