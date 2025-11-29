---
title: 'chDB для Bun'
sidebar_label: 'Bun'
slug: /chdb/install/bun
description: 'Как установить и использовать chDB в среде выполнения Bun'
keywords: ['chdb', 'bun', 'javascript', 'typescript', 'embedded', 'clickhouse', 'sql', 'olap']
doc_type: 'guide'
---

# chDB для Bun {#chdb-for-bun}

chDB-bun предоставляет экспериментальные биндинги (FFI, Foreign Function Interface) для chDB, позволяющие выполнять запросы ClickHouse напрямую в ваших приложениях Bun без каких-либо внешних зависимостей.

## Установка {#installation}

### Шаг 1. Установите системные зависимости {#install-system-dependencies}

Сначала установите необходимые системные зависимости:

#### Установка libchdb {#install-libchdb}

```bash
curl -sL https://lib.chdb.io | bash
```

#### Установите инструменты для сборки {#install-build-tools}

Вам потребуется установить в систему либо `gcc`, либо `clang`:

### Шаг 2: Установите chDB-bun {#install-chdb-bun}

```bash
# Установка из репозитория GitHub
bun add github:chdb-io/chdb-bun
```

# Или клонируйте репозиторий и соберите локально {#install-from-the-github-repository}

git clone [https://github.com/chdb-io/chdb-bun.git](https://github.com/chdb-io/chdb-bun.git)
cd chdb-bun
bun install
bun run build

```
```

## Использование

chDB-bun поддерживает два режима выполнения запросов: эфемерные запросы для одноразовых операций и постоянные сеансы для сохранения состояния базы данных.

### Эфемерные запросы

Для простых одноразовых запросов, которые не требуют сохранения состояния:

```typescript
import { query } from 'chdb-bun';

// Базовый запрос
const result = query("SELECT version()", "CSV");
console.log(result); // "23.10.1.1"

// Запрос с различными форматами вывода
const jsonResult = query("SELECT 1 as id, 'Hello' as message", "JSON");
console.log(jsonResult);

// Запрос с вычислениями
const mathResult = query("SELECT 2 + 2 as sum, pi() as pi_value", "Pretty");
console.log(mathResult);

// Запрос системной информации
const systemInfo = query("SELECT * FROM system.functions LIMIT 5", "CSV");
console.log(systemInfo);
```

### Постоянные сессии {#ephemeral-queries}

Для сложных операций, которым необходимо сохранять состояние между запросами:

```typescript
import { Session } from 'chdb-bun';

// Создание сессии с постоянным хранилищем
const sess = new Session('./chdb-bun-tmp');

try {
    // Создание базы данных и таблицы
    sess.query(`
        CREATE DATABASE IF NOT EXISTS mydb;
        CREATE TABLE IF NOT EXISTS mydb.users (
            id UInt32,
            name String,
            email String
        ) ENGINE = MergeTree() ORDER BY id
    `, "CSV");

    // Вставка данных
    sess.query(`
        INSERT INTO mydb.users VALUES 
        (1, 'Alice', 'alice@example.com'),
        (2, 'Bob', 'bob@example.com'),
        (3, 'Charlie', 'charlie@example.com')
    `, "CSV");

    // Запрос данных
    const users = sess.query("SELECT * FROM mydb.users ORDER BY id", "JSON");
    console.log("Пользователи:", users);

    // Создание и использование пользовательских функций
    sess.query("CREATE FUNCTION IF NOT EXISTS hello AS () -> 'Hello chDB'", "CSV");
    const greeting = sess.query("SELECT hello() as message", "Pretty");
    console.log(greeting);

    // Агрегирующие запросы
    const stats = sess.query(`
        SELECT 
            COUNT(*) as total_users,
            MAX(id) as max_id,
            MIN(id) as min_id
        FROM mydb.users
    `, "JSON");
    console.log("Статистика:", stats);

} finally {
    // Всегда очищайте сессию для освобождения ресурсов
    sess.cleanup(); // Удаляет файлы базы данных
}
```
