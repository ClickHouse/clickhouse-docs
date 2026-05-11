---
slug: /cloud/managed-postgres
title: 'マネージド Postgres'
description: 'NVMe ストレージを基盤とし、リアルタイム分析向けに ClickHouse とネイティブ統合された、高速でスケーラブルなエンタープライズグレードの Postgres'
keywords: ['マネージド Postgres', 'PostgreSQL', 'クラウドデータベース', 'Postgres サービス', 'NVMe Postgres', 'ClickHouse 連携']
doc_type: 'guide'
pagination_next: cloud/managed-postgres/quickstart
pagination_prev: null
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="overview" />

ClickHouse Managed Postgres は、パフォーマンスとスケールを重視して構築されたエンタープライズグレードのマネージド Postgres サービスです。コンピュートと物理的に同一ラック内に配置された NVMe ストレージを採用しており、EBS のようなネットワーク接続ストレージを用いる代替手段と比べて、ディスクがボトルネックとなるワークロードに対して最大 10 倍の高いパフォーマンスを実現します。

Citus Data、Heroku、Microsoft で世界水準の Postgres を提供してきた実績を持つ創業チームが率いる [Ubicloud](https://www.ubicloud.com/) とのパートナーシップにより構築された Managed Postgres は、急速に成長するアプリケーションで一般的に発生するパフォーマンス上の課題、すなわちインジェストや更新処理の低速化、VACUUM の遅延、テールレイテンシの増加、ディスク IOPS の制約によって引き起こされる WAL のスパイクを解決します。

{/* TODO: Postgres と ClickHouse の連携を示すアーキテクチャ概要図
    Path: /static/images/cloud/managed-postgres/architecture-overview.png */}


## NVMe による高性能 \{#nvme-performance\}

ほとんどのマネージド Postgres サービスは Amazon EBS のようなネットワーク接続ストレージを使用しており、ディスクアクセスごとにネットワーク越しの往復が必要になります。これによりミリ秒単位のレイテンシが発生し、IOPS が制限されるため、書き込みが多いワークロードや I/O 負荷の高いワークロードでボトルネックになります。

Managed Postgres は、データベースと同じサーバーに物理的に接続された NVMe ストレージを使用します。このアーキテクチャ上の違いにより、次のようなメリットが得られます。

- ミリ秒ではなく、**マイクロ秒レベルのディスクレイテンシ**
- ネットワークボトルネックのない、**実質無制限のローカル IOPS**
- 同じコストで、ディスクがボトルネックとなるワークロードに対して**最大 10 倍の高いパフォーマンス**

主にディスク IOPS とレイテンシによって制限されている Postgres ワークロードでは、これによりインジェスト処理の高速化、VACUUM の短縮、テイルレイテンシの低減、および負荷時のパフォーマンスの予測可能性向上が実現します。

## ネイティブ ClickHouse 連携 \{#clickhouse-integration\}

Managed Postgres は ClickHouse とネイティブに連携し、複雑な ETL パイプラインを構築することなくトランザクション処理と分析を統合できます。

### Postgres から ClickHouse へのレプリケーション \{#postgres-replication\}

[ClickPipes の Postgres CDC コネクタ](/integrations/clickpipes/postgres) を使用して、Postgres のデータを ClickHouse にレプリケートします。このコネクタは初回の全量ロードと継続的な増分同期の両方を処理し、エンタープライズ顧客数百社が毎月数百テラバイト規模のデータ移行で本番運用している実績があります。

### pg_clickhouse: 統合クエリレイヤー \{#pg-clickhouse\}

すべての Managed Postgres インスタンスには [`pg_clickhouse`](https://github.com/ClickHouse/pg_clickhouse) 拡張機能が付属しており、Postgres から直接 ClickHouse にクエリを実行できます。アプリケーションは、複数のデータベースに接続することなく、トランザクション処理と分析の両方に対して Postgres を統合クエリレイヤーとして利用できます。

この拡張機能は、フィルタ、結合、セミ結合、集計、関数のサポートを含む包括的なクエリの ClickHouse へのプッシュダウンを提供し、効率的な実行を実現します。現在、22 個の TPC-H クエリのうち 14 個が完全にプッシュダウンされており、同じクエリを標準の Postgres で実行した場合と比較して 60 倍以上のパフォーマンス向上を達成しています。

## エンタープライズクラスの信頼性 \{#enterprise-reliability\}

Managed Postgres は、本番環境のワークロードに必要な信頼性とセキュリティ機能を提供します。

### 高可用性 \{#high-availability\}

クォーラムベースのレプリケーションを使用して、異なるアベイラビリティゾーンに最大 2 つのスタンバイレプリカを構成できます。これらのスタンバイレプリカは高可用性と自動フェイルオーバー専用であり、障害発生時にデータベースが迅速に復旧できるようにします。読み取り負荷のスケールアウトには、別個の[読み取りレプリカ](/cloud/managed-postgres/read-replicas)をプロビジョニングできます。設定の詳細については、[高可用性](/cloud/managed-postgres/high-availability)ページを参照してください。

### バックアップとリカバリ \{#backups\}

すべてのインスタンスには、自動バックアップが含まれており、フォークおよび時点復旧をサポートします。バックアップは、フルバックアップと WAL の継続的なアーカイブをオブジェクトストレージに対して行う、よく知られたオープンソースツールである [WAL-G](https://github.com/wal-g/wal-g) を利用して実行されます。

### セキュリティとコンプライアンス \{#security-compliance\}

Managed Postgres は、ClickHouse Cloud と同等のセキュリティ標準を満たすように設計されています。

- **認証**: SAML/SSO 対応
- **ネットワークセキュリティ**: IP アドレスの許可リスト設定、保存時および転送時の暗号化 (TLS 1.3)
- **アクセス制御**: データベース管理のための完全なスーパーユーザー権限へのアクセス

### オープンソース基盤 \{#open-source\}

Postgres と ClickHouse はどちらも、大規模で活発なコミュニティを持つオープンソースのデータベースです。`pg_clickhouse` 拡張機能や、PeerDB によって実現される CDC（変更データキャプチャ）レプリケーションを含む統合コンポーネントも、すべてオープンソースです。このような基盤により、ベンダーロックインの心配がなく、データスタックに対する完全な制御権と長期的な柔軟性が確保されます。