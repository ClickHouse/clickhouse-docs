---
description: 'Документация по типам данных в ClickHouse'
sidebar_label: 'Список типов данных'
sidebar_position: 1
slug: /sql-reference/data-types/
title: 'Типы данных в ClickHouse'
doc_type: 'reference'
---

# Типы данных в ClickHouse {#data-types-in-clickhouse}

В этом разделе описываются типы данных, поддерживаемые ClickHouse, например [целые числа](int-uint.md), [числа с плавающей запятой](float.md) и [строки](string.md).

Системная таблица [system.data&#95;type&#95;families](/operations/system-tables/data_type_families) содержит
обзор всех доступных типов данных.
Она также показывает, является ли тип данных псевдонимом другого типа данных и чувствительно ли его имя к регистру (например, `bool` в отличие от `BOOL`).