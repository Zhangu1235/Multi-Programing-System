# ⚙️ MultiProgOS — Multiprogramming System with Dynamic Resource Allocation

A full-stack, real-time operating system simulator built using React, Node.js, Express, and WebSocket technology. The system demonstrates how modern operating systems manage multiple processes simultaneously using dynamic CPU scheduling, memory management, and automatic resource balancing techniques.

---

# 📌 Project Overview

MultiProgOS is an advanced multiprogramming operating system simulator designed to visualize and simulate how processes are managed inside an operating system environment.

The project focuses on:
- Process creation and execution
- CPU scheduling algorithms
- Dynamic memory allocation
- Real-time system monitoring
- Resource optimization
- Bottleneck detection and rebalancing

The system provides an interactive dashboard where users can create, monitor, pause, resume, and terminate processes while observing live CPU and memory utilization.

---

# 🚀 Key Features

## 🔹 Process Management
- Create new processes dynamically
- Pause, resume, and terminate processes
- Auto-generated Process IDs (PID)
- Process status tracking
- CPU and memory usage monitoring

### Process Types
- CPU Intensive
- Memory Intensive
- Balanced
- IO Bound

---

## 🔹 CPU Scheduling Algorithms

### 1. Round Robin (RR)
- Equal CPU time distribution
- Configurable time quantum
- Fair scheduling mechanism

### 2. Priority Scheduling
- High-priority process executes first
- Preemptive scheduling support

### 3. Shortest Job First (SJF)
- Process with shortest burst time executes first
- Optimized average waiting time

---

## 🔹 Memory Management
- Simulated 4GB RAM environment
- Paging-based memory allocation
- First-fit allocation strategy
- Automatic memory reclamation
- Memory overflow prevention

---

## 🔹 Real-Time Monitoring
- Live CPU utilization graphs
- Live memory utilization graphs
- Rolling history visualization
- Real-time process table updates
- System log monitoring
- Live scheduler status indicators

---

## 🔹 Dynamic Resource Allocation
The system automatically detects bottlenecks and optimizes resources dynamically.

### CPU Optimization
If CPU usage exceeds 85%:
- Round Robin quantum is automatically reduced

### Memory Optimization
If memory usage exceeds 88%:
- Memory is reclaimed from low-priority waiting processes

---

# 🏗️ System Architecture

```bash
multiprog-system/
│
├── backend/
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── scheduler/
│   ├── models/
│   └── middleware/
│
└── frontend/
    ├── src/
    ├── pages/
    ├── components/
    ├── hooks/
    └── utils/
```

---

# 💻 Technologies Used

## Frontend Technologies
- React.js
- Tailwind CSS
- Chart.js
- JavaScript
- HTML5
- CSS3

## Backend Technologies
- Node.js
- Express.js
- WebSocket

## Additional Tools
- npm
- Nodemon
- Git & GitHub
- VS Code

---

# ⚡ WebSocket Communication

The project uses WebSocket for real-time communication between frontend and backend.

### Features
- Live state synchronization
- Auto-reconnect support
- Real-time dashboard updates
- Low-latency communication

### Example WebSocket Events

#### Receiving Data
```json
{
  "type": "state",
  "data": {
    "cpuUtilization": 67,
    "memoryUsage": 43
  }
}
```

#### Sending Data
```json
{
  "type": "create-process",
  "payload": {
    "priority": 3
  }
}
```

---

# 📡 REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/create-process` | Create process |
| DELETE | `/api/delete-process/:pid` | Delete process |
| POST | `/api/pause-process/:pid` | Pause process |
| POST | `/api/resume-process/:pid` | Resume process |
| GET | `/api/get-processes` | Fetch all processes |
| GET | `/api/system-stats` | Get system statistics |
| POST | `/api/scheduler/start` | Start scheduler |
| POST | `/api/scheduler/stop` | Stop scheduler |
| POST | `/api/scheduler/reset` | Reset system |

---

# 🧠 Core Concepts Implemented

## Operating System Concepts
- Multiprogramming
- CPU Scheduling
- Process Management
- Paging
- Dynamic Resource Allocation
- System Monitoring

## Scheduling Concepts
- Round Robin Scheduling
- Priority Scheduling
- Shortest Job First (SJF)

## Memory Concepts
- Paging
- First-Fit Allocation
- Memory Reclamation
- Resource Optimization

---

# 🎨 User Interface Features

- Dark Theme Dashboard
- Real-Time Updating Charts
- Interactive Process Table
- Dynamic Status Indicators
- Memory Visualization Grid
- Scheduler Control Panel
- Live Logs Viewer

---

# 🔄 System Workflow

1. User creates processes from frontend dashboard
2. Backend scheduler receives process requests
3. Scheduling algorithm selects process execution order
4. Memory manager allocates memory pages
5. WebSocket broadcasts live updates
6. Frontend dashboard updates automatically
7. Bottleneck detection optimizes resources dynamically

---

# 🧪 Testing Scenarios

## Basic Testing
- Create and execute multiple processes
- Pause and resume running processes
- Switch between scheduling algorithms

## Load Testing
- Add multiple processes simultaneously
- Observe CPU overload handling
- Observe automatic memory balancing

## Algorithm Comparison
- Compare RR, Priority, and SJF execution behaviors
- Analyze CPU and memory utilization

---

# 📊 Project Objectives

- Simulate real-world operating system behavior
- Demonstrate multiprogramming concepts
- Visualize scheduling algorithms interactively
- Implement dynamic resource management
- Build a real-time full-stack application

---

# 🔐 Future Enhancements

- MongoDB integration for persistence
- JWT authentication
- Multi-user support
- Docker containerization
- Kubernetes deployment
- AI-based scheduling optimization
- Cloud deployment support

---

# 👥 Team Contribution Division

## 👨‍💻 Member 1 — Frontend & UI Development
### Responsibilities
- Developed React frontend interface
- Designed dashboard layout
- Implemented charts and visualization
- Integrated WebSocket communication
- Built responsive UI using Tailwind CSS

### Modules Handled
- Dashboard.jsx
- ProcessTable.jsx
- UsageChart.jsx
- MetricCard.jsx
- StatusBadge.jsx
- SchedulerControls.jsx
- CreateProcessModal.jsx
- LogPanel.jsx

---

## ⚙️ Member 2 — Backend & API Development
### Responsibilities
- Developed Node.js + Express backend
- Implemented REST APIs
- Managed WebSocket communication
- Handled process operations
- Added middleware logging

### Modules Handled
- server.js
- routes/index.js
- controllers/
- WebSocket server
- API integration

---

## 🧠 Member 3 — Core OS Logic & Scheduling System
### Responsibilities
- Implemented scheduling algorithms
- Developed memory management logic
- Added paging simulation
- Implemented dynamic resource balancing
- Developed bottleneck detection system

### Modules Handled
- Scheduler.js
- Process.js
- MemoryManager.js
- RR Scheduling
- Priority Scheduling
- SJF Scheduling

---

# 🤝 Collaborative Contributions
All team members contributed to:
- Testing and debugging
- UI enhancements
- System integration
- Documentation
- Presentation preparation
- Final deployment setup

---

# ▶️ Installation & Setup

## Clone Repository
```bash
git clone <repository-link>
```

---

## Backend Setup
```bash
cd backend
npm install
npm run dev
```

Server runs at:
```bash
http://localhost:4000
```

---

## Frontend Setup
```bash
cd frontend
npm install
npm start
```

Frontend runs at:
```bash
http://localhost:3000
```

---

# 📚 Learning Outcomes

Through this project, we learned:
- Operating system scheduling techniques
- Real-time frontend-backend communication
- WebSocket implementation
- Memory management simulation
- Full-stack application architecture
- React hooks and state management
- Backend API integration
- Dynamic system optimization

---

# 🎯 Conclusion

MultiProgOS successfully demonstrates the working principles of a multiprogramming operating system through an interactive and real-time simulation environment. The project combines operating system concepts with modern full-stack technologies to provide an educational, scalable, and visually engaging system for understanding process scheduling, memory management, and dynamic resource allocation.

---

# 📌 Developed By
B.Tech Computer Science & Engineering Students  
Lovely Professional University

---
