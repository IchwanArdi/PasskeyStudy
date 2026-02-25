import { BookOpen, CheckCircle } from 'lucide-react';

const IntroductionSection = () => (
  <div id="introduction" className="space-y-8 sm:space-y-10 animate-fade-in-up">
    <div className="space-y-4">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/[0.08] border border-blue-500/20 rounded-full text-blue-400 text-xs font-semibold">
        <BookOpen className="w-3 h-3" />
        Fondasi Penelitian
      </div>
      <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">Pendahuluan</h1>
      <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
        Platform riset autentikasi berbasis WebAuthn/FIDO2 yang dirancang untuk analisis empiris perbandingan metode autentikasi modern terhadap sistem password tradisional.
      </p>
    </div>

    <div id="overview" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Latar Belakang</h2>
      <p className="text-gray-400 leading-relaxed text-base">
        Autentikasi berbasis password telah menjadi standar de facto selama beberapa dekade. Namun, mekanisme <em>shared-secret</em> ini memiliki kelemahan fundamental: password dapat dicuri melalui phishing, ditebak melalui brute force, atau bocor melalui pelanggaran data (data breach). Menurut Verizon Data Breach Investigations Report (2023), lebih dari 80% pelanggaran data melibatkan kredensial yang dicuri atau lemah.
      </p>
      <p className="text-gray-400 leading-relaxed text-base">
        WebAuthn (Web Authentication API) adalah standar W3C yang mengimplementasikan autentikasi berbasis kriptografi kunci publik (public-key cryptography). Dikembangkan oleh FIDO Alliance dan W3C, WebAuthn menghilangkan kebutuhan password dengan menggunakan <em>authenticator</em> perangkat keras atau platform (biometrik, TPM, security key) untuk membuktikan identitas pengguna.
      </p>
      <p className="text-gray-400 leading-relaxed text-base">
        Proyek ini merupakan implementasi komprehensif yang menyediakan lingkungan <em>dual-vektor</em> untuk membandingkan kedua metode autentikasi secara empiris dari tiga aspek: <strong className="text-white">keamanan</strong>, <strong className="text-white">performa</strong>, dan <strong className="text-white">usabilitas (UX)</strong>.
      </p>
    </div>

    <div id="features" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Kapabilitas Utama</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          'Dukungan Native FIDO2/WebAuthn',
          'Manajemen Multi-Perangkat (Kelola Passkey)',
          'Dashboard Analitik Real-time',
          'Mesin Simulasi Serangan Keamanan',
          'Survei System Usability Scale (SUS)',
          'Analisis Beban Kognitif (NASA-TLX)',
          'Pengukuran Performa Latensi & Payload',
          'Analisis Biaya (Capex/Opex/ROI)',
          'Alur Pemulihan Akun (Recovery Codes)',
          'Kompatibilitas Browser & Perangkat',
        ].map((feature) => (
          <div key={feature} className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center gap-3 hover:border-blue-500/20 transition-all">
            <CheckCircle className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-sm font-medium text-gray-300">{feature}</span>
          </div>
        ))}
      </div>
    </div>

    <div id="getting-started" className="space-y-4 pt-8 border-t border-white/[0.06]">
      <h2 className="text-xl font-bold text-white">Arsitektur Teknologi</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <h4 className="font-bold text-blue-400 mb-2">Frontend (Client)</h4>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• React 19 + Vite 7</li>
            <li>• Tailwind CSS 4</li>
            <li>• @simplewebauthn/browser</li>
            <li>• Recharts (visualisasi data)</li>
          </ul>
        </div>
        <div className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
          <h4 className="font-bold text-blue-400 mb-2">Backend (Server)</h4>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Node.js + Express.js</li>
            <li>• MongoDB + Mongoose</li>
            <li>• @simplewebauthn/server</li>
            <li>• JWT (jsonwebtoken) + bcrypt</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

export default IntroductionSection;
