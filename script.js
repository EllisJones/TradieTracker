//selecting elements
const newOrderForm = document.getElementById("newOrderForm");
const newJobBtn = document.getElementById("newJobBtn");
const jobDetailPlaceholder = document.getElementById("jobDetailPlaceholder");
const submitNewJobBtn = document.getElementById("orderFormSubmit");
const orderFormName = document.getElementById("orderFormName");
const orderFormAddress = document.getElementById("orderFormAddress");
const orderFormPostcode = document.getElementById("orderFormPostcode");
const orderFormComments = document.getElementById("orderFormComments");
const orderFormErrors = document.getElementById("orderFormErrors");

class Job {
  #id;

  constructor(name, address, postcode, comments, coords) {
    this.name = name;
    this.address = address;
    this.postcode = postcode;
    this.comments = comments;
    this.#id = app.globalId++;
    this.coords = coords;
    app._plotMarker(this.coords);
    app.jobs.push(this);
    this._renderJob();
  }
  _updateInfo() {
    //get the info from the input fields
    //update the object in app.jobs[]
    //document.getElementById(`${id}`)
    //update element text content based off object
  }
  _renderJob() {
    const elements = {
      "ID:": this.#id,
      "Name:": this.name,
      "Address:": this.address,
      "Postcode:": this.postcode,
    };
    const jobContainer = document.createElement("div");
    jobContainer.id = this.#id;
    const nameContainer = document.createElement("div");
    const valueContainer = document.createElement("div");
    jobContainer.classList.add("jobElement");
    nameContainer.classList.add("name-container");
    valueContainer.classList.add("value-container");
    for (let key in elements) {
      if (elements.hasOwnProperty(key)) {
        // Create an element for the variable name (e.g., key)
        const nameElement = document.createElement("span");
        nameElement.textContent = key;
        nameElement.id = key;
        nameElement.classList.add("name-item");
        // Create an element for the variable value
        const valueElement = document.createElement("span");
        valueElement.textContent = elements[key];
        valueElement.id = key;
        valueElement.classList.add("value-item");
        // Append name and value elements to their respective containers
        nameContainer.appendChild(nameElement);
        valueContainer.appendChild(valueElement);
      }
    }
    jobContainer.appendChild(nameContainer);
    jobContainer.appendChild(valueContainer);
    document.getElementById("jobListContainer").appendChild(jobContainer);
  }
}

class App {
  #map;
  globalId = 1;
  jobs = [];
  errorMessage = [];
  constructor() {
    //app initialisation
    this._getLocation();
    newJobBtn.addEventListener("click", this._toggleNewOrderForm.bind(this));
    submitNewJobBtn.addEventListener("click", this._newJob.bind(this));
  }

  _getLocation() {
    // gets the users position and loads the map on that position
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this)),
        function () {
          alert("Could not get your position");
        };
  }
  _loadMap(position) {
    // loads the map and centers it based on the users position
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];

    this.#map = L.map("map").setView(coords, 13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.#map);
  }
  _calcCoords(postcode) {
    // takes a postcode and returns the rough latitude and longitude of that postcode
    var url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${postcode}`;

    return fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          var lat = data[0].lat;
          var lon = data[0].lon;
          return [lat, lon];
        } else {
          this.errorMessage.push("Location not found.");
          throw new Error("Location not found.");
        }
      })
      .catch((error) => console.error(error));
  }
  _plotMarker(coords) {
    // plots a marker on the map based on the coords given
    var marker = L.marker(coords).addTo(this.#map);
    this.#map.setView(coords, 13);
  }
  async _newJob(event) {
    //prevents web page from refreshing once form is submitted
    event.preventDefault();
    //empties the error message array before form validation
    this.errorMessage = [];
    const fields = [orderFormName, orderFormAddress, orderFormPostcode];
    for (let field of fields) {
      if (!field.value) {
        this.errorMessage.push(`${field.name} is required`);
      }
    }
    let coords = await this._calcCoords(orderFormPostcode.value);
    if (this.errorMessage.length > 0) {
      orderFormErrors.textContent = this.errorMessage.join(", ");
    }
    if (this.errorMessage.length == 0) {
      let newJob = new Job(
        orderFormName.value,
        orderFormAddress.value,
        orderFormPostcode.value,
        orderFormComments.value,
        coords
      );
      orderFormName.value = "";
      orderFormAddress.value = "";
      orderFormPostcode.value = "";
      orderFormComments.value = "";
      this._toggleNewOrderForm();
      orderFormErrors.textContent = "";
    }
  }
  _toggleNewOrderForm() {
    newOrderForm.classList.toggle("hidden");
    newJobBtn.classList.toggle("hidden");
    jobDetailPlaceholder.classList.toggle("hidden");
  }
  _selectJob() {
    //use event listener to call this function either by clicking map marker, or the specific job in the job list
    //.closest() to find the order ID
    //set the value to be the same as the object values
    //toggle appearance of the editting field
    //-> then leaves in a position to press save which calls job._updateInfo()
  }
}
const app = new App();
