---
title: 'Установка chDB для Rust'
sidebar_label: 'Rust'
slug: /chdb/install/rust
description: 'Как установить и использовать привязки chDB для Rust'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'rust', 'install', 'ffi', 'bindings']
doc_type: 'guide'
---

# chDB для Rust \\{#chdb-for-rust\\}

chDB-rust предоставляет экспериментальные привязки FFI (Foreign Function Interface) для chDB, позволяющие выполнять запросы к ClickHouse непосредственно в ваших Rust-приложениях без каких-либо внешних зависимостей.

## Установка \\{#installation\\}

### Установка libchdb \\{#install-libchdb\\}

Установите библиотеку chDB:

```bash
curl -sL https://lib.chdb.io | bash
```

## Использование \\{#usage\\}

chDB для Rust предоставляет как статический, так и состояние-сохраняющий режимы выполнения запросов.

### Статический режим \\{#stateless-usage\\}

Для простых запросов без сохранения состояния:

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

### Использование с сохранением состояния (сеансы) \\{#stateful-usage-sessions\\}

Для запросов, которым требуется постоянное состояние, например для работы с базами данных и таблицами:

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

## Сборка и тестирование \\{#building-testing\\}

### Сборка проекта \\{#build-the-project\\}

```bash
cargo build
```

### Запуск тестов \\{#run-tests\\}

```bash
cargo test
```

### Зависимости для разработки \\{#development-dependencies\\}

В проекте используются следующие зависимости для разработки:

* `bindgen` (v0.70.1) - генерация FFI-биндингов из заголовков C
* `tempdir` (v0.3.7) - работа с временными каталогами в тестах
* `thiserror` (v1) - утилиты для обработки ошибок

## Обработка ошибок \\{#error-handling\\}

chDB Rust предоставляет всестороннюю обработку ошибок с помощью перечисления `Error`:

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

## Репозиторий на GitHub \\{#github-repository\\}

Репозиторий проекта на GitHub доступен по адресу [chdb-io/chdb-rust](https://github.com/chdb-io/chdb-rust).
