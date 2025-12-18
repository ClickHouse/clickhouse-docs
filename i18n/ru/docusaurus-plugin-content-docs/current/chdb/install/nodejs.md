---
title: 'chDB для Node.js'
sidebar_label: 'Node.js'
slug: /chdb/install/nodejs
description: 'Как установить и использовать chDB в Node.js'
keywords: ['chdb', 'nodejs', 'javascript', 'встраиваемая', 'clickhouse', 'sql', 'olap']
doc_type: 'guide'
---

# chDB для Node.js {#chdb-for-nodejs}

chDB-node предоставляет биндинги chDB для Node.js, позволяя выполнять запросы к ClickHouse непосредственно в ваших Node.js-приложениях без каких-либо внешних зависимостей.

## Установка {#installation}

```bash
npm install chdb
```

## Использование {#usage}

chDB-node поддерживает два режима выполнения запросов: автономные запросы для простых операций и сеансовые запросы для сохранения состояния базы данных.

### Автономные запросы {#standalone-queries}

Для простых разовых запросов, которым не нужно сохранять состояние:

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

### Запросы по сессиям {#session-based-queries}

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

### Обработка внешних данных {#processing-external-data}

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

## Обработка ошибок {#error-handling}

Всегда правильно обрабатывайте ошибки при работе с chDB:

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

## Репозиторий на GitHub {#github-repository}

- **Репозиторий на GitHub**: [chdb-io/chdb-node](https://github.com/chdb-io/chdb-node)
- **Обсуждение проблем и поддержка**: Создавайте обращения в разделе Issues в [репозитории на GitHub](https://github.com/chdb-io/chdb-node/issues)
- **Пакет npm**: [chdb на npm](https://www.npmjs.com/package/chdb)
