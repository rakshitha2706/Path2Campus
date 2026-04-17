const mongoose = require('mongoose');

const EapcetCollegeSchema = new mongoose.Schema({
  inst_code: String,
  institute_name: { type: String, index: true },
  place: { type: String, index: true },
  dist_code: String,
  co_education: String,
  college_type: { type: String, index: true },
  year_of_estab: Number,
  branch_code: String,
  branch_name: { type: String, index: true },
  cutoffs: {
    OC_BOYS: Number,
    OC_GIRLS: Number,
    BC_A_BOYS: Number,
    BC_A_GIRLS: Number,
    BC_B_BOYS: Number,
    BC_B_GIRLS: Number,
    BC_C_BOYS: Number,
    BC_C_GIRLS: Number,
    BC_D_BOYS: Number,
    BC_D_GIRLS: Number,
    BC_E_BOYS: Number,
    BC_E_GIRLS: Number,
    SC_BOYS: Number,
    SC_GIRLS: Number,
    ST_BOYS: Number,
    ST_GIRLS: Number,
    EWS_GEN_OU: Number,
    EWS_GIRLS_OU: Number
  },
  tuition_fee: { type: Number, index: true },
  affiliated_to: String,
  year: { type: Number, default: 2024 }
});

module.exports = mongoose.model('EapcetCollege', EapcetCollegeSchema);
