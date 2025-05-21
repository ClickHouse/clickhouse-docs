description: '名前付きコレクションに関するドキュメント'
sidebar_label: '名前付きコレクション'
sidebar_position: 69
slug: /operations/named-collections
title: '名前付きコレクション'
```

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge />

名前付きコレクションは、外部ソースとの統合を構成するために使用されるキーと値のペアのコレクションを保存する方法を提供します。名前付きコレクションは、辞書、テーブル、テーブル関数、およびオブジェクトストレージで使用できます。

名前付きコレクションは、DDL または構成ファイルで設定でき、ClickHouse が起動する際に適用されます。これにより、オブジェクトの作成が簡素化され、管理アクセス権のないユーザーからの認証情報の隠蔽が可能になります。

名前付きコレクションのキーは、対応する関数、テーブルエンジン、データベースなどのパラメータ名と一致する必要があります。以下の例では、各タイプのパラメータリストにリンクされています。

名前付きコレクションで設定されたパラメータは、SQL でオーバーライド可能であり、これは以下の例で示されています。この能力は、`[NOT] OVERRIDABLE` キーワードおよび XML 属性、または構成オプション `allow_named_collection_override_by_default` を使用して制限できます。

:::warning
オーバーライドが許可されている場合、管理アクセス権のないユーザーが隠そうとしている認証情報を特定することが可能になるかもしれません。
その目的で名前付きコレクションを使用している場合は、`allow_named_collection_override_by_default`（デフォルトでは有効）を無効にする必要があります。
:::

## システムデータベースにおける名前付きコレクションの保存 {#storing-named-collections-in-the-system-database}

### DDL の例 {#ddl-example}

```sql
CREATE NAMED COLLECTION name AS
key_1 = 'value' OVERRIDABLE,
key_2 = 'value2' NOT OVERRIDABLE,
url = 'https://connection.url/'
```

上記の例では：

 * `key_1` は常にオーバーライド可能です。
 * `key_2` は決してオーバーライドできません。
 * `url` は、`allow_named_collection_override_by_default` の値に応じてオーバーライド可能または不可能です。

### DDL で名前付きコレクションを作成するための権限 {#permissions-to-create-named-collections-with-ddl}

DDL で名前付きコレクションを管理するには、ユーザーは `named_collection_control` 権限を持っている必要があります。これは、`/etc/clickhouse-server/users.d/` にファイルを追加することで割り当てることができます。以下の例では、ユーザー `default` に `access_management` と `named_collection_control` の両方の権限が与えられています：

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
上記の例では、`password_sha256_hex` の値はパスワードの SHA256 ハッシュの16進数表現です。このユーザー `default` の設定は、デフォルト設定でプレーンテキストの `password` が設定されているため、`replace=true` 属性を持っています。ユーザーにはプレーンテキストと sha256 hex パスワードの両方を設定することはできません。
:::

### 名前付きコレクションのストレージ {#storage-for-named-collections}

名前付きコレクションは、ローカルディスクまたは ZooKeeper/Keeper に保存できます。デフォルトではローカルストレージが使用されます。
また、[ディスク暗号化](storing-data#encrypted-virtual-file-system) に使用されるのと同じアルゴリズムを使用して暗号化して保存することもでき、デフォルトでは `aes_128_ctr` が使用されます。

名前付きコレクションストレージを設定するには、`type` を指定する必要があります。これは `local` または `keeper`/`zookeeper` のいずれかです。暗号化ストレージには `local_encrypted` または `keeper_encrypted`/`zookeeper_encrypted` を使用できます。

ZooKeeper/Keeper を使用するには、ストレージ先の `named_collections_storage` セクションの設定ファイル内に `path`（名前付きコレクションが保存される ZooKeeper/Keeper 内のパス）を設定する必要があります。以下の例は、暗号化と ZooKeeper/Keeper を使用しています：
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

オプションの設定パラメータ `update_timeout_ms` のデフォルトは `5000` に等しいです。

## 構成ファイルにおける名前付きコレクションの保存 {#storing-named-collections-in-configuration-files}

### XML の例 {#xml-example}

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

上記の例では：

 * `key_1` は常にオーバーライド可能です。
 * `key_2` は決してオーバーライドできません。
 * `url` は、`allow_named_collection_override_by_default` の値に応じてオーバーライド可能または不可能です。

## 名前付きコレクションの変更 {#modifying-named-collections}

DDL クエリで作成された名前付きコレクションは、DDL によって変更または削除できます。XML ファイルで作成された名前付きコレクションは、対応する XML を編集または削除することで管理できます。

### DDL 名前付きコレクションの変更 {#alter-a-ddl-named-collection}

コレクション `collection2` のキー `key1` と `key3` を変更または追加します（これにより、これらのキーに対する `overridable` フラグの値は変更されません）：
```sql
ALTER NAMED COLLECTION collection2 SET key1=4, key3='value3'
```

キー `key1` を変更または追加し、常にオーバーライド可能にします：
```sql
ALTER NAMED COLLECTION collection2 SET key1=4 OVERRIDABLE
```

コレクション `collection2` からキー `key2` を削除します：
```sql
ALTER NAMED COLLECTION collection2 DELETE key2
```

コレクション `collection2` のキー `key1` を変更または追加し、キー `key3` を削除します：
```sql
ALTER NAMED COLLECTION collection2 SET key1=4, DELETE key3
```

キーを `overridable` フラグのデフォルト設定に戻すには、そのキーを削除して再追加する必要があります。
```sql
ALTER NAMED COLLECTION collection2 DELETE key1;
ALTER NAMED COLLECTION collection2 SET key1=4;
```

### DDL 名前付きコレクション `collection2` を削除します： {#drop-the-ddl-named-collection-collection2}
```sql
DROP NAMED COLLECTION collection2
```

## S3 アクセスのための名前付きコレクション {#named-collections-for-accessing-s3}

パラメータの説明については [s3 テーブル関数](../sql-reference/table-functions/s3.md) を参照してください。

### DDL の例 {#ddl-example-1}

```sql
CREATE NAMED COLLECTION s3_mydata AS
access_key_id = 'AKIAIOSFODNN7EXAMPLE',
secret_access_key = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
format = 'CSV',
url = 'https://s3.us-east-1.amazonaws.com/yourbucket/mydata/'
```

### XML の例 {#xml-example-1}

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

### s3() 関数および S3 テーブル名前付きコレクションの例 {#s3-function-and-s3-table-named-collection-examples}

以下の両方の例は、同じ名前付きコレクション `s3_mydata` を使用しています：

#### s3() 関数 {#s3-function}

```sql
INSERT INTO FUNCTION s3(s3_mydata, filename = 'test_file.tsv.gz',
   format = 'TSV', structure = 'number UInt64', compression_method = 'gzip')
SELECT * FROM numbers(10000);
```

:::tip
上記の `s3()` 関数への最初の引数は、コレクションの名前である `s3_mydata` です。名前付きコレクションを使用しない場合、アクセスキー ID、シークレット、形式、および URL はすべて `s3()` 関数への各呼び出しで渡される必要があります。
:::

#### S3 テーブル {#s3-table}

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

## MySQL データベースへのアクセスのための名前付きコレクション {#named-collections-for-accessing-mysql-database}

パラメータの説明については [mysql](../sql-reference/table-functions/mysql.md) を参照してください。

### DDL の例 {#ddl-example-2}

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

### XML の例 {#xml-example-2}

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

### mysql() 関数、MySQL テーブル、MySQL データベース、および辞書名前付きコレクションの例 {#mysql-function-mysql-table-mysql-database-and-dictionary-named-collection-examples}

以下の4つの例は、同じ名前付きコレクション `mymysql` を使用しています：

#### mysql() 関数 {#mysql-function}

```sql
SELECT count() FROM mysql(mymysql, table = 'test');

┌─count()─┐
│       3 │
└─────────┘
```
:::note
名前付きコレクションは `table` パラメータを指定していないため、関数呼び出しでは `table = 'test'` として指定しています。
:::

#### MySQL テーブル {#mysql-table}

```sql
CREATE TABLE mytable(A Int64) ENGINE = MySQL(mymysql, table = 'test', connection_pool_size=3, replace_query=0);
SELECT count() FROM mytable;

┌─count()─┐
│       3 │
└─────────┘
```

:::note
DDL が接続プールサイズに対する名前付きコレクション設定をオーバーライドします。
:::

#### MySQL データベース {#mysql-database}

```sql
CREATE DATABASE mydatabase ENGINE = MySQL(mymysql);

SHOW TABLES FROM mydatabase;

┌─name───┐
│ source │
│ test   │
└────────┘
```

#### MySQL 辞書 {#mysql-dictionary}

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

## PostgreSQL データベースへのアクセスのための名前付きコレクション {#named-collections-for-accessing-postgresql-database}

パラメータの説明については [postgresql](../sql-reference/table-functions/postgresql.md) を参照してください。さらに、以下のエイリアスがあります：

- `username` は `user` のために
- `db` は `database` のために

`addresses_expr` パラメータは、`host:port` の代わりにコレクション内で使用されます。このパラメータはオプションであり、他のオプションの `host`、`hostname`、`port` があります。以下の擬似コードは優先順位を説明します：

```sql
CASE
    WHEN collection['addresses_expr'] != '' THEN collection['addresses_expr']
    WHEN collection['host'] != ''           THEN collection['host'] || ':' || if(collection['port'] != '', collection['port'], '5432')
    WHEN collection['hostname'] != ''       THEN collection['hostname'] || ':' || if(collection['port'] != '', collection['port'], '5432')
END
```

作成の例：
```sql
CREATE NAMED COLLECTION mypg AS
user = 'pguser',
password = 'jw8s0F4',
host = '127.0.0.1',
port = 5432,
database = 'test',
schema = 'test_schema'
```

構成の例：
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

### PostgreSQL 関数を使用した名前付きコレクションの例 {#example-of-using-named-collections-with-the-postgresql-function}

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

### PostgreSQL エンジンのデータベースを使用した名前付きコレクションの例 {#example-of-using-named-collections-with-database-with-engine-postgresql}

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
PostgreSQL はテーブルが作成されるときに名前付きコレクションからデータをコピーします。コレクションの変更は既存のテーブルに影響を与えません。
:::

### PostgreSQL エンジンのデータベースを使用した名前付きコレクションの例 {#example-of-using-named-collections-with-database-with-engine-postgresql-1}

```sql
CREATE DATABASE mydatabase ENGINE = PostgreSQL(mypg);

SHOW TABLES FROM mydatabase

┌─name─┐
│ test │
└──────┘
```

### PostgreSQL ソースを持つ辞書で名前付きコレクションを使用する例 {#example-of-using-named-collections-with-a-dictionary-with-source-postgresql}

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

## リモート ClickHouse データベースにアクセスするための名前付きコレクション {#named-collections-for-accessing-a-remote-clickhouse-database}

パラメータの説明については [remote](../sql-reference/table-functions/remote.md/#parameters) を参照してください。

設定の例：

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
`secure` は `remoteSecure` のための接続には必要ありませんが、辞書に使用できます。

### `remote`/`remoteSecure` 関数を使用した名前付きコレクションの例 {#example-of-using-named-collections-with-the-remoteremotesecure-functions}

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

### ClickHouse ソースを持つ辞書で名前付きコレクションを使用する例 {#example-of-using-named-collections-with-a-dictionary-with-source-clickhouse}

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

## Kafka へのアクセスのための名前付きコレクション {#named-collections-for-accessing-kafka}

パラメータの説明については [Kafka](../engines/table-engines/integrations/kafka.md) を参照してください。

### DDL の例 {#ddl-example-3}

```sql
CREATE NAMED COLLECTION my_kafka_cluster AS
kafka_broker_list = 'localhost:9092',
kafka_topic_list = 'kafka_topic',
kafka_group_name = 'consumer_group',
kafka_format = 'JSONEachRow',
kafka_max_block_size = '1048576';

```
### XML の例 {#xml-example-3}

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

### Kafka テーブルを使用した名前付きコレクションの例 {#example-of-using-named-collections-with-a-kafka-table}

以下の両方の例は、同じ名前付きコレクション `my_kafka_cluster` を使用しています：

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

## バックアップのための名前付きコレクション {#named-collections-for-backups}

パラメータの説明については [Backup and Restore](./backup.md) を参照してください。

### DDL の例 {#ddl-example-4}

```sql
BACKUP TABLE default.test to S3(named_collection_s3_backups, 'directory')
```

### XML の例 {#xml-example-4}

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

## MongoDB テーブルおよび辞書にアクセスするための名前付きコレクション {#named-collections-for-accessing-mongodb-table-and-dictionary}

パラメータの説明については [mongodb](../sql-reference/table-functions/mongodb.md) を参照してください。

### DDL の例 {#ddl-example-5}

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

### XML の例 {#xml-example-5}

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

#### MongoDB テーブル {#mongodb-table}

```sql
CREATE TABLE mytable(log_type VARCHAR, host VARCHAR, command VARCHAR) ENGINE = MongoDB(mymongo, options='connectTimeoutMS=10000&compressors=zstd')
SELECT count() FROM mytable;

┌─count()─┐
│       2 │
└─────────┘
```

:::note
DDL はオプションに対する名前付きコレクション設定をオーバーライドします。
:::

#### MongoDB 辞書 {#mongodb-dictionary}

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
名前付きコレクションはコレクション名のために `my_collection` を指定します。関数呼び出しでは `collection = 'my_dict'` により別のコレクションが選択されます。
:::
