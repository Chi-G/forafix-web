<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class FixMissingUuids extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::whereNull('uuid')
            ->orWhere('uuid', '')
            ->get();

        $count = $users->count();
        
        foreach ($users as $user) {
            $user->uuid = (string) Str::uuid();
            $user->save();
        }

        $this->command->info("Fixed {$count} users with missing UUIDs.");
    }
}
