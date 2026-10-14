const SCHOOL_DATA = {
  smkn1ngawi: {
    name: 'SMKN 1 NGAWI',
    logo: 'school-logo.png',
    address: 'Jl. Pendidikan No. 1, Jawa Timur',
    city: 'Ngawi',
    latitude: -7.4014644,
    longitude: 111.44396160000001,
  },
  ubsi: {
    name: 'Universitas Bina Sarana Informatika',
    logo: 'logo-ubsi.png',
    address: 'Jl. Kramat No. 98, Jakarta Pusat',
    city: 'Jakarta Selatan',
    latitude: -6.252335726101533,
    longitude: 106.54577008104371,
  },
  iainkediri: {
    name: 'Institut Agama Islam Negeri Kediri',
    logo: 'logo-iain-kediri.png',
    address: 'Jl. Sunan Ampel No.7, Ngronggo, Kediri',
    city: 'Kediri',
    latitude: -7.846840599999981,
    longitude: 112.00598528715817,
  },
};

const kelasOptions = ['X TKJ 1', 'XI RPL 2', 'XII AKL 3', 'X DKV 1'];
const jurusanOptions = ['TKJ', 'RPL', 'AKL', 'DKV'];
const tempatLahirOptions = [
  'Surabaya', 'Malang', 'Jakarta', 'Bandung', 'Yogyakarta',
  'Semarang', 'Medan', 'Makassar', 'Palembang', 'Depok',
  'Tangerang', 'Bekasi', 'Bogor', 'Denpasar', 'Padang',
  'Pontianak', 'Samarinda', 'Manado', 'Pekanbaru', 'Ngawi',
];
const bulanOptions = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const firstNames = [
  'Budi', 'Sari', 'Andi', 'Dewi', 'Rizki', 'Putri', 'Fajar', 'Ayu',
  'Dimas', 'Rina', 'Hendra', 'Mega', 'Agus', 'Sinta', 'Yusuf', 'Lina',
  'Bayu', 'Wulan', 'Irfan', 'Nadia', 'Arief', 'Fitri', 'Galih', 'Indah',
  'Joko', 'Kartika', 'Lukman', 'Maya', 'Nugroho', 'Oktavia',
];
const lastNames = [
  'Santoso', 'Wijaya', 'Pratama', 'Kusuma', 'Hidayat', 'Rahayu',
  'Saputra', 'Purnama', 'Wibowo', 'Hartono', 'Susanto', 'Permana',
  'Kurniawan', 'Setiawan', 'Handoko', 'Suryadi', 'Nurhadi', 'Prasetyo',
  'Gunawan', 'Budiman', 'Mulyadi', 'Sudrajat', 'Firmansyah', 'Wahyudi',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatDateEnglish(date) {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(date.getDate()).padStart(2, '0');
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function randomPastIssuedDate() {
  const now = new Date();
  const yearsAgo = randomInt(5, 15);
  const issued = new Date(now.getFullYear() - yearsAgo, randomInt(0, 11), randomInt(1, 28));
  return formatDateEnglish(issued);
}

async function fetchRandomPhoto() {
  try {
    const randomPage = Math.floor(Math.random() * 5) + 1;
    const params = new URLSearchParams({
      'query': 'portrait person face',
      'page': randomPage,
      'per_page': 20,
      'orientation': 'portrait',
      'content_filter': 'high',
    });
    const response = await fetch(`https://api.unsplash.com/search/photos?${params.toString()}`, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.5',
        'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY || ''}`,
      },
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const idx = Math.floor(Math.random() * data.results.length);
      const item = data.results[idx];
      return item.urls?.small || null;
    }
  } catch (e) {
    console.warn('Photo fetch error:', e.message);
  }
  return null;
}

export async function generateCardData(type = 'student', institutionId = 'smkn1ngawi') {
  const isTeacher = type === 'teacher';
  const school = SCHOOL_DATA[institutionId] || SCHOOL_DATA.smkn1ngawi;
  const resolvedInstitution = SCHOOL_DATA[institutionId] ? institutionId : 'smkn1ngawi';

  const name = `${pick(firstNames)} ${pick(lastNames)}`.toUpperCase();
  const nisn = Math.floor(Math.random() * 9000000000 + 1000000000).toString();

  const randomCity = pick(tempatLahirOptions);
  const randomDay = randomInt(1, 28);
  const randomMonth = pick(bulanOptions);
  const randomYear = isTeacher ? randomInt(1965, 1985) : randomInt(2005, 2009);
  const ttl = `${randomCity}, ${randomDay} ${randomMonth} ${randomYear}`;
  const tahun = isTeacher ? randomPastIssuedDate() : (randomYear + 15).toString();

  const result = {
    type,
    institution: resolvedInstitution,
    schoolName: school.name,
    schoolLogo: school.logo,
    schoolAddress: school.address,
    schoolCity: school.city,
    schoolLatitude: school.latitude,
    schoolLongitude: school.longitude,
    name,
    nisn,
    ttl,
    tahun,
    status: 'Aktif',
    validUntil: '31 DESEMBER 2028',
    photoUrl: null,
  };

  result.photoUrl = await fetchRandomPhoto();

  if (isTeacher) {
    result.jabatan = 'Dosen';
    result.teacherId = Math.floor(Math.random() * 9000000000 + 1000000000).toString();
    result.cardTitle = 'KARTU TANDA DOSEN';
    result.nisLabel = 'NIS';
    result.issuedStatus = `${tahun} / Aktif`;
  } else {
    result.kelas = pick(kelasOptions);
    result.jurusan = pick(jurusanOptions);
    result.cardTitle = 'KARTU TANDA PELAJAR';
    result.nisLabel = 'NISN';
  }

  return result;
}

export { SCHOOL_DATA };
