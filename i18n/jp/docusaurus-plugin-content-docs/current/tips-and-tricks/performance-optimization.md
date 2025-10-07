---
'sidebar_position': 1
'slug': '/community-wisdom/performance-optimization'
'sidebar_label': 'パフォーマンス最適化'
'doc_type': 'guide'
'keywords':
- 'performance optimization'
- 'query performance'
- 'database tuning'
- 'slow queries'
- 'memory optimization'
- 'cardinality analysis'
- 'indexing strategies'
- 'aggregation optimization'
- 'sampling techniques'
- 'database performance'
- 'query analysis'
- 'performance troubleshooting'
'title': 'レッスン - パフォーマンス最適化'
'description': 'パフォーマンス最適化戦略の実世界の例'
---


# パフォーマンス最適化: コミュニティによるテスト済み戦略 {#performance-optimization}
*このガイドは、コミュニティミートアップから得られた知見のコレクションの一部です。より現実的な解決策や洞察については、[特定の問題でブラウズ](./community-wisdom.md)できます。*
*Materialized Viewsに関して問題がありますか？[Materialized Views](./materialized-views.md)のコミュニティインサイトガイドをチェックしてください。*
*クエリが遅いと感じており、さらに例が必要な場合は、[Query Optimization](/optimize/query-optimization)ガイドもご覧ください。*

## カーディナリティによるソート（低いから高い） {#cardinality-ordering}
ClickHouseの主インデックスは、低カーディナリティのカラムが最初に配置されると最も効果的に機能し、大きなデータのチャンクを効率的にスキップできます。キーの後半に配置された高カーディナリティのカラムは、それらのチャンク内で細かいソートを提供します。ユニークな値が少ないカラム（ステータス、カテゴリ、国など）から始め、ユニークな値が多いカラム（user_id、timestamp、session_idなど）で終了します。

カーディナリティと主インデックスに関する詳細なドキュメントも参照してください：
- [Choosing a Primary Key](/best-practices/choosing-a-primary-key)
- [Primary indexes](/primary-indexes)

## 時間の粒度が重要 {#time-granularity}
ORDER BY句でタイムスタンプを使用する際は、カーディナリティと精度のトレードオフを考慮してください。マイクロ秒精度のタイムスタンプは非常に高いカーディナリティ（行ごとにほぼ一意の値）を生成し、ClickHouseのスパース主インデックスの効果を減少させます。丸められたタイムスタンプはカーディナリティを下げ、より良いインデックススキッピングを可能にしますが、時間ベースのクエリの精度が失われます。

```sql runnable editable
-- Challenge: Try different time functions like toStartOfMinute or toStartOfWeek
-- Experiment: Compare the cardinality differences with your own timestamp data
SELECT 
    'Microsecond precision' as granularity,
    uniq(created_at) as unique_values,
    'Creates massive cardinality - bad for sort key' as impact
FROM github.github_events
WHERE created_at >= '2024-01-01'
UNION ALL
SELECT 
    'Hour precision',
    uniq(toStartOfHour(created_at)),
    'Much better for sort key - enables skip indexing'
FROM github.github_events
WHERE created_at >= '2024-01-01'
UNION ALL  
SELECT 
    'Day precision',
    uniq(toStartOfDay(created_at)),
    'Best for reporting queries'
FROM github.github_events
WHERE created_at >= '2024-01-01';
```

## 平均ではなく個々のクエリに焦点を当てる {#focus-on-individual-queries-not-averages}

ClickHouseのパフォーマンスをデバッグする際は、平均クエリ時間や全体システムのメトリクスに依存しないでください。代わりに、特定のクエリが遅い理由を特定します。システムは良好な平均パフォーマンスを持っていても、個々のクエリはメモリの枯渇、フィルタリングの不良、または高カーディナリティの操作によって苦しむことがあります。

ClickHouseのCTOであるアレクセイによると: *「正しい方法は、この特定のクエリが5秒で処理された理由を自問することです...中央値や他のクエリが迅速に処理されたかどうかは気にしません。私が気にするのは私のクエリだけです」*

クエリが遅い場合は、平均を見てはいけません。「なぜこの特定のクエリが遅かったのか？」と自問し、実際のリソース使用パターンを調べてください。

## メモリと行スキャン {#memory-and-row-scanning}

Sentryは、400万人以上の開発者から日々数十億のイベントを処理する開発者優先のエラー追跡プラットフォームです。彼らの重要な洞察: *「この特定の状況でメモリを駆動するのはグルーピングキーのカーディナリティです」* - 高カーディナリティの集約は、行スキャンではなくメモリ枯渇によってパフォーマンスを低下させます。

クエリが失敗した場合、それがメモリの問題（グループが多すぎる）なのか、スキャンの問題（行が多すぎる）なのかを判断します。

`GROUP BY user_id, error_message, url_path`のようなクエリは、すべてのユニークな値の組み合わせごとに別のメモリ状態を生成します。ユーザー、エラーの種類、URLパスの負荷が高いと、同時にメモリに保持される必要がある何百万もの集約状態が生成される可能性があります。

極端なケースでは、Sentryは決定論的サンプリングを使用します。10%のサンプルはメモリ使用量を90%削減し、ほとんどの集約の精度を約5%維持します：

```sql
WHERE cityHash64(user_id) % 10 = 0  -- Always same 10% of users
```

これにより、同じユーザーがすべてのクエリに表示され、時間帯を越えて一貫した結果が得られます。重要な洞察: `cityHash64()`は、同じ入力に対して一貫したハッシュ値を生成するため、`user_id = 12345`は常に同じ値にハッシュされ、ユーザーは10%のサンプルに常に含まれるか、決して含まれない - クエリ間でのちらつきはありません。

## Sentryのビットマスク最適化 {#bit-mask-optimization}

高カーディナリティのカラム（URLなど）で集約する場合、各ユニークな値はメモリ内に別の集約状態を作成し、メモリの枯渇につながります。Sentryの解決策: 実際のURL文字列でグルーピングするのではなく、ビットマスクに収束するブール式でグルーピングします。

次のクエリは、この状況が該当する場合にあなたのテーブルで試すことができます：

```sql
-- Memory-Efficient Aggregation Pattern: Each condition = one integer per group
-- Key insight: sumIf() creates bounded memory regardless of data volume
-- Memory per group: N integers (N * 8 bytes) where N = number of conditions

SELECT 
    your_grouping_column,

    -- Each sumIf creates exactly one integer counter per group
    -- Memory stays constant regardless of how many rows match each condition
    sumIf(1, your_condition_1) as condition_1_count,
    sumIf(1, your_condition_2) as condition_2_count,
    sumIf(1, your_text_column LIKE '%pattern%') as pattern_matches,
    sumIf(1, your_numeric_column > threshold_value) as above_threshold,

    -- Complex multi-condition aggregations still use constant memory
    sumIf(1, your_condition_1 AND your_text_column LIKE '%pattern%') as complex_condition_count,

    -- Standard aggregations for context
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

ユニークな文字列をメモリに保存する代わりに、その文字列に関する質問への回答を整数として保存します。集約状態は、データの多様性にかかわらず、限界があり、小さくなります。

Sentryのエンジニアリングチームから: 「これらの重いクエリは10倍以上速くなり、メモリ使用量は100倍低下しました（そして、より重要なことに、限界があります）。私たちの大規模な顧客は、リプレイを検索する際にエラーを見ることがなくなり、私たちは任意のサイズの顧客をサポートできるようになりました。」

## 動画のソース {#video-sources}

- [Lost in the Haystack - Optimizing High Cardinality Aggregations](https://www.youtube.com/watch?v=paK84-EUJCA) - Sentryのメモリ最適化に関するプロダクションの教訓
- [ClickHouse Performance Analysis](https://www.youtube.com/watch?v=lxKbvmcLngo) - デバッグ手法のアレクセイ・ミロビドフ
- [ClickHouse Meetup: Query Optimization Techniques](https://www.youtube.com/watch?v=JBomQk4Icjo) - コミュニティの最適化戦略

**次を読む**:
- [Query Optimization Guide](/optimize/query-optimization)
- [Materialized Views Community Insights](./materialized-views.md)
