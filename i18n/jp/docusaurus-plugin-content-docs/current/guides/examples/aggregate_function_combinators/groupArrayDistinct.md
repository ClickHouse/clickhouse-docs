---
slug: '/examples/aggregate-function-combinators/groupArrayDistinct'
title: 'groupArrayDistinct'
description: 'groupArrayDistinctコンビネータを使用した例'
keywords: ['groupArray', 'Distinct', 'combinator', 'examples', 'groupArrayDistinct']
sidebar_label: 'groupArrayDistinct'
---


# groupArrayDistinct {#sumdistinct}

## 説明 {#description}

[`groupArrayDistinct`](/sql-reference/aggregate-functions/combinators#-foreach) コンビネータは、[`groupArray`](/sql-reference/aggregate-functions/reference/sum) 集約関数に適用され、引数の異なる値の配列を作成することができます。

## 使用例 {#example-usage}

この例では、私たちの [SQLプレイグラウンド](https://sql.clickhouse.com/) で利用可能な `hits` データセットを使用します。

あなたのウェブサイト上の各異なるランディングページドメイン (`URLDomain`) に対して、そのドメインに訪れたユーザーエージェントOSコード (`OS`) のすべてのユニークなコードを見つけたいとします。これは、サイトの異なる部分とやり取りするオペレーティングシステムの多様性を理解するのに役立ちます。

```sql runnable
SELECT
    URLDomain,
    groupArrayDistinct(OS) AS distinct_os_codes
FROM metrica.hits_v1
WHERE URLDomain != '' -- 記録されたドメインを持つヒットのみを考慮
GROUP BY URLDomain
ORDER BY URLDomain ASC
LIMIT 20;
```

## 関連項目 {#see-also}
- [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [`Distinct combinator`](/sql-reference/aggregate-functions/combinators#-distinct)
