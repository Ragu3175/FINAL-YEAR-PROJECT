import authService from './authService';

const API_URL = `${import.meta.env.VITE_API_URL}/api/vehicle`;

const vehicleService = {
    registerVehicle: async (vehicleNumber) => {
        const token = authService.getToken();

        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ vehicleNumber })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to register vehicle');
        }
        return data;
    },

    getVehicleStatus: async () => {
        const token = authService.getToken();

        const response = await fetch(`${API_URL}/status`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        // 404 is fine here, it just means the user hasn't registered a vehicle yet
        if (!response.ok && response.status !== 404) {
            throw new Error(data.message || 'Failed to fetch vehicle status');
        }

        if (response.status === 404) {
            return null;
        }

        return data;
    }
};

export default vehicleService;
