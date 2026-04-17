require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const EapcetCollege = require('../models/EapcetCollege');
const JosaCollege = require('../models/JosaCollege');

const DATASETS_DIR = path.join(__dirname, '../../datasets');

function getInstituteType(name) {
  const n = name.toUpperCase();
  if (n.includes('INDIAN INSTITUTE OF TECHNOLOGY') || n.startsWith('IIT ')) return 'IIT';
  if (n.includes('NATIONAL INSTITUTE OF TECHNOLOGY') || n.startsWith('NIT ')) return 'NIT';
  if (n.includes('INDIAN INSTITUTE OF INFORMATION TECHNOLOGY') || n.includes('IIIT')) return 'IIIT';
  if (n.includes('CENTRAL UNIVERSITY') || n.includes('NATIONAL INSTITUTE OF FOOD')) return 'GFTI';
  return 'GFTI';
}

async function seedEapcet() {
  console.log('Seeding EAPCET data...');
  const file = fs.readdirSync(DATASETS_DIR).find(f => f.endsWith('.xlsx'));
  if (!file) { console.log('EAPCET xlsx not found, skipping'); return; }

  const wb = xlsx.readFile(path.join(DATASETS_DIR, file));
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: null });

  // Row 0 = title, Row 1 = headers, Row 2+ = data
  const dataRows = rows.slice(2);

  await EapcetCollege.deleteMany({});
  const docs = [];

  for (const row of dataRows) {
    if (!row[1]) continue; // skip blank rows
    docs.push({
      inst_code: row[0],
      institute_name: (row[1] || '').toString().trim(),
      place: (row[2] || '').toString().trim(),
      dist_code: (row[3] || '').toString().trim(),
      co_education: (row[4] || '').toString().trim(),
      college_type: (row[5] || '').toString().trim(),
      year_of_estab: row[6] ? parseInt(row[6]) : null,
      branch_code: (row[7] || '').toString().trim(),
      branch_name: (row[8] || '').toString().replace(/\n/g, ' ').trim(),
      cutoffs: {
        OC_BOYS: row[9] ? parseInt(row[9]) : null,
        OC_GIRLS: row[10] ? parseInt(row[10]) : null,
        BC_A_BOYS: row[11] ? parseInt(row[11]) : null,
        BC_A_GIRLS: row[12] ? parseInt(row[12]) : null,
        BC_B_BOYS: row[13] ? parseInt(row[13]) : null,
        BC_B_GIRLS: row[14] ? parseInt(row[14]) : null,
        BC_C_BOYS: row[15] ? parseInt(row[15]) : null,
        BC_C_GIRLS: row[16] ? parseInt(row[16]) : null,
        BC_D_BOYS: row[17] ? parseInt(row[17]) : null,
        BC_D_GIRLS: row[18] ? parseInt(row[18]) : null,
        BC_E_BOYS: row[19] ? parseInt(row[19]) : null,
        BC_E_GIRLS: row[20] ? parseInt(row[20]) : null,
        SC_BOYS: row[21] ? parseInt(row[21]) : null,
        SC_GIRLS: row[22] ? parseInt(row[22]) : null,
        ST_BOYS: row[23] ? parseInt(row[23]) : null,
        ST_GIRLS: row[24] ? parseInt(row[24]) : null,
        EWS_GEN_OU: row[25] ? parseInt(row[25]) : null,
        EWS_GIRLS_OU: row[26] ? parseInt(row[26]) : null,
      },
      tuition_fee: row[27] ? parseInt(row[27]) : null,
      affiliated_to: (row[28] || '').toString().trim(),
      year: 2024,
    });
  }

  await EapcetCollege.insertMany(docs, { ordered: false });
  console.log(`✓ Seeded ${docs.length} EAPCET records`);
}

async function seedJosaa() {
  console.log('Seeding JoSAA data...');
  const file = fs.readdirSync(DATASETS_DIR).find(f => f.endsWith('.csv'));
  if (!file) { console.log('JoSAA CSV not found, skipping'); return; }

  const content = fs.readFileSync(path.join(DATASETS_DIR, file), 'utf8');
  const lines = content.split('\n').filter(l => l.trim());
  // header: Institute,Academic Program Name,Quota,Seat Type,Gender,Opening Rank,Closing Rank
  const header = lines[0].split(',');

  await JosaCollege.deleteMany({});
  const docs = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].match(/(".*?"|[^,]+)(?=,|$)/g);
    if (!parts || parts.length < 7) continue;
    const clean = parts.map(p => p.replace(/^"|"$/g, '').trim());
    const [institute, program_name, quota, seat_type, gender, opening_rank, closing_rank] = clean;
    if (!institute || !closing_rank) continue;

    // Extract round from filename
    const roundMatch = file.match(/Round_(\d)/i);
    const round = roundMatch ? parseInt(roundMatch[1]) : 1;

    docs.push({
      institute: institute.trim(),
      program_name: program_name.trim(),
      quota: quota.trim(),
      seat_type: seat_type.trim(),
      gender: gender.trim(),
      opening_rank: opening_rank ? parseInt(opening_rank) : null,
      closing_rank: closing_rank ? parseInt(closing_rank) : null,
      round,
      year: 2024,
      institute_type: getInstituteType(institute),
    });
  }

  await JosaCollege.insertMany(docs, { ordered: false });
  console.log(`✓ Seeded ${docs.length} JoSAA records`);
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');
  await seedEapcet();
  await seedJosaa();
  await mongoose.disconnect();
  console.log('✓ Seeding complete!');
  process.exit(0);
}

main().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
