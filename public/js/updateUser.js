import axios from 'axios';
import { showAlert } from './alert';

const updateUser = async function (type, data) {
  const url =
    type === 'password'
      ? 'http://127.0.0.1:3000/api/v1/users//update-password'
      : 'http://127.0.0.1:3000/api/v1/users/update-me';
  try {
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `Update ${type} successfully`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export default updateUser;
