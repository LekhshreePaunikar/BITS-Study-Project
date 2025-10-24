import * as React from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
import { Checkbox } from './components/ui/checkbox';
// Assuming Toaster (for notifications) is available
import { Toaster } from './components/ui/sonner'; 

export default function App() {
  return (
    <div className="dark">
      {/* Set a dark background for contrast, matching common Tailwind theme setup */}
      <div className="min-h-screen p-8" style={{ backgroundColor: '#111827' }}>
        <h1 className="text-3xl font-bold text-white mb-8 border-b border-gray-700 pb-4">
          Base UI Components Showcase
        </h1>

        {/* --- 1. BUTTONS --- */}
        <div className="mb-12 p-6 border border-gray-700 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-300 mb-4">Button Component</h2>
          <div className="flex gap-4 items-center flex-wrap">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button size="icon" disabled>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
            </Button>
          </div>
        </div>

        {/* --- 2. INPUT & LABEL --- */}
        <div className="mb-12 p-6 border border-gray-700 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-300 mb-4">Input & Label Components</h2>
          <div className="space-y-4 max-w-lg">
            {/* Standard Input */}
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="username-input">Username</Label>
              <Input type="text" id="username-input" placeholder="Enter your username" />
            </div>
            {/* Input with Error State (aria-invalid) */}
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="error-input">Password (Invalid State)</Label>
              <Input type="password" id="error-input" aria-invalid="true" placeholder="Password must be 8 characters" />
            </div>
            {/* Disabled Input */}
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="disabled-input">Disabled Input</Label>
              <Input type="text" id="disabled-input" placeholder="Cannot type here" disabled />
            </div>
          </div>
        </div>

        {/* --- 3. RADIO GROUP & CHECKBOX --- */}
        <div className="mb-12 p-6 border border-gray-700 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-300 mb-4">Radio Group & Checkbox</h2>
          <div className="flex gap-12">
            {/* Radio Group Test */}
            <RadioGroup defaultValue="option-2" className="grid gap-2">
              <p className="text-sm text-gray-400">Select an option:</p>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-1" id="r1" />
                <Label htmlFor="r1">Option 1</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-2" id="r2" />
                <Label htmlFor="r2">Option 2 (Selected)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option-3" id="r3" disabled />
                <Label htmlFor="r3">Option 3 (Disabled)</Label>
              </div>
            </RadioGroup>

            {/* Checkbox Test */}
            <div className="space-y-4">
              <p className="text-sm text-gray-400">Check:</p>
              <div className="flex items-center space-x-2">
                <Checkbox id="terms-check" />
                <Label htmlFor="terms-check">I agree to the terms</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="disabled-check" disabled />
                <Label htmlFor="disabled-check">Cannot check this</Label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}