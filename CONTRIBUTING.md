# Contributing to Rick and Morty Dating Simulator

Thank you for your interest in contributing to this fan project! This guide will help you get started.

## Code of Conduct

This project is created for entertainment and educational purposes. We welcome contributions that:

- Enhance the gaming experience
- Improve code quality and performance
- Add new features that fit the Rick and Morty theme
- Fix bugs and improve stability
- Improve documentation

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Git installed
- Basic knowledge of React, TypeScript, and Express

### Setup Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/rickortygame2.git
   cd rickortygame2
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start development server**:
   ```bash
   npm run dev
   ```

## Project Structure

```
rickortygame2/
├── client/src/
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── context/           # React context providers
│   ├── lib/               # Utility functions
│   └── hooks/             # Custom React hooks
├── server/                # Express backend
├── shared/                # Shared TypeScript types
└── attached_assets/       # Game assets
```

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow existing naming conventions
- Use functional components with hooks
- Keep components small and focused
- Write self-documenting code

### Component Guidelines

- Use shadcn/ui components when possible
- Implement proper error boundaries
- Include loading states for async operations
- Make components accessible (ARIA labels, keyboard navigation)

### State Management

- Use React Context for global state
- Local storage for data persistence
- Keep state minimal and normalized

### Testing

Before submitting, ensure:
- All features work as expected
- No console errors in development
- Local storage functions properly
- UI is responsive on mobile devices

## Types of Contributions

### Bug Fixes

1. Create an issue describing the bug
2. Include steps to reproduce
3. Submit a PR with the fix
4. Include tests if applicable

### New Features

1. Discuss the feature in an issue first
2. Ensure it fits the project's scope
3. Implement with proper TypeScript types
4. Update documentation if needed

### Documentation

- Improve README clarity
- Add code comments
- Update deployment guides
- Create user guides

## Submission Process

### Pull Request Guidelines

1. **Create a branch** from main:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** with clear, focused commits

3. **Test thoroughly** in development mode

4. **Submit PR** with:
   - Clear description of changes
   - Screenshots for UI changes
   - Reference to related issues

### Commit Message Format

Use clear, descriptive commit messages:
```
feat: add new character dialogue system
fix: resolve audio playback issues on mobile
docs: update installation instructions
style: improve button hover animations
```

## Character and Content Guidelines

### Canon Compliance

- Stay true to Rick and Morty character personalities
- Use authentic quotes and references when possible
- Maintain the show's humor and tone
- Respect the established universe rules

### Content Standards

- Keep content appropriate for the target audience
- Avoid offensive or discriminatory material
- Maintain the satirical and sci-fi nature of the show
- Include proper Adult Swim disclaimers

## Technical Considerations

### Performance

- Optimize images and audio assets
- Implement proper lazy loading
- Minimize bundle size
- Use efficient React patterns

### Accessibility

- Include alt text for images
- Provide keyboard navigation
- Use semantic HTML elements
- Test with screen readers

### Privacy

- Maintain local storage architecture
- Never transmit user data to servers
- Respect user privacy preferences
- Document data handling clearly

## Legal Considerations

This is a fan project operating under fair use principles:

- All Rick and Morty content belongs to Adult Swim/Dan Harmon
- Contributions must be original or properly licensed
- No commercial use of copyrighted material
- Include proper attribution for third-party assets

## Getting Help

- Check existing issues for similar problems
- Join discussions in issue comments
- Ask questions in pull request reviews
- Refer to the project documentation

## Recognition

Contributors will be recognized in:
- Project README
- Release notes for significant contributions
- GitHub contributor list

## Development Tips

### Local Storage Testing

```javascript
// Clear local storage for testing
localStorage.clear();

// View current game state
console.log(JSON.parse(localStorage.getItem('rickMortyGame_gameState')));
```

### Component Development

- Use the provided UI components from shadcn
- Follow the existing animation patterns
- Test components in isolation
- Maintain consistent styling

### Audio Integration

- Use the existing audio utility functions
- Test audio on multiple devices
- Provide fallbacks for audio failures
- Respect user volume preferences

## Release Process

1. Features merged to main branch
2. Version number updated in package.json
3. Release notes created
4. GitHub release tagged
5. Deployment to hosting platforms

Thank you for contributing to this Rick and Morty fan project!