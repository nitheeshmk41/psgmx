'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DisclaimerModalProps {
  isShown: boolean
  onAccept: () => void
}

export function DisclaimerModal({ isShown, onAccept }: DisclaimerModalProps) {
  return (
    <Dialog open={isShown} onOpenChange={() => {}}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Platform Guidelines
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 space-y-3 mt-2">
            <p className="font-medium">Welcome to our platform!</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>This platform is for healthy competition, not aggressive competition.</li>
              <li>Solve at least one problem daily.</li>
              <li>
                Don't use any AI tools. If found by our AI moderators, your account will be
                removed immediately.
              </li>
            </ul>
            <p className="font-medium mt-2">
              By continuing, you agree to these guidelines.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onAccept} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            I Agree
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Example usage hook/component (wrap in your app)
export function useDisclaimerModal() {
  const [isAccepted, setIsAccepted] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const accepted = localStorage.getItem('disclaimerAccepted')
      if (!accepted) {
        setShowModal(true)
      }
    }
  }, [])

  const handleAccept = () => {
    setIsAccepted(true)
    setShowModal(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('disclaimerAccepted', 'true')
    }
    // Optionally call onAccept prop if needed
  }

  return {
    showModal,
    handleAccept,
    DisclaimerModal: () => (
      <DisclaimerModal isShown={showModal} onAccept={handleAccept} />
    ),
  }
}

