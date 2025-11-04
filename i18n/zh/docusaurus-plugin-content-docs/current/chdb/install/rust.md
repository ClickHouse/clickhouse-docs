---
'title': '安装 chDB 以用于 Rust'
'sidebar_label': 'Rust'
'slug': '/chdb/install/rust'
'description': '如何安装和使用 chDB Rust 绑定'
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

chDB-rust 提供实验性的 FFI（外部函数接口）绑定，用于 chDB，使您能够在 Rust 应用程序中直接运行 ClickHouse 查询，而无需任何外部依赖。

## Installation {#installation}

### Install libchdb {#install-libchdb}

安装 chDB 库：

```bash
curl -sL https://lib.chdb.io | bash
```

## Usage {#usage}

chDB Rust 提供无状态和有状态查询执行模式。

### Stateless usage {#stateless-usage}

对于没有持久状态的简单查询：

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

对于需要持久状态的查询，如数据库和表：

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

该项目包括以下开发依赖：
- `bindgen` (v0.70.1) - 从 C 头文件生成 FFI 绑定
- `tempdir` (v0.3.7) - 在测试中处理临时目录
- `thiserror` (v1) - 错误处理工具

## Error handling {#error-handling}

chDB Rust 通过 `Error` 枚举提供全面的错误处理：

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

您可以在 [chdb-io/chdb-rust](https://github.com/chdb-io/chdb-rust) 找到该项目的 GitHub 仓库。
