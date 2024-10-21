const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // replace with your DB username
  password: '', // replace with your DB password
  database: 'taskmanager' // replace with your DB name
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to the database');
});

// Handle GET request to serve the front page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontpage.html')); // Adjust the path as needed
});

// Handle sign-up and login request
app.post('/signup', (req, res) => {
  const { name, email, password } = req.body;

  // SQL query to check if the email already exists
  const checkEmailQuery = `SELECT * FROM user WHERE email = ?`;
  
  db.query(checkEmailQuery, [email], (err, results) => {
    if (err) {
      console.error('Error checking email:', err);
      return res.status(500).send('Internal server error');
    }

    // If email already exists, log in the user
    if (results.length > 0) {
      const user = results[0];
      // Check if the password matches
      if (user.password === password) {
        // Check if the user is an admin based on email
        if (user.email === 'admin@gmail.com' && user.password === '1234567') {
          console.log('Admin logged in');
          return res.redirect('/admin.html'); // Redirect to admin page for admins
        } else {
          console.log('User logged in');
          return res.redirect('/finalllll.html'); // Redirect to finalllll.html for regular users
        }
        
      } else {
        return res.status(401).send('Incorrect password');
      }
    } else {
      // If the email doesn't exist, sign up the user
      // First, check the number of users already registered
      const countUsersQuery = `SELECT COUNT(*) AS userCount FROM user`;
      
      db.query(countUsersQuery, (err, countResult) => {
        if (err) {
          console.error('Error counting users:', err);
          return res.status(500).send('Internal server error');
        }

        const userCount = countResult[0].userCount;
        const newUserId = userCount + 1; // Increment the ID for new users

        // If the email is 'admin@gmail.com', set the ID to 1 and isAdmin to true
        let isAdmin = false;
        let userID = newUserId;

        if (email === 'admin@gmail.com' && password === '1234567') {
          isAdmin = true;
          userID = 1; // Admin ID is always 1
        }

        const insertQuery = `INSERT INTO user (id, full_name, email, password, isAdmin) VALUES (?, ?, ?, ?, FALSE)`;
        db.query(insertQuery, [userID, name, email, password, isAdmin], (err, result) => {
          if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).send('Internal server error');
          }
          console.log('User signed up successfully');

          // Redirect based on admin or user role
          if (isAdmin) {
            return res.redirect('/admin.html'); // Redirect to admin page for admin
          } else {
            return res.redirect('/finalllll.html'); // Redirect to finalllll.html for regular users
          }
        });
      });
    }
  });
});

// Serve final page for users
app.get('/finalllll.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'finalllll.html')); // Adjust the path as needed
});

// Serve admin page for admin users
app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html')); // Adjust the path as needed
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
