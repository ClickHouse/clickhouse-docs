---
'slug': '/best-practices/select-data-types'
'sidebar_position': 10
'sidebar_label': '选择数据类型'
'title': '选择数据类型'
'description': '页面描述如何在 ClickHouse 中选择数据类型'
'keywords':
- 'data types'
'doc_type': 'reference'
---

import NullableColumns from '@site/i18n/ru/docusaurus-plugin-content-docs/current/best-practices/_snippets/_avoid_nullable_columns.md';

Одной из основных причин высокой производительности запросов в ClickHouse является его эффективное сжатие данных. Меньший объем данных на диске приводит к более быстрому выполнению запросов и вставкам за счет минимизации нагрузки на ввод/вывод. Столбцовая архитектура ClickHouse естественным образом располагает похожие данные рядом, что позволяет алгоритмам сжатия и кодекам значительно уменьшать размер данных. Чтобы максимизировать преимущества этого сжатия, важно тщательно выбирать подходящие типы данных.

Эффективность сжатия в ClickHouse зависит в основном от трех факторов: ключа сортировки, типов данных и кодеков, которые все определяются через схему таблицы. Выбор оптимальных типов данных приводит к немедленным улучшениям как в хранении, так и в производительности запросов.

Некоторые простые рекомендации могут значительно улучшить схему:

* **Используйте строгие типы:** Всегда выбирайте правильный тип данных для колонок. Числовые и даты должны использовать соответствующие числовые и дата-типы, а не универсальные типы String. Это обеспечивает правильную семантику для фильтрации и агрегации.

* **Избегайте nullable колонок:** Nullable колонки ввели дополнительную нагрузку за счет сохранения отдельных колонок для отслеживания пустых значений. Используйте Nullable только в том случае, если необходимо явно различать пустые и null-состояния. В противном случае по умолчанию или значения, эквивалентные нулю, обычно достаточны. Для получения дополнительной информации о том, почему этот тип следует избегать, если он не нужен, см. [Избегайте nullable колонок](/best-practices/select-data-types#avoid-nullable-columns).

* **Минимизируйте точность чисел:** Выбирайте числовые типы с минимальной шириной в битах, которые все еще допускают ожидаемый диапазон данных. Например, предпочитайте [UInt16 вместо Int32](/sql-reference/data-types/int-uint), если отрицательные значения не нужны, и диапазон вписывается в 0–65535.

* **Оптимизируйте точность дат и времени:** Выбирайте наиболее грубый тип даты или datetime, который соответствует требованиям запроса. Используйте Date или Date32 для полей только с датами и предпочитайте DateTime вместо DateTime64, если точность до миллисекунд или лучше не требуется.

* **Используйте LowCardinality и специализированные типы:** Для колонок с менее чем примерно 10,000 уникальными значениями используйте LowCardinality типы для значительного снижения объема хранения за счет кодирования словарей. Аналогично, используйте FixedString только тогда, когда значения колонок являются строго строками фиксированной длины (например, коды стран или валют), и предпочитайте Enum типы для колонок с конечным набором возможных значений для обеспечения эффективного хранения и встроенной валидации данных.

* **Enums для валидации данных:** Тип Enum может использоваться для эффективного кодирования перечисляемых типов. Enums могут быть 8 или 16 бит в зависимости от количества уникальных значений, которые они должны хранить. Рассмотрите возможность использования этого типа, если вам необходима связанная валидация во время вставки (некорректные значения будут отклонены) или вы хотите выполнять запросы, которые используют естественный порядок значений Enum, например, представьте колонку обратной связи, содержащую ответы пользователей Enum(':(' = 1, ':|' = 2, ':)' = 3).

## Пример {#example}

ClickHouse предлагает встроенные инструменты для упрощения оптимизации типов. Например, вывод схемы может автоматически определить начальные типы. Рассмотрим набор данных Stack Overflow, доступный в публичном формате Parquet. Запуск простого вывода схемы через команду [`DESCRIBE`](/sql-reference/statements/describe-table) предоставляет начальную не оптимизированную схему.

:::note
По умолчанию ClickHouse сопоставляет эти типы с эквивалентными Nullable типов. Это предпочтительно, так как схема основана только на выборке строк.
:::

```sql
DESCRIBE TABLE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')
SETTINGS describe_compact_output = 1

┌─name───────────────────────┬─type──────────────────────────────┐
│ Id                         │ Nullable(Int64)                   │
│ PostTypeId                 │ Nullable(Int64)                   │
│ AcceptedAnswerId           │ Nullable(Int64)                   │
│ CreationDate               │ Nullable(DateTime64(3, 'UTC'))    │
│ Score                      │ Nullable(Int64)                   │
│ ViewCount                  │ Nullable(Int64)                   │
│ Body                       │ Nullable(String)                  │
│ OwnerUserId                │ Nullable(Int64)                   │
│ OwnerDisplayName           │ Nullable(String)                  │
│ LastEditorUserId           │ Nullable(Int64)                   │
│ LastEditorDisplayName      │ Nullable(String)                  │
│ LastEditDate               │ Nullable(DateTime64(3, 'UTC'))    │
│ LastActivityDate           │ Nullable(DateTime64(3, 'UTC'))    │
│ Title                      │ Nullable(String)                  │
│ Tags                       │ Nullable(String)                  │
│ AnswerCount                │ Nullable(Int64)                   │
│ CommentCount               │ Nullable(Int64)                   │
│ FavoriteCount              │ Nullable(Int64)                   │
│ ContentLicense             │ Nullable(String)                  │
│ ParentId                   │ Nullable(String)                  │
│ CommunityOwnedDate         │ Nullable(DateTime64(3, 'UTC'))    │
│ ClosedDate                 │ Nullable(DateTime64(3, 'UTC'))    │
└────────────────────────────┴───────────────────────────────────┘

22 rows in set. Elapsed: 0.130 sec.
```

:::note
Обратите внимание, что мы используем шаблон glob *.parquet для чтения всех файлов в папке stackoverflow/parquet/posts.
:::

Применяя наши простые правила к нашей таблице постов, мы можем определить оптимальный тип для каждой колонки:

| Колонка                | Числовая | Мин, Мак                                                            | Уникальные Значения | Nulls | Комментарий                                                                                    | Оптимизированный Тип                              |
|-----------------------|----------|---------------------------------------------------------------------|---------------------|-------|------------------------------------------------------------------------------------------------|---------------------------------------------------|
| `PostTypeId`             | Да       | 1, 8                                                                 | 8                   | Нет   |                                                                                                | `Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8)` |
| `AcceptedAnswerId`      | Да       | 0, 78285170                                                         | 12282094            | Да    | Различать Null с 0 значением                                                                  | UInt32                                            |
| `CreationDate`           | Нет      | 2008-07-31 21:42:52.667000000, 2024-03-31 23:59:17.697000000        | -                   | Нет   | Точность до миллисекунд не требуется, используйте DateTime                                   | DateTime                                          |
| `Score`                  | Да       | -217, 34970                                                         | 3236                | Нет   |                                                                                                | Int32                                             |
| `ViewCount`              | Да       | 2, 13962748                                                         | 170867              | Нет   |                                                                                                | UInt32                                            |
| `Body`                   | Нет      | -                                                                   | -                   | Нет   |                                                                                                | String                                            |
| `OwnerUserId`            | Да       | -1, 4056915                                                         | 6256237             | Да    |                                                                                                | Int32                                             |
| `OwnerDisplayName`       | Нет      | -                                                                   | 181251              | Да    | Рассмотрите Null как пустую строку                                                            | String                                            |
| `LastEditorUserId`       | Да       | -1, 9999993                                                         | 1104694             | Да    | 0 - неиспользуемое значение может быть использовано для Nulls                                 | Int32                                             |
| `LastEditorDisplayName`  | Нет      | -                                                                   | 70952               | Да    | Рассмотрите Null как пустую строку. Испытан LowCardinality и без выгоды                      | String                                            |
| `LastEditDate`           | Нет      | 2008-08-01 13:24:35.051000000, 2024-04-06 21:01:22.697000000        | -                   | Нет   | Точность до миллисекунд не требуется, используйте DateTime                                   | DateTime                                          |
| `LastActivityDate`       | Нет      | 2008-08-01 12:19:17.417000000, 2024-04-06 21:01:22.697000000        | -                   | Нет   | Точность до миллисекунд не требуется, используйте DateTime                                   | DateTime                                          |
| `Title`                  | Нет      | -                                                                   | -                   | Нет   | Рассмотрите Null как пустую строку                                                             | String                                            |
| `Tags`                   | Нет      | -                                                                   | -                   | Нет   | Рассмотрите Null как пустую строку                                                             | String                                            |
| `AnswerCount`            | Да       | 0, 518                                                              | 216                 | Нет   | Рассматривайте Null и 0 как равные                                                            | UInt16                                            |
| `CommentCount`           | Да       | 0, 135                                                              | 100                 | Нет   | Рассматривайте Null и 0 как равные                                                            | UInt8                                             |
| `FavoriteCount`          | Да       | 0, 225                                                              | 6                   | Да    | Рассматривайте Null и 0 как равные                                                            | UInt8                                             |
| `ContentLicense`         | Нет      | -                                                                   | 3                   | Нет   | LowCardinality превосходит FixedString                                                        | LowCardinality(String)                            |
| `ParentId`               | Нет      | -                                                                   | 20696028            | Да    | Рассматривайте Null как пустую строку                                                          | String                                            |
| `CommunityOwnedDate`     | Нет      | 2008-08-12 04:59:35.017000000, 2024-04-01 05:36:41.380000000        | -                   | Да    | Рассматривайте значение по умолчанию 1970-01-01 для Nulls. Точность до миллисекунд не требуется, используйте DateTime | DateTime                                          |
| `ClosedDate`             | Нет      | 2008-09-04 20:56:44, 2024-04-06 18:49:25.393000000                  | -                   | Да    | Рассматривайте значение по умолчанию 1970-01-01 для Nulls. Точность до миллисекунд не требуется, используйте DateTime | DateTime                                          |

:::note tip
Определение типа для колонки зависит от понимания ее числового диапазона и количества уникальных значений. Чтобы найти диапазон всех колонок и количество различных значений, пользователи могут использовать простой запрос `SELECT * APPLY min, * APPLY max, * APPLY uniq FROM table FORMAT Vertical`. Мы рекомендуем выполнять это на меньшем подмножестве данных, так как это может быть дорогостоящим.
:::

Это дает следующую оптимизированную схему (с учетом типов):

```sql
CREATE TABLE posts
(
   Id Int32,
   PostTypeId Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 
   'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
   AcceptedAnswerId UInt32,
   CreationDate DateTime,
   Score Int32,
   ViewCount UInt32,
   Body String,
   OwnerUserId Int32,
   OwnerDisplayName String,
   LastEditorUserId Int32,
   LastEditorDisplayName String,
   LastEditDate DateTime,
   LastActivityDate DateTime,
   Title String,
   Tags String,
   AnswerCount UInt16,
   CommentCount UInt8,
   FavoriteCount UInt8,
   ContentLicense LowCardinality(String),
   ParentId String,
   CommunityOwnedDate DateTime,
   ClosedDate DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
```

## Избегайте nullable колонок {#avoid-nullable-columns}

<NullableColumns />
