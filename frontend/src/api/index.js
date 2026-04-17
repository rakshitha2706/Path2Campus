import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('p2c_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const eapcetAPI = {
  recommend: (data) => api.post('/eapcet/recommend', data),
  getColleges: (params) => api.get('/eapcet/colleges', { params }),
  getCollege: (id) => api.get(`/eapcet/colleges/${id}`),
  getBranches: () => api.get('/eapcet/branches'),
  getPlaces: () => api.get('/eapcet/places'),
  getDistricts: () => api.get('/eapcet/districts'),
};

export const josaaAPI = {
  recommend: (data) => api.post('/josaa/recommend', data),
  getColleges: (params) => api.get('/josaa/colleges', { params }),
  getCollege: (id) => api.get(`/josaa/colleges/${id}`),
  getBranches: () => api.get('/josaa/branches'),
  getInstitutes: () => api.get('/josaa/institutes'),
};

export const collegesAPI = {
  save: (exam, collegeId) => api.post('/colleges/save', { exam, collegeId }),
  unsave: (exam, collegeId) => api.delete(`/colleges/save/${exam}/${collegeId}`),
  getSaved: () => api.get('/colleges/saved'),
};

export const chatbotAPI = {
  send: (message, exam) => api.post('/chatbot', { message, exam }),
};

export default api;
