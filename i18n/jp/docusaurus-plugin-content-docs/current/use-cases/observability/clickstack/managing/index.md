---
slug: /use-cases/observability/clickstack/managing
title: 'ClickStack の管理'
pagination_prev: null
pagination_next: null
sidebar_label: 'ClickStack の管理'
description: 'ClickStack の管理'
doc_type: 'guide'
keywords: ['managing ClickStack', 'performance', 'materialized views', 'admin commands']
---

本セクションでは、ClickStack の管理方法について説明します。

## 管理者ガイド \{#admin-guides\}

| セクション | 説明 |
|--------|-------------|
| [基本的な管理](/use-cases/observability/clickstack/admin) | ClickStack で一般的な管理タスクを実行するための入門ガイド。 |
| [本番運用への移行](/use-cases/observability/clickstack/production) | ClickStack を本番環境で稼働させる前に推奨される手順とベストプラクティス。 |
| [Materialized views](/use-cases/observability/clickstack/materialized_views) | ClickStack で materialized view を使用してクエリ性能を向上させるための詳細ガイド。 |
| [パフォーマンスチューニング](/use-cases/observability/clickstack/performance_tuning) | 大規模ワークロード向けに ClickStack をチューニングするための包括的なガイド。 |

## Core ClickHouse concepts \{#core-concepts\}

ClickStack のほとんどの管理タスクでは、基盤となる ClickHouse データベースについての理解が必要です。管理タスクやパフォーマンス関連の操作を行う前に、以下に示す ClickHouse の中核となる概念を確認することを推奨します。

| Concept | Description |
|---------|-------------|
| **Tables** | ClickStack のデータソースが基盤となる ClickHouse テーブルへどのようにマッピングされるか。ClickHouse テーブルは主に [MergeTree](/engines/table-engines/mergetree-family/mergetree) エンジンを使用します。 |
| **Parts** | データがどのように不変のパーツとして書き込まれ、時間の経過とともにマージされるか。 |
| **Partitions** | データ管理、クエリ、および最適化を簡素化する、テーブルのパーツの論理的なグルーピング。 |
| **Merges** | クエリ対象となるパーツ数を減らし、パフォーマンスを維持するためにパーツを結合するバックグラウンド処理。 |
| **Granules** | クエリ実行時に読み取りおよびプルーニングされる最小のデータ単位。 |
| **Primary (ordering) keys** | `ORDER BY` キーがディスク上のデータレイアウト、圧縮、およびクエリ・プルーニング動作をどのように定義するか。 |

これらの概念は ClickHouse のパフォーマンスの基礎であり、ClickStack を管理する際に、十分な情報に基づいた管理上の判断を行うのに役立ちます。