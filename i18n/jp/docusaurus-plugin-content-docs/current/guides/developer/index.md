---
slug: /guides/developer/overview
sidebar_label: '上級ガイドの概要'
description: '上級ガイドの概要'
title: '上級ガイド'
keywords: ['ClickHouse 上級ガイド', '開発者向けガイド', 'クエリ最適化', 'マテリアライズドビュー', '重複排除', '時系列', 'クエリ実行']
doc_type: 'guide'
---

# 上級ガイド

このセクションでは、次の上級ガイドを提供します。

| Guide                                                                                                                  | Description                                                                                                                                                                                                                                                                                                                                    |
|------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Alternative Query Languages](../developer/alternative-query-languages)                                         | サポートされている代替クエリ言語（方言）とその使用方法についてのガイドです。各方言でのクエリ例を示します。                                                                                                                                                                                                                                     |
| [Cascading Materialized Views](../developer/cascading-materialized-views)                                       | マテリアライズドビューを作成し、それらをカスケードさせて、複数のソーステーブルを 1 つの宛先テーブルに統合する方法に関するガイドです。カスケードされたマテリアライズドビューを使用して、ドメイン名のグループに対して月次および年次でデータを集計する例を含みます。                                                                                     |
| [Debugging memory issues](../developer/debugging-memory-issues)                                                 | ClickHouse 内のメモリ問題をデバッグする方法に関するガイドです。                                                                                                                                                                                                                                                                              |
| [Deduplicating Inserts on Retries](../developer/deduplicating-inserts-on-retries)                               | 失敗した挿入を再試行する可能性がある状況をどのように扱うかについてのガイドです。                                                                                                                                                                                                                                                              |
| [Deduplication strategies](../developer/deduplication)                                                          | データの重複排除について掘り下げるガイドであり、データベースから重複行を削除する手法を説明します。OLTP システムにおける主キーに基づく重複排除との違い、ClickHouse における重複排除のアプローチ、および ClickHouse クエリ内で重複データのシナリオを処理する方法を解説します。                                                            |
| [Filling gaps in time-series data](../developer/time-series-filling-gaps)                                       | 時系列データを扱うための ClickHouse の機能について解説するガイドであり、より完全で連続的な時系列情報を表現するために、データの欠損（ギャップ）を埋める手法を含みます。                                                                                                                                                                         |
| [Manage Data with TTL (Time-to-live)](../developer/ttl)                                                         | `WITH FILL` 句を使用して時系列データの欠損を埋める方法について説明するガイドです。0 で欠損を埋める方法、欠損を埋め始める開始点の指定方法、特定の終了点まで欠損を埋める方法、および累積計算のために値を補間する方法を扱います。                                                                                                           |
| [Stored procedures & query parameters](../developer/stored-procedures-and-prepared-statements)                  | ClickHouse は従来のストアドプロシージャをサポートしていないことを説明し、その推奨代替手段として User-Defined Functions (UDF)、パラメータ化されたビュー、マテリアライズドビュー、および外部オーケストレーションを紹介するガイドです。また、プリペアドステートメントに類似した、安全なパラメータ化クエリのためのクエリパラメータについても解説します。 |
| [Understanding query execution with the Analyzer](../developer/understanding-query-execution-with-the-analyzer) | Analyzer ツールを紹介することで ClickHouse のクエリ実行を分かりやすく説明するガイドです。Analyzer がクエリを一連のステップに分解し、それにより最適なパフォーマンスのために実行全体を可視化およびトラブルシュートできるようになる仕組みを解説します。                                                                      |
| [Using JOINs in ClickHouse](../joining-tables)                                                                  | ClickHouse におけるテーブルの結合を分かりやすく説明するガイドです。さまざまな結合種別（`INNER`、`LEFT`、`RIGHT` など）を扱い、小さいテーブルを右側に置くといった効率的な結合のベストプラクティスを解説し、ClickHouse の内部結合アルゴリズムについての知見を提供して、複雑なデータ関係に対するクエリの最適化に役立てます。              |