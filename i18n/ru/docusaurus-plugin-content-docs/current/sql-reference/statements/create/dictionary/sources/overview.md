---
slug: /sql-reference/statements/create/dictionary/sources
title: 'Источники словарей'
sidebar_position: 1
sidebar_label: 'Обзор'
doc_type: 'reference'
description: 'Конфигурация типов источников словарей'
---

import CloudDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/sql-reference/statements/create/dictionary/_snippet_dictionary_in_cloud.md';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


## Синтаксис \{#dictionary-sources\}

<CloudDetails />

Словарь может быть подключён к ClickHouse из самых разных источников.
Источник задаётся в секции `source` файла конфигурации и с помощью предложения `SOURCE` в операторе DDL.

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
CREATE DICTIONARY dict_name (...)
...
SOURCE(SOURCE_TYPE(param1 val1 ... paramN valN)) -- Конфигурация источника
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
        <!-- Конфигурация источника -->
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

## Поддерживаемые источники словарей \{#supported-dictionary-sources\}

Доступны следующие типы источников (`SOURCE_TYPE`/`source_type`):

- [Локальный файл](./local-file.md)
- [Исполняемый файл](./executable-file.md)
- [Пул исполняемых файлов](./executable-pool.md)
- [HTTP(S)](./http.md)
- СУБД
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

Для типов источников [Локальный файл](./local-file.md), [Исполняемый файл](./executable-file.md), [HTTP(s)](./http.md), [ClickHouse](./clickhouse.md)
доступны дополнительные (необязательные) параметры:

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