---
'title': 'RustのためのchDBのインストール'
'sidebar_label': 'Rust'
'slug': '/chdb/install/rust'
'description': 'chDB Rust バインディングのインストールと使用方法'
'keywords':
- 'chdb'
- 'embedded'
- 'clickhouse-lite'
- 'rust'
- 'install'
- 'ffi'
- 'bindings'
'doc_type': 'guide'
---


# chDB for Rust {#chdb-for-rust}

chDB-rustは、chDBの実験的なFFI（Foreign Function Interface）バインディングを提供し、ClickHouseクエリをRustアプリケーションで外部依存関係なしに直接実行できるようにします。

## Installation {#installation}

### Install libchdb {#install-libchdb}

chDBライブラリをインストールします：

```bash
curl -sL https://lib.chdb.io | bash
```

## Usage {#usage}

chDB Rustは、ステートレスおよびステートフルなクエリ実行モードの両方を提供します。

### Stateless usage {#stateless-usage}

永続的な状態なしでのシンプルなクエリの場合：

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

### Stateful usage (Sessions) {#stateful-usage-sessions}

データベースやテーブルのような永続的な状態を必要とするクエリの場合：

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

## Building and testing {#building-testing}

### Build the project {#build-the-project}

```bash
cargo build
```

### Run tests {#run-tests}

```bash
cargo test
```

### Development dependencies {#development-dependencies}

プロジェクトには以下の開発依存関係が含まれています：
- `bindgen` (v0.70.1) - CヘッダーからFFIバインディングを生成
- `tempdir` (v0.3.7) - テストにおける一時ディレクトリの処理
- `thiserror` (v1) - エラーハンドリングユーティリティ

## Error handling {#error-handling}

chDB Rustは、`Error`列挙型を通じて包括的なエラーハンドリングを提供します：

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

## GitHub repository {#github-repository}

プロジェクトのGitHubリポジトリは、[chdb-io/chdb-rust](https://github.com/chdb-io/chdb-rust)で見つけることができます。
