# Remaining Tasks to Complete the Backend

You have the foundation completely built. Here is the exact roadmap of files and folders you need to create to finish the business logic for the remaining services.

---

## 1. User Service (Profile & Discovery)
**Directory Location:** `services/user-service/`
**Goal:** Allow users to manage their profiles, update avatars, and search for friends.

### Files to create/modify:
- **`src/models/user.model.ts`**: Create the Mongoose schema for the user. (You can copy the exact schema you used in the `auth-service`).
- **`src/controllers/user.controller.ts`**:
  - `getUserProfile(req, res)`: Return the logged-in user's data.
  - `updateProfile(req, res)`: Allow updating `name`, `bio`, or `image`.
  - `searchUsers(req, res)`: Search the DB for users matching a username/email query.
- **`src/routes/user.routes.ts`**:
  - Map your controller functions to routes (e.g., `router.get('/profile', verifyToken, getUserProfile)`).
  - *Note:* Import `verifyToken` from your `@talksy/auth` shared package to protect these routes!
- **`src/app.ts`**:
  - Import the `userRoutes` and mount them (e.g., `app.use('/api/users', userRoutes)`).

---

## 2. Media Service (File Uploads)
**Directory Location:** `services/media-service/`
**Goal:** Handle image/avatar/file uploads and return Cloudinary URLs.

### Files to create/modify:
- **`src/config/cloudinary.ts`**: Initialize Cloudinary using your `.env` keys.
- **`src/middleware/multer.ts`**: Setup Multer to handle `multipart/form-data` in memory before sending to Cloudinary.
- **`src/controllers/media.controller.ts`**:
  - `uploadImage(req, res)`: Accept a file, upload to Cloudinary, and return the `secure_url`.
- **`src/routes/media.routes.ts`**:
  - Map the route (e.g., `router.post('/upload', verifyToken, upload.single('file'), uploadImage)`).
- **`src/app.ts`**:
  - Import and mount the `mediaRoutes`.

---

## 3. Chat Service (Real-time Messaging)
**Directory Location:** `services/chat-service/`
**Goal:** The core application. Handle real-time WebSockets and save chat history in PostgreSQL.

### Files to create/modify:
- **`prisma/schema.prisma`**:
  - Run `npx prisma init` in the chat-service folder.
  - Define your tables: `Chat` (isGroupChat, name), `Participant` (userId, chatId), and `Message` (chatId, senderId, content).
  - Run `npx prisma db push` to sync to your Neon Postgres database.
- **`src/controllers/chat.controller.ts`**:
  - `createOrGetChat(req, res)`: Find an existing 1-on-1 chat or create a new one.
  - `getUserChats(req, res)`: Fetch all chat threads for the sidebar.
  - `getMessages(req, res)`: Fetch message history for a specific `chatId`.
- **`src/routes/chat.routes.ts`**:
  - Map REST endpoints to the controller functions.
- **`src/sockets/chat.gateway.ts`**:
  - Move the `io.on("connection")` logic out of `server.ts` into here.
  - Authenticate the socket connection using your `JWT_SECRET`.
  - Add event listeners:
    - `socket.on("join_chat", (chatId) => socket.join(chatId))`
    - `socket.on("send_message", (data) => io.to(data.chatId).emit("new_message", data))`
    - `socket.on("typing", ...)`
- **`src/app.ts`**:
  - Import and mount the `chatRoutes`.

---

## 4. API Gateway (Optional but highly recommended)
**Directory Location:** `services/api-gateway/`
**Goal:** Route all frontend requests through a single port so the React frontend doesn't need to know about ports 3001, 3003, 3004, and 3005.

### If you build this:
- Set up a simple Express server on port `3000`.
- Use `http-proxy-middleware` to forward:
  - `/api/auth` -> `localhost:3001`
  - `/api/users` -> `localhost:3003`
  - `/api/chat` -> `localhost:3004`
  - `/api/media` -> `localhost:3005`
