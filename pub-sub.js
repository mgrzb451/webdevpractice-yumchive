//This is a really good implementation of the PubSub module. Document and use it

export {pubSub}

class PubSub {
  constructor() {
    this.events = {}
  }

  /**
   * @param {string} eventName 
   * @param {Function} mappingFunction
   */
  subscribe(eventName, mappingFunction) {
    // if there is no event with that name in the events create it and give it an empty list to store subscriber mappings
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }
    // add a subscriber mappingFunction to an event
    this.events[eventName].push(mappingFunction);
  }

  /**
   * @param {string} eventName Name of the event being published. Must have been previously defined by calling this.subscribe()
   * @param {any | undefined} eventData Optional. Data to send to along with the event publication
   * @exception If the event hasn't been defined in PubSub.events by first calling PubSub.subscribe() in the controller module
   */
  publish(eventName, eventData) {
    // when a given event occurs loop through each subscriber mapping and call it passing the event relevant eventData argument that was given by the publisher
    if (this.events[eventName]) {
      for (let mappingFunction of this.events[eventName]) {
        mappingFunction(eventData);
      }
    }
    else {
      // If that event isn't in the events object raise an exception
      throw new Error(`Event ${eventName} not found in pubSub.events`)
    }
  }
}

const pubSub = new PubSub();

