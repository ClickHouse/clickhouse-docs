---
slug: /use-cases/observability/clickstack/admin
title: 'ClickStack - 管理'
sidebar_label: '管理'
description: 'ClickStack で基本的な管理タスクを実行する方法。'
doc_type: 'guide'
keywords: ['clickstack', 'admin']
---

ClickStack における管理タスクの多くは、基盤となる ClickHouse データベース上で直接実行されます。ClickStack をデプロイするユーザーは、ClickHouse の基本的な概念および管理の基礎に精通している必要があります。

管理操作は一般的に DDL 文の実行を伴います。利用可能なオプションは、Managed ClickStack を使用しているか、ClickStack Open Source を使用しているかによって異なります。

## ClickStack オープンソース \{#clickstack-oss\}

ClickStack オープンソースのデプロイメントでは、ユーザーは [ClickHouse client](/interfaces/cli) を使用して管理作業を実行します。クライアントはネイティブな ClickHouse プロトコルを介してデータベースに接続し、完全な DDL および管理操作をサポートするとともに、クエリに対してインタラクティブなフィードバックを提供します。

## マネージド ClickStack \{#clickstack-managed\}

マネージド ClickStack では、ClickHouse クライアントと [SQL Console](/cloud/get-started/sql-console) の両方を利用できます。クライアント経由で接続するには、[サービス用の認証情報](/cloud/guides/sql-console/gather-connection-details) を取得する必要があります。

[SQL Console](/cloud/get-started/sql-console) は Web ベースのインターフェイスであり、SQL のオートコンプリート、クエリ履歴、結果の可視化のための組み込みチャート機能などを備え、より便利に利用できます。