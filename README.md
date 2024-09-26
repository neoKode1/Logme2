Driver Delivery Log System
Overview
The Driver Delivery Log System is a robust web application designed to streamline the process of logging delivery activities for drivers. This tool allows drivers to efficiently record details about their deliveries, including mileage, stops, and key metrics that are crucial for daily operations. With features like automatic wait time calculations, data persistence, and daily summary emails, the system is an essential tool for managing delivery logs effectively.

Features
Comprehensive Log Entry System: Drivers can input detailed information for each stop, including hotel names, arrival and departure times, and the number of items delivered and received.
Automated Wait Time Calculation: The system automatically calculates and displays the wait time based on recorded arrival and departure times.
Daily Log Finalization: Provides an easy way for drivers to finalize their daily logs and send a comprehensive summary via email to designated recipients.
Responsive and Intuitive Design: The application features a fully responsive design, ensuring optimal usability on both desktop and mobile devices.
Local Data Persistence: Leverages localStorage for saving logs temporarily, allowing users to retrieve, edit, and manage logs even when offline.
Technology Stack
Frontend: HTML5, CSS3, JavaScript (ES6)
Backend: Node.js with Express.js framework
Email Service: SendGrid API for dispatching daily log summaries via email
Local Storage: Utilizes localStorage for temporary data persistence, ensuring quick access to log entries
Setup Instructions
Prerequisites
Node.js: Ensure Node.js is installed on your machine.
SendGrid Account: A SendGrid account is required to enable email functionality.
Installation
Clone the Repository:

bash
Copy code
git clone https://github.com/your-username/driver-delivery-log-system.git
cd driver-delivery-log-system
Install Dependencies:

bash
Copy code
npm install
Create a .env File: Create a .env file in the root directory with the following content:

plaintext
Copy code
SENDGRID_API_KEY=your_sendgrid_api_key
PORT=3000
Start the Server:

bash
Copy code
npm start
Access the Application: Open your web browser and navigate to http://localhost:3000.

Usage
Log Entries: Begin by entering essential details such as the truck number, driver name, and the starting odometer reading. Continue by adding log entries for each stop throughout the day.
Finalize the Log: After all entries are made, finalize the log to calculate total miles and compile other essential statistics.
Send Daily Log: Use the system to email a summary of the finalized log via the SendGrid service.
Screenshots
An interface showcasing the Driver Delivery Log Form.

Future Enhancements
Database Integration: Implement a database solution (e.g., MongoDB) for persistent storage of logs, enabling better data management and retrieval.
User Authentication: Introduce user authentication and authorization mechanisms to enhance data security and user management.
Advanced Reporting: Develop a more detailed reporting system with visualizations, including charts and graphs, and the ability to export data for analysis.
Contributing
Contributions are highly appreciated! If you have suggestions for improvements, new features, or if you'd like to fix a bug, please submit a pull request or open an issue on GitHub.

License
This project is licensed under the MIT License. For more details, see the LICENSE file.

Contact
For any questions, suggestions, or feedback, feel free to contact the project maintainer at kamasimahone@gmail.com.
