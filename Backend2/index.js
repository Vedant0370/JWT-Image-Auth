
const express = require('express');
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 4000
const jwt = require('jsonwebtoken');

const multer = require("multer");
const path = require("path");

// middlewares 
app.use(bodyParser.json());
app.use(cors());


// storage engine 

const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
      return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  }
})
const upload = multer({
  storage: storage,
  limits: {
      fileSize: 1000000
  }
})


app.use('/profile', express.static('upload/images'));
// app.post("/upload", upload.single('profile'), (req, res) => {

//     res.json({
//         success: 1,
//         profile_url: `http://localhost:4000/profile/${req.file.filename}`
//     })
// })

function errHandler(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        res.json({
            success: 0,
            message: err.message
        })
    }
}
app.use(errHandler);

mongoose.connect('mongodb+srv://Backend:test1234@vedantbackendallapilogi.wa8isd0.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    // useUnifiedTopology: true,
})
.then(() => {
    console.log('MongoDB connected successfully');
})
.catch((error) => {
    console.error('MongoDB connection error:', error);
});



const User = mongoose.model('User', {
    name: String,
    email: { type: String, unique: true },
    password: String,
    profileImage: String,
  });
  
  // Registration API
  app.post('/api/register', upload.single('profileImage'), async (req, res) => {
    const { name, email, password } = req.body;
    const profileImage = req.file ? `http://localhost:4000/profile/${req.file.filename}` : null;

    try {
        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Create a new user with the full profile image URL
        const newUser = new User({ name, email, password, profileImage });
        await newUser.save();

        // Log the image URL to the console
        console.log('Image URL:', profileImage);

        // Return the image URL in the response
        return res.status(201).json({
            message: 'User registered successfully',
            profile_url: profileImage
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/api/register' , async(req , res) => {
  try{
      NewAddPayment = await User.find()
      res.status(201).json(NewAddPayment)

  }catch(e){
      res.status(404).json({message : "Can not get customer"})
  }
})




  
// Login API
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if the user exists
      const user = await User.findOne({ email, password });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // If the login is successful, generate a token
      const token = jwt.sign({ email }, 'your-secret-key', { expiresIn: '1h' });

      // Send the user details along with the token in the response
      res.status(200).json({
        token,
        userId: user._id, // Assuming you have a field named '_id' for user id
        userName: user.name, // Assuming you have a field named 'name' for user name
        userEmail: user.email, // Assuming you have a field named 'email' for user email
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})
.on('error', (error) => {
    console.error('Server start error:', error);
});

// **************************