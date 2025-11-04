---
slug: '/operations/backup'
sidebar_label: 'Резервное копирование и восстановление'
sidebar_position: 10
description: 'Руководство по резервному копированию и восстановлению баз данных'
title: 'Резервное копирование и восстановление'
doc_type: guide
---
# Резервное копирование и восстановление

- [Резервное копирование на локальный диск](#backup-to-a-local-disk)
- [Настройка резервного копирования/восстановления для использования конечной точки S3](#configuring-backuprestore-to-use-an-s3-endpoint)
- [Резервное копирование/восстановление с использованием диска S3](#backuprestore-using-an-s3-disk)
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
 VIEW view_name [AS view_name_in_backup] |
 ALL [EXCEPT {TABLES|DATABASES}...] } [,...]
 [ON CLUSTER 'cluster_name']
 TO|FROM File('<path>/<filename>') | Disk('<disk_name>', '<path>/') | S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>')
 [SETTINGS base_backup = File('<path>/<filename>') | Disk(...) | S3('<S3 endpoint>/<path>', '<Access key ID>', '<Secret access key>')]

```

:::note ALL
Перед версией 23.4 ClickHouse `ALL` применялся только к команде `RESTORE`.
:::

## Предыстория {#background}

Хотя [репликация](../engines/table-engines/mergetree-family/replication.md) обеспечивает защиту от аппаратных сбоев, она не защищает от человеческих ошибок: случайное удаление данных, удаление неправильной таблицы или таблицы на неправильном кластере и программные ошибки, которые приводят к неправильной обработке данных или повреждению данных. В многих случаях такие ошибки повлияют на все реплики. ClickHouse имеет встроенные средства защиты, чтобы предотвратить некоторые типы ошибок — например, по умолчанию [вы не можете просто удалить таблицы с движком, подобным MergeTree, содержащие более 50 Гб данных](/operations/settings/settings#max_table_size_to_drop). Однако эти меры предосторожности не охватывают все возможные случаи и могут быть обойдены.

Чтобы эффективно минимизировать возможные человеческие ошибки, вам следует тщательно подготовить стратегию резервного копирования и восстановления ваших данных **заранее**.

У каждой компании есть разные доступные ресурсы и бизнес-требования, поэтому нет универсального решения для резервного копирования и восстановления ClickHouse, которое подойдет для каждой ситуации. То, что работает для одного гигабайта данных, вероятно, не сработает для десятков петабайтов. Существует множество возможных подходов, каждый из которых имеет свои плюсы и минусы, которые будут обсуждены ниже. Хорошей идеей будет использование нескольких подходов вместо одного, чтобы компенсировать их различные недостатки.

:::note
Имейте в виду, что если вы что-то скопировали и никогда не пытались это восстановить, скорее всего, восстановление не сработает должным образом, когда вам это действительно понадобится (или, по крайней мере, это займет больше времени, чем может выдержать бизнес). Поэтому, какой бы подход к резервному копированию вы ни выбрали, обязательно автоматизируйте процесс восстановления и регулярно практикуйте его на резервном кластере ClickHouse.
:::

## Резервное копирование на локальный диск {#backup-to-a-local-disk}

### Настройка места назначения резервного копирования {#configure-a-backup-destination}

В примерах ниже вы увидите место назначения резервного копирования, указанное как `Disk('backups', '1.zip')`. Чтобы подготовить место назначения, добавьте файл в `/etc/clickhouse-server/config.d/backup_disk.xml`, указав место назначения резервного копирования. Например, этот файл определяет диск с именем `backups`, а затем добавляет этот диск в список **backups > allowed_disk**:

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

Резервные копии могут быть полными или инкрементальными и могут включать таблицы (включая материализованные представления, проекции и словари) и базы данных. Резервные копии могут быть синхронными (по умолчанию) или асинхронными. Их можно сжимать. Резервные копии могут быть защищены паролем.

Команды BACKUP и RESTORE принимают список имен БАЗ ДАННЫХ и ТАБЛИЦ, место назначения (или источник), опции и настройки:
- Место назначения для резервного копирования или источник для восстановления. Это основано на диске, определенном ранее. Например, `Disk('backups', 'filename.zip')`
- ASYNC: резервное копирование или восстановление асинхронно
- PARTITIONS: список разделов для восстановления
- SETTINGS:
  - `id`: идентификатор операции резервного копирования или восстановления. Если он не установлен или пуст, будет использоваться случайно сгенерированный UUID.
  Если он явно установлен на непустую строку, то он должен быть разным каждый раз. Этот `id` используется для поиска строк в таблице `system.backups`, связанных с конкретной операцией резервного копирования или восстановления.
  - [`compression_method`](/sql-reference/statements/create/table#column_compression_codec) и compression_level
  - `password` для файла на диске
  - `base_backup`: место назначения предыдущей резервной копии этого источника. Например, `Disk('backups', '1.zip')`
  - `use_same_s3_credentials_for_base_backup`: следует ли использовать учетные данные от запроса для базовой резервной копии в S3. Работает только с `S3`.
  - `use_same_password_for_base_backup`: следует ли архиву базовой резервной копии наследовать пароль от запроса.
  - `structure_only`: если включено, позволяет резервировать или восстанавливать только операторы CREATE без данных таблиц
  - `storage_policy`: политика хранения для восстанавливаемых таблиц. См. [Использование нескольких блочных устройств для хранения данных](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes). Эта настройка применима только к команде `RESTORE`. Указанная политика хранения применяется только к таблицам с движком из семейства `MergeTree`.
  - `s3_storage_class`: класс хранения, используемый для резервного копирования S3. Например, `STANDARD`
  - `azure_attempt_to_create_container`: при использовании Azure Blob Storage следует ли пытаться создать указанный контейнер, если он не существует. По умолчанию: true.
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
Вышеуказанное ВОССТАНОВЛЕНИЕ не сработает, если таблица `test.table` содержит данные, вам придется сначала удалить таблицу, чтобы протестировать ВОССТАНОВЛЕНИЕ, или использовать настройку `allow_non_empty_tables=true`:
```sql
RESTORE TABLE test.table FROM Disk('backups', '1.zip')
SETTINGS allow_non_empty_tables=true
```
:::

Таблицы могут быть восстановлены или записаны с новыми именами:
```sql
RESTORE TABLE test.table AS test.table2 FROM Disk('backups', '1.zip')
```

```sql
BACKUP TABLE test.table3 AS test.table4 TO Disk('backups', '2.zip')
```

### Инкрементальные резервные копии {#incremental-backups}

Инкрементальные резервные копии можно делать, указывая `base_backup`.
:::note
Инкрементальные резервные копии зависят от базовой резервной копии. Базовая резервная копия должна быть доступна для того, чтобы можно было восстановить инкрементальную резервную копию.
:::

Инкрементально сохраняйте новые данные. Настройка `base_backup` вызывает сохранение данных с предыдущей резервной копии на `Disk('backups', 'd.zip')` к `Disk('backups', 'incremental-a.zip')`:
```sql
BACKUP TABLE test.table TO Disk('backups', 'incremental-a.zip')
  SETTINGS base_backup = Disk('backups', 'd.zip')
```

Восстановите все данные из инкрементальной резервной копии и базовой резервной копии в новую таблицу `test.table2`:
```sql
RESTORE TABLE test.table AS test.table2
  FROM Disk('backups', 'incremental-a.zip');
```

### Установить пароль для резервной копии {#assign-a-password-to-the-backup}

Резервные копии, записанные на диск, могут иметь применённый пароль к файлу:
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

### Восстановить определенные разделы {#restore-specific-partitions}
Если необходимо восстановить конкретные разделы, связанные с таблицей, их можно указать. Для восстановления разделов 1 и 4 из резервной копии:
```sql
RESTORE TABLE test.table PARTITIONS '2', '3'
  FROM Disk('backups', 'filename.zip')
```

### Резервные копии в виде архивов tar {#backups-as-tar-archives}

Резервные копии также могут храниться в виде архивов tar. Функциональность такая же, как и для zip, за исключением того, что пароль не поддерживается.

Запишите резервную копию в tar:
```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar')
```

Соответствующее восстановление:
```sql
RESTORE TABLE test.table FROM Disk('backups', '1.tar')
```

Чтобы изменить метод сжатия, правильный суффикс файла должен быть добавлен к имени резервной копии. То есть, чтобы сжать архив tar с помощью gzip:
```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar.gz')
```

Поддерживаемые суффиксы файлов сжатия: `tar.gz`, `.tgz` `tar.bz2`, `tar.lzma`, `.tar.zst`, `.tzst` и `.tar.xz`.

### Проверьте статус резервных копий {#check-the-status-of-backups}

Команда резервного копирования возвращает `id` и `status`, и этот `id` можно использовать для получения статуса резервной копии. Это очень полезно для проверки прогресса долгих асинхронных резервных копий. Пример ниже показывает сбой, который произошел при попытке перезаписать существующий файл резервной копии:
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

Кроме таблицы `system.backups`, все операции резервного копирования и восстановления также отслеживаются в журнале системы [backup_log](../operations/system-tables/backup_log.md):
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

## Настройка BACKUP/RESTORE для использования конечной точки S3 {#configuring-backuprestore-to-use-an-s3-endpoint}

Чтобы записывать резервные копии в корзину S3, вам нужно три вещи:
- Конечная точка S3,
  например, `https://mars-doc-test.s3.amazonaws.com/backup-S3/`
- Идентификатор ключа доступа,
  например, `ABC123`
- Секретный ключ доступа,
  например, `Abc+123`

:::note
Создание корзины S3 описано в [Использование S3 Object Storage в качестве диска ClickHouse](/integrations/data-ingestion/s3/index.md#configuring-s3-for-clickhouse-use), просто вернитесь к этому документу после сохранения политики, нет необходимости настраивать ClickHouse для использования корзины S3.
:::

Место назначения для резервной копии будет указано так:

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

Инкрементальные резервные копии требуют _базовой_ резервной копии, от которой можно начинать, этот пример будет использоваться
позже как базовая резервная копия. Первый параметр конечной точки S3 — это конечная точка S3, за которой следует директория в корзине, которая будет использоваться для этой резервной копии. В этом примере директория называется `my_backup`.

```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ de442b75-a66c-4a3c-a193-f76f278c70f3 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

### Добавление новых данных {#add-more-data}

Инкрементальные резервные копии заполняются разницей между базовой резервной копией и текущим содержимым таблицы, которая резервируется. Добавьте больше данных перед осуществлением инкрементальной резервной копии:

```sql
INSERT INTO data SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 100
```
### Проведение инкрементального резервного копирования {#take-an-incremental-backup}

Эта команда резервного копирования аналогична базовой резервной копии, но добавляет `SETTINGS base_backup` и местоположение базовой резервной копии. Обратите внимание, что место назначения для инкрементальной резервной копии находится не в той же директории, что и базовая, это та же конечная точка с другой целевой директорией внутри корзины. Базовая резервная копия находится в `my_backup`, а инкрементальная будет записана в `my_incremental`:
```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123') SETTINGS base_backup = S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ f6cd3900-850f-41c9-94f1-0c4df33ea528 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```
### Восстановление из инкрементальной резервной копии {#restore-from-the-incremental-backup}

Эта команда восстанавливает инкрементальную резервную копию в новую таблицу `data3`. Обратите внимание, что при восстановлении инкрементальной резервной копии также включается базовая резервная копия. Укажите только инкрементальную резервную копию при восстановлении:
```sql
RESTORE TABLE data AS data3 FROM S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status───┐
│ ff0c8c39-7dff-4324-a241-000796de11ca │ RESTORED │
└──────────────────────────────────────┴──────────┘
```

### Проверьте количество {#verify-the-count}

В оригинальной таблице `data` было два вставки: одна с 1000 строк и одна с 100 строк, всего 1100 строк. Проверьте, что восстановленная таблица имеет 1100 строк:
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
    ), 'Data does not match after BACKUP/RESTORE')
```
## Резервное копирование/восстановление с использованием диска S3 {#backuprestore-using-an-s3-disk}

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

И затем `BACKUP`/`RESTORE` как обычно:

```sql
BACKUP TABLE data TO Disk('s3_plain', 'cloud_backup');
RESTORE TABLE data AS data_restored FROM Disk('s3_plain', 'cloud_backup');
```

:::note
Но имейте в виду, что:
- Этот диск не должен использоваться для самого `MergeTree`, только для `BACKUP`/`RESTORE`
- Если ваши таблицы основаны на S3-хранилище и типы дисков различаются, не используются вызовы `CopyObject` для копирования частей в целевую корзину, а вместо этого они загружаются и перезагружаются, что является очень неэффективным. Предпочитайте использовать синтаксис `BACKUP ... TO S3(<endpoint>)` для этого варианта использования.
:::

## Использование именованных коллекций {#using-named-collections}

Именованные коллекции могут использоваться для параметров `BACKUP/RESTORE`. См. [здесь](./named-collections.md#named-collections-for-backups) для примера.

## Альтернативы {#alternatives}

ClickHouse хранит данные на диске, и существует множество способов резервного копирования дисков. Вот некоторые альтернативы, которые использовались в прошлом и которые могут хорошо вписаться в вашу среду.

### Дублирование исходных данных в другом месте {#duplicating-source-data-somewhere-else}

Часто данные, которые поступают в ClickHouse, поставляются через какой-либо постоянный очередь, такой как [Apache Kafka](https://kafka.apache.org). В этом случае возможно настроить дополнительный набор подписчиков, которые будут считывать тот же поток данных в то время, как он записывается в ClickHouse и хранить его где-то в холодном хранилище. Большинство компаний уже имеют какое-то рекомендуемое холодное хранилище, которое может быть объектным хранилищем или распределенной файловой системой, такой как [HDFS](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html).

### Снимки файловой системы {#filesystem-snapshots}

Некоторые локальные файловые системы предоставляют функциональность снимков (например, [ZFS](https://en.wikipedia.org/wiki/ZFS)), но они могут не быть лучшим выбором для выполнения живых запросов. Возможным решением является создание дополнительных реплик с этой файловой системой и исключение их из таблиц [Distributed](../engines/table-engines/special/distributed.md), которые используются для запросов `SELECT`. Снимки на таких репликах будут недоступны для любых запросов, которые изменяют данные. В качестве бонуса, эти реплики могут иметь специальные аппаратные конфигурации с большим количеством дисков, подключенных к серверу, что будет экономически выгодно.

Для меньших объемов данных простое `INSERT INTO ... SELECT ...` в удаленные таблицы также может работать.

### Манипуляции с частями {#manipulations-with-parts}

ClickHouse позволяет использовать запрос `ALTER TABLE ... FREEZE PARTITION ...` для создания локальной копии партиций таблицы. Это реализуется с помощью жестких ссылок в папке `/var/lib/clickhouse/shadow/`, поэтому обычно это не потребляет дополнительного дискового пространства для старых данных. Созданные копии файлов не обрабатываются сервером ClickHouse, поэтому вы можете просто оставить их там: у вас будет простая резервная копия, которая не требует какой-либо дополнительной внешней системы, однако она по-прежнему будет подвержена аппаратным сбоям. По этой причине лучше всего удаленно копировать их в другое место, а затем удалить локальные копии. Распределенные файловые системы и объектные хранилища по-прежнему хороши для этого, но нормальные прикрепленные файловые серверы с достаточной емкостью также могут подойти (в этом случае передача будет происходить через сетевую файловую систему или, возможно, [rsync](https://en.wikipedia.org/wiki/Rsync)).
Данные могут быть восстановлены из резервной копии с помощью `ALTER TABLE ... ATTACH PARTITION ...`

Для получения дополнительной информации о запросах, связанных с манипуляциями с партициями, см. [документацию ALTER](/sql-reference/statements/alter/partition).

Доступен инструмент стороннего разработчика для автоматизации этого подхода: [clickhouse-backup](https://github.com/AlexAkulov/clickhouse-backup).

## Настройки для запрета одновременного резервного копирования/восстановления {#settings-to-disallow-concurrent-backuprestore}

Чтобы запретить одновременное резервное копирование/восстановление, вы можете использовать эти настройки соответственно.

```xml
<clickhouse>
    <backups>
        <allow_concurrent_backups>false</allow_concurrent_backups>
        <allow_concurrent_restores>false</allow_concurrent_restores>
    </backups>
</clickhouse>
```

Значение по умолчанию для обоих равно true, поэтому по умолчанию одновременно разрешены резервные копирования/восстановления.
Когда эти настройки установлены в false в кластере, только 1 резервное копирование/восстановление разрешено выполнять в кластере за раз.

## Настройка BACKUP/RESTORE для использования конечной точки AzureBlobStorage {#configuring-backuprestore-to-use-an-azureblobstorage-endpoint}

Чтобы записывать резервные копии в контейнер AzureBlobStorage, вам нужна следующая информация:
- Строка подключения/URL конечной точки AzureBlobStorage,
- Контейнер,
- Путь,
- Имя учетной записи (если указан URL)
- Ключ учетной записи (если указан URL)

Место назначения для резервной копии будет указано так:

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

Системные таблицы также могут быть включены в ваши рабочие процессы резервного копирования и восстановления, но их включение зависит от вашего конкретного случая использования.

### Резервное копирование таблиц логов {#backing-up-log-tables}

Системные таблицы, которые хранят исторические данные, такие как те, что с суффиксом _log (например, `query_log`, `part_log`), могут быть резервированы и восстановлены так же, как и любая другая таблица. Если ваш случай использования зависит от анализа исторических данных — например, использование query_log для отслеживания производительности запросов или отладки проблем — рекомендуется включать эти таблицы в вашу стратегию резервного копирования. Однако, если исторические данные из этих таблиц не требуются, их можно исключить для экономии места для резервного копирования.

### Резервное копирование таблиц управления доступом {#backing-up-access-management-tables}

Системные таблицы, связанные с управлением доступом, такие как пользователи, роли, row_policies, settings_profiles и квоты, получают специальное обращение во время операций резервного копирования и восстановления. Когда эти таблицы включены в резервную копию, их содержимое экспортируется в специальный файл `accessXX.txt`, который инкапсулирует эквивалентные SQL-операторы для создания и настройки сущностей доступа. При восстановлении процесс восстановления интерпретирует эти файлы и снова применяет SQL-команды для воссоздания пользователей, ролей и других конфигураций.

Эта функция обеспечивает возможность резервного копирования и восстановления конфигурации контроля доступа к кластеру ClickHouse как части общей настройки кластера.

Примечание: Эта функциональность работает только для конфигураций, управляемых с помощью SQL-команд (называемых ["SQL-управляемый контроль доступа и управление аккаунтами"](/operations/access-rights#enabling-access-control)). Конфигурации доступа, определенные в файлах конфигурации сервера ClickHouse (например, `users.xml`), не включены в резервные копии и не могут быть восстановлены таким образом.