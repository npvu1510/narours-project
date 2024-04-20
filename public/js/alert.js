// type is 'success' or 'error'
const showAlert = function (type, msg) {
  hideAlert();
  const markup = `<div class='alert alert--${type}'>${msg}</div>`;

  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);

  window.setTimeout(hideAlert, 3000);
};

const hideAlert = function () {
  const alert = document.querySelector('.alert');

  if (alert) alert.parentElement.removeChild(alert);
};

export { showAlert, hideAlert };
