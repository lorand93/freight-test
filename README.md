# Freight Delay Notification System

A TypeScript application using Temporal workflow engine to monitor freight delivery routes for traffic delays and automatically notify customers when delays exceed specified thresholds.
## Demo video:


https://github.com/user-attachments/assets/511ef0c2-948b-42bb-9e44-1b0f9540ae7e


## Assumptions
### Key Simplifications Made

- **No Database**: All data is assumed to be passed through workflow parameters.
- **No User Management**: Single-customer scenario assumed for demo purposes.
- **No Complex Routing**: Only simple point-to-point or waypoint routing considered.
- **No Time Zones**: Assumes operation within a single time zone.
- **No Internationalization**: Notifications are English-only.
- **No Complex Business Rules**: Logic is based on simple thresholds.

### Service Integration

- Mock implementations are used and sufficient for demonstration purposes.

### Traffic Data Structure

- Delay is represented as a single value in minutes.
- Traffic conditions fall into predefined categories.
- Only one delay value is associated per route.

### API Integrations

- **Google Maps API** is assumed to provide real-time traffic details.
- API calls are mocked for demonstration.
- Simple prompt engineering is used for message generation.
- AI-generated messages do not require advanced content filtering.
- Notifications use static templates with no personalization logic.

### Other Assumptions

- Notifications are not sent to multiple users.
- No API call optimization is implemented.
- Delay reasons are not passed to the AI.
- No monitoring or alerting is included in the demo.

### Fallback Strategy for Missing Traffic Data

If Google API fails to return traffic data:
1. Attempt to use cached traffic data.
2. Fall back to historical traffic data.
3. If neither is available:
   - Trigger an alert.
   - Pause the workflow.
   - Provide a manual triggering option to allow direct company communication of delays.

## Overview

This system implements a complete freight delay notification workflow that:

1. **Monitors Traffic Conditions** - Fetches mocked traffic data for delivery routes
2. **Analyzes Delays** - Calculates potential delays based on current traffic conditions
3. **Generates AI Messages** - Uses OpenAI GPT-4o-mini (mocked) to create personalized delay notifications
4. **Sends Notifications** - Delivers notifications via email (mocked) or SMS (mocked)

## Architecture

The system is built with a modular architecture using Temporal for workflow orchestration:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Temporal      │    │   Activities    │    │   Services      │
│   Workflow      │───▶│   Layer         │───▶│   Layer         │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         v                       v                       v
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Worker        │    │   Type Safety   │    │   External      │
│   Process       │    │   & Validation  │    │   APIs          │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Components

- **Workflows** - Orchestrate the entire delay notification process
- **Activities** - Individual business logic units (fetching data, sending notifications)
- **Services** - API integrations (Google Maps, OpenAI, SendGrid/Twilio)
- **Worker** - Executes workflows and activities
- **Client** - Starts workflows and demonstrates the system

## Quick Start

### Prerequisites

1. **Node.js** (v16 or later)
2. **Docker** (for running Temporal server)
3. **API Keys** (optional for full functionality):
   - Google Maps API key
   - SendGrid API key
   - Twilio account (for SMS)

### Installation

1. **Clone and Install Dependencies**
```bash
git clone <repository-url>
cd freight-delay-notification
npm install
```

2. **Start Temporal Server**
```bash
# Using Docker Compose
git clone https://github.com/temporalio/docker-compose.git temporal-docker
cd temporal-docker
docker-compose up -d

# Wait for services to start.
```

3. ** Configure Environment - Not needed, using only mocks**
```bash
# Set environment variables for production use
export GOOGLE_MAPS_API_KEY=your_google_maps_api_key
export SENDGRID_API_KEY=your_sendgrid_api_key
export CUSTOMER_EMAIL=customer@example.com
export DELAY_THRESHOLD_MINUTES=30
```

### Running the System
To run the system first make sure you have the Temporal server running.

1. **Start the Worker** (in one terminal)
```bash
npm run dev
```

2. **Start the Client** (in another terminal)
```bash
npm run client
```

## API Integration Details

### Google Maps API Mocked (Traffic Data)
- **Endpoint**: Google Maps Directions API
- **Purpose**: Fetch real-time traffic data and calculate delays
- **Fallback**: Mock data generation for demo purposes
- **Configuration**: Set `GOOGLE_MAPS_API_KEY` environment variable

### OpenAI API Mocked (AI Messages)
- **Model**: GPT-4o-mini
- **Purpose**: Generate personalized delay notification messages
- **API Key**: Provided in the exercise
- **Fallback**: Template-based message generation

### SendGrid API Mocked (Email Notifications)
- **Purpose**: Send email notifications to customers
- **Configuration**: Set `SENDGRID_API_KEY` environment variable
- **Fallback**: Mock email sending for demo purposes

### Twilio API Mocked (SMS Notifications)
- **Purpose**: Send SMS notifications as email fallback
- **Configuration**: Set Twilio credentials
- **Fallback**: Mock SMS sending for demo purposes

### Temporal Web UI
Access the Temporal Web UI at `http://localhost:8080`.

## Development

### Project Structure
```
src/
├── activities/          # Temporal activities
│   └── index.ts
├── config/             # Configuration management
│   └── index.ts
├── scenarios/          
│   └── testScenarios.ts # Test scenarios for mock data
├── services/           # External API integrations
│   ├── trafficService.ts
│   ├── aiService.ts
│   └── notificationService.ts # Can be split into two: one service for sms one service for email
├── types/              # TypeScript type definitions
│   └── index.ts
├── workflows/          # Temporal workflows
│   └── freightDelayWorkflow.ts
├── worker.ts           # Temporal worker
└── client.ts           # Workflow client
```

### Available Scripts

```bash
npm run build       # Build TypeScript
npm run dev         # Start worker in development mode
npm run client      # Run demo client
npm run format      # Format code with Prettier
npm run lint        # Lint code with ESLint
npm run test        # Run tests
```

### Mock Data Usage
For demonstration purposes, the system uses mock data:
- **Traffic Data**: Generates realistic delay scenarios
- **AI Messages**: Uses pre-defined templates
- **Notifications**: Simulates email/SMS sending
