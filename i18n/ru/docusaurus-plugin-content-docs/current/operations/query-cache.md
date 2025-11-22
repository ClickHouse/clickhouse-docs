---
description: 'Руководство по использованию и настройке функции кэша запросов в ClickHouse'
sidebar_label: 'Кэш запросов'
sidebar_position: 65
slug: /operations/query-cache
title: 'Кэш запросов'
doc_type: 'guide'
---



# Кэш запросов

Кэш запросов позволяет выполнить запрос `SELECT` один раз и затем обслуживать последующие выполнения того же запроса напрямую из кэша.
В зависимости от типа запросов это может значительно сократить задержку и потребление ресурсов сервера ClickHouse.



## Предпосылки, архитектура и ограничения {#background-design-and-limitations}

Кеши запросов можно в целом классифицировать как транзакционно согласованные или несогласованные.

- В транзакционно согласованных кешах база данных инвалидирует (удаляет) кешированные результаты запросов, если результат запроса `SELECT` изменяется
  или потенциально может измениться. В ClickHouse к операциям, изменяющим данные, относятся вставки/обновления/удаления в таблицах/из таблиц, а также схлопывающие
  слияния. Транзакционно согласованное кеширование особенно подходит для OLTP-баз данных, например
  [MySQL](https://dev.mysql.com/doc/refman/5.6/en/query-cache.html) (в котором кеш запросов был удален после версии 8.0) и
  [Oracle](https://docs.oracle.com/database/121/TGDBA/tune_result_cache.htm).
- В транзакционно несогласованных кешах допускаются небольшие неточности в результатах запросов при условии, что всем записям кеша
  назначается срок действия, по истечении которого они устаревают (например, 1 минута), и что базовые данные изменяются незначительно в течение этого периода.
  Этот подход в целом более подходит для OLAP-баз данных. В качестве примера, где транзакционно несогласованное кеширование является достаточным,
  рассмотрим почасовой отчет о продажах в инструменте отчетности, к которому одновременно обращаются несколько пользователей. Данные о продажах обычно изменяются
  достаточно медленно, поэтому базе данных необходимо вычислить отчет только один раз (что соответствует первому запросу `SELECT`). Последующие запросы могут быть
  обработаны непосредственно из кеша запросов. В этом примере разумным сроком действия может быть 30 минут.

Транзакционно несогласованное кеширование традиционно обеспечивается клиентскими инструментами или прокси-пакетами (например,
[chproxy](https://www.chproxy.org/configuration/caching/)), взаимодействующими с базой данных. В результате одна и та же логика кеширования и
конфигурация часто дублируются. При использовании кеша запросов ClickHouse логика кеширования перемещается на сторону сервера. Это снижает затраты на обслуживание
и устраняет избыточность.


## Настройки конфигурации и использование {#configuration-settings-and-usage}

:::note
В ClickHouse Cloud для изменения настроек кеша запросов необходимо использовать [настройки уровня запроса](/operations/settings/query-level). Редактирование [настроек уровня конфигурации](/operations/configuration-files) в настоящее время не поддерживается.
:::

:::note
[clickhouse-local](utilities/clickhouse-local.md) выполняет по одному запросу за раз. Поскольку кеширование результатов запросов в этом случае не имеет смысла, кеш результатов запросов в clickhouse-local отключен.
:::

Настройка [use_query_cache](/operations/settings/settings#use_query_cache) позволяет управлять тем, должен ли конкретный запрос или все запросы текущей сессии использовать кеш запросов. Например, при первом выполнении запроса

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true;
```

результат запроса будет сохранен в кеше запросов. При последующих выполнениях того же запроса (также с параметром `use_query_cache = true`) вычисленный результат будет прочитан из кеша и немедленно возвращен.

:::note
Настройка `use_query_cache` и все остальные настройки, связанные с кешем запросов, действуют только на отдельные операторы `SELECT`. В частности, результаты `SELECT` к представлениям, созданным с помощью `CREATE VIEW AS SELECT [...] SETTINGS use_query_cache = true`, не кешируются, если оператор `SELECT` не выполняется с `SETTINGS use_query_cache = true`.
:::

Способ использования кеша можно настроить более детально с помощью параметров [enable_writes_to_query_cache](/operations/settings/settings#enable_writes_to_query_cache)
и [enable_reads_from_query_cache](/operations/settings/settings#enable_reads_from_query_cache) (оба по умолчанию имеют значение `true`). Первый параметр управляет тем, сохраняются ли результаты запросов в кеше, тогда как второй параметр определяет, должна ли база данных пытаться извлечь результаты запросов из кеша. Например, следующий запрос будет использовать кеш только пассивно, т.е. попытается прочитать из него данные, но не сохранит в нем свой результат:

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, enable_writes_to_query_cache = false;
```

Для максимального контроля обычно рекомендуется указывать настройки `use_query_cache`, `enable_writes_to_query_cache` и
`enable_reads_from_query_cache` только для конкретных запросов. Также можно включить кеширование на уровне пользователя или профиля (например, через `SET
use_query_cache = true`), но следует помнить, что в этом случае все запросы `SELECT` могут возвращать кешированные результаты.

Кеш запросов можно очистить с помощью оператора `SYSTEM DROP QUERY CACHE`. Содержимое кеша запросов отображается в системной таблице
[system.query_cache](system-tables/query_cache.md). Количество попаданий и промахов кеша запросов с момента запуска базы данных показано в виде событий
"QueryCacheHits" и "QueryCacheMisses" в системной таблице [system.events](system-tables/events.md). Оба счетчика обновляются только для
запросов `SELECT`, которые выполняются с настройкой `use_query_cache = true`; другие запросы не влияют на "QueryCacheMisses". Поле `query_cache_usage`
в системной таблице [system.query_log](system-tables/query_log.md) показывает для каждого выполненного запроса, был ли результат запроса записан в
кеш запросов или прочитан из него. Метрики `QueryCacheEntries` и `QueryCacheBytes` в системной таблице
[system.metrics](system-tables/metrics.md) показывают, сколько записей и байт в настоящее время содержится в кеше запросов.

Кеш запросов существует в единственном экземпляре для каждого процесса сервера ClickHouse. Однако результаты кеша по умолчанию не являются общими для разных пользователей. Это можно
изменить (см. ниже), но делать это не рекомендуется по соображениям безопасности.

Результаты запросов идентифицируются в кеше запросов по [абстрактному синтаксическому дереву (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree) их запроса. Это означает, что кеширование не зависит от регистра символов, например `SELECT 1` и `select 1` рассматриваются как один и тот же запрос. Чтобы сделать сопоставление более естественным, все настройки уровня запроса, связанные с кешем запросов и [форматированием вывода](settings/settings-formats.md), удаляются из AST.

Если запрос был прерван из-за исключения или отмены пользователем, запись в кеш запросов не производится.

Размер кеша запросов в байтах, максимальное количество записей кеша и максимальный размер отдельных записей кеша (в байтах и в записях) можно настроить с помощью различных [параметров конфигурации сервера](/operations/server-configuration-parameters/settings#query_cache).


```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```

Также можно ограничить использование кэша отдельными пользователями с помощью [профилей настроек](settings/settings-profiles.md) и [ограничений для настроек](settings/constraints-on-settings.md). В частности, вы можете ограничить максимальный объём памяти (в байтах), который пользователь может выделить для кэша запросов, и максимальное количество сохраняемых результатов запросов. Для этого сначала задайте параметры
[query&#95;cache&#95;max&#95;size&#95;in&#95;bytes](/operations/settings/settings#query_cache_max_size_in_bytes) и
[query&#95;cache&#95;max&#95;entries](/operations/settings/settings#query_cache_max_entries) в профиле пользователя в `users.xml`, затем сделайте обе настройки доступными только для чтения:

```xml
<profiles>
    <default>
        <!-- Максимальный размер кеша в байтах для пользователя/профиля 'default' -->
        <query_cache_max_size_in_bytes>10000</query_cache_max_size_in_bytes>
        <!-- Максимальное количество результатов SELECT-запросов, сохраняемых в кеше для пользователя/профиля 'default' -->
        <query_cache_max_entries>100</query_cache_max_entries>
        <!-- Сделать обе настройки доступными только для чтения, чтобы пользователь не мог их изменять -->
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

Чтобы задать минимальное время выполнения запроса, после которого его результат может быть закэширован, вы можете использовать настройку
[query&#95;cache&#95;min&#95;query&#95;duration](/operations/settings/settings#query_cache_min_query_duration). Например, результат запроса

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, query_cache_min_query_duration = 5000;
```

кэшируется только в том случае, если запрос выполняется дольше 5 секунд. Также можно указать, сколько раз запрос должен быть выполнен,
прежде чем его результат будет закэширован — для этого используйте настройку [query&#95;cache&#95;min&#95;query&#95;runs](/operations/settings/settings#query_cache_min_query_runs).

Записи в кэше запросов становятся устаревшими по истечении определённого периода времени (time-to-live). По умолчанию этот период
составляет 60 секунд, но другое значение может быть указано на уровне сессии, профиля или запроса с помощью настройки
[query&#95;cache&#95;ttl](/operations/settings/settings#query_cache_ttl). Кэш запросов очищает записи «лениво», т.е. когда запись становится
устаревшей, она не удаляется из кэша немедленно. Вместо этого, когда в кэш запросов требуется вставить новую запись, база данных
проверяет, достаточно ли в нём свободного места для новой записи. Если места недостаточно, база данных пытается удалить все устаревшие
записи. Если в кэше всё ещё недостаточно свободного места, новая запись не вставляется.

Записи в кэше запросов по умолчанию сжимаются. Это уменьшает общий объём потребляемой памяти ценой более медленных операций записи в
кэш запросов и чтения из него. Чтобы отключить сжатие, используйте настройку
[query&#95;cache&#95;compress&#95;entries](/operations/settings/settings#query_cache_compress_entries).

Иногда бывает полезно хранить в кэше несколько результатов для одного и того же запроса. Это можно сделать с помощью настройки
[query&#95;cache&#95;tag](/operations/settings/settings#query_cache_tag), которая действует как метка (или пространство имён) для записей кэша запросов.
Кэш запросов рассматривает результаты одного и того же запроса с разными тегами как разные результаты.

Пример создания трёх различных записей в кэше запросов для одного и того же запроса:

```sql
SELECT 1 SETTINGS use_query_cache = true; -- query_cache_tag неявно равен '' (пустая строка)
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'тег 1';
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'тег 2';
```

Чтобы удалить из кэша запросов только записи с тегом `tag`, вы можете использовать команду `SYSTEM DROP QUERY CACHE TAG 'tag'`.


ClickHouse читает данные таблицы блоками по [max_block_size](/operations/settings/settings#max_block_size) строк. Из‑за фильтрации, агрегации
и т. д. результирующие блоки, как правило, намного меньше, чем `max_block_size`, но бывают и случаи, когда они гораздо больше. Настройка
[query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results) (включена по умолчанию) управляет тем, будут ли
результирующие блоки объединяться (если они очень маленькие) или разбиваться (если они большие) на блоки размера `max_block_size` перед вставкой
в кэш результатов запросов. Это снижает производительность записи в кэш запросов, но улучшает степень сжатия элементов кэша и обеспечивает
более естественную гранулярность блоков, когда результаты запросов затем отдаются из кэша запросов.

В результате кэш запросов хранит для каждого запроса несколько (частичных)
блоков результата. Хотя такое поведение является хорошим значением по умолчанию, его можно отключить с помощью настройки
[query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results).

Кроме того, результаты запросов с недетерминированными функциями по умолчанию не кэшируются. К таким функциям относятся:
- функции для доступа к словарям: [`dictGet()`](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull) и т. д.;
- [пользовательские функции](../sql-reference/statements/create/function.md) без тега `<deterministic>true</deterministic>` в их XML-
  определении;
- функции, возвращающие текущие дату или время: [`now()`](../sql-reference/functions/date-time-functions.md#now),
  [`today()`](../sql-reference/functions/date-time-functions.md#today),
  [`yesterday()`](../sql-reference/functions/date-time-functions.md#yesterday) и т. д.;
- функции, возвращающие случайные значения: [`randomString()`](../sql-reference/functions/random-functions.md#randomString),
  [`fuzzBits()`](../sql-reference/functions/random-functions.md#fuzzBits) и т. д.;
- функции, результат которых зависит от размера и порядка внутренних чанков, используемых при обработке запроса:
  [`nowInBlock()`](../sql-reference/functions/date-time-functions.md#nowInBlock) и т. д.,
  [`rowNumberInBlock()`](../sql-reference/functions/other-functions.md#rowNumberInBlock),
  [`runningDifference()`](../sql-reference/functions/other-functions.md#runningDifference),
  [`blockSize()`](../sql-reference/functions/other-functions.md#blockSize) и т. д.;
- функции, зависящие от окружения: [`currentUser()`](../sql-reference/functions/other-functions.md#currentUser),
  [`queryID()`](/sql-reference/functions/other-functions#queryID),
  [`getMacro()`](../sql-reference/functions/other-functions.md#getMacro) и т. д.

Чтобы принудительно кэшировать результаты запросов с недетерминированными функциями, используйте настройку
[query_cache_nondeterministic_function_handling](/operations/settings/settings#query_cache_nondeterministic_function_handling).

Результаты запросов, которые затрагивают системные таблицы (например, [system.processes](system-tables/processes.md)` или
[information_schema.tables](system-tables/information_schema.md)), по умолчанию не кэшируются. Чтобы принудительно кэшировать результаты
запросов, использующих системные таблицы, используйте настройку
[query_cache_system_table_handling](/operations/settings/settings#query_cache_system_table_handling).

Наконец, элементы в кэше запросов не разделяются между пользователями по соображениям безопасности. Например, пользователь A не должен
иметь возможность обойти политику по строкам в таблице, выполнив тот же запрос, что и другой пользователь B, для которого такая политика
отсутствует. Однако при необходимости элементы кэша могут быть помечены как доступные для других пользователей (т. е. общие) с помощью
настройки [query_cache_share_between_users](/operations/settings/settings#query_cache_share_between_users).



## Связанный контент {#related-content}

- Блог: [Introducing the ClickHouse Query Cache](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)
