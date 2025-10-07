---
'slug': '/integrations/rocksdb'
'sidebar_label': 'RocksDB'
'title': 'RocksDB'
'hide_title': true
'description': 'Страница, описывающая RocksDBTableEngine'
'doc_type': 'reference'
---

import RocksDBTableEngine from '@site/i18n/ru/docusaurus-plugin-content-docs/current/engines/table-engines/integrations/embedded-rocksdb.md';

```mdx
---
title: 'RocksDBTableEngine'
sidebar_label: 'RocksDBTableEngine'
keywords: ['RocksDBTableEngine', 'ClickHouse', 'database', 'table engine']
description: 'Документация по движку таблиц RocksDBTableEngine в ClickHouse.'
---


# RocksDBTableEngine

`RocksDBTableEngine` является одним из движков таблиц, доступных в ClickHouse. Он использует RocksDB в качестве механизма хранения, что обеспечивает высокую скорость операций вставки и эффективное хранение данных.

## Основные характеристики

- **Эффективное хранение**: Поскольку `RocksDB` использует метод хранения данных на основе ключ-значение, это позволяет эффективно управлять дисковым пространством.
- **Высокая производительность**: Благодаря адаптивным алгоритмам, `RocksDB` обеспечивает отличную производительность при работе с большими объемами данных.
- **Поддержка асинхронных вставок**: `RocksDBTableEngine` поддерживает асинхронные вставки, что позволяет повысить производительность операций записи.

## Использование

Для создания таблицы с использованием `RocksDBTableEngine`, вы можете использовать следующий SQL-запрос:

```sql
CREATE TABLE table_name 
(
    column1 DataType1,
    column2 DataType2
) ENGINE = RocksDB;

## Заключение

Выбор движка таблиц имеет большое значение для производительности вашего приложения. `RocksDBTableEngine` идеально подходит для сценариев, требующих высокой скорости записи и эффективного использования дискового пространства.
