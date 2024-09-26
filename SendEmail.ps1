$smtpServer = "smtp.sendgrid.net"
$smtpPort = 465
$smtpUsername = "apikey"
$smtpPassword = "SG.MWyt3ft4Ram91nFLwLb2dw. L4SOtFz-D_lOm2lG6lUmCl2huCMGcEXd1U4RpDTpS7E
"

$from = "logme2@logme2.com"
$to = "kamasi.mahone@gmail.com"
$subject = "Test Email from PowerShell"
$body = "This is a test email sent from PowerShell using SendGrid."

$securePassword = ConvertTo-SecureString -String $smtpPassword -AsPlainText -Force

Send-MailMessage -To $to -From $from -Subject $subject -Body $body -SmtpServer $smtpServer -Port $smtpPort -UseSsl -Credential (New-Object PSCredential($smtpUsername, $securePassword))
