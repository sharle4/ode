'use client'

import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CameraIcon, UserIcon } from '@heroicons/react/24/solid'

interface AvatarUploaderProps {
  user: User
  initialAvatarUrl: string | null
}

export default function AvatarUploader({ user, initialAvatarUrl }: AvatarUploaderProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl)
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const filePath = `${user.id}/${Date.now()}`
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file)

    if (uploadError) {
      alert("Erreur lors du téléversement de l'image.")
      console.error(uploadError)
      setIsUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id)

    if (updateError) {
      alert("Erreur lors de la mise à jour du profil.")
      console.error(updateError)
    } else {
      setAvatarUrl(publicUrl)
      router.refresh()
    }
    
    setIsUploading(false)
  }

  return (
    <div className="relative w-20 h-20">
      {avatarUrl ? (
        <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
      ) : (
        <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <UserIcon className="w-12 h-12 text-gray-500" />
        </div>
      )}
      <label 
        htmlFor="avatar-upload" 
        className="absolute bottom-0 right-0 bg-indigo-600 p-1.5 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors"
      >
        <CameraIcon className="w-4 h-4 text-white" />
        <input 
          id="avatar-upload" 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleUpload}
          disabled={isUploading}
        />
      </label>
    </div>
  )
}
