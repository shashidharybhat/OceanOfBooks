const register = {
    template: `
    <div class="container">
        <div class="row">
            <div class="col-12">
                <h1>Register</h1>
                <form @submit.prevent="registerUser">
                    <div class="form-group mb-3">
                        <label for="username">Username</label>
                        <input type="text" class="form-control" name="username" v-model="formData.username" />
                    </div>
                    <div class="form-group mb-3">
                        <label for="email">Email</label>
                        <input type="email" class="form-control" name="email" v-model="formData.email" />
                    </div>
                    <div class="form-group mb-3">
                        <label for="password">Password</label>
                        <input type="password" class="form-control" name="password" v-model="formData.password" />
                    </div>
                    <div class="form-group mb-3">
                        <label for="password">Confirm Password</label>
                        <input type="password" class="form-control" name="password" v-model="formData.confirmPassword" />
                    </div>
                    <button type="submit" class="btn btn-primary">Register</button>
                </form>
            </div>
        </div>
        </div>
        `,

    data() {
        return {
            formData: {
                username: '',
                email: '',
                password: '',
                confirmPassword: '',
                role:'user'
            },
        }
    },
    methods: {
        async registerUser() {
            if (this.formData.password !== this.formData.confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            const response = await fetch('/api/users/all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.formData),
            })
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                this.$router.push('/login');
                console.log('Registered');
            }
        },
    }
}
export default register;