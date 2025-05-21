---
slug: '/examples/aggregate-function-combinators/sumForEach'
title: 'sumForEach'
description: 'sumArray コンビネーターの使用例'
keywords: ['sum', 'array', 'combinator', 'examples', 'sumArray']
sidebar_label: 'sumArray'
---


# sumArray {#sumforeach}

## 説明 {#description}

[`ForEach`](/sql-reference/aggregate-functions/combinators#-foreach) コンビネーターは、[`sum`](/sql-reference/aggregate-functions/reference/sum) 集約関数に適用して、行の値に対して操作する集約関数を、配列カラムに対して操作する集約関数に変換できるようにします。具体的には、行にわたって配列内の各要素に集約を適用します。

## 使用例 {#example-usage}

この例では、私たちの [SQL playground](https://sql.clickhouse.com/) で利用可能な `hits` データセットを使用します。

`hits` テーブルには、UInt8 型の `isMobile` というカラムがあり、これはデスクトップの場合は `0`、モバイルの場合は `1` になります：

```sql runnable
SELECT EventTime, IsMobile FROM metrica.hits ORDER BY rand() LIMIT 10
```

`sumForEach` 集約コンビネータ関数を使用して、時間帯ごとにデスクトップとモバイルのトラフィックがどのように変化するかを分析します。以下の再生ボタンをクリックして、クエリをインタラクティブに実行します：

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

## 関連情報 {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`ForEach combinator`](/sql-reference/aggregate-functions/combinators#-foreach)
