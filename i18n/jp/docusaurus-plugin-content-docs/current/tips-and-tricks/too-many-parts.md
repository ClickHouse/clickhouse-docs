---
sidebar_position: 1
slug: /tips-and-tricks/too-many-parts
sidebar_label: 'パーツ数が多すぎる'
doc_type: 'guide'
keywords: [
  'ClickHouse パーツ数が多すぎる',
  'Too Many Parts エラー',
  'ClickHouse 挿入のバッチ処理',
  'パーツの爆発的増加問題',
  'ClickHouse マージ性能',
  'バッチ挿入の最適化',
  'ClickHouse 非同期挿入',
  '小さな挿入の問題',
  'ClickHouse パーツ管理',
  '挿入パフォーマンスの最適化',
  'ClickHouse バッチ挿入戦略',
  'データベース挿入パターン'
]
title: 'レッスン - パーツ数が多すぎる問題'
description: 'Too Many Parts の解決策と防止策'
---

# パーツが多すぎる問題 {#the-too-many-parts-problem}
*このガイドは、コミュニティミートアップから得られた知見をまとめたコレクションの一部です。より実践的なソリューションやインサイトについては、[問題別に閲覧](./community-wisdom.md)できます。*
*さらにパフォーマンス最適化のヒントが必要な場合は、[パフォーマンス最適化](./performance-optimization.md) に関するコミュニティインサイトガイドを参照してください。*

## 問題の理解 {#understanding-the-problem}

ClickHouse は深刻なパフォーマンス低下を防ぐため、「Too many parts」エラーを発生させます。小さな part が多いと、さまざまな問題を引き起こします。クエリ処理時に読み込み・マージすべきファイルが増えることによるクエリパフォーマンスの低下、各 part ごとにメモリ上でメタデータを保持する必要があることによるメモリ使用量の増加、小さなデータブロックは圧縮効率が低いため圧縮率が悪化すること、より多くのファイルハンドルとシーク処理が必要になることによる I/O オーバーヘッドの増加、そしてマージスケジューラの負荷増大によるバックグラウンドマージの低速化です。

**関連ドキュメント**
- [MergeTree エンジン](/engines/table-engines/mergetree-family/mergetree)
- [Parts](/parts)
- [Parts システムテーブル](/operations/system-tables/parts)

## 問題を早期に把握する {#recognize-parts-problem}

このクエリは、すべてのアクティブなテーブルに対してパーツ数とサイズを分析することで、テーブルのフラグメンテーションを監視します。マージの最適化が必要となる可能性がある、サイズが大きすぎる／小さすぎるパーツを持つテーブルを特定します。クエリパフォーマンスに影響が出る前にフラグメンテーションの問題を検出できるよう、これを定期的に実行してください。

```sql runnable editable
-- 課題: 本番環境では実際のデータベース名とテーブル名に置き換えてください
-- 実験: システムに応じてパート数のしきい値（1000、500、100）を調整してください
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
        WHEN count() > 500 THEN 'WARNING - パート数が多くなっています (>500)'
        WHEN count() > 100 THEN 'CAUTION - パート数が増加しています (>100)'
        ELSE 'OK - パート数は適切です'
    END as parts_assessment,
    CASE 
        WHEN avg(rows) < 1000 THEN 'POOR - パートサイズが非常に小さい'
        WHEN avg(rows) < 10000 THEN 'FAIR - パートサイズが小さい'
        WHEN avg(rows) < 100000 THEN 'GOOD - パートサイズは中程度'
        ELSE 'EXCELLENT - パートサイズが大きい'
    END as part_size_assessment
FROM system.parts
WHERE active = 1
  AND database NOT IN ('system', 'information_schema')
GROUP BY database, table
ORDER BY total_parts DESC
LIMIT 20;
```

## 動画リソース {#video-sources}

- [ClickHouse における高速・並列・一貫性のある非同期 INSERT](https://www.youtube.com/watch?v=AsMPEfN5QtM) - ClickHouse チームメンバーが非同期 INSERT と「too many parts」問題について解説
- [大規模な本番環境での ClickHouse 運用](https://www.youtube.com/watch?v=liTgGiTuhJE) - オブザーバビリティプラットフォームにおける実践的なバッチ処理戦略