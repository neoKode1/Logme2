package com.logme2;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/finalizeLog")
public class FinalizeLogServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Extract data from the request
        String odometerFinish = request.getParameter("odometerFinish");
        String totalMiles = request.getParameter("totalMiles");
        String fuelPurchase = request.getParameter("fuelPurchase");
        String comments = request.getParameter("comments");

        // Log the values to the console (for debugging purposes)
        System.out.println("Odometer Finish: " + odometerFinish);
        System.out.println("Total Miles: " + totalMiles);
        System.out.println("Fuel Purchase: " + fuelPurchase);
        System.out.println("Comments: " + comments);

        // Prepare email content
        String subject = "Daily Log Summary";
        String emailContent = "Odometer Finish: " + odometerFinish + "\n"
                + "Total Miles: " + totalMiles + "\n"
                + "Fuel Purchase: " + fuelPurchase + "\n"
                + "Comments: " + comments;

        // Call the method to send the email
        boolean emailSent = sendEmail(subject, emailContent);

        // Respond to the client
        if (emailSent) {
            response.getWriter().write("Log data received and email sent successfully.");
        } else {
            response.getWriter().write("Log data received, but email sending failed.");
        }
    }

    private boolean sendEmail(String subject, String content) {
        String apiKey = System.getenv("SENDGRID_API_KEY");
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("Error: SendGrid API key is missing.");
            return false;
        }

        Email from = new Email("Logme2@logme2.com");
        Email to = new Email("kamasi.mahone@gmail.com");
        Content emailContent = new Content("text/plain", content);
        Mail mail = new Mail(from, subject, to, emailContent);

        SendGrid sg = new SendGrid(apiKey);
        Request request = new Request();

        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request);

            // Log the response details
            System.out.println("Response Status Code: " + response.getStatusCode());
            System.out.println("Response Body: " + response.getBody());
            System.out.println("Response Headers: " + response.getHeaders());

            return response.getStatusCode() >= 200 && response.getStatusCode() < 300;
        } catch (IOException ex) {
            System.err.println("I/O error occurred: " + ex.getMessage());
            ex.printStackTrace();
            return false;
        }
    }
}
