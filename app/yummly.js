const request = require('request');


var INGREDIENT1 = "strawberry"
var INGREDIENT2 = "blueberry"
var key = "abe8fbf732dd7d47a7c26321652d126c"

request('http://api.yummly.com/v1/api/recipes?_app_id=90b7b4e2&_app_key='+key+'&requirePictures=true&allowedIngredient[]='+ INGREDIENT1 + '&allowedIngredient[]=' + INGREDIENT2, function (error, response, body) {
  console.log('error:', error); // Print the error if one occurred
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received



  // **** to be moved to front-end v
  //var obj = JSON.parse(body)
  //var matches = obj.matches
  //matches.forEach(function(element){
  //  console.log(Object.keys(element)[0])

  })




});
