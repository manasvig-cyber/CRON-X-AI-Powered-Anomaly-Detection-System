import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import os

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.sender_email = os.getenv("SENDER_EMAIL", "")
        self.sender_password = os.getenv("SENDER_PASSWORD", "")
        self.enabled = os.getenv("EMAIL_ALERTS_ENABLED", "false").lower() == "true"
    
    def send_alert_email(self, recipient: str, alert_data: dict):
        """Send email alert for high-severity incidents"""
        if not self.enabled or not self.sender_email:
            print(f"Email alerts disabled or not configured. Would send to: {recipient}")
            return False
        
        try:
            message = MIMEMultipart("alternative")
            message["Subject"] = f"🚨 CRON-X Alert: {alert_data.get('severity', 'N/A').upper()} - {alert_data.get('alert_id')}"
            message["From"] = self.sender_email
            message["To"] = recipient
            
            html = f"""
            <html>
                <body style="font-family: Arial, sans-serif; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                        <h2 style="color: #d9534f;">Security Alert Detected</h2>
                        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Alert ID:</strong> {alert_data.get('alert_id')}</p>
                            <p><strong>Severity:</strong> <span style="color: #d9534f; font-weight: bold;">{alert_data.get('severity', 'N/A').upper()}</span></p>
                            <p><strong>Anomaly Score:</strong> {alert_data.get('anomaly_score', 0) * 100:.0f}%</p>
                            <p><strong>User:</strong> {alert_data.get('user_id')}</p>
                            <p><strong>IP Address:</strong> {alert_data.get('ip')}</p>
                            <p><strong>Description:</strong> {alert_data.get('short_text', 'Anomaly detected')}</p>
                            <p><strong>Suggested Action:</strong> {alert_data.get('suggested_action', 'review')}</p>
                        </div>
                        <p style="color: #666; font-size: 12px;">
                            This is an automated alert from CRON-X SOC Dashboard. 
                            Please review the incident in the dashboard immediately.
                        </p>
                    </div>
                </body>
            </html>
            """
            
            part = MIMEText(html, "html")
            message.attach(part)
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.sendmail(self.sender_email, recipient, message.as_string())
            
            print(f"Alert email sent to {recipient}")
            return True
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False

email_service = EmailService()
