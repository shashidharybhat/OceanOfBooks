import home from './components/home.js';
import profile from './components/profile.js';
import login from './components/login.js';
import register from './components/register.js';
import MyBooksPage from './components/MyBooks.js';
import AdminDashboard from './components/AdminDashboard.js';
import UserDashboard from './components/UserDashboard.js';
import AdminRequestsPage from './components/AdminRequests.js';
import AdminStats from './components/AdminStats.js';

const routes = [
    { path: '/', component: UserDashboard, name: 'UserDashboard'},
    { path: '/profile', component: profile },
    { path: '/login', component: login , name: 'Login'},
    { path: '/register', component: register, name: 'Register'},
    { path: '/mybooks', component: MyBooksPage, name: 'MyBooks'},
    { path: '/admin', component: AdminDashboard, name: 'AdminDashboard'},
    { path: '/admin/requests', component: AdminRequestsPage, name: 'AdminRequests'},
    { path: '/admin/stats', component: AdminStats, name: 'AdminStats'},
]

export default new VueRouter({
    routes,
    base: '/',
  })


