---
description: 'Руководство по резервному копированию и восстановлению баз данных и таблиц ClickHouse'
sidebar_label: 'Резервное копирование и восстановление'
sidebar_position: 10
slug: /operations/backup
title: 'Резервное копирование и восстановление'
doc_type: 'guide'
---

# Резервное копирование и восстановление {#backup-and-restore}

- [Резервное копирование на локальный диск](#backup-to-a-local-disk)
- [Настройка резервного копирования и восстановления с использованием конечной точки S3](#configuring-backuprestore-to-use-an-s3-endpoint)
- [Резервное копирование и восстановление с использованием диска S3](#backuprestore-using-an-s3-disk)
- [Альтернативы](#alternatives)

## Сводка команд {#command-summary}

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
До версии ClickHouse 23.4 `ALL` можно было использовать только с командой `RESTORE`.
:::

## Общие сведения {#background}

Хотя [репликация](../engines/table-engines/mergetree-family/replication.md) обеспечивает защиту от отказов оборудования, она не защищает от человеческих ошибок: случайного удаления данных, удаления не той таблицы или таблицы не в том кластере, а также ошибок в программном обеспечении, приводящих к некорректной обработке данных или их порче. Во многих случаях подобные ошибки затронут все реплики. В ClickHouse есть встроенные механизмы защиты от некоторых типов ошибок — например, по умолчанию [нельзя просто так удалить таблицы с движком типа MergeTree, содержащие более 50 ГБ данных](/operations/settings/settings#max_table_size_to_drop). Однако эти механизмы не покрывают все возможные случаи и могут быть обойдены.

Чтобы эффективно снизить риск последствий возможных человеческих ошибок, вам следует заранее тщательно продумать стратегию резервного копирования и восстановления данных.

У каждой компании свои доступные ресурсы и бизнес‑требования, поэтому не существует универсального решения для резервного копирования и восстановления ClickHouse, которое подходило бы для любой ситуации. То, что работает для одного гигабайта данных, скорее всего, не будет работать для десятков петабайт. Существует множество возможных подходов с собственными достоинствами и недостатками, которые будут рассмотрены ниже. Имеет смысл использовать несколько подходов, а не полагаться только на один, чтобы компенсировать их недостатки.

:::note
Имейте в виду, что если вы сделали резервную копию и ни разу не пытались выполнить восстановление, велика вероятность, что восстановление не сработает должным образом, когда оно действительно потребуется (или, по крайней мере, займет больше времени, чем бизнес может себе позволить). Поэтому, какой бы подход к резервному копированию вы ни выбрали, обязательно автоматизируйте и процесс восстановления и регулярно отрабатывайте его на отдельном кластере ClickHouse.
:::

## Резервное копирование на локальный диск {#backup-to-a-local-disk}

### Настройка хранилища резервных копий {#configure-a-backup-destination}

В примерах ниже вы увидите, что хранилище резервной копии указывается как `Disk('backups', '1.zip')`. Чтобы подготовить хранилище, создайте файл `/etc/clickhouse-server/config.d/backup_disk.xml`, в котором будет задано место размещения резервных копий. Например, этот файл определяет диск с именем `backups`, а затем добавляет этот диск в список **backups &gt; allowed&#95;disk**:

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

Резервные копии могут быть полными или инкрементальными и могут включать таблицы (включая материализованные представления, проекции и словари) и базы данных. Резервное копирование может выполняться синхронно (по умолчанию) или асинхронно. Резервные копии могут быть сжаты. Резервные копии могут быть защищены паролем.

Операторы BACKUP и RESTORE принимают список имен баз данных (DATABASE) и таблиц (TABLE), место назначения (или источник), опции и настройки:

* Место назначения для резервной копии или источник для восстановления. Оно задаётся на основе диска, определенного ранее. Например, `Disk('backups', 'filename.zip')`
* ASYNC: выполнять резервное копирование или восстановление асинхронно
* PARTITIONS: список партиций для восстановления
* SETTINGS:
  * `id`: идентификатор операции резервного копирования или восстановления. Если он не задан или пустой, будет использован случайным образом сгенерированный UUID.
    Если он явно установлен в непустую строку, то должен отличаться каждый раз. Этот `id` используется для поиска строк в таблице `system.backups`, относящихся к конкретной операции резервного копирования или восстановления.
  * [`compression_method`](/sql-reference/statements/create/table#column_compression_codec) и compression&#95;level
  * `password` для файла на диске
  * `base_backup`: место назначения предыдущей резервной копии этого источника. Например, `Disk('backups', '1.zip')`
  * `use_same_s3_credentials_for_base_backup`: должны ли базовые резервные копии в S3 наследовать учетные данные из запроса. Работает только с `S3`.
  * `use_same_password_for_base_backup`: должен ли архив базовой резервной копии наследовать пароль из запроса.
  * `structure_only`: если включено, позволяет выполнять резервное копирование или восстановление только операторов CREATE без данных таблиц
  * `storage_policy`: политика хранения для восстанавливаемых таблиц. См. [Использование нескольких блочных устройств для хранения данных](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes). Эта настройка применима только к команде `RESTORE`. Указанная политика хранения применяется только к таблицам с движком из семейства `MergeTree`.
  * `s3_storage_class`: класс хранения, используемый для резервной копии в S3. Например, `STANDARD`
  * `azure_attempt_to_create_container`: при использовании Azure Blob Storage — пытаться ли создать указанный контейнер, если он не существует. Значение по умолчанию: true.
  * [основные настройки](/operations/settings/settings) также можно использовать здесь

### Примеры использования {#usage-examples}

Создание резервной копии таблицы и последующее восстановление:

```sql
BACKUP TABLE test.table TO Disk('backups', '1.zip')
```

Соответствующая команда восстановления:

```sql
RESTORE TABLE test.table FROM Disk('backups', '1.zip')
```

:::note
Выполнение указанной выше команды RESTORE завершится с ошибкой, если таблица `test.table` содержит данные. Чтобы протестировать RESTORE, вам потребуется удалить таблицу или использовать настройку `allow_non_empty_tables=true`:

```sql
RESTORE TABLE test.table FROM Disk('backups', '1.zip')
SETTINGS allow_non_empty_tables=true
```

:::

Таблицы можно восстанавливать или создавать их резервные копии под новыми именами:

```sql
RESTORE TABLE test.table AS test.table2 FROM Disk('backups', '1.zip')
```

```sql
BACKUP TABLE test.table3 AS test.table4 TO Disk('backups', '2.zip')
```

### Инкрементные бэкапы {#incremental-backups}

Инкрементные бэкапы можно создавать, указывая `base_backup`.
:::note
Инкрементные бэкапы зависят от базового бэкапа. Базовый бэкап должен оставаться доступным, чтобы можно было восстановиться из инкрементного бэкапа.
:::

Сохраняйте новые данные инкрементально. Настройка `base_backup` приводит к тому, что данные, появившиеся после предыдущей резервной копии в `Disk('backups', 'd.zip')`, сохраняются в `Disk('backups', 'incremental-a.zip')`:

```sql
BACKUP TABLE test.table TO Disk('backups', 'incremental-a.zip')
  SETTINGS base_backup = Disk('backups', 'd.zip')
```

Восстановите все данные из инкрементной резервной копии и `base_backup` в новую таблицу `test.table2`:

```sql
RESTORE TABLE test.table AS test.table2
  FROM Disk('backups', 'incremental-a.zip');
```

### Назначить пароль для резервной копии {#assign-a-password-to-the-backup}

Резервные копии, записанные на диск, можно защитить паролем:

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

Если вы хотите указать метод или уровень сжатия:

```sql
BACKUP TABLE test.table
  TO Disk('backups', 'filename.zip')
  SETTINGS compression_method='lzma', compression_level=3
```

### Восстановление отдельных партиций {#restore-specific-partitions}

Если необходимо восстановить определённые партиции, связанные с таблицей, их можно указать. Чтобы восстановить партиции 1 и 4 из резервной копии:

```sql
RESTORE TABLE test.table PARTITIONS '2', '3'
  FROM Disk('backups', 'filename.zip')
```

### Резервные копии в виде tar-архивов {#backups-as-tar-archives}

Резервные копии также могут храниться в виде tar-архивов. Функциональность такая же, как для zip, за исключением того, что пароли не поддерживаются.

Создайте резервную копию в формате tar:

```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar')
```

Соответствующая операция восстановления:

```sql
RESTORE TABLE test.table FROM Disk('backups', '1.tar')
```

Чтобы изменить метод сжатия, к имени резервной копии нужно добавить соответствующее расширение файла. Например, чтобы сжать tar-архив с помощью gzip:

```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar.gz')
```

Поддерживаемые суффиксы файлов архивов: `tar.gz`, `.tgz`, `tar.bz2`, `tar.lzma`, `.tar.zst`, `.tzst` и `.tar.xz`.

### Проверка статуса резервных копий {#check-the-status-of-backups}

Команда резервного копирования возвращает `id` и `status`; этот `id` можно использовать, чтобы получить статус резервной копии. Это удобно для контроля прогресса длительных асинхронных (ASYNC) резервных копий. В примере ниже показан сбой, который произошёл при попытке перезаписать существующий файл резервной копии:

```sql
BACKUP TABLE helloworld.my_first_table TO Disk('backups', '1.zip') ASYNC
```

```response
┌─id───────────────────────────────────┬─status──────────┐
│ 7678b0b3-f519-4e6e-811f-5a0781a4eb52 │ CREATING_BACKUP │
└──────────────────────────────────────┴─────────────────┘

1 строка в наборе. Затрачено: 0.001 сек.
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
error:             Code: 598. DB::Exception: Резервная копия Disk('backups', '1.zip') уже существует. (BACKUP_ALREADY_EXISTS) (версия 22.8.2.11 (официальная сборка))
start_time:        2022-08-30 09:21:46
end_time:          2022-08-30 09:21:46

Получена 1 строка. Прошло: 0.002 сек.
```

Помимо таблицы `system.backups`, все операции резервного копирования и восстановления также отслеживаются в системной таблице журнала [backup&#95;log](../operations/system-tables/backup_log.md):

```sql
SELECT *
FROM system.backup_log
WHERE id = '7678b0b3-f519-4e6e-811f-5a0781a4eb52'
ORDER BY event_time_microseconds ASC
FORMAT Vertical
```

```response
Строка 1:
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

Строка 2:
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

2 строки в наборе. Затрачено: 0.075 сек.
```

## Настройка BACKUP/RESTORE для использования S3 Endpoint {#configuring-backuprestore-to-use-an-s3-endpoint}

Чтобы записывать резервные копии в бакет S3, вам нужны три параметра:

* S3 endpoint,
  например `https://mars-doc-test.s3.amazonaws.com/backup-S3/`
* Access key ID,
  например `ABC123`
* Secret access key,
  например `Abc+123`

:::note
Создание бакета S3 рассматривается в разделе [Use S3 Object Storage as a ClickHouse disk](/integrations/data-ingestion/s3/index.md#configuring-s3-for-clickhouse-use); после сохранения политики просто вернитесь к этому документу — настраивать ClickHouse для использования этого бакета S3 не требуется.
:::

Назначение для резервной копии указывается следующим образом:

```sql
S3('<конечная точка S3>/<каталог>', '<ID ключа доступа>', '<секретный ключ доступа>')
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

### Создание базового (начального) бэкапа {#create-a-base-initial-backup}

Инкрементные бэкапы требуют *базового* бэкапа, от которого они будут выполняться; этот пример будет
использован позже как базовый бэкап. Первый параметр назначения S3 — это endpoint S3, после которого указывается каталог внутри бакета, который будет использован для этого бэкапа. В этом примере каталог называется `my_backup`.

```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ de442b75-a66c-4a3c-a193-f76f278c70f3 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

### Добавьте больше данных {#add-more-data}

Инкрементные резервные копии содержат разницу между базовой резервной копией и текущим содержимым резервируемой таблицы. Добавьте больше данных перед созданием инкрементной резервной копии:

```sql
INSERT INTO data SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 100
```

### Выполнение инкрементного бэкапа {#take-an-incremental-backup}

Эта команда бэкапа аналогична команде базового бэкапа, но дополнительно задаёт `SETTINGS base_backup` и местоположение базового бэкапа. Обратите внимание, что назначение для инкрементного бэкапа — это не тот же каталог, что и для базового; используется тот же endpoint, но с другим целевым каталогом внутри бакета. Базовый бэкап находится в `my_backup`, а инкрементный будет записан в `my_incremental`:

```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123') SETTINGS base_backup = S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ f6cd3900-850f-41c9-94f1-0c4df33ea528 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

### Восстановление из инкрементного бэкапа {#restore-from-the-incremental-backup}

Эта команда восстанавливает инкрементный бэкап в новую таблицу `data3`. Обратите внимание, что при восстановлении инкрементного бэкапа также восстанавливается базовый бэкап. При восстановлении указывайте только инкрементный бэкап:

```sql
RESTORE TABLE data AS data3 FROM S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status───┐
│ ff0c8c39-7dff-4324-a241-000796de11ca │ RESTORED │
└──────────────────────────────────────┴──────────┘
```

### Проверьте количество {#verify-the-count}

В исходную таблицу `data` было выполнено две операции вставки: одна на 1 000 строк, другая на 100 строк, всего 1 100 строк. Проверьте, что восстановленная таблица содержит 1 100 строк:

```sql
SELECT count()
FROM data3
```

```response
┌─count()─┐
│    1100 │
└─────────┘
```

### Проверьте содержимое {#verify-the-content}

Здесь сравнивается содержимое исходной таблицы `data` с восстановленной таблицей `data3`:

```sql
SELECT throwIf((
        SELECT groupArray(tuple(*))
        FROM data
    ) != (
        SELECT groupArray(tuple(*))
        FROM data3
    ), 'Данные не совпадают после операций BACKUP/RESTORE')
```

## BACKUP/RESTORE с использованием диска S3 {#backuprestore-using-an-s3-disk}

Также можно выполнять `BACKUP`/`RESTORE` в S3, настроив диск S3 в конфигурации хранилища ClickHouse. Настройте диск следующим образом, добавив файл в каталог `/etc/clickhouse-server/config.d`:

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

А затем выполните `BACKUP`/`RESTORE` как обычно:

```sql
BACKUP TABLE data TO Disk('s3_plain', 'cloud_backup');
RESTORE TABLE data AS data_restored FROM Disk('s3_plain', 'cloud_backup');
```

:::note
Но имейте в виду, что:

* Этот диск не должен использоваться для самого `MergeTree`, только для `BACKUP`/`RESTORE`
* Если ваши таблицы используют хранилище S3, то будет предпринята попытка использовать серверное копирование на стороне S3 с помощью вызовов `CopyObject` для копирования частей в целевой бакет, используя его учетные данные. Если произойдет ошибка аутентификации, будет использован резервный вариант — метод копирования через буфер (скачивание частей и их последующая загрузка), который крайне неэффективен. В этом случае имеет смысл убедиться, что у вас есть права `read` на исходный бакет при использовании учетных данных целевого бакета.
  :::

## Использование именованных коллекций {#using-named-collections}

Именованные коллекции можно использовать в параметрах команд `BACKUP/RESTORE`. Пример см. [здесь](./named-collections.md#named-collections-for-backups).

## Альтернативы {#alternatives}

ClickHouse хранит данные на диске, и существует множество способов резервного копирования дисков. Ниже перечислены некоторые альтернативы, которые уже применялись на практике и могут хорошо подойти для вашей среды.

### Дублирование исходных данных в другом месте {#duplicating-source-data-somewhere-else}

Часто данные, которые поступают в ClickHouse, доставляются через некоторую форму постоянной очереди, такую как [Apache Kafka](https://kafka.apache.org). В этом случае можно настроить дополнительный набор подписчиков, которые будут читать тот же поток данных в момент его записи в ClickHouse и сохранять его в холодном хранилище. У большинства компаний уже есть некоторое стандартное рекомендованное холодное хранилище, которым может быть объектное хранилище или распределённая файловая система, такая как [HDFS](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html).

### Снимки файловой системы {#filesystem-snapshots}

Некоторые локальные файловые системы предоставляют функциональность создания снимков (например, [ZFS](https://en.wikipedia.org/wiki/ZFS)), но они могут быть не лучшим выбором для обработки онлайн‑запросов. Возможным решением является создание дополнительных реплик с такой файловой системой и их исключение из таблиц [Distributed](../engines/table-engines/special/distributed.md), которые используются для запросов `SELECT`. Снимки на таких репликах будут недоступны для любых запросов, изменяющих данные. В качестве бонуса эти реплики могут иметь специальные аппаратные конфигурации с большим числом дисков на сервер, что будет экономически выгодно.

Для небольших объёмов данных может также подойти простой `INSERT INTO ... SELECT ...` в удалённые таблицы.

### Операции с частями {#manipulations-with-parts}

ClickHouse позволяет использовать запрос `ALTER TABLE ... FREEZE PARTITION ...` для создания локальной копии разделов таблицы. Это реализовано с использованием жёстких ссылок в папку `/var/lib/clickhouse/shadow/`, поэтому обычно это не потребляет дополнительное дисковое пространство для старых данных. Созданные копии файлов не обрабатываются сервером ClickHouse, поэтому вы можете просто оставить их там: у вас будет простой бэкап, не требующий какой‑либо дополнительной внешней системы, но он по‑прежнему будет подвержен аппаратным сбоям. По этой причине лучше скопировать их на удалённый ресурс, а затем удалить локальные копии. Распределённые файловые системы и объектные хранилища по‑прежнему являются хорошими вариантами для этого, но могут подойти и обычные подключённые файловые серверы с достаточной ёмкостью (в этом случае передача будет происходить по сетевой файловой системе или, возможно, с помощью [rsync](https://en.wikipedia.org/wiki/Rsync)).  
Данные могут быть восстановлены из резервной копии с помощью `ALTER TABLE ... ATTACH PARTITION ...`.

Для получения дополнительной информации о запросах, связанных с операциями с разделами, смотрите [документацию по ALTER](/sql-reference/statements/alter/partition).

Для автоматизации этого подхода доступен сторонний инструмент: [clickhouse-backup](https://github.com/AlexAkulov/clickhouse-backup).

## Настройки для запрета одновременного выполнения резервного копирования и восстановления {#settings-to-disallow-concurrent-backuprestore}

Чтобы запретить одновременное выполнение резервного копирования и восстановления, используйте соответственно следующие настройки.

```xml
<clickhouse>
    <backups>
        <allow_concurrent_backups>false</allow_concurrent_backups>
        <allow_concurrent_restores>false</allow_concurrent_restores>
    </backups>
</clickhouse>
```

Значение по умолчанию для обоих параметров — `true`, поэтому по умолчанию допускается одновременное выполнение операций резервного копирования и восстановления.
Если на кластере эти настройки имеют значение `false`, в каждый момент времени на кластере может выполняться только одна операция резервного копирования или восстановления.

## Настройка BACKUP/RESTORE для использования конечной точки AzureBlobStorage {#configuring-backuprestore-to-use-an-azureblobstorage-endpoint}

Чтобы сохранять резервные копии в контейнер AzureBlobStorage, вам необходима следующая информация:

* Строка подключения / URL конечной точки AzureBlobStorage,
* Контейнер,
* Путь,
* Имя учетной записи (если указан URL),
* Ключ учетной записи (если указан URL).

Назначение резервной копии задаётся следующим образом:

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

Системные таблицы также могут быть включены в процессы резервного копирования и восстановления, но необходимость этого зависит от конкретного сценария использования.

### Резервное копирование лог-таблиц {#backing-up-log-tables}

Системные таблицы, хранящие исторические данные, такие как таблицы с суффиксом _log (например, `query_log`, `part_log`), можно сохранять в резервных копиях и восстанавливать как любые другие таблицы. Если ваш сценарий использования предполагает анализ исторических данных — например, использование `query_log` для отслеживания производительности запросов или отладки проблем — рекомендуется включить эти таблицы в стратегию резервного копирования. Однако, если исторические данные из этих таблиц не требуются, их можно исключить для экономии дискового пространства, используемого под резервные копии.

### Резервное копирование таблиц управления доступом {#backing-up-access-management-tables}

Системные таблицы, связанные с управлением доступом, такие как users, roles, row_policies, settings_profiles и quotas, обрабатываются особым образом при операциях резервного копирования и восстановления. Когда эти таблицы включены в резервную копию, их содержимое экспортируется в специальный файл `accessXX.txt`, который содержит эквивалентные SQL-операторы для создания и настройки объектов управления доступом. При восстановлении процесс восстановления интерпретирует эти файлы и повторно применяет SQL-команды для воссоздания пользователей, ролей и других конфигураций.

Эта возможность позволяет сохранять и восстанавливать конфигурацию управления доступом к кластеру ClickHouse как часть общей конфигурации кластера.

Примечание: эта функциональность работает только для конфигураций, управляемых через SQL-команды (см. ["SQL-driven Access Control and Account Management"](/operations/access-rights#enabling-access-control)). Конфигурации доступа, определённые в конфигурационных файлах сервера ClickHouse (например, `users.xml`), не включаются в резервные копии и не могут быть восстановлены этим способом.
