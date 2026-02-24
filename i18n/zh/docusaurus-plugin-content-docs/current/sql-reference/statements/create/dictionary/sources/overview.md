---
slug: /sql-reference/statements/create/dictionary/sources
title: '字典数据源'
sidebar_position: 1
sidebar_label: '概览'
doc_type: 'reference'
description: '字典数据源类型配置'
---

import CloudDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/sql-reference/statements/create/dictionary/_snippet_dictionary_in_cloud.md';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


## 语法 \{#dictionary-sources\}

<CloudDetails />

可以将字典连接到 ClickHouse 中的多种不同数据源。
数据源在配置文件的 `source` 部分中进行配置，在 DDL 语句中则通过 `SOURCE` 子句进行配置。

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
CREATE DICTIONARY dict_name (...)
...
SOURCE(SOURCE_TYPE(param1 val1 ... paramN valN)) -- 数据源配置
...
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<clickhouse>
  <dictionary>
    ...
    <source>
      <source_type>
        <!-- 数据源配置 -->
      </source_type>
    </source>
    ...
  </dictionary>
  ...
</clickhouse>
```

</TabItem>
</Tabs>

<br/>

## 支持的字典数据源 \{#supported-dictionary-sources\}

可用的源类型（`SOURCE_TYPE`/`source_type`）包括：

- [本地文件](./local-file.md)
- [可执行文件](./executable-file.md)
- [可执行池](./executable-pool.md)
- [HTTP(S)](./http.md)
- 数据库管理系统（DBMS）
  - [ODBC](./odbc.md)
  - [MySQL](./mysql.md)
  - [ClickHouse](./clickhouse.md)
  - [MongoDB](./mongodb.md)
  - [Redis](./redis.md)
  - [Cassandra](./cassandra.md)
  - [PostgreSQL](./postgresql.md)
  - [YTsaurus](./ytsaurus.md)
- [YAMLRegExpTree](./yamlregexptree.md)
- [Null](./null.md)

对于源类型 [本地文件](./local-file.md)、[可执行文件](./executable-file.md)、[HTTP(s)](./http.md)、[ClickHouse](./clickhouse.md)，
可以使用可选的设置：

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
SOURCE(FILE(path './user_files/os.tsv' format 'TabSeparated'))
--highlight-next-line
SETTINGS(format_csv_allow_single_quotes = 0)
```

</TabItem>
<TabItem value="xml" label="配置文件">

```xml
<source>
  <file>
    <path>/opt/dictionaries/os.tsv</path>
    <format>TabSeparated</format>
  </file>
  <settings>
#highlight-next-line
      <format_csv_allow_single_quotes>0</format_csv_allow_single_quotes>
  </settings>
</source>
```

</TabItem>
</Tabs>