---
slug: /sql-reference/statements/alter/
sidebar_position: 35
sidebar_label: ALTER
---


# ALTER

Большинство запросов `ALTER TABLE` изменяют настройки или данные таблицы:

| Модификатор                                                                          |
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
Большинство запросов `ALTER TABLE` поддерживаются только для [\*MergeTree](/engines/table-engines/mergetree-family/index.md), [Merge](/engines/table-engines/special/merge.md) и [Distributed](/engines/table-engines/special/distributed.md) таблиц.
:::

Эти операторы `ALTER` управляют представлениями:

| Оператор                                                                            | Описание                                                                               |
|-------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY QUERY](/sql-reference/statements/alter/view.md)   | Изменяет структуру [Materialized view](/sql-reference/statements/create/view).                                 |
| [ALTER LIVE VIEW](/sql-reference/statements/alter/view#alter-live-view-statement) | Обновляет [Live view](/sql-reference/statements/create/view.md/#live-view).           |

Эти операторы `ALTER` изменяют сущности, связанные с управлением доступом на основе ролей:

| Оператор                                                                         |
|----------------------------------------------------------------------------------|
| [USER](/sql-reference/statements/alter/user.md)                       |
| [ROLE](/sql-reference/statements/alter/role.md)                       |
| [QUOTA](/sql-reference/statements/alter/quota.md)                     |
| [ROW POLICY](/sql-reference/statements/alter/row-policy.md)           |
| [SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile.md) |

| Оператор                                                                               | Описание                                                                                  |
|---------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| [ALTER TABLE ... MODIFY COMMENT](/sql-reference/statements/alter/comment.md)  | Добавляет, изменяет или удаляет комментарии к таблице, независимо от того, были ли они установлены ранее или нет. |
| [ALTER NAMED COLLECTION](/sql-reference/statements/alter/named-collection.md) | Изменяет [Named Collections](/operations/named-collections.md).                   |

## Mutations {#mutations}

Запросы `ALTER`, предназначенные для изменения данных таблицы, реализованы с помощью механизма, называемого "мутациями", наиболее заметно [ALTER TABLE ... DELETE](/sql-reference/statements/alter/delete.md) и [ALTER TABLE ... UPDATE](/sql-reference/statements/alter/update.md). Они являются асинхронными фоновыми процессами, аналогичными объединениям в таблицах [MergeTree](/engines/table-engines/mergetree-family/index.md), которые создают новые "мутивированные" версии частей.

Для таблиц `*MergeTree` мутации выполняются путем **перезаписи целых частей данных**. 
Об атомарности речи не идет — части заменяются на мутивированные части сразу, как только они готовы, а `SELECT` запрос, который начал выполняться во время мутации, увидит данные из частей, которые уже были мутивированы, вместе с данными из частей, которые еще не были мутивированы.

Мутации полностью упорядочены по порядку создания и применяются к каждой части в этом порядке. Мутации также частично упорядочены с запросами `INSERT INTO`: данные, которые были вставлены в таблицу до подачи мутации, будут мутивированы, а данные, вставленные после, не будут мутивированы. Обратите внимание, что мутации не блокируют вставки никаким образом.

Запрос мутации возвращает результат сразу после добавления записи мутации (в случае реплицированных таблиц — в ZooKeeper, для нереплицированных таблиц — в файловую систему). Сама мутация выполняется асинхронно с использованием настроек системного профиля. Чтобы отслеживать прогресс мутаций, вы можете использовать таблицу [`system.mutations`](/operations/system-tables/mutations). Мутация, которая была успешно подана, продолжит выполняться, даже если серверы ClickHouse перезапустятся. Вернуть мутацию назад после ее подачи невозможно, но если мутация застряла по какой-то причине, ее можно отменить запросом [`KILL MUTATION`](/sql-reference/statements/kill.md/#kill-mutation).

Записи для завершенных мутаций не удаляются сразу (число сохраненных записей определяется параметром хранилища `finished_mutations_to_keep`). Более старые записи мутаций удаляются.

## Synchronicity of ALTER Queries {#synchronicity-of-alter-queries}

Для нереплицированных таблиц все запросы `ALTER` выполняются синхронно. Для реплицируемых таблиц запрос просто добавляет инструкции для соответствующих действий в `ZooKeeper`, а сами действия выполняются как можно скорее. Однако запрос может ожидать завершения этих действий на всех репликах.

Для запросов `ALTER`, которые создают мутации (например: включая, но не ограничиваясь, `UPDATE`, `DELETE`, `MATERIALIZE INDEX`, `MATERIALIZE PROJECTION`, `MATERIALIZE COLUMN`, `APPLY DELETED MASK`, `CLEAR STATISTIC`, `MATERIALIZE STATISTIC`), синхронность определяется настройкой [mutations_sync](/operations/settings/settings.md/#mutations_sync).

Для других запросов `ALTER`, которые только изменяют метаданные, вы можете использовать настройку [alter_sync](/operations/settings/settings#alter_sync) для настройки ожидания.

Вы можете указать, как долго (в секундах) ожидать выполнение всех запросов `ALTER` для неактивных реплик с помощью настройки [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout).

:::note
Для всех запросов `ALTER`, если `alter_sync = 2` и некоторые реплики не активны более времени, указанного в настройке `replication_wait_for_inactive_replica_timeout`, тогда выбрасывается исключение `UNFINISHED`.
:::

## Related content {#related-content}

- Blog: [Обработка обновлений и удалений в ClickHouse](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
