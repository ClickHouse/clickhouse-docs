---
'description': 'Documentation for Named collections'
'sidebar_label': '名前付きコレクション'
'sidebar_position': 69
'slug': '/operations/named-collections'
'title': '名前付きコレクション'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge />

名前付きコレクションは、外部ソースとの統合を構成するために使用されるキーとバリューのペアのコレクションを保存する方法を提供します。名前付きコレクションは、辞書、テーブル、テーブル関数、およびオブジェクトストレージで使用できます。

名前付きコレクションはDDLで設定することも、設定ファイルで設定することもでき、ClickHouseが起動するときに適用されます。これにより、オブジェクトの作成が簡素化され、管理権限を持たないユーザーからの資格情報の隠蔽も可能になります。

名前付きコレクションのキーは、対応する関数、テーブルエンジン、データベースなどのパラメータ名と一致する必要があります。以下の例では、各タイプのパラメータリストへのリンクがあります。

名前付きコレクションで設定されたパラメータは、SQLで上書きすることができます。これは以下の例で示されています。この機能は、`[NOT] OVERRIDABLE` キーワードおよびXML属性、あるいは設定オプション `allow_named_collection_override_by_default` を使用して制限することができます。

:::warning
上書きが許可されている場合、管理権限を持たないユーザーが隠そうとしている資格情報を見つけることができる可能性があります。
その目的で名前付きコレクションを使用する場合は、`allow_named_collection_override_by_default` を無効にするべきです（デフォルトでは有効です）。
:::

## システムデータベースに名前付きコレクションを保存する {#storing-named-collections-in-the-system-database}

### DDL例 {#ddl-example}

```sql
CREATE NAMED COLLECTION name AS
key_1 = 'value' OVERRIDABLE,
key_2 = 'value2' NOT OVERRIDABLE,
url = 'https://connection.url/'
```

上記の例では：

* `key_1` は常に上書き可能です。
* `key_2` は決して上書きできません。
* `url` は、`allow_named_collection_override_by_default` の値に応じて上書き可能です。

### DDLでの名前付きコレクション作成の権限 {#permissions-to-create-named-collections-with-ddl}

DDLを使用して名前付きコレクションを管理するには、ユーザーは `named_collection_control` 権限を持っている必要があります。これは `/etc/clickhouse-server/users.d/` にファイルを追加することによって割り当てることができます。例では、ユーザー `default` に `access_management` と `named_collection_control` 権限の両方が付与されています：

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
上記の例では、`password_sha256_hex` の値はパスワードのSHA256ハッシュの16進数表現です。ユーザー `default` のこの設定は `replace=true` という属性を持ち、デフォルト設定では平文の `password` が設定されているため、ユーザーに対して平文とsha256の16進数のパスワードの両方を設定することはできません。
:::

### 名前付きコレクションのストレージ {#storage-for-named-collections}

名前付きコレクションはローカルディスクまたはZooKeeper/Keeperに保存できます。デフォルトではローカルストレージが使用されます。
暗号化されたストレージも使用でき、暗号化は [ディスク暗号化](storing-data#encrypted-virtual-file-system) に使用されるのと同じアルゴリズムで行われ、デフォルトでは `aes_128_ctr` が使用されます。

名前付きコレクションストレージを設定するには、`type` を指定する必要があります。これは `local` または `keeper`/`zookeeper` のいずれかになります。暗号化されたストレージの場合は、`local_encrypted` または `keeper_encrypted`/`zookeeper_encrypted` を使用できます。

ZooKeeper/Keeperを使用するには、設定ファイルの `named_collections_storage` セクションに名前付きコレクションが保存されるZooKeeper/Keeperの `path` を設定する必要があります。以下の例では、暗号化とZooKeeper/Keeperを使用しています：
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

オプションの設定パラメータ `update_timeout_ms` はデフォルトで `5000` に設定されています。

## 設定ファイルに名前付きコレクションを保存する {#storing-named-collections-in-configuration-files}

### XML例 {#xml-example}

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

* `key_1` は常に上書き可能です。
* `key_2` は決して上書きできません。
* `url` は、`allow_named_collection_override_by_default` の値に応じて上書き可能です。

## 名前付きコレクションの変更 {#modifying-named-collections}

DDLクエリで作成された名前付きコレクションは、DDLで変更したり削除したりできます。XMLファイルで作成された名前付きコレクションは、対応するXMLを編集または削除することで管理できます。

### DDL名前付きコレクションを変更する {#alter-a-ddl-named-collection}

コレクション `collection2` のキー `key1` と `key3` を変更または追加します（これはこれらのキーの `overridable` フラグの値を変更しません）：
```sql
ALTER NAMED COLLECTION collection2 SET key1=4, key3='value3'
```

キー `key1` を変更または追加し、常に上書き可能にします：
```sql
ALTER NAMED COLLECTION collection2 SET key1=4 OVERRIDABLE
```

`collection2` からキー `key2` を削除します：
```sql
ALTER NAMED COLLECTION collection2 DELETE key2
```

コレクション `collection2` のキー `key1` を変更または追加し、キー `key3` を削除します：
```sql
ALTER NAMED COLLECTION collection2 SET key1=4, DELETE key3
```

キーをデフォルト設定の `overridable` フラグを使用するよう強制するには、そのキーを削除して再追加する必要があります。
```sql
ALTER NAMED COLLECTION collection2 DELETE key1;
ALTER NAMED COLLECTION collection2 SET key1=4;
```

### DDL名前付きコレクション `collection2` を削除する： {#drop-the-ddl-named-collection-collection2}
```sql
DROP NAMED COLLECTION collection2
```

## S3にアクセスするための名前付きコレクション {#named-collections-for-accessing-s3}

パラメータの説明は [s3 テーブル関数](../sql-reference/table-functions/s3.md) を参照してください。

### DDL例 {#ddl-example-1}

```sql
CREATE NAMED COLLECTION s3_mydata AS
access_key_id = 'AKIAIOSFODNN7EXAMPLE',
secret_access_key = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
format = 'CSV',
url = 'https://s3.us-east-1.amazonaws.com/yourbucket/mydata/'
```

### XML例 {#xml-example-1}

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

### s3() 関数と S3 テーブルの名前付きコレクションの例 {#s3-function-and-s3-table-named-collection-examples}

以下の2つの例は、同じ名前付きコレクション `s3_mydata` を使用しています：

#### s3() 関数 {#s3-function}

```sql
INSERT INTO FUNCTION s3(s3_mydata, filename = 'test_file.tsv.gz',
   format = 'TSV', structure = 'number UInt64', compression_method = 'gzip')
SELECT * FROM numbers(10000);
```

:::tip
上記の `s3()` 関数の最初の引数はコレクションの名前 `s3_mydata` です。名前付きコレクションがなければ、アクセスキーID、シークレット、フォーマット、URLはすべて `s3()` 関数の各呼び出しで渡されることになります。
:::

#### S3テーブル {#s3-table}

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

## MySQLデータベースにアクセスするための名前付きコレクション {#named-collections-for-accessing-mysql-database}

パラメータの説明は [mysql](../sql-reference/table-functions/mysql.md) を参照してください。

### DDL例 {#ddl-example-2}

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

### XML例 {#xml-example-2}

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

### mysql() 関数、MySQLテーブル、MySQLデータベース、及び Dictionary の名前付きコレクションの例 {#mysql-function-mysql-table-mysql-database-and-dictionary-named-collection-examples}

以下の4つの例は、同じ名前付きコレクション `mymysql` を使用しています：

#### mysql() 関数 {#mysql-function}

```sql
SELECT count() FROM mysql(mymysql, table = 'test');

┌─count()─┐
│       3 │
└─────────┘
```
:::note
名前付きコレクションは `table` パラメータを指定しないため、関数呼び出しでは `table = 'test'` として指定します。
:::

#### MySQLテーブル {#mysql-table}

```sql
CREATE TABLE mytable(A Int64) ENGINE = MySQL(mymysql, table = 'test', connection_pool_size=3, replace_query=0);
SELECT count() FROM mytable;

┌─count()─┐
│       3 │
└─────────┘
```

:::note
DDLは、`connection_pool_size` の名前付きコレクション設定を上書きします。
:::

#### MySQLデータベース {#mysql-database}

#### MySQL辞書 {#mysql-dictionary}

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

## PostgreSQLデータベースにアクセスするための名前付きコレクション {#named-collections-for-accessing-postgresql-database}

パラメータの説明は [postgresql](../sql-reference/table-functions/postgresql.md) を参照してください。さらに、以下のエイリアスがあります：

- `username` は `user` のため
- `db` は `database` のため。

パラメータ `addresses_expr` は、`host:port` の代わりにコレクションで使用されます。このパラメータはオプションで、他にもオプションが存在します：`host`、`hostname`、`port`。以下の擬似コードが優先順位を説明します：

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

設定の例：
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

### postgresql 関数と共に名前付きコレクションを使用する例 {#example-of-using-named-collections-with-the-postgresql-function}

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

### PostgreSQLエンジンを持つデータベースと共に名前付きコレクションを使用する例 {#example-of-using-named-collections-with-database-with-engine-postgresql}

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
PostgreSQLはテーブルが作成されるときに名前付きコレクションからデータをコピーします。コレクションの変更は既存のテーブルに影響を与えません。
:::

### PostgreSQLエンジンを持つデータベースと共に名前付きコレクションを使用する例 {#example-of-using-named-collections-with-database-with-engine-postgresql-1}

```sql
CREATE DATABASE mydatabase ENGINE = PostgreSQL(mypg);

SHOW TABLES FROM mydatabase

┌─name─┐
│ test │
└──────┘
```

### source POSTGRESQLを持つ辞書と共に名前付きコレクションを使用する例 {#example-of-using-named-collections-with-a-dictionary-with-source-postgresql}

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

## リモートClickHouseデータベースにアクセスするための名前付きコレクション {#named-collections-for-accessing-a-remote-clickhouse-database}

パラメータの説明は [remote](../sql-reference/table-functions/remote.md/#parameters) を参照してください。

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
`secure` は `remoteSecure` によって接続に必要ないが、辞書には使用できます。

### remote/remoteSecure関数と共に名前付きコレクションを使用する例 {#example-of-using-named-collections-with-the-remoteremotesecure-functions}

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

### source ClickHouseを持つ辞書と共に名前付きコレクションを使用する例 {#example-of-using-named-collections-with-a-dictionary-with-source-clickhouse}

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

## Kafkaにアクセスするための名前付きコレクション {#named-collections-for-accessing-kafka}

パラメータの説明は [Kafka](../engines/table-engines/integrations/kafka.md) を参照してください。

### DDL例 {#ddl-example-3}

```sql
CREATE NAMED COLLECTION my_kafka_cluster AS
kafka_broker_list = 'localhost:9092',
kafka_topic_list = 'kafka_topic',
kafka_group_name = 'consumer_group',
kafka_format = 'JSONEachRow',
kafka_max_block_size = '1048576';

```
### XML例 {#xml-example-3}

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

### Kafkaテーブルと共に名前付きコレクションを使用する例 {#example-of-using-named-collections-with-a-kafka-table}

以下の2つの例は、同じ名前付きコレクション `my_kafka_cluster` を使用しています：

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

パラメータの説明は [バックアップと復元](./backup.md) を参照してください。

### DDL例 {#ddl-example-4}

```sql
BACKUP TABLE default.test to S3(named_collection_s3_backups, 'directory')
```

### XML例 {#xml-example-4}

## MongoDBテーブルおよび辞書にアクセスするための名前付きコレクション {#named-collections-for-accessing-mongodb-table-and-dictionary}

パラメータの説明は [mongodb](../sql-reference/table-functions/mongodb.md) を参照してください。

### DDL例 {#ddl-example-5}

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

### XML例 {#xml-example-5}

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

#### MongoDBテーブル {#mongodb-table}

```sql
CREATE TABLE mytable(log_type VARCHAR, host VARCHAR, command VARCHAR) ENGINE = MongoDB(mymongo, options='connectTimeoutMS=10000&compressors=zstd')
SELECT count() FROM mytable;

┌─count()─┐
│       2 │
└─────────┘
```

:::note
DDLはオプションの名前付きコレクション設定を上書きします。
:::

#### MongoDB辞書 {#mongodb-dictionary}

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
名前付きコレクションはコレクション名に `my_collection` を指定します。関数呼び出しでは、別のコレクションを選択するために `collection = 'my_dict'` により上書きされます。
:::
