---
title: 'Rust 向け chDB のインストール'
sidebar_label: 'Rust'
slug: /chdb/install/rust
description: 'Rust 用 chDB バインディングのインストールと使用方法'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'rust', 'install', 'ffi', 'bindings']
doc_type: 'guide'
---



# Rust用chDB {#chdb-for-rust}

chDB-rustは、chDB向けの実験的なFFI（Foreign Function Interface）バインディングを提供し、外部依存なしでRustアプリケーション内でClickHouseクエリを直接実行できます。


## インストール {#installation}

### libchdbのインストール {#install-libchdb}

chDBライブラリをインストールします:

```bash
curl -sL https://lib.chdb.io | bash
```


## 使用方法 {#usage}

chDB Rustは、ステートレスとステートフルの両方のクエリ実行モードを提供します。

### ステートレスな使用方法 {#stateless-usage}

永続的な状態を持たないシンプルなクエリの場合:

```rust
use chdb_rust::{execute, arg::Arg, format::OutputFormat};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // シンプルなクエリを実行
    let result = execute(
        "SELECT version()",
        Some(&[Arg::OutputFormat(OutputFormat::JSONEachRow)])
    )?;
    println!("ClickHouseバージョン: {}", result.data_utf8()?);

    // CSVファイルに対するクエリ
    let result = execute(
        "SELECT * FROM file('data.csv', 'CSV')",
        Some(&[Arg::OutputFormat(OutputFormat::JSONEachRow)])
    )?;
    println!("CSVデータ: {}", result.data_utf8()?);

    Ok(())
}
```

### ステートフルな使用方法（セッション） {#stateful-usage-sessions}

データベースやテーブルなどの永続的な状態を必要とするクエリの場合:

```rust
use chdb_rust::{
    session::SessionBuilder,
    arg::Arg,
    format::OutputFormat,
    log_level::LogLevel
};
use tempdir::TempDir;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // データベースストレージ用の一時ディレクトリを作成
    let tmp = TempDir::new("chdb-rust")?;

    // 設定を使用してセッションを構築
    let session = SessionBuilder::new()
        .with_data_path(tmp.path())
        .with_arg(Arg::LogLevel(LogLevel::Debug))
        .with_auto_cleanup(true)  // ドロップ時にクリーンアップ
        .build()?;

    // データベースとテーブルを作成
    session.execute(
        "CREATE DATABASE demo; USE demo",
        Some(&[Arg::MultiQuery])
    )?;

    session.execute(
        "CREATE TABLE logs (id UInt64, msg String) ENGINE = MergeTree() ORDER BY id",
        None,
    )?;

    // データを挿入
    session.execute(
        "INSERT INTO logs (id, msg) VALUES (1, 'Hello'), (2, 'World')",
        None,
    )?;

    // データをクエリ
    let result = session.execute(
        "SELECT * FROM logs ORDER BY id",
        Some(&[Arg::OutputFormat(OutputFormat::JSONEachRow)]),
    )?;

    println!("クエリ結果:\n{}", result.data_utf8()?);

    // クエリ統計を取得
    println!("読み取った行数: {}", result.rows_read());
    println!("読み取ったバイト数: {}", result.bytes_read());
    println!("クエリ時間: {:?}", result.elapsed());

    Ok(())
}
```


## ビルドとテスト {#building-testing}

### プロジェクトのビルド {#build-the-project}

```bash
cargo build
```

### テストの実行 {#run-tests}

```bash
cargo test
```

### 開発用の依存関係 {#development-dependencies}

このプロジェクトには以下の開発用依存関係が含まれています:

- `bindgen` (v0.70.1) - CヘッダーからFFIバインディングを生成
- `tempdir` (v0.3.7) - テストでの一時ディレクトリ処理
- `thiserror` (v1) - エラー処理ユーティリティ


## エラー処理 {#error-handling}

chDB Rustは、`Error`列挙型による包括的なエラー処理を提供します:

```rust
use chdb_rust::{execute, error::Error};

match execute("SELECT 1", None) {
    Ok(result) => {
        println!("成功: {}", result.data_utf8()?);
    },
    Err(Error::QueryError(msg)) => {
        eprintln!("クエリが失敗しました: {}", msg);
    },
    Err(Error::NoResult) => {
        eprintln!("結果が返されませんでした");
    },
    Err(Error::NonUtf8Sequence(e)) => {
        eprintln!("無効なUTF-8: {}", e);
    },
    Err(e) => {
        eprintln!("その他のエラー: {}", e);
    }
}
```


## GitHubリポジトリ {#github-repository}

プロジェクトのGitHubリポジトリは[chdb-io/chdb-rust](https://github.com/chdb-io/chdb-rust)で確認できます。
