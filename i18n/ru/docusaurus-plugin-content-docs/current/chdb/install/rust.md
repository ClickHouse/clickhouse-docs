---
slug: '/chdb/install/rust'
sidebar_label: Rust
description: 'Как установить и использовать привязки chDB для Rust'
title: 'Установка chDB для Rust'
keywords: ['chdb', 'встроенный', 'clickhouse-lite', 'bun', 'установка']
doc_type: guide
---
# chDB для Rust {#chdb-for-rust}

chDB-rust предоставляет экспериментальные FFI (интерфейс внешней функции) связывания для chDB, позволяя вам выполнять запросы ClickHouse непосредственно в ваших приложениях на Rust без внешних зависимостей.

## Установка {#installation}

### Установите libchdb {#install-libchdb}

Установите библиотеку chDB:

```bash
curl -sL https://lib.chdb.io | bash
```

## Использование {#usage}

chDB Rust предоставляет как статeless, так и stateful режимы выполнения запросов.

### Статeless использование {#stateless-usage}

Для простых запросов без постоянного состояния:

```rust
use chdb_rust::{execute, arg::Arg, format::OutputFormat};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Execute a simple query
    let result = execute(
        "SELECT version()",
        Some(&[Arg::OutputFormat(OutputFormat::JSONEachRow)])
    )?;
    println!("ClickHouse version: {}", result.data_utf8()?);

    // Query with CSV file
    let result = execute(
        "SELECT * FROM file('data.csv', 'CSV')",
        Some(&[Arg::OutputFormat(OutputFormat::JSONEachRow)])
    )?;
    println!("CSV data: {}", result.data_utf8()?);

    Ok(())
}
```

### Stateful использование (Сессии) {#stateful-usage-sessions}

Для запросов, требующих постоянного состояния, таких как базы данных и таблицы:

```rust
use chdb_rust::{
    session::SessionBuilder,
    arg::Arg,
    format::OutputFormat,
    log_level::LogLevel
};
use tempdir::TempDir;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create a temporary directory for database storage
    let tmp = TempDir::new("chdb-rust")?;

    // Build session with configuration
    let session = SessionBuilder::new()
        .with_data_path(tmp.path())
        .with_arg(Arg::LogLevel(LogLevel::Debug))
        .with_auto_cleanup(true)  // Cleanup on drop
        .build()?;

    // Create database and table
    session.execute(
        "CREATE DATABASE demo; USE demo", 
        Some(&[Arg::MultiQuery])
    )?;

    session.execute(
        "CREATE TABLE logs (id UInt64, msg String) ENGINE = MergeTree() ORDER BY id",
        None,
    )?;

    // Insert data
    session.execute(
        "INSERT INTO logs (id, msg) VALUES (1, 'Hello'), (2, 'World')",
        None,
    )?;

    // Query data
    let result = session.execute(
        "SELECT * FROM logs ORDER BY id",
        Some(&[Arg::OutputFormat(OutputFormat::JSONEachRow)]),
    )?;

    println!("Query results:\n{}", result.data_utf8()?);

    // Get query statistics
    println!("Rows read: {}", result.rows_read());
    println!("Bytes read: {}", result.bytes_read());
    println!("Query time: {:?}", result.elapsed());

    Ok(())
}
```

## Сборка и тестирование {#building-testing}

### Соберите проект {#build-the-project}

```bash
cargo build
```

### Запустите тесты {#run-tests}

```bash
cargo test
```

### Зависимости разработки {#development-dependencies}

Проект включает в себя следующие зависимости разработки:
- `bindgen` (v0.70.1) - Генерация FFI связывания из заголовков C
- `tempdir` (v0.3.7) - Обработка временных директорий в тестах
- `thiserror` (v1) - Утилиты обработки ошибок

## Обработка ошибок {#error-handling}

chDB Rust предоставляет обширную обработку ошибок через перечисление `Error`:

```rust
use chdb_rust::{execute, error::Error};

match execute("SELECT 1", None) {
    Ok(result) => {
        println!("Success: {}", result.data_utf8()?);
    },
    Err(Error::QueryError(msg)) => {
        eprintln!("Query failed: {}", msg);
    },
    Err(Error::NoResult) => {
        eprintln!("No result returned");
    },
    Err(Error::NonUtf8Sequence(e)) => {
        eprintln!("Invalid UTF-8: {}", e);
    },
    Err(e) => {
        eprintln!("Other error: {}", e);
    }
}
```

## Репозиторий на GitHub {#github-repository}

Вы можете найти репозиторий на GitHub для проекта по адресу [chdb-io/chdb-rust](https://github.com/chdb-io/chdb-rust).