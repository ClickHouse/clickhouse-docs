---
description: 'Документация по типам данных в ClickHouse'
sidebar_label: 'Список типов данных'
sidebar_position: 1
slug: /sql-reference/data-types/
title: 'Типы данных в ClickHouse'
---


# Типы данных в ClickHouse

Этот раздел описывает типы данных, поддерживаемые ClickHouse, например [целые числа](int-uint.md), [числа с плавающей точкой](float.md) и [строки](string.md).

Системная таблица [system.data_type_families](/operations/system-tables/data_type_families) предоставляет
обзор всех доступных типов данных.
Она также показывает, является ли тип данных псевдонимом для другого типа данных и что название регистра чувствительно (например, `bool` против `BOOL`).
