---
title: Installing chDB for Bun
sidebar_label: Bun
slug: /en/chdb/install/bun
description: How to install chDB for Bun
keywords: [chdb, embedded, clickhouse-lite, bun, install]
---

# Installing chDB for Bun

## Requirements

Install [libchdb](https://github.com/chdb-io/chdb):

```bash
curl -sL https://lib.chdb.io | bash
```

## Install

See: [chdb-bun](https://github.com/chdb-io/chdb-bun)

## GitHub repository

You can find the GitHub repository for the project at [chdb-io/chdb-bun](https://github.com/chdb-io/chdb-bun).

## Usage

### Query(query, *format) (ephemeral)

```javascript
import { query } from 'chdb-bun';

// Query (ephemeral)
var result = query("SELECT version()", "CSV");
console.log(result); // 23.10.1.1
```

### Session.Query(query, *format)

```javascript
import { Session } from 'chdb-bun';
const sess = new Session('./chdb-bun-tmp');

// Query Session (persistent)
sess.query("CREATE FUNCTION IF NOT EXISTS hello AS () -> 'Hello chDB'", "CSV");
var result = sess.query("SELECT hello()", "CSV");
console.log(result);

// Before cleanup, you can find the database files in `./chdb-bun-tmp`

sess.cleanup(); // cleanup session, this will delete the database
```

