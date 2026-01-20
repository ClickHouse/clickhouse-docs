---
slug: /cloud/managed-postgres
title: 'マネージド Postgres'
description: 'NVMe ストレージを採用し、リアルタイム分析のために ClickHouse とネイティブに連携する、高速でスケーラブルなエンタープライズグレードの Postgres'
keywords: ['マネージド Postgres', 'PostgreSQL', 'クラウドデータベース', 'Postgres サービス', 'NVMe Postgres', 'ClickHouse 連携']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';

<PrivatePreviewBadge />

ClickHouse Managed Postgres は、パフォーマンスとスケールのために設計されたエンタープライズグレードのマネージド Postgres サービスです。コンピュートと物理的に同一ロケーションに配置された NVMe ストレージを採用しており、EBS のようなネットワーク接続ストレージを使用する代替手段と比べて、ディスク起因のワークロードで最大 10 倍の高いパフォーマンスを実現します。

[Citus Data](https://www.citusdata.com/)、Heroku、Microsoft で世界クラスの Postgres を提供してきた実績を持つ創業チームによる [Ubicloud](https://www.ubicloud.com/) とのパートナーシップにより構築された Managed Postgres は、急成長するアプリケーションが一般的に直面するパフォーマンス課題を解決します。具体的には、インジェストおよび更新処理の低速化、VACUUM の遅延、テールレイテンシの増大、ディスク IOPS の制約によって引き起こされる WAL スパイクなどです。

{/* TODO: Postgres と ClickHouse の連携を示すアーキテクチャ図
    Path: /static/images/cloud/managed-postgres/architecture-overview.png */}


## NVMe による高性能 \{#nvme-performance\}

多くのマネージド Postgres サービスは Amazon EBS のようなネットワーク接続ストレージを使用しており、ディスクアクセスごとにネットワーク往復が発生します。これによりレイテンシはミリ秒単位となり、IOPS が制限されるため、書き込みが多いワークロードや I/O 負荷の高いワークロードでボトルネックになります。

Managed Postgres は、データベースと同じサーバーに物理的に接続された NVMe ストレージを使用します。このアーキテクチャ上の違いにより、次のメリットが得られます。

- ミリ秒ではなく、**マイクロ秒レベルのディスクレイテンシ**
- ネットワークボトルネックのない、**実質的に無制限のローカル IOPS**
- 同じコストで、ディスクがボトルネックとなるワークロードに対して**最大 10 倍の高速なパフォーマンス**

ディスク IOPS とレイテンシによって主に性能が制限されている Postgres ワークロードでは、これによりインジェストの高速化、VACUUM の短縮、テイルレイテンシの低減、負荷時のより予測可能なパフォーマンスが実現します。

## ネイティブ ClickHouse 連携 \{#clickhouse-integration\}

Managed Postgres は ClickHouse とネイティブに連携し、複雑な ETL パイプラインを必要とせずにトランザクション処理と分析を統合します。

### Postgres から ClickHouse へのレプリケーション \{#postgres-replication\}

[ClickPipes の Postgres CDC コネクタ](/integrations/clickpipes/postgres) を使用して、Postgres のデータを ClickHouse にレプリケーションします。このコネクタは初回の全量ロードと継続的な増分同期の両方を処理し、毎月数百テラバイトものデータを移行する数百社のエンタープライズ顧客によって本番環境で実証されています。

### pg_clickhouse: 統合クエリレイヤー \{#pg-clickhouse\}

すべての Managed Postgres インスタンスには [`pg_clickhouse`](https://github.com/ClickHouse/pg_clickhouse) 拡張機能があらかじめ用意されており、Postgres から ClickHouse に直接クエリを送信できます。アプリケーションは、複数のデータベースに接続することなく、トランザクション処理と分析の両方に対して Postgres を統合クエリレイヤーとして利用できます。

この拡張機能は、ClickHouse への包括的なクエリ・プッシュダウンを提供し、フィルター、結合、セミジョイン、集約、および関数を含む効率的な実行を可能にします。現在、22 個の TPC-H クエリのうち 14 個が完全にプッシュダウンされており、同じクエリを標準の Postgres で実行した場合と比較して 60 倍以上のパフォーマンス向上を実現しています。

## エンタープライズグレードの信頼性 \{#enterprise-reliability\}

Managed Postgres は、本番環境のワークロードに求められる信頼性とセキュリティ機能を提供します。

### 高可用性 \{#high-availability\}

クォーラムベースのレプリケーションを使用して、最大 2 つまでのスタンバイレプリカを異なるアベイラビリティゾーンに構成できます。これらのスタンバイは高可用性と自動フェイルオーバー専用とし、データベースが障害から迅速に復旧できるようにします。読み取り負荷のスケールアウトには、別途 [読み取りレプリカ](/cloud/managed-postgres/read-replicas)をプロビジョニングできます。構成の詳細については、[高可用性](/cloud/managed-postgres/high-availability)ページを参照してください。

### バックアップとリカバリ \{#backups\}

すべてのインスタンスには、自動バックアップが提供されており、フォークやポイントインタイムリカバリをサポートします。バックアップは、オブジェクトストレージへのフルバックアップと継続的な WAL アーカイブを処理する、広く利用されているオープンソースツールである [WAL-G](https://github.com/wal-g/wal-g) を利用して実行されます。

### セキュリティとコンプライアンス \{#security-compliance\}

Managed Postgres は、ClickHouse Cloud と同等のセキュリティ基準を満たすように設計されています。

- **認証**: SAML/SSO サポート
- **ネットワーク セキュリティ**: IP アドレスの許可リスト、保存時および転送時の暗号化 (TLS 1.3)
- **アクセス制御**: データベース管理のためのスーパーユーザー権限へのフルアクセス

### オープンソース基盤 \{#open-source\}

Postgres と ClickHouse はどちらも、大規模で活発なコミュニティを持つオープンソースデータベースです。`pg_clickhouse` 拡張機能や、PeerDB によって実現される CDC（変更データキャプチャ）レプリケーションを含む連携コンポーネントも、すべてオープンソースです。この基盤によりベンダーロックインが発生せず、データスタックに対する完全な制御権と長期的な柔軟性が確保されます。