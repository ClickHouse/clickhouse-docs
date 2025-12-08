---
title: 'Bun 向け chDB'
sidebar_label: 'Bun'
slug: /chdb/install/bun
description: 'Bun ランタイム環境で chDB をインストールして使用する方法'
keywords: ['chdb', 'bun', 'javascript', 'typescript', 'embedded', 'clickhouse', 'sql', 'olap']
doc_type: 'guide'
---

# Bun 向け chDB {#chdb-for-bun}

chDB-bun は chDB に対する実験的な FFI（Foreign Function Interface）バインディングを提供し、外部への依存なしに Bun アプリケーションから直接 ClickHouse クエリを実行できるようにします。

## インストール {#installation}

### ステップ 1: システム依存パッケージをインストールする {#install-system-dependencies}

まず、必要なシステム依存パッケージをインストールします。

#### libchdb をインストールする {#install-libchdb}

```bash
curl -sL https://lib.chdb.io | bash
```

#### ビルドツールのインストール {#install-build-tools}

システムに `gcc` または `clang` のいずれかをインストールしておく必要があります。

### ステップ 2: chDB-bun をインストールする {#install-chdb-bun}

```bash
# GitHubリポジトリからインストールする
bun add github:chdb-io/chdb-bun
```

# またはローカル環境でクローンしてビルドする {#install-from-the-github-repository}

git clone [https://github.com/chdb-io/chdb-bun.git](https://github.com/chdb-io/chdb-bun.git)
cd chdb-bun
bun install
bun run build

```
```

## 使用方法

chDB-bun は、1 回限りの処理向けのエフェメラルクエリと、データベースの状態を保持する永続セッションという 2 つのクエリモードをサポートしています。

### エフェメラルクエリ {#persistent-sessions}

永続的な状態を保持する必要がない、単純な一度限りのクエリには次を使用します:

```typescript
import { query } from 'chdb-bun';

// 基本的なクエリ
const result = query("SELECT version()", "CSV");
console.log(result); // "23.10.1.1"

// 異なる出力形式を使用したクエリ
const jsonResult = query("SELECT 1 as id, 'Hello' as message", "JSON");
console.log(jsonResult);

// 計算を含むクエリ
const mathResult = query("SELECT 2 + 2 as sum, pi() as pi_value", "Pretty");
console.log(mathResult);

// システム情報を取得するクエリ
const systemInfo = query("SELECT * FROM system.functions LIMIT 5", "CSV");
console.log(systemInfo);
```

### 永続セッション {#ephemeral-queries}

クエリ間で状態を保持する必要があるような複雑な操作を行う場合：

```typescript
import { Session } from 'chdb-bun';

// 永続ストレージを使用したセッションを作成
const sess = new Session('./chdb-bun-tmp');

try {
    // データベースとテーブルを作成
    sess.query(`
        CREATE DATABASE IF NOT EXISTS mydb;
        CREATE TABLE IF NOT EXISTS mydb.users (
            id UInt32,
            name String,
            email String
        ) ENGINE = MergeTree() ORDER BY id
    `, "CSV");

    // データを挿入
    sess.query(`
        INSERT INTO mydb.users VALUES 
        (1, 'Alice', 'alice@example.com'),
        (2, 'Bob', 'bob@example.com'),
        (3, 'Charlie', 'charlie@example.com')
    `, "CSV");

    // データをクエリ実行
    const users = sess.query("SELECT * FROM mydb.users ORDER BY id", "JSON");
    console.log("ユーザー:", users);

    // カスタム関数を作成して使用
    sess.query("CREATE FUNCTION IF NOT EXISTS hello AS () -> 'Hello chDB'", "CSV");
    const greeting = sess.query("SELECT hello() as message", "Pretty");
    console.log(greeting);

    // 集計クエリ
    const stats = sess.query(`
        SELECT 
            COUNT(*) as total_users,
            MAX(id) as max_id,
            MIN(id) as min_id
        FROM mydb.users
    `, "JSON");
    console.log("統計:", stats);

} finally {
    // リソースを解放するため、必ずセッションをクリーンアップする
    sess.cleanup(); // データベースファイルを削除
}
```
