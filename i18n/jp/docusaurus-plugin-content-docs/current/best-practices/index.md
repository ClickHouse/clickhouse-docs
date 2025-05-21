---
slug: /best-practices
keywords: ['Cloud', '主キー', 'Ordering key', 'Materialized Views', 'ベストプラクティス', 'Bulk Inserts', 'Asynchronous Inserts', 'Mutationsを避ける', 'Nullable Columnsを避ける', 'OPTIMIZE FINALを避ける', 'パーティショニングキー']
title: '概要'
hide_title: true
description: 'ClickHouseにおけるベストプラクティスセクションのランディングページ'
---
```


# ClickHouseにおけるベストプラクティス {#best-practices-in-clickhouse}

このセクションでは、ClickHouseを最大限に活用するために従うべきベストプラクティスを提供します。

| ページ                                                                   | 説明                                                                     |
|------------------------------------------------------------------------|--------------------------------------------------------------------------|
| [主キーの選択](/best-practices/choosing-a-primary-key)                  | ClickHouseにおける効果的な主キーの選択に関するガイダンス。                   |
| [データ型の選択](/best-practices/select-data-types)                     | 適切なデータ型を選ぶための推奨事項。                                      |
| [マテリアライズドビューの使用](/best-practices/use-materialized-views)    | マテリアライズドビューの利点を得るためのタイミングと方法。                   |
| [JOINの最小化と最適化](/best-practices/minimize-optimize-joins)         | JOIN操作を最小限に抑え、最適化するためのベストプラクティス。                |
| [パーティショニングキーの選択](/best-practices/choosing-a-partitioning-key) | 効果的にパーティショニングキーを選択し、適用する方法。                  |
| [挿入戦略の選択](/best-practices/selecting-an-insert-strategy)         | ClickHouseにおける効率的なデータ挿入のための戦略。                      |
| [データスキッピングインデックス](/best-practices/use-data-skipping-indices-where-appropriate) | パフォーマンス向上のためにデータスキッピングインデックスを適用するタイミング。 |
| [ミューテーションを避ける](/best-practices/avoid-mutations)              | ミューテーションを避ける理由と、それなしで設計する方法。                    |
| [OPTIMIZE FINALを避ける](/best-practices/avoid-optimize-final)        | `OPTIMIZE FINAL`がコスト高になり得る理由とその回避方法。                    |
| [必要に応じてJSONを使用する](/best-practices/use-json-where-appropriate) | ClickHouseにおけるJSONカラムの使用に関する考慮事項。                      |
