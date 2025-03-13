---
slug: /sql-reference/data-types/
sidebar_label: 'Список типов данных'
sidebar_position: 1
---


# Типы данных в ClickHouse

В этом разделе описаны типы данных, поддерживаемые ClickHouse, например [целые числа](int-uint.md), [числа с плавающей запятой](float.md) и [строки](string.md).

Системная таблица [system.data_type_families](/operations/system-tables/data_type_families) предоставляет
обзор всех доступных типов данных.
Она также показывает, является ли тип данных алиасом для другого типа данных, и его имя чувствительно к регистра (например, `bool` против `BOOL`).
