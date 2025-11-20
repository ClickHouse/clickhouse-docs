---
sidebar_position: 1
slug: /community-wisdom/performance-optimization
sidebar_label: 'パフォーマンス最適化'
doc_type: 'guide'
keywords: [
  'performance optimization',
  'query performance',
  'database tuning',
  'slow queries',
  'memory optimization',
  'cardinality analysis',
  'indexing strategies',
  'aggregation optimization',
  'sampling techniques',
  'database performance',
  'query analysis',
  'performance troubleshooting'
]
title: '実践レッスン - パフォーマンス最適化'
description: '実環境におけるパフォーマンス最適化戦略の実例'
---



# パフォーマンス最適化：コミュニティで検証された戦略 {#performance-optimization}

_このガイドは、コミュニティミートアップで得られた知見をまとめたコレクションの一部です。実際の解決策や洞察については、[特定の問題別に参照](./community-wisdom.md)できます。_
_マテリアライズドビューでお困りですか？[マテリアライズドビュー](./materialized-views.md)のコミュニティ洞察ガイドをご確認ください。_
_クエリが遅く、より多くの例をお探しの場合は、[クエリ最適化](/optimize/query-optimization)ガイドもご用意しています。_


## カーディナリティ順（低から高へ）{#cardinality-ordering}

ClickHouseのプライマリインデックスは、カーディナリティの低いカラムを最初に配置することで最も効果的に機能し、大量のデータチャンクを効率的にスキップできます。キーの後方に配置されたカーディナリティの高いカラムは、それらのチャンク内で細かいソートを提供します。一意の値が少ないカラム（status、category、countryなど）から始め、一意の値が多いカラム（user_id、timestamp、session_idなど）で終わるようにします。

カーディナリティとプライマリインデックスに関する詳細なドキュメントは以下を参照してください：

- [プライマリキーの選択](/best-practices/choosing-a-primary-key)
- [プライマリインデックス](/primary-indexes)


## 時間粒度の重要性 {#time-granularity}

ORDER BY句でタイムスタンプを使用する際は、カーディナリティと精度のトレードオフを考慮してください。マイクロ秒精度のタイムスタンプは非常に高いカーディナリティ(ほぼ行ごとに一意の値)を生成し、ClickHouseのスパースプライマリインデックスの効果を低下させます。丸められたタイムスタンプは低いカーディナリティを生成し、より効果的なインデックススキップを可能にしますが、時間ベースのクエリでは精度が失われます。

```sql runnable editable
-- チャレンジ: toStartOfMinuteやtoStartOfWeekなど、異なる時間関数を試してみましょう
-- 実験: 独自のタイムスタンプデータでカーディナリティの違いを比較してみましょう
SELECT
    'マイクロ秒精度' as granularity,
    uniq(created_at) as unique_values,
    '膨大なカーディナリティを生成 - ソートキーには不適切' as impact
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


## 平均値ではなく個別のクエリに注目する {#focus-on-individual-queries-not-averages}

ClickHouseのパフォーマンスをデバッグする際は、平均クエリ時間や全体的なシステムメトリクスに頼らないでください。その代わりに、特定のクエリが遅い理由を特定してください。システム全体の平均パフォーマンスが良好であっても、個別のクエリがメモリ不足、不適切なフィルタリング、または高カーディナリティ操作の影響を受けている可能性があります。

ClickHouseのCTOであるAlexeyによると、_「正しいアプローチは、なぜこの特定のクエリが5秒で処理されたのかを自問することです...中央値や他のクエリが速く処理されるかどうかは関係ありません。私が関心を持つのは自分のクエリだけです」_

クエリが遅い場合、平均値だけを見ないでください。「なぜこの特定のクエリが遅かったのか?」と問い、実際のリソース使用パターンを調査してください。


## メモリと行スキャン {#memory-and-row-scanning}

Sentryは開発者ファーストのエラー追跡プラットフォームで、400万人以上の開発者から日々数十億のイベントを処理しています。彼らの重要な知見は次の通りです：_「この特定の状況でメモリを消費する要因となるグループ化キーのカーディナリティ」_ - 高カーディナリティの集計は、行スキャンではなくメモリ枯渇によってパフォーマンスを低下させます。

クエリが失敗した場合、それがメモリの問題（グループ数が多すぎる）なのか、スキャンの問題（行数が多すぎる）なのかを判断してください。

`GROUP BY user_id, error_message, url_path`のようなクエリは、3つの値すべての一意な組み合わせごとに個別のメモリ状態を作成します。ユーザー数、エラータイプ、URLパスの負荷が高い場合、同時にメモリ上に保持する必要がある集計状態が数百万に達する可能性があります。

極端なケースでは、Sentryは決定論的サンプリングを使用します。10%のサンプルはメモリ使用量を90%削減しながら、ほとんどの集計で約5%の精度を維持します：

```sql
WHERE cityHash64(user_id) % 10 = 0  -- 常に同じ10%のユーザー
```

これにより、すべてのクエリで同じユーザーが表示され、期間を通じて一貫した結果が得られます。重要な知見：`cityHash64()`は同じ入力に対して一貫したハッシュ値を生成するため、`user_id = 12345`は常に同じ値にハッシュされ、そのユーザーが10%のサンプルに常に含まれるか、まったく含まれないかのいずれかになります - クエリ間で変動することはありません。


## Sentryのビットマスク最適化 {#bit-mask-optimization}

高カーディナリティカラム（URLなど）で集計を行う場合、各一意の値がメモリ内に個別の集計状態を作成し、メモリ枯渇につながります。Sentryの解決策：実際のURL文字列でグループ化する代わりに、ビットマスクに集約されるブール式でグループ化します。

この状況に該当する場合、自身のテーブルで試すことができるクエリを以下に示します：

```sql
-- メモリ効率的な集計パターン：各条件 = グループごとに1つの整数
-- 重要なポイント：sumIf()はデータ量に関係なくメモリ使用量が制限される
-- グループあたりのメモリ：N個の整数（N * 8バイト）、Nは条件の数

SELECT
    your_grouping_column,

    -- 各sumIf()はグループごとに正確に1つの整数カウンタを作成
    -- 各条件に一致する行数に関係なくメモリは一定
    sumIf(1, your_condition_1) as condition_1_count,
    sumIf(1, your_condition_2) as condition_2_count,
    sumIf(1, your_text_column LIKE '%pattern%') as pattern_matches,
    sumIf(1, your_numeric_column > threshold_value) as above_threshold,

    -- 複雑な複数条件の集計でも一定のメモリを使用
    sumIf(1, your_condition_1 AND your_text_column LIKE '%pattern%') as complex_condition_count,

    -- コンテキスト用の標準集計
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

すべての一意の文字列をメモリに格納する代わりに、それらの文字列に関する質問への回答を整数として格納します。集計状態は、データの多様性に関係なく、制限され小さくなります。

Sentryのエンジニアリングチームより：「これらの重いクエリは10倍以上高速になり、メモリ使用量は100分の1に削減されました（さらに重要なことに、制限されています）。最大規模の顧客はリプレイ検索時にエラーが発生しなくなり、メモリ不足なしに任意の規模の顧客をサポートできるようになりました。」


## 動画リソース {#video-sources}

- [Lost in the Haystack - Optimizing High Cardinality Aggregations](https://www.youtube.com/watch?v=paK84-EUJCA) - Sentryの本番環境でのメモリ最適化に関する知見
- [ClickHouse Performance Analysis](https://www.youtube.com/watch?v=lxKbvmcLngo) - Alexey Milovidovによるデバッグ手法
- [ClickHouse Meetup: Query Optimization Techniques](https://www.youtube.com/watch?v=JBomQk4Icjo) - コミュニティによる最適化戦略

**次に読む**:

- [クエリ最適化ガイド](/optimize/query-optimization)
- [マテリアライズドビュー コミュニティインサイト](./materialized-views.md)
