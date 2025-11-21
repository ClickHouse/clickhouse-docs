---
slug: '/examples/aggregate-function-combinators/sumForEach'
title: 'sumForEach'
description: 'sumForEach 集約関数の使用例'
keywords: ['sum', 'ForEach', 'combinator', 'examples', 'sumForEach']
sidebar_label: 'sumForEach'
doc_type: 'reference'
---



# sumForEach {#sumforeach}


## 説明 {#description}

[`ForEach`](/sql-reference/aggregate-functions/combinators#-foreach)コンビネータを[`sum`](/sql-reference/aggregate-functions/reference/sum)集約関数に適用することで、行の値を処理する集約関数から配列カラムを処理する集約関数に変換できます。これにより、複数の行にわたって配列内の各要素に対して集約処理が適用されます。


## 使用例 {#example-usage}

この例では、[SQLプレイグラウンド](https://sql.clickhouse.com/)で利用可能な`hits`データセットを使用します。

`hits`テーブルには、UInt8型の`isMobile`という列があり、デスクトップの場合は`0`、モバイルの場合は`1`の値を取ります:

```sql runnable
SELECT EventTime, IsMobile FROM metrica.hits ORDER BY rand() LIMIT 10
```

`sumForEach`集約コンビネータ関数を使用して、デスクトップとモバイルのトラフィックが時間帯によってどのように変化するかを分析します。下の再生ボタンをクリックして、クエリをインタラクティブに実行してください:

```sql runnable
SELECT
    toHour(EventTime) AS hour_of_day,
    -- sumForEachを使用して、デスクトップとモバイルの訪問数を1回のパスでカウント
    sumForEach([
        IsMobile = 0, -- デスクトップ訪問数 (IsMobile = 0)
        IsMobile = 1  -- モバイル訪問数 (IsMobile = 1)
    ]) AS device_counts
FROM metrica.hits
GROUP BY hour_of_day
ORDER BY hour_of_day;
```


## 関連項目 {#see-also}

- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`ForEach` コンビネータ](/sql-reference/aggregate-functions/combinators#-foreach)
