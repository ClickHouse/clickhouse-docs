---
description: 'Руководство по использованию и настройке функции кэша запросов в ClickHouse'
sidebar_label: 'Кэш Запросов'
sidebar_position: 65
slug: /operations/query-cache
title: 'Кэш Запросов'
---


# Кэш Запросов

Кэш запросов позволяет выполнять `SELECT` запросы только один раз и обслуживать дальнейшие исполнения того же запроса непосредственно из кэша. 
В зависимости от типа запросов, это может существенно уменьшить задержку и потребление ресурсов сервера ClickHouse.

## Основы, Дизайн и Ограничения {#background-design-and-limitations}

Кэши запросов можно рассматривать как транзакционно согласованные или несогласованные.

- В транзакционно согласованных кэша, база данных аннулирует (отменяет) кэшированные результаты запросов, если результат `SELECT` запроса изменяется или потенциально изменяется. В ClickHouse операциями, которые изменяют данные, являются вставки/обновления/удаления в/из/из таблиц или слияния с помощью collapses. Транзакционно согласованный кэш особенно подходит для OLTP баз данных, например, [MySQL](https://dev.mysql.com/doc/refman/5.6/en/query-cache.html) (который удалил кэш запросов после версии 8.0) и [Oracle](https://docs.oracle.com/database/121/TGDBA/tune_result_cache.htm).
- В транзакционно несогласованных кэша, небольшие неточности в результатах запросов допускаются с допущением, что все записи в кэше имеют срок действия, по истечении которого они истекают (например, 1 минута), и что подлежащие данные изменяются незначительно в этом периоде. Этот подход в целом более подходит для OLAP баз данных. В качестве примера, когда транзакционно несогласованный кэш достаточно, рассмотрим ежечасный отчет по продажам в инструменте отчетности, который одновременно открывается несколькими пользователями. Данные о продажах изменяются, как правило, достаточно медленно, чтобы базе данных необходимо было вычислить отчет только один раз (представленный первым `SELECT` запросом). Последующие запросы могут обслуживаться непосредственно из кэша запросов. В этом примере разумный срок действия может составлять 30 минут.

Транзакционно несогласованный кэш традиционно предоставляется клиентскими инструментами или прокси-пакетами (например, [chproxy](https://www.chproxy.org/configuration/caching/)), взаимодействующими с базой данных. В результате одна и та же логика кэширования и конфигурация часто дублируются. С кэшем запросов ClickHouse логика кэширования перемещается на сторону сервера. Это уменьшает затраты на обслуживание и избегает избыточности.

## Настройки Конфигурации и Использование {#configuration-settings-and-usage}

:::note
В ClickHouse Cloud вы должны использовать [настройки уровня запросов](/operations/settings/query-level), чтобы редактировать настройки кэша запросов. Редактирование [настроек уровня конфигурации](/operations/configuration-files) в настоящее время не поддерживается.
:::

:::note
[clickhouse-local](utilities/clickhouse-local.md) выполняет только один запрос за раз. Поскольку кэширование результатов запроса не имеет смысла, кэш результатов запроса отключен в clickhouse-local.
:::

Настройка [use_query_cache](/operations/settings/settings#use_query_cache) может использоваться для управления тем, должен ли конкретный запрос или все запросы текущей сессии использовать кэш запросов. Например, первое выполнение запроса

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true;
```

сохранит результат запроса в кэше запросов. Последующие выполнения того же запроса (также с параметром `use_query_cache = true`) будут считывать вычисленный результат из кэша и немедленно возвращать его.

:::note
Настройка `use_query_cache` и все другие настройки, связанные с кэшем запросов, действуют только на отдельные `SELECT` операторы. В частности, результаты `SELECT` для представлений, созданных с помощью `CREATE VIEW AS SELECT [...] SETTINGS use_query_cache = true`, не кешируются, если оператор `SELECT` не выполняется с `SETTINGS use_query_cache = true`.
:::

Способ использования кэша можно настроить более детально с помощью настроек [enable_writes_to_query_cache](/operations/settings/settings#enable_writes_to_query_cache) и [enable_reads_from_query_cache](/operations/settings/settings#enable_reads_from_query_cache) (по умолчанию обе `true`). Первая настройка управляет тем, сохраняются ли результаты запросов в кэше, в то время как вторая настройка определяет, должна ли база данных пытаться извлечь результаты запросов из кэша. Например, следующий запрос будет использовать кэш только пассивно, т.е. пытаться читать из него, но не сохранять свой результат в него:

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, enable_writes_to_query_cache = false;
```

Для максимального контроля в целом рекомендуется задавать настройки `use_query_cache`, `enable_writes_to_query_cache` и `enable_reads_from_query_cache` только для конкретных запросов. Также можно включить кэширование на уровне пользователя или профиля (например, через `SET use_query_cache = true`), но следует помнить, что все `SELECT` запросы могут тогда возвращать кэшированные результаты.

Кэш запросов можно очистить с помощью оператора `SYSTEM DROP QUERY CACHE`. Содержимое кэша запросов отображается в системной таблице [system.query_cache](system-tables/query_cache.md). Количество попаданий и пропусков кэша запросов с момента запуска базы данных отображается как события "QueryCacheHits" и "QueryCacheMisses" в системной таблице [system.events](system-tables/events.md). Оба счетчика обновляются только для `SELECT` запросов, которые выполняются с настройкой `use_query_cache = true`, другие запросы не влияют на "QueryCacheMisses". Поле `query_cache_usage` в системной таблице [system.query_log](system-tables/query_log.md) показывает, для каждого выполненного запроса, был ли результат запроса записан в кэш или считан из него. Асинхронные метрики "QueryCacheEntries" и "QueryCacheBytes" в системной таблице [system.asynchronous_metrics](system-tables/asynchronous_metrics.md) показывают, сколько записей/байт в настоящее время содержит кэш запросов.

Кэш запросов существует один раз для каждого процесса сервера ClickHouse. Однако результаты кэша по умолчанию не разделяются между пользователями. Это можно изменить (см. ниже), но это не рекомендуется по соображениям безопасности.

Результаты запросов ссылаются в кэше запросов через [Абстрактное Синтаксическое Дерево (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree) их запроса. Это означает, что кэширование не зависит от регистра, например, `SELECT 1` и `select 1` рассматриваются как один и тот же запрос. Чтобы сделать сопоставление более естественным, все настройки на уровне запроса, связанные с кэшем запросов, удаляются из AST.

Если запрос был прерван из-за исключения или отмены пользователем, то ни одна запись не записывается в кэш запросов.

Размер кэша запросов в байтах, максимальное количество записей кэша и максимальный размер отдельных записей кэша (в байтах и в записях) можно настроить с помощью различных [параметров конфигурации сервера](/operations/server-configuration-parameters/settings#query_cache).

```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```

Также возможно ограничить использование кэша отдельными пользователями с помощью [профилей настроек](settings/settings-profiles.md) и [ограничений настроек](settings/constraints-on-settings.md). Более конкретно, вы можете ограничить максимальное количество памяти (в байтах), которую пользователь может выделить в кэше запросов, и максимальное количество сохраняемых результатов запросов. Для этого сначала задайте параметры
[query_cache_max_size_in_bytes](/operations/settings/settings#query_cache_max_size_in_bytes) и
[query_cache_max_entries](/operations/settings/settings#query_cache_max_entries) в профиле пользователя в `users.xml`, затем установите обе настройки в режим только для чтения:

```xml
<profiles>
    <default>
        <!-- Максимальный размер кэша в байтах для пользователя/профиля 'default' -->
        <query_cache_max_size_in_bytes>10000</query_cache_max_size_in_bytes>
        <!-- Максимальное количество результатов запросов SELECT, сохраненных в кэше для пользователя/профиля 'default' -->
        <query_cache_max_entries>100</query_cache_max_entries>
        <!-- Сделайте обе настройки только для чтения, чтобы пользователь не мог их изменять -->
        <constraints>
            <query_cache_max_size_in_bytes>
                <readonly/>
            </query_cache_max_size_in_bytes>
            <query_cache_max_entries>
                <readonly/>
            </query_cache_max_entries>
        </constraints>
    </default>
</profiles>
```

Чтобы определить, как долго должен выполняться запрос, чтобы его результат можно было закэшировать, вы можете использовать настройку
[query_cache_min_query_duration](/operations/settings/settings#query_cache_min_query_duration). Например, результат запроса

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, query_cache_min_query_duration = 5000;
```

закэшируется только если запрос выполняется дольше 5 секунд. Также возможно указать, как часто запрос должен выполняться, чтобы его результат был закэширован - для этого используйте настройку [query_cache_min_query_runs](/operations/settings/settings#query_cache_min_query_runs).

Записи в кэше запросов становятся устаревшими после определенного времени (время жизни). По умолчанию этот период составляет 60 секунд, но можно указать другое значение на уровне сессии, профиля или запроса с помощью настройки [query_cache_ttl](/operations/settings/settings#query_cache_ttl). Кэш запросов удаляет записи "лениво", т.е. когда запись становится устаревшей, она не удаляется сразу из кэша. Вместо этого, когда новая запись должна быть вставлена в кэш запросов, база данных проверяет, достаточно ли свободного места в кэше для новой записи. Если это не так, база данных пытается удалить все устаревшие записи. Если в кэше все еще недостаточно свободного места, новая запись не вставляется.

Записи в кэше запросов по умолчанию сжимаются. Это уменьшает общее потребление памяти за счет более медленных записей в кэш запросов и считываний из него. Чтобы отключить сжатие, используйте настройку [query_cache_compress_entries](/operations/settings/settings#query_cache_compress_entries).

Иногда полезно держать множество результатов для одного и того же запроса в кэше. Это можно достичь с помощью настройки
[query_cache_tag](/operations/settings/settings#query_cache_tag), которая выступает в роли метки (или пространства имен) для записей кэша запросов. Кэш запросов считает результаты одного и того же запроса с разными метками разными.

Пример создания трех различных записей кэша запросов для одного и того же запроса:

```sql
SELECT 1 SETTINGS use_query_cache = true; -- query_cache_tag неявно '' (пустая строка)
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 1';
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 2';
```

Чтобы удалить только записи с меткой `tag` из кэша запросов, вы можете использовать оператор `SYSTEM DROP QUERY CACHE TAG 'tag'`.

ClickHouse считывает данные из таблицы блоками по [max_block_size](/operations/settings/settings#max_block_size) строк. Из-за фильтрации, агрегации и т.д. блоки результатов, как правило, значительно меньше 'max_block_size', но также есть и случаи, когда они значительно больше. Настройка [query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results) (включена по умолчанию) управляет тем, следует ли сжать результатные блоки (если они крошечные) или разбить их (если они большие) на блоки размером 'max_block_size' перед вставкой в кэш результатов запроса. Это уменьшает производительность записей в кэш запросов, но улучшает коэффициент сжатия записей кэша и обеспечивает более естественную гранулярность блоков, когда результаты запросов позже обслуживаются из кэша запросов.

В результате, кэш запросов хранит для каждого запроса несколько (частичных) 
результатных блоков. Хотя это поведение является хорошим значением по умолчанию, его можно подавить с помощью настройки 
[query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results).

Кроме того, результаты запросов с недетерминированными функциями по умолчанию не кешируются. Такие функции включают
- функции для доступа к словарям: [`dictGet()`](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull) и т.д.
- [пользовательские функции](../sql-reference/statements/create/function.md) без тега `<deterministic>true</deterministic>` в их XML-определении,
- функции, которые возвращают текущую дату или время: [`now()`](../sql-reference/functions/date-time-functions.md#now),
  [`today()`](../sql-reference/functions/date-time-functions.md#today),
  [`yesterday()`](../sql-reference/functions/date-time-functions.md#yesterday) и т.д.,
- функции, которые возвращают случайные значения: [`randomString()`](../sql-reference/functions/random-functions.md#randomString),
  [`fuzzBits()`](../sql-reference/functions/random-functions.md#fuzzBits) и т.д.,
- функции, результат которых зависит от размера и порядка или внутренних фрагментов, используемых для обработки запроса:
  [`nowInBlock()`](../sql-reference/functions/date-time-functions.md#nowInBlock) и т.д.,
  [`rowNumberInBlock()`](../sql-reference/functions/other-functions.md#rowNumberInBlock),
  [`runningDifference()`](../sql-reference/functions/other-functions.md#runningDifference),
  [`blockSize()`](../sql-reference/functions/other-functions.md#blockSize) и т.д.,
- функции, которые зависят от окружающей среды: [`currentUser()`](../sql-reference/functions/other-functions.md#currentUser),
  [`queryID()`](/sql-reference/functions/other-functions#queryid),
  [`getMacro()`](../sql-reference/functions/other-functions.md#getMacro) и т.д.

Чтобы принудительно кешировать результаты запросов с недетерминированными функциями, используйте настройку
[query_cache_nondeterministic_function_handling](/operations/settings/settings#query_cache_nondeterministic_function_handling).

Результаты запросов, которые включают системные таблицы (например, [system.processes](system-tables/processes.md) или
[information_schema.tables](system-tables/information_schema.md)), по умолчанию не кешируются. Чтобы принудительно кешировать результаты запросов с системными таблицами, используйте настройку [query_cache_system_table_handling](/operations/settings/settings#query_cache_system_table_handling).

Наконец, записи в кэше запросов не разделяются между пользователями по соображениям безопасности. Например, пользователь A не должен иметь возможность обойти политику строк на таблицу, выполняя тот же запрос, что и другой пользователь B, для которого такая политика не существует. Тем не менее, если это необходимо, записи кэша могут быть помечены как доступные для других пользователей (т.е. совместно используемые) с помощью настройки
[query_cache_share_between_users](/operations/settings/settings#query_cache_share_between_users).

## Связанный Контент {#related-content}

- Блог: [Представляем кэш запросов ClickHouse](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)
