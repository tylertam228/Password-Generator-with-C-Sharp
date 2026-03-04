# Tiger228's Weapon Forge — Password Generator

A fantasy-themed password generator built with C# and ASP.NET Core. The UI is styled as a medieval weapon forge workshop where users craft passwords by selecting magical ores and setting furnace temperature.

## Features

- **Cryptographically secure** password generation using `System.Security.Cryptography`
- **Fantasy RPG theme** — ores represent character types, swords represent password strength
- **Animated forge process** with spark particles and glowing effects
- **Responsive design** — works on desktop, tablet, and mobile
- **No data collection** — passwords are never stored or logged

## Character Types (Ores)

| Ore | Characters | Description |
|-----|-----------|-------------|
| Emberstone | A–Z | Uppercase letters |
| Frostweave Ore | a–z | Lowercase letters |
| Veridian Shard | 0–9 | Numbers |
| Voidglimmer | !@#$% | Symbols |

## Password Strength (Swords)

| Sword | Strength | Tier |
|-------|----------|------|
| Wood Sword | < 25 | Common |
| Iron Sword | 25–49 | Uncommon |
| Diamond Sword | 50–79 | Rare |
| Legendary Sword | 80+ | Legendary |

## Tech Stack

- **Backend:** C# / ASP.NET Core (Razor Pages)
- **Frontend:** HTML, CSS, vanilla JavaScript
- **Fonts:** Press Start 2P (pixel), VT323 (monospace)
- **Security:** .NET `RandomNumberGenerator` for cryptographic randomness

## Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd password.tyhstudio.com

# Run the application
dotnet run
```

The app will be available at `https://localhost:5001` (or the port shown in terminal).

## Project Structure

```
├── Pages/
│   ├── Index.cshtml          # Main forge workshop UI
│   ├── Privacy.cshtml        # Privacy policy page
│   └── Shared/_Layout.cshtml # Layout with dark theme & CRT overlay
├── services/
│   └── passwordgeneratorservcies.cs  # Password generation logic
├── wwwroot/
│   ├── css/site.css          # Dark fantasy theme styles
│   ├── js/site.js            # Forge animation & API calls
│   └── images/               # Ore, sword & character assets
├── Program.cs                # App configuration & API endpoint
└── README.md
```

## API

**POST** `/api/generate`

```json
{
  "length": 16,
  "includeUppercase": true,
  "includeLowercase": true,
  "includeNumbers": true,
  "includeSymbols": true,
  "excludeCharacters": null
}
```

Returns:

```json
{
  "password": "aB3#xY9!mK2$pQ7&",
  "strength": 85,
  "strengthLabel": "Very Strong",
  "swordTier": "Legendary"
}
```

## License

See [LICENSE](LICENSE) for details.

---

Built by **Tiger228**
