# Attendify - Student Attendance System (Frontend Only)

A modern, responsive attendance management system built with React and TypeScript. This is a frontend-only application with mock data for demonstration purposes.

## Features

- **Modern Dashboard**: Beautiful, responsive interface with real-time statistics
- **Multi-role Support**: Admin, Faculty, and Student interfaces
- **Class Management**: Create and manage classes with attendance settings
- **Reports & Analytics**: View attendance reports and analytics
- **Mock Data**: Complete functionality with realistic mock data
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd attendify
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Application**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173

## Demo Users

You can login with any email and role combination:
- **Admin**: admin@attendify.com (or any email with role "admin")
- **Faculty**: faculty@attendify.com (or any email with role "faculty")  
- **Student**: student@attendify.com (or any email with role "student")

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- Heroicons for icons
- Mock API service for data

## Project Structure

```
attendify/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   │   ├── Dashboard/      # Dashboard components
│   │   ├── Attendance/     # Attendance management
│   │   ├── Auth/          # Authentication components
│   │   ├── Classes/       # Class management
│   │   ├── Students/      # Student management
│   │   ├── Faculty/       # Faculty management
│   │   ├── Reports/       # Reports and analytics
│   │   └── Layout/        # Layout components
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── services/          # Mock API services
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
└── dist/                  # Built application
```

## Features in Detail

### Dashboard
- Real-time attendance statistics (mock data)
- Quick actions for common tasks
- Role-based content display
- Recent activity feed
- Beautiful gradient design

### Attendance Management
- **Mock Face Recognition**: Simulated AI-powered attendance
- **Mock QR Code Scanning**: Simulated QR code check-in
- **Manual Entry**: Traditional attendance marking interface
- **Bulk Operations**: Interface for marking multiple students

### Class Management
- Create and configure classes (mock data)
- Set attendance methods (Face, QR, Manual)
- Manage student enrollment
- Schedule management

### Analytics & Reports
- Attendance trends and patterns (mock data)
- Student performance tracking
- Export reports interface
- Risk student identification

## Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Mock Data
The application uses comprehensive mock data to demonstrate all features:
- User authentication and profiles
- Class and student data
- Attendance records and statistics
- Reports and analytics

## Deployment

### Static Hosting (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. No backend configuration needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation

## Note

This is a frontend-only demonstration application. All data is mock data and no actual backend server is required. The application showcases a complete attendance management system interface with realistic functionality.