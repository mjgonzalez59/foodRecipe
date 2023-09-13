const mealsElements = document.getElementById("meals");
const favoriteContainer = document.getElementById("favorite-meals");
const mealPopupContainer = document.getElementById("popup-meal");
const mealInfoElement = document.getElementById("meal-info");
const popupCloseBtn = document.getElementById("popup-close");
const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search-btn");

async function getRandomMeal(){
  const response = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
  const responseData = await response.json();
  try{
    const randomMeal = responseData.meals[0];

    addMeal(randomMeal, true);
  }catch(error){
    console.error(error);
  }
}

async function fetchFavoritedMeals(){
  //Clean container
  favoriteContainer.innerHTML = "";

  const mealsIds = getMealsFavoriteList();

  for(let i = 0; i < mealsIds.length; i++){
    const mealId = mealsIds[i];
    meal = await getMealById(mealId);
    addMealFav(meal);
  }
};

function addMealFav(mealData){
  const favMeal = document.createElement("li");
  favMeal.innerHTML = `
    <img 
      src="${mealData.strMealThumb}" 
      alt="${mealData.strMeal}"
    />
    <span>${mealData.strMeal}</span>
    <button class="clear"><i class="fas fa-window-close"></i></button>
  `;

  const clearBtn = favMeal.querySelector(".clear");
  clearBtn.addEventListener("click", () => {
    removeMealFavoriteList(mealData.idMeal);
    fetchFavoritedMeals();
  });

  favMeal.addEventListener("click", () => {
    showMealInformation(mealData);
  });

  favoriteContainer.appendChild(favMeal);
}

function addMeal(mealData, random = false){
  const meal = document.createElement("div");
  meal.classList.add("meal");
  meal.innerHTML = `
  <div class="meal-header">
    ${random ? `<span class="random">Random Recipe</span>` : ""}
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
  </div>
  <div class="meal-body">
    <h4>${mealData.strMeal}</h4>
    <button class="favorite-btn">
      <i class="fa-regular fa-heart"></i>
    </button>
  </div>
  `;

  const btn = meal.querySelector(".meal-body .favorite-btn");
  btn.addEventListener("click", () => {
    if(btn.classList.contains("active")){
      removeMealFavoriteList(mealData.idMeal);
      btn.classList.remove("active");
    }else{
      addMealFavoriteList(mealData.idMeal);
      btn.classList.add("active");
    }
    fetchFavoritedMeals();
  });

  meal.addEventListener("click", () => {
    showMealInformation(mealData);
  });

  mealsElements.appendChild(meal);
}

function removeMealFavoriteList(mealId){
  const mealsIds = getMealsFavoriteList();
  const mealsIdsFiltered = mealsIds.filter( (id) => id !== mealId );
  localStorage.setItem("mealsIds", JSON.stringify(mealsIdsFiltered));
}

function addMealFavoriteList(mealId){
  const mealsIds = getMealsFavoriteList();
  localStorage.setItem("mealsIds", JSON.stringify([...mealsIds, mealId]));
}

function getMealsFavoriteList(){
  let mealsIds = localStorage.getItem("mealsIds");
  if(!mealsIds){
    localStorage.setItem("mealsIds", []);
  }else{
    mealsIds = JSON.parse(mealsIds);
  }
  return mealsIds;
}

function showMealInformation(mealData){
  mealInfoElement.innerHTML = "";

  //Update the Meal Information
  const mealElement = document.createElement("div");
  const ingredients = [];
  for(let i = 1; i <= 20; i++){
    if(mealData[`strIngredient${i}`]){
      ingredients.push(`${mealData[`strIngredient${i}`]} - ${mealData[`strMeasure${i}`]}`);
    }else{
      break;
    }
  }
  mealElement.innerHTML = `
  <h1>${mealData.strMeal}</h1>
  <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
  <p>${mealData.strInstructions}</p>
  <h3>Ingredients:</h3>
  <ol>
    ${ingredients.map((ingredient) => `
      <li>${ingredient}</li>
      `).join("")
    }
  </ol>
  `;
  mealInfoElement.appendChild(mealElement);
  mealPopupContainer.classList.remove("hidden");
}

async function getMealById(id){
  const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
  const responseData = await response.json();
  try{
    const meal = responseData.meals[0];
    return meal;
  }catch(error){
    console.error(error);
  }
}

async function getMealsByTerm(term){
  const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`);
  const responseData = await response.json();
  try{
    const meals = responseData.meals;
    return meals;
  }catch(error){
    console.error(error);
  }
}

searchBtn.addEventListener("click", async() => {
  //Clean container
  mealsElements.innerHTML = "";

  const search = searchTerm.value;
  const meals = await getMealsByTerm(search);
  if(meals){
    meals.forEach((meal) => {
      addMeal(meal);
    });
  };
});

popupCloseBtn.addEventListener("click", () => {
  mealPopupContainer.classList.add("hidden");
});


getRandomMeal();
fetchFavoritedMeals();

