'use client'
import { uploadVehiclePhoto } from '@/lib/actions/files'
import FileUpload from '@/components/FileUpload'
import { useT } from '@/lib/i18n/I18nProvider'

export default function UploadVehiclePhotoButton({ providerId }: { providerId: string }) {
  const t = useT()
  return (
    <FileUpload
      label={t('common.addVehiclePhoto')}
      accept="image/*"
      onUpload={fd => uploadVehiclePhoto(providerId, fd)}
      hint={t('common.jpgOrPng')}
    />
  )
}
