let currentUtterance = null; // Variable to store the current SpeechSynthesisUtterance
let selectedVoice = null; // Variable to store the selected voice

// Function to load SCP JSON data based on SCP ID
async function loadSCPData(scpId) {
    try {
        // Fetch the specific SCP JSON file based on SCP ID
        const response = await fetch(`data/${scpId}.json`);
        
        // Check if the response is successful (status code 200-299)
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        // Parse and return the JSON data
        return await response.json();
    } catch (error) {
        // Log error if data fetching or parsing fails
        console.error('Failed to load JSON data:', error);
    }
}

// Function to get SCP ID from the current page URL
function getSCPIdFromURL() {
    // Extract the pathname from the URL
    const path = window.location.pathname;
    // Get the filename from the path and remove the .html extension
    const fileName = path.split('/').pop().replace('.html', '');
    // Convert filename to uppercase to match SCP ID format
    return fileName.toUpperCase();
}

// Function to remove HTML tags from a string
function stripHtmlTags(text) {
    if (!text) return '';
    // Create a temporary div element to parse HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    // Extract and return the text content, removing HTML tags
    return tempDiv.textContent || tempDiv.innerText || '';
}

// Function to remove 'N/A' text from a string
function filterText(text) {
    // Replace all instances of 'N/A' with an empty string and trim extra spaces
    return text.replace(/\bN\/A\b/g, '').trim();
}

// Function to replace special characters with readable text
function replaceSpecialCharacters(text) {
    return text
        .replace(/#/g, 'number') // Replace '#' with 'number'
        .replace(/&lt;/g, '<') // Optional: replace HTML entities
        .replace(/&gt;/g, '>'); // Optional: replace HTML entities
}

// Function to initialize the SCP page
async function initializePage() {
    // Get SCP ID from URL
    const scpId = getSCPIdFromURL();
    // Load SCP data using the SCP ID
    const scpItem = await loadSCPData(scpId);

    // If SCP data is not found, log an error and exit
    if (!scpItem) {
        console.error(`SCP ${scpId} not found`);
        return;
    }

    // Populate SCP data into HTML elements
    document.getElementById('item').textContent = scpItem.item || 'N/A';
    document.getElementById('objectClass').textContent = scpItem.objectClass || 'N/A';

    // Handle image display
    const imageElement = document.getElementById('scpImage');
    if (scpItem.image) {
        imageElement.src = `images/${scpItem.image}`;
        imageElement.style.display = 'block';
    } else {
        imageElement.style.display = 'none';
    }

    // Populate description
    document.getElementById('description').innerHTML = scpItem.description ? scpItem.description.join('<br>') : 'N/A';
    // Populate special containment procedures
    document.getElementById('specialContainmentProcedure').innerHTML = scpItem.specialContainmentProcedure ? scpItem.specialContainmentProcedure.join('<br>') : 'N/A';

    // Handle chronological history
    const chronologicalHistoryElement = document.getElementById('chronologicalHistory');
    if (scpItem.chronologicalHistory) {
        chronologicalHistoryElement.innerHTML = scpItem.chronologicalHistory.join('<br>');
        chronologicalHistoryElement.style.display = 'block';
    } else {
        chronologicalHistoryElement.style.display = 'none';
    }

    // Handle space-time anomalies
    const spaceTimeAnomaliesElement = document.getElementById('spaceTimeAnomalies');
    if (scpItem.spaceTimeAnomalies) {
        spaceTimeAnomaliesElement.innerHTML = scpItem.spaceTimeAnomalies.join('<br>');
        spaceTimeAnomaliesElement.style.display = 'block';
    } else {
        spaceTimeAnomaliesElement.style.display = 'none';
    }

    // Handle additional notes
    const additionalNotesElement = document.getElementById('additionalNotes');
    if (scpItem.additionalNotes) {
        additionalNotesElement.innerHTML = scpItem.additionalNotes.join('<br>');
        additionalNotesElement.style.display = 'block';
    } else {
        additionalNotesElement.style.display = 'none';
    }

    // Handle appendix
    const appendixElement = document.getElementById('appendix');
    if (scpItem.appendix) {
        appendixElement.innerHTML = scpItem.appendix.map(item =>
            `<strong>${item.title}</strong><br>${Array.isArray(item.content) ? item.content.join('<br>') : item.content}`
        ).join('<br><br>');
        appendixElement.style.display = 'block';
    } else {
        appendixElement.style.display = 'none';
    }

    // Handle addendum
    const addendumElement = document.getElementById('addendum');
    if (scpItem.addendum) {
        addendumElement.innerHTML = scpItem.addendum.map(item =>
            `<strong>${item.title}</strong><br>${item.content}`
        ).join('<br><br>');
        addendumElement.style.display = 'block';
    } else {
        addendumElement.style.display = 'none';
    }

    // Handle reference
    const referenceElement = document.getElementById('reference');
    if (scpItem.reference && Array.isArray(scpItem.reference)) {
        referenceElement.innerHTML = scpItem.reference.join('<br><br>');
        referenceElement.style.display = 'block';
    } else {
        referenceElement.style.display = 'none';
    }

    // Add event listener to button for playing text-to-speech
    document.getElementById('playDescription').addEventListener('click', () => {
        // Construct full text from available SCP data fields
        let fullText = '';

        if (scpItem.item && scpItem.item !== 'N/A') {
            fullText += `Item Number: ${replaceSpecialCharacters(stripHtmlTags(scpItem.item))}\n`;
        }
        if (scpItem.objectClass && scpItem.objectClass !== 'N/A') {
            fullText += `Object Class: ${replaceSpecialCharacters(stripHtmlTags(scpItem.objectClass))}\n`;
        }
        if (scpItem.specialContainmentProcedure && scpItem.specialContainmentProcedure.length > 0) {
            fullText += `Special Containment Procedure: ${replaceSpecialCharacters(stripHtmlTags(scpItem.specialContainmentProcedure.join(' ')))}}\n`;
        }
        if (scpItem.description && scpItem.description.length > 0) {
            fullText += `Description: ${replaceSpecialCharacters(stripHtmlTags(scpItem.description.join(' ')))}}\n`;
        }
        if (scpItem.chronologicalHistory && scpItem.chronologicalHistory.length > 0) {
            fullText += `Chronological History: ${replaceSpecialCharacters(stripHtmlTags(scpItem.chronologicalHistory.join(' ')))}}\n`;
        }
        if (scpItem.spaceTimeAnomalies && scpItem.spaceTimeAnomalies.length > 0) {
            fullText += `Space-Time Anomalies: ${replaceSpecialCharacters(stripHtmlTags(scpItem.spaceTimeAnomalies.join(' ')))}}\n`;
        }
        if (scpItem.additionalNotes && scpItem.additionalNotes.length > 0) {
            fullText += `Additional Notes: ${replaceSpecialCharacters(stripHtmlTags(scpItem.additionalNotes.join(' ')))}}\n`;
        }
        if (scpItem.appendix && scpItem.appendix.length > 0) {
            fullText += `Appendix: ${replaceSpecialCharacters(stripHtmlTags(scpItem.appendix.map(item => `${item.title}: ${Array.isArray(item.content) ? item.content.join(' ') : item.content}`).join(' ')))}}\n`;
        }
        if (scpItem.addendum && scpItem.addendum.length > 0) {
            fullText += `Addendum: ${replaceSpecialCharacters(stripHtmlTags(scpItem.addendum.map(item => `${item.title}: ${item.content}`).join(' ')))}}\n`;
        }
        if (scpItem.reference && scpItem.reference.length > 0) {
            fullText += `Reference: ${replaceSpecialCharacters(stripHtmlTags(scpItem.reference.join(' ')))}}\n`;
        }

        // Filter out 'N/A' from the text
        const filteredText = filterText(fullText);
        console.log('Filtered Text:', filteredText); // Debugging output
        // Toggle speech synthesis with the filtered text
        toggleSpeak(filteredText, document.getElementById('playDescription'));
    });

    // Load available voices and select one
    loadVoices();
}

// Function to load and select a voice for Speech API
function loadVoices() {
    speechSynthesis.onvoiceschanged = () => {
        const voices = speechSynthesis.getVoices();
        voices.forEach(voice => console.log(voice.name, voice.lang)); // Log available voices for debugging
        // Select an English (New Zealand) voice if available
        selectedVoice = voices.find(voice => voice.lang === 'en-KE');
        if (!selectedVoice) {
            // Fallback to the first available English voice if the preferred one is not found
            selectedVoice = voices.find(voice => voice.lang.startsWith('en'));
        }
    };
}

// Function to toggle Speech API functionality
function toggleSpeak(text, button) {
    if (currentUtterance) {
        // Cancel current speech synthesis if already speaking
        speechSynthesis.cancel();
        currentUtterance = null;
        button.textContent = 'Play Description'; // Reset button text
    } else {
        // Create a new SpeechSynthesisUtterance with the given text
        currentUtterance = new SpeechSynthesisUtterance(text);
        // Set the voice if selected
        if (selectedVoice) {
            currentUtterance.voice = selectedVoice;
        }
        // Reset the current utterance when speech ends
        currentUtterance.onend = () => {
            currentUtterance = null;
            button.textContent = 'Play Description'; // Reset button text
        };
        // Start speaking the text
        speechSynthesis.speak(currentUtterance);
        button.textContent = 'Stop Description'; // Change button text
    }
}

// Initialize the page on load
initializePage();
