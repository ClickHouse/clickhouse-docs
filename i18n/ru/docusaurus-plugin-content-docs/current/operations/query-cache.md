---
description: 'Руководство по использованию и настройке функции кэша запросов в ClickHouse'
sidebar_label: 'Кэш запросов'
sidebar_position: 65
slug: /operations/query-cache
title: 'Кэш запросов'
doc_type: 'guide'
---

# Кэш запросов \{#query-cache\}

Кэш запросов позволяет выполнять запросы `SELECT` только один раз и обслуживать последующие выполнения того же запроса напрямую из кэша.
В зависимости от типа запросов это может существенно снизить время отклика и потребление ресурсов сервера ClickHouse.

## Предпосылки, дизайн и ограничения \{#background-design-and-limitations\}

Кэши запросов в общем случае можно рассматривать как транзакционно согласованные или несогласованные.

- В транзакционно согласованных кэшах база данных аннулирует (отбрасывает) результаты закэшированных запросов, если результат `SELECT`‑запроса изменяется
  или потенциально может измениться. В ClickHouse к операциям, которые изменяют данные, относятся вставки/обновления/удаления в/из таблиц или коллапсирующие
  слияния. Транзакционно согласованное кэширование особенно подходит для OLTP‑СУБД, например
  [MySQL](https://dev.mysql.com/doc/refman/5.6/en/query-cache.html) (в которой кэш запросов был удалён, начиная с версии v8.0) и
  [Oracle](https://docs.oracle.com/database/121/TGDBA/tune_result_cache.htm).
- В транзакционно несогласованных кэшах допускаются небольшие неточности в результатах запросов при предположении, что всем записям кэша
  назначен период валидности, после которого они истекают (например, 1 минута), и что исходные данные за это время изменяются незначительно.
  В целом такой подход больше подходит для OLAP‑СУБД. В качестве примера, где транзакционно несогласованное кэширование является достаточным,
  рассмотрим почасовой отчёт о продажах в отчётном инструменте, к которому одновременно обращаются несколько пользователей. Данные о продажах, как правило,
  изменяются достаточно медленно, чтобы базе данных нужно было вычислить отчёт только один раз (представленный первым `SELECT`‑запросом). Последующие запросы могут
  обслуживаться напрямую из кэша запросов. В этом примере разумным периодом валидности могут быть 30 минут.

Транзакционно несогласованное кэширование традиционно реализуется клиентскими инструментами или прокси‑решениями (например,
[chproxy](https://www.chproxy.org/configuration/caching/)), взаимодействующими с базой данных. В результате одна и та же логика кэширования и
конфигурация часто дублируются. С кэшем запросов ClickHouse логика кэширования переносится на сторону сервера. Это снижает затраты на сопровождение
и устраняет избыточность.

## Параметры конфигурации и использование \{#configuration-settings-and-usage\}

:::note
В ClickHouse Cloud необходимо использовать [настройки на уровне запроса](/operations/settings/query-level) для изменения параметров кэша запросов. Редактирование [настроек на уровне конфигурации](/operations/configuration-files) в настоящее время не поддерживается.
:::

:::note
[clickhouse-local](utilities/clickhouse-local.md) выполняет один запрос за раз. Поскольку кэширование результатов запросов здесь не имеет смысла, кэш результатов запросов в clickhouse-local отключён.
:::

Параметр [use&#95;query&#95;cache](/operations/settings/settings#use_query_cache) можно использовать для управления тем, должен ли конкретный запрос или все запросы текущего сеанса использовать кэш запросов. Например, первое выполнение запроса

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true;
```

будет сохранять результат запроса в кэше запросов. Последующие выполнения того же запроса (также с параметром `use_query_cache = true`) будут
считывать вычисленный результат из кэша и возвращать его немедленно.

:::note
Установка `use_query_cache` и всех остальных настроек, связанных с кэшем запросов, влияет только на отдельные самостоятельные команды `SELECT`. В частности,
результаты `SELECT` к представлениям, созданным с помощью `CREATE VIEW AS SELECT [...] SETTINGS use_query_cache = true`, не кэшируются, если только команда `SELECT`
не выполняется с `SETTINGS use_query_cache = true`.
:::

То, как используется кэш, может быть более детально настроено с помощью настроек [enable&#95;writes&#95;to&#95;query&#95;cache](/operations/settings/settings#enable_writes_to_query_cache)
и [enable&#95;reads&#95;from&#95;query&#95;cache](/operations/settings/settings#enable_reads_from_query_cache) (обе настройки имеют значение `true` по умолчанию). Первая настройка
управляет тем, сохраняются ли результаты запросов в кэше, тогда как вторая настройка определяет, должен ли сервер пытаться получать результаты запросов
из кэша. Например, следующий запрос будет использовать кэш только пассивно, то есть пытаться читать из него, но не сохранять в него
свой результат:

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, enable_writes_to_query_cache = false;
```

Для максимального контроля, как правило, рекомендуется указывать настройки `use_query_cache`, `enable_writes_to_query_cache` и
`enable_reads_from_query_cache` только для конкретных запросов. Также возможно включить кэширование на уровне пользователя или профиля (например, через `SET
use_query_cache = true`), но при этом следует иметь в виду, что все запросы `SELECT` тогда могут возвращать результаты из кэша.

Кэш запросов можно очистить с помощью оператора `SYSTEM DROP QUERY CACHE`. Содержимое кэша запросов отображается в системной таблице
[system.query&#95;cache](system-tables/query_cache.md). Количество попаданий и промахов кэша запросов с момента запуска базы данных показывается как события
&quot;QueryCacheHits&quot; и &quot;QueryCacheMisses&quot; в системной таблице [system.events](system-tables/events.md). Оба счетчика обновляются только для
запросов `SELECT`, которые выполняются с настройкой `use_query_cache = true`, другие запросы не влияют на &quot;QueryCacheMisses&quot;. Поле `query_cache_usage`
в системной таблице [system.query&#95;log](system-tables/query_log.md) показывает для каждого выполненного запроса, был ли результат запроса записан в кэш
или прочитан из кэша запросов. Метрики `QueryCacheEntries` и `QueryCacheBytes` в системной таблице
[system.metrics](system-tables/metrics.md) показывают, сколько записей/байт в настоящее время содержит кэш запросов.

Кэш запросов создаётся отдельно для каждого процесса сервера ClickHouse. Однако по умолчанию результаты кэша не разделяются между пользователями. Это можно
изменить (см. ниже), но делать это не рекомендуется по соображениям безопасности.

Результаты запросов в кэше запросов идентифицируются по [Abstract Syntax Tree (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree)
их запроса. Это означает, что кэширование не зависит от регистра, например, `SELECT 1` и `select 1` обрабатываются как один и тот же запрос. Чтобы
сделать сопоставление более естественным, все настройки на уровне запроса, относящиеся к кэшу запросов и [форматированию вывода](settings/settings-formats.md),
удаляются из AST.

Если запрос был прерван из-за исключения или отмены пользователем, запись в кэш запросов не создаётся.

Размер кэша запросов в байтах, максимальное число записей в кэше и максимальный размер отдельных записей кэша (в байтах и в
записях) можно настроить с помощью различных [параметров конфигурации сервера](/operations/server-configuration-parameters/settings#query_cache).

```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```

Также можно ограничить использование кэша отдельными пользователями с помощью [профилей настроек](settings/settings-profiles.md) и [ограничений настроек](settings/constraints-on-settings.md). В частности, вы можете ограничить максимальный объём памяти (в байтах), который пользователь может выделить в кэше запросов, и максимальное количество сохранённых результатов запросов. Для этого сначала задайте значения параметров
[query&#95;cache&#95;max&#95;size&#95;in&#95;bytes](/operations/settings/settings#query_cache_max_size_in_bytes) и
[query&#95;cache&#95;max&#95;entries](/operations/settings/settings#query_cache_max_entries) в профиле пользователя в `users.xml`, затем сделайте обе настройки доступными только для чтения:

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

Чтобы задать минимальную длительность выполнения запроса, начиная с которой его результат может кэшироваться, вы можете использовать настройку
[query&#95;cache&#95;min&#95;query&#95;duration](/operations/settings/settings#query_cache_min_query_duration). Например, результат запроса

```sql
SELECT some_expensive_calculation(column_1, column_2)
FROM table
SETTINGS use_query_cache = true, query_cache_min_query_duration = 5000;
```

кэшируется только если выполнение запроса длится дольше 5 секунд. Также можно задать, сколько раз запрос должен быть выполнен, прежде чем его результат будет
закэширован — для этого используйте настройку [query&#95;cache&#95;min&#95;query&#95;runs](/operations/settings/settings#query_cache_min_query_runs).

Записи в кэше запросов становятся устаревшими через определенный период времени (time-to-live). По умолчанию этот период составляет 60 секунд, но другое
значение можно задать на уровне сессии, профиля или отдельного запроса, используя настройку [query&#95;cache&#95;ttl](/operations/settings/settings#query_cache_ttl). Кэш запросов
удаляет записи «лениво», то есть когда запись становится устаревшей, она не удаляется из кэша немедленно. Вместо этого, когда в кэш запросов нужно вставить новую запись,
база данных проверяет, достаточно ли в кэше свободного места для новой записи. Если это не так,
база данных пытается удалить все устаревшие записи. Если в кэше по-прежнему недостаточно свободного места, новая запись не добавляется.

Если запрос выполняется через HTTP, то ClickHouse устанавливает заголовки `Age` и `Expires` с временем жизни (в секундах) и временной меткой истечения срока действия
закэшированной записи.

Записи в кэше запросов по умолчанию сжимаются. Это уменьшает общее потребление памяти ценой более медленной записи в кэш и чтения
из кэша запросов. Чтобы отключить сжатие, используйте настройку [query&#95;cache&#95;compress&#95;entries](/operations/settings/settings#query_cache_compress_entries).

Иногда полезно хранить в кэше несколько результатов для одного и того же запроса. Это можно сделать с помощью настройки
[query&#95;cache&#95;tag](/operations/settings/settings#query_cache_tag), которая выступает в роли метки (или пространства имен) для записей кэша запросов. Кэш запросов
считает результаты одного и того же запроса с разными тегами разными.

Пример создания трех разных записей в кэше запросов для одного и того же запроса:

```sql
SELECT 1 SETTINGS use_query_cache = true; -- query_cache_tag is implicitly '' (empty string)
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 1';
SELECT 1 SETTINGS use_query_cache = true, query_cache_tag = 'tag 2';
```

Чтобы удалить из кэша запросов только записи с тегом `tag`, можно использовать оператор `SYSTEM DROP QUERY CACHE TAG 'tag'`.

ClickHouse читает данные таблиц блоками по [max_block_size](/operations/settings/settings#max_block_size) строк. Из‑за фильтрации, агрегации
и т. д. результирующие блоки обычно значительно меньше, чем `max_block_size`, но встречаются и случаи, когда они существенно больше. Настройка
[query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results) (включена по умолчанию) управляет тем,
будут ли результирующие блоки схлопываться (если они очень маленькие) или разбиваться (если они большие) на блоки размера `max_block_size`
перед вставкой в кэш результатов запросов. Это снижает скорость записи в кэш запросов, но повышает степень сжатия элементов кэша
и обеспечивает более естественную гранулярность блоков, когда результаты запросов затем отдаются из кэша.

В результате кэш запросов хранит для каждого запроса несколько (частичных)
блоков результата. Хотя такое поведение является разумным вариантом по умолчанию, его можно отключить с помощью настройки
[query_cache_squash_partial_results](/operations/settings/settings#query_cache_squash_partial_results).

Кроме того, результаты запросов с недетерминированными функциями по умолчанию не кэшируются. К таким функциям относятся:

- функции доступа к словарям: [`dictGet()`](/sql-reference/functions/ext-dict-functions) и т. д.;
- [пользовательские функции](../sql-reference/statements/create/function.md) без тега `<deterministic>true</deterministic>` в их XML‑
  определении;
- функции, которые возвращают текущие дату или время: [`now()`](../sql-reference/functions/date-time-functions.md#now),
  [`today()`](../sql-reference/functions/date-time-functions.md#today),
  [`yesterday()`](../sql-reference/functions/date-time-functions.md#yesterday) и т. д.;
- функции, которые возвращают случайные значения: [`randomString()`](../sql-reference/functions/random-functions.md#randomString),
  [`fuzzBits()`](../sql-reference/functions/random-functions.md#fuzzBits) и т. д.;
- функции, результат которых зависит от размера и порядка внутренних фрагментов, используемых при обработке запроса:
  [`nowInBlock()`](../sql-reference/functions/date-time-functions.md#nowInBlock) и т. д.,
  [`rowNumberInBlock()`](../sql-reference/functions/other-functions.md#rowNumberInBlock),
  [`runningDifference()`](../sql-reference/functions/other-functions.md#runningDifference),
  [`blockSize()`](../sql-reference/functions/other-functions.md#blockSize) и т. д.;
- функции, которые зависят от окружения: [`currentUser()`](../sql-reference/functions/other-functions.md#currentUser),
  [`queryID()`](/sql-reference/functions/other-functions#queryID),
  [`getMacro()`](../sql-reference/functions/other-functions.md#getMacro) и т. д.

Чтобы принудительно кэшировать результаты запросов с недетерминированными функциями, используйте настройку
[query_cache_nondeterministic_function_handling](/operations/settings/settings#query_cache_nondeterministic_function_handling).

Результаты запросов, которые обращаются к системным таблицам (например, [system.processes](system-tables/processes.md) или
[information_schema.tables](system-tables/information_schema.md)), по умолчанию не кэшируются. Чтобы принудительно кэшировать результаты
запросов с системными таблицами, используйте настройку
[query_cache_system_table_handling](/operations/settings/settings#query_cache_system_table_handling).

Наконец, элементы кэша запросов не разделяются между пользователями по соображениям безопасности. Например, пользователь A не должен иметь
возможности обойти политику по строкам для таблицы, выполняя тот же запрос, что и другой пользователь B, для которого такая политика не
задана. Однако при необходимости элементы кэша могут быть помечены как доступные для других пользователей (то есть общие) с помощью
настройки [query_cache_share_between_users](/operations/settings/settings#query_cache_share_between_users).

## Связанные материалы \{#related-content\}

- Блог: [Представляем кэш запросов ClickHouse](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)