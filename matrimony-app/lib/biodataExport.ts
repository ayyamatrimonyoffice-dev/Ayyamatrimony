export type BiodataExportOptions = {
  includePhoto?: boolean;
  photoUri?: string;
};

export function applyExportPhotoToPrintBox(includePhoto: boolean, photoUri: string): () => void {
  if (typeof document === 'undefined') {
    return () => undefined;
  }

  const box = document.getElementById('biodata-print-photo-box');
  if (!box) {
    return () => undefined;
  }

  const originalHtml = box.innerHTML;

  if (!includePhoto || !photoUri.trim()) {
    box.innerHTML = '';
  } else {
    box.innerHTML = `<img src="${photoUri.replace(/"/g, '&quot;')}" alt="Profile" style="width:100%;height:100%;object-fit:cover;display:block;" />`;
  }

  return () => {
    box.innerHTML = originalHtml;
  };
}
