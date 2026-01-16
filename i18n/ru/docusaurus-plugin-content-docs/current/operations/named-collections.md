---
description: 'Документация по именованным коллекциям'
sidebar_label: 'Именованные коллекции'
sidebar_position: 69
slug: /operations/named-collections
title: 'Именованные коллекции'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

<CloudNotSupportedBadge />

Именованные коллекции предоставляют способ хранения наборов пар ключ-значение,
используемых для настройки интеграций с внешними источниками. Вы можете использовать именованные коллекции
со словарями, таблицами, табличными функциями и объектным хранилищем.

Именованные коллекции можно настраивать с помощью DDL или в конфигурационных файлах; они применяются
при запуске ClickHouse. Они упрощают создание объектов и скрытие учетных данных
от пользователей без административного доступа.

Ключи в именованной коллекции должны соответствовать именам параметров соответствующей
функции, движка таблиц, базы данных и т. д. В примерах ниже для каждого типа
приведена ссылка на список параметров.

Параметры, заданные в именованной коллекции, могут быть переопределены в SQL — это показано в примерах
ниже. Эту возможность можно ограничить с помощью ключевых слов `[NOT] OVERRIDABLE` и XML-атрибутов
и/или параметра конфигурации `allow_named_collection_override_by_default`.

:::warning
Если переопределение разрешено, пользователи без административного доступа могут
получить возможность вычислить учетные данные, которые вы пытаетесь скрыть.
Если вы используете именованные коллекции с этой целью, следует отключить
`allow_named_collection_override_by_default` (по умолчанию он включен).
:::


## Хранение именованных коллекций в системной базе данных \\{#storing-named-collections-in-the-system-database\\}

### Пример DDL \{#ddl-example\}

```sql
CREATE NAMED COLLECTION name AS
key_1 = 'value' OVERRIDABLE,
key_2 = 'value2' NOT OVERRIDABLE,
url = 'https://connection.url/'
```

В приведённом выше примере:

* `key_1` всегда может быть переопределён.
* `key_2` никогда не может быть переопределён.
* Возможность переопределения `url` зависит от значения `allow_named_collection_override_by_default`.


### Права на создание именованных коллекций с помощью DDL \{#permissions-to-create-named-collections-with-ddl\}

Чтобы управлять именованными коллекциями с помощью DDL, пользователь должен иметь привилегию `named_collection_control`. Её можно назначить, добавив файл в `/etc/clickhouse-server/users.d/`. В примере пользователю `default` назначаются привилегии `access_management` и `named_collection_control`:

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
В приведённом выше примере значение `password_sha256_hex` является шестнадцатеричным представлением SHA256-хеша пароля. В этой конфигурации для пользователя `default` указан атрибут `replace=true`, поскольку в конфигурации по умолчанию для этого пользователя задан пароль в открытом виде (`password`), а для одного и того же пользователя нельзя одновременно задать пароль в открытом виде и пароль в виде SHA256-хеша в шестнадцатеричном формате.
:::


### Хранилище для именованных коллекций \{#storage-for-named-collections\}

Именованные коллекции могут храниться либо на локальном диске, либо в ZooKeeper/Keeper. По умолчанию используется локальное хранилище.
Их также можно хранить с использованием шифрования с теми же алгоритмами, что применяются для [шифрования диска](storing-data#encrypted-virtual-file-system),
где по умолчанию используется `aes_128_ctr`.

Чтобы настроить хранилище именованных коллекций, нужно задать `type`. Это может быть либо `local`, либо `keeper`/`zookeeper`. Для зашифрованного хранилища
можно использовать `local_encrypted` или `keeper_encrypted`/`zookeeper_encrypted`.

Чтобы использовать ZooKeeper/Keeper, также необходимо задать `path` (путь в ZooKeeper/Keeper, где будут храниться именованные коллекции) в
секции `named_collections_storage` в конфигурационном файле. В следующем примере используется шифрование и ZooKeeper/Keeper:

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

Необязательный конфигурационный параметр `update_timeout_ms` по умолчанию равен `5000`.


## Хранение именованных коллекций в конфигурационных файлах \\{#storing-named-collections-in-configuration-files\\}

### Пример на XML \{#xml-example\}

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

В приведённом выше примере:

* `key_1` всегда может быть переопределён.
* `key_2` никогда не может быть переопределён.
* `url` может быть как переопределён, так и нет, в зависимости от значения `allow_named_collection_override_by_default`.


## Изменение именованных коллекций \\{#modifying-named-collections\\}

Именованные коллекции, созданные с помощью DDL-запросов, можно изменять или удалять с помощью DDL. Именованными коллекциями, созданными из XML-файлов, можно управлять, редактируя или удаляя соответствующие XML-файлы.

### Изменение именованной коллекции, созданной через DDL \{#alter-a-ddl-named-collection\}

Измените или добавьте ключи `key1` и `key3` коллекции `collection2`
(это не изменит значение флага `overridable` для этих ключей):

```sql
ALTER NAMED COLLECTION collection2 SET key1=4, key3='value3'
```

Измените или добавьте ключ `key1` и разрешите всегда переопределять его значение:

```sql
ALTER NAMED COLLECTION collection2 SET key1=4 OVERRIDABLE
```

Удалите ключ `key2` из `collection2`:

```sql
ALTER NAMED COLLECTION collection2 DELETE key2
```

Измените или добавьте ключ `key1` в коллекции `collection2` и удалите ключ `key3`:

```sql
ALTER NAMED COLLECTION collection2 SET key1=4, DELETE key3
```

Чтобы вернуть ключу настройки флага `overridable` по умолчанию, необходимо удалить этот ключ и добавить его заново.

```sql
ALTER NAMED COLLECTION collection2 DELETE key1;
ALTER NAMED COLLECTION collection2 SET key1=4;
```


### Удалите именованную коллекцию DDL `collection2`: \{#drop-the-ddl-named-collection-collection2\}

```sql
DROP NAMED COLLECTION collection2
```


## Именованные коллекции для доступа к S3 \\{#named-collections-for-accessing-s3\\}

Описание параметров см. в разделе [табличной функции s3](../sql-reference/table-functions/s3.md).

### Пример DDL \{#ddl-example-1\}

```sql
CREATE NAMED COLLECTION s3_mydata AS
access_key_id = 'AKIAIOSFODNN7EXAMPLE',
secret_access_key = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
format = 'CSV',
url = 'https://s3.us-east-1.amazonaws.com/yourbucket/mydata/'
```


### Пример XML \{#xml-example-1\}

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


### Примеры функции s3() и именованной коллекции таблицы S3 \\{#s3-function-and-s3-table-named-collection-examples\\}

Оба следующих примера используют одну и ту же именованную коллекцию `s3_mydata`:

#### Функция s3() \{#s3-function\}

```sql
INSERT INTO FUNCTION s3(s3_mydata, filename = 'test_file.tsv.gz',
   format = 'TSV', structure = 'number UInt64', compression_method = 'gzip')
SELECT * FROM numbers(10000);
```

:::tip
Первый аргумент функции `s3()` — имя коллекции `s3_mydata`. Без именованных коллекций идентификатор ключа доступа, секретный ключ, формат и URL пришлось бы передавать при каждом вызове функции `s3()`.
:::


#### Таблица S3 \{#s3-table\}

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


## Именованные коллекции для доступа к базе данных MySQL \\{#named-collections-for-accessing-mysql-database\\}

См. описание параметров в разделе [mysql](../sql-reference/table-functions/mysql.md).

### Пример DDL \{#ddl-example-2\}

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


### Пример XML \{#xml-example-2\}

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


### Примеры для функции mysql(), таблицы MySQL, базы данных MySQL и именованной коллекции Dictionary \\{#mysql-function-mysql-table-mysql-database-and-dictionary-named-collection-examples\\}

Следующие четыре примера используют одну и ту же именованную коллекцию `mymysql`:

#### Функция mysql() \{#mysql-function\}

```sql
SELECT count() FROM mysql(mymysql, table = 'test');

┌─count()─┐
│       3 │
└─────────┘
```

:::note
Именованная коллекция не содержит параметр `table`, поэтому он передаётся в вызове функции как `table = 'test'`.
:::


#### Таблица MySQL \{#mysql-table\}

```sql
CREATE TABLE mytable(A Int64) ENGINE = MySQL(mymysql, table = 'test', connection_pool_size=3, replace_query=0);
SELECT count() FROM mytable;

┌─count()─┐
│       3 │
└─────────┘
```

:::note
Оператор DDL переопределяет настройку `connection_pool_size`, заданную в именованной коллекции.
:::


#### База данных MySQL \{#mysql-database\}

```sql
CREATE DATABASE mydatabase ENGINE = MySQL(mymysql);

SHOW TABLES FROM mydatabase;

┌─name───┐
│ source │
│ test   │
└────────┘
```


#### Словарь MySQL \{#mysql-dictionary\}

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


## Именованные коллекции для доступа к базе данных PostgreSQL \{#named-collections-for-accessing-postgresql-database\}

Описание параметров см. в разделе [postgresql](../sql-reference/table-functions/postgresql.md). Дополнительно доступны следующие синонимы:

* `username` для `user`
* `db` для `database`.

Параметр `addresses_expr` используется в коллекции вместо `host:port`. Параметр необязательный, так как есть и другие необязательные параметры: `host`, `hostname`, `port`. Следующий псевдокод показывает приоритет:

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


### Пример использования именованных коллекций с табличной функцией `postgresql` \{#example-of-using-named-collections-with-the-postgresql-function\}

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


### Пример использования именованных коллекций с базой данных на движке PostgreSQL \{#example-of-using-named-collections-with-database-with-engine-postgresql\}

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
PostgreSQL копирует данные из именованной коллекции при создании таблицы. Изменения в коллекции не влияют на уже созданные таблицы.
:::


### Пример использования именованных коллекций с базой данных на движке PostgreSQL \{#example-of-using-named-collections-with-database-with-engine-postgresql-1\}

```sql
CREATE DATABASE mydatabase ENGINE = PostgreSQL(mypg);

SHOW TABLES FROM mydatabase

┌─name─┐
│ test │
└──────┘
```


### Пример использования именованных коллекций со словарём, использующим PostgreSQL в качестве источника \{#example-of-using-named-collections-with-a-dictionary-with-source-postgresql\}

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


## Именованные коллекции для доступа к удалённой базе данных ClickHouse \{#named-collections-for-accessing-a-remote-clickhouse-database\}

См. описание параметров в разделе [remote](../sql-reference/table-functions/remote.md/#parameters).

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

`secure` не требуется для подключения из‑за использования `remoteSecure`, но его можно использовать для словарей.


### Пример использования именованных коллекций с функциями `remote`/`remoteSecure` \{#example-of-using-named-collections-with-the-remoteremotesecure-functions\}

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


### Пример использования именованных коллекций со словарём с источником ClickHouse \{#example-of-using-named-collections-with-a-dictionary-with-source-clickhouse\}

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


## Именованные коллекции для доступа к Kafka \\{#named-collections-for-accessing-kafka\\}

См. описание параметров в разделе [Kafka](../engines/table-engines/integrations/kafka.md).

### Пример DDL \{#ddl-example-3\}

```sql
CREATE NAMED COLLECTION my_kafka_cluster AS
kafka_broker_list = 'localhost:9092',
kafka_topic_list = 'kafka_topic',
kafka_group_name = 'consumer_group',
kafka_format = 'JSONEachRow',
kafka_max_block_size = '1048576';

```


### Пример XML \{#xml-example-3\}

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


### Пример использования именованных коллекций с таблицей Kafka \{#example-of-using-named-collections-with-a-kafka-table\}

Оба следующих примера используют одну и ту же именованную коллекцию `my_kafka_cluster`:

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


## Именованные коллекции для резервных копий \\{#named-collections-for-backups\\}

Описание параметров см. в разделе [Резервное копирование и восстановление](/operations/backup/overview).

### Пример DDL \{#ddl-example-4\}

```sql
BACKUP TABLE default.test to S3(named_collection_s3_backups, 'directory')
```


### Пример XML \{#xml-example-4\}

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


## Именованные коллекции для доступа к таблице и словарю MongoDB \\{#named-collections-for-accessing-mongodb-table-and-dictionary\\}

Описание параметров см. в разделе [mongodb](../sql-reference/table-functions/mongodb.md).

### Пример DDL \{#ddl-example-5\}

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


### Пример XML \{#xml-example-5\}

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


#### Таблица MongoDB \{#mongodb-table\}

```sql
CREATE TABLE mytable(log_type VARCHAR, host VARCHAR, command VARCHAR) ENGINE = MongoDB(mymongo, options='connectTimeoutMS=10000&compressors=zstd')
SELECT count() FROM mytable;

┌─count()─┐
│       2 │
└─────────┘
```

:::note
DDL переопределяет параметр `options`, заданный в именованной коллекции.
:::


#### Словарь MongoDB \{#mongodb-dictionary\}

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
Именованная коллекция задаёт для имени коллекции значение `my_collection`. При вызове функции оно переопределяется параметром `collection = 'my_dict'`, чтобы выбрать другую коллекцию.
:::
