import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend | null = null;
  private readonly fromEmail: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('✔ Resend inicializado correctamente para el envío de correos');
    } else {
      this.logger.warn(
        '⚠ RESEND_API_KEY no está configurada en las variables de entorno. ' +
          'Los códigos de confirmación se imprimirán en la consola del servidor (modo desarrollo).',
      );
    }

    this.fromEmail = process.env.MAIL_FROM?.trim() || 'MOUTII <onboarding@resend.dev>';
  }

  async sendVerificationCode(email: string, code: string, name: string): Promise<boolean> {
    const recipient = email.toLowerCase().trim();

    // En desarrollo o sin API key, simulamos y mostramos en consola para no bloquear pruebas
    if (!this.resend) {
      this.logger.log(`\n==================================================`);
      this.logger.log(`📧 [SIMULADOR DE CORREO MOUTII]`);
      this.logger.log(`Para: ${name} <${recipient}>`);
      this.logger.log(`Código de verificación: [ ${code} ]`);
      this.logger.log(`Expira en: 15 minutos`);
      this.logger.log(`==================================================\n`);
      return true;
    }

    try {
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifica tu cuenta en MOUTII</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F5; margin: 0; padding: 40px 15px; color: #161413;">
  <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #E5D9C8; padding: 42px 36px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); text-align: center;">
    
    <!-- Header Brand -->
    <div style="margin-bottom: 28px;">
      <h1 style="font-size: 26px; letter-spacing: 0.18em; font-weight: 700; margin: 0; color: #161413;">MOUTII</h1>
      <p style="font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: #A97B6D; margin: 5px 0 0; font-weight: 600;">By Daniela Mejía</p>
    </div>

    <div style="height: 1px; background-color: #E5D9C8; margin: 0 0 28px;"></div>

    <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 12px; color: #161413;">Confirma tu correo electrónico</h2>
    
    <p style="font-size: 14px; line-height: 1.6; color: #4A3528; margin: 0 0 24px;">
      Hola <strong>${name}</strong>,<br>
      Gracias por registrarte en nuestra boutique. Para validar que tu correo es verídico y proteger tu cuenta, ingresa el siguiente código de confirmación:
    </p>

    <!-- Code Display Box -->
    <div style="background-color: #F8F5F0; border: 1.5px dashed #A97B6D; border-radius: 8px; padding: 20px; margin: 0 auto 24px; max-width: 320px;">
      <span style="font-size: 34px; font-weight: 700; letter-spacing: 0.28em; color: #161413; font-family: 'Courier New', Courier, monospace; display: inline-block; padding-left: 0.28em;">${code}</span>
    </div>

    <p style="font-size: 13px; color: #8C7A6B; line-height: 1.5; margin: 0 0 28px;">
      ⏱ Este código es válido durante los próximos <strong>15 minutos</strong>.<br>
      Si no solicitaste crear esta cuenta, puedes desestimar este mensaje.
    </p>

    <div style="height: 1px; background-color: #E5D9C8; margin: 0 0 20px;"></div>

    <p style="font-size: 11px; color: #A97B6D; margin: 0; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500;">
      MOUTII — Boutique de Alta Costura & Diseño Atemporal
    </p>
  </div>
</body>
</html>
      `;

      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to: recipient,
        subject: `${code} es tu código de confirmación de MOUTII`,
        html: htmlContent,
      });

      if (response.error) {
        this.logger.error(`Error de Resend al enviar correo a ${recipient}: ${response.error.message}`);
        return false;
      }

      this.logger.log(`✔ Correo con código de verificación enviado exitosamente a ${recipient} (ID: ${response.data?.id})`);
      return true;
    } catch (err: any) {
      this.logger.error(`Excepción al enviar correo a ${recipient}: ${err.message}`);
      return false;
    }
  }
}

