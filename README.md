# LogMe2 - Driver Delivery Log Application

## Overview
The Driver Delivery Log System is a robust web application designed to streamline the process of logging delivery activities for drivers. This tool allows drivers to efficiently record details about their deliveries, including mileage, stops, and key metrics that are crucial for daily operations. With features like automatic wait time calculations, data persistence, and daily summary emails, the system is an essential tool for managing delivery logs effectively.

## Features
- **Comprehensive Log Entry System**: Drivers can input detailed information for each stop, including hotel names, arrival and departure times, and the number of items delivered and received.
- **Automated Wait Time Calculation**: The system automatically calculates and displays the wait time based on recorded arrival and departure times.
- **Daily Log Finalization**: Provides an easy way for drivers to finalize their daily logs and send a comprehensive summary via email to designated recipients.
- **Responsive and Intuitive Design**: The application features a fully responsive design, ensuring optimal usability on both desktop and mobile devices.
- **Local Data Persistence**: Leverages localStorage for saving logs temporarily, allowing users to retrieve, edit, and manage logs even when offline.
- **Google Sign-In integration**: Allows users to sign in with their Google account for a seamless experience.
- **Offline functionality with service worker**: Enables users to access the application even when offline, with the service worker caching resources for later use.
- **Google Cloud Storage for data persistence**: Stores log data in Google Cloud Storage for persistent storage and easy retrieval.
- **Email functionality using Gmail API**: Sends daily log summaries via email using the Gmail API.

## Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6)
- **Backend**: Node.js with Express.js framework
- **Email Service**: Gmail API for dispatching daily log summaries via email
- **Local Storage**: Utilizes localStorage for temporary data persistence, ensuring quick access to log entries
- **Styling**: Tailwind CSS for responsive and modern UI design
- **Service Workers**: Utilizes service workers for offline functionality and caching resources

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/logme2.git
   cd logme2
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up Google Cloud Project:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google Cloud Storage API and Gmail API
   - Create a service account and download the JSON key file

4. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     GOOGLE_CLOUD_PROJECT=your-project-id
     GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
     GOOGLE_CLOUD_STORAGE_BUCKET=your-bucket-name
     SENDGRID_API_KEY=your-sendgrid-api-key
     ```

5. Start the server:
   ```
   npm start
   ```

6. Open the application in your browser:
   ```
   http://localhost:3000
   ```

## Usage
1. **Log Entries**: Begin by entering essential details such as the truck number, driver name, and the starting odometer reading. Continue by adding log entries for each stop throughout the day.
2. **Finalize the Log**: After all entries are made, finalize the log to calculate total miles and compile other essential statistics.
3. **Send Daily Log**: Use the system to email a summary of the finalized log via the Gmail API.

## Project Structure
- `public/`: Contains all client-side files (HTML, CSS, client-side JavaScript)
- `src/`: Server-side JavaScript files
- `server.js`: Main server file
- `app.js`: Main client-side JavaScript file

## Screenshots
[Include screenshots of the updated UI here]

## Future Enhancements
- **Database Integration**: Implement a database solution (e.g., MongoDB) for persistent storage of logs, enabling better data management and retrieval.
- **User Authentication**: Introduce user authentication and authorization mechanisms to enhance data security and user management.
- **Advanced Reporting**: Develop a more detailed reporting system with visualizations, including charts and graphs, and the ability to export data for analysis.

## Contributing
Contributions are highly appreciated! If you have suggestions for improvements, new features, or if you'd like to fix a bug, please submit a pull request or open an issue on GitHub.

## License
This project is licensed under the MIT License. For more details, see the LICENSE file.

## Contact
For any questions, suggestions, or feedback, feel free to contact the project maintainer at kamasimahone@gmail.com.
