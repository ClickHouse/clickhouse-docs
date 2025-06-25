---
title: 'Установка chDB для Bun'
sidebar_label: 'Bun'
slug: /chdb/install/bun
description: 'Как установить chDB для Bun'
keywords: ['chdb', 'встраиваемый', 'clickhouse-lite', 'bun', 'установка']
---


# Установка chDB для Bun

## Требования {#requirements}

Установите [libchdb](https://github.com/chdb-io/chdb):

```bash
curl -sL https://lib.chdb.io | bash
```

## Установка {#install}

Смотрите: [chdb-bun](https://github.com/chdb-io/chdb-bun)

## Репозиторий GitHub {#github-repository}

Вы можете найти репозиторий GitHub для проекта по адресу [chdb-io/chdb-bun](https://github.com/chdb-io/chdb-bun).

## Использование {#usage}

### Query(query, *format) (временный) {#queryquery-format-ephemeral}

```javascript
import { query } from 'chdb-bun';

// Запрос (временный)
var result = query("SELECT version()", "CSV");
console.log(result); // 23.10.1.1
```

### Session.Query(query, *format) {#sessionqueryquery-format}

```javascript
import { Session } from 'chdb-bun';
const sess = new Session('./chdb-bun-tmp');

// Запрос сессии (постоянный)
sess.query("CREATE FUNCTION IF NOT EXISTS hello AS () -> 'Hello chDB'", "CSV");
var result = sess.query("SELECT hello()", "CSV");
console.log(result);

// Перед очисткой вы можете найти файлы базы данных в `./chdb-bun-tmp`

sess.cleanup(); // очистка сессии, это удалит базу данных
```
