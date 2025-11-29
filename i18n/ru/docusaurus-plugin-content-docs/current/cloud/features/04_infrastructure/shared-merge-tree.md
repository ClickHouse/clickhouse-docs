---
slug: /cloud/reference/shared-merge-tree
sidebar_label: 'SharedMergeTree'
title: 'SharedMergeTree'
keywords: ['SharedMergeTree']
description: 'Описывает движок таблицы SharedMergeTree'
doc_type: 'reference'
---

import shared_merge_tree from '@site/static/images/cloud/reference/shared-merge-tree-1.png';
import shared_merge_tree_2 from '@site/static/images/cloud/reference/shared-merge-tree-2.png';
import Image from '@theme/IdealImage';


# Движок таблиц SharedMergeTree {#sharedmergetree-table-engine}

Семейство движков таблиц SharedMergeTree — это облачный (cloud‑native) аналог движков ReplicatedMergeTree, оптимизированный для работы поверх общего хранилища (например, Amazon S3, Google Cloud Storage, MinIO, Azure Blob Storage). Для каждого конкретного типа движка MergeTree существует соответствующий SharedMergeTree, то есть ReplacingSharedMergeTree заменяет ReplacingReplicatedMergeTree.

Семейство движков таблиц SharedMergeTree лежит в основе ClickHouse Cloud. Конечному пользователю не нужно ничего менять, чтобы начать использовать семейство движков SharedMergeTree вместо движков на основе ReplicatedMergeTree. Оно предоставляет следующие дополнительные преимущества:

- Более высокая пропускная способность вставки
- Улучшенная пропускная способность фоновых слияний
- Улучшенная пропускная способность мутаций
- Более быстрые операции масштабирования вверх и вниз
- Более «лёгкая» сильная согласованность для запросов `SELECT`

Существенное улучшение, которое приносит SharedMergeTree, заключается в более глубоком разделении вычислений и хранилища по сравнению с ReplicatedMergeTree. Ниже показано, как ReplicatedMergeTree разделяет вычисления и хранилище:

<Image img={shared_merge_tree} alt="Схема ReplicatedMergeTree" size="md"  />

Как видно, хотя данные ReplicatedMergeTree и хранятся в объектном хранилище, метаданные по-прежнему находятся на каждом из серверов ClickHouse. Это означает, что для каждой реплицируемой операции метаданные также должны быть реплицированы на все реплики.

<Image img={shared_merge_tree_2} alt="Схема ReplicatedMergeTree с метаданными" size="md"  />

В отличие от ReplicatedMergeTree, SharedMergeTree не требует, чтобы реплики напрямую обменивались данными друг с другом. Вместо этого весь обмен происходит через общее хранилище и clickhouse-keeper. SharedMergeTree реализует асинхронную репликацию без лидера и использует clickhouse-keeper для координации и хранения метаданных. Это означает, что метаданные не нужно реплицировать при изменении масштаба сервиса. Это приводит к более быстрой репликации, выполнению мутаций, слияниям и операциям масштабирования. SharedMergeTree поддерживает сотни реплик для каждой таблицы, что делает возможным динамическое масштабирование без шардов. В ClickHouse Cloud используется подход распределённого выполнения запросов для задействования большего количества вычислительных ресурсов на один запрос.



## Интроспекция {#introspection}

Большинство системных таблиц, используемых для интроспекции ReplicatedMergeTree, доступны и для SharedMergeTree, за исключением `system.replication_queue` и `system.replicated_fetches`, так как в SharedMergeTree нет репликации данных и метаданных. Однако для этих двух таблиц в SharedMergeTree есть соответствующие альтернативы.

**system.virtual_parts**

Эта таблица является альтернативой `system.replication_queue` для SharedMergeTree. Она хранит информацию об актуальном наборе текущих частей (parts), а также о будущих частях, находящихся в обработке, таких как слияния (merges), мутации и удалённые партиции.

**system.shared_merge_tree_fetches**

Эта таблица является альтернативой `system.replicated_fetches` для SharedMergeTree. Она содержит информацию о текущих выполняющихся операциях выборки (fetches) первичных ключей и контрольных сумм в память.



## Включение SharedMergeTree {#enabling-sharedmergetree}

`SharedMergeTree` включён по умолчанию.

Для сервисов, которые поддерживают движок таблиц SharedMergeTree, ничего не нужно включать вручную. Вы можете создавать таблицы так же, как делали это раньше, и будет автоматически использован основанный на SharedMergeTree движок таблиц, соответствующий движку, указанному в вашем запросе CREATE TABLE.

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ENGINE = MergeTree
ORDER BY key
```

Это создаст таблицу `my_table`, используя табличный движок SharedMergeTree.

Вам не нужно указывать `ENGINE=MergeTree`, поскольку в ClickHouse Cloud задано значение `default_table_engine=MergeTree`. Следующий запрос идентичен приведённому выше запросу.

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ORDER BY key
```

Если вы используете таблицы ReplacingMergeTree, CollapsingMergeTree, AggregatingMergeTree, SummingMergeTree, VersionedCollapsingMergeTree или GraphiteMergeTree, они будут автоматически преобразованы в соответствующий табличный движок на основе SharedMergeTree.

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

Для конкретной таблицы вы можете проверить, какой движок таблицы был использован в операторе `CREATE TABLE`, выполнив команду `SHOW CREATE TABLE`:

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

Поведение некоторых настроек значительно изменилось:

- `insert_quorum` -- все вставки в SharedMergeTree являются кворумными вставками (записываются в общее хранилище), поэтому эта настройка не требуется при использовании движка таблицы SharedMergeTree.
- `insert_quorum_parallel` -- все вставки в SharedMergeTree являются кворумными вставками (записываются в общее хранилище), поэтому эта настройка не требуется при использовании движка таблицы SharedMergeTree.
- `select_sequential_consistency` -- не требует кворумных вставок, приведёт к дополнительной нагрузке на clickhouse-keeper при выполнении запросов `SELECT`



## Согласованность {#consistency}

SharedMergeTree обеспечивает более сильные (lightweight) гарантии согласованности, чем ReplicatedMergeTree. При вставке в SharedMergeTree вам не нужно указывать настройки, такие как `insert_quorum` или `insert_quorum_parallel`. Вставки являются кворумными, то есть метаданные будут сохранены в ClickHouse-Keeper, и эти метаданные реплицируются как минимум на кворум узлов ClickHouse-Keeper. Каждая реплика в вашем кластере будет асинхронно получать новую информацию из ClickHouse-Keeper.

В большинстве случаев вам не следует использовать `select_sequential_consistency` или `SYSTEM SYNC REPLICA LIGHTWEIGHT`. Асинхронная репликация покрывает большинство сценариев и имеет очень малую задержку. В редких случаях, когда вам критично необходимо полностью предотвратить чтение устаревших данных, следуйте этим рекомендациям в порядке приоритета:

1. Если вы выполняете запросы в одной и той же сессии или на одном и том же узле для чтения и записи, использовать `select_sequential_consistency` не нужно, так как ваша реплика уже будет иметь самые свежие метаданные.

2. Если вы пишете в одну реплику, а читаете с другой, вы можете использовать `SYSTEM SYNC REPLICA LIGHTWEIGHT`, чтобы принудительно инициировать получение метаданных из ClickHouse-Keeper на реплике.

3. Используйте `select_sequential_consistency` как настройку в составе вашего запроса.
