// Array for mp3 samples, items are object having file source and name
const samples = []

samples.push({src: "audio/bass.mp3", name: "Bass"})
samples.push({src: "audio/drum.mp3", name: "Drum"})
samples.push({src: "audio/piano.mp3", name: "Piano"})
samples.push({src: "audio/silence.mp3", name: "Silence"})
samples.push({src: "audio/strange-beat.mp3", name: "Strange Beat"})
samples.push({src: "audio/violin.mp3", name: "Violin"})

// 2D array of tracks – so one track can have multiple samples in a row
let tracks = []
tracks.push([])
tracks.push([])
tracks.push([])
tracks.push([])

// Let's add these tracks to HTML page in a horizontal layout
const tracksDiv = document.getElementById("tracks");

for (let i = 0; i < tracks.length; i++) {
    const trackDiv = document.createElement("div");
    trackDiv.classList.add("track");
    trackDiv.innerHTML = `
        <h2>Track ${i + 1}</h2>
        <div id="trackItems${i}" class="track-items"></div>
    `;
    tracksDiv.appendChild(trackDiv);
}

// Function to create a new sample button
function createSampleButton(sample, id) {
    const newButton = document.createElement("button");
    newButton.classList.add("btn", "btn-primary", "me-2", "mb-2");
    newButton.setAttribute("data-id", id);
    newButton.draggable = true;
    newButton.addEventListener("dragstart", (event) => dragStart(event, newButton));
    newButton.innerText = sample.name;
    newButton.addEventListener("click", () => addSample(newButton));
    addButtons.appendChild(newButton);
}

// Adding the sample buttons to the page, each sample will generate its own button
const addButtons = document.getElementById("addButtons")
let id = 0

samples.forEach((sample, index) => {
    createSampleButton(sample, index);
});

const tracksContainer = document.getElementById("tracks-container");
tracksContainer.addEventListener("dragover", dragOver);
tracksContainer.addEventListener("drop", dropSample);

function dragStart(event, addButton) {
    event.dataTransfer.setData("text/plain", addButton.dataset.id);
}

function dragOver(event) {
    event.preventDefault();
}

function dropSample(event) {
    event.preventDefault();
    const sampleNumber = event.dataTransfer.getData("text/plain");
    const trackDiv = event.target.closest(".track");
    
    if (!trackDiv) {
        return; // If the drop target is not a track, do nothing.
    }

    const trackNumber = Array.from(trackDiv.parentElement.children).indexOf(trackDiv);

    tracks[trackNumber].push(samples[sampleNumber]);

    const trackItemsDiv = document.getElementById(`trackItems${trackNumber}`);
    const newItem = document.createElement("div");
    newItem.classList.add("track-item");
    newItem.innerHTML = `
        <span class="me-2">${samples[sampleNumber].name}</span>
        <button class="btn btn-danger btn-sm" onclick="deleteItem(${trackNumber}, ${tracks[trackNumber].length - 1})">Delete</button>
    `;
    trackItemsDiv.appendChild(newItem);
}


// By pressing the sample button, the sample is added to the tracks array and to the trackItems div
function addSample(addButton) {
    const sampleNumber = addButton.dataset.id;
    const trackNumber = document.querySelector("input[name='track']:checked").value;

    const newSample = {
        src: samples[sampleNumber].src,
        name: samples[sampleNumber].name
    };

    tracks[trackNumber].push(newSample);

    const trackItemsDiv = document.getElementById(`trackItems${trackNumber}`);
    const newItem = document.createElement("div");
    newItem.classList.add("track-item");
    newItem.innerHTML = `
        <span class="me-2">${newSample.name}</span>
        <button class="btn btn-danger btn-sm" onclick="deleteItem(${trackNumber}, ${tracks[trackNumber].length - 1})">Delete</button>
    `;
    trackItemsDiv.appendChild(newItem);
}

const playButton = document.getElementById("play")
playButton.addEventListener("click", () => playSong())

// Song is played so that each track is started simultaneously 
function playSong() {
    let i = 0;
    tracks.forEach((track) => {
        if(track.length > 0) {
            playTrack(track, i)
        }
        i++
    })
}

// Track is looped – that means it is restarted each time its samples are played through
function playTrack(track, trackNumber) {
    let audio = new Audio()
    let i = 0
    audio.addEventListener("ended", () => {
        i = ++i < track.length ? i : 0
        audio.src = track[i].src
        audio.play()
        console.log("Starting: Track " + trackNumber + ", instrument " + track[i].name)
    }, true )
    audio.volume = 1.0
    audio.loop = false
    audio.src = track[0].src
    audio.play()
    console.log("Starting: Track " + trackNumber + ", instrument " + track[i].name)
}

// There is an upload button that adds a sample to samples array and a sample button with an event listener
const uploadButton = document.getElementById("upload");
uploadButton.addEventListener("click", () => {
    const file = document.getElementById("input-sample").files[0];
    let audioSrc = "";

    if (!file) return;

    audioSrc = URL.createObjectURL(file);
    let sample = { src: audioSrc, name: "New Sample" };
    samples.push(sample);
    id = samples.length - 1;

    createSampleButton(sample, id); // Call the createSampleButton function for the new sample
});

// Function to delete a track item from a track
function deleteItem(trackNumber, itemIndex) {
  tracks[trackNumber].splice(itemIndex, 1)
  const trackItemsDiv = document.getElementById(`trackItems${trackNumber}`)
  trackItemsDiv.removeChild(trackItemsDiv.childNodes[itemIndex])
}

// Function to add a new track
function addTrack() {
    const trackIndex = tracks.length;
    const newTrackDiv = document.createElement("div");
    newTrackDiv.classList.add("form-check");
    newTrackDiv.innerHTML = `
        <input class="form-check-input" type="radio" name="track" id="track${trackIndex}" value="${trackIndex}">
        <label class="form-check-label" for="track${trackIndex}">Track ${trackIndex + 1}</label>
    `;
    const trackSelectionDiv = document.getElementById("track-selection");
    trackSelectionDiv.appendChild(newTrackDiv);

    const newTrack = [];
    tracks.push(newTrack);

    const trackDiv = document.createElement("div");
    trackDiv.classList.add("track");
    trackDiv.innerHTML = `
        <h2>Track ${trackIndex + 1}</h2>
        <div id="trackItems${trackIndex}" class="track-items"></div>
    `;
    console.log("Created a new track.")
    const tracksDiv = document.getElementById("tracks");
    tracksDiv.appendChild(trackDiv);
}

// Event listener for adding a new track
const addTrackButton = document.createElement("button");
addTrackButton.classList.add("btn", "btn-success", "me-2", "mb-2");
addTrackButton.innerText = "Add Track";
addTrackButton.addEventListener("click", addTrack);
document.getElementById("addButtons").appendChild(addTrackButton);

// Function to remove a track
function removeTrack() {
    const selectedTrack = document.querySelector("input[name='track']:checked");
    if (selectedTrack) {
        const trackIndex = parseInt(selectedTrack.value, 10);
        tracks.splice(trackIndex, 1);
        updateTrackSelection();
        updateTracksDisplay();
    }
}

// Function to update the track selection (after removing a track)
function updateTrackSelection() {
    const trackSelectionDiv = document.getElementById("track-selection");
    trackSelectionDiv.innerHTML = "";

    for (let i = 0; i < tracks.length; i++) {
        const trackOption = document.createElement("div");
        trackOption.classList.add("form-check");
        trackOption.innerHTML = `
            <input class="form-check-input" type="radio" name="track" id="track${i}" value="${i}" ${(i === 0 ? 'checked' : '')}>
            <label class="form-check-label" for="track${i}">Track ${i + 1}</label>
        `;
        trackSelectionDiv.appendChild(trackOption);
    }
}

// Function to update the tracks display (after removing a track)
function updateTracksDisplay() {
    const tracksDiv = document.getElementById("tracks");
    tracksDiv.innerHTML = "";

    for (let i = 0; i < tracks.length; i++) {
        const trackDiv = document.createElement("div");
        trackDiv.classList.add("track");
        trackDiv.innerHTML = `
            <h2>Track ${i + 1}</h2>
            <div id="trackItems${i}" class="track-items"></div>
        `;
        tracksDiv.appendChild(trackDiv);
    }
}

// Event listener for removing a track
const removeTrackButton = document.createElement("button");
removeTrackButton.classList.add("btn", "btn-danger", "me-2", "mb-2");
removeTrackButton.innerText = "Remove Track";
removeTrackButton.addEventListener("click", removeTrack);
document.getElementById("addButtons").appendChild(removeTrackButton);



// eof
