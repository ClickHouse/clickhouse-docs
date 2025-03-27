---
description: 'Руководство по использованию и настройке функции кэша запросов в ClickHouse'
sidebar_label: 'Кэш Запросов'
sidebar_position: 65
slug: /operations/query-cache
title: 'Кэш Запросов'
---


# Кэш Запросов

Кэш запросов позволяет вычислять запросы `SELECT` всего один раз и обслуживать последующие выполнения одного и того же запроса напрямую из кэша. В зависимости от типа запросов это может значительно снизить задержку и потребление ресурсов сервера ClickHouse.

## Фон, Дизайн и Ограничения {#background-design-and-limitations}

Кэши запросов можно рассматривать как транзакционно согласованные или несогласованные.

- В транзакционно согласованных кэшах база данных аннулирует (отменяет) кэшированные результаты запросов, если результат запроса `SELECT` меняется или потенциально может измениться. В ClickHouse операции, которые изменяют данные, включают вставки/обновления/удаления в/из/из таблиц или слияния. Транзакционно согласованный кэш особенно подходит для OLTP баз данных, например, [MySQL](https://dev.mysql.com/doc/refman/5.6/en/query-cache.html) (который убрал кэш запросов после версии 8.0) и [Oracle](https://docs.oracle.com/database/121/TGDBA/tune_result_cache.htm).
- В транзакционно несогласованных кэшах допускаются небольшие неточности в результатах запросов с предположением, что все записи кэша имеют срок действия, после которого они истекают (например, 1 минута) и что связанные данные меняются лишь незначительно в течение этого периода. Этот подход в целом более подходит для OLAP баз данных. В качестве примера, где транзакционно несогласованный кэш достаточен, рассмотрите часовой отчет по продажам в инструменте отчетности, к которому одновременно обращаются несколько пользователей. Данные о продажах обычно меняются достаточно медленно, поэтому базе данных нужно вычислить отчет всего один раз (представляемый первым запросом `SELECT`). Последующие запросы могут обслуживаться напрямую из кэша запросов. В этом примере разумный срок действия может составлять 30 минут.

Транзакционно несогласованный кэш традиционно предоставляется клиентскими инструментами или прокси-пакетами (например, [chproxy](https://www.chproxy.org/configuration/caching/)), взаимодействующими с базой данных. В результате та же самая логика кэширования и конфигурация часто дублируются. С кэшем запросов ClickHouse логика кэширования переходит на сторону сервера. Это снижает затраты на обслуживание и избегает избыточности.

## Настройки Конфигурации и Использование {#configuration-settings-and-usage}

:::note
В ClickHouse Cloud вам необходимо использовать [настройки уровня запроса](/operations/settings/query-level) для редактирования настроек кэша запросов. Редактирование [настроек уровня конфигурации](/operations/configuration-files) в настоящее время не поддерживается.
:::

:::note
[clickhouse-local](utilities/clickhouse-local.md) выполняет один запрос за раз. Поскольку кэширование результатов запросов не имеет смысла, кэш результатов запросов отключен в clickhouse-local.
:::

Настройка [use_query_cache](/operations/settings/settings#use_query_cache) может использоваться для управления тем, должен ли определенный запрос или все запросы текущей сессии использовать кэш запросов. Например, первое выполнение запроса

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true;
```

сохранит результат запроса в кэш запросов. Последующие выполнения того же запроса (также с параметром `use_query_cache = true`) будут считывать вычисленный результат из кэша и возвращать его немедленно.

:::note
Настройка `use_query_cache` и все остальные настройки, связанные с кэшом запросов, имеют эффект только для самостоятельных операторов `SELECT`. В частности, результаты `SELECT` для представлений, созданных с помощью `CREATE VIEW AS SELECT [...] SETTINGS use_query_cache = true`, не кэшируются, если оператор `SELECT` не выполняется с `SETTINGS use_query_cache = true`.
:::

Способ использования кэша можно настроить более подробно с помощью настроек [enable_writes_to_query_cache](/operations/settings/settings#enable_writes_to_query_cache) и [enable_reads_from_query_cache](/operations/settings/settings#enable_reads_from_query_cache) (обе по умолчанию равны `true`). Первая настройка управляет тем, сохраняются ли результаты запросов в кэше, тогда как вторая настройка определяет, должен ли сервер пытаться извлекать результаты запросов из кэша. Например, следующий запрос будет использовать кэш только пассивно, т.е. пытаться читать из него, но не сохранять свой результат в нём:

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, enable_writes_to_query_cache = false;
```

Для максимального контроля в общем рекомендуется задавать настройки `use_query_cache`, `enable_writes_to_query_cache` и `enable_reads_from_query_cache` только для конкретных запросов. Также возможно включить кэширование на уровне пользователей или профилей (например, через `SET use_query_cache = true`), но следует помнить, что тогда все запросы `SELECT` могут возвращать кэшированные результаты.

Кэш запросов можно очистить с помощью оператора `SYSTEM DROP QUERY CACHE`. Содержимое кэша запросов отображается в системной таблице [system.query_cache](system-tables/query_cache.md). Количество попаданий и промахов кэша запросов с момента старта базы данных отображается как события "QueryCacheHits" и "QueryCacheMisses" в системной таблице [system.events](system-tables/events.md). Оба счетчика обновляются только для запросов `SELECT`, которые выполняются с настройкой `use_query_cache = true`, другие запросы не влияют на "QueryCacheMisses". Поле `query_cache_usage` в системной таблице [system.query_log](system-tables/query_log.md) показывает для каждого выполненного запроса, был ли результат запроса записан в кэш или извлечен из него. Асинхронные метрики "QueryCacheEntries" и "QueryCacheBytes" в системной таблице [system.asynchronous_metrics](system-tables/asynchronous_metrics.md) показывают, сколько записей / байтов в данный момент содержит кэш запросов.

Кэш запросов существует один раз для каждого процесса сервера ClickHouse. Однако результаты кэша по умолчанию не общие между пользователями. Это можно изменить (см. ниже), но делать это не рекомендуется по соображениям безопасности.

Результаты запросов ссылаются в кэше запросов на [Abstract Syntax Tree (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree) своих запросов. Это означает, что кэширование не различает регистр, например, `SELECT 1` и `select 1` рассматриваются как один и тот же запрос. Чтобы сделать соответствие более естественным, все параметры уровня запроса, связанные с кэшем запросов, удаляются из AST.

Если запрос был прерван из-за исключения или отмены пользователя, ни одна запись не записывается в кэш запросов.

Размер кэша запросов в байтах, максимальное количество записей кэша и максимальный размер отдельных записей кэша (в байтах и записях) можно настроить с помощью различных [настроек конфигурации сервера](/operations/server-configuration-parameters/settings#query_cache).

```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```

Также возможно ограничить использование кэша отдельными пользователями с помощью [профилей настроек](settings/settings-profiles.md) и [ограничений настроек](settings/constraints-on-settings.md). Более конкретно, вы можете ограничить максимальный объем памяти (в байтах), который пользователь может выделить в кэше запросов, и максимальное количество сохраненных результатов запросов. Для этого сначала предоставьте конфигурации [query_cache_max_size_in_bytes](/operations/settings/settings#query_cache_max_size_in_bytes) и [query_cache_max_entries](/operations/settings/settings#query_cache_max_entries) в профиле пользователя в `users.xml`, затем сделайте обе настройки доступными только для чтения:

```xml
<profiles>
    <default>
        <!-- Максимальный размер кэша в байтах для пользователя/профиля 'default' -->
        <query_cache_max_size_in_bytes>10000</query_cache_max_size_in_bytes>
        <!-- Максимальное количество результатов запросов SELECT, сохраненных в кэше для пользователя/профиля 'default' -->
        <query_cache_max_entries>100</query_cache_max_entries>
        <!-- Сделать обе настройки доступными только для чтения, чтобы пользователь не мог их изменить -->
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

Чтобы определить, как долго запрос должен выполняться как минимум, чтобы его результат мог быть закэширован, вы можете использовать настройку [query_cache_min_query_duration](/operations/settings/settings#query_cache_min_query_duration). Например, результат запроса

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, query_cache_min_query_duration = 5000;
```

будет закэширован только в том случае, если запрос выполняется дольше 5 секунд. Также возможно указать, как часто запрос должен выполняться, прежде чем его результат будет закэширован - для этого используйте настройку [query_cache_min_query_runs](/operations/settings/settings#query_cache_min_query_runs).

Записи в кэше запросов становятся устаревшими после определенного периода времени (время жизни). По умолчанию этот период составляет 60 секунд, но другое значение можно указать на уровне сеанса, профиля или запроса с помощью настройки [query_cache_ttl](/operations/settings/settings#query_cache_ttl). Кэш запросов удаляет записи "лениво", т.е. когда запись становится устаревшей, она не удаляется немедленно из кэша. Вместо этого, когда новая запись должна быть вставлена в кэш запросов, база данных проверяет, достаточно ли свободного места в кэше для новой записи. Если это не так, база данных пытается удалить все устаревшие записи. Если в кэше все еще недостаточно свободного места, новая запись не вставляется.

Записи в кэше запросов по умолчанию сжимаются. Это снижает общее потребление памяти за счет более медленных записей в кэш и чтений из кэша. Чтобы отключить сжатие, используйте настройку [query_cache_compress_entries](/operations/settings/settings#query_cache_compress_entries).

Иногда полезно хранить несколько результатов для одного и того же запроса в кэше. Это можно достичь с использованием настройки [query_cache_tag](/operations/settings/settings#query_cache_tag), которая выступает в качестве метки (или пространства имен) для записей кэша запросов. Кэш запросов рассматривает результаты одного и того же запроса с разными метками как разные.

Пример создания трех различных записей кэша для одного и того же запроса:

```sql
SELECT 1 SETTINGS use_query_cache = true; -- query_cache_tag имплицитно '' (пустая строка)
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 1';
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 2';
```

Чтобы удалить только записи с меткой `tag` из кэша запросов, вы можете использовать оператор `SYSTEM DROP QUERY CACHE TAG 'tag'`.

ClickHouse считывает данные таблицы блоками по [max_block_size](/operations/settings/settings#max_block_size) строк. Из-за фильтрации, агрегации и т.д. блоки результатов, как правило, значительно меньше 'max_block_size', но также бывают случаи, когда они значительно больше. Настройка [query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results) (включена по умолчанию) управляет тем, должны ли блоки результатов сжиматься (если они маленькие) или разбиваться (если они большие) на блоки размера 'max_block_size' перед вставкой в кэш результатов запроса. Это снижает производительность записей в кэш запросов, но улучшает коэффициент сжатия записей кэша и обеспечивает более естественную гранулярность блоков, когда результаты запросов позже обслуживаются из кэша запросов.

В результате кэш запросов хранит для каждого запроса несколько (частичных) блоков результатов. Хотя такое поведение является хорошим значением по умолчанию, его можно подавить с помощью настройки [query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results).

Также результаты запросов с недетерминированными функциями по умолчанию не кэшируются. Такие функции включают
- функции для доступа к словарям: [`dictGet()`](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull) и т.д.
- [пользовательские функции](../sql-reference/statements/create/function.md) без тега `<deterministic>true</deterministic>` в их XML
  определении,
- функции, которые возвращают текущую дату или время: [`now()`](../sql-reference/functions/date-time-functions.md#now),
  [`today()`](../sql-reference/functions/date-time-functions.md#today),
  [`yesterday()`](../sql-reference/functions/date-time-functions.md#yesterday) и т.д.,
- функции, которые возвращают случайные значения: [`randomString()`](../sql-reference/functions/random-functions.md#randomString),
  [`fuzzBits()`](../sql-reference/functions/random-functions.md#fuzzBits) и т.д.,
- функции, результат которых зависит от размера и порядка внутренних частей, используемых для обработки запросов:
  [`nowInBlock()`](../sql-reference/functions/date-time-functions.md#nowInBlock) и т.д.,
  [`rowNumberInBlock()`](../sql-reference/functions/other-functions.md#rowNumberInBlock),
  [`runningDifference()`](../sql-reference/functions/other-functions.md#runningDifference),
  [`blockSize()`](../sql-reference/functions/other-functions.md#blockSize) и т.д.,
- функции, зависящие от окружения: [`currentUser()`](../sql-reference/functions/other-functions.md#currentUser),
  [`queryID()`](/sql-reference/functions/other-functions#queryid),
  [`getMacro()`](../sql-reference/functions/other-functions.md#getMacro) и т.д.

Чтобы принудительно закэшировать результаты запросов с недетерминированными функциями, несмотря на это, используйте настройку
[query_cache_nondeterministic_function_handling](/operations/settings/settings#query_cache_nondeterministic_function_handling).

Результаты запросов, которые касаются системных таблиц (например, [system.processes](system-tables/processes.md) или
[information_schema.tables](system-tables/information_schema.md)), по умолчанию не кэшируются. Чтобы принудительно закэшировать результаты запросов с системными таблицами, несмотря на это, используйте настройку [query_cache_system_table_handling](/operations/settings/settings#query_cache_system_table_handling).

Наконец, записи в кэше запросов не общие между пользователями из соображений безопасности. Например, пользователь A не должен иметь возможность обойти политику строки на таблице, выполняя тот же запрос, что и другой пользователь B, для которого такой политики не существует. Однако, если необходимо, записи кэша могут быть отмечены как доступные для других пользователей (т.е. совместными) с помощью настройки
[query_cache_share_between_users](/operations/settings/settings#query_cache_share_between_users).

## Связанный Контент {#related-content}

- Блог: [Представляем кэш запросов ClickHouse](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)
