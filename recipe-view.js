import { pubSub } from "./pub-sub.js";

export {recipeView}

class RecipeView {
  
  constructor() {    
  }

  addIngredients(ingredientsListContainer, ingredientsList) {
    const ingredientTemplate = document.getElementById("recipe-template").content.getElementById("recipe-ingredient-template")
    for (const ingredient of ingredientsList) {
      const ingredientMarkup = ingredientTemplate.content.cloneNode(true)

      const ingredientName = ingredientMarkup.getElementById("ingredient-name")
      ingredientName.innerText = ingredient.description

      const ingredientCount = ingredientMarkup.getElementById("ingredient-count")
      if (ingredient.quantity) {
        ingredientCount.textContent = ingredient.quantity
      }
      else {
        ingredientCount.textContent = ""
      }

      const ingredientUnit = ingredientMarkup.getElementById("ingredient-unit")
      ingredientUnit.textContent = ingredient.unit

      ingredientsListContainer.append(ingredientMarkup)
    }
  }

  renderRecipe(recipe) {
    // A View method that takes an instance of the Recipe class from the controller as its parameter
    const recipeTemplate = document.getElementById("recipe-template")
    const recipeContainer = recipeTemplate.content.cloneNode(true)

    // Recipe Image
    const recipeImgContainer = recipeContainer.getElementById("recipe-image-container")
    const recipeImg = recipeImgContainer.querySelector("img")
    recipeImg.src = recipe.imageUrl
    const recipeImgCaption = recipeImgContainer.querySelector("figcaption")
    recipeImgCaption.textContent = recipe.title

    // Cooking time
    const cookingTime = recipeContainer.getElementById("cooking-time-number")
    cookingTime.textContent = `${recipe.cookingTime} `
    // Servings count
    const servingCount = recipeContainer.getElementById("servings-count-number")
    servingCount.textContent = `${recipe.servings} `

    // add event listeners to servings count buttons
    const buttonServingsMinus = recipeContainer.getElementById("servings-minus")
    buttonServingsMinus.addEventListener("click", ()=>{
      // publish the new recipe count. Don't go below 1
      const newServings = (recipe.servings-1 >= 1) ? recipe.servings-1 : 1;
      pubSub.publish("servingsCountChange", newServings)
    })
    const buttonServingsPlus = recipeContainer.getElementById("servings-plus")
    buttonServingsPlus.addEventListener("click", ()=>{
      // publish the new recipe count
      const newServings = recipe.servings+1
      pubSub.publish("servingsCountChange", newServings)
    })

    // Add bookmark button
    const buttonAddBookmark = recipeContainer.getElementById("button-add-bookmark")
    // check if the current recipe is bookmarked. If so add the appropriate CSS class
    if (recipe.bookmarked) {
      buttonAddBookmark.classList.add("button-remove-bookmark")
    }
    // on bookmark button click call the click-handling method and pass the button element and the current recipe to the handler
    buttonAddBookmark.addEventListener("click", ()=>{
      this.addBookmark(buttonAddBookmark, recipe)
    })

    // Ingredients
    const ingredientsListContainer = recipeContainer.querySelector("#recipe-ingredients-list")
    const ingredientsList = recipe.ingredients
    this.addIngredients(ingredientsListContainer, ingredientsList)

    // Instructions
    const recipeSource = recipeContainer.getElementById("recipe-source")
    recipeSource.textContent = recipe.publisher
    const recipeSourceLink = recipeContainer.getElementById("recipe-source-link")
    recipeSourceLink.href = recipe.sourceUrl

    // Add recipe HTML to the DOM
    const destination = document.querySelector("main")
    // If there already is a displayed recipe - remove it
    const previousRecipe = destination.querySelector("article.recipe-container")
    if (previousRecipe) {
      previousRecipe.remove()
    }
    // we have to use append, prepend, before or after instead of insertAdjacentHTML when using templates - we're not adding a string but a Node
    destination.append(recipeContainer)  
  }

  // once the markup from template was created we can just grab the selected elements from the live DOM and update them as needed without having to call the original render method again! Eyes OPEN!
  updateServings(updatedRecipe) {
    // Update only the servings related info in the DOM

    // Update the servings number in the subheading
    const servingCount = document.getElementById("servings-count-number")
    servingCount.textContent = `${updatedRecipe.servings} `

    // Update the quantities of each ingredient
    // get the <ul> from the DOM
    const ingredientsListContainer = document.getElementById("recipe-ingredients-list")
    // get a list of all the <li> in the <ul>
    const ingredientsListItems = [...ingredientsListContainer.querySelectorAll(".recipe-ingredient")]
    // list of new ingredients from the updated Recipe
    const ingredientsList = updatedRecipe.ingredients
    // loop through the list of <li> and update each ingredients' quantity
    const ingredientsListItemsLength = ingredientsListItems.length;
    for (let i=0; i<ingredientsListItemsLength; i+=1) {
      ingredientsListItems[i].querySelector("#ingredient-count").textContent = (ingredientsList[i].quantity) ? ingredientsList[i].quantity : ""
    }
  }

  addBookmark(passedButton, recipe) {
    const buttonClasses = passedButton.classList
    const removeBookmarkClass = "button-remove-bookmark"
    // Button already has the remove-class - bookmark exists
    if (buttonClasses.contains(removeBookmarkClass)) {
      // publish event with the id of the recipe to be removed
      pubSub.publish("removeBookmark", recipe.id)
      buttonClasses.remove(removeBookmarkClass)
    }
    // Button doesn't have the remove class - bookmark doesn't exist. Need to add it
    else {
      // undefined to skip passing argument
      pubSub.publish("addBookmark", undefined)
      buttonClasses.add(removeBookmarkClass)
    }
  }
}


const recipeView = new RecipeView();