---
description: 'Документация по оператору UNION'
sidebar_label: 'UNION'
slug: /sql-reference/statements/select/union
title: 'Оператор UNION'
---


# Оператор UNION

Вы можете использовать `UNION`, явно указывая `UNION ALL` или `UNION DISTINCT`.

Если вы не укажете `ALL` или `DISTINCT`, это будет зависеть от настройки `union_default_mode`. Разница между `UNION ALL` и `UNION DISTINCT` заключается в том, что `UNION DISTINCT` выполнит преобразование для получения отличительных значений результата объединения, что эквивалентно `SELECT DISTINCT` из подзапроса, содержащего `UNION ALL`.

Вы можете использовать `UNION`, чтобы объединить любое количество запросов `SELECT`, расширяя их результаты. Пример:

```sql
SELECT CounterID, 1 AS table, toInt64(count()) AS c
    FROM test.hits
    GROUP BY CounterID

UNION ALL

SELECT CounterID, 2 AS table, sum(Sign) AS c
    FROM test.visits
    GROUP BY CounterID
    HAVING c > 0
```

Результирующие столбцы сопоставляются по их индексу (порядок внутри `SELECT`). Если имена столбцов не совпадают, имена для конечного результата берутся из первого запроса.

Для объединений выполняется приведение типов. Например, если два объединяемых запроса имеют одинаковое поле с нессылочными и ссылочными типами из совместимого типа, результирующее поле `UNION` будет иметь ссылочный тип.

Запросы, которые являются частями `UNION`, могут быть заключены в круглые скобки. [ORDER BY](../../../sql-reference/statements/select/order-by.md) и [LIMIT](../../../sql-reference/statements/select/limit.md) применяются к отдельным запросам, а не к итоговому результату. Если вам необходимо применить преобразование к конечному результату, вы можете поместить все запросы с `UNION` в подзапрос в разделе [FROM](../../../sql-reference/statements/select/from.md).

Если вы используете `UNION` без явного указания `UNION ALL` или `UNION DISTINCT`, вы можете установить режим объединения с помощью настройки [union_default_mode](/operations/settings/settings#union_default_mode). Значения настройки могут быть `ALL`, `DISTINCT` или пустая строка. Однако, если вы используете `UNION` с настройкой `union_default_mode`, установленной в пустую строку, это приведет к выбросу исключения. Следующие примеры демонстрируют результаты запросов с разными значениями настройки.

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

Запросы, которые являются частями `UNION/UNION ALL/UNION DISTINCT`, могут выполняться одновременно, и их результаты могут быть объединены.

**Смотрите также**

- [insert_null_as_default](../../../operations/settings/settings.md#insert_null_as_default) настройка.
- [union_default_mode](/operations/settings/settings#union_default_mode) настройка.
