---
slug: /cloud/reference/shared-merge-tree
sidebar_label: 'SharedMergeTree'
title: 'SharedMergeTree'
keywords: ['SharedMergeTree']
description: 'Описание движка таблицы SharedMergeTree'
---

import shared_merge_tree from '@site/static/images/cloud/reference/shared-merge-tree-1.png';
import shared_merge_tree_2 from '@site/static/images/cloud/reference/shared-merge-tree-2.png';
import Image from '@theme/IdealImage';


# Движок таблицы SharedMergeTree

*\* Доступно исключительно в ClickHouse Cloud (и в облачных сервисах первого уровня)*

Семейство движков таблиц SharedMergeTree является облачно-ориентированной заменой движков ReplicatedMergeTree, оптимизированной для работы на основе общего хранилища (например, Amazon S3, Google Cloud Storage, MinIO, Azure Blob Storage). Для каждого конкретного типа движка MergeTree имеется аналог SharedMergeTree, т.е. ReplacingSharedMergeTree заменяет ReplacingReplicatedMergeTree.

Семейство движков таблиц SharedMergeTree поддерживает ClickHouse Cloud. Для конечного пользователя не нужно ничего менять, чтобы начать использовать семью двигателей SharedMergeTree вместо движков на основе ReplicatedMergeTree. Она предоставляет следующие дополнительные преимущества:

- Более высокая пропускная способность вставок
- Улучшенная пропускная способность фоновых слияний
- Улучшенная пропускная способность мутаций
- Более быстрые операции масштабирования
- Более легковесная сильная консистентность для запросов select

Значительное улучшение, которое приносит SharedMergeTree, заключается в том, что оно обеспечивает более глубокое разделение вычислений и хранения по сравнению с ReplicatedMergeTree. Вы можете увидеть ниже, как ReplicatedMergeTree отделяет вычисления и хранение:

<Image img={shared_merge_tree} alt="Схема ReplicatedMergeTree" size="md"  />

Как вы можете видеть, даже если данные, хранящиеся в ReplicatedMergeTree, находятся в объектном хранилище, метаданные все еще находятся на каждом из серверов clickhouse. Это означает, что для каждой реплицированной операции метаданные также должны быть реплицированы на всех репликах.

<Image img={shared_merge_tree_2} alt="Схема ReplicatedMergeTree с метаданными" size="md"  />

В отличие от ReplicatedMergeTree, SharedMergeTree не требует, чтобы реплики взаимодействовали друг с другом. Вместо этого все взаимодействие происходит через общее хранилище и clickhouse-keeper. SharedMergeTree реализует асинхронную репликацию без лидера и использует clickhouse-keeper для координации и хранения метаданных. Это означает, что метаданные не нужно реплицировать, когда ваш сервис масштабируется вверх и вниз. Это приводит к более быстрой репликации, мутациям, слияниям и операциям масштабирования. SharedMergeTree позволяет иметь сотни реплик для каждой таблицы, что делает возможным динамическое масштабирование без шардирования. В ClickHouse Cloud используется подход распределенного выполнения запросов для использования большего количества вычислительных ресурсов для запроса.

## Интроспекция {#introspection}

Большинство системных таблиц, используемых для интроспекции ReplicatedMergeTree, существуют для SharedMergeTree, за исключением `system.replication_queue` и `system.replicated_fetches`, так как в данном случае не происходит репликации данных и метаданных. Однако у SharedMergeTree есть соответствующие альтернативы для этих двух таблиц.

**system.virtual_parts**

Эта таблица служит альтернативой для `system.replication_queue` в SharedMergeTree. Она хранит информацию о наиболее недавнем наборе текущих частей, а также будущих частях в процессе, таких как слияния, мутации и удаленные партиции.

**system.shared_merge_tree_fetches**

Эта таблица является альтернативой `system.replicated_fetches` для SharedMergeTree. Она содержит информацию о текущих записях о выборках первичных ключей и контрольных сумм в память.

## Включение SharedMergeTree {#enabling-sharedmergetree}

`SharedMergeTree` включен по умолчанию.

Для сервисов, которые поддерживают движок таблицы SharedMergeTree, вам не нужно ничего включать вручную. Вы можете создавать таблицы так же, как и раньше, и она автоматически использует движок таблицы на основе SharedMergeTree, соответствующий движку, указанному в вашем запросе CREATE TABLE.

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ENGINE = MergeTree
ORDER BY key
```

Это создаст таблицу `my_table`, используя движок таблицы SharedMergeTree.

Вам не нужно указывать `ENGINE=MergeTree`, так как `default_table_engine=MergeTree` в ClickHouse Cloud. Следующий запрос идентичен приведенному выше.

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ORDER BY key
```

Если вы используете Replacing, Collapsing, Aggregating, Summing, VersionedCollapsing или Graphite MergeTree, он будет автоматически преобразован в соответствующий движок таблицы на основе SharedMergeTree.

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

Для данной таблицы вы можете проверить, какой движок таблицы использовался с помощью оператора `CREATE TABLE`, выполнив `SHOW CREATE TABLE`:
```sql
SHOW CREATE TABLE myFirstReplacingMT;
```

```sql
CREATE TABLE default.myFirstReplacingMT
( `key` Int64, `someCol` String, `eventTime` DateTime )
ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}')
ORDER BY key
```

## Настройки {#settings}

Некоторые настройки изменяют свое поведение значительно:

- `insert_quorum` -- все вставки в SharedMergeTree являются кворумными вставками (записываются в общее хранилище), поэтому эта настройка не нужна при использовании движка таблицы SharedMergeTree.
- `insert_quorum_parallel` -- все вставки в SharedMergeTree являются кворумными вставками (записываются в общее хранилище), поэтому эта настройка не нужна при использовании движка таблицы SharedMergeTree.
- `select_sequential_consistency` -- не требует кворумных вставок, будет создавать дополнительную нагрузку на clickhouse-keeper при запросах `SELECT`

## Консистентность {#consistency}

SharedMergeTree обеспечивает лучшую легковесную консистентность, чем ReplicatedMergeTree. При вставке в SharedMergeTree вам не нужно предоставлять настройки, такие как `insert_quorum` или `insert_quorum_parallel`. Вставки являются кворумными вставками, что означает, что метаданные будут храниться в ClickHouse-Keeper, и метаданные реплицируются по крайней мере на кворум ClickHouse-keeper. Каждая реплика в вашем кластере будет асинхронно извлекать новую информацию из ClickHouse-Keeper.

В большинстве случаев вам не следует использовать `select_sequential_consistency` или `SYSTEM SYNC REPLICA LIGHTWEIGHT`. Асинхронная репликация должна покрывать большинство сценариев и имеет очень низкую задержку. В редком случае, когда вам абсолютно необходимо предотвратить устаревшие чтения, следуйте этим рекомендациям в порядке предпочтения:

1. Если вы выполняете свои запросы в одной сессии или на одном узле для ваших чтений и записей, использовать `select_sequential_consistency` не требуется, так как ваша реплика уже будет иметь самые последние метаданные.

2. Если вы пишете в одну реплику и читаете из другой, вы можете использовать `SYSTEM SYNC REPLICA LIGHTWEIGHT`, чтобы заставить реплику извлечь метаданные из ClickHouse-Keeper.

3. Используйте `select_sequential_consistency` в качестве настройки в рамках вашего запроса.

## Связанные материалы {#related-content}

- [ClickHouse Cloud улучшает производительность с SharedMergeTree и легковесными обновлениями](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)
