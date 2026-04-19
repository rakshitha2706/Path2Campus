require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const EapcetCollege = require('../models/EapcetCollege');
const JosaCollege = require('../models/JosaCollege');

const DATASETS_DIR = path.join(__dirname, '../../datasets');

function hasDatasetsDirectory() {
  return fs.existsSync(DATASETS_DIR);
}

function listDatasetFiles() {
  if (!hasDatasetsDirectory()) return [];
  return fs.readdirSync(DATASETS_DIR);
}

function safeParseNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const normalized = value.toString().replace(/,/g, '').trim();
  if (!normalized || normalized === '-' || normalized.toUpperCase() === 'NA') return null;
  const parsed = parseInt(normalized, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function findDatasetFile(matchers) {
  const files = listDatasetFiles();
  return files.find((file) => matchers.every((matcher) => matcher.test(file))) || null;
}

function getInstituteType(name) {
  const normalizedName = name.toUpperCase().replace(/\s+/g, ' ').trim();
  if (normalizedName.includes('INDIAN INSTITUTE OF TECHNOLOGY') || normalizedName.startsWith('IIT ')) return 'IIT';
  if (normalizedName.includes('NATIONAL INSTITUTE OF TECHNOLOGY') || normalizedName.startsWith('NIT ')) return 'NIT';
  if (normalizedName.includes('INDIAN INSTITUTE OF INFORMATION TECHNOLOGY') || normalizedName.includes('IIIT')) return 'IIIT';
  return 'GFTI';
}

async function seedEapcet() {
  console.log('Seeding EAPCET data...');
  const file = findDatasetFile([/tgeapcet/i, /\.xlsx$/i]) || findDatasetFile([/eapcet/i, /\.xlsx$/i]);
  if (!file) {
    console.log('EAPCET xlsx not found, skipping');
    return;
  }

  const workbook = xlsx.readFile(path.join(DATASETS_DIR, file));
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: null });
  const dataRows = rows.slice(2);

  await EapcetCollege.deleteMany({});
  const docs = [];

  for (const row of dataRows) {
    if (!row[0] || !row[1]) continue;

    docs.push({
      inst_code: row[0].toString().trim(),
      institute_name: row[1].toString().trim(),
      place: (row[2] || '').toString().trim(),
      dist_code: (row[3] || '').toString().trim(),
      co_education: (row[4] || '').toString().trim(),
      college_type: (row[5] || '').toString().trim(),
      year_of_estab: safeParseNumber(row[6]),
      branch_code: (row[7] || '').toString().trim(),
      branch_name: (row[8] || '').toString().replace(/\n/g, ' ').trim(),
      cutoffs: {
        OC_BOYS: safeParseNumber(row[9]),
        OC_GIRLS: safeParseNumber(row[10]),
        BC_A_BOYS: safeParseNumber(row[11]),
        BC_A_GIRLS: safeParseNumber(row[12]),
        BC_B_BOYS: safeParseNumber(row[13]),
        BC_B_GIRLS: safeParseNumber(row[14]),
        BC_C_BOYS: safeParseNumber(row[15]),
        BC_C_GIRLS: safeParseNumber(row[16]),
        BC_D_BOYS: safeParseNumber(row[17]),
        BC_D_GIRLS: safeParseNumber(row[18]),
        BC_E_BOYS: safeParseNumber(row[19]),
        BC_E_GIRLS: safeParseNumber(row[20]),
        SC_BOYS: safeParseNumber(row[21]),
        SC_GIRLS: safeParseNumber(row[22]),
        ST_BOYS: safeParseNumber(row[23]),
        ST_GIRLS: safeParseNumber(row[24]),
        EWS_GEN_OU: safeParseNumber(row[25]),
        EWS_GIRLS_OU: safeParseNumber(row[26]),
      },
      tuition_fee: safeParseNumber(row[27]),
      affiliated_to: (row[28] || '').toString().trim(),
      year: 2024,
    });
  }

  await EapcetCollege.insertMany(docs, { ordered: false });
  console.log(`Seeded ${docs.length} EAPCET records`);
}

async function seedJosaa() {
  console.log('Seeding JoSAA data...');
  const file =
    findDatasetFile([/round[_ ]?1/i, /\.csv$/i]) ||
    findDatasetFile([/josaa/i, /\.csv$/i]) ||
    findDatasetFile([/\.csv$/i]);

  if (!file) {
    console.log('JoSAA CSV not found, skipping');
    return;
  }

  const content = fs.readFileSync(path.join(DATASETS_DIR, file), 'utf8');
  const lines = content.split(/\r?\n/).filter((line) => line.trim());

  await JosaCollege.deleteMany({});
  const docs = [];

  for (let i = 1; i < lines.length; i += 1) {
    const parts = lines[i].match(/(".*?"|[^,]+)(?=,|$)/g);
    if (!parts || parts.length < 7) continue;

    const clean = parts.map((part) => part.replace(/^"|"$/g, '').trim());
    const [institute, program_name, quota, seat_type, gender, opening_rank, closing_rank] = clean;
    if (!institute || !closing_rank) continue;

    const roundMatch = file.match(/round[_ ]?(\d+)/i);
    const round = roundMatch ? parseInt(roundMatch[1], 10) : 1;

    docs.push({
      institute,
      program_name,
      quota,
      seat_type,
      gender,
      opening_rank: safeParseNumber(opening_rank),
      closing_rank: safeParseNumber(closing_rank),
      round,
      year: 2024,
      institute_type: getInstituteType(institute),
    });
  }

  await JosaCollege.insertMany(docs, { ordered: false });
  console.log(`Seeded ${docs.length} JoSAA records`);
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');
  await seedEapcet();
  await seedJosaa();
  await mongoose.disconnect();
  console.log('Seeding complete');
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}

module.exports = {
  main,
  seedEapcet,
  seedJosaa,
  DATASETS_DIR,
  hasDatasetsDirectory,
  listDatasetFiles,
};
