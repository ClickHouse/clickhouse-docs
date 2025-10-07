---
'slug': '/guides/developer/merge-table-function'
'sidebar_label': 'Merge таблица функция'
'title': 'Merge таблица функция'
'description': 'Запрос нескольких таблиц одновременно.'
'doc_type': 'reference'
---
Функция [merge table](https://clickhouse.com/docs/sql-reference/table-functions/merge) позволяет нам выполнять запросы к нескольким таблицам параллельно. Она делает это, создавая временную таблицу [Merge](https://clickhouse.com/docs/engines/table-engines/special/merge) и выводя структуру этой таблицы, беря объединение их колонок и выводя общие типы.

<iframe width="768" height="432" src="https://www.youtube.com/embed/b4YfRhD9SSI?si=MuoDwDWeikAV5ttk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Настройка таблиц {#setup-tables}

Мы собираемся узнать, как использовать эту функцию с помощью [набора данных по теннису Джеффа Сакмана](https://github.com/JeffSackmann/tennis_atp). Мы будем обрабатывать CSV-файлы, содержащие матчи, начиная с 1960-х годов, но создадим немного другую схему для каждого десятилетия. Мы также добавим пару дополнительных колонок для десятилетия 1990-х годов.

Импортируемые операторы показаны ниже:

```sql
CREATE OR REPLACE TABLE atp_matches_1960s ORDER BY tourney_id AS
SELECT tourney_id, surface, winner_name, loser_name, winner_seed, loser_seed, score
FROM url('https://raw.githubusercontent.com/JeffSackmann/tennis_atp/refs/heads/master/atp_matches_{1968..1969}.csv')
SETTINGS schema_inference_make_columns_nullable=0, 
         schema_inference_hints='winner_seed Nullable(String), loser_seed Nullable(UInt8)';

CREATE OR REPLACE TABLE atp_matches_1970s ORDER BY tourney_id AS 
SELECT tourney_id, surface, winner_name, loser_name, winner_seed, loser_seed, splitByWhitespace(score) AS score
FROM url('https://raw.githubusercontent.com/JeffSackmann/tennis_atp/refs/heads/master/atp_matches_{1970..1979}.csv')
SETTINGS schema_inference_make_columns_nullable=0, 
         schema_inference_hints='winner_seed Nullable(UInt8), loser_seed Nullable(UInt8)';

CREATE OR REPLACE TABLE atp_matches_1980s ORDER BY tourney_id AS
SELECT tourney_id, surface, winner_name, loser_name, winner_seed, loser_seed, splitByWhitespace(score) AS score
FROM url('https://raw.githubusercontent.com/JeffSackmann/tennis_atp/refs/heads/master/atp_matches_{1980..1989}.csv')
SETTINGS schema_inference_make_columns_nullable=0,
         schema_inference_hints='winner_seed Nullable(UInt16), loser_seed Nullable(UInt16)';

CREATE OR REPLACE TABLE atp_matches_1990s ORDER BY tourney_id AS
SELECT tourney_id, surface, winner_name, loser_name, winner_seed, loser_seed, splitByWhitespace(score) AS score,
       toBool(arrayExists(x -> position(x, 'W/O') > 0, score))::Nullable(bool) AS walkover,
       toBool(arrayExists(x -> position(x, 'RET') > 0, score))::Nullable(bool) AS retirement
FROM url('https://raw.githubusercontent.com/JeffSackmann/tennis_atp/refs/heads/master/atp_matches_{1990..1999}.csv')
SETTINGS schema_inference_make_columns_nullable=0,
         schema_inference_hints='winner_seed Nullable(UInt16), loser_seed Nullable(UInt16), surface Enum(\'Hard\', \'Grass\', \'Clay\', \'Carpet\')';
```

## Схема нескольких таблиц {#schema-multiple-tables}
 
Мы можем выполнить следующий запрос, чтобы перечислить колонки в каждой таблице вместе с их типами бок о бок, чтобы было легче увидеть различия.

```sql
SELECT * EXCEPT(position) FROM (
    SELECT position, name,
       any(if(table = 'atp_matches_1960s', type, null)) AS 1960s,
       any(if(table = 'atp_matches_1970s', type, null)) AS 1970s,
       any(if(table = 'atp_matches_1980s', type, null)) AS 1980s,
       any(if(table = 'atp_matches_1990s', type, null)) AS 1990s
    FROM system.columns
    WHERE database = currentDatabase() AND table LIKE 'atp_matches%'
    GROUP BY ALL
    ORDER BY position ASC
)
SETTINGS output_format_pretty_max_value_width=25;
```

```text
┌─name────────┬─1960s────────────┬─1970s───────────┬─1980s────────────┬─1990s─────────────────────┐
│ tourney_id  │ String           │ String          │ String           │ String                    │
│ surface     │ String           │ String          │ String           │ Enum8('Hard' = 1, 'Grass'⋯│
│ winner_name │ String           │ String          │ String           │ String                    │
│ loser_name  │ String           │ String          │ String           │ String                    │
│ winner_seed │ Nullable(String) │ Nullable(UInt8) │ Nullable(UInt16) │ Nullable(UInt16)          │
│ loser_seed  │ Nullable(UInt8)  │ Nullable(UInt8) │ Nullable(UInt16) │ Nullable(UInt16)          │
│ score       │ String           │ Array(String)   │ Array(String)    │ Array(String)             │
│ walkover    │ ᴺᵁᴸᴸ             │ ᴺᵁᴸᴸ            │ ᴺᵁᴸᴸ             │ Nullable(Bool)            │
│ retirement  │ ᴺᵁᴸᴸ             │ ᴺᵁᴸᴸ            │ ᴺᵁᴸᴸ             │ Nullable(Bool)            │
└─────────────┴──────────────────┴─────────────────┴──────────────────┴───────────────────────────┘
```

Давайте рассмотрим различия:

* В 1970-х изменен тип `winner_seed` с `Nullable(String)` на `Nullable(UInt8)` и `score` с `String` на `Array(String)`.
* В 1980-х изменяется `winner_seed` и `loser_seed` с `Nullable(UInt8)` на `Nullable(UInt16)`.
* В 1990-х изменён тип `surface` с `String` на `Enum('Hard', 'Grass', 'Clay', 'Carpet')` и добавлены колонки `walkover` и `retirement`.

## Запрос к нескольким таблицам с помощью merge {#querying-multiple-tables}

Давайте напишем запрос, чтобы найти матчи, которые Джон МаКенро выиграл у кого-то, кто был посеян под №1:

```sql
SELECT loser_name, score
FROM merge('atp_matches*')
WHERE winner_name = 'John McEnroe'
AND loser_seed = 1;
```

```text
┌─loser_name────┬─score───────────────────────────┐
│ Bjorn Borg    │ ['6-3','6-4']                   │
│ Bjorn Borg    │ ['7-6','6-1','6-7','5-7','6-4'] │
│ Bjorn Borg    │ ['7-6','6-4']                   │
│ Bjorn Borg    │ ['4-6','7-6','7-6','6-4']       │
│ Jimmy Connors │ ['6-1','6-3']                   │
│ Ivan Lendl    │ ['6-2','4-6','6-3','6-7','7-6'] │
│ Ivan Lendl    │ ['6-3','3-6','6-3','7-6']       │
│ Ivan Lendl    │ ['6-1','6-3']                   │
│ Stefan Edberg │ ['6-2','6-3']                   │
│ Stefan Edberg │ ['7-6','6-2']                   │
│ Stefan Edberg │ ['6-2','6-2']                   │
│ Jakob Hlasek  │ ['6-3','7-6']                   │
└───────────────┴─────────────────────────────────┘
```

Теперь предположим, что мы хотим отфильтровать эти матчи, чтобы найти те, где МаКенро был посеян под №3 или ниже. Это немного сложнее, потому что `winner_seed` использует разные типы в различных таблицах:

```sql
SELECT loser_name, score, winner_seed
FROM merge('atp_matches*')
WHERE winner_name = 'John McEnroe'
AND loser_seed = 1
AND multiIf(
  variantType(winner_seed) = 'UInt8', variantElement(winner_seed, 'UInt8') >= 3,
  variantType(winner_seed) = 'UInt16', variantElement(winner_seed, 'UInt16') >= 3,
  variantElement(winner_seed, 'String')::UInt16 >= 3
);
```

Мы используем функцию [`variantType`](/docs/sql-reference/functions/other-functions#varianttype), чтобы проверить тип `winner_seed` для каждой строки, а затем [`variantElement`](/docs/sql-reference/functions/other-functions#variantelement), чтобы извлечь основное значение. Когда тип — это `String`, мы приводим его к числу и затем проводим сравнение. Результат выполнения запроса показан ниже:

```text
┌─loser_name────┬─score─────────┬─winner_seed─┐
│ Bjorn Borg    │ ['6-3','6-4'] │ 3           │
│ Stefan Edberg │ ['6-2','6-3'] │ 6           │
│ Stefan Edberg │ ['7-6','6-2'] │ 4           │
│ Stefan Edberg │ ['6-2','6-2'] │ 7           │
└───────────────┴───────────────┴─────────────┘
```

## Из какой таблицы приходят строки при использовании merge? {#which-table-merge}

Что если мы хотим узнать, из какой таблицы приходят строки? Мы можем использовать виртуальную колонку `_table` для этого, как показано в следующем запросе:

```sql
SELECT _table, loser_name, score, winner_seed
FROM merge('atp_matches*')
WHERE winner_name = 'John McEnroe'
AND loser_seed = 1
AND multiIf(
  variantType(winner_seed) = 'UInt8', variantElement(winner_seed, 'UInt8') >= 3,
  variantType(winner_seed) = 'UInt16', variantElement(winner_seed, 'UInt16') >= 3,
  variantElement(winner_seed, 'String')::UInt16 >= 3
);
```

```text
┌─_table────────────┬─loser_name────┬─score─────────┬─winner_seed─┐
│ atp_matches_1970s │ Bjorn Borg    │ ['6-3','6-4'] │ 3           │
│ atp_matches_1980s │ Stefan Edberg │ ['6-2','6-3'] │ 6           │
│ atp_matches_1980s │ Stefan Edberg │ ['7-6','6-2'] │ 4           │
│ atp_matches_1980s │ Stefan Edberg │ ['6-2','6-2'] │ 7           │
└───────────────────┴───────────────┴───────────────┴─────────────┘
```

Мы также можем использовать эту виртуальную колонку как часть запроса для подсчета значений в колонке `walkover`:

```sql
SELECT _table, walkover, count()
FROM merge('atp_matches*')
GROUP BY ALL
ORDER BY _table;
```

```text
┌─_table────────────┬─walkover─┬─count()─┐
│ atp_matches_1960s │ ᴺᵁᴸᴸ     │    7542 │
│ atp_matches_1970s │ ᴺᵁᴸᴸ     │   39165 │
│ atp_matches_1980s │ ᴺᵁᴸᴸ     │   36233 │
│ atp_matches_1990s │ true     │     128 │
│ atp_matches_1990s │ false    │   37022 │
└───────────────────┴──────────┴─────────┘
```

Мы видим, что колонка `walkover` равна `NULL` для всего, кроме `atp_matches_1990s`. Нам нужно обновить наш запрос, чтобы проверить, содержит ли колонка `score` строку `W/O`, если колонка `walkover` равна `NULL`:

```sql
SELECT _table,
   multiIf(
     walkover IS NOT NULL,
     walkover,
     variantType(score) = 'Array(String)',
     toBool(arrayExists(
        x -> position(x, 'W/O') > 0,
        variantElement(score, 'Array(String)')
     )),
     variantElement(score, 'String') LIKE '%W/O%'
   ),
   count()
FROM merge('atp_matches*')
GROUP BY ALL
ORDER BY _table;
```

Если основной тип `score` — это `Array(String)`, нам нужно пройти по массиву и искать `W/O`, в то время как если у него тип `String`, мы можем просто искать `W/O` в строке.

```text
┌─_table────────────┬─multiIf(isNo⋯, '%W/O%'))─┬─count()─┐
│ atp_matches_1960s │ true                     │     242 │
│ atp_matches_1960s │ false                    │    7300 │
│ atp_matches_1970s │ true                     │     422 │
│ atp_matches_1970s │ false                    │   38743 │
│ atp_matches_1980s │ true                     │      92 │
│ atp_matches_1980s │ false                    │   36141 │
│ atp_matches_1990s │ true                     │     128 │
│ atp_matches_1990s │ false                    │   37022 │
└───────────────────┴──────────────────────────┴─────────┘
```