---
slug: '/operations/query-cache'
sidebar_label: 'Кэш Запросов'
sidebar_position: 65
description: 'Руководство по использованию и настройке функции кэша запросов в ClickHouse'
title: 'Кэш Запросов'
doc_type: guide
---
# Кэш запросов

Кэш запросов позволяет вычислять запросы `SELECT` всего один раз и обслуживать последующие выполнения одного и того же запроса напрямую из кэша. В зависимости от типа запросов это может значительно сократить задержки и потребление ресурсов сервера ClickHouse.

## Фон, проектирование и ограничения {#background-design-and-limitations}

Кэши запросов в общем можно рассматривать как транзакционно согласованные или несогласованные.

- В транзакционно согласованных кэшах база данных аннулирует (изначально удаляет) кэшированные результаты запросов, если результат запроса `SELECT` изменяется или потенциально может измениться. В ClickHouse операциями, которые изменяют данные, являются вставки/обновления/удаления в/из/из таблиц или слияния коллапса. Транзакционно согласованное кэширование особенно подходит для OLTP баз данных, например, [MySQL](https://dev.mysql.com/doc/refman/5.6/en/query-cache.html) (который удалил кэш запросов после версии 8.0) и [Oracle](https://docs.oracle.com/database/121/TGDBA/tune_result_cache.htm).
- В транзакционно несогласованных кэшах небольшие неточности в результатах запросов принимаются при условии, что всем записям кэша назначен срок действия, после которого они истекают (например, 1 минута), и что базовые данные изменяются лишь незначительно в течение этого периода. Этот подход в целом более подходящ для OLAP баз данных. Например, рассмотрим почасовой отчет о продажах в инструменте отчетности, который одновременно открывается несколькими пользователями. Данные о продажах обычно изменяются достаточно медленно, чтобы базе данных нужно было вычислить отчет всего один раз (представленный первым запросом `SELECT`). Последующие запросы могут быть обслужены напрямую из кэша запросов. В этом примере разумным периодом действия может быть 30 минут.

Транзакционно несогласованное кэширование традиционно предоставляется клиентскими инструментами или пакетами прокси (например, [chproxy](https://www.chproxy.org/configuration/caching/)), взаимодействующими с базой данных. В результате одна и та же логика кэширования и конфигурация часто дублируются. С кэшем запросов ClickHouse логика кэширования перемещается на сторону сервера. Это уменьшает усилия по обслуживанию и избегает избыточности.

## Настройки конфигурации и использование {#configuration-settings-and-usage}

:::note
В ClickHouse Cloud вы должны использовать [настройки уровня запроса](/operations/settings/query-level), чтобы отредактировать настройки кэша запросов. В данный момент редактирование [настроек уровня конфигурации](/operations/configuration-files) не поддерживается.
:::

:::note
[clickhouse-local](utilities/clickhouse-local.md) выполняет один запрос за раз. Поскольку кэширование результатов запроса не имеет смысла, кэш результатов запроса отключен в clickhouse-local.
:::

Настройка [use_query_cache](/operations/settings/settings#use_query_cache) может использоваться для управления тем, должен ли конкретный запрос или все запросы текущей сессии использовать кэш запросов. Например, первое выполнение запроса

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true;
```

сохранит результат запроса в кэше запросов. Последующие выполнения того же запроса (также с параметром `use_query_cache = true`) будут читать вычисленный результат из кэша и немедленно возвращать его.

:::note
Настройка `use_query_cache` и все остальные настройки, связанные с кэшем запросов, принимают эффект только для одиночных операторов `SELECT`. В частности, результаты `SELECT` для представлений, созданных с помощью `CREATE VIEW AS SELECT [...] SETTINGS use_query_cache = true`, не кэшируются, если оператор `SELECT` не выполняется с `SETTINGS use_query_cache = true`.
:::

Способ использования кэша можно настроить более подробно с помощью настроек [enable_writes_to_query_cache](/operations/settings/settings#enable_writes_to_query_cache) и [enable_reads_from_query_cache](/operations/settings/settings#enable_reads_from_query_cache) (обе по умолчанию равны `true`). Первая настройка управляет тем, будут ли результаты запроса храниться в кэше, в то время как вторая настройка определяет, должен ли сервер пытаться извлекать результаты запроса из кэша. Например, следующий запрос будет использовать кэш лишь пассивно, то есть попытаться прочитать его, но не сохранять его результат:

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, enable_writes_to_query_cache = false;
```

Для максимального контроля обычно рекомендуется задавать настройки `use_query_cache`, `enable_writes_to_query_cache` и `enable_reads_from_query_cache` только для конкретных запросов. Также возможно включить кэширование на уровне пользователя или профиля (например, через `SET use_query_cache = true`), но следует помнить, что все запросы `SELECT` могут в этом случае возвращать кэшированные результаты.

Кэш запросов можно очистить с помощью оператора `SYSTEM DROP QUERY CACHE`. Содержимое кэша запросов отображается в системной таблице [system.query_cache](system-tables/query_cache.md). Количество попаданий и промахов кэша запросов с момента старта базы данных отображается как события "QueryCacheHits" и "QueryCacheMisses" в системной таблице [system.events](system-tables/events.md). Оба счетчика обновляются только для запросов `SELECT`, которые выполняются с настройкой `use_query_cache = true`, другие запросы не влияют на "QueryCacheMisses". Поле `query_cache_usage` в системной таблице [system.query_log](system-tables/query_log.md) показывает для каждого выполненного запроса, записан ли результат запроса в кэш или был извлечен из кэша. Метрики `QueryCacheEntries` и `QueryCacheBytes` в системной таблице [system.metrics](system-tables/metrics.md) показывают, сколько записей / байт в данный момент содержит кэш запросов.

Кэш запросов существует один раз для каждого процесса сервера ClickHouse. Однако результаты кэша по умолчанию не делятся между пользователями. Это можно изменить (см. ниже), но делать этого не рекомендуется по соображениям безопасности.

Результаты запросов в кэше ссылочно представлены [Абстрактным синтаксическим деревом (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree) их запроса. Это означает, что кэширование не зависит от регистра букв, например, `SELECT 1` и `select 1` рассматриваются как один и тот же запрос. Чтобы сделать соответствие более естественным, все настройки уровня запросов, относящиеся к кэшу запросов, удаляются из AST.

Если запрос был прерван из-за исключения или отмены пользователем, никакая запись не будет записана в кэш запросов.

Размер кэша запросов в байтах, максимальное количество записей в кэше и максимальный размер отдельных записей кэша (в байтах и в
записях) можно настроить с помощью различных [параметров конфигурации сервера](/operations/server-configuration-parameters/settings#query_cache).

```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```

Также возможно ограничить использование кэша отдельными пользователями с помощью [профилей настроек](settings/settings-profiles.md) и [ограничений настроек](settings/constraints-on-settings.md). Более конкретно, вы можете ограничить максимальное количество памяти (в байтах), которое пользователь может выделить в кэше запросов, и максимальное количество хранимых результатов запросов. Для этого сначала задайте конфигурации [query_cache_max_size_in_bytes](/operations/settings/settings#query_cache_max_size_in_bytes) и [query_cache_max_entries](/operations/settings/settings#query_cache_max_entries) в профиле пользователя в `users.xml`, затем сделайте обе настройки только для чтения:

```xml
<profiles>
    <default>
        <!-- The maximum cache size in bytes for user/profile 'default' -->
        <query_cache_max_size_in_bytes>10000</query_cache_max_size_in_bytes>
        <!-- The maximum number of SELECT query results stored in the cache for user/profile 'default' -->
        <query_cache_max_entries>100</query_cache_max_entries>
        <!-- Make both settings read-only so the user cannot change them -->
        <constraints>
            <query_cache_max_size_in_bytes>
                <readonly/>
            </query_cache_max_size_in_bytes>
            <query_cache_max_entries>
                <readonly/>
            <query_cache_max_entries>
        </constraints>
    </default>
</profiles>
```

Чтобы определить, как долго должен выполняться запрос, чтобы его результат можно было закэшировать, вы можете использовать настройку [query_cache_min_query_duration](/operations/settings/settings#query_cache_min_query_duration). Например, результат запроса

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, query_cache_min_query_duration = 5000;
```

кэшируется только в том случае, если запрос выполняется дольше 5 секунд. Также возможно указать, как часто запрос должен выполняться, чтобы его результат кэшировался — для этого используйте настройку [query_cache_min_query_runs](/operations/settings/settings#query_cache_min_query_runs).

Записи в кэше запросов становятся устаревшими после определенного времени (время жизни). По умолчанию этот период составляет 60 секунд, но можно указать другое значение на уровне сессии, профиля или запроса с помощью настройки [query_cache_ttl](/operations/settings/settings#query_cache_ttl). Кэш запросов выбрасывает записи "лениво", то есть когда запись становится устаревшей, она не удаляется сразу из кэша. Вместо этого, когда новая запись должна быть вставлена в кэш запросов, база данных проверяет, достаточно ли в кэше свободного места для новой записи. Если этого нет, база данных пытается удалить все устаревшие записи. Если в кэше по-прежнему недостаточно свободного места, новая запись не вставляется.

Записи в кэше запросов по умолчанию сжимаются. Это снижает общее потребление памяти за счет более медленных записей в кэш запросов и чтений из него. Чтобы отключить сжатие, используйте настройку [query_cache_compress_entries](/operations/settings/settings#query_cache_compress_entries).

Иногда бывает полезно сохранить несколько результатов для одного и того же запроса в кэше. Это можно достичь с помощью настройки [query_cache_tag](/operations/settings/settings#query_cache_tag), которая действует как метка (или пространство имен) для записей кэша запросов. Кэш запросов рассматривает результаты одного и того же запроса с разными метками как разные.

Пример создания трех различных записей кэша для одного и того же запроса:

```sql
SELECT 1 SETTINGS use_query_cache = true; -- query_cache_tag is implicitly '' (empty string)
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 1';
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 2';
```

Чтобы удалить только записи с меткой `tag` из кэша запросов, вы можете использовать оператор `SYSTEM DROP QUERY CACHE TAG 'tag'`.

ClickHouse читает данные таблицы блоками по [max_block_size](/operations/settings/settings#max_block_size) строк. Из-за фильтрации, агрегации и т.д. результатные блоки обычно намного меньше, чем 'max_block_size', но также бывают ситуации, когда они значительно больше. Настройка [query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results) (включена по умолчанию) управляет тем, будут ли результатные блоки сплющены (если они очень маленькие) или разделены (если они большие) на блоки размером 'max_block_size' перед вставкой в кэш результатов запроса. Это снижает производительность записей в кэш запросов, но улучшает коэффициент сжатия записей кэша и предоставляет более естественную гранулярность блоков, когда результаты запросов позже обслуживаются из кэша запросов.

В результате кэш запросов хранит для каждого запроса несколько (частичных) блоков результатов. Хотя это поведение является хорошим значением по умолчанию, его можно подавить, используя настройку [query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results).

Также результаты запросов с недетерминированными функциями по умолчанию не кэшируются. Такие функции включают в себя:
- функции для доступа к словарям: [`dictGet()`](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull) и т.д.
- [пользовательские функции](../sql-reference/statements/create/function.md) без метки `<deterministic>true</deterministic>` в их XML-определении,
- функции, которые возвращают текущую дату или время: [`now()`](../sql-reference/functions/date-time-functions.md#now),
  [`today()`](../sql-reference/functions/date-time-functions.md#today),
  [`yesterday()`](../sql-reference/functions/date-time-functions.md#yesterday) и т.д.,
- функции, которые возвращают случайные значения: [`randomString()`](../sql-reference/functions/random-functions.md#randomString),
  [`fuzzBits()`](../sql-reference/functions/random-functions.md#fuzzBits) и т.д.,
- функции, результат которых зависит от размера и порядка внутренних фрагментов, используемых для обработки запроса:
  [`nowInBlock()`](../sql-reference/functions/date-time-functions.md#nowInBlock) и т.д.,
  [`rowNumberInBlock()`](../sql-reference/functions/other-functions.md#rowNumberInBlock),
  [`runningDifference()`](../sql-reference/functions/other-functions.md#runningDifference),
  [`blockSize()`](../sql-reference/functions/other-functions.md#blockSize) и т.д.,
- функции, которые зависят от окружения: [`currentUser()`](../sql-reference/functions/other-functions.md#currentUser),
  [`queryID()`](/sql-reference/functions/other-functions#queryid),
  [`getMacro()`](../sql-reference/functions/other-functions.md#getMacro) и т.д.

Чтобы принудительно кэшировать результаты запросов с недетерминированными функциями, используйте настройку [query_cache_nondeterministic_function_handling](/operations/settings/settings#query_cache_nondeterministic_function_handling).

Результаты запросов, которые касаются системных таблиц (например, [system.processes](system-tables/processes.md)` или
[information_schema.tables](system-tables/information_schema.md)), по умолчанию не кэшируются. Чтобы принудительно кэшировать результаты запросов с системными таблицами, используйте настройку [query_cache_system_table_handling](/operations/settings/settings#query_cache_system_table_handling).

Наконец, записи в кэше запросов не делятся между пользователями по соображениям безопасности. Например, пользователь A не должен иметь возможность обойти политику строк в таблице, выполняя тот же запрос, что и другой пользователь B, для которого такой политики не существует. Однако при необходимости записи кэша могут быть помечены как доступные другим пользователям (т.е. общими) с помощью настройки [query_cache_share_between_users](/operations/settings/settings#query_cache_share_between_users).

## Связанное содержание {#related-content}

- Блог: [Представляем кэш запросов ClickHouse](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)