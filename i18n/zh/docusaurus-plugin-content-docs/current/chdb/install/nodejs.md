---
title: '面向 Node.js 的 chDB'
sidebar_label: 'Node.js'
slug: /chdb/install/nodejs
description: '如何在 Node.js 中安装和使用 chDB'
keywords: ['chdb', 'nodejs', 'javascript', 'embedded', 'clickhouse', 'sql', 'olap']
doc_type: 'guide'
---



# 面向 Node.js 的 chDB

`chDB-node` 为 chDB 提供了 Node.js 绑定，使你能够在 Node.js 应用中直接运行 ClickHouse 查询，而且完全不依赖任何外部组件。



## 安装 {#installation}

```bash
npm install chdb
```


## 使用方法 {#usage}

chDB-node 支持两种查询模式：用于简单操作的独立查询和用于维护数据库状态的会话查询。

### 独立查询 {#standalone-queries}

对于不需要持久化状态的简单一次性查询：

```javascript
const { query } = require("chdb")

// 基本查询
const result = query("SELECT version()", "CSV")
console.log("ClickHouse 版本：", result)

// 多列查询
const multiResult = query(
  "SELECT 'Hello' as greeting, 'chDB' as engine, 42 as answer",
  "CSV"
)
console.log("多列结果：", multiResult)

// 数学运算
const mathResult = query("SELECT 2 + 2 as sum, pi() as pi_value", "JSON")
console.log("数学结果：", mathResult)

// 系统信息
const systemInfo = query("SELECT * FROM system.functions LIMIT 5", "Pretty")
console.log("系统函数：", systemInfo)
```

### 会话查询 {#session-based-queries}

```javascript
const { Session } = require("chdb")

// 创建具有持久化存储的会话
const session = new Session("./chdb-node-data")

try {
  // 创建数据库和表
  session.query(`
        CREATE DATABASE IF NOT EXISTS myapp;
        CREATE TABLE IF NOT EXISTS myapp.users (
            id UInt32,
            name String,
            email String,
            created_at DateTime DEFAULT now()
        ) ENGINE = MergeTree() ORDER BY id
    `)

  // 插入示例数据
  session.query(`
        INSERT INTO myapp.users (id, name, email) VALUES 
        (1, 'Alice', 'alice@example.com'),
        (2, 'Bob', 'bob@example.com'),
        (3, 'Charlie', 'charlie@example.com')
    `)

  // 使用不同格式查询数据
  const csvResult = session.query(
    "SELECT * FROM myapp.users ORDER BY id",
    "CSV"
  )
  console.log("CSV 结果：", csvResult)

  const jsonResult = session.query(
    "SELECT * FROM myapp.users ORDER BY id",
    "JSON"
  )
  console.log("JSON 结果：", jsonResult)

  // 聚合查询
  const stats = session.query(
    `
        SELECT 
            COUNT(*) as total_users,
            MAX(id) as max_id,
            MIN(created_at) as earliest_signup
        FROM myapp.users
    `,
    "Pretty"
  )
  console.log("用户统计：", stats)
} finally {
  // 始终清理会话
  session.cleanup() // 这将删除数据库文件
}
```

### 处理外部数据 {#processing-external-data}

```javascript
const { Session } = require("chdb")

const session = new Session("./data-processing")

try {
  // 从 URL 处理 CSV 数据
  const result = session.query(
    `
        SELECT 
            COUNT(*) as total_records,
            COUNT(DISTINCT "UserID") as unique_users
        FROM url('https://datasets.clickhouse.com/hits/hits.csv', 'CSV') 
        LIMIT 1000
    `,
    "JSON"
  )

  console.log("外部数据分析：", result)

  // 从外部数据创建表
  session.query(`
        CREATE TABLE web_analytics AS
        SELECT * FROM url('https://datasets.clickhouse.com/hits/hits.csv', 'CSV')
        LIMIT 10000
    `)

  // 分析导入的数据
  const analysis = session.query(
    `
        SELECT 
            toDate("EventTime") as date,
            COUNT(*) as events,
            COUNT(DISTINCT "UserID") as unique_users
        FROM web_analytics
        GROUP BY date
        ORDER BY date
        LIMIT 10
    `,
    "Pretty"
  )

  console.log("每日分析：", analysis)
} finally {
  session.cleanup()
}
```


## 错误处理 {#error-handling}

在使用 chDB 时，请务必妥善处理错误：

```javascript
const { query, Session } = require("chdb")

// 独立查询的错误处理
function safeQuery(sql, format = "CSV") {
  try {
    const result = query(sql, format)
    return { success: true, data: result }
  } catch (error) {
    console.error("查询错误：", error.message)
    return { success: false, error: error.message }
  }
}

// 使用示例
const result = safeQuery("SELECT invalid_syntax")
if (result.success) {
  console.log("查询结果：", result.data)
} else {
  console.log("查询失败：", result.error)
}

// 会话的错误处理
function safeSessionQuery() {
  const session = new Session("./error-test")

  try {
    // 由于语法无效，此操作将抛出错误
    const result = session.query("CREATE TABLE invalid syntax", "CSV")
    console.log("意外成功：", result)
  } catch (error) {
    console.error("会话查询错误：", error.message)
  } finally {
    // 始终执行清理操作，即使发生错误
    session.cleanup()
  }
}

safeSessionQuery()
```


## GitHub 仓库 {#github-repository}

- **GitHub 仓库**：[chdb-io/chdb-node](https://github.com/chdb-io/chdb-node)
- **问题与支持**：在 [GitHub 仓库](https://github.com/chdb-io/chdb-node/issues)报告问题
- **NPM 包**：[npm 上的 chdb](https://www.npmjs.com/package/chdb)
