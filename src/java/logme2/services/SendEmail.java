package logme2.services;

import java.io.IOException;

// Import SendGrid classes
import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;

public class SendEmail {

    // Method to send email using SendGrid
    public Response sendMail(SendGrid sg, Mail mail) throws IOException {
        // Create a request object to interact with SendGrid's API
        Request request = new Request();

        try {
            // Set up the request to send the email
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            // Send the email and capture the response
            Response response = sg.api(request);

            // Return the response back to the caller
            return response;

        } catch (IOException ex) {
            // Handle any IOExceptions that occur during the request
            throw new IOException("Error sending email: " + ex.getMessage(), ex);
        }
    }
}
