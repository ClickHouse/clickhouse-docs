---
slug: '/examples/aggregate-function-combinators/sumForEach'
title: 'sumForEach'
description: 'Example of using the sumArray combinator'
keywords:
- 'sum'
- 'array'
- 'combinator'
- 'examples'
- 'sumArray'
sidebar_label: 'sumArray'
---




# sumArray {#sumforeach}

## 説明 {#description}

[`ForEach`](/sql-reference/aggregate-functions/combinators#-foreach) コンビネータは、[`sum`](/sql-reference/aggregate-functions/reference/sum) 集約関数に適用することができ、行の値に対して動作する集約関数を、行を跨いで配列カラム内の各要素に集約を適用する集約関数に変換します。

## 使用例 {#example-usage}

この例では、私たちの [SQL playground](https://sql.clickhouse.com/) で利用可能な `hits` データセットを使用します。

`hits` テーブルには、UInt8 型の `isMobile` というカラムが含まれており、デスクトップの場合は `0`、モバイルの場合は `1` です：

```sql runnable
SELECT EventTime, IsMobile FROM metrica.hits ORDER BY rand() LIMIT 10
```

`sumForEach` 集約コンビネータ関数を使用して、デスクトップトラフィックとモバイルトラフィックが時間帯に応じてどのように変化するかを分析します。以下の再生ボタンをクリックして、クエリをインタラクティブに実行してください：

```sql runnable
SELECT
    toHour(EventTime) AS hour_of_day,
    -- sumForEach を使用してデスクトップとモバイルの訪問を一度でカウント
    sumForEach([
        IsMobile = 0, -- デスクトップ訪問 (IsMobile = 0)
        IsMobile = 1  -- モバイル訪問 (IsMobile = 1)
    ]) AS device_counts
FROM metrica.hits
GROUP BY hour_of_day
ORDER BY hour_of_day;
```

## 関連項目 {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`ForEach combinator`](/sql-reference/aggregate-functions/combinators#-foreach)
