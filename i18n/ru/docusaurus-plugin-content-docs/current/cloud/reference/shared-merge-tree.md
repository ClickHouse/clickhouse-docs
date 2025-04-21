---
slug: /cloud/reference/shared-merge-tree
sidebar_label: 'SharedMergeTree'
title: 'SharedMergeTree'
keywords: ['SharedMergeTree']
description: 'Описывает движок таблицы SharedMergeTree'
---

import shared_merge_tree from '@site/static/images/cloud/reference/shared-merge-tree-1.png';
import shared_merge_tree_2 from '@site/static/images/cloud/reference/shared-merge-tree-2.png';
import Image from '@theme/IdealImage';



# Движок таблицы SharedMergeTree

*\* Доступен исключительно в ClickHouse Cloud (и первичных облачных сервисах партнеров)*

Семейство движков таблиц SharedMergeTree является облачно-родным заменителем движков ReplicatedMergeTree, который оптимизирован для работы на основе общего хранилища (например, Amazon S3, Google Cloud Storage, MinIO, Azure Blob Storage). Для каждого конкретного типа движка MergeTree существует аналог SharedMergeTree, т.е. ReplacingSharedMergeTree заменяет ReplacingReplicatedMergeTree.

Семейство движков таблиц SharedMergeTree поддерживает ClickHouse Cloud. Для конечного пользователя ничего не нужно менять, чтобы начать использовать семейство движков SharedMergeTree вместо движков на основе ReplicatedMergeTree. Он предоставляет следующие дополнительные преимущества:

- Более высокая пропускная способность вставок
- Улучшенная пропускная способность фоновых слияний
- Улучшенная пропускная способность мутаций
- Более быстрые операции масштабирования вверх и вниз
- Легковесная строгая согласованность для выборок

Значительное улучшение, которое приносит SharedMergeTree, заключается в том, что он предоставляет более глубокое разделение вычислений и хранения по сравнению с ReplicatedMergeTree. Вы можете увидеть ниже, как ReplicatedMergeTree разделяет вычисления и хранение:

<Image img={shared_merge_tree} alt="Схема ReplicatedMergeTree" size="md"  />

Как вы можете видеть, хотя данные, хранящиеся в ReplicatedMergeTree, находятся в объектном хранилище, метаданные все еще находятся на каждом из серверов clickhouse. Это означает, что для каждой реплицированной операции метаданные также нужно реплицировать на все реплики.

<Image img={shared_merge_tree_2} alt="Схема ReplicatedMergeTree с метаданными" size="md"  />

В отличие от ReplicatedMergeTree, SharedMergeTree не требует, чтобы реплики общались друг с другом. Вместо этого вся коммуникация происходит через общее хранилище и clickhouse-keeper. SharedMergeTree реализует асинхронную репликацию без лидера и использует clickhouse-keeper для координации и хранения метаданных. Это означает, что метаданные не нужно реплицировать по мере масштабирования вашей службы вверх и вниз. Это приводит к более быстрой репликации, мутациям, слияниям и операциям масштабирования вверх. SharedMergeTree позволяет иметь сотни реплик для каждой таблицы, что делает возможным динамическое масштабирование без шардирования. В ClickHouse Cloud используется подход распределенного выполнения запросов для использования большего количества вычислительных ресурсов для запроса.

## Интроспекция {#introspection}

Большинство системных таблиц, используемых для интроспекции ReplicatedMergeTree, существуют для SharedMergeTree, за исключением `system.replication_queue` и `system.replicated_fetches`, поскольку репликации данных и метаданных не происходит. Тем не менее, для этих двух таблиц у SharedMergeTree есть соответствующие альтернативы.

**system.virtual_parts**

Эта таблица служит альтернативой `system.replication_queue` для SharedMergeTree. Она хранит информацию о наиболее последних текущих частях, а также о будущих частях в процессе, таких как слияния, мутации и удаленные партиции.

**system.shared_merge_tree_fetches**

Эта таблица является альтернативой `system.replicated_fetches` для SharedMergeTree. Она содержит информацию о текущих запросах ключей и контрольных сумм, которые находятся в процессе извлечения в память.

## Включение SharedMergeTree {#enabling-sharedmergetree}

`SharedMergeTree` включен по умолчанию.

Для сервисов, поддерживающих движок таблицы SharedMergeTree, вам не нужно ничего включать вручную. Вы можете создавать таблицы так же, как вы это делали ранее, и будет автоматически использоваться движок таблицы на основе SharedMergeTree, соответствующий движку, указанному в вашем запросе CREATE TABLE.

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ENGINE = MergeTree
ORDER BY key
```

Это создаст таблицу `my_table`, используя движок таблицы SharedMergeTree.

Вам не нужно указывать `ENGINE=MergeTree`, так как `default_table_engine=MergeTree` в ClickHouse Cloud. Следующий запрос идентичен вышеуказанному запросу.

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ORDER BY key
```

Если вы используете Replacing, Collapsing, Aggregating, Summing, VersionedCollapsing или Graphite MergeTree, он будет автоматически преобразован в соответствующий движок на основе SharedMergeTree.

```sql
CREATE TABLE myFirstReplacingMT
(
    `key` Int64,
    `someCol` String,
    `eventTime` DateTime
)
ENGINE = ReplacingMergeTree
ORDER BY key;
```

Для данной таблицы вы можете проверить, какой движок таблицы был использован с оператором `CREATE TABLE`, с помощью `SHOW CREATE TABLE`:
``` sql
SHOW CREATE TABLE myFirstReplacingMT;
```

```sql
CREATE TABLE default.myFirstReplacingMT
( `key` Int64, `someCol` String, `eventTime` DateTime )
ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}')
ORDER BY key
```

## Настройки {#settings}

Некоторые параметры ведут себя значительно иначе:

- `insert_quorum` -- все вставки в SharedMergeTree являются кворумными вставками (записываются в общее хранилище), поэтому этот параметр не нужен при использовании движка таблицы SharedMergeTree.
- `insert_quorum_parallel` -- все вставки в SharedMergeTree являются кворумными вставками (записываются в общее хранилище), поэтому этот параметр не нужен при использовании движка таблицы SharedMergeTree.
- `select_sequential_consistency` -- не требует кворумных вставок, будет генерировать дополнительную нагрузку на clickhouse-keeper при запросах `SELECT`.

## Согласованность {#consistency}

SharedMergeTree обеспечивает лучшую легковесную согласованность, чем ReplicatedMergeTree. При вставке в SharedMergeTree вам не нужно предоставлять такие параметры, как `insert_quorum` или `insert_quorum_parallel`. Вставки являются кворумными вставками, что означает, что метаданные будут храниться в ClickHouse-Keeper, и метаданные реплицируются как минимум на кворум ClickHouse-keepers. Каждая реплика в вашем кластере будет асинхронно извлекать новую информацию из ClickHouse-Keeper.

Большую часть времени вам не следует использовать `select_sequential_consistency` или `SYSTEM SYNC REPLICA LIGHTWEIGHT`. Асинхронная репликация должна покрывать большинство сценариев и имеет очень низкую задержку. В редких случаях, когда вам абсолютно необходимо предотвратить устаревшие чтения, следуйте этим рекомендациям в порядке предпочтения:

1. Если вы выполняете свои запросы в одной сессии или на одном узле для ваших чтений и записей, использование `select_sequential_consistency` не требуется, потому что ваша реплика уже будет иметь самые последние метаданные.

2. Если вы пишете в одну реплику и читаете из другой, вы можете использовать `SYSTEM SYNC REPLICA LIGHTWEIGHT`, чтобы принудить реплику извлечь метаданные из ClickHouse-Keeper.

3. Используйте `select_sequential_consistency` в качестве параметра в вашем запросе.

## Связанный контент {#related-content}

- [ClickHouse Cloud повышает производительность с SharedMergeTree и легковесными обновлениями](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)
