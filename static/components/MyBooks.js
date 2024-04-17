
const MyBooksPage = {
  template: `
    <div class="container mt-4">
      <h2 class="text-center">My Books</h2>
      <h3 class="text-center">Requested Books</h3>
      <div v-if="deniedRequests.length > 0">
        <div v-for="request in deniedRequests" :key="request.id" class="row mt-3 mb-3 bg-light">
          <div class="col">{{ request.title }} by {{ request.author }} - Request Denied</div>
          <div class="col text-end">
            <button @click="acknowledgeRequestDenial(request.id)" class="btn btn-outline-danger">Acknowledge Denial</button>
          </div>
        </div>
      </div>
      <div v-for="book in requestedBooks" :key="book.id" class="row mb-3 bg-light">
        <div class="col">{{ book.title }} by {{ book.author }}</div>
        <div class="col text-end">
          <button @click="deleteRequest(book.id)" class="btn btn-danger">Delete Request</button>
        </div>
      </div>
      <div v-if="requestedBooks.length === 0" class="text-center">
        <h4>No requested books</h4>
      </div>
      <h3 class="text-center mt-3">Active Books</h3>
      <div v-for="book in ApprovedBooks" :key="book.id" class="row mb-3 bg-light">
        <div class="col">{{ book.title }} by {{ book.author }}</div>
        <div class="col text-end">
          <button @click="returnBook(book.id)" class="btn btn-danger">Return Book</button>
        </div>
      </div>
      <div v-if="ApprovedBooks.length === 0" class="text-center">
        <h4>No Active books</h4>
      </div>
      <div v-if="revokedBooks.length != 0">
      <h3 class="text-center">Revoked Books</h3>
      <div v-for="book in revokedBooks" :key="book.id" class="row mb-3 bg-light">
        <div class="col mt-2 mb-2">{{ book.title }} by {{ book.author }}</div>
        <div class="col text-end"><button class="btn btn-outline-danger" @click="acknowledgeRevocation(book.id)">Acknowledge Revocation</button></div>
      </div>
      </div>
      <div v-if="expiredBooks.length != 0">
      <h3 class="text-center">Completed Books</h3>
      <div v-for="book in expiredBooks" :key="book.id" class="row mb-3 bg-light">
        <div class="col mt-2 mb-2">{{ book.title }} by {{ book.author }}</div>
        <div class="col text-end"><button class="btn btn-outline-success" @click="getFeedback(book.id)">Provide Feedback</button></div>
      </div>
      </div>
      <div class="modal fade" id="feedbackModal" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Feedback</h5>
              <button type="button" class="btn-close" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center">
              <form @submit.prevent="submitFeedback">
                <div class="mb-3">
                  <label for="feedback" class="form-label">Feedback</label>
                  <textarea id="feedback" class="form-control" rows="3" v-model="feedback.comment"></textarea>
                  <label for="rating" class="form-label mt-2">Rating</label>
                  <input type="number" id="rating" class="form-control" v-model="feedback.rating" min="1" max="5">
                </div>
                <button type="submit" class="btn btn-primary">Submit</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,
  data() {
    return {
      requestedBooks: [],
      ApprovedBooks: [],
      revokedBooks: [],
      expiredBooks: [],
      deniedRequests: [],
      feedback: {
        book_id: null,
        user_id: parseInt(localStorage.getItem('user_id')),
        rating: 0,
        comment: ''
      },
      getFeedbackModal: null,
    };
  },
  created() {
    this.fetchRequestedBooks();
    this.fetchApprovedBooks();
  },
  mounted() {
    this.getFeedbackModal = new bootstrap.Modal(document.getElementById('feedbackModal'));
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
        const pendingRequests = requests.filter(request => request.status === 'pending');
        const deniedRequests = requests.filter(request => request.status === 'denied');
        const pendingBookIds = pendingRequests.map(request => request.book_id);
        const deniedBookIds = deniedRequests.map(request => request.book_id);
        const booksResponse = await fetch('/api/books', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': localStorage.getItem('auth-token')
            }
          });
        const books = await booksResponse.json();
        this.requestedBooks = books.filter(book => pendingBookIds.includes(book.id));
        this.deniedRequests = books.filter(book => deniedBookIds.includes(book.id));
    
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
        const expiredRequests = logs.filter(request => request.status === 'expired' || request.status === 'returned');

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
    },
    getFeedback(bookId) { 
      this.bookId = bookId;
      this.getFeedbackModal.show();
    },
    async submitFeedback() {
      try {
        this.feedback.book_id = this.bookId;
        const response = await fetch(`/api/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token')
          },
          body: JSON.stringify(this.feedback)
        });
        this.getFeedbackModal.hide();
      } catch (error) {
        console.error('Error submitting feedback:', error);
      }
    },
    async acknowledgeRequestDenial(bookId) {
      try {
        await fetch(`/api/requests`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token')
          },
          body: JSON.stringify({ book_id: bookId, user_id: parseInt(localStorage.getItem('user_id'))})
        });
        this.deniedRequests = this.deniedRequests.filter(book => book.id !== bookId);
      } catch (error) {
        console.error('Error acknowledging denial:', error);
      }
    },
    async acknowledgeRevocation(bookId) {
      try {
        await fetch(`/api/logs`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('auth-token')
          },
          body: JSON.stringify({ book_id: bookId, user_id: parseInt(localStorage.getItem('user_id')), status: 'revoked-Acknowledged'})
        });
        this.revokedBooks = this.revokedBooks.filter(book => book.id !== bookId);
      } catch (error) {
        console.error('Error acknowledging revocation:', error);
      }
    }
  }
};
export default MyBooksPage;

