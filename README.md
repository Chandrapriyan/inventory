# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Running the Application Locally

To run this project on your computer, you'll need to have [Node.js](https://nodejs.org/) (version 18 or higher) installed.

### 1. Install Dependencies

Open your terminal, navigate to the project's root directory, and run the following command to install all the necessary packages:

```bash
npm install
```

### 2. Run the Development Servers

This application has two main parts that need to run simultaneously for all features to work: the Next.js frontend and the Genkit AI backend. You will need to open two separate terminal windows.

**Terminal 1: Start the Next.js Frontend**

```bash
npm run dev
```

This will start the main web application. You can view it in your browser at [http://localhost:9002](http://localhost:9002).

**Terminal 2: Start the Genkit AI Backend**

```bash
npm run genkit:dev
```

This starts the local server that powers the AI features. The frontend will automatically communicate with this server.
