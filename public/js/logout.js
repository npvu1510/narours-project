import axios from 'axios';
import { showAlert } from './alert';

const logout = async function () {
  try {
    const res = await axios({
      method: 'post',
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Goodbye');
      window.setTimeout(function () {
        window.location.replace('/');
      }, 500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export default logout;
