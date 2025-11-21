---
sidebar_position: 1
slug: /tips-and-tricks/too-many-parts
sidebar_label: 'パーツが多すぎる'
doc_type: 'guide'
keywords: [
  'clickhouse too many parts',
  'パーツが多すぎる エラー',
  'clickhouse insert batching',
  'パーツ爆発（part explosion）問題',
  'clickhouse マージ性能',
  'バルクインサートの最適化',
  'clickhouse 非同期インサート',
  '小規模インサートの問題',
  'clickhouse パーツ管理',
  'インサート性能の最適化',
  'clickhouse バッチインサート戦略',
  'データベースインサートパターン'
]
title: 'レッスン - パーツが多すぎる問題'
description: '「Too Many Parts」問題の解決と予防'
---



# パーツ数過多の問題 {#the-too-many-parts-problem}

_本ガイドは、コミュニティミートアップから得られた知見をまとめたコレクションの一部です。実際の解決策や洞察については、[特定の問題別に参照](./community-wisdom.md)できます。_
_パフォーマンス最適化のヒントをさらにお探しですか？[パフォーマンス最適化](./performance-optimization.md)のコミュニティインサイトガイドをご確認ください。_


## 問題の理解 {#understanding-the-problem}

ClickHouseは、深刻なパフォーマンス低下を防ぐために「Too many parts」エラーを発生させます。小さなパーツは複数の問題を引き起こします：クエリ実行時により多くのファイルの読み取りとマージが必要となることによるクエリパフォーマンスの低下、各パーツがメモリ内にメタデータを保持する必要があることによるメモリ使用量の増加、小さなデータブロックは効果的に圧縮できないことによる圧縮効率の低下、より多くのファイルハンドルとシーク操作によるI/Oオーバーヘッドの増加、そしてマージスケジューラへの作業負荷増大によるバックグラウンドマージの遅延です。

**関連ドキュメント**

- [MergeTreeエンジン](/engines/table-engines/mergetree-family/mergetree)
- [パーツ](/parts)
- [パーツシステムテーブル](/operations/system-tables/parts)


## 問題の早期発見 {#recognize-parts-problem}

このクエリは、すべてのアクティブなテーブルのパート数とサイズを分析することで、テーブルの断片化を監視します。マージ最適化が必要となる可能性のある、過剰または過小なパートを持つテーブルを特定します。クエリパフォーマンスに影響が出る前に断片化の問題を検出するため、定期的に使用してください。

```sql runnable editable
-- 課題: 本番環境では実際のデータベース名とテーブル名に置き換えてください
-- 実験: システムに応じてパート数の閾値(1000, 500, 100)を調整してください
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
        WHEN count() > 1000 THEN 'CRITICAL - パート数が過剰です (>1000)'
        WHEN count() > 500 THEN 'WARNING - パート数が多いです (>500)'
        WHEN count() > 100 THEN 'CAUTION - パート数が増加しています (>100)'
        ELSE 'OK - パート数は適切です'
    END as parts_assessment,
    CASE
        WHEN avg(rows) < 1000 THEN 'POOR - パートが非常に小さいです'
        WHEN avg(rows) < 10000 THEN 'FAIR - パートが小さいです'
        WHEN avg(rows) < 100000 THEN 'GOOD - パートは中程度です'
        ELSE 'EXCELLENT - パートが大きいです'
    END as part_size_assessment
FROM system.parts
WHERE active = 1
  AND database NOT IN ('system', 'information_schema')
GROUP BY database, table
ORDER BY total_parts DESC
LIMIT 20;
```


## 動画リソース {#video-sources}

- [Fast, Concurrent, and Consistent Asynchronous INSERTS in ClickHouse](https://www.youtube.com/watch?v=AsMPEfN5QtM) - ClickHouseチームメンバーによる非同期インサートとtoo many parts問題の解説
- [Production ClickHouse at Scale](https://www.youtube.com/watch?v=liTgGiTuhJE) - 可観測性プラットフォームにおける実運用でのバッチング戦略
