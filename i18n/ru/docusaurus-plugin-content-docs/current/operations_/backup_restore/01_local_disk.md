---
description: 'Резервное копирование и восстановление на локальный диск и с него'
sidebar_label: 'Локальный диск / диск S3'
slug: /operations/backup/disk
title: 'Резервное копирование и восстановление в ClickHouse'
doc_type: 'guide'
---

import GenericSettings from '@site/docs/operations_/backup_restore/_snippets/_generic_settings.md';
import S3Settings from '@site/docs/operations_/backup_restore/_snippets/_s3_settings.md';
import ExampleSetup from '@site/docs/operations_/backup_restore/_snippets/_example_setup.md';
import Syntax from '@site/docs/operations_/backup_restore/_snippets/_syntax.md';


# BACKUP / RESTORE на диск {#backup-to-a-local-disk}


## Синтаксис {#syntax}

<Syntax />


## Настройка мест назначения резервных копий для диска {#configure-backup-destinations-for-disk}

### Настройка места назначения резервной копии для локального диска {#configure-a-backup-destination}

В приведенных ниже примерах место назначения резервной копии указывается как `Disk('backups', '1.zip')`.  
Для использования движка резервного копирования `Disk` необходимо сначала добавить файл, указывающий
место назначения резервной копии, по следующему пути:

```text
/etc/clickhouse-server/config.d/backup_disk.xml
```

Например, приведенная ниже конфигурация определяет диск с именем `backups` и затем добавляет этот диск в
список **allowed_disk** раздела **backups**:

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

### Настройка места назначения резервной копии для диска S3 {#backuprestore-using-an-s3-disk}

Также возможно выполнять `BACKUP`/`RESTORE` в S3, настроив диск S3 в
конфигурации хранилища ClickHouse. Настройте диск, добавив файл в
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

- Этот диск не следует использовать для самого `MergeTree`, только для `BACKUP`/`RESTORE`
- Если ваши таблицы размещены в хранилище S3 и типы дисков различаются,
  система не использует вызовы `CopyObject` для копирования частей в целевой бакет, а вместо этого
  загружает и выгружает их, что крайне неэффективно. В этом случае предпочтительнее использовать
  синтаксис `BACKUP ... TO S3(<endpoint>)` для данного сценария использования.
  :::


## Примеры использования резервного копирования и восстановления на локальный диск {#usage-examples}

### Резервное копирование и восстановление таблицы {#backup-and-restore-a-table}

<ExampleSetup />

Чтобы создать резервную копию таблицы, выполните:

```sql title="Запрос"
BACKUP TABLE test_db.test_table TO Disk('backups', '1.zip')
```

```response title="Ответ"
   ┌─id───────────────────────────────────┬─status─────────┐
1. │ 065a8baf-9db7-4393-9c3f-ba04d1e76bcd │ BACKUP_CREATED │
   └──────────────────────────────────────┴────────────────┘
```

Таблицу можно восстановить из резервной копии с помощью следующей команды, если таблица пустая:

```sql title="Запрос"
RESTORE TABLE test_db.test_table FROM Disk('backups', '1.zip')
```

```response title="Ответ"
   ┌─id───────────────────────────────────┬─status───┐
1. │ f29c753f-a7f2-4118-898e-0e4600cd2797 │ RESTORED │
   └──────────────────────────────────────┴──────────┘
```

:::note
Выполнение указанной выше команды `RESTORE` завершится ошибкой, если таблица `test.table` содержит данные.
Настройка `allow_non_empty_tables=true` позволяет `RESTORE TABLE` вставлять данные
в непустые таблицы. В этом случае существующие данные в таблице будут смешаны с данными, извлечёнными из резервной копии.
Эта настройка может привести к дублированию данных в таблице и должна использоваться с осторожностью.
:::

Чтобы восстановить таблицу, в которой уже есть данные, выполните:

```sql
RESTORE TABLE test_db.table_table FROM Disk('backups', '1.zip')
SETTINGS allow_non_empty_tables=true
```

Таблицы можно восстанавливать или создавать их резервные копии под новыми именами:

```sql
RESTORE TABLE test_db.table_table AS test_db.test_table_renamed FROM Disk('backups', '1.zip')
```

Архив резервной копии для этого бэкапа имеет следующую структуру:

```text
├── .backup
└── metadata
    └── test_db
        └── test_table.sql
```

<!-- TO DO: 
Explanation here about the backup format. See Issue 24a
https://github.com/ClickHouse/clickhouse-docs/issues/3968
-->

Можно использовать и другие форматы, помимо zip. Подробности см. в разделе ниже — ["Резервные копии в виде tar‑архивов"](#backups-as-tar-archives).

### Инкрементные резервные копии на диск {#incremental-backups}

Базовая резервная копия в ClickHouse — это начальная полная копия, на основе которой создаются последующие
инкрементные резервные копии. Инкрементные копии содержат только изменения,
сделанные после базовой копии, поэтому базовую копию необходимо сохранять доступной,
чтобы можно было восстановиться из любой инкрементной копии. Место хранения базовой копии задаётся настройкой
`base_backup`.

:::note
Инкрементные резервные копии зависят от базовой копии. Базовая копия должна оставаться доступной,
чтобы была возможность восстановиться из инкрементной копии.
:::

Чтобы создать инкрементную резервную копию таблицы, сначала сделайте базовую копию:

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', 'd.zip')
```

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', 'incremental-a.zip')
SETTINGS base_backup = Disk('backups', 'd.zip')
```

Все данные из инкрементной резервной копии и базовой копии можно восстановить в
новую таблицу `test_db.test_table2` с помощью команды:

```sql
RESTORE TABLE test_db.test_table AS test_db.test_table2
FROM Disk('backups', 'incremental-a.zip');
```

### Защита резервной копии {#assign-a-password-to-the-backup}

К резервным копиям, записываемым на диск, можно применять пароль.
Пароль задаётся с помощью настройки `password`:

```sql
BACKUP TABLE test_db.test_table
TO Disk('backups', 'password-protected.zip')
SETTINGS password='qwerty'
```

Чтобы восстановить резервную копию, защищённую паролем, необходимо снова
указать пароль с помощью настройки `password`:

```sql
RESTORE TABLE test_db.test_table
FROM Disk('backups', 'password-protected.zip')
SETTINGS password='qwerty'
```

### Резервные копии в виде tar‑архивов {#backups-as-tar-archives}

Резервные копии можно хранить не только в виде zip‑архивов, но и в виде tar‑архивов.
Функциональность такая же, как у zip, за исключением того, что защита паролем для tar‑архивов
не поддерживается. Кроме того, tar‑архивы поддерживают различные методы сжатия.

Чтобы создать резервную копию таблицы в виде tar‑архива:


```sql
BACKUP TABLE test_db.test_table TO Disk('backups', '1.tar')
```

для восстановления из tar-архива:

```sql
RESTORE TABLE test_db.test_table FROM Disk('backups', '1.tar')
```

Чтобы изменить метод сжатия, к имени резервной копии необходимо добавить соответствующее расширение файла. Например, чтобы сжать tar-архив с помощью gzip, выполните:

```sql
BACKUP TABLE test_db.test_table TO Disk('backups', '1.tar.gz')
```

Поддерживаемые расширения файлов для сжатия:

- `tar.gz`
- `.tgz`
- `tar.bz2`
- `tar.lzma`
- `.tar.zst`
- `.tzst`
- `.tar.xz`

### Настройки сжатия {#compression-settings}

Метод сжатия и уровень сжатия можно задать с помощью настроек `compression_method` и `compression_level` соответственно.

<!-- TO DO:
More information needed on these settings and why you would want to do this
-->

```sql
BACKUP TABLE test_db.test_table
TO Disk('backups', 'filename.zip')
SETTINGS compression_method='lzma', compression_level=3
```

### Восстановление отдельных партиций {#restore-specific-partitions}

Если необходимо восстановить определенные партиции таблицы, их можно указать явно.

Создадим простую партиционированную таблицу из четырех частей, вставим в нее данные, а затем создадим резервную копию только первой и четвертой партиций:

<details>

<summary>Настройка</summary>

```sql
CREATE IF NOT EXISTS test_db;

-- Создание партиционированной таблицы
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

Выполните следующую команду для создания резервной копии партиций 1 и 4:

```sql
BACKUP TABLE test_db.partitioned PARTITIONS '1', '4'
TO Disk('backups', 'partitioned.zip')
```

Выполните следующую команду для восстановления партиций 1 и 4:

```sql
RESTORE TABLE test_db.partitioned PARTITIONS '1', '4'
FROM Disk('backups', 'partitioned.zip')
SETTINGS allow_non_empty_tables=true
```
