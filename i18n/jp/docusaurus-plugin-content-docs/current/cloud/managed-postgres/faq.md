---
slug: /cloud/managed-postgres/faq
sidebar_label: 'よくある質問'
title: 'Managed Postgres のよくある質問'
description: 'ClickHouse Managed Postgres に関するよくある質問'
keywords: ['managed postgres faq', 'postgres の質問', 'メトリクス', '拡張機能', '移行', 'terraform']
doc_type: 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="faq" />


## 監視とメトリクス \{#monitoring-and-metrics\}

### Managed Postgres インスタンスのメトリクスにはどのようにアクセスできますか？ \{#metrics-access\}

ClickHouse Cloud コンソールの Managed Postgres インスタンス画面にある **Monitoring** タブから、CPU、メモリ、IOPS、ストレージ使用量を直接監視できます。

:::note
詳細なクエリ分析のための Query Performance Insights 機能は近日提供予定です。
:::

## バックアップとリカバリ \{#backup-and-recovery\}

### どのようなバックアップオプションがありますか？ \{#backup-options\}

Managed Postgres には、連続 WAL アーカイブ付きの自動日次バックアップが含まれており、7 日間の保持期間内の任意の時点に対してポイントインタイムリカバリを実行できます。バックアップは S3 に保存されます。

バックアップの頻度や保持期間、ポイントインタイムリカバリの実行方法などの詳細については、[バックアップとリストア](/cloud/managed-postgres/backup-and-restore)ドキュメントを参照してください。

## インフラと自動化 \{#infrastructure-and-automation\}

### Managed Postgres に Terraform のサポートはありますか？ \{#terraform-support\}

Managed Postgres に対する Terraform のサポートは現在提供されていません。インスタンスの作成と管理には ClickHouse Cloud コンソールの利用を推奨します。

## 拡張機能と設定 \{#extensions-and-configuration\}

### どの拡張機能がサポートされていますか？ \{#extensions-supported\}

Managed Postgres には、PostGIS、pgvector、pg_cron などのよく利用されているものを含む、100 以上の PostgreSQL 拡張機能が含まれています。利用可能な拡張機能の一覧とインストール手順については、[Extensions](/cloud/managed-postgres/extensions) ドキュメントを参照してください。

### PostgreSQL の構成パラメータをカスタマイズできますか？ \{#config-customization\}

はい、コンソールの **Settings** タブから PostgreSQL と PgBouncer の構成パラメータを変更できます。利用可能なパラメータと変更方法の詳細については、[Settings](/cloud/managed-postgres/settings) ドキュメントを参照してください。

:::tip
現在利用できないパラメータが必要な場合は、[support](https://clickhouse.com/support/program) に連絡してリクエストしてください。
:::

## データベース機能 \{#database-capabilities\}

### 複数のデータベースおよびスキーマを作成できますか？ \{#multiple-databases-schemas\}

はい。Managed Postgres は、単一インスタンス内で複数のデータベースおよびスキーマをサポートする PostgreSQL のネイティブ機能を完全に提供します。標準的な PostgreSQL コマンドを使用して、データベースおよびスキーマを作成および管理できます。

### ロールベースアクセス制御（RBAC）はサポートされていますか？ \{#rbac-support\}

Managed Postgres インスタンスには完全なスーパーユーザー権限が付与されており、標準的な PostgreSQL コマンドを使用してロールを作成し、権限を管理できます。

:::note
コンソールとの統合による拡張 RBAC 機能は、今年中に提供予定です。
:::

## 移行 \{#migration\}

### Managed Postgres への移行にはどのようなツールがありますか？ \{#migration-tools\}

Managed Postgres では、複数の移行手法をサポートしています。

- **pg_dump と pg_restore**: 小規模なデータベースや一度限りの移行に適しています。詳細は [pg_dump と pg_restore](/cloud/managed-postgres/migrations/pg_dump-pg_restore) ガイドを参照してください。
- **論理レプリケーション (Logical replication)**: ダウンタイムを最小限に抑える必要がある大規模なデータベース向けです。詳細は [Logical replication](/cloud/managed-postgres/migrations/logical-replication) ガイドを参照してください。
- **PeerDB**: 他の Postgres インスタンスからの CDC ベースのレプリケーション向けです。詳細は [PeerDB migration](/cloud/managed-postgres/migrations/peerdb) ガイドを参照してください。

:::note
完全マネージドの移行エクスペリエンスは近日提供予定です。
:::