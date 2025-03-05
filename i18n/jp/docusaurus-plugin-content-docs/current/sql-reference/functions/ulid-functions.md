---
slug: /sql-reference/functions/ulid-functions
sidebar_position: 190
sidebar_label: ULID
---


# ULIDに関する関数

## generateULID {#generateulid}

[ULID](https://github.com/ulid/spec)を生成します。

**構文**

``` sql
generateULID([x])
```

**引数**

- `x` — [サポートされているデータ型](../data-types/index.md#data_types)のいずれかになる[式](../../sql-reference/syntax.md#syntax-expressions)。結果の値は破棄されますが、式自体はクエリ内で関数が複数回呼ばれる場合に[共通部分式の消去](/sql-reference/functions/overview#common-subexpression-elimination)を回避するために使用されます。オプションのパラメータです。

**返される値**

[FixedString](../data-types/fixedstring.md)型の値。

**使用例**

``` sql
SELECT generateULID()
```

``` text
┌─generateULID()─────────────┐
│ 01GNB2S2FGN2P93QPXDNB4EN2R │
└────────────────────────────┘
```

**1行に複数の値を生成する必要がある場合の使用例**

```sql
SELECT generateULID(1), generateULID(2)
```

``` text
┌─generateULID(1)────────────┬─generateULID(2)────────────┐
│ 01GNB2SGG4RHKVNT9ZGA4FFMNP │ 01GNB2SGG4V0HMQVH4VBVPSSRB │
└────────────────────────────┴────────────────────────────┘
```

## ULIDStringToDateTime {#ulidstringtodatetime}

この関数は、ULIDからタイムスタンプを抽出します。

**構文**

``` sql
ULIDStringToDateTime(ulid[, timezone])
```

**引数**

- `ulid` — 入力ULID。[String](../data-types/string.md)または[FixedString(26)](../data-types/fixedstring.md)。
- `timezone` — 返される値の[タイムゾーン名](../../operations/server-configuration-parameters/settings.md#timezone)（オプション）。[String](../data-types/string.md)。

**返される値**

- ミリ秒精度のタイムスタンプ。[DateTime64(3)](../data-types/datetime64.md)。

**使用例**

``` sql
SELECT ULIDStringToDateTime('01GNB2S2FGN2P93QPXDNB4EN2R')
```

``` text
┌─ULIDStringToDateTime('01GNB2S2FGN2P93QPXDNB4EN2R')─┐
│                            2022-12-28 00:40:37.616 │
└────────────────────────────────────────────────────┘
```

## 関連項目 {#see-also}

- [UUID](../../sql-reference/functions/uuid-functions.md)
