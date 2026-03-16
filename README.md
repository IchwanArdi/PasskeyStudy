Tenang, overthinking itu wajar banget, apalagi topik skripsimu tergolong "keren" dan teknis banget (FIDO2 itu standar baru!). Tapi, mari kita bedah ketakutanmu pakai logika biar kamu lebih tenang:
1. Dosen Penguji Itu Bukan "Musuh"
Ingat, dosen penguji di Amikom Purwokerto itu tujuannya memvalidasi, bukan menjatuhkan. Mereka ingin memastikan:
Kamu yang bikin sendiri (makanya ditanya logika program).
Kamu paham apa yang kamu tulis (makanya ditanya teori FIDO2).
Programnya jalan (makanya ada demo).
2. Kamu Adalah "Ahlinya" di Ruangan Itu
Percaya atau tidak, untuk topik FIDO2/WebAuthn, kemungkinan besar kamu lebih tahu detail teknisnya daripada dosen pengujimu.
Dosen mungkin paham konsep keamanan secara umum, tapi detail cara kerja library atau handshake WebAuthn yang kamu kulik berbulan-bulan itu cuma kamu yang hafal luar dalam.
Gunakan ini sebagai rasa percaya diri. Kamu sedang "mengajar" mereka tentang teknologi baru ini.
3. "Senjata" Ampuh Lawan Overthinking:
Biar nggak makin kepikiran, lakukan persiapan fisik yang bisa mengurangi beban mental:
Siapkan Cheat Sheet: Bikin catatan kecil atau comment di kodingan yang menjelaskan alur data. Kalau mendadak "blank", kamu tinggal liat catatan itu.
Simulasi Mandiri: Coba jelaskan cara kerja login tanpa password ke teman yang nggak ngerti IT. Kalau mereka paham, berarti penjelasanmu sudah oke buat sidang.
Folder yang Rapi: Pastikan folder kodinganmu nggak berantakan. Jadi kalau disuruh buka file tertentu, kamu nggak panik nyarinya.
4. Batasan Masalah Adalah Penyelamat
Kalau penguji tanya hal yang aneh-aneh atau di luar jangkauanmu, kamu selalu punya jawaban sakti:
"Mohon maaf Pak/Bu, hal tersebut di luar batasan masalah penelitian saya. Fokus penelitian ini adalah pada implementasi autentikasi FIDO2 untuk keamanan login, bukan pada [sebutkan hal yang ditanyakan]."
Strategi Selanjutnya:
Coba cek lagi, bagian mana dari FIDO2/WebAuthn yang menurutmu paling susah dijelaskan? Apakah bagian Attestation atau Assertion-nya? Kita bisa bahas cara menjelaskannya dengan bahasa yang simpel!
Hasil ini hanya untuk tujuan informasi. Untuk mendapatkan diagnosis atau saran medis, hubungi profesional. Respons AI mungkin berisi kesalahan. Pelajari lebih lanjut




karena takut di tanya ini itu jelasin kodingan ini itu dll
Wajar banget kalau kamu merasa overthinking, apalagi topik FIDO2/WebAuthn itu memang secara teknis "berat" di bagian pertukaran datanya. Tapi, mari kita bedah ketakutanmu supaya lebih tenang:
1. Penguji Tidak Akan Menanyakan Semua Baris
Kodingan aplikasi itu ribet, ada koneksi database, desain CSS, sampai logika routing. Penguji nggak akan peduli sama kodingan standar itu. Mereka cuma akan menembak bagian "Jantung" skripsimu.
Untuk judulmu, "Jantung"-nya cuma dua:
Proses Registrasi: Saat user mendaftarkan sidik jari/kunci (membuat Public Key).
Proses Login: Saat user verifikasi (proses Challenge dan Assertion).
2. Fokus pada "Input" dan "Output"
Kalau ditanya kodingan, jangan jelaskan sintaksnya (misal: "Ini variabel, ini loop..."). Jelaskan logikanya.
Contoh Jawaban: "Bagian kode ini fungsinya untuk menerima Challenge dari server, lalu dikirim ke browser supaya user bisa scan sidik jari. Hasil scannya nanti dikirim balik ke server untuk dicocokkan."
Jawaban seperti ini jauh lebih disukai penguji daripada kamu baca kode baris per baris.
3. Trik "Komentar" di Kodingan
Biar nggak blank pas sidang, buka kodinganmu sekarang dan beri komentar (//) yang besar di bagian-bagian penting.
Contoh: // --- BAGIAN KIRIM CHALLENGE KE BROWSER ---
Contoh: // --- BAGIAN VERIFIKASI TANDA TANGAN FIDO2 ---
Pas disuruh buka kode, kamu tinggal cari komentar itu. Ini legal dan malah menunjukkan kamu rapi dalam bekerja.
4. Gunakan Diagram sebagai "Tameng"
Di slide presentasi, pastikan ada Sequence Diagram (diagram alur urutan).
Kalau penguji tanya: "Gimana kodingan loginnya?"
Kamu jawab: "Izin menjelaskan alurnya dulu lewat diagram ini Pak/Bu agar lebih jelas, baru setelah itu saya tunjukkan kodenya."
Ini bakal memakan waktu sidang dan membuatmu terlihat sangat menguasai materi.
5. Penguji Kadang Cuma "Tes Mental"
Kadang mereka tanya teknis cuma buat memastikan: "Ini kamu yang bikin atau joki?".
Kalau kamu bisa jawab: "Oh, bagian itu saya pakai library [Sebutkan Nama Library]-nya WebAuthn, lalu saya modifikasi di bagian simpan datanya ke database desa," mereka biasanya langsung puas karena itu bukti kamu memang ngulik sendiri.
Saran praktis:
Coba kamu buka kodinganmu, terus pilih satu fungsi yang paling menurutmu paling susah. Coba jelaskan ke diri sendiri dalam 3 kalimat saja: Apa inputnya? Apa prosesnya? Apa hasilnya?
Sudah coba melakukan simulasi demo program sendiri di rumah? Biasanya kalau demo lancar, pertanyaan kodingan bakal jauh lebih sedikit.




takutnya itu kaya isi dari const kan ada bayak variablenya ada .. nah itu yg membuat saya
Wajar banget kalau kamu panik lihat isi const atau object di WebAuthn, karena isinya memang "keriting" (kayak challenge, allowCredentials, clientDataJSON, dll). Tapi, dengerin ini: Dosen penguji juga manusia, mereka nggak hafal semua isi variabel itu luar kepala!
Ini rahasia biar kamu nggak overthinking pas ditanya isi variabel yang banyak itu:
1. Jangan Hafalin Variabelnya, Hafalin "Fungsi Kelompoknya"
Dalam FIDO2/WebAuthn, variabel di dalam const itu sebenarnya cuma dibagi jadi 3 kelompok besar. Hafalin kelompoknya aja:
Identitas: Kayak rp (siapa servernya/Relying Party) dan user (siapa yang mau login).
Keamanan: Kayak challenge (angka acak biar nggak kena serangan replay).
Kriteria Alat: Kayak authenticatorSelection (mau pakai sidik jari HP atau USB Key?).
Kalau ditanya: "Ini isi variabel challenge buat apa?"
Jawabanmu: "Itu angka acak dari server, Pak, fungsinya buat mastiin kalau proses login ini unik dan nggak bisa diduplikasi sama hacker." (Selesai, penguji bakal manggut-manggut).
2. Akui Kalau Itu Standar Protokol
Kalau penguji tanya variabel yang sangat teknis dan kamu lupa, gunakan jawaban "Sakti" ini:
"Variabel ini adalah parameter standar dari protokol WebAuthn/FIDO2, Pak. Saya mengikuti dokumentasi resminya supaya proses komunikasinya aman sesuai standar global."
Jawaban ini menunjukkan kamu riset pakai standar yang benar, bukan asal asalan.
3. Gunakan console.log() sebagai "Contekan"
Pas simulasi atau demo, kamu bisa selipkan console.log(options) sebelum proses biometrik muncul.
Kalau penguji tanya: "Coba lihat data apa aja yang dikirim ke browser?"
Kamu tinggal buka Inspect Element (F12) di Chrome, terus tunjukin isinya. Kamu nggak perlu hafal, tinggal baca yang muncul di layar!
4. Fokus ke Alur "Kunci & Gembok"
Ingat, inti skripsimu itu cuma:
Server kasih Challenge (Gembok).
User scan jari buat bikin Signature (Kunci).
Server cek, cocok nggak?
Isi variabel yang banyak itu cuma "bumbu" biar proses kirim gembok dan kuncinya aman.
Tips Terakhir:
Dosen Amikom biasanya lebih kagum kalau kamu bisa jelasin kenapa data itu dikirim, daripada sekadar hafal nama variabelnya.
Coba kamu lihat kodinganmu sekarang, variabel mana yang paling bikin kamu bingung? Sebutin di sini, nanti saya bantu cari bahasa manusia yang paling gampang buat ngejelasinnya ke penguji!
Mau coba simulasi satu variabel yang paling bikin kamu pusing?




