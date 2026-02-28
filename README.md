# SafeDrive AI: Intelligent Fleet & Vehicle Monitoring System

## 1. Project Overview
SafeDrive AI is a comprehensive, real-time Internet of Things (IoT) platform designed to enhance road safety, monitor driver behavior, and provide live fleet tracking. The system seamlessly integrates custom ESP32 hardware with a modern MERN stack web application to detect, report, and visualize critical telemetry and sensor data from vehicles.

The core motivation behind this project is to reduce accidents caused by overspeeding, drowsy driving, drunk driving, and other high-risk behaviors by providing immediate, real-time alerts to both the driver and centralized fleet administrators.

---

## 2. System Architecture
The project follows a distributed **Client-Server-Hardware** architecture, divided into three main tiers:

### A. The Hardware Tier (ESP32 C++ Firmware)
*   **Microcontroller:** ESP32 is used as the central processing unit due to its built-in Wi-Fi capabilities and robust processing power.
*   **Sensors:**
    *   **MPU6050 (Accelerometer & Gyroscope):** Detects sudden braking, sharp turns, and crash impacts.
    *   **NEO-6M GPS Module:** Provides accurate, live geographical tracking (Latitude, Longitude) and speed.
    *   **MQ3 Alcohol Sensor:** Detects alcohol presence in the cabin to prevent drunk driving.
    *   **IR Sensor:** Monitors driver eye status to detect drowsiness.
    *   **Flex Sensor & Load Cell:** Ensures seatbelt compliance and passenger presence.
*   **Networking:** The ESP32 collects data from these sensors, formats it into a JSON payload, and transmits it over Wi-Fi via HTTP POST requests to the cloud backend every 1.5 seconds.
*   **Security:** Communication is secured using a unique, backend-generated `x-device-key` header to ensure only authorized vehicles can push data.

### B. The Backend Tier (Node.js, Express, MongoDB)
The backend acts as the central nervous system, built on the MERN stack.
*   **Database (MongoDB Atlas):** Stores user profiles, vehicle registrations, historical telemetry data, and violation logs.
*   **RESTful API:** 
    *   `authRoutes`: Handles JWT-based user authentication (Login, Register).
    *   `vehicleRoutes`: Manages vehicle registration, generating unique `Device IDs` and 32-character `Secret Keys` for hardware. It also features an `/update` endpoint that ingests data from the ESP32.
*   **Risk Engine (`riskService.js`):** A custom algorithmic engine that processes incoming ESP32 arrays. It analyzes speed, alcohol levels, seatbelt status, and IR data to dynamically calculate a vehicle's "Risk Level" (Low, Medium, High).
*   **Real-time Communication (Socket.io):** Instantly broadcasts validated telemetry updates and violation alerts to all connected frontend clients without requiring page refreshes.

### C. The Frontend Tier (React.js, Vite, Tailwind CSS)
A highly responsive, premium web dashboard providing two distinct views:
*   **User Panel:** Allows individual drivers to register their vehicle, view their own live telemetry (speed, location, temperature), analyze sensor readings, and review their recent driving history via time-series tables and charts.
*   **Admin/Fleet Panel:** A global dashboard that uses `react-leaflet` to display an interactive map of *all* registered vehicles simultaneously. It features live "Risk Status" markers (Green/Yellow/Red) and a global violation feed for centralized fleet monitoring.
*   **Design System:** Built with a glassmorphic, modern dark-mode aesthetic utilizing Lucide icons and Recharts for data visualization.

---

## 3. Key Features Implementation

### 1. Secure "Login-First" Access
*   **Implementation:** We built a `ProtectedRoute` wrapper component in React. If a user tries to access the dashboard without a valid JWT token stored in their browser, they are securely redirected to a premium Login/Register page.

### 2. Live Vehicle Registration & Hardware Provisioning
*   **Implementation:** When a user logs in for the first time, they are prompted to register their vehicle. The Node.js backend generates a unique `Device ID` and a secure cryptographic `Secret Key`. The user is instructed to copy this key and hardcode it into their ESP32 `main.cpp` file. This securely bridges the software account with the physical hardware.

### 3. Real-Time Telemetry & Risk Analysis
*   **Implementation:** The ESP32 sends a payload to the Node.js `/update` route. The backend's `riskService` processes this data. For example, if `speed > 80` or `mqValue > 400`, it flags a violation. The backend immediately saves this to MongoDB and emits a `telemetryUpdate` event via Socket.io. The React frontend listens to this socket and updates the UI instantly.

### 4. Interactive Live Fleet Map
*   **Implementation:** The Admin dashboard uses Leaflet to plot vehicles. As Socket.io events stream in, the React state dynamically updates the coordinates and color-codes the map markers based on the vehicle's real-time risk level calculation.

---

## 4. Challenges Faced & Solutions

### Challenge 1: MongoDB Connection Refusals (`ECONNREFUSED`)
*   **Problem:** During deployment preparation, the backend crashed because it couldn't connect to the database.
*   **Solution:** We debugged the environment variables and found formatting issues with the MongoDB URI string. We corrected the connection string parsing in the `.env` file, ensuring the password and cluster URL matched the Atlas deployment.

### Challenge 2: "Invalid Token" 403 Errors on Hardware Registration
*   **Problem:** The live deployment suddenly blocked users from registering vehicles, returning 403 Forbidden errors.
*   **Solution:** We discovered two issues. First, the JWT access token expiration was set too aggressively (`15m`). Second, there was a mismatch in the `authMiddleware.js` looking for `JWT_SECRET` instead of the specified `JWT_ACCESS_SECRET`. We aligned the environment variables across the backend and instructed the user to refresh their session.

### Challenge 3: Real-Time Map Not Showing New Vehicles
*   **Problem:** The Admin panel map successfully updated the speed and location of "mock" dummy vehicles, but when real users registered new hardware (`SD-5E85C7C7`), they didn't appear on the global map.
*   **Solution:** We rewrote the React state management in `AdminPanel.jsx`. Instead of just updating existing arrays, we implemented a dynamic check: if the incoming Socket.io `deviceId` does not exist in the state array, the frontend now seamlessly *appends* the new vehicle to the map.

### Challenge 4: Mixed Content Security Errors (HTTPS vs HTTP)
*   **Problem:** When deployed to Vercel (HTTPS), the frontend attempted to connect to `http://localhost:5000` to fetch data, which browsers block due to "Mixed Content" security policies (`ERR_BLOCKED_BY_CLIENT`).
*   **Solution:** We completely removed hardcoded localized URLs from the frontend services (`vehicleService.js` and `authService.js`). We replaced them with dynamic `import.meta.env.VITE_API_URL` variables pointing to the live Render backend, successfully establishing secure HTTPS communication.

---

## 5. Conclusion
SafeDrive AI successfully bridges embedded C++ hardware engineering with modern, real-time web development. By overcoming significant networking, state management, and real-time synchronization challenges, the project delivers a professional, scalable prototype capable of actively monitoring fleets, detecting dangerous behaviors, and ultimately promoting safer roads.
