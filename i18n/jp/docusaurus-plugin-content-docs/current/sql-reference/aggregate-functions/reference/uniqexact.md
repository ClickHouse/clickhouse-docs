---
'description': '異なる引数値の正確な数を計算します。'
'sidebar_position': 207
'slug': '/sql-reference/aggregate-functions/reference/uniqexact'
'title': 'uniqExact'
'doc_type': 'reference'
---


# uniqExact

異なる引数値の正確な数を計算します。

```sql
uniqExact(x[, ...])
```

`uniqExact` 関数は、絶対に正確な結果が必要な場合に使用してください。そうでない場合は、 [uniq](/sql-reference/aggregate-functions/reference/uniq) 関数を使用してください。

`uniqExact` 関数は、異なる値の数が増えるにつれて状態のサイズが無限に成長するため、 `uniq` よりも多くのメモリを使用します。

**引数**

この関数は可変数のパラメータを受け取ります。パラメータは `Tuple` 、 `Array` 、 `Date` 、 `DateTime` 、 `String` または数値型です。

**例**

この例では、 [opensky data set](https://sql.clickhouse.com?query=U0VMRUNUIHVuaXFFeGFjdCh0eXBlY29kZSkgRlJPTSBvcGVuc2t5Lm9wZW5za3k&) における一意の型コード（航空機の種類を示す短い識別子）の数を数えるために `uniqExact` 関数を使用します。

```sql title="Query"
SELECT uniqExact(typecode) FROM opensky.opensky
```

```response title="Response"
1106
```

**関連項目**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
