---
description: 'Руководство по резервному копированию и восстановлению баз данных и таблиц ClickHouse'
sidebar_label: 'Резервное копирование и восстановление'
sidebar_position: 10
slug: /operations/backup
title: 'Резервное копирование и восстановление'
---


# Резервное копирование и восстановление

- [Резервное копирование на локальный диск](#backup-to-a-local-disk)
- [Настройка резервного копирования/восстановления с использованием S3 конечной точки](#configuring-backuprestore-to-use-an-s3-endpoint)
- [Резервное копирование/восстановление с использованием S3 диска](#backuprestore-using-an-s3-disk)
- [Альтернативы](#alternatives)

## Резюме команд {#command-summary}

```bash
 BACKUP|RESTORE
  TABLE [db.]table_name [AS [db.]table_name_in_backup]
    [PARTITION[S] partition_expr [,...]] |
  DICTIONARY [db.]dictionary_name [AS [db.]name_in_backup] |
  DATABASE database_name [AS database_name_in_backup]
    [EXCEPT TABLES ...] |
  TEMPORARY TABLE table_name [AS table_name_in_backup] |
  VIEW view_name [AS view_name_in_backup]
  ALL TEMPORARY TABLES [EXCEPT ...] |
  ALL [EXCEPT ...] } [,...]
  [ON CLUSTER 'cluster_name']
  TO|FROM File('<path>/<filename>') | Disk('<disk_name>', '<path>/') | S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>')
  [SETTINGS base_backup = File('<path>/<filename>') | Disk(...) | S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>')]
```

:::note ALL
До версии 23.4 ClickHouse, `ALL` применялся только к команде `RESTORE`.
:::

## Фон {#background}

Хотя [репликация](../engines/table-engines/mergetree-family/replication.md) обеспечивает защиту от аппаратных сбоев, она не защищает от человеческих ошибок: случайного удаления данных, удаления неправильной таблицы или таблицы на неправильном кластере, и программных ошибок, приводящих к неправильной обработке данных или их повреждению. Во многих случаях такие ошибки повлияют на все реплики. ClickHouse имеет встроенные меры предосторожности для предотвращения некоторых видов ошибок — например, по умолчанию [вы не можете просто удалить таблицы с движком, подобным MergeTree, содержащие более 50 Гб данных](/operations/settings/settings#max_table_size_to_drop). Тем не менее, эти меры предосторожности не покрывают все возможные случаи и могут быть обойдены.

Для того чтобы эффективно минимизировать возможные человеческие ошибки, следует заранее подготовить стратегию резервного копирования и восстановления своих данных **заранее**.

Каждая компания имеет разные доступные ресурсы и бизнес-требования, поэтому нет универсального решения для резервного копирования и восстановления ClickHouse, которое подошло бы для каждой ситуации. То, что работает для одного гигабайта данных, вероятно, не сработает для десятков петабайт. Существуют разные подходы со своими преимуществами и недостатками, которые будут обсуждены ниже. Хорошая идея — использовать несколько подходов, а не только один, чтобы компенсировать их различные недостатки.

:::note
Имейте в виду, что если вы что-то зарезервировали и никогда не пробовали восстановить это, скорее всего, восстановление не сработает правильно, когда оно вам действительно понадобится (или, по крайней мере, займет больше времени, чем бизнес может терпеть). Поэтому какой бы метод резервного копирования вы не выбрали, убедитесь, что вы автоматизировали процесс восстановления и регулярно практикуете его на запасном кластере ClickHouse.
:::

## Резервное копирование на локальный диск {#backup-to-a-local-disk}

### Настройка назначения резервного копирования {#configure-a-backup-destination}

В приведенных ниже примерах вы увидите, что назначение резервного копирования указывается как `Disk('backups', '1.zip')`. Чтобы подготовить назначение, добавьте файл в `/etc/clickhouse-server/config.d/backup_disk.xml`, указав назначение резервного копирования. Например, этот файл определяет диск с именем `backups`, а затем добавляет этот диск в список **backups > allowed_disk**:

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

Резервные копии могут быть полными или инкрементальными и могут включать таблицы (включая материализованные представления, проекции и словари) и базы данных. Резервные копии могут быть синхронными (по умолчанию) или асинхронными. Они могут быть сжаты. Резервные копии могут быть защищены паролем.

Команды BACKUP и RESTORE принимают список имен БАЗ ДАННЫХ и ТАБЛИЦ, назначение (или источник), параметры и настройки:
- Назначение для резервного копирования или источник для восстановления. Это основано на диске, определенном ранее. Например, `Disk('backups', 'filename.zip')`
- ASYNC: резервное копирование или восстановление асинхронно
- PARTITIONS: список разделов для восстановления
- SETTINGS:
    - `id`: id операции резервного копирования или восстановления, используется случайно сгенерированный UUID, если не указан вручную. Если уже выполняется операция с тем же `id`, возникает исключение.
    - [`compression_method`](/sql-reference/statements/create/table#column_compression_codec) и уровень сжатия
    - `password` для файла на диске
    - `base_backup`: назначение предыдущей резервной копии этого источника. Например, `Disk('backups', '1.zip')`
    - `use_same_s3_credentials_for_base_backup`: следует ли базовой резервной копии в S3 наследовать учетные данные из запроса. Работает только с `S3`.
    - `use_same_password_for_base_backup`: следует ли архиву базовой резервной копии наследовать пароль из запроса.
    - `structure_only`: если включено, позволяет резервировать или восстанавливать только команды CREATE без данных таблиц
    - `storage_policy`: политика хранения для восстанавливаемых таблиц. См. [Использование нескольких блочных устройств для хранения данных](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes). Эта настройка применяется только к команде `RESTORE`. Указанная политика хранения применяется только к таблицам с движком из семейства `MergeTree`.
    - `s3_storage_class`: класс хранения, используемый для резервного копирования S3. Например, `STANDARD`
    - `azure_attempt_to_create_container`: при использовании Azure Blob Storage, будет ли указан контейнер пытаться создаться, если он не существует. По умолчанию: true.
    - [основные настройки](/operations/settings/settings) также могут быть использованы здесь

### Примеры использования {#usage-examples}

Создаем резервную копию и затем восстанавливаем таблицу:
```sql
BACKUP TABLE test.table TO Disk('backups', '1.zip')
```

Соответствующее восстановление:
```sql
RESTORE TABLE test.table FROM Disk('backups', '1.zip')
```

:::note
Вышеуказанное восстановление не сработает, если таблица `test.table` содержит данные, вам придется удалить таблицу, чтобы протестировать восстановление, или использовать настройку `allow_non_empty_tables=true`:
```sql
RESTORE TABLE test.table FROM Disk('backups', '1.zip')
SETTINGS allow_non_empty_tables=true
```
:::

Таблицы могут быть восстановлены или зарезервированы с новыми именами:
```sql
RESTORE TABLE test.table AS test.table2 FROM Disk('backups', '1.zip')
```

```sql
BACKUP TABLE test.table3 AS test.table4 TO Disk('backups', '2.zip')
```

### Инкрементные резервные копии {#incremental-backups}

Инкрементные резервные копии могут быть сделаны путем указания `base_backup`.
:::note
Инкрементные резервные копии зависят от базовой резервной копии. Базовая резервная копия должна быть доступна, чтобы можно было восстановить из инкрементной резервной копии.
:::

Инкрементальное хранение новых данных. Настройка `base_backup` вызывает хранение данных с момента предыдущей резервной копии на `Disk('backups', 'd.zip')` в `Disk('backups', 'incremental-a.zip')`:
```sql
BACKUP TABLE test.table TO Disk('backups', 'incremental-a.zip')
  SETTINGS base_backup = Disk('backups', 'd.zip')
```

Восстановите все данные из инкрементной резервной копии и базовой резервной копии в новую таблицу `test.table2`:
```sql
RESTORE TABLE test.table AS test.table2
  FROM Disk('backups', 'incremental-a.zip');
```

### Назначить пароль резервной копии {#assign-a-password-to-the-backup}

Резервные копии, записанные на диск, могут иметь примененный к файлу пароль:
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

### Восстановить конкретные разделы {#restore-specific-partitions}
Если необходимо восстановить конкретные разделы, связанные с таблицей, их можно указать. Чтобы восстановить разделы 1 и 4 из резервной копии:
```sql
RESTORE TABLE test.table PARTITIONS '2', '3'
  FROM Disk('backups', 'filename.zip')
```

### Резервные копии в виде tar архивов {#backups-as-tar-archives}

Резервные копии также могут храниться в виде tar архивов. Функциональность аналогична zip, за исключением того, что пароль не поддерживается.

Запишите резервную копию в формате tar:
```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar')
```

Соответствующее восстановление:
```sql
RESTORE TABLE test.table FROM Disk('backups', '1.tar')
```

Чтобы изменить метод сжатия, правильный суффикс файла должен быть добавлен к имени резервной копии. Например, для сжатия tar архива с использованием gzip:
```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar.gz')
```

Поддерживаемые суффиксы файлов сжатия: `tar.gz`, `.tgz`, `tar.bz2`, `tar.lzma`, `.tar.zst`, `.tzst` и `.tar.xz`.

### Проверка статуса резервных копий {#check-the-status-of-backups}

Команда резервного копирования возвращает `id` и `status`, и этот `id` можно использовать для получения статуса резервной копии. Это очень полезно для проверки хода выполнения длинных асинхронных резервных копий. Пример ниже показывает сбой, произошедший при попытке перезаписать существующий файл резервной копии:
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
error:             Код: 598. DB::Exception: Резервная копия Disk('backups', '1.zip') уже существует. (BACKUP_ALREADY_EXISTS) (версия 22.8.2.11 (официальная сборка))
start_time:        2022-08-30 09:21:46
end_time:          2022-08-30 09:21:46

1 row in set. Elapsed: 0.002 sec.
```

Вместе с таблицей `system.backups`, все операции резервного копирования и восстановления также отслеживаются в системной таблице журнала [backup_log](../operations/system-tables/backup_log.md):
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
error:                   Код: 598. DB::Exception: Резервная копия Disk('backups', '1.zip') уже существует. (BACKUP_ALREADY_EXISTS) (версия 23.8.1.1)
start_time:              2023-08-18 11:13:43
end_time:                2023-08-18 11:13:43
num_files:               0
total_size:              0
num_entries:             0
uncompressed_size:       0
compressed_size:         0
files_read:              0
bytes_read:              0

2 rows in set. Elapsed: 0.075 sec.
```

## Настройка резервного копирования/восстановления для использования конечной точки S3 {#configuring-backuprestore-to-use-an-s3-endpoint}

Чтобы записать резервные копии в S3 ведро, вам нужно три вещи:
- Конечная точка S3,
  например, `https://mars-doc-test.s3.amazonaws.com/backup-S3/`
- Access key ID,
  например, `ABC123`
- Secret access key,
  например, `Abc+123`

:::note
Создание ведра S3 описано в [Использование S3 объектного хранилища как диска ClickHouse](/integrations/data-ingestion/s3/index.md#configuring-s3-for-clickhouse-use), вернитесь к этому документу после сохранения политики, нет необходимости настраивать ClickHouse для использования ведра S3.
:::

Назначение для резервного копирования будет указано так:

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

### Создать базовую (начальную) резервную копию {#create-a-base-initial-backup}

Инкрементные резервные копии требуют _базовой_ резервной копии для начала, этот пример будет использоваться позже как базовая резервная копия. Первый параметр назначения S3 — это конечная точка S3, за которой следует директория внутри ведра, которую необходимо использовать для этой резервной копии. В этом примере директория называется `my_backup`.

```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ de442b75-a66c-4a3c-a193-f76f278c70f3 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

### Добавить больше данных {#add-more-data}

Инкрементные резервные копии заполняются разницей между базовой резервной копией и текущим содержимым таблицы, которую резервируют. Добавьте больше данных перед тем, как сделать инкрементную резервную копию:

```sql
INSERT INTO data SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 100
```
### Сделать инкрементное резервное копирование {#take-an-incremental-backup}

Эта команда резервного копирования аналогична базовой резервной копии, но добавляет `SETTINGS base_backup` и расположение базовой резервной копии. Обратите внимание, что назначение для инкрементной резервной копии не то же самое, что и для базовой, это та же конечная точка с другой целевой директорией внутри ведра. Базовая резервная копия находится в `my_backup`, а инкрементальная будет записана в `my_incremental`:
```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123') SETTINGS base_backup = S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ f6cd3900-850f-41c9-94f1-0c4df33ea528 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```
### Восстановить из инкрементной резервной копии {#restore-from-the-incremental-backup}

Эта команда восстанавливает инкрементную резервную копию в новую таблицу `data3`. Обратите внимание, что когда восстанавливается инкрементная резервная копия, также включается базовая резервная копия. Укажите только инкрементную резервную копию при восстановлении:
```sql
RESTORE TABLE data AS data3 FROM S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status───┐
│ ff0c8c39-7dff-4324-a241-000796de11ca │ RESTORED │
└──────────────────────────────────────┴──────────┘
```

### Проверьте количество {#verify-the-count}

В оригинальную таблицу `data` было выполнено два вставки — одна на 1,000 строк и одна на 100 строк, всего 1,100. Убедитесь, что восстановленная таблица содержит 1,100 строк:
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
Сравните содержимое оригинальной таблицы `data` с восстановленной таблицей `data3`:
```sql
SELECT throwIf((
        SELECT groupArray(tuple(*))
        FROM data
    ) != (
        SELECT groupArray(tuple(*))
        FROM data3
    ), 'Данные не совпадают после BACKUP/RESTORE')
```
## Резервное копирование/восстановление с использованием S3 диска {#backuprestore-using-an-s3-disk}

Также возможно `BACKUP`/`RESTORE` в S3, настроив диск S3 в конфигурации хранения ClickHouse. Настройте диск следующим образом, добавив файл в `/etc/clickhouse-server/config.d`:

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

А затем `BACKUP`/`RESTORE` как обычно:

```sql
BACKUP TABLE data TO Disk('s3_plain', 'cloud_backup');
RESTORE TABLE data AS data_restored FROM Disk('s3_plain', 'cloud_backup');
```

:::note
Но имейте в виду, что:
- Этот диск не следует использовать для самого `MergeTree`, только для `BACKUP`/`RESTORE`
- Если ваши таблицы защищены хранилищем S3 и типы дисков различаются, не будет использоваться `CopyObject` для копирования частей в целевое ведро, вместо этого они будут загружены и снова загружены, что очень неэффективно. Предпочитайте использовать синтаксис `BACKUP ... TO S3(<endpoint>)` для этого случая.
:::

## Использование именованных коллекций {#using-named-collections}

Именованные коллекции могут использоваться для параметров `BACKUP/RESTORE`. См. [здесь](./named-collections.md#named-collections-for-backups) для примера.

## Альтернативы {#alternatives}

ClickHouse хранит данные на диске, и существует множество способов резервного копирования дисков. Это некоторые альтернативы, которые использовались в прошлом и которые могут хорошо вписаться в вашу среду.

### Дублирование исходных данных в другом месте {#duplicating-source-data-somewhere-else}

Часто данные, которые поступают в ClickHouse, поставляются через различные постоянные очереди, такие как [Apache Kafka](https://kafka.apache.org). В этом случае возможно настроить дополнительный набор подписчиков, которые будут считывать тот же поток данных, в то время как данные записываются в ClickHouse, и хранить их в холодном хранилище. Большинство компаний уже имеют некоторое рекомендуемое холодное хранилище, которое может быть объектным хранилищем или распределенной файловой системой, такой как [HDFS](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html).

### Снимки файловой системы {#filesystem-snapshots}

Некоторые локальные файловые системы предоставляют функции снимков (например, [ZFS](https://en.wikipedia.org/wiki/ZFS)), но они могут быть не лучшим выбором для обслуживания живых запросов. Возможное решение — создать дополнительные реплики с такой файловой системой и исключить их из [распределенных](../engines/table-engines/special/distributed.md) таблиц, которые используются для `SELECT` запросов. Снимки на таких репликах не будут доступны для любых запросов, которые изменяют данные. В качестве бонуса эти реплики могут иметь специальные аппаратные конфигурации с большим количеством подключенных дисков на сервер, что было бы экономически выгодно.

Для небольших объемов данных также может сработать простой `INSERT INTO ... SELECT ...` в удаленные таблицы.

### Манипуляции с частями {#manipulations-with-parts}

ClickHouse позволяет использовать запрос `ALTER TABLE ... FREEZE PARTITION ...`, чтобы создать локальную копию разделов таблицы. Это реализуется с помощью жестких ссылок на папку `/var/lib/clickhouse/shadow/`, поэтому обычно это не потребляет дополнительного дискового пространства для старых данных. Созданные копии файлов не обрабатываются сервером ClickHouse, поэтому вы можете просто оставить их там: у вас будет простое резервное копирование, которое не требует никакой дополнительной внешней системы, но все равно будет подвержено аппаратным сбоям. По этой причине лучше всего удаленно скопировать их в другое место, а затем удалить локальные копии. Распределенные файловые системы и объектные хранилища по-прежнему являются хорошими вариантами для этого, но нормальные подключенные файловые серверы с достаточно большим объемом также могут работать (в этом случае передача будет происходить через сетевую файловую систему или, возможно, [rsync](https://en.wikipedia.org/wiki/Rsync)).
Данные могут быть восстановлены из резервной копии с использованием `ALTER TABLE ... ATTACH PARTITION ...`

Для получения дополнительной информации о запросах, связанных с манипуляциями с разделами, см. документацию [ALTER](/sql-reference/statements/alter/partition).

Существует сторонний инструмент для автоматизации этого подхода: [clickhouse-backup](https://github.com/AlexAkulov/clickhouse-backup).

## Настройки, чтобы запретить одновременное резервное копирование/восстановление {#settings-to-disallow-concurrent-backuprestore}

Чтобы запретить одновременное резервное копирование/восстановление, вы можете использовать следующие настройки соответственно.

```xml
<clickhouse>
    <backups>
        <allow_concurrent_backups>false</allow_concurrent_backups>
        <allow_concurrent_restores>false</allow_concurrent_restores>
    </backups>
</clickhouse>
```

Стандартное значение для обоих — true, поэтому одновременное резервное копирование/восстановление по умолчанию разрешено.
Когда эти настройки ложны в кластере, только 1 резервная копия/восстановление может выполняться в кластере в одно время.

## Настройка резервного копирования/восстановления для использования конечной точки AzureBlobStorage {#configuring-backuprestore-to-use-an-azureblobstorage-endpoint}

Чтобы записывать резервные копии в контейнер AzureBlobStorage, вам нужны следующие вещи:
- Строка подключения / URL конечной точки AzureBlobStorage,
- Контейнер,
- Путь,
- Имя учетной записи (если указан URL)
- Ключ учетной записи (если указан URL)

Назначение для резервного копирования будет указано так:

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

Системные таблицы также могут быть включены в ваши процессы резервного копирования и восстановления, но их включение зависит от вашего конкретного случая использования.

### Резервное копирование журналов таблиц {#backing-up-log-tables}

Системные таблицы, которые хранят исторические данные, такие как таблицы с суффиксом _log (например, `query_log`, `part_log`), могут быть зарезервированы и восстановлены так же, как и любая другая таблица. Если ваш случай использования зависит от анализа исторических данных — например, использование `query_log` для отслеживания производительности запросов или отладки проблем — рекомендуется включать эти таблицы в вашу стратегию резервного копирования. Однако, если исторические данные из этих таблиц не требуются, их можно исключить, чтобы сэкономить место для хранения резервных копий.

### Резервное копирование таблиц управления доступом {#backing-up-access-management-tables}

Системные таблицы, связанные с управлением доступом, такие как пользователи, роли, row_policies, settings_profiles и квоты, получают особое обращение во время операций резервного копирования и восстановления. Когда эти таблицы включены в резервную копию, их содержимое экспортируется в специальный файл `accessXX.txt`, который инкапсулирует эквивалентные SQL команды для создания и настройки сущностей доступа. При восстановлении процесс восстановления интерпретирует эти файлы и повторно применяет SQL команды для воссоздания пользователей, ролей и других конфигураций.

Эта функция обеспечивает возможность резервного копирования и восстановления конфигурации контроля доступа к кластеру ClickHouse как части общей настройки кластера.

Примечание: Эта функциональность работает только для конфигураций, управляемых с помощью SQL команд (называемых ["Управление доступом и учетными записями на основе SQL"](/operations/access-rights#enabling-access-control)). Конфигурации доступа, определенные в файлах конфигурации сервера ClickHouse (например, `users.xml`), не включаются в резервные копии и не могут быть восстановлены таким образом.
