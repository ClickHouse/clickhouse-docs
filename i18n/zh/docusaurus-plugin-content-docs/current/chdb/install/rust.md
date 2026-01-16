---
title: '在 Rust 中安装 chDB'
sidebar_label: 'Rust'
slug: /chdb/install/rust
description: '如何安装和使用 chDB 的 Rust 绑定'
keywords: ['chdb', '嵌入式', 'clickhouse-lite', 'rust', '安装', 'ffi', '绑定']
doc_type: 'guide'
---

# 适用于 Rust 的 chDB \\{#chdb-for-rust\\}

chDB-rust 为 chDB 提供了实验性的 FFI（外部函数接口）绑定，使你可以在 Rust 应用程序中直接运行 ClickHouse 查询，而无需任何外部依赖。

## 安装 \\{#installation\\}

### 安装 libchdb \\{#install-libchdb\\}

安装 libchdb 库：

```bash
curl -sL https://lib.chdb.io | bash
```

## 使用方法 \\{#usage\\}

chDB Rust 提供无状态和有状态两种查询执行模式。

### 无状态使用 \\{#stateless-usage\\}

适用于不需要保存状态的简单查询：

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

### 有状态使用（会话） \\{#stateful-usage-sessions\\}

对于需要持久状态（例如数据库和数据表）的查询：

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

## 构建与测试 \\{#building-testing\\}

### 构建项目 \\{#build-the-project\\}

```bash
cargo build
```

### 运行测试 \\{#run-tests\\}

```bash
cargo test
```

### 开发依赖 \\{#development-dependencies\\}

该项目包含以下开发依赖项：

* `bindgen` (v0.70.1) - 从 C 头文件生成 FFI 绑定
* `tempdir` (v0.3.7) - 用于测试中的临时目录管理
* `thiserror` (v1) - 错误处理工具库

## 错误处理 \\{#error-handling\\}

chDB Rust 通过 `Error` 枚举提供了完善的错误处理机制：

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

## GitHub 仓库 \\{#github-repository\\}

该项目的 GitHub 仓库位于 [chdb-io/chdb-rust](https://github.com/chdb-io/chdb-rust)。
