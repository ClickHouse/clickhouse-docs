---
slug: '/examples/aggregate-function-combinators/groupArrayDistinct'
title: 'groupArrayDistinct'
description: 'groupArrayDistinct combinatorの使用例'
keywords:
- 'groupArray'
- 'Distinct'
- 'combinator'
- 'examples'
- 'groupArrayDistinct'
sidebar_label: 'groupArrayDistinct'
---




# groupArrayDistinct {#sumdistinct}

## 説明 {#description}

[`groupArrayDistinct`](/sql-reference/aggregate-functions/combinators#-foreach) コンビネータは、[`groupArray`](/sql-reference/aggregate-functions/reference/sum) 集約関数に適用して、異なる引数値の配列を作成することができます。

## 使用例 {#example-usage}

この例では、私たちの [SQL playground](https://sql.clickhouse.com/) で利用可能な `hits` データセットを使用します。

あなたのウェブサイトで、各異なるランディングページドメイン（`URLDomain`）について、そのドメインに訪れた訪問者のために記録されたすべてのユニークなユーザーエージェントOSコード（`OS`）を知りたいとしましょう。これにより、サイトの異なる部分と相互作用しているオペレーティングシステムの多様性を理解するのに役立ちます。

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

## 関連情報 {#see-also}
- [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [`Distinct combinator`](/sql-reference/aggregate-functions/combinators#-distinct)
