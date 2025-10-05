import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-firebase-setup-notice',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-lg max-w-3xl w-full p-8">
        <div class="flex items-center justify-center mb-6">
          <svg class="w-16 h-16 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>

        <h1 class="text-3xl font-bold text-center mb-4">Firebase Configuration Required</h1>
        
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p class="text-yellow-800">
            <strong>Firebase is not configured.</strong> Please follow the setup instructions to enable authentication.
          </p>
        </div>

        <div class="space-y-4 text-gray-700">
          <h2 class="text-xl font-semibold">Quick Setup Steps:</h2>
          
          <ol class="list-decimal list-inside space-y-3 ml-4">
            <li>
              <strong>Create Firebase Project</strong>
              <p class="ml-6 text-sm text-gray-600">Go to <a href="https://console.firebase.google.com" target="_blank" class="text-orange-500 hover:underline">Firebase Console</a> and create a new project</p>
            </li>
            
            <li>
              <strong>Register Web App</strong>
              <p class="ml-6 text-sm text-gray-600">Click the web icon (&lt;/&gt;) and register your app</p>
            </li>
            
            <li>
              <strong>Enable Email Authentication</strong>
              <p class="ml-6 text-sm text-gray-600">Go to Authentication → Sign-in method → Enable Email/Password</p>
            </li>
            
            <li>
              <strong>Copy Firebase Config</strong>
              <p class="ml-6 text-sm text-gray-600">Copy your Firebase configuration object</p>
            </li>
            
            <li>
              <strong>Update environment.ts</strong>
              <p class="ml-6 text-sm text-gray-600">
                Update <code class="bg-gray-100 px-2 py-1 rounded">frontend/src/environments/environment.ts</code> with your Firebase config
              </p>
            </li>
            
            <li>
              <strong>Restart Dev Server</strong>
              <p class="ml-6 text-sm text-gray-600">Stop and restart <code class="bg-gray-100 px-2 py-1 rounded">npm start</code></p>
            </li>
          </ol>

          <div class="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 class="font-semibold mb-2">📖 Detailed Instructions</h3>
            <p class="text-sm">
              See <code class="bg-gray-100 px-2 py-1 rounded">FIREBASE_SETUP.md</code> in the project root for complete setup instructions.
            </p>
          </div>

          <div class="mt-6 p-4 bg-orange-50 rounded-md">
            <h3 class="font-semibold mb-2 text-orange-800">⚠️ Current Config Location</h3>
            <p class="text-sm text-orange-700">
              <code class="bg-white px-2 py-1 rounded border border-orange-200">
                frontend/src/environments/environment.ts
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FirebaseSetupNoticeComponent {}
