export interface CodeBlock {
  language: string;
  code: string;
}

export interface Table {
  headers: string[];
  rows: string[][];
}

export interface ContentBlock {
  type: 'text' | 'code' | 'table' | 'list' | 'heading';
  text?: string;
  level?: number;
  code?: CodeBlock;
  table?: Table;
  items?: string[];
}

export interface Section {
  id: string;
  number: string;
  title: string;
  icon: string;
  blocks: ContentBlock[];
}

export const sections: Section[] = [
  {
    id: 'understanding-docker-basics',
    number: '0',
    title: 'Understanding Docker Basics',
    icon: 'Info',
    blocks: [
      { type: 'heading', level: 3, text: 'What is a Dockerfile?' },
      { type: 'text', text: 'A text file with instructions to build a Docker image. It\'s like a recipe that tells Docker exactly how to package your application.' },
      { type: 'heading', level: 3, text: 'What is a Docker Image?' },
      { type: 'text', text: 'A blueprint/template that contains your application code, dependencies, and everything needed to run it.' },
      { type: 'heading', level: 3, text: 'What is a Container?' },
      { type: 'text', text: 'A running instance of an image. Multiple containers can run from the same image.' },
      { type: 'heading', level: 3, text: 'What is Docker Compose?' },
      { type: 'text', text: 'A tool to define and run multiple containers together, making it easy to manage your entire application stack.' },
    ],
  },
  {
    id: 'step-1-create-dockerfile',
    number: '1',
    title: 'Create Dockerfile',
    icon: 'FileCode',
    blocks: [
      { type: 'heading', level: 3, text: 'Dockerfile Structure' },
      {
        type: 'code',
        code: {
          language: 'dockerfile',
          code: `# 1. START FROM A BASE IMAGE
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# 2. BUILD STAGE - Compile your code
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["src/LSEA.Web/LSEA.Web.csproj", "src/LSEA.Web/"]
COPY ["src/LSEA.Application/LSEA.Application.csproj", "src/LSEA.Application/"]
COPY ["src/LSEA.Domain/LSEA.Domain.csproj", "src/LSEA.Domain/"]
COPY ["src/LSEA.Infrastructure/LSEA.Infrastructure.csproj", "src/LSEA.Infrastructure/"]
RUN dotnet restore "./src/LSEA.Web/LSEA.Web.csproj"
COPY . .
WORKDIR "/src/src/LSEA.Web"
RUN dotnet build "./LSEA.Web.csproj" -c $BUILD_CONFIGURATION -o /app/build

# 3. PUBLISH STAGE - Prepare for deployment
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./LSEA.Web.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# 4. RUNTIME STAGE - Create final image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
USER root
RUN mkdir -p /app/wwwroot/uploads && chown -R 1654:1654 /app/wwwroot/uploads
USER 1654
ENTRYPOINT ["dotnet", "LSEA.Web.dll"]`,
        },
      },
      { type: 'heading', level: 3, text: 'Dockerfile Explained in Short' },
      {
        type: 'table',
        table: {
          headers: ['Section', 'Purpose'],
          rows: [
            ['`FROM`', 'Start with a base image (Ubuntu, Alpine, .NET, etc.)'],
            ['`WORKDIR`', 'Set the working directory inside container'],
            ['`COPY`', 'Copy files from your PC into container'],
            ['`RUN`', 'Execute commands (install packages, build code)'],
            ['`EXPOSE`', 'Tell Docker which ports the app uses'],
            ['`ENV`', 'Set environment variables'],
            ['`VOLUME`', 'Mark directories for persistent storage'],
            ['`ENTRYPOINT`', 'Command to run when container starts'],
          ],
        },
      },
      { type: 'heading', level: 3, text: 'Multi-Stage Build (What We Use)' },
      {
        type: 'code',
        code: {
          language: 'text',
          code: `Stage 1: BUILD     → Compiles your code (large, includes SDK)
   ↓
Stage 2: PUBLISH   → Prepares compiled code
   ↓
Stage 3: FINAL     → Only runtime needed (small, lightweight)`,
        },
      },
      { type: 'text', text: 'Benefit: Final image is small (only runtime, no build tools)' },
    ],
  },
  {
    id: 'step-2-build-docker-image',
    number: '2',
    title: 'Build Docker Image',
    icon: 'Package',
    blocks: [
      { type: 'heading', level: 3, text: 'What Happens When You Build?' },
      {
        type: 'code',
        code: {
          language: 'text',
          code: `Your PC                          Docker Daemon
├─ Source Code             ──→   1. Read Dockerfile
├─ Dockerfile              ──→   2. Execute each instruction
└─ Project Files           ──→   3. Create image layers
                                 4. Store image locally`,
        },
      },
      { type: 'heading', level: 3, text: 'Build Command (Windows - PowerShell)' },
      {
        type: 'code',
        code: {
          language: 'powershell',
          code: `# Navigate to project root (where Dockerfile is)
cd "D:\\Software Developement\\LSEA.MembershipLicense"

# Build the image
docker build -t lseamembershiplicense .

# Explanation:
# docker build      = Build an image
# -t image-name     = Tag with name (lowercase required)
# .                 = Use Dockerfile in current directory`,
        },
      },
      { type: 'heading', level: 3, text: 'Build Command (Linux/Mac)' },
      {
        type: 'code',
        code: {
          language: 'bash',
          code: `cd ~/projects/LSEA.MembershipLicense
docker build -t lseamembershiplicense .`,
        },
      },
      { type: 'heading', level: 3, text: 'Verify Image Was Created' },
      { type: 'text', text: 'Windows (PowerShell):' },
      {
        type: 'code',
        code: {
          language: 'powershell',
          code: `docker images | Select-String lseamembershiplicense`,
        },
      },
      { type: 'text', text: 'Linux/Mac (Bash):' },
      {
        type: 'code',
        code: {
          language: 'bash',
          code: `docker images | grep lseamembershiplicense`,
        },
      },
      { type: 'text', text: 'Expected Output:' },
      {
        type: 'code',
        code: {
          language: 'text',
          code: `REPOSITORY                 TAG       IMAGE ID      CREATED      SIZE
lseamembershiplicense      latest    abc123def     2 hours ago  250MB`,
        },
      },
    ],
  },
  {
    id: 'step-3-push-to-docker-hub',
    number: '3',
    title: 'Push to Docker Hub',
    icon: 'CloudUpload',
    blocks: [
      { type: 'heading', level: 3, text: 'What is Docker Hub?' },
      { type: 'text', text: 'Cloud registry where you store and share Docker images (like GitHub for code).' },
      { type: 'heading', level: 3, text: 'Step 3.1: Create Docker Hub Account' },
      { type: 'list', items: [
        'Go to https://hub.docker.com',
        'Click "Sign Up"',
        'Create account (username = naytunlinn)',
        'Verify email',
      ]},
      { type: 'heading', level: 3, text: 'Step 3.2: Create Repository' },
      { type: 'list', items: [
        'Log in to Docker Hub',
        'Click "Create Repository"',
        'Name: lseamembershiplicense',
        'Click "Create"',
      ]},
      { type: 'heading', level: 3, text: 'Step 3.3: Login from Your PC' },
      { type: 'text', text: 'Windows (PowerShell):' },
      {
        type: 'code',
        code: {
          language: 'powershell',
          code: `docker login
# Enter username: naytunlinn
# Enter password: (your password)
# Result: Login Succeeded`,
        },
      },
      { type: 'text', text: 'Linux/Mac (Bash):' },
      {
        type: 'code',
        code: {
          language: 'bash',
          code: `docker login
# Enter username: naytunlinn
# Enter password: (your password)`,
        },
      },
      { type: 'heading', level: 3, text: 'Step 3.4: Tag Image with Registry' },
      { type: 'text', text: 'Before pushing, rename image to include registry (Docker Hub username):' },
      { type: 'text', text: 'Windows & Linux/Mac (same command):' },
      {
        type: 'code',
        code: {
          language: 'bash',
          code: `docker tag lseamembershiplicense:latest naytunlinn/lseamembershiplicense:latest`,
        },
      },
      { type: 'text', text: 'Explanation:' },
      {
        type: 'code',
        code: {
          language: 'text',
          code: `lseamembershiplicense:latest        → Local image
naytunlinn/lseamembershiplicense   → Docker Hub location
:latest                              → Version tag`,
        },
      },
      { type: 'heading', level: 3, text: 'Step 3.5: Push to Docker Hub' },
      {
        type: 'code',
        code: {
          language: 'bash',
          code: `docker push naytunlinn/lseamembershiplicense:latest`,
        },
      },
      { type: 'text', text: 'What happens:' },
      { type: 'list', items: [
        'Uploads image layers to Docker Hub',
        'Takes 2-10 minutes first time',
        'Shows progress of each layer',
      ]},
      { type: 'text', text: 'Verify on Docker Hub:' },
      { type: 'list', items: [
        'Go to https://hub.docker.com/r/naytunlinn/lseamembershiplicense',
        'You should see your image listed',
      ]},
    ],
  },
  {
    id: 'step-4-create-docker-compose',
    number: '4',
    title: 'Create Docker Compose',
    icon: 'Layers',
    blocks: [
      { type: 'heading', level: 3, text: 'What is docker-compose.yml?' },
      { type: 'text', text: 'Configuration file that defines which images to use, how to connect services, port mappings, volumes for data persistence, and environment variables.' },
      { type: 'heading', level: 3, text: 'Create docker-compose.yml' },
      { type: 'text', text: 'File location: D:\\Software Developement\\LSEA.MembershipLicense\\docker-compose.yml' },
      {
        type: 'code',
        code: {
          language: 'yaml',
          code: `services:
  lsea-web:
    image: naytunlinn/lseamembershiplicense:latest
    container_name: lsea-membership-web
    ports:
      - "\${WEB_PORT_HTTP}:8080"      # Maps port from .env
      - "\${WEB_PORT_HTTPS}:8443"
    environment:
      - ConnectionStrings__DefaultConnection=Server=\${DB_SERVER},\${DB_PORT};Database=LSEA;User Id=sa;Password=\${DB_PASSWORD};MultipleActiveResultSets=true;TrustServerCertificate=True;Encrypt=False
    volumes:
      - ./data-protection-keys:/home/app/.aspnet/DataProtection-Keys
      - ./uploads:/app/wwwroot/uploads
    networks:
      - lsea-network
    restart: unless-stopped

networks:
  lsea-network:
    driver: bridge`,
        },
      },
      { type: 'heading', level: 3, text: 'docker-compose.yml Explained' },
      {
        type: 'table',
        table: {
          headers: ['Key', 'Purpose'],
          rows: [
            ['`services:`', 'Define containers to run'],
            ['`image:`', 'Which Docker image to use'],
            ['`container_name:`', 'Name of running container'],
            ['`ports:`', 'Map host ports to container ports'],
            ['`environment:`', 'Set environment variables'],
            ['`volumes:`', 'Mount directories (persistent storage)'],
            ['`networks:`', 'Connect containers together'],
            ['`restart:`', 'Auto-restart policy'],
          ],
        },
      },
    ],
  },
  {
    id: 'step-5-data-persistence',
    number: '5',
    title: 'Data Persistence with Volumes',
    icon: 'HardDrive',
    blocks: [
      { type: 'heading', level: 3, text: 'What is a Volume?' },
      { type: 'text', text: 'A folder on your PC that stays connected to a container even after it stops/restarts.' },
      { type: 'heading', level: 3, text: 'Three Types of Storage' },
      {
        type: 'table',
        table: {
          headers: ['Type', 'Purpose', 'Example'],
          rows: [
            ['**Bind Mount**', 'Link PC folder to container', '`./uploads:/app/wwwroot/uploads`'],
            ['**Named Volume**', 'Docker manages storage', '`my-data:/app/data`'],
            ['**tmpfs**', 'RAM (lost when stopped)', 'For temporary data'],
          ],
        },
      },
      { type: 'heading', level: 3, text: 'Volumes in docker-compose.yml' },
      {
        type: 'code',
        code: {
          language: 'yaml',
          code: `volumes:
  - ./data-protection-keys:/home/app/.aspnet/DataProtection-Keys
  # Host folder          → Container folder
  # (PC disk)              (inside container)
  
  - ./uploads:/app/wwwroot/uploads
  # All files uploaded here stay on your PC`,
        },
      },
      { type: 'heading', level: 3, text: 'Folder Structure on Your PC' },
      {
        type: 'code',
        code: {
          language: 'text',
          code: `D:\\Software Developement\\LSEA.MembershipLicense\\
├── data-protection-keys/      ← Encryption keys (persisted)
├── uploads/                   ← User files (persisted)
├── docker-compose.yml
├── Dockerfile
└── src/`,
        },
      },
      { type: 'heading', level: 3, text: 'How Data Persists' },
      {
        type: 'code',
        code: {
          language: 'text',
          code: `Before Container Stops:
  Container writes to /app/wwwroot/uploads
  ↓
  (mapped to PC folder ./uploads)
  
After Container Stops:
  PC folder ./uploads still has data
  
When Container Restarts:
  New container mounts same ./uploads folder
  Data is available again`,
        },
      },
    ],
  },
  {
    id: 'step-6-environment-files',
    number: '6',
    title: 'Environment Files',
    icon: 'FileText',
    blocks: [
      { type: 'heading', level: 3, text: 'Why Environment Files?' },
      { type: 'text', text: 'Keep sensitive data (passwords, IPs) out of source code.' },
      { type: 'heading', level: 3, text: 'Create .env.local (Local Development)' },
      {
        type: 'code',
        code: {
          language: 'env',
          code: `WEB_PORT_HTTP=8080
WEB_PORT_HTTPS=8081
DB_SERVER=192.168.1.25
DB_PORT=30000
DB_PASSWORD=sasa`,
        },
      },
      { type: 'heading', level: 3, text: 'Create .env.linux (Linux Server)' },
      {
        type: 'code',
        code: {
          language: 'env',
          code: `WEB_PORT_HTTP=80
WEB_PORT_HTTPS=443
DB_SERVER=192.168.1.100
DB_PORT=8433
DB_PASSWORD=sasa`,
        },
      },
      { type: 'heading', level: 3, text: 'Create .env.example (For Git)' },
      {
        type: 'code',
        code: {
          language: 'env',
          code: `# Copy this file to .env and fill in your values
WEB_PORT_HTTP=8080
WEB_PORT_HTTPS=8081
DB_SERVER=your_database_ip
DB_PORT=your_database_port
DB_PASSWORD=your_password`,
        },
      },
      { type: 'heading', level: 3, text: 'Add to .gitignore (Don\'t commit secrets!)' },
      {
        type: 'code',
        code: {
          language: 'text',
          code: `.env
.env.local
.env.linux
.env.*.local`,
        },
      },
    ],
  },
  {
    id: 'step-7-running-compose',
    number: '7',
    title: 'Running Compose',
    icon: 'Play',
    blocks: [
      { type: 'heading', level: 3, text: 'Copy Environment File to Active .env' },
      { type: 'text', text: 'Windows (PowerShell):' },
      {
        type: 'code',
        code: {
          language: 'powershell',
          code: `cd "D:\\Software Developement\\LSEA.MembershipLicense"

# For local development
copy .env.local .env

# For Linux server (after SSH)
copy .env.linux .env`,
        },
      },
      { type: 'text', text: 'Linux/Mac (Bash):' },
      {
        type: 'code',
        code: {
          language: 'bash',
          code: `cd ~/projects/LSEA.MembershipLicense

# For local development
cp .env.local .env

# For Linux server
cp .env.linux .env`,
        },
      },
      { type: 'heading', level: 3, text: 'Verify .env File' },
      { type: 'text', text: 'Windows (PowerShell):' },
      {
        type: 'code',
        code: { language: 'powershell', code: `type .env` },
      },
      { type: 'text', text: 'Linux/Mac (Bash):' },
      {
        type: 'code',
        code: { language: 'bash', code: `cat .env` },
      },
      { type: 'heading', level: 3, text: 'Start Compose (Foreground)' },
      {
        type: 'code',
        code: { language: 'bash', code: `docker compose up` },
      },
      { type: 'text', text: 'What happens: Downloads image if needed, starts all services, shows all logs in terminal, stops when you press Ctrl+C.' },
      { type: 'heading', level: 3, text: 'Start Compose (Background)' },
      {
        type: 'code',
        code: { language: 'bash', code: `docker compose up -d` },
      },
      { type: 'text', text: 'What happens: Starts all services, returns immediately to terminal, services run in background.' },
      { type: 'heading', level: 3, text: 'Start with Latest Image' },
      {
        type: 'code',
        code: { language: 'bash', code: `docker compose up -d --pull always` },
      },
      { type: 'text', text: 'What happens: Always pulls latest image from Docker Hub. Useful when your Linux user deploys updates.' },
    ],
  },
  {
    id: 'step-8-view-logs',
    number: '8',
    title: 'View Logs',
    icon: 'ScrollText',
    blocks: [
      { type: 'heading', level: 3, text: 'View All Logs (One-time)' },
      {
        type: 'code',
        code: { language: 'bash', code: `docker compose logs` },
      },
      { type: 'heading', level: 3, text: 'Follow Logs (Real-time)' },
      { type: 'text', text: 'Windows & Linux (same):' },
      {
        type: 'code',
        code: { language: 'bash', code: `docker logs -f lsea-membership-web` },
      },
      { type: 'heading', level: 3, text: 'View Last 50 Lines' },
      {
        type: 'code',
        code: { language: 'bash', code: `docker logs --tail 50 lsea-membership-web` },
      },
      { type: 'heading', level: 3, text: 'Follow Logs from All Services' },
      {
        type: 'code',
        code: { language: 'bash', code: `docker compose logs -f` },
      },
      { type: 'heading', level: 3, text: 'Search Logs for Errors' },
      { type: 'text', text: 'Windows (PowerShell):' },
      {
        type: 'code',
        code: { language: 'powershell', code: `docker logs lsea-membership-web | Select-String "error"` },
      },
      { type: 'text', text: 'Linux/Mac (Bash):' },
      {
        type: 'code',
        code: { language: 'bash', code: `docker logs lsea-membership-web | grep error` },
      },
    ],
  },
  {
    id: 'step-9-update-refresh',
    number: '9',
    title: 'Update & Refresh',
    icon: 'RefreshCw',
    blocks: [
      { type: 'heading', level: 3, text: 'When You Make Code Changes' },
      { type: 'text', text: 'Step 1: Rebuild Image' },
      {
        type: 'code',
        code: { language: 'bash', code: `docker build -t lseamembershiplicense .` },
      },
      { type: 'text', text: 'Step 2: Tag for Docker Hub' },
      {
        type: 'code',
        code: { language: 'bash', code: `docker tag lseamembershiplicense:latest naytunlinn/lseamembershiplicense:latest` },
      },
      { type: 'text', text: 'Step 3: Push to Docker Hub' },
      {
        type: 'code',
        code: { language: 'bash', code: `docker push naytunlinn/lseamembershiplicense:latest` },
      },
      { type: 'text', text: 'Step 4: Stop Old Containers' },
      {
        type: 'code',
        code: { language: 'bash', code: `docker compose down` },
      },
      { type: 'text', text: 'Step 5: Start with New Image' },
      {
        type: 'code',
        code: { language: 'bash', code: `docker compose up -d --pull always` },
      },
      { type: 'heading', level: 3, text: 'Complete Update Workflow (Combined)' },
      { type: 'text', text: 'Windows (PowerShell):' },
      {
        type: 'code',
        code: {
          language: 'powershell',
          code: `# Make code changes in your IDE

# Rebuild and deploy
docker build -t lseamembershiplicense .
docker tag lseamembershiplicense:latest naytunlinn/lseamembershiplicense:latest
docker push naytunlinn/lseamembershiplicense:latest

# Refresh containers
docker compose down
docker compose up -d --pull always

# Verify
docker logs -f lsea-membership-web`,
        },
      },
      { type: 'text', text: 'Linux/Mac (Bash):' },
      {
        type: 'code',
        code: {
          language: 'bash',
          code: `# Same commands
docker build -t lseamembershiplicense .
docker tag lseamembershiplicense:latest naytunlinn/lseamembershiplicense:latest
docker push naytunlinn/lseamembershiplicense:latest

docker compose down
docker compose up -d --pull always

docker logs -f lsea-membership-web`,
        },
      },
    ],
  },
  {
    id: 'windows-vs-linux',
    number: '10',
    title: 'Windows vs Linux Commands',
    icon: 'Command',
    blocks: [
      { type: 'heading', level: 3, text: 'File Operations' },
      {
        type: 'table',
        table: {
          headers: ['Task', 'Windows (PowerShell)', 'Linux/Mac (Bash)'],
          rows: [
            ['Copy file', '`copy .env.local .env`', '`cp .env.local .env`'],
            ['View file', '`type .env`', '`cat .env`'],
            ['Edit file', '`notepad .env`', '`nano .env`'],
            ['List files', '`dir`', '`ls -la`'],
            ['Navigate folder', '`cd D:\\path`', '`cd ~/path`'],
          ],
        },
      },
      { type: 'heading', level: 3, text: 'Docker Commands (Same Everywhere)' },
      {
        type: 'code',
        code: {
          language: 'bash',
          code: `# These commands are identical on Windows, Linux, Mac
docker build -t image:tag .
docker push user/image:tag
docker compose up -d
docker logs -f container-name
docker ps
docker inspect container-name`,
        },
      },
      { type: 'heading', level: 3, text: 'Finding Ports/Services' },
      { type: 'text', text: 'Windows (PowerShell):' },
      {
        type: 'code',
        code: { language: 'powershell', code: `# Check if port is listening\nnetstat -ano | findstr :8080` },
      },
      { type: 'text', text: 'Linux/Mac (Bash):' },
      {
        type: 'code',
        code: { language: 'bash', code: `netstat -tuln | grep 8080` },
      },
      { type: 'heading', level: 3, text: 'SSH to Linux Server' },
      { type: 'text', text: 'Windows & Linux/Mac (same):' },
      {
        type: 'code',
        code: { language: 'bash', code: `ssh -p 22958 username@192.168.1.100\n# Enter password` },
      },
    ],
  },
  {
    id: 'step-11-running-sql-scripts',
    number: '11',
    title: 'Running SQL Scripts on Linux',
    icon: 'Database',
    blocks: [
      { type: 'heading', level: 3, text: 'Why Run SQL Scripts?' },
      { type: 'text', text: 'Initialize database with schema, seed data, or configure SQL Server settings.' },
      { type: 'heading', level: 3, text: 'Option 1: Run Script During Container Startup' },
      { type: 'text', text: 'Create setup-database.sql:' },
      {
        type: 'code',
        code: {
          language: 'sql',
          code: `IF DB_ID('LSEA') IS NULL
BEGIN
    CREATE DATABASE LSEA;
END
GO

USE LSEA
GO

-- Your schema here
CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Email NVARCHAR(255) NOT NULL,
    Name NVARCHAR(255) NOT NULL
)
GO`,
        },
      },
      { type: 'text', text: 'Update docker-compose.yml to include SQL Server:' },
      {
        type: 'code',
        code: {
          language: 'yaml',
          code: `services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: lsea-mssql
    environment:
      SA_PASSWORD: "sasa"
      ACCEPT_EULA: "Y"
    ports:
      - "1433:1433"
    volumes:
      - ./setup-database.sql:/setup-database.sql
      - sqlserver-data:/var/opt/mssql
    networks:
      - lsea-network

volumes:
  sqlserver-data:

networks:
  lsea-network:
    driver: bridge`,
        },
      },
      { type: 'heading', level: 3, text: 'Option 2: Run Script Manually' },
      { type: 'text', text: 'After container is running — Windows (PowerShell):' },
      {
        type: 'code',
        code: {
          language: 'powershell',
          code: `# Execute SQL script
sqlcmd -S 192.168.1.100,8433 -U sa -P sasa -i setup-database.sql

# Or run a query directly
sqlcmd -S 192.168.1.100,8433 -U sa -P sasa -Q "SELECT @@VERSION"`,
        },
      },
      { type: 'text', text: 'Linux/Mac (Bash):' },
      {
        type: 'code',
        code: {
          language: 'bash',
          code: `sqlcmd -S 192.168.1.100,8433 -U sa -P sasa -i setup-database.sql
sqlcmd -S 192.168.1.100,8433 -U sa -P sasa -Q "SELECT @@VERSION"`,
        },
      },
      { type: 'heading', level: 3, text: 'Option 3: Use Docker Exec' },
      {
        type: 'code',
        code: {
          language: 'bash',
          code: `# Copy script into container and execute
docker cp setup-database.sql lsea-mssql:/
docker exec lsea-mssql /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P sasa -i /setup-database.sql`,
        },
      },
    ],
  },
  {
    id: 'quick-reference',
    number: '12',
    title: 'Quick Reference Summary',
    icon: 'Zap',
    blocks: [
      { type: 'heading', level: 3, text: 'Local Development (Day-to-Day)' },
      {
        type: 'code',
        code: {
          language: 'bash',
          code: `# Setup (first time)
copy .env.local .env
docker compose up -d

# View logs
docker logs -f lsea-membership-web

# Make changes to code, then:
docker build -t lseamembershiplicense .
docker compose down
docker compose up -d`,
        },
      },
      { type: 'heading', level: 3, text: 'Deploy to Docker Hub' },
      {
        type: 'code',
        code: {
          language: 'bash',
          code: `docker build -t lseamembershiplicense .
docker tag lseamembershiplicense:latest naytunlinn/lseamembershiplicense:latest
docker push naytunlinn/lseamembershiplicense:latest`,
        },
      },
      { type: 'heading', level: 3, text: 'Linux Server Deployment' },
      {
        type: 'code',
        code: {
          language: 'bash',
          code: `# SSH into server
ssh -p 22958 user@server-ip

# Setup
copy .env.linux .env  # or: cp .env.linux .env

# Start
docker compose up -d --pull always

# Monitor
docker logs -f lsea-membership-web`,
        },
      },
      { type: 'heading', level: 3, text: 'Check Data Persistence' },
      {
        type: 'code',
        code: {
          language: 'bash',
          code: `# View uploaded files (on your PC or server)
ls ./uploads              # Linux/Mac
dir .\\uploads             # Windows PowerShell

# View encryption keys
ls ./data-protection-keys # Linux/Mac
dir .\\data-protection-keys # Windows PowerShell`,
        },
      },
      { type: 'heading', level: 3, text: 'Stop Everything' },
      {
        type: 'code',
        code: {
          language: 'bash',
          code: `docker compose down        # Stops containers, keeps volumes
docker compose down -v     # Stops AND deletes volumes (data lost!)`,
        },
      },
    ],
  },
  {
    id: 'common-issues',
    number: '13',
    title: 'Common Issues & Fixes',
    icon: 'AlertTriangle',
    blocks: [
      {
        type: 'table',
        table: {
          headers: ['Issue', 'Command', 'Fix'],
          rows: [
            ["Can't connect to database", '`docker logs lsea-membership-web`', 'Check DB_SERVER, DB_PORT in .env'],
            ['Port already in use', '`netstat -ano \\| findstr :8080`', 'Change WEB_PORT_HTTP in .env'],
            ['Old image running', '`docker compose up -d --pull always`', 'Force latest image pull'],
            ['Lost data after stop', '`docker compose down`', 'Use `docker compose down` (not `-v`)'],
            ['Slow rebuild', '`docker build --no-cache`', 'Force rebuild without layer cache'],
          ],
        },
      },
    ],
  },
  {
    id: 'file-checklist',
    number: '14',
    title: 'File Checklist',
    icon: 'CheckSquare',
    blocks: [
      { type: 'text', text: 'After completing all steps, you should have:' },
      {
        type: 'code',
        code: {
          language: 'text',
          code: `D:\\Software Developement\\LSEA.MembershipLicense\\
├── Dockerfile                          ← Build instructions
├── docker-compose.yml                  ← Service definitions
├── .env.local                          ← Local development config
├── .env.linux                          ← Linux server config
├── .env.example                        ← Template (safe for git)
├── .dockerignore                       ← Skip files during build
├── .gitignore                          ← Don't commit secrets
├── data-protection-keys/               ← Persisted encryption keys
├── uploads/                            ← Persisted user files
└── src/                                ← Your source code`,
        },
      },
    ],
  },
  {
    id: 'next-steps',
    number: '15',
    title: 'Next Steps',
    icon: 'ArrowRight',
    blocks: [
      { type: 'list', items: [
        '**Test locally:** `docker compose up -d` and access http://localhost:8080',
        '**Push to Docker Hub:** `docker push naytunlinn/lseamembershiplicense:latest`',
        '**Deploy to Linux:** Copy docker-compose.yml to server, set .env.linux, run `docker compose up -d --pull always`',
        '**Monitor:** Use `docker logs -f` to watch for issues',
        '**Update cycle:** Rebuild → Push → Pull on server → Restart',
      ]},
    ],
  },
];
