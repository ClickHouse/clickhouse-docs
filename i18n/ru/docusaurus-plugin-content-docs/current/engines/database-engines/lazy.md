---
description: 'Хранит таблицы в оперативной памяти в течение `expiration_time_in_seconds` секунд после последнего обращения. Может использоваться только с таблицами типа Log.'
sidebar_label: 'Lazy'
sidebar_position: 20
slug: /engines/database-engines/lazy
title: 'Lazy'
doc_type: 'reference'
---



# Lazy

Хранит таблицы в оперативной памяти только в течение `expiration_time_in_seconds` секунд после последнего обращения. Может использоваться только с таблицами типа \*Log.

Оптимизирован для хранения множества небольших таблиц \*Log, к которым обращаются с большими интервалами по времени.



## Создание базы данных {#creating-a-database}

```sql
CREATE DATABASE testlazy
ENGINE = Lazy(expiration_time_in_seconds);
```
