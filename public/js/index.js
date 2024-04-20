import '@babel/polyfill';

import login from './login';
import logout from './logout';
import updateUser from './updateUser';
import displayMap from './mapbox';
import bookTour from './bookTour';

// DOM elements
const map = document.getElementById('map');
const loginForm = document.querySelector('.login-form');
const updateDataForm = document.querySelector('.form-user-data');
const updatePwdForm = document.querySelector('.form-user-settings');

const logoutBtn = document.querySelector('.nav__el--logout');
const bookTourBtn = document.getElementById('book-btn');

if (map) {
  const locations = JSON.parse(map.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}

if (updateDataForm) {
  updateDataForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;

    const formData = new FormData();

    formData.append('name', document.getElementById('name').value);
    formData.append('email', document.getElementById('email').value);
    formData.append('photo', document.getElementById('photo').files[0]);

    updateUser('data', formData);
  });
}

if (updatePwdForm) {
  updatePwdForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    console.log('clicked');

    const currentPasswordInput = document.getElementById('password-current');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('password-confirm');

    const submitBtn = document.querySelector('.btn--save');

    const currentPassword = currentPasswordInput.value;
    const password = passwordInput.value;
    const passwordConfirm = passwordConfirmInput.value;

    console.log(currentPassword, password, passwordConfirm);

    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';

    // window.setTimeout(function () {

    // }, 10000);

    await updateUser('password', {
      currentPassword,
      password,
      passwordConfirm,
    });

    currentPasswordInput.value = '';
    passwordInput.value = '';
    passwordConfirmInput.value = '';

    submitBtn.disabled = false;
    submitBtn.textContent = 'Save password';
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', function (e) {
    e.preventDefault();

    logout();
  });
}

if (bookTourBtn) {
  bookTourBtn.addEventListener('click', function (e) {
    const id = bookTourBtn.dataset.tourId;
    bookTour(id);
  });
}
