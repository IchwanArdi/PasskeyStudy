import { BookOpen } from 'lucide-react';

const UserGuideSection = () => (
  <div id="user-guide" className="space-y-10 animate-fade-in-up">
    <div className="space-y-4">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/[0.08] border border-green-500/20 rounded-full text-green-400 text-xs font-semibold">
        <BookOpen className="w-3 h-3" />
        Tutorial
      </div>
      <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">Panduan Pengguna</h1>
      <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
        Petunjuk langkah demi langkah untuk menggunakan seluruh fitur yang tersedia dalam platform penelitian ini.
      </p>
    </div>

    <div id="how-to-register" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Cara Mendaftar & Login</h2>
      <ol className="list-decimal list-inside text-gray-400 space-y-3">
        <li>Kunjungi halaman <span className="text-blue-400">Beranda</span> dan masukkan alamat email Anda pada field yang tersedia.</li>
        <li>Sistem akan mendeteksi ketersediaan akun. Jika belum terdaftar, Anda akan diarahkan untuk melakukan <strong className="text-white">Setup Passkey</strong>.</li>
        <li>Browser akan menampilkan prompt autentikasi bawaan sistem operasi (Windows Hello, Touch ID, atau Face ID). Ikuti instruksi pada layar untuk memindai biometrik Anda.</li>
        <li>Setelah berhasil, credential FIDO2 tersimpan secara aman di perangkat Anda (dalam TPM/Secure Element). Anda akan langsung diarahkan ke Dashboard.</li>
        <li>Untuk login berikutnya, cukup masukkan email dan verifikasi biometrik — <strong className="text-white">tanpa password</strong>.</li>
      </ol>
    </div>

    <div id="how-to-manage" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Cara Mengelola Perangkat</h2>
      <p className="text-gray-400">Halaman <span className="text-blue-400">Kelola Perangkat</span> memungkinkan Anda menambah, mengganti nama, atau menghapus authenticator yang terdaftar.</p>
      <ol className="list-decimal list-inside text-gray-400 space-y-3 mt-4">
        <li>Klik menu <span className="text-blue-400">Perangkat</span> pada navigasi atas/samping.</li>
        <li>Lihat daftar perangkat terdaftar beserta detail: nama, tipe, tanggal registrasi, dan terakhir digunakan.</li>
        <li>Untuk menambah perangkat baru, klik tombol <span className="text-blue-400">Tambah Perangkat</span> dan ikuti proses registrasi WebAuthn.</li>
        <li>Untuk mengubah nama perangkat, klik ikon edit di samping nama dan ketik nama baru.</li>
        <li>Untuk menghapus perangkat, klik ikon hapus dan konfirmasi. Sistem akan mencegah penghapusan credential terakhir untuk mencegah kehilangan akses.</li>
      </ol>
    </div>

    <div id="how-to-simulate" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Cara Menjalankan Simulasi Keamanan</h2>
      <p className="text-gray-400">Simulasi memungkinkan pengujian ketahanan WebAuthn dari perspektif penyerang (<em>attacker perspective</em>) secara aman.</p>
      <ol className="list-decimal list-inside text-gray-400 space-y-3 mt-4">
        <li>Buka <span className="text-blue-400">Dashboard</span> melalui navigasi utama.</li>
        <li>Pilih tab <span className="text-red-400 font-medium">Analisis Keamanan</span>.</li>
        <li>Pada bagian <em>Vektor Serangan</em>, klik <span className="text-red-400">Simulasi Password</span> atau <span className="text-blue-400">Simulasi WebAuthn</span>.</li>
        <li>Sistem akan mengeksekusi simulasi brute force dan menampilkan hasil: jumlah percobaan, durasi, kecepatan per percobaan, dan tingkat ketahanan.</li>
      </ol>
    </div>

    <div id="how-to-survey" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Cara Mengisi Survei UX</h2>
      <p className="text-gray-400">Data usabilitas dikumpulkan melalui formulir survei terstandar yang terintegrasi dalam dashboard.</p>
      <ol className="list-decimal list-inside text-gray-400 space-y-3 mt-4">
        <li>Buka tab <span className="text-blue-400">Riset UX</span> pada Dashboard.</li>
        <li>Klik tombol <span className="text-blue-400">Isi Survei Manual</span> pada bagian System Usability Scale.</li>
        <li>Pilih metode autentikasi yang sedang dievaluasi (Password atau WebAuthn).</li>
        <li>Isi 10 pertanyaan standar SUS dengan skala Likert 1-5.</li>
        <li>Klik <span className="text-blue-400">Simpan Data Survei</span>. Data akan langsung terintegrasi ke dalam analisis dashboard secara real-time.</li>
      </ol>
    </div>
  </div>
);

export default UserGuideSection;
