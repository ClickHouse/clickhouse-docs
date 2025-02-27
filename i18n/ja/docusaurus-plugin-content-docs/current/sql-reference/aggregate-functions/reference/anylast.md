---
slug: /sql-reference/aggregate-functions/reference/anylast
sidebar_position: 105
---

# anyLast

カラムの最後に遭遇した値を選択します。

:::warning
クエリは任意の順序で実行される可能性があるため、この関数の結果は非決定的です。
任意ではあるが決定的な結果が必要な場合は、[`min`](../reference/min.md) または [`max`](../reference/max.md) 関数を使用してください。
:::

デフォルトでは、この関数は NULL を返さず、つまり入力カラムの NULL 値を無視します。
ただし、`RESPECT NULLS` 修飾子とともに使用した場合、この関数は最初に読み取った値を返します。NULLであってもなくても関係ありません。

**構文**

```sql
anyLast(column) [RESPECT NULLS]
```

エイリアス `anyLast(column)` ( `RESPECT NULLS` なし)
- [`last_value`](../reference/last_value.md)

エイリアス `anyLast(column) RESPECT NULLS`
- `anyLastRespectNulls`, `anyLast_respect_nulls`
- `lastValueRespectNulls`, `last_value_respect_nulls`

**パラメータ**
- `column`: カラム名。

**返される値**

- 最後に遭遇した値。

**例**

クエリ:

```sql
CREATE TABLE tab (city Nullable(String)) ENGINE=Memory;

INSERT INTO tab (city) VALUES ('Amsterdam'),(NULL),('New York'),('Tokyo'),('Valencia'),(NULL);

SELECT anyLast(city), anyLastRespectNulls(city) FROM tab;
```

```response
┌─anyLast(city)─┬─anyLastRespectNulls(city)─┐
│ Valencia      │ ᴺᵁᴸᴸ                      │
└───────────────┴───────────────────────────┘
```
