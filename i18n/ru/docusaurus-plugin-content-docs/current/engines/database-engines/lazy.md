---
slug: '/engines/database-engines/lazy'
sidebar_label: Lazy
sidebar_position: 20
description: 'Держит таблицы в ОЗУ только `expiration_time_in_seconds` секунд после'
title: Lazy
doc_type: reference
---
# Lazy

Хранит таблицы в ОЗУ только `expiration_time_in_seconds` секунд после последнего доступа. Может использоваться только с \*Log таблицами.

Оптимизирован для хранения множества небольших \*Log таблиц, для которых существует длительный интервал времени между обращениями.

## Создание базы данных {#creating-a-database}

```sql
CREATE DATABASE testlazy 
ENGINE = Lazy(expiration_time_in_seconds);
```