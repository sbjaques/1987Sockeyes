import { useParams } from 'react-router-dom';
export default function CupPage() {
  const { cup } = useParams();
  return <div>Cup: {cup}</div>;
}
