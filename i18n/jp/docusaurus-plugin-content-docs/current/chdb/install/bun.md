---
title: 'Bun 向け chDB'
sidebar_label: 'Bun'
slug: /chdb/install/bun
description: 'Bun ランタイムで chDB をインストールして使う方法'
keywords: ['chdb', 'bun', 'javascript', 'typescript', 'embedded', 'clickhouse', 'sql', 'olap']
doc_type: 'guide'
---



# Bun 向け chDB

`chDB-bun` は chDB 用の実験的な FFI（Foreign Function Interface）バインディングを提供し、外部への依存なしに Bun アプリケーション内から直接 ClickHouse クエリを実行できるようにします。



## インストール {#installation}

### ステップ1: システム依存関係をインストールする {#install-system-dependencies}

まず、必要なシステム依存関係をインストールします:

#### libchdbをインストールする {#install-libchdb}

```bash
curl -sL https://lib.chdb.io | bash
```

#### ビルドツールをインストールする {#install-build-tools}

システムに`gcc`または`clang`のいずれかをインストールする必要があります:

### ステップ2: chDB-bunをインストールする {#install-chdb-bun}


```bash
# GitHubリポジトリからインストール
bun add github:chdb-io/chdb-bun
```


# またはローカル環境でクローンしてビルドする

git clone [https://github.com/chdb-io/chdb-bun.git](https://github.com/chdb-io/chdb-bun.git)
cd chdb-bun
bun install
bun run build

```
```


## 使用方法 {#usage}

chDB-bunは2つのクエリモードをサポートしています:1回限りの操作のための一時クエリと、データベース状態を維持するための永続セッションです。

### 一時クエリ {#ephemeral-queries}

永続的な状態を必要としないシンプルな1回限りのクエリの場合:

```typescript
import { query } from "chdb-bun"

// 基本的なクエリ
const result = query("SELECT version()", "CSV")
console.log(result) // "23.10.1.1"

// 異なる出力形式でのクエリ
const jsonResult = query("SELECT 1 as id, 'Hello' as message", "JSON")
console.log(jsonResult)

// 計算を含むクエリ
const mathResult = query("SELECT 2 + 2 as sum, pi() as pi_value", "Pretty")
console.log(mathResult)

// システム情報のクエリ
const systemInfo = query("SELECT * FROM system.functions LIMIT 5", "CSV")
console.log(systemInfo)
```

### 永続セッション {#persistent-sessions}

クエリ間で状態を維持する必要がある複雑な操作の場合:

```typescript
import { Session } from "chdb-bun"

// 永続ストレージを持つセッションを作成
const sess = new Session("./chdb-bun-tmp")

try {
  // データベースとテーブルを作成
  sess.query(
    `
        CREATE DATABASE IF NOT EXISTS mydb;
        CREATE TABLE IF NOT EXISTS mydb.users (
            id UInt32,
            name String,
            email String
        ) ENGINE = MergeTree() ORDER BY id
    `,
    "CSV"
  )

  // データを挿入
  sess.query(
    `
        INSERT INTO mydb.users VALUES 
        (1, 'Alice', 'alice@example.com'),
        (2, 'Bob', 'bob@example.com'),
        (3, 'Charlie', 'charlie@example.com')
    `,
    "CSV"
  )

  // データをクエリ
  const users = sess.query("SELECT * FROM mydb.users ORDER BY id", "JSON")
  console.log("Users:", users)

  // カスタム関数を作成して使用
  sess.query("CREATE FUNCTION IF NOT EXISTS hello AS () -> 'Hello chDB'", "CSV")
  const greeting = sess.query("SELECT hello() as message", "Pretty")
  console.log(greeting)

  // 集計クエリ
  const stats = sess.query(
    `
        SELECT 
            COUNT(*) as total_users,
            MAX(id) as max_id,
            MIN(id) as min_id
        FROM mydb.users
    `,
    "JSON"
  )
  console.log("Statistics:", stats)
} finally {
  // リソースを解放するため、常にセッションをクリーンアップ
  sess.cleanup() // データベースファイルを削除
}
```
