// File upload and download helpers
export async function uploadFile(file: File) {
  const resp = await fetch(`/api/files/upload-url?filename=${encodeURIComponent(file.name)}`);
  const { uploadUrl, secureFilename } = await resp.json();
  
  const put = await fetch(uploadUrl, { method: 'PUT', body: file });
  
  return { secureFilename, uploadResult: await put.json() };
}

export async function downloadFile(filename: string) {
  const resp = await fetch(`/api/files/download-url?filename=${encodeURIComponent(filename)}`);
  const { downloadUrl } = await resp.json();
  
  const res = await fetch(downloadUrl);
  return await res.blob();
}
