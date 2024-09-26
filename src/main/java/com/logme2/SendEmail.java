package com.logme2;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import java.io.IOException;

public class SendEmail {
    public static void main(String[] args) {
        // Logging to confirm the function is triggered
        System.out.println("Email sending function triggered");

        // Retrieve the SendGrid API key from environment variables
        String apiKey = System.getenv("SENDGRID_API_KEY");

        // Check if the API key is not null or empty
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("Error: SendGrid API key is missing. Please set it in your environment variables.");
            return; // Exit the program if the API key is missing
        }

        // Print the first 5 characters of the API key for confirmation (ensure it's not null)
        System.out.println("API Key (first 5 chars): " + apiKey.substring(0, Math.min(apiKey.length(), 5)) + "...");

        // Define email parameters
        Email from = new Email("Logme2@logme2.com");
        String subject = "Test Email from Java SendGrid Application";
        Email to = new Email("kamasi.mahone@gmail.com");
        Content content = new Content("text/plain", "This is a test email sent from a Java application using SendGrid.");
        Mail mail = new Mail(from, subject, to, content);

        // Initialize SendGrid with the API key
        SendGrid sg = new SendGrid(apiKey);
        Request request = new Request();

        try {
            // Log the email details
            System.out.println("Preparing to send email...");
            System.out.println("From: " + from.getEmail());
            System.out.println("To: " + to.getEmail());
            System.out.println("Subject: " + subject);
            System.out.println("Content: " + content.getValue());

            // Set up the request to SendGrid
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            // Log the request details
            System.out.println("Request Method: " + request.getMethod());
            System.out.println("Request Endpoint: " + request.getEndpoint());

            // Send the email and retrieve the response
            Response response = sg.api(request);

            // Log the response status and body
            System.out.println("Response Status Code: " + response.getStatusCode());
            System.out.println("Response Body: " + response.getBody());
            System.out.println("Response Headers: " + response.getHeaders());

            // Check if the email was sent successfully
            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                System.out.println("Email sent successfully according to SendGrid API!");
            } else {
                System.err.println("Failed to send email. Please check the response details above.");
            }
        } catch (IOException ex) {
            // Handle I/O errors that may occur when sending the email
            System.err.println("I/O error occurred: " + ex.getMessage());
            ex.printStackTrace();
        } catch (Exception ex) {
            // Log any other exceptions that occur during the email sending process
            System.err.println("Unexpected error sending email: " + ex.getMessage());
            ex.printStackTrace();
        }
    }
}
