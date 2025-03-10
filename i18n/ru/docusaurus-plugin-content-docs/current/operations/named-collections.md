---
slug: /operations/named-collections
sidebar_position: 69
sidebar_label: 'Названные коллекции'
title: 'Названные коллекции'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge />

Названные коллекции предоставляют способ хранения коллекций пар ключ-значение, которые можно использовать для настройки интеграции с внешними источниками. Вы можете использовать названные коллекции с справочниками, таблицами, таблицами функций и облачным хранилищем объектов.

Названные коллекции могут настраиваться с помощью DDL или в конфигурационных файлах и применяются при запуске ClickHouse. Они упрощают создание объектов и скрытие учетных данных от пользователей без административного доступа.

Ключи в названии коллекции должны совпадать с именами параметров соответствующей функции, движка таблицы, базы данных и т. д. В примерах ниже для каждого типа есть ссылка на список параметров.

Параметры, заданные в названии коллекции, могут быть переопределены в SQL, как показано в примерах ниже. Эта возможность может быть ограничена с помощью ключевых слов `[NOT] OVERRIDABLE` и XML-атрибутов и/или параметра конфигурации `allow_named_collection_override_by_default`.

:::warning
Если переопределение разрешено, пользователи без административного доступа могут попытаться выяснить учетные данные, которые вы пытаетесь скрыть. Если вы используете названные коллекции с этой целью, следует отключить `allow_named_collection_override_by_default` (который включен по умолчанию).
:::

## Хранение названных коллекций в системной базе данных {#storing-named-collections-in-the-system-database}

### Пример DDL {#ddl-example}

```sql
CREATE NAMED COLLECTION name AS
key_1 = 'value' OVERRIDABLE,
key_2 = 'value2' NOT OVERRIDABLE,
url = 'https://connection.url/'
```

В приведенном выше примере:

 * `key_1` всегда может быть переопределен.
 * `key_2` никогда не может быть переопределен.
 * `url` может быть переопределен или нет в зависимости от значения `allow_named_collection_override_by_default`.

### Права на создание названных коллекций с помощью DDL {#permissions-to-create-named-collections-with-ddl}

Чтобы управлять названными коллекциями с помощью DDL, пользователь должен иметь привилегию `named_control_collection`. Это можно назначить, добавив файл в `/etc/clickhouse-server/users.d/`. В примере пользователю `default` присваиваются привилегии `access_management` и `named_collection_control`:

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
В приведенном выше примере значение `password_sha256_hex` является шестнадцатеричным представлением хеша SHA256 пароля. Эта конфигурация для пользователя `default` имеет атрибут `replace=true`, так как в стандартной конфигурации установлен незашифрованный `password`, и невозможно установить как незашифрованный, так и sha256 hex пароли для пользователя.
:::

### Хранение названных коллекций {#storage-for-named-collections}

Названные коллекции могут храниться либо на локальном диске, либо в ZooKeeper/Keeper. По умолчанию используется локальное хранилище. Также они могут храниться с использованием шифрования с теми же алгоритмами, которые используются для [шифрования дисков](storing-data#encrypted-virtual-file-system), где по умолчанию используется `aes_128_ctr`.

Чтобы настроить хранилище названных коллекций, необходимо указать `type`. Это может быть либо `local`, либо `keeper`/`zookeeper`. Для зашифрованного хранилища можно использовать `local_encrypted` или `keeper_encrypted`/`zookeeper_encrypted`.

Для использования ZooKeeper/Keeper также необходимо настроить `path` (путь в ZooKeeper/Keeper, где будут храниться названные коллекции) в разделе `named_collections_storage` файла конфигурации. Следующий пример использует шифрование и ZooKeeper/Keeper:
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

Необязательный параметр конфигурации `update_timeout_ms` по умолчанию равен `5000`.

## Хранение названных коллекций в конфигурационных файлах {#storing-named-collections-in-configuration-files}

### Пример XML {#xml-example}

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

В приведенном выше примере:

 * `key_1` всегда может быть переопределен.
 * `key_2` никогда не может быть переопределен.
 * `url` может быть переопределен или нет в зависимости от значения `allow_named_collection_override_by_default`.

## Изменение названных коллекций {#modifying-named-collections}

Названные коллекции, созданные с помощью DDL-запросов, могут быть изменены или удалены с помощью DDL. Названные коллекции, созданные с помощью XML-файлов, могут управляться путем редактирования или удаления соответствующего XML.

### Изменение названной коллекции DDL {#alter-a-ddl-named-collection}

Измените или добавьте ключи `key1` и `key3` коллекции `collection2` (это не изменит значение флага `overridable` для этих ключей):
```sql
ALTER NAMED COLLECTION collection2 SET key1=4, key3='value3'
```

Измените или добавьте ключ `key1` и разрешите его всегда переопределять:
```sql
ALTER NAMED COLLECTION collection2 SET key1=4 OVERRIDABLE
```

Удалите ключ `key2` из `collection2`:
```sql
ALTER NAMED COLLECTION collection2 DELETE key2
```

Измените или добавьте ключ `key1` и удалите ключ `key3` коллекции `collection2`:
```sql
ALTER NAMED COLLECTION collection2 SET key1=4, DELETE key3
```

Чтобы заставить ключ использовать настройки по умолчанию для флага `overridable`, вы должны удалить и снова добавить ключ.
```sql
ALTER NAMED COLLECTION collection2 DELETE key1;
ALTER NAMED COLLECTION collection2 SET key1=4;
```

### Удаление названной коллекции DDL `collection2`: {#drop-the-ddl-named-collection-collection2}
```sql
DROP NAMED COLLECTION collection2
```

## Названные коллекции для доступа к S3 {#named-collections-for-accessing-s3}

Описание параметров см. в [s3 Table Function](../sql-reference/table-functions/s3.md).

### Пример DDL {#ddl-example-1}

```sql
CREATE NAMED COLLECTION s3_mydata AS
access_key_id = 'AKIAIOSFODNN7EXAMPLE',
secret_access_key = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
format = 'CSV',
url = 'https://s3.us-east-1.amazonaws.com/yourbucket/mydata/'
```

### Пример XML {#xml-example-1}

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

### Функция s3() и Примеры таблицы S3 с именованной коллекцией {#s3-function-and-s3-table-named-collection-examples}

Оба следующих примера используют одну и ту же названную коллекцию `s3_mydata`:

#### Функция s3() {#s3-function}

```sql
INSERT INTO FUNCTION s3(s3_mydata, filename = 'test_file.tsv.gz',
   format = 'TSV', structure = 'number UInt64', compression_method = 'gzip')
SELECT * FROM numbers(10000);
```

:::tip
Первый аргумент функции `s3()` выше - это имя коллекции, `s3_mydata`. Без названных коллекций идентификатор ключа доступа, секрет, формат и URL должны были бы передаваться в каждом вызове функции `s3()`.
:::

#### Таблица S3 {#s3-table}

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

## Названные коллекции для доступа к базе данных MySQL {#named-collections-for-accessing-mysql-database}

Описание параметров см. в [mysql](../sql-reference/table-functions/mysql.md).

### Пример DDL {#ddl-example-2}

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

### Пример XML {#xml-example-2}

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

### Примеры функции mysql(), таблицы MySQL, базы данных MySQL и названной коллекции справочников {#mysql-function-mysql-table-mysql-database-and-dictionary-named-collection-examples}

Четыре следующих примера используют одну и ту же названную коллекцию `mymysql`:

#### Функция mysql() {#mysql-function}

```sql
SELECT count() FROM mysql(mymysql, table = 'test');

┌─count()─┐
│       3 │
└─────────┘
```
:::note
Названная коллекция не указывает параметр `table`, поэтому он указывается в вызове функции как `table = 'test'`.
:::

#### Таблица MySQL {#mysql-table}

```sql
CREATE TABLE mytable(A Int64) ENGINE = MySQL(mymysql, table = 'test', connection_pool_size=3, replace_query=0);
SELECT count() FROM mytable;

┌─count()─┐
│       3 │
└─────────┘
```

:::note
DDL переопределяет настройку названной коллекции для connection_pool_size.
:::

#### База данных MySQL {#mysql-database}

```sql
CREATE DATABASE mydatabase ENGINE = MySQL(mymysql);

SHOW TABLES FROM mydatabase;

┌─name───┐
│ source │
│ test   │
└────────┘
```

#### Справочник MySQL {#mysql-dictionary}

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

## Названные коллекции для доступа к базе данных PostgreSQL {#named-collections-for-accessing-postgresql-database}

Описание параметров см. в [postgresql](../sql-reference/table-functions/postgresql.md). В дополнение есть следующие псевдонимы:

- `username` для `user`
- `db` для `database`.

Параметр `addresses_expr` используется в коллекции вместо `host:port`. Параметр является необязательным, потому что есть другие необязательные: `host`, `hostname`, `port`. Следующий псевдокод объясняет приоритет:

```sql
CASE
    WHEN collection['addresses_expr'] != '' THEN collection['addresses_expr']
    WHEN collection['host'] != ''           THEN collection['host'] || ':' || if(collection['port'] != '', collection['port'], '5432')
    WHEN collection['hostname'] != ''       THEN collection['hostname'] || ':' || if(collection['port'] != '', collection['port'], '5432')
END
```

Пример создания:
```sql
CREATE NAMED COLLECTION mypg AS
user = 'pguser',
password = 'jw8s0F4',
host = '127.0.0.1',
port = 5432,
database = 'test',
schema = 'test_schema'
```

Пример конфигурации:
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

### Пример использования названных коллекций с функцией postgresql {#example-of-using-named-collections-with-the-postgresql-function}

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

### Пример использования названных коллекций с базой данных с движком PostgreSQL {#example-of-using-named-collections-with-database-with-engine-postgresql}

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
PostgreSQL копирует данные из названной коллекции при создании таблицы. Изменение в коллекции не влияет на существующие таблицы.
:::

### Пример использования названных коллекций с базой данных с движком PostgreSQL {#example-of-using-named-collections-with-database-with-engine-postgresql-1}

```sql
CREATE DATABASE mydatabase ENGINE = PostgreSQL(mypg);

SHOW TABLES FROM mydatabase

┌─name─┐
│ test │
└──────┘
```

### Пример использования названных коллекций со справочником с источником POSTGRESQL {#example-of-using-named-collections-with-a-dictionary-with-source-postgresql}

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

## Названные коллекции для доступа к удаленной базе данных ClickHouse {#named-collections-for-accessing-a-remote-clickhouse-database}

Описание параметров см. в [remote](../sql-reference/table-functions/remote.md/#parameters).

Пример конфигурации:

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
`secure` не требуется для подключения из-за `remoteSecure`, но его можно использовать для справочников.

### Пример использования названных коллекций с функциями `remote`/`remoteSecure` {#example-of-using-named-collections-with-the-remoteremotesecure-functions}

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

### Пример использования названных коллекций со справочником с источником ClickHouse {#example-of-using-named-collections-with-a-dictionary-with-source-clickhouse}

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

## Названные коллекции для доступа к Kafka {#named-collections-for-accessing-kafka}

Описание параметров см. в [Kafka](../engines/table-engines/integrations/kafka.md).

### Пример DDL {#ddl-example-3}

```sql
CREATE NAMED COLLECTION my_kafka_cluster AS
kafka_broker_list = 'localhost:9092',
kafka_topic_list = 'kafka_topic',
kafka_group_name = 'consumer_group',
kafka_format = 'JSONEachRow',
kafka_max_block_size = '1048576';

```
### Пример XML {#xml-example-3}

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

### Пример использования названных коллекций с таблицей Kafka {#example-of-using-named-collections-with-a-kafka-table}

Оба следующих примера используют одну и ту же названную коллекцию `my_kafka_cluster`:

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

## Названные коллекции для резервного копирования {#named-collections-for-backups}

Для описания параметров см. [Резервное копирование и восстановление](./backup.md).

### Пример DDL {#ddl-example-4}

```sql
BACKUP TABLE default.test to S3(named_collection_s3_backups, 'directory')
```

### Пример XML {#xml-example-4}

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
