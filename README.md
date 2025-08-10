# SkyOps Project

SkyOps is a mission planning and visualization tool designed for drone operations. It consists of a backend server for processing mission data and a frontend application for user interaction.

## Features

### Frontend
- Interactive mission planning interface.
- Visualization of routes and No-Fly zones.
- CSV export for Litchi drone missions.

### Backend
- Image processing for route generation.
- Skeletonization and junction detection.
- Pathfinding using Dijkstra's algorithm.

## Installation

### Backend
1. Navigate to the `SkyOps-Backend` directory.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the server:
   ```bash
   python main.py
   ```

### Frontend
1. Navigate to the `SkyOps-Frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Usage

1. Open the frontend application in your browser.
2. Upload the required images and configure mission parameters.
3. Visualize the generated route and download the CSV for Litchi.

## Environment Variables

### Backend
- `FLASK_ENV`: Set to `development` for local testing.

### Frontend
- No specific environment variables required.

## License

This project is licensed under the MIT License.
