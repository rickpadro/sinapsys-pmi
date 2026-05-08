<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Código de verificación</title>
<style>
  body { margin: 0; padding: 0; background-color: #F6F7FB; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .wrapper { max-width: 480px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
  .header { background: #1E1F2B; padding: 32px 40px; text-align: center; }
  .header img { height: 48px; }
  .body { padding: 40px; }
  .greeting { font-size: 16px; color: #323338; margin-bottom: 8px; }
  .subtitle { font-size: 14px; color: #676879; margin-bottom: 32px; line-height: 1.6; }
  .code-box { background: #F6F7FB; border: 2px solid #E6E9EF; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px; }
  .code { font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #4A6CF7; font-family: 'Courier New', monospace; }
  .expiry { font-size: 12px; color: #676879; margin-top: 8px; }
  .warning { font-size: 13px; color: #676879; background: #FFF8EC; border-left: 3px solid #FDAB3D; padding: 12px 16px; border-radius: 6px; margin-bottom: 24px; }
  .footer { text-align: center; padding: 24px 40px; background: #F6F7FB; font-size: 12px; color: #9B9DB0; border-top: 1px solid #E6E9EF; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <img src="{{ asset('logo_sinapsys.png') }}" alt="SinapSYS" onerror="this.style.display='none'">
  </div>
  <div class="body">
    <p class="greeting">Hola, {{ $user->name }}</p>
    <p class="subtitle">
      Alguien (esperamos que tú) está intentando iniciar sesión en SinapSYS.<br>
      Usa el siguiente código para verificar tu identidad:
    </p>

    <div class="code-box">
      <div class="code">{{ $code }}</div>
      <div class="expiry">Válido por 10 minutos</div>
    </div>

    <div class="warning">
      🔒 Si no fuiste tú, ignora este correo. Nadie de SinapSYS te pedirá este código por teléfono o chat.
    </div>
  </div>
  <div class="footer">
    SinapSYS Ecosistemas &copy; {{ date('Y') }} &mdash; Este es un correo automático, no respondas.
  </div>
</div>
</body>
</html>
