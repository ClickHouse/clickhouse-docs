---
description: 'Обзор резервного копирования и восстановления в ClickHouse'
sidebar_label: 'S3-эндпоинт'
slug: /operations/backup/s3_endpoint
title: 'Резервное копирование и восстановление с/на S3-эндпоинт'
doc_type: 'guide'
---

import Syntax from '@site/i18n/ru/docusaurus-plugin-content-docs/current/operations_/backup_restore/_snippets/_syntax.md';

# РЕЗЕРВНОЕ КОПИРОВАНИЕ / ВОССТАНОВЛЕНИЕ на или с S3-эндпоинта \\{#backup-to-a-local-disk\\}

В этой статье рассматривается создание и восстановление резервных копий в/из бакета S3 через S3-эндпоинт.

## Синтаксис \\{#syntax\\}

<Syntax/>

## Пример использования \\{#usage-examples\\}

### Инкрементное резервное копирование на конечную точку S3 \\{#incremental-backup-to-an-s3-endpoint\\}

В этом примере мы создадим резервную копию на конечную точку S3, а затем восстановим из неё данные.

:::note
Объяснение различий между полным и инкрементным резервным копированием см. в разделе [«Типы резервных копий»](/operations/backup/overview/#backup-types)
:::

Для использования этого метода потребуется следующая информация:

| Параметр          | Пример                                                       |
| ----------------- | ------------------------------------------------------------ |
| Конечная точка S3 | `https://backup-ch-docs.s3.us-east-1.amazonaws.com/backups/` |
| Идентификатор ключа доступа     | `BKIOZLE2VYN3VXXTP9RC`                                       |
| Секретный ключ доступа | `40bwYnbqN7xU8bVePaUCh3+YEyGXu8UOMV9ANpwL`                   |

:::tip
Создание корзины S3 рассматривается в разделе [«Использование объектного хранилища S3 в качестве диска ClickHouse»](/integrations/data-ingestion/s3/index.md#configuring-s3-for-clickhouse-use)
:::

Место назначения для резервной копии указывается следующим образом:

```sql
S3('<s3 endpoint>/<directory>', '<access key id>', '<secret access key>', '<extra_credentials>')
```

<br/>
<VerticalStepper headerLevel="h4">

#### Настройка \\{#create-a-table\\}

Создайте следующую базу данных и таблицу, затем вставьте в неё случайные данные:

```sql
CREATE DATABASE IF NOT EXISTS test_db;
CREATE TABLE test_db.test_table
(
    `key` Int,
    `value` String,
    `array` Array(String)
)
ENGINE = MergeTree
ORDER BY tuple()
```

```sql
INSERT INTO test_db.test_table SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 1000
```

#### Создание базовой резервной копии \\{#create-a-base-initial-backup\\}

Для инкрементного резервного копирования требуется _базовая_ резервная копия в качестве отправной точки. Первый параметр места назначения S3 — это конечная точка S3, за которой следует каталог внутри корзины для данной резервной копии. В этом примере каталог называется `my_backup`.

Выполните следующую команду для создания базовой резервной копии:

```sql
BACKUP TABLE test_db.test_table TO S3(
'https://backup-ch-docs.s3.us-east-1.amazonaws.com/backups/base_backup',
'<access key id>',
'<secret access key>'
)
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ de442b75-a66c-4a3c-a193-f76f278c70f3 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

#### Добавление дополнительных данных \\{#add-more-data\\}

Инкрементные резервные копии содержат разницу между базовой резервной копией и текущим содержимым резервируемой таблицы. Добавьте дополнительные данные перед созданием инкрементной резервной копии:

```sql
INSERT INTO test_db.test_table SELECT *
FROM generateRandom('key Int, value String, array Array(String)')
LIMIT 100
```

#### Создание инкрементной резервной копии \\{#take-an-incremental-backup\\}

Эта команда резервного копирования аналогична команде для базовой резервной копии, но добавляет `SETTINGS base_backup` и расположение базовой резервной копии. Обратите внимание, что место назначения для инкрементной резервной копии — это не тот же каталог, что и для базовой, а та же конечная точка с другим целевым каталогом внутри корзины. Базовая резервная копия находится в `my_backup`, а инкрементная будет записана в `my_incremental`:

```sql
BACKUP TABLE test_db.test_table TO S3(
'https://backup-ch-docs.s3.us-east-1.amazonaws.com/backups/incremental_backup',
'<access key id>',
'<secret access key>'
)
SETTINGS base_backup = S3(
'https://backup-ch-docs.s3.us-east-1.amazonaws.com/backups/base_backup',
'<access key id>',
'<secret access key>'
)
```

```response
┌─id───────────────────────────────────┬─status─────────┐
│ f6cd3900-850f-41c9-94f1-0c4df33ea528 │ BACKUP_CREATED │
└──────────────────────────────────────┴────────────────┘
```

#### Восстановление из инкрементной резервной копии \\{#restore-from-the-incremental-backup\\}

Эта команда восстанавливает инкрементную резервную копию в новую таблицу `test_table_restored`.  
Обратите внимание, что при восстановлении инкрементной резервной копии базовая резервная копия также включается.
При восстановлении указывайте только **инкрементную резервную копию**:

```sql
RESTORE TABLE data AS test_db.test_table_restored FROM S3(
'https://backup-ch-docs.s3.us-east-1.amazonaws.com/backups/incremental_backup',
'<access key id>',
'<secret access key>'
)
```

```response
┌─id───────────────────────────────────┬─status───┐
│ ff0c8c39-7dff-4324-a241-000796de11ca │ RESTORED │
└──────────────────────────────────────┴──────────┘
```

#### Проверка количества записей \\{#verify-the-count\\}

В исходную таблицу `data` было выполнено две вставки: одна на 1 000 строк и одна на 100 строк, всего 1 100 строк.
Убедитесь, что восстановленная таблица содержит 1 100 строк:

```sql
SELECT count()
FROM test_db.test_table_restored
```

```response
┌─count()─┐
│    1100 │
└─────────┘
```

#### Проверка содержимого \\{#verify-the-content\\}

Следующий запрос сравнивает содержимое исходной таблицы `test_table` с восстановленной таблицей `test_table_restored`:

```sql
SELECT throwIf((
   SELECT groupArray(tuple(*))
   FROM test_db.test_table
   ) != (
   SELECT groupArray(tuple(*))
   FROM test_db.test_table_restored
), 'Data does not match after BACKUP/RESTORE')
```

</VerticalStepper>
