---
title: 'NodeJS 用の chDB のインストール'
sidebar_label: 'NodeJS'
slug: '/chdb/install/nodejs'
description: 'NodeJS 用の chDB のインストール方法'
keywords:
- 'chdb'
- 'embedded'
- 'clickhouse-lite'
- 'NodeJS'
- 'install'
---




# chDBのNodeJS用インストール

## 要件 {#requirements}

[libchdb](https://github.com/chdb-io/chdb)をインストールします:

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

NodeJSアプリケーションでchdbの力を活用するために、chdb-nodeモジュールをインポートして使用します:

```javascript
const { query, Session } = require("chdb");

var ret;

// スタンドアロンクエリをテスト
ret = query("SELECT version(), 'Hello chDB', chdb()", "CSV");
console.log("スタンドアロンクエリの結果:", ret);

// セッションクエリをテスト
// 新しいセッションインスタンスを作成
const session = new Session("./chdb-node-tmp");
ret = session.query("SELECT 123", "CSV")
console.log("セッションクエリの結果:", ret);
ret = session.query("CREATE DATABASE IF NOT EXISTS testdb;" +
    "CREATE TABLE IF NOT EXISTS testdb.testtable (id UInt32) ENGINE = MergeTree() ORDER BY id;");

session.query("USE testdb; INSERT INTO testtable VALUES (1), (2), (3);")

ret = session.query("SELECT * FROM testtable;")
console.log("セッションクエリの結果:", ret);

// セッションをクリーンアップ
session.cleanup();
```

## ソースからビルド {#build-from-source}

```bash
npm run libchdb
npm install
npm run test
```
