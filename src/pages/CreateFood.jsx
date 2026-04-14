import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadImageToCloudinary } from '../api/cloudinaryApi'
import { createFood } from '../api/foodApi'

function BackIcon({ className = 'h-6 w-6' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function CheckIcon({ className = 'h-6 w-6' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function CloseIcon({ className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  )
}

function CameraIcon({ className = 'h-6 w-6' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 7h3l2-2h6l2 2h3v12H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  )
}

function SuccessModal({ onClose }) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center text-slate-500"
            aria-label="Close success modal"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex flex-col items-center pb-2 pt-1">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckIcon className="h-7 w-7" />
          </div>

          <div className="mt-4 text-lg font-semibold text-black">
            New Food Added
          </div>
        </div>
      </div>
    </>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium text-slate-700">{label}</div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-slate-400 focus:border-slate-300"
      />
    </label>
  )
}

function AddPhotoSheet({ onClose, onTakePhoto, onChoosePhoto }) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-x-4 bottom-4 z-50 rounded-3xl bg-white p-4 shadow-2xl">
        <div className="mb-3 text-center text-sm font-semibold text-slate-700">
          Add Photo
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={onTakePhoto}
            className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-black"
          >
            Open Camera
          </button>

          <button
            type="button"
            onClick={onChoosePhoto}
            className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-black"
          >
            Choose From Files
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}

function CreateFood() {
  const navigate = useNavigate()
  const cameraInputRef = useRef(null)
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    name: '',
    servingDescription: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  })

  const [selectedImageFile, setSelectedImageFile] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [showPhotoSheet, setShowPhotoSheet] = useState(false)

  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
    }
  }, [imagePreviewUrl])

  const updateField = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const setSelectedImage = (file) => {
    if (!file) return

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl)
    }

    const previewUrl = URL.createObjectURL(file)
    setSelectedImageFile(file)
    setImagePreviewUrl(previewUrl)
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedImage(file)
    setShowPhotoSheet(false)

    event.target.value = ''
  }

  const handleRemoveImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl)
    }

    setSelectedImageFile(null)
    setImagePreviewUrl('')
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setErrorMessage('')

      let imageUrl = null

      if (selectedImageFile) {
        const uploadResult = await uploadImageToCloudinary(
          selectedImageFile,
          'fitrack/foods'
        )
        imageUrl = uploadResult.secureUrl
      }

      await createFood({
        name: formData.name.trim(),
        servingDescription: formData.servingDescription.trim() || null,
        imageUrl,
        calories: Number(formData.calories) || 0,
        protein: Number(formData.protein) || 0,
        carbs: Number(formData.carbs) || 0,
        fat: Number(formData.fat) || 0,
        isFavorite: false,
      })

      setShowSuccessModal(true)
    } catch {
      setErrorMessage('Unable to create food.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto w-full max-w-3xl px-4 pb-8 pt-4">
        <div className="flex items-center justify-between pb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"
            aria-label="Go back"
          >
            <BackIcon />
          </button>

          <h1 className="text-lg font-semibold text-black">Create Food</h1>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-green-600 shadow-sm ring-1 ring-slate-200 disabled:opacity-50"
            aria-label="Save food"
          >
            <CheckIcon />
          </button>
        </div>

        {errorMessage ? (
          <div className="mb-4 rounded-2xl bg-white px-4 py-3 text-sm text-red-500 shadow-sm ring-1 ring-slate-200/70">
            {errorMessage}
          </div>
        ) : null}

        <div className="space-y-4">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
            <h2 className="text-base font-semibold text-black">Basic Info</h2>

            <div className="mt-4 space-y-4">
              <Field
                label="Name"
                value={formData.name}
                onChange={(event) => updateField('name', event.target.value)}
                placeholder="Chicken Breast"
              />

              <Field
                label="Serving Description"
                value={formData.servingDescription}
                onChange={(event) =>
                  updateField('servingDescription', event.target.value)
                }
                placeholder="100g"
              />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
            <h2 className="text-base font-semibold text-black">
              Nutritional Information
            </h2>

            <div className="mt-4 space-y-4">
              <Field
                label="Calories"
                type="number"
                value={formData.calories}
                onChange={(event) => updateField('calories', event.target.value)}
                placeholder="165"
              />

              <Field
                label="Protein"
                type="number"
                value={formData.protein}
                onChange={(event) => updateField('protein', event.target.value)}
                placeholder="31"
              />

              <Field
                label="Carbs"
                type="number"
                value={formData.carbs}
                onChange={(event) => updateField('carbs', event.target.value)}
                placeholder="0"
              />

              <Field
                label="Fat"
                type="number"
                value={formData.fat}
                onChange={(event) => updateField('fat', event.target.value)}
                placeholder="3.6"
              />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-black">Photo</h2>

              {selectedImageFile ? (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-sm font-semibold text-red-500"
                >
                  Remove
                </button>
              ) : null}
            </div>

            {imagePreviewUrl ? (
              <div className="mt-4">
                <img
                  src={imagePreviewUrl}
                  alt="Selected food preview"
                  className="h-48 w-full rounded-2xl object-cover ring-1 ring-slate-200"
                />
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setShowPhotoSheet(true)}
              className="mt-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-slate-600"
            >
              <CameraIcon className="h-5 w-5" />
              <span className="text-sm font-semibold">
                {imagePreviewUrl ? 'Change Photo' : 'Add Photo'}
              </span>
            </button>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </section>
        </div>
      </div>

      {showPhotoSheet ? (
        <AddPhotoSheet
          onClose={() => setShowPhotoSheet(false)}
          onTakePhoto={() => cameraInputRef.current?.click()}
          onChoosePhoto={() => fileInputRef.current?.click()}
        />
      ) : null}

      {showSuccessModal ? (
        <SuccessModal
          onClose={() => {
            setShowSuccessModal(false)
            navigate(-1)
          }}
        />
      ) : null}
    </div>
  )
}

export default CreateFood