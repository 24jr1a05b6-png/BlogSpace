# BlogSpace — Full-Stack Blog Platform with Comments

A complete, responsive full-stack blogging platform built for the Thiranex development task. Users can register, log in, publish blog posts, read posts, edit/delete their own posts, and interact through comments.

## 🛠️ Technology Stack

- **Frontend:** HTML5, CSS3, vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas with Mongoose
- **Authentication:** JWT (HttpOnly cookies), bcryptjs
- **Validation:** express-validator
## 📁 Project Structure

```
BlogSpace/
├── backend/                 # Express.js REST API
│   ├── config/db.js         # MongoDB Atlas connection
│   ├── controllers/         # authController, postController, commentController
│   ├── middleware/          # authMiddleware, errorHandler, notFound
│   ├── models/              # User, Post, Comment
│   ├── routes/              # authRoutes, postRoutes, commentRoutes
│   ├── server.js            # App entry point
│   ├── package.json
│   ├── .env                 # (create from .env.example)
│   └── .env.example
└── frontend/                # Vanilla JS frontend
    ├── index.html           # Home page
    ├── login.html           # Login page
    ├── register.html        # Registration page
    ├── post.html            # Blog details page
    ├── create-post.html     # Create / Edit post page
    ├── my-posts.html        # My posts page
    ├── 404.html             # Not found page
    ├── css/style.css
    └── js/                  # app.js, home.js, post.js, create-post.js, my-posts.js
```

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd BlogSpace/backend
npm install
```

Create a `.env` file from `.env.example` and fill in your MongoDB Atlas URI:

```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/blogspace?retryWrites=true&w=majority
JWT_SECRET=your-random-secret
FRONTEND_URL=http://localhost:5500
```

Start the backend:

```bash
### 3. MongoDB Atlas

Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), whitelist your IP, create a database user, and paste the connection string into `backend/.env` as `MONGO_URI`.

## 🔐 Authentication

- JWT is stored in secure, **HttpOnly cookies** set by the backend on login.
- All `fetch` calls use `credentials: 'include'` so cookies are sent automatically.
- Protected routes verify the JWT via `authMiddleware`.
- Passwords are hashed with bcryptjs (salt rounds: 10).
- Duplicate email registration is prevented.
- Only the post/comment author can edit or delete (enforced in backend, not just UI).

## 📋 API Endpoints

### Auth
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register user | Public |
| POST | `/api/auth/login` | Login (sets cookie) | Public |
| POST | `/api/auth/logout` | Clear cookie | Private |
| GET | `/api/auth/me` | Get current user | Private |

### Posts
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/posts` | List posts (search, category, page) | Public |
| GET | `/api/posts/:id` | Get single post | Public |
| POST | `/api/posts` | Create post | Private |
| PUT | `/api/posts/:id` | Update post | Author only |
| DELETE | `/api/posts/:id` | Delete post | Author only |
| GET | `/api/posts/categories` | List categories | Public |

### Comments
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/posts/:postId/comments` | Get comments for a post | Public |
| POST | `/api/posts/:postId/comments` | Add comment | Private |
| PUT | `/api/comments/:id` | Update comment | Author only |
| DELETE | `/api/comments/:id` | Delete comment | Author only |

## ✨ Features

- Registration & login with JWT HttpOnly cookies
- Persistent login across page refreshes
- Password hashing with bcryptjs
- Full CRUD for blog posts
- Only authors can edit/delete their posts (backend enforced)
- Comments on posts with full CRUD
- Search posts by title/content
- Filter by category
- Newest posts first
- Responsive design (mobile, tablet, desktop)
- Loading, empty, and error states
- Confirmation before deleting
- Success/error notifications
- Modern, professional UI

npm run dev    # development (nodemon)
# or
npm start      # production
```

Server runs on `http://localhost:5000`.

### 2. Frontend Setup

Serve the frontend on a local server (e.g., VS Code Live Server on port 5500, or `python -m http.server 5500`). Opening `file://` directly may block CORS.

> Set `FRONTEND_URL=http://localhost:5500` in backend `.env` to match.

- **Env:** dotenv
- **CORS:** cors (with credentials)
- **Dev:** nodemon
