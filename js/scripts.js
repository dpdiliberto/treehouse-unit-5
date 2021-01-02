// Initialize global variables
const gallery = document.getElementById('gallery');
let clickIndex;
var userArray;
let selectedUser;
var modalContainer;
let modalInfoContainer;
let searchResults;
let isSearched = false;

// Add search form
const searchContainer = document.querySelector('.search-container');
const searchHTML = `
    <form action="#" method="get">
        <input type="search" id="search-input" class="search-input" placeholder="Search...">
        <input type="submit" value="&#x1F50D;" id="search-submit" class="search-submit">
    </form>`;
searchContainer.insertAdjacentHTML('beforeend', searchHTML);

// Fetch  data
async function fetchData(url) {
    return fetch(url)
        .then(checkStatus)
        .then(res => res.json())
        .catch(error => console.log('There was an error fetching data: ', error));
}

// Fetch 12 random users from the United States
fetchData('https://randomuser.me/api/?nat=us&results=12')
    .then(data => {

        // Create inital user cards and initialize hidden modal
        // Initial fetched data is  held in the 'userArray' array
        userArray = data.results;
        createCards(userArray);
        initializeModal();

        // Add search functionality to create new user cards that match the search query
        // Searched data results are held in the 'searchResults' array
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

        // Create modal on user card click. 
        // Use 'searchResults' array if there was a form search or 'userArray' array if there wasn't
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

        // Add modal interactivity
        modalContainer.addEventListener('click', (e) => {
            // Close the modal if close button is pressed
            if (e.target.className === 'modal-close-btn' || e.target.textContent === 'X') {
                modalContainer.style.display = 'none';

                modalInfoContainer = document.querySelector('.modal-info-container');
                modalInfoContainer.remove();

            // getPreviousUser if the 'previous button' is clicked, and the current modal is not the first user card
            } else if (e.target.id === 'modal-prev') {
                if (clickIndex > 0) {
                    if (isSearched) {
                        toggleUser(getPreviousUser, searchResults);
                    } else {
                        toggleUser(getPreviousUser, userArray);
                    }
                }

            // getNextUser if the 'next' button is clicked, and the current modal is not the last user card
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

// ------- HELPER FUNCTIONS ------- //

// Resolves or rejects depending on the promise response status
function checkStatus(response) {
    if(response.ok) {
        return Promise.resolve(response);
    } else {
        return Promise.reject(new Error(response.statusText));
    }
}

/* Creates the user cards displayed in the gallery
 * @param {array} dataArray The array containing the users to be displayed
 */
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

// Remove user cards from the gallery
function removeCards() {
    const cardDiv = document.querySelectorAll('.card');
    cardDiv.forEach(card => card.remove());
}

/* Determines which user in the array was clicked based on the selected card
 * @param {event} e The click event
 * @param {array} dataArray The array that the user cards reflect
 * @return {object} selectedUser The clicked user 
 */
function getClickedUser(e, dataArray) {
    let selected = e.target;
    
    while (selected.className != 'card') {
        selected = selected.parentElement;
    }
    clickIndex = selected.id;
    const selectedUser = dataArray[clickIndex];
    return selectedUser;
}

/* Determines the previous user and updates the 'selectedUser'
 *
 * @param {array} dataArray The array that the user cards reflect
 * @return {object} selectedUser The previous user
 */
function getPreviousUser(dataArray) {
    clickIndex = parseInt(clickIndex) - 1;
    selectedUser = dataArray[clickIndex];
    return selectedUser;
}

/* Determines the next user and updates the 'selectedUser'
 * @param {array} dataArray The array that the user cards reflect
 * @return {object} selectedUser The next user
 */
function getNextUser(dataArray) {
    clickIndex = parseInt(clickIndex) + 1;
    selectedUser = dataArray[clickIndex];
    return selectedUser;
}

/* Toggles the user by creating a new modal with the 'selectedUser'
 * @param {function} callback The function that determines who the 'selectedUser' is
 * @param {object} selectedUser The array that the user cards reflect
 */
function toggleUser(callback, dataArray) {
    modalInfoContainer = document.querySelector('.modal-info-container');
    modalInfoContainer.remove();
    selectedUser = callback(dataArray);
    createModal(selectedUser);
}

// Initializes the modal HTML so that the element can be selected but is hidden
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

/* Creates the new modal HTML using the 'selectedUser's data object
 * @param {object} selectedUser The user object whose data is used to create the modal
 */
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

/* Reformats the user's cell phone number 
 * Referred to https://stackoverflow.com/questions/8358084/regular-expression-to-reformat-a-us-phone-number-in-javascript
 * @param {string} cellNumber The user's cell number to be reformatted
 */
function formatCellPhone(cellNumber) {
    cellNumber = cellNumber.replace(/[^\d]+/g, '')
         .replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    return cellNumber;
}

/* Reformats the user's date of birth
 * @param {string} birthday The user's birthday to be reformatted
 */
function formatBirthday(birthday) {
    birthday = birthday.replace(/(\d{4})-(\d{2})-(\d{2}).+/, '$2/$3/$1');
    return birthday;
}