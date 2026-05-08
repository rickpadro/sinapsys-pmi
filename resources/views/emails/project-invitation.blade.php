<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Inter, -apple-system, sans-serif; background: #F6F7FB; color: #323338; padding: 32px 16px; }
        .card { background: #ffffff; border-radius: 12px; padding: 36px; max-width: 480px; margin: 0 auto; border: 1px solid #E6E9EF; }
        .logo { font-size: 13px; font-weight: 700; color: #4A6CF7; letter-spacing: .5px; margin-bottom: 28px; }
        h2 { font-size: 20px; font-weight: 700; color: #1A1B2E; margin-bottom: 16px; }
        p { font-size: 14px; color: #676879; line-height: 1.6; margin-bottom: 12px; }
        .project-row { display: flex; align-items: center; gap: 10px; background: #F6F7FB; border-radius: 8px; padding: 12px 16px; margin: 20px 0; }
        .project-name { font-weight: 600; color: #323338; font-size: 15px; }
        .role-badge { background: #FDAB3D20; color: #FDAB3D; font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 20px; }
        .btn { display: inline-block; background: #4A6CF7; color: #ffffff !important; padding: 13px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 8px 0 20px; }
        .divider { border: none; border-top: 1px solid #E6E9EF; margin: 20px 0; }
        .link-copy { font-size: 12px; color: #9B9DB0; word-break: break-all; }
        .link-copy a { color: #4A6CF7; }
        .footer { text-align: center; font-size: 12px; color: #9B9DB0; margin-top: 28px; }
    </style>
</head>
<body>
    <div class="card">
        <div class="logo">SinapSYS Projects</div>

        <h2>Tienes una nueva invitación</h2>

        <p><strong style="color:#323338">{{ $inviterName }}</strong> te invitó a colaborar en su proyecto:</p>

        <div class="project-row">
            <div style="flex:1">
                <div class="project-name">{{ $projectName }}</div>
            </div>
            <span class="role-badge">{{ $roleName }}</span>
        </div>

        <p>Haz click en el botón para aceptar la invitación e ingresar a SinapSYS Projects.</p>
        <p style="font-size:12px;color:#9B9DB0">Si no tienes cuenta aún, podrás iniciar sesión con tu correo registrado.</p>

        <a href="{{ $acceptUrl }}" class="btn">Aceptar invitación</a>

        <hr class="divider">

        <p class="link-copy">
            O copia este enlace en tu navegador:<br>
            <a href="{{ $acceptUrl }}">{{ $acceptUrl }}</a>
        </p>
    </div>

    <div class="footer">
        SinapSYS Projects &middot; Este enlace es de un solo uso y expira al ser aceptado.
    </div>
</body>
</html>
