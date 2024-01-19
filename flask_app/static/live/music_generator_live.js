


var slider = document.getElementById("myRange");
var output = document.getElementById("temperatureDisplay");
let temperatureValue = 0.7;
output.innerHTML = temperatureValue;



slider.oninput = function() {
 temperatureValue = slider.value/100;
output.innerHTML = temperatureValue;

}



let sequenceGenerated = false;
let useVA = false;
let globalContext = [173]; // Initial context


const generateButton = document.getElementById('generateButton');
const clearContextButton = document.getElementById('clearContextButton');
const useVAcheckbox = document.getElementById('noVA');

const midiPlayer = document.querySelector('midi-player');
const midiVisualizer = document.querySelector('midi-visualizer');




useVAcheckbox.addEventListener('change', function() {
    useVA = useVAcheckbox.checked;
    globalContext = [221];
    const quadrantsDiv = document.getElementById('quadrants');
    quadrantsDiv.style.display = useVA ? 'block' : 'none';
    generateButton.textContent = 'Generate MIDI Sequence';
    clearContext();
});
document.addEventListener('DOMContentLoaded', function() {
    let statusInterval = null;

    function updateEEGStatus() {
        fetch('/eeg_status', { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                document.getElementById('successText').innerText = data.message;
                // Additional UI updates based on data.status can be added here
            })
            .catch(error => {
                console.error('Error fetching EEG status:', error);
                clearInterval(statusInterval); // Stop polling if there's an error
            });
    }

    document.getElementById('connectEEGButton').addEventListener('click', function() {
        // Show spinner
        document.getElementById('spinner').style.display = 'inline-block';

        // Make a request to the Flask endpoint
        fetch('/connect_eeg', { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                // Hide spinner
                document.getElementById('spinner').style.display = 'none';

                if(data.status === 'success') {
                    // Show success message
                    document.getElementById('successText').innerText = data.message;
                    document.getElementById('successText').classList.remove('text-danger');
                    document.getElementById('successText').classList.add('text-success');
                    document.getElementById('successText').classList.remove('visually-hidden');

                    // Change the button to a success state
                    document.getElementById('connectEEGButton').classList.remove('btn-primary');
                    document.getElementById('connectEEGButton').classList.add('btn-success');

                    // Start polling for EEG status updates every 2 seconds
                    statusInterval = setInterval(updateEEGStatus, 5000);
                } else if(data.status === 'error') {
                    // Show error message
                    document.getElementById('successText').innerText = 'Failed to connect to EEG headset: ' + data.message;
                    document.getElementById('successText').classList.add('text-danger');
                    document.getElementById('successText').classList.remove('visually-hidden');
                }
            })
            .catch(error => {
                console.error('Fetch operation error:', error);
                document.getElementById('spinner').style.display = 'none';
                document.getElementById('successText').innerText = 'Network error: ' + error;
                document.getElementById('successText').classList.add('text-danger');
                document.getElementById('successText').classList.remove('visually-hidden');
            });
    });
});


let quadrantCounts = [0,0,0,0];

 // Get the canvas and context
 const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');


        // Function to draw the initial quadrants
        function drawQuadrants() {
            const width = canvas.width;
            const height = canvas.height;

            
            ctx.strokeStyle = 'white'

            // Draw horizontal line
            ctx.moveTo(0, height / 2);
            ctx.lineTo(width, height / 2);

            // Draw vertical line
            ctx.moveTo(width / 2, 0);
            ctx.lineTo(width / 2, height);

            // Stroke the lines
            ctx.lineWidth = 5;
            ctx.stroke();

            ctx.font = '20px Arial';
            ctx.fillStyle = 'white';

            ctx.fillText("Angry - LVHA",  width * 0.025, height * 0.05); // Top-left
            ctx.fillText("Happy - HVHA", width * 0.52, height * 0.05); // Top-right
            ctx.fillText("Sad - LVLA", width * 0.025, height * 0.55); // Bottom-left
            ctx.fillText("Relaxed - HVLA", width * 0.52  , height * 0.55); // Bottom-right
        }

        // Function to update the tally for a quadrant
        function updateTally(x, y) {
            const width = canvas.width;
            const height = canvas.height;

            // Determine the quadrant
            let quadrant;
            if (x < width / 2 && y < height / 2) {
                quadrant = 1; // Top-left
            } else if (x >= width / 2 && y < height / 2) {
                quadrant = 0; // Top-right
            } else if (x < width / 2 && y >= height / 2) {
                quadrant = 2; // Bottom-left
            } else {
                quadrant = 3; // Bottom-right
            }

            // Increment the count for the quadrant and cycle back to 0 if it's currently 4
            quadrantCounts[quadrant] = (quadrantCounts[quadrant] + 1) % 5;

            // Redraw the quadrant tallies
            drawTallies();
        }

        
        function drawTallies() {
            const width = canvas.width;
            const height = canvas.height;

            // Clear the canvas first
            ctx.clearRect(0, 0, width, height);

            // Redraw the quadrants
            drawQuadrants();

            // Set font for tally text
            ctx.font = '20px Arial';
            ctx.fillStyle = 'white';

            // Draw the tally for each quadrant
            ctx.fillText(quadrantCounts[1], width * 0.25, height * 0.25); // Top-left
            ctx.fillText(quadrantCounts[0], width * 0.75, height * 0.25); // Top-right
            ctx.fillText(quadrantCounts[2], width * 0.25, height * 0.75); // Bottom-left
            ctx.fillText(quadrantCounts[3], width * 0.75, height * 0.75); // Bottom-right
        }

        // Event listener for canvas click
                canvas.addEventListener('click', function(event) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            updateTally(x, y);
        });

        // Initial draw
        drawTallies();



const downloadButton = document.getElementById('downloadButton');
let midiBlob; 



      const clearContext = () => {
        sequenceGenerated = false;

        if (useVA){
            globalContext = [221]
         }
        else {globalContext = [173];  }
        downloadButton.style.display = 'none'; 
        
        midiPlayer.src = '';
        midiVisualizer.src = '';
    }


    clearContextButton.addEventListener('click', () => {
        clearContext();
        updateButtonText();  // Reset the flag
        // Update the button text
    });

    function updateButtonText() {
    
    generateButton.textContent = sequenceGenerated ? 'Add to Sequence' : 'Generate MIDI Sequence';
        
}


function updateMidiSource() {
    var input = document.getElementById('midiFileInput');
    var file = input.files[0];
    if (file) {
        var reader = new FileReader();

        reader.onload = function(e) {
         

            midiPlayer.src = e.target.result;
            midiVisualizer.src = e.target.result;
            
            // midiPlayer.stop();
            // midiPlayer.start();
        };

        reader.readAsDataURL(file);
    }
}


const displayTokenByToken = (tokens) => {
    tokenDisplay.innerHTML = ''; // Clear current display
    let index = 0;

    const intervalId = setInterval(() => {
        if(index < tokens.length){
            let span = document.createElement('span');
            span.classList.add('token');
            span.textContent = tokens[index] + ' ';
            tokenDisplay.appendChild(span);
            index++;
        } else {
            clearInterval(intervalId);
        }
    }, 1); // Adjust the interval time as needed
}



document.getElementById('midiFileInput').addEventListener('change', updateMidiSource);
const tokenDisplay = document.getElementById("text");




document.getElementById('generateButton').addEventListener('click', async () => {
        await Tone.start()
        console.log('audio is ready')
        
        const maxValue = parseInt(document.getElementById('maxValueInput').value);
        
        if (isNaN(maxValue) || maxValue <= 0) {
            alert('Please enter a valid sequence length.');
            return;
        }
        
        const requestPayload = {
            sequence_length: maxValue,
            context: globalContext,
            quadrant_use : useVA,
            quadrant_counts : quadrantCounts,
            temperatureValue : temperatureValue
        };


        try {
            const response = await fetch('/generate_midi_demo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestPayload)
            });

            if (response.ok) {
                const responseData = await response.json();

                
                const newSequence = responseData.context;
                globalContext = newSequence;

                // Update the download button with the link to the MIDI file
                downloadButton.style.display = 'block';
                
                downloadButton.href = responseData.midi_file_url;
                downloadButton.download = 'generated_midi_seq.mid';
                
                midiPlayer.src = responseData.midi_file_url;
                midiVisualizer.src = responseData.midi_file_url;
                console.log(midiPlayer);

                midiPlayer.stop();
                midiPlayer.start();
                // Update generate button text
                sequenceGenerated = true;
                updateButtonText();
            } else {
                throw new Error('Failed to generate MIDI file');
            }
        } catch (error) {
            console.error(error.message);
        }
    });




