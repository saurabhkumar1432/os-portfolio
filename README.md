# Portfolio OS Website

An interactive, browser-based desktop operating system that serves as a portfolio website. Built with React, TypeScript, and modern web technologies.

## 🚀 Features

- Desktop-like interface with windows, taskbar, and start menu
- Multiple applications (Projects, File Explorer, Terminal, About, etc.)
- Window management (drag, resize, minimize, maximize, snap)
- Keyboard shortcuts and accessibility support
- Responsive design for mobile and desktop
- PWA capabilities with offline support

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Animation**: Framer Motion
- **Routing**: TanStack Router
- **Testing**: Vitest + Testing Library
- **Code Quality**: ESLint + Prettier

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Run linting
npm run lint

# Format code
npm run format
```

## 🏗️ Project Structure

```
src/
├── apps/           # Application components
├── components/     # Reusable UI components
│   ├── desktop/    # Desktop-specific components
│   ├── window/     # Window management components
│   └── ui/         # Generic UI components
├── hooks/          # Custom React hooks
├── store/          # Zustand stores
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── test/           # Test utilities and setup
```

## 🧪 Testing

The project uses Vitest for unit testing with React Testing Library for component testing.

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui
```

## 📝 Development

This project follows the spec-driven development methodology. See the `.kiro/specs/portfolio-os-website/` directory for detailed requirements, design, and implementation tasks.

## 🎯 Current Status

✅ Project foundation and core infrastructure setup complete

- Vite + React + TypeScript configuration
- Tailwind CSS styling system
- ESLint + Prettier code quality tools
- Vitest testing framework
- Core dependencies (Zustand, Framer Motion, TanStack Router)
- Basic project structure and type definitions
- Initial store implementations

## 📄 License

This project is private and proprietary.
