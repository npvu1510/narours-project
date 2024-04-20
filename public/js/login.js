import { showAlert } from './alert';

import axios from 'axios';

const login = async function (email, password) {
  try {
    const res = await axios({
      method: 'post',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: { email, password },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Login successully !');
      setTimeout(function () {
        location.replace('/');
      }, 500);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};

export default login;
