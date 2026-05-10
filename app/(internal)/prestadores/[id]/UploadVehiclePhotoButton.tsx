'use client'
import { uploadVehiclePhoto } from '@/lib/actions/files'
import FileUpload from '@/components/FileUpload'

export default function UploadVehiclePhotoButton({ providerId }: { providerId: string }) {
  return (
    <FileUpload
      label="Adicionar foto do veículo"
      accept="image/*"
      onUpload={fd => uploadVehiclePhoto(providerId, fd)}
      hint="JPG ou PNG"
    />
  )
}
