---
'title': 'Installing chDB for Rust'
'sidebar_label': 'Rust'
'slug': '/chdb/install/rust'
'description': 'chDB Rust 바인딩을 설치하고 사용하는 방법'
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

chDB-rust는 chDB에 대한 실험적 FFI (Foreign Function Interface) 바인딩을 제공하여, Rust 애플리케이션에서 ClickHouse 쿼리를 외부 의존성 없이 직접 실행할 수 있게 해줍니다.

## 설치 {#installation}

### libchdb 설치 {#install-libchdb}

chDB 라이브러리를 설치합니다:

```bash
curl -sL https://lib.chdb.io | bash
```

## 사용법 {#usage}

chDB Rust는 무상태 및 유상태 쿼리 실행 모드를 모두 제공합니다.

### 무상태 사용법 {#stateless-usage}

지속적인 상태 없이 간단한 쿼리를 위한 경우:

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

### 유상태 사용법 (세션) {#stateful-usage-sessions}

데이터베이스 및 테이블과 같이 지속적인 상태가 필요한 쿼리의 경우:

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

## 빌드 및 테스트 {#building-testing}

### 프로젝트 빌드 {#build-the-project}

```bash
cargo build
```

### 테스트 실행 {#run-tests}

```bash
cargo test
```

### 개발 의존성 {#development-dependencies}

프로젝트에는 다음과 같은 개발 의존성이 포함되어 있습니다:
- `bindgen` (v0.70.1) - C 헤더에서 FFI 바인딩 생성
- `tempdir` (v0.3.7) - 테스트용 임시 디렉토리 처리
- `thiserror` (v1) - 오류 처리 유틸리티

## 오류 처리 {#error-handling}

chDB Rust는 `Error` 열거형을 통해 포괄적인 오류 처리를 제공합니다:

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

## GitHub 리포지토리 {#github-repository}

프로젝트에 대한 GitHub 리포지토리는 [chdb-io/chdb-rust](https://github.com/chdb-io/chdb-rust)에서 확인할 수 있습니다.
