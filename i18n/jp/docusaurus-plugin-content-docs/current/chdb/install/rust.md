---
title: 'Rust 向け chDB のインストール'
sidebar_label: 'Rust'
slug: /chdb/install/rust
description: 'chDB の Rust バインディングのインストールと使用方法'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'rust', 'install', 'ffi', 'bindings']
doc_type: 'guide'
---



# Rust 向け chDB {#chdb-for-rust}

chDB-rust は chDB 向けの実験的な FFI（Foreign Function Interface）バインディングを提供し、外部への依存関係なしに Rust アプリケーション内から直接 ClickHouse クエリを実行できるようにします。



## インストール

### libchdb のインストール

chDB ライブラリをインストールします。

```bash
curl -sL https://lib.chdb.io | bash
```


## 使用方法

chDB Rust は、ステートレスおよびステートフルの 2 種類のクエリ実行モードを提供します。

### ステートレスモードでの利用

永続的な状態を保持する必要のないシンプルなクエリ向け:

```rust
use chdb_rust::{execute, arg::Arg, format::OutputFormat};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // シンプルなクエリを実行
    let result = execute(
        "SELECT version()",
        Some(&[Arg::OutputFormat(OutputFormat::JSONEachRow)])
    )?;
    println!("ClickHouseのバージョン: {}", result.data_utf8()?);
    
    // CSVファイルに対するクエリ
    let result = execute(
        "SELECT * FROM file('data.csv', 'CSV')",
        Some(&[Arg::OutputFormat(OutputFormat::JSONEachRow)])
    )?;
    println!("CSVデータ: {}", result.data_utf8()?);
    
    Ok(())
}
```

### ステートフルな利用（セッション）

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
    // データベースストレージ用の一時ディレクトリを作成
    let tmp = TempDir::new("chdb-rust")?;
    
    // 設定を使用してセッションを構築
    let session = SessionBuilder::new()
        .with_data_path(tmp.path())
        .with_arg(Arg::LogLevel(LogLevel::Debug))
        .with_auto_cleanup(true)  // ドロップ時に自動クリーンアップ
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

    // データをクエリ実行
    let result = session.execute(
        "SELECT * FROM logs ORDER BY id",
        Some(&[Arg::OutputFormat(OutputFormat::JSONEachRow)]),
    )?;

    println!("クエリ結果:\n{}", result.data_utf8()?);
    
    // クエリ統計情報を取得
    println!("読み取り行数: {}", result.rows_read());
    println!("読み取りバイト数: {}", result.bytes_read());
    println!("クエリ実行時間: {:?}", result.elapsed());

    Ok(())
}
```


## ビルドとテスト

### プロジェクトをビルドする

```bash
cargo build
```

### テストの実行

```bash
cargo test
```

### 開発用依存関係

このプロジェクトには、以下の開発用依存関係が含まれています。

* `bindgen` (v0.70.1) - C ヘッダーから FFI バインディングを生成
* `tempdir` (v0.3.7) - テスト用の一時ディレクトリ処理
* `thiserror` (v1) - エラー処理ユーティリティ


## エラー処理

chDB Rust は、`Error` 列挙型を通じて包括的なエラー処理機能を提供します。

```rust
use chdb_rust::{execute, error::Error};

match execute("SELECT 1", None) {
    Ok(result) => {
        println!("成功: {}", result.data_utf8()?);
    },
    Err(Error::QueryError(msg)) => {
        eprintln!("クエリ失敗: {}", msg);
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


## GitHub リポジトリ {#github-repository}

このプロジェクトの GitHub リポジトリは [chdb-io/chdb-rust](https://github.com/chdb-io/chdb-rust) で公開されています。
