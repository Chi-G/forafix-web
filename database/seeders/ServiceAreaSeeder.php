<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiceAreaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $areas = [
            // Phase 1
            ['name' => 'Maitama', 'district' => 'Municipal Area Council', 'center_lat' => 9.0833, 'center_lng' => 7.5000],
            ['name' => 'Asokoro', 'district' => 'Municipal Area Council', 'center_lat' => 9.0500, 'center_lng' => 7.5333],
            ['name' => 'Wuse 1', 'district' => 'Municipal Area Council', 'center_lat' => 9.0667, 'center_lng' => 7.4833],
            ['name' => 'Wuse 2', 'district' => 'Municipal Area Council', 'center_lat' => 9.0765, 'center_lng' => 7.4667],
            ['name' => 'Garki 1', 'district' => 'Municipal Area Council', 'center_lat' => 9.0333, 'center_lng' => 7.4833],
            ['name' => 'Garki 2', 'district' => 'Municipal Area Council', 'center_lat' => 9.0433, 'center_lng' => 7.4933],
            ['name' => 'Guzape', 'district' => 'Municipal Area Council', 'center_lat' => 9.0167, 'center_lng' => 7.5167],
            ['name' => 'Central Business District', 'district' => 'Municipal Area Council', 'center_lat' => 9.0583, 'center_lng' => 7.4894],

            // Phase 2
            ['name' => 'Jabi', 'district' => 'Municipal Area Council', 'center_lat' => 9.0667, 'center_lng' => 7.4167],
            ['name' => 'Utako', 'district' => 'Municipal Area Council', 'center_lat' => 9.0667, 'center_lng' => 7.4333],
            ['name' => 'Gwarinpa', 'district' => 'Municipal Area Council', 'center_lat' => 9.1167, 'center_lng' => 7.4083],
            ['name' => 'Mabushi', 'district' => 'Municipal Area Council', 'center_lat' => 9.0900, 'center_lng' => 7.4400],
            ['name' => 'Durumi', 'district' => 'Municipal Area Council', 'center_lat' => 9.0200, 'center_lng' => 7.4500],
            ['name' => 'Katampe', 'district' => 'Municipal Area Council', 'center_lat' => 9.1167, 'center_lng' => 7.4833],
            ['name' => 'Wuye', 'district' => 'Municipal Area Council', 'center_lat' => 9.0500, 'center_lng' => 7.4500],
            ['name' => 'Gaduwa', 'district' => 'Municipal Area Council', 'center_lat' => 9.0067, 'center_lng' => 7.4725],

            // Phase 3 & Suburbs
            ['name' => 'Lugbe', 'district' => 'Municipal Area Council', 'center_lat' => 8.9500, 'center_lng' => 7.3667],
            ['name' => 'Kubwa', 'district' => 'Bwari Area Council', 'center_lat' => 9.1500, 'center_lng' => 7.3167],
            ['name' => 'Kagini', 'district' => 'Municipal Area Council', 'center_lat' => 9.2080, 'center_lng' => 7.3510],
            ['name' => 'Galadimawa', 'district' => 'Municipal Area Council', 'center_lat' => 8.9833, 'center_lng' => 7.4167],
            ['name' => 'Lokogoma', 'district' => 'Municipal Area Council', 'center_lat' => 8.9667, 'center_lng' => 7.4500],
            ['name' => 'Apo', 'district' => 'Municipal Area Council', 'center_lat' => 8.9833, 'center_lng' => 7.4833],
            ['name' => 'Karu', 'district' => 'Municipal Area Council', 'center_lat' => 9.0167, 'center_lng' => 7.5500],
            ['name' => 'Nyanya', 'district' => 'Municipal Area Council', 'center_lat' => 9.0500, 'center_lng' => 7.5833],
            ['name' => 'Mpape', 'district' => 'Bwari Area Council', 'center_lat' => 9.1167, 'center_lng' => 7.5000],
            ['name' => 'Life Camp', 'district' => 'Municipal Area Council', 'center_lat' => 9.0667, 'center_lng' => 7.3833],
            ['name' => 'Karmo', 'district' => 'Municipal Area Council', 'center_lat' => 9.0667, 'center_lng' => 7.3667],
            ['name' => 'Idu', 'district' => 'Municipal Area Council', 'center_lat' => 9.0500, 'center_lng' => 7.3333],
            ['name' => 'Gwagwa', 'district' => 'Municipal Area Council', 'center_lat' => 9.1200, 'center_lng' => 7.2800],
            ['name' => 'Dei-Dei', 'district' => 'Municipal Area Council', 'center_lat' => 9.1167, 'center_lng' => 7.2833],
            ['name' => 'Kuje', 'district' => 'Kuje Area Council', 'center_lat' => 8.8786, 'center_lng' => 7.2275],
            ['name' => 'Gwagwalada', 'district' => 'Gwagwalada Area Council', 'center_lat' => 8.9508, 'center_lng' => 7.0767],
        ];

        foreach ($areas as $area) {
            DB::table('service_areas')->updateOrInsert(
                ['name' => $area['name']],
                array_merge($area, [
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now()
                ])
            );
        }
    }
}
