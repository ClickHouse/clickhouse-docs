---
title: 'NodeJSのためのchDBのインストール'
sidebar_label: 'NodeJS'
slug: /chdb/install/nodejs
description: 'NodeJSのためのchDBのインストール方法'
keywords: ['chdb', '組込み', 'clickhouse-lite', 'NodeJS', 'インストール']
---
```


# NodeJSのためのchDBのインストール

## 要件 {#requirements}

[libchdb](https://github.com/chdb-io/chdb)をインストールします。

```bash
curl -sL https://lib.chdb.io | bash
```

## インストール {#install}

```bash
npm i chdb
```

## GitHubリポジトリ {#github-repository}

プロジェクトのGitHubリポジトリは[chdb-io/chdb-node](https://github.com/chdb-io/chdb-node)で見つけることができます。

## 使用法 {#usage}

NodeJSアプリケーションでchdbの力を活用するには、chdb-nodeモジュールをインポートして使用します。

```javascript
const { query, Session } = require("chdb");

var ret;

// スタンドアロンのクエリテスト
ret = query("SELECT version(), 'Hello chDB', chdb()", "CSV");
console.log("スタンドアロンのクエリ結果:", ret);

// セッションクエリのテスト
// 新しいセッションインスタンスを作成
const session = new Session("./chdb-node-tmp");
ret = session.query("SELECT 123", "CSV")
console.log("セッションクエリ結果:", ret);
ret = session.query("CREATE DATABASE IF NOT EXISTS testdb;" +
    "CREATE TABLE IF NOT EXISTS testdb.testtable (id UInt32) ENGINE = MergeTree() ORDER BY id;");

session.query("USE testdb; INSERT INTO testtable VALUES (1), (2), (3);")

ret = session.query("SELECT * FROM testtable;")
console.log("セッションクエリ結果:", ret);

// セッションをクリーンアップ
session.cleanup();
```

## ソースからビルド {#build-from-source}

```bash
npm run libchdb
npm install
npm run test
