# TabulaX - AI-Powered Table Transformation Platform

TabulaX is an intelligent web application that uses AI to automatically discover and apply transformations between tables, saving hours of manual data wrangling

### Prerequisites

- Node.js 
- Python 
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




