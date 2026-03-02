---
title: 'Bun용 chDB'
sidebar_label: 'Bun'
slug: /chdb/install/bun
description: 'Bun 런타임에서 chDB를 설치 및 사용하는 방법'
keywords: ['chdb', 'bun', 'javascript', 'typescript', 'embedded', 'clickhouse', 'sql', 'olap']
doc_type: 'guide'
---

# Bun용 chDB \{#chdb-for-bun\}

chDB-bun은 chDB에 대한 실험적인 FFI(Foreign Function Interface) 바인딩을 제공하여, Bun 애플리케이션 내에서 외부 종속성 없이 ClickHouse 쿼리를 직접 실행할 수 있도록 합니다.

## 설치 \{#installation\}

### 1단계: 시스템 종속성 설치 \{#install-system-dependencies\}

먼저, 필요한 시스템 종속성을 설치합니다.

#### libchdb 설치 \{#install-libchdb\}

```bash
curl -sL https://lib.chdb.io | bash
```

#### 빌드 도구 설치 \{#install-build-tools\}

시스템에 `gcc` 또는 `clang` 중 하나가 설치되어 있어야 합니다.

### 2단계: chDB-bun 설치 \{#install-chdb-bun\}

```bash
# Install from the GitHub repository
bun add github:chdb-io/chdb-bun
```

# 또는 로컬에서 클론하여 빌드하기

git clone https://github.com/chdb-io/chdb-bun.git
cd chdb-bun
bun install
bun run build

```
```

## 사용법

chDB-bun은 두 가지 쿼리 모드를 지원합니다. 일회성 작업을 위한 임시 쿼리와 데이터베이스 상태 유지를 위한 지속 세션입니다.

### 임시 쿼리 \{#persistent-sessions\}

지속 상태가 필요하지 않은 단순한 일회성 쿼리의 경우:

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

### 지속 세션

여러 쿼리 간에 상태를 유지해야 하는 복잡한 작업에는 다음을 사용합니다.

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
