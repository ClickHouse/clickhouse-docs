---
description: 'Этот движок обеспечивает интеграцию с экосистемой Apache Hadoop, позволяя управлять данными в HDFS посредством ClickHouse. Этот движок похож на движки File и URL, но предоставляет специфичные для Hadoop возможности.'
sidebar_label: 'HDFS'
sidebar_position: 80
slug: /engines/table-engines/integrations/hdfs
title: 'Движок таблиц HDFS'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Движок таблицы HDFS

<CloudNotSupportedBadge/>

Этот движок обеспечивает интеграцию с экосистемой [Apache Hadoop](https://en.wikipedia.org/wiki/Apache_Hadoop), предоставляя возможность управлять данными в [HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html) из ClickHouse. Движок похож на движки [File](/engines/table-engines/special/file) и [URL](/engines/table-engines/special/url), но предоставляет возможности, специфичные для Hadoop.

Эта функциональность не поддерживается командой ClickHouse и известна своей невысокой надежностью. При возникновении любых проблем исправляйте их самостоятельно и отправляйте pull request.



## Использование {#usage}

```sql
ENGINE = HDFS(URI, format)
```

**Параметры движка**

- `URI` — полный URI файла в HDFS. Путь в `URI` может содержать glob-шаблоны. В этом случае таблица будет доступна только для чтения.
- `format` — указывает один из доступных форматов файлов. Для выполнения
  запросов `SELECT` формат должен поддерживать ввод, а для выполнения
  запросов `INSERT` — вывод. Доступные форматы перечислены в разделе
  [Форматы](/sql-reference/formats#formats-overview).
- [PARTITION BY expr]

### PARTITION BY {#partition-by}

`PARTITION BY` — необязательный параметр. В большинстве случаев ключ партиционирования не требуется, а если он необходим, то обычно не нужна детализация более мелкая, чем по месяцам. Партиционирование не ускоряет запросы (в отличие от выражения ORDER BY). Никогда не используйте слишком детальное партиционирование. Не партиционируйте данные по идентификаторам или именам клиентов (вместо этого сделайте идентификатор или имя клиента первым столбцом в выражении ORDER BY).

Для партиционирования по месяцам используйте выражение `toYYYYMM(date_column)`, где `date_column` — столбец с датой типа [Date](/sql-reference/data-types/date.md). Имена партиций в этом случае имеют формат `"YYYYMM"`.

**Пример:**

**1.** Создайте таблицу `hdfs_engine_table`:

```sql
CREATE TABLE hdfs_engine_table (name String, value UInt32) ENGINE=HDFS('hdfs://hdfs1:9000/other_storage', 'TSV')
```

**2.** Заполните файл:

```sql
INSERT INTO hdfs_engine_table VALUES ('one', 1), ('two', 2), ('three', 3)
```

**3.** Выполните запрос к данным:

```sql
SELECT * FROM hdfs_engine_table LIMIT 2
```

```text
┌─name─┬─value─┐
│ one  │     1 │
│ two  │     2 │
└──────┴───────┘
```


## Детали реализации {#implementation-details}

- Чтение и запись могут выполняться параллельно.
- Не поддерживается:
  - Операции `ALTER` и `SELECT...SAMPLE`.
  - Индексы.
  - Репликация [Zero-copy](../../../operations/storing-data.md#zero-copy) возможна, но не рекомендуется.

  :::note Репликация Zero-copy не готова для production
  Репликация Zero-copy отключена по умолчанию в ClickHouse версии 22.8 и выше. Эта функция не рекомендуется для использования в production.
  :::

**Шаблоны в пути**

Несколько компонентов пути могут содержать шаблоны. Для обработки файл должен существовать и соответствовать всему шаблону пути. Список файлов определяется во время выполнения `SELECT` (а не в момент `CREATE`).

- `*` — Заменяет любое количество любых символов, кроме `/`, включая пустую строку.
- `?` — Заменяет любой одиночный символ.
- `{some_string,another_string,yet_another_one}` — Заменяет любую из строк `'some_string', 'another_string', 'yet_another_one'`.
- `{N..M}` — Заменяет любое число в диапазоне от N до M, включая обе границы.

Конструкции с `{}` аналогичны табличной функции [remote](../../../sql-reference/table-functions/remote.md).

**Пример**

1.  Предположим, у нас есть несколько файлов в формате TSV со следующими URI в HDFS:
    - 'hdfs://hdfs1:9000/some_dir/some_file_1'
    - 'hdfs://hdfs1:9000/some_dir/some_file_2'
    - 'hdfs://hdfs1:9000/some_dir/some_file_3'
    - 'hdfs://hdfs1:9000/another_dir/some_file_1'
    - 'hdfs://hdfs1:9000/another_dir/some_file_2'
    - 'hdfs://hdfs1:9000/another_dir/some_file_3'

1.  Существует несколько способов создать таблицу, состоящую из всех шести файлов:

<!-- -->

```sql
CREATE TABLE table_with_range (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV')
```

Другой способ:

```sql
CREATE TABLE table_with_question_mark (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/some_file_?', 'TSV')
```

Таблица состоит из всех файлов в обоих каталогах (все файлы должны соответствовать формату и схеме, описанным в запросе):

```sql
CREATE TABLE table_with_asterisk (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV')
```

:::note
Если список файлов содержит числовые диапазоны с ведущими нулями, используйте конструкцию с фигурными скобками для каждой цифры отдельно или используйте `?`.
:::

**Пример**

Создание таблицы с файлами с именами `file000`, `file001`, ... , `file999`:


```sql
CREATE TABLE big_table (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/big_dir/file{0..9}{0..9}{0..9}', 'CSV')
```

## Конфигурация {#configuration}

Аналогично GraphiteMergeTree, движок HDFS поддерживает расширенную конфигурацию через конфигурационный файл ClickHouse. Можно использовать два ключа конфигурации: глобальный (`hdfs`) и пользовательский (`hdfs_*`). Сначала применяется глобальная конфигурация, затем — пользовательская (если она существует).

```xml
<!-- Глобальные параметры конфигурации для движка HDFS -->
<hdfs>
  <hadoop_kerberos_keytab>/tmp/keytab/clickhouse.keytab</hadoop_kerberos_keytab>
  <hadoop_kerberos_principal>clickuser@TEST.CLICKHOUSE.TECH</hadoop_kerberos_principal>
  <hadoop_security_authentication>kerberos</hadoop_security_authentication>
</hdfs>

<!-- Конфигурация для пользователя "root" -->
<hdfs_root>
  <hadoop_kerberos_principal>root@TEST.CLICKHOUSE.TECH</hadoop_kerberos_principal>
</hdfs_root>
```

### Параметры конфигурации {#configuration-options}

#### Поддерживаются библиотекой libhdfs3 {#supported-by-libhdfs3}


| **параметр**                                    | **значение по умолчанию** |
| ----------------------------------------------- | ----------------------- |
| rpc_client_connect_tcpnodelay                   | true                    |
| dfs_client_read_shortcircuit                    | true                    |
| output_replace-datanode-on-failure              | true                    |
| input_notretry-another-node                     | false                   |
| input_localread_mappedfile                      | true                    |
| dfs_client_use_legacy_blockreader_local         | false                   |
| rpc_client_ping_interval                        | 10 \* 1000              |
| rpc_client_connect_timeout                      | 600 \* 1000             |
| rpc_client_read_timeout                         | 3600 \* 1000            |
| rpc_client_write_timeout                        | 3600 \* 1000            |
| rpc_client_socket_linger_timeout                | -1                      |
| rpc_client_connect_retry                        | 10                      |
| rpc_client_timeout                              | 3600 \* 1000            |
| dfs_default_replica                             | 3                       |
| input_connect_timeout                           | 600 \* 1000             |
| input_read_timeout                              | 3600 \* 1000            |
| input_write_timeout                             | 3600 \* 1000            |
| input_localread_default_buffersize              | 1 _ 1024 _ 1024         |
| dfs_prefetchsize                                | 10                      |
| input_read_getblockinfo_retry                   | 3                       |
| input_localread_blockinfo_cachesize             | 1000                    |
| input_read_max_retry                            | 60                      |
| output_default_chunksize                        | 512                     |
| output_default_packetsize                       | 64 \* 1024              |
| output_default_write_retry                      | 10                      |
| output_connect_timeout                          | 600 \* 1000             |
| output_read_timeout                             | 3600 \* 1000            |
| output_write_timeout                            | 3600 \* 1000            |
| output_close_timeout                            | 3600 \* 1000            |
| output_packetpool_size                          | 1024                    |
| output_heartbeat_interval                       | 10 \* 1000              |
| dfs_client_failover_max_attempts                | 15                      |
| dfs_client_read_shortcircuit_streams_cache_size | 256                     |
| dfs_client_socketcache_expiryMsec               | 3000                    |
| dfs_client_socketcache_capacity                 | 16                      |
| dfs_default_blocksize                           | 64 _ 1024 _ 1024        |
| dfs_default_uri                                 | "hdfs://localhost:9000" |
| hadoop_security_authentication                  | "simple"                |
| hadoop_security_kerberos_ticket_cache_path      | ""                      |
| dfs_client_log_severity                         | "INFO"                  |
| dfs_domain_socket_path                          | ""                      |

[Справочник по конфигурации HDFS](https://hawq.apache.org/docs/userguide/2.3.0.0-incubating/reference/HDFSConfigurationParameterReference.html) содержит описание некоторых параметров.

#### Дополнительные параметры ClickHouse {#clickhouse-extras}

| **параметр**              | **значение по умолчанию** |
| ------------------------- | ------------------------- |
| hadoop_kerberos_keytab    | ""                |
| hadoop_kerberos_principal | ""                |
| libhdfs3_conf             | ""                |

### Ограничения {#limitations}

- `hadoop_security_kerberos_ticket_cache_path` и `libhdfs3_conf` могут быть только глобальными, а не пользовательскими


## Поддержка Kerberos {#kerberos-support}

Если параметр `hadoop_security_authentication` имеет значение `kerberos`, ClickHouse выполняет аутентификацию через Kerberos.
Параметры описаны [здесь](#clickhouse-extras), также может быть полезен параметр `hadoop_security_kerberos_ticket_cache_path`.
Обратите внимание, что из-за ограничений libhdfs3 поддерживается только устаревший подход,
коммуникации с datanode не защищены с помощью SASL (переменная `HADOOP_SECURE_DN_USER` является надёжным индикатором такого
подхода к безопасности). Для справки используйте `tests/integration/test_storage_kerberized_hdfs/hdfs_configs/bootstrap.sh`.


Если указаны параметры `hadoop_kerberos_keytab`, `hadoop_kerberos_principal` или `hadoop_security_kerberos_ticket_cache_path`, будет использоваться аутентификация Kerberos. В этом случае параметры `hadoop_kerberos_keytab` и `hadoop_kerberos_principal` обязательны.

## Поддержка HDFS Namenode HA {#namenode-ha}

Библиотека libhdfs3 поддерживает HDFS namenode HA.

- Скопируйте файл `hdfs-site.xml` с узла HDFS в каталог `/etc/clickhouse-server/`.
- Добавьте следующий фрагмент в конфигурационный файл ClickHouse:

```xml
  <hdfs>
    <libhdfs3_conf>/etc/clickhouse-server/hdfs-site.xml</libhdfs3_conf>
  </hdfs>
```

- Затем используйте значение тега `dfs.nameservices` из файла `hdfs-site.xml` в качестве адреса namenode в URI HDFS. Например, замените `hdfs://appadmin@192.168.101.11:8020/abc/` на `hdfs://appadmin@my_nameservice/abc/`.


## Виртуальные столбцы {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер неизвестен, значение — `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение — `NULL`.


## Настройки хранилища {#storage-settings}

- [hdfs_truncate_on_insert](/operations/settings/settings.md#hdfs_truncate_on_insert) - позволяет усекать файл перед вставкой в него данных. По умолчанию отключена.
- [hdfs_create_new_file_on_insert](/operations/settings/settings.md#hdfs_create_new_file_on_insert) - позволяет создавать новый файл при каждой вставке, если формат имеет суффикс. По умолчанию отключена.
- [hdfs_skip_empty_files](/operations/settings/settings.md#hdfs_skip_empty_files) - позволяет пропускать пустые файлы при чтении. По умолчанию отключена.

**См. также**

- [Виртуальные столбцы](../../../engines/table-engines/index.md#table_engines-virtual_columns)
