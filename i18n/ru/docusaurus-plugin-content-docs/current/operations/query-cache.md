---
slug: /operations/query-cache
sidebar_position: 65
sidebar_label: Кэш запросов
---


# Кэш запросов

Кэш запросов позволяет вычислять запросы `SELECT` всего один раз и обслуживать дальнейшие выполнения того же запроса непосредственно из кэша. В зависимости от типа запросов это может значительно сократить задержку и потребление ресурсов сервера ClickHouse.

## Общая информация, проектирование и ограничения {#background-design-and-limitations}

Кэши запросов обычно можно рассматривать как транзакционно согласованные или несогласованные.

- В транзакционно согласованных кэшах база данных аннулирует (отбрасывает) кэшированные результаты запросов, если результат запроса `SELECT` меняется или потенциально может измениться. В ClickHouse операции, которые изменяют данные, включают вставки/обновления/удаления в/из таблиц или слияния. Транзакционно согласованное кэширование особенно подходит для OLTP баз данных, например, [MySQL](https://dev.mysql.com/doc/refman/5.6/en/query-cache.html) (которая убрала кэш запросов после версии 8.0) и [Oracle](https://docs.oracle.com/database/121/TGDBA/tune_result_cache.htm).
- В транзакционно несогласованных кэшах допустимы небольшие неточности в результатах запросов при условии, что все записи кэша имеют период срока действия, по истечении которого они истекают (например, 1 минута) и что основные данные меняются лишь немного в течение этого периода. Этот подход в целом более подходит для OLAP баз данных. В качестве примера, где транзакционно несогласованное кэширование является достаточным, рассмотрим почасовой отчет о продажах в инструменте отчетности, который одновременно используется несколькими пользователями. Данные о продажах обычно изменяются достаточно медленно, так что базе данных нужно вычислить отчет только один раз (представленный первым запросом `SELECT`). Последующие запросы могут обслуживаться непосредственно из кэша запросов. В этом примере разумный период действительности может составлять 30 минут.

Транзакционно несогласованное кэширование традиционно обеспечивается клиентскими инструментами или пакетами прокси (например, [chproxy](https://www.chproxy.org/configuration/caching/)), взаимодействующими с базой данных. В результате та же логика кэширования и настройка часто дублируются. С кэшем запросов ClickHouse логика кэширования перемещается на сторону сервера. Это упрощает обслуживание и evita дублирование.

## Настройки конфигурации и использование {#configuration-settings-and-usage}

:::note
В ClickHouse Cloud вы должны использовать [настройки уровня запроса](/operations/settings/query-level), чтобы редактировать настройки кэша запросов. Редактирование [настроек уровня конфигурации](/operations/configuration-files) в настоящее время не поддерживается.
:::

Настройка [use_query_cache](/operations/settings/settings#use_query_cache) может использоваться для управления тем, будет ли конкретный запрос или все запросы текущей сессии использовать кэш запросов. Например, первое выполнение запроса

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true;
```

сохраняет результат запроса в кэше запросов. Последующие выполнения того же запроса (также с параметром `use_query_cache = true`) будут считывать вычисленный результат из кэша и немедленно возвращать его.

:::note
Настройка `use_query_cache` и все другие параметры, связанные с кэшем запросов, вступают в силу только для одиночных операторов `SELECT`. В частности, результаты `SELECT` к представлениям, созданным с помощью `CREATE VIEW AS SELECT [...] SETTINGS use_query_cache = true`, не кэшируются, если оператор `SELECT` не выполняется с `SETTINGS use_query_cache = true`.
:::

Способ использования кэша можно настроить более детально, используя настройки [enable_writes_to_query_cache](/operations/settings/settings#enable_writes_to_query_cache) и [enable_reads_from_query_cache](/operations/settings/settings#enable_reads_from_query_cache) (по умолчанию оба установлены в `true`). Первая настройка управляет тем, будут ли результаты запросов храниться в кэше, в то время как вторая настройка определяет, должно ли база данных пытаться извлечь результаты запросов из кэша. Например, следующий запрос будет использовать кэш только пассивно, т.е. пытаться читать из него, но не хранить его результат в нем:

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, enable_writes_to_query_cache = false;
```

Для максимального контроля в общем рекомендуется предоставлять настройки `use_query_cache`, `enable_writes_to_query_cache` и `enable_reads_from_query_cache` только для конкретных запросов. Также возможно включить кэширование на уровне пользователя или профиля (например, с помощью `SET use_query_cache = true`), но следует помнить, что в этом случае все запросы `SELECT` могут вернуть кэшированные результаты.

Кэш запросов можно очистить с помощью оператора `SYSTEM DROP QUERY CACHE`. Содержимое кэша запросов отображается в системной таблице [system.query_cache](system-tables/query_cache.md). Количество попаданий и промахов кэша запросов с момента запуска базы данных отображается как события "QueryCacheHits" и "QueryCacheMisses" в системной таблице [system.events](system-tables/events.md). Оба счетчика обновляются только для запросов `SELECT`, которые выполняются с настройкой `use_query_cache = true`, другие запросы не влияют на "QueryCacheMisses". Поле `query_cache_usage` в системной таблице [system.query_log](system-tables/query_log.md) показывает для каждого выполненного запроса, был ли результат запроса записан в кэш или считан из него. Асинхронные метрики "QueryCacheEntries" и "QueryCacheBytes" в системной таблице [system.asynchronous_metrics](system-tables/asynchronous_metrics.md) показывают, сколько записей / байтов в настоящее время содержит кэш запросов.

Кэш запросов существует один раз на процессе сервера ClickHouse. Однако результаты кэша по умолчанию не делятся между пользователями. Это можно изменить (см. ниже), но делать этого не рекомендуется по соображениям безопасности.

Результаты запросов ссылаются в кэше запросов по [Абстрактному синтаксическому дереву (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree) своего запроса. Это означает, что кэширование не зависимо от регистра, например, `SELECT 1` и `select 1` рассматриваются как один и тот же запрос. Чтобы сделать соответствие более естественным, все настройки уровня запроса, связанные с кэшом запросов, удаляются из AST.

Если запрос был прерван из-за исключения или отмены пользователем, никакая запись не записывается в кэш запросов.

Размер кэша запросов в байтах, максимальное количество записей кэша и максимальный размер отдельных записей кэша (в байтах и в записях) можно настроить с помощью различных [параметров конфигурации сервера](/operations/server-configuration-parameters/settings#query_cache).

```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```

Также возможно ограничить использование кэша отдельными пользователями, используя [профили настроек](settings/settings-profiles.md) и [ограничения на настройки](settings/constraints-on-settings.md). Более конкретно, вы можете ограничить максимальное количество памяти (в байтах), которую пользователь может выделить в кэше запросов, и максимальное количество сохраненных результатов запросов. Для этого сначала задайте конфигурации [query_cache_max_size_in_bytes](/operations/settings/settings#query_cache_max_size_in_bytes) и [query_cache_max_entries](/operations/settings/settings#query_cache_max_entries) в профиле пользователя в `users.xml`, затем сделайте обе настройки только для чтения:

```xml
<profiles>
    <default>
        <!-- Максимальный размер кэша в байтах для пользователя/профиля 'default' -->
        <query_cache_max_size_in_bytes>10000</query_cache_max_size_in_bytes>
        <!-- Максимальное количество результатов запросов SELECT, сохраненных в кэше для пользователя/профиля 'default' -->
        <query_cache_max_entries>100</query_cache_max_entries>
        <!-- Сделайте обе настройки только для чтения, чтобы пользователь не мог их изменить -->
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

Чтобы определить, как долго запрос должен выполняться, чтобы его результат мог быть закэширован, вы можете использовать настройку [query_cache_min_query_duration](/operations/settings/settings#query_cache_min_query_duration). Например, результат запроса

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, query_cache_min_query_duration = 5000;
```

будет кэшироваться только в том случае, если запрос выполняется дольше 5 секунд. Также возможно указать, как часто запрос должен выполняться, прежде чем его результат будет закэширован - для этого используйте настройку [query_cache_min_query_runs](/operations/settings/settings#query_cache_min_query_runs).

Записи в кэше запросов становятся неактуальными после определенного периода времени (время жизни, TTL). По умолчанию этот период составляет 60 секунд, но можно указать другое значение на уровне сеанса, профиля или запроса с помощью настройки [query_cache_ttl](/operations/settings/settings#query_cache_ttl). Кэш запросов удаляет записи "лениво", т.е. когда запись становится недействительной, она не удаляется немедленно из кэша. Вместо этого, когда новая запись должна быть вставлена в кэш запросов, база данных проверяет, достаточно ли свободного места для новой записи. Если этого не происходит, база данных пытается удалить все устаревшие записи. Если в кэше все еще недостаточно свободного места, новая запись не вставляется.

Записи в кэше запросов по умолчанию сжимаются. Это снижает общее потребление памяти за счет более медленных операций записи/чтения в кэш запросов. Чтобы отключить сжатие, используйте настройку [query_cache_compress_entries](/operations/settings/settings#query_cache_compress_entries).

Иногда полезно хранить несколько результатов для одного и того же запроса в кэше. Это можно сделать с помощью настройки [query_cache_tag](/operations/settings/settings#query_cache_tag), которая действует как метка (или пространство имен) для записей кэша запросов. Кэш запросов считает результаты одного и того же запроса с различными тегами разными.

Пример создания трех различных записей кэша запросов для одного и того же запроса:

```sql
SELECT 1 SETTINGS use_query_cache = true; -- query_cache_tag по умолчанию является '' (пустая строка)
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 1';
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 2';
```

Чтобы удалить только записи с тегом `tag` из кэша запросов, вы можете использовать оператор `SYSTEM DROP QUERY CACHE TAG 'tag'`.

ClickHouse считывает данные таблиц блоками по [max_block_size](/operations/settings/settings#max_block_size) строк. Из-за фильтрации, агрегации и т.д. результатные блоки обычно значительно меньше, чем 'max_block_size', но есть также случаи, когда они значительно больше. Настройка [query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results) (по умолчанию включена) управляет тем, должны ли результатные блоки сжиматься (если они маленькие) или разбиваться (если они большие) на блоки размера 'max_block_size' перед вставкой в кэш результатов запросов. Это снижает производительность записи в кэш запросов, но улучшает коэффициент сжатия записей кэша и обеспечивает более естественную гранулярность блоков, когда результаты запросов в дальнейшем обслуживаются из кэша запросов.

В результате кэш запросов хранит для каждого запроса несколько (частичных) результатных блоков. Хотя такое поведение является хорошим значением по умолчанию, его можно подавить, используя настройку [query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results).

Кроме того, результаты запросов с недетерминистическими функциями по умолчанию не кэшируются. К таким функциям относятся:
- функции для доступа к словарям: [`dictGet()`](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull) и др.
- [пользовательские функции](../sql-reference/statements/create/function.md),
- функции, которые возвращают текущую дату или время: [`now()`](../sql-reference/functions/date-time-functions.md#now),
  [`today()`](../sql-reference/functions/date-time-functions.md#today),
  [`yesterday()`](../sql-reference/functions/date-time-functions.md#yesterday) и др.,
- функции, которые возвращают случайные значения: [`randomString()`](../sql-reference/functions/random-functions.md#randomString),
  [`fuzzBits()`](../sql-reference/functions/random-functions.md#fuzzBits) и др.,
- функции, результат которых зависит от размера и порядка внутренних частей, используемых для обработки запроса:
  [`nowInBlock()`](../sql-reference/functions/date-time-functions.md#nowInBlock) и др.,
  [`rowNumberInBlock()`](../sql-reference/functions/other-functions.md#rowNumberInBlock),
  [`runningDifference()`](../sql-reference/functions/other-functions.md#runningDifference),
  [`blockSize()`](../sql-reference/functions/other-functions.md#blockSize) и др.,
- функции, которые зависят от окружения: [`currentUser()`](../sql-reference/functions/other-functions.md#currentUser),
  [`queryID()`](/sql-reference/functions/other-functions#queryid),
  [`getMacro()`](../sql-reference/functions/other-functions.md#getMacro) и др.

Чтобы принудить кэширование результатов запросов с недетерминистическими функциями, используйте настройку
[query_cache_nondeterministic_function_handling](/operations/settings/settings#query_cache_nondeterministic_function_handling).

Результаты запросов, которые включают системные таблицы (например, [system.processes](system-tables/processes.md) или
[information_schema.tables](system-tables/information_schema.md)), по умолчанию не кэшируются. Чтобы принудить кэширование результатов запросов с системными таблицами независимо от этого, используйте настройку [query_cache_system_table_handling](/operations/settings/settings#query_cache_system_table_handling).

Наконец, записи в кэше запросов не делятся между пользователями по соображениям безопасности. Например, пользователь A не должен иметь возможности обойти политику строк таблицы, выполняя тот же запрос, что и другой пользователь B, для которого такой политики нет. Однако при необходимости записи кэша могут быть помечены как доступные для других пользователей (т.е. совместно используемые), предоставляя настройку
[query_cache_share_between_users](/operations/settings/settings#query_cache_share_between_users).

## Связанный контент {#related-content}

- Блог: [Введение в кэш запросов ClickHouse](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)
