---
slug: /cloud/reference/shared-merge-tree
sidebar_label: SharedMergeTree
title: SharedMergeTree
keywords: ['shared merge tree', 'SharedMergeTree engine']
---

import shared_merge_tree from '@site/static/images/cloud/reference/shared-merge-tree-1.png';
import shared_merge_tree_2 from '@site/static/images/cloud/reference/shared-merge-tree-2.png';



# SharedMergeTree Движок Таблиц

*\* Доступен исключительно в ClickHouse Cloud (и облачных сервисах первого уровня партнеров)*

Семейство движков таблиц SharedMergeTree является облачным аналогом движков ReplicatedMergeTree и оптимизировано для работы на основе общего хранилища (например, Amazon S3, Google Cloud Storage, MinIO, Azure Blob Storage). Для каждого специфического типа движка MergeTree существует аналог SharedMergeTree, т.е. ReplacingSharedMergeTree заменяет ReplacingReplicatedMergeTree.

Семейство движков таблиц SharedMergeTree обеспечивает работу ClickHouse Cloud. Для конечного пользователя ничего не нужно менять, чтобы начать использовать семейство движков SharedMergeTree вместо движков на основе ReplicatedMergeTree. Это обеспечивает следующие дополнительные преимущества:

- Более высокая пропускная способность вставок
- Улучшенная пропускная способность фоновых слияний
- Улучшенная пропускная способность мутаций
- Более быстрые операции масштабирования вверх и вниз
- Более легкая сильная согласованность для выборочных запросов

Значительное улучшение, которое приносит SharedMergeTree, заключается в том, что оно обеспечивает более глубокое разделение вычислений и хранения по сравнению с ReplicatedMergeTree. Вы можете увидеть ниже, как ReplicatedMergeTree отделяет вычисления и хранение:

<img alt="Диаграмма ReplicatedMergeTree"
  src={shared_merge_tree} />

Как видно, даже несмотря на то, что данные, хранящиеся в ReplicatedMergeTree, находятся в объектном хранилище, метаданные по-прежнему находятся на каждом из серверов clickhouse. Это означает, что для каждой реплицированной операции также необходимо реплицировать метаданные на все реплики.

<img alt="Диаграмма ReplicatedMergeTree с метаданными"
  src={shared_merge_tree_2} />

В отличие от ReplicatedMergeTree, SharedMergeTree не требует, чтобы реплики общались друг с другом. Вместо этого вся связь происходит через общее хранилище и clickhouse-keeper. SharedMergeTree реализует асинхронную репликацию без лидера и использует clickhouse-keeper для координации и хранения метаданных. Это означает, что метаданные не нужно реплицировать, поскольку ваш сервис масштабируется вверх и вниз. Это приводит к более быстрой репликации, мутациям, слияниям и операциям масштабирования вверх. SharedMergeTree позволяет иметь сотни реплик для каждой таблицы, что делает возможным динамическое масштабирование без шардирования. Подход к выполнению распределенных запросов используется в ClickHouse Cloud для использования большего количества вычислительных ресурсов для запроса.

## Интроспекция {#introspection}

Большинство системных таблиц, используемых для интроспекции ReplicatedMergeTree, существуют для SharedMergeTree, за исключением `system.replication_queue` и `system.replicated_fetches`, так как репликации данных и метаданных не происходит. Тем не менее, у SharedMergeTree есть соответствующие альтернативы для этих двух таблиц.

**system.virtual_parts**

Эта таблица служит альтернативой для `system.replication_queue` для SharedMergeTree. Она хранит информацию о самом последнем наборе текущих частей, а также о будущих частях, находящихся в процессе, таких как слияния, мутации и удаленные партиции.

**system.shared_merge_tree_fetches**

Эта таблица является альтернативой для `system.replicated_fetches` в SharedMergeTree. Она содержит информацию о текущих операциях выборки первичных ключей и контрольных сумм в память.

## Включение SharedMergeTree {#enabling-sharedmergetree}

`SharedMergeTree` включен по умолчанию.

Для сервисов, которые поддерживают движок таблиц SharedMergeTree, вам не нужно ничего включать вручную. Вы можете создавать таблицы так же, как и раньше, и они автоматически будут использовать движок таблицы на основе SharedMergeTree, соответствующий движку, указанному в вашем запросе CREATE TABLE.

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ENGINE = MergeTree
ORDER BY key
```

Это создаст таблицу `my_table`, используя движок таблицы SharedMergeTree.

Вам не нужно указывать `ENGINE=MergeTree`, так как `default_table_engine=MergeTree` в ClickHouse Cloud. Следующий запрос идентичен предыдущему запросу.

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ORDER BY key
```

Если вы используете Replacing, Collapsing, Aggregating, Summing, VersionedCollapsing или Graphite MergeTree, это будет автоматически преобразовано в соответствующий движок таблицы на основе SharedMergeTree.

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

Для данной таблицы вы можете проверить, какой движок таблицы был использован с помощью оператора `SHOW CREATE TABLE`:
``` sql
SHOW CREATE TABLE myFirstReplacingMT;
```

```sql
CREATE TABLE default.myFirstReplacingMT
( `key` Int64, `someCol` String, `eventTime` DateTime )
ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}')
ORDER BY key
SETTINGS index_granularity = 8192
```

## Настройки {#settings}

Некоторые параметры имеют значительно измененное поведение:

- `insert_quorum` -- все вставки в SharedMergeTree являются вставками по кворуму (записываются в общее хранилище), поэтому этот параметр не требуется при использовании движка таблицы SharedMergeTree.
- `insert_quorum_parallel` -- все вставки в SharedMergeTree являются вставками по кворуму (записываются в общее хранилище), поэтому этот параметр не требуется при использовании движка таблицы SharedMergeTree.
- `select_sequential_consistency` -- не требует вставок по кворуму, будет вызывать дополнительную нагрузку на clickhouse-keeper при `SELECT` запросах

## Согласованность {#consistency}

SharedMergeTree обеспечивает лучшую легкую согласованность, чем ReplicatedMergeTree. При вставке в SharedMergeTree вам не нужно предоставлять параметры такие как `insert_quorum` или `insert_quorum_parallel`. Вставки являются вставками по кворуму, что означает, что метаданные будут храниться в ClickHouse-Keeper, а метаданные реплицируются как минимум на квоту ClickHouse-keepers. Каждая реплика в вашем кластере будет асинхронно получать новую информацию из ClickHouse-Keeper.

В большинстве случаев вам не следует использовать `select_sequential_consistency` или `SYSTEM SYNC REPLICA LIGHTWEIGHT`. Асинхронная репликация должна покрывать большинство сценариев и имеет очень низкую задержку. В редких случаях, когда вам абсолютно необходимо предотвратить устаревшие чтения, следуйте этим рекомендациям в порядке предпочтения:

1. Если вы выполняете свои запросы в одной и той же сессии или на одном узле для ваших чтений и записей, использование `select_sequential_consistency` не требуется, так как ваша реплика уже будет иметь самые последние метаданные.

2. Если вы записываете на одну реплику и читаете с другой, вы можете использовать `SYSTEM SYNC REPLICA LIGHTWEIGHT`, чтобы принудить реплику получить метаданные из ClickHouse-Keeper.

3. Используйте `select_sequential_consistency` в качестве параметра в вашем запросе.

## Связанный контент {#related-content}

- [ClickHouse Cloud повышает производительность с помощью SharedMergeTree и Lightweight Updates](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)
