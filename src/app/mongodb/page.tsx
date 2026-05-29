import MongodbClient from './MongodbClient';
import { getImages } from '@/utils/getImages';

export const metadata = {
  title: 'MongoDB | Gareth Furnell',
  description: 'MongoDB Live Console & Certifications',
};

export default function MongodbPage() {
  const mongodbImages = getImages('certifications/mongodb');
  return <MongodbClient mongodbImages={mongodbImages} />;
}
