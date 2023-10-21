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

// Adding the sample buttons to the page, each sample will generate its own button
const addButtons = document.getElementById("addButtons")
let id = 0
samples.forEach((sample) => {

    const newButton = document.createElement("button")
    newButton.classList.add("btn", "btn-primary", "me-2", "mb-2")
    newButton.setAttribute("data-id", id++)
    newButton.addEventListener("click", () => addSample(newButton))
    newButton.innerText = sample.name
    addButtons.appendChild(newButton)
})

// By pressing the sample button, the sample is added to the tracks array and to the trackItems div
function addSample(addButton) {
    const sampleNumber = addButton.dataset.id;
    const trackNumber = document.querySelector("input[name='track']:checked").value;

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
const uploadButton = document.getElementById("upload")
uploadButton.addEventListener("click", () => {
    const file = document.getElementById("input-sample").files[0]
    let audioSrc = ""
    if(!file) return
    
    audioSrc = URL.createObjectURL(file)
    let sample = {src: audioSrc, name: "New Sample"}
    samples.push(sample)
    id = samples.length - 1

    const newButton = document.createElement("button")
    newButton.classList.add("btn", "btn-primary", "me-2", "mb-2")
    newButton.setAttribute("data-id", id)
    newButton.addEventListener("click", () => addSample(newButton))
    newButton.innerText = sample.name

    addButtons.appendChild(newButton)
})

// Function to delete a track item from a track
function deleteItem(trackNumber, itemIndex) {
  tracks[trackNumber].splice(itemIndex, 1)
  const trackItemsDiv = document.getElementById(`trackItems${trackNumber}`)
  trackItemsDiv.removeChild(trackItemsDiv.childNodes[itemIndex])
}