package com.resume.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtp(String to, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("🔐 Your OTP for Resume Builder");
            helper.setFrom("rockrangerz801@gmail.com");
            helper.setText(buildOtpEmailContent(otp, to), true);

            log.info("Sending OTP to: {}", to);
            mailSender.send(message);
            log.info("OTP sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send OTP to: {}", to, e);
            throw new RuntimeException("Failed to send OTP email", e);
        } catch (Exception e) {
            log.error("Failed to send OTP to: {}", to, e);
            throw e;
        }
    }

    private String buildOtpEmailContent(String otp, String email) {
        return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OTP Verification</title>
            <style>
                body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    background-color: #f3f4f6;
                    margin: 0;
                    padding: 0;
                    -webkit-font-smoothing: antialiased;
                }
                .container {
                    max-width: 560px;
                    margin: 40px auto;
                    background-color: #ffffff;
                    border-radius: 16px;
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
                    overflow: hidden;
                }
                .header {
                    background: linear-gradient(135deg, #2563eb, #3b82f6);
                    padding: 32px 40px;
                    text-align: center;
                }
                .header h1 {
                    color: #ffffff;
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0;
                    letter-spacing: -0.5px;
                }
                .header p {
                    color: rgba(255, 255, 255, 0.85);
                    font-size: 14px;
                    margin: 8px 0 0 0;
                    font-weight: 400;
                }
                .content {
                    padding: 40px 40px 32px;
                }
                .greeting {
                    font-size: 16px;
                    font-weight: 500;
                    color: #111827;
                    margin: 0 0 8px 0;
                }
                .sub-greeting {
                    font-size: 14px;
                    color: #6b7280;
                    margin: 0 0 24px 0;
                    line-height: 1.6;
                }
                .otp-box {
                    background-color: #f8fafc;
                    border: 2px dashed #e2e8f0;
                    border-radius: 12px;
                    padding: 24px;
                    text-align: center;
                    margin: 24px 0;
                    position: relative;
                }
                .otp-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 8px;
                    display: block;
                }
                .otp-code {
                    font-size: 48px;
                    font-weight: 700;
                    color: #2563eb;
                    letter-spacing: 12px;
                    font-family: 'Courier New', monospace;
                    background: #ffffff;
                    padding: 12px 16px;
                    border-radius: 8px;
                    display: inline-block;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
                }
                .otp-expiry {
                    font-size: 13px;
                    color: #6b7280;
                    margin: 12px 0 0 0;
                }
                .otp-expiry strong {
                    color: #111827;
                    font-weight: 600;
                }
                .divider {
                    border: none;
                    border-top: 1px solid #e5e7eb;
                    margin: 28px 0;
                }
                .tips {
                    background-color: #f0fdf4;
                    border-left: 4px solid #22c55e;
                    padding: 16px 20px;
                    border-radius: 8px;
                    margin: 24px 0;
                }
                .tips h4 {
                    color: #166534;
                    font-size: 13px;
                    font-weight: 600;
                    margin: 0 0 4px 0;
                }
                .tips p {
                    color: #166534;
                    font-size: 13px;
                    margin: 0;
                    line-height: 1.5;
                }
                .footer {
                    padding: 24px 40px 32px;
                    background-color: #f9fafb;
                    border-top: 1px solid #e5e7eb;
                    text-align: center;
                }
                .footer p {
                    font-size: 13px;
                    color: #6b7280;
                    margin: 0 0 4px 0;
                    line-height: 1.6;
                }
                .footer .brand {
                    color: #2563eb;
                    font-weight: 600;
                    text-decoration: none;
                }
                .footer .small {
                    font-size: 12px;
                    color: #9ca3af;
                }
                .footer .small a {
                    color: #2563eb;
                    text-decoration: none;
                }
                .footer .small a:hover {
                    text-decoration: underline;
                }
                .logo-icon {
                    display: inline-block;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    padding: 4px 12px;
                    color: white;
                    font-size: 20px;
                    font-weight: 700;
                    margin-bottom: 4px;
                }
                @media (max-width: 600px) {
                    .container {
                        margin: 16px;
                        border-radius: 12px;
                    }
                    .header {
                        padding: 24px 20px;
                    }
                    .content {
                        padding: 28px 20px 24px;
                    }
                    .otp-code {
                        font-size: 36px;
                        letter-spacing: 8px;
                        padding: 10px 12px;
                    }
                    .footer {
                        padding: 20px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Header -->
                <div class="header">
                    <div class="logo-icon">📄</div>
                    <h1>Resume Builder</h1>
                    <p>AI-Powered Professional Resumes</p>
                </div>

                <!-- Content -->
                <div class="content">
                    <p class="greeting">Hello 👋</p>
                    <p class="sub-greeting">
                        You've requested to sign in to <strong>Resume Builder</strong>.
                        Use the verification code below to complete your login.
                    </p>

                    <!-- OTP Box -->
                    <div class="otp-box">
                        <span class="otp-label">Your Verification Code</span>
                        <div class="otp-code">%s</div>
                        <p class="otp-expiry">
                            🔒 This OTP is valid for <strong>5 minutes</strong>
                        </p>
                    </div>

                    <hr class="divider">

                    <!-- Tips -->
                    <div class="tips">
                        <h4>💡 Security Tips</h4>
                        <p>
                            • Never share this code with anyone<br>
                            • If you didn't request this, please ignore this email<br>
                            • Our team will never ask for this code
                        </p>
                    </div>

                    <hr class="divider">

                    <p style="font-size: 14px; color: #6b7280; margin: 0; text-align: center;">
                        This email was sent to <strong style="color: #111827;">%s</strong>
                    </p>
                </div>

                <!-- Footer -->
                <div class="footer">
                    <p>
                        © 2026 <a href="#" class="brand">Resume Builder</a>
                        — Build your dream resume with AI
                    </p>
                    <p class="small">
                        Need help? <a href="#">Contact Support</a> &nbsp;·&nbsp;
                        <a href="#">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """.formatted(otp, email);
    }

    /**
     * Send welcome email after successful registration
     */
    public void sendWelcomeEmail(String to, String name) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("🎉 Welcome to Resume Builder!");
            helper.setFrom("rockrangerz801@gmail.com");
            helper.setText(buildWelcomeEmailContent(name, to), true);

            log.info("Sending welcome email to: {}", to);
            mailSender.send(message);
            log.info("Welcome email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send welcome email to: {}", to, e);
            throw new RuntimeException("Failed to send welcome email", e);
        }
    }

    private String buildWelcomeEmailContent(String name, String email) {
        return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Resume Builder</title>
            <style>
                body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    background-color: #f3f4f6;
                    margin: 0;
                    padding: 0;
                    -webkit-font-smoothing: antialiased;
                }
                .container {
                    max-width: 560px;
                    margin: 40px auto;
                    background-color: #ffffff;
                    border-radius: 16px;
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
                    overflow: hidden;
                }
                .header {
                    background: linear-gradient(135deg, #2563eb, #3b82f6);
                    padding: 32px 40px;
                    text-align: center;
                }
                .header h1 {
                    color: #ffffff;
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0;
                }
                .header p {
                    color: rgba(255, 255, 255, 0.85);
                    font-size: 14px;
                    margin: 8px 0 0 0;
                }
                .content {
                    padding: 40px 40px 32px;
                }
                .greeting {
                    font-size: 16px;
                    font-weight: 500;
                    color: #111827;
                    margin: 0 0 16px 0;
                }
                .welcome-text {
                    font-size: 14px;
                    color: #6b7280;
                    line-height: 1.8;
                    margin: 0 0 24px 0;
                }
                .features {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin: 24px 0;
                }
                .feature-card {
                    background-color: #f8fafc;
                    border-radius: 8px;
                    padding: 16px;
                    text-align: center;
                    border: 1px solid #e5e7eb;
                }
                .feature-card .icon {
                    font-size: 24px;
                    margin-bottom: 4px;
                }
                .feature-card .label {
                    font-size: 12px;
                    font-weight: 500;
                    color: #111827;
                }
                .cta-button {
                    display: inline-block;
                    background: linear-gradient(135deg, #2563eb, #3b82f6);
                    color: #ffffff !important;
                    font-weight: 600;
                    font-size: 16px;
                    padding: 14px 40px;
                    border-radius: 8px;
                    text-decoration: none;
                    margin: 8px 0 0 0;
                    transition: all 0.2s;
                }
                .cta-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
                }
                .divider {
                    border: none;
                    border-top: 1px solid #e5e7eb;
                    margin: 28px 0;
                }
                .footer {
                    padding: 24px 40px 32px;
                    background-color: #f9fafb;
                    border-top: 1px solid #e5e7eb;
                    text-align: center;
                }
                .footer p {
                    font-size: 13px;
                    color: #6b7280;
                    margin: 0 0 4px 0;
                }
                .footer .brand {
                    color: #2563eb;
                    font-weight: 600;
                    text-decoration: none;
                }
                .footer .small {
                    font-size: 12px;
                    color: #9ca3af;
                }
                .footer .small a {
                    color: #2563eb;
                    text-decoration: none;
                }
                @media (max-width: 600px) {
                    .container {
                        margin: 16px;
                        border-radius: 12px;
                    }
                    .header {
                        padding: 24px 20px;
                    }
                    .content {
                        padding: 28px 20px 24px;
                    }
                    .features {
                        grid-template-columns: 1fr;
                    }
                    .footer {
                        padding: 20px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Welcome to Resume Builder!</h1>
                    <p>Your AI-Powered Resume Journey Starts Here</p>
                </div>

                <div class="content">
                    <p class="greeting">Hi %s,</p>
                    <p class="welcome-text">
                        Thank you for joining <strong>Resume Builder</strong>! We're excited to help you
                        create a professional, ATS-friendly resume that stands out to recruiters.
                    </p>

                    <div class="features">
                        <div class="feature-card">
                            <div class="icon">🤖</div>
                            <div class="label">AI-Powered Improvement</div>
                        </div>
                        <div class="feature-card">
                            <div class="icon">📄</div>
                            <div class="label">Professional Templates</div>
                        </div>
                        <div class="feature-card">
                            <div class="icon">⚡</div>
                            <div class="label">Quick & Easy Builder</div>
                        </div>
                        <div class="feature-card">
                            <div class="icon">📱</div>
                            <div class="label">Mobile Friendly</div>
                        </div>
                    </div>

                    <div style="text-align: center;">
                        <a href="http://localhost:5173/dashboard" class="cta-button">
                            🚀 Go to Dashboard
                        </a>
                    </div>

                    <hr class="divider">

                    <p style="font-size: 13px; color: #6b7280; text-align: center; margin: 0;">
                        Need help getting started? Check out our
                        <a href="#" style="color: #2563eb; text-decoration: none;">Getting Started Guide</a>
                    </p>
                </div>

                <div class="footer">
                    <p>
                        © 2026 <a href="#" class="brand">Resume Builder</a>
                        — Build your dream resume with AI
                    </p>
                    <p class="small">
                        <a href="#">Help Center</a> &nbsp;·&nbsp;
                        <a href="#">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """.formatted(name != null ? name : "User", email);
    }
}