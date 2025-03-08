---
slug: /operations/backup
description: Чтобы эффективно уменьшить возможные человеческие ошибки, вам следует тщательно подготовить стратегию резервного копирования и восстановления данных.
---


# Резервное копирование и восстановление

- [Резервное копирование на локальный диск](#backup-to-a-local-disk)
- [Настройка резервного копирования/восстановления с использованием конечной точки S3](#configuring-backuprestore-to-use-an-s3-endpoint)
- [Резервное копирование/восстановление с использованием диска S3](#backuprestore-using-an-s3-disk)
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
До версии 23.4 ClickHouse `ALL` применялся только к команде `RESTORE`.
:::

## Фон {#background}

Хотя [репликация](../engines/table-engines/mergetree-family/replication.md) защищает от аппаратных сбоев, она не защищает от человеческих ошибок: случайное удаление данных, удаление неправильной таблицы или таблицы в неправильном кластере, и программные ошибки, приводящие к неправильной обработке данных или повреждению данных. В многих случаях подобные ошибки повлияют на все реплики. ClickHouse имеет встроенные защитные механизмы для предотвращения некоторых видов ошибок — например, по умолчанию [вы не можете просто удалить таблицы с движком, подобным MergeTree, содержащим более 50 Гб данных](/operations/settings/settings#max_table_size_to_drop). Однако эти меры предосторожности не охватывают все возможные случаи и могут быть обойдены.

Чтобы эффективно уменьшить возможные человеческие ошибки, вам следует тщательно подготовить стратегию резервного копирования и восстановления данных **заранее**.

У каждой компании разные доступные ресурсы и бизнес-требования, поэтому нет универсального решения для резервного копирования и восстановления данных ClickHouse, которое подошло бы для каждой ситуации. То, что работает для одного гигабайта данных, скорее всего, не подойдет для десятков петабайт. Существует множество возможных подходов с их собственными преимуществами и недостатками, которые будут обсуждены ниже. Хорошая идея — использовать несколько подходов вместо одного, чтобы компенсировать их различные недостатки.

:::note
Имейте в виду, что если вы что-то скопировали и никогда не пробовали это восстановить, то, скорее всего, восстановление не сработает должным образом, когда вам это действительно понадобится (или как минимум, это займет больше времени, чем бизнес может терпеть). Поэтому какой бы метод резервного копирования вы не выбрали, обязательно автоматизируйте процесс восстановления и регулярно практикуйте его на запасном кластере ClickHouse.
:::

## Резервное копирование на локальный диск {#backup-to-a-local-disk}

### Настройка назначения резервного копирования {#configure-a-backup-destination}

В приведенных ниже примерах вы увидите, что назначение для резервного копирования указывается как `Disk('backups', '1.zip')`. Для подготовки назначения добавьте файл в `/etc/clickhouse-server/config.d/backup_disk.xml`, указав место для резервного копирования. Например, этот файл определяет диск с именем `backups`, а затем добавляет этот диск в список **backups > allowed_disk**:

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

Резервные копии могут быть полными или инкрементальными и могут включать таблицы (включая материализованные представления, проекции и словари) и базы данных. Резервные копии могут быть синхронными (по умолчанию) или асинхронными. Они могут быть сжатые. Резервные копии могут быть защищены паролем.

Команды BACKUP и RESTORE принимают список имен БД и таблиц, назначение (или источник), параметры и настройки:
- Назначение для резервной копии или источник для восстановления. Это основано на диске, определенном ранее. Например `Disk('backups', 'filename.zip')`
- ASYNC: резервное копирование или восстановление асинхронно
- PARTITIONS: список партиций, которые нужно восстановить
- SETTINGS:
    - `id`: идентификатор операции резервного копирования или восстановления, используется случайно сгенерированный UUID, если не указан вручную. Если уже существует работающая операция с тем же `id`, будет выброшено исключение.
    - [`compression_method`](/sql-reference/statements/create/table#column_compression_codec) и уровень сжатия
    - `password` для файла на диске
    - `base_backup`: назначение предыдущей резервной копии этого источника. Например, `Disk('backups', '1.zip')`
    - `use_same_s3_credentials_for_base_backup`: следует ли базовой резервной копии на S3 наследовать учетные данные из запроса. Работает только с `S3`.
    - `use_same_password_for_base_backup`: следует ли архиву базового резервного копирования наследовать пароль из запроса.
    - `structure_only`: если включено, позволяет резервировать или восстанавливать только инструкции CREATE без данных таблиц
    - `storage_policy`: политика хранения для восстанавливаемых таблиц. См. [Использование нескольких блочных устройств для хранения данных](../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes). Эта настройка применяется только к команде `RESTORE`. Указанная политика хранения применяется только к таблицам с движком из семейства `MergeTree`.
    - `s3_storage_class`: класс хранения, используемый для резервного копирования S3. Например, `STANDARD`
    - `azure_attempt_to_create_container`: при использовании Azure Blob Storage, следует ли пытаться создать указанный контейнер, если он не существует. По умолчанию: true.
    - [core settings](/operations/settings/settings) также могут использоваться здесь

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
Вышеуказанное восстановление не удалось бы, если таблица `test.table` содержит данные, вам нужно было бы удалить таблицу для тестирования восстановления или использовать настройку `allow_non_empty_tables=true`:
```sql
RESTORE TABLE test.table FROM Disk('backups', '1.zip')
SETTINGS allow_non_empty_tables=true
```
:::

Таблицы могут быть восстановлены или резервированы с новыми именами:
```sql
RESTORE TABLE test.table AS test.table2 FROM Disk('backups', '1.zip')
```

```sql
BACKUP TABLE test.table3 AS test.table4 TO Disk('backups', '2.zip')
```

### Инкрементальные резервные копии {#incremental-backups}

Инкрементальные резервные копии могут быть сделаны, указывая `base_backup`.
:::note
Инкрементальные резервные копии зависят от базовой резервной копии. Базовая резервная копия должна быть доступна, чтобы иметь возможность восстановить инкрементальную резервную копию.
:::

Инкрементально сохраняйте новые данные. Установка `base_backup` заставляет данные с предыдущей резервной копии на `Disk('backups', 'd.zip')` сохраняться в `Disk('backups', 'incremental-a.zip')`:
```sql
BACKUP TABLE test.table TO Disk('backups', 'incremental-a.zip')
  SETTINGS base_backup = Disk('backups', 'd.zip')
```

Восстановите все данные из инкрементальной резервной копии и базовой резервной копии в новую таблицу `test.table2`:
```sql
RESTORE TABLE test.table AS test.table2
  FROM Disk('backups', 'incremental-a.zip');
```

### Назначение пароля для резервной копии {#assign-a-password-to-the-backup}

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

Если вы хотите указать метод сжатия или уровень:
```sql
BACKUP TABLE test.table
  TO Disk('backups', 'filename.zip')
  SETTINGS compression_method='lzma', compression_level=3
```

### Восстановление конкретных партиций {#restore-specific-partitions}
Если необходимо восстановить конкретные партиции, связанные с таблицей, их можно указать. Чтобы восстановить партиции 1 и 4 из резервной копии:
```sql
RESTORE TABLE test.table PARTITIONS '2', '3'
  FROM Disk('backups', 'filename.zip')
```

### Резервные копии в виде архивов tar {#backups-as-tar-archives}

Резервные копии также могут храниться в виде архивов tar. Функциональность такая же, как и для zip, за исключением того, что пароль не поддерживается.

Запишите резервную копию как tar:
```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar')
```

Соответствующее восстановление:
```sql
RESTORE TABLE test.table FROM Disk('backups', '1.tar')
```

Чтобы изменить метод сжатия, правильный суффикс файла должен быть добавлен к названию резервной копии. Например, чтобы сжать архив tar с помощью gzip:
```sql
BACKUP TABLE test.table TO Disk('backups', '1.tar.gz')
```

Поддерживаемые суффиксы сжатия файлов: `tar.gz`, `.tgz`, `tar.bz2`, `tar.lzma`, `.tar.zst`, `.tzst` и `.tar.xz`.

### Проверка статуса резервных копий {#check-the-status-of-backups}

Команда резервного копирования возвращает `id` и `status`, и этот `id` может быть использован для получения статуса резервной копии. Это очень полезно для контроля за процессом длительных асинхронных резервных копий. Пример ниже показывает сбой, который произошел при попытке перезаписать существующий файл резервной копии:
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

Вместе с таблицей `system.backups` все операции резервного копирования и восстановления также отслеживаются в системной таблице журнала [backup_log](../operations/system-tables/backup_log.md):
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

## Настройка резервного копирования/восстановления для использования конечной точки S3 {#configuring-backuprestore-to-use-an-s3-endpoint}

Чтобы записывать резервные копии в ведро S3, вам потребуется три элемента информации:
- Конечная точка S3,
  например `https://mars-doc-test.s3.amazonaws.com/backup-S3/`
- Идентификатор ключа доступа,
  например `ABC123`
- Секретный ключ доступа,
  например `Abc+123`

:::note
Создание ведра S3 описано в [Использование S3 для хранения объектов в качестве диска ClickHouse](/integrations/data-ingestion/s3/index.md#configuring-s3-for-clickhouse-use), просто вернитесь к этому документу после сохранения политики, нет необходимости настраивать ClickHouse для использования ведра S3.
:::

Назначение для резервной копии будет указано так:

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

Инкрементальные резервные копии требуют _базовую_ резервную копию в качестве отправной точки, этот пример будет использоваться позже как базовая резервная копия. Первый параметр назначения S3 — это конечная точка S3, за которой следует директория в ведре, которую следует использовать для этой резервной копии. В этом примере директория называется `my_backup`.

```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ de442b75-a66c-4a3c-a193-f76f278c70f3 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

### Добавление еще данных {#add-more-data}

Инкрементальные резервные копии заполняются разницей между базовой резервной копией и текущим содержимым таблицы, которую нужно резервировать. Добавьте больше данных перед созданием инкрементальной резервной копии:

```sql
INSERT INTO data SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 100
```
### Выполнение инкрементального резервного копирования {#take-an-incremental-backup}

Эта команда резервного копирования похожа на базовую резервную копию, но добавляет `SETTINGS base_backup` и местоположение базовой резервной копии. Обратите внимание, что назначение для инкрементальной резервной копии не находится в той же директории, что и базовая, это та же конечная точка с другой целевой директорией внутри ведра. Базовая резервная копия находится в `my_backup`, а инкрементальная будет записана в `my_incremental`:
```sql
BACKUP TABLE data TO S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123') SETTINGS base_backup = S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_backup', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ f6cd3900-850f-41c9-94f1-0c4df33ea528 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```
### Восстановление из инкрементальной резервной копии {#restore-from-the-incremental-backup}

Эта команда восстанавливает инкрементальную резервную копию в новую таблицу `data3`. Обратите внимание, что когда инкрементальная резервная копия восстанавливается, также включается базовая резервная копия. Укажите только инкрементальную резервную копию при восстановлении:
```sql
RESTORE TABLE data AS data3 FROM S3('https://mars-doc-test.s3.amazonaws.com/backup-S3/my_incremental', 'ABC123', 'Abc+123')
```

```response
┌─id───────────────────────────────────┬─status───┐
│ ff0c8c39-7dff-4324-a241-000796de11ca │ RESTORED │
└──────────────────────────────────────┴──────────┘
```

### Проверка количества {#verify-the-count}

В исходной таблице `data` было два вставки: одно с 1,000 строк и одно с 100 строк, всего 1,100. Убедитесь, что восстановленная таблица содержит 1,100 строк:
```sql
SELECT count()
FROM data3
```
```response
┌─count()─┐
│    1100 │
└─────────┘
```

### Проверка содержания {#verify-the-content}
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

А затем `BACKUP`/`RESTORE` как обычно:

```sql
BACKUP TABLE data TO Disk('s3_plain', 'cloud_backup');
RESTORE TABLE data AS data_restored FROM Disk('s3_plain', 'cloud_backup');
```

:::note
Но имейте в виду следующее:
- Этот диск не должен использоваться для самого `MergeTree`, только для `BACKUP`/`RESTORE`
- Если ваши таблицы связаны с хранилищем S3 и типы дисков разные, не используются вызовы `CopyObject` для копирования частей в целевое ведро, вместо этого они загружаются и загружаются, что очень неэффективно. Предпочитайте использовать синтаксис `BACKUP ... TO S3(<endpoint>)` для этого случая.
:::

## Использование именованных коллекций {#using-named-collections}

Именованные коллекции могут использоваться для параметров `BACKUP/RESTORE`. См. [здесь](./named-collections.md#named-collections-for-backups) пример.

## Альтернативы {#alternatives}

ClickHouse хранит данные на диске, и существует множество способов резервного копирования дисков. Вот некоторые альтернативы, которые использовались в прошлом и которые могут хорошо вписаться в вашу среду.

### Дублирование исходных данных в другом месте {#duplicating-source-data-somewhere-else}

Часто данные, которые поступают в ClickHouse, передаются через какой-либо постоянный очередь, например [Apache Kafka](https://kafka.apache.org). В этом случае возможно настроить дополнительный набор подписчиков, которые будут читать тот же поток данных во время его записи в ClickHouse и хранить его в холодном хранилище где-то. Большинство компаний уже имеют некоторые рекомендуемые варианты холодного хранилища, которое может быть объектным хранилищем или распределенной файловой системой типа [HDFS](https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html).

### Снимки файловой системы {#filesystem-snapshots}

Некоторые локальные файловые системы предоставляют функциональность снимков (например, [ZFS](https://en.wikipedia.org/wiki/ZFS)), но они могут не быть лучшим выбором для обслуживания живых запросов. Возможным решением является создание дополнительных реплик с такой файловой системой и исключение их из [распределенных](../engines/table-engines/special/distributed.md) таблиц, которые используются для запросов `SELECT`. Снимки на таких репликах будут недоступны для любых запросов, изменяющих данные. В качестве бонуса, эти реплики могут иметь специальные аппаратные конфигурации с большим количеством прикрепленных дисков на сервер, что будет экономически эффективным.

Для меньших объемов данных также может сработать простой `INSERT INTO ... SELECT ...` в удаленные таблицы.

### Манипуляции с частями {#manipulations-with-parts}

ClickHouse позволяет использовать запрос `ALTER TABLE ... FREEZE PARTITION ...` для создания локальной копии партиций таблиц. Это реализуется с помощью жестких ссылок на папку `/var/lib/clickhouse/shadow/`, поэтому обычно это не потребляет дополнительное дисковое пространство для старых данных. Созданные копии файлов не обрабатываются сервером ClickHouse, так что вы можете просто оставить их там: у вас будет простая резервная копия, которая не требует никакой дополнительной внешней системы, но она по-прежнему будет уязвима для аппаратных проблем. По этой причине лучше удаленно скопировать их в другое место, а затем удалить локальные копии. Распределенные файловые системы и объектные хранилища все еще являются хорошими вариантами для этого, но обычные прикрепленные файловые серверы с достаточной емкостью тоже могут сработать (в этом случае передача будет происходить через сетевую файловую систему или, возможно, [rsync](https://en.wikipedia.org/wiki/Rsync)).
Данные могут быть восстановлены из резервной копии с помощью `ALTER TABLE ... ATTACH PARTITION ...`

Для получения дополнительной информации о запросах, связанных с манипуляциями с партициями, смотрите [документацию ALTER](/sql-reference/statements/alter/partition).

Существует сторонний инструмент, доступный для автоматизации этого подхода: [clickhouse-backup](https://github.com/AlexAkulov/clickhouse-backup).

## Настройки для запрета совместного резервного копирования/восстановления {#settings-to-disallow-concurrent-backuprestore}

Чтобы запретить совместное резервное копирование/восстановление, вы можете использовать соответствующие настройки.

```xml
<clickhouse>
    <backups>
        <allow_concurrent_backups>false</allow_concurrent_backups>
        <allow_concurrent_restores>false</allow_concurrent_restores>
    </backups>
</clickhouse>
```

По умолчанию значения обоих параметров равны true, поэтому по умолчанию разрешается совместное выполнение резервного копирования/восстановления.
Когда эти параметры имеют значение false в кластере, только 1 резервное копирование/восстановление может выполняться в кластере одновременно.

## Настройка резервного копирования/восстановления для использования конечной точки AzureBlobStorage {#configuring-backuprestore-to-use-an-azureblobstorage-endpoint}

Чтобы записывать резервные копии в контейнер AzureBlobStorage, вам потребуется следующая информация:
- Строка подключения / URL конечной точки AzureBlobStorage,
- Контейнер,
- Путь,
- Название учетной записи (если указан URL)
- Ключ учетной записи (если указан URL)

Назначение для резервной копии будет указано так:

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

Системные таблицы также могут быть включены в ваши рабочие процессы резервного копирования и восстановления, но их включение зависит от вашего конкретного использования.

### Резервное копирование таблиц журналов {#backing-up-log-tables}

Системные таблицы, которые хранят исторические данные, такие как таблицы с суффиксом _log (например, `query_log`, `part_log`), могут быть резервированы и восстановлены так же, как и любые другие таблицы. Если ваш случай использования зависит от анализа исторических данных — например, использование `query_log` для отслеживания производительности запросов или исправления ошибок — рекомендуется включить эти таблицы в вашу стратегию резервного копирования. Однако, если исторические данные из этих таблиц не требуются, они могут быть исключены, чтобы сэкономить место для резервного копирования.

### Резервное копирование таблиц управления доступом {#backing-up-access-management-tables}

Системные таблицы, связанные с управлением доступом, такие как пользователи, роли, row_policies, settings_profiles и quotas, получают особое внимание во время операций резервного копирования и восстановления. Когда эти таблицы включаются в резервную копию, их содержимое экспортируется в специальный файл `accessXX.txt`, который инкапсулирует эквивалентные SQL-инструкции для создания и настройки элементов управления доступом. При восстановлении процесс восстановления интерпретирует эти файлы и повторно применяет SQL-команды для воссоздания пользователей, ролей и других конфигураций.

Эта функция гарантирует, что конфигурация контроля доступа к кластеру ClickHouse может быть резервирована и восстановлена как часть общего настройки кластера.

Примечание: Эта функциональность работает только для конфигураций, управляемых через SQL-команды (называемые ["Управлением доступом на основе SQL и управления учетными записями"](/operations/access-rights#enabling-access-control)). Конфигурации доступа, определенные в файлах конфигурации сервера ClickHouse (например, `users.xml`), не включаются в резервные копии и не могут быть восстановлены таким образом.
