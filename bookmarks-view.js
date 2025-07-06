import { pubSub } from "./pub-sub.js";

export {bookmarksView}

class BookmarksView {
  constructor() {
    // Relevant DOM elements
    this.bookmarksContainer = document.getElementById("bookmarks-container")
    this.bookmarkedItemTemplate = document.getElementById("bookmarked-item-template")
    this.bookmarksPlaceholder = document.getElementById("bookmarks-placeholder")

    // handle clicks on bookmarks container
    this.bookmarksContainer.addEventListener("click", this.handleBookmarkClicked.bind(this))
  }

  renderBookmark(bookmarkData) {
    // Hide placeholder
    this.bookmarksPlaceholder.style.display = "none"

    // Create a new Bookmark Item
    const bookmarkedItemMarkup = this.bookmarkedItemTemplate.content.cloneNode(true)
    // unpack the recipe data
    const recipeId = bookmarkData[0]
    const {bookmarkImg: recipeImg, bookmarkTitle: recipeTitle} = bookmarkData[1]

    // fill the template items' values
    const bookmarkedItem = bookmarkedItemMarkup.querySelector("li")
    bookmarkedItem.dataset.recipeId = recipeId

    const bookmarkedItemImg = bookmarkedItemMarkup.querySelector("img")
    bookmarkedItemImg.src = recipeImg
    bookmarkedItemImg.alt = recipeTitle

    const bookmarkedItemTitle = bookmarkedItemMarkup.querySelector("h3")
    bookmarkedItemTitle.textContent = recipeTitle
    
    // 

    // render the created list item in the DOM
    this.bookmarksContainer.append(bookmarkedItemMarkup)
  }

  removeBookmark(recipeId) {
    // find the recipe with Id to be removed
    const bookmarkedRecipes = [...this.bookmarksContainer.querySelectorAll("[data-recipe-id]")]
    for (const recipe of bookmarkedRecipes) {
      const bookmarkedRecipeId = recipe.dataset["recipeId"]
      if (bookmarkedRecipeId === recipeId) {
        recipe.remove()
      }
    }
    // after we remove a bookmark we check if there's only 1 item in the bookmarks. If so, that means we just removed the last item and now the list is empty. We'll unhide the placeholder
    if (bookmarkedRecipes.length === 1) {
      this.bookmarksPlaceholder.style = ""
    }
  }

  handleBookmarkClicked(event) {
    console.log(event.target.closest("[data-recipe-id]"))
    const recipeId = event.target.closest("[data-recipe-id]").dataset["recipeId"]
    pubSub.publish("recipeSelected", recipeId)
  }
}

const bookmarksView = new BookmarksView();