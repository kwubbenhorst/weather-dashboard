# weather-dashboard
A web app, leveraging the open weather map server-side api, that displays the current weather and five-day forecast for any searched city, with past searches being remembered. 

## Description

Frequent travelers want to see the weather outlook for multiple cities so they can plan their trips accordingly. This weather dashboard has a form input area where users can search for a city. Often there is more than one location with the same name (eg. Perth, Australia and Perth, Scotland). An added feature of this application is disambiguation. Otherwise, if only the first result returned by the api were used (eg. Perth, Austria), the app would be incapable of returning weather from secondary and tertiary locations with the same name (eg. one could never search for the weather in Perth, Scotland). Once the computer has ascertained which city a user intends, by means of a prompt, it displays the current and future weather conditions for that city. The city is also added to the list of previous searches. The current weather display area contains the city name, date, an icon representing the current weather conditions, current temperature, humidity and wind speed. Below the current weather display area is the five day forecast. A card with the date (from tomorrow to five days hence) displays each day's forecasted weather, represented as an icon, the wind speed, humidity, and temperature (the detailed forecast provided different temperature values at 3 hour intervals throughout each day, so I thought it would be better to take the temperature forecast for 3pm rather than, say, midnight). On page load the current weather for Guelph, Ontario, Canada will be displayed (it is the city where the client is based). When a new city is entered in the input field or a previously searched city's button is clicked, the dashboard will update to the current weather and five day forecast for that location. Another added feature is that the date, time and time zone will update to the current date and time at the time zone of the location being searched. The list of previously searched cities persist beyond one browser session and will be visible upon page load so long as the user is still using the same device. The history can also be cleared using the "clear" button (the final added feature). Thanks to the built-in capabilities of Bootstrap, the application has a responsive design. 

This application made use of the bootstrap framework for layout and styling as well as a CSS custom stylesheet and the jQuery library as well as vanilla JavaScript. The fonts, PoiretOne for headlines and GaramondEB for body text were added from the google fonts library. Geolocation and weather data (including the icons) were provided by OpenWeatherMap Api. Another API, timezonedb was used in conjunction with day js for formatting to develop the date/time/timezone string for the current weather display area. Fortunately the documentation at all these third-party, web-based and server-side apis was decent. Developing the request URL with the correct query parameters, parsing the data response and working with it to filter for the relevant information and getting it into renderable format is all detail-oriented work and time-consuming, but more or less straightforward when the documentation is good. There were a great many more difficult challenges encountered in the course of building out this application. The asynchronous nature of fetch requests were particularly challenging to account for in the flow of a complex script. I had to learn how to use promises to control traffic and make extensive use of the console to determine whether the data needed was correctly passed through from one function to another. "City" was a name that kept cropping up: prevCities, selectedCity, defaultCity, city... so I also had to learn about scope and shadowing to prevent my variables from being overwritten. Getting the previous searches list to render dynamically to the screen was one of the biggest challenges in programming. 

In the future I would like to add sunrise and sunset times at the searched location. When sightseeing in foreign locales it is often very useful to know when the touring day can begin in daylight, and when darkness will descend.

## Installation
N/A

## Usage
This web application is deployed and ready for use on the World Wide Web.  Please visit https://kwubbenhorst.github.io/weather-dashboard

The following screenshots provide a visual guide through the various features:

## Credits

Karla Wubbenhorst built out this application from scratch with the aid of component libraries such as bootstrap and googlefonts. JQuery syntax is mainly used for selectors and methods. Many methods had to be researched in the MDN or W3Schools documentation. The tutorial called Asynchronous JavaScript Course (Async/Await, Promises, Callbacks) by FreeCodeCamp.org on youtube was essential for gaining an understanding of promises. I also received debugging help from Spider Forrest on AskBCS and Armando Osario, my EdX bootcamp tutor. Without their help I doubt the previous histories list would be rendering even now.       

## License

Licensed under the MIT license






