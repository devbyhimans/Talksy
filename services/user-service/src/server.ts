import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.USER_PORT || 3003;

app.listen(PORT, () => console.log(`🚀 User service running on port ${PORT}`));
