import { Home, FileText, Baby, Flower, Store } from 'lucide-react';

const LetterIcon = ({ jenis, className = "w-6 h-6" }) => {
  switch (jenis) {
    case 'domisili':
      return <Home className={className} />;
    case 'tidak_mampu':
      return <FileText className={className} />;
    case 'kelahiran':
      return <Baby className={className} />;
    case 'kematian':
      return <Flower className={className} />;
    case 'usaha':
      return <Store className={className} />;
    default:
      return <FileText className={className} />;
  }
};

export default LetterIcon;
