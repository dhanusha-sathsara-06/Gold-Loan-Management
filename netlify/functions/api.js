// Server starts here
const express = require('express');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cors = require('cors');





// Configure AWS
const AWS = require('aws-sdk');
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();





const router = express.Router();
const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware for parsing JSON requests
app.use(express.json());

// Database connection starts here
mongoose
  .connect('mongodb+srv://admin:admin@cluster0.gzqwq.mongodb.net/Gold-Loan-Management?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Database Connected Successfully");
  })
  .catch((error) => {
    console.error("Database Connection Failed", error);
  });

//Image Save Part
const multer = require('multer');
const multerS3 = require('multer-s3');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
     return cb(null, './public/application');
  },
  filename: function (req, file, cb) {
      return cb(null,`${Date.now()}_${file.originalname}`);
  }
}); 
 
// Configure multer for S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString())
    }
  })
});

// router.post('/upload', upload.single('file'), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: 'No file uploaded' });
//   }

//   console.log(req.body);
//   console.log(req.file);

//   // Send success response
//   res.json({ filename: req.file.filename, message: 'File uploaded successfully' });
// });

router.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    res.json({ message: 'File uploaded successfully', fileUrl: req.file.location });
  } else {
    res.status(400).json({ message: 'File upload failed' });
  }
});

//Image Save Part


//Models gets here
const customers = require('./models/CustomerDetails.js');
const MarketValue = require('./models/addMarketValues.js');
const ApplicantDetails = require('./models/ApplicantDetails.js');


// Routers 
router.post('/addMarketValues', async (req, res) => {
  try {
    const { carats, date } = req.body;

    // Basic validation to check if required fields are present
    if (!carats || !date) {
      return res.status(400).send({ status: 'error', message: 'Carats and date are required.' });
    }

    // Create new market value document
    const marketValue = await MarketValue.create({
      carats,
      date
    });

    // Send success response
    res.send({ status: 'success', data: marketValue });

  } catch (error) {
    // Send error response
    res.status(500).send({ status: 'error', message: 'Something went wrong.', error: error.message });
  }
});


router.post('/register', async (req, res) => {
  const { name, whatsApp, NIC } = req.body
  
  const oldCustomer = await customers.findOne({ NIC: NIC });
  
  if (oldCustomer) {
    return res.send({ status: 'fail', data: "Customer Already Registered" });
  }
  
  try {

    const newCustomer = await customers.create({
      name: name,
      whatsApp: whatsApp,
      NIC: NIC
    });
    
    res.send({ status: 'success', data: "Customer Registered Successfully", insertedId: newCustomer._id });
    
  } catch (error) {
    res.send({ status: "Error While Registering Customer", data: error });
  }

});

router.post('/ApplicantDetails', async (req, res) => {
  
  const { customerId, applicantDetails } = req.body;  
  
  const { phoneNumber, addressLine1, addressLine2, divisionalSecretariatDivision, district, gender, maritalStatus } = applicantDetails[0];
  
  
  try {
    await ApplicantDetails.create({
      customerId: customerId,  
      applicantDetails: [{     
        phoneNumber: phoneNumber,
        addressLine1: addressLine1,
        addressLine2: addressLine2,
        divisionalSecretariatDivision: divisionalSecretariatDivision,
        district: district,
        gender: gender,
        maritalStatus: maritalStatus
      }]
    });
    
    res.status(200).send({ status: 'success', data: "Customer ApplicantDetails Inserted Successfully" });
  } catch (error) {
    res.status(500).send({ status: "error", message: "Error while inserting Customer ApplicantDetails", error: error.message });
  }
});

router.get('/test', async (req, res) => {
  const test = {
    name: "kk done !",
  };

  res.send(test);
});

router.get('/test3', async (req, res) => {
  const test = {
    name: "kk test3 get done !",
  };

  res.send(test);
});

router.post('/test3', async (req, res) => {
  const test = {
    name: "kk test3 post done !",
  };

  res.send(test);
});

app.use('/api/', router);
module.exports.handler = serverless(app);