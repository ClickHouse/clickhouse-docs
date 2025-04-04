---
description: 'Сохраняет таблицы в ОЗУ только `expiration_time_in_seconds` секунд после
  последнего доступа. Можно использовать только с таблицами типа Log.'
sidebar_label: 'Lazy'
sidebar_position: 20
slug: /engines/database-engines/lazy
title: 'Lazy'
---

# Lazy

Сохраняет таблицы в ОЗУ только `expiration_time_in_seconds` секунд после последнего доступа. Можно использовать только с *Log таблицами.

Этот движок оптимизирован для хранения многих небольших *Log таблиц, для которых существует длительный временной интервал между доступами.

## Creating a Database {#creating-a-database}

```sql
CREATE DATABASE testlazy 
ENGINE = Lazy(expiration_time_in_seconds);
```
