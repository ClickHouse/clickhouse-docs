---
slug: /cloud/managed-postgres/migrations/overview
sidebar_label: '概要'
title: 'Managed Postgres のデータ移行'
description: 'ClickHouse Managed Postgres への4つの移行方法を比較し、ソースデータベースとダウンタイム要件に適したものを選択してください。'
keywords: ['managed postgres', '移行', 'postgres 移行', 'clickpipes', 'peerdb', 'pg_dump', 'pg_restore', '論理レプリケーション']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';

# Managed Postgres のデータ移行 \{#managed-postgres-data-migration\}

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.migration-overview-beta" />

Managed Postgres への移行には、4 つの方法があります。どの方法が適しているかは、
継続的なレプリケーションが必要かどうか、移行元のソース、
そして切り替え時にアプリケーションが許容できるダウンタイムの長さによって異なります。

| 方法                                                                                      | 継続的なレプリケーション (CDC)  | 実行場所                     | 最適な用途                                             |
| --------------------------------------------------------------------------------------- | ------------------- | ------------------------ | ------------------------------------------------- |
| [ClickPipes](/cloud/managed-postgres/migrations/clickpipes)                             | はい                  | ClickHouse Cloud console | ほとんどの移行 — 初期ロードと CDC を標準で備えたガイド付きウィザード            |
| [PeerDB](/cloud/managed-postgres/migrations/peerdb)                                     | はい                  | セルフホスト (Docker)          | ClickPipes UI でカバーされていないソースやワークフロー                |
| [pg&#95;dump and pg&#95;restore](/cloud/managed-postgres/migrations/pg_dump-pg_restore) | いいえ                 | ローカルマシン                  | ダウンタイムを許容できる、小規模または静的なデータセットの一回限りの移行              |
| [Logical replication](/cloud/managed-postgres/migrations/logical-replication)           | はい                  | 移行元と移行先の Postgres        | ネイティブな Postgres レプリケーションを直接制御したい場合。サードパーティーツールは不要 |

## ClickPipes \{#clickpipes\}

[ClickPipes](/cloud/managed-postgres/migrations/clickpipes) は、ほとんどの移行で推奨される
方法です。すべて ClickHouse Cloud コンソール内で完結し、
ソースへの接続、スキーマのエクスポートとインポート、
さらに CDC の有無を選択して初期ロードを開始するまでを順を追って案内します。あらかじめ用意されたソース
コネクタは、Amazon RDS、Aurora、Supabase、Google Cloud SQL、Azure
Flexible Server、Neon、Crunchy Bridge、TimescaleDB、および汎用の Postgres
インスタンスに対応しています。

## PeerDB \{#peerdb\}

[PeerDB](/cloud/managed-postgres/migrations/peerdb) は、Docker 経由で実行するセルフホスト型の
移行ツールです。移行元やワークフローが ClickPipes ウィザードに適さない場合に使用します。
たとえば、多数のデータベースにまたがるピアの作成をスクリプト化する必要がある場合や、
移行をすべて自社ネットワーク内で完結させる必要がある場合です。
PeerDB は索引、制約、トリガーを自動的には移行しないため、
データ投入後に移行先でそれらを再作成します。

## pg_dump and pg_restore \{#pg-dump-pg-restore\}

[pg&#95;dump and pg&#95;restore](/cloud/managed-postgres/migrations/pg_dump-pg_restore)
は、移行元のスナップショットを取得し、それを移行先に再適用します。継続的な
レプリケーションは行われないため、ダンプとリストアの実行中は、移行元への
書き込みを停止する必要があります。これは、小規模または静的なデータセットや、
メンテナンスウィンドウを確保できる非本番環境に適した選択肢です。

## 論理レプリケーション \{#logical-replication\}

[論理レプリケーション](/cloud/managed-postgres/migrations/logical-replication)
では、Postgres ネイティブの publication と subscription を使用して、ソースから
ターゲットへ変更をストリーミングします。`wal_level`、レプリケーションスロット、
および `REPLICATION` 権限は自分で設定します。サードパーティ製ツールを
介在させる必要はありません。レプリケーションの仕組みを完全に制御したい場合や、
環境上の制約で外部の移行ツールを使えない場合は、この方法を選択してください。

## 移行後 \{#after-migration\}

データの移行が始まったら、アプリケーショントラフィックを切り替える前に、[データ検証](/cloud/managed-postgres/migrations/data-validation)
を使用して、移行元と移行先で行数と内容が一致していることを確認します。[移行のよくある質問](/cloud/managed-postgres/migrations/faq)
では、よくあるエラーと復旧手順を説明しています。