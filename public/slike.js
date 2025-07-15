document.getElementById('addImage').addEventListener('click', function () {
    const imageSource = prompt("Unesite URL slike:");

    if (imageSource) {
        const position = { x: 100, y: 300 };
        const dimensions = { width: 200, height: 200 };

        socket.emit('add-image', imageSource, position, dimensions);
    } else {
        alert('URL slike nije unet.');
    }
});

socket.on('display-image', (data) => {
    addImageToDOM(data.imageUrl, data.position, data.dimensions);
});

socket.on('initial-images', (images) => {
    images.forEach((imageData) => {
        addImageToDOM(imageData.imageUrl, imageData.position, imageData.dimensions);
    });
});

socket.on('update-images', (updatedImages) => {
    document.querySelectorAll('img').forEach(slika => {
        if (slika.id !== "playerCover") {
            slika.remove();
        }
    });

    updatedImages.forEach((imageData) => {
        addImageToDOM(imageData.imageUrl, imageData.position, imageData.dimensions);
    });
});

function addImageToDOM(imageUrl, position, dimensions) {
    let existingImage = document.querySelector(`img[src="${imageUrl}"]`);
    if (!existingImage) {
        const newImage = document.createElement('img');
        newImage.src = imageUrl;
        newImage.style.width = dimensions.width + 'px';
        newImage.style.height = dimensions.height + 'px';
        newImage.style.position = "absolute";
        newImage.style.left = position.x + 'px';
        newImage.style.top = position.y + 'px';
        newImage.style.zIndex = "1000";
        newImage.classList.add('draggable', 'resizable');

        const authorizedUsers = new Set(['Radio Galaksija', 'ZI ZU', '*__X__*']); 

        newImage.addEventListener('contextmenu', function (event) {
            event.preventDefault();
            if (authorizedUsers.has(currentUser)) {
                if (confirm("Da li želiš da obrišeš ovu sliku?")) {
                    newImage.remove();
                    socket.emit('remove-image', newImage.src);
                }
            }
        });

        if (authorizedUsers.has(currentUser)) {
            enableDragAndResize(newImage);
        }

        document.body.appendChild(newImage);
    }
}

// Funkcija za omogućavanje drag-and-resize funkcionalnosti za sliku
function enableDragAndResize(img) {
    let isResizing = false;
    let resizeSide = null;

    // Onemogućava promenu kursora prilikom pomeranja slike
    img.style.cursor = 'default';

     img.addEventListener('mousedown', function (e) {
        const rect = img.getBoundingClientRect();
        const borderSize = 10;

        if (e.clientX >= rect.left && e.clientX <= rect.left + borderSize) {
            resizeSide = 'left';
        } else if (e.clientX >= rect.right - borderSize && e.clientX <= rect.right) {
            resizeSide = 'right';
        } else if (e.clientY >= rect.top && e.clientY <= rect.top + borderSize) {
            resizeSide = 'top';
        } else if (e.clientY >= rect.bottom - borderSize && e.clientY <= rect.bottom) {
            resizeSide = 'bottom';
        }

        if (resizeSide) {
            isResizing = true;
            const initialWidth = img.offsetWidth;
            const initialHeight = img.offsetHeight;
            const startX = e.clientX;
            const startY = e.clientY;

            document.onmousemove = function (e) {
                if (isResizing) {
                    if (resizeSide === 'right') {
                        img.style.width = initialWidth + (e.clientX - startX) + 'px';
                    } else if (resizeSide === 'bottom') {
                        img.style.height = initialHeight + (e.clientY - startY) + 'px';
                    } else if (resizeSide === 'left') {
                        const newWidth = initialWidth - (e.clientX - startX);
                        if (newWidth > 10) {
                            img.style.width = newWidth + 'px';
                            img.style.left = rect.left + (e.clientX - startX) + 'px';
                        }
                    } else if (resizeSide === 'top') {
                        const newHeight = initialHeight - (e.clientY - startY);
                        if (newHeight > 10) {
                            img.style.height = newHeight + 'px';
                            img.style.top = rect.top + (e.clientY - startY) + 'px';
                        }
                    }
                }
            };

            document.onmouseup = function () {
                isResizing = false;
                resizeSide = null;
                document.onmousemove = null;
                document.onmouseup = null;

                // Emitujemo promene na server
                emitImageUpdate(img);
            };
        } else {
            dragMouseDown(e);
        }
    });

    function dragMouseDown(e) {
        e.preventDefault();
        let pos3 = e.clientX;
        let pos4 = e.clientY;

        document.onmouseup = closeDragElement;
        document.onmousemove = function (e) {
            img.style.top = (img.offsetTop - (pos4 - e.clientY)) + 'px';
            img.style.left = (img.offsetLeft - (pos3 - e.clientX)) + 'px';
            pos3 = e.clientX;
            pos4 = e.clientY;
        };
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;

        // Emitujemo promene na server
        emitImageUpdate(img);
    }
}

// Funkcija za emitovanje podataka o slici (pozicija i dimenzije)
function emitImageUpdate(img) {
    const position = { x: img.offsetLeft, y: img.offsetTop }; // Pozicija slike
    const dimensions = { width: img.offsetWidth, height: img.offsetHeight }; // Dimenzije slike
    const imageUrl = img.src; // URL slike
     updateImageOnServer(imageUrl, position, dimensions);
}

// Funkcija za slanje podataka o slici serveru
function updateImageOnServer(imageUrl, position, dimensions) {
     socket.emit('update-image', {
        imageUrl: imageUrl,
        position: position,
        dimensions: dimensions
    });
}

// Funkcija za sinhronizaciju slike sa servera
socket.on('sync-image', (data) => {
    const syncedImage = document.querySelector(`img[src="${data.imageUrl}"]`); // Selektujemo sliku po URL-u
    if (syncedImage) {
        syncedImage.style.left = data.position.x + 'px';
        syncedImage.style.top = data.position.y + 'px';
        syncedImage.style.width = data.dimensions.width + 'px';
        syncedImage.style.height = data.dimensions.height + 'px';
        
    }
});
