---
slug: /cloud/bestpractices
keywords: ['Cloud', 'ベストプラクティス', 'バルクインサート', '非同期インサート', 'ミューテーションを避ける', 'Nullableカラムを避ける', 'Optimize Finalを避ける', '低カーディナリティパーティショニングキー', 'マルチテナンシー', '使用制限']
title: '概要'
hide_title: true
description: 'ClickHouse Cloudにおけるベストプラクティスセクションのランディングページ'
---


# ClickHouse Cloudにおけるベストプラクティス {#best-practices-in-clickhouse-cloud}

このセクションでは、ClickHouse Cloudから最大限の効果を得るために従うべきベストプラクティスを提供します。

| ページ                                                     | 説明                                                                |
|----------------------------------------------------------|----------------------------------------------------------------------------|
| [使用制限](/cloud/bestpractices/usage-limits)| ClickHouseの制限を探る。                                          |
| [マルチテナンシー](/cloud/bestpractices/multi-tenancy)| マルチテナンシーを実装するための異なる戦略について学ぶ。                                          |

これは、すべてのClickHouseのデプロイメントに適用される標準ベストプラクティスに加えられます。

| ページ                                                                 | 説明                                                              |
|----------------------------------------------------------------------|--------------------------------------------------------------------------|
| [主キーの選択](/best-practices/choosing-a-primary-key)     | ClickHouseで効果的な主キーを選択するためのガイダンス。            |
| [データ型の選択](/best-practices/select-data-types)               | 適切なデータ型を選択するための推奨。                     |
| [マテリアライズドビューの使用](/best-practices/use-materialized-views)     | マテリアライズドビューの利点とその使用法。                         |
| [JOINの最適化と最小化](/best-practices/minimize-optimize-joins)| JOIN操作を最小化し最適化するためのベストプラクティス。            |
| [パーティショニングキーの選択](/best-practices/choosing-a-partitioning-key) | 効果的にパーティショニングキーを選択・適用する方法。              |
| [インサート戦略の選択](/best-practices/selecting-an-insert-strategy) | ClickHouseにおける効率的なデータ挿入のための戦略。             |
| [データスキッピングインデックス](/best-practices/use-data-skipping-indices-where-appropriate) | パフォーマンス向上のためにデータスキッピングインデックスを適用するタイミング。    |
| [ミューテーションを避ける](/best-practices/avoid-mutations)                   | ミューテーションを避ける理由と設計方法。               |
| [OPTIMIZE FINALを避ける](/best-practices/avoid-optimize-final)         | `OPTIMIZE FINAL`がコスト高になる理由とその回避法。           |
| [適切な場面でJSONを使用](/best-practices/use-json-where-appropriate) | ClickHouseでJSONカラムを使用する際の考慮事項。               |
