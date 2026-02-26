import Navigation from '../components/Navigation';
import { Target, BarChart2, Lightbulb, Wrench, Layers, CheckCircle2, XCircle } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white/20 pb-20">
      <Navigation />
      
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 grid-bg mask-radial opacity-20" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32">
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">Tentang Penelitian</h1>
          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Implementasi Sistem Autentikasi Passwordless (WebAuthn/FIDO2) pada Aplikasi Web Fullstack JavaScript
          </p>
        </div>

        {/* Latar Belakang */}
        <section className="mb-16 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
              <Lightbulb className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold">Latar Belakang</h2>
          </div>
          <div className="glass-card rounded-2xl p-8 space-y-6 text-gray-300 leading-relaxed text-[15px]">
            <p>
              Autentikasi berbasis password telah menjadi standar selama beberapa dekade, namun memiliki banyak kelemahan keamanan. Menurut berbagai penelitian, lebih dari 80% data breach disebabkan oleh password yang lemah atau dicuri.
              Masalah seperti phishing, brute force attacks, password reuse, dan social engineering terus menjadi ancaman serius bagi keamanan digital.
            </p>
            <p>
              WebAuthn (Web Authentication) adalah standar W3C yang dikembangkan untuk mengatasi masalah-masalah ini. Dengan menggunakan cryptographic keys yang tersimpan di device user, WebAuthn menghilangkan kebutuhan akan password sambil
              memberikan tingkat keamanan yang jauh lebih tinggi.
            </p>
            <p>
              Penelitian ini bertujuan untuk mengimplementasikan sistem autentikasi WebAuthn/FIDO2 dengan password tradisional dalam konteks aplikasi web fullstack JavaScript, menganalisis perbedaan dalam aspek
              keamanan dan performa secara teknis.
            </p>
          </div>
        </section>

        {/* Tujuan Penelitian */}
        <section className="mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold">Tujuan Penelitian</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-8 border-t-4 border-t-blue-500">
              <h3 className="text-lg font-bold text-white mb-3">Tujuan Umum</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Mengimplementasikan sistem autentikasi passwordless menggunakan WebAuthn/FIDO2 pada aplikasi web fullstack JavaScript sebagai alternatif terdesentralisasi yang kuat.</p>
            </div>
            <div className="glass-card rounded-2xl p-8 border-t-4 border-t-emerald-500">
              <h3 className="text-lg font-bold text-white mb-4">Tujuan Khusus</h3>
              <ul className="space-y-3">
                {[
                  'Mengimplementasikan sistem autentikasi WebAuthn/FIDO2 yang fungsional',
                  'Mengimplementasikan sistem autentikasi password tradisional sebagai endpoint komparatif',
                  'Fokus pada keamanan komputasional kriptografi asimetris',
                  'Mengukur dan melacak performa arsitektur jaringan metode autentikasi',
                  'Menyediakan dashboard analitik untuk data teknikal yang diukur',
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Manfaat Penelitian */}
        <section className="mb-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
              <BarChart2 className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold">Manfaat Penelitian</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-8 group hover:bg-white/[0.04] transition-all">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400" /> Manfaat Teoritis
              </h3>
              <ul className="space-y-3">
                {['Memberikan kontribusi pada penelitian tentang autentikasi passwordless', 'Menambah literatur tentang implementasi WebAuthn/FIDO2', 'Memberikan rincian komparasi waktu nyata dari metrik performa'].map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50 mt-1.5 shrink-0 group-hover:bg-purple-400 transition-colors" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card rounded-2xl p-8 group hover:bg-white/[0.04] transition-all">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400" /> Manfaat Praktis
              </h3>
              <ul className="space-y-3">
                {['Memberikan referensi implementasi WebAuthn untuk developer JavaScript', 'Membantu organisasi dalam adopsi teknologi autentikasi termodern', 'Menyediakan tool untuk demo dan evaluasi sistem passwordless siap pakai'].map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500/50 mt-1.5 shrink-0 group-hover:bg-purple-400 transition-colors" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Metodologi Penelitian */}
        <section className="mb-16 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
              <Layers className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold">Langkah Metodologi</h2>
          </div>
          <div className="glass-card rounded-2xl overflow-hidden">
            {[
              { title: 'Studi Literatur', desc: 'Mempelajari standar WebAuthn/FIDO2, best practices, dan rancang bangun arsitektur autentikasi.' },
              { title: 'Perancangan Sistem', desc: 'Merancang arsitektur web framework stack dengan logging yang menangkap payload jaringan dalam runtime server.' },
              { title: 'Implementasi', desc: 'Membangun API menggunakan Node.js/Express.js & UI dengan React tersinkronisasi pustaka @simplewebauthn.' },
              { title: 'Testing', desc: 'Proses deploy performa dan load behavior test via logger yang telah dieksekusi client/server.' },
              { title: 'Analisis Teknis', desc: 'Menganalisis hasil telemetri performance latency dan komparasi response payload WebAuthn terhadap Password.' },
            ].map((step, idx) => (
              <div key={idx} className="flex group border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-all">
                <div className="flex-none w-16 md:w-24 py-6 px-4 border-r border-white/[0.04] flex items-start justify-center">
                  <span className="text-xl font-bold text-gray-600 group-hover:text-amber-500 transition-colors">0{idx + 1}</span>
                </div>
                <div className="flex-1 py-6 px-6 sm:px-8">
                  <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mb-16 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
              <Wrench className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold">Teknologi yang Digunakan</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4">Backend</h3>
              <ul className="space-y-2">
                {['Node.js', 'Express.js', 'MongoDB + Mongoose', '@simplewebauthn/server', 'JWT + Bcryptjs'].map((tech, i) => (
                  <li key={i} className="text-sm text-gray-400 font-mono py-1 border-b border-white/[0.04] last:border-0">{tech}</li>
                ))}
              </ul>
            </div>
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4">Frontend</h3>
              <ul className="space-y-2">
                {['React.js', 'Tailwind CSS', '@simplewebauthn/browser', 'Recharts', 'Axios'].map((tech, i) => (
                  <li key={i} className="text-sm text-gray-400 font-mono py-1 border-b border-white/[0.04] last:border-0">{tech}</li>
                ))}
            </ul>
            </div>
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4">Ecosystem</h3>
              <ul className="space-y-2">
                {['Vite', 'Nodemon', 'Git', 'Lucide React', 'React Router'].map((tech, i) => (
                  <li key={i} className="text-sm text-gray-400 font-mono py-1 border-b border-white/[0.04] last:border-0">{tech}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Lingkup & Ekspektasi */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="glass-card rounded-2xl p-8 border border-white/[0.04]">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Ruang Lingkup Sistem
            </h2>
            <ul className="space-y-4">
              {[
                'Implementasi framework autentikasi ganda (Password + WebAuthn)',
                'Pemantauan performa koneksi jaringan dan payload transfer',
                'Analitik komparasi real-time dashboard',
                'Dukungan sinkronisasi lintas perangkat Passkey (CMA)',
              ].map((item, idx) => (
                <li key={idx} className="flex gap-3 text-[13px] text-gray-400 leading-relaxed">
                  <span className="w-1 h-4 rounded-full bg-emerald-500/50 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="glass-card rounded-2xl p-8 border border-white/[0.04]">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
              <XCircle className="w-5 h-5 text-gray-500" /> Luar Lingkup
            </h2>
            <ul className="space-y-4">
              {[
                'Mekanisme Two-Factor Authentication (2FA) spesifik untuk password',
                'Native bridge SDK untuk aplikasi porting diluar peramban (browser)',
                'Integrasi Enterprise Identity Access Management (SSO, Active Directory, LDAP)',
              ].map((item, idx) => (
                <li key={idx} className="flex gap-3 text-[13px] text-gray-500 leading-relaxed">
                  <span className="w-1 h-4 rounded-full bg-gray-700 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
