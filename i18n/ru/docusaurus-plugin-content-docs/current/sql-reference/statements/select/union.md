---
description: 'Документация по оператору UNION'
sidebar_label: 'UNION'
slug: /sql-reference/statements/select/union
title: 'Оператор UNION'
doc_type: 'reference'
---

# Оператор UNION {#union-clause}

Вы можете использовать `UNION` с явным указанием `UNION ALL` или `UNION DISTINCT`.

Если вы не укажете `ALL` или `DISTINCT`, поведение будет зависеть от настройки `union_default_mode`. Разница между `UNION ALL` и `UNION DISTINCT` заключается в том, что `UNION DISTINCT` выполняет операцию удаления дубликатов над результатом объединения; это эквивалентно выполнению `SELECT DISTINCT` к подзапросу, содержащему `UNION ALL`.

Вы можете использовать `UNION` для объединения любого количества запросов `SELECT`, объединяя их результаты. Пример:

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

Столбцы результата сопоставляются по их порядковому номеру (порядку внутри `SELECT`). Если имена столбцов не совпадают, имена для итогового результата берутся из первого запроса.

Для объединений выполняется приведение типов. Например, если два объединяемых запроса имеют одно и то же поле с типами non-`Nullable` и `Nullable`, происходящими из совместимого типа, то результирующий `UNION` будет иметь поле типа `Nullable`.

Запросы, входящие в `UNION`, можно заключать в круглые скобки. [ORDER BY](../../../sql-reference/statements/select/order-by.md) и [LIMIT](../../../sql-reference/statements/select/limit.md) применяются к отдельным запросам, а не к итоговому результату. Если нужно применить преобразование к итоговому результату, вы можете поместить все запросы с `UNION` во вложенный запрос в предложении [FROM](../../../sql-reference/statements/select/from.md).

Если вы используете `UNION` без явного указания `UNION ALL` или `UNION DISTINCT`, вы можете задать режим объединения с помощью настройки [union&#95;default&#95;mode](/operations/settings/settings#union_default_mode). Значениями настройки могут быть `ALL`, `DISTINCT` или пустая строка. Однако, если вы используете `UNION` при установленном значении `union_default_mode` в пустую строку, будет сгенерировано исключение. Следующие примеры демонстрируют результаты запросов при разных значениях этой настройки.

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

Запросы, являющиеся частями `UNION/UNION ALL/UNION DISTINCT`, могут выполняться параллельно, а их результаты — объединяться.

**См. также**

* Настройка [insert&#95;null&#95;as&#95;default](../../../operations/settings/settings.md#insert_null_as_default).
* Настройка [union&#95;default&#95;mode](/operations/settings/settings#union_default_mode).
