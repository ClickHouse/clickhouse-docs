---
'title': 'chDB for Bun'
'sidebar_label': 'Bun'
'slug': '/chdb/install/bun'
'description': 'Bun ランタイムで chDB をインストールして使用する方法'
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

chDB-bunは、chDBのための実験的なFFI（Foreign Function Interface）バインディングを提供し、ClickHouseクエリをBunアプリケーション内で外部依存関係なしに直接実行できます。

## インストール {#installation}

### ステップ 1: システム依存関係をインストール {#install-system-dependencies}

まず、必要なシステム依存関係をインストールします。

#### libchdbをインストール {#install-libchdb}

```bash
curl -sL https://lib.chdb.io | bash
```

#### ビルドツールをインストール {#install-build-tools}

システムに`gcc`または`clang`がインストールされている必要があります。

### ステップ 2: chDB-bunをインストール {#install-chdb-bun}

```bash

# Install from the GitHub repository
bun add github:chdb-io/chdb-bun


# Or clone and build locally
git clone https://github.com/chdb-io/chdb-bun.git
cd chdb-bun
bun install
bun run build
```

## 使用法 {#usage}

chDB-bunは、クエリモードとして一時的クエリ（ワンタイム操作用）と永続セッション（データベースの状態を維持するため）をサポートしています。

### 一時的クエリ {#ephemeral-queries}

状態を永続化する必要のない単純な一回限りのクエリの場合：

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

### 永続セッション {#persistent-sessions}

クエリ間で状態を維持する必要がある複雑な操作の場合：

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
