---
'description': 'カラムの最初に出会った値をSELECT します。'
'sidebar_position': 102
'slug': '/sql-reference/aggregate-functions/reference/any'
'title': 'any'
'doc_type': 'reference'
---


# any

カラムの最初に遭遇した値を選択します。

:::warning
クエリは任意の順序で実行できるため、この関数の結果は非決定的です。
任意の方法ではあるが決定的な結果が必要な場合は、[`min`](../reference/min.md) または [`max`](../reference/max.md) 関数を使用してください。
:::

デフォルトでは、この関数はNULLを返さず、つまり入力カラム内のNULL値を無視します。
ただし、関数が `RESPECT NULLS` 修飾子を使用している場合、NULLかどうかに関わらず最初の値を返します。

**構文**

```sql
any(column) [RESPECT NULLS]
```

エイリアス `any(column)`（`RESPECT NULLS`なし）
- `any_value`
- [`first_value`](../reference/first_value.md)。

エイリアス `any(column) RESPECT NULLS`
- `anyRespectNulls`, `any_respect_nulls`
- `firstValueRespectNulls`, `first_value_respect_nulls`
- `anyValueRespectNulls`, `any_value_respect_nulls`

**パラメータ**
- `column`: カラム名。

**返される値**

最初に遭遇した値。

:::note
関数の返り値の型は入力と同じですが、LowCardinalityは除外されます。
これは、入力として行がない場合、その型のデフォルト値（整数の場合は0、Nullable()カラムの場合はNull）が返されることを意味します。
この動作を変更するために `-OrNull` [コンビネータ](../../../sql-reference/aggregate-functions/combinators.md) を使用することができます。
:::

**実装の詳細**

場合によっては、実行の順序に依存できます。
これは、`SELECT`が`ORDER BY`を使用するサブクエリから来る場合に当てはまります。

`SELECT`クエリに`GROUP BY`句または少なくとも1つの集約関数がある場合、ClickHouseは（MySQLとは異なり）`SELECT`、`HAVING`、および`ORDER BY`句内のすべての式がキーまたは集約関数から計算されることを要求します。
言い換えれば、テーブルから選択される各カラムは、必ずキーまたは集約関数内で使用されなければなりません。
MySQLのような動作を得るには、他のカラムを`any`集約関数内に配置することができます。

**例**

クエリ：

```sql
CREATE TABLE tab (city Nullable(String)) ENGINE=Memory;

INSERT INTO tab (city) VALUES (NULL), ('Amsterdam'), ('New York'), ('Tokyo'), ('Valencia'), (NULL);

SELECT any(city), anyRespectNulls(city) FROM tab;
```

```response
┌─any(city)─┬─anyRespectNulls(city)─┐
│ Amsterdam │ ᴺᵁᴸᴸ                  │
└───────────┴───────────────────────┘
```
