import { API_URL, API_KEY } from "./yumchive-config.js"
import { pubSub } from "./pub-sub.js";

// export an instance of the Model class to the controller
export {yumchiveModel}

// Creating a class from an entire object instead of listing every object key separately
class Recipe {
  // A class holding all the Recipes' information 
  constructor(recipeData) {
    this.publisher = recipeData.data.recipe.publisher;
    this.ingredients = recipeData.data.recipe.ingredients;
    this.sourceUrl = recipeData.data.recipe.source_url;
    this.imageUrl	= recipeData.data.recipe.image_url;
    this.title = recipeData.data.recipe.title;
    this.servings = recipeData.data.recipe.servings;
    this.cookingTime = recipeData.data.recipe.cooking_time;
    this.id = recipeData.data.recipe.id;
    this.bookmarked = false;
  }
}

class Model {
  constructor() {
    this.recipeData;
    this.recipesList;
    this.currentRecipe;
  }
  
  async fetchRecipeData(recipeId) {
    // Performs an API call to get data for a single recipe
      // Fetch the response
      const recipePromise = await fetch(`${API_URL}/${recipeId}`)
      // Status from the API call 
      if (!recipePromise["ok"]) {
        throw new Error(`Recipe fetch call failure: ${recipePromise["status"]}`)
      }
      // Unpack the recipe
      this.recipeData = await recipePromise.json()
      // Status from recipe itself
      if (this.recipeData["status"] !== "success") {
        throw new Error(`Recipe acquisition from API failure: ${this.recipeData["status"]}`)
      }
    }

  async getRecipe(recipeId) {
    // Returns an instance of a Recipe class
    try {
      // Handle errors in the higher order function
      await this.fetchRecipeData(recipeId)
      this.currentRecipe = new Recipe(this.recipeData)
      // check if recipe is bookmarked and mark it appropriately
      if (localStorage.getItem(this.currentRecipe.id)) {
        this.currentRecipe.bookmarked = true;
      }
      
      pubSub.publish("recipeDataFetched", this.currentRecipe)
    }
    catch (error) {
      alert(error)
    }
  }

  async fetchSearchResults(query) {
    // fetch search results promise from API
    const searchResultsPromise = await fetch(`${API_URL}?search=${query}&key=${API_KEY}`)
    if (!searchResultsPromise["ok"]) {
      throw new Error(`Search results call failure: ${searchResultsPromise["status"]}`)
    }
    // unpack the recipes list promise
    this.recipesList = await searchResultsPromise.json()
    if (this.recipesList["status"] !== "success") {
      throw new Error(`RecipesList promise failed to unpack: ${this.recipesList["status"]}`)
    }
  }

  async getSearchResults(query="pizza") {
    // unpack the recipe list from search and publish it
    try {
      await this.fetchSearchResults(query)
      pubSub.publish("recipesListFetched", this.recipesList.data.recipes)
    }
    catch (error) {
      alert(error)
    }
  }

  updateServingsCount(newServingsCount) {
    // publish the updated recipe after servings count was changed by the user
    const ingredientsMultiplier = newServingsCount / this.currentRecipe.servings
    this.currentRecipe.servings = newServingsCount;
    
    for (const ingredient of this.currentRecipe.ingredients) {
      // loop through each ingredient, update the counts to match the new servings value. Round the result to 1 decimal
      ingredient.quantity = Number((ingredient.quantity * ingredientsMultiplier).toFixed(1))
    }
    pubSub.publish("recipeServingsDataUpdated", this.currentRecipe)
  }

  // adding a bookmark
  addBookmark() {
    // change the current recipes bookmarked property to true
    this.currentRecipe.bookmarked = true;
    // dictionary with recipe data we want to store
    const bookmarkData = {
      "bookmarkImg": this.currentRecipe.imageUrl,
      "bookmarkTitle": this.currentRecipe.title
    }
    // storing a str representation of the data object
    localStorage.setItem(this.currentRecipe.id, JSON.stringify(bookmarkData))
    // TODO: only add item if it's not already stored in memory. Not needed?

    // publish recipe id and the properties needed to add a HTML bookmark element to the dropdown
    pubSub.publish("bookmarkAdded", [this.currentRecipe.id, bookmarkData])
  }

  // removing bookmark
  removeBookmark(bookmarkedRecipeId) {
    // change the current recipes bookmarked property back to false
    this.currentRecipe.bookmarked = false;
    localStorage.removeItem(bookmarkedRecipeId)    
  }

  loadBookmarks() {
    // Checks the localStorage for bookmarks and publishes their data
    if (localStorage.length) {
      const bookmarksDataRaw = Object.entries(localStorage)
      // the object storing imgUrl and title in each entry is now a jsoned string. We need to parse it
      // we recreate the entries array but with a parsed object
      const bookmarksData = []
      for (const bookmark of bookmarksDataRaw) {
        // on each loop we create a list [id, {imgUrl, title}]
        bookmarksData.push([bookmark[0], JSON.parse(bookmark[1])])
      }
      pubSub.publish("bookmarksPresent", bookmarksData)
    }
  }

  uploadNewRecipe(newRecipeFormData) {
    console.log(`Model received new recipe form data`)
    // using Object.fromEntries() to convert the nested array into an object
    const newRecipeData = Object.fromEntries(newRecipeFormData)
    
    // We have to create an object with the same syntax as the one received from the API to be able to upload it to the API
    // we start with the ingredients array
    const newRecipeIngredients = [];
    for (const key in newRecipeData) {
      if (key.startsWith("ingredient")) {
        // search only for keys that start with ingredient
        // split the string from the form at commas
        const ingredientElements = newRecipeData[key].split(",")
        if (ingredientElements.length === 3) {
          // if the input field was actually filled and contains the expected values, we create an object for that ingredient and append it to the ingredients list
          const ingredient = {
            "quantity": Number(ingredientElements[0]),
            "unit": ingredientElements[1],
            "description": ingredientElements[2]
          }
          newRecipeIngredients.push(ingredient)
        }
      }
    }

    // create the object to be sent
    const newRecipeDataForUpload = {
      "publisher": newRecipeData.publisher,
      "source_url": "",
      "image_url": newRecipeData["image-url"],
      "title": newRecipeData.title,
      "servings": Number(newRecipeData.servings),
      "cooking_time": Number(newRecipeData["prep-time"]),
      "ingredients": newRecipeIngredients
    }
  }
}

// NOTE: exporting not the class but an already made instance of the Model class to the controller, since we can create it here and not have to clutter the controller
const yumchiveModel = new Model();
