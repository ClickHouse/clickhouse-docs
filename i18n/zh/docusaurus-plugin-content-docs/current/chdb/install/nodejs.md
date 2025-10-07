---
'title': 'chDB for Node.js'
'sidebar_label': 'Node.js'
'slug': '/chdb/install/nodejs'
'description': '如何安装和使用 chDB 与 Node.js'
'keywords':
- 'chdb'
- 'nodejs'
- 'javascript'
- 'embedded'
- 'clickhouse'
- 'sql'
- 'olap'
'doc_type': 'guide'
---


# chDB for Node.js

chDB-node 提供了 Node.js 的 chDB 绑定，使您能够直接在 Node.js 应用程序中运行 ClickHouse 查询，无需外部依赖。

## Installation {#installation}

```bash
npm install chdb
```

## Usage {#usage}

chDB-node 支持两种查询模式：用于简单操作的独立查询和用于维护数据库状态的会话查询。

### Standalone queries {#standalone-queries}

对于不需要持久状态的简单一次性查询：

```javascript
const { query } = require("chdb");

// Basic query
const result = query("SELECT version()", "CSV");
console.log("ClickHouse version:", result);

// Query with multiple columns
const multiResult = query("SELECT 'Hello' as greeting, 'chDB' as engine, 42 as answer", "CSV");
console.log("Multi-column result:", multiResult);

// Mathematical operations
const mathResult = query("SELECT 2 + 2 as sum, pi() as pi_value", "JSON");
console.log("Math result:", mathResult);

// System information
const systemInfo = query("SELECT * FROM system.functions LIMIT 5", "Pretty");
console.log("System functions:", systemInfo);
```

### Session-Based queries {#session-based-queries}

```javascript
const { Session } = require("chdb");

// Create a session with persistent storage
const session = new Session("./chdb-node-data");

try {
    // Create database and table
    session.query(`
        CREATE DATABASE IF NOT EXISTS myapp;
        CREATE TABLE IF NOT EXISTS myapp.users (
            id UInt32,
            name String,
            email String,
            created_at DateTime DEFAULT now()
        ) ENGINE = MergeTree() ORDER BY id
    `);

    // Insert sample data
    session.query(`
        INSERT INTO myapp.users (id, name, email) VALUES 
        (1, 'Alice', 'alice@example.com'),
        (2, 'Bob', 'bob@example.com'),
        (3, 'Charlie', 'charlie@example.com')
    `);

    // Query the data with different formats
    const csvResult = session.query("SELECT * FROM myapp.users ORDER BY id", "CSV");
    console.log("CSV Result:", csvResult);

    const jsonResult = session.query("SELECT * FROM myapp.users ORDER BY id", "JSON");
    console.log("JSON Result:", jsonResult);

    // Aggregate queries
    const stats = session.query(`
        SELECT 
            COUNT(*) as total_users,
            MAX(id) as max_id,
            MIN(created_at) as earliest_signup
        FROM myapp.users
    `, "Pretty");
    console.log("User Statistics:", stats);

} finally {
    // Always cleanup the session
    session.cleanup(); // This deletes the database files
}
```

### Processing external data {#processing-external-data}

```javascript
const { Session } = require("chdb");

const session = new Session("./data-processing");

try {
    // Process CSV data from URL
    const result = session.query(`
        SELECT 
            COUNT(*) as total_records,
            COUNT(DISTINCT "UserID") as unique_users
        FROM url('https://datasets.clickhouse.com/hits/hits.csv', 'CSV') 
        LIMIT 1000
    `, "JSON");

    console.log("External data analysis:", result);

    // Create table from external data
    session.query(`
        CREATE TABLE web_analytics AS
        SELECT * FROM url('https://datasets.clickhouse.com/hits/hits.csv', 'CSV')
        LIMIT 10000
    `);

    // Analyze the imported data
    const analysis = session.query(`
        SELECT 
            toDate("EventTime") as date,
            COUNT(*) as events,
            COUNT(DISTINCT "UserID") as unique_users
        FROM web_analytics
        GROUP BY date
        ORDER BY date
        LIMIT 10
    `, "Pretty");

    console.log("Daily analytics:", analysis);

} finally {
    session.cleanup();
}
```

## Error handling {#error-handling}

在使用 chDB 时始终适当地处理错误：

```javascript
const { query, Session } = require("chdb");

// Error handling for standalone queries
function safeQuery(sql, format = "CSV") {
    try {
        const result = query(sql, format);
        return { success: true, data: result };
    } catch (error) {
        console.error("Query error:", error.message);
        return { success: false, error: error.message };
    }
}

// Example usage
const result = safeQuery("SELECT invalid_syntax");
if (result.success) {
    console.log("Query result:", result.data);
} else {
    console.log("Query failed:", result.error);
}

// Error handling for sessions
function safeSessionQuery() {
    const session = new Session("./error-test");

    try {
        // This will throw an error due to invalid syntax
        const result = session.query("CREATE TABLE invalid syntax", "CSV");
        console.log("Unexpected success:", result);
    } catch (error) {
        console.error("Session query error:", error.message);
    } finally {
        // Always cleanup, even if an error occurred
        session.cleanup();
    }
}

safeSessionQuery();
```

## GitHub repository {#github-repository}

- **GitHub Repository**: [chdb-io/chdb-node](https://github.com/chdb-io/chdb-node)
- **Issues and Support**: 在 [GitHub repository](https://github.com/chdb-io/chdb-node/issues) 上报告问题
- **NPM Package**: [chdb on npm](https://www.npmjs.com/package/chdb)
