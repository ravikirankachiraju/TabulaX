# TabulaX - AI-Powered Table Transformation Platform

TabulaX is an intelligent web application that uses AI to automatically discover and apply transformations between tables, saving hours of manual data wrangling.

![TabulaX](https://via.placeholder.com/800x400?text=TabulaX+Platform)

## 🚀 Features

- **Simple Data Import**: Upload CSV, Excel files or paste your source and target tables directly
- **AI-Powered Transformation**: Our AI analyzes your data and automatically finds the best transformation rules
- **Dynamic Dashboard**: Visualize your data with interactive charts and filtering options
- **Transparent Logic**: View and customize the transformation code that powers your data conversion
- **Iterative Refinement**: Fine-tune transformations by providing additional examples
- **Export Options**: Download transformed data in multiple formats, including the transformation code
- **Database Integration**: Connect directly to databases for seamless data transformation

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, Python (for AI transformation logic)
- **Authentication**: JWT, OAuth
- **Data Processing**: Papa Parse, xlsx
- **Visualization**: Plotly.js

## 📋 Project Structure

```
tabulax/
├── project/                  # Main project directory
│   ├── backend/              # Backend server code
│   │   ├── config/           # Configuration files
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Express middleware
│   │   ├── models/           # Database models
│   │   ├── routes/           # API routes
│   │   ├── uploads/          # Temporary file storage
│   │   ├── app.py            # Python transformation logic
│   │   └── server.js         # Express server
│   ├── src/                  # Frontend source code
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── App.tsx           # Main application component
│   │   └── main.tsx          # Application entry point
│   ├── public/               # Static assets
│   ├── index.html            # HTML entry point
│   ├── package.json          # Frontend dependencies
│   └── vite.config.ts        # Vite configuration
└── package.json              # Root dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- Python (v3.8+)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/tabulax.git
   cd tabulax
   ```

2. Install frontend dependencies
   ```bash
   cd project
   npm install
   ```

3. Install backend dependencies
   ```bash
   cd backend
   npm install
   pip install -r requirements.txt  # If you have a requirements.txt file
   ```

4. Set up environment variables
   ```bash
   cp backend/.env.example backend/.env
   # Edit .env file with your configuration
   ```

5. Start the development servers
   ```bash
   # In project directory
   npm run dev
   
   # In another terminal, in project/backend directory
   node server.js
   ```

6. Open your browser and navigate to `http://localhost:5173`

## 🔄 Workflow

1. **Upload Data**: Import your source table and an example of how you want your data to be transformed
2. **Select Columns**: Choose the columns from source and target tables to compare
3. **Generate Transformation**: The AI analyzes the patterns between your source and target, inferring the transformation rules
4. **Review & Edit**: View the generated Python code and modify if needed
5. **Test Transformation**: Test the transformation with sample inputs
6. **Apply Transformation**: Apply the transformation to your full dataset
7. **Export Results**: Download the transformed data and/or the transformation code

## 🔒 Authentication

TabulaX supports both traditional email/password authentication and OAuth integration with popular providers.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Contact

For any questions or feedback, please reach out to [your-email@example.com](mailto:your-email@example.com)
