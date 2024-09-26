package logme2.services;

import java.io.IOException;
import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;

public class SendEmail {

    public Response sendMail(SendGrid sg, Mail mail) throws IOException {
        Request request = new Request();

        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sg.api(request);
            return response;

        } catch (IOException ex) {
            throw new IOException("Error sending email: " + ex.getMessage(), ex);
        }
    }
}
