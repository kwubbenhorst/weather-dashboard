var apiKeyOWM = "fba95e547d364b69bffed66389db1511";
var apiKeyTZDB = "AHLS5N3Z8DGK";
var defaultCity = {name: 'Guelph', lat: 43.5460516, lon: -80.2493276}; //Hardcoded lat and lon values for the city that will display on page load
var prevCities; //Needs to be declared in global scope so that several functions can have access to it

//Ready function ensures that jQuery library is loaded before the program begins to run
$(document).ready(function () {
  //This function will fire when the "clear" button is clicked. It clears the element when the previous cities are rendered and resets prevCities in localStorage to an empty array
  function clearPrevCities() {
    $("#prev-cities-list").empty();
    localStorage.setItem("prevCities", JSON.stringify([]));
    renderPrevCities(); //Calls the function responsible for managing the list space
}

//This function initializes the application. 
function init() {
    //Retrieves prevCitiesList from local storage, or creates an empty prevCities array if there isn't anything there. (Important that something should be there or an error will be thrown when other functions try to getItem).
    prevCities = JSON.parse(localStorage.getItem("prevCities")) || [];
    //Calls the function that will render the prevCities list
    renderPrevCities();
    
    //Event listener on the search button. Its handler function will capture the value of the form input and call the disambiguateCity function to get the specifiedCity name needed for geolocation.
    $("#search").click(function (e) {
        e.preventDefault();
        var cityName = $("#input-city").val();
        disambiguateCity(cityName);
    });

    //Event listener on the clear button. Its handler function calls the clearPrevCities function defined above.
    $("#clear").click(function (e) {
        e.preventDefault();
        clearPrevCities();
    });

    //Calls getWeather function passing it the default city (Guelph) to render current and 5-day weather. Disambiguation and first fetch request to get geolocation can be bypassed in Guelph's case because its location is definitely known
    getWeather(defaultCity);
}

//Call function init on page load
init();
  //In debugging I had to track the prevCities variable throughout the program. This lets me check what's in my prevCities array in localStorage when the page loads
  console.log(prevCities); 
});
  

//Function to disambiguate the user inputted city name (eg. distinguish London England from London Ontario). Getting weather is by geolocation and the geolocation of London England is very different than London Ontario. "specifiedCity" is what will be derived within this function and passed to the getWeather function
function disambiguateCity(cityName) {
  //Check that the user inputted cityName has been correctly captured and passed through to this function
  console.log(cityName);
  //Develop the requestURL to OWM using the cityName variable
  var matchingCitiesURL = "https://api.openweathermap.org/geo/1.0/direct?q=" + cityName +  "&limit=7&appid=" + apiKeyOWM;
  
  //Send a fetch request to OWM. This endpoint returns a data object that includes city name, state, country, latitude and longitude. 
  fetch(matchingCitiesURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var selectedCity;
      //If the response returns data objects for more than one city, ask the user which location they meant
      if (data.length > 1) {
        //Prompt the user to enter a number corresponding to the index of the correct data object to use. Map is an iterative method, which will present the options, adjusting by adding one for zero indexed arrays. 
        var option = prompt("Please enter THE NUMBER of the city you want from the list below:\n\n" + data.map(function (city, index) {
                return (index + 1 + ". " + city.name + ", " + city.state + ", " + city.country);
              }).join("\n")
        );
        //Logic to handle the user's selected option IF a valid entry, ELSE console.log "Invalid option."
      selectedCity = data[parseInt(option) - 1]; //Adjusts back for zero indexing of arrays. 
      if (selectedCity) {
        console.log("You specified: " + selectedCity.name + ", " + selectedCity.state + ", " + selectedCity.country); //Let's me see what will be printed on the prev-cities-btn
        console.log(selectedCity); //Lets me see the whole data object, including lat and long for the user's chosen city
        //Saves selectedCity to local storage
        localStorage.setItem("selectedCity", JSON.stringify(selectedCity));
        //Calls the saveCityToLocalStorage function
        saveCityToLocalStorage(selectedCity);
        //Calls getWeather function after selectedCity is set, so the selectedCity can be passed to it
        getWeather(selectedCity);
        //Calls the function to renderPrevCities after selecting and saving a city
        renderPrevCities();
        } else {
        console.log("Invalid option.");
        }
      } else if (data.length === 1) {
        //Logic to handle the user's selected option if only one data object is returned. Prompt in this case is bypassed, and the one data object is simply used, but what is done with it is parallel to what is done in the if clause in cases of multiple returns
        console.log("City disambiguated: " + data[0].name + ", " + data[0].state + ", " + data[0].country);
        selectedCity = data[0]; //selectedCity value is updated to the one data object returned
        localStorage.setItem("selectedCity", JSON.stringify(selectedCity));
        saveCityToLocalStorage(selectedCity);
        getWeather(selectedCity);
        renderPrevCities();
      } else {
        console.log("No matching cities found.");
      }
      console.log(selectedCity); //Checks to make sure that a value for selectedCity is defined at the end of the conditional logic.
    })
    .catch(function (error) {
      //Handles any errors in the fetch request
      console.error("An error occurred: " + error.message);
    });
}

//Event listener for a click on any of the previously entered city buttons.
$(document).on("click", ".prev-city-btn", function (e) { //note the three params. Handler function uses event delegation because the buttons don't exist until they're dynamically generated
e.preventDefault();
var city = $(this).val(); //the listener is put on a whole class of buttons, but "this" is used to capture whatever is the specific value of the particular button clicked
console.log("Clicked city: " + city); //check that the value has been captured by the handler function 
//Calls the getWeather function with the city (this param is just called "city", not "selectedCity" (what the disambiguateCity function derives and passes to the getWeather function) to prevent shadowing. It will, however, be a specified city because an input does not get into the prevCities list unless it has been through disambiguation. "city" however, will be a string representing city name, state, country, as opposed to a complete data object including lat and lon. The string will have to be used to get the object at the start of getWeather for cities that are passed to it via this route)
getWeather(city);
});


//Function getWeather is called via three different routes in the program (init(defaultCity), disambiguateCity(selectedCity) and renderPrevCities) and the handler function for a click on a prev-city-btn(city)), and may be passed three different params accordingly. The logic will exploit the fact that these params are different data types (in the first two 2 cases an object, including lat and lon, and in 1 case a string without lat and lon) and where the param is recognized to be a string it will be used to get the data object for that city  

function getWeather(cityOrSelectedCity) {
  //Retrieves prevCities from local storage or initializes an empty array
  prevCities = JSON.parse(localStorage.getItem("prevCities")) || [];

  //Checks if the provided param (cityOrSelectedCity) is an object with lat and lon properties
  if (cityOrSelectedCity && typeof cityOrSelectedCity === 'object' && 'lat' in cityOrSelectedCity && 'lon' in cityOrSelectedCity) {
      //IF so it can be directly used (fetchWeatherData function is called and passed the data object as a param), ELSE (ie. if a string), iterate through the prevCities array using the find method to access the corresponding data object
      fetchWeatherData(cityOrSelectedCity);
  } else if (typeof cityOrSelectedCity === 'string') {
      //Use the 'name' property to find the matching city
      var selectedCity = prevCities.find(function (city) {
          return city.name === cityOrSelectedCity;
      });

      //If the selected city is found in the previous cities list
      if (selectedCity) {
          //Call the fetchWeatherData passing it this object as the selectedCity.
          fetchWeatherData(selectedCity);
      } else {
          console.error("Selected city not found in the previous cities list.");
      }
  } else {
      //If it's neither an object nor a string, log an error
      console.error("Invalid parameter passed to getWeather function.");
  }
}

//This function puts in three fetch requests to two different APIs. Current Weather and Five Day Forecast are obtained from Open Weather Map API, which requires lat and lon as query params. Time zone data is obtained from Time Zone DB API which also requires lat and lon.  The function also formats the data response 
function fetchWeatherData(selectedCity) {
  //Access the lat and lon properties of the selectedCity data object and store in variables. Use these variables to construct the requestURLs for the three fetch requests to the two APIs
  var lat = selectedCity.lat;
  var lon = selectedCity.lon;

    var currentWeatherURL = 'https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&appid=' + apiKeyOWM + '&units=metric' + '&lang=en';
    var fiveDayForecastURL = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon + '&appid=' + apiKeyOWM + '&cnt=40&units=metric&lang=en';
    var currentDateTimeZoneURL = 'https://api.timezonedb.com/v2.1/get-time-zone?key=' + apiKeyTZDB + '&format=json&by=position&lat=' + lat + '&lng=' + lon;

//Wrap the fetch request in promise.all so that asynchonous responses can be traffic-controlled. Calls to functions needing the data will proceed only once the data is available  
    Promise.all([
      //First fetch request for the currentWeather data
      fetch(currentWeatherURL).then(function (response) {
        return response.json();
      }),
      //Second fetch request for the date-time zone data
      fetch(currentDateTimeZoneURL).then(function (response) {
        return response.json();
      })
    ]).then(function (responses) {
      var weatherResponse = responses[0];
      var timeZoneResponse = responses[1];
  
      var weatherData = { //Extracts select data from the weatherResponse and formats it in a new data object for easy renderability
        targetCity: weatherResponse.name,
        currentWeatherIcon: weatherResponse.weather[0].icon,
        currentTemp: weatherResponse.main.temp,
        currentWind: weatherResponse.wind.speed,
        currentHumidity: weatherResponse.main.humidity
      };

      //Extracts select data from the timeZoneResponse and formats it (using dayjs), then extracts the timeZone abbreviation and stores in another variable. A new data object is created containing both the date-time value and the timezone abbreviation value for easy renderability 
      var dateTimeFormatted = dayjs(timeZoneResponse.formatted) 
        .format("MMMM DD, YYYY   HH:mm:ss");
      var zoneAbbreviation = timeZoneResponse.abbreviation; 
  
      var currentDateTimeZone = {
        dateTimeFormatted: dateTimeFormatted,
        zoneAbbreviation: zoneAbbreviation
      };

      //Calls the renderWeatherData function passing it three data objects. renderWeatherData is responsible for distilling from the three data objects a single set of arguments that can be passed into the renderCurrentWeather function when it calls it 
      renderWeatherData(selectedCity, currentDateTimeZone, weatherData);
  
      //Third fetch request (OWM) for the five day forecast
      fetch(fiveDayForecastURL).then(function (response) {
        return response.json();
      }).then(function (fiveDayForecastResponse) {
        //fiveDayForecastResponse is a forty item array that gives data objects containing icon, temp, speed, and humidity properties (among others) at three hour intervals over the next five days. Each 24 hour day has 8 times at which forecasted data is logged. The first log is at midnight, which means that the sixth (or the data object at the fifth index) is the forecast for 3pm. By iterating through the 40 item array, starting at index 5 (ie the forecast for 3pm tomorrow), I can take every 8th item to end up with 5 objects (the forecast data for each of the next 5 days at 3pm) 
        //The filter method is used to select specific items from the original array based on a condition (every 8th item starting from the 5th item).
        //The map method is then used to transform each selected item into a new object with specific properties extracted and formatted. The new objects are collected into a new array ('selectFiveDayArray'), which contains just the properties I am interested in rendering.
        // The filter function is passed two parameters: the current array item (currentItem) and its index (index). The condition checks if the index is an 8th item (starting from index 5)
        var fullFiveDayArray = fiveDayForecastResponse.list.filter(function (currentItem, index) {
          return index % 8 === 5;  //The return is these 8th items(starting from index 5 -- there will be five data objects in all because the original array length was 40). This return is stored in a new variable fullFiveDayArray. Although 4/5s of the fiveDayForecastResponse has been filtered out the array is still "full" because there is a lot of data in there we don't need to render
        });
       
        //The map method iterates through the array of five full data objects (exhaustive weather forecast info for the next five days at 3pm), and creates a new data object consisting just of the properties and values we want to render to the fiveDayForecast cards. This data object is stored in the variable selectFiveDayArray
        var selectFiveDayArray = fullFiveDayArray.map(function (item) {
          return {
            dt_text: dayjs(item.dt_txt).format("MMM DD, YYYY"),
            icon: item.weather[0].icon,
            temp: item.main.temp,
            speed: item.wind.speed,
            humidity: item.main.humidity
          };
        });
        //Calls the renderFiveDayForecast function, passing it the selectFiveDayArray
        renderFiveDayForecast(selectFiveDayArray);
      }).catch(function (error) {
        console.error('An error occurred during five day forecast:', error.message);
      });
  
    }).catch(function (error) {
      console.error('An error occurred during weather data retrieval:', error.message);
    });
  }
  
 //This function is called from the disambiguateCity function. It is responsible for updating the prevCities array with data objects for any non-redundant cities 
  function saveCityToLocalStorage(selectedCity) {
    //Retrieves prevCities from local storage or initialize an empty array
    prevCities = JSON.parse(localStorage.getItem("prevCities")) || [];
  
    //Checks if the city is already in the list. The findIndex method returns the index of the first element in the array that satisfies the provided testing function; otherwise, it returns -1 if no element is found.
    var existingCityIndex = prevCities.findIndex(function (city) {
      return city.name === selectedCity.name;
    });
  
    if (existingCityIndex === -1) {  
      //If the city is not in the list, adds it
      prevCities.push({
        name: selectedCity.name,
        state: selectedCity.state || "", //Uses an empty string if state is undefined
        country: selectedCity.country,
        lat: selectedCity.lat,
        lon: selectedCity.lon,
      });
  
      //Saves the updated list back into local storage
      localStorage.setItem("prevCities", JSON.stringify(prevCities));
  
      //Calls the renderPrevCities function with the updated list passed in. This will ensure that as soon as the user enters and disambiguates a new city, it will appear in the previous searches list
      renderPrevCities(prevCities);
    }
  }
  
//This function is responsible for rendering the prevCities list, found in local storage to the screen by dynamically generating these elements
  function renderPrevCities() {
    //Retrieve prevCitiesList from local storage
    prevCities = JSON.parse(localStorage.getItem("prevCities")) || [];
    console.log("Rendering previous cities."); //Check if this line is reached
  
    //Select the ul element to append the list of previously searched cities
    var prevCitiesList = $("#prev-cities-list");
  
    //Clear any existing items in the list
    prevCitiesList.empty();
  
    //Loop through the previous cities and create li and button elements
    prevCities.forEach(function (city, index) {
      var listItem = $("<li>").addClass("prev-city-item"); //Add a class name.
      //The click listener will be placed on this class of elements. the button appearance is styled using the other classes and text is given. The color class corresponds to an object of 10 yellow-orange gradient color values. Index % 10 is used to cycle through them 
      var button = $("<button>").addClass("prev-city-btn").addClass("color-" + (index % 10)).addClass("dynamic").attr("value", city.name).text(city.name + ", " + city.state + ", " + city.country);
      listItem.append(button);
      prevCitiesList.append(listItem);
    });
    console.log("Finished rendering previous cities."); // Check if this line is reached
  }
  
//This function takes in three data objects as arguments and calls renderCurrentWeather by passing them one set of renderable data extracted from the three objects)
function renderWeatherData(selectedCity, currentDateTimeZone, weatherData) {
    renderCurrentWeather(
      selectedCity.name,
      currentDateTimeZone.dateTimeFormatted + '  ' + currentDateTimeZone.zoneAbbreviation,
      weatherData.currentWeatherIcon,
      weatherData.currentTemp,
      weatherData.currentWind,
      weatherData.currentHumidity
    );
  }

//This function renders the currentWeather to the current weather display area in the dashboard
function renderCurrentWeather(targetCity, currentDateTimeZone, currentWeatherIcon, currentTemp, currentWind, currentHumidity) {
  $("#target-city").text(targetCity);
  $("#current-date-time-zone").text(currentDateTimeZone);
  $("#current-weather-icon").attr('src', 'https://openweathermap.org/img/wn/' + currentWeatherIcon + '.png');
  $("#current-temp").text(currentTemp);
  $("#current-wind").text(currentWind);
  $("#current-humidity").text(currentHumidity);
}

//This function renders the five day forecast data to the five day forecast cards in the dashboard
function renderFiveDayForecast(selectFiveDayArray) {
    console.log(selectFiveDayArray);
  
    //Iterates through the selectFiveDayArray and updates the elements for whatever new city has been chosen
    for (var i = 0; i < selectFiveDayArray.length; i++) {
      $(".five-day-date").eq(i).text(selectFiveDayArray[i].dt_text);
      $(".five-day-img").eq(i).attr("src", "https://openweathermap.org/img/wn/" + selectFiveDayArray[i].icon + ".png");
      $(".five-day-temp").eq(i).text(selectFiveDayArray[i].temp);
      $(".five-day-wind").eq(i).text(selectFiveDayArray[i].speed);
      $(".five-day-humid").eq(i).text(selectFiveDayArray[i].humidity);
    }
  }
