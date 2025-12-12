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

## 個々のクエリに注目し、平均値に頼らない {#focus-on-individual-queries-not-averages}

ClickHouse のパフォーマンスをデバッグする際は、クエリ時間の平均値やシステム全体のメトリクスに頼らないでください。代わりに、特定のクエリがなぜ遅いのかを特定します。システム全体としては平均パフォーマンスが良好でも、個々のクエリがメモリ枯渇、不適切なフィルタリング、高カーディナリティな処理などの影響を受けている場合があります。

ClickHouse の CTO である Alexey によれば、*「正しいやり方は、『なぜこの特定のクエリは 5 秒もかかったのか』と自問することです。中央値やその他のクエリがどれだけ速く処理されているかには興味がありません。私が気にするのは自分のクエリだけです」* ということです。

クエリが遅いときは、平均値だけを見て終わりにしてはいけません。「なぜこの特定のクエリは遅かったのか？」と問い、実際のリソース使用パターンを確認してください。

## メモリと行スキャン {#memory-and-row-scanning}

Sentry は開発者を第一に考えたエラートラッキングプラットフォームで、400 万人以上の開発者からの数十億件のイベントを毎日処理しています。Sentry の重要な知見は次のとおりです： *「この特定の状況でメモリ使用量を決定づけるのは、グルーピングキーのカーディナリティである」* — 高カーディナリティの集約は、行スキャンではなくメモリ枯渇によってパフォーマンスを低下させます。

クエリが失敗した場合、それがメモリの問題（グループ数が多すぎる）なのか、スキャンの問題（行数が多すぎる）なのかを判断してください。

`GROUP BY user_id, error_message, url_path` のようなクエリでは、これら 3 つの値のあらゆるユニークな組み合わせごとに個別のメモリ状態が作成されます。ユーザー数、エラータイプ、URL パスが増えると、同時にメモリ上に保持しなければならない集約状態が数百万単位に達することは容易に起こり得ます。

極端なケースでは、Sentry は決定論的サンプリングを使用しています。10% のサンプルであれば、ほとんどの集約に対しておおよそ 5% 程度の精度を維持しつつ、メモリ使用量を 90% 削減できます。

```sql
WHERE cityHash64(user_id) % 10 = 0  -- 常に同一の10%のユーザー
```

これにより、すべてのクエリで同じユーザーが現れ、期間をまたいでも一貫した結果が得られます。重要なポイントは、`cityHash64()` が同じ入力に対して常に同じハッシュ値を生成することです。そのため、`user_id = 12345` は常に同じ値にハッシュされ、そのユーザーは 10% サンプルに必ず含まれるか、あるいはまったく含まれないかのどちらかになり、クエリ間で出たり消えたりすることがなくなります。

## Sentry のビットマスク最適化 {#bit-mask-optimization}

高カーディナリティ列（URL など）で集約を行う場合、各ユニーク値ごとに個別の集約状態がメモリ上に作成されるため、メモリ枯渇を引き起こす可能性があります。Sentry の解決策は、実際の URL 文字列でグループ化する代わりに、ビットマスクに変換されるブール式でグループ化することです。

このような状況に当てはまる場合は、ご自身のテーブルに対して次のクエリを試してみてください。

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