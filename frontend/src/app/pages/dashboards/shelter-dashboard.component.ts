import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shelter-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-gray-50 min-h-screen">
      <!-- Top nav specific to shelter -->
      <nav class="bg-primary text-white py-4 px-6 flex justify-between items-center shadow-md">
        <div class="flex flex-col">
           <span class="font-bold text-xl">Instituto Patas do Vale</span>
           <span class="text-xs opacity-80">Shelter Dashboard • Blumenau, SC</span>
        </div>
        <div class="flex gap-4">
           <button class="bg-white text-primary px-4 py-2 rounded-lg font-bold hover:bg-orange-50 transition">+ Add Pet</button>
        </div>
      </nav>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        
        <!-- Sidebar Navigation -->
        <aside class="w-64 hidden md:block">
           <div class="bg-white rounded-2xl shadow-soft p-4 flex flex-col gap-2">
             <a href="#" class="p-3 bg-orange-50 text-primary font-bold rounded-xl flex items-center gap-3">
               <span>📊</span> Dashboard
             </a>
             <a href="#" class="p-3 text-gray-600 hover:bg-gray-50 rounded-xl flex items-center gap-3 font-medium">
               <span>🐾</span> Manage Pets
             </a>
             <a href="#" class="p-3 text-gray-600 hover:bg-gray-50 rounded-xl flex items-center gap-3 font-medium">
               <span>📄</span> Applications <span class="ml-auto bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">11</span>
             </a>
             <a href="#" class="p-3 text-gray-600 hover:bg-gray-50 rounded-xl flex items-center gap-3 font-medium">
               <span>📈</span> Reports
             </a>
           </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-grow">
          
          <!-- Top Metrics -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
             <div class="bg-white p-6 rounded-2xl shadow-soft">
               <p class="text-sm font-medium text-gray-500 mb-1">Total Pets Listed</p>
               <h3 class="text-3xl font-extrabold text-gray-900">43</h3>
             </div>
             <div class="bg-white p-6 rounded-2xl shadow-soft">
               <p class="text-sm font-medium text-gray-500 mb-1">Available</p>
               <h3 class="text-3xl font-extrabold text-secondary">18</h3>
             </div>
             <div class="bg-white p-6 rounded-2xl shadow-soft border border-orange-100 relative overflow-hidden">
               <div class="absolute right-0 top-0 w-2 h-full bg-primary"></div>
               <p class="text-sm font-medium text-gray-500 mb-1">Pending Apps</p>
               <h3 class="text-3xl font-extrabold text-gray-900">11</h3>
             </div>
             <div class="bg-white p-6 rounded-2xl shadow-soft">
               <p class="text-sm font-medium text-gray-500 mb-1">Adoptions (Month)</p>
               <h3 class="text-3xl font-extrabold text-blue-600">7</h3>
             </div>
          </div>

          <!-- Applications Kanban/Board view -->
          <h2 class="text-xl font-bold text-gray-900 mb-4">Urgent Applications Review</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            <!-- Column 1 -->
            <div class="bg-gray-100 p-4 rounded-xl">
               <div class="flex justify-between items-center mb-4">
                 <h3 class="font-bold text-gray-700 uppercase tracking-wide text-xs">New (4)</h3>
               </div>
               
               <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-3 cursor-pointer hover:shadow-md transition">
                 <div class="flex justify-between items-start mb-2">
                   <h4 class="font-bold text-gray-900 text-sm">Mariana Costa</h4>
                   <span class="badge badge-success text-xs">98% Match</span>
                 </div>
                 <p class="text-xs text-gray-500 mb-3">Applying for <span class="font-bold text-primary">Luna</span></p>
                 <div class="text-xs text-gray-400 flex items-center gap-1">
                   <span>🏠</span> Apartment • <span>🧑</span> No Kids
                 </div>
               </div>

               <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition">
                 <div class="flex justify-between items-start mb-2">
                   <h4 class="font-bold text-gray-900 text-sm">Felipe Rocha</h4>
                   <span class="badge badge-warning text-xs">75% Match</span>
                 </div>
                 <p class="text-xs text-gray-500 mb-3">Applying for <span class="font-bold text-primary">Thor</span></p>
                 <div class="text-xs text-red-500 flex items-center gap-1 font-medium bg-red-50 p-1 rounded">
                   <span>⚠️</span> House w/o Fence?
                 </div>
               </div>
            </div>

            <!-- Column 2 -->
            <div class="bg-gray-100 p-4 rounded-xl">
               <div class="flex justify-between items-center mb-4">
                 <h3 class="font-bold text-gray-700 uppercase tracking-wide text-xs">Interviewing (3)</h3>
               </div>
               
               <div class="bg-white p-4 rounded-lg shadow-sm border border-l-4 border-l-blue-400 cursor-pointer hover:shadow-md transition">
                 <div class="flex justify-between items-start mb-2">
                   <h4 class="font-bold text-gray-900 text-sm">Jefferson M.</h4>
                   <span class="text-xs text-gray-400">Today, 14:00</span>
                 </div>
                 <p class="text-xs text-gray-500 mb-3">Applying for <span class="font-bold text-primary">Mia</span></p>
                 <button class="w-full text-xs font-bold text-blue-600 bg-blue-50 py-2 rounded">Join Video Call</button>
               </div>
            </div>

            <!-- Column 3 -->
            <div class="bg-gray-100 p-4 rounded-xl border border-green-200 bg-green-50">
               <div class="flex justify-between items-center mb-4">
                 <h3 class="font-bold text-green-800 uppercase tracking-wide text-xs">Approved (3)</h3>
               </div>
               
               <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition opacity-80">
                 <div class="flex justify-between items-start mb-2">
                   <h4 class="font-bold font-strike text-gray-900 text-sm">Luísa Almeida</h4>
                 </div>
                 <p class="text-xs text-gray-500 mb-3">Adopting <span class="font-bold text-secondary">Bento</span></p>
                 <span class="text-xs font-bold text-green-600 flex items-center gap-1">
                   <span>🎉</span> Contract Signed
                 </span>
               </div>
            </div>

          </div>

          <!-- Quick Actions / Alerts -->
          <h2 class="text-xl font-bold text-gray-900 mb-4">Platform Alerts</h2>
          <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex items-start gap-4">
             <span class="text-2xl mt-1">⚠️</span>
             <div>
               <h4 class="font-bold text-yellow-800">Incomplete Profiles Detected</h4>
               <p class="text-sm text-yellow-700 mt-1">2 of your pets are missing vaccination records. They will not be visible to adopters until fixed.</p>
               <button class="mt-2 text-sm font-bold text-yellow-900 hover:underline">Review profiles</button>
             </div>
          </div>

        </main>
      </div>
    </div>
  `
})
export class ShelterDashboardComponent implements OnInit {
  ngOnInit() {}
}
