---
description: "Named collections에 대한 문서"
sidebar_label: "Named collections"
sidebar_position: 69
slug: /operations/named-collections
title: "Named collections"
doc_type: "reference"
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge />

Named collections는 외부 소스와의 통합 구성을 위해 사용되는 key-value 쌍 컬렉션을
저장하는 기능을 제공합니다. Named collections는 dictionary, 테이블, 테이블 함수,
객체 스토리지와 함께 사용할 수 있습니다.

Named collections는 DDL 또는 설정 파일로 구성할 수 있으며, ClickHouse가 시작될 때
적용됩니다. 이를 통해 객체 생성 작업이 단순해지고, 관리자 권한이 없는 사용자에게서
자격 증명을 숨기는 데 도움이 됩니다.

Named collection에 포함된 key는 해당 함수, 테이블 엔진, 데이터베이스 등의
매개변수 이름과 일치해야 합니다. 아래 예제에서는 각 유형에 대해 매개변수 목록에
대한 링크를 제공합니다.

Named collection에 설정된 매개변수는 SQL에서 재정의할 수 있으며, 아래 예제에서
그 방법을 보여 줍니다. 이 기능은 `[NOT] OVERRIDABLE` 키워드와 XML 속성 및/또는
`allow_named_collection_override_by_default` 설정 옵션을 사용하여 제한할 수 있습니다.

:::warning
재정의를 허용하면, 관리자 권한이 없는 사용자가 숨기려는 자격 증명을
유추할 수 있게 될 수 있습니다.
해당 목적을 위해 named collections를 사용하는 경우,
기본적으로 활성화되어 있는 `allow_named_collection_override_by_default`를
비활성화해야 합니다.
:::


## system 데이터베이스에 이름이 지정된 컬렉션 저장 \{#storing-named-collections-in-the-system-database\}

### DDL 예제 \{#ddl-example\}

```sql
CREATE NAMED COLLECTION name AS
key_1 = 'value' OVERRIDABLE,
key_2 = 'value2' NOT OVERRIDABLE,
url = 'https://connection.url/'
```

위 예시에서는:

* `key_1`는 항상 재정의할 수 있습니다.
* `key_2`는 절대 재정의할 수 없습니다.
* `url`은 `allow_named_collection_override_by_default` 값에 따라 재정의할 수도 있고 하지 못할 수도 있습니다.


### DDL로 이름이 지정된 컬렉션을 생성하기 위한 권한 \{#permissions-to-create-named-collections-with-ddl\}

DDL로 이름이 지정된 컬렉션을 관리하려면 사용자에게 `named_collection_control` 권한이 있어야 합니다. 이 권한은 `/etc/clickhouse-server/users.d/`에 파일을 추가하여 부여할 수 있습니다. 다음 예에서는 사용자 `default`에게 `access_management`와 `named_collection_control` 권한을 모두 부여합니다:

```xml title='/etc/clickhouse-server/users.d/user_default.xml'
<clickhouse>
  <users>
    <default>
      <password_sha256_hex>65e84be33532fb784c48129675f9eff3a682b27168c0ea744b2cf58ee02337c5</password_sha256_hex replace=true>
      <access_management>1</access_management>
      <!-- highlight-start -->
      <named_collection_control>1</named_collection_control>
      <!-- highlight-end -->
    </default>
  </users>
</clickhouse>
```

:::tip
위 예시에서 `password_sha256_hex` 값은 비밀번호 SHA256 해시의 16진수(hex) 표현입니다. `default` 사용자에 대한 이 설정에서는 기본 구성에 평문 `password`가 이미 설정되어 있고, 하나의 사용자에 평문 비밀번호와 SHA256 16진수 비밀번호를 동시에 설정할 수 없으므로 `replace=true` 속성을 지정합니다.
:::


### 이름이 지정된 컬렉션을 위한 스토리지 \{#storage-for-named-collections\}

이름이 지정된 컬렉션은 로컬 디스크나 ZooKeeper/Keeper에 저장할 수 있습니다. 기본적으로 로컬 스토리지가 사용됩니다.
또한 [디스크 암호화](storing-data#encrypted-virtual-file-system)에 사용되는 것과 동일한 알고리즘을 사용해 암호화하여 저장할 수 있으며,
기본적으로 `aes_128_ctr`이 사용됩니다.

이름이 지정된 컬렉션 스토리지를 구성하려면 `type`을 지정해야 합니다. 이 값은 `local` 또는 `keeper`/`zookeeper`가 될 수 있습니다.
암호화된 스토리지를 사용하려면 `local_encrypted` 또는 `keeper_encrypted`/`zookeeper_encrypted`를 사용할 수 있습니다.

ZooKeeper/Keeper를 사용하려면 구성 파일의 `named_collections_storage` 섹션에 `path`(이름이 지정된 컬렉션이 저장될 ZooKeeper/Keeper의 경로)도
설정해야 합니다. 다음 예제에서는 암호화와 ZooKeeper/Keeper를 함께 사용합니다.

```xml
<clickhouse>
  <named_collections_storage>
    <type>zookeeper_encrypted</type>
    <key_hex>bebec0cabebec0cabebec0cabebec0ca</key_hex>
    <algorithm>aes_128_ctr</algorithm>
    <path>/named_collections_path/</path>
    <update_timeout_ms>1000</update_timeout_ms>
  </named_collections_storage>
</clickhouse>
```

옵션 구성 매개변수인 `update_timeout_ms`의 기본값은 `5000`입니다.


## 설정 파일에 이름이 지정된 컬렉션 저장 \{#storing-named-collections-in-configuration-files\}

### XML 예제 \{#xml-example\}

```xml title='/etc/clickhouse-server/config.d/named_collections.xml'
<clickhouse>
     <named_collections>
        <name>
            <key_1 overridable="true">value</key_1>
            <key_2 overridable="false">value_2</key_2>
            <url>https://connection.url/</url>
        </name>
     </named_collections>
</clickhouse>
```

위의 예시에서:

* `key_1`은(는) 항상 재정의할 수 있습니다.
* `key_2`은(는) 절대 재정의할 수 없습니다.
* `url`은(는) `allow_named_collection_override_by_default` 값에 따라 재정의 가능 여부가 결정됩니다.


## 이름이 지정된 컬렉션 수정 \{#modifying-named-collections\}

DDL 쿼리로 생성된 이름이 지정된 컬렉션은 DDL 문으로 수정하거나 삭제할 수 있습니다. XML 파일로 생성된 이름이 지정된 컬렉션은 해당 XML 파일을 편집하거나 삭제하여 관리할 수 있습니다.

### DDL 명명된 컬렉션 수정 \{#alter-a-ddl-named-collection\}

컬렉션 `collection2`의 키 `key1` 및 `key3`를 변경하거나 추가합니다
(해당 키들의 `overridable` 플래그 값은 변경되지 않습니다):

```sql
ALTER NAMED COLLECTION collection2 SET key1=4, key3='value3'
```

`key1` 키를 변경하거나 추가하고, 항상 재정의되도록 설정합니다:

```sql
ALTER NAMED COLLECTION collection2 SET key1=4 OVERRIDABLE
```

`collection2`에서 키 `key2`를 삭제합니다:

```sql
ALTER NAMED COLLECTION collection2 DELETE key2
```

`collection2` 컬렉션에서 `key1` 키를 변경하거나 추가하고 `key3` 키를 삭제합니다:

```sql
ALTER NAMED COLLECTION collection2 SET key1=4, DELETE key3
```

키에 대해 `overridable` 플래그의 기본값을 강제로 사용하려면,
해당 키를 삭제한 뒤 다시 추가해야 합니다.

```sql
ALTER NAMED COLLECTION collection2 DELETE key1;
ALTER NAMED COLLECTION collection2 SET key1=4;
```


### DDL용 명명된 컬렉션 `collection2`를 삭제합니다: \{#drop-the-ddl-named-collection-collection2\}

```sql
DROP NAMED COLLECTION collection2
```


## S3에 액세스하기 위한 이름 지정 컬렉션 \{#named-collections-for-accessing-s3\}

파라미터에 대한 자세한 설명은 [s3 테이블 함수](../sql-reference/table-functions/s3.md)를 참조하십시오.

### DDL 예시 \{#ddl-example-1\}

```sql
CREATE NAMED COLLECTION s3_mydata AS
access_key_id = 'AKIAIOSFODNN7EXAMPLE',
secret_access_key = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
format = 'CSV',
url = 'https://s3.us-east-1.amazonaws.com/yourbucket/mydata/'
```


### XML 예시 \{#xml-example-1\}

```xml
<clickhouse>
    <named_collections>
        <s3_mydata>
            <access_key_id>AKIAIOSFODNN7EXAMPLE</access_key_id>
            <secret_access_key>wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY</secret_access_key>
            <format>CSV</format>
            <url>https://s3.us-east-1.amazonaws.com/yourbucket/mydata/</url>
        </s3_mydata>
    </named_collections>
</clickhouse>
```


### s3() 함수와 S3 테이블 named collection 예시 \{#s3-function-and-s3-table-named-collection-examples\}

다음 두 예시는 동일한 named collection인 `s3_mydata`를 사용합니다.

#### s3() 함수 \{#s3-function\}

```sql
INSERT INTO FUNCTION s3(s3_mydata, filename = 'test_file.tsv.gz',
   format = 'TSV', structure = 'number UInt64', compression_method = 'gzip')
SELECT * FROM numbers(10000);
```

:::tip
위 예제에서 `s3()` 함수의 첫 번째 인수는 컬렉션 이름인 `s3_mydata`입니다. Named collection을 사용하지 않으면, access key ID, secret, format, URL을 `s3()` 함수를 호출할 때마다 모두 인수로 전달해야 합니다.
:::


#### S3 테이블 \{#s3-table\}

```sql
CREATE TABLE s3_engine_table (number Int64)
ENGINE=S3(s3_mydata, url='https://s3.us-east-1.amazonaws.com/yourbucket/mydata/test_file.tsv.gz', format = 'TSV')
SETTINGS input_format_with_names_use_header = 0;

SELECT * FROM s3_engine_table LIMIT 3;
┌─number─┐
│      0 │
│      1 │
│      2 │
└────────┘
```


## MySQL 데이터베이스 액세스를 위한 명명된 컬렉션 \{#named-collections-for-accessing-mysql-database\}

매개변수에 대한 설명은 [mysql](../sql-reference/table-functions/mysql.md)을 참조하십시오.

### DDL 예제 \{#ddl-example-2\}

```sql
CREATE NAMED COLLECTION mymysql AS
user = 'myuser',
password = 'mypass',
host = '127.0.0.1',
port = 3306,
database = 'test',
connection_pool_size = 8,
replace_query = 1
```


### XML 예제 \{#xml-example-2\}

```xml
<clickhouse>
    <named_collections>
        <mymysql>
            <user>myuser</user>
            <password>mypass</password>
            <host>127.0.0.1</host>
            <port>3306</port>
            <database>test</database>
            <connection_pool_size>8</connection_pool_size>
            <replace_query>1</replace_query>
        </mymysql>
    </named_collections>
</clickhouse>
```


### mysql() 함수, MySQL 테이블, MySQL 데이터베이스 및 딕셔너리용 명명된 컬렉션 예시 \{#mysql-function-mysql-table-mysql-database-and-dictionary-named-collection-examples\}

다음 네 가지 예시는 동일한 명명된 컬렉션 `mymysql`을 사용합니다.

#### mysql() 함수 \{#mysql-function\}

```sql
SELECT count() FROM mysql(mymysql, table = 'test');

┌─count()─┐
│       3 │
└─────────┘
```

:::note
네임드 컬렉션에는 `table` 파라미터가 포함되어 있지 않으므로 함수 호출에서 `table = 'test'`로 지정합니다.
:::


#### MySQL 테이블 \{#mysql-table\}

```sql
CREATE TABLE mytable(A Int64) ENGINE = MySQL(mymysql, table = 'test', connection_pool_size=3, replace_query=0);
SELECT count() FROM mytable;

┌─count()─┐
│       3 │
└─────────┘
```

:::note
DDL은 connection&#95;pool&#95;size에 대한 네임드 컬렉션 설정을 재정의합니다.
:::


#### MySQL 데이터베이스 \{#mysql-database\}

```sql
CREATE DATABASE mydatabase ENGINE = MySQL(mymysql);

SHOW TABLES FROM mydatabase;

┌─name───┐
│ source │
│ test   │
└────────┘
```


#### MySQL 딕셔너리 \{#mysql-dictionary\}

```sql
CREATE DICTIONARY dict (A Int64, B String)
PRIMARY KEY A
SOURCE(MYSQL(NAME mymysql TABLE 'source'))
LIFETIME(MIN 1 MAX 2)
LAYOUT(HASHED());

SELECT dictGet('dict', 'B', 2);

┌─dictGet('dict', 'B', 2)─┐
│ two                     │
└─────────────────────────┘
```


## PostgreSQL 데이터베이스에 접근하기 위한 named collection \{#named-collections-for-accessing-postgresql-database\}

각 매개변수에 대한 설명은 [postgresql](../sql-reference/table-functions/postgresql.md)을 참고하십시오. 추가로 다음과 같은 별칭(alias)이 있습니다:

* `user`에 대한 `username`
* `database`에 대한 `db`.

매개변수 `addresses_expr`는 컬렉션에서 `host:port` 대신 사용됩니다. 이 매개변수는 `host`, `hostname`, `port`와 마찬가지로 선택 사항입니다. 다음 의사 코드는 우선순위를 설명합니다:

```sql
CASE
    WHEN collection['addresses_expr'] != '' THEN collection['addresses_expr']
    WHEN collection['host'] != ''           THEN collection['host'] || ':' || if(collection['port'] != '', collection['port'], '5432')
    WHEN collection['hostname'] != ''       THEN collection['hostname'] || ':' || if(collection['port'] != '', collection['port'], '5432')
END
```

생성 예시:

```sql
CREATE NAMED COLLECTION mypg AS
user = 'pguser',
password = 'jw8s0F4',
host = '127.0.0.1',
port = 5432,
database = 'test',
schema = 'test_schema'
```

구성 예:

```xml
<clickhouse>
    <named_collections>
        <mypg>
            <user>pguser</user>
            <password>jw8s0F4</password>
            <host>127.0.0.1</host>
            <port>5432</port>
            <database>test</database>
            <schema>test_schema</schema>
        </mypg>
    </named_collections>
</clickhouse>
```


### PostgreSQL FUNCTION과 함께 명명된 컬렉션 사용 예 \{#example-of-using-named-collections-with-the-postgresql-function\}

```sql
SELECT * FROM postgresql(mypg, table = 'test');

┌─a─┬─b───┐
│ 2 │ two │
│ 1 │ one │
└───┴─────┘
SELECT * FROM postgresql(mypg, table = 'test', schema = 'public');

┌─a─┐
│ 1 │
│ 2 │
│ 3 │
└───┘
```


### PostgreSQL 엔진 데이터베이스에서 네임드 컬렉션을 사용하는 예 \{#example-of-using-named-collections-with-database-with-engine-postgresql\}

```sql
CREATE TABLE mypgtable (a Int64) ENGINE = PostgreSQL(mypg, table = 'test', schema = 'public');

SELECT * FROM mypgtable;

┌─a─┐
│ 1 │
│ 2 │
│ 3 │
└───┘
```

:::note
PostgreSQL에서는 named collection을 사용하는 테이블을 CREATE할 때, 해당 named collection에서 데이터를 복사합니다. 컬렉션이 변경되더라도 기존 테이블에는 영향을 주지 않습니다.
:::


### PostgreSQL 엔진을 사용하는 데이터베이스에서 named collections 사용 예 \{#example-of-using-named-collections-with-database-with-engine-postgresql-1\}

```sql
CREATE DATABASE mydatabase ENGINE = PostgreSQL(mypg);

SHOW TABLES FROM mydatabase

┌─name─┐
│ test │
└──────┘
```


### POSTGRESQL을 소스로 하는 딕셔너리에서 named collection을 사용하는 예 \{#example-of-using-named-collections-with-a-dictionary-with-source-postgresql\}

```sql
CREATE DICTIONARY dict (a Int64, b String)
PRIMARY KEY a
SOURCE(POSTGRESQL(NAME mypg TABLE test))
LIFETIME(MIN 1 MAX 2)
LAYOUT(HASHED());

SELECT dictGet('dict', 'b', 2);

┌─dictGet('dict', 'b', 2)─┐
│ two                     │
└─────────────────────────┘
```


## 원격 ClickHouse 데이터베이스에 액세스하기 위한 네임드 컬렉션 \{#named-collections-for-accessing-a-remote-clickhouse-database\}

매개변수에 대한 설명은 [remote](../sql-reference/table-functions/remote.md/#parameters)를 참고하십시오.

구성 예시는 다음과 같습니다.

```sql
CREATE NAMED COLLECTION remote1 AS
host = 'remote_host',
port = 9000,
database = 'system',
user = 'foo',
password = 'secret',
secure = 1
```

```xml
<clickhouse>
    <named_collections>
        <remote1>
            <host>remote_host</host>
            <port>9000</port>
            <database>system</database>
            <user>foo</user>
            <password>secret</password>
            <secure>1</secure>
        </remote1>
    </named_collections>
</clickhouse>
```

연결 시에는 `remoteSecure` 때문에 `secure`가 필요하지 않지만, 딕셔너리에는 사용할 수 있습니다.


### `remote`/`remoteSecure` 함수를 사용한 이름 지정 컬렉션 예시 \{#example-of-using-named-collections-with-the-remoteremotesecure-functions\}

```sql
SELECT * FROM remote(remote1, table = one);
┌─dummy─┐
│     0 │
└───────┘

SELECT * FROM remote(remote1, database = merge(system, '^one'));
┌─dummy─┐
│     0 │
└───────┘

INSERT INTO FUNCTION remote(remote1, database = default, table = test) VALUES (1,'a');

SELECT * FROM remote(remote1, database = default, table = test);
┌─a─┬─b─┐
│ 1 │ a │
└───┴───┘
```


### ClickHouse 소스를 사용하는 딕셔너리에서 이름이 지정된 컬렉션을 사용하는 예시 \{#example-of-using-named-collections-with-a-dictionary-with-source-clickhouse\}

```sql
CREATE DICTIONARY dict(a Int64, b String)
PRIMARY KEY a
SOURCE(CLICKHOUSE(NAME remote1 TABLE test DB default))
LIFETIME(MIN 1 MAX 2)
LAYOUT(HASHED());

SELECT dictGet('dict', 'b', 1);
┌─dictGet('dict', 'b', 1)─┐
│ a                       │
└─────────────────────────┘
```


## Kafka에 접근하기 위한 명명된 컬렉션 \{#named-collections-for-accessing-kafka\}

매개변수에 대한 자세한 설명은 [Kafka](../engines/table-engines/integrations/kafka.md)를 참조하십시오.

### DDL 예제 \{#ddl-example-3\}

```sql
CREATE NAMED COLLECTION my_kafka_cluster AS
kafka_broker_list = 'localhost:9092',
kafka_topic_list = 'kafka_topic',
kafka_group_name = 'consumer_group',
kafka_format = 'JSONEachRow',
kafka_max_block_size = '1048576';

```


### XML 예제 \{#xml-example-3\}

```xml
<clickhouse>
    <named_collections>
        <my_kafka_cluster>
            <kafka_broker_list>localhost:9092</kafka_broker_list>
            <kafka_topic_list>kafka_topic</kafka_topic_list>
            <kafka_group_name>consumer_group</kafka_group_name>
            <kafka_format>JSONEachRow</kafka_format>
            <kafka_max_block_size>1048576</kafka_max_block_size>
        </my_kafka_cluster>
    </named_collections>
</clickhouse>
```


### Kafka 테이블에서 이름이 지정된 컬렉션을 사용하는 예 \{#example-of-using-named-collections-with-a-kafka-table\}

다음 두 예는 모두 동일한 이름이 지정된 컬렉션 `my_kafka_cluster`를 사용합니다.

```sql
CREATE TABLE queue
(
    timestamp UInt64,
    level String,
    message String
)
ENGINE = Kafka(my_kafka_cluster)

CREATE TABLE queue
(
    timestamp UInt64,
    level String,
    message String
)
ENGINE = Kafka(my_kafka_cluster)
SETTINGS kafka_num_consumers = 4,
         kafka_thread_per_consumer = 1;
```


## 백업용 명명 컬렉션 \{#named-collections-for-backups\}

매개변수에 대한 설명은 [백업 및 복원](/operations/backup/overview)을 참조하십시오.

### DDL 예제 \{#ddl-example-4\}

```sql
BACKUP TABLE default.test to S3(named_collection_s3_backups, 'directory')
```


### XML 예제 \{#xml-example-4\}

```xml
<clickhouse>
    <named_collections>
        <named_collection_s3_backups>
            <url>https://my-s3-bucket.s3.amazonaws.com/backup-S3/</url>
            <access_key_id>ABC123</access_key_id>
            <secret_access_key>Abc+123</secret_access_key>
        </named_collection_s3_backups>
    </named_collections>
</clickhouse>
```


## MongoDB 테이블과 딕셔너리에 액세스하기 위한 Named Collection \{#named-collections-for-accessing-mongodb-table-and-dictionary\}

매개변수에 대한 설명은 [mongodb](../sql-reference/table-functions/mongodb.md)를 참조하십시오.

### DDL 예제 \{#ddl-example-5\}

```sql
CREATE NAMED COLLECTION mymongo AS
user = '',
password = '',
host = '127.0.0.1',
port = 27017,
database = 'test',
collection = 'my_collection',
options = 'connectTimeoutMS=10000'
```


### XML 예제 \{#xml-example-5\}

```xml
<clickhouse>
    <named_collections>
        <mymongo>
            <user></user>
            <password></password>
            <host>127.0.0.1</host>
            <port>27017</port>
            <database>test</database>
            <collection>my_collection</collection>
            <options>connectTimeoutMS=10000</options>
        </mymongo>
    </named_collections>
</clickhouse>
```


#### MongoDB 테이블 \{#mongodb-table\}

```sql
CREATE TABLE mytable(log_type VARCHAR, host VARCHAR, command VARCHAR) ENGINE = MongoDB(mymongo, options='connectTimeoutMS=10000&compressors=zstd')
SELECT count() FROM mytable;

┌─count()─┐
│       2 │
└─────────┘
```

:::note
DDL은 옵션과 관련된 named collection 설정을 덮어씁니다.
:::


#### MongoDB 딕셔너리 \{#mongodb-dictionary\}

```sql
CREATE DICTIONARY dict
(
    `a` Int64,
    `b` String
)
PRIMARY KEY a
SOURCE(MONGODB(NAME mymongo COLLECTION my_dict))
LIFETIME(MIN 1 MAX 2)
LAYOUT(HASHED())

SELECT dictGet('dict', 'b', 2);

┌─dictGet('dict', 'b', 2)─┐
│ two                     │
└─────────────────────────┘
```

:::note
이 명명된 컬렉션은 컬렉션 이름으로 `my_collection`을 지정합니다. 함수 호출에서는 다른 컬렉션을 선택하기 위해 `collection = 'my_dict'`로 이를 재정의합니다.
:::
