---
title: chDBのBunへのインストール
sidebar_label: Bun
slug: /chdb/install/bun
description: BunへのchDBのインストール方法
keywords: [chdb, 埋め込み, clickhouse-lite, bun, インストール]
---


# chDBのBunへのインストール

## 要件 {#requirements}

[libchdb](https://github.com/chdb-io/chdb)をインストールします：

```bash
curl -sL https://lib.chdb.io | bash
```

## インストール {#install}

詳細は、[chdb-bun](https://github.com/chdb-io/chdb-bun)をご覧ください。

## GitHubリポジトリ {#github-repository}

プロジェクトのGitHubリポジトリは[chdb-io/chdb-bun](https://github.com/chdb-io/chdb-bun)で見つけることができます。

## 使用法 {#usage}

### Query(query, *format) (エフェメラル) {#queryquery-format-ephemeral}

```javascript
import { query } from 'chdb-bun';

// クエリ (エフェメラル)
var result = query("SELECT version()", "CSV");
console.log(result); // 23.10.1.1
```

### Session.Query(query, *format) {#sessionqueryquery-format}

```javascript
import { Session } from 'chdb-bun';
const sess = new Session('./chdb-bun-tmp');

// クエリセッション (永続的)
sess.query("CREATE FUNCTION IF NOT EXISTS hello AS () -> 'Hello chDB'", "CSV");
var result = sess.query("SELECT hello()", "CSV");
console.log(result);

// クリーンアップ前に、データベースファイルは`./chdb-bun-tmp`にあります

sess.cleanup(); // セッションをクリーンアップします。これによりデータベースが削除されます
```
