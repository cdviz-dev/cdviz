# TOML Configuration Guide

CDviz Collector uses TOML (Tom's Obvious Minimal Language) for configuration. This guide covers the essential TOML syntax patterns you'll need to understand when configuring the collector.

## Basic TOML Syntax

### Key-Value Pairs

```toml
# Simple values
enabled = true
port = 8080
host = "localhost"
polling_interval = "30s"
```

### Comments

```toml
# This is a comment
enabled = true  # Inline comment
```

## Tables (Sections)

### Basic Tables

Tables represent configuration sections:

```toml
[server]
host = "0.0.0.0"
port = 8080

[logging]
level = "info"
format = "json"
```

### Nested Tables

Use dot notation for nested sections:

```toml
[database.connection]
host = "localhost"
port = 5432

[database.pool]
max_size = 10
timeout = "30s"
```

## Arrays

### Simple Arrays

```toml
# Array of strings
allowed_hosts = ["api.example.com", "webhook.example.com"]

# Array of patterns
file_patterns = ["*.json", "*.csv", "*.log"]

# Array of numbers
retry_intervals = [1, 2, 5, 10]
```

### Multi-line Arrays

For better readability:

```toml
file_patterns = [
    "*.json",
    "*.csv",
    "*.log",
    "data/*.txt"
]
```

## Inline Tables vs Table Sections

### Inline Tables (Single Line)

Good for simple configurations:

```toml
# Simple inline table
server = { host = "localhost", port = 8080 }

# Connection details
database = { host = "localhost", port = 5432, name = "mydb" }
```

### Table Sections (Multi-line)

Better for complex configurations:

```toml
# Instead of long inline table, use sections
[database.connection]
host = "localhost"
port = 5432
username = "admin"
password = "secret"
database = "myapp"
```

## Arrays of Tables

### Double Bracket Syntax `[[]]`

Used for repeated configurations like multiple servers or database connections:

```toml
# Multiple server configurations
[[servers]]
name = "web-server"
host = "localhost"
port = 8080

[[servers]]
name = "api-server"
host = "localhost"
port = 8081

# Each [[servers]] entry creates a new item in the servers array
```

## Common Mistakes and Solutions

### ❌ Wrong: Mixing Inline and Section Syntax

```toml
# Don't mix these approaches
[app.config]
name = "myapp"
database = { host = "localhost", port = 5432 }

[app.config.database]  # Conflicts with inline above
username = "admin"
```

### ✅ Correct: Choose One Approach

```toml
# Option 1: All inline
[app.config]
name = "myapp"
database = { host = "localhost", port = 5432, username = "admin" }

# Option 2: All sections
[app.config]
name = "myapp"

[app.config.database]
host = "localhost"
port = 5432
username = "admin"
```

### ❌ Wrong: Forgetting Double Brackets for Arrays

```toml
# Wrong - creates separate tables instead of array
[servers.web]
name = "web-server"

[servers.web]  # Overwrites previous!
name = "api-server"
```

### ✅ Correct: Use Double Brackets for Array of Tables

```toml
# Correct - creates array of server configurations
[[servers]]
name = "web-server"

[[servers]]
name = "api-server"
```

### ❌ Wrong: Incorrect String Escaping

```toml
# Wrong - unescaped backslashes
pattern = "^Bearer [A-Za-z0-9\-_]+"

# Wrong - unescaped quotes
value = "He said "hello""
```

### ✅ Correct: Proper String Escaping

```toml
# Correct - escaped backslashes
pattern = "^Bearer [A-Za-z0-9\\-_]+"

# Correct - escaped quotes
value = "He said \"hello\""

# Alternative - use single quotes when possible
pattern = '^Bearer [A-Za-z0-9\-_]+'
```

## Validation Tips

### Check TOML Syntax

Use online TOML validators or tools:

```bash
# Check syntax with online TOML validators
# Visit: https://www.toml-lint.com/ or https://taplo.tamasfe.dev/

# Many editors have TOML syntax highlighting
# VS Code, Vim, Emacs, etc. support TOML validation
```

## Best Practices

### 1. **Use Consistent Indentation**

```toml
# Good - consistent 4-space indentation in multi-line arrays
file_patterns = [
    "*.json",
    "*.csv",
    "*.log"
]
```

### 2. **Choose Appropriate Syntax for Complexity**

```toml
# Simple values - use inline tables
server = { host = "localhost", port = 8080 }

# Complex values - use table sections
[database]
host = "localhost"
port = 5432
username = "admin"
password = "secret"
pool_size = 10
```

### 3. **Group Related Configuration**

```toml
# Group all server configurations together
[servers.web]
host = "localhost"
port = 8080

[servers.api]
host = "localhost"
port = 8081

# Group all database configurations together
[database.primary]
host = "db1.example.com"

[database.replica]
host = "db2.example.com"
```

### 4. **Use Comments for Clarity**

```toml
# Web server configuration
[server]
host = "0.0.0.0"  # Listen on all interfaces
port = 8080       # HTTP port

# Database connection settings
[database]
host = "localhost"
port = 5432
username = "app_user"
password = "secret"  # Set via environment variable
```

## Related

- [Configuration Reference](./configuration.md) - Complete CDviz Collector configuration options
- [Header Authentication](./header-authentication.md) - Using the map format for headers
- [Header Validation](./header-validation.md) - Header validation configuration
- [TOML Specification](https://toml.io/) - Official TOML language specification
