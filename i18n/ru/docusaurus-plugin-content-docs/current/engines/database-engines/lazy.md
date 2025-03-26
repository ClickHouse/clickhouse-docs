---
description: 'Держит таблицы в ОЗУ только `expiration_time_in_seconds` секунд после
  последнего доступа. Может использоваться только с таблицами типа Log.'
sidebar_label: 'Ленивая'
sidebar_position: 20
slug: /engines/database-engines/lazy
title: 'Ленивая'
---


# Ленивая

Держит таблицы в ОЗУ только `expiration_time_in_seconds` секунд после последнего доступа. Может использоваться только с \*Log таблицами.

Оптимизировано для хранения множества маленьких \*Log таблиц, для которых существует длинный временной интервал между доступами.

## Создание базы данных {#creating-a-database}

```sql
CREATE DATABASE testlazy 
ENGINE = Lazy(expiration_time_in_seconds);
```
