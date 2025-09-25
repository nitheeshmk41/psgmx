'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function DisclaimerModal() {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Platform Guidelines & Disclaimer
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Please read and acknowledge these guidelines to continue using our platform.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 text-sm text-gray-700">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Core Guidelines:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>
                This platform is for <strong>healthy competition</strong>, not aggressive competition.
              </li>
              <li>
                Solve at least <strong>one problem daily</strong> to stay engaged.
              </li>
            </ul>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Strict Policy:</h3>
            <p className="text-red-700">
              Don&apos;t use any AI tools. If found by our AI moderators, your account will be removed immediately.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setIsOpen(false)}
          >
            I Agree & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
