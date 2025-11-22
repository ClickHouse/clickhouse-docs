---
description: 'Руководство по резервному копированию и восстановлению таблиц и баз данных ClickHouse'
sidebar_label: 'Резервное копирование и восстановление'
sidebar_position: 10
slug: /operations/backup
title: 'Резервное копирование и восстановление'
doc_type: 'guide'
---



# Резервное копирование и восстановление

- [Резервное копирование на локальный диск](#backup-to-a-local-disk)
- [Настройка резервного копирования и восстановления для работы с S3-эндпоинтом](#configuring-backuprestore-to-use-an-s3-endpoint)
- [Резервное копирование и восстановление с использованием S3-диска](#backuprestore-using-an-s3-disk)
- [Альтернативы](#alternatives)



## Краткое описание команды {#command-summary}

```bash
 BACKUP|RESTORE
  TABLE [db.]table_name [AS [db.]table_name_in_backup]
    [PARTITION[S] partition_expr [, ...]] |
  DICTIONARY [db.]dictionary_name [AS [db.]name_in_backup] |
  DATABASE database_name [AS database_name_in_backup]
    [EXCEPT TABLES ...] |
  TEMPORARY TABLE table_name [AS table_name_in_backup] |
  VIEW view_name [AS view_name_in_backup] |
  ALL [EXCEPT {TABLES|DATABASES}...] } [, ...]
  [ON CLUSTER 'cluster_name']
  TO|FROM File('<path>/<filename>') | Disk('<disk_name>', '<path>/') | S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>')
  [SETTINGS base_backup = File('<path>/<filename>') | Disk(...) | S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>')]
  [SYNC|ASYNC]

```

:::note ALL
До версии 23.4 ClickHouse ключевое слово `ALL` применялось только к команде `RESTORE`.
:::


## Общие сведения {#background}

Хотя [репликация](../engines/table-engines/mergetree-family/replication.md) обеспечивает защиту от аппаратных сбоев, она не защищает от человеческих ошибок: случайного удаления данных, удаления не той таблицы или таблицы не в том кластере, а также программных ошибок, приводящих к некорректной обработке или повреждению данных. Во многих случаях подобные ошибки затрагивают все реплики. В ClickHouse предусмотрены встроенные механизмы защиты от некоторых типов ошибок — например, по умолчанию [невозможно просто удалить таблицы с движком семейства MergeTree, содержащие более 50 ГБ данных](/operations/settings/settings#max_table_size_to_drop). Однако эти механизмы защиты не охватывают все возможные случаи и могут быть обойдены.

Для эффективного предотвращения возможных человеческих ошибок необходимо **заранее** тщательно подготовить стратегию резервного копирования и восстановления данных.

У каждой компании разные доступные ресурсы и бизнес-требования, поэтому не существует универсального решения для резервного копирования и восстановления ClickHouse, которое подходило бы для любой ситуации. То, что работает для одного гигабайта данных, скорее всего, не подойдет для десятков петабайт. Существует множество возможных подходов со своими преимуществами и недостатками, которые будут рассмотрены ниже. Рекомендуется использовать несколько подходов вместо одного, чтобы компенсировать их различные недостатки.

:::note
Имейте в виду, что если вы создали резервную копию и никогда не пытались восстановить данные из нее, велика вероятность того, что восстановление не будет работать должным образом, когда оно действительно понадобится (или, по крайней мере, займет больше времени, чем может позволить бизнес). Поэтому, какой бы подход к резервному копированию вы ни выбрали, обязательно автоматизируйте процесс восстановления и регулярно отрабатывайте его на резервном кластере ClickHouse.
:::


## Резервное копирование на локальный диск {#backup-to-a-local-disk}

### Настройка места назначения резервной копии {#configure-a-backup-destination}

В примерах ниже место назначения резервной копии задаётся как `Disk('backups', '1.zip')`. Чтобы подготовить это место назначения, добавьте файл `/etc/clickhouse-server/config.d/backup_disk.xml`, в котором указывается место назначения резервной копии. Например, этот файл определяет диск с именем `backups`, а затем добавляет этот диск в список **backups > allowed_disk**:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
<!--highlight-next-line -->
            <backups>
                <type>local</type>
                <path>/backups/</path>
            </backups>
        </disks>
    </storage_configuration>
<!--highlight-start -->
    <backups>
        <allowed_disk>backups</allowed_disk>
        <allowed_path>/backups/</allowed_path>
    </backups>
<!--highlight-end -->
</clickhouse>
```

### Параметры {#parameters}

Резервные копии могут быть полными или инкрементальными и могут включать таблицы (включая материализованные представления, проекции и словари), а также базы данных. Резервные копии могут выполняться синхронно (по умолчанию) или асинхронно. Их можно сжимать. Резервные копии можно защищать паролем.

Операторы BACKUP и RESTORE принимают список имён баз данных и таблиц, место назначения (или источник), а также опции и настройки:

- Место назначения для резервного копирования или источник для восстановления. Определяется на основе диска, указанного ранее. Например, `Disk('backups', 'filename.zip')`
- ASYNC: выполнять резервное копирование или восстановление асинхронно
- PARTITIONS: список партиций для восстановления
- SETTINGS:
  - `id`: идентификатор операции резервного копирования или восстановления. Если он не задан или пустой, будет использован случайно сгенерированный UUID.
    Если он явно задан непустой строкой, то каждый раз он должен быть уникальным. Этот `id` используется для поиска строк в таблице `system.backups`, относящихся к конкретной операции резервного копирования или восстановления.
  - [`compression_method`](/sql-reference/statements/create/table#column_compression_codec) и `compression_level`
  - `password` для файла на диске
  - `base_backup`: место назначения предыдущей резервной копии этого источника. Например, `Disk('backups', '1.zip')`
  - `use_same_s3_credentials_for_base_backup`: должен ли базовый бэкап в S3 наследовать учётные данные из запроса. Работает только с `S3`.
  - `use_same_password_for_base_backup`: должен ли архив базового бэкапа наследовать пароль из запроса.
  - `structure_only`: при включении позволяет выполнять резервное копирование или восстановление только операторов CREATE без данных таблиц
  - `storage_policy`: политика хранения для восстанавливаемых таблиц. См. [Использование нескольких блочных устройств для хранения данных](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes). Этот параметр применим только к команде `RESTORE`. Указанная политика хранения применяется только к таблицам с движком из семейства `MergeTree`.
  - `s3_storage_class`: класс хранения, используемый для резервной копии в S3. Например, `STANDARD`
  - `azure_attempt_to_create_container`: при использовании Azure Blob Storage — нужно ли пытаться создать указанный контейнер, если он не существует. Значение по умолчанию: true.
  - здесь также можно использовать [основные настройки](/operations/settings/settings)

### Примеры использования {#usage-examples}

Резервное копирование и последующее восстановление таблицы:

```sql
BACKUP TABLE test.table TO Disk('backups', '1.zip')
```

Соответствующее восстановление:

```sql
RESTORE TABLE test.table FROM Disk('backups', '1.zip')
```

:::note
Операция RESTORE выше завершится ошибкой, если таблица `test.table` содержит данные. Чтобы протестировать RESTORE, нужно либо удалить таблицу, либо использовать настройку `allow_non_empty_tables=true`:

```sql
RESTORE TABLE test.table FROM Disk('backups', '1.zip')
SETTINGS allow_non_empty_tables=true
```

:::

Таблицы можно восстанавливать или сохранять в резервной копии под новыми именами:

```sql
RESTORE TABLE test.table AS test.table2 FROM Disk('backups', '1.zip')
```

```sql
BACKUP TABLE test.table3 AS test.table4 TO Disk('backups', '2.zip')
```

### Инкрементальные резервные копии {#incremental-backups}

Инкрементальные резервные копии можно создавать, указывая `base_backup`.
:::note
Инкрементальные резервные копии зависят от базовой резервной копии. Базовая копия должна оставаться доступной, чтобы можно было выполнить восстановление из инкрементальной копии.
:::


Инкрементальное сохранение новых данных. Параметр `base_backup` обеспечивает сохранение данных, добавленных после предыдущей резервной копии `Disk('backups', 'd.zip')`, в `Disk('backups', 'incremental-a.zip')`:

```sql
BACKUP TABLE test.table TO Disk('backups', 'incremental-a.zip')
  SETTINGS base_backup = Disk('backups', 'd.zip')
```

Восстановление всех данных из инкрементальной резервной копии и базовой резервной копии в новую таблицу `test.table2`:

```sql
RESTORE TABLE test.table AS test.table2
  FROM Disk('backups', 'incremental-a.zip');
```

### Установка пароля для резервной копии {#assign-a-password-to-the-backup}

К резервным копиям, записываемым на диск, можно применить пароль:

```sql
BACKUP TABLE test.table
  TO Disk('backups', 'password-protected.zip')
  SETTINGS password='qwerty'
```

Восстановление:

```sql
RESTORE TABLE test.table
  FROM Disk('backups', 'password-protected.zip')
  SETTINGS password='qwerty'
```

### Настройки сжатия {#compression-settings}

Если необходимо указать метод или уровень сжатия:

```sql
BACKUP TABLE test.table
  TO Disk('backups', 'filename.zip')
  SETTINGS compression_method='lzma', compression_level=3
```

### Восстановление определённых партиций {#restore-specific-partitions}

Если необходимо восстановить определённые партиции, связанные с таблицей, их можно указать явно. Для восстановления партиций 1 и 4 из резервной копии:

```sql
RESTORE TABLE test.table PARTITIONS '2', '3'
  FROM Disk('backups', 'filename.zip')
```

### Резервные копии в виде tar-архивов {#backups-as-tar-archives}

Резервные копии также могут храниться в виде tar-архивов. Функциональность аналогична zip, за исключением того, что пароль не поддерживается.

Создание резервной копии в формате tar:

```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar')
```

Соответствующее восстановление:

```sql
RESTORE TABLE test.table FROM Disk('backups', '1.tar')
```

Для изменения метода сжатия необходимо добавить соответствующий суффикс к имени файла резервной копии. Например, для сжатия tar-архива с помощью gzip:

```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar.gz')
```

Поддерживаемые суффиксы файлов сжатия: `tar.gz`, `.tgz`, `tar.bz2`, `tar.lzma`, `.tar.zst`, `.tzst` и `.tar.xz`.

### Проверка статуса резервных копий {#check-the-status-of-backups}

Команда резервного копирования возвращает `id` и `status`, и этот `id` можно использовать для получения статуса резервной копии. Это особенно полезно для отслеживания прогресса длительных асинхронных (ASYNC) резервных копий. Пример ниже показывает ошибку, возникшую при попытке перезаписи существующего файла резервной копии:

```sql
BACKUP TABLE helloworld.my_first_table TO Disk('backups', '1.zip') ASYNC
```

```response
┌─id───────────────────────────────────┬─status──────────┐
│ 7678b0b3-f519-4e6e-811f-5a0781a4eb52 │ CREATING_BACKUP │
└──────────────────────────────────────┴─────────────────┘

1 row in set. Elapsed: 0.001 sec.
```

```sql
SELECT
    *
FROM system.backups
WHERE id='7678b0b3-f519-4e6e-811f-5a0781a4eb52'
FORMAT Vertical
```

```response
Row 1:
──────
id:                7678b0b3-f519-4e6e-811f-5a0781a4eb52
name:              Disk('backups', '1.zip')
#highlight-next-line
status:            BACKUP_FAILED
num_files:         0
uncompressed_size: 0
compressed_size:   0
#highlight-next-line
error:             Code: 598. DB::Exception: Backup Disk('backups', '1.zip') already exists. (BACKUP_ALREADY_EXISTS) (version 22.8.2.11 (official build))
start_time:        2022-08-30 09:21:46
end_time:          2022-08-30 09:21:46

1 row in set. Elapsed: 0.002 sec.
```


Помимо таблицы `system.backups` все операции резервного копирования и восстановления также фиксируются в системной таблице-журнале [backup&#95;log](../operations/system-tables/backup_log.md):

```sql
SELECT *
FROM system.backup_log
WHERE id = '7678b0b3-f519-4e6e-811f-5a0781a4eb52'
ORDER BY event_time_microseconds ASC
FORMAT Vertical
```

```response
Row 1:
──────
event_date:              2023-08-18
event_time_microseconds: 2023-08-18 11:13:43.097414
id:                      7678b0b3-f519-4e6e-811f-5a0781a4eb52
name:                    Disk('backups', '1.zip')
status:                  CREATING_BACKUP
error:
start_time:              2023-08-18 11:13:43
end_time:                1970-01-01 03:00:00
num_files:               0
total_size:              0
num_entries:             0
uncompressed_size:       0
compressed_size:         0
files_read:              0
bytes_read:              0

Row 2:
──────
event_date:              2023-08-18
event_time_microseconds: 2023-08-18 11:13:43.174782
id:                      7678b0b3-f519-4e6e-811f-5a0781a4eb52
name:                    Disk('backups', '1.zip')
status:                  BACKUP_FAILED
#highlight-next-line
error:                   Code: 598. DB::Exception: Backup Disk('backups', '1.zip') already exists. (BACKUP_ALREADY_EXISTS) (version 23.8.1.1)
start_time:              2023-08-18 11:13:43
end_time:                2023-08-18 11:13:43
num_files:               0
total_size:              0
num_entries:             0
uncompressed_size:       0
compressed_size:         0
files_read:              0
bytes_read:              0

Получено 2 строки. Затрачено: 0.075 сек.
```


## Настройка BACKUP/RESTORE для использования конечной точки S3 {#configuring-backuprestore-to-use-an-s3-endpoint}

Для записи резервных копий в корзину S3 необходимы три параметра:

- конечная точка S3,
  например `https://mars-doc-test.s3.amazonaws.com/backup-S3/`
- идентификатор ключа доступа,
  например `ABC123`
- секретный ключ доступа,
  например `Abc+123`

:::note
Создание корзины S3 описано в разделе [Использование объектного хранилища S3 в качестве диска ClickHouse](/integrations/data-ingestion/s3/index.md#configuring-s3-for-clickhouse-use). После сохранения политики вернитесь к этому документу — настраивать ClickHouse для использования корзины S3 не требуется.
:::

Место назначения для резервной копии указывается следующим образом:

```sql
S3('<S3 endpoint>/<directory>', '<Access key ID>', '<Secret access key>')
```

```sql
CREATE TABLE data
(
    `key` Int,
    `value` String,
    `array` Array(String)
)
ENGINE = MergeTree
ORDER BY tuple()
```

```sql
INSERT INTO data SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 1000
```

### Создание базовой (начальной) резервной копии {#create-a-base-initial-backup}

Для инкрементных резервных копий требуется _базовая_ резервная копия в качестве отправной точки. Этот пример будет использоваться далее как базовая резервная копия. Первый параметр места назначения S3 — это конечная точка S3, за которой следует каталог внутри корзины для данной резервной копии. В этом примере каталог называется `my_backup`.

```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ de442b75-a66c-4a3c-a193-f76f278c70f3 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

### Добавление дополнительных данных {#add-more-data}

Инкрементные резервные копии содержат разницу между базовой резервной копией и текущим содержимым резервируемой таблицы. Добавьте дополнительные данные перед созданием инкрементной резервной копии:

```sql
INSERT INTO data SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 100
```

### Создание инкрементной резервной копии {#take-an-incremental-backup}

Эта команда резервного копирования аналогична команде для базовой резервной копии, но добавляет `SETTINGS base_backup` и расположение базовой резервной копии. Обратите внимание, что место назначения для инкрементной резервной копии — это не тот же каталог, что и для базовой, а та же конечная точка с другим целевым каталогом внутри корзины. Базовая резервная копия находится в `my_backup`, а инкрементная будет записана в `my_incremental`:

```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123') SETTINGS base_backup = S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ f6cd3900-850f-41c9-94f1-0c4df33ea528 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

### Восстановление из инкрементной резервной копии {#restore-from-the-incremental-backup}

Эта команда восстанавливает инкрементную резервную копию в новую таблицу `data3`. Обратите внимание, что при восстановлении инкрементной резервной копии базовая резервная копия также включается. При восстановлении указывайте только инкрементную резервную копию:

```sql
RESTORE TABLE data AS data3 FROM S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status───┐
│ ff0c8c39-7dff-4324-a241-000796de11ca │ RESTORED │
└──────────────────────────────────────┴──────────┘
```

### Проверка количества записей {#verify-the-count}


В исходную таблицу `data` было выполнено две вставки: одна на 1 000 строк и одна на 100 строк, всего 1 100 строк. Убедитесь, что восстановленная таблица содержит 1 100 строк:

```sql
SELECT count()
FROM data3
```

```response
┌─count()─┐
│    1100 │
└─────────┘
```


### Проверка содержимого {#verify-the-content}

Сравнение содержимого исходной таблицы `data` с восстановленной таблицей `data3`:

```sql
SELECT throwIf((
        SELECT groupArray(tuple(*))
        FROM data
    ) != (
        SELECT groupArray(tuple(*))
        FROM data3
    ), 'Данные не совпадают после BACKUP/RESTORE')
```

## BACKUP/RESTORE с использованием диска S3 {#backuprestore-using-an-s3-disk}

Также возможно выполнять `BACKUP`/`RESTORE` в S3, настроив диск S3 в конфигурации хранилища ClickHouse. Настройте диск, добавив файл в `/etc/clickhouse-server/config.d`:

```xml
<clickhouse>
    <storage_configuration>
        <disks>
            <s3_plain>
                <type>s3_plain</type>
                <endpoint></endpoint>
                <access_key_id></access_key_id>
                <secret_access_key></secret_access_key>
            </s3_plain>
        </disks>
        <policies>
            <s3>
                <volumes>
                    <main>
                        <disk>s3_plain</disk>
                    </main>
                </volumes>
            </s3>
        </policies>
    </storage_configuration>

    <backups>
        <allowed_disk>s3_plain</allowed_disk>
    </backups>
</clickhouse>
```

После этого выполняйте `BACKUP`/`RESTORE` как обычно:

```sql
BACKUP TABLE data TO Disk('s3_plain', 'cloud_backup');
RESTORE TABLE data AS data_restored FROM Disk('s3_plain', 'cloud_backup');
```

:::note
Обратите внимание:

- Этот диск не следует использовать для самого `MergeTree`, только для `BACKUP`/`RESTORE`
- Если ваши таблицы хранятся в S3, система попытается использовать серверное копирование S3 с вызовами `CopyObject` для копирования частей в целевой бакет с использованием его учетных данных. При возникновении ошибки аутентификации произойдет переключение на метод копирования с буфером (загрузка и выгрузка частей), который крайне неэффективен. В этом случае убедитесь, что учетные данные целевого бакета имеют разрешения `read` на исходный бакет.
  :::


## Использование именованных коллекций {#using-named-collections}

Именованные коллекции можно использовать для параметров `BACKUP/RESTORE`. Пример см. [здесь](./named-collections.md#named-collections-for-backups).


## Альтернативы {#alternatives}

ClickHouse хранит данные на диске, и существует множество способов резервного копирования дисков. Ниже приведены некоторые альтернативные подходы, которые использовались ранее и могут хорошо подойти для вашего окружения.

### Дублирование исходных данных в другом месте {#duplicating-source-data-somewhere-else}

Часто данные, поступающие в ClickHouse, доставляются через постоянную очередь, например [Apache Kafka](https://kafka.apache.org). В этом случае можно настроить дополнительный набор подписчиков, которые будут читать тот же поток данных во время его записи в ClickHouse и сохранять его в холодном хранилище. В большинстве компаний уже есть рекомендуемое по умолчанию холодное хранилище — это может быть объектное хранилище или распределённая файловая система, такая как [HDFS](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html).

### Снимки файловой системы {#filesystem-snapshots}

Некоторые локальные файловые системы предоставляют функциональность создания снимков (например, [ZFS](https://en.wikipedia.org/wiki/ZFS)), но они могут быть не лучшим выбором для обслуживания активных запросов. Возможным решением является создание дополнительных реплик с таким типом файловой системы и исключение их из таблиц [Distributed](../engines/table-engines/special/distributed.md), которые используются для запросов `SELECT`. Снимки на таких репликах будут недоступны для любых запросов, изменяющих данные. В качестве дополнительного преимущества такие реплики могут иметь специальные аппаратные конфигурации с большим количеством дисков на сервер, что является экономически эффективным решением.

Для небольших объёмов данных также может подойти простой запрос `INSERT INTO ... SELECT ...` в удалённые таблицы.

### Манипуляции с кусками данных {#manipulations-with-parts}

ClickHouse позволяет использовать запрос `ALTER TABLE ... FREEZE PARTITION ...` для создания локальной копии партиций таблицы. Это реализовано с использованием жёстких ссылок на папку `/var/lib/clickhouse/shadow/`, поэтому обычно не требует дополнительного дискового пространства для старых данных. Созданные копии файлов не обрабатываются сервером ClickHouse, поэтому вы можете просто оставить их там: у вас будет простая резервная копия, не требующая дополнительных внешних систем, но она всё равно будет подвержена аппаратным сбоям. По этой причине лучше удалённо скопировать их в другое место, а затем удалить локальные копии. Распределённые файловые системы и объектные хранилища по-прежнему являются хорошими вариантами для этого, но также могут подойти обычные подключённые файловые серверы с достаточной ёмкостью (в этом случае передача будет происходить через сетевую файловую систему или, возможно, с помощью [rsync](https://en.wikipedia.org/wiki/Rsync)).
Данные можно восстановить из резервной копии с помощью запроса `ALTER TABLE ... ATTACH PARTITION ...`

Для получения дополнительной информации о запросах, связанных с манипуляциями партициями, см. [документацию ALTER](/sql-reference/statements/alter/partition).

Для автоматизации этого подхода доступен сторонний инструмент: [clickhouse-backup](https://github.com/AlexAkulov/clickhouse-backup).


## Настройки для запрета параллельного резервного копирования и восстановления {#settings-to-disallow-concurrent-backuprestore}

Чтобы запретить параллельное резервное копирование и восстановление, используйте следующие настройки.

```xml
<clickhouse>
    <backups>
        <allow_concurrent_backups>false</allow_concurrent_backups>
        <allow_concurrent_restores>false</allow_concurrent_restores>
    </backups>
</clickhouse>
```

По умолчанию обе настройки имеют значение true, то есть параллельное резервное копирование и восстановление разрешены.
Если эти настройки установлены в false на кластере, одновременно может выполняться только одна операция резервного копирования или восстановления.


## Настройка BACKUP/RESTORE для использования конечной точки AzureBlobStorage {#configuring-backuprestore-to-use-an-azureblobstorage-endpoint}

Для записи резервных копий в контейнер AzureBlobStorage требуется следующая информация:

- Строка подключения / URL конечной точки AzureBlobStorage,
- Контейнер,
- Путь,
- Имя учетной записи (если указан URL),
- Ключ учетной записи (если указан URL)

Место назначения для резервной копии указывается следующим образом:

```sql
AzureBlobStorage('<connection string>/<url>', '<container>', '<path>', '<account name>', '<account key>')
```

```sql
BACKUP TABLE data TO AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;',
    'testcontainer', 'data_backup');
RESTORE TABLE data AS data_restored FROM AzureBlobStorage('DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://azurite1:10000/devstoreaccount1/;',
    'testcontainer', 'data_backup');
```


## Резервное копирование системных таблиц {#backup-up-system-tables}

Системные таблицы также могут быть включены в процессы резервного копирования и восстановления, однако их включение зависит от конкретного сценария использования.

### Резервное копирование таблиц журналов {#backing-up-log-tables}

Системные таблицы, хранящие исторические данные, такие как таблицы с суффиксом \_log (например, `query_log`, `part_log`), могут быть скопированы и восстановлены как любые другие таблицы. Если ваш сценарий использования предполагает анализ исторических данных — например, использование query_log для отслеживания производительности запросов или отладки проблем — рекомендуется включить эти таблицы в стратегию резервного копирования. Однако если исторические данные из этих таблиц не требуются, их можно исключить для экономии дискового пространства резервных копий.

### Резервное копирование таблиц управления доступом {#backing-up-access-management-tables}

Системные таблицы, связанные с управлением доступом, такие как users, roles, row_policies, settings_profiles и quotas, обрабатываются особым образом во время операций резервного копирования и восстановления. При включении этих таблиц в резервную копию их содержимое экспортируется в специальный файл `accessXX.txt`, который содержит эквивалентные SQL-инструкции для создания и настройки сущностей доступа. При восстановлении процесс интерпретирует эти файлы и повторно применяет SQL-команды для воссоздания пользователей, ролей и других конфигураций.

Эта функция обеспечивает возможность резервного копирования и восстановления конфигурации управления доступом кластера ClickHouse в рамках общей настройки кластера.

Примечание: данная функциональность работает только для конфигураций, управляемых через SQL-команды (так называемое ["Управление доступом и учетными записями на основе SQL"](/operations/access-rights#enabling-access-control)). Конфигурации доступа, определенные в конфигурационных файлах сервера ClickHouse (например, `users.xml`), не включаются в резервные копии и не могут быть восстановлены данным методом.
