---
description: 'Руководство по резервному копированию и восстановлению баз данных и таблиц ClickHouse'
sidebar_label: 'Резервное копирование и восстановление'
sidebar_position: 10
slug: /operations/backup
title: 'Резервное копирование и восстановление'
---


# Резервное копирование и восстановление

- [Резервное копирование на локальный диск](#backup-to-a-local-disk)
- [Настройка резервного копирования/восстановления с использованием S3 endpoint](#configuring-backuprestore-to-use-an-s3-endpoint)
- [Резервное копирование/восстановление с использованием S3 диска](#backuprestore-using-an-s3-disk)
- [Альтернативы](#alternatives)

## Сводка команд {#command-summary}

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
Перед версией 23.4 ClickHouse, `ALL` применялся только к команде `RESTORE`.
:::

## Фон {#background}

Хотя [репликация](../engines/table-engines/mergetree-family/replication.md) обеспечивает защиту от аппаратных сбоев, она не защищает от человеческих ошибок: случайное удаление данных, удаление неправильной таблицы или таблицы на неправильном кластере, и программные ошибки, которые приводят к неверной обработке данных или их повреждению. В большинстве случаев такие ошибки повлияют на все реплики. ClickHouse имеет встроенные механизмы защиты от некоторых типов ошибок — например, по умолчанию [вы не можете просто удалить таблицы с движком, подобным MergeTree, содержащие более 50 Гб данных](/operations/settings/settings#max_table_size_to_drop). Однако эти механизмы защиты не охватывают все возможные случаи и могут быть обойдены.

Чтобы эффективно смягчить возможные человеческие ошибки, вам следует тщательно подготовить стратегию резервного копирования и восстановления ваших данных **заранее**.

Каждая компания имеет разные доступные ресурсы и бизнес-требования, поэтому не существует универсального решения для резервного копирования и восстановления ClickHouse, которое подошло бы под каждую ситуацию. То, что работает для одного гигабайта данных, вероятно, не сработает для десятков петабайт. Существует множество возможных подходов, каждый из которых имеет свои плюсы и минусы, которые будут обсуждены ниже. Использовать несколько подходов вместо одного — хорошая идея, чтобы компенсировать их разные недостатки.

:::note
Имейте в виду, что если вы что-то резервировали и никогда не пытались восстановить, есть вероятность, что восстановление не сработает должным образом, когда оно вам действительно понадобится (или по крайней мере займет больше времени, чем может позволить бизнес). Поэтому, какой бы подход к резервированию вы ни выбрали, убедитесь, что вы также автоматизировали процесс восстановления и регулярно практикуете его на запасном кластере ClickHouse.
:::

## Резервное копирование на локальный диск {#backup-to-a-local-disk}

### Настройка назначения резервного копирования {#configure-a-backup-destination}

В приведенных ниже примерах место назначения резервного копирования указывается как `Disk('backups', '1.zip')`. Чтобы подготовить назначение, добавьте файл в `/etc/clickhouse-server/config.d/backup_disk.xml`, указав место назначения для резервного копирования. Например, этот файл определяет диск с именем `backups`, а затем добавляет этот диск в список **backups > allowed_disk**:

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

Резервные копии могут быть полными или инкрементными и могут включать таблицы (включая материализованные представления, проекции и словари) и базы данных. Резервные копии могут быть синхронными (по умолчанию) или асинхронными. Они могут быть сжаты. Резервные копии могут быть защищены паролем.

Команды BACKUP и RESTORE принимают список имен DATABASE и TABLE, назначение (или источник), параметры и настройки:
- Назначение для резервного копирования или источник для восстановления. Это основано на ранее определенном диске. Например `Disk('backups', 'filename.zip')`
- ASYNC: резервное копирование или восстановление асинхронно
- PARTITIONS: список партиций для восстановления
- SETTINGS:
    - `id`: идентификатор операции резервного копирования или восстановления, используется случайно сгенерированный UUID, если не указан вручную. Если уже есть выполняющаяся операция с тем же `id`, возникает исключение.
    - [`compression_method`](/sql-reference/statements/create/table#column_compression_codec) и уровень сжатия
    - `password` для файла на диске
    - `base_backup`: назначение предыдущей резервной копии этого источника. Например, `Disk('backups', '1.zip')`
    - `use_same_s3_credentials_for_base_backup`: следует ли базовой резервной копии для S3 наследовать учетные данные из запроса. Работает только с `S3`.
    - `use_same_password_for_base_backup`: следует ли архиву базовой резервной копии наследовать пароль из запроса.
    - `structure_only`: если включено, позволяет резервировать или восстановить только операторы CREATE без данных таблиц
    - `storage_policy`: политика хранения для восстанавливаемых таблиц. Смотрите [Использование нескольких блоковых устройств для хранения данных](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes). Эта настройка применяется только к команде `RESTORE`. Указанная политика хранения применяется только к таблицам с движком из семейства `MergeTree`.
    - `s3_storage_class`: класс хранения, используемый для резервного копирования в S3. Например, `STANDARD`
    - `azure_attempt_to_create_container`: при использовании Azure Blob Storage, будет ли указанный контейнер пытаться создаваться, если он не существует. По умолчанию: true.
    - [core settings](/operations/settings/settings) также могут быть использованы здесь

### Примеры использования {#usage-examples}

Резервное копирование, а затем восстановление таблицы:
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

Инкрементные резервные копии могут быть созданы, указав `base_backup`.
:::note
Инкрементные резервные копии зависят от базовой резервной копии. Базовая резервная копия должна быть доступна, чтобы восстановить из инкрементной резервной копии.
:::

Постепенно сохраняйте новые данные. Настройка `base_backup` приводит к тому, что данные с предыдущей резервной копии в `Disk('backups', 'd.zip')` сохраняются в `Disk('backups', 'incremental-a.zip')`:
```sql
BACKUP TABLE test.table TO Disk('backups', 'incremental-a.zip')
  SETTINGS base_backup = Disk('backups', 'd.zip')
```

Восстановите все данные из инкрементной резервной копии и базовой резервной копии в новую таблицу `test.table2`:
```sql
RESTORE TABLE test.table AS test.table2
  FROM Disk('backups', 'incremental-a.zip');
```

### Назначьте пароль для резервной копии {#assign-a-password-to-the-backup}

Резервные копии, записанные на диск, могут иметь примененный пароль к файлу:
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

### Восстановление конкретных партиций {#restore-specific-partitions}
Если конкретные партиции, связанные с таблицей, необходимо восстановить, их можно указать. Чтобы восстановить партиции 1 и 4 из резервной копии:
```sql
RESTORE TABLE test.table PARTITIONS '2', '3'
  FROM Disk('backups', 'filename.zip')
```

### Резервные копии в виде tar-архивов {#backups-as-tar-archives}

Резервные копии также могут храниться в виде tar-архивов. Функциональность такая же, как для zip, за исключением того, что пароль не поддерживается.

Запишите резервную копию в виде tar:
```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar')
```

Соответствующее восстановление:
```sql
RESTORE TABLE test.table FROM Disk('backups', '1.tar')
```

Чтобы изменить метод сжатия, правильный суффикс файла должен быть добавлен к имени резервной копии. Например, чтобы сжать архив tar с использованием gzip:
```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar.gz')
```

Поддерживаемые суффиксы файлов для сжатия: `tar.gz`, `.tgz`, `tar.bz2`, `tar.lzma`, `.tar.zst`, `.tzst` и `.tar.xz`.


### Проверка статуса резервных копий {#check-the-status-of-backups}

Команда резервного копирования возвращает `id` и `status`, и это `id` может быть использован для получения статуса резервной копии. Это очень полезно для проверки прогресса длинных асинхронных резервных копий. Приведенный ниже пример показывает сбой, который произошел при попытке перезаписать существующий файл резервной копии:
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
where id='7678b0b3-f519-4e6e-811f-5a0781a4eb52'
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

Вместе с таблицей `system.backups`, все операции резервного копирования и восстановления также отслеживаются в таблице системного лога [backup_log](../operations/system-tables/backup_log.md):
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

2 rows in set. Elapsed: 0.075 sec.
```

## Настройка BACKUP/RESTORE для использования S3 Endpoint {#configuring-backuprestore-to-use-an-s3-endpoint}

Чтобы записывать резервные копии в корзину S3, вам нужно три pieces информации:
- S3 endpoint,
  например `https://mars-doc-test.s3.amazonaws.com/backup-S3/`
- Access key ID,
  например `ABC123`
- Secret access key,
  например `Abc+123`

:::note
Создание корзины S3 рассмотрено в [Использование объектного хранилища S3 в качестве диска ClickHouse](/integrations/data-ingestion/s3/index.md#configuring-s3-for-clickhouse-use), просто вернитесь к этому документу после сохранения политики, нет необходимости настраивать ClickHouse для использования корзины S3.
:::

Место назначения для резервной копии будет указано следующим образом:

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

Инкрементные резервные копии требуют _базовой_ резервной копии, с которой можно начать, этот пример будет использован позже как базовая резервная копия. Первый параметр назначения S3 — это S3 endpoint, за которым следует каталог в корзине, который будет использоваться для этой резервной копии. В этом примере каталог называется `my_backup`.

```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ de442b75-a66c-4a3c-a193-f76f278c70f3 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

### Добавление дополнительных данных {#add-more-data}

Инкрементные резервные копии заполняются разницей между базовой резервной копией и текущим содержимым таблицы, которую резервируют. Добавьте дополнительные данные перед проведением инкрементного резервного копирования:

```sql
INSERT INTO data SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 100
```
### Проведение инкрементного резервного копирования {#take-an-incremental-backup}

Эта команда резервного копирования похожа на базовую резервную копию, но добавляет `SETTINGS base_backup` и местоположение базовой резервной копии. Обратите внимание, что назначение для инкрементной резервной копии не то же самое, что и базовая, это тот же endpoint с другой целевой директорией в корзине. Базовая резервная копия находится в `my_backup`, а инкрементная будет записана в `my_incremental`:
```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123') SETTINGS base_backup = S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ f6cd3900-850f-41c9-94f1-0c4df33ea528 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```
### Восстановление из инкрементной резервной копии {#restore-from-the-incremental-backup}

Эта команда восстанавливает инкрементную резервную копию в новую таблицу `data3`. Обратите внимание, что при восстановлении инкрементной резервной копии базовая резервная копия также включена. Укажите только инкрементную резервную копию при восстановлении:
```sql
RESTORE TABLE data AS data3 FROM S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status───┐
│ ff0c8c39-7dff-4324-a241-000796de11ca │ RESTORED │
└──────────────────────────────────────┴──────────┘
```

### Проверьте количество {#verify-the-count}

В оригинальной таблице `data` было две вставки, одна с 1,000 строк и одна с 100 строк, в общей сложности 1,100. Убедитесь, что восстановленная таблица содержит 1,100 строк:
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
Это сравнивает содержимое оригинальной таблицы `data` с восстановленной таблицей `data3`:
```sql
SELECT throwIf((
        SELECT groupArray(tuple(*))
        FROM data
    ) != (
        SELECT groupArray(tuple(*))
        FROM data3
    ), 'Данные не совпадают после BACKUP/RESTORE')
```
## BACKUP/RESTORE С использованием S3 диска {#backuprestore-using-an-s3-disk}

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

А затем `BACKUP`/`RESTORE`, как обычно:

```sql
BACKUP TABLE data TO Disk('s3_plain', 'cloud_backup');
RESTORE TABLE data AS data_restored FROM Disk('s3_plain', 'cloud_backup');
```

:::note
Но имейте в виду, что:
- Этот диск не следует использовать для `MergeTree` непосредственно, только для `BACKUP`/`RESTORE`
- Если ваши таблицы поддерживаются S3 хранилищем и типы дисков различаются, он не использует вызовы `CopyObject` для копирования частей в целевую корзину, вместо этого он загружает и загружает их, что очень неэффективно. Предпочитайте использовать синтаксис `BACKUP ... TO S3(<endpoint>)` для этого сценария.
:::

## Использование именованных коллекций {#using-named-collections}

Именованные коллекции могут быть использованы для параметров `BACKUP/RESTORE`. Смотрите [здесь](./named-collections.md#named-collections-for-backups) для примера.

## Альтернативы {#alternatives}

ClickHouse хранит данные на диске, и есть множество способов резервного копирования дисков. Вот некоторые альтернативы, которые использовались в прошлом и которые могут хорошо вписаться в вашу среду.

### Дублирование исходных данных где-то еще {#duplicating-source-data-somewhere-else}

Часто данные, которые поступают в ClickHouse, доставляются через какой-то постоянный очередь, например, [Apache Kafka](https://kafka.apache.org). В этом случае возможно настроить дополнительный набор подписчиков, которые будут читать тот же поток данных, пока он записывается в ClickHouse и хранить его в холодном хранилище где-то. Большинство компаний уже имеют какое-то рекомендуемое холодное хранилище, которое может быть объектным хранилищем или распределенной файловой системой, такой как [HDFS](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html).

### Снимки файловой системы {#filesystem-snapshots}

Некоторые локальные файловые системы предоставляют функциональность снимков (например, [ZFS](https://en.wikipedia.org/wiki/ZFS)), но они могут не быть наилучшим выбором для обслуживания активных запросов. Возможное решение заключается в создании дополнительных реплик с использованием такого типа файловой системы и исключении их из таблиц [Distributed](../engines/table-engines/special/distributed.md), которые используются для запросов `SELECT`. Снимки на таких репликах будут недоступны для любых запросов, которые изменяют данные. В качестве бонуса, эти реплики могут иметь специальные аппаратные конфигурации с большим количеством дисков на сервер, что будет экономически целесообразно.

Для меньших объемов данных также может сработать простое `INSERT INTO ... SELECT ...` в удаленные таблицы.

### Манипуляции с частями {#manipulations-with-parts}

ClickHouse позволяет использовать запрос `ALTER TABLE ... FREEZE PARTITION ...` для создания локальной копии партиций таблицы. Это реализуется с помощью жестких ссылок на папку `/var/lib/clickhouse/shadow/`, поэтому обычно не требует дополнительного пространства на диске для старых данных. Созданные копии файлов не обрабатываются сервером ClickHouse, так что вы можете просто оставить их там: у вас будет простое резервное копирование, не требующее какой-либо дополнительной внешней системы, но оно все равно будет подвержено аппаратным проблемам. По этой причине лучше удаленно скопировать их в другое место, а затем удалить локальные копии. Распределенные файловые системы и объектные хранилища по-прежнему являются хорошими вариантами для этого, но обычные подключенные файловые серверы с достаточной емкостью также могут подойти (в этом случае передача будет происходить через сетевую файловую систему или, возможно, [rsync](https://en.wikipedia.org/wiki/Rsync)).
Данные можно восстановить из резервной копии с помощью `ALTER TABLE ... ATTACH PARTITION ...`

Для получения дополнительной информации о запросах, связанных с манипуляциями с партициями, смотрите [документацию ALTER](/sql-reference/statements/alter/partition).

Доступен сторонний инструмент для автоматизации этого подхода: [clickhouse-backup](https://github.com/AlexAkulov/clickhouse-backup).

## Настройки для запрета одновременного резервного копирования/восстановления {#settings-to-disallow-concurrent-backuprestore}

Для запрета одновременного резервного копирования/восстановления вы можете использовать эти настройки соответственно.

```xml
<clickhouse>
    <backups>
        <allow_concurrent_backups>false</allow_concurrent_backups>
        <allow_concurrent_restores>false</allow_concurrent_restores>
    </backups>
</clickhouse>
```

Значение по умолчанию для обоих равно true, поэтому по умолчанию одновременное резервное копирование/восстановление разрешено.
Когда эти настройки равны false в кластере, одновременно разрешается только одна операция резервного копирования/восстановления.

## Настройка BACKUP/RESTORE для использования AzureBlobStorage Endpoint {#configuring-backuprestore-to-use-an-azureblobstorage-endpoint}

Чтобы записывать резервные копии в контейнер AzureBlobStorage, вам потребуется следующая информация:
- Строка подключения к AzureBlobStorage endpoint / url,
- Контейнер,
- Путь,
- Имя учетной записи (если указывается url)
- Ключ учетной записи (если указывается url)

Место назначения для резервной копии будет указано следующим образом:

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

### Резервное копирование логов таблиц {#backing-up-log-tables}

Системные таблицы, которые хранят исторические данные, такие как те, которые имеют суффикс _log (например, `query_log`, `part_log`), могут быть зарезервированы и восстановлены так же, как и любая другая таблица. Если ваш случай использования зависит от анализа исторических данных — например, используя `query_log` для отслеживания производительности запросов или отладки проблем — рекомендуется включить эти таблицы в вашу стратегию резервного копирования. Однако, если исторические данные из этих таблиц не требуются, их можно исключить, чтобы сэкономить место в резервной копии.

### Резервное копирование таблиц управления доступом {#backing-up-access-management-tables}

Системные таблицы, связанные с управлением доступом, такие как пользователи, роли, row_policies, settings_profiles и квоты, получают особое обращение во время операций резервного копирования и восстановления. Когда эти таблицы включаются в резервную копию, их содержимое экспортируется в специальный файл `accessXX.txt`, который инкапсулирует эквивалентные SQL операторы для создания и настройки объектов доступа. При восстановлении процесс восстановления интерпретирует эти файлы и повторно применяет SQL-команды для воссоздания пользователей, ролей и других конфигураций.

Эта функция гарантирует, что конфигурация контроля доступа к кластеру ClickHouse может быть зарезервирована и восстановлена как часть общей настройки кластера.

Примечание: Эта функциональность работает только для конфигураций, управляемых через SQL-команды (называемых ["Управление доступом и учетными записями на основе SQL"](/operations/access-rights#enabling-access-control)). Конфигурации доступа, определенные в конфигурационных файлах сервера ClickHouse (например, `users.xml`), не включаются в резервные копии и не могут быть восстановлены таким образом.
