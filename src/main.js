import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import JsBarcode from 'jsbarcode';

/* ========================================
   ID Card Generator — JavaScript
   ======================================== */

const SCHOOL_DATA = {
  smkn1ngawi: {
    name: 'SMKN 1 NGAWI',
    logo: '/school-logo.png',
    address: 'Jl. Pendidikan No. 1, Jawa Timur',
    skSuffix: 'SMKN1NGAWI',
  },
  ubsi: {
    name: 'Universitas Bina Sarana Informatika',
    logo: '/logo-ubsi.png',
    address: 'Jl. Kramat No. 98, Jakarta Pusat',
    skSuffix: 'UBSI',
  },
  iainkediri: {
    name: 'Institut Agama Islam Negeri Kediri',
    logo: '/logo-iain-kediri.png',
    address: 'Jl. Sunan Ampel No.7, Ngronggo, Kediri',
    skSuffix: 'IAINKediri',
  },
};

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM References ---
  const cardPhoto = document.getElementById('card-photo');
  const photoInput = document.getElementById('input-photo');
  const photoUploadArea = document.getElementById('photo-upload-area');
  const uploadPlaceholder = document.getElementById('upload-placeholder');
  const photoPreviewThumb = document.getElementById('photo-preview-thumb');
  const qrCanvas = document.getElementById('qr-canvas');
  const cardTypeInput = document.getElementById('input-card-type');
  const inputStatus = document.getElementById('input-status');

  function formatDateEnglish(date) {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const day = String(date.getDate()).padStart(2, '0');
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  function randomPastIssuedDate() {
    const now = new Date();
    const yearsAgo = Math.floor(Math.random() * 11) + 5; // 5-15 years ago
    const issued = new Date(now.getFullYear() - yearsAgo, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    return formatDateEnglish(issued);
  }

  function generateTeacherId() {
    return Math.floor(Math.random() * 9000000000 + 1000000000).toString();
  }

  function generateTeacherSk() {
    const year = new Date().getFullYear() - (Math.floor(Math.random() * 10) + 1);
    const serial = Math.floor(Math.random() * 9000) + 1000;
    return `SK/${year}/${serial}/SMKN1NGAWI`;
  }

  // Field mappings: input id → card element id
  const fieldMap = {
    'input-name': 'card-name',
    'input-nisn': 'card-nisn',
    'input-kelas': 'card-kelas',
    'input-jurusan': 'card-jurusan',
    'input-jabatan': 'card-jabatan',
    'input-teacher-id': 'card-teacher-id',
    'input-proof-doc': 'card-proof-doc',
    'input-ttl': 'card-ttl',
    'input-valid': 'card-valid',
  };

  function applySchool(schoolId) {
    const school = SCHOOL_DATA[schoolId] || SCHOOL_DATA.smkn1ngawi;
    document.getElementById('card-header-logo').src = school.logo;
    document.getElementById('card-school-name').textContent = school.name;
    document.getElementById('card-school-address').textContent = school.address;
    const cardType = document.getElementById('input-card-type').value;
    const isTeacher = cardType === 'teacher';
    document.getElementById('form-card-subtitle').textContent = isTeacher
      ? `${school.name} — Kartu Tanda Dosen`
      : `${school.name} — Kartu Tanda Pelajar`;
  }

  function applyCardType(cardType) {
    const isTeacher = cardType === 'teacher';
    document.getElementById('id-card').classList.toggle('teacher-mode', isTeacher);

    const schoolId = document.getElementById('input-school').value;
    const school = SCHOOL_DATA[schoolId] || SCHOOL_DATA.smkn1ngawi;
    document.getElementById('form-card-subtitle').textContent = isTeacher
      ? `${school.name} — Kartu Tanda Dosen`
      : `${school.name} — Kartu Tanda Pelajar`;
    document.getElementById('form-data-title').textContent = isTeacher ? '📋 Data Dosen' : '📋 Data Siswa';
    document.getElementById('card-type-title').textContent = isTeacher ? 'KARTU TANDA DOSEN' : 'KARTU TANDA PELAJAR';

    document.getElementById('label-nis-form').textContent = isTeacher ? 'NIS' : 'NISN';
    document.getElementById('card-label-nis').textContent = isTeacher ? 'NIS' : 'NISN';
    document.getElementById('card-label-kelas').textContent = 'KELAS';
    document.getElementById('card-label-jurusan').textContent = 'JURUSAN';
    document.getElementById('card-label-jabatan').textContent = 'JABATAN';
    document.getElementById('card-label-teacher-id').textContent = 'ID DOSEN';
    document.getElementById('input-nisn').placeholder = isTeacher
      ? 'Nomor Induk Dosen'
      : 'Nomor Induk Siswa Nasional';

    document.getElementById('label-tahun-form').textContent = isTeacher ? 'Diterbitkan' : 'Tahun Masuk';

    document.getElementById('card-label-ttl').textContent = 'TEMPAT, TANGGAL LAHIR';
    document.getElementById('label-ttl-form').textContent = 'Tempat / Tgl Lahir';

    document.getElementById('student-name-block').classList.remove('is-hidden');
    document.getElementById('card-row-name-teacher').classList.add('is-hidden');

    document.getElementById('form-group-kelas').classList.toggle('is-hidden', isTeacher);
    document.getElementById('form-group-jurusan').classList.toggle('is-hidden', isTeacher);
    document.getElementById('form-group-jabatan').classList.toggle('is-hidden', !isTeacher);
    document.getElementById('form-group-teacher-id').classList.toggle('is-hidden', !isTeacher);
    document.getElementById('form-group-proof-doc').classList.add('is-hidden');
    document.getElementById('form-group-ttl').classList.remove('is-hidden');

    document.getElementById('card-row-kelas').classList.toggle('is-hidden', isTeacher);
    document.getElementById('card-row-jurusan').classList.toggle('is-hidden', isTeacher);
    document.getElementById('card-row-jabatan').classList.toggle('is-hidden', !isTeacher);
    document.getElementById('card-row-teacher-id').classList.toggle('is-hidden', !isTeacher);
    document.getElementById('card-row-proof-doc').classList.add('is-hidden');
    document.getElementById('card-row-ttl').classList.remove('is-hidden');
    document.getElementById('card-row-status-details').classList.toggle('is-hidden', !isTeacher);
    document.getElementById('card-row-tahun-status').classList.toggle('is-hidden', isTeacher);

    document.getElementById('qr-canvas').classList.add('is-hidden');
    document.getElementById('bar-canvas').classList.remove('is-hidden');
    updateBarcode();

    document.getElementById('btn-random-data').textContent = isTeacher ? '🎲 Random Dosen' : '🎲 Random Siswa';

    document.getElementById('form-photo-title').textContent = isTeacher ? '📷 Foto Dosen' : '📷 Foto Siswa';
    document.getElementById('label-photo-form').textContent = 'Upload Foto';
    document.getElementById('form-validity-title').textContent = '📅 Masa Berlaku';
    document.getElementById('label-valid-form').textContent = 'Berlaku Hingga';
    document.getElementById('label-jabatan-form').textContent = 'Jabatan';
    document.getElementById('label-teacher-id-form').textContent = 'Nomor ID Dosen';
    document.getElementById('label-status-form').textContent = 'Status';

    inputStatus.options[0].textContent = 'Aktif';
    inputStatus.options[1].textContent = 'Tidak Aktif';
    inputStatus.options[2].textContent = 'Alumni';
    inputStatus.disabled = isTeacher;

    if (isTeacher) {
      const issuedDate = randomPastIssuedDate();
      document.getElementById('input-tahun').value = issuedDate;
      document.getElementById('input-tahun').dispatchEvent(new Event('input'));
      inputStatus.value = 'Aktif';
      inputStatus.dispatchEvent(new Event('change'));
      document.getElementById('card-label-status-details').textContent = 'DITERBITKAN / STATUS';
      document.getElementById('card-status-details').textContent = `${issuedDate} / Aktif`;

      if (!document.getElementById('input-teacher-id').value.trim()) {
        document.getElementById('input-teacher-id').value = generateTeacherId();
        document.getElementById('input-teacher-id').dispatchEvent(new Event('input'));
      }
      if (!document.getElementById('input-jabatan').value.trim()) {
        document.getElementById('input-jabatan').value = 'DOSEN';
        document.getElementById('input-jabatan').dispatchEvent(new Event('input'));
      }
    } else {
      document.getElementById('card-label-status-details').textContent = 'STATUS';
    }
  }

  cardTypeInput.addEventListener('change', () => {
    applyCardType(cardTypeInput.value);
  });

  document.getElementById('input-school').addEventListener('change', (e) => {
    applySchool(e.target.value);
  });

  // --- Live Updates ---
  Object.keys(fieldMap).forEach(inputId => {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.addEventListener('input', () => {
      const target = document.getElementById(fieldMap[inputId]);
      if (target) target.textContent = input.value || '—';
      if (inputId === 'input-name') {
        document.getElementById('card-name-teacher-display').textContent = input.value || '—';
      }
      if (inputId === 'input-nisn') updateBarcode();
    });
  });

  // Combined Tahun Masuk / Status display (student card)
  function updateStudentTahunStatus() {
    const tahun = document.getElementById('input-tahun').value || '—';
    const status = inputStatus.value || 'Aktif';
    document.getElementById('card-tahun-status-value').textContent = `${tahun} / ${status}`;
  }

  const inputTahun = document.getElementById('input-tahun');
  inputTahun.addEventListener('input', () => {
    updateStudentTahunStatus();
  });

  // Status
  inputStatus.addEventListener('change', () => {
    updateStudentTahunStatus();
    document.getElementById('card-status-details').textContent = inputStatus.value;
  });

  // Validity
  const inputValid = document.getElementById('input-valid');
  inputValid.addEventListener('input', () => {
    document.getElementById('card-valid').textContent = inputValid.value;
  });

  // --- Photo Upload ---
  photoUploadArea.addEventListener('click', () => photoInput.click());

  photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      updatePhoto(dataUrl);
    };
    reader.readAsDataURL(file);
  });

  function updatePhoto(src) {
    // Update card photo
    cardPhoto.src = src;
    // Update thumbnail
    photoPreviewThumb.src = src;
    photoPreviewThumb.classList.add('visible');
    uploadPlaceholder.style.display = 'none';
  }

  // --- QR Code Generator (using qrcode lib) ---
  function updateQR() {
    const name = document.getElementById('input-name').value;
    const nisn = document.getElementById('input-nisn').value;
    const textToEncode = `${name}-${nisn}`;
    
    QRCode.toCanvas(qrCanvas, textToEncode, {
      width: 64,
      margin: 0,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    }, function (error) {
      if (error) console.error(error)
    });
  }

  // --- Barcode Generator ---
  const barCanvas = document.getElementById('bar-canvas');
  function updateBarcode() {
    const nisn = document.getElementById('input-nisn').value || '0000000000';
    try {
      JsBarcode(barCanvas, nisn, {
        format: 'CODE128',
        width: 2,
        height: 40,
        displayValue: true,
        fontSize: 10,
        margin: 4,
        background: '#ffffff',
        lineColor: '#000000',
      });
    } catch (e) {
      console.warn('Barcode generation error:', e);
    }
  }

  // --- Random Data Generation ---
  const kelasOptions = ['X TKJ 1', 'XI RPL 2', 'XII AKL 3', 'X DKV 1'];
  const jurusanOptions = ['TKJ', 'RPL', 'AKL', 'DKV'];
  const tempatLahirOptions = [
    'Surabaya', 'Malang', 'Jakarta', 'Bandung', 'Yogyakarta',
    'Semarang', 'Medan', 'Makassar', 'Palembang', 'Depok',
    'Tangerang', 'Bekasi', 'Bogor', 'Denpasar', 'Padang',
    'Pontianak', 'Samarinda', 'Manado', 'Pekanbaru', 'Ngawi'
  ];
  const bulanOptions = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const disallowedNameTokens = new Set([
      'MR', 'MRS', 'MS', 'MISS', 'DR', 'DRA', 'PROF', 'PROFESSOR',
      'SIR', 'JR', 'SR', 'PHD', 'MD', 'DDS', 'II', 'III', 'IV'
    ]);

    function sanitizeName(rawName) {
      return (rawName || '')
        .replace(/[.,]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    function isNormalStudentName(name) {
      const cleaned = sanitizeName(name);
      if (!cleaned) return false;

      const words = cleaned.split(' ');
      if (words.length < 2 || words.length > 3) return false;

      return words.every((word) => {
        const token = word.toUpperCase();
        const isAlphabetic = /^[A-Za-z'-]+$/.test(word);
        return isAlphabetic && !disallowedNameTokens.has(token);
      });
    }

    async function fetchNormalIdentity(maxAttempts = 8) {
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          const response = await fetch('/api/namefake/');
          if (!response.ok) {
            console.warn(`Identity API request failed, status ${response.status}, attempt ${attempt}/${maxAttempts}`);
            continue;
          }

          const identity = await response.json();
          const cleanedName = sanitizeName(identity?.name);

          if (!isNormalStudentName(cleanedName)) {
            console.warn(`Rejected random name format: "${identity?.name || ''}" (attempt ${attempt}/${maxAttempts})`);
            continue;
          }

          return {
            identity,
            fullName: cleanedName.toUpperCase(),
          };
        } catch (error) {
          console.warn(`Identity API request error (attempt ${attempt}/${maxAttempts}):`, error);
        }
      }

      throw new Error('Unable to get normal random name after retries');
    }

  async function generateRandomCardData() {
      try {
        const cardType = cardTypeInput.value;
        const isTeacher = cardType === 'teacher';

        // 1. Fetch random identity data and re-request until name format is normal
        const { identity, fullName } = await fetchNormalIdentity();

        // 2. Build numeric NIS/NISN from API-safe UUID/hash characters
        const rawNisnSource = `${identity?.username || ''}${identity?.maiden_name || ''}${Date.now()}`;
        let nisn = rawNisnSource.replace(/\D/g, '').slice(0, 10);
        if (nisn.length < 10) {
          nisn = `${nisn}${Math.floor(Math.random() * 1e10).toString().padStart(10, '0')}`.slice(0, 10);
        }

        // 3. Generate random additional info
          const randomCity = tempatLahirOptions[Math.floor(Math.random() * tempatLahirOptions.length)];
          const randomDay = Math.floor(Math.random() * 28) + 1;
          const randomMonth = bulanOptions[Math.floor(Math.random() * bulanOptions.length)];
          const randomYear = isTeacher
            ? Math.floor(Math.random() * 21) + 1965  // teacher: 1965-1985
            : Math.floor(Math.random() * 5) + 2005;  // student: 2005-2009
          const ttl = `${randomCity}, ${randomDay} ${randomMonth} ${randomYear}`;
          const randomTahunMasuk = (randomYear + 15).toString();

          // Update form inputs
          document.getElementById('input-name').value = fullName;
          document.getElementById('input-name').dispatchEvent(new Event('input'));
          document.getElementById('card-name-teacher-display').textContent = fullName;

          document.getElementById('input-nisn').value = nisn;
          document.getElementById('input-nisn').dispatchEvent(new Event('input'));

          document.getElementById('input-ttl').value = ttl;
          document.getElementById('input-ttl').dispatchEvent(new Event('input'));

          const newIssuedDate = randomPastIssuedDate();
          document.getElementById('input-tahun').value = isTeacher ? newIssuedDate : randomTahunMasuk;
          document.getElementById('input-tahun').dispatchEvent(new Event('input'));

          if (isTeacher) {
            document.getElementById('input-kelas').value = '';
            document.getElementById('input-kelas').dispatchEvent(new Event('input'));

            document.getElementById('input-jurusan').value = '';
            document.getElementById('input-jurusan').dispatchEvent(new Event('input'));

            document.getElementById('input-jabatan').value = 'Dosen';
            document.getElementById('input-jabatan').dispatchEvent(new Event('input'));

            document.getElementById('input-teacher-id').value = generateTeacherId();
            document.getElementById('input-teacher-id').dispatchEvent(new Event('input'));

            inputStatus.value = 'Aktif';
            inputStatus.dispatchEvent(new Event('change'));
            document.getElementById('card-label-status-details').textContent = 'DITERBITKAN / STATUS';
            document.getElementById('card-status-details').textContent = `${newIssuedDate} / Aktif`;
            updateBarcode();
          } else {
            const randomKelas = kelasOptions[Math.floor(Math.random() * kelasOptions.length)];
            const randomJurusan = jurusanOptions[Math.floor(Math.random() * jurusanOptions.length)];

            document.getElementById('input-kelas').value = randomKelas;
            document.getElementById('input-kelas').dispatchEvent(new Event('input'));

            document.getElementById('input-jurusan').value = randomJurusan;
            document.getElementById('input-jurusan').dispatchEvent(new Event('input'));

            document.getElementById('input-jabatan').value = '';
            document.getElementById('input-jabatan').dispatchEvent(new Event('input'));

            document.getElementById('input-teacher-id').value = '';
            document.getElementById('input-teacher-id').dispatchEvent(new Event('input'));

            document.getElementById('input-proof-doc').value = '';
            document.getElementById('input-proof-doc').dispatchEvent(new Event('input'));
          }

            // 4. Fetch Photo from Unsplash
          await fetchUnsplashPhoto();

      } catch (error) {
            console.error('Error generating random card data:', error);
          alert("Gagal mengambil data random.");
      }
  }

  async function fetchUnsplashPhoto() {
      try {
          const randomPage = Math.floor(Math.random() * 5) + 1;
          const searchParams = new URLSearchParams({
              'query': 'portrait person face',
              'page': randomPage,
              'per_page': 20,
              'orientation': 'portrait',
              'content_filter': 'high'
          });

          const response = await fetch(`/api/unsplash/search/photos?${searchParams.toString()}`, {
              headers: {
                  'Accept-Language': 'en-US,en;q=0.5'
              }
          });

          if (!response.ok) {
              console.warn("Unsplash API error, status:", response.status);
              return;
          }

          const data = await response.json();

          if (data.results && data.results.length > 0) {
              // Pick a random photo from the results
              const randomImageIndex = Math.floor(Math.random() * data.results.length);
              const item = data.results[randomImageIndex];
              const imageUrl = item.urls?.small;
              if (imageUrl) {
                  updatePhoto(imageUrl);
              } else {
                  console.warn("No image URL found in Unsplash response item:", item);
              }
          }
      } catch (error) {
          console.error('Error fetching photo from Unsplash:', error);
      }
  }

  document.getElementById('btn-random-data').addEventListener('click', generateRandomCardData);

  // --- Export PNG ---
  document.getElementById('btn-print').addEventListener('click', async () => {
    // using html2canvas to export to png
    const cardElement = document.getElementById('id-card');
    
    // add a brief loading state if needed
    
    try {
        // SVG `image` tags are notoriously problematic with html2canvas.
        // We ensure `allowTaint` and `useCORS` are true.
        const canvas = await html2canvas(cardElement, {
            scale: 2, // higher resolution
            useCORS: true, // required for loading external unsplash image and SVG images
            allowTaint: true,
            backgroundColor: null
        });

        const dataUrl = canvas.toDataURL("image/png");
        
        // Trigger download
        const link = document.createElement('a');
        link.download = `ID_Card_${document.getElementById('input-nisn').value}.png`;
        link.href = dataUrl;
        link.click();
    } catch (error) {
        console.error("Error generating PNG:", error);
        alert("Gagal membuat gambar PNG.");
    }
  });

  // --- Reset ---
  document.getElementById('btn-reset').addEventListener('click', () => {
    if (!confirm('Reset semua data? / Reset all data?')) return;

    document.getElementById('input-name').value = '';
    document.getElementById('input-nisn').value = '';
    document.getElementById('input-kelas').value = '';
    document.getElementById('input-jurusan').value = '';
    document.getElementById('input-jabatan').value = '';
    document.getElementById('input-teacher-id').value = '';
    document.getElementById('input-proof-doc').value = '';
    document.getElementById('input-ttl').value = '';
    document.getElementById('input-tahun').value = '';
    document.getElementById('input-status').value = 'Aktif';
    document.getElementById('input-valid').value = '31 DESEMBER 2028';
    document.getElementById('input-school').value = 'smkn1ngawi';

    // Reset card display
    document.getElementById('card-name').textContent = '—';
    document.getElementById('card-name-teacher-display').textContent = '—';
    document.getElementById('card-nisn').textContent = '—';
    document.getElementById('card-kelas').textContent = '—';
    document.getElementById('card-jurusan').textContent = '—';
    document.getElementById('card-jabatan').textContent = '—';
    document.getElementById('card-teacher-id').textContent = '—';
    document.getElementById('card-proof-doc').textContent = '—';
    document.getElementById('card-ttl').textContent = '—';
    document.getElementById('card-tahun-status-value').textContent = '— / —';
    document.getElementById('card-status-details').textContent = 'Aktif';
    document.getElementById('card-valid').textContent = '31 DESEMBER 2028';

    // Reset photo
    cardPhoto.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='260' viewBox='0 0 200 260'%3E%3Crect fill='%23ddd' width='200' height='260'/%3E%3Ctext x='100' y='130' text-anchor='middle' fill='%23999' font-size='14'%3EFoto%3C/text%3E%3C/svg%3E";
    photoPreviewThumb.classList.remove('visible');
    photoPreviewThumb.src = '';
    uploadPlaceholder.style.display = '';
    photoInput.value = '';

    applyCardType(cardTypeInput.value);
    applySchool('smkn1ngawi');
    inputStatus.dispatchEvent(new Event('change'));
    updateQR();
  });

  // --- Initialize: auto-load random student data on page load ---
  applyCardType(cardTypeInput.value);
  applySchool(document.getElementById('input-school').value);
  generateRandomCardData();
});
