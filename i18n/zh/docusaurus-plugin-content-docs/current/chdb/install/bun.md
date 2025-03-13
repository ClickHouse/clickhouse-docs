---
title: 为 Bun 安装 chDB
sidebar_label: Bun
slug: /chdb/install/bun
description: 如何为 Bun 安装 chDB
keywords: [chdb, 嵌入式, clickhouse-lite, bun, 安装]
---


# 为 Bun 安装 chDB

## 需求 {#requirements}

安装 [libchdb](https://github.com/chdb-io/chdb):

```bash
curl -sL https://lib.chdb.io | bash
```

## 安装 {#install}

查看: [chdb-bun](https://github.com/chdb-io/chdb-bun)

## GitHub 仓库 {#github-repository}

您可以在 [chdb-io/chdb-bun](https://github.com/chdb-io/chdb-bun) 找到该项目的 GitHub 仓库。

## 用法 {#usage}

### Query(query, *format) (临时) {#queryquery-format-ephemeral}

```javascript
import { query } from 'chdb-bun';

// 查询 (临时)
var result = query("SELECT version()", "CSV");
console.log(result); // 23.10.1.1
```

### Session.Query(query, *format) {#sessionqueryquery-format}

```javascript
import { Session } from 'chdb-bun';
const sess = new Session('./chdb-bun-tmp');

// 查询会话 (持久)
sess.query("CREATE FUNCTION IF NOT EXISTS hello AS () -> 'Hello chDB'", "CSV");
var result = sess.query("SELECT hello()", "CSV");
console.log(result);

// 在清理之前，您可以在 `./chdb-bun-tmp` 找到数据库文件

sess.cleanup(); // 清理会话，这将删除数据库
```
