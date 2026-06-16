const express = require('express');
const methodOverride = require('method-override');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- View engine ----
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---- Middleware ----
app.use(express.urlencoded({ extended: true })); // parse form submissions
app.use(methodOverride('_method'));               // lets <form> send PUT/DELETE via ?_method=
app.use(express.static(path.join(__dirname, 'public')));

// ---- "Database" (in-memory only — resets on restart) ----
const CATEGORIES = ['Tech', 'Lifestyle', 'Education'];

let posts = [
  {
    id: '1',
    name: 'Jordan Lee',
    title: 'Why I Finally Switched to Express',
    content:
      'After years of building APIs with vanilla Node, Express finally clicked for me last month. The routing layer alone saved hours of boilerplate, and middleware composition made auth checks trivial to bolt on.',
    category: 'Tech',
    createdAt: new Date('2026-06-10T09:30:00').toISOString()
  },
  {
    id: '2',
    name: 'Priya Nandakumar',
    title: 'A Slower Morning Routine',
    content:
      'I used to start every day by checking three inboxes before I was even out of bed. This week I tried something different: ten quiet minutes before touching my phone. Small change, surprisingly big difference.',
    category: 'Lifestyle',
    createdAt: new Date('2026-06-12T07:15:00').toISOString()
  }
];

let nextId = 3; // simple incrementing id generator

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

// ---- Routes ----

// Home page: list posts (optionally filtered by category)
app.get('/', (req, res) => {
  const { category } = req.query;
  const activeCategory = category && CATEGORIES.includes(category) ? category : 'All';

  const visible =
    activeCategory === 'All' ? posts : posts.filter((p) => p.category === activeCategory);

  const sorted = [...visible].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  res.render('index', {
    posts: sorted,
    categories: CATEGORIES,
    activeCategory,
    formatDate
  });
});

// Create a new post
app.post('/posts', (req, res) => {
  const { name, title, content, category } = req.body;

  if (!name?.trim() || !title?.trim() || !content?.trim()) {
    return res.redirect('/'); // basic guard against empty submissions
  }

  posts.push({
    id: String(nextId++),
    name: name.trim(),
    title: title.trim(),
    content: content.trim(),
    category: CATEGORIES.includes(category) ? category : 'Uncategorized',
    createdAt: new Date().toISOString()
  });

  res.redirect('/');
});

// Show the edit form for a single post
app.get('/posts/:id/edit', (req, res) => {
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) return res.redirect('/');
  res.render('edit', { post, categories: CATEGORIES });
});

// Update a post
app.put('/posts/:id', (req, res) => {
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) return res.redirect('/');

  const { name, title, content, category } = req.body;
  post.name = name?.trim() || post.name;
  post.title = title?.trim() || post.title;
  post.content = content?.trim() || post.content;
  post.category = CATEGORIES.includes(category) ? category : post.category;

  res.redirect('/');
});

// Delete a post
app.delete('/posts/:id', (req, res) => {
  posts = posts.filter((p) => p.id !== req.params.id);
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Blog app running at http://localhost:${PORT}`);
});
