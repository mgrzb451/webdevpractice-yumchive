// This one will have a class handling search form and publish the query
// and then render the search results and publish recipeID of the recipe clicked by user

import { pubSub } from "./pub-sub.js";
import { RESULTS_PER_PAGE } from "./yumchive-config.js";

export {searchView}

class SearchView {
  constructor() {
    // Search form
    this.recipeSearchForm = document.getElementById("recipe-search-form")
    this.recipeSearchField = document.getElementById("search-field")
    this.recipeSearchForm.addEventListener("submit", this.handleForm.bind(this))

    // Recipes list
    this.recipesListContainer = document.getElementById("search-results-list")
    this.recipesListItemTemplate = document.getElementById("search-result-template")
    this.recipesListContainer.addEventListener("click", this.handleRecipeSelected.bind(this))

    // Pagination buttons
    this.paginationButtonsContainer = document.getElementById("pagination-buttons-container")
    this.buttonPaginationLeftTemplate = document.getElementById("pagination-button-left-template")
    this.buttonPaginationRightTemplate = document.getElementById("pagination-button-right-template")
    // stores the page of recipes the user is on
    this.currentPage = 1;
    this.recipesList = null;
    

  }

  handleForm(event) {
    // read search query from form and publish it
    event.preventDefault();
    const searchQuery = this.recipeSearchField.value
    pubSub.publish("searchExecuted", searchQuery)
    // clear input field
    this.recipeSearchField.value = ""
  }

  handleRecipeSelected(event) {
    // Publish which recipe from the list was clicked
    const selectedRecipe = event.target.closest(".search-result");
    if (selectedRecipe) {
      const selectedRecipeId = selectedRecipe.dataset["recipeId"]
      pubSub.publish("recipeSelected", selectedRecipeId)
    }
  }

  renderSinglePage(recipesToRender) {
    // display a single page of recipes of the length from CONFIG
    for (const recipe of recipesToRender) {
      const recipesListItemMarkup = this.recipesListItemTemplate.content.cloneNode(true)
      // update the image
      const recipeImg = recipesListItemMarkup.querySelector("img")
      recipeImg.src = recipe["image_url"]
      recipeImg.alt = recipe["title"]

      // recipe details
      const recipeName = recipesListItemMarkup.querySelector(".recipe-text h3")
      recipeName.textContent = recipe["title"]
      const recipeSource = recipesListItemMarkup.querySelector(".recipe-text p")
      recipeSource.textContent = recipe["publisher"]
      
      // assign unique id to the data-* attribute
      const recipeListItem = recipesListItemMarkup.querySelector("li")
      recipeListItem.dataset["recipeId"] = recipe["id"]
      
      // render the list to DOM
      this.recipesListContainer.append(recipesListItemMarkup)
    }
  }

  #renderButtonPaginationLeft(){
    const buttonPaginationLeftMarkup = this.buttonPaginationLeftTemplate.content.cloneNode(true)
    buttonPaginationLeftMarkup.querySelector("span").textContent = `Page ${this.currentPage-1}`
    this.paginationButtonsContainer.append(buttonPaginationLeftMarkup)
    // getElementById is not available on individual HTML elements apparently?!
    // this.paginationButtonsContainer.getElementById("button-pagination-left").addEventListener("click", this.decrementPage.bind(this))
    this.paginationButtonsContainer.querySelector("#button-pagination-left").addEventListener("click", this.decrementPage.bind(this))
  }

  #renderButtonPaginationRight(){
    const buttonPaginationRightMarkup = this.buttonPaginationRightTemplate.content.cloneNode(true)
    buttonPaginationRightMarkup.querySelector("span").textContent = `Page ${this.currentPage+1}`
    this.paginationButtonsContainer.append(buttonPaginationRightMarkup)
    // this.paginationButtonsContainer.getElementById("button-pagination-right").addEventListener("click", this.incrementPage.bind(this))
    this.paginationButtonsContainer.querySelector("#button-pagination-right").addEventListener("click", this.incrementPage.bind(this))
  }

  renderPaginationButtons(totalPages) {
    // display pagination buttons

    // remove buttons to start
    this.paginationButtonsContainer.innerHTML = ""
    
    // Page 1 there are more pages
    if (this.currentPage === 1 && totalPages > 1){
      this.#renderButtonPaginationRight()
    }
    // Page > 1 there are more pages
    else if (this.currentPage > 1 && totalPages > this.currentPage){
      this.#renderButtonPaginationLeft()
      this.#renderButtonPaginationRight()
    }
    // Page > 1 there are no more pages
    else if (this.currentPage > 1 && totalPages === this.currentPage) {
      this.#renderButtonPaginationLeft()
    }
    else {
      // Page 1 no more pages
      // Don't render buttons
      return
    }
  }

  renderRecipesList(recipesList) {
    // render the recipes list and pagination buttons if necessary
    this.recipesList = recipesList /* Nasty workaround */

    // clear the recipes list first
    this.recipesListContainer.textContent = ""
    // render the recipes list in the DOM
    const recipesToRender = recipesList.slice((this.currentPage-1) * RESULTS_PER_PAGE, this.currentPage * RESULTS_PER_PAGE)
    const totalPages = Math.ceil(recipesList.length / RESULTS_PER_PAGE)
    this.renderSinglePage(recipesToRender)
    this.renderPaginationButtons(totalPages)
  }

  decrementPage() {
    this.currentPage-=1;
    pubSub.publish("recipePageFlipped", this.recipesList)
  }
  incrementPage() {
    this.currentPage+=1;
    pubSub.publish("recipePageFlipped", this.recipesList)
  }
}

const searchView = new SearchView();