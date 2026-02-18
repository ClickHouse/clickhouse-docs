---
title: 'Rust용 chDB 설치'
sidebar_label: 'Rust'
slug: /chdb/install/rust
description: 'chDB Rust 바인딩 설치 및 사용 방법'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'rust', 'install', 'ffi', 'bindings']
doc_type: 'guide'
---



# Rust용 chDB \{#chdb-for-rust\}

chDB-rust는 chDB를 위한 실험적인 FFI(Foreign Function Interface) 바인딩을 제공하며, 이를 통해 Rust 애플리케이션 내에서 외부 종속성 없이 ClickHouse 쿼리를 직접 실행할 수 있도록 합니다.



## 설치 \{#installation\}

### libchdb 설치 \{#install-libchdb\}

chDB 라이브러리를 설치합니다:

```bash
curl -sL https://lib.chdb.io | bash
```


## 사용 방법 \{#usage\}

chDB Rust는 상태 비저장 쿼리 실행 모드와 상태 저장 쿼리 실행 모드를 모두 제공합니다.

### 상태 비저장 사용 \{#stateless-usage\}

지속되는 상태 없이 단순한 쿼리를 실행하는 경우:

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

### 상태 저장 사용(세션) \{#stateful-usage-sessions\}

데이터베이스나 테이블처럼 상태를 지속적으로 유지해야 하는 쿼리의 경우:

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


## 빌드 및 테스트 \{#building-testing\}

### 프로젝트 빌드 \{#build-the-project\}

```bash
cargo build
```

### 테스트 실행 \{#run-tests\}

```bash
cargo test
```

### 개발용 의존성 \{#development-dependencies\}

프로젝트에는 다음 개발용 의존성이 포함됩니다:

* `bindgen` (v0.70.1) - C 헤더로부터 FFI 바인딩을 생성
* `tempdir` (v0.3.7) - 테스트에서 임시 디렉터리를 처리
* `thiserror` (v1) - 오류 처리 유틸리티


## 오류 처리 \{#error-handling\}

chDB Rust는 `Error` enum을 통해 전반적인 오류 처리를 지원합니다:

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


## GitHub 저장소 \{#github-repository\}

이 프로젝트의 GitHub 저장소는 [chdb-io/chdb-rust](https://github.com/chdb-io/chdb-rust)에 있습니다.
