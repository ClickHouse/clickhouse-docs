---
description: 'Удерживает таблицы в оперативной памяти только в течение `expiration_time_in_seconds` секунд после последнего обращения. Может использоваться только с таблицами типа Log.'
sidebar_label: 'Lazy'
sidebar_position: 20
slug: /engines/database-engines/lazy
title: 'Lazy'
doc_type: 'reference'
---

# Lazy \{#lazy\}

Удерживает таблицы в RAM только в течение `expiration_time_in_seconds` секунд после последнего обращения. Может использоваться только с таблицами типа *Log.

Оптимизирован для хранения множества небольших таблиц *Log, между обращениями к которым проходят большие промежутки времени.

## Создание базы данных \{#creating-a-database\}

```sql
CREATE DATABASE testlazy 
ENGINE = Lazy(expiration_time_in_seconds);
```
