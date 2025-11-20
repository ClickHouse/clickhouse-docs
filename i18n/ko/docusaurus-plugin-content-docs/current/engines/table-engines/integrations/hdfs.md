---
'description': '이 엔진은 ClickHouse를 통해 HDFS에서 데이터를 관리할 수 있도록 하여 Apache Hadoop 생태계와 통합을
  제공합니다. 이 엔진은 File 및 URL 엔진과 유사하지만 Hadoop 전용 기능을 제공합니다.'
'sidebar_label': 'HDFS'
'sidebar_position': 80
'slug': '/engines/table-engines/integrations/hdfs'
'title': 'HDFS 테이블 엔진'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

```md

# HDFS 테이블 엔진

<CloudNotSupportedBadge/>

이 엔진은 ClickHouse를 통해 [HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html)에서 데이터를 관리할 수 있게 하여 [Apache Hadoop](https://en.wikipedia.org/wiki/Apache_Hadoop) 생태계와 통합을 제공합니다. 이 엔진은 [File](/engines/table-engines/special/file) 및 [URL](/engines/table-engines/special/url) 엔진과 유사하지만 Hadoop 전용 기능을 제공합니다.

이 기능은 ClickHouse 엔지니어에 의해 지원되지 않으며 품질이 불확실하다고 알려져 있습니다. 문제가 발생할 경우, 스스로 수정하고 풀 리퀘스트를 제출해 주십시오.

## 사용법 {#usage}

```sql
ENGINE = HDFS(URI, format)
```

**엔진 매개변수**

- `URI` - HDFS에서 전체 파일 URI. `URI`의 경로 부분은 글로브를 포함할 수 있습니다. 이 경우 테이블은 읽기 전용이 됩니다.
- `format` - 사용 가능한 파일 형식 중 하나를 지정합니다. `SELECT` 쿼리를 수행하려면 형식이 입력을 지원해야 하고, `INSERT` 쿼리를 수행하려면 출력에 대해 지원해야 합니다. 사용 가능한 형식은 [형식](/sql-reference/formats#formats-overview) 섹션에 나열되어 있습니다.
- [PARTITION BY expr]

### PARTITION BY {#partition-by}

`PARTITION BY` - 선택 사항입니다. 대부분의 경우 파티션 키가 필요 없으며, 필요할 경우 일반적으로 월별보다 세분화된 파티션 키는 필요하지 않습니다. 파티셔닝은 쿼리 속도를 높이지 않습니다(ORDER BY 표현식과는 대조적으로). 너무 세분화된 파티셔닝을 사용해서는 안 됩니다. 클라이언트 식별자나 이름으로 데이터를 파티셔닝하지 마십시오(대신 클라이언트 식별자나 이름을 ORDER BY 표현식의 첫 번째 컬럼으로 만드십시오).

월별 파티셔닝을 위해 `toYYYYMM(date_column)` 표현식을 사용하십시오. 여기서 `date_column`은 [Date](/sql-reference/data-types/date.md) 유형의 날짜가 있는 컬럼입니다. 여기서 파티션 이름은 `"YYYYMM"` 형식을 갖습니다.

**예시:**

**1.** `hdfs_engine_table` 테이블 설정:

```sql
CREATE TABLE hdfs_engine_table (name String, value UInt32) ENGINE=HDFS('hdfs://hdfs1:9000/other_storage', 'TSV')
```

**2.** 파일 채우기:

```sql
INSERT INTO hdfs_engine_table VALUES ('one', 1), ('two', 2), ('three', 3)
```

**3.** 데이터 쿼리:

```sql
SELECT * FROM hdfs_engine_table LIMIT 2
```

```text
┌─name─┬─value─┐
│ one  │     1 │
│ two  │     2 │
└──────┴───────┘
```

## 구현 세부사항 {#implementation-details}

- 읽기 및 쓰기는 병렬로 수행될 수 있습니다.
- 지원하지 않는 것:
  - `ALTER` 및 `SELECT...SAMPLE` 작업.
  - 인덱스.
  - [제로 복사](../../../operations/storing-data.md#zero-copy) 복제가 가능하지만 권장되지 않습니다.

  :::note 제로 복사 복제는 프로덕션에 적합하지 않습니다
  ClickHouse 버전 22.8 이상에서는 제로 복사 복제가 기본적으로 비활성화되어 있습니다. 이 기능은 프로덕션 사용을 권장하지 않습니다.
  :::

**경로의 글로브**

여러 경로 구성 요소에 글로브를 사용할 수 있습니다. 처리될 파일은 존재해야 하고 전체 경로 패턴과 일치해야 합니다. 파일 목록은 `SELECT` 시점에서 결정됩니다( `CREATE` 시점이 아님).

- `*` — `/`을 포함하지 않는 모든 문자 수에 대체되며 빈 문자열도 포함됩니다.
- `?` — 단일 문자에 대체됩니다.
- `{some_string,another_string,yet_another_one}` — `'some_string', 'another_string', 'yet_another_one'` 중 하나의 문자열로 대체됩니다.
- `{N..M}` — N에서 M까지의 범위에 있는 숫자로 대체됩니다(두 경계를 포함).

`{}`를 사용한 구성은 [remote](../../../sql-reference/table-functions/remote.md) 테이블 함수와 유사합니다.

**예시**

1. 여러 개의 TSV 형식 파일이 HDFS에 다음 URI로 존재한다고 가정합니다:

    - 'hdfs://hdfs1:9000/some_dir/some_file_1'
    - 'hdfs://hdfs1:9000/some_dir/some_file_2'
    - 'hdfs://hdfs1:9000/some_dir/some_file_3'
    - 'hdfs://hdfs1:9000/another_dir/some_file_1'
    - 'hdfs://hdfs1:9000/another_dir/some_file_2'
    - 'hdfs://hdfs1:9000/another_dir/some_file_3'

1. 모든 여섯 파일로 구성된 테이블을 만드는 방법은 여러 가지가 있습니다:

<!-- -->

```sql
CREATE TABLE table_with_range (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV')
```

또 다른 방법:

```sql
CREATE TABLE table_with_question_mark (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/some_file_?', 'TSV')
```

테이블은 두 디렉토리의 모든 파일로 구성되며(모든 파일은 쿼리에서 설명된 형식 및 스키마를 만족해야 함):

```sql
CREATE TABLE table_with_asterisk (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV')
```

:::note
파일 목록에 선행 제로가 포함된 숫자 범위가 있는 경우, 각 숫자에 대해 중괄호 구조를 사용하거나 `?`를 사용하십시오.
:::

**예시**

파일 이름이 `file000`, `file001`, ... , `file999`인 테이블 생성:

```sql
CREATE TABLE big_table (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/big_dir/file{0..9}{0..9}{0..9}', 'CSV')
```

## 구성 {#configuration}

GraphiteMergeTree와 유사하게 HDFS 엔진은 ClickHouse 구성 파일을 사용하여 확장된 구성을 지원합니다. 사용할 수 있는 두 개의 구성 키가 있습니다: 글로벌(`hdfs`) 및 사용자 수준(`hdfs_*`). 글로벌 구성은 먼저 적용되고, 그 후 사용자 수준 구성이 적용됩니다(존재할 경우).

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

### 구성 옵션 {#configuration-options}

#### libhdfs3에서 지원 {#supported-by-libhdfs3}

| **매개변수**                                         | **기본값**       |
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

[HDFS 구성 참조](https://hawq.apache.org/docs/userguide/2.3.0.0-incubating/reference/HDFSConfigurationParameterReference.html)에서 일부 매개변수를 설명할 수 있습니다.

#### ClickHouse 추가 매개변수 {#clickhouse-extras}

| **매개변수**                                         | **기본값**       |
| -                                                  | -                    |
| hadoop\_kerberos\_keytab                               | ""                      |
| hadoop\_kerberos\_principal                            | ""                      |
| libhdfs3\_conf                                         | ""                      |

### 제한 사항 {#limitations}
* `hadoop_security_kerberos_ticket_cache_path` 및 `libhdfs3_conf`는 글로벌만 가능하며 사용자별로는 사용할 수 없습니다.

## Kerberos 지원 {#kerberos-support}

`hadoop_security_authentication` 매개변수의 값이 `kerberos`인 경우, ClickHouse는 Kerberos를 통해 인증합니다.
매개변수는 [여기](#clickhouse-extras)에서 볼 수 있으며 `hadoop_security_kerberos_ticket_cache_path`가 도움이 될 수 있습니다.
libhdfs3의 제한으로 인해 구식 접근 방식만 지원된다는 점에 유의하십시오.
데이터 노드 간 통신은 SASL에 의해 보호되지 않습니다(`HADOOP_SECURE_DN_USER`는 그러한 보안 접근 방법의 신뢰할 수 있는 지표입니다). 참조용으로 `tests/integration/test_storage_kerberized_hdfs/hdfs_configs/bootstrap.sh`를 사용하십시오.

`hadoop_kerberos_keytab`, `hadoop_kerberos_principal` 또는 `hadoop_security_kerberos_ticket_cache_path`가 지정된 경우 Kerberos 인증이 사용됩니다. 이 경우 `hadoop_kerberos_keytab` 및 `hadoop_kerberos_principal`은 필수입니다.
## HDFS Namenode HA 지원 {#namenode-ha}

libhdfs3는 HDFS namenode HA를 지원합니다.

- HDFS 노드에서 `hdfs-site.xml`을 `/etc/clickhouse-server/`로 복사합니다.
- ClickHouse 구성 파일에 다음 부분을 추가합니다:

```xml
<hdfs>
  <libhdfs3_conf>/etc/clickhouse-server/hdfs-site.xml</libhdfs3_conf>
</hdfs>
```

- 그런 다음 HDFS URI에서 Namenode 주소로 `hdfs-site.xml`의 `dfs.nameservices` 태그 값을 사용합니다. 예를 들어, `hdfs://appadmin@192.168.101.11:8020/abc/`를 `hdfs://appadmin@my_nameservice/abc/`로 교체합니다.

## 가상 컬럼 {#virtual-columns}

- `_path` - 파일의 경로. 유형: `LowCardinality(String)`.
- `_file` - 파일의 이름. 유형: `LowCardinality(String)`.
- `_size` - 파일의 크기(바이트 단위). 유형: `Nullable(UInt64)`. 크기를 알 수 없는 경우 값은 `NULL`입니다.
- `_time` - 파일의 마지막 수정 시간. 유형: `Nullable(DateTime)`. 시간을 알 수 없는 경우 값은 `NULL`입니다.

## 저장 설정 {#storage-settings}

- [hdfs_truncate_on_insert](/operations/settings/settings.md#hdfs_truncate_on_insert) - 삽입 전에 파일을 잘라낼 수 있게 해줍니다. 기본적으로 비활성화되어 있습니다.
- [hdfs_create_new_file_on_insert](/operations/settings/settings.md#hdfs_create_new_file_on_insert) - 형식에 접미사가 있는 경우 각 삽입에서 새 파일을 생성할 수 있게 해줍니다. 기본적으로 비활성화되어 있습니다.
- [hdfs_skip_empty_files](/operations/settings/settings.md#hdfs_skip_empty_files) - 읽는 동안 빈 파일을 건너뛸 수 있게 해줍니다. 기본적으로 비활성화되어 있습니다.

**참고문헌**

- [가상 컬럼](../../../engines/table-engines/index.md#table_engines-virtual_columns)
