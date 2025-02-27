---
title: Bun用のchDBのインストール
sidebar_label: Bun
slug: /chdb/install/bun
description: Bun用のchDBのインストール方法
keywords: [chdb, 埋め込み, clickhouse-lite, bun, インストール]
---

# Bun用のchDBのインストール

## 要件 {#requirements}

[libchdb](https://github.com/chdb-io/chdb)をインストールします:

```bash
curl -sL https://lib.chdb.io | bash
```

## インストール {#install}

詳細は、[chdb-bun](https://github.com/chdb-io/chdb-bun)を参照してください。

## GitHubリポジトリ {#github-repository}

プロジェクトのGitHubリポジトリは、[chdb-io/chdb-bun](https://github.com/chdb-io/chdb-bun)で見つけることができます。

## 使用法 {#usage}

### Query(query, *format) (一時的) {#queryquery-format-ephemeral}

```javascript
import { query } from 'chdb-bun';

// クエリ (一時的)
var result = query("SELECT version()", "CSV");
console.log(result); // 23.10.1.1
```

### Session.Query(query, *format) {#sessionqueryquery-format}

```javascript
import { Session } from 'chdb-bun';
const sess = new Session('./chdb-bun-tmp');

// セッションによるクエリ (永続的)
sess.query("CREATE FUNCTION IF NOT EXISTS hello AS () -> 'Hello chDB'", "CSV");
var result = sess.query("SELECT hello()", "CSV");
console.log(result);

// クリーンアップ前に、データベースファイルは`./chdb-bun-tmp`にあります

sess.cleanup(); // セッションをクリーンアップし、これによりデータベースが削除されます
```
