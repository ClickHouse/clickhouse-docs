---
description: 'Документация по оператору CREATE VIEW'
sidebar_label: 'VIEW'
sidebar_position: 37
slug: /sql-reference/statements/create/view
title: 'CREATE VIEW'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# CREATE VIEW {#create-view}

Создает новое представление. Представления бывают [обычными](#normal-view), [материализованными](#materialized-view), [обновляемыми материализованными](#refreshable-materialized-view) и [оконными](/sql-reference/statements/create/view#window-view).

## Обычный вид {#normal-view}

Синтаксис:

```sql
CREATE [OR REPLACE] VIEW [IF NOT EXISTS] [db.]table_name [(alias1 [, alias2 ...])] [ON CLUSTER cluster_name]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | INVOKER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

Обычные представления не хранят данные. При каждом обращении к представлению оно просто выполняет чтение из другой таблицы. Другими словами, обычное представление — это не что иное, как сохранённый запрос. При чтении из представления этот сохранённый запрос используется как подзапрос в предложении [FROM](../../../sql-reference/statements/select/from.md).

В качестве примера предположим, что вы создали представление:

```sql
CREATE VIEW view AS SELECT ...
```

и составили запрос:

```sql
SELECT a, b, c FROM view
```

Этот запрос полностью эквивалентен подзапросу:

```sql
SELECT a, b, c FROM (SELECT ...)
```


## Параметризованное представление {#parameterized-view}

Параметризованные представления похожи на обычные представления, но могут создаваться с параметрами, которые не подставляются (не разрешаются) сразу. Эти представления можно использовать с табличными функциями, где имя представления выступает в роли имени функции, а значения параметров передаются как её аргументы.

```sql
CREATE VIEW view AS SELECT * FROM TABLE WHERE Column1={column1:datatype1} and Column2={column2:datatype2} ...
```

Приведённый выше запрос создаёт представление, которое можно использовать как табличную функцию, подставляя параметры, как показано ниже.

```sql
SELECT * FROM view(column1=value1, column2=value2 ...)
```


## Материализованное представление {#materialized-view}

```sql
CREATE MATERIALIZED VIEW [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster_name] [TO[db.]name [(columns)]] [ENGINE = engine] [POPULATE]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

:::tip
Здесь приведено пошаговое руководство по использованию [материализованных представлений](/guides/developer/cascading-materialized-views.md).
:::

Материализованные представления хранят данные, преобразованные соответствующим запросом [SELECT](../../../sql-reference/statements/select/index.md).

При создании материализованного представления без `TO [db].[table]` необходимо указать `ENGINE` – движок таблицы для хранения данных.

При создании материализованного представления с `TO [db].[table]` нельзя дополнительно использовать `POPULATE`.

Материализованное представление реализовано следующим образом: при вставке данных в таблицу, указанную в `SELECT`, часть вставляемых данных преобразуется этим запросом `SELECT`, и результат вставляется в представление.

:::note
Материализованные представления в ClickHouse при вставке в целевую таблицу используют **имена столбцов**, а не порядок столбцов. Если некоторые имена столбцов отсутствуют в результате запроса `SELECT`, ClickHouse использует значение по умолчанию, даже если столбец не является [Nullable](../../data-types/nullable.md). Безопасной практикой будет добавлять псевдонимы для каждого столбца при использовании материализованных представлений.

Материализованные представления в ClickHouse больше напоминают триггеры на вставку. Если в запросе представления есть некоторая агрегация, она применяется только к пакету вновь вставленных данных. Любые изменения существующих данных исходной таблицы (такие как update, delete, drop partition и т.п.) не изменяют материализованное представление.

Материализованные представления в ClickHouse не имеют детерминированного поведения в случае ошибок. Это означает, что блоки, которые уже были записаны, будут сохранены в целевой таблице, но все блоки после ошибки записаны не будут.

По умолчанию, если вставка в одно из представлений завершается с ошибкой, то запрос INSERT также завершится с ошибкой, и некоторые блоки могут не быть записаны в целевую таблицу. Это можно изменить с помощью настройки `materialized_views_ignore_errors` (ее следует задать для запроса `INSERT`). Если вы установите `materialized_views_ignore_errors=true`, то любые ошибки при вставке в представления будут игнорироваться, и все блоки будут записаны в целевую таблицу.

Также обратите внимание, что `materialized_views_ignore_errors` по умолчанию имеет значение `true` для таблиц `system.*_log`.
:::

Если вы укажете `POPULATE`, существующие данные таблицы будут вставлены в представление при его создании, как при выполнении `CREATE TABLE ... AS SELECT ...`. В противном случае запрос будет содержать только данные, вставленные в таблицу после создания представления. Мы **не рекомендуем** использовать `POPULATE`, так как данные, вставленные в таблицу во время создания представления, не будут в него вставлены.

:::note
Учитывая, что `POPULATE` работает как `CREATE TABLE ... AS SELECT ...`, у него есть ограничения:

* Он не поддерживается с реплицируемыми базами данных (Replicated database).
* Он не поддерживается в ClickHouse Cloud.

Вместо этого можно использовать отдельный запрос `INSERT ... SELECT`.
:::

Запрос `SELECT` может содержать `DISTINCT`, `GROUP BY`, `ORDER BY`, `LIMIT`. Учтите, что соответствующие преобразования выполняются независимо для каждого блока вставляемых данных. Например, если задан `GROUP BY`, данные агрегируются во время вставки, но только в пределах одного пакета вставляемых данных. Данные не будут дополнительно агрегироваться. Исключение — использование `ENGINE`, который самостоятельно выполняет агрегацию данных, например `SummingMergeTree`.

Если материализованное представление использует конструкцию `TO [db.]name`, вы можете выполнить `DETACH` представления, запустить `ALTER` для целевой таблицы, а затем `ATTACH` ранее отсоединенное (`DETACH`) представление.

Обратите внимание, что на материализованное представление влияет настройка [optimize&#95;on&#95;insert](/operations/settings/settings#optimize_on_insert). Данные объединяются перед вставкой в представление.

Представления выглядят так же, как обычные таблицы. Например, они перечислены в результате запроса `SHOW TABLES`.

Чтобы удалить представление, используйте [DROP VIEW](../../../sql-reference/statements/drop.md#drop-view). Хотя `DROP TABLE` также работает для представлений (VIEW).


## SQL-безопасность {#sql_security}

`DEFINER` и `SQL SECURITY` позволяют указать, под каким пользователем ClickHouse будет выполняться базовый запрос представления.
`SQL SECURITY` может принимать три допустимых значения: `DEFINER`, `INVOKER` или `NONE`. В предложении `DEFINER` вы можете указать любого существующего пользователя или `CURRENT_USER`.

В следующей таблице объясняется, какие права требуются какому пользователю, чтобы выполнять запросы к представлению.
Обратите внимание, что независимо от варианта SQL-безопасности во всех случаях по‑прежнему требуется иметь `GRANT SELECT ON <view>`, чтобы читать из него.

| Опция SQL-безопасности | Представление                                                                             | Материализованное представление                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `DEFINER alice`        | У пользователя `alice` должна быть привилегия `SELECT` на исходную таблицу представления. | У пользователя `alice` должны быть привилегии `SELECT` на исходную таблицу представления и `INSERT` на целевую таблицу представления. |
| `INVOKER`              | У пользователя должна быть привилегия `SELECT` на исходную таблицу представления.         | `SQL SECURITY INVOKER` не может быть указан для материализованных представлений.                                                      |
| `NONE`                 | -                                                                                         | -                                                                                                                                     |

:::note
`SQL SECURITY NONE` — устаревшая опция. Любой пользователь с правами на создание представлений с `SQL SECURITY NONE` сможет выполнять произвольные запросы.
Поэтому для создания представления с этой опцией требуется иметь `GRANT ALLOW SQL SECURITY NONE TO <user>`.
:::

Если `DEFINER` / `SQL SECURITY` не указаны, используются значения по умолчанию:

* `SQL SECURITY`: `INVOKER` для обычных представлений и `DEFINER` для материализованных представлений ([настраивается параметрами](../../../operations/settings/settings.md#default_normal_view_sql_security))
* `DEFINER`: `CURRENT_USER` ([настраивается параметрами](../../../operations/settings/settings.md#default_view_definer))

Если представление подключено (ATTACH) без указания `DEFINER` / `SQL SECURITY`, то значением по умолчанию будет `SQL SECURITY NONE` для материализованного представления и `SQL SECURITY INVOKER` для обычного представления.

Чтобы изменить настройки SQL-безопасности для существующего представления, используйте

```sql
ALTER TABLE MODIFY SQL SECURITY { DEFINER | INVOKER | NONE } [DEFINER = { user | CURRENT_USER }]
```


### Примеры {#examples}

```sql
CREATE VIEW test_view
DEFINER = alice SQL SECURITY DEFINER
AS SELECT ...
```

```sql
CREATE VIEW test_view
SQL SECURITY INVOKER
AS SELECT ...
```


## Live View {#live-view}

<DeprecatedBadge/>

Данная возможность признана устаревшей и будет удалена в будущем.

Для вашего удобства старая документация доступна [здесь](https://pastila.nl/?00f32652/fdf07272a7b54bda7e13b919264e449f.md)

## Refreshable materialized view {#refreshable-materialized-view}

```sql
CREATE MATERIALIZED VIEW [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
REFRESH EVERY|AFTER interval [OFFSET interval]
[RANDOMIZE FOR interval]
[DEPENDS ON [db.]name [, [db.]name [, ...]]]
[SETTINGS name = value [, name = value [, ...]]]
[APPEND]
[TO[db.]name] [(columns)] [ENGINE = engine]
[EMPTY]
[DEFINER = { user | CURRENT_USER }] [SQL SECURITY { DEFINER | NONE }]
AS SELECT ...
[COMMENT 'comment']
```

где `interval` — последовательность простых интервалов:

```sql
number SECOND|MINUTE|HOUR|DAY|WEEK|MONTH|YEAR
```

Периодически выполняет соответствующий запрос и сохраняет его результат в таблице.

* Если в запросе указано `APPEND`, при каждом обновлении в таблицу добавляются строки без удаления существующих. Вставка при этом не является атомарной, как и обычный INSERT SELECT.
* В противном случае каждое обновление атомарно заменяет предыдущее содержимое таблицы.

Отличия от обычных необновляемых materialized view:

* Нет триггера на вставку. Т.е. когда новые данные вставляются в таблицу, указанную в SELECT, они *не* отправляются автоматически в обновляемое materialized view. Периодическое обновление каждый раз выполняет весь запрос целиком.
* Нет ограничений на запрос SELECT. Табличные функции (например, `url()`), представления, UNION, JOIN — всё разрешено.

:::note
Параметры в части запроса `REFRESH ... SETTINGS` — это настройки обновления (например, `refresh_retries`), отличные от обычных настроек (например, `max_threads`). Обычные настройки можно задать с помощью `SETTINGS` в конце запроса.
:::


### Расписание обновления {#refresh-schedule}

Примеры расписаний обновления:

```sql
REFRESH EVERY 1 DAY -- every day, at midnight (UTC)
REFRESH EVERY 1 MONTH -- on 1st day of every month, at midnight
REFRESH EVERY 1 MONTH OFFSET 5 DAY 2 HOUR -- on 6th day of every month, at 2:00 am
REFRESH EVERY 2 WEEK OFFSET 5 DAY 15 HOUR 10 MINUTE -- every other Saturday, at 3:10 pm
REFRESH EVERY 30 MINUTE -- at 00:00, 00:30, 01:00, 01:30, etc
REFRESH AFTER 30 MINUTE -- 30 minutes after the previous refresh completes, no alignment with time of day
-- REFRESH AFTER 1 HOUR OFFSET 1 MINUTE -- syntax error, OFFSET is not allowed with AFTER
REFRESH EVERY 1 WEEK 2 DAYS -- every 9 days, not on any particular day of the week or month;
                            -- specifically, when day number (since 1969-12-29) is divisible by 9
REFRESH EVERY 5 MONTHS -- every 5 months, different months each year (as 12 is not divisible by 5);
                       -- specifically, when month number (since 1970-01) is divisible by 5
```

`RANDOMIZE FOR` случайным образом смещает время каждого обновления, например:

```sql
REFRESH EVERY 1 DAY OFFSET 2 HOUR RANDOMIZE FOR 1 HOUR -- every day at random time between 01:30 and 02:30
```

В каждый момент времени для заданного представления может выполняться не более одного обновления. Например, если представление с `REFRESH EVERY 1 MINUTE` обновляется за 2 минуты, фактически оно будет обновляться каждые 2 минуты. Если затем обновление станет быстрее и начнёт выполняться за 10 секунд, период обновления снова вернётся к одной минуте. (В частности, обновление не будет выполняться каждые 10 секунд, чтобы «наверстать» пропущенные обновления — никакого подобного «долга» нет.)

Кроме того, обновление запускается сразу после создания материализованного представления, если только в запросе `CREATE` не указано `EMPTY`. Если указано `EMPTY`, первое обновление происходит по расписанию.


### В реплицируемой БД {#in-replicated-db}

Если обновляемое материализованное представление находится в [реплицируемой базе данных](../../../engines/database-engines/replicated.md), реплики координируют работу таким образом, что в каждый момент по расписанию обновление выполняет только одна реплика. Требуется движок таблиц [ReplicatedMergeTree](../../../engines/table-engines/mergetree-family/replication.md), чтобы все реплики видели данные, полученные в результате обновления.

В режиме `APPEND` координацию можно отключить с помощью `SETTINGS all_replicas = 1`. Тогда реплики выполняют обновления независимо друг от друга и ReplicatedMergeTree не требуется.

В режиме, отличном от `APPEND`, поддерживается только координируемое обновление. Для некоординируемого варианта используйте базу данных `Atomic` и запрос `CREATE ... ON CLUSTER` для создания обновляемых материализованных представлений на всех репликах.

Координация выполняется через Keeper. Путь znode задаётся настройкой сервера [default_replica_path](../../../operations/server-configuration-parameters/settings.md#default_replica_path).

### Зависимости {#refresh-dependencies}

`DEPENDS ON` синхронизирует обновления разных таблиц. Например, предположим, что существует цепочка из двух обновляемых материализованных представлений:

```sql
CREATE MATERIALIZED VIEW source REFRESH EVERY 1 DAY AS SELECT * FROM url(...)
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY AS SELECT ... FROM source
```

Без `DEPENDS ON` оба представления начнут обновляться в полночь, и `destination`, как правило, будет получать вчерашние данные из `source`. Если мы добавим зависимость:

```sql
CREATE MATERIALIZED VIEW destination REFRESH EVERY 1 DAY DEPENDS ON source AS SELECT ... FROM source
```

при этом обновление `destination` начнётся только после того, как обновление `source` за этот день завершится, так что `destination` будет основан на свежих данных.

В качестве альтернативы тот же результат можно получить с помощью:

```sql
CREATE MATERIALIZED VIEW destination REFRESH AFTER 1 HOUR DEPENDS ON source AS SELECT ... FROM source
```

где `1 HOUR` может быть любой продолжительностью, меньшей, чем период обновления `source`. Зависимая таблица не будет обновляться чаще, чем любая из её зависимостей. Это корректный способ настроить цепочку обновляемых представлений, не указывая фактический период обновления более одного раза.

Ещё несколько примеров:

* `REFRESH EVERY 1 DAY OFFSET 10 MINUTE` (`destination`) зависит от `REFRESH EVERY 1 DAY` (`source`)<br />
  Если обновление `source` занимает больше 10 минут, `destination` будет ждать его завершения.
* `REFRESH EVERY 1 DAY OFFSET 1 HOUR` зависит от `REFRESH EVERY 1 DAY OFFSET 23 HOUR`<br />
  Аналогично вышеописанному, даже несмотря на то, что соответствующие обновления происходят в разные календарные дни.
  Обновление `destination` в день X+1 будет ждать обновления `source` в день X (если оно занимает больше 2 часов).
* `REFRESH EVERY 2 HOUR` зависит от `REFRESH EVERY 1 HOUR`<br />
  Обновление каждые 2 часа выполняется после обновления каждый час для каждого второго часа, например после полуночного
  обновления, затем после обновления в 2 часа ночи и т.д.
* `REFRESH EVERY 1 MINUTE` зависит от `REFRESH EVERY 2 HOUR`<br />
  `REFRESH AFTER 1 MINUTE` зависит от `REFRESH EVERY 2 HOUR`<br />
  `REFRESH AFTER 1 MINUTE` зависит от `REFRESH AFTER 2 HOUR`<br />
  `destination` обновляется один раз после каждого обновления `source`, то есть каждые 2 часа. Значение `1 MINUTE` фактически игнорируется.
* `REFRESH AFTER 1 HOUR` зависит от `REFRESH AFTER 1 HOUR`<br />
  В настоящее время это не рекомендуется.

:::note
`DEPENDS ON` работает только между обновляемыми материализованными представлениями. Указание обычной таблицы в списке `DEPENDS ON` приведёт к тому, что представление никогда не будет обновляться (зависимости можно удалить с помощью `ALTER`, см. ниже).
:::


### Параметры {#settings}

Доступные параметры обновления:

* `refresh_retries` - Сколько раз повторять попытку, если запрос обновления завершился с исключением. Если все попытки не удались, происходит переход к следующему запланированному времени обновления. 0 означает отсутствие повторных попыток, -1 — бесконечное число попыток. По умолчанию: 0.
* `refresh_retry_initial_backoff_ms` - Задержка перед первой повторной попыткой, если `refresh_retries` не равно нулю. Каждая последующая попытка удваивает задержку, вплоть до `refresh_retry_max_backoff_ms`. По умолчанию: 100 мс.
* `refresh_retry_max_backoff_ms` - Ограничение на экспоненциальный рост задержки между попытками обновления. По умолчанию: 60000 мс (1 минута).

### Изменение параметров обновления {#changing-refresh-parameters}

Чтобы изменить параметры обновления:

```sql
ALTER TABLE [db.]name MODIFY REFRESH EVERY|AFTER ... [RANDOMIZE FOR ...] [DEPENDS ON ...] [SETTINGS ...]
```

:::note
Это действие одновременно заменяет *все* параметры обновления: расписание, зависимости, настройки и режим добавления (APPEND). Например, если у таблицы был `DEPENDS ON`, выполнение `MODIFY REFRESH` без `DEPENDS ON` удалит зависимости.
:::


### Другие операции {#other-operations}

Состояние всех обновляемых материализованных представлений доступно в таблице [`system.view_refreshes`](../../../operations/system-tables/view_refreshes.md). В частности, она содержит прогресс обновления (если оно выполняется), время последнего и следующего обновления, сообщение об исключении, если обновление завершилось с ошибкой.

Чтобы вручную остановить, запустить, инициировать или отменить обновление, используйте [`SYSTEM STOP|START|REFRESH|WAIT|CANCEL VIEW`](../system.md#refreshable-materialized-views).

Чтобы дождаться завершения обновления, используйте [`SYSTEM WAIT VIEW`](../system.md#refreshable-materialized-views). Это, в частности, полезно для ожидания первоначального обновления после создания представления.

:::note
Интересный факт: запрос обновления может читать из обновляемого представления, видя версию данных до обновления. Это означает, что вы можете реализовать игру «Жизнь» Конвея: https://pastila.nl/?00021a4b/d6156ff819c83d490ad2dcec05676865#O0LGWTO7maUQIA4AcGUtlA==
:::

## Оконное представление {#window-view}

<ExperimentalBadge />

<CloudNotSupportedBadge />

:::info
Это экспериментальная функция, которая в будущих релизах может изменяться без сохранения обратной совместимости. Включите поддержку оконных представлений и запроса `WATCH`, используя настройку [allow&#95;experimental&#95;window&#95;view](/operations/settings/settings#allow_experimental_window_view). Выполните команду `set allow_experimental_window_view = 1`.
:::

```sql
CREATE WINDOW VIEW [IF NOT EXISTS] [db.]table_name [TO [db.]table_name] [INNER ENGINE engine] [ENGINE engine] [WATERMARK strategy] [ALLOWED_LATENESS interval_function] [POPULATE]
AS SELECT ...
GROUP BY time_window_function
[COMMENT 'comment']
```

Оконное представление может агрегировать данные по временным окнам и выводить результаты, когда окно готово сработать. Оно сохраняет частичные результаты агрегации во внутренней (или указанной) таблице для уменьшения задержки и может отправлять результат обработки в указанную таблицу или отправлять уведомления с использованием запроса WATCH.

Создание оконного представления аналогично созданию `MATERIALIZED VIEW`. Оконному представлению требуется внутренний движок хранения для сохранения промежуточных данных. Внутреннее хранилище может быть задано с помощью клаузы `INNER ENGINE`, при этом оконное представление по умолчанию будет использовать `AggregatingMergeTree` в качестве внутреннего движка.

При создании оконного представления без `TO [db].[table]` необходимо указать `ENGINE` — движок таблицы для хранения данных.


### Функции временных окон {#time-window-functions}

[Функции временных окон](../../functions/time-window-functions.md) используются для получения нижней и верхней границ окна для записей. Оконное представление должно использоваться совместно с функцией временного окна.

### ВРЕМЕННЫЕ АТРИБУТЫ {#time-attributes}

Оконное представление поддерживает обработку по **времени обработки** (processing time) и по **времени события** (event time).

**Время обработки** позволяет оконному представлению формировать результаты на основе локального времени машины и используется по умолчанию. Это наиболее простой способ интерпретации времени, но он не обеспечивает детерминизм. Атрибут времени обработки может быть задан путём установки `time_attr` функции временного окна равным столбцу таблицы или с помощью функции `now()`. Следующий запрос создаёт оконное представление с использованием времени обработки.

```sql
CREATE WINDOW VIEW wv AS SELECT count(number), tumbleStart(w_id) as w_start from date GROUP BY tumble(now(), INTERVAL '5' SECOND) as w_id
```

**Время события (event time)** — это время, когда каждое событие произошло на устройстве, которое его сгенерировало. Это время обычно встраивается в записи в момент их формирования. Обработка по времени события позволяет получать согласованные результаты даже в случае событий, пришедших не по порядку или с опозданием. Window view поддерживает обработку по времени события с использованием синтаксиса `WATERMARK`.

Window view предоставляет три стратегии формирования watermark:

* `STRICTLY_ASCENDING`: выдаёт watermark, равный максимальной наблюдавшейся на данный момент метке времени. Строки с меткой времени, меньшей, чем максимальная метка времени, не считаются опоздавшими.
* `ASCENDING`: выдаёт watermark, равный максимальной наблюдавшейся на данный момент метке времени минус 1. Строки с меткой времени, меньшей или равной максимальной метке времени, не считаются опоздавшими.
* `BOUNDED`: WATERMARK=INTERVAL. Выдаёт watermark, который равен максимальной наблюдавшейся метке времени за вычетом указанной задержки.

Следующие запросы являются примерами создания Window view с `WATERMARK`:

```sql
CREATE WINDOW VIEW wv WATERMARK=STRICTLY_ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=ASCENDING AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
CREATE WINDOW VIEW wv WATERMARK=INTERVAL '3' SECOND AS SELECT count(number) FROM date GROUP BY tumble(timestamp, INTERVAL '5' SECOND);
```

По умолчанию окно срабатывает при поступлении watermark, а элементы, которые поступают позже watermark, отбрасываются. Оконное представление поддерживает обработку поздних событий через параметр `ALLOWED_LATENESS=INTERVAL`. Пример обработки таких опоздавших событий:

```sql
CREATE WINDOW VIEW test.wv TO test.dst WATERMARK=ASCENDING ALLOWED_LATENESS=INTERVAL '2' SECOND AS SELECT count(a) AS count, tumbleEnd(wid) AS w_end FROM test.mt GROUP BY tumble(timestamp, INTERVAL '5' SECOND) AS wid;
```

Обратите внимание, что элементы, выдаваемые при позднем срабатывании, следует рассматривать как обновлённые результаты предыдущего вычисления. Вместо срабатывания в конце окон представление окна будет срабатывать сразу при поступлении запоздалого события. В результате для одного и того же окна может быть получено несколько выходных результатов. Пользователям необходимо учитывать эти дублирующиеся результаты или удалять дубликаты.

Вы можете изменить запрос `SELECT`, который был указан в оконном представлении, с помощью оператора `ALTER TABLE ... MODIFY QUERY`. Структура данных, формируемая новым запросом `SELECT`, должна совпадать со структурой данных исходного запроса `SELECT` — как при указании клаузы `TO [db.]name`, так и без неё. Обратите внимание, что данные в текущем окне будут потеряны, поскольку промежуточное состояние не может быть повторно использовано.


### Мониторинг новых окон {#monitoring-new-windows}

Оконное представление поддерживает запрос [WATCH](../../../sql-reference/statements/watch.md), который позволяет отслеживать изменения, а также синтаксис `TO` для вывода результатов в таблицу.

```sql
WATCH [db.]window_view
[EVENTS]
[LIMIT n]
[FORMAT format]
```

`LIMIT` может быть указан для задания количества обновлений, которые нужно получить перед завершением запроса. Предложение `EVENTS` можно использовать для получения сокращённой формы запроса `WATCH`, при которой вместо результата запроса вы будете получать только последнюю водяную метку (watermark) запроса.


### Settings {#settings-1}

* `window_view_clean_interval`: Интервал очистки оконного представления в секундах для освобождения устаревших данных. Система будет сохранять окна, которые ещё не были полностью сработаны в соответствии с системным временем или конфигурацией `WATERMARK`, а остальные данные будут удалены.
* `window_view_heartbeat_interval`: Интервал heartbeat в секундах, указывающий, что watch‑запрос активен.
* `wait_for_window_view_fire_signal_timeout`: Таймаут ожидания сигнала срабатывания оконного представления при обработке по времени события.

### Example {#example}

Предположим, нам нужно посчитать количество click‑логов за каждые 10 секунд в таблице логов `data`, структура которой следующая:

```sql
CREATE TABLE data ( `id` UInt64, `timestamp` DateTime) ENGINE = Memory;
```

Сначала создадим оконное представление с фиксированным (tumbling) временным окном продолжительностью 10 секунд:

```sql
CREATE WINDOW VIEW wv as select count(id), tumbleStart(w_id) as window_start from data group by tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

Затем используем запрос `WATCH`, чтобы получить результаты.

```sql
WATCH wv
```

Когда логи вставляются в таблицу `data`,

```sql
INSERT INTO data VALUES(1,now())
```

Запрос `WATCH` должен выводить результаты следующим образом:

```text
┌─count(id)─┬────────window_start─┐
│         1 │ 2020-01-14 16:56:40 │
└───────────┴─────────────────────┘
```

Также можно направить результат в другую таблицу, используя синтаксис `TO`.

```sql
CREATE WINDOW VIEW wv TO dst AS SELECT count(id), tumbleStart(w_id) as window_start FROM data GROUP BY tumble(timestamp, INTERVAL '10' SECOND) as w_id
```

Дополнительные примеры можно найти среди stateful-тестов ClickHouse (там они называются `*window_view*`).


### Использование Window View {#window-view-usage}

Window View полезен в следующих сценариях:

* **Мониторинг**: Агрегировать и вычислять метрики по логам во времени, выводя результаты в целевую таблицу. Панель мониторинга может использовать целевую таблицу в качестве источника данных.
* **Аналитика**: Автоматически агрегировать и предварительно обрабатывать данные во временном окне. Это может быть полезно при анализе больших объемов логов. Предварительная обработка устраняет повторные вычисления в нескольких запросах и снижает задержку выполнения запросов.

## Связанные материалы {#related-content}

- Блог: [Работа с временными рядами в ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
- Блог: [Построение системы обсервабилити с помощью ClickHouse — часть 2. Трейсы](https://clickhouse.com/blog/storing-traces-and-spans-open-telemetry-in-clickhouse)

## Временные представления {#temporary-views}

ClickHouse поддерживает **временные представления** со следующими характеристиками (по возможности аналогичными временным таблицам):

* **Срок жизни — сессия**
  Временное представление существует только в течение текущей сессии. Оно автоматически удаляется при завершении сессии.

* **Нет базы данных**
  Вы **не можете** указывать имя базы данных для временного представления. Оно существует вне баз данных (в пространстве имен сессии).

* **Не реплицируются / без ON CLUSTER**
  Временные объекты локальны для сессии и **не могут** быть созданы с `ON CLUSTER`.

* **Разрешение имени**
  Если временный объект (таблица или представление) имеет то же имя, что и постоянный объект, и запрос ссылается на это имя **без** указания базы данных, используется **временный** объект.

* **Логический объект (без хранения данных)**
  Временное представление хранит только свой текст `SELECT` (внутренне использует хранилище `View`). Оно не сохраняет данные и не принимает `INSERT`.

* **Клауза ENGINE**
  Вам **не** нужно указывать `ENGINE`; если задано `ENGINE = View`, это игнорируется и рассматривается как то же логическое представление.

* **Безопасность / привилегии**
  Для создания временного представления требуется привилегия `CREATE TEMPORARY VIEW`, которая неявно предоставляется привилегией `CREATE VIEW`.

* **SHOW CREATE**
  Используйте `SHOW CREATE TEMPORARY VIEW view_name;`, чтобы вывести DDL временного представления.

### Синтаксис {#temporary-views-syntax}

```sql
CREATE TEMPORARY VIEW [IF NOT EXISTS] view_name AS <select_query>
```

`OR REPLACE` **не** поддерживается для временных представлений (по аналогии с временными таблицами). Если вам нужно «заменить» временное представление, удалите его и создайте заново.


### Примеры {#temporary-views-examples}

Создайте временную исходную таблицу и временное представление поверх неё:

```sql
CREATE TEMPORARY TABLE t_src (id UInt32, val String);
INSERT INTO t_src VALUES (1, 'a'), (2, 'b');

CREATE TEMPORARY VIEW tview AS
SELECT id, upper(val) AS u
FROM t_src
WHERE id <= 2;

SELECT * FROM tview ORDER BY id;
```

Выведите его DDL:

```sql
SHOW CREATE TEMPORARY VIEW tview;
```

Удалите его:

```sql
DROP TEMPORARY VIEW IF EXISTS tview;  -- temporary views are dropped with TEMPORARY TABLE syntax
```


### Запрещено / ограничения {#temporary-views-limitations}

* `CREATE OR REPLACE TEMPORARY VIEW ...` → **недопустимо** (используйте `DROP` + `CREATE`).
* `CREATE TEMPORARY MATERIALIZED VIEW ...` / `WINDOW VIEW` → **недопустимо**.
* `CREATE TEMPORARY VIEW db.view AS ...` → **недопустимо** (нельзя указывать базу данных).
* `CREATE TEMPORARY VIEW view ON CLUSTER 'name' AS ...` → **недопустимо** (временные объекты локальны для сессии).
* `POPULATE`, `REFRESH`, `TO [db.table]`, внутренние движки и все специфичные для материализованных представлений (MV) конструкции → **не применимы** к временным представлениям.

### Примечания о распределённых запросах {#temporary-views-distributed-notes}

Временное **представление** — это только определение; нет данных, которые нужно передавать. Если ваше временное представление ссылается на временные **таблицы** (например, `Memory`), их данные могут передаваться на удалённые серверы во время выполнения распределённого запроса тем же способом, что и для временных таблиц.

#### Пример {#temporary-views-distributed-example}

```sql
-- A session-scoped, in-memory table
CREATE TEMPORARY TABLE temp_ids (id UInt64) ENGINE = Memory;

INSERT INTO temp_ids VALUES (1), (5), (42);

-- A session-scoped view over the temp table (purely logical)
CREATE TEMPORARY VIEW v_ids AS
SELECT id FROM temp_ids;

-- Replace 'test' with your cluster name.
-- GLOBAL JOIN forces ClickHouse to *ship* the small join-side (temp_ids via v_ids)
-- to every remote server that executes the left side.
SELECT count()
FROM cluster('test', system.numbers) AS n
GLOBAL ANY INNER JOIN v_ids USING (id)
WHERE n.number < 100;

```
