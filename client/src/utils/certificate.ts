import toast from 'react-hot-toast';
import { codingApi } from '../services/api';

export async function openCertificateHtml(certId: string) {
  try {
    const { data } = await codingApi.getCertificateHtml(certId);
    const blob = new Blob([data], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) {
      URL.revokeObjectURL(url);
      toast.error('Please allow pop-ups to view your certificate');
      return;
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch {
    toast.error('Could not load certificate');
  }
}
