var apiKeyOWM = "fba95e547d364b69bffed66389db1511";
var apiKeyTZDB = "AHLS5N3Z8DGK";
var currentDateTimeZone;

//This function will render everything to the display box for current weather at the top of the right hand column, including the date, time and timeZone at the specifiedCity   
function renderCurrentWeather(targetCity, currentDateTimeZone, currentWeatherIcon, currentTemp, currentWind, currentHumidity) {
    console.log(targetCity, currentDateTimeZone, currentWeatherIcon, currentTemp, currentWind, currentHumidity);
    $("#target-city").text(targetCity);
    $("#current-date-time-zone").text(currentDateTimeZone);
    $("#current-weather-icon").attr('src', 'https://openweathermap.org/img/wn/' + currentWeatherIcon + '.png');
    $("#current-temp").text(currentTemp);
    $("#current-wind").text(currentWind);
    $("#current-humidity").text(currentHumidity); 
    renderFiveDayForecast();
    };
  
  function renderFiveDayForecast(selectFiveDayArray) {
        console.log(selectFiveDayArray);
    
      // Iterate through the selectFiveDayArray and update the elements
      for (var i = 0; i < selectFiveDayArray.length; i++) {
        // Update the date
        $('.five-day-date').eq(i).text(selectFiveDayArray[i].dt_text);
    
        // Update the image source
        $('.five-day-img').eq(i).attr('src', 'https://openweathermap.org/img/wn/' + selectFiveDayArray[i].icon + '.png');
    
        // Update temperature
        $('.five-day-temp').eq(i).text(selectFiveDayArray[i].temp);
    
        // Update wind speed
        $('.five-day-wind').eq(i).text(selectFiveDayArray[i].speed);
    
        // Update humidity
        $('.five-day-humid').eq(i).text(selectFiveDayArray[i].humidity);
      }
    };

// Function in three parts to gather renderable data on i. currentDateTimeZone, ii. currentWeather and iii. fiveDayForecast for a specifiedCity using the coordinates from the specifiedCity data object
  // The specifiedCity data object is made available to this function on load for the default/home city of Guelph from the renderGuelph function.
  // Subsequently the specifiedCity date may come from a newly entered city via the disabmiguateCity function or from a click on a previously searched city via the renderPrevCities function.
  function getWeather(city) {
    console.log(city);

    // Declare variables to store the latitude and longitude for a specifiedCity, derived from the specifiedCity data object
    var lat = city[0].lat;
    var lon = city[0].lon;
    console.log(lat);

    //This first part of the getWeather function collects the renderable data for current date and time at the timezone location of the specifiedCity
    //Create the API URL using coordinate variables and my apiKey
  var currentDateTimeZoneURL = 'http://api.timezonedb.com/v2.1/get-time-zone?key=' + apiKeyTZDB + '&format=json&by=position&lat=' + lat + '&lng=' + lon;

  // Because I want to pass both the data I generate here in the first part of the getWeather function and the data I generate in the second part (see where second and third parts are specified in the comments below) into my renderCurrentWeather function as parameters, I need to create an array to store promises for both parts of the data retrieved.
  var promises = [];
      
  var promise1 = fetch(currentDateTimeZoneURL)
      .then(function(response) {
        return response.json(); // Parse the JSON response
      })
      .then(function(data) { // Extract the values from the JSON response
        console.log(data);
        
        var dateTimeFormatted = data.formatted;
        var zoneAbbreviation = data.abbreviation;
        console.log(dateTimeFormatted);
        console.log(zoneAbbreviation);
   
      var dateTime = dayjs(dateTimeFormatted); // Parse the date-time string using Day.js

      dateTimeFormatted = dateTime.format('MMMM DD, YYYY HH:mm:ss'); // Format the date in the Month DD, YYYY HH:mm:ss format

      // Split the dateTimeFormatted string into date and time parts
      var dateTimeParts = dateTimeFormatted.split(' ');
      console.log("dateTimeParts:", dateTimeParts);

      // Reconstruct the formatted date with a space between the date and time
      dateTimeFormatted = dateTimeParts[0] + ' ' + dateTimeParts[1] + ' '  + dateTimeParts[2] + '   ' + dateTimeParts[3];
    
      // Create the currentDateTimeZone string using the formatted date
      currentDateTimeZone = dateTimeFormatted + "  " + zoneAbbreviation;
      console.log(currentDateTimeZone);
      })
    
      .catch(function (error) {
        console.error("Error:", error);
      });

  promises.push(promise1);

      //This second part of the getWeather function collects the renderable data for current weather at the specifiedCity
      //Create the API URL using coordinate variables and my apiKey
      var currentWeatherURL =
      'https://api.openweathermap.org/data/2.5/weather?' + 'lat=' + lat + '&lon=' + lon + '&appid=' + apiKeyOWM + '&units=metric' + '&lang=en';
  
  var promise2 = fetch(currentWeatherURL)
      .then(function (response) {
        // Check if the response status is OK (200)
        if (response.status === 200) {
          // Parse the JSON response
          return response.json();
        } else {
          throw new Error('Failed to fetch data');
        }
      })
      .then(function (data) {
        // Extract the desired values from the JSON data
        var targetCity = data.name;
        var currentWeatherIcon = data.weather[0].icon;
        var currentTemp = data.main.temp;
        var currentWind = data.wind.speed;
        var currentHumidity = data.main.humidity;
  
        // Call the renderCurrentWeather function when both promises are resolved
  Promise.all(promises).then(function() {
      
    renderCurrentWeather(targetCity, currentDateTimeZone, currentWeatherIcon, currentTemp, currentWind, currentHumidity);
      });
    })
      .catch(function (error) {
        console.error('Error:', error);
      });
  
    //This third part of the getWeather function collects the renderable data for the fiveDayForecast at the specifiedCity
    //Create the API URL using coordinate variables and my apiKey
    var fiveDayForecastURL =
      'https://api.openweathermap.org/data/2.5/forecast?' + 'lat=' + lat + '&lon=' + lon + '&appid=' + apiKeyOWM + '&cnt=40' + '&units=metric' + '&lang=en';
  
      fetch(fiveDayForecastURL)
      .then(function (response) {
        // Check if the response status is OK (200)
        if (response.status === 200) {
          // Parse the JSON response
          return response.json();
        } else {
          throw new Error('Failed to fetch data');
        }
      })
      .then(function (data) {
        console.log(data);
        // Extracting every eighth object from the "list" array within the data to create fullFiveDayArray
        var fullFiveDayArray = [];
        for (var i = 5; i < data.list.length; i += 8) { //by making the index = 5 I am taking the weather forecasted for 3pm over the next 5 days.  If I had made it equal to zero I would get the weather forecast for midmight.
          fullFiveDayArray.push(data.list[i]);
        }
        console.log(fullFiveDayArray);
  
        // Creating selectFiveDayArray with required properties and reformatting the date
    var selectFiveDayArray = fullFiveDayArray.map(function (item) {
            var date = dayjs(item.dt_txt); //Extract the date-time string from the data, parse it with dayjs and store in the variable date
        return {
            dt_text: date.format('MMM DD, YYYY'), // Format the date in the MMM, DD, YYYY format and eliminate the timestamp
            icon: item.weather[0].icon,
            temp: item.main.temp,
            speed: item.wind.speed,
            humidity: item.main.humidity,
          };
        });
        console.log(selectFiveDayArray);

  
        // Call the renderFiveDayForecast function, passing in the data obtained from the fiveDayForecastURL
        renderFiveDayForecast(selectFiveDayArray);
      })
      .catch(function (error) {
        console.error('Error:', error);
      });
  }
   

// Function to disambiguate the city name
function disambiguateCity(cityName) { 
    // Create a fetch URL for disambiguating the city name
    var matchingCitiesURL = 'https://api.openweathermap.org/geo/1.0/direct?q=' + cityName + '&limit=7&appid=' + apiKeyOWM;
    
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
            return (index + 1) + ". " + city.name + ", " + city.state + ", " + city.country;
          }).join("\n"));

          // Handle the user's choice (assuming a valid option)
          selectedCity = data[parseInt(option) - 1];
          if (selectedCity) {
            console.log("You specified: " + selectedCity.name + ", " + selectedCity.state + ", " + selectedCity.country);
            console.log(selectedCity);
            // Save selectedCity to local storage
          localStorage.setItem("selectedCity", JSON.stringify(selectedCity));
         
          // Call getWeather after selectedCity is set
          getWeather(selectedCity);
          } else {
            console.log("Invalid option.");
          }
          
        } else if (data.length === 1) {
          // If there's only one match, use that city
          console.log("City disambiguated: " + data[0].name + ", " + data[0].state + ", " + data[0].country);
          var selectedCity = data[0];

        // Save selectedCity to local storage
        localStorage.setItem("selectedCity", JSON.stringify(selectedCity));

        // Call getWeather after selectedCity is set
        getWeather(selectedCity);

  } else {
    // No matching cities found
    console.log("No matching cities found.");
  }
  console.log(selectedCity);
  getWeather(selectedCity);
 
      })
      
      .catch(function (error) {
        // Handle fetch errors
        console.error("An error occurred: " + error.message);
      });
      
}          

$(document).ready(function () {
    $("#search").click(function(e) {
      e.preventDefault();
      var cityName = $("#input-city").val(); 
      // Call the disambiguateCity function to get the specifiedCityName
      disambiguateCity(cityName); 
      });

    // Event handler for previously entered cities
    $(".prev-city-btn").click(function (e) {
      e.preventDefault();
      var city = $(this).val();
      // Call the getWeather function with the specifiedCity 
      getWeather(city);
    });

  });
  
  function renderPrevCities() {
    // Get the previously entered cities from local storage
    var prevCities = JSON.parse(localStorage.getItem('selectedCity')) || [];
  
    // Ensure that prevCities is an array
    if (!Array.isArray(prevCities)) {
      prevCities = []; // If it's not an array, initialize it as an empty array
    }
  
    // Select the ul element to append the list of previous cities
    var prevCitiesList = $(".prev-cities-list ul");
  
    // Clear any existing items in the list
    prevCitiesList.empty();
  
    // Loop through the previous cities and create li and button elements
    prevCities.forEach(function (city, index) {
      var listItem = $("<li>");
      var button = $("<button>")
        .addClass("prev-city-btn")
        .attr("value", city.name)
        .text(city.name);
  
      listItem.append(button);
      prevCitiesList.append(listItem);
    });
  }


function renderGuelph() {
    // I am going to call the getWeather function from here, but I need first to get the data back from the api, 
    //so that the variable SpecifiedCity is not undefined when it is passed to the getWeather function.  I am handling that with a promise.
    var fetchGuelphDataPromise = new Promise(function (resolve, reject) {
        // Create a fetch URL for Guelph using the city name.  I will limit to one data object because I know Guelph, Ontario, CA is the first that comes back
        var getGuelphDataURL = 'https://api.openweathermap.org/geo/1.0/direct?q=Guelph&limit=1&appid=' + apiKeyOWM;
        // Send a fetch request 
        fetch(getGuelphDataURL)
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                // specifiedCity variable is set to Guelph's data
                specifiedCity = data;
                resolve(data); // Resolve the promise when fetch is complete
            })
            .catch(function (error) {
                reject(error); // Reject the promise if there's an error
            });
    });

    // Once the promise is resolved I will call the getWeather function
    fetchGuelphDataPromise
        .then(function () {
            getWeather(specifiedCity);
        })
        .catch(function (error) {
            // Handle fetch errors
            console.error("An error occurred: " + error.message);
        });
}
 
  function init() {
    renderGuelph();
    renderPrevCities();
      }
  
init();