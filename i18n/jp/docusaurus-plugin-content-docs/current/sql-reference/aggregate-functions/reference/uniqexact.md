---
'description': '異なる引数値の正確な数を計算します。'
'sidebar_position': 207
'slug': '/sql-reference/aggregate-functions/reference/uniqexact'
'title': 'uniqExact'
---




# uniqExact

異なる引数値の正確な数を計算します。

```sql
uniqExact(x[, ...])
```

正確な結果が絶対に必要な場合は、`uniqExact` 関数を使用してください。そうでなければ、[uniq](/sql-reference/aggregate-functions/reference/uniq) 関数を使用してください。

`uniqExact` 関数は、異なる値の数が増加するにつれて状態のサイズが無制限に成長するため、`uniq` よりも多くのメモリを使用します。

**引数**

この関数は可変数のパラメータを受け取ります。パラメータは `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型であることができます。

**例**

この例では、[opensky データセット](https://sql.clickhouse.com?query=U0VMRUNUIHVuaXFFeGFjdCh0eXBlY29kZSkgRlJPTSBvcGVuc2t5Lm9wZW5za3k&) のユニークなタイプコード（航空機のタイプの短い識別子）の数をカウントするために `uniqExact` 関数を使用します。

```sql title="クエリ"
SELECT uniqExact(typecode) FROM opensky.opensky
```

```response title="レスポンス"
1106
```

**関連項目**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
