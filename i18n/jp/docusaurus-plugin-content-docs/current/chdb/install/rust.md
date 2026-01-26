---
title: 'Rust 向け chDB のインストール'
sidebar_label: 'Rust'
slug: /chdb/install/rust
description: 'chDB の Rust バインディングのインストールと使用方法'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'rust', 'install', 'ffi', 'bindings']
doc_type: 'guide'
---

# Rust 向け chDB \{#chdb-for-rust\}

chDB-rust は chDB 向けの実験的な FFI（Foreign Function Interface）バインディングを提供し、外部への依存関係なしに Rust アプリケーション内から直接 ClickHouse クエリを実行できるようにします。

## インストール \{#installation\}

### libchdb のインストール \{#install-libchdb\}

chDB ライブラリをインストールします。

```bash
curl -sL https://lib.chdb.io | bash
```

## 使用方法 \{#usage\}

chDB Rust は、ステートレスおよびステートフルの 2 種類のクエリ実行モードを提供します。

### ステートレスモードでの利用 \{#stateless-usage\}

永続的な状態を保持する必要のないシンプルなクエリ向け:

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

### ステートフルな利用（セッション） \{#stateful-usage-sessions\}

データベースやテーブルなど、永続的な状態を必要とするクエリの場合:

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

## ビルドとテスト \{#building-testing\}

### プロジェクトをビルドする \{#build-the-project\}

```bash
cargo build
```

### テストの実行 \{#run-tests\}

```bash
cargo test
```

### 開発用依存関係 \{#development-dependencies\}

このプロジェクトには、以下の開発用依存関係が含まれています。

* `bindgen` (v0.70.1) - C ヘッダーから FFI バインディングを生成
* `tempdir` (v0.3.7) - テスト用の一時ディレクトリ処理
* `thiserror` (v1) - エラー処理ユーティリティ

## エラー処理 \{#error-handling\}

chDB Rust は、`Error` 列挙型を通じて包括的なエラー処理機能を提供します。

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

## GitHub リポジトリ \{#github-repository\}

このプロジェクトの GitHub リポジトリは [chdb-io/chdb-rust](https://github.com/chdb-io/chdb-rust) で公開されています。
