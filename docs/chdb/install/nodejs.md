---
title: 'Installing chDB for NodeJS'
sidebar_label: 'NodeJS'
slug: /chdb/install/nodejs
description: 'How to install chDB for NodeJS'
keywords: ['chdb', 'embedded', 'clickhouse-lite', 'NodeJS', 'install']
doc_type: 'guide'
---

# Installing chDB for NodeJS

## Requirements {#requirements}

Install [libchdb](https://github.com/chdb-io/chdb):

```bash
curl -sL https://lib.chdb.io | bash
```

## Install {#install}

```bash
npm i chdb
```

## GitHub repository {#github-repository}

You can find the GitHub repository for the project at [chdb-io/chdb-node](https://github.com/chdb-io/chdb-node).

## Usage {#usage}

You can leverage the power of chdb in your NodeJS applications by importing and using the chdb-node module:

```javascript
const { query, Session } = require("chdb");

var ret;

// Test standalone query
ret = query("SELECT version(), 'Hello chDB', chdb()", "CSV");
console.log("Standalone Query Result:", ret);

// Test session query
// Create a new session instance
const session = new Session("./chdb-node-tmp");
ret = session.query("SELECT 123", "CSV")
console.log("Session Query Result:", ret);
ret = session.query("CREATE DATABASE IF NOT EXISTS testdb;" +
    "CREATE TABLE IF NOT EXISTS testdb.testtable (id UInt32) ENGINE = MergeTree() ORDER BY id;");

session.query("USE testdb; INSERT INTO testtable VALUES (1), (2), (3);")

ret = session.query("SELECT * FROM testtable;")
console.log("Session Query Result:", ret);

// Clean up the session
session.cleanup();
```

## Build from source {#build-from-source}

```bash
npm run libchdb
npm install
npm run test
```
