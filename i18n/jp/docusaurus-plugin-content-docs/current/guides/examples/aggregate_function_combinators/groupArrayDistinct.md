---
'slug': '/examples/aggregate-function-combinators/groupArrayDistinct'
'title': 'groupArrayDistinct'
'description': 'groupArrayDistinct コンビネーターを使用する例'
'keywords':
- 'groupArray'
- 'Distinct'
- 'combinator'
- 'examples'
- 'groupArrayDistinct'
'sidebar_label': 'groupArrayDistinct'
'doc_type': 'reference'
---


# groupArrayDistinct {#sumdistinct}

## 説明 {#description}

[`groupArrayDistinct`](/sql-reference/aggregate-functions/combinators#-foreach) コンビネータは、[`groupArray`](/sql-reference/aggregate-functions/reference/sum) 集約関数に適用され、引数の異なる値の配列を作成します。

## 使用例 {#example-usage}

この例では、私たちの [SQLプレイグラウンド](https://sql.clickhouse.com/) で利用可能な `hits` データセットを利用します。

各異なるランディングページのドメイン (`URLDomain`) に対して、そのドメインに訪れたユーザーエージェント OS コード (`OS`) のユニークな値をすべて確認したいとします。これにより、サイトのさまざまな部分と相互作用しているオペレーティングシステムの多様性を理解するのに役立ちます。

```sql runnable
SELECT
    URLDomain,
    groupArrayDistinct(OS) AS distinct_os_codes
FROM metrica.hits_v1
WHERE URLDomain != '' -- Consider only hits with a recorded domain
GROUP BY URLDomain
ORDER BY URLDomain ASC
LIMIT 20;
```

## 関連情報 {#see-also}
- [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [`Distinct combinator`](/sql-reference/aggregate-functions/combinators#-distinct)
