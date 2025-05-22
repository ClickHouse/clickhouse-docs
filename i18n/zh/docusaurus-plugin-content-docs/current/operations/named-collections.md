---
'description': '命名集合的文档'
'sidebar_label': '命名集合'
'sidebar_position': 69
'slug': '/operations/named-collections'
'title': '命名集合'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge />

命名集合提供了一种存储键值对集合的方法，以用于配置与外部源的集成。你可以使用命名集合与字典、表、表函数和对象存储。

命名集合可以通过DDL或在配置文件中进行配置，并在ClickHouse启动时应用。它们简化了对象的创建以及对没有管理访问权限的用户隐藏凭证的操作。

命名集合中的键必须与相应函数、表引擎、数据库等的参数名称匹配。在下面的示例中，每种类型的参数列表都是链接的。

在命名集合中设置的参数可以在SQL中被覆盖，下面的例子展示了这一点。使用`[NOT] OVERRIDABLE`关键字和XML属性以及/或者配置选项`allow_named_collection_override_by_default`可以限制这一能力。

:::warning
如果允许覆盖，那么没有管理权限的用户可能能够找出你试图隐藏的凭证。
如果你是出于这个目的使用命名集合，应该禁用
`allow_named_collection_override_by_default`（默认启用）。
:::

## 在系统数据库中存储命名集合 {#storing-named-collections-in-the-system-database}

### DDL 示例 {#ddl-example}

```sql
CREATE NAMED COLLECTION name AS
key_1 = 'value' OVERRIDABLE,
key_2 = 'value2' NOT OVERRIDABLE,
url = 'https://connection.url/'
```

在上述示例中：

 * `key_1` 始终可以被覆盖。
 * `key_2` 不能被覆盖。
 * `url` 可以根据`allow_named_collection_override_by_default`的值被覆盖或不被覆盖。

### 使用DDL创建命名集合的权限 {#permissions-to-create-named-collections-with-ddl}

要用DDL管理命名集合，用户必须拥有`named_collection_control`权限。可以通过在`/etc/clickhouse-server/users.d/`中添加文件来分配该权限。此示例为用户`default`分配了`access_management`和`named_collection_control`权限：

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
在上述示例中，`password_sha256_hex`值是密码SHA256哈希的十六进制表示。用户`default`的此配置属性`replace=true`，由于默认配置有一个明文设置的`password`，因此不可能同时为一个用户设置明文密码和sha256十六进制密码。
:::

### 命名集合的存储 {#storage-for-named-collections}

命名集合可以存储在本地磁盘或ZooKeeper/Keeper中。默认情况下使用本地存储。
它们也可以使用与[磁盘加密](storing-data#encrypted-virtual-file-system)相同的算法进行加密存储，默认使用`aes_128_ctr`。

要配置命名集合的存储，你需要指定一个`type`。这可以是`local`或`keeper`/`zookeeper`。对于加密存储，你可以使用`local_encrypted`或`keeper_encrypted`/`zookeeper_encrypted`。

要使用ZooKeeper/Keeper，还需要在配置文件的`named_collections_storage`部分设置一个`path`（在ZooKeeper/Keeper中命名集合的存储路径）。以下示例使用加密和ZooKeeper/Keeper：
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

可选配置参数`update_timeout_ms`默认值为`5000`。

## 在配置文件中存储命名集合 {#storing-named-collections-in-configuration-files}

### XML 示例 {#xml-example}

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

在上述示例中：

 * `key_1` 始终可以被覆盖。
 * `key_2` 不能被覆盖。
 * `url` 可以根据`allow_named_collection_override_by_default`的值被覆盖或不被覆盖。

## 修改命名集合 {#modifying-named-collections}

使用DDL查询创建的命名集合可以使用DDL进行修改或删除。使用XML文件创建的命名集合可以通过编辑或删除相应的XML进行管理。

### 修改DDL命名集合 {#alter-a-ddl-named-collection}

更改或添加集合`collection2`的键`key1`和`key3`
（这不会改变这些键的`overridable`标志的值）：
```sql
ALTER NAMED COLLECTION collection2 SET key1=4, key3='value3'
```

更改或添加键`key1`并允许其始终被覆盖：
```sql
ALTER NAMED COLLECTION collection2 SET key1=4 OVERRIDABLE
```

从`collection2`中移除键`key2`：
```sql
ALTER NAMED COLLECTION collection2 DELETE key2
```

更改或添加键`key1`并删除集合`collection2`中的键`key3`：
```sql
ALTER NAMED COLLECTION collection2 SET key1=4, DELETE key3
```

要强制一个键使用`overridable`标志的默认设置，你必须移除并重新添加该键。
```sql
ALTER NAMED COLLECTION collection2 DELETE key1;
ALTER NAMED COLLECTION collection2 SET key1=4;
```

### 删除DDL命名集合`collection2`： {#drop-the-ddl-named-collection-collection2}
```sql
DROP NAMED COLLECTION collection2
```

## 用于访问S3的命名集合 {#named-collections-for-accessing-s3}

参数的描述请参见[s3表函数](../sql-reference/table-functions/s3.md)。

### DDL 示例 {#ddl-example-1}

```sql
CREATE NAMED COLLECTION s3_mydata AS
access_key_id = 'AKIAIOSFODNN7EXAMPLE',
secret_access_key = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
format = 'CSV',
url = 'https://s3.us-east-1.amazonaws.com/yourbucket/mydata/'
```

### XML 示例 {#xml-example-1}

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

### s3()函数和S3表命名集合示例 {#s3-function-and-s3-table-named-collection-examples}

下面的两个示例均使用相同的命名集合`s3_mydata`：

#### s3() 函数 {#s3-function}

```sql
INSERT INTO FUNCTION s3(s3_mydata, filename = 'test_file.tsv.gz',
   format = 'TSV', structure = 'number UInt64', compression_method = 'gzip')
SELECT * FROM numbers(10000);
```

:::tip
上面`s3()`函数的第一个参数是集合的名称`s3_mydata`。如果没有命名集合，访问密钥ID、秘钥、格式和URL将被传递到`s3()`函数的每次调用中。
:::

#### S3表 {#s3-table}

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

## 用于访问MySQL数据库的命名集合 {#named-collections-for-accessing-mysql-database}

参数的描述请参见[mysql](../sql-reference/table-functions/mysql.md)。

### DDL 示例 {#ddl-example-2}

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

### XML 示例 {#xml-example-2}

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

### mysql()函数、MySQL表、MySQL数据库和字典命名集合示例 {#mysql-function-mysql-table-mysql-database-and-dictionary-named-collection-examples}

以下四个示例使用相同的命名集合`mymysql`：

#### mysql() 函数 {#mysql-function}

```sql
SELECT count() FROM mysql(mymysql, table = 'test');

┌─count()─┐
│       3 │
└─────────┘
```
:::note
命名集合未指定`table`参数，因此它在函数调用中被指定为`table = 'test'`。
:::

#### MySQL表 {#mysql-table}

```sql
CREATE TABLE mytable(A Int64) ENGINE = MySQL(mymysql, table = 'test', connection_pool_size=3, replace_query=0);
SELECT count() FROM mytable;

┌─count()─┐
│       3 │
└─────────┘
```

:::note
DDL覆盖了命名集合中`connection_pool_size`的设置。
:::

#### MySQL数据库 {#mysql-database}

```sql
CREATE DATABASE mydatabase ENGINE = MySQL(mymysql);

SHOW TABLES FROM mydatabase;

┌─name───┐
│ source │
│ test   │
└────────┘
```

#### MySQL字典 {#mysql-dictionary}

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

## 用于访问PostgreSQL数据库的命名集合 {#named-collections-for-accessing-postgresql-database}

参数的描述请参见[postgresql](../sql-reference/table-functions/postgresql.md)。此外，还有别名：

- `username` 对应 `user`
- `db` 对应 `database`。

参数`addresses_expr`在集合中用于代替`host:port`。该参数是可选的，因为还有其他可选参数：`host`、`hostname`、`port`。以下伪代码解释了优先级：

```sql
CASE
    WHEN collection['addresses_expr'] != '' THEN collection['addresses_expr']
    WHEN collection['host'] != ''           THEN collection['host'] || ':' || if(collection['port'] != '', collection['port'], '5432')
    WHEN collection['hostname'] != ''       THEN collection['hostname'] || ':' || if(collection['port'] != '', collection['port'], '5432')
END
```

创建示例：
```sql
CREATE NAMED COLLECTION mypg AS
user = 'pguser',
password = 'jw8s0F4',
host = '127.0.0.1',
port = 5432,
database = 'test',
schema = 'test_schema'
```

配置示例：
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

### 使用postgresql函数的命名集合示例 {#example-of-using-named-collections-with-the-postgresql-function}

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

### 使用引擎为PostgreSQL的数据库的命名集合示例 {#example-of-using-named-collections-with-database-with-engine-postgresql}

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
PostgreSQL在创建表时从命名集合中复制数据。集合中的更改不会影响现有表。
:::

### 使用引擎为PostgreSQL的数据库的命名集合示例 {#example-of-using-named-collections-with-database-with-engine-postgresql-1}

```sql
CREATE DATABASE mydatabase ENGINE = PostgreSQL(mypg);

SHOW TABLES FROM mydatabase

┌─name─┐
│ test │
└──────┘
```

### 使用来源为POSTGRESQL的字典的命名集合示例 {#example-of-using-named-collections-with-a-dictionary-with-source-postgresql}

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

## 用于访问远程ClickHouse数据库的命名集合 {#named-collections-for-accessing-a-remote-clickhouse-database}

参数的描述请参见[remote](../sql-reference/table-functions/remote.md/#parameters)。

配置示例：

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
`secure`在连接时不需要因为`remoteSecure`，但可以用于字典。

### 使用`remote`/`remoteSecure`函数的命名集合示例 {#example-of-using-named-collections-with-the-remoteremotesecure-functions}

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

### 使用来源为ClickHouse的字典的命名集合示例 {#example-of-using-named-collections-with-a-dictionary-with-source-clickhouse}

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

## 用于访问Kafka的命名集合 {#named-collections-for-accessing-kafka}

参数的描述请参见[Kafka](../engines/table-engines/integrations/kafka.md)。

### DDL 示例 {#ddl-example-3}

```sql
CREATE NAMED COLLECTION my_kafka_cluster AS
kafka_broker_list = 'localhost:9092',
kafka_topic_list = 'kafka_topic',
kafka_group_name = 'consumer_group',
kafka_format = 'JSONEachRow',
kafka_max_block_size = '1048576';

```
### XML 示例 {#xml-example-3}

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

### 使用Kafka表的命名集合示例 {#example-of-using-named-collections-with-a-kafka-table}

下面的两个示例均使用相同的命名集合`my_kafka_cluster`：

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

## 用于备份的命名集合 {#named-collections-for-backups}

参数的描述请参见[备份与恢复](./backup.md)。

### DDL 示例 {#ddl-example-4}

```sql
BACKUP TABLE default.test to S3(named_collection_s3_backups, 'directory')
```

### XML 示例 {#xml-example-4}

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

## 用于访问MongoDB表和字典的命名集合 {#named-collections-for-accessing-mongodb-table-and-dictionary}

参数的描述请参见[mongodb](../sql-reference/table-functions/mongodb.md)。

### DDL 示例 {#ddl-example-5}

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

### XML 示例 {#xml-example-5}

#### MongoDB表 {#mongodb-table}

```sql
CREATE TABLE mytable(log_type VARCHAR, host VARCHAR, command VARCHAR) ENGINE = MongoDB(mymongo, options='connectTimeoutMS=10000&compressors=zstd')
SELECT count() FROM mytable;

┌─count()─┐
│       2 │
└─────────┘
```

:::note
DDL覆盖了命名集合中选项的设置。
:::

#### MongoDB字典 {#mongodb-dictionary}

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
命名集合指定了集合名称为`my_collection`。在函数调用中，它被`collection = 'my_dict'`覆盖，以选择另一个集合。
:::
