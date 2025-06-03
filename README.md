# Rick and Morty Dating Simulator

An interactive interdimensional dating simulator featuring AI-powered conversations with Rick and Morty characters. This fan project uses local storage for complete privacy and includes authentic character backstories from the Rick and Morty universe.

## Features

- **AI-Powered Conversations**: Dynamic character interactions using your own AI API keys
- **Local Storage Only**: Complete privacy - no data sent to servers
- **Character Selection**: Choose from Rick Sanchez, Morty Smith, Evil Morty, and Rick Prime
- **Affection System**: Build relationships with dynamic affection tracking
- **Origin Route**: Unlock canonical character backstories at 25% affection
- **Portal-Themed UI**: Immersive interdimensional design with animations
- **Audio Integration**: Authentic Rick and Morty sound effects and theme music
- **Save/Load System**: Multiple save slots for different relationship progressions

## Screenshots

*Coming soon - add screenshots of the application in action*

## Installation & Setup

### Prerequisites
- Node.js 18+ installed
- An AI API key (OpenRouter recommended) for character conversations

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Replikas/rickortygame2.git
   cd rickortygame2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5000`

### AI Integration Setup

1. Create an account at [OpenRouter](https://openrouter.ai/) or your preferred AI provider
2. Generate an API key
3. In the game settings, enter your API key
4. Your API key is stored locally in your browser only

## Privacy & Data

This application is designed with privacy as a core principle:

- **No server storage**: All game data is stored locally in your browser
- **No tracking**: No analytics, cookies, or user tracking
- **No data transmission**: User information never leaves your device
- **Open source**: Full transparency of all code

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion animations
- **Storage**: Browser Local Storage
- **AI Integration**: OpenRouter API (user-provided keys)
- **Audio**: HTML5 Audio with custom sound effects

## Project Structure

```
rickortygame2/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   ├── lib/            # Utility functions
│   │   └── assets/         # Images, audio, and other assets
├── server/                 # Express backend (minimal, for serving)
├── shared/                 # Shared TypeScript types
└── attached_assets/        # Game assets (images, audio)
```

## Contributing

This is a fan project created for educational and entertainment purposes. Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Legal Disclaimer

**This is an unofficial fan project created for entertainment purposes only.**

Rick and Morty and all related characters, names, marks, emblems, and images are trademarks of Adult Swim, Cartoon Network, and Dan Harmon. This project is not affiliated with, endorsed by, or sponsored by Adult Swim, Cartoon Network, Turner Broadcasting System, or any of their subsidiaries or affiliates.

All rights to the Rick and Morty intellectual property belong to their respective owners. This fan project is created under fair use principles for non-commercial, educational, and transformative purposes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter issues or have questions:

1. Check the [Issues](https://github.com/Replikas/rickortygame2/issues) page
2. Create a new issue with detailed information
3. For AI-related issues, verify your API key is correct

## Roadmap

- [ ] Additional character support
- [ ] More interactive backstory content
- [ ] Achievement system
- [ ] Mobile responsive improvements
- [ ] Additional AI model support

---

*Made with ❤️ by fans, for fans of Rick and Morty*