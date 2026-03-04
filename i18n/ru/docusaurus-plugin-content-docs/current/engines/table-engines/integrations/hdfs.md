---
description: 'Этот движок обеспечивает интеграцию с экосистемой Apache Hadoop, позволяя управлять данными в HDFS из ClickHouse. Этот движок аналогичен движкам File и URL, но предоставляет функции, специфичные для Hadoop.'
sidebar_label: 'HDFS'
sidebar_position: 80
slug: /engines/table-engines/integrations/hdfs
title: 'Табличный движок HDFS'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# Движок таблицы HDFS \{#hdfs-table-engine\}

<CloudNotSupportedBadge />

Этот движок обеспечивает интеграцию с экосистемой [Apache Hadoop](https://en.wikipedia.org/wiki/Apache_Hadoop), позволяя управлять данными в [HDFS](https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html) через ClickHouse. Этот движок похож на движки [File](/engines/table-engines/special/file) и [URL](/engines/table-engines/special/url), но предоставляет специфические для Hadoop возможности.

Эта функциональность не поддерживается инженерами ClickHouse и известна своим сомнительным качеством реализации. В случае любых проблем исправляйте их самостоятельно и отправляйте pull request.

## Использование \{#usage\}

```sql
ENGINE = HDFS(URI, format)
```

**Параметры движка**

* `URI` — полный URI файла в HDFS. Часть пути в `URI` может содержать glob-шаблоны. В этом случае таблица будет доступна только для чтения.
* `format` — указывает один из доступных форматов файлов. Для выполнения
  `SELECT`-запросов формат должен поддерживаться для ввода, а для выполнения
  `INSERT`-запросов — для вывода. Доступные форматы перечислены в разделе
  [Formats](/sql-reference/formats#formats-overview).
* [PARTITION BY expr]

### PARTITION BY \{#partition-by\}

`PARTITION BY` — необязательный параметр. В большинстве случаев ключ партиционирования не требуется, а если и требуется, обычно нет необходимости делать его более детализированным, чем по месяцам. Партиционирование не ускоряет выполнение запросов (в отличие от выражения ORDER BY). Не следует использовать излишне детализированное партиционирование. Не выполняйте партиционирование данных по идентификаторам или именам клиентов (вместо этого сделайте идентификатор или имя клиента первым столбцом в выражении ORDER BY).

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

**3.** Выполните запрос:

```sql
SELECT * FROM hdfs_engine_table LIMIT 2
```

```text
┌─name─┬─value─┐
│ one  │     1 │
│ two  │     2 │
└──────┴───────┘
```

## Подробности реализации \{#implementation-details\}

* Операции чтения и записи могут выполняться параллельно.
* Не поддерживаются:

  * Операции `ALTER` и `SELECT...SAMPLE`.
  * Индексы.
  * [Zero-copy](../../../operations/storing-data.md#zero-copy) репликация возможна, но не рекомендуется.

  :::note Репликация Zero-copy не готова для продакшена
  Репликация Zero-copy по умолчанию отключена в ClickHouse версии 22.8 и выше. Эта функция не рекомендуется для использования в продакшене.
  :::

**Глоб-выражения в пути**

Несколько компонентов пути могут содержать глоб-выражения. Для обработки файл должен существовать и полностью соответствовать шаблону пути. Список файлов определяется при выполнении `SELECT` (а не при `CREATE`).

* `*` — Соответствует любой последовательности любых символов, кроме `/`, включая пустую строку.
* `?` — Соответствует любому одиночному символу.
* `{some_string,another_string,yet_another_one}` — Соответствует любой из строк `'some_string', 'another_string', 'yet_another_one'`.
* `{N..M}` — Соответствует любому числу в диапазоне от N до M включительно.

Конструкции с `{}` аналогичны табличной функции [remote](../../../sql-reference/table-functions/remote.md).

**Пример**

1. Предположим, у нас есть несколько файлов в формате TSV со следующими URI в HDFS:

   * &#39;hdfs://hdfs1:9000/some&#95;dir/some&#95;file&#95;1&#39;
   * &#39;hdfs://hdfs1:9000/some&#95;dir/some&#95;file&#95;2&#39;
   * &#39;hdfs://hdfs1:9000/some&#95;dir/some&#95;file&#95;3&#39;
   * &#39;hdfs://hdfs1:9000/another&#95;dir/some&#95;file&#95;1&#39;
   * &#39;hdfs://hdfs1:9000/another&#95;dir/some&#95;file&#95;2&#39;
   * &#39;hdfs://hdfs1:9000/another&#95;dir/some&#95;file&#95;3&#39;

2. Есть несколько способов создать таблицу, состоящую из всех шести файлов:

{/* */ }

```sql
CREATE TABLE table_with_range (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV')
```

Ещё один способ:

```sql
CREATE TABLE table_with_question_mark (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/some_file_?', 'TSV')
```

Таблица включает все файлы из обоих каталогов (все файлы должны соответствовать формату и схеме, описанным в запросе):

```sql
CREATE TABLE table_with_asterisk (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV')
```

:::note
Если в списке файлов есть диапазоны номеров с ведущими нулями, используйте конструкцию с фигурными скобками для каждой цифры отдельно или используйте `?`.
:::

**Пример**

Создайте таблицу с файлами с именами `file000`, `file001`, ... , `file999`:

```sql
CREATE TABLE big_table (name String, value UInt32) ENGINE = HDFS('hdfs://hdfs1:9000/big_dir/file{0..9}{0..9}{0..9}', 'CSV')
```

## Конфигурация \{#configuration\}

Как и GraphiteMergeTree, движок HDFS поддерживает расширенную настройку с помощью конфигурационного файла ClickHouse. Доступны два ключа конфигурации: глобальный (`hdfs`) и пользовательский (`hdfs_*`). Сначала применяется глобальная конфигурация, а затем — пользовательская (если она есть).

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

### Параметры конфигурации \{#configuration-options\}

#### Поддерживаемые libhdfs3 \{#supported-by-libhdfs3\}

| **параметр**                                         | **значение по умолчанию**       |
| -                                                  | -                    |
| rpc&#95;client&#95;connect&#95;tcpnodelay                      | true                    |
| dfs&#95;client&#95;read&#95;shortcircuit                       | true                    |
| output&#95;replace-datanode-on-failure                   | true                    |
| input&#95;notretry-another-node                          | false                   |
| input&#95;localread&#95;mappedfile                          | true                    |
| dfs&#95;client&#95;use&#95;legacy&#95;blockreader&#95;local          | false                   |
| rpc&#95;client&#95;ping&#95;interval                           | 10  * 1000              |
| rpc&#95;client&#95;connect&#95;timeout                         | 600 * 1000              |
| rpc&#95;client&#95;read&#95;timeout                            | 3600 * 1000             |
| rpc&#95;client&#95;write&#95;timeout                           | 3600 * 1000             |
| rpc&#95;client&#95;socket&#95;linger&#95;timeout                  | -1                      |
| rpc&#95;client&#95;connect&#95;retry                           | 10                      |
| rpc&#95;client&#95;timeout                                  | 3600 * 1000             |
| dfs&#95;default&#95;replica                                 | 3                       |
| input&#95;connect&#95;timeout                               | 600 * 1000              |
| input&#95;read&#95;timeout                                  | 3600 * 1000             |
| input&#95;write&#95;timeout                                 | 3600 * 1000             |
| input&#95;localread&#95;default&#95;buffersize                 | 1 * 1024 * 1024         |
| dfs&#95;prefetchsize                                     | 10                      |
| input&#95;read&#95;getblockinfo&#95;retry                      | 3                       |
| input&#95;localread&#95;blockinfo&#95;cachesize                | 1000                    |
| input&#95;read&#95;max&#95;retry                               | 60                      |
| output&#95;default&#95;chunksize                            | 512                     |
| output&#95;default&#95;packetsize                           | 64 * 1024               |
| output&#95;default&#95;write&#95;retry                         | 10                      |
| output&#95;connect&#95;timeout                              | 600 * 1000              |
| output&#95;read&#95;timeout                                 | 3600 * 1000             |
| output&#95;write&#95;timeout                                | 3600 * 1000             |
| output&#95;close&#95;timeout                                | 3600 * 1000             |
| output&#95;packetpool&#95;size                              | 1024                    |
| output&#95;heartbeat&#95;interval                          | 10 * 1000               |
| dfs&#95;client&#95;failover&#95;max&#95;attempts                  | 15                      |
| dfs&#95;client&#95;read&#95;shortcircuit&#95;streams&#95;cache&#95;size | 256                     |
| dfs&#95;client&#95;socketcache&#95;expiryMsec                  | 3000                    |
| dfs&#95;client&#95;socketcache&#95;capacity                    | 16                      |
| dfs&#95;default&#95;blocksize                               | 64 * 1024 * 1024        |
| dfs&#95;default&#95;uri                                     | &quot;hdfs://localhost:9000&quot; |
| hadoop&#95;security&#95;authentication                      | &quot;simple&quot;                |
| hadoop&#95;security&#95;kerberos&#95;ticket&#95;cache&#95;path       | &quot;&quot;                      |
| dfs&#95;client&#95;log&#95;severity                            | &quot;INFO&quot;                  |
| dfs&#95;domain&#95;socket&#95;path                             | &quot;&quot;                      |

[Справочник по конфигурации HDFS](https://hawq.apache.org/docs/userguide/2.3.0.0-incubating/reference/HDFSConfigurationParameterReference.html) может пояснить некоторые параметры.

#### Дополнительные параметры ClickHouse \{#clickhouse-extras\}

| **параметр**                                         | **значение по умолчанию**       |
| -                                                  | -                    |
|hadoop&#95;kerberos&#95;keytab                               | &quot;&quot;                      |
|hadoop&#95;kerberos&#95;principal                            | &quot;&quot;                      |
|libhdfs3&#95;conf                                         | &quot;&quot;                      |

### Ограничения \{#limitations\}

* `hadoop_security_kerberos_ticket_cache_path` и `libhdfs3_conf` могут задаваться только глобально, а не на уровне пользователя

## Поддержка Kerberos \{#kerberos-support\}

Если параметр `hadoop_security_authentication` имеет значение `kerberos`, ClickHouse аутентифицируется через Kerberos.
Параметры описаны [здесь](#clickhouse-extras), также может быть полезен `hadoop_security_kerberos_ticket_cache_path`.
Обратите внимание, что из-за ограничений libhdfs3 поддерживается только «старый» подход:
взаимодействие с узлами DataNode не защищено с помощью SASL (`HADOOP_SECURE_DN_USER` является надежным индикатором такого
варианта организации безопасности). В качестве примера используйте `tests/integration/test_storage_kerberized_hdfs/hdfs_configs/bootstrap.sh`.

Если указаны `hadoop_kerberos_keytab`, `hadoop_kerberos_principal` или `hadoop_security_kerberos_ticket_cache_path`, будет использоваться аутентификация Kerberos. В этом случае `hadoop_kerberos_keytab` и `hadoop_kerberos_principal` являются обязательными.

## Поддержка HDFS Namenode HA \{#namenode-ha\}

libhdfs3 поддерживает HDFS Namenode HA.

* Скопируйте `hdfs-site.xml` с узла HDFS в `/etc/clickhouse-server/`.
* Добавьте следующий фрагмент в конфигурационный файл ClickHouse:

```xml
  <hdfs>
    <libhdfs3_conf>/etc/clickhouse-server/hdfs-site.xml</libhdfs3_conf>
  </hdfs>
```

* Затем используйте значение тега `dfs.nameservices` из `hdfs-site.xml` в качестве адреса узла NameNode в URI HDFS. Например, замените `hdfs://appadmin@192.168.101.11:8020/abc/` на `hdfs://appadmin@my_nameservice/abc/`.

## Виртуальные столбцы \{#virtual-columns\}

* `_path` — Путь к файлу. Тип: `LowCardinality(String)`.
* `_file` — Имя файла. Тип: `LowCardinality(String)`.
* `_size` — Размер файла в байтах. Тип: `Nullable(UInt64)`. Если размер неизвестен, значение — `NULL`.
* `_time` — Время последнего изменения файла. Тип: `Nullable(DateTime)`. Если время неизвестно, значение — `NULL`.

## Настройки хранения \{#storage-settings\}

* [hdfs&#95;truncate&#95;on&#95;insert](/operations/settings/settings.md#hdfs_truncate_on_insert) — позволяет усечь файл перед вставкой в него данных. По умолчанию отключена.
* [hdfs&#95;create&#95;new&#95;file&#95;on&#95;insert](/operations/settings/settings.md#hdfs_create_new_file_on_insert) — позволяет создавать новый файл при каждой вставке, если формат имеет суффикс. По умолчанию отключена.
* [hdfs&#95;skip&#95;empty&#95;files](/operations/settings/settings.md#hdfs_skip_empty_files) — позволяет пропускать пустые файлы при чтении. По умолчанию отключена.

**См. также**

* [Виртуальные столбцы](../../../engines/table-engines/index.md#table_engines-virtual_columns)
