const login = {
    template:
        `<div class="container content-section mt-4 bg-light">
            <div class="mb-3 p-5 bg-light">
            <h3 class="mb-3">{{ isAdmin ? 'User' : 'Admin' }} Login</h3>
            <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" name="email" placeholder="Email" v-model="formData.email" />
                <div v-if="!isEmailValid && loginAttempted" class="text-danger mt-2">Please enter a valid email address.</div>
                <label for="password" class="form-label mt-1">Password</label>
                <input type="password" class="form-control" name="password" placeholder="Password" v-model="formData.password" />
                <button class="btn btn-primary mt-2" type="submit" @click.prevent="loginUser">Login</button>
                <div v-if="showErrorMessage" class="text-danger mt-2">Incorrect username or password.</div>
                </div>
        </div>
        <div class="border-top pt-3">
        <small class="text-muted">
            <button class="btn btn-outline-secondary ml-2" @click.prevent="toggleAdminMode">{{ !isAdmin ? 'User' : 'Admin' }} Login</button>
        </small>
    </div>
    </div>
    </div>`,

    data() {
        return {
            formData: {
                email: '',
                password: ''
            },
            isAdmin: false,
            showErrorMessage: false,
            isEmailValid: true,
            loginAttempted: false,
        }
    },
    methods: {
        async loginUser() {
            this.loginAttempted = true;
            this.isEmailValid = this.validateEmail(this.formData.email);

            if (!this.isEmailValid) {
                return;
            }
            const response = await fetch('/Ulogin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.formData),
            })
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('auth-token', data['token']);
                sessionStorage.setItem('auth-token', data['token']);
                localStorage.setItem('user_id', data['id']);
                sessionStorage.setItem('user_id', data['id']);
                localStorage.setItem('role', data['role']);
                sessionStorage.setItem('role', data['role']);
                this.$root.$emit('loginSuccess', true);
                console.log(data['role']);
                if (data['role'] == 'librarian'){
                    this.$router.push('/admin');
                }else{
                this.$router.push('/profile');
                }
            }else{
                this.showErrorMessage = true;
            }
        },
        toggleAdminMode() {
            this.formData.email = '';
            this.formData.password = '';
            this.isAdmin = !this.isAdmin;
        },
        validateEmail(email) {
            const re = /\S+@\S+\.\S+/;
            return re.test(email);
        }
    },

}
export default login;