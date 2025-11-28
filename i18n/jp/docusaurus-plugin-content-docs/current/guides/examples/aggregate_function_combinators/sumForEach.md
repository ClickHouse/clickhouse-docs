---
slug: '/examples/aggregate-function-combinators/sumForEach'
title: 'sumForEach'
description: 'sumForEach 集約関数の利用例'
keywords: ['sum', 'ForEach', 'combinator', 'examples', 'sumForEach']
sidebar_label: 'sumForEach'
doc_type: 'reference'
---



# sumForEach {#sumforeach}



## 説明 {#description}

[`ForEach`](/sql-reference/aggregate-functions/combinators#-foreach) コンビネーターを
[`sum`](/sql-reference/aggregate-functions/reference/sum) 集約関数に適用すると、行ごとの値に対して動作する集約関数を、配列型カラムに対して動作し、配列内の各要素ごとに複数行にわたって集約を適用する集約関数に変換できます。



## 使用例

この例では、[SQL playground](https://sql.clickhouse.com/) で利用可能な `hits` データセットを使用します。

`hits` テーブルには、型が UInt8 の `isMobile` というカラムが含まれており、
デスクトップの場合は `0`、モバイルの場合は `1` となります：

```sql runnable
SELECT EventTime, IsMobile FROM metrica.hits ORDER BY rand() LIMIT 10
```

`sumForEach` 集約コンビネータ関数を使用して、1 日の時間帯別にデスクトップとモバイルそれぞれのトラフィックがどのように異なるかを分析します。クエリをインタラクティブに実行するには、下の再生ボタンをクリックしてください。

```sql runnable
SELECT
    toHour(EventTime) AS hour_of_day,
    -- sumForEachを使用して、デスクトップとモバイルの訪問数を1パスでカウント
    sumForEach([
        IsMobile = 0, -- デスクトップの訪問数（IsMobile = 0）
        IsMobile = 1  -- モバイルの訪問数（IsMobile = 1）
    ]) AS device_counts
FROM metrica.hits
GROUP BY hour_of_day
ORDER BY hour_of_day;
```


## 関連項目 {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`ForEach` コンビネータ](/sql-reference/aggregate-functions/combinators#-foreach)
