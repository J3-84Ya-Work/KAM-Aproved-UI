# KAM Approved API - Backend

.NET 9.0 Web API for the KAM Approved UI application.

## Project Structure

```
backend/
└── KAMApprovedAPI/
    ├── Controllers/      # API Controllers
    ├── Models/           # Data models/entities
    ├── Services/         # Business logic services
    ├── Data/             # Database context and repositories
    ├── DTOs/             # Data Transfer Objects
    ├── Middleware/       # Custom middleware
    ├── Properties/       # Launch settings
    ├── Program.cs        # Application entry point
    ├── appsettings.json  # Configuration
    └── KAMApprovedAPI.csproj
```

## Technology Stack

- **.NET 9.0** - Latest .NET framework
- **ASP.NET Core Web API** - RESTful API framework
- **Entity Framework Core** - ORM (to be added)
- **SQL Server** - Database (to be configured)

## Getting Started

### Prerequisites

- .NET SDK 9.0 or higher
- SQL Server (local or remote)
- Visual Studio 2022 / VS Code / Rider

### Installation

1. Navigate to the backend directory:
```bash
cd "backend/KAMApprovedAPI"
```

2. Restore dependencies:
```bash
dotnet restore
```

3. Update database connection string in `appsettings.json`

4. Run the application:
```bash
dotnet run
```

The API will be available at:
- HTTPS: `https://localhost:5001`
- HTTP: `http://localhost:5000`

### Build

```bash
dotnet build
```

### Run in Development

```bash
dotnet watch run
```

## API Endpoints

### Current Endpoints
- `GET /weatherforecast` - Sample weather forecast endpoint

### Planned Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token

#### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

#### Inquiries
- `GET /api/inquiries` - Get all inquiries
- `GET /api/inquiries/{id}` - Get inquiry by ID
- `POST /api/inquiries` - Create inquiry
- `PUT /api/inquiries/{id}` - Update inquiry
- `DELETE /api/inquiries/{id}` - Delete inquiry

#### Quotations
- `GET /api/quotations` - Get all quotations
- `GET /api/quotations/{id}` - Get quotation by ID
- `POST /api/quotations` - Create quotation
- `PUT /api/quotations/{id}` - Update quotation
- `DELETE /api/quotations/{id}` - Delete quotation

#### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/{id}` - Get project by ID
- `POST /api/projects` - Create project
- `PUT /api/projects/{id}` - Update project

#### Approvals
- `GET /api/approvals` - Get all approvals
- `POST /api/approvals` - Create approval
- `PUT /api/approvals/{id}` - Update approval status

## Configuration

### CORS Policy
To be configured to allow requests from the Next.js frontend running on `http://localhost:3000` or `http://localhost:3002`.

### Database
SQL Server connection string to be added in `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=KAMApprovedDB;Trusted_Connection=True;TrustServerCertificate=True"
  }
}
```

## Next Steps

1. Install Entity Framework Core packages
2. Create database models
3. Set up DbContext
4. Create migrations
5. Implement authentication with JWT
6. Create API controllers
7. Add business logic services
8. Configure CORS for frontend
9. Add logging and error handling
10. Implement API documentation with Swagger/OpenAPI

## Development

### Adding a New Controller

```bash
cd Controllers
# Create your controller file manually
```

### Adding Entity Framework Core

```bash
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
dotnet add package Microsoft.EntityFrameworkCore.Design
```

### Creating Migrations

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

## License

Proprietary - Parksons Packaging Ltd.
