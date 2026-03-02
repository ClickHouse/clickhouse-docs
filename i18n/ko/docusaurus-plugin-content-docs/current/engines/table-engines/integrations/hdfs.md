---
description: '이 엔진은 ClickHouse를 통해 HDFS 상의 데이터를 관리할 수 있도록 하여 Apache Hadoop 생태계와의 통합 기능을 제공합니다. 이 엔진은 File 및 URL 엔진과 유사하지만, Hadoop 특화 기능을 제공합니다.'
sidebar_label: 'HDFS'
sidebar_position: 80
slug: /engines/table-engines/integrations/hdfs
title: 'HDFS 테이블 엔진'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# HDFS 테이블 엔진 \{#hdfs-table-engine\}

<CloudNotSupportedBadge/>

이 엔진은 ClickHouse를 통해 [HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html) 상의 데이터를 관리할 수 있게 함으로써 [Apache Hadoop](https://en.wikipedia.org/wiki/Apache_Hadoop) 에코시스템과의 통합을 제공합니다. 이 엔진은 [File](/engines/table-engines/special/file) 및 [URL](/engines/table-engines/special/url) 엔진과 유사하지만, Hadoop에 특화된 기능을 제공합니다.

이 기능은 ClickHouse 엔지니어들이 공식적으로 지원하지 않으며, 품질이 불안정한 것으로 알려져 있습니다. 문제가 발생하는 경우 직접 수정한 후 pull request를 제출하십시오.



## 사용 방법 \{#usage\}

```sql
ENGINE = HDFS(URI, format)
```

**엔진 매개변수**

* `URI` - HDFS에서 전체 파일의 `URI`입니다. `URI`의 경로 부분에는 glob 패턴을 포함할 수 있습니다. 이 경우 테이블은 읽기 전용입니다.
* `format` - 사용 가능한 파일 포맷 중 하나를 지정합니다.
  `SELECT` 쿼리를 수행하려면 입력용 포맷이 지원되어야 하며,
  `INSERT` 쿼리를 수행하려면 출력용 포맷이 지원되어야 합니다. 사용 가능한 포맷은
  [Formats](/sql-reference/formats#formats-overview) 섹션에 나열되어 있습니다.
* [PARTITION BY expr]

### PARTITION BY \{#partition-by\}

`PARTITION BY` — 선택 사항입니다. 대부분의 경우 파티션 키는 필요하지 않으며, 필요하더라도 일반적으로 월 단위보다 더 세분화된 파티션 키는 필요하지 않습니다. 파티셔닝은 (ORDER BY 표현식과 달리) 쿼리 성능을 향상시키지 않습니다. 지나치게 세분화된 파티셔닝은 절대 사용하면 안 됩니다. 클라이언트 식별자나 이름으로 데이터를 파티셔닝하지 말고, 대신 ORDER BY 표현식에서 클라이언트 식별자나 이름을 첫 번째 컬럼으로 두십시오.

월 단위로 파티셔닝하려면, `date_column`이 [Date](/sql-reference/data-types/date.md) 타입의 날짜 컬럼일 때 `toYYYYMM(date_column)` 표현식을 사용하십시오. 이때 파티션 이름은 `"YYYYMM"` 형식을 가집니다.

**예시:**

**1.** `hdfs_engine_table` 테이블을 생성합니다:

```sql
CREATE TABLE hdfs_engine_table (name String, value UInt32) ENGINE=HDFS('hdfs://hdfs1:9000/other_storage', 'TSV')
```

**2.** 파일을 작성합니다:

```sql
INSERT INTO hdfs_engine_table VALUES ('one', 1), ('two', 2), ('three', 3)
```

**3.** 데이터를 쿼리합니다:

```sql
SELECT * FROM hdfs_engine_table LIMIT 2
```

```text
┌─name─┬─value─┐
│ one  │     1 │
│ two  │     2 │
└──────┴───────┘
```


## 구현 세부사항 \{#implementation-details\}

* 읽기와 쓰기는 병렬로 수행될 수 있습니다.
* 다음 기능은 지원되지 않습니다:

  * `ALTER` 및 `SELECT...SAMPLE` 연산.
  * 인덱스.
  * [Zero-copy](../../../operations/storing-data.md#zero-copy) 복제는 가능하지만, 권장되지 않습니다.

  :::note Zero-copy replication is not ready for production
  Zero-copy 복제는 ClickHouse 22.8 버전 이상에서 기본적으로 비활성화되어 있습니다. 이 기능은 프로덕션 환경에서의 사용이 권장되지 않습니다.
  :::

**경로의 글롭(glob)**

여러 경로 컴포넌트에 글롭을 사용할 수 있습니다. 처리되려면 파일이 존재해야 하며 전체 경로 패턴과 일치해야 합니다. 파일 목록은 `SELECT` 시점에 결정되며 (`CREATE` 시점이 아닙니다).

* `*` — `/`를 제외한 임의의 문자 0개 이상(빈 문자열 포함)을 대체합니다.
* `?` — 임의의 한 문자를 대체합니다.
* `{some_string,another_string,yet_another_one}` — 문자열 `'some_string', 'another_string', 'yet_another_one'` 중 어느 하나로 대체합니다.
* `{N..M}` — N부터 M까지(양 끝 포함) 범위에 있는 임의의 숫자로 대체합니다.

`{}`를 사용하는 패턴은 [remote](../../../sql-reference/table-functions/remote.md) 테이블 함수와 유사합니다.

**예시**

1. HDFS에 다음과 같은 URI를 가진 TSV 형식 파일이 여러 개 있다고 가정합니다:

   * &#39;hdfs://hdfs1:9000/some&#95;dir/some&#95;file&#95;1&#39;
   * &#39;hdfs://hdfs1:9000/some&#95;dir/some&#95;file&#95;2&#39;
   * &#39;hdfs://hdfs1:9000/some&#95;dir/some&#95;file&#95;3&#39;
   * &#39;hdfs://hdfs1:9000/another&#95;dir/some&#95;file&#95;1&#39;
   * &#39;hdfs://hdfs1:9000/another&#95;dir/some&#95;file&#95;2&#39;
   * &#39;hdfs://hdfs1:9000/another&#95;dir/some&#95;file&#95;3&#39;

2. 이 여섯 개 파일 전체로 구성된 테이블을 생성하는 방법은 여러 가지가 있습니다:

{/* */ }

```sql
CREATE TABLE table_with_range (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV')
```

다른 방식:

```sql
CREATE TABLE table_with_question_mark (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/some_file_?', 'TSV')
```

테이블은 두 디렉터리에 있는 모든 파일로 구성됩니다(모든 파일은 쿼리에서 정의한 포맷과 스키마를 만족해야 합니다).

```sql
CREATE TABLE table_with_asterisk (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV')
```

:::note
파일 목록에 앞에 0이 붙은 숫자 구간이 포함되어 있는 경우, 각 자릿수마다 별도로 중괄호를 사용하거나 `?`를 사용하십시오.
:::

**예시**

`file000`, `file001`, ... , `file999`와 같이 이름이 지정된 파일들로 테이블을 생성합니다:


```sql
CREATE TABLE big_table (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/big_dir/file{0..9}{0..9}{0..9}', 'CSV')
```

## 구성 \{#configuration\}

GraphiteMergeTree와 마찬가지로 HDFS 엔진은 ClickHouse 설정 파일을 사용하여 확장 구성을 지원합니다. 사용할 수 있는 설정 키는 전역(`hdfs`)과 사용자 수준(`hdfs_*`) 두 가지입니다. 전역 설정이 먼저 적용되고, 그 다음에 사용자 수준 설정이 존재하는 경우 사용자 수준 설정이 적용됩니다.

```xml
<!-- Global configuration options for HDFS engine type -->
<hdfs>
  <hadoop_kerberos_keytab>/tmp/keytab/clickhouse.keytab</hadoop_kerberos_keytab>
  <hadoop_kerberos_principal>clickuser@TEST.CLICKHOUSE.TECH</hadoop_kerberos_principal>
  <hadoop_security_authentication>kerberos</hadoop_security_authentication>
</hdfs>

<!-- Configuration specific for user "root" -->
<hdfs_root>
  <hadoop_kerberos_principal>root@TEST.CLICKHOUSE.TECH</hadoop_kerberos_principal>
</hdfs_root>
```

### 구성 옵션 \{#configuration-options\}

#### libhdfs3에서 지원되는 옵션 \{#supported-by-libhdfs3\}


| **parameter**                                         | **default value**       |
| -                                                  | -                    |
| rpc\_client\_connect\_tcpnodelay                      | true                    |
| dfs\_client\_read\_shortcircuit                       | true                    |
| output\_replace-datanode-on-failure                   | true                    |
| input\_notretry-another-node                          | false                   |
| input\_localread\_mappedfile                          | true                    |
| dfs\_client\_use\_legacy\_blockreader\_local          | false                   |
| rpc\_client\_ping\_interval                           | 10  * 1000              |
| rpc\_client\_connect\_timeout                         | 600 * 1000              |
| rpc\_client\_read\_timeout                            | 3600 * 1000             |
| rpc\_client\_write\_timeout                           | 3600 * 1000             |
| rpc\_client\_socket\_linger\_timeout                  | -1                      |
| rpc\_client\_connect\_retry                           | 10                      |
| rpc\_client\_timeout                                  | 3600 * 1000             |
| dfs\_default\_replica                                 | 3                       |
| input\_connect\_timeout                               | 600 * 1000              |
| input\_read\_timeout                                  | 3600 * 1000             |
| input\_write\_timeout                                 | 3600 * 1000             |
| input\_localread\_default\_buffersize                 | 1 * 1024 * 1024         |
| dfs\_prefetchsize                                     | 10                      |
| input\_read\_getblockinfo\_retry                      | 3                       |
| input\_localread\_blockinfo\_cachesize                | 1000                    |
| input\_read\_max\_retry                               | 60                      |
| output\_default\_chunksize                            | 512                     |
| output\_default\_packetsize                           | 64 * 1024               |
| output\_default\_write\_retry                         | 10                      |
| output\_connect\_timeout                              | 600 * 1000              |
| output\_read\_timeout                                 | 3600 * 1000             |
| output\_write\_timeout                                | 3600 * 1000             |
| output\_close\_timeout                                | 3600 * 1000             |
| output\_packetpool\_size                              | 1024                    |
| output\_heartbeat\_interval                          | 10 * 1000               |
| dfs\_client\_failover\_max\_attempts                  | 15                      |
| dfs\_client\_read\_shortcircuit\_streams\_cache\_size | 256                     |
| dfs\_client\_socketcache\_expiryMsec                  | 3000                    |
| dfs\_client\_socketcache\_capacity                    | 16                      |
| dfs\_default\_blocksize                               | 64 * 1024 * 1024        |
| dfs\_default\_uri                                     | "hdfs://localhost:9000" |
| hadoop\_security\_authentication                      | "simple"                |
| hadoop\_security\_kerberos\_ticket\_cache\_path       | ""                      |
| dfs\_client\_log\_severity                            | "INFO"                  |
| dfs\_domain\_socket\_path                             | ""                      |

[HDFS Configuration Reference](https://hawq.apache.org/docs/userguide/2.3.0.0-incubating/reference/HDFSConfigurationParameterReference.html)에 일부 파라미터에 대한 설명이 있습니다.

#### ClickHouse 추가 설정 \{#clickhouse-extras\}

| **parameter**                                         | **default value**       |
| -                                                  | -                    |
|hadoop\_kerberos\_keytab                               | ""                      |
|hadoop\_kerberos\_principal                            | ""                      |
|libhdfs3\_conf                                         | ""                      |

### 제한 사항 \{#limitations\}
* `hadoop_security_kerberos_ticket_cache_path` 및 `libhdfs3_conf`는 전역(global) 수준에서만 설정할 수 있으며, 사용자별(user specific) 설정은 지원되지 않습니다.



## Kerberos 지원 \{#kerberos-support\}

`hadoop_security_authentication` 파라미터 값이 `kerberos`이면 ClickHouse는 Kerberos를 사용하여 인증합니다.
파라미터는 [여기](#clickhouse-extras)에 정리되어 있으며, `hadoop_security_kerberos_ticket_cache_path`가 도움이 될 수 있습니다.
libhdfs3의 제한으로 인해 기존 방식만 지원되며,
datanode 통신은 SASL로 보호되지 않습니다 (`HADOOP_SECURE_DN_USER`는 이러한
보안 방식이 적용되는지에 대한 신뢰할 수 있는 지표입니다). 참고용으로 `tests/integration/test_storage_kerberized_hdfs/hdfs_configs/bootstrap.sh`를 사용하십시오.



`hadoop_kerberos_keytab`, `hadoop_kerberos_principal` 또는 `hadoop_security_kerberos_ticket_cache_path`가 지정되어 있는 경우 Kerberos 인증이 사용됩니다. 이때 `hadoop_kerberos_keytab`와 `hadoop_kerberos_principal`는 필수입니다.

## HDFS Namenode HA support \{#namenode-ha\}

libhdfs3는 HDFS namenode HA를 지원합니다.

* HDFS 노드에서 `hdfs-site.xml`을 `/etc/clickhouse-server/`로 복사합니다.
* ClickHouse 설정 파일에 다음 내용을 추가합니다:

```xml
  <hdfs>
    <libhdfs3_conf>/etc/clickhouse-server/hdfs-site.xml</libhdfs3_conf>
  </hdfs>
```

* 그런 다음 HDFS URI에서 namenode 주소로 `hdfs-site.xml`의 `dfs.nameservices` 태그 값을 사용합니다. 예를 들어 `hdfs://appadmin@192.168.101.11:8020/abc/`를 `hdfs://appadmin@my_nameservice/abc/`로 변경하십시오.


## 가상 컬럼 \{#virtual-columns\}

- `_path` — 파일 경로입니다. 타입: `LowCardinality(String)`.
- `_file` — 파일 이름입니다. 타입: `LowCardinality(String)`.
- `_size` — 파일 크기(바이트 단위)입니다. 타입: `Nullable(UInt64)`. 크기를 알 수 없는 경우 값은 `NULL`입니다.
- `_time` — 파일의 마지막 수정 시각입니다. 타입: `Nullable(DateTime)`. 시각을 알 수 없는 경우 값은 `NULL`입니다.



## Storage settings \{#storage-settings\}

- [hdfs_truncate_on_insert](/operations/settings/settings.md#hdfs_truncate_on_insert) - INSERT 전에 파일을 잘라(truncate) 비울 수 있습니다. 기본적으로 비활성화되어 있습니다.
- [hdfs_create_new_file_on_insert](/operations/settings/settings.md#hdfs_create_new_file_on_insert) - 포맷에 접미사가 있는 경우 각 INSERT마다 새 파일을 생성할 수 있습니다. 기본적으로 비활성화되어 있습니다.
- [hdfs_skip_empty_files](/operations/settings/settings.md#hdfs_skip_empty_files) - 읽을 때 비어 있는 파일을 건너뛸 수 있습니다. 기본적으로 비활성화되어 있습니다.

**함께 보기**

- [Virtual columns](../../../engines/table-engines/index.md#table_engines-virtual_columns)
