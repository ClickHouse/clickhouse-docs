---
title: 'ClickHouse に接続する'
slug: /cloud/reference/byoc/connect
sidebar_label: 'ClickHouse に接続する'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'connect to clickhouse', 'load balancer', 'privatelink']
description: 'パブリック、プライベート、または PrivateLink エンドポイントを介して BYOC の ClickHouse サービスに接続します'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_connect_1 from '@site/static/images/cloud/reference/byoc-connect-1.png';

このページでは、BYOC 環境で ClickHouse サービスに接続するためのさまざまな方法について説明します。セキュリティおよびネットワーク要件に応じて、パブリックロードバランサー、プライベートロードバランサー、または PrivateLink/Private Service Connect エンドポイントのいずれかを利用できます。


## パブリックロードバランサー \{#public-load-balancer\}

パブリックロードバランサーは、インターネットから ClickHouse サービスへのアクセス経路を提供します。これは、ClickHouse が管理する専用 VPC を使用している場合のデフォルト構成です。

### 概要 \{#public-load-balancer-overview\}

- **アクセス**: パブリック インターネットからアクセス可能
- **ユースケース**: さまざまな場所やネットワークから接続する必要があるアプリケーションやユーザーに適している
- **セキュリティ**: TLS 暗号化および IP フィルタリングによる保護（推奨）

### Public Load Balancer 経由での接続 \{#connecting-via-public-load-balancer\}

パブリックエンドポイントを使用して ClickHouse サービスに接続するには、次の手順を実行します。

1. ClickHouse Cloud コンソールから **サービスのエンドポイントを取得** します。エンドポイントは、サービスの「Connect」セクションに表示されます。

<Image img={byoc_connect_1} size="lg" alt="BYOC connection" background="black" />

例:

```text
sb9jmrq2ne.asf3kcggao.ap-southeast-1.aws.clickhouse-byoc.com
```


### IP フィルタリング \{#public-ip-filtering\}

パブリックロードバランサーを使用する場合、許可された IP アドレスまたは CIDR 範囲へのアクセスに制限するために、IP フィルタリング（IP Access List）を使用することを**強く推奨**します。

IP フィルタリングの詳細については、[IP Access List のドキュメント](https://clickhouse.com/docs/cloud/security/setting-ip-filters)を参照してください。

## プライベートロードバランサー \{#private-load-balancer\}

プライベートロードバランサーは、接続されたネットワーク（例: ピアリングされた VPC）内からのみアクセス可能な ClickHouse サービスへの内部アクセスを提供します。これは、お客様管理の VPC を使用する場合の既定の構成です。

### 概要 \{#private-load-balancer-overview\}

- **アクセス**: プライベートネットワークインフラストラクチャ内からのみアクセス可能
- **ユースケース**: 同一のクラウド環境で動作しているアプリケーション、または VPC ピアリングで接続されているアプリケーションに最適
- **セキュリティ**: トラフィックはプライベートネットワーク内にとどまり、パブリックインターネットには公開されない

### プライベートロードバランサー経由での接続 \{#connecting-via-private-load-balancer\}

プライベートエンドポイントを使用して接続するには、次の手順を実行します。

1. **プライベートロードバランサーを有効にする**（まだ有効にしていない場合）。デプロイメントで[プライベートロードバランサーを有効にする](/cloud/reference/byoc/configurations#load-balancers)必要がある場合は、ClickHouse Support にお問い合わせください。
2. **ネットワーク接続を確認**:
   - VPC ピアリングの場合: VPC ピアリングのセットアップを完了します（[Private Networking Setup](/cloud/reference/byoc/onboarding/network) を参照）
   - その他のプライベートネットワークの場合: BYOC VPC に到達できるようにルーティングを構成します
3. **プライベートエンドポイントを取得**: 
   プライベートエンドポイントは、ClickHouse Cloud コンソールの対象サービスの「Connect」セクションで確認できます。プライベートエンドポイントは、サービス ID 部分に `-private` サフィックスが付与されている点を除き、パブリックエンドポイントと同じ形式です。例:
   - **パブリックエンドポイント**: `sb9jmrq2ne.asf3kcggao.ap-southeast-1.aws.clickhouse-byoc.com`
   - **プライベートエンドポイント**: `sb9jmrq2ne-private.asf3kcggao.ap-southeast-1.aws.clickhouse-byoc.com`

### IP フィルタリング \{#private-ip-filtering\}

プライベートロードバランサーは内部ネットワークからのアクセスのみに制限されますが、さらに細かく、プライベートネットワーク内のどの送信元から接続できるかを制御するために IP フィルタリングを設定することもできます。プライベートロードバランサー向けの IP フィルタリングは、パブリックロードバランサーの場合と同じ設定方法を使用します。許可する IP アドレスまたは CIDR 範囲を定義すると、ClickHouse Cloud が各エンドポイント種別に対してそれらのルールを適切に適用します。ClickHouse Cloud プラットフォームはパブリックとプライベートの CIDR 範囲を自動的に判別し、それぞれを対応するロードバランサーエンドポイントに割り当てます。詳細は [IP Access List のドキュメント](https://clickhouse.com/docs/cloud/security/setting-ip-filters) を参照してください。 

### セキュリティグループの設定 \{#security-group-configuration\}

AWS デプロイメントの場合、プライベートロードバランサーのセキュリティグループは、どのネットワークからエンドポイントにアクセスできるかを制御します。デフォルトでは、BYOC VPC 内からのトラフィックのみが許可されます。

詳細については、[プライベートロードバランサーのセキュリティグループ設定](https://clickhouse.com/docs/cloud/reference/byoc/configurations#private-load-balancer-security-group)を参照してください。

## PrivateLink または Private Service Connect \{#privatelink-or-private-service-connect\}

AWS PrivateLink と GCP Private Service Connect は、最もセキュアな接続オプションを提供し、VPC ピアリングやインターネットゲートウェイを使用することなく、ClickHouse のサービスにプライベートにアクセスできるようにします。

### 概要 \{#privatelink-overview\}

- **アクセス**: クラウドプロバイダーが提供するマネージドサービスを通じたプライベート接続
- **ネットワーク分離**: トラフィックはパブリックインターネットを経由しない
- **ユースケース**: 最高レベルのセキュリティとネットワーク分離を必要とするエンタープライズ向けデプロイメント
- **メリット**: 
  - VPC ピアリングが不要
  - ネットワークアーキテクチャの簡素化
  - セキュリティおよびコンプライアンスの強化

### PrivateLink/Private Service Connect 経由での接続 \{#connecting-via-privatelink\}

まず、PrivateLink または Private Service Connect の設定を完了してください（[Private Networking Setup](/cloud/reference/byoc/onboarding/network) を参照）。設定が完了すると、PrivateLink 専用のエンドポイント形式を使用して ClickHouse サービスに接続できます。PrivateLink エンドポイントには、VPC エンドポイント経由でルーティングされることを示すために `vpce` サブドメインが含まれます。VPC 内での DNS 解決により、トラフィックは自動的に PrivateLink エンドポイント経由でルーティングされます。

PrivateLink エンドポイント形式はパブリックエンドポイントと似ていますが、サービスサブドメインと BYOC インフラストラクチャサブドメインの間に `vpce` サブドメインが含まれます。例えば、次のようになります。

- **Public endpoint**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.clickhouse-byoc.com`
- **PrivateLink endpoint**: `h5ju65kv87.vpce.mhp0y4dmph.us-west-2.aws.clickhouse-byoc.com`

### エンドポイント ID 許可リスト \{#endpoint-id-allowlist\}

PrivateLink または Private Service Connect を使用するには、クライアント接続のエンドポイント ID を、各 ClickHouse サービスごとに明示的に許可する必要があります。ClickHouse サポートに連絡し、サービスの許可リストに追加できるよう、エンドポイント ID を提供してください。

詳細なセットアップ手順については、[Private Networking Setup ガイド](/cloud/reference/byoc/onboarding/network)を参照してください。

## 適切な接続方法の選択 \{#choosing-connection-method\}

| 接続方法 | セキュリティレベル | ネットワーク要件 | ユースケース |
|------------------|----------------|---------------------|----------|
| **Public Load Balancer** | 中（IP フィルタリングあり） | インターネットアクセス | さまざまな場所からアクセスするアプリケーション／ユーザー |
| **Private Load Balancer** | 高 | VPC ピアリングまたはプライベートネットワーク | 同一クラウド環境内のアプリケーション |
| **PrivateLink/Private Service Connect** | 最高 | クラウドプロバイダー管理のサービス | 最大限のアイソレーションが必要なエンタープライズ向けデプロイメント |

## 接続問題のトラブルシューティング \{#troubleshooting\}

接続に問題が発生している場合は、以下を確認してください。

1. **エンドポイントへのアクセス性を確認**: 正しいエンドポイント（パブリックかプライベートか）を使用していることを確認します
2. **IP フィルターを確認**: パブリックロードバランサーの場合、IP アドレスが許可リストに含まれていることを確認します
3. **ネットワーク接続を確認**: プライベート接続の場合、VPC ピアリングまたは PrivateLink が正しく構成されていることを確認します
4. **セキュリティグループを確認**: プライベートロードバランサーの場合、セキュリティグループのルールで送信元ネットワークからのトラフィックが許可されていることを確認します
4. **セキュリティグループを確認**: PrivateLink または Private Service Connect の場合、エンドポイント ID が ClickHouse サービスの allowlist に追加されていることを確認します
5. **認証設定を確認**: 正しい認証情報（ユーザー名とパスワード）を使用していることを確認します
6. **サポートへの連絡**: 問題が解消しない場合は、ClickHouse サポートにお問い合わせください