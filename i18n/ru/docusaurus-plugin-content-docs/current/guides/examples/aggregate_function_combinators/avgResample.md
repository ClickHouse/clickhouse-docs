---
'slug': '/examples/aggregate-function-combinators/avgResample'
'title': 'avgResample'
'description': 'Пример использования комбинатора Resample с avg'
'keywords':
- 'avg'
- 'Resample'
- 'combinator'
- 'examples'
- 'avgResample'
'sidebar_label': 'avgResample'
'doc_type': 'reference'
---


# countResample {#countResample}

## Описание {#description}

Комбинатор [`Resample`](/sql-reference/aggregate-functions/combinators#-resample) 
может быть применен к агрегатной функции [`count`](/sql-reference/aggregate-functions/reference/count)
для подсчета значений заданной ключевой колонки в фиксированном количестве
интервалов (`N`).

## Пример использования {#example-usage}

### Простой пример {#basic-example}

Давайте рассмотрим пример. Мы создадим таблицу, которая содержит `name`, `age` и
`wage` сотрудников и вставим в нее некоторые данные:

```sql
CREATE TABLE employee_data 
(
    name String,
    age UInt8,
    wage Float32
) 
ENGINE = MergeTree()
ORDER BY tuple()

INSERT INTO employee_data (name, age, wage) VALUES
    ('John', 16, 10.0),
    ('Alice', 30, 15.0),
    ('Mary', 35, 8.0),
    ('Evelyn', 48, 11.5),
    ('David', 62, 9.9),
    ('Brian', 60, 16.0);
```

Теперь давайте получим среднюю заработную плату людей, чей возраст находится в интервалах `[30,60)` 
и `[60,75)` (`[` исключает, а `)` включает). Поскольку мы используем целочисленное 
представление возраста, мы получаем возраст в интервалах `[30, 59]` и `[60,74]`. 
Для этого мы применяем комбинатор `Resample` к агрегатной функции `avg`.

```sql
WITH avg_wage AS
(
    SELECT avgResample(30, 75, 30)(wage, age) AS original_avg_wage
    FROM employee_data
)
SELECT
    arrayMap(x -> round(x, 3), original_avg_wage) AS avg_wage_rounded
FROM avg_wage;
```

```response
┌─avg_wage_rounded─┐
│ [11.5,12.95]     │
└──────────────────┘
```

## См. также {#see-also}
- [`count`](/sql-reference/aggregate-functions/reference/count)
- [`Resample combinator`](/sql-reference/aggregate-functions/combinators#-resample)
