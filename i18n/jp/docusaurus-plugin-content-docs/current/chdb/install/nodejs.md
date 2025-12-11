---
title: 'Node.js 向け chDB'
sidebar_label: 'Node.js'
slug: /chdb/install/nodejs
description: 'Node.js での chDB のインストールと使用方法'
keywords: ['chdb', 'nodejs', 'javascript', 'embedded', 'clickhouse', 'sql', 'olap']
doc_type: 'guide'
---

# Node.js 向け chDB {#chdb-for-nodejs}

chDB-node は chDB の Node.js バインディングを提供し、外部依存なしで Node.js アプリケーション内から直接 ClickHouse クエリを実行できるようにします。

## インストール {#installation}

```bash
npm install chdb
```

## 使用方法 {#usage}

chDB-node は 2 つのクエリモードをサポートしています。単純な操作向けのスタンドアロン クエリと、データベース状態を維持するためのセッションベースのクエリです。

### スタンドアロン クエリ {#standalone-queries}

永続的な状態を必要としない、単発のクエリの場合:

```javascript
const { query } = require("chdb");

// 基本的なクエリ
const result = query("SELECT version()", "CSV");
console.log("ClickHouseバージョン:", result);

// 複数列を使用したクエリ
const multiResult = query("SELECT 'Hello' as greeting, 'chDB' as engine, 42 as answer", "CSV");
console.log("複数列の結果:", multiResult);

// 数学演算
const mathResult = query("SELECT 2 + 2 as sum, pi() as pi_value", "JSON");
console.log("数学演算の結果:", mathResult);

// システム情報
const systemInfo = query("SELECT * FROM system.functions LIMIT 5", "Pretty");
console.log("システム関数:", systemInfo);
```

### セッション単位のクエリ {#session-based-queries}

```javascript
const { Session } = require("chdb");

// 永続ストレージを使用したセッションを作成
const session = new Session("./chdb-node-data");

try {
    // データベースとテーブルを作成
    session.query(`
        CREATE DATABASE IF NOT EXISTS myapp;
        CREATE TABLE IF NOT EXISTS myapp.users (
            id UInt32,
            name String,
            email String,
            created_at DateTime DEFAULT now()
        ) ENGINE = MergeTree() ORDER BY id
    `);

    // サンプルデータを挿入
    session.query(`
        INSERT INTO myapp.users (id, name, email) VALUES 
        (1, 'Alice', 'alice@example.com'),
        (2, 'Bob', 'bob@example.com'),
        (3, 'Charlie', 'charlie@example.com')
    `);

    // 異なる形式でデータをクエリ
    const csvResult = session.query("SELECT * FROM myapp.users ORDER BY id", "CSV");
    console.log("CSV Result:", csvResult);

    const jsonResult = session.query("SELECT * FROM myapp.users ORDER BY id", "JSON");
    console.log("JSON Result:", jsonResult);

    // 集計クエリ
    const stats = session.query(`
        SELECT 
            COUNT(*) as total_users,
            MAX(id) as max_id,
            MIN(created_at) as earliest_signup
        FROM myapp.users
    `, "Pretty");
    console.log("User Statistics:", stats);

} finally {
    // セッションを必ずクリーンアップ
    session.cleanup(); // データベースファイルを削除
}
```

### 外部データの処理 {#processing-external-data}

```javascript
const { Session } = require("chdb");

const session = new Session("./data-processing");

try {
    // URLからCSVデータを処理
    const result = session.query(`
        SELECT 
            COUNT(*) as total_records,
            COUNT(DISTINCT "UserID") as unique_users
        FROM url('https://datasets.clickhouse.com/hits/hits.csv', 'CSV') 
        LIMIT 1000
    `, "JSON");
    
    console.log("外部データ分析:", result);

    // 外部データからテーブルを作成
    session.query(`
        CREATE TABLE web_analytics AS
        SELECT * FROM url('https://datasets.clickhouse.com/hits/hits.csv', 'CSV')
        LIMIT 10000
    `);

    // インポートしたデータを分析
    const analysis = session.query(`
        SELECT 
            toDate("EventTime") as date,
            COUNT(*) as events,
            COUNT(DISTINCT "UserID") as unique_users
        FROM web_analytics
        GROUP BY date
        ORDER BY date
        LIMIT 10
    `, "Pretty");
    
    console.log("日次分析:", analysis);

} finally {
    session.cleanup();
}
```

## エラー処理 {#error-handling}

chDB を使用する際は、常にエラーを適切に処理してください。

```javascript
const { query, Session } = require("chdb");

// スタンドアロンクエリのエラーハンドリング
function safeQuery(sql, format = "CSV") {
    try {
        const result = query(sql, format);
        return { success: true, data: result };
    } catch (error) {
        console.error("クエリエラー:", error.message);
        return { success: false, error: error.message };
    }
}

// 使用例
const result = safeQuery("SELECT invalid_syntax");
if (result.success) {
    console.log("クエリ結果:", result.data);
} else {
    console.log("クエリ失敗:", result.error);
}

// セッションのエラーハンドリング
function safeSessionQuery() {
    const session = new Session("./error-test");
    
    try {
        // 無効な構文のためエラーがスローされます
        const result = session.query("CREATE TABLE invalid syntax", "CSV");
        console.log("予期しない成功:", result);
    } catch (error) {
        console.error("セッションクエリエラー:", error.message);
    } finally {
        // エラー発生時も必ずクリーンアップを実行
        session.cleanup();
    }
}

safeSessionQuery();
```

## GitHub リポジトリ {#github-repository}

- **GitHub リポジトリ**: [chdb-io/chdb-node](https://github.com/chdb-io/chdb-node)
- **Issue およびサポート**: [GitHub リポジトリ](https://github.com/chdb-io/chdb-node/issues) で Issue を報告してください
- **NPM パッケージ**: [npm 上の chdb](https://www.npmjs.com/package/chdb)
