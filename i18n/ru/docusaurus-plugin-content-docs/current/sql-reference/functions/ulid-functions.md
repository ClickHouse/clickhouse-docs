---
description: 'Документация по функциям для работы с ULID'
sidebar_label: 'ULID'
sidebar_position: 190
slug: /sql-reference/functions/ulid-functions
title: 'Функции для работы с ULID'
---


# Функции для работы с ULID

## generateULID {#generateulid}

Генерирует [ULID](https://github.com/ulid/spec).

**Синтаксис**

```sql
generateULID([x])
```

**Аргументы**

- `x` — [Выражение](/sql-reference/syntax#expressions), результатом которого является любой из [поддерживаемых типов данных](/sql-reference/data-types). Полученное значение отбрасывается, но само выражение используется для обхода [устранения общих подвыражений](/sql-reference/functions/overview#common-subexpression-elimination), если функция вызывается несколько раз в одном запросе. Необязательный параметр.

**Возвращаемое значение**

Значение типа [FixedString](../data-types/fixedstring.md).

**Пример использования**

```sql
SELECT generateULID()
```

```text
┌─generateULID()─────────────┐
│ 01GNB2S2FGN2P93QPXDNB4EN2R │
└────────────────────────────┘
```

**Пример использования, если необходимо сгенерировать несколько значений в одной строке**

```sql
SELECT generateULID(1), generateULID(2)
```

```text
┌─generateULID(1)────────────┬─generateULID(2)────────────┐
│ 01GNB2SGG4RHKVNT9ZGA4FFMNP │ 01GNB2SGG4V0HMQVH4VBVPSSRB │
└────────────────────────────┴────────────────────────────┘
```

## ULIDStringToDateTime {#ulidstringtodatetime}

Эта функция извлекает временную метку из ULID.

**Синтаксис**

```sql
ULIDStringToDateTime(ulid[, timezone])
```

**Аргументы**

- `ulid` — Входной ULID. [Строка](../data-types/string.md) или [FixedString(26)](../data-types/fixedstring.md).
- `timezone` — [Название часового пояса](../../operations/server-configuration-parameters/settings.md#timezone) для возвращаемого значения (необязательный). [Строка](../data-types/string.md).

**Возвращаемое значение**

- Временная метка с точностью до миллисекунд. [DateTime64(3)](../data-types/datetime64.md).

**Пример использования**

```sql
SELECT ULIDStringToDateTime('01GNB2S2FGN2P93QPXDNB4EN2R')
```

```text
┌─ULIDStringToDateTime('01GNB2S2FGN2P93QPXDNB4EN2R')─┐
│                            2022-12-28 00:40:37.616 │
└────────────────────────────────────────────────────┘
```

## См. также {#see-also}

- [UUID](../../sql-reference/functions/uuid-functions.md)
