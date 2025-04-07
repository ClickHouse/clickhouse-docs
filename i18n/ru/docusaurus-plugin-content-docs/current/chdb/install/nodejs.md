---
title: 'Установка chDB для NodeJS'
sidebar_label: 'NodeJS'
slug: /chdb/install/nodejs
description: 'Как установить chDB для NodeJS'
keywords: ['chdb', 'встроенный', 'clickhouse-lite', 'NodeJS', 'установка']
---


# Установка chDB для NodeJS

## Требования {#requirements}

Установите [libchdb](https://github.com/chdb-io/chdb):

```bash
curl -sL https://lib.chdb.io | bash
```

## Установка {#install}

```bash
npm i chdb
```

## Репозиторий GitHub {#github-repository}

Вы можете найти репозиторий GitHub для проекта по адресу [chdb-io/chdb-node](https://github.com/chdb-io/chdb-node).


## Использование {#usage}

Вы можете использовать возможности chdb в своих приложениях на NodeJS, импортируя и используя модуль chdb-node:

```javascript
const { query, Session } = require("chdb");

var ret;

// Тестирование отдельного запроса
ret = query("SELECT version(), 'Hello chDB', chdb()", "CSV");
console.log("Результат отдельного запроса:", ret);

// Тестирование запроса сессии
// Создание нового экземпляра сессии
const session = new Session("./chdb-node-tmp");
ret = session.query("SELECT 123", "CSV")
console.log("Результат запроса сессии:", ret);
ret = session.query("CREATE DATABASE IF NOT EXISTS testdb;" +
    "CREATE TABLE IF NOT EXISTS testdb.testtable (id UInt32) ENGINE = MergeTree() ORDER BY id;");

session.query("USE testdb; INSERT INTO testtable VALUES (1), (2), (3);")

ret = session.query("SELECT * FROM testtable;")
console.log("Результат запроса сессии:", ret);

// Очистка сессии
session.cleanup();
```

## Сборка из исходников {#build-from-source}

```bash
npm run libchdb
npm install
npm run test
```
