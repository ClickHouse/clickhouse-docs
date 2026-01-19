---
slug: /guides/developer/overview
sidebar_label: '高度なガイドの概要'
description: '高度なガイドの概要'
title: '高度なガイド'
keywords: ['ClickHouse 高度なガイド', '開発者ガイド', 'クエリ最適化', 'マテリアライズドビュー', '重複排除', '時系列データ', 'クエリ実行']
doc_type: 'guide'
---

# 上級ガイド \{#advanced-guides\}

このセクションには、次の上級ガイドが含まれます。

| Guide                                                                                                                  | Description                                                                                                                                                                                                                                                                                                                                    |
|------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Alternative Query Languages](../developer/alternative-query-languages)                                         | サポートされている別のクエリ言語方言とその使い方を説明するガイドです。各方言でのクエリ例を示します。                                                                                                                                                                                                                                                 |
| [Cascading Materialized Views](../developer/cascading-materialized-views)                                       | マテリアライズドビューの作成方法と、それらをカスケードして複数のソーステーブルを 1 つの宛先テーブルにまとめる方法に関するガイドです。ドメイン名のグループに対して、月および年単位でデータを集計するためにカスケードしたマテリアライズドビューを使用する例を含みます。                                                               |
| [Debugging memory issues](../developer/debugging-memory-issues)                                                 | ClickHouse 内でメモリ関連の問題をデバッグする方法に関するガイドです。                                                                                                                                                                                                                                                                            |
| [Deduplicating Inserts on Retries](../developer/deduplicating-inserts-on-retries)                               | 失敗した INSERT を再試行する必要がある状況の扱い方に関するガイドです。                                                                                                                                                                                                                                                                            |
| [Deduplication strategies](../developer/deduplication)                                                          | データの重複排除（データベースから重複行を削除する手法）を掘り下げるガイドです。OLTP システムにおける主キーに基づく重複排除との違い、ClickHouse による重複排除のアプローチ、および ClickHouse クエリ内で重複データが発生した場合の扱い方を説明します。                                                                    |
| [Filling gaps in time-series data](../developer/time-series-filling-gaps)                                       | ClickHouse による時系列データ処理機能について解説するガイドで、より完全かつ連続的な時系列情報の表現を得るために、データの欠損部分を補完する手法を紹介します。                                                                                                                                                                                     |
| [Manage Data with TTL (Time-to-live)](../developer/ttl)                                                         | 時系列データの欠損部分を補完するために `WITH FILL` 句を使用する方法を説明するガイドです。欠損部分を 0 で埋める方法、補完の開始点を指定する方法、特定の終了点まで欠損を埋める方法、および累積計算のために値を補間する方法を取り上げます。                                                                                                   |
| [Stored procedures &amp; query parameters](../developer/stored-procedures-and-prepared-statements)                  | ClickHouse は従来型のストアドプロシージャをサポートしていないことを説明し、その代替として推奨される User-Defined Functions (UDF)、パラメータ化ビュー、マテリアライズドビュー、および外部オーケストレーションについて解説するガイドです。また、プリペアドステートメントに類似した安全なパラメータ化クエリのためのクエリパラメータについても取り上げます。 |
| [Understanding query execution with the Analyzer](../developer/understanding-query-execution-with-the-analyzer) | Analyzer ツールを紹介しながら、ClickHouse のクエリ実行を分かりやすく説明するガイドです。Analyzer がクエリを一連のステップに分解する方法を解説し、実行全体を可視化およびトラブルシュートして最適なパフォーマンスを得る方法を示します。                                                                                                      |
| [Using JOINs in ClickHouse](../joining-tables)                                                                  | ClickHouse におけるテーブルの結合を分かりやすく説明するガイドです。さまざまな結合タイプ（`INNER`、`LEFT`、`RIGHT` など）を取り上げ、（小さいテーブルを右側に置くなど）効率的な結合のベストプラクティスを解説し、複雑なデータリレーションシップに対するクエリを最適化するために役立つ、ClickHouse の内部結合アルゴリズムに関する知見を提供します。 |