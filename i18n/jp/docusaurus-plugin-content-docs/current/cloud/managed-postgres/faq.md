---
slug: /cloud/managed-postgres/faq
sidebar_label: 'よくある質問'
title: 'Managed Postgres のよくある質問'
description: 'ClickHouse Managed Postgres に関するよくある質問'
keywords: ['managed postgres faq', 'postgres の質問', 'メトリクス', '拡張機能', '移行', 'terraform', 'pgbouncer', 'プリペアドステートメント']
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

## 接続プーリング \{#connection-pooling\}

### なぜ、PgBouncer 経由で `prepared statement does not exist` エラーが表示されるのですか？ \{#prepared-statement-errors\}

Managed Postgres では、PgBouncer が **transaction pooling** モードで動作します。このモードでは、バックエンドの Postgres 接続は 1 回のトランザクションの間だけクライアントに割り当てられ、完了するとプールに戻されます。そのため、同じクライアントからの次のトランザクションは別のバックエンドに割り当てられることがあります。

この仕組みにより、`PREPARE` (または拡張クエリの `Parse`) を実行した特定のバックエンドに紐づく **サーバー側 prepared statement** は機能しません。対応する `Execute` が別のバックエンドに送られると、次のようなエラーが発生します。

```text
ERROR:  prepared statement "..." does not exist
ERROR:  unnamed prepared statement does not exist
```

この同じ根本原因に行き着くことが多い症状:

* `prepared statement does not exist` エラーが断続的に多発する。特にバックフィル時や高並行な書き込み時に起こりやすい
* insert が「サイレントに失敗した」ように見える — ステートメントでエラーが発生し、ドライバが再試行した結果、バッチが部分的にしか適用されなかったり、破棄されたりすることがある
* 誤った型で値が返される (たとえば、`BIGINT` カラムが `float64` のビットパターンとしてデコードされる) — これは、クライアント側でキャッシュされたプランが、対応する `Parse` が一度も送信されていないバックエンドに対して、古い型／フォーマットコードを再利用した場合に発生する

**対処法: ドライバでサーバー側のプリペアドステートメントを無効にしてください。** 設定項目は、使用しているクライアントライブラリによって異なります:

| Driver                           | Setting                                                                                |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| **pgx** (Go)                     | `statement_cache_capacity=0` and `default_query_exec_mode=exec` (or `simple_protocol`) |
| **psycopg3** (Python)            | `prepare_threshold=None`                                                               |
| **asyncpg** (Python)             | `statement_cache_size=0`                                                               |
| **JDBC** (Java)                  | `prepareThreshold=0`                                                                   |
| **node-postgres / pg** (Node.js) | `query()` に `name` を渡さないでください (名前付きクエリはサーバー側でプリペアされます)                                 |

ワークロードがプリペアドステートメントに依存している場合は、PgBouncer プーラーを経由せず、**PostgreSQL に直接** (ポート 5432) 接続してください — 直接接続ではプリペアドステートメントを通常どおり利用できます。プールされたエンドポイントと直接エンドポイントのどちらを選ぶべきかについて詳しくは、[Connection](/cloud/managed-postgres/connection) を参照してください。

### PgBouncer の &quot;max_client_conn&quot; 設定は何を意味し、Postgres の `max_connections` とどう関係しますか？ \{#pgbouncer-vs-pg-connections\}

これらは、それぞれ別のものを制御します。

* **Postgres `max_connections`** は、PostgreSQL 自体への **バックエンド** 接続数の上限です。こちらはコストの高い値で、各バックエンドはメモリとプロセススロットを消費します。
* **PgBouncer `max_client_conn`** は、プーラーに対して同時に開ける **クライアント** 接続数の上限です。PgBouncer は、多数のクライアント接続を、はるかに少ない数のバックエンド接続に多重化します。

一般的な Managed Postgres インスタンスでは、PgBouncer が **Postgres バックエンド数のおよそ 10 倍のクライアント接続** を受け付けられるように構成されています (例: クライアント 5000 / バックエンド 500) 。プーラーで接続エラーが発生している場合、表面的なクライアント上限ではなく、プールごとのバックエンド上限 (`default_pool_size`) に達している可能性のほうがはるかに高いです。

## データベース機能 \{#database-capabilities\}

### 複数のデータベースおよびスキーマを作成できますか？ \{#multiple-databases-schemas\}

はい。Managed Postgres は、単一インスタンス内で複数のデータベースおよびスキーマをサポートする PostgreSQL のネイティブ機能を完全に提供します。標準的な PostgreSQL コマンドを使用して、データベースおよびスキーマを作成および管理できます。

### ロールベースアクセス制御（RBAC）はサポートされていますか？ \{#rbac-support\}

Managed Postgres インスタンスには完全なスーパーユーザー権限が付与されており、標準的な PostgreSQL コマンドを使用してロールを作成し、権限を管理できます。

:::note
コンソールとの統合による拡張 RBAC 機能は、今年中に提供予定です。
:::

## アップグレード \{#upgrades\}

### PostgreSQL バージョンのアップグレードはどのように行われますか？ \{#version-upgrades\}

マイナーバージョンとメジャーバージョンの両方のアップグレードはフェイルオーバーによって実行され、通常は数秒程度のダウンタイムしか発生しません。アップグレードが適用されるタイミングを制御するために、メンテナンスウィンドウを設定できます。詳細については、[Upgrades](/cloud/managed-postgres/upgrades) ドキュメントを参照してください。

## 移行 \{#migration\}

### Managed Postgres への移行にはどのようなツールがありますか？ \{#migration-tools\}

Managed Postgres では、複数の移行手法をサポートしています。

- **pg_dump と pg_restore**: 小規模なデータベースや一度限りの移行に適しています。詳細は [pg_dump と pg_restore](/cloud/managed-postgres/migrations/pg_dump-pg_restore) ガイドを参照してください。
- **論理レプリケーション (Logical replication)**: ダウンタイムを最小限に抑える必要がある大規模なデータベース向けです。詳細は [Logical replication](/cloud/managed-postgres/migrations/logical-replication) ガイドを参照してください。
- **PeerDB**: 他の Postgres インスタンスからの CDC ベースのレプリケーション向けです。詳細は [PeerDB migration](/cloud/managed-postgres/migrations/peerdb) ガイドを参照してください。

:::note
完全マネージドの移行エクスペリエンスは近日提供予定です。
:::