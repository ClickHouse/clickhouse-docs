---
title: 'chDB для Node.js'
sidebar_label: 'Node.js'
slug: /chdb/install/nodejs
description: 'Как установить и использовать chDB в Node.js'
keywords: ['chdb', 'nodejs', 'javascript', 'embedded', 'clickhouse', 'sql', 'olap']
doc_type: 'guide'
---



# chDB для Node.js

chDB-node предоставляет биндинги chDB для Node.js, позволяя выполнять запросы ClickHouse напрямую в ваших приложениях Node.js без каких-либо внешних зависимостей.



## Установка {#installation}

```bash
npm install chdb
```


## Использование {#usage}

chDB-node поддерживает два режима выполнения запросов: автономные запросы для простых операций и запросы на основе сессий для сохранения состояния базы данных.

### Автономные запросы {#standalone-queries}

Для простых разовых запросов, не требующих сохранения состояния:

```javascript
const { query } = require("chdb")

// Базовый запрос
const result = query("SELECT version()", "CSV")
console.log("Версия ClickHouse:", result)

// Запрос с несколькими столбцами
const multiResult = query(
  "SELECT 'Hello' as greeting, 'chDB' as engine, 42 as answer",
  "CSV"
)
console.log("Результат с несколькими столбцами:", multiResult)

// Математические операции
const mathResult = query("SELECT 2 + 2 as sum, pi() as pi_value", "JSON")
console.log("Результат математических операций:", mathResult)

// Системная информация
const systemInfo = query("SELECT * FROM system.functions LIMIT 5", "Pretty")
console.log("Системные функции:", systemInfo)
```

### Запросы на основе сессий {#session-based-queries}

```javascript
const { Session } = require("chdb")

// Создание сессии с постоянным хранилищем
const session = new Session("./chdb-node-data")

try {
  // Создание базы данных и таблицы
  session.query(`
        CREATE DATABASE IF NOT EXISTS myapp;
        CREATE TABLE IF NOT EXISTS myapp.users (
            id UInt32,
            name String,
            email String,
            created_at DateTime DEFAULT now()
        ) ENGINE = MergeTree() ORDER BY id
    `)

  // Вставка примеров данных
  session.query(`
        INSERT INTO myapp.users (id, name, email) VALUES 
        (1, 'Alice', 'alice@example.com'),
        (2, 'Bob', 'bob@example.com'),
        (3, 'Charlie', 'charlie@example.com')
    `)

  // Запрос данных в различных форматах
  const csvResult = session.query(
    "SELECT * FROM myapp.users ORDER BY id",
    "CSV"
  )
  console.log("Результат в формате CSV:", csvResult)

  const jsonResult = session.query(
    "SELECT * FROM myapp.users ORDER BY id",
    "JSON"
  )
  console.log("Результат в формате JSON:", jsonResult)

  // Агрегирующие запросы
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
  console.log("Статистика пользователей:", stats)
} finally {
  // Всегда очищайте сессию
  session.cleanup() // Удаляет файлы базы данных
}
```

### Обработка внешних данных {#processing-external-data}

```javascript
const { Session } = require("chdb")

const session = new Session("./data-processing")

try {
  // Обработка CSV-данных из URL
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

  console.log("Анализ внешних данных:", result)

  // Создание таблицы из внешних данных
  session.query(`
        CREATE TABLE web_analytics AS
        SELECT * FROM url('https://datasets.clickhouse.com/hits/hits.csv', 'CSV')
        LIMIT 10000
    `)

  // Анализ импортированных данных
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

  console.log("Ежедневная аналитика:", analysis)
} finally {
  session.cleanup()
}
```


## Обработка ошибок {#error-handling}

Всегда правильно обрабатывайте ошибки при работе с chDB:

```javascript
const { query, Session } = require("chdb")

// Обработка ошибок для отдельных запросов
function safeQuery(sql, format = "CSV") {
  try {
    const result = query(sql, format)
    return { success: true, data: result }
  } catch (error) {
    console.error("Query error:", error.message)
    return { success: false, error: error.message }
  }
}

// Пример использования
const result = safeQuery("SELECT invalid_syntax")
if (result.success) {
  console.log("Query result:", result.data)
} else {
  console.log("Query failed:", result.error)
}

// Обработка ошибок для сессий
function safeSessionQuery() {
  const session = new Session("./error-test")

  try {
    // Это вызовет ошибку из-за неправильного синтаксиса
    const result = session.query("CREATE TABLE invalid syntax", "CSV")
    console.log("Unexpected success:", result)
  } catch (error) {
    console.error("Session query error:", error.message)
  } finally {
    // Всегда выполняйте очистку, даже при возникновении ошибки
    session.cleanup()
  }
}

safeSessionQuery()
```


## Репозиторий GitHub {#github-repository}

- **Репозиторий GitHub**: [chdb-io/chdb-node](https://github.com/chdb-io/chdb-node)
- **Вопросы и поддержка**: Сообщайте о проблемах в [репозитории GitHub](https://github.com/chdb-io/chdb-node/issues)
- **Пакет NPM**: [chdb на npm](https://www.npmjs.com/package/chdb)
