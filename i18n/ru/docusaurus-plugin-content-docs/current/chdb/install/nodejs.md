---
title: 'chDB для Node.js'
sidebar_label: 'Node.js'
slug: /chdb/install/nodejs
description: 'Как установить и использовать chDB в Node.js'
keywords: ['chdb', 'nodejs', 'javascript', 'встраиваемая', 'clickhouse', 'sql', 'olap']
doc_type: 'guide'
---



# chDB для Node.js

chDB-node предоставляет биндинги chDB для Node.js, позволяя выполнять запросы к ClickHouse непосредственно в ваших Node.js-приложениях без каких-либо внешних зависимостей.



## Установка

```bash
npm install chdb
```


## Использование

chDB-node поддерживает два режима выполнения запросов: автономные запросы для простых операций и сеансовые запросы для сохранения состояния базы данных.

### Автономные запросы

Для простых разовых запросов, которым не нужно сохранять состояние:

```javascript
const { query } = require("chdb");

// Базовый запрос
const result = query("SELECT version()", "CSV");
console.log("Версия ClickHouse:", result);

// Запрос с несколькими столбцами
const multiResult = query("SELECT 'Привет' as greeting, 'chDB' as engine, 42 as answer", "CSV");
console.log("Результат с несколькими столбцами:", multiResult);

// Математические операции
const mathResult = query("SELECT 2 + 2 as sum, pi() as pi_value", "JSON");
console.log("Результат математических операций:", mathResult);

// Системная информация
const systemInfo = query("SELECT * FROM system.functions LIMIT 5", "Pretty");
console.log("Системные функции:", systemInfo);
```

### Запросы по сессиям

```javascript
const { Session } = require("chdb");

// Создание сессии с постоянным хранилищем
const session = new Session("./chdb-node-data");

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
    `);

    // Вставка примеров данных
    session.query(`
        INSERT INTO myapp.users (id, name, email) VALUES 
        (1, 'Alice', 'alice@example.com'),
        (2, 'Bob', 'bob@example.com'),
        (3, 'Charlie', 'charlie@example.com')
    `);

    // Запрос данных в различных форматах
    const csvResult = session.query("SELECT * FROM myapp.users ORDER BY id", "CSV");
    console.log("Результат CSV:", csvResult);

    const jsonResult = session.query("SELECT * FROM myapp.users ORDER BY id", "JSON");
    console.log("Результат JSON:", jsonResult);

    // Агрегирующие запросы
    const stats = session.query(`
        SELECT 
            COUNT(*) as total_users,
            MAX(id) as max_id,
            MIN(created_at) as earliest_signup
        FROM myapp.users
    `, "Pretty");
    console.log("Статистика пользователей:", stats);

} finally {
    // Всегда выполняйте очистку сессии
    session.cleanup(); // Удаляет файлы базы данных
}
```

### Обработка внешних данных

```javascript
const { Session } = require("chdb");

const session = new Session("./data-processing");

try {
    // Обработка CSV-данных по URL
    const result = session.query(`
        SELECT 
            COUNT(*) as total_records,
            COUNT(DISTINCT "UserID") as unique_users
        FROM url('https://datasets.clickhouse.com/hits/hits.csv', 'CSV') 
        LIMIT 1000
    `, "JSON");
    
    console.log("Анализ внешних данных:", result);

    // Создание таблицы из внешних данных
    session.query(`
        CREATE TABLE web_analytics AS
        SELECT * FROM url('https://datasets.clickhouse.com/hits/hits.csv', 'CSV')
        LIMIT 10000
    `);

    // Анализ импортированных данных
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
    
    console.log("Ежедневная аналитика:", analysis);

} finally {
    session.cleanup();
}
```


## Обработка ошибок

Всегда правильно обрабатывайте ошибки при работе с chDB:

```javascript
const { query, Session } = require("chdb");

// Обработка ошибок для отдельных запросов
function safeQuery(sql, format = "CSV") {
    try {
        const result = query(sql, format);
        return { success: true, data: result };
    } catch (error) {
        console.error("Ошибка запроса:", error.message);
        return { success: false, error: error.message };
    }
}

// Пример использования
const result = safeQuery("SELECT invalid_syntax");
if (result.success) {
    console.log("Результат запроса:", result.data);
} else {
    console.log("Запрос не выполнен:", result.error);
}

// Обработка ошибок для сессий
function safeSessionQuery() {
    const session = new Session("./error-test");
    
    try {
        // Это вызовет ошибку из-за некорректного синтаксиса
        const result = session.query("CREATE TABLE invalid syntax", "CSV");
        console.log("Неожиданный успех:", result);
    } catch (error) {
        console.error("Ошибка запроса в сессии:", error.message);
    } finally {
        // Всегда выполняйте очистку, даже при возникновении ошибки
        session.cleanup();
    }
}

safeSessionQuery();
```


## Репозиторий на GitHub {#github-repository}

- **Репозиторий на GitHub**: [chdb-io/chdb-node](https://github.com/chdb-io/chdb-node)
- **Обсуждение проблем и поддержка**: Создавайте обращения в разделе Issues в [репозитории на GitHub](https://github.com/chdb-io/chdb-node/issues)
- **Пакет npm**: [chdb на npm](https://www.npmjs.com/package/chdb)
