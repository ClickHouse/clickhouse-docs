---
description: 'Подробная информация о резервном копировании и восстановлении на локальный диск и с него'
sidebar_label: 'Локальный диск / S3-диск'
slug: /operations/backup/disk
title: 'Резервное копирование и восстановление в ClickHouse'
doc_type: 'guide'
---

import GenericSettings from '@site/i18n/ru/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_generic_settings.md';
import S3Settings from '@site/i18n/ru/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_s3_settings.md';
import ExampleSetup from '@site/i18n/ru/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_example_setup.md';
import Syntax from '@site/i18n/ru/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_syntax.md';

# Резервное копирование и восстановление на локальный диск \\{#backup-to-a-local-disk\\}

## Синтаксис \\{#syntax\\}

<Syntax/>

## Настройка путей назначения резервного копирования для диска \\{#configure-backup-destinations-for-disk\\}

### Настройка пути назначения резервного копирования для локального диска \\{#configure-a-backup-destination\\}

В приведённых ниже примерах вы увидите, что путь назначения резервного копирования указан как `Disk('backups', '1.zip')`.\
Чтобы использовать движок резервного копирования `Disk`, необходимо сначала создать файл, задающий путь назначения резервного копирования, по следующему пути:

```text
/etc/clickhouse-server/config.d/backup_disk.xml
```

Например, в приведённой ниже конфигурации определяется диск с именем `backups`, после чего этот диск добавляется в список **allowed&#95;disk** политики **backups**:

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

### Настройка назначения резервного копирования для диска S3 \\{#backuprestore-using-an-s3-disk\\}

Также можно выполнять операции `BACKUP`/`RESTORE` в S3, настроив диск S3
в настройках хранилища ClickHouse. Настройте диск следующим образом, добавив файл в
`/etc/clickhouse-server/config.d`, как это было сделано выше для локального диска.

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

Операции `BACKUP`/`RESTORE` для диска S3 выполняются так же, как и для локального диска:

```sql
BACKUP TABLE data TO Disk('s3_plain', 'cloud_backup');
RESTORE TABLE data AS data_restored FROM Disk('s3_plain', 'cloud_backup');
```

:::note

* Этот диск не должен использоваться для самого `MergeTree`, только для `BACKUP`/`RESTORE`.
* Если ваши таблицы используют хранилище S3 и типы дисков различаются,
  для копирования частей в целевой бакет не используются вызовы `CopyObject`: вместо этого
  данные сначала скачиваются, а затем загружаются, что крайне неэффективно. В таком случае рекомендуется использовать
  синтаксис `BACKUP ... TO S3(<endpoint>)` для этого сценария.
  :::

## Примеры использования операций резервного копирования и восстановления на локальный диск \\{#usage-examples\\}

### Резервное копирование и восстановление таблицы \\{#backup-and-restore-a-table\\}

<ExampleSetup />

Чтобы создать резервную копию таблицы, выполните:

```sql title="Query"
BACKUP TABLE test_db.test_table TO Disk('backups', '1.zip')
```

```response title="Response"
   ┌─id───────────────────────────────────┬─status─────────┐
1. │ 065a8baf-9db7-4393-9c3f-ba04d1e76bcd │ BACKUP_CREATED │
   └──────────────────────────────────────┴────────────────┘
```

Таблицу можно восстановить из резервной копии с помощью следующей команды, если таблица пустая:

```sql title="Query"
RESTORE TABLE test_db.test_table FROM Disk('backups', '1.zip')
```

```response title="Response"
   ┌─id───────────────────────────────────┬─status───┐
1. │ f29c753f-a7f2-4118-898e-0e4600cd2797 │ RESTORED │
   └──────────────────────────────────────┴──────────┘
```

:::note
Выполнение приведённой выше команды `RESTORE` завершится ошибкой, если таблица `test.table` уже содержит данные.
Настройка `allow_non_empty_tables=true` позволяет команде `RESTORE TABLE` вставлять данные
в непустые таблицы. В этом случае прежние данные в таблице будут смешаны с данными, извлечёнными из резервной копии.
Поэтому эта настройка может привести к дублированию данных в таблице и должна использоваться с осторожностью.
:::

Чтобы восстановить таблицу, уже содержащую данные, выполните:

```sql
RESTORE TABLE test_db.table_table FROM Disk('backups', '1.zip')
SETTINGS allow_non_empty_tables=true
```

Таблицы можно восстанавливать или создавать их резервные копии под новыми именами:

```sql
RESTORE TABLE test_db.table_table AS test_db.test_table_renamed FROM Disk('backups', '1.zip')
```

Архив этой резервной копии имеет следующую структуру:

```text
├── .backup
└── metadata
    └── test_db
        └── test_table.sql
```

{/* TO DO: 
  Здесь должно быть объяснение формата резервной копии. См. задачу 24a
  https://github.com/ClickHouse/clickhouse-docs/issues/3968
  */ }

Могут использоваться и другие форматы, помимо zip. См. раздел [&quot;Резервные копии в виде tar-архивов&quot;](#backups-as-tar-archives)
ниже для получения дополнительной информации.

### Инкрементные резервные копии на диск \\{#incremental-backups\\}

Базовая резервная копия в ClickHouse — это начальная полная резервная копия, на основе которой
создаются последующие инкрементные резервные копии. Инкрементные резервные копии содержат только изменения,
сделанные с момента создания базовой резервной копии, поэтому базовую резервную копию необходимо хранить в доступном виде,
чтобы иметь возможность выполнить восстановление из любой инкрементной резервной копии. Место назначения базовой резервной копии можно задать настройкой
`base_backup`.

:::note
Инкрементные резервные копии зависят от базовой резервной копии. Базовую резервную копию необходимо хранить в доступном виде,
чтобы иметь возможность выполнить восстановление из инкрементной резервной копии.
:::

Чтобы создать инкрементную резервную копию таблицы, сначала создайте базовую резервную копию:

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', 'd.zip')
```

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', 'incremental-a.zip')
SETTINGS base_backup = Disk('backups', 'd.zip')
```

Все данные из инкрементной и базовой резервных копий могут быть восстановлены в
новую таблицу `test_db.test_table2` с помощью следующей команды:

```sql
RESTORE TABLE test_db.test_table AS test_db.test_table2
FROM Disk('backups', 'incremental-a.zip');
```

### Защита резервной копии \\{#assign-a-password-to-the-backup\\}

К файлам резервных копий, записанным на диск, можно применить пароль.
Пароль можно указать с помощью настройки `password`:

```sql
BACKUP TABLE test_db.test_table
TO Disk('backups', 'password-protected.zip')
SETTINGS password='qwerty'
```

Для восстановления резервной копии, защищённой паролем, следует повторно
указать пароль в настройке `password`:

```sql
RESTORE TABLE test_db.test_table
FROM Disk('backups', 'password-protected.zip')
SETTINGS password='qwerty'
```

### Резервные копии в виде tar-архивов \\{#backups-as-tar-archives\\}

Резервные копии могут храниться не только в виде zip-архивов, но и в виде tar-архивов.
Функциональность аналогична zip, за исключением того, что защита паролем не
поддерживается для tar-архивов. Кроме того, tar-архивы поддерживают различные
методы сжатия.

Чтобы создать резервную копию таблицы в формате tar:

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', '1.tar')
```

для восстановления из tar-архива:

```sql
RESTORE TABLE test_db.test_table FROM Disk('backups', '1.tar')
```

Чтобы изменить метод сжатия, к имени резервной копии необходимо добавить
нужное расширение файла. Например, чтобы сжать tar‑архив с помощью gzip, выполните:

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', '1.tar.gz')
```

Поддерживаемые суффиксы файлов сжатых архивов:

* `tar.gz`
* `.tgz`
* `tar.bz2`
* `tar.lzma`
* `.tar.zst`
* `.tzst`
* `.tar.xz`

### Настройки сжатия \\{#compression-settings\\}

Метод сжатия и степень сжатия можно задать с помощью параметров `compression_method` и `compression_level` соответственно.

{/* TO DO:
  Требуется более подробная информация об этих настройках и о том, в каких случаях и зачем их имеет смысл использовать 
  */ }

```sql
BACKUP TABLE test_db.test_table
TO Disk('backups', 'filename.zip')
SETTINGS compression_method='lzma', compression_level=3
```

### Восстановление отдельных партиций \\{#restore-specific-partitions\\}

Если необходимо восстановить только определённые партиции, связанные с таблицей, их можно явно указать.

Создадим простую партиционированную таблицу на четыре партиции, вставим в неё данные, а затем
сделаем резервную копию только первой и четвёртой партиций:

<details>
  <summary>Setup</summary>

  ```sql
CREATE IF NOT EXISTS test_db;
       
-- Create a partitioend table
CREATE TABLE test_db.partitioned (
    id UInt32,
    data String,
    partition_key UInt8
) ENGINE = MergeTree()
PARTITION BY partition_key
ORDER BY id;

INSERT INTO test_db.partitioned VALUES
(1, 'data1', 1),
(2, 'data2', 2),
(3, 'data3', 3),
(4, 'data4', 4);

SELECT count() FROM test_db.partitioned;

SELECT partition_key, count() 
FROM test_db.partitioned
GROUP BY partition_key
ORDER BY partition_key;
```

  ```response
   ┌─count()─┐
1. │       4 │
   └─────────┘
   ┌─partition_key─┬─count()─┐
1. │             1 │       1 │
2. │             2 │       1 │
3. │             3 │       1 │
4. │             4 │       1 │
   └───────────────┴─────────┘
```
</details>

Выполните следующую команду, чтобы создать резервную копию партиций 1 и 4:

```sql
BACKUP TABLE test_db.partitioned PARTITIONS '1', '4'
TO Disk('backups', 'partitioned.zip')
```

Выполните следующую команду, чтобы восстановить партиции 1 и 4:

```sql
RESTORE TABLE test_db.partitioned PARTITIONS '1', '4'
FROM Disk('backups', 'partitioned.zip')
SETTINGS allow_non_empty_tables=true
```
