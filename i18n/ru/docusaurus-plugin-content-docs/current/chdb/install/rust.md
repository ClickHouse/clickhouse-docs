---
title: 'Установка chDB для Rust'
sidebar_label: 'Rust'
slug: /chdb/install/rust
description: 'Как установить и использовать библиотеку chDB для Rust'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'rust', 'install', 'ffi', 'bindings']
doc_type: 'guide'
---



# chDB для Rust {#chdb-for-rust}

chDB-rust предоставляет экспериментальные FFI-привязки (Foreign Function Interface) для chDB, позволяя выполнять запросы ClickHouse непосредственно в ваших Rust-приложениях без внешних зависимостей.


## Установка {#installation}

### Установка libchdb {#install-libchdb}

Установите библиотеку chDB:

```bash
curl -sL https://lib.chdb.io | bash
```


## Использование {#usage}

chDB Rust предоставляет режимы выполнения запросов как с сохранением состояния, так и без него.

### Использование без сохранения состояния {#stateless-usage}

Для простых запросов без сохранения состояния:

```rust
use chdb_rust::{execute, arg::Arg, format::OutputFormat};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Выполнить простой запрос
    let result = execute(
        "SELECT version()",
        Some(&[Arg::OutputFormat(OutputFormat::JSONEachRow)])
    )?;
    println!("Версия ClickHouse: {}", result.data_utf8()?);

    // Запрос к CSV-файлу
    let result = execute(
        "SELECT * FROM file('data.csv', 'CSV')",
        Some(&[Arg::OutputFormat(OutputFormat::JSONEachRow)])
    )?;
    println!("Данные из CSV: {}", result.data_utf8()?);

    Ok(())
}
```

### Использование с сохранением состояния (сессии) {#stateful-usage-sessions}

Для запросов, требующих сохранения состояния, таких как базы данных и таблицы:

```rust
use chdb_rust::{
    session::SessionBuilder,
    arg::Arg,
    format::OutputFormat,
    log_level::LogLevel
};
use tempdir::TempDir;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Создать временный каталог для хранения базы данных
    let tmp = TempDir::new("chdb-rust")?;

    // Создать сессию с конфигурацией
    let session = SessionBuilder::new()
        .with_data_path(tmp.path())
        .with_arg(Arg::LogLevel(LogLevel::Debug))
        .with_auto_cleanup(true)  // Очистка при завершении
        .build()?;

    // Создать базу данных и таблицу
    session.execute(
        "CREATE DATABASE demo; USE demo",
        Some(&[Arg::MultiQuery])
    )?;

    session.execute(
        "CREATE TABLE logs (id UInt64, msg String) ENGINE = MergeTree() ORDER BY id",
        None,
    )?;

    // Вставить данные
    session.execute(
        "INSERT INTO logs (id, msg) VALUES (1, 'Hello'), (2, 'World')",
        None,
    )?;

    // Выполнить запрос данных
    let result = session.execute(
        "SELECT * FROM logs ORDER BY id",
        Some(&[Arg::OutputFormat(OutputFormat::JSONEachRow)]),
    )?;

    println!("Результаты запроса:\n{}", result.data_utf8()?);

    // Получить статистику запроса
    println!("Прочитано строк: {}", result.rows_read());
    println!("Прочитано байт: {}", result.bytes_read());
    println!("Время выполнения запроса: {:?}", result.elapsed());

    Ok(())
}
```


## Сборка и тестирование {#building-testing}

### Сборка проекта {#build-the-project}

```bash
cargo build
```

### Запуск тестов {#run-tests}

```bash
cargo test
```

### Зависимости для разработки {#development-dependencies}

Проект включает следующие зависимости для разработки:

- `bindgen` (v0.70.1) — генерация FFI-привязок из заголовочных файлов C
- `tempdir` (v0.3.7) — работа с временными директориями в тестах
- `thiserror` (v1) — утилиты для обработки ошибок


## Обработка ошибок {#error-handling}

chDB Rust предоставляет полную обработку ошибок через перечисление `Error`:

```rust
use chdb_rust::{execute, error::Error};

match execute("SELECT 1", None) {
    Ok(result) => {
        println!("Успешно: {}", result.data_utf8()?);
    },
    Err(Error::QueryError(msg)) => {
        eprintln!("Ошибка выполнения запроса: {}", msg);
    },
    Err(Error::NoResult) => {
        eprintln!("Результат не возвращён");
    },
    Err(Error::NonUtf8Sequence(e)) => {
        eprintln!("Некорректная последовательность UTF-8: {}", e);
    },
    Err(e) => {
        eprintln!("Другая ошибка: {}", e);
    }
}
```


## Репозиторий GitHub {#github-repository}

Репозиторий проекта на GitHub: [chdb-io/chdb-rust](https://github.com/chdb-io/chdb-rust).
