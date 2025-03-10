---
slug: /engines/database-engines/lazy
sidebar_label: 'Ленивый'
sidebar_position: 20
title: 'Ленивый'
description: 'Хранит таблицы в оперативной памяти только `expiration_time_in_seconds` секунд после последнего доступа. Может использоваться только с таблицами типа Log.'
---


# Ленивый

Хранит таблицы в оперативной памяти только `expiration_time_in_seconds` секунд после последнего доступа. Может использоваться только с \*таблицами Log.

Он оптимизирован для хранения множества маленьких \*таблиц Log, для которых существует долгий интервал времени между доступами.

## Создание базы данных {#creating-a-database}

```sql
CREATE DATABASE testlazy 
ENGINE = Lazy(expiration_time_in_seconds);
```
