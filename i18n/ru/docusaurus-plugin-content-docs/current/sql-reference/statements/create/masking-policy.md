---
description: 'Документация по политике маскирования данных'
sidebar_label: 'MASKING POLICY'
sidebar_position: 42
slug: /sql-reference/statements/create/masking-policy
title: 'CREATE MASKING POLICY'
doc_type: 'reference'
---

import CloudOnlyBadge from '@theme/badges/CloudOnlyBadge';

<CloudOnlyBadge />

Создает политику маскирования, которая позволяет динамически преобразовывать или маскировать значения в столбцах для определенных пользователей или ролей при выполнении ими запроса к таблице.

:::tip
Политики маскирования обеспечивают защиту данных на уровне столбцов, преобразуя конфиденциальные данные во время выполнения запроса без изменения хранимых данных.
:::

Синтаксис:

```sql
CREATE MASKING POLICY [IF NOT EXISTS | OR REPLACE] policy_name ON [database.]table
    UPDATE column1 = expression1 [, column2 = expression2 ...]
    [WHERE condition]
    TO {role1 [, role2 ...] | ALL | ALL EXCEPT role1 [, role2 ...]}
    [PRIORITY priority_number]
```


## Оператор UPDATE \{#update-clause\}

Оператор `UPDATE` указывает, какие столбцы маскировать и как их преобразовывать. В одной политике можно маскировать несколько столбцов.

Примеры:

- Простое маскирование: `UPDATE email = '***masked***'`
- Частичное маскирование: `UPDATE email = concat(substring(email, 1, 3), '***@***.***')`
- Маскирование с использованием хэша: `UPDATE email = concat('masked_', substring(hex(cityHash64(email)), 1, 8))`
- Несколько столбцов: `UPDATE email = '***@***.***', phone = '***-***-****'`

## Оператор WHERE \{#where-clause\}

Необязательный оператор `WHERE` позволяет выполнять условное маскирование на основе значений в строках. Маскирование будет применено только к тем строкам, которые удовлетворяют условию.

Пример:

```sql
CREATE MASKING POLICY mask_high_salaries ON employees
UPDATE salary = 0
WHERE salary > 100000
TO analyst;
```


## Раздел TO \{#to-clause\}

В разделе `TO` указывается, к каким пользователям и ролям должна применяться политика.

- `TO user1, user2`: Применить к указанным пользователям/ролям
- `TO ALL`: Применить ко всем пользователям
- `TO ALL EXCEPT user1, user2`: Применить ко всем пользователям, кроме указанных

:::note
В отличие от политик по строкам, политики маскирования не влияют на пользователей, к которым политика не применяется. Если к пользователю не применяется ни одна политика маскирования, он видит исходные данные.
:::

## Предложение PRIORITY \{#priority-clause\}

Когда несколько политик маскирования нацелены на один и тот же столбец для USER, предложение `PRIORITY` определяет порядок их применения. Политики применяются в порядке от наивысшего приоритета к наименьшему.

Приоритет по умолчанию равен 0. Политики с одинаковым приоритетом применяются в неопределённом порядке.

Пример:

```sql
-- Applied second (lower priority)
CREATE MASKING POLICY mask1 ON users
UPDATE email = 'low@priority.com'
TO analyst
PRIORITY 1;

-- Applied first (higher priority)
CREATE MASKING POLICY mask2 ON users
UPDATE email = 'high@priority.com'
TO analyst
PRIORITY 10;

-- analyst sees 'low@priority.com' because it's applied last
```

:::note Особенности производительности

* Политики маскирования могут влиять на производительность запросов в зависимости от сложности выражения
* Некоторые оптимизации могут быть отключены для таблиц с активными политиками маскирования
  :::
