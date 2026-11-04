# TaskFlow — Interview Notes

> Quick reference for React developer interviews (0–3 years experience).

---

## ⚡ 30-Second Pitch

> "TaskFlow is a full-stack Kanban task manager I built from scratch. The tech stack is React 18 with Redux Toolkit on the frontend, Node.js/Express with MongoDB on the backend, and I integrated Mistral AI so users can type a goal and get AI-generated subtask suggestions. I focused on real-world patterns: JWT authentication, drag-and-drop with optimistic UI updates, debounced search, route-level code splitting, and mobile-first responsive design. The whole app is deployable to Vercel and is structured for a professional portfolio."

---

## 🗣 2-Minute Walkthrough

**1. Auth (10s):** "Users register or log in. The JWT is stored in localStorage and attached to every API call via an Axios request interceptor. A 401 response triggers auto-logout."

**2. Boards (10s):** "After login, users see their Dashboard — a grid of their Kanban boards. They can create a new board with a name, click into it, rename it, or delete it. Deleting a board also cascades to delete all its tasks."

**3. Kanban View (20s):** "Inside a board, tasks are organized in three columns: To Do, In Progress, and Done. Users can drag a task card between columns — that's powered by @hello-pangea/dnd. The UI updates immediately (optimistic update), and the new status is synced to the backend. If the backend fails, the UI rolls back and shows a toast error."

**4. Task CRUD (15s):** "Clicking 'Add Task' opens a modal with fields for title, description, priority (Low/Medium/High), status, and due date. Due dates turn red if overdue. All inputs are validated on both client and server."

**5. AI Feature (25s):** "In the task form, there's an '✨ Generate subtasks with AI' button. The user types a goal, the frontend calls our backend, the backend calls Mistral AI — the API key never touches the browser. Mistral returns JSON with 4-6 subtasks. The user sees a checklist, can edit any item or uncheck it, and clicks 'Add selected' to create all those tasks on the board at once."

**6. Performance (10s):** "TaskCard and Column are wrapped in React.memo. The filter selector uses createSelector for memoization. Pages are lazy-loaded with Suspense, and search is debounced at 400ms."

---

## 🎯 15 Likely Interview Questions & Answers

---

### React & Frontend

**Q1: What is Redux Toolkit and why did you use it instead of plain Redux?**

> Redux Toolkit (RTK) is the official, opinionated way to write Redux. It eliminates boilerplate by giving you `createSlice` (auto-generates actions + reducers), `createAsyncThunk` (handles async with pending/fulfilled/rejected), and `configureStore` (sets up DevTools and middleware automatically). With plain Redux you'd write action type constants, action creators, and reducers separately — RTK collapses those into one `createSlice` call. I also used `createSelector` from reselect (re-exported by RTK) for memoized derived state like the filtered task list.

---

**Q2: How does the drag-and-drop work and what is an "optimistic UI update"?**

> I use `@hello-pangea/dnd` which provides `DragDropContext`, `Droppable` (the column), and `Draggable` (the task card). When a user drops a card, `onDragEnd` fires with the source and destination. An **optimistic update** means I immediately update Redux state to reflect the new position before the API call even completes — so the UI feels instant. Then I fire `PUT /api/tasks/:id` with the new status/order. If it succeeds, nothing changes (UI is already correct). If it fails, I dispatch a `rollbackTask` action to restore the previous state and show a toast error. This is better UX than blocking the UI while waiting for the server.

---

**Q3: How do you handle performance in a list of task cards?**

> Three strategies: (1) **React.memo** on `TaskCard` and `Column` — these components only re-render when their props change, so moving a task in one column doesn't re-render the others. (2) **createSelector** for the filtered task list — the selector only recomputes when `tasks` or `filters` change, not on every dispatch. (3) **Route-level lazy loading** — `React.lazy()` + `Suspense` splits each page into its own JS chunk, so the user only downloads code for the current page.

---

**Q4: What is the purpose of the Axios interceptor?**

> There are two interceptors. The **request interceptor** reads the JWT from localStorage and attaches it as `Authorization: Bearer <token>` to every outgoing request automatically — I don't have to remember to add it in each API call. The **response interceptor** catches 401 errors globally: it clears localStorage (removes token and user) and redirects to `/login`. This handles token expiry or server-side invalidation without any extra code in components.

---

**Q5: What is `useDebounce` and why is it needed for search?**

> `useDebounce` is a custom hook that delays updating a value until the user stops typing for N milliseconds (I use 400ms). Without it, every single keystroke in the search box would trigger a re-render and potentially an API call. With debouncing, the filter only applies (or the API is called) after a brief pause — much more efficient. It uses `useEffect` with a `setTimeout` and cleanup to cancel the timer if the value changes again before the delay fires.

---

**Q6: How do you protect routes on the frontend?**

> I have a `ProtectedRoute` component that wraps any private page. It reads `selectIsAuthenticated` from Redux (which checks if a token exists in state). If the user is not authenticated, it renders `<Navigate to="/login" replace />` — a redirect. This means you can't access the Dashboard or BoardView pages without being logged in. On the backend, every private endpoint uses the `protect` middleware which verifies the JWT and attaches the user to `req.user`.

---

**Q7: How do you handle forms — are they controlled or uncontrolled?**

> All forms use controlled components — every input has a `value` tied to a `useState` variable and an `onChange` handler. This gives full control for validation: I can validate in real time, disable the submit button when invalid, and reset fields programmatically when the modal closes. I forward refs on the `Input` component for cases like auto-focus.

---

### Backend

**Q8: How does JWT authentication work in your app?**

> On login, the server verifies the email and bcrypt-compares the password. If valid, it signs a JWT with `jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })`. The client stores this token in localStorage and sends it in every request header. The `protect` middleware calls `jwt.verify(token, JWT_SECRET)` — if the token is valid and not expired, it fetches the user from MongoDB and attaches it to `req.user`. Sensitive routes like boards and tasks are wrapped with this middleware.

---

**Q9: How do you prevent users from accessing other users' data?**

> Every database query on boards and tasks includes both the resource ID **and** `owner: req.user._id`. For example: `Board.findOne({ _id: boardId, owner: req.user._id })`. If that returns null, the response is a 404 — the user gets no information about whether the resource exists or belongs to someone else. This is an ownership check at the query level, not just a flag check.

---

**Q10: What security measures does the backend use?**

> (1) **Helmet** sets security HTTP headers. (2) **bcryptjs** hashes passwords with salt rounds=10 — raw passwords are never stored. (3) **express-rate-limit** prevents brute-force: 20 req/15min on auth routes, 100 req/15min general, 10 req/15min on AI. (4) **express-validator** validates all inputs server-side — even if someone bypasses the frontend. (5) **CORS** is locked to the specific `CLIENT_URL` env variable. (6) The JWT secret lives only in `.env`, never in source code. (7) Passwords are stripped from all API responses using a `toJSON` transform.

---

### AI Integration (3 Questions)

**Q11: How do you keep the Mistral API key secure?**

> The API key lives exclusively in `server/.env` and is never sent to the browser. The frontend only calls **our own backend** at `/api/ai/breakdown`. The backend then calls Mistral on behalf of the user. This means: the API key is never in network requests the browser makes, never in the React bundle, and never in source code. The `.gitignore` excludes `.env` files, and `.env.example` shows the variable name without a real value. For production on Vercel, it's set as a secret environment variable in the project settings — it's encrypted at rest and injected at runtime.

---

**Q12: How do you handle unreliable or malformed LLM output?**

> I never trust the raw string from Mistral. In `aiService.js`, the response goes through several safety layers: (1) The request uses `response_format: { type: "json_object" }` which forces syntactically valid JSON output. (2) The system prompt explicitly says "Return ONLY valid JSON, no markdown, no code fences" with the exact expected schema. (3) The parse is in a `try/catch` — if `JSON.parse` throws, we return a friendly error. (4) I strip any accidental code fences (` ```json ... ``` `) with a regex before parsing. (5) After parsing, I validate the structure: `subtasks` must be an array, each item must have a string `title` and a valid `priority` (High/Medium/Low). Items with invalid priorities default to "Medium". Items without a title are filtered out. This makes the feature robust even if the model hallucinates an unexpected format.

---

**Q13: How do you handle rate limiting on the AI endpoint, including the Mistral free tier limit?**

> There are two layers. (1) **My own rate limit** (`aiLimiter` from `express-rate-limit`): 10 requests per 15 minutes per IP address. This protects my Mistral quota from abuse before the request ever reaches Mistral. (2) **Mistral's rate limit**: if Mistral returns a 429, Axios throws an error. I catch it in `aiService.js` and throw a custom error with the message `"AI_RATE_LIMITED"`. In `aiController.js`, I check for that message and return a 429 response to the client with `"AI is busy, please try again in a minute."` — a friendly user-facing message rather than exposing the underlying API error. Additionally, I have an **in-memory cache** keyed on the goal string (normalized to lowercase/trimmed) with a 10-minute TTL. If the same goal is requested again within that window, the cached result is returned instantly without calling Mistral — which helps stay within free tier limits during demos.

---

### General / System Design

**Q14: How would you scale this app if traffic grew significantly?**

> Several steps: (1) Move the in-memory AI cache to Redis so it's shared across serverless instances. (2) Add database indexes — Task already has an index on `board + status`, but I'd add compound indexes for common query patterns. (3) Add pagination to task lists (currently returns all tasks per board). (4) Use a job queue (like BullMQ) for AI requests so they don't block the response — return a job ID and poll for results. (5) Move static assets to a CDN. (6) Implement refresh tokens instead of a single long-lived JWT. The serverless architecture on Vercel already scales horizontally automatically.

---

**Q15: What would you add next to make this more production-ready?**

> (1) **Testing**: unit tests for Redux slices (jest), integration tests for API routes (supertest), and component tests (React Testing Library). (2) **Refresh tokens**: currently the JWT is a single long-lived token; a proper system would use short-lived access tokens + long-lived refresh tokens stored in httpOnly cookies. (3) **WebSockets** for real-time collaboration: if two users share a board, changes should sync live. (4) **Task comments and file attachments**. (5) **Proper logging** (Winston + a service like LogTail) instead of `console.log`. (6) **Email verification** for registration. (7) Moving the AI cache to Redis to work correctly across serverless instances.

---

## 📋 Quick Cheat-Sheet

| Topic | Key talking point |
|-------|-----------------|
| Redux Toolkit | `createSlice` + `createAsyncThunk` reduce boilerplate |
| Optimistic UI | Update state → fire API → rollback on error |
| React.memo | Prevents re-renders when props haven't changed |
| JWT | Signed token, verified server-side, never store sensitive data in payload |
| bcrypt | One-way hash, compare with `.compare()`, never store raw passwords |
| Rate limiting | Two layers: own middleware + handle upstream 429 |
| AI key security | Key only on server, frontend calls own backend only |
| LLM reliability | `response_format json_object` + validate + fallback defaults |
| Serverless | Cached Mongoose connection, no `app.listen` in exported app |
| CORS | Lock to specific origin via env variable |
