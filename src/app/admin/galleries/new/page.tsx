import AdminShell from '@/components/admin/AdminShell'
import GalleryForm from '@/components/admin/GalleryForm'

export const metadata = {
  title: 'New Gallery',
}

export default function NewGalleryPage() {
  return (
    <AdminShell>
      <GalleryForm />
    </AdminShell>
  )
}
