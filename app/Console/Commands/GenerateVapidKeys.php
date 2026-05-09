<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;

class GenerateVapidKeys extends Command {
    protected $signature   = 'vapid:generate';
    protected $description = 'Genera un par de claves VAPID para push notifications';

    public function handle(): int {
        if (!class_exists(\Minishlink\WebPush\VAPID::class)) {
            $this->error('minishlink/web-push no instalado. Ejecuta: composer require minishlink/web-push');
            return Command::FAILURE;
        }

        $keys = \Minishlink\WebPush\VAPID::createVapidKeys();

        $this->info('VAPID Keys generadas:');
        $this->line('');
        $this->line("VAPID_PUBLIC_KEY={$keys['publicKey']}");
        $this->line("VAPID_PRIVATE_KEY={$keys['privateKey']}");
        $this->line('');
        $this->warn('Agrega estas líneas a tu .env y actualiza la BWA en tu frontend.');

        return Command::SUCCESS;
    }
}
