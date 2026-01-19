---
description: 'Документация по оператору ALTER'
sidebar_label: 'ALTER'
sidebar_position: 35
slug: /sql-reference/statements/alter/
title: 'ALTER'
doc_type: 'reference'
---

# ALTER \{#alter\}

Большинство запросов `ALTER TABLE` изменяют настройки таблицы или данные:

| Модификатор                                                                        |
|-------------------------------------------------------------------------------------|
| [COLUMN](/sql-reference/statements/alter/column.md)                         |
| [PARTITION](/sql-reference/statements/alter/partition.md)                   |
| [DELETE](/sql-reference/statements/alter/delete.md)                         |
| [UPDATE](/sql-reference/statements/alter/update.md)                         |
| [ORDER BY](/sql-reference/statements/alter/order-by.md)                     |
| [INDEX](/sql-reference/statements/alter/skipping-index.md)                  |
| [CONSTRAINT](/sql-reference/statements/alter/constraint.md)                 |
| [TTL](/sql-reference/statements/alter/ttl.md)                               |
| [STATISTICS](/sql-reference/statements/alter/statistics.md)                 |
| [APPLY DELETED MASK](/sql-reference/statements/alter/apply-deleted-mask.md) |

:::note
Большинство запросов `ALTER TABLE` поддерживаются только для таблиц типов [\*MergeTree](/engines/table-engines/mergetree-family/index.md), [Merge](/engines/table-engines/special/merge.md) и [Distributed](/engines/table-engines/special/distributed.md).
:::

Эти операторы `ALTER` изменяют представления:

| Оператор                                                                            | Описание                                                                              |
|-------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY QUERY](/sql-reference/statements/alter/view.md)     | Изменяет структуру [материализованного представления](/sql-reference/statements/create/view).       |

Эти операторы `ALTER` изменяют объекты, связанные с разграничением доступа на основе ролей:

| Оператор                                                                       |
|---------------------------------------------------------------------------------|
| [USER](/sql-reference/statements/alter/user.md)                         |
| [ROLE](/sql-reference/statements/alter/role.md)                         |
| [QUOTA](/sql-reference/statements/alter/quota.md)                       |
| [ROW POLICY](/sql-reference/statements/alter/row-policy.md)             |
| [SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile.md) |

| Оператор                                                                               | Описание                                                                                      |
|---------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY COMMENT](/sql-reference/statements/alter/comment.md)  | Добавляет, изменяет или удаляет комментарии к таблице, независимо от того, были ли они заданы ранее. |
| [ALTER NAMED COLLECTION](/sql-reference/statements/alter/named-collection.md) | Изменяет [именованные коллекции](/operations/named-collections.md).                      |

## Мутации \{#mutations\}

`ALTER`-запросы, предназначенные для изменения данных таблицы, реализованы с помощью механизма, называемого «мутациями», в первую очередь [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete.md) и [ALTER TABLE ... UPDATE](/sql-reference/statements/alter/update.md). Это асинхронные фоновые процессы, подобные слияниям в таблицах [MergeTree](/engines/table-engines/mergetree-family/index.md), которые создают новые «мутированные» версии частей данных.

Для таблиц `*MergeTree` мутации выполняются путем **перезаписи целых частей данных**. 
Атомарность не гарантируется — части заменяются мутированными, как только они готовы, и `SELECT`-запрос, который начал выполняться во время мутации, будет видеть данные как из уже мутированных частей, так и из частей, которые еще не были мутированы.

Мутации полностью упорядочены по времени их создания и применяются к каждой части в этом порядке. Мутации также частично упорядочены относительно запросов `INSERT INTO`: данные, которые были вставлены в таблицу до отправки мутации, будут мутированы, а данные, вставленные после этого, мутированы не будут. Обратите внимание, что мутации никоим образом не блокируют вставки.

Запрос мутации завершается немедленно после добавления записи о мутации (для реплицируемых таблиц — в ZooKeeper, для нереплицируемых — в файловую систему). Сама мутация выполняется асинхронно с использованием системных настроек профиля. Для отслеживания прогресса мутаций можно использовать таблицу [`system.mutations`](/operations/system-tables/mutations). Мутация, которая была успешно отправлена, продолжит выполняться даже при перезапуске серверов ClickHouse. Откатить мутацию после отправки невозможно, но если по какой-то причине мутация «зависла», ее можно отменить с помощью запроса [`KILL MUTATION`](/sql-reference/statements/kill.md/#kill-mutation).

Записи о завершенных мутациях не удаляются сразу (количество сохраняемых записей определяется параметром движка хранения `finished_mutations_to_keep`). Более старые записи о мутациях удаляются.

## Синхронность запросов ALTER \{#synchronicity-of-alter-queries\}

Для нереплицируемых таблиц все запросы `ALTER` выполняются синхронно. Для реплицируемых таблиц запрос лишь добавляет инструкции для соответствующих действий в `ZooKeeper`, а сами действия выполняются как можно скорее. Однако запрос может ожидать завершения этих действий на всех репликах.

Для запросов `ALTER`, которые создают мутации (например, включая, но не ограничиваясь `UPDATE`, `DELETE`, `MATERIALIZE INDEX`, `MATERIALIZE PROJECTION`, `MATERIALIZE COLUMN`, `APPLY DELETED MASK`, `CLEAR STATISTIC`, `MATERIALIZE STATISTIC`), синхронность определяется настройкой [mutations_sync](/operations/settings/settings.md/#mutations_sync).

Для других запросов `ALTER`, которые изменяют только метаданные, вы можете использовать настройку [alter_sync](/operations/settings/settings#alter_sync) для настройки ожидания.

Вы можете указать, как долго (в секундах) ожидать, пока неактивные реплики выполнят все запросы `ALTER`, с помощью настройки [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout).

:::note
Для всех запросов `ALTER`, если `alter_sync = 2` и некоторые реплики неактивны дольше времени, указанного в настройке `replication_wait_for_inactive_replica_timeout`, будет сгенерировано исключение `UNFINISHED`.
:::

## Связанные материалы \{#related-content\}

- Блог: [Обработка обновлений и удалений в ClickHouse](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
