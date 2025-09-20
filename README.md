# Attendify - Smart Attendance Management System

A comprehensive web-based attendance management system with dual-mode technology (QR Code + Face Recognition) and beautiful glassmorphism design.

## Features

### 🎯 Core Functionality
- **Dual Attendance Modes**: QR Code scanning AND AI-powered face recognition
- **Student Portal**: Web-based attendance marking, personal dashboard, face enrollment
- **Teacher Dashboard**: QR code generation, real-time monitoring, attendance reports
- **Admin Panel**: College-wide analytics, user management, system settings

### 🎨 Design & UI
- **Glassmorphism Design**: Frosted glass effects, semi-transparent elements, backdrop blur
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile browsers
- **Dark Mode Support**: Complete dark theme implementation
- **Smooth Animations**: Micro-interactions and hover effects throughout

### 🔧 Technical Features
- **Face Recognition**: Browser-based face detection using face-api.js
- **Real-time Updates**: Live attendance tracking without page refresh
- **Photo Verification**: Store attendance photos for verification
- **Privacy Controls**: Students can opt-out of face recognition
- **Export Functionality**: Download attendance reports as CSV/Excel

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Face Recognition Models Setup
Download the required face-api.js models and place them in the `public/models/` directory:

1. Download models from: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
2. Place these files in `public/models/`:
   - `tiny_face_detector_model-weights_manifest.json`
   - `tiny_face_detector_model-shard1`
   - `face_landmark_68_model-weights_manifest.json`
   - `face_landmark_68_model-shard1`
   - `face_recognition_model-weights_manifest.json`
   - `face_recognition_model-shard1`
   - `face_recognition_model-shard2`
   - `face_expression_model-weights_manifest.json`
   - `face_expression_model-shard1`

### 3. Firebase Configuration
1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication and Firestore Database
3. Update `src/config/firebase.ts` with your Firebase configuration:
```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 4. Run the Application
```bash
npm run dev
```

## User Roles & Features

### 👨‍🎓 Students
- **Attendance Portal**: Choose between QR code scanning or face recognition
- **Face Enrollment**: Register face for attendance recognition
- **Personal Dashboard**: View attendance history and statistics
- **Real-time Updates**: Live attendance status

### 👨‍🏫 Teachers
- **Session Management**: Start/stop attendance sessions
- **QR Code Generation**: Create QR codes for classes
- **Real-time Monitoring**: Live attendance tracking with photo verification
- **Reports**: Download attendance reports and analytics

### 👨‍💼 Admins
- **System Overview**: College-wide attendance analytics
- **User Management**: Manage students and teachers
- **Model Training**: Face recognition model management
- **System Settings**: Configure attendance policies

## Technology Stack

- **Frontend**: React.js with TypeScript
- **Styling**: Tailwind CSS with custom glassmorphism components
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Face Recognition**: face-api.js
- **QR Codes**: qrcode library
- **Charts**: Recharts for analytics
- **Icons**: Heroicons and Lucide React

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

**Note**: Face recognition requires camera access and works best in Chrome and Firefox.

## Privacy & Security

- **Local Processing**: Face recognition runs entirely in the browser
- **No Cloud Storage**: Face data is not sent to external servers
- **Privacy Controls**: Students can opt-out of face recognition
- **Secure Authentication**: Firebase Auth with role-based access
- **Data Encryption**: All data encrypted in transit and at rest

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.


