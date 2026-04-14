const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export async function uploadImageToCloudinary(file, folder = 'fitrack') {
  if (!cloudName || !uploadPreset) {
    throw new Error('Missing Cloudinary environment variables.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', folder)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    throw new Error('Cloudinary upload failed.')
  }

  const data = await response.json()

  return {
    secureUrl: data.secure_url,
    publicId: data.public_id,
  }
}