const AdminDashboard = {
    template: `
    <div>
    <h2>Sections</h2>
    <ul v-if="sections.length">
      <li v-for="section in sections" :key="section.id">{{ section.name }}</li>
    </ul>
    <p v-else>No sections available.</p>
    
    <input type="text" v-model="newSectionName" placeholder="New Section Name" />
    <button @click="addSection">Add Section</button>

    <h2>Add New Book</h2>
    <input type="text" v-model="newBookTitle" placeholder="Title" />
    <input type="number" v-model="newBookSectionId" placeholder="Section ID" />
    <input type="number" v-model="newBookStock" placeholder="Stock" />
    <button @click="addBook">Add Book</button>

    <h2>Books</h2>
    <ul v-if="books.length">
      <li v-for="book in books" :key="book.id">{{ book.title }}</li>
    </ul>
    <p v-else>No books available.</p>
  </div>`,
  data() {
    return {
      sections: [],
      newSectionName: '',
      newBookTitle: '',
      newBookSectionId: '',
      newBookStock: '',
      books: []
    };
  },
  created() {
    this.fetchSections();
  },
  methods: {
    async fetchSections() {
      try {
        const response = await fetch('/api/sections');
        const data = await response;
        this.sections = data;
        console.log(data);
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    },
    async addSection() {
      try {
        const response = await fetch('/api/sections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('auth-token'),
          },
          body: JSON.stringify({ name: this.newSectionName })
        });
        console.log(response.json());
        this.newSectionName = '';
        this.fetchSections();
      } catch (error) {
        console.error('Error adding section:', error);
      }
    },
    async addBook() {
      try {
        await fetch('/api/books', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: this.newBookTitle,
            section_id: this.newBookSectionId,
            stock: this.newBookStock
          })
        });
        this.newBookTitle = '';
        this.newBookSectionId = '';
        this.newBookStock = '';
      } catch (error) {
        console.error('Error adding book:', error);
      }
    }
  }
};
export default AdminDashboard;