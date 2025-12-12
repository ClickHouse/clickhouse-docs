---
sidebar_position: 1
slug: /community-wisdom/performance-optimization
sidebar_label: 'パフォーマンス最適化'
doc_type: 'guide'
keywords: [
  'パフォーマンス最適化',
  'クエリパフォーマンス',
  'データベースチューニング',
  '低速クエリ',
  'メモリ最適化',
  'カーディナリティ分析',
  'インデックス設計',
  '集約最適化',
  'サンプリング手法',
  'データベースパフォーマンス',
  'クエリ分析',
  'パフォーマンスのトラブルシューティング'
]
title: '事例集 - パフォーマンス最適化'
description: 'パフォーマンス最適化戦略の実践的な実例集'
---

# パフォーマンス最適化: コミュニティで検証された手法 {#performance-optimization}
*このガイドは、コミュニティミートアップから得られた知見をまとめたコレクションの一部です。より実践的な解決策や知見については、[問題別のトピック](./community-wisdom.md)を参照してください。*
*マテリアライズドビューでお困りですか？[Materialized Views](./materialized-views.md) に関するコミュニティの知見をまとめたガイドをご覧ください。*
*クエリが遅く、さらに多くの例が必要な場合は、[Query Optimization](/optimize/query-optimization) ガイドも参照してください。*

## カーディナリティの低い順に並べる {#cardinality-ordering}
ClickHouse のプライマリインデックスは、カーディナリティの低いカラムを先頭に配置することで最も効率よく動作し、大きなデータチャンクを効果的にスキップできます。キーの後半にカーディナリティの高いカラムを配置することで、それらのチャンク内でのきめ細かなソートが可能になります。異なる値の数が少ないカラム（status、category、country など）から始め、異なる値の数が多いカラム（user_id、timestamp、session_id など）で終わるようにしてください。

カーディナリティおよびプライマリインデックスに関する詳細なドキュメントも参照してください:
- [プライマリキーの選び方](/best-practices/choosing-a-primary-key)
- [プライマリインデックス](/primary-indexes)

## 時間の粒度は重要 {#time-granularity}

ORDER BY 句でタイムスタンプを使用する場合は、カーディナリティと精度のトレードオフを考慮してください。マイクロ秒精度のタイムスタンプは非常に高いカーディナリティ（ほぼ 1 行につき 1 つのユニークな値）を生み出し、ClickHouse のスパースなプライマリインデックスの有効性を低下させます。一方、タイムスタンプを丸めるとカーディナリティを低く抑えられ、より効果的なインデックススキップが可能になりますが、その代わりに時間ベースのクエリの精度が失われます。

```sql runnable editable
-- チャレンジ: toStartOfMinuteやtoStartOfWeekなどの異なる時間関数を試してみてください
-- 実験: 独自のタイムスタンプデータでカーディナリティの違いを比較してください
SELECT 
    'マイクロ秒精度' as granularity,
    uniq(created_at) as unique_values,
    '膨大なカーディナリティを生成 - ソートキーには不適' as impact
FROM github.github_events
WHERE created_at >= '2024-01-01'
UNION ALL
SELECT 
    '時間精度',
    uniq(toStartOfHour(created_at)),
    'ソートキーに適している - スキップインデックスを有効化'
FROM github.github_events
WHERE created_at >= '2024-01-01'
UNION ALL  
SELECT 
    '日精度',
    uniq(toStartOfDay(created_at)),
    'レポートクエリに最適'
FROM github.github_events
WHERE created_at >= '2024-01-01';
```

## Focus on individual queries, not averages {#focus-on-individual-queries-not-averages}

When debugging ClickHouse performance, don't rely on average query times or overall system metrics. Instead, identify why specific queries are slow. A system can have good average performance while individual queries suffer from memory exhaustion, poor filtering, or high cardinality operations.

According to Alexey, CTO of ClickHouse: *"The right way is to ask yourself why this particular query was processed in five seconds... I don't care if median and other queries process quickly. I only care about my query"*

When a query is slow, don't just look at averages. Ask "Why was THIS specific query slow?" and examine the actual resource usage patterns.

## Memory and row scanning {#memory-and-row-scanning}

Sentry is a developer-first error tracking platform processing billions of events daily from 4+ million developers. Their key insight: *"The cardinality of the grouping key that's going to drive memory in this particular situation"* - High cardinality aggregations kill performance through memory exhaustion, not row scanning.

When queries fail, determine if it's a memory problem (too many groups) or scanning problem (too many rows).

A query like `GROUP BY user_id, error_message, url_path` creates a separate memory state for every unique combination of all three values together. With a higher load of users, error types, and URL paths, you could easily generate millions of aggregation states that must be held in memory simultaneously.

For extreme cases, Sentry uses deterministic sampling. A 10% sample reduces memory usage by 90% while maintaining roughly 5% accuracy for most aggregations:

```sql
WHERE cityHash64(user_id) % 10 = 0  -- 常に同一の10%のユーザー
```

This ensures the same users appear in every query, providing consistent results across time periods. The key insight: `cityHash64()` produces consistent hash values for the same input, so `user_id = 12345` will always hash to the same value, ensuring that user either always appears in your 10% sample or never does - no flickering between queries.

## Sentry's bit mask optimization {#bit-mask-optimization}

When aggregating by high-cardinality columns (like URLs), each unique value creates a separate aggregation state in memory, leading to memory exhaustion. Sentry's solution: instead of grouping by the actual URL strings, group by boolean expressions that collapse into bit masks.

Here is a query that you can try on your own tables if this situation applies to you:

```sql
-- メモリ効率的な集約パターン: 各条件 = グループごとに1つの整数
-- 重要なポイント: sumIf()はデータ量に関係なく制限されたメモリを作成
-- グループあたりのメモリ: N個の整数 (N * 8バイト)、Nは条件の数

SELECT 
    your_grouping_column,
    
    -- 各sumIfはグループごとに正確に1つの整数カウンタを作成
    -- 各条件に一致する行数に関係なくメモリは一定に保たれる
    sumIf(1, your_condition_1) as condition_1_count,
    sumIf(1, your_condition_2) as condition_2_count,
    sumIf(1, your_text_column LIKE '%pattern%') as pattern_matches,
    sumIf(1, your_numeric_column > threshold_value) as above_threshold,
    
    -- 複雑な複数条件の集約でも一定のメモリを使用
    sumIf(1, your_condition_1 AND your_text_column LIKE '%pattern%') as complex_condition_count,
    
    -- 参考用の標準集約
    count() as total_rows,
    avg(your_numeric_column) as average_value,
    max(your_timestamp_column) as latest_timestamp
    
FROM your_schema.your_table
WHERE your_timestamp_column >= 'start_date' 
  AND your_timestamp_column < 'end_date'
GROUP BY your_grouping_column
HAVING condition_1_count > minimum_threshold 
   OR condition_2_count > another_threshold
ORDER BY (condition_1_count + condition_2_count + pattern_matches) DESC
LIMIT 20
```

あらゆるユニークな文字列そのものをメモリに保持する代わりに、それらの文字列に関する問いへの答えを整数として保持します。データの多様性に関係なく、集約状態は上限が決まった非常に小さなものになります。

Sentry のエンジニアリングチームによると、「これらの重いクエリは 10 倍以上高速になり、メモリ使用量は 100 倍少なくなりました（しかも、より重要なことに、上限が決まっています）。最大規模のお客様でもリプレイ検索時にエラーが発生しなくなり、メモリ不足を心配することなく、あらゆる規模のお客様をサポートできるようになりました。」

## 動画資料 {#video-sources}

- [Lost in the Haystack - Optimizing High Cardinality Aggregations](https://www.youtube.com/watch?v=paK84-EUJCA) - Sentry 本番環境でのメモリ最適化に関する知見
- [ClickHouse Performance Analysis](https://www.youtube.com/watch?v=lxKbvmcLngo) - Alexey Milovidov によるデバッグ手法の解説
- [ClickHouse Meetup: Query Optimization Techniques](https://www.youtube.com/watch?v=JBomQk4Icjo) - コミュニティによる最適化戦略

**次に読む**:
- [クエリ最適化ガイド](/optimize/query-optimization)
- [マテリアライズドビューに関するコミュニティの知見](./materialized-views.md)