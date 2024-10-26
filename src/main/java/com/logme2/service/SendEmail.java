package com.logme2.service;

import java.io.IOException;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.Method;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;

public class SendEmail {
    public Response sendMail(SendGrid sg, Mail mail) throws IOException {
        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            return sg.api(request);
        } catch (IOException ex) {
            throw new IOException("Error sending email: " + ex.getMessage(), ex);
        }
    }
}
