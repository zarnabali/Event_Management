require('dotenv').config(); // Load environment variables at the top

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("❌ ERROR: JWT_SECRET is not set in the environment variables!");
  process.exit(1); // Exit if no secret is provided
}

let users = [];
let events = [];

// Authentication Middleware
const authenticate = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).send('Access Denied');
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).send('Invalid Token');
  }
};

// User Registration
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).send('All fields are required');
  
  const existingUser = users.find(u => u.email === email);
  if (existingUser) return res.status(400).send('User already exists');
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  users.push({ id: users.length + 1, username, email, password: hashedPassword });
  res.send('User registered successfully');
});

// User Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send('All fields are required');
  
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).send('User not found');
  
  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(400).send('Invalid password');
  
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
  res.header('Authorization', token).send({ token });
});

// Create Event
app.post('/events', authenticate, (req, res) => {
  const { name, date, reminderTime } = req.body;
  if (!name || !date) return res.status(400).send('Event name and date are required');
  
  const event = { id: events.length + 1, userId: req.user.id, name, date, reminderTime };
  events.push(event);
  res.send('Event created successfully');
});

// Get Events
app.get('/events', authenticate, (req, res) => {
  const userEvents = events.filter(event => event.userId === req.user.id);
  res.json(userEvents.sort((a, b) => new Date(a.date) - new Date(b.date)));
});

// Reminder System (Placeholder for Cron Job)
const sendReminders = () => {
  const now = new Date();
  events.forEach(event => {
    if (event.reminderTime && new Date(event.reminderTime) <= now) {
      console.log(`Reminder: ${event.name} is happening soon.`);
    }
  });
};
setInterval(sendReminders, 60000); 

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
module.exports = app;
