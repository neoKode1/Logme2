package logme2;  // Ensure this matches the folder structure

import logme2.services.SendEmail;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;

@WebServlet("/send-email")
public class SendEmailServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // Enable CORS
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");

        // Extract form data
        String recipient = request.getParameter("recipient");
        String subject = request.getParameter("subject");
        String message = request.getParameter("message");

        // Basic validation
        if (recipient == null || subject == null || message == null ||
                recipient.isEmpty() || subject.isEmpty() || message.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().println("{\"error\": \"Missing or empty fields: 'recipient', 'subject', and 'message' are required.\"}");
            return;
        }

        // SendGrid API key from environment variables
        String apiKey = System.getenv("SENDGRID_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().println("{\"error\": \"SendGrid API key is not configured.\"}");
            return;
        }

        // Setup SendGrid mail objects
        Email from = new Email("logme2@logme2.com");
        Email to = new Email(recipient);
        Content content = new Content("text/plain", message);
        Mail mail = new Mail(from, subject, to, content);

        try {
            // Use SendEmail service to send the email
            SendGrid sg = new SendGrid(apiKey);
            SendEmail sendEmailService = new SendEmail();
            Response sendResponse = sendEmailService.sendMail(sg, mail);

            // Log response details for debugging
            System.out.println("Status Code: " + sendResponse.getStatusCode());
            System.out.println("Body: " + sendResponse.getBody());
            System.out.println("Headers: " + sendResponse.getHeaders());

            // Respond to the client
            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentType("application/json");
            response.getWriter().println("{\"message\": \"Email sent successfully to " + recipient + "\"}");

        } catch (Exception ex) {
            ex.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.setContentType("application/json");
            response.getWriter().println("{\"error\": \"Failed to send email: " + ex.getMessage() + "\"}");
        }
    }
}
