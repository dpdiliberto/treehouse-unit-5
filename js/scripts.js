const gallery = document.getElementById('gallery');
let clickIndex;
var userArray;
let selectedUser;
var modalContainer;
let modalInfoContainer;
let searchResults;
let isSearched = false;

const searchContainer = document.querySelector('.search-container');
const searchHTML = `
    <form action="#" method="get">
        <input type="search" id="search-input" class="search-input" placeholder="Search...">
        <input type="submit" value="&#x1F50D;" id="search-submit" class="search-submit">
    </form>`;
searchContainer.insertAdjacentHTML('beforeend', searchHTML);

async function fetchData(url) {
    return fetch(url)
        .then(checkStatus)
        .then(res => res.json())
        .catch(error => console.log('There was an error fetching data: ', error));
}

// fetch 12 random users from the US
fetchData('https://randomuser.me/api/?nat=us&results=12')
    .then(data => {

        userArray = data.results;
        createCards(userArray);

        initializeModal();

        searchContainer.addEventListener('submit', (e) => {
            const searchValue = e.target[0].value.toLowerCase();
            if (searchValue === '') {
                createCards(userArray);
                isSearched = false;
            } else {
                isSearched = true;
                searchResults = [];
                userArray.forEach(searchMatch => {
                    const searchName = `${searchMatch.name.first} ${searchMatch.name.last}`;
                    const searchNameLower = searchName.toLowerCase();
                    if (searchNameLower.includes(searchValue)) {
                        searchResults.push(searchMatch);
                    }
                });
                removeCards();
                createCards(searchResults);
            }
        });

        gallery.addEventListener('click', (e) => {
            if (e.target.className.includes('card')) {
                if (isSearched) {
                    selectedUser = getClickedUser(e, searchResults);
                } else {
                    selectedUser = getClickedUser(e, userArray);
                }
                createModal(selectedUser);
                modalInfoContainer = document.querySelector('.modal-info-container');
                modalContainer.style.display = 'block';
            }
        })

        modalContainer.addEventListener('click', (e) => {
            if (e.target.className === 'modal-close-btn') {
                modalContainer.style.display = 'none';

                modalInfoContainer = document.querySelector('.modal-info-container');
                modalInfoContainer.remove();

            } else if (e.target.id === 'modal-prev') {
                if (clickIndex > 0) {
                    if (isSearched) {
                        toggleUser(getPreviousUser, searchResults);
                    } else {
                        toggleUser(getPreviousUser, userArray);
                    }
                }
            } else if (e.target.id === 'modal-next') {
                if (isSearched ? (clickIndex < searchResults.length - 1) : (clickIndex < userArray.length - 1)) {
                    if (isSearched) {
                        toggleUser(getNextUser, searchResults);
                    } else {
                        toggleUser(getNextUser, userArray);
                    }
                }
            }
        });
    });

// throw an error if fetch response is not ok
function checkStatus(response) {
    if(response.ok) {
        return Promise.resolve(response);
    } else {
        return Promise.reject(new Error(response.statusText));
    }
}

function createCards(dataArray) {
    let index = 0;
    dataArray.forEach(user => {
       let html = `<div id=${index} class="card">
            <div class="card-img-container">
                <img class="card-img" src="${user.picture.large}" alt="profile picture">
            </div>
            <div class="card-info-container">
                <h3 id="name" class="card-name cap">${user.name.first} ${user.name.last}</h3>
                <p class="card-text">${user.email}</p>
                <p class="card-text cap">${user.location.state}</p>
            </div>
       </div>`
       gallery.insertAdjacentHTML('beforeend', html);
       cards = document.querySelectorAll('.card');
       index ++;
    })
}

function removeCards() {
    const cardDiv = document.querySelectorAll('.card');
    cardDiv.forEach(card => card.remove());
}

function getClickedUser(e, dataArray) {
    let selected = e.target;
    
    while (selected.className != 'card') {
        selected = selected.parentElement;
    }
    clickIndex = selected.id;
    const selectedUser = dataArray[clickIndex];
    return selectedUser;
}

function getPreviousUser(selectedUser, dataArray) {
    clickIndex = parseInt(clickIndex) - 1;
    selectedUser = dataArray[clickIndex];
    return selectedUser;
}

function getNextUser(selectedUser, dataArray) {
    clickIndex = parseInt(clickIndex) + 1;
    selectedUser = dataArray[clickIndex];
    return selectedUser;
}

function toggleUser(callback, dataArray) {
    modalInfoContainer = document.querySelector('.modal-info-container');
    modalInfoContainer.remove();
    selectedUser = callback(selectedUser, dataArray);
    createModal(selectedUser);
}

function initializeModal() { 
    const initializedModalHTML = `
    <div class="modal-container">
        <div class="modal">
            <button type="button" id="modal-close-btn" class="modal-close-btn"><strong>X</strong></button>
        </div> 
        <div class="modal-btn-container">
            <button type="button" id="modal-prev" class="modal-prev btn">Prev</button>
            <button type="button" id="modal-next" class="modal-next btn">Next</button>
        </div>
    </div>`;
    gallery.insertAdjacentHTML('beforeend', initializedModalHTML);
    modalContainer = document.querySelector('.modal-container');
    modalContainer.style.display = 'none';

}

function createModal(selectedUser) {

    let cellNumber = formatCellPhone(selectedUser.cell);
    let birthday = formatBirthday(selectedUser.dob.date);
    
    const modalHTML = `
        <div class="modal-info-container">
                <img class="modal-img" src="${selectedUser.picture.large}" alt="profile picture">
                <h3 id="name" class="modal-name cap">${selectedUser.name.first} ${selectedUser.name.last}</h3>
                <p class="modal-text">${selectedUser.email}</p>
                <p class="modal-text cap">${selectedUser.location.city}</p>
                <hr>
                <p class="modal-text">${cellNumber}</p>
                <p class="modal-text">${selectedUser.location.street.number} ${selectedUser.location.street.name}, ${selectedUser.location.city}</p>
                <p class="modal-text">${selectedUser.location.state}, ${selectedUser.location.country} ${selectedUser.location.postcode}</p>
                <p class="modal-text">Birthday: ${birthday}</p>
        </div>`;
    const modal = document.querySelector('.modal');
    modal.insertAdjacentHTML('beforeend', modalHTML);
}

// reformat cell phone number with help of https://stackoverflow.com/questions/8358084/regular-expression-to-reformat-a-us-phone-number-in-javascript
function formatCellPhone(cellNumber) {
    cellNumber = cellNumber.replace(/[^\d]+/g, '')
         .replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    return cellNumber;
}

// reformat date of brith
function formatBirthday(birthday) {
    birthday = birthday.replace(/(\d{4})-(\d{2})-(\d{2}).+/, '$2/$3/$1');
    return birthday;
}