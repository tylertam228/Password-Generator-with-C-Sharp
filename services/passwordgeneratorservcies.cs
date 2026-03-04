using System.Security.Cryptography; // .NET Core library for cryptographic operations

namespace PasswordGenerator.Services;

public class PasswordOptions
{
    // Default values for the password options
    public int Length { get; set; } = 16; // Default length of the password
    public bool IncludeUppercase { get; set; } = true; // Include uppercase letters in the password
    public bool IncludeLowercase { get; set; } = true; // Include lowercase letters in the password
    public bool IncludeNumbers { get; set; } = true; // Include numbers in the password
    public bool IncludeSymbols { get; set; } = true; // Include symbols in the password
    public string? ExcludeCharacters { get; set; } // Exclude characters from the password
}

public class PasswordResult
{
    public string Password { get; set; } = string.Empty; // The generated password
    public int Strength { get; set; } // The strength of the password
    public string StrengthLabel { get; set; } = string.Empty;
    public string SwordTier { get; set; } = string.Empty;
}

public class PasswordGeneratorService
{
    private const string Uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private const string Lowercase = "abcdefghijklmnopqrstuvwxyz";
    private const string Numbers = "0123456789";
    private const string Symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    public PasswordResult Generate(PasswordOptions options)
    {
        var charPool = BuildCharacterPool(options);
        if (charPool.Length == 0)
            throw new ArgumentException("At least one character set must be selected.");

        var length = Math.Clamp(options.Length, 4, 128);
        var password = new char[length];

        // Add guaranteed characters to the password
        var guaranteedChars = new List<char>();
        if (options.IncludeUppercase) guaranteedChars.Add(PickRandom(FilterExcluded(Uppercase, options.ExcludeCharacters))); 
        if (options.IncludeLowercase) guaranteedChars.Add(PickRandom(FilterExcluded(Lowercase, options.ExcludeCharacters)));
        if (options.IncludeNumbers) guaranteedChars.Add(PickRandom(FilterExcluded(Numbers, options.ExcludeCharacters)));
        if (options.IncludeSymbols) guaranteedChars.Add(PickRandom(FilterExcluded(Symbols, options.ExcludeCharacters)));

        for (int i = 0; i < guaranteedChars.Count && i < length; i++)
            password[i] = guaranteedChars[i];

        for (int i = guaranteedChars.Count; i < length; i++)
            password[i] = charPool[RandomNumberGenerator.GetInt32(charPool.Length)];

        Shuffle(password); // Shuffle the password to ensure randomness

        var passwordStr = new string(password);
        var strength = CalculateStrength(passwordStr, options); // Calculate the strength of the password

        return new PasswordResult
        {
            Password = passwordStr,
            Strength = strength,
            StrengthLabel = strength switch
            {
                >= 80 => "Very Strong",
                >= 60 => "Strong",
                >= 40 => "Medium",
                >= 20 => "Weak",
                _ => "Very Weak"
            },
            SwordTier = strength switch
            {
                >= 80 => "Legendary",
                >= 50 => "Diamond",
                >= 25 => "Iron",
                _ => "Wood"
            }
        };
    }

    private static string BuildCharacterPool(PasswordOptions options)
    {
        // Build the character pool based on the options
        var pool = string.Empty;
        if (options.IncludeUppercase) pool += Uppercase;
        if (options.IncludeLowercase) pool += Lowercase;
        if (options.IncludeNumbers) pool += Numbers;
        if (options.IncludeSymbols) pool += Symbols;
        return FilterExcluded(pool, options.ExcludeCharacters);
    }

    private static string FilterExcluded(string input, string? excluded)
    {
        if (string.IsNullOrEmpty(excluded)) return input;
        return new string(input.Where(c => !excluded.Contains(c)).ToArray());
    }

    private static char PickRandom(string chars)
    {
        if (chars.Length == 0) return '\0';
        return chars[RandomNumberGenerator.GetInt32(chars.Length)];
    }

    private static void Shuffle(char[] array)
    {
        for (int i = array.Length - 1; i > 0; i--)
        {
            int j = RandomNumberGenerator.GetInt32(i + 1);
            (array[i], array[j]) = (array[j], array[i]);
        }
    }

    private static int CalculateStrength(string password, PasswordOptions options)
    {
        int score = 0;
        int len = password.Length;

        score += Math.Min(len * 4, 40);

        int charsetSize = 0;
        if (options.IncludeLowercase) charsetSize += 26;
        if (options.IncludeUppercase) charsetSize += 26;
        if (options.IncludeNumbers) charsetSize += 10;
        if (options.IncludeSymbols) charsetSize += 27;

        double entropy = len * Math.Log2(Math.Max(charsetSize, 1));
        score += (int)Math.Min(entropy / 2, 40);

        int typesUsed = 0;
        if (options.IncludeUppercase) typesUsed++;
        if (options.IncludeLowercase) typesUsed++;
        if (options.IncludeNumbers) typesUsed++;
        if (options.IncludeSymbols) typesUsed++;
        score += typesUsed * 5;

        return Math.Min(score, 100);
    }
}
