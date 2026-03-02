---
description: '테이블 문서'
keywords: ['압축', '코덱', '스키마', 'DDL']
sidebar_label: 'TABLE'
sidebar_position: 36
slug: /sql-reference/statements/create/table
title: 'CREATE TABLE'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

새 테이블을 생성합니다. 이 쿼리는 사용 사례에 따라 다양한 구문 형태를 가질 수 있습니다.

기본적으로 테이블은 현재 서버에서만 생성됩니다. 분산 DDL 쿼리는 `ON CLUSTER` 절로 구현되며, 이에 대해서는 [별도 문서](../../../sql-reference/distributed-ddl.md)에 설명되어 있습니다.


## 구문 형태 \{#syntax-forms\}

### 명시적 스키마 사용 \{#with-explicit-schema\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr1] [COMMENT 'comment for column'] [compression_codec] [TTL expr1],
    name2 [type2] [NULL|NOT NULL] [DEFAULT|MATERIALIZED|EPHEMERAL|ALIAS expr2] [COMMENT 'comment for column'] [compression_codec] [TTL expr2],
    ...
) ENGINE = engine
  [COMMENT 'comment for table']
```

`db`가 설정되어 있으면 `db` 데이터베이스에, 설정되어 있지 않으면 현재 데이터베이스에, 괄호 안에 지정된 구조와 `engine` 엔진을 사용하여 `table_name`이라는 테이블을 생성합니다.
테이블의 구조는 컬럼 설명, 보조 인덱스, 프로젝션 및 제약 조건의 목록입니다. 엔진에서 [프라이머리 키(primary key)](#primary-key)를 지원하는 경우 테이블 엔진의 매개변수로 지정됩니다.

가장 단순한 경우 컬럼 설명은 `name type` 형식입니다. 예: `RegionID UInt32`.

기본값을 위한 표현식도 정의할 수 있습니다(아래 참조).

필요한 경우 하나 이상의 키 표현식을 사용하여 primary key를 지정할 수 있습니다.

컬럼과 테이블에 주석을 추가할 수 있습니다.


### 다른 테이블과 유사한 스키마 사용하기 \{#with-a-schema-similar-to-other-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine]
```

다른 테이블과 동일한 구조를 가진 테이블을 생성합니다. 이 테이블에 대해 다른 엔진을 지정할 수 있습니다. 엔진을 지정하지 않으면 `db2.name2` 테이블과 동일한 엔진이 사용됩니다.


### 다른 테이블의 스키마와 데이터를 복제하여 생성 \{#with-a-schema-and-data-cloned-from-another-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name CLONE AS [db2.]name2 [ENGINE = engine]
```

다른 테이블과 동일한 구조의 테이블을 생성합니다. 테이블에 대해 다른 엔진을 지정할 수 있습니다. 엔진을 지정하지 않으면 `db2.name2` 테이블과 동일한 엔진이 사용됩니다. 새 테이블이 생성된 후 `db2.name2`의 모든 파티션이 새 테이블에 연결됩니다. 다시 말해, 생성 시 `db2.name2`의 데이터가 `db.table_name`으로 복제됩니다. 이 쿼리는 다음과 동일합니다:

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS [db2.]name2 [ENGINE = engine];
ALTER TABLE [db.]table_name ATTACH PARTITION ALL FROM [db2].name2;
```


### 테이블 함수(Table Function)에서 \{#from-a-table-function\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name AS table_function()
```

지정된 [table function](/sql-reference/table-functions)과 동일한 결과를 반환하는 테이블을 생성합니다. 생성된 테이블은 지정된 table function과 동일한 방식으로 동작합니다.


### SELECT 쿼리에서 \{#from-select-query\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name[(name1 [type1], name2 [type2], ...)] ENGINE = engine AS SELECT ...
```

`SELECT` 쿼리 결과와 동일한 구조를 가지는 테이블을 `engine` 엔진으로 생성하고, `SELECT`에서 반환된 데이터로 테이블을 채웁니다. 필요하다면 컬럼 설명을 명시적으로 지정할 수도 있습니다.

테이블이 이미 존재하고 `IF NOT EXISTS`가 지정된 경우, 쿼리는 아무 작업도 수행하지 않습니다.

쿼리에서 `ENGINE` 절 뒤에는 다른 절이 이어질 수 있습니다. 테이블 생성 방법에 대한 자세한 내용은 [테이블 엔진](/engines/table-engines) 설명서를 참고하십시오.

**예시**

쿼리:

```sql
CREATE TABLE t1 (x String) ENGINE = Memory AS SELECT 1;
SELECT x, toTypeName(x) FROM t1;
```

결과:

```text
┌─x─┬─toTypeName(x)─┐
│ 1 │ String        │
└───┴───────────────┘
```


## NULL 또는 NOT NULL 수정자 \{#null-or-not-null-modifiers\}

컬럼 정의에서 데이터 타입 뒤에 오는 `NULL` 및 `NOT NULL` 수정자는 해당 컬럼이 널 허용([Nullable](/sql-reference/data-types/nullable))인지 여부를 허용하거나 금지합니다.

타입이 `Nullable`이 아니면서 `NULL`이 지정된 경우 `Nullable`로 처리되며, `NOT NULL`이 지정된 경우에는 그렇지 않습니다. 예를 들어, `INT NULL`은 `Nullable(INT)`와 동일합니다. 타입이 이미 `Nullable`인데 `NULL` 또는 `NOT NULL` 수정자가 지정되면 예외가 발생합니다.

[data_type_default_nullable](../../../operations/settings/settings.md#data_type_default_nullable) SETTING도 참고하십시오.

## 기본값 \{#default_values\}

컬럼 설명에서는 `DEFAULT expr`, `MATERIALIZED expr`, `ALIAS expr` 형식으로 기본값 표현식을 지정할 수 있습니다. 예: `URLDomain String DEFAULT domain(URL)`.

표현식 `expr`은 선택 사항입니다. 이를 생략하는 경우 컬럼 타입을 명시적으로 지정해야 하며, 기본값은 숫자 컬럼의 경우 `0`, 문자열 컬럼의 경우 `''`(빈 문자열), 배열 컬럼의 경우 `[]`(빈 배열), 날짜 컬럼의 경우 `1970-01-01`, 널 허용 컬럼의 경우 `NULL`이 됩니다.

기본값을 가지는 컬럼의 타입은 생략할 수 있으며, 이 경우 `expr`의 타입에서 자동으로 유추됩니다. 예를 들어 `EventDate DEFAULT toDate(EventTime)` 컬럼의 타입은 Date가 됩니다.

데이터 타입과 기본값 표현식이 모두 지정된 경우, 표현식을 지정된 타입으로 변환하는 암시적 형 변환 함수가 삽입됩니다. 예: `Hits UInt32 DEFAULT 0`는 내부적으로 `Hits UInt32 DEFAULT toUInt32(0)`로 표현됩니다.

기본값 표현식 `expr`은 임의의 테이블 컬럼과 상수를 참조할 수 있습니다. ClickHouse는 테이블 구조 변경이 표현식 계산에 순환 참조를 도입하지 않는지 확인합니다. INSERT 시에는 표현식을 계산할 수 있는지, 즉 표현식 계산에 사용되는 모든 컬럼이 함께 전달되었는지를 검사합니다.

### DEFAULT \{#default\}

`DEFAULT expr`

일반적인 기본값입니다. 이러한 컬럼의 값이 INSERT 쿼리에서 지정되지 않으면 `expr`에서 계산됩니다.

예:

```sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    updated_at DateTime DEFAULT now(),
    updated_at_date Date DEFAULT toDate(updated_at)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test (id) VALUES (1);

SELECT * FROM test;
┌─id─┬──────────updated_at─┬─updated_at_date─┐
│  1 │ 2023-02-24 17:06:46 │      2023-02-24 │
└────┴─────────────────────┴─────────────────┘
```


### MATERIALIZED \{#materialized\}

`MATERIALIZED expr`

구체화 표현식입니다. 이러한 컬럼 값은 행이 삽입될 때 지정된 구체화 표현식에 따라 자동으로 계산됩니다. `INSERT` 시 값은 명시적으로 지정할 수 없습니다.

또한 이 유형의 기본값 컬럼은 `SELECT *` 결과에 포함되지 않습니다. 이는 `SELECT *`의 결과를 항상 `INSERT`를 사용해 테이블에 다시 삽입할 수 있다는 불변식을 보존하기 위한 것입니다. 이 동작은 `asterisk_include_materialized_columns` 설정으로 비활성화할 수 있습니다.

예시:

```sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    updated_at DateTime MATERIALIZED now(),
    updated_at_date Date MATERIALIZED toDate(updated_at)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test VALUES (1);

SELECT * FROM test;
┌─id─┐
│  1 │
└────┘

SELECT id, updated_at, updated_at_date FROM test;
┌─id─┬──────────updated_at─┬─updated_at_date─┐
│  1 │ 2023-02-24 17:08:08 │      2023-02-24 │
└────┴─────────────────────┴─────────────────┘

SELECT * FROM test SETTINGS asterisk_include_materialized_columns=1;
┌─id─┬──────────updated_at─┬─updated_at_date─┐
│  1 │ 2023-02-24 17:08:08 │      2023-02-24 │
└────┴─────────────────────┴─────────────────┘
```


### EPHEMERAL \{#ephemeral\}

`EPHEMERAL [expr]`

Ephemeral 컬럼 타입입니다. 이 타입의 컬럼은 테이블에 저장되지 않으며, 해당 컬럼을 대상으로 `SELECT`할 수 없습니다. Ephemeral 컬럼의 유일한 목적은 이들을 이용해 다른 컬럼의 기본값 표현식을 구성하는 것입니다.

`INSERT` 문에서 컬럼을 명시적으로 지정하지 않으면 이 타입의 컬럼은 건너뜁니다. 이는 `SELECT *`의 결과를 항상 `INSERT`를 사용해 테이블에 다시 삽입할 수 있다는 불변식을 보존하기 위한 것입니다.

예:

```sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    unhexed String EPHEMERAL,
    hexed FixedString(4) DEFAULT unhex(unhexed)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test (id, unhexed) VALUES (1, '5a90b714');

SELECT
    id,
    hexed,
    hex(hexed)
FROM test
FORMAT Vertical;

Row 1:
──────
id:         1
hexed:      Z��
hex(hexed): 5A90B714
```


### ALIAS \{#alias\}

`ALIAS expr`

계산 컬럼(동의어)입니다. 이 타입의 컬럼은 테이블에 저장되지 않으며, 여기에 값을 `INSERT`할 수 없습니다.

SELECT 쿼리에서 이 타입의 컬럼을 명시적으로 참조하면, 값은 쿼리 시점에 `expr`에서 계산됩니다. 기본적으로 `SELECT *`는 ALIAS 컬럼을 포함하지 않습니다. 이 동작은 `asterisk_include_alias_columns` 설정으로 비활성화할 수 있습니다.

ALTER 쿼리를 사용해 새 컬럼을 추가할 때, 기존 데이터에 대해서는 이 컬럼들의 데이터가 기록되지 않습니다. 대신, 새 컬럼에 대한 값이 존재하지 않는 예전 데이터를 읽을 때는 기본적으로 표현식이 그때그때 계산됩니다. 그러나 이 표현식을 실행하는 데 쿼리에 명시되지 않은 다른 컬럼이 필요하면, 해당 컬럼들도 추가로 읽히지만, 필요한 데이터 블록에 대해서만 읽습니다.

테이블에 새 컬럼을 추가한 후 나중에 해당 컬럼의 기본 표현식을 변경하면, 예전 데이터에 사용되는 값(디스크에 값이 저장되지 않았던 데이터의 경우)이 변경됩니다. 백그라운드 머지를 수행할 때, 머지 중인 파트 가운데 일부에 존재하지 않는 컬럼의 데이터는 머지된 파트에 기록된다는 점에 유의하십시오.

중첩된 데이터 구조의 요소에는 기본값을 설정할 수 없습니다.

```sql
CREATE OR REPLACE TABLE test
(
    id UInt64,
    size_bytes Int64,
    size String ALIAS formatReadableSize(size_bytes)
)
ENGINE = MergeTree
ORDER BY id;

INSERT INTO test VALUES (1, 4678899);

SELECT id, size_bytes, size FROM test;
┌─id─┬─size_bytes─┬─size─────┐
│  1 │    4678899 │ 4.46 MiB │
└────┴────────────┴──────────┘

SELECT * FROM test SETTINGS asterisk_include_alias_columns=1;
┌─id─┬─size_bytes─┬─size─────┐
│  1 │    4678899 │ 4.46 MiB │
└────┴────────────┴──────────┘
```


## 기본 키(Primary Key) \{#primary-key\}

테이블을 생성할 때 [기본 키(primary key)](../../../engines/table-engines/mergetree-family/mergetree.md#primary-keys-and-indexes-in-queries)를 정의할 수 있습니다. 기본 키는 두 가지 방식으로 지정할 수 있습니다:

* 컬럼 목록에 포함하여 지정

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...,
    PRIMARY KEY(expr1[, expr2,...])
)
ENGINE = engine;
```

* 컬럼 목록 외부

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
PRIMARY KEY(expr1[, expr2,...]);
```

:::tip
하나의 쿼리에서 두 가지 방식을 함께 사용할 수 없습니다.
:::


## 제약 조건 \{#constraints\}

컬럼에 대한 설명과 함께 제약 조건을 정의할 수 있습니다.

### CONSTRAINT \{#constraint\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [compression_codec] [TTL expr1],
    ...
    CONSTRAINT constraint_name_1 CHECK boolean_expr_1,
    ...
) ENGINE = engine
```

`boolean_expr_1`은 임의의 boolean 표현식이 될 수 있습니다. 테이블에 제약 조건이 정의되어 있으면, 각 제약 조건은 `INSERT` 쿼리로 들어오는 모든 행에 대해 검사됩니다. 어떤 제약 조건이라도 만족하지 않으면 서버는 제약 조건 이름과 검사 표현식을 포함한 예외를 발생시킵니다.

많은 수의 제약 조건을 추가하면 대규모 `INSERT` 쿼리의 성능에 부정적인 영향을 줄 수 있습니다.


### ASSUME \{#assume\}

`ASSUME` 절은 테이블에 대해 항상 참이라고 가정하는 `CONSTRAINT`를 정의할 때 사용됩니다. 이 제약 조건은 이후 옵티마이저가 SQL 쿼리 성능을 향상시키는 데 활용할 수 있습니다.

다음은 `ASSUME CONSTRAINT`가 `users_a` 테이블 생성 시 사용되는 예시입니다:

```sql
CREATE TABLE users_a (
    uid Int16, 
    name String, 
    age Int16, 
    name_len UInt8 MATERIALIZED length(name), 
    CONSTRAINT c1 ASSUME length(name) = name_len
) 
ENGINE=MergeTree 
ORDER BY (name_len, name);
```

여기서 `ASSUME CONSTRAINT`는 `length(name)` 함수가 항상 `name_len` 컬럼의 값과 같다는 것을 선언하는 데 사용됩니다. 이는 쿼리에서 `length(name)`가 호출될 때마다 ClickHouse가 이를 `name_len`으로 대체할 수 있음을 의미하며, `length()` 함수를 호출하지 않으므로 더 빠를 수 있습니다.

그 다음, 쿼리 `SELECT name FROM users_a WHERE length(name) < 5;`를 실행할 때 ClickHouse는 `ASSUME CONSTRAINT` 덕분에 이를 `SELECT name FROM users_a WHERE name_len < 5`;로 최적화할 수 있습니다. 이렇게 하면 각 행에 대해 `name`의 길이를 계산하지 않으므로 쿼리 실행 속도가 빨라질 수 있습니다.

`ASSUME CONSTRAINT`는 **제약 조건을 강제하지 않으며**, 단지 쿼리 최적화기에게 해당 제약 조건이 항상 참이라고 알려줄 뿐입니다. 제약 조건이 실제로 참이 아니라면 쿼리 결과가 올바르지 않을 수 있습니다. 따라서 제약 조건이 참임을 확신할 수 있을 때만 `ASSUME CONSTRAINT`를 사용해야 합니다.


## TTL 식 \{#ttl-expression\}

값의 저장 기간을 정의합니다. MergeTree 계열 테이블에만 지정할 수 있습니다. 자세한 설명은 [컬럼 및 테이블에 대한 TTL](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)을 참조하십시오.

## 컬럼 압축 코덱 \{#column_compression_codec\}

기본적으로 ClickHouse는 자가 관리형 버전에서는 `lz4` 압축을, ClickHouse Cloud에서는 `zstd` 압축을 적용합니다.

`MergeTree` 엔진 계열의 기본 압축 방식은 서버 구성의 [compression](/operations/server-configuration-parameters/settings#compression) 섹션에서 변경할 수 있습니다.

또한 `CREATE TABLE` 쿼리에서 각 컬럼에 대한 압축 방식을 정의할 수 있습니다.

```sql
CREATE TABLE codec_example
(
    dt Date CODEC(ZSTD),
    ts DateTime CODEC(LZ4HC),
    float_value Float32 CODEC(NONE),
    double_value Float64 CODEC(LZ4HC(9)),
    value Float32 CODEC(Delta, ZSTD)
)
ENGINE = <Engine>
...
```

`Default` 코덱은 기본 압축을 사용하도록 지정할 수 있으며, 이 기본 압축은 런타임에 서로 다른 SETTING(및 데이터 속성)에 따라 달라질 수 있습니다.
예: `value UInt64 CODEC(Default)` — 코덱을 지정하지 않은 것과 동일합니다.

또한 컬럼에서 현재 CODEC을 제거하고 config.xml에 정의된 기본 압축을 사용할 수도 있습니다:

```sql
ALTER TABLE codec_example MODIFY COLUMN float_value CODEC(Default);
```

코덱은 파이프라인 형태로 조합하여 사용할 수 있습니다. 예를 들어 `CODEC(Delta, Default)`와 같습니다.

:::tip
외부 유틸리티인 `lz4`와 같은 도구로는 ClickHouse 데이터베이스 파일을 압축 해제할 수 없습니다. 대신 전용 유틸리티인 [clickhouse-compressor](https://github.com/ClickHouse/ClickHouse/tree/master/programs/compressor)를 사용하십시오.
:::

다음 테이블 엔진에서 압축을 지원합니다:

* [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) 계열. 컬럼 압축 코덱을 지원하며, [compression](/operations/server-configuration-parameters/settings#compression) 설정으로 기본 압축 방법을 선택할 수 있습니다.
* [Log](../../../engines/table-engines/log-family/index.md) 계열. 기본적으로 `lz4` 압축 방법을 사용하고, 컬럼 압축 코덱을 지원합니다.
* [Set](../../../engines/table-engines/special/set.md). 기본 압축만 지원합니다.
* [Join](../../../engines/table-engines/special/join.md). 기본 압축만 지원합니다.

ClickHouse는 범용 코덱과 특수 목적 코덱을 모두 지원합니다.


### 범용 코덱 \{#general-purpose-codecs\}

#### NONE \{#none\}

`NONE` — 압축 없음

#### LZ4 \{#lz4\}

`LZ4` — 기본 무손실 [데이터 압축 알고리즘](https://github.com/lz4/lz4)입니다. LZ4 고속 압축을 사용합니다.

#### LZ4HC \{#lz4hc\}

`LZ4HC[(level)]` — 압축 레벨을 설정할 수 있는 LZ4 HC(high compression) 알고리즘입니다. 기본 레벨은 9입니다. `level <= 0`을 설정하면 기본 레벨이 적용됩니다. 가능한 레벨: \[1, 12\]. 권장 레벨 범위: \[4, 9\]입니다.

#### ZSTD \{#zstd\}

`ZSTD[(level)]` — 조정 가능한 `level`을 사용하는 [ZSTD 압축 알고리즘](https://en.wikipedia.org/wiki/Zstandard)입니다. 가능한 level 범위: \[1, 22\]. 기본 level: 1.

압축은 한 번만 수행하고 압축 해제는 여러 번 수행하는 비대칭 시나리오에서는 높은 압축 레벨이 유용합니다. 레벨이 높을수록 압축률은 좋아지지만 CPU 사용량도 증가합니다.

#### 더 이상 사용되지 않음: ZSTD_QAT \{#zstd_qat\}

<CloudNotSupportedBadge/>

#### 사용 중단: DEFLATE_QPL \{#deflate_qpl\}

<CloudNotSupportedBadge/>

### 특화 코덱 \{#specialized-codecs\}

이러한 코덱은 데이터의 특정 특성을 활용하여 압축 효율을 높이도록 설계되었습니다. 일부 코덱은 자체적으로 데이터를 압축하지 않고, 대신 데이터를 전처리하여 범용 코덱을 사용하는 두 번째 압축 단계에서 더 높은 데이터 압축률을 달성할 수 있도록 합니다.

#### Delta \{#delta\}

`Delta(delta_bytes)` — 원본 값을 서로 인접한 두 값의 차이로 대체하는 압축 방식입니다. 단, 첫 번째 값만 변경되지 않습니다. `delta_bytes`는 원본 값의 최대 크기이며, 기본값은 `sizeof(type)`입니다. 인수로 `delta_bytes`를 지정하는 방식은 더 이상 사용되지 않으며, 향후 릴리스에서 지원이 제거될 예정입니다. Delta는 데이터 준비용 코덱이므로 단독으로는 사용할 수 없습니다.

#### DoubleDelta \{#doubledelta\}

`DoubleDelta(bytes_size)` — 델타의 델타를 계산하고 이를 컴팩트한 이진 형식으로 기록합니다. `bytes_size`는 [Delta](#delta) 코덱의 `delta_bytes`와 유사한 의미를 가집니다. 인자로 `bytes_size`를 지정하는 방식은 더 이상 권장되지 않으며, 향후 릴리즈에서 지원이 제거될 예정입니다. 일정한 간격을 가지는 단조 시퀀스(예: 시계열 데이터)에 대해 최적의 압축률이 달성됩니다. 모든 숫자형 타입에서 사용할 수 있습니다. Gorilla TSDB에서 사용되는 알고리즘을 구현하며, 이를 확장하여 64비트 타입을 지원합니다. 32비트 델타에 대해서는 4비트 접두어 대신 5비트 접두어를 사용하여 1비트가 추가로 필요합니다. 추가 정보는 [Gorilla: A Fast, Scalable, In-Memory Time Series Database](http://www.vldb.org/pvldb/vol8/p1816-teller.pdf)의 「Compressing Time Stamps」를 참조하십시오. DoubleDelta는 데이터 준비용 코덱으로, 단독으로는 사용할 수 없습니다.

#### GCD \{#gcd\}

`GCD()` - 컬럼 값들의 최대공약수(GCD)를 계산한 다음, 각 값을 그 GCD로 나눕니다. 정수, 소수, 날짜/시간 컬럼에 사용할 수 있습니다. 이 코덱은 값이 GCD의 배수로 증가하거나 감소하는 방식으로 변하는 컬럼에 적합합니다. 예: 24, 28, 16, 24, 8, 24 (GCD = 4). GCD는 데이터 전처리용 코덱으로, 단독으로는 사용할 수 없습니다.

#### Gorilla \{#gorilla\}

`Gorilla(bytes_size)` — 현재 부동 소수점 값과 이전 값 사이의 XOR을 계산하여 이를 컴팩트한 이진 형식으로 기록합니다. 연속된 값들 사이의 차이가 작을수록, 즉 시계열 값이 더 천천히 변할수록 압축률이 더 좋아집니다. Gorilla TSDB에서 사용되는 알고리즘을 구현하며, 이를 확장하여 64비트 타입을 지원합니다. 사용 가능한 `bytes_size` 값은 1, 2, 4, 8이며, 기본값은 해당 값이 1, 2, 4, 8 중 하나일 때 `sizeof(type)`입니다. 그 밖의 모든 경우에는 1입니다. 추가 정보는 [Gorilla: A Fast, Scalable, In-Memory Time Series Database](https://doi.org/10.14778/2824032.2824078)의 4.1절을 참고하십시오.

#### FPC \{#fpc\}

`FPC(level, float_size)` - 두 개의 예측기 중 더 나은 것을 사용해 시퀀스에서 다음 부동소수점 값을 반복적으로 예측한 뒤, 실제 값과 예측 값에 XOR 연산을 적용하고 결과를 선행 0 비트 압축으로 인코딩합니다. Gorilla와 유사하며, 천천히 변하는 부동소수점 값의 연속된 값을 저장할 때 효율적입니다. 64비트 값(double)의 경우 FPC는 Gorilla보다 더 빠르며, 32비트 값의 경우 성능 차이는 환경에 따라 달라질 수 있습니다. 가능한 `level` 값: 1-28, 기본값은 12입니다. 가능한 `float_size` 값: 4, 8이며, 타입이 Float인 경우 기본값은 `sizeof(type)`입니다. 그 외의 모든 경우 기본값은 4입니다. 알고리즘에 대한 자세한 설명은 [High Throughput Compression of Double-Precision Floating-Point Data](https://userweb.cs.txstate.edu/~burtscher/papers/dcc07a.pdf)를 참고하십시오.

#### T64 \{#t64\}

`T64` — 정수 데이터 타입(`Enum`, `Date`, `DateTime` 포함) 값에서 사용되지 않는 상위 비트를 잘라내는 압축 방식입니다. 코덱은 알고리즘의 각 단계에서 64개의 값을 하나의 블록으로 가져와 64x64 비트 행렬에 배치한 뒤 이를 전치(transpose)하고, 값에서 사용되지 않는 비트를 잘라낸 다음 나머지를 시퀀스로 반환합니다. 여기서 사용되지 않는 비트란, 압축이 적용되는 전체 데이터 파트(data part)에서 최대값과 최소값 사이에 차이가 없는 비트들을 의미합니다.

`DoubleDelta` 및 `Gorilla` 코덱은 Gorilla TSDB에서 압축 알고리즘의 구성 요소로 사용됩니다. Gorilla 방식은 타임스탬프와 함께 서서히 변화하는 값들의 시퀀스가 있는 시나리오에서 효과적입니다. 타임스탬프는 `DoubleDelta` 코덱으로 효율적으로 압축되고, 값들은 `Gorilla` 코덱으로 효율적으로 압축됩니다. 예를 들어, 보다 효율적으로 저장되는 테이블을 만들려면 다음과 같은 구성으로 테이블을 생성할 수 있습니다:

```sql
CREATE TABLE codec_example
(
    timestamp DateTime CODEC(DoubleDelta),
    slow_values Float32 CODEC(Gorilla)
)
ENGINE = MergeTree()
```


### Encryption Codecs \{#encryption-codecs\}

이 코덱들은 데이터를 실제로 압축하지 않고, 대신 디스크에 저장되는 데이터를 암호화합니다. [encryption](/operations/server-configuration-parameters/settings#encryption) 설정에서 암호화 키가 지정된 경우에만 사용할 수 있습니다. 암호화된 데이터는 일반적으로 의미 있게 압축할 수 없기 때문에, 암호화는 코덱 파이프라인의 마지막에 위치할 때만 의미가 있습니다.

암호화 코덱은 다음과 같습니다:

#### AES_128_GCM_SIV \{#aes_128_gcm_siv\}

`CODEC('AES-128-GCM-SIV')` — AES-128을 사용하여 [RFC 8452](https://tools.ietf.org/html/rfc8452)에서 정의된 GCM-SIV 모드로 데이터를 암호화합니다.

#### AES-256-GCM-SIV \{#aes-256-gcm-siv\}

`CODEC('AES-256-GCM-SIV')` — AES-256을 GCM-SIV 모드로 사용하여 데이터를 암호화합니다.

이 코덱은 고정된 nonce를 사용하므로 암호화 결과가 결정적입니다. 따라서 [ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md)와 같은 중복 제거 엔진과 호환됩니다. 다만 하나의 약점이 있습니다. 동일한 데이터 블록을 두 번 암호화하면 결과 암호문이 완전히 동일해지므로, 디스크를 읽을 수 있는 공격자는 이 동등성을 확인할 수 있습니다(내용 자체는 알 수 없고 동등성만 알 수 있습니다).

:::note
&quot;*MergeTree&quot; 패밀리를 포함한 대부분의 엔진은 코덱을 적용하지 않은 상태로 디스크에 인덱스 파일을 생성합니다. 즉, 암호화된 컬럼에 인덱스를 생성하는 경우 평문이 디스크에 나타나게 됩니다.
:::

:::note
암호화된 컬럼에서 특정 값을 언급하는 SELECT 쿼리를 수행하는 경우(예: WHERE 절에서), 해당 값이 [system.query&#95;log](../../../operations/system-tables/query_log.md)에 나타날 수 있습니다. 이 로깅을 비활성화하는 것이 좋습니다.
:::

**예시**

```sql
CREATE TABLE mytable
(
    x String CODEC(AES_128_GCM_SIV)
)
ENGINE = MergeTree ORDER BY x;
```

:::note
압축을 사용하려면 반드시 명시적으로 지정해야 합니다. 그렇지 않으면 데이터에는 암호화만 적용됩니다.
:::

**예시**

```sql
CREATE TABLE mytable
(
    x String CODEC(Delta, LZ4, AES_128_GCM_SIV)
)
ENGINE = MergeTree ORDER BY x;
```


## 임시 테이블 \{#temporary-tables\}

:::note
임시 테이블은 복제되지 않습니다. 따라서 임시 테이블에 삽입된 데이터가 다른 레플리카에서 사용 가능하다는 보장은 없습니다. 임시 테이블의 주요 활용 사례는 단일 세션 동안 작은 외부 데이터셋을 쿼리하거나 조인할 때입니다.
:::

ClickHouse는 다음과 같은 특징이 있는 임시 테이블을 지원합니다:

* 임시 테이블은 세션이 종료되면, 연결이 끊어진 경우를 포함하여 사라집니다.
* 임시 테이블은 엔진을 지정하지 않으면 Memory 테이블 엔진을 사용하며, Replicated 및 `KeeperMap` 엔진을 제외한 모든 테이블 엔진을 사용할 수 있습니다.
* 임시 테이블에는 데이터베이스(DB)를 지정할 수 없습니다. 데이터베이스 외부에서 생성됩니다.
* `ON CLUSTER`를 사용하여 클러스터의 모든 서버에서 분산 DDL 쿼리로 임시 테이블을 생성하는 것은 불가능합니다. 이 테이블은 현재 세션에만 존재합니다.
* 임시 테이블이 다른 테이블과 같은 이름을 가지고 있고, 쿼리에서 DB를 지정하지 않고 테이블 이름만 지정한 경우 임시 테이블이 사용됩니다.
* 분산 쿼리 처리 시, 쿼리에서 사용된 Memory 엔진 기반 임시 테이블은 원격 서버로 전달됩니다.

임시 테이블을 생성하려면 다음 구문을 사용합니다:

```sql
CREATE [OR REPLACE] TEMPORARY TABLE [IF NOT EXISTS] table_name
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) [ENGINE = engine]
```

대부분의 경우 임시 테이블은 직접 생성하지 않고, 쿼리에 외부 데이터를 사용하거나 분산 `(GLOBAL) IN`을 사용할 때 생성됩니다. 자세한 내용은 관련 섹션을 참조하십시오.

임시 테이블 대신 [ENGINE = Memory](../../../engines/table-engines/special/memory.md)를 사용하는 테이블을 사용할 수 있습니다.


## REPLACE TABLE \{#replace-table\}

`REPLACE` 문을 사용하면 테이블을 [원자적으로](/concepts/glossary#atomicity) 업데이트할 수 있습니다.

:::note
이 문은 [`Atomic`](../../../engines/database-engines/atomic.md) 및 [`Replicated`](../../../engines/database-engines/replicated.md) 데이터베이스 엔진에서 지원되며,
각각 ClickHouse와 ClickHouse Cloud에서 기본 데이터베이스 엔진으로 사용됩니다.
:::

일반적으로 테이블에서 일부 데이터를 삭제해야 하는 경우
새 테이블을 생성한 뒤, 원하지 않는 데이터를 가져오지 않는 `SELECT` 문으로 새 테이블을 채우고,
이후 기존 테이블을 삭제한 다음 새 테이블의 이름을 변경합니다.
이 방법은 아래 예시에서 보여 줍니다:

```sql
CREATE TABLE myNewTable AS myOldTable;

INSERT INTO myNewTable
SELECT * FROM myOldTable 
WHERE CounterID <12345;

DROP TABLE myOldTable;

RENAME TABLE myNewTable TO myOldTable;
```

위의 방식 대신, 기본 데이터베이스 엔진을 사용하는 경우 `REPLACE`를 사용해 동일한 결과를 얻을 수도 있습니다:

```sql
REPLACE TABLE myOldTable
ENGINE = MergeTree()
ORDER BY CounterID 
AS
SELECT * FROM myOldTable
WHERE CounterID <12345;
```


### 구문 \{#syntax\}

```sql
{CREATE [OR REPLACE] | REPLACE} TABLE [db.]table_name
```

:::note
`CREATE` 구문의 모든 문법 형식은 이 구문에서도 동일하게 사용할 수 있습니다. 존재하지 않는 테이블에 대해 `REPLACE`를 실행하면 오류가 발생합니다.
:::


### 예시: \{#examples\}

<Tabs>
<TabItem value="clickhouse_replace_example" label="로컬" default>

다음과 같은 테이블이 있다고 가정합니다:

```sql
CREATE DATABASE base 
ENGINE = Atomic;

CREATE OR REPLACE TABLE base.t1
(
    n UInt64,
    s String
)
ENGINE = MergeTree
ORDER BY n;

INSERT INTO base.t1 VALUES (1, 'test');

SELECT * FROM base.t1;

┌─n─┬─s────┐
│ 1 │ test │
└───┴──────┘
```

`REPLACE` 문을 사용하여 모든 데이터를 삭제할 수 있습니다:

```sql
CREATE OR REPLACE TABLE base.t1 
(
    n UInt64,
    s Nullable(String)
)
ENGINE = MergeTree
ORDER BY n;

INSERT INTO base.t1 VALUES (2, null);

SELECT * FROM base.t1;

┌─n─┬─s──┐
│ 2 │ \N │
└───┴────┘
```

또는 `REPLACE` 문을 사용하여 테이블 구조를 변경할 수 있습니다:

```sql
REPLACE TABLE base.t1 (n UInt64) 
ENGINE = MergeTree 
ORDER BY n;

INSERT INTO base.t1 VALUES (3);

SELECT * FROM base.t1;

┌─n─┐
│ 3 │
└───┘
```  
</TabItem>
<TabItem value="cloud_replace_example" label="Cloud">

ClickHouse Cloud에 다음과 같은 테이블이 있다고 가정합니다: 

```sql
CREATE DATABASE base;

CREATE OR REPLACE TABLE base.t1 
(
    n UInt64,
    s String
)
ENGINE = MergeTree
ORDER BY n;

INSERT INTO base.t1 VALUES (1, 'test');

SELECT * FROM base.t1;

1    test
```

`REPLACE` 문을 사용하여 모든 데이터를 삭제할 수 있습니다:

```sql
CREATE OR REPLACE TABLE base.t1 
(
    n UInt64, 
    s Nullable(String)
)
ENGINE = MergeTree
ORDER BY n;

INSERT INTO base.t1 VALUES (2, null);

SELECT * FROM base.t1;

2    
```

또는 `REPLACE` 문을 사용하여 테이블 구조를 변경할 수 있습니다:

```sql
REPLACE TABLE base.t1 (n UInt64) 
ENGINE = MergeTree 
ORDER BY n;

INSERT INTO base.t1 VALUES (3);

SELECT * FROM base.t1;

3
```    
</TabItem>
</Tabs>

## COMMENT 절 \{#comment-clause\}

테이블을 생성할 때 COMMENT를 사용하여 주석을 추가할 수 있습니다.

**구문**

```sql
CREATE TABLE db.table_name
(
    name1 type1, name2 type2, ...
)
ENGINE = engine
COMMENT 'Comment'
```

:::note
`COMMENT` 절은 `PARTITION BY`, `ORDER BY`, 스토리지 전용 `SETTINGS`와 같은 스토리지 관련 절 **뒤에** 지정해야 합니다.

`COMMENT` 절 뒤에는 스토리지 관련 설정이 아니라 `max_threads` 등과 같은 쿼리 전용 `SETTINGS`만 구문 분석됩니다.

이는 올바른 절의 순서가 다음과 같음을 의미합니다:

* `ENGINE`
* 스토리지 관련 절
* `COMMENT`
* 쿼리 설정(있는 경우)
  :::

**예시**

쿼리:

```sql
CREATE TABLE t1 (x String) ENGINE = Memory COMMENT 'The temporary table';
SELECT name, comment FROM system.tables WHERE name = 't1';
```

결과:

```text
┌─name─┬─comment─────────────┐
│ t1   │ The temporary table │
└──────┴─────────────────────┘
```


## 관련 콘텐츠 \{#related-content\}

- 블로그: [스키마와 코덱을 활용한 ClickHouse 최적화](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)
- 블로그: [ClickHouse에서 시계열 데이터 처리하기](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)