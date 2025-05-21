---
description: 'ULIDに関する関数のドキュメント'
sidebar_label: 'ULID'
sidebar_position: 190
slug: /sql-reference/functions/ulid-functions
title: 'ULIDに関する関数'
---


# ULIDに関する関数

## generateULID {#generateulid}

[ULID](https://github.com/ulid/spec) を生成します。

**構文**

```sql
generateULID([x])
```

**引数**

- `x` — 任意の[サポートされているデータ型](/sql-reference/data-types)に結果する[式](/sql-reference/syntax#expressions)。生成された値は破棄されますが、関数が1つのクエリ内で複数回呼ばれる場合に[共通部分式の排除](/sql-reference/functions/overview#common-subexpression-elimination)を回避するために式自体が使用されます。オプションのパラメータです。

**返される値**

[FixedString](../data-types/fixedstring.md) 型の値。

**使用例**

```sql
SELECT generateULID()
```

```text
┌─generateULID()─────────────┐
│ 01GNB2S2FGN2P93QPXDNB4EN2R │
└────────────────────────────┘
```

**1行で複数の値を生成する必要がある場合の使用例**

```sql
SELECT generateULID(1), generateULID(2)
```

```text
┌─generateULID(1)────────────┬─generateULID(2)────────────┐
│ 01GNB2SGG4RHKVNT9ZGA4FFMNP │ 01GNB2SGG4V0HMQVH4VBVPSSRB │
└────────────────────────────┴────────────────────────────┘
```

## ULIDStringToDateTime {#ulidstringtodatetime}

この関数はULIDからタイムスタンプを抽出します。

**構文**

```sql
ULIDStringToDateTime(ulid[, timezone])
```

**引数**

- `ulid` — 入力ULID。[String](../data-types/string.md) または [FixedString(26)](../data-types/fixedstring.md)。
- `timezone` — 返される値の[タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。[String](../data-types/string.md)。

**返される値**

- ミリ秒精度のタイムスタンプ。[DateTime64(3)](../data-types/datetime64.md)。

**使用例**

```sql
SELECT ULIDStringToDateTime('01GNB2S2FGN2P93QPXDNB4EN2R')
```

```text
┌─ULIDStringToDateTime('01GNB2S2FGN2P93QPXDNB4EN2R')─┐
│                            2022-12-28 00:40:37.616 │
└────────────────────────────────────────────────────┘
```

## 関連項目 {#see-also}

- [UUID](../../sql-reference/functions/uuid-functions.md)
