const mongoose = require('mongoose');

const mortgageDeedSchema = mongoose.Schema({
    institution: { type: String, required: true },
    branch: { type: String, required: true },
    startDate: { type: String , required: true },
    endDate: { type: String, required: true },
    contactNumber: { type: String, required: true },
    monthlyRate: { type: Number, required: true },
    yearlyRate: { type: Number, required: true },
    receiptNumber: { type: String, required: true },
    appraisedValue: { type: Number, required: true },
    mortgageAmount: { type: Number, required: true },
    rescueAmount: { type: Number, required: true },
    imageUrl: { type: String, required: true }, 
    createdAt: { 
      type: String,
      default: () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
      }
    }
},
  {
    versionKey: false,
  }
);

const customerMortgageDeedScheema = mongoose.Schema({
  customerId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer-Infomations',
    required: true
  },
  customerApplicantDetailsId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer-Applicant-Details',
    required: true
  },
  mortgageDeed: {
    type: [mortgageDeedSchema],
    required: true
  },
},
{
  versionKey: false,
}
)

const mortgageDeed = mongoose.model('Mortgage-Deed', customerMortgageDeedScheema);

module.exports = mortgageDeed;