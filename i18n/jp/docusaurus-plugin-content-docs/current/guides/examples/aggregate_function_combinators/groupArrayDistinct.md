---
slug: '/examples/aggregate-function-combinators/groupArrayDistinct'
title: 'groupArrayDistinct'
description: 'groupArrayDistinct 組み合わせ関数の使用例'
keywords: ['groupArray', 'Distinct', 'combinator', 'examples', 'groupArrayDistinct']
sidebar_label: 'groupArrayDistinct'
doc_type: 'reference'
---



# groupArrayDistinct {#sumdistinct}


## 説明 {#description}

[`groupArrayDistinct`](/sql-reference/aggregate-functions/combinators#-foreach)コンビネータを[`groupArray`](/sql-reference/aggregate-functions/reference/sum)集約関数に適用することで、一意の引数値の配列を作成できます。


## 使用例 {#example-usage}

この例では、[SQLプレイグラウンド](https://sql.clickhouse.com/)で利用可能な`hits`データセットを使用します。

ウェブサイト上の各ランディングページドメイン(`URLDomain`)ごとに、そのドメインに訪問したユーザーに記録されたすべての一意のUser Agent OSコード(`OS`)を調べたい場合を想定します。これにより、サイトの異なる部分とやり取りしているオペレーティングシステムの多様性を把握できます。

```sql runnable
SELECT
    URLDomain,
    groupArrayDistinct(OS) AS distinct_os_codes
FROM metrica.hits_v1
WHERE URLDomain != '' -- 記録されたドメインを持つヒットのみを対象
GROUP BY URLDomain
ORDER BY URLDomain ASC
LIMIT 20;
```


## 関連項目 {#see-also}

- [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [`Distinct combinator`](/sql-reference/aggregate-functions/combinators#-distinct)
