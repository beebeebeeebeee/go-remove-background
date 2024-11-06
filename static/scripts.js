let colorThreshold = 100 * 256;
let backgroundColor = 'white';
let invertColors = false;

document.querySelectorAll('input[name="backgroundColor"]').forEach((elem) => {
    elem.addEventListener('change', function(event) {
        backgroundColor = event.target.value;
    });
});

document.getElementById('invertColors').addEventListener('change', function(event) {
    invertColors = event.target.checked;
});

function showSnackbar(message) {
    const snackbar = document.getElementById('snackbar');
    snackbar.textContent = message;
    snackbar.className = 'show';
    setTimeout(() => {
        snackbar.className = snackbar.className.replace('show', '');
    }, 3000);
}

function previewImage(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const preview = document.getElementById('preview');
        preview.innerHTML = `<img src="${e.target.result}" alt="Image Preview" style="max-width: 100%; height: auto;">`;
    };

    if (file) {
        reader.readAsDataURL(file);
    }
}

async function uploadImage() {
    const input = document.querySelector('input[type="file"]');
    const file = input.files[0];
    if (!file) {
        showSnackbar('Please select an image to upload.');
        return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('threshold', colorThreshold);
    formData.append('backgroundColor', backgroundColor);
    formData.append('invertColors', invertColors);

    // Show loading indicator
    const preview = document.getElementById('preview');
    preview.innerHTML = '<p>Loading...</p>'; // You can replace this with a spinner if you prefer

    try {
        const response = await axios.post('./upload', formData, {responseType: 'arraybuffer'});
        const base64Image = btoa(
            new Uint8Array(response.data)
                .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        showSnackbar('Image uploaded successfully!');

        // Update the preview with the uploaded image
        preview.innerHTML = '';
        const img = document.createElement('img');
        img.src = `data:image/png;base64,${base64Image}`; // Adjust the MIME type if necessary
        preview.appendChild(img);
    } catch (error) {
        showSnackbar('Error uploading image.');
        preview.innerHTML = ''; // Clear the loading indicator
    }
}

function updateThresholdValue(value) {
    document.getElementById('thresholdValue').innerText = value;
    colorThreshold = value * 256;
}