
const MyBooksPage ={
    template: `
    <div>
      <h2>Welcome, {{ user.name }}</h2>
      <div v-if="user.books.length === 0">
        <p>No books currently borrowed.</p>
      </div>
      <div v-else>
        <h3>My Books</h3>
        <!-- Loop through each section -->
        <div v-for="(section, index) in sections" :key="index">
          <h4>{{ section.name }}</h4>
          <ul>
            <!-- Filter user's books for the current section -->
            <li v-for="book in user.books.filter(b => b.sectionId === section.id)" :key="book.id">
              {{ book.title }} - {{ book.author }}
              <button @click="returnBook(book.id)">Return</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
    `,
    data() {
      return {
        user: {
          username: '', // Assuming user object has name and books array
          books: [],
        },
        sections: [], // Array of sections
      };
    },
    created() {
      // Fetch user's borrowed books and available sections from backend API
      this.fetchUserBooks();
      //this.fetchSections();
    },
    methods: {
      async fetchUserBooks() {
        // Call your backend API to fetch user's borrowed books
        response = await fetch('/api/books/user');
        this.user.books = await response.json();
        console.log(this.user.books);
        
      },
      fetchSections() {
        // Call your backend API to fetch available sections
        
      },
      returnBook(bookId) {
        // Call your backend API to return a book

      },
    },
  };
export default MyBooksPage;

  