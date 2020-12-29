var gallery = document.getElementById('gallery');

async function fetchData(url) {
    return fetch(url)
        .then(checkStatus)
        .then(res => res.json())
        .catch(error => console.log('Error: ', error));
}

fetchData('https://randomuser.me/api/?results=12')
    .then(data => {
        console.log(data.results);
        const dataArray = data.results;
        let index = 0;
        dataArray.forEach(user => {
           let html = `<div id=${index} class="card">
           <div class="card-img-container">
               <img class="card-img" src="${user.picture.large}" alt="profile picture">
           </div>
           <div class="card-info-container">
               <h3 id="name" class="card-name cap">${user.name.first} ${user.name.last}</h3>
               <p class="card-text">${user.email}</p>
               <p class="card-text cap">${user.location.country}</p>
           </div>
           </div>`
           gallery.insertAdjacentHTML('beforeend', html);
           index ++;
        })
        const cards = document.querySelectorAll('.card');
        console.log(cards); 
        var modalContainer;
        var closeButton;
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                let selected = e.target;
                while (selected.className != 'card') {
                    selected = selected.parentElement;
                }
                const clickIndex = selected.id;
                const selectedUser = dataArray[clickIndex];
                const modalHTML = `
                <div class="modal-container">
                    <div class="modal">
                        <button type="button" id="modal-close-btn" class="modal-close-btn"><strong>X</strong></button>
                        <div class="modal-info-container">
                            <img class="modal-img" src="${selectedUser.picture.large}" alt="profile picture">
                            <h3 id="name" class="modal-name cap">${selectedUser.name.first} ${selectedUser.name.last}</h3>
                            <p class="modal-text">${selectedUser.email}</p>
                            <p class="modal-text cap">${selectedUser.location.city}</p>
                            <hr>
                            <p class="modal-text">${selectedUser.cell}</p>
                            <p class="modal-text">${selectedUser.location.street.number} ${selectedUser.location.street.name}, ${selectedUser.location.city}, ${selectedUser.location.country} ${selectedUser.location.postcode}</p>
                            <p class="modal-text">Birthday: ${selectedUser.dob.date}</p>
                        </div>
                    </div>
                </div>`;
                gallery.insertAdjacentHTML('beforeend', modalHTML);
                modalContainer = document.querySelector('.modal-container');
                closeButton = document.querySelector('#modal-close-btn');
                console.log(closeButton);

                closeButton.addEventListener('click', () => {
                    gallery.removeChild(modalContainer);
                });
            })
        });
    });

function checkStatus(response) {
    if(response.ok) {
        return Promise.resolve(response);
    } else {
        return Promise.reject(new Error(response.statusText));
    }
}

