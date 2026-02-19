---
slug: /sql-reference/statements/create/dictionary/sources
title: 'Dictionary ソース'
sidebar_position: 1
sidebar_label: '概要'
doc_type: 'reference'
description: 'Dictionary ソースの種類の設定'
---

import CloudDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/sql-reference/statements/create/dictionary/_snippet_dictionary_in_cloud.md';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


## 構文 \{#dictionary-sources\}

<CloudDetails />

Dictionary は、さまざまなソースを通じて ClickHouse に接続できます。
ソースは、設定ファイルでは `source` セクションで、DDL 文では `SOURCE` 句を使用して設定します。

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
CREATE DICTIONARY dict_name (...)
...
SOURCE(SOURCE_TYPE(param1 val1 ... paramN valN)) -- ソースの設定
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
        <!-- ソースの設定 -->
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

## サポートされている Dictionary ソース \{#supported-dictionary-sources\}

次のソースタイプ（`SOURCE_TYPE`/`source_type`）を利用できます。

- [ローカルファイル](./local-file)
- [実行可能ファイル](./executable-file)
- [実行可能プール](./executable-pool)
- [HTTP(S)](./http)
- DBMS
  - [ODBC](./odbc)
  - [MySQL](./mysql)
  - [ClickHouse](./clickhouse)
  - [MongoDB](./mongodb)
  - [Redis](./redis)
  - [Cassandra](./cassandra)
  - [PostgreSQL](./postgresql)
  - [YTsaurus](./ytsaurus)
- [YAMLRegExpTree](./yamlregexptree.md)
- [Null](./null)

[ローカルファイル](./local-file)、[実行可能ファイル](./executable-file)、[HTTP(s)](./http)、[ClickHouse](./clickhouse) のソースタイプでは、
オプションの設定項目を利用できます。

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
SOURCE(FILE(path './user_files/os.tsv' format 'TabSeparated'))
--highlight-next-line
SETTINGS(format_csv_allow_single_quotes = 0)
```

</TabItem>
<TabItem value="xml" label="Configuration file">

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