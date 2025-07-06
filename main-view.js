import { pubSub } from "./pub-sub.js";

export { mainView }

class MainView {
  constructor() {
    // Opening the modal
    this.buttonAddRecipeOpenModal = document.getElementById("button-addrecipe-openmodal")
    this.buttonAddRecipeOpenModal.addEventListener("click", ()=>{
      this.addRecipeModal.showModal()
    })
    
    // Modal elements
    this.addRecipeModal = document.getElementById("addrecipe-modal")
    this.addRecipeForm = document.getElementById("addrecipe-form")
    // upload recipe on form submission
    // NOTE: submit event happens on the form, not on the button
    this.addRecipeForm.addEventListener("submit", this.uploadRecipe.bind(this))
    
    // Closing the modal
    this.buttonAddRecipeCloseModal = document.getElementById("button-addrecipe-close")
    this.buttonAddRecipeCloseModal.addEventListener("click", ()=>{
      this.addRecipeModal.close()
    })
  }

  uploadRecipe() {
    console.log(`Recipe uploaded`)
    // construct a new FormData object and publish it to the model
    // to get the actual data we have to array-unpack it
    const addRecipeFormData = [...new FormData(this.addRecipeForm)]
    pubSub.publish("newRecipeAdded", addRecipeFormData)
  }
}

const mainView = new MainView();