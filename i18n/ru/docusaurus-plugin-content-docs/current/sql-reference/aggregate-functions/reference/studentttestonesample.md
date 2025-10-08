---
'description': 'Применяет односторонний t-тест Стьюдента к выборке и известному среднему
  значению популяции.'
'sidebar_label': 'studentTTestOneSample'
'sidebar_position': 195
'slug': '/sql-reference/aggregate-functions/reference/studentttestonesample'
'title': 'studentTTestOneSample'
'doc_type': 'reference'
---
# studentTTestOneSample

Применяет одновыборочный t-тест Стьюдента для определения того, отличается ли среднее значение выборки от известного среднемасштабного значения.

Предполагается нормальность. Нулевая гипотеза заключается в том, что среднее значение выборки равно среднему значению населения.

**Синтаксис**

```sql
studentTTestOneSample([confidence_level])(sample_data, population_mean)
```

Необязательный `confidence_level` позволяет вычислить доверительный интервал.

**Аргументы**

- `sample_data` — Данные выборки. Целое число, Float или Decimal.
- `population_mean` — Известное среднее значение населения для сравнения. Целое число, Float или Decimal (обычно константа).

**Параметры**

- `confidence_level` — Уровень доверия для доверительных интервалов. Float в (0, 1).

Примечания:
- Необходимо как минимум 2 наблюдения; в противном случае результат будет `(nan, nan)` (и интервалы, если они запрошены, будут `nan`).
- Константный или почти константный ввод также вернет `nan` из-за нулевой (или фактически нулевой) стандартной ошибки.

**Возвращаемые значения**

[Tuple](../../../sql-reference/data-types/tuple.md) с двумя или четырьмя элементами (если указан `confidence_level`):

- рассчитанный t-статистика. Float64.
- рассчитанное p-значение (двустороннее). Float64.
- рассчитанный нижний предел доверительного интервала. Float64. (необязательный)
- рассчитанный верхний предел доверительного интервала. Float64. (необязательный)

Доверительные интервалы относятся к среднему значению выборки при заданном уровне доверия.

**Примеры**

Входная таблица:

```text
┌─value─┐
│  20.3 │
│  21.1 │
│  21.7 │
│  19.9 │
│  21.8 │
└───────┘
```

Без доверительного интервала:

```sql
SELECT studentTTestOneSample()(value, 20.0) FROM t;
-- or simply
SELECT studentTTestOneSample(value, 20.0) FROM t;
```

С доверительным интервалом (95%):

```sql
SELECT studentTTestOneSample(0.95)(value, 20.0) FROM t;
```

**Смотрите также**

- [t-тест Стьюдента](https://en.wikipedia.org/wiki/Student%27s_t-test)
- [функция studentTTest](/sql-reference/aggregate-functions/reference/studentttest)