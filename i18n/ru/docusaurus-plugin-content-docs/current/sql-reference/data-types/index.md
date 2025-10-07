---
slug: '/sql-reference/data-types/'
sidebar_label: 'Список типов данных'
sidebar_position: 1
description: 'Документация по типам данных в ClickHouse'
title: 'Типы данных в ClickHouse'
doc_type: reference
---
# Типы данных в ClickHouse

В этом разделе описываются типы данных, поддерживаемые ClickHouse, например, [целые числа](int-uint.md), [числа с плавающей запятой](float.md) и [строки](string.md).

Системная таблица [system.data_type_families](/operations/system-tables/data_type_families) предоставляет
обзор всех доступных типов данных.
Она также показывает, является ли тип данных псевдонимом для другого типа данных, и его имя чувствительно к регистру (например, `bool` против `BOOL`).