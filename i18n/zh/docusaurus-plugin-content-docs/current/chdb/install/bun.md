---
'title': '为 Bun 安装 chDB'
'sidebar_label': 'Bun'
'slug': '/chdb/install/bun'
'description': '如何为 Bun 安装 chDB'
'keywords':
- 'chdb'
- 'embedded'
- 'clickhouse-lite'
- 'bun'
- 'install'
---


# Installing chDB for Bun

## Requirements {#requirements}

安装 [libchdb](https://github.com/chdb-io/chdb):

```bash
curl -sL https://lib.chdb.io | bash
```

## Install {#install}

请参见: [chdb-bun](https://github.com/chdb-io/chdb-bun)

## GitHub repository {#github-repository}

您可以在 [chdb-io/chdb-bun](https://github.com/chdb-io/chdb-bun) 找到该项目的 GitHub 仓库。

## Usage {#usage}

### Query(query, *format) (ephemeral) {#queryquery-format-ephemeral}

```javascript
import { query } from 'chdb-bun';

// Query (ephemeral)
var result = query("SELECT version()", "CSV");
console.log(result); // 23.10.1.1
```

### Session.Query(query, *format) {#sessionqueryquery-format}

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
