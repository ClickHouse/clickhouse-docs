---
'title': 'chDB for Bun'
'sidebar_label': 'Bun'
'slug': '/chdb/install/bun'
'description': '如何安装和使用 chDB 与 Bun 运行时'
'keywords':
- 'chdb'
- 'bun'
- 'javascript'
- 'typescript'
- 'embedded'
- 'clickhouse'
- 'sql'
- 'olap'
'doc_type': 'guide'
---


# chDB for Bun

chDB-bun 提供实验性的 FFI (Foreign Function Interface) 绑定，允许您在 Bun 应用中直接运行 ClickHouse 查询，而无需任何外部依赖。

## 安装 {#installation}

### 步骤 1: 安装系统依赖 {#install-system-dependencies}

首先，安装所需的系统依赖：

#### 安装 libchdb {#install-libchdb}

```bash
curl -sL https://lib.chdb.io | bash
```

#### 安装构建工具 {#install-build-tools}

您需要在系统上安装 `gcc` 或 `clang`：

### 步骤 2: 安装 chDB-bun {#install-chdb-bun}

```bash

# Install from the GitHub repository
bun add github:chdb-io/chdb-bun


# Or clone and build locally
git clone https://github.com/chdb-io/chdb-bun.git
cd chdb-bun
bun install
bun run build
```

## 用法 {#usage}

chDB-bun 支持两种查询模式：用于一次性操作的临时查询和用于维护数据库状态的持久会话。

### 临时查询 {#ephemeral-queries}

对于简单的、一次性查询，且不需要持久状态：

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

### 持久会话 {#persistent-sessions}

对于需要在查询之间维护状态的复杂操作：

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
