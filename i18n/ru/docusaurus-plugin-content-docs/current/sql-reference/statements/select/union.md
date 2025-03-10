---
slug: /sql-reference/statements/select/union
sidebar_label: UNION
---


# Оператор UNION

Вы можете использовать `UNION`, явно указывая `UNION ALL` или `UNION DISTINCT`.

Если вы не укажете `ALL` или `DISTINCT`, результат будет зависеть от настройки `union_default_mode`. Различие между `UNION ALL` и `UNION DISTINCT` состоит в том, что `UNION DISTINCT` будет выполнять уникальную трансформацию для результата объединения, это эквивалентно `SELECT DISTINCT` из подзапроса, содержащего `UNION ALL`.

Вы можете использовать `UNION` для объединения любого количества запросов `SELECT`, расширяя их результаты. Пример:

``` sql
SELECT CounterID, 1 AS table, toInt64(count()) AS c
    FROM test.hits
    GROUP BY CounterID

UNION ALL

SELECT CounterID, 2 AS table, sum(Sign) AS c
    FROM test.visits
    GROUP BY CounterID
    HAVING c > 0
```

Столбцы результата сопоставляются по их индексу (порядок внутри `SELECT`). Если имена столбцов не совпадают, имена для окончательного результата берутся из первого запроса.

Приведение типов выполняется для объединений. Например, если два объединяемых запроса имеют одинаковое поле с типами, не являющимися `Nullable` и `Nullable`, но совместимых типов, результирующее поле `UNION` будет иметь тип `Nullable`.

Запросы, являющиеся частями `UNION`, могут быть заключены в круглые скобки. [ORDER BY](../../../sql-reference/statements/select/order-by.md) и [LIMIT](../../../sql-reference/statements/select/limit.md) применяются к отдельным запросам, а не к окончательному результату. Если вам нужно применить преобразование к окончательному результату, вы можете поместить все запросы с `UNION` в подзапрос в разделе [FROM](../../../sql-reference/statements/select/from.md).

Если вы используете `UNION` без явного указания `UNION ALL` или `UNION DISTINCT`, вы можете задать режим объединения с помощью настройки [union_default_mode](/operations/settings/settings#union_default_mode). Значения настройки могут быть `ALL`, `DISTINCT` или пустая строка. Однако если вы используете `UNION` с настройкой `union_default_mode`, установленной на пустую строку, это приведет к выбросу исключения. В следующих примерах показаны результаты запросов с различными значениями настройки.

Запрос:

```sql
SET union_default_mode = 'DISTINCT';
SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 2;
```

Результат:

```text
┌─1─┐
│ 1 │
└───┘
┌─1─┐
│ 2 │
└───┘
┌─1─┐
│ 3 │
└───┘
```

Запрос:

```sql
SET union_default_mode = 'ALL';
SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 2;
```

Результат:

```text
┌─1─┐
│ 1 │
└───┘
┌─1─┐
│ 2 │
└───┘
┌─1─┐
│ 2 │
└───┘
┌─1─┐
│ 3 │
└───┘
```

Запросы, являющиеся частями `UNION/UNION ALL/UNION DISTINCT`, могут выполняться одновременно, и их результаты могут быть объединены.

**Смотрите также**

- [insert_null_as_default](../../../operations/settings/settings.md#insert_null_as_default) настройка.
- [union_default_mode](/operations/settings/settings#union_default_mode) настройка.
