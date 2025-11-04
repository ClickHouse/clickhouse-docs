---
'sidebar_position': 1
'slug': '/tips-and-tricks/too-many-parts'
'sidebar_label': 'パーツが多すぎる'
'doc_type': 'guide'
'keywords':
- 'clickhouse too many parts'
- 'too many parts error'
- 'clickhouse insert batching'
- 'part explosion problem'
- 'clickhouse merge performance'
- 'batch insert optimization'
- 'clickhouse async inserts'
- 'small insert problems'
- 'clickhouse parts management'
- 'insert performance optimization'
- 'clickhouse batching strategy'
- 'database insert patterns'
'title': 'レッスン - パーツが多すぎる問題'
'description': 'パーツが多すぎるの解決策と予防'
---


# あまりにも多くのパーツの問題 {#the-too-many-parts-problem}
*このガイドは、コミュニティミートアップから得られた知見のコレクションの一部です。より現実的な解決策や洞察については、[特定の問題でブラウズ](./community-wisdom.md)できます。*
*パフォーマンス最適化のヒントがもっと必要ですか？[パフォーマンス最適化](./performance-optimization.md)コミュニティインサイトガイドをチェックしてください。*

## 問題の理解 {#understanding-the-problem}

ClickHouse は、深刻なパフォーマンス低下を防ぐために「Too many parts」エラーをスローします。小さなパーツは、次のようないくつかの問題を引き起こします。クエリ中により多くのファイルを読み取り、マージすることによるクエリパフォーマンスの低下、各パーツがメモリ内でメタデータを必要とするためのメモリ使用量の増加、データブロックが小さいほど圧縮効率の低下、より多くのファイルハンドルとシーク操作による I/O オーバーヘッドの増加、マージスケジューラにより多くの作業を与えるために遅くなるバックグラウンドマージです。

**関連ドキュメント**
- [MergeTree エンジン](/engines/table-engines/mergetree-family/mergetree)
- [パーツ](/parts)
- [パーツシステムテーブル](/operations/system-tables/parts)

## 早期に問題を認識する {#recognize-parts-problem}

このクエリは、すべてのアクティブなテーブル全体のパーツカウントとサイズを分析することによって、テーブルの断片化を監視します。マージ最適化が必要かもしれない過剰またはサイズの小さいパーツを持つテーブルを特定します。クエリのパフォーマンスに影響を与える前に、断片化の問題をキャッチするために、これを定期的に使用してください。

```sql runnable editable
-- Challenge: Replace with your actual database and table names for production use
-- Experiment: Adjust the part count thresholds (1000, 500, 100) based on your system
SELECT 
    database,
    table,
    count() as total_parts,
    sum(rows) as total_rows,
    round(avg(rows), 0) as avg_rows_per_part,
    min(rows) as min_rows_per_part,
    max(rows) as max_rows_per_part,
    round(sum(bytes_on_disk) / 1024 / 1024, 2) as total_size_mb,
    CASE 
        WHEN count() > 1000 THEN 'CRITICAL - Too many parts (>1000)'
        WHEN count() > 500 THEN 'WARNING - Many parts (>500)'
        WHEN count() > 100 THEN 'CAUTION - Getting many parts (>100)'
        ELSE 'OK - Reasonable part count'
    END as parts_assessment,
    CASE 
        WHEN avg(rows) < 1000 THEN 'POOR - Very small parts'
        WHEN avg(rows) < 10000 THEN 'FAIR - Small parts'
        WHEN avg(rows) < 100000 THEN 'GOOD - Medium parts'
        ELSE 'EXCELLENT - Large parts'
    END as part_size_assessment
FROM system.parts
WHERE active = 1
  AND database NOT IN ('system', 'information_schema')
GROUP BY database, table
ORDER BY total_parts DESC
LIMIT 20;
```

## ビデオソース {#video-sources}

- [ClickHouse における迅速で同時かつ一貫した非同期INSERT](https://www.youtube.com/watch?v=AsMPEfN5QtM) - ClickHouseチームメンバーが非同期挿入とあまりにも多くのパーツの問題について説明
- [スケールでのプロダクション ClickHouse](https://www.youtube.com/watch?v=liTgGiTuhJE) - 可観測性プラットフォームからの実際のバッチ処理戦略
