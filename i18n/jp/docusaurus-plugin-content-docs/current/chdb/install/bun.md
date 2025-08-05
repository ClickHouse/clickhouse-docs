---
title: 'Bun 用の chDB のインストール'
sidebar_label: 'Bun'
slug: '/chdb/install/bun'
description: 'Bun 用の chDB のインストール方法'
keywords:
- 'chdb'
- 'embedded'
- 'clickhouse-lite'
- 'bun'
- 'install'
---




# Bun用の chDB のインストール

## 要件 {#requirements}

[libchdb](https://github.com/chdb-io/chdb) をインストールします:

```bash
curl -sL https://lib.chdb.io | bash
```

## インストール {#install}

参照: [chdb-bun](https://github.com/chdb-io/chdb-bun)

## GitHub リポジトリ {#github-repository}

プロジェクトの GitHub リポジトリは [chdb-io/chdb-bun](https://github.com/chdb-io/chdb-bun) で見つけることができます。

## 使用法 {#usage}

### Query(query, *format) (エフェメラル) {#queryquery-format-ephemeral}

```javascript
// クエリ (エフェメラル)
var result = query("SELECT version()", "CSV");
console.log(result); // 23.10.1.1
```

<!-- vale ClickHouse.Headings = NO -->
### Session.Query(query, *format) {#sessionqueryquery-format}
<!-- vale ClickHouse.Headings = YES -->

```javascript
const sess = new Session('./chdb-bun-tmp');

// セッションでのクエリ (永続的)
sess.query("CREATE FUNCTION IF NOT EXISTS hello AS () -> 'Hello chDB'", "CSV");
var result = sess.query("SELECT hello()", "CSV");
console.log(result);

// クリーンアップ前に、`./chdb-bun-tmp` にデータベースファイルが見つかります。

sess.cleanup(); // セッションをクリーンアップします。これによりデータベースが削除されます。
```
