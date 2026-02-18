---
description: '딕셔너리에 대한 문서'
sidebar_label: '딕셔너리'
sidebar_position: 38
slug: /sql-reference/statements/create/dictionary
title: 'CREATE DICTIONARY'
doc_type: 'reference'
---

지정된 [구조](../../../sql-reference/dictionaries/index.md#dictionary-key-and-fields), [소스](../../../sql-reference/dictionaries/index.md#dictionary-sources), [레이아웃](/sql-reference/dictionaries#storing-dictionaries-in-memory) 및 [수명](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime)을 갖는 새로운 [딕셔너리](../../../sql-reference/dictionaries/index.md)를 생성합니다.

## 구문 \{#syntax\}

```sql
CREATE [OR REPLACE] DICTIONARY [IF NOT EXISTS] [db.]dictionary_name [ON CLUSTER cluster]
(
    key1 type1  [DEFAULT|EXPRESSION expr1] [IS_OBJECT_ID],
    key2 type2  [DEFAULT|EXPRESSION expr2],
    attr1 type2 [DEFAULT|EXPRESSION expr3] [HIERARCHICAL|INJECTIVE],
    attr2 type2 [DEFAULT|EXPRESSION expr4] [HIERARCHICAL|INJECTIVE]
)
PRIMARY KEY key1, key2
SOURCE(SOURCE_NAME([param1 value1 ... paramN valueN]))
LAYOUT(LAYOUT_NAME([param_name param_value]))
LIFETIME({MIN min_val MAX max_val | max_val})
SETTINGS(setting_name = setting_value, setting_name = setting_value, ...)
COMMENT 'Comment'
```

딕셔너리 구조는 속성으로 구성됩니다. 딕셔너리 속성은 테이블 컬럼과 비슷한 방식으로 지정됩니다. 유일하게 필수인 속성은 타입이며, 다른 모든 속성에는 기본값이 사용될 수 있습니다.

`ON CLUSTER` 절을 사용하면 클러스터에 딕셔너리를 생성할 수 있습니다. 자세한 내용은 [분산 DDL](../../../sql-reference/distributed-ddl.md)을 참조하십시오.

딕셔너리 [레이아웃](/sql-reference/dictionaries#storing-dictionaries-in-memory)에 따라 하나 이상의 속성을 딕셔너리 키로 지정할 수 있습니다.

## SOURCE \{#source\}

딕셔너리의 소스로 사용할 수 있는 것은 다음과 같습니다:

* 현재 ClickHouse 서비스의 테이블
* 원격 ClickHouse 서비스의 테이블
* HTTP(S)로 접근 가능한 파일
* 다른 데이터베이스

### 현재 ClickHouse 서비스의 테이블에서 딕셔너리 생성 \{#create-a-dictionary-from-a-table-in-the-current-clickhouse-service\}

입력 테이블 `source_table`:

```text
┌─id─┬─value──┐
│  1 │ First  │
│  2 │ Second │
└────┴────────┘
```

딕셔너리 생성하기:

```sql
CREATE DICTIONARY id_value_dictionary
(
    id UInt64,
    value String
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(TABLE 'source_table'))
LAYOUT(FLAT())
LIFETIME(MIN 0 MAX 1000)
```

딕셔너리를 출력합니다:

```sql
SHOW CREATE DICTIONARY id_value_dictionary;
```

```response
CREATE DICTIONARY default.id_value_dictionary
(
    `id` UInt64,
    `value` String
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(TABLE 'source_table'))
LIFETIME(MIN 0 MAX 1000)
LAYOUT(FLAT())
```

:::note
[ClickHouse Cloud](https://clickhouse.com)의 SQL 콘솔을 사용할 때 딕셔너리를 생성하려면 `default` 사용자 또는 `default_role` 역할이 부여된 다른 사용자와 비밀번호를 반드시 지정해야 합니다.
:::

```sql
CREATE USER IF NOT EXISTS clickhouse_admin
IDENTIFIED WITH sha256_password BY 'passworD43$x';

GRANT default_role TO clickhouse_admin;

CREATE DATABASE foo_db;

CREATE TABLE foo_db.source_table (
    id UInt64,
    value String
) ENGINE = MergeTree
PRIMARY KEY id;

CREATE DICTIONARY foo_db.id_value_dictionary
(
    id UInt64,
    value String
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(TABLE 'source_table' USER 'clickhouse_admin' PASSWORD 'passworD43$x' DB 'foo_db' ))
LAYOUT(FLAT())
LIFETIME(MIN 0 MAX 1000);
```

### 원격 ClickHouse 서비스의 테이블에서 딕셔너리 생성하기 \{#create-a-dictionary-from-a-table-in-a-remote-clickhouse-service\}

입력 테이블(원격 ClickHouse 서비스에 있는 `source_table`):

```text
┌─id─┬─value──┐
│  1 │ First  │
│  2 │ Second │
└────┴────────┘
```

딕셔너리 생성하기:

```sql
CREATE DICTIONARY id_value_dictionary
(
    id UInt64,
    value String
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(HOST 'HOSTNAME' PORT 9000 USER 'default' PASSWORD 'PASSWORD' TABLE 'source_table' DB 'default'))
LAYOUT(FLAT())
LIFETIME(MIN 0 MAX 1000)
```

### HTTP(S)로 제공되는 파일에서 딕셔너리 생성하기 \{#create-a-dictionary-from-a-file-available-by-https\}

```sql
CREATE DICTIONARY default.taxi_zone_dictionary
(
    `LocationID` UInt16 DEFAULT 0,
    `Borough` String,
    `Zone` String,
    `service_zone` String
)
PRIMARY KEY LocationID
SOURCE(HTTP(URL 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/taxi_zone_lookup.csv' FORMAT 'CSVWithNames'))
LIFETIME(MIN 0 MAX 0)
LAYOUT(HASHED())
```

### 다른 데이터베이스에서 딕셔너리 생성 \{#create-a-dictionary-from-another-database\}

자세한 내용은 [Dictionary sources](/sql-reference/dictionaries#dbms)를 참조하십시오.

**추가 참고**

* 더 자세한 내용은 [Dictionaries](../../../sql-reference/dictionaries/index.md) 항목을 참조하십시오.
* [system.dictionaries](../../../operations/system-tables/dictionaries.md) — 이 테이블에는 [Dictionaries](../../../sql-reference/dictionaries/index.md)에 대한 정보가 포함되어 있습니다.
