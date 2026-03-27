import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-gray-50 min-h-screen">
      <!-- Admin Top Nav -->
      <nav class="bg-gray-900 text-white py-4 px-6 flex justify-between items-center shadow-md">
        <div class="flex items-center space-x-2">
           <span class="text-primary text-2xl">🐶</span>
           <span class="font-bold text-xl tracking-tight">Adocão Admin</span>
        </div>
        <div class="flex gap-4 items-center">
           <span class="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">2 Alerts</span>
           <button class="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg font-bold hover:bg-gray-700 transition flex items-center gap-2">
             <span>⚙️</span> Settings
           </button>
        </div>
      </nav>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        
        <!-- Main Content -->
        <main class="flex-grow">
          
          <h1 class="text-2xl font-bold text-gray-900 mb-6">Platform Overview (Brazil)</h1>

          <!-- Platform KPIs -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
             <div class="bg-white p-6 rounded-2xl shadow-soft border-l-4 border-l-blue-500">
               <p class="text-sm font-medium text-gray-500 mb-1">Total Users</p>
               <h3 class="text-3xl font-extrabold text-gray-900">2,480</h3>
               <p class="text-xs text-green-500 mt-2">↑ 12% vs last month</p>
             </div>
             <div class="bg-white p-6 rounded-2xl shadow-soft border-l-4 border-l-purple-500">
               <p class="text-sm font-medium text-gray-500 mb-1">Partner Shelters</p>
               <h3 class="text-3xl font-extrabold text-gray-900">87</h3>
               <p class="text-xs text-green-500 mt-2">↑ 4 new this week</p>
             </div>
             <div class="bg-white p-6 rounded-2xl shadow-soft border-l-4 border-l-secondary">
               <p class="text-sm font-medium text-gray-500 mb-1">Total Adoptions</p>
               <h3 class="text-3xl font-extrabold text-gray-900">418</h3>
               <p class="text-xs text-green-500 mt-2">Platform lifetime</p>
             </div>
             <div class="bg-white p-6 rounded-2xl shadow-soft border-l-4 border-l-primary">
               <p class="text-sm font-medium text-gray-500 mb-1">Pets Listed</p>
               <h3 class="text-3xl font-extrabold text-gray-900">1,126</h3>
             </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
             <!-- Chart Area (Simulated) -->
             <div class="lg:col-span-2 bg-white rounded-2xl shadow-soft p-6">
                <div class="flex justify-between items-center mb-6">
                  <h2 class="text-lg font-bold text-gray-900">Adoption Funnel</h2>
                  <select class="text-sm border-gray-300 rounded-md">
                    <option>Last 30 days</option>
                  </select>
                </div>
                
                <div class="space-y-4">
                  <div>
                    <div class="flex justify-between text-sm mb-1"><span class="font-medium text-gray-700">Applications Started (100)</span> <span>100%</span></div>
                    <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-gray-400 h-2 rounded-full" style="width: 100%"></div></div>
                  </div>
                  <div>
                    <div class="flex justify-between text-sm mb-1"><span class="font-medium text-gray-700">Submitted (76)</span> <span>76%</span></div>
                    <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-blue-400 h-2 rounded-full" style="width: 76%"></div></div>
                  </div>
                  <div>
                    <div class="flex justify-between text-sm mb-1"><span class="font-medium text-gray-700">Screened (41)</span> <span>41%</span></div>
                    <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-purple-400 h-2 rounded-full" style="width: 41%"></div></div>
                  </div>
                  <div>
                    <div class="flex justify-between text-sm mb-1"><span class="font-medium text-gray-700">Interviewed (23)</span> <span>23%</span></div>
                    <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-yellow-400 h-2 rounded-full" style="width: 23%"></div></div>
                  </div>
                  <div>
                    <div class="flex justify-between text-sm mb-1"><span class="font-medium text-gray-700">Approved (15)</span> <span>15%</span></div>
                    <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-secondary h-2 rounded-full" style="width: 15%"></div></div>
                  </div>
                  <div>
                    <div class="flex justify-between text-sm mb-1"><span class="font-medium text-gray-700">Completed Adoptions (12)</span> <span class="text-primary font-bold">12%</span></div>
                    <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-primary h-2 rounded-full" style="width: 12%"></div></div>
                  </div>
                </div>
             </div>

             <!-- Moderation Alerts -->
             <div class="bg-white rounded-2xl shadow-soft p-6 border border-red-100">
                <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span class="text-red-500">⚠️</span> Moderation Alerts
                </h2>
                
                <div class="space-y-4">
                  <div class="p-3 bg-red-50 border border-red-100 rounded-lg">
                    <h4 class="text-sm font-bold text-red-800">Duplicate Pet Alert</h4>
                    <p class="text-xs text-red-600 my-1">A pet named "Belinha" (Dog, Small, Female) was registered by two different shelters in Blumenau.</p>
                    <button class="text-xs font-bold text-red-700 hover:underline">Review Profiles</button>
                  </div>
                  
                  <div class="p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                    <h4 class="text-sm font-bold text-yellow-800">Suspicious Application</h4>
                    <p class="text-xs text-yellow-700 my-1">User generated 5 adoption applications in the last 10 minutes across different states.</p>
                    <button class="text-xs font-bold text-yellow-900 hover:underline">Review User</button>
                  </div>
                </div>
             </div>

          </div>
        </main>
      </div>
    </div>
  `
})
export class AdminDashboardComponent {}
