---
slug: /cloud/reference/shared-merge-tree
sidebar_label: 'SharedMergeTree'
title: 'SharedMergeTree'
keywords: ['SharedMergeTree']
description: 'Описание движка таблицы SharedMergeTree'
doc_type: 'reference'
---

import shared_merge_tree from '@site/static/images/cloud/reference/shared-merge-tree-1.png';
import shared_merge_tree_2 from '@site/static/images/cloud/reference/shared-merge-tree-2.png';
import Image from '@theme/IdealImage';


# Движок таблиц SharedMergeTree

Семейство движков таблиц SharedMergeTree — это облачная замена движков ReplicatedMergeTree, оптимизированная для работы поверх общего хранилища (например, Amazon S3, Google Cloud Storage, MinIO, Azure Blob Storage). Для каждого типа движка MergeTree существует аналог SharedMergeTree, то есть ReplacingSharedMergeTree заменяет ReplacingReplicatedMergeTree.

Семейство движков таблиц SharedMergeTree лежит в основе ClickHouse Cloud. Конечному пользователю не требуется вносить какие-либо изменения, чтобы начать использовать семейство движков SharedMergeTree вместо движков на базе ReplicatedMergeTree. Оно обеспечивает следующие дополнительные преимущества:

- Более высокая пропускная способность операций вставки
- Повышенная пропускная способность фоновых слияний
- Повышенная пропускная способность мутаций
- Более быстрые операции масштабирования вверх и вниз
- Более простая реализация строгой согласованности для запросов SELECT

Важным улучшением, которое даёт SharedMergeTree, является более глубокое разделение вычислений и хранения по сравнению с ReplicatedMergeTree. Ниже показано, как ReplicatedMergeTree разделяет вычисления и хранение:

<Image img={shared_merge_tree} alt="Диаграмма ReplicatedMergeTree" size="md"  />

Как видно, хотя данные в ReplicatedMergeTree хранятся в объектном хранилище, метаданные по-прежнему находятся на каждом из clickhouse-servers. Это означает, что для каждой реплицируемой операции метаданные также должны реплицироваться на все реплики.

<Image img={shared_merge_tree_2} alt="Диаграмма ReplicatedMergeTree с метаданными" size="md"  />

В отличие от ReplicatedMergeTree, SharedMergeTree не требует, чтобы реплики напрямую обменивались сообщениями друг с другом. Вместо этого весь обмен происходит через общее хранилище и clickhouse-keeper. SharedMergeTree реализует асинхронную репликацию без лидера и использует clickhouse-keeper для координации и хранения метаданных. Это означает, что метаданные не нужно реплицировать при масштабировании сервиса вверх и вниз. Это приводит к более быстрой репликации, мутациям, слияниям и операциям масштабирования. SharedMergeTree допускает сотни реплик для каждой таблицы, что позволяет динамически масштабироваться без шардирования. В ClickHouse Cloud используется подход распределённого выполнения запросов, чтобы задействовать больше вычислительных ресурсов для одного запроса.



## Интроспекция {#introspection}

Большинство системных таблиц, используемых для интроспекции ReplicatedMergeTree, существуют и для SharedMergeTree, за исключением `system.replication_queue` и `system.replicated_fetches`, так как репликация данных и метаданных не выполняется. Однако для SharedMergeTree существуют соответствующие альтернативы этим двум таблицам.

**system.virtual_parts**

Эта таблица служит альтернативой `system.replication_queue` для SharedMergeTree. Она хранит информацию о наиболее актуальном наборе текущих кусков данных, а также о будущих кусках, находящихся в процессе обработки, таких как слияния, мутации и удалённые партиции.

**system.shared_merge_tree_fetches**

Эта таблица является альтернативой `system.replicated_fetches` для SharedMergeTree. Она содержит информацию о текущих выполняемых загрузках первичных ключей и контрольных сумм в память.


## Включение SharedMergeTree {#enabling-sharedmergetree}

`SharedMergeTree` включен по умолчанию.

Для сервисов, поддерживающих движок таблиц SharedMergeTree, не требуется ничего включать вручную. Вы можете создавать таблицы так же, как и раньше, и система автоматически будет использовать движок таблиц на основе SharedMergeTree, соответствующий движку, указанному в запросе CREATE TABLE.

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ENGINE = MergeTree
ORDER BY key
```

Это создаст таблицу `my_table` с использованием движка таблиц SharedMergeTree.

Вам не нужно указывать `ENGINE=MergeTree`, так как в ClickHouse Cloud по умолчанию установлено `default_table_engine=MergeTree`. Следующий запрос идентичен приведенному выше.

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ORDER BY key
```

Если вы используете таблицы MergeTree типа Replacing, Collapsing, Aggregating, Summing, VersionedCollapsing или Graphite, они будут автоматически преобразованы в соответствующий движок таблиц на основе SharedMergeTree.

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

Для конкретной таблицы вы можете проверить, какой движок таблиц был использован при создании, с помощью команды `SHOW CREATE TABLE`:

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

Поведение некоторых настроек значительно изменено:

- `insert_quorum` -- все операции вставки в SharedMergeTree являются кворумными (записываются в общее хранилище), поэтому данная настройка не требуется при использовании движка таблиц SharedMergeTree.
- `insert_quorum_parallel` -- все операции вставки в SharedMergeTree являются кворумными (записываются в общее хранилище), поэтому данная настройка не требуется при использовании движка таблиц SharedMergeTree.
- `select_sequential_consistency` -- не требует кворумных вставок, будет создавать дополнительную нагрузку на clickhouse-keeper при выполнении запросов `SELECT`


## Согласованность {#consistency}

SharedMergeTree обеспечивает более надёжную облегчённую согласованность по сравнению с ReplicatedMergeTree. При вставке данных в SharedMergeTree не требуется указывать такие настройки, как `insert_quorum` или `insert_quorum_parallel`. Вставки выполняются с кворумом, что означает, что метаданные сохраняются в ClickHouse-Keeper и реплицируются как минимум на кворум узлов ClickHouse-Keeper. Каждая реплика в кластере асинхронно получает новую информацию из ClickHouse-Keeper.

В большинстве случаев не следует использовать `select_sequential_consistency` или `SYSTEM SYNC REPLICA LIGHTWEIGHT`. Асинхронная репликация покрывает большинство сценариев и имеет очень низкую задержку. В редких случаях, когда необходимо полностью исключить чтение устаревших данных, следуйте этим рекомендациям в порядке предпочтения:

1. Если вы выполняете запросы в одной сессии или на одном узле для чтения и записи, использование `select_sequential_consistency` не требуется, поскольку реплика уже будет иметь самые актуальные метаданные.

2. Если вы выполняете запись на одну реплику, а чтение — с другой, можно использовать `SYSTEM SYNC REPLICA LIGHTWEIGHT`, чтобы принудительно заставить реплику получить метаданные из ClickHouse-Keeper.

3. Используйте `select_sequential_consistency` в качестве настройки в составе запроса.
