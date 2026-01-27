---
slug: '/examples/aggregate-function-combinators/groupArrayDistinct'
title: 'groupArrayDistinct'
description: 'groupArrayDistinct コンビネータの使用例'
keywords: ['groupArray', 'Distinct', 'combinator', 'examples', 'groupArrayDistinct']
sidebar_label: 'groupArrayDistinct'
doc_type: 'reference'
---

# groupArrayDistinct \{#sumdistinct\}

## 説明 \{#description\}

[`groupArrayDistinct`](/sql-reference/aggregate-functions/combinators#-foreach) コンビネータは、
[`groupArray`](/sql-reference/aggregate-functions/reference/sum) 集約関数に適用することで、
引数の値の重複を除いた配列を作成できます。

## 使用例 \{#example-usage\}

この例では、[SQL playground](https://sql.clickhouse.com/) で利用可能な `hits` データセットを使用します。

自分のウェブサイトについて、各ランディングページのドメイン（`URLDomain`）ごとに、
そのドメインに流入した訪問者について記録されている、すべての一意なユーザーエージェントの OS コード（`OS`）を
把握したいとします。これは、サイトのさまざまな部分を利用しているオペレーティングシステムの多様性を理解するのに役立ちます。

```sql runnable
SELECT
    URLDomain,
    groupArrayDistinct(OS) AS distinct_os_codes
FROM metrica.hits_v1
WHERE URLDomain != '' -- ドメインが記録されているヒットのみを対象とする
GROUP BY URLDomain
ORDER BY URLDomain ASC
LIMIT 20;
```

## 関連項目 \{#see-also\}
- [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [`Distinct コンビネータ`](/sql-reference/aggregate-functions/combinators#-distinct)
