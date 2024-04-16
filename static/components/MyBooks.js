
const MyBooksPage = {
  template: `
    <div class="container mt-4">
      <h2 class="text-center">My Books</h2>
      <h3 class="text-center">Requested Books</h3>
      <div v-for="book in requestedBooks" :key="book.id" class="row mb-3 bg-light">
        <div class="col">{{ book.title }} by {{ book.author }}</div>
        <div class="col text-end">
          <button @click="deleteRequest(book.id)" class="btn btn-danger">Delete Request</button>
        </div>
      </div>
      <div v-if="requestedBooks.length === 0" class="text-center">
        <h4>No requested books</h4>
      </div>
      <h3 class="text-center">Approved Books</h3>
      <div v-for="book in ApprovedBooks" :key="book.id" class="row mb-3 bg-light">
        <div class="col">{{ book.title }} by {{ book.author }}</div>
        <div class="col text-end">
          <button @click="returnBook(book.id)" class="btn btn-danger">Return Book</button>
        </div>
      </div>
      <div v-if="ApprovedBooks.length === 0" class="text-center">
        <h4>No approved books</h4>
      </div>
      <div v-if="revokedBooks.length != 0">
      <h3 class="text-center">Revoked Books</h3>
      <div v-for="book in revokedBooks" :key="book.id" class="row mb-3 bg-light">
        <div class="col mt-2 mb-2">{{ book.title }} by {{ book.author }}</div>
      </div>
      </div>
      <div v-if="expiredBooks.length != 0">
      <h3 class="text-center">Completed Books</h3>
      <div v-for="book in expiredBooks" :key="book.id" class="row mb-3 bg-light">
        <div class="col mt-2 mb-2">{{ book.title }} by {{ book.author }}</div>
      </div>
    </div>
    `,
  data() {
    return {
      requestedBooks: [],
      ApprovedBooks: [],
      revokedBooks: [],
      expiredBooks: []
    };
  },
  created() {
    this.fetchRequestedBooks();
    this.fetchApprovedBooks();
  },
  methods: {
    async fetchRequestedBooks() {
      try {
        const response = await fetch('/api/requests', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token')
          }
        });
        const requests = await response.json();
        
        console.log(requests);
        const pendingRequests = requests.filter(request => request.status === 'pending');
        const bookIds = pendingRequests.map(request => request.book_id);
        const booksResponse = await fetch('/api/books', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': localStorage.getItem('auth-token')
            }
          });
        const books = await booksResponse.json();
        this.requestedBooks = books.filter(book => bookIds.includes(book.id));
    
      } catch (error) {
        console.error('Error fetching requested books:', error);
      }
    },
    async fetchApprovedBooks() {
      try {
        const response = await fetch('/api/logs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token')
          }
        });
        const logs = await response.json();
        const approvedRequests = logs.filter(request => request.status === 'active');
        const revokedRequests = logs.filter(request => request.status === 'revoked');
        const expiredRequests = logs.filter(request => request.status === 'expired');

        const approvedBookIds = approvedRequests.map(request => request.book_id);
        const revokedBookIds = revokedRequests.map(request => request.book_id);
        const expiredBookIds = expiredRequests.map(request => request.book_id);

        const booksResponse = await fetch('/api/books', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': localStorage.getItem('auth-token')
            }
          });
        const books = await booksResponse.json();
        this.ApprovedBooks = books.filter(book => approvedBookIds.includes(book.id));
        this.revokedBooks = books.filter(book => revokedBookIds.includes(book.id));
        this.expiredBooks = books.filter(book => expiredBookIds.includes(book.id));
      } catch (error) {
        console.error('Error fetching approved books:', error);
      }
    },    
    async deleteRequest(bookId) {
      try {
        await fetch(`/api/requests`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token')
          },
          body: JSON.stringify({ book_id: bookId, user_id: parseInt(localStorage.getItem('user_id'))})
        });
        this.requestedBooks = this.requestedBooks.filter(book => book.id !== bookId);
      } catch (error) {
        console.error('Error deleting request:', error);
      }
    },
    async returnBook(bookId) {
      try {
        await fetch(`/api/logs`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token')
          },
          body: JSON.stringify({ book_id: bookId, user_id: parseInt(localStorage.getItem('user_id')), status: 'returned'})
        });
        this.ApprovedBooks = this.ApprovedBooks.filter(book => book.id !== bookId);
      } catch (error) {
        console.error('Error returning book:', error);
      }
    }
  }
};
export default MyBooksPage;

