---
'slug': '/cloud/reference/shared-merge-tree'
'sidebar_label': 'SharedMergeTree'
'title': 'SharedMergeTree'
'keywords':
- 'SharedMergeTree'
'description': 'Описание движка таблиц SharedMergeTree'
'doc_type': 'reference'
---
import shared_merge_tree from '@site/static/images/cloud/reference/shared-merge-tree-1.png';
import shared_merge_tree_2 from '@site/static/images/cloud/reference/shared-merge-tree-2.png';
import Image from '@theme/IdealImage';


# SharedMergeTree движок таблиц

Семейство движков таблиц SharedMergeTree является облачным заменителем движков ReplicatedMergeTree, оптимизированным для работы на базе общего хранилища (например, Amazon S3, Google Cloud Storage, MinIO, Azure Blob Storage). Для каждого конкретного типа движка MergeTree существует аналог SharedMergeTree, т.е. ReplacingSharedMergeTree заменяет ReplacingReplicatedMergeTree.

Семейство движков таблиц SharedMergeTree поддерживает ClickHouse Cloud. Для конечного пользователя ничего не нужно изменять, чтобы начать использовать семейство движков SharedMergeTree вместо движков на основе ReplicatedMergeTree. Оно предоставляет следующие дополнительные преимущества:

- Более высокая пропускная способность вставок
- Улучшенная пропускная способность фоновых слияний
- Улучшенная пропускная способность мутаций
- Более быстрые операции масштабирования вверх и вниз
- Более легкое строгое согласование для запросов выборки

Значительным улучшением, которое приносит SharedMergeTree, является более глубокое разделение вычислений и хранения по сравнению с ReplicatedMergeTree. Ниже показано, как ReplicatedMergeTree разделяет вычисления и хранение:

<Image img={shared_merge_tree} alt="Схема ReplicatedMergeTree" size="md"  />

Как видно, хотя данные, хранящиеся в ReplicatedMergeTree, находятся в объектном хранилище, метаданные по-прежнему находятся на каждом из серверов ClickHouse. Это означает, что для каждой реплицированной операции метаданные также необходимо реплицировать на всех репликах.

<Image img={shared_merge_tree_2} alt="Схема ReplicatedMergeTree с метаданными" size="md"  />

В отличие от ReplicatedMergeTree, SharedMergeTree не требует, чтобы реплики общались друг с другом. Вместо этого вся связь происходит через общее хранилище и clickhouse-keeper. SharedMergeTree реализует асинхронную репликацию без лидера и использует clickhouse-keeper для координации и хранения метаданных. Это означает, что метаданные не нужно реплицировать по мере масштабирования вашего сервиса. Это приводит к более быстрой репликации, мутациям, слияниям и операциям масштабирования. SharedMergeTree позволяет иметь сотни реплик для каждой таблицы, что делает возможным динамическое масштабирование без шардирования. В ClickHouse Cloud используется подход распределенного выполнения запросов, чтобы задействовать больше вычислительных ресурсов для запроса.

## Интроспекция {#introspection}

Большинство системных таблиц, используемых для интроспекции ReplicatedMergeTree, существуют для SharedMergeTree, кроме `system.replication_queue` и `system.replicated_fetches`, так как в данном случае нет репликации данных и метаданных. Однако для этих двух таблиц у SharedMergeTree есть соответствующие аналоги.

**system.virtual_parts**

Эта таблица служит альтернативой `system.replication_queue` для SharedMergeTree. Она хранит информацию о самом последнем наборе текущих частей, а также о будущих частях в процессе, таких как слияния, мутации и удаленные партиции.

**system.shared_merge_tree_fetches**

Эта таблица является альтернативой `system.replicated_fetches` для SharedMergeTree. Она содержит информацию о текущих операциях выборки первичных ключей и контрольных сумм в память.

## Включение SharedMergeTree {#enabling-sharedmergetree}

`SharedMergeTree` включен по умолчанию.

Для сервисов, которые поддерживают движок таблиц SharedMergeTree, вам не нужно вручную включать что-либо. Вы можете создавать таблицы так же, как и раньше, и он автоматически будет использовать движок таблиц на основе SharedMergeTree, соответствующий тому движку, который указан в вашем запросе CREATE TABLE.

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ENGINE = MergeTree
ORDER BY key
```

Это создаст таблицу `my_table` с использованием движка таблиц SharedMergeTree.

Вам не нужно указывать `ENGINE=MergeTree`, так как `default_table_engine=MergeTree` в ClickHouse Cloud. Следующий запрос идентичен приведенному выше.

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ORDER BY key
```

Если вы используете Replacing, Collapsing, Aggregating, Summing, VersionedCollapsing или таблицы Graphite MergeTree, они автоматически будут преобразованы в соответствующий движок таблиц на основе SharedMergeTree.

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

Для данной таблицы вы можете проверить, какой движок таблиц был использован в операторе `CREATE TABLE`, с помощью `SHOW CREATE TABLE`:
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

Некоторые настройки изменили свое поведение существенно:

- `insert_quorum` -- все вставки в SharedMergeTree являются кворумными вставками (записываемыми в общее хранилище), поэтому эта настройка не нужна при использовании движка таблиц SharedMergeTree.
- `insert_quorum_parallel` -- все вставки в SharedMergeTree являются кворумными вставками (записываемыми в общее хранилище), поэтому эта настройка не нужна при использовании движка таблиц SharedMergeTree.
- `select_sequential_consistency` -- не требует кворумных вставок и вызовет дополнительную нагрузку на clickhouse-keeper при запросах `SELECT`.

## Согласованность {#consistency}

SharedMergeTree обеспечивает лучшую легковесную согласованность, чем ReplicatedMergeTree. При вставке в SharedMergeTree вам не нужно указывать такие настройки, как `insert_quorum` или `insert_quorum_parallel`. Вставки являются кворумными, что означает, что метаданные будут храниться в ClickHouse-Keeper, и метаданные реплицируются как минимум на кворум ClickHouse-keeper'ов. Каждая реплика в вашем кластере будет асинхронно извлекать новую информацию из ClickHouse-Keeper.

В большинстве случаев вам не следует использовать `select_sequential_consistency` или `SYSTEM SYNC REPLICA LIGHTWEIGHT`. Асинхронная репликация должна покрывать большинство сценариев и имеет очень низкую задержку. В редких случаях, когда вам абсолютно необходимо предотвратить устаревшие чтения, следуйте этим рекомендациям в порядке предпочтения:

1. Если вы выполняете ваши запросы в одной сессии или на одном узле для ваших чтений и записей, использование `select_sequential_consistency` не требуется, потому что ваша реплика уже будет иметь самые последние метаданные.

2. Если вы записываете в одну реплику и читаете из другой, вы можете использовать `SYSTEM SYNC REPLICA LIGHTWEIGHT`, чтобы заставить реплику извлечь метаданные из ClickHouse-Keeper.

3. Используйте `select_sequential_consistency` в качестве настройки в рамках вашего запроса.