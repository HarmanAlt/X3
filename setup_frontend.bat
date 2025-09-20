@echo off
echo Setting up Attendify Frontend...

REM Create .env file
echo REACT_APP_API_URL=http://localhost:5000 > .env
echo REACT_APP_FACE_RECOGNITION_TOLERANCE=0.6 >> .env
echo REACT_APP_QR_CODE_EXPIRY_MINUTES=30 >> .env

echo ✅ Environment file created

REM Install dependencies
echo Installing dependencies...
npm install

echo ✅ Dependencies installed

echo.
echo 🎉 Frontend setup complete!
echo.
echo Next steps:
echo 1. Start the backend: cd attendance-backend && python app.py
echo 2. Start the frontend: npm start
echo 3. Open http://localhost:3000
echo.
echo Demo credentials:
echo - Admin: admin@attendify.com
echo - Faculty: faculty@attendify.com  
echo - Student: student@attendify.com
echo.
pause
