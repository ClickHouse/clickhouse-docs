---
slug: /cloud/managed-postgres/security
sidebar_label: 'セキュリティ'
title: 'セキュリティ'
description: 'IP ホワイトリスト、暗号化、Private Link など、ClickHouse Managed Postgres のセキュリティ機能'
keywords: ['postgres security', 'ip whitelisting', 'encryption', 'tls', 'ssl', 'private link', 'backup retention']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import ipFilters from '@site/static/images/managed-postgres/ip-filters.png';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="security" />

Managed Postgres は、エンタープライズグレードのセキュリティ機能によってお客様のデータを保護し、コンプライアンス要件を満たすために設計されています。このページでは、ネットワークセキュリティ、暗号化、およびバックアップの保持ポリシーについて説明します。


## IP ホワイトリスト \{#ip-whitelisting\}

IP フィルターは、どの送信元 IP アドレスから Managed Postgres インスタンスへの接続を許可するかを制御し、ネットワークレベルのアクセス制御を提供することで、不正な接続からデータベースを保護します。

<Image img={ipFilters} alt="IP アクセスリストの設定" size="md" border/>

### IP フィルタの設定 \{#configuring-ip-filters\}

IP フィルタの詳細な設定方法については、[Settings](/cloud/managed-postgres/settings#ip-filters) ページを参照してください。

次のいずれかを指定できます。

- 個々の IP アドレス（例: `203.0.113.5`）
- ネットワークの CIDR 範囲（例: `192.168.1.0/24`）
- すべての IP アドレスを許可する **Anywhere**（本番環境では非推奨）
- すべての接続をブロックする **Nowhere**

:::warning 本番環境でのベストプラクティス
IP フィルタが設定されていない場合、すべての IP アドレスからの接続が許可されます。本番環境のワークロードでは、アクセスを既知の IP アドレスまたは CIDR 範囲に制限してください。次のような対象へのアクセスに限定することを検討してください。

- アプリケーションサーバー
- VPN ゲートウェイの IP アドレス
- 管理アクセス用のバスティオンホスト
- 自動デプロイ用の CI/CD パイプラインの IP アドレス
:::

## 暗号化 \{#encryption\}

Managed Postgres は、包括的なデータ保護を実現するため、保存データと転送データの両方を暗号化します。

### 保存時の暗号化 \{#encryption-at-rest\}

Managed Postgres によって保存されるすべてのデータは、基盤となるストレージインフラへの不正アクセスから保護するため、暗号化された状態で保存されます。

#### NVMe ストレージの暗号化 \{#nvme-encryption\}

NVMe ドライブに保存されているデータベースファイル、トランザクションログ、一時ファイルは、業界標準の暗号化アルゴリズムを使用して暗号化されます。この暗号化はアプリケーションに対して透過的であり、特別な設定は不要です。

#### オブジェクトストレージでの暗号化 (S3) \{#s3-encryption\}

オブジェクトストレージに保存されるバックアップおよび Write-Ahead Log (WAL) アーカイブも、保存時に暗号化されます。これには次が含まれます:

- 日次のフルバックアップ
- 増分 WAL アーカイブ
- 時点復元用データ

すべてのバックアップデータは、各インスタンス専用の認証情報が付与された、専用かつ分離されたストレージバケットに保存され、バックアップデータが安全に保護され、認可されたシステムからのみアクセスできるようになっています。

:::info
保存時の暗号化は、すべての Managed Postgres インスタンスでデフォルトで有効になっており、無効化することはできません。追加の設定は不要です。
:::

### 転送中の暗号化 \{#encryption-in-transit\}

Managed Postgres へのすべてのネットワーク接続は、TLS（Transport Layer Security）を使用して暗号化されており、アプリケーションとデータベース間を移動するデータを保護します。

#### TLS/SSL configuration \{#tls-ssl\}

デフォルトでは、証明書検証なしで TLS で暗号化された接続が行われます。本番環境のワークロードでは、正しいサーバーと通信していることを保証するため、証明書検証を有効にした TLS で接続することを推奨します。

TLS の設定および接続オプションの詳細については、[Connection](/cloud/managed-postgres/connection#tls) ページを参照してください。

## Private Link \{#private-link\}

Private Link は、Managed Postgres インスタンスと Virtual Private Cloud (VPC) 間のプライベート接続を実現し、トラフィックをパブリックインターネットに公開することなく通信できるようにします。これにより、ネットワーク分離とセキュリティがさらに強化されます。

:::note 手動でのセットアップが必要
Private Link は利用可能ですが、ClickHouse サポートチームによる手動での設定が必要です。この機能は、厳格なネットワーク分離要件を持つエンタープライズ顧客に最適です。
:::

### Private Link の設定を依頼する \{#requesting-private-link\}

Managed Postgres インスタンスで Private Link を有効化するには、次の手順を実行します。

1. サポートチケットを作成して **ClickHouse サポートに連絡します**
2. **次の情報を提供します**:
   - 使用している ClickHouse の組織 ID（Organization ID）
   - Postgres サービスの ID / ホスト名
   - Private Link で接続したい AWS アカウント ID / ARN
     - （任意）Postgres インスタンスが存在するリージョン以外で、接続元としたいリージョンがあれば指定します

3. **ClickHouse サポートは以下を実施します**:
   - Managed Postgres 側に Private Link エンドポイントをプロビジョニングします
   - エンドポイントインターフェースを作成する際に使用できるエンドポイント接続情報を提供します

4. **Private Link をセットアップします**:
   - AWS の設定画面でエンドポイントインターフェースに移動し、ClickHouse サポートから提供された構成を使用して Private Link を作成します。
   - Private Link が「Available」状態になったら、AWS コンソールに表示される Private DNS 名を使用して接続できます。

## バックアップ保持期間 \{#backup-retention\}

Managed Postgres は、誤って削除してしまった場合や破損、その他のデータ損失シナリオに備えて、データを自動的にバックアップします。

### 保持ポリシー \{#retention-policy\}

- **デフォルトの保持期間**: 7日間
- **バックアップ頻度**: 毎日のフルバックアップ + 継続的な WAL アーカイブ（60秒ごと、または 16 MB に達した時点のいずれか早い方）
- **復旧の粒度**: 保持期間内の任意の時点を指定したポイントインタイムリカバリが可能

### バックアップのセキュリティ \{#backup-security\}

バックアップは、プライマリデータと同じセキュリティ保証のもとで保存されます。

- オブジェクトストレージにおける**保存時の暗号化**
- 権限範囲が限定された認証情報を用いた、インスタンスごとの**分離されたストレージバケット**
- バックアップにリンクされた Postgres インスタンスのみに限定された**アクセス制御**

バックアップ戦略やポイントインタイムリカバリの詳細については、[バックアップとリストア](/cloud/managed-postgres/backup-and-restore)のページを参照してください。