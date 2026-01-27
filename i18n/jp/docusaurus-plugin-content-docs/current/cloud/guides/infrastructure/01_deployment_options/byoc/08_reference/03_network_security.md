---
title: 'BYOC ネットワークセキュリティ'
slug: /cloud/reference/byoc/reference/network_security
sidebar_label: 'ネットワークセキュリティ'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'network security']
description: 'ClickHouse を独自のクラウドインフラストラクチャ上にデプロイする'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_tailscale from '@site/static/images/cloud/reference/byoc-tailscale-1.png';


## Tailscale プライベートネットワーク \{#tailscale-private-network\}

Tailscale は、ClickHouse Cloud の管理サービスとお客様が所有するクラウド (BYOC) デプロイメント間に、ゼロトラストのプライベートネットワーク接続を提供します。この安全なチャネルにより、ClickHouse のエンジニアは、パブリックインターネットへのアクセスや複雑な VPN 構成を行うことなく、トラブルシューティングや管理作業を実施できます。

### 概要 \{#tailscale-overview\}

Tailscale は、ClickHouse コントロールプレーン（ClickHouse の VPC 内）と BYOC データプレーン（お客様の VPC 内）の間に、暗号化されたプライベートネットワークトンネルを作成します。この接続は次の用途にのみ使用されます。

- **管理作業**: ClickHouse の管理サービスが、お客様の BYOC インフラストラクチャと連携するため
- **トラブルシューティング用アクセス**: ClickHouse エンジニアが診断のために Kubernetes API サーバーおよび ClickHouse のシステムテーブルへアクセスするため
- **メトリクスアクセス**: ClickHouse の集中モニタリングダッシュボードが、お客様の BYOC VPC 内にデプロイされた Prometheus スタックからメトリクスへアクセスし、ClickHouse エンジニアに環境のオブザーバビリティを提供するため

:::important
Tailscale は **管理およびトラブルシューティングの作業にのみ使用されます**。**クエリトラフィック** や顧客データへのアクセスには一切使用されません。すべての顧客データはお客様の VPC 内に留まり、Tailscale 接続を経由して送信されることはありません。
:::

### BYOC における Tailscale の動作 \{#how-tailscale-works\}

<Image img={byoc_tailscale} size="lg" alt="BYOC Tailscale" border />

Tailscale 経由でアクセスする必要がある各サービスまたはエンドポイントに対して、ClickHouse BYOC は次をデプロイします。

1. **Tailnet アドレス登録**: 各エンドポイントは一意の tailnet アドレスを登録します（例: Kubernetes API サーバー用の `k8s.xxxx.us-east-1.aws.byoc.clickhouse-prd.com`）

2. **Tailscale Agent コンテナ**: Tailscale Agent コンテナが EKS クラスター内で稼働し、次の役割を担います:
   - Tailscale のコーディネーションサーバーへの接続
   - サービスを登録して発見可能にすること
   - Nginx ポッドとのネットワークセットアップの調整

3. **Nginx ポッド**: 次を行う Nginx ポッド:
   - Tailscale からの TLS トラフィックの終端
   - EKS クラスター内の適切な IP へのトラフィックのルーティング

### ネットワーク接続プロセス \{#tailscale-connection-process\}

Tailscale による接続の確立は、次のステップで行われます。

1. **初期接続**:
   - 両端の Tailscale エージェント（ClickHouse エンジニアの環境とあなたの BYOC EKS クラスター）が Tailscale コーディネーションサーバーに接続します
   - EKS クラスターのエージェントが Kubernetes Service を登録し、検出可能な状態にします
   - ClickHouse エンジニアは、その Service への可視性を得るために社内でエスカレーションを行う必要があります

2. **接続モード**:
   - **Direct Mode**: エージェントは NAT トラバーサル用トンネルを使用して直接接続の確立を試みます
   - **Relay Mode**: Direct Mode に失敗した場合、通信は Tailscale DERP (Distributed Encrypted Relay Protocol) サーバーを経由する Relay Mode にフォールバックします

3. **暗号化**:
   - すべての通信はエンドツーエンドで暗号化されます
   - 各 Tailscale エージェントは独自の公開鍵・秘密鍵ペア（PKI に類似）を生成します
   - Direct Mode か Relay Mode かにかかわらず、トラフィックは常に暗号化されたままです

### セキュリティ機能 \{#tailscale-security\}

**送信専用接続 (Outbound-Only Connections)**:

- EKS クラスター内の Tailscale エージェントは、Tailscale のコーディネーション/リレーサーバーへの送信接続のみを開始します
- **受信接続は不要** であり、Tailscale エージェントへの受信トラフィックを許可するセキュリティグループルールは必要ありません
- これにより攻撃面が小さくなり、ネットワークセキュリティ構成が簡素化されます

**アクセス制御**:

- アクセスは ClickHouse の内部承認システムによって制御されます
- エンジニアは所定の承認ワークフローを通じてアクセスを申請する必要があります
- アクセスには有効期限が設定されており、自動的に失効します
- すべてのアクセスは監査され、ログに記録されます

**証明書ベース認証**:

- ClickHouse のシステムテーブルへのアクセスには、エンジニアは一時的かつ有効期限付きの証明書を使用します
- BYOC 環境におけるすべての人間によるアクセスは、パスワードベースではなく証明書ベース認証に置き換えられます
- アクセスはシステムテーブルのみに制限されます (顧客データにはアクセスできません)
- すべてのアクセス試行は ClickHouse の `query_log` テーブルに記録されます

### Tailscale 経由でのアクセスのトラブルシューティング \{#troubleshooting-access-tailscale\}

ClickHouse のエンジニアが BYOC デプロイメントで発生した問題をトラブルシュートする必要がある場合、Tailscale を使用して次の対象へアクセスします:

- **Kubernetes API Server**: EBS マウント失敗、ノードレベルのネットワーク問題、およびクラスターの健全性に関する問題の診断のため
- **ClickHouse System Tables**: クエリのパフォーマンス分析および診断用クエリの実行のため（system テーブルへの読み取り専用アクセスのみ）

トラブルシューティングアクセスのプロセスは次のとおりです:

1. **アクセス要求**: 指定されたグループ内のオンコールエンジニアが、顧客の ClickHouse インスタンスへのアクセスを要求する
2. **承認**: 要求は、指定された承認者を持つ社内承認システムを通過する
3. **証明書の生成**: 承認されたエンジニア向けに、有効期間が制限された証明書が生成される
4. **ClickHouse の設定**: ClickHouse Operator が ClickHouse を設定し、その証明書を受け入れるように構成する
5. **接続**: エンジニアは証明書を使用して Tailscale 経由でインスタンスにアクセスする
6. **自動失効**: アクセスは、設定された有効期間が経過すると自動的に失効する

### Management Services Access \{#management-services-access\}

デフォルトでは、ClickHouse の管理サービスは EKS API server のパブリック IP アドレス経由でお客様の BYOC Kubernetes クラスターにアクセスします。このパブリック IP へのアクセス元は、ClickHouse の NAT gateway の IP アドレスのみに制限されています。

**プライベートエンドポイント構成（オプション）**:

- EKS API server をプライベートエンドポイントのみを使用するように構成できます
- この場合、管理サービスは（人間によるトラブルシューティングアクセスと同様に）Tailscale 経由で API server にアクセスします
- 緊急時の調査およびサポートのためのバックアップ手段として、パブリックエンドポイントへのアクセスは維持されます

### ネットワークトラフィックフロー \{#tailscale-traffic-flow\}

**Tailscale 接続フロー**:

1. EKS クラスター内の Tailscale エージェント → Tailscale コーディネーションサーバー（アウトバウンド）
2. エンジニアのマシン上の Tailscale エージェント → Tailscale コーディネーションサーバー（アウトバウンド）
3. エージェント間で直接接続またはリレー接続が確立される
4. 暗号化されたトラフィックが確立されたトンネル内を流れる
5. EKS 内の Nginx ポッドが TLS を終端し、内部サービスへルーティングする

**顧客データは送信されない**:

- Tailscale 接続は管理およびトラブルシューティングの目的にのみ使用される
- クエリトラフィックおよび顧客データが Tailscale を通過することはない
- すべての顧客データはお客様の VPC 内に留まる

### 監視と監査 \{#tailscale-monitoring\}

ClickHouse とお客様の両方が、Tailscale へのアクセス状況を監査できます。

- **ClickHouse による監視**: ClickHouse はアクセス要求を監視し、すべての Tailscale 接続をログに記録します。
- **お客様による監査**: お客様は、自身のシステム内で ClickHouse エンジニアによるアクティビティを追跡できます。
- **クエリログ**: Tailscale を介したすべての system テーブルへのアクセスは、ClickHouse の `query_log` テーブルに記録されます。

BYOC における Tailscale 実装の技術的な詳細については、[Building ClickHouse BYOC on AWS ブログ記事](https://clickhouse.com/blog/building-clickhouse-byoc-on-aws#tailscale-connection)を参照してください。

## ネットワーク境界 \{#network-boundaries\}

このセクションでは、顧客の BYOC VPC との間で発生するさまざまなネットワークトラフィックについて説明します。

- **インバウンド (Inbound)**: 顧客の BYOC VPC に入ってくるトラフィック。
- **アウトバウンド (Outbound)**: 顧客の BYOC VPC を発信元として外部の宛先に送信されるトラフィック。
- **パブリック (Public)**: パブリックインターネットからアクセス可能なネットワークエンドポイント。
- **プライベート (Private)**: VPC ピアリング、VPC Private Link、Tailscale などのプライベート接続経由でのみアクセス可能なネットワークエンドポイント。

**Istio イングレスは、ClickHouse クライアントからのトラフィックを受け付けるため、AWS NLB の背後にデプロイされます。**

*インバウンド、パブリックまたはプライベート*

Istio イングレスゲートウェイは TLS を終端します。CertManager によって Let's Encrypt を用いてプロビジョニングされた証明書は、EKS クラスター内の Secret として保存されます。Istio と ClickHouse は同一の VPC 内に存在するため、両者間のトラフィックは [AWS によって暗号化されます](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/encrypting-data-at-rest-and--in-transit.html#:~:text=All%20network%20traffic%20between%20AWS,supported%20Amazon%20EC2%20instance%20types)。

デフォルトでは、イングレスは IP 許可リストによるフィルタリングを伴ってパブリックに公開されます。顧客は VPC ピアリングを設定してプライベートエンドポイントとして構成し、パブリック接続を無効化できます。アクセスを制限するために [IP フィルター](/cloud/security/setting-ip-filters) を設定することを強く推奨します。

### トラブルシューティング用アクセス \{#troubleshooting-access\}

*インバウンド、プライベート*

ClickHouse Cloud のエンジニアは、Tailscale を介してトラブルシューティングを行うためのアクセスを必要とします。BYOC デプロイメントに対しては、ジャストインタイムで証明書ベースの認証情報が付与されます。

### Billing scraper \{#billing-scraper\}

*アウトバウンド、プライベート*

Billing scraper は ClickHouse から課金データを収集し、ClickHouse Cloud が所有する S3 バケットに送信します。

このコンポーネントは ClickHouse サーバーコンテナのサイドカーとして動作し、CPU とメモリのメトリクスを定期的にスクレイピングします。同一リージョン内のリクエストは、VPC ゲートウェイサービスエンドポイント経由でルーティングされます。

### アラート \{#alerts\}

*アウトバウンド、パブリック*

AlertManager は、顧客の ClickHouse クラスターが正常でない場合に、ClickHouse Cloud へアラートを送信するよう構成されています。

メトリクスとログは、顧客の BYOC VPC 内に保存されます。ログは現在、EBS 上にローカル保存されています。将来のアップデートでは、BYOC VPC 内の ClickHouse サービスである LogHouse に保存される予定です。メトリクスは Prometheus と Thanos のスタックを使用しており、BYOC VPC 内にローカル保存されます。

### サービス状態 \{#service-state\}

*アウトバウンド、パブリック*

State Exporter は ClickHouse Cloud が管理する SQS に、ClickHouse サービスの状態情報を送信します。