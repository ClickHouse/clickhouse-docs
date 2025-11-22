---
description: 'Документация по столбцам'
sidebar_label: 'СТОЛБЕЦ'
sidebar_position: 37
slug: /sql-reference/statements/alter/column
title: 'Операции со столбцами'
doc_type: 'reference'
---

Набор запросов для изменения структуры таблицы.

Синтаксис:

```sql
ALTER [TEMPORARY] TABLE [db].name [ON CLUSTER cluster] ADD|DROP|RENAME|CLEAR|COMMENT|{MODIFY|ALTER}|MATERIALIZE COLUMN ...
```

В запросе укажите список из одного или нескольких действий, разделённых запятыми.
Каждое действие — это операция над столбцом.

Поддерживаются следующие действия:

* [ADD COLUMN](#add-column) — Добавляет новый столбец в таблицу.
* [DROP COLUMN](#drop-column) — Удаляет столбец.
* [RENAME COLUMN](#rename-column) — Переименовывает существующий столбец.
* [CLEAR COLUMN](#clear-column) — Сбрасывает значения столбца.
* [COMMENT COLUMN](#comment-column) — Добавляет текстовый комментарий к столбцу.
* [MODIFY COLUMN](#modify-column) — Изменяет тип столбца, выражение по умолчанию, TTL и настройки столбца.
* [MODIFY COLUMN REMOVE](#modify-column-remove) — Удаляет одно из свойств столбца.
* [MODIFY COLUMN MODIFY SETTING](#modify-column-modify-setting) — Изменяет настройки столбца.
* [MODIFY COLUMN RESET SETTING](#modify-column-reset-setting) — Сбрасывает настройки столбца.
* [MATERIALIZE COLUMN](#materialize-column) — Материализует столбец в тех частях таблицы, где он отсутствует.
  Эти действия описаны подробнее ниже.


## ADD COLUMN {#add-column}

```sql
ADD COLUMN [IF NOT EXISTS] имя [тип] [выражение_по_умолчанию] [кодек] [AFTER имя_после | FIRST]
```

Добавляет в таблицу новый столбец с указанными параметрами: `name` (имя), `type` (тип), [`codec`](../create/table.md/#column_compression_codec) (кодек) и `default_expr` (выражение по умолчанию) (см. раздел [Выражения по умолчанию](/sql-reference/statements/create/table#default_values)).

Если указана конструкция `IF NOT EXISTS`, запрос не вернёт ошибку, если столбец уже существует. Если указать `AFTER name_after` (имя другого столбца), столбец будет добавлен после указанного столбца в списке столбцов таблицы. Чтобы добавить столбец в начало таблицы, используйте конструкцию `FIRST`. В противном случае столбец добавляется в конец таблицы. При выполнении цепочки действий `name_after` может быть именем столбца, добавленного в одном из предыдущих действий.

Добавление столбца изменяет только структуру таблицы, не выполняя никаких действий с данными. Данные не записываются на диск сразу после выполнения `ALTER`. Если при чтении из таблицы данные для столбца отсутствуют, они заполняются значениями по умолчанию (путём вычисления выражения по умолчанию, если оно задано, или используя нули или пустые строки). Столбец физически появляется на диске после слияния кусков данных (см. [MergeTree](/engines/table-engines/mergetree-family/mergetree.md)).

Такой подход позволяет выполнить запрос `ALTER` мгновенно, не увеличивая объём старых данных.

Пример:

```sql
ALTER TABLE alter_test ADD COLUMN Added1 UInt32 FIRST;
ALTER TABLE alter_test ADD COLUMN Added2 UInt32 AFTER NestedColumn;
ALTER TABLE alter_test ADD COLUMN Added3 UInt32 AFTER ToDrop;
DESC alter_test FORMAT TSV;
```

```text
Added1  UInt32
CounterID       UInt32
StartDate       Date
UserID  UInt32
VisitID UInt32
NestedColumn.A  Array(UInt8)
NestedColumn.S  Array(String)
Added2  UInt32
ToDrop  UInt32
Added3  UInt32
```


## DROP COLUMN {#drop-column}

```sql
DROP COLUMN [IF EXISTS] name
```

Удаляет столбец с именем `name`. Если указано условие `IF EXISTS`, запрос не вернёт ошибку в случае отсутствия столбца.

Удаляет данные из файловой системы. Поскольку удаляются целые файлы, запрос выполняется практически мгновенно.

:::tip
Невозможно удалить столбец, на который ссылается [материализованное представление](/sql-reference/statements/create/view). В противном случае будет возвращена ошибка.
:::

Пример:

```sql
ALTER TABLE visits DROP COLUMN browser
```


## RENAME COLUMN {#rename-column}

```sql
RENAME COLUMN [IF EXISTS] name to new_name
```

Переименовывает столбец `name` в `new_name`. Если указана конструкция `IF EXISTS`, запрос не вернёт ошибку в случае отсутствия столбца. Поскольку переименование не затрагивает хранимые данные, запрос выполняется практически мгновенно.

**ПРИМЕЧАНИЕ**: Столбцы, указанные в ключевом выражении таблицы (через `ORDER BY` или `PRIMARY KEY`), не могут быть переименованы. Попытка изменить такие столбцы приведёт к ошибке `SQL Error [524]`.

Пример:

```sql
ALTER TABLE visits RENAME COLUMN webBrowser TO browser
```


## CLEAR COLUMN {#clear-column}

```sql
CLEAR COLUMN [IF EXISTS] name IN PARTITION partition_name
```

Очищает все данные в столбце для указанной партиции. Подробнее о задании имени партиции читайте в разделе [Как задать выражение партиции](../alter/partition.md/#how-to-set-partition-expression).

Если указана конструкция `IF EXISTS`, запрос не вернёт ошибку, если столбец не существует.

Пример:

```sql
ALTER TABLE visits CLEAR COLUMN browser IN PARTITION tuple()
```


## COMMENT COLUMN {#comment-column}

```sql
COMMENT COLUMN [IF EXISTS] name 'Text comment'
```

Добавляет комментарий к столбцу. Если указана конструкция `IF EXISTS`, запрос не вернёт ошибку в случае отсутствия столбца.

Каждый столбец может иметь только один комментарий. Если комментарий для столбца уже существует, новый комментарий заменяет предыдущий.

Комментарии хранятся в столбце `comment_expression`, возвращаемом запросом [DESCRIBE TABLE](/sql-reference/statements/describe-table.md).

Пример:

```sql
ALTER TABLE visits COMMENT COLUMN browser 'Этот столбец показывает браузер, использованный для доступа к сайту.'
```


## MODIFY COLUMN {#modify-column}

```sql
MODIFY COLUMN [IF EXISTS] name [type] [default_expr] [codec] [TTL] [settings] [AFTER name_after | FIRST]
ALTER COLUMN [IF EXISTS] name TYPE [type] [default_expr] [codec] [TTL] [settings] [AFTER name_after | FIRST]
```

Этот запрос изменяет свойства столбца `name`:

- Тип

- Выражение по умолчанию

- Кодек сжатия

- TTL

- Настройки на уровне столбца

Примеры изменения кодеков сжатия столбцов см. в разделе [Кодеки сжатия столбцов](../create/table.md/#column_compression_codec).

Примеры изменения TTL столбцов см. в разделе [TTL столбца](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-column-ttl).

Примеры изменения настроек на уровне столбца см. в разделе [Настройки на уровне столбца](/engines/table-engines/mergetree-family/mergetree.md/#column-level-settings).

Если указана конструкция `IF EXISTS`, запрос не вернёт ошибку, если столбец не существует.

При изменении типа значения преобразуются так, как если бы к ним были применены функции [toType](/sql-reference/functions/type-conversion-functions.md). Если изменяется только выражение по умолчанию, запрос не выполняет сложных операций и завершается практически мгновенно.

Пример:

```sql
ALTER TABLE visits MODIFY COLUMN browser Array(String)
```

Изменение типа столбца — единственная сложная операция, которая изменяет содержимое файлов с данными. Для больших таблиц это может занять продолжительное время.

Запрос также может изменить порядок столбцов с помощью конструкции `FIRST | AFTER`, см. описание [ADD COLUMN](#add-column), но в этом случае указание типа столбца обязательно.

Пример:

```sql
CREATE TABLE users (
    c1 Int16,
    c2 String
) ENGINE = MergeTree
ORDER BY c1;

DESCRIBE users;
┌─name─┬─type───┬
│ c1   │ Int16  │
│ c2   │ String │
└──────┴────────┴

ALTER TABLE users MODIFY COLUMN c2 String FIRST;

DESCRIBE users;
┌─name─┬─type───┬
│ c2   │ String │
│ c1   │ Int16  │
└──────┴────────┴

ALTER TABLE users ALTER COLUMN c2 TYPE String AFTER c1;

DESCRIBE users;
┌─name─┬─type───┬
│ c1   │ Int16  │
│ c2   │ String │
└──────┴────────┴
```

Запрос `ALTER` является атомарным. Для таблиц MergeTree он также выполняется без блокировок.

Запрос `ALTER` для изменения столбцов реплицируется. Инструкции сохраняются в ZooKeeper, затем каждая реплика применяет их. Все запросы `ALTER` выполняются в одинаковом порядке. Запрос ожидает завершения соответствующих действий на других репликах. Однако запрос на изменение столбцов в реплицируемой таблице может быть прерван, и все действия будут выполнены асинхронно.

:::note
Будьте осторожны при изменении столбца Nullable на Non-Nullable. Убедитесь, что в нём нет значений NULL, иначе это вызовет проблемы при чтении. В этом случае решением будет остановить мутацию и вернуть столбец обратно к типу Nullable.
:::


## MODIFY COLUMN REMOVE {#modify-column-remove}

Удаляет одно из свойств столбца: `DEFAULT`, `ALIAS`, `MATERIALIZED`, `CODEC`, `COMMENT`, `TTL`, `SETTINGS`.

Синтаксис:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name REMOVE property;
```

**Пример**

Удаление TTL:

```sql
ALTER TABLE table_with_ttl MODIFY COLUMN column_ttl REMOVE TTL;
```

**См. также**

- [REMOVE TTL](ttl.md).


## MODIFY COLUMN MODIFY SETTING {#modify-column-modify-setting}

Изменяет настройку столбца.

Синтаксис:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name MODIFY SETTING name=value,...;
```

**Пример**

Изменение параметра `max_compress_block_size` столбца на `1MB`:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name MODIFY SETTING max_compress_block_size = 1048576;
```


## MODIFY COLUMN RESET SETTING {#modify-column-reset-setting}

Сбрасывает настройку столбца и удаляет объявление настройки из выражения столбца в запросе CREATE таблицы.

Синтаксис:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name RESET SETTING name,...;
```

**Пример**

Сброс настройки столбца `max_compress_block_size` до значения по умолчанию:

```sql
ALTER TABLE table_name MODIFY COLUMN column_name RESET SETTING max_compress_block_size;
```


## MATERIALIZE COLUMN {#materialize-column}

Материализует столбец с выражением значения `DEFAULT` или `MATERIALIZED`. При добавлении материализованного столбца с помощью `ALTER TABLE table_name ADD COLUMN column_name MATERIALIZED` существующие строки без материализованных значений не заполняются автоматически. Оператор `MATERIALIZE COLUMN` можно использовать для перезаписи данных существующего столбца после добавления или обновления выражения `DEFAULT` или `MATERIALIZED` (которое обновляет только метаданные, но не изменяет существующие данные). Обратите внимание, что материализация столбца в ключе сортировки является недопустимой операцией, так как это может нарушить порядок сортировки.
Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations).

Для столбцов с новым или обновлённым выражением значения `MATERIALIZED` все существующие строки перезаписываются.

Для столбцов с новым или обновлённым выражением значения `DEFAULT` поведение зависит от версии ClickHouse:

- В ClickHouse < v24.2 все существующие строки перезаписываются.
- ClickHouse >= v24.2 различает, было ли значение строки в столбце с выражением значения `DEFAULT` явно указано при вставке или нет, то есть вычислено из выражения значения `DEFAULT`. Если значение было явно указано, ClickHouse сохраняет его без изменений. Если значение было вычислено, ClickHouse изменяет его на новое или обновлённое выражение значения `MATERIALIZED`.

Синтаксис:

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE COLUMN col [IN PARTITION partition | IN PARTITION ID 'partition_id'];
```

- Если указана PARTITION, столбец будет материализован только для указанной партиции.

**Пример**

```sql
DROP TABLE IF EXISTS tmp;
SET mutations_sync = 2;
CREATE TABLE tmp (x Int64) ENGINE = MergeTree() ORDER BY tuple() PARTITION BY tuple();
INSERT INTO tmp SELECT * FROM system.numbers LIMIT 5;
ALTER TABLE tmp ADD COLUMN s String MATERIALIZED toString(x);

ALTER TABLE tmp MATERIALIZE COLUMN s;

SELECT groupArray(x), groupArray(s) FROM (select x,s from tmp order by x);

┌─groupArray(x)─┬─groupArray(s)─────────┐
│ [0,1,2,3,4]   │ ['0','1','2','3','4'] │
└───────────────┴───────────────────────┘

ALTER TABLE tmp MODIFY COLUMN s String MATERIALIZED toString(round(100/x));

INSERT INTO tmp SELECT * FROM system.numbers LIMIT 5,5;

SELECT groupArray(x), groupArray(s) FROM tmp;

┌─groupArray(x)─────────┬─groupArray(s)──────────────────────────────────┐
│ [0,1,2,3,4,5,6,7,8,9] │ ['0','1','2','3','4','20','17','14','12','11'] │
└───────────────────────┴────────────────────────────────────────────────┘

ALTER TABLE tmp MATERIALIZE COLUMN s;

SELECT groupArray(x), groupArray(s) FROM tmp;

┌─groupArray(x)─────────┬─groupArray(s)─────────────────────────────────────────┐
│ [0,1,2,3,4,5,6,7,8,9] │ ['inf','100','50','33','25','20','17','14','12','11'] │
└───────────────────────┴───────────────────────────────────────────────────────┘
```

**См. также**

- [MATERIALIZED](/sql-reference/statements/create/view#materialized-view).


## Ограничения {#limitations}

Запрос `ALTER` позволяет создавать и удалять отдельные элементы (столбцы) во вложенных структурах данных, но не целые вложенные структуры данных. Чтобы добавить вложенную структуру данных, можно добавить столбцы с именем вида `name.nested_name` и типом `Array(T)`. Вложенная структура данных эквивалентна нескольким столбцам-массивам с именем, имеющим одинаковый префикс до точки.

Не поддерживается удаление столбцов первичного ключа или ключа сэмплирования (столбцов, которые используются в выражении `ENGINE`). Изменение типа столбцов, входящих в первичный ключ, возможно только в том случае, если это изменение не приводит к модификации данных (например, разрешается добавлять значения в Enum или изменять тип с `DateTime` на `UInt32`).

Если запроса `ALTER` недостаточно для внесения необходимых изменений в таблицу, можно создать новую таблицу, скопировать в неё данные с помощью запроса [INSERT SELECT](/sql-reference/statements/insert-into.md/#inserting-the-results-of-select), затем переключить таблицы с помощью запроса [RENAME](/sql-reference/statements/rename.md/#rename-table) и удалить старую таблицу.

Запрос `ALTER` блокирует все операции чтения и записи для таблицы. Другими словами, если в момент выполнения запроса `ALTER` выполняется длительный запрос `SELECT`, запрос `ALTER` будет ожидать его завершения. В то же время все новые запросы к той же таблице будут ожидать завершения выполнения этого запроса `ALTER`.

Для таблиц, которые не хранят данные самостоятельно (таких как [Merge](/sql-reference/statements/alter/index.md) и [Distributed](/sql-reference/statements/alter/index.md)), `ALTER` только изменяет структуру таблицы и не изменяет структуру подчинённых таблиц. Например, при выполнении ALTER для таблицы `Distributed` необходимо также выполнить `ALTER` для таблиц на всех удалённых серверах.
