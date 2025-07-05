// --- Globals & DOM Elements ---
let map;
let tempCoords; // To hold coordinates when the form is open
const memoryModal = document.getElementById('memory-modal');
const memoryForm = document.getElementById('memory-form');
const cancelButton = document.getElementById('cancel-button');

// --- Main App Initialization ---
function initializeApp() {
    // 1. Initialize the map
    map = L.map('map').setView([20, 0], 3);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // 2. Add event listeners
    map.on('click', onMapClick);
    memoryForm.addEventListener('submit', saveMemory);
    cancelButton.addEventListener('click', closeMemoryForm);

    // 3. Load existing memories from localStorage
    loadMemories();
}

// --- Pin Creation Flow ---
function onMapClick(e) {
    // Save the clicked coordinates and open the form
    tempCoords = e.latlng;
    memoryModal.classList.remove('hidden');
    document.getElementById('title').focus();
}

function closeMemoryForm() {
    memoryForm.reset();
    memoryModal.classList.add('hidden');
}

function saveMemory(e) {
    e.preventDefault(); // Prevent page from reloading

    // 1. Create the new memory object from the form
    const newMemory = {
        id: Date.now(), // Unique ID using timestamp
        lat: tempCoords.lat,
        lng: tempCoords.lng,
        title: document.getElementById('title').value,
        date: document.getElementById('date').value,
        story: document.getElementById('story').value,
        photoUrl: document.getElementById('photoUrl').value
    };

    // 2. Get existing memories, add the new one, and save back to localStorage
    const memories = getMemories();
    memories.push(newMemory);
    localStorage.setItem('sentimentalAtlasMemories', JSON.stringify(memories));

    // 3. Add the pin to the map immediately
    addPinToMap(newMemory);

    // 4. Close and reset the form
    closeMemoryForm();
}

// --- Pin Loading & Displaying ---
function getMemories() {
    const memoriesJSON = localStorage.getItem('sentimentalAtlasMemories');
    return memoriesJSON ? JSON.parse(memoriesJSON) : [];
}

function loadMemories() {
    const memories = getMemories();
    memories.forEach(memory => addPinToMap(memory));
}

function addPinToMap(memory) {
    const marker = L.marker([memory.lat, memory.lng]).addTo(map);

    // Create the beautiful popup content
    let popupContent = `
        <h4>${memory.title}</h4>
        <p><strong>Date:</strong> ${memory.date || 'N/A'}</p>
        <p>${memory.story}</p>
    `;
    if (memory.photoUrl) {
        popupContent += `<img src="${memory.photoUrl}" alt="${memory.title}">`;
    }
    // Add the delete button with the memory's unique ID
    popupContent += `<p><span class="delete-button" data-id="${memory.id}">Delete Memory</span></p>`;
    
    marker.bindPopup(popupContent);
}

// --- Pin Deletion ---
// We use event delegation to listen for clicks on delete buttons that don't exist yet
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('delete-button')) {
        const memoryId = e.target.getAttribute('data-id');
        if (confirm("Are you sure you want to delete this memory forever?")) {
            deleteMemory(Number(memoryId));
        }
    }
});

function deleteMemory(id) {
    let memories = getMemories();
    // Create a new array *without* the memory to be deleted
    const updatedMemories = memories.filter(memory => memory.id !== id);
    
    // Save the new array back to localStorage
    localStorage.setItem('sentimentalAtlasMemories', JSON.stringify(updatedMemories));

    // The simplest way to update the map is to reload the page
    location.reload();
}


// --- Let's Start the App! ---
initializeApp();
