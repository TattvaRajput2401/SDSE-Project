# Use Case Diagram - Vedic Astrology Application

## Overview
This use case diagram illustrates the interactions between a registered user and the Vedic Astrology application system. It shows the primary functionalities available to users and the external systems the application integrates with.

## Actors
- **REGISTERED USER**: The primary actor who interacts with the system to access astrology-related features.

## Use Cases

### 1. **MANAGE BIRTH PROFILE**
- **Description**: Save DOB (Date of Birth), TOB (Time of Birth), and User Coordinates
- **Actors**: Registered User
- **Purpose**: Capture essential biographical data required for astrological calculations
- **Details**: 
  - Date of Birth
  - Time of Birth
  - Geographic Coordinates (Latitude/Longitude)

### 2. **CALCULATE BIRTH CHART**
- **Description**: Virtual Rendering via VedicAstro API
- **Actors**: Registered User
- **Purpose**: Generate comprehensive birth chart based on user's birth data
- **External System**: VedicAstro API (for calculation and rendering)
- **Details**: Leverages external VedicAstro API to compute planetary positions and generate visual birth chart

### 3. **ANALYSE DOSHA STATUS**
- **Description**: Analyze Mangal, Kaal Sarp and Caching
- **Actors**: Registered User
- **Purpose**: Provide detailed analysis of doshas affecting the user's astrological profile
- **Key Doshas Analyzed**:
  - Mangal Dosha
  - Kaal Sarp Dosha
- **Performance**: Results are cached for optimized retrieval

### 4. **MANAGE SAVED REPORTS**
- **Description**: CRUD operations for Historical Charts
- **Actors**: Registered User
- **Purpose**: Store, retrieve, update, and manage historical astrological calculations
- **Database**: MongoDB
- **Operations**:
  - Create new reports
  - Read/View historical reports
  - Update existing reports
  - Delete reports

### 5. **REQUEST ACCOUNT DELETION**
- **Description**: Soft-Delete with 30-Day Window
- **Actors**: Registered User
- **Purpose**: Allow users to request account deletion with a recovery period
- **Details**: 
  - Soft delete mechanism (data not immediately removed)
  - 30-day grace period for account restoration
  - After 30 days, permanent deletion executed

## External Systems

### VedicAstro API
- **Integration Point**: Used by "Calculate Birth Chart" use case
- **Purpose**: External service for astronomical calculations and chart rendering
- **Responsibility**: Compute planetary positions, generate visual charts

### MongoDB Database
- **Integration Point**: Data persistence layer
- **Purpose**: Store user profiles, historical reports, and astrological data
- **Connections**: 
  - From "Manage Saved Reports" for CRUD operations
  - From "Analyse Dosha Status" for caching and retrieval

## System Interactions

### Data Flow
1. User provides birth information → MANAGE BIRTH PROFILE
2. Birth data processed → CALCULATE BIRTH CHART (via VedicAstro API)
3. Chart data stored → MongoDB
4. Historical data retrieved → MANAGE SAVED REPORTS
5. Dosha analysis performed → ANALYSE DOSHA STATUS (cached results)
6. Account deletion requested → REQUEST ACCOUNT DELETION (soft delete with 30-day window)

## Key Features
- **Real-time Calculation**: Immediate birth chart generation
- **Data Persistence**: Comprehensive historical record management
- **External Integration**: Utilizes VedicAstro API for accurate computations
- **User Privacy**: Soft-delete mechanism with recovery window
- **Performance Optimization**: Caching strategy for dosha analysis
- **Multi-functional Access**: All features accessible to authenticated users

## Database Schema Integration
- **UserProfile**: Stores DOB, TOB, and coordinates
- **BirthChart**: Stores calculated chart data and VedicAstro API responses
- **DoshaReport**: Stores dosha analysis results with cache information
- **HistoricalCharts**: Maintains audit trail of all user reports

## Security Considerations
- User authentication required for all use cases
- Role-based access control for user data
- Soft-delete implementation protects against accidental data loss
- Data encryption for sensitive birth information
