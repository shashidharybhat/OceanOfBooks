const UserDashboard = {
    template: `
    <div class="container mt-4">
    <div v-for="section in sectionsWithBooks" :key="section.id" class="card mb-4">
      <div class="card-header bg-success bg-gradient text-white">
        <h2 class="card-title text-center mb-0">{{ section.name }}</h2>
      </div>
      <div class="card-body">
        <div class="row row-cols-md-4 g-4">
          <div v-for="book in books" :key="book.id" class="col" v-if="book.section_id === section.id">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">{{ book.title }}</h5>
                <p class="card-text">Author: {{ book.author }}</p>
                <p class="card-text">Availability: {{ book.stock }}</p>
                <button v-if="!book.requested && !book.approved" @click.prevent="requestBook(book.id)" class="btn btn-success">Request</button>
                <button v-else-if="book.requested" class="btn btn-secondary disabled">Requested</button>
                <button v-else-if="book.approved" class="btn btn-outline-success disabled">Approved</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="sectionsWithBooks.length === 0" class="text-center">
      <h4>No Sections Available</h4>
    </div>
  </div>`,
    data() {
        return {
            sections: [],
            books: []
        };
    },
    created() {
        this.fetchSections();
        this.fetchBooks();
    },
    computed: {
        sectionsWithBooks() {
            return this.sections.filter(section => this.books.some(book => book.section_id === section.id));
        }
    },
    methods: {
        async fetchSections() {
            try {
                const response = await fetch('/api/sections', {
                    headers: {
                        'Authentication-Token': localStorage.getItem('auth-token')
                    }
                });
                const data = await response.json();
                this.sections = data;
            } catch (error) {
                console.error('Error fetching sections:', error);
            }
        },
        async fetchBooks() {
            try {
                const response = await fetch('/api/books', {
                    method: 'GET',
                    headers: {
                        'Authentication-Token': localStorage.getItem('auth-token')
                    }
                });
                const data = await response.json();
                this.books = data;
                this.fetchBookRequests();
            } catch (error) {
                console.error('Error fetching books:', error);
            }
        },
        async requestBook(bookId) {
            try {
                const response = await fetch(`/api/requests`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': localStorage.getItem('auth-token')
                    },
                    body: JSON.stringify({ "user_id": parseInt(localStorage.getItem('user_id')), "book_id": bookId})
                });
                this.fetchBookRequests();
            } catch (error) {
                console.error('Error requesting book:', error);
            }
        },
        async fetchBookRequests() {
            try {
              const response = await fetch('/api/requests', {
                headers: {
                    method: 'GET',
                  'Authentication-Token': localStorage.getItem('auth-token')
                }
              
              });
              const requests = await response.json();
              this.books.forEach((book,index) => {
                Vue.set(this.books[index], 'requested', requests.some(request => request.book_id === book.id && request.status === 'pending'));
                Vue.set(this.books[index], 'approved', requests.some(request => request.book_id === book.id && request.status === 'approved'));
              });
              console.log(this.books);
            } catch (error) {
              console.error('Error fetching book requests:', error);
            }
          },
    }
};
export default UserDashboard;
