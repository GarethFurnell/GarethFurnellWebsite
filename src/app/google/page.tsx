import { getImages } from '@/utils/getImages';
import GoogleCloudClient from './GoogleCloudClient';

export const metadata = {
  title: 'Google Cloud & BigQuery ML | Gareth Furnell',
  description: 'Interactive BigQuery ML Climate Forecaster, NASA Orbital Radar, and Professional Google Cloud Certifications.',
};

export default function GooglePage() {
  const googleImages = getImages('certifications/google');

  return <GoogleCloudClient googleImages={googleImages} />;
}
