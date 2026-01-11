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
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface DisclaimerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DisclaimerModal({ open, onOpenChange }: DisclaimerModalProps) {
  const [agreed, setAgreed] = React.useState(false);

  const handleContinue = () => {
    if (agreed) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full bg-white dark:bg-gray-900 border-0 shadow-2xl rounded-xl">
        {/* Header */}
        <DialogHeader className="text-center space-y-4 pb-2">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Platform Guidelines
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Please review and accept our terms to continue
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-4 py-2">
          {/* Guidelines */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                Core Rules
              </h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>• Maintain healthy, respectful competition</li>
              <li>• Solve at least one problem daily</li>
              <li>• Submit only original work</li>
            </ul>
          </div>

          {/* AI Policy */}
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h3 className="font-semibold text-red-800 dark:text-red-200">
                Strict Policy
              </h3>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300">
              <strong>No AI tools allowed.</strong> Use of ChatGPT, Claude, or
              any AI assistant results in immediate account termination.
            </p>
          </div>
        </div>

        {/* Agreement */}
        <div className="py-3 border-t dark:border-gray-700">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              I understand and agree to all terms and policies listed above
            </span>
          </label>
        </div>

        {/* Footer */}
        <DialogFooter className="pt-2">
          <div className="flex gap-3 w-full justify-center">
            {/* Accept button */}
            <Button
              onClick={handleContinue}
              disabled={!agreed}
              className={`w-full font-medium transition-all ${
                agreed
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {agreed ? 'Accept & Continue' : 'Please Accept Terms'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
