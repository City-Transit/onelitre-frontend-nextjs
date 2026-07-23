import { apiFetch } from './api';

interface SignatureResponse {
  signature: string;
  timestamp: number;
  folder: string;
  apiKey: string;
  cloudName: string;
}

/** Uploads a file straight to Cloudinary using a backend-signed request; the file never touches our server. */
export async function uploadMealPhoto(file: File): Promise<string> {
  const sig: SignatureResponse = await apiFetch('/uploads/cloudinary-signature', {
    method: 'POST',
  });

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', sig.apiKey);
  formData.append('timestamp', String(sig.timestamp));
  formData.append('signature', sig.signature);
  formData.append('folder', sig.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Image upload failed');
  }

  const data = await res.json();
  return data.secure_url as string;
}

/** Dispatch-photo audit trail for large orders, uploaded by an admin at delivery hand-off. */
export async function uploadDispatchPhoto(orderId: string, file: File): Promise<string> {
  const sig: SignatureResponse = await apiFetch(
    `/uploads/dispatch-photo-signature/${orderId}`,
    { method: 'POST' },
  );

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', sig.apiKey);
  formData.append('timestamp', String(sig.timestamp));
  formData.append('signature', sig.signature);
  formData.append('folder', sig.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Dispatch photo upload failed');
  }

  const data = await res.json();
  return data.secure_url as string;
}

/** Vendor NIN/CAC/food-safety documents — allows PDFs as well as images, unlike meal photos. */
export async function uploadVendorDocument(file: File): Promise<string> {
  const sig: SignatureResponse = await apiFetch('/uploads/vendor-document-signature', {
    method: 'POST',
  });

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', sig.apiKey);
  formData.append('timestamp', String(sig.timestamp));
  formData.append('signature', sig.signature);
  formData.append('folder', sig.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Document upload failed');
  }

  const data = await res.json();
  return data.secure_url as string;
}
