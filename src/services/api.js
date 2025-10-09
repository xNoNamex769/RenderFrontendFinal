import axios from 'axios';

const api = axios.create({
 baseURL: 'https://render-hhyo.onrender.com/api',
});

export default api;
