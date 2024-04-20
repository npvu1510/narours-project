import axios from 'axios';
import { showAlert } from './alert';

const bookTour = async function (tourId) {
  try {
    const res = await axios({
      url: `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
      method: 'get',
    });

    if (res.statusText !== 'OK')
      throw new Error('Something went wrong while fetching');

    window.location.assign(res.data.session.url);
  } catch (err) {
    showAlert('error', err.message);
  }
};

export default bookTour;
