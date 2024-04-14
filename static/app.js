import router from './router.js';
import UserNavbar from './components/UserNavbar.js';
import AdminNavbar from './components/AdminNavbar.js';

router.beforeEach((to, from, next) => {
    if ((to.name !== 'Login' && to.name !== 'Register') && !localStorage.getItem('auth-token') ? true : false) router.push({ path: 'Login' });
    else next()
  })

const app = new Vue({
    template: `
    <div class="container-fluid w-100 p-0">
        <AdminNavbar v-if="isAdmin" @toggleAuth="toggleAuth"></AdminNavbar>
        <UserNavbar v-else :isLoggedIn='isLoggedIn' @toggleAuth="toggleAuth"></UserNavbar>
        <router-view></router-view>
    </div>
    `,
    el: '#app',
    router,
    delimiters: ['{{', '}}'],
    components: {
        UserNavbar,
        AdminNavbar
    },
    data: function (){
        return {
            isLoggedIn: false,
            isAdmin: false,
        }
    },
    methods: {
        toggleAuth() {
            this.isLoggedIn = !this.isLoggedIn;
        },
    },
    created() {
        this.$root.$on('loginSuccess', (logged) => {
            const authToken = sessionStorage.getItem('auth-token') || localStorage.getItem('auth-token');
            if (logged) {
                const current_role = sessionStorage.getItem('role') || localStorage.getItem('role');
                if (authToken && current_role == 'librarian') {
                    this.isAdmin = true;
                    console.log('Welcome Librarian');
                }else{
                    this.isAdmin = false;
                    this.isLoggedIn = true;
                    console.log('Welcome User');
                }
            } else {
                console.log('Successfully Logged out');
            }
        });
    },
});