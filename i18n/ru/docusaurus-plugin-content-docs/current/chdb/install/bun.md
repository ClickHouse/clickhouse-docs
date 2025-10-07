---
slug: '/chdb/install/bun'
sidebar_label: Bun
description: 'Как установить и использовать chDB с средой выполнения Bun'
title: 'Установка chDB для Bun'
keywords: ['chdb', 'встраиваемый', 'clickhouse-lite', 'bun', 'установка']
doc_type: guide
---
# chDB для Bun

chDB-bun предоставляет экспериментальные привязки FFI (интерфейс внешних функций) для chDB, позволяя вам выполнять запросы ClickHouse непосредственно в ваших приложениях на Bun без внешних зависимостей.

## Установка {#installation}

### Шаг 1: Установите системные зависимости {#install-system-dependencies}

Сначала установите необходимые системные зависимости:

#### Установите libchdb {#install-libchdb}

```bash
curl -sL https://lib.chdb.io | bash
```

#### Установите инструменты для сборки {#install-build-tools}

Вам потребуется установить `gcc` или `clang` на вашу систему:

### Шаг 2: Установите chDB-bun {#install-chdb-bun}

```bash

# Install from the GitHub repository
bun add github:chdb-io/chdb-bun


# Or clone and build locally
git clone https://github.com/chdb-io/chdb-bun.git
cd chdb-bun
bun install
bun run build
```

## Использование {#usage}

chDB-bun поддерживает два режима запросов: эфемерные запросы для одноразовых операций и постоянные сессии для поддержания состояния базы данных.

### Эфемерные запросы {#ephemeral-queries}

Для простых одноразовых запросов, которые не требуют постоянного состояния:

```typescript
import { query } from 'chdb-bun';

// Basic query
const result = query("SELECT version()", "CSV");
console.log(result); // "23.10.1.1"

// Query with different output formats
const jsonResult = query("SELECT 1 as id, 'Hello' as message", "JSON");
console.log(jsonResult);

// Query with calculations
const mathResult = query("SELECT 2 + 2 as sum, pi() as pi_value", "Pretty");
console.log(mathResult);

// Query system information
const systemInfo = query("SELECT * FROM system.functions LIMIT 5", "CSV");
console.log(systemInfo);
```

### Постоянные сессии {#persistent-sessions}

Для сложных операций, которые требуют поддержания состояния между запросами:

```typescript
import { Session } from 'chdb-bun';

// Create a session with persistent storage
const sess = new Session('./chdb-bun-tmp');

try {
    // Create a database and table
    sess.query(`
        CREATE DATABASE IF NOT EXISTS mydb;
        CREATE TABLE IF NOT EXISTS mydb.users (
            id UInt32,
            name String,
            email String
        ) ENGINE = MergeTree() ORDER BY id
    `, "CSV");

    // Insert data
    sess.query(`
        INSERT INTO mydb.users VALUES 
        (1, 'Alice', 'alice@example.com'),
        (2, 'Bob', 'bob@example.com'),
        (3, 'Charlie', 'charlie@example.com')
    `, "CSV");

    // Query the data
    const users = sess.query("SELECT * FROM mydb.users ORDER BY id", "JSON");
    console.log("Users:", users);

    // Create and use custom functions
    sess.query("CREATE FUNCTION IF NOT EXISTS hello AS () -> 'Hello chDB'", "CSV");
    const greeting = sess.query("SELECT hello() as message", "Pretty");
    console.log(greeting);

    // Aggregate queries
    const stats = sess.query(`
        SELECT 
            COUNT(*) as total_users,
            MAX(id) as max_id,
            MIN(id) as min_id
        FROM mydb.users
    `, "JSON");
    console.log("Statistics:", stats);

} finally {
    // Always cleanup the session to free resources
    sess.cleanup(); // This deletes the database files
}
```