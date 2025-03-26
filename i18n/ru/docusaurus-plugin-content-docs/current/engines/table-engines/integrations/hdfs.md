---
description: 'Этот движок обеспечивает интеграцию с экосистемой Apache Hadoop, позволяя управлять данными на HDFS через ClickHouse. Этот движок похож на движки File и URL, но предоставляет функции, специфичные для Hadoop.'
sidebar_label: 'HDFS'
sidebar_position: 80
slug: /engines/table-engines/integrations/hdfs
title: 'HDFS'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# HDFS

<CloudNotSupportedBadge/>

Этот движок обеспечивает интеграцию с [Apache Hadoop](https://en.wikipedia.org/wiki/Apache_Hadoop) экосистемой, позволяя управлять данными на [HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html) через ClickHouse. Этот движок похож на движки [File](/engines/table-engines/special/file) и [URL](/engines/table-engines/special/url), но предоставляет функции, специфичные для Hadoop.

Эта функция не поддерживается инженерами ClickHouse и известна своей ненадежностью. В случае возникновения каких-либо проблем исправляйте их самостоятельно и отправляйте pull request.

## Использование {#usage}

```sql
ENGINE = HDFS(URI, format)
```

**Параметры движка**

- `URI` - полный URI файла в HDFS. Часть пути `URI` может содержать шаблоны. В этом случае таблица будет доступна только для чтения.
- `format` - указывает один из доступных форматов файлов. Для выполнения запросов `SELECT` формат должен поддерживаться для ввода, а для выполнения запросов `INSERT` - для вывода. Доступные форматы перечислены в разделе [Форматы](/sql-reference/formats#formats-overview).
- [PARTITION BY expr]

### PARTITION BY {#partition-by}

`PARTITION BY` — Необязательный. В большинстве случаев вам не нужен ключ партиционирования, и если он вам нужен, как правило, он не должен быть более детализированным, чем по месяцам. Партиционирование не ускоряет запросы (в отличие от выражения ORDER BY). Никогда не используйте слишком детализированное партиционирование. Не партиционируйте ваши данные по идентификаторам клиентов или именам (вместо этого сделайте идентификатор или имя клиента первым столбцом в выражении ORDER BY).

Для партиционирования по месяцам используйте выражение `toYYYYMM(date_column)`, где `date_column` - это столбец с датой типа [Date](/sql-reference/data-types/date.md). Имена партиций здесь имеют формат `"YYYYMM"`.

**Пример:**

**1.** Создайте таблицу `hdfs_engine_table`:

```sql
CREATE TABLE hdfs_engine_table (name String, value UInt32) ENGINE=HDFS('hdfs://hdfs1:9000/other_storage', 'TSV')
```

**2.** Заполните файл:

```sql
INSERT INTO hdfs_engine_table VALUES ('one', 1), ('two', 2), ('three', 3)
```

**3.** Запросите данные:

```sql
SELECT * FROM hdfs_engine_table LIMIT 2
```

```text
┌─name─┬─value─┐
│ one  │     1 │
│ two  │     2 │
└──────┴───────┘
```

## Подробности реализации {#implementation-details}

- Чтения и записи могут выполняться параллельно.
- Не поддерживаются:
    - операции `ALTER` и `SELECT...SAMPLE`.
    - Индексы.
    - [Zero-copy](../../../operations/storing-data.md#zero-copy) репликация возможна, но не рекомендуется.

  :::note Репликация без копирования не готова к производству
  Репликация без копирования отключена по умолчанию в ClickHouse версии 22.8 и выше. Эта функция не рекомендуется для использования в производственной среде.
  :::

**Шаблоны в пути**

Несколько компонентов пути могут содержать шаблоны. Для обработки файла он должен существовать и соответствовать всему шаблону пути. Перечисление файлов определяется во время `SELECT` (не в момент `CREATE`).

- `*` — заменяет любое количество любых символов, кроме `/`, в том числе пустую строку.
- `?` — заменяет любой одиночный символ.
- `{some_string,another_string,yet_another_one}` — заменяет любую из строк `'some_string', 'another_string', 'yet_another_one'`.
- `{N..M}` — заменяет любое число в диапазоне от N до M, включая оба конца.

Конструкции с `{}` аналогичны функции табличного типа [remote](../../../sql-reference/table-functions/remote.md).

**Пример**

1. Предположим, у нас есть несколько файлов формата TSV с следующими URI на HDFS:

    - 'hdfs://hdfs1:9000/some_dir/some_file_1'
    - 'hdfs://hdfs1:9000/some_dir/some_file_2'
    - 'hdfs://hdfs1:9000/some_dir/some_file_3'
    - 'hdfs://hdfs1:9000/another_dir/some_file_1'
    - 'hdfs://hdfs1:9000/another_dir/some_file_2'
    - 'hdfs://hdfs1:9000/another_dir/some_file_3'

2. Существует несколько способов создать таблицу, состоящую из всех шести файлов:

<!-- -->

```sql
CREATE TABLE table_with_range (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV')
```

Другой способ:

```sql
CREATE TABLE table_with_question_mark (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/some_file_?', 'TSV')
```

Таблица состоит из всех файлов в обоих директориях (все файлы должны соответствовать формату и схеме, описанным в запросе):

```sql
CREATE TABLE table_with_asterisk (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV')
```

:::note
Если перечисление файлов содержит диапазоны чисел с ведущими нулями, используйте конструкции с фигурными скобками для каждой цифры отдельно или используйте `?`.
:::

**Пример**

Создайте таблицу с файлами, названными `file000`, `file001`, ... , `file999`:

```sql
CREATE TABLE big_table (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/big_dir/file{0..9}{0..9}{0..9}', 'CSV')
```
## Конфигурация {#configuration}

Похожий на GraphiteMergeTree, движок HDFS поддерживает расширенную конфигурацию с использованием файла конфигурации ClickHouse. Существует два ключа конфигурации, которые вы можете использовать: глобальный (`hdfs`) и пользовательский (`hdfs_*`). Глобальная конфигурация применяется первой, а затем применяется пользовательская конфигурация (если она существует).

```xml
<!-- Глобальные параметры конфигурации для типа движка HDFS -->
<hdfs>
  <hadoop_kerberos_keytab>/tmp/keytab/clickhouse.keytab</hadoop_kerberos_keytab>
  <hadoop_kerberos_principal>clickuser@TEST.CLICKHOUSE.TECH</hadoop_kerberos_principal>
  <hadoop_security_authentication>kerberos</hadoop_security_authentication>
</hdfs>

<!-- Конфигурация, специфичная для пользователя "root" -->
<hdfs_root>
  <hadoop_kerberos_principal>root@TEST.CLICKHOUSE.TECH</hadoop_kerberos_principal>
</hdfs_root>
```

### Параметры конфигурации {#configuration-options}

#### Поддерживается libhdfs3 {#supported-by-libhdfs3}

| **параметр**                                        | **значение по умолчанию**       |
| -                                                  | -                    |
| rpc\_client\_connect\_tcpnodelay                     | true                    |
| dfs\_client\_read\_shortcircuit                      | true                    |
| output\_replace-datanode-on-failure                  | true                    |
| input\_notretry-another-node                         | false                   |
| input\_localread\_mappedfile                         | true                    |
| dfs\_client\_use\_legacy\_blockreader\_local         | false                   |
| rpc\_client\_ping\_interval                          | 10  * 1000              |
| rpc\_client\_connect\_timeout                        | 600 * 1000              |
| rpc\_client\_read\_timeout                           | 3600 * 1000             |
| rpc\_client\_write\_timeout                          | 3600 * 1000             |
| rpc\_client\_socket\_linger\_timeout                 | -1                      |
| rpc\_client\_connect\_retry                          | 10                      |
| rpc\_client\_timeout                                 | 3600 * 1000             |
| dfs\_default\_replica                                | 3                       |
| input\_connect\_timeout                              | 600 * 1000              |
| input\_read\_timeout                                 | 3600 * 1000             |
| input\_write\_timeout                                | 3600 * 1000             |
| input\_localread\_default\_buffersize                | 1 * 1024 * 1024         |
| dfs\_prefetchsize                                    | 10                      |
| input\_read\_getblockinfo\_retry                     | 3                       |
| input\_localread\_blockinfo\_cachesize               | 1000                    |
| input\_read\_max\_retry                              | 60                      |
| output\_default\_chunksize                           | 512                     |
| output\_default\_packetsize                          | 64 * 1024               |
| output\_default\_write\_retry                        | 10                      |
| output\_connect\_timeout                             | 600 * 1000              |
| output\_read\_timeout                                | 3600 * 1000             |
| output\_write\_timeout                               | 3600 * 1000             |
| output\_close\_timeout                               | 3600 * 1000             |
| output\_packetpool\_size                             | 1024                    |
| output\_heartbeat\_interval                         | 10 * 1000               |
| dfs\_client\_failover\_max\_attempts                 | 15                      |
| dfs\_client\_read\_shortcircuit\_streams\_cache\_size | 256                     |
| dfs\_client\_socketcache\_expiryMsec                 | 3000                    |
| dfs\_client\_socketcache\_capacity                   | 16                      |
| dfs\_default\_blocksize                              | 64 * 1024 * 1024        |
| dfs\_default\_uri                                    | "hdfs://localhost:9000" |
| hadoop\_security\_authentication                     | "simple"                |
| hadoop\_security\_kerberos\_ticket\_cache\_path      | ""                      |
| dfs\_client\_log\_severity                           | "INFO"                  |
| dfs\_domain\_socket\_path                            | ""                      |


[Справочник по конфигурации HDFS](https://hawq.apache.org/docs/userguide/2.3.0.0-incubating/reference/HDFSConfigurationParameterReference.html) может объяснить некоторые параметры.

#### Дополнения ClickHouse {#clickhouse-extras}

| **параметр**                                        | **значение по умолчанию**       |
| -                                                  | -                    |
| hadoop\_kerberos\_keytab                             | ""                      |
| hadoop\_kerberos\_principal                          | ""                      |
| libhdfs3\_conf                                       | ""                      |

### Ограничения {#limitations}
* `hadoop_security_kerberos_ticket_cache_path` и `libhdfs3_conf` могут быть глобальными только, не специфичными для пользователя.

## Поддержка Kerberos {#kerberos-support}

Если параметр `hadoop_security_authentication` имеет значение `kerberos`, ClickHouse аутентифицируется через Kerberos. Параметры указаны [здесь](#clickhouse-extras), и `hadoop_security_kerberos_ticket_cache_path` может оказаться полезным. Обратите внимание, что из-за ограничений libhdfs3 поддерживается только старый подход, коммуникации с datanode не защищены SASL (зависимость `HADOOP_SECURE_DN_USER` является надежным индикатором такого подхода безопасности). Используйте `tests/integration/test_storage_kerberized_hdfs/hdfs_configs/bootstrap.sh` в качестве примера.

Если указаны `hadoop_kerberos_keytab`, `hadoop_kerberos_principal` или `hadoop_security_kerberos_ticket_cache_path`, будет использоваться аутентификация Kerberos. В этом случае `hadoop_kerberos_keytab` и `hadoop_kerberos_principal` являются обязательными.

## Поддержка HDFS Namenode HA {#namenode-ha}

libhdfs3 поддерживает HA для HDFS namenode.

- Скопируйте `hdfs-site.xml` с узла HDFS в `/etc/clickhouse-server/`.
- Добавьте следующий фрагмент в файл конфигурации ClickHouse:

```xml
  <hdfs>
    <libhdfs3_conf>/etc/clickhouse-server/hdfs-site.xml</libhdfs3_conf>
  </hdfs>
```

- Затем используйте значение тега `dfs.nameservices` из `hdfs-site.xml` в качестве адреса namenode в URI HDFS. Например, замените `hdfs://appadmin@192.168.101.11:8020/abc/` на `hdfs://appadmin@my_nameservice/abc/`.

## Виртуальные столбцы {#virtual-columns}

- `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
- `_file` — Имя файла. Тип: `LowCardinality(String)`.
- `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер неизвестен, значение равно `NULL`.
- `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение равно `NULL`.

## Настройки хранения {#storage-settings}

- [hdfs_truncate_on_insert](/operations/settings/settings.md#hdfs_truncate_on_insert) - позволяет усекать файл перед вставкой в него. Отключено по умолчанию.
- [hdfs_create_new_file_on_insert](/operations/settings/settings.md#hdfs_create_new_file_on_insert) - позволяет создавать новый файл при каждой вставке, если формат имеет суффикс. Отключено по умолчанию.
- [hdfs_skip_empty_files](/operations/settings/settings.md#hdfs_skip_empty_files) - позволяет пропускать пустые файлы при чтении. Отключено по умолчанию.

**Смотрите также**

- [Виртуальные столбцы](../../../engines/table-engines/index.md#table_engines-virtual_columns)
