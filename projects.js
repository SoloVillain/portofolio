/* =====================================================
   DATA PROYEK
   Edit file ini saja untuk menambah / mengubah proyek.
   Daftar di bagian Work dan halaman detail dibuat
   otomatis dari data di bawah.

   Cara menambah proyek: salin satu blok { ... }, tempel
   di bawahnya (jangan lupa koma), lalu ubah isinya.

   Keterangan field:
   id      : unik, huruf kecil tanpa spasi (dipakai di URL: #/work/id)
   title   : judul proyek
   year    : tahun
   tags    : teks pendek di daftar Work
   info    : deskripsi di halaman detail
   roles   : peranmu di proyek (daftar)
   stack   : teknologi yang dipakai (daftar chip)
   live    : link demo   (kosongkan "" kalau tidak ada)
   github  : link GitHub (kosongkan "" kalau tidak ada)
   images  : screenshot tampilan (urutan = urutan galeri)
   grad    : warna pengganti jika gambar belum ada
   ===================================================== */

const PROJECTS = [
  {
    id: "stockin",
    title: "Stockin",
    year: "2026",
    tags: "Next.js · Express · MySQL",
    info: "Smart Warehouse & Inventory System untuk mengelola stok barang, mutasi gudang, dan laporan secara real-time. Terdiri dari dashboard web untuk manager dan aplikasi mobile untuk petugas gudang.",
    roles: ["Design", "Development", "Database"],
    stack: ["Next.js", "Express", "MySQL", "Flutter"],
    live: "https://uas-pbl-s3-frontend.vercel.app",
    github: "https://github.com/PBL-UAS-S3",
    images: ["img/stockin/stockin-1.png", "img/stockin/stockin-2.png", "img/stockin/stockin-3.png"],
    grad: "linear-gradient(135deg,#555,#111)"
  },
  {
    id: "smart-finance",
    title: "Smart Finance",
    year: "2026",
    tags: "Laravel · React",
    info: "Platform fintech untuk mencatat pemasukan dan pengeluaran, memantau anggaran, dan melihat ringkasan keuangan lewat dashboard yang mudah dibaca.",
    roles: ["UI/UX Design", "Frontend", "Backend"],
    stack: ["Laravel", "React", "MySQL"],
    live: "https://smart-finance-demo.netlify.app",
    github: "https://github.com/SoloVillain/smart_finance",
    images: ["img/finance-1.png", "img/finance-2.png", "img/finance-3.png"],
    grad: "linear-gradient(135deg,#888,#222)"
  },
  {
    id: "proyek-ketiga",
    title: "Proyek Ketiga",
    year: "2025",
    tags: "HTML · CSS · JS",
    info: "Tulis deskripsi singkat proyek ini: apa masalah yang diselesaikan dan apa fitur utamanya.",
    roles: ["Design", "Development"],
    stack: ["HTML", "CSS", "JavaScript"],
    live: "https://proyek-ketiga.netlify.app",
    github: "",
    images: [],
    grad: "linear-gradient(135deg,#bbb,#333)"
  },
  {
    id: "proyek-keempat",
    title: "Proyek Keempat",
    year: "2025",
    tags: "Flutter",
    info: "Tulis deskripsi singkat proyek ini: apa masalah yang diselesaikan dan apa fitur utamanya.",
    roles: ["Mobile Development"],
    stack: ["Flutter", "Dart"],
    live: "",
    github: "https://github.com/SoloVillain/proyek-keempat",
    images: [],
    grad: "linear-gradient(135deg,#666,#000)"
  }
];