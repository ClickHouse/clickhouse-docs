---
title: '面向 Bun 的 chDB'
sidebar_label: 'Bun'
slug: /chdb/install/bun
description: '如何在 Bun 运行环境中安装和使用 chDB'
keywords: ['chdb', 'bun', 'javascript', 'typescript', 'embedded', 'clickhouse', 'sql', 'olap']
doc_type: 'guide'
---



# Bun 版 chDB

chDB-bun 为 chDB 提供了实验性的 FFI（Foreign Function Interface，外部函数接口）绑定，使你能够在 Bun 应用中直接运行 ClickHouse 查询，而无需任何外部依赖。



## 安装 {#installation}

### 步骤 1：安装系统依赖项 {#install-system-dependencies}

首先，安装所需的系统依赖项：

#### 安装 libchdb {#install-libchdb}

```bash
curl -sL https://lib.chdb.io | bash
```

#### 安装构建工具 {#install-build-tools}

您需要在系统上安装 `gcc` 或 `clang`：

### 步骤 2：安装 chDB-bun {#install-chdb-bun}


```bash
# 从 GitHub 仓库安装
bun add github:chdb-io/chdb-bun
```


# 或者在本地克隆并构建

git clone [https://github.com/chdb-io/chdb-bun.git](https://github.com/chdb-io/chdb-bun.git)
cd chdb-bun
bun install
bun run build

```
```


## 使用方法 {#usage}

chDB-bun 支持两种查询模式：用于一次性操作的临时查询和用于维护数据库状态的持久会话。

### 临时查询 {#ephemeral-queries}

对于不需要持久化状态的简单一次性查询：

```typescript
import { query } from "chdb-bun"

// 基本查询
const result = query("SELECT version()", "CSV")
console.log(result) // "23.10.1.1"

// 使用不同输出格式的查询
const jsonResult = query("SELECT 1 as id, 'Hello' as message", "JSON")
console.log(jsonResult)

// 带计算的查询
const mathResult = query("SELECT 2 + 2 as sum, pi() as pi_value", "Pretty")
console.log(mathResult)

// 查询系统信息
const systemInfo = query("SELECT * FROM system.functions LIMIT 5", "CSV")
console.log(systemInfo)
```

### 持久会话 {#persistent-sessions}

对于需要跨查询维护状态的复杂操作：

```typescript
import { Session } from "chdb-bun"

// 创建带持久化存储的会话
const sess = new Session("./chdb-bun-tmp")

try {
  // 创建数据库和表
  sess.query(
    `
        CREATE DATABASE IF NOT EXISTS mydb;
        CREATE TABLE IF NOT EXISTS mydb.users (
            id UInt32,
            name String,
            email String
        ) ENGINE = MergeTree() ORDER BY id
    `,
    "CSV"
  )

  // 插入数据
  sess.query(
    `
        INSERT INTO mydb.users VALUES 
        (1, 'Alice', 'alice@example.com'),
        (2, 'Bob', 'bob@example.com'),
        (3, 'Charlie', 'charlie@example.com')
    `,
    "CSV"
  )

  // 查询数据
  const users = sess.query("SELECT * FROM mydb.users ORDER BY id", "JSON")
  console.log("用户:", users)

  // 创建并使用自定义函数
  sess.query("CREATE FUNCTION IF NOT EXISTS hello AS () -> 'Hello chDB'", "CSV")
  const greeting = sess.query("SELECT hello() as message", "Pretty")
  console.log(greeting)

  // 聚合查询
  const stats = sess.query(
    `
        SELECT 
            COUNT(*) as total_users,
            MAX(id) as max_id,
            MIN(id) as min_id
        FROM mydb.users
    `,
    "JSON"
  )
  console.log("统计信息:", stats)
} finally {
  // 始终清理会话以释放资源
  sess.cleanup() // 这会删除数据库文件
}
```
