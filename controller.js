// NOTE about MVC architecture and Subscriber-Publisher pattern
// View handles everything related to DOM, that includes: grabbing elements for event handlers; listening for events (clicks, submits, scrolls, drags etc.); clearing input fields;

import { pubSub } from "./pub-sub.js"
import { yumchiveModel as model } from "./model.js"
import { mainView } from "./main-view.js"
import { recipeView } from "./recipe-view.js"
import { searchView } from "./search-view.js"
import { bookmarksView } from "./bookmarks-view.js"


// search for recipes based on a form query
pubSub.subscribe("searchExecuted", (searchQuery)=>{
  model.getSearchResults(searchQuery)
})

// render the initial list of recipes
pubSub.subscribe("recipesListFetched", (recipesList)=>{
  searchView.renderRecipesList(recipesList)
})
// render pages of recipes in response to user clicking pagination buttons
pubSub.subscribe("recipePageFlipped", (recipesList)=>{
  searchView.renderRecipesList(recipesList)
})

// fetch the selected recipes' details
pubSub.subscribe("recipeSelected", (recipeId)=>{
  model.getRecipe(recipeId)
})

// render a single user-selected recipe
pubSub.subscribe("recipeDataFetched", (currentRecipe)=>{
  recipeView.renderRecipe(currentRecipe)
})

// handle servings count change
pubSub.subscribe("servingsCountChange", (newServingsCount)=>{
  model.updateServingsCount(newServingsCount)
})

// model updated the servings and ingredients count
pubSub.subscribe("recipeServingsDataUpdated", (updatedRecipe)=>{
  recipeView.updateServings(updatedRecipe)
})

// adding a bookmark
// model stores the current recipes' data in local storage
pubSub.subscribe("addBookmark", ()=>{
  model.addBookmark()
})
// bookmarks view renders a recipe preview in the dropdown using recipe data supplied by the model (same data that is stored in localStorage)
pubSub.subscribe("bookmarkAdded", (bookmarkData)=>{
  bookmarksView.renderBookmark(bookmarkData)
})

// removing bookmark with a published ID
// model removes bookmark from localStorage
// bookmarks view removes the preview from dropdown 
pubSub.subscribe("removeBookmark", (recipeId)=>{
  model.removeBookmark(recipeId)
  // NOTE: an event with 2 subscribers. PubSub is awesome!
  bookmarksView.removeBookmark(recipeId)
})

// render bookmarks found in localStorage
pubSub.subscribe("bookmarksPresent", (bookmarksData)=>{
  // call the already existing renderBookmark method for each bookmark retrieved from localStorage
  for (const bookmark of bookmarksData) {
    bookmarksView.renderBookmark(bookmark)
  }
})

// new recipe was added
pubSub.subscribe("newRecipeAdded", (addRecipeFormData)=>{
  model.uploadNewRecipe(addRecipeFormData)
})


// NOTE: Events and methods that happen on page load should go in the app.js module, which we don't have for this app
// Check for bookmarked recipes on page load
model.loadBookmarks();