import smtplib
from email.message import EmailMessage

from app.core.config import get_settings

settings = get_settings()


def send_password_reset_email(*, to_email: str, recipient_name: str, reset_url: str) -> None:
    if not settings.smtp_enabled:
        raise RuntimeError("SMTP is not configured for password reset delivery.")

    message = EmailMessage()
    from_name = settings.smtp_from_name.strip() or "Worldbridgers Regenify"
    from_email = settings.smtp_from_email or ""
    message["Subject"] = "Reset your Worldbridgers Regenify password"
    message["From"] = f"{from_name} <{from_email}>"
    message["To"] = to_email

    safe_name = recipient_name.strip() or "there"
    text_body = (
        f"Hello {safe_name},\n\n"
        "We received a request to reset your Worldbridgers Regenify password.\n\n"
        f"Reset your password: {reset_url}\n\n"
        f"This link expires in {settings.password_reset_token_hours} hour(s). "
        "If you did not request this reset, you can ignore this email.\n"
    )
    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
        <p>Hello {safe_name},</p>
        <p>We received a request to reset your Worldbridgers Regenify password.</p>
        <p>
          <a href="{reset_url}" style="display:inline-block;padding:12px 18px;background:#0f9d58;color:#ffffff;text-decoration:none;border-radius:8px;">
            Reset your password
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p><a href="{reset_url}">{reset_url}</a></p>
        <p>This link expires in {settings.password_reset_token_hours} hour(s).</p>
        <p>If you did not request this reset, you can ignore this email.</p>
      </body>
    </html>
    """

    message.set_content(text_body)
    message.add_alternative(html_body, subtype="html")

    smtp_cls = smtplib.SMTP_SSL if settings.smtp_use_ssl else smtplib.SMTP
    with smtp_cls(settings.smtp_host, settings.smtp_port, timeout=20) as smtp:
        if not settings.smtp_use_ssl and settings.smtp_starttls:
            smtp.starttls()
        if settings.smtp_username:
            smtp.login(settings.smtp_username, settings.smtp_password or "")
        smtp.send_message(message)
