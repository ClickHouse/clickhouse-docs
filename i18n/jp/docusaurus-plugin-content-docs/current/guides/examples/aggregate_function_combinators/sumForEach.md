---
'slug': '/examples/aggregate-function-combinators/sumForEach'
'title': 'sumForEach'
'description': 'sumForEach 集約関数を使用した例'
'keywords':
- 'sum'
- 'ForEach'
- 'combinator'
- 'examples'
- 'sumForEach'
'sidebar_label': 'sumForEach'
'doc_type': 'reference'
---


# sumForEach {#sumforeach}

## Description {#description}

[`ForEach`](/sql-reference/aggregate-functions/combinators#-foreach) コマンビネータは、[`sum`](/sql-reference/aggregate-functions/reference/sum) 集約関数に適用することができ、行値に対して操作する集約関数から、行をまたいで配列カラムの各要素に集約を適用する集約関数に変換します。

## Example usage {#example-usage}

この例では、私たちの [SQL playground](https://sql.clickhouse.com/) で利用可能な `hits` データセットを使用します。

`hits` テーブルには、デスクトップの場合は `0`、モバイルの場合は `1` となる UInt8 型の `isMobile` というカラムがあります：

```sql runnable
SELECT EventTime, IsMobile FROM metrica.hits ORDER BY rand() LIMIT 10
```

私たちは `sumForEach` 集約コマンビネータ関数を使用して、デスクトップとモバイルのトラフィックが日中の時間によってどのように変化するかを分析します。以下の再生ボタンをクリックして、クエリを対話的に実行してください：

```sql runnable
SELECT
    toHour(EventTime) AS hour_of_day,
    -- Use sumForEach to count desktop and mobile visits in one pass
    sumForEach([
        IsMobile = 0, -- Desktop visits (IsMobile = 0)
        IsMobile = 1  -- Mobile visits (IsMobile = 1)
    ]) AS device_counts
FROM metrica.hits
GROUP BY hour_of_day
ORDER BY hour_of_day;
```

## See also {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`ForEach` combinator](/sql-reference/aggregate-functions/combinators#-foreach)
