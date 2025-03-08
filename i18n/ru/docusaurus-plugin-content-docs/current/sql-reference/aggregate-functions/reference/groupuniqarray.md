---
slug: /sql-reference/aggregate-functions/reference/groupuniqarray
sidebar_position: 154
title: 'groupUniqArray'
description: 'Создает массив из различных значений аргументов.'
---


# groupUniqArray

Синтаксис: `groupUniqArray(x)` или `groupUniqArray(max_size)(x)`

Создает массив из различных значений аргументов. Потребление памяти такое же, как для функции [uniqExact](../../../sql-reference/aggregate-functions/reference/uniqexact.md).

Вторая версия (с параметром `max_size`) ограничивает размер результирующего массива `max_size` элементами. Например, `groupUniqArray(1)(x)` эквивалентно `[any(x)]`.
