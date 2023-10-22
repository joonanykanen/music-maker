// Array for mp3 samples, items are object having file source and name
const samples = []
const sampleButtons = document.getElementById("sampleButtons");

let id = 0
let isPlaying = false;
let audioElements = [];

samples.push({src: "audio/bass.mp3", name: "Bass"})
samples.push({src: "audio/drum.mp3", name: "Drum"})
samples.push({src: "audio/piano.mp3", name: "Piano"})
samples.push({src: "audio/silence.mp3", name: "Silence"})
samples.push({src: "audio/strange-beat.mp3", name: "Strange Beat"})
samples.push({src: "audio/violin.mp3", name: "Violin"})

// 2D array of tracks – so one track can have multiple samples in a row
let tracks = []
addTrack()
addTrack()
addTrack()
addTrack()

// Function to add a new track
function addTrack() {
    const trackIndex = tracks.length;

    // Check if this is the first track
    const isChecked = trackIndex === 0 ? 'checked' : '';

    const newTrackDiv = document.createElement("div");
    newTrackDiv.classList.add("form-check");
    newTrackDiv.innerHTML = `
        <input class="form-check-input" type="radio" name="track" id="track${trackIndex}" value="${trackIndex}" ${isChecked}>
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

    const volumeInput = document.createElement("input");
    volumeInput.type = "range";
    volumeInput.min = 0;
    volumeInput.max = 1;
    volumeInput.step = 0.1;
    volumeInput.value = 1; // Initial volume level
    volumeInput.classList.add("form-range");
    volumeInput.id = `volume${trackIndex}`;
    volumeInput.addEventListener("input", (event) => updateTrackVolume(event, trackIndex));
    
    const volumeLabel = document.createElement("label");
    volumeLabel.htmlFor = `volume${trackIndex}`;
    volumeLabel.innerText = "Volume: ";
    
    newTrackDiv.appendChild(volumeLabel);
    newTrackDiv.appendChild(volumeInput);
}


// Event listener for adding a new track
const addTrackButton = document.createElement("button");
addTrackButton.classList.add("btn", "btn-success", "me-2", "mb-2");
addTrackButton.innerText = "Add Track";
addTrackButton.addEventListener("click", addTrack);
const addButtons = document.getElementById("addButtons");
addButtons.appendChild(addTrackButton);

// Function to remove a track
function removeTrack() {
    const selectedTrack = document.querySelector("input[name='track']:checked");
    if (selectedTrack) {
        const trackIndex = parseInt(selectedTrack.value, 10);
        tracks.splice(trackIndex, 1);
        updateTrackSelection(trackIndex);
        updateTracksDisplay(trackIndex);
    }
}

// Event listener for removing a track
const removeTrackButton = document.createElement("button");
removeTrackButton.classList.add("btn", "btn-danger", "me-2", "mb-2");
removeTrackButton.innerText = "Remove Track";
removeTrackButton.addEventListener("click", removeTrack);
addButtons.appendChild(removeTrackButton);


// Function to create a new sample button
function createSampleButton(sample, id) {
    const newButton = document.createElement("button");
    newButton.classList.add("btn", "btn-primary", "me-2", "mb-2", "sample-button");
    newButton.setAttribute("data-id", id);
    newButton.draggable = true;
    newButton.innerText = sample.name;

    // Add drag start event listener to the sample button
    newButton.addEventListener("dragstart", (event) => dragStart(event, newButton, id));

    // Add an event listener to add the sample to the track when the button is clicked
    newButton.addEventListener("click", () => addSample(newButton));

    // Add the sample button to the sampleButtons div
    sampleButtons.appendChild(newButton);
}


samples.forEach((sample, index) => {
    createSampleButton(sample, index);
});

const tracksContainer = document.getElementById("tracks-container");
tracksContainer.addEventListener("dragover", dragOver);
tracksContainer.addEventListener("drop", dropSample);

// Update the dragStart function to include the ID of the Wavesurfer container
function dragStart(event, addButton, id) {
    event.dataTransfer.setData("text/plain", id);
}

function dragOver(event) {
    event.preventDefault();
}

function dropSample(event) {
    event.preventDefault();
    const sampleId = event.dataTransfer.getData("text/plain");
    const trackDiv = event.target.closest(".track");

    if (!trackDiv) {
        return; // If the drop target is not a track, do nothing.
    }

    const trackNumber = Array.from(trackDiv.parentElement.children).indexOf(trackDiv);

    // Get the sample corresponding to the ID
    const sample = samples[sampleId];

    // Create a Wavesurfer container for the sample inside the track view
    const wavesurferContainer = document.createElement("div");
    wavesurferContainer.classList.add("wavesurfer-container");
    trackDiv.appendChild(wavesurferContainer);

    // Create a Wavesurfer instance for the sample
    const wavesurfer = WaveSurfer.create({
        container: wavesurferContainer,
        waveColor: 'violet',
        progressColor: 'purple',
        cursorWidth: 1,
    });

    // Load the audio sample
    wavesurfer.load(sample.src);

    // Add the sample to the track
    tracks[trackNumber].push(sample);

    // Update the track items in the track view
    const trackItemsDiv = document.getElementById(`trackItems${trackNumber}`);
    const newItem = document.createElement("div");
    newItem.classList.add("track-item");
    newItem.innerHTML = `
        <span class="me-2">${sample.name}</span>
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

function playSong() {
    if (isPlaying) {
        // If a song is playing, pause it
        pauseAllSongs();
    } else {
        let i = 0;
        tracks.forEach((track) => {
            if(track.length > 0) {
                const audio = playTrack(track, i);
                audioElements.push(audio);
            }
            i++
        })
        isPlaying = true;
        playButton.textContent = "Pause";
    }
}

function pauseAllSongs() {
    audioElements.forEach(audio => {
        audio.pause();
    });
    
    // Clear the audio elements for next play
    audioElements = [];
    isPlaying = false;
    playButton.textContent = "Play";
}


function updateTrackVolume(event, trackIndex) {
    const volume = parseFloat(event.target.value);
    const audioElements = Array.from(document.getElementsByClassName("audio-track"));
    
    audioElements.forEach((audioElement, index) => {
        if (index === trackIndex) {
            audioElement.volume = volume;
        }
    });
}


// Track is looped – that means it is restarted each time its samples are played through
function playTrack(track, trackNumber) {
    let audio = new Audio();
    let i = 0;
    audio.addEventListener("ended", () => {
        i = ++i < track.length ? i : 0;
        audio.src = track[i].src;
        audio.play();
        console.log("Starting: Track " + trackNumber + ", instrument " + track[i].name);
    }, true);
    audio.volume = 1.0; // Set the initial volume to 1.0
    audio.loop = false;
    audio.src = track[0].src;
    audio.play();
    console.log("Starting: Track " + trackNumber + ", instrument " + track[i].name);

    // Update the volume when the volume slider is changed
    const volumeInput = document.getElementById(`volume${trackNumber}`);
    if (volumeInput) {
        volumeInput.addEventListener("input", (event) => {
            audio.volume = parseFloat(event.target.value);
        });
    }
    return audio;
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

// Function to update the track selection (after removing a track)
function updateTrackSelection(trackIndex) {
    const trackRadio = document.getElementById(`track${trackIndex}`);
    if (trackRadio) {
        trackRadio.parentElement.remove();
        
        // select a new track only if the track removed was selected
        if (trackRadio.checked && tracks.length > 0) {
            document.getElementById('track0').checked = true;
        }
    }
}

// Function to update the tracks display (after removing a track)
function updateTracksDisplay(trackIndex) {
    const trackDiv = document.getElementById(`tracks`);
    const trackToRemove = trackDiv.querySelector(`div:nth-child(${trackIndex + 1})`);
    if (trackToRemove) {
        trackDiv.removeChild(trackToRemove);
    }
}

const downloadButton = document.getElementById("download");
downloadButton.addEventListener("click", downloadSong);


async function downloadSong() {
    // Create a Blob containing the audio data
    const audioData = await mergeTracks(tracks);
    const blob = new Blob(audioData, { type: 'audio/mpeg' });

    // Create a temporary URL for the Blob
    const url = window.URL.createObjectURL(blob);

    // Create a temporary anchor element and trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'music.mp3';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Function to merge tracks into a single audio source
async function mergeTracks(tracks) {
    const audioData = [];

    // Loop through the tracks and concatenate audio data
    for (const track of tracks) {
        for (const sample of track) {
            const audioBlob = await audioToBlob(sample.src);
            audioData.push(audioBlob);
        }
    }

    return audioData;
}

// Convert an audio source to a Blob
async function audioToBlob(src) {
    const response = await fetch(src);
    const blob = await response.blob();
    return blob;
}


// Add a reference to the "Record" button
const recordButton = document.getElementById("record");

// Initialize the Web Audio API variables
let audioContext;
let audioStream;
let mediaRecorder;
let recordedChunks = [];

recordButton.addEventListener("click", () => {
    if (recordButton.textContent === "Record") {
        // Start recording
        startRecording();
    } else {
        // Stop recording and save the sample
        stopRecording();
    }
});

function startRecording() {
    navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
            audioContext = new AudioContext();
            audioStream = stream;
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(recordedChunks, { type: "audio/wav" });
                const audioUrl = URL.createObjectURL(audioBlob);

                // Add the recorded sample to the samples array
                samples.push({ src: audioUrl, name: "Recording" });
                const newSampleId = samples.length - 1;

                // Create a button for the recorded sample
                createSampleButton(samples[newSampleId], newSampleId);
            };

            mediaRecorder.start();
            recordButton.textContent = "Stop";
        })
        .catch((error) => {
            console.error("Error accessing the microphone:", error);
        });
}

function stopRecording() {
    if (mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        audioStream.getTracks().forEach((track) => track.stop());
        audioContext.close();
        recordButton.textContent = "Record";
    }
}

// Function to toggle dark mode
function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle("dark-mode");
}

// Get the dark mode toggle button element
const darkModeToggle = document.getElementById("dark-mode-toggle");

// Add a click event listener to the toggle button
darkModeToggle.addEventListener("click", toggleDarkMode);

// eof
