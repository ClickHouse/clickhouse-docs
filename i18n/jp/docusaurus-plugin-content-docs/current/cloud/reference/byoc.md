---
title: 'BYOC (Bring Your Own Cloud) for AWS'
slug: /cloud/reference/byoc
sidebar_label: 'BYOC (Bring Your Own Cloud)'
keywords: ['BYOC', 'cloud', 'bring your own cloud']
description: 'ClickHouseを自分のクラウドインフラストラクチャにデプロイする'
---

import Image from '@theme/IdealImage';
import byoc1 from '@site/static/images/cloud/reference/byoc-1.png';
import byoc4 from '@site/static/images/cloud/reference/byoc-4.png';
import byoc3 from '@site/static/images/cloud/reference/byoc-3.png';
import byoc_vpcpeering from '@site/static/images/cloud/reference/byoc-vpcpeering-1.png';
import byoc_vpcpeering2 from '@site/static/images/cloud/reference/byoc-vpcpeering-2.png';
import byoc_vpcpeering3 from '@site/static/images/cloud/reference/byoc-vpcpeering-3.png';
import byoc_vpcpeering4 from '@site/static/images/cloud/reference/byoc-vpcpeering-4.png';
import byoc_plb from '@site/static/images/cloud/reference/byoc-plb.png';
import byoc_security from '@site/static/images/cloud/reference/byoc-securitygroup.png';
import byoc_inbound from '@site/static/images/cloud/reference/byoc-inbound-rule.png';

## Overview {#overview}

BYOC (Bring Your Own Cloud)は、自分のクラウドインフラストラクチャにClickHouse Cloudをデプロイすることを可能にします。これは、ClickHouse Cloudのマネージドサービスを使用することを妨げる特定の要件や制約がある場合に便利です。

**アクセスを希望される場合は、[お問い合わせください](https://clickhouse.com/cloud/bring-your-own-cloud)。** 詳細情報については、[利用規約](https://clickhouse.com/legal/agreements/terms-of-service)をご参照ください。

BYOCは現在、AWSのみでサポートされています。GCPやAzureの待機リストには[こちら](https://clickhouse.com/cloud/bring-your-own-cloud)から参加できます。

:::note 
BYOCは大規模デプロイメント専用に設計されており、顧客にコミットした契約に署名することを要求します。
:::

## Glossary {#glossary}

- **ClickHouse VPC:**  ClickHouse Cloudが所有するVPC。
- **Customer BYOC VPC:** 顧客のクラウドアカウントが所有し、ClickHouse Cloudによってプロビジョニングおよび管理されている、ClickHouse Cloud BYOCデプロイメント専用のVPC。
- **Customer VPC:** 顧客のクラウドアカウントが所有する他のVPCで、Customer BYOC VPCに接続する必要のあるアプリケーションに使用されます。

## Architecture {#architecture}

メトリクスとログは、顧客のBYOC VPC内に保存されます。ログは現在EBSにローカル保存されています。将来のアップデートでは、ログはLogHouseに保存される予定で、これは顧客のBYOC VPC内のClickHouseサービスです。メトリクスは、顧客のBYOC VPC内にローカルに保存されたPrometheusおよびThanosスタックを介して実装されます。

<br />

<Image img={byoc1} size="lg" alt="BYOC Architecture" background='black'/>

<br />

## Onboarding Process {#onboarding-process}

顧客は、[こちらから](https://clickhouse.com/cloud/bring-your-own-cloud)オンボーディングプロセスを開始できます。顧客は、専用のAWSアカウントを持っており、使用するリージョンを知っている必要があります。この時点では、ClickHouse CloudでサポートしているリージョンのみにBYOCサービスを起動することが許可されています。

### Prepare a Dedicated AWS Account {#prepare-a-dedicated-aws-account}

顧客はClickHouse BYOCデプロイメントをホストするために専用のAWSアカウントを準備して、より良い隔離を確保する必要があります。これと初期の組織管理者のメールアドレスで、ClickHouseサポートに連絡できます。

### Apply CloudFormation Template {#apply-cloudformation-template}

BYOCのセットアップは、[CloudFormationスタック](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml)を介して初期化され、ClickHouse CloudからのBYOCコントローラーがインフラストラクチャを管理できるようにする役割のみが作成されます。S3、VPC、そしてClickHouseを実行するためのコンピュータリソースはこのスタックには含まれていません。

<!-- TODO: Add Screenshot for the rest of onboarding, once self-served onboarding is implemented. -->

### Setup BYOC Infrastructure {#setup-byoc-infrastructure}

CloudFormationスタックを作成した後、S3、VPC、およびEKSクラスターを含むインフラストラクチャのセットアップを行うよう求められます。この段階で特定の設定を決定する必要があります。なぜなら、それらは後で変更できないからです。具体的には：

- **使用するリージョン**: ClickHouse Cloud用に用意されている[公開リージョン](/cloud/reference/supported-regions)から1つを選択できます。
- **BYOCのVPC CIDR範囲**: デフォルトでは、BYOC VPC CIDR範囲には`10.0.0.0/16`を使用します。別のアカウントとのVPCピアリングを使用する予定がある場合、CIDR範囲が重複しないようにすることを確認してください。BYOC用に適切なCIDR範囲を割り当て、必要なワークロードを収容するために最小サイズは`/22`が必要です。
- **BYOC VPCのアベイラビリティゾーン**: VPCピアリングを使用する予定がある場合、ソースとBYOCアカウント間でアベイラビリティゾーンを揃えることで、クロスAZトラフィックコストを削減するのに役立ちます。AWSでは、アベイラビリティゾーンのサフィックス（`a, b, c`）がアカウントによって異なる物理ゾーンIDを表すことがあります。詳細については[AWSガイド](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html)を参照してください。

### Optional: Setup VPC Peering {#optional-setup-vpc-peering}

ClickHouse BYOCのためのVPCピアリングを作成または削除するには、次の手順に従います。

#### Step 1 Enable Private Load Balancer for ClickHouse BYOC {#step-1-enable-private-load-balancer-for-clickhouse-byoc}
ClickHouseサポートに連絡して、プライベートロードバランサーを有効にします。

#### Step 2 Create a peering connection {#step-2-create-a-peering-connection}
1. ClickHouse BYOCアカウントのVPCダッシュボードに移動します。
2. ピアリング接続を選択します。
3. ピアリング接続の作成をクリックします。
4. VPCリクエスターをClickHouse VPC IDに設定します。
5. VPCアクセプターをターゲットVPC IDに設定します。（該当する場合は別のアカウントを選択）
6. ピアリング接続を作成するをクリックします。

<br />

<Image img={byoc_vpcpeering} size="lg" alt="BYOC Create Peering Connection" border />

<br />

#### Step 3 Accept the peering connection request {#step-3-accept-the-peering-connection-request}
ピアリングアカウントに移動し、（VPC -> ピアリング接続 -> アクション -> リクエストを承認）ページで顧客はこのVPCピアリングリクエストを承認できます。

<br />

<Image img={byoc_vpcpeering2} size="lg" alt="BYOC Accept Peering Connection" border />

<br />

#### Step 4 Add destination to ClickHouse VPC route tables {#step-4-add-destination-to-clickhouse-vpc-route-tables}
ClickHouse BYOCアカウントで、
1. VPCダッシュボードのルートテーブルを選択します。
2. ClickHouse VPC IDを検索します。プライベートサブネットに接続された各ルートテーブルを編集します。
3. ルートタブの下にある編集ボタンをクリックします。
4. 別のルートを追加をクリックします。
5. 目的地にターゲットVPCのCIDR範囲を入力します。
6. 「ピアリング接続」と、ターゲットのピアリング接続のIDを選択します。

<br />

<Image img={byoc_vpcpeering3} size="lg" alt="BYOC Add route table" border />

<br />

#### Step 5 Add destination to the target VPC route tables {#step-5-add-destination-to-the-target-vpc-route-tables}
ピアリングAWSアカウントで、
1. VPCダッシュボードのルートテーブルを選択します。
2. ターゲットVPC IDを検索します。
3. ルートタブの下にある編集ボタンをクリックします。
4. 別のルートを追加をクリックします。
5. 目的地にClickHouse VPCのCIDR範囲を入力します。
6. 「ピアリング接続」と、ターゲットのピアリング接続のIDを選択します。

<br />

<Image img={byoc_vpcpeering4} size="lg" alt="BYOC Add route table" border />

<br />

#### Step 6 Edit Security Group to allow Peered VPC access {#step-6-edit-security-group-to-allow-peered-vpc-access}
ClickHouse BYOCアカウントで、
1. ClickHouse BYOCアカウント内でEC2に移動し、infra-xx-xxx-ingress-privateのような名前のプライベートロードバランサーを見つけます。

<br />

<Image img={byoc_plb} size="lg" alt="BYOC Private Load Balancer" border />

<br />

2. 詳細ページのセキュリティタブの下で、`k8s-istioing-istioing-xxxxxxxxx`のような命名パターンに従った関連付けられたセキュリティグループを見つけます。

<br />

<Image img={byoc_security} size="lg" alt="BYOC Private Load Balancer Security Group" border />

<br />

3. このセキュリティグループのインバウンドルールを編集し、ピアリングされたVPC CIDR範囲を追加します（または必要に応じて要求されるCIDR範囲を指定します）。

<br />

<Image img={byoc_inbound} size="lg" alt="BYOC Security Group Inbound Rule" border />

<br />

---
ClickHouseサービスは、ピアリングされたVPCからアクセス可能であるべきです。

ClickHouseにプライベートにアクセスするには、ユーザーのピアードVPCからの安全な接続のためにプライベートロードバランサーとエンドポイントがプロビジョニングされます。プライベートエンドポイントは、`-private`サフィックスのある公開エンドポイント形式に従います。例えば：
- **公開エンドポイント**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
- **プライベートエンドポイント**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

オプションとして、ピアリングの動作を確認した後、ClickHouse BYOCの公開ロードバランサーの削除を要求できます。

## Upgrade Process {#upgrade-process}

私たちは定期的にソフトウェアをアップグレードし、ClickHouseデータベースバージョンアップグレード、ClickHouseオペレーター、EKS、その他のコンポーネントを含みます。

シームレスなアップグレードを目指しますが（例：ロールアップグレードや再起動）、ClickHouseバージョンの変更やEKSノードのアップグレードなど、一部はサービスに影響を与える可能性があります。顧客はメンテナンスウィンドウを指定でき（例：毎週火曜日の午前1時PDT）、その期間中のアップグレードのみが発生することを保証します。

:::note
メンテナンスウィンドウは、セキュリティおよび脆弱性修正には適用されません。これらはオフサイクルアップグレードとして扱われ、適切な時間を調整し運用への影響を最小限に抑えるためにタイムリーなコミュニケーションが行われます。
:::

## CloudFormation IAM Roles {#cloudformation-iam-roles}

### Bootstrap IAM role {#bootstrap-iam-role}

ブートストラップIAMロールは次の権限を持っています：

- **EC2およびVPC操作**: VPCおよびEKSクラスターのセットアップに必要です。
- **S3操作（例：`s3:CreateBucket`）**: ClickHouse BYOCストレージのバケットを作成するために必要です。
- **`route53:*`権限**: Route 53でレコードを設定するために外部DNSに必要です。
- **IAM操作（例：`iam:CreatePolicy`）**: コントローラーが追加のロールを作成するために必要です（詳細については次のセクションを参照してください）。
- **EKS操作**: `clickhouse-cloud`プレフィックスで始まる名前のリソースに制限されます。

### Additional IAM roles created by the controller {#additional-iam-roles-created-by-the-controller}

CloudFormation経由で作成された`ClickHouseManagementRole`に加えて、コントローラーはいくつかの追加のロールを作成します。

これらのロールは、顧客のEKSクラスター内で実行されるアプリケーションによって引き受けられます：
- **State Exporter Role**
  - ClickHouseサービスの健康情報をClickHouse Cloudに報告するClickHouseコンポーネント。
  - ClickHouse Cloud所有のSQSキューへの書き込み権限が必要です。
- **Load-Balancer Controller**
  - 標準のAWSロードバランサーコントローラー。
  - ClickHouseサービス用のボリュームを管理するEBS CSIコントローラー。
- **External-DNS**
  - DNS構成をRoute 53に伝播します。
- **Cert-Manager**
  - BYOCサービスドメインのTLS証明書をプロビジョニングします。
- **Cluster Autoscaler**
  - 必要に応じてノードグループのサイズを調整します。

**K8s-control-plane**および**k8s-worker**ロールは、AWS EKSサービスによって引き受けることを意図しています。

最後に、**`data-plane-mgmt`**は、ClickHouse Cloudコントロールプレーンコンポーネントが`ClickHouseCluster`やIstioの仮想サービス/ゲートウェイのような必要なカスタムリソースを調整することを許可します。

## Network Boundaries {#network-boundaries}

このセクションでは、顧客のBYOC VPCへのさまざまなネットワークトラフィックについて説明します：

- **Inbound**: 顧客のBYOC VPCに入るトラフィック。
- **Outbound**: 顧客のBYOC VPCから発信し、外部宛に送信されるトラフィック。
- **Public**: 公開インターネットからアクセス可能なネットワークエンドポイント。
- **Private**: VPCピアリング、VPC Private Link、またはTailscaleなどのプライベート接続を通じてのみアクセス可能なネットワークエンドポイント。

**Istioのingressは、ClickHouseクライアントトラフィックを受け入れるためにAWS NLBの背後にデプロイされます。**

*Inbound, Public (can be Private)*

Istio ingressゲートウェイはTLSを終了させます。証明書はLet's EncryptによってCertManagerによりプロビジョニングされ、EKSクラスター内に秘密情報として保存されています。IstioとClickHouse間のトラフィックは、同じVPC内に存在するため、[AWSによって暗号化されています](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/encrypting-data-at-rest-and--in-transit.html#:~:text=All%20network%20traffic%20between%20AWS,supported%20Amazon%20EC2%20instance%20types)。

デフォルトでは、インバウンドはIP許可リストフィルタリング付きで公開にアクセス可能です。顧客はVPCピアリングを構成してプライベートにし、公開接続を無効にすることができます。[IPフィルタ](/cloud/security/setting-ip-filters)の設定を強く推奨します。

### Troubleshooting access {#troubleshooting-access}

*Inbound, Public (can be Private)*

ClickHouse Cloudエンジニアは、トラブルシューティングアクセスのためにTailscaleを介してアクセスを要求します。彼らは、BYOCデプロイメント用のオンデマンド証明書ベースの認証が提供されています。

### Billing scraper {#billing-scraper}

*Outbound, Private*

Billing scraperは、ClickHouseから請求データを収集し、ClickHouse Cloudが所有するS3バケットに送信します。

これは、ClickHouseサーバーコンテナと一緒にサイドカーとして実行され、CPUおよびメモリメトリクスを定期的にスクレイプします。同じリージョン内のリクエストは、VPCゲートウェイサービスエンドポイントを通じてルーティングされます。

### Alerts {#alerts}

*Outbound, Public*

AlertManagerは、顧客のClickHouseクラスターが健康でないときにClickHouse Cloudにアラートを送信するように設定されています。

メトリクスとログは、顧客のBYOC VPC内に保存されます。ログは現在EBSにローカル保存されています。将来のアップデートでは、これらはBYOC VPC内のClickHouseサービスであるLogHouseに保存されます。メトリクスは、BYOC VPC内でローカルに保存されたPrometheusおよびThanosスタックを使用しています。

### Service state {#service-state}

*Outbound*

State Exporterは、ClickHouseサービスの状態情報をClickHouse Cloudが所有するSQSに送信します。

## Features {#features}

### Supported features {#supported-features}

- **SharedMergeTree**: ClickHouse CloudとBYOCは同じバイナリと設定を使用しています。したがって、SharedMergeTreeなど、ClickHouseコアのすべての機能がBYOCでサポートされています。
- **サービス状態管理のためのコンソールアクセス**:
  - 開始、停止、終了などの操作をサポートします。
  - サービスとそのステータスを表示できます。
- **バックアップと復元**。
- **手動の垂直および水平スケーリング**。
- **アイドリング**。
- **ウェアハウス**: コンピュート-コンピュートの分離。
- **Tailscaleによるゼロトラストネットワーク**。
- **監視**:
  - クラウドコンソールには、サービスの健康を監視するためのビルトインの健康ダッシュボードが含まれています。
  - Prometheus、Grafana、Datadogを用いた中央集権的監視のためのPrometheusスクレイピング。設定手順については[Prometheusのドキュメント](/integrations/prometheus)を参照してください。
- **VPCピアリング**。
- **統合**: このページの[全リスト](/integrations)をご覧ください。
- **セキュアS3**。
- **[AWS PrivateLink](https://aws.amazon.com/privatelink/)**。

### Planned features (currently unsupported) {#planned-features-currently-unsupported}

- [AWS KMS](https://aws.amazon.com/kms/) 別名CMEK (顧客管理暗号化キー)
- ClickPipesによる取り込み
- 自動スケーリング
- MySQLインターフェース

## FAQ {#faq}

### Compute {#compute}

#### Can I create multiple services in this single EKS cluster? {#can-i-create-multiple-services-in-this-single-eks-cluster}

はい。インフラストラクチャは、すべてのAWSアカウントとリージョンの組み合わせに対して一度だけプロビジョニングされる必要があります。

### Which regions do you support for BYOC? {#which-regions-do-you-support-for-byoc}

BYOCは、ClickHouse Cloudと同じセットの[リージョン](/cloud/reference/supported-regions#aws-regions)をサポートします。

#### Will there be some resource overhead? What are the resources needed to run services other than ClickHouse instances? {#will-there-be-some-resource-overhead-what-are-the-resources-needed-to-run-services-other-than-clickhouse-instances}

ClickHouseインスタンス（ClickHouseサーバーおよびClickHouse Keeper）に加えて、`clickhouse-operator`、`aws-cluster-autoscaler`、Istioなどのサービスを実行し、私たちの監視スタックを実行します。

現在、これらのワークロードを実行するために、専用ノードグループに3つのm5.xlargeノード（各AZに1つ）があります。

### Network and Security {#network-and-security}

#### Can we revoke permissions set up during installation after setup is complete? {#can-we-revoke-permissions-set-up-during-installation-after-setup-is-complete}

現時点ではこれは不可能です。

#### Have you considered some future security controls for ClickHouse engineers to access customer infra for troubleshooting? {#have-you-considered-some-future-security-controls-for-clickhouse-engineers-to-access-customer-infra-for-troubleshooting}

はい。顧客がエンジニアのクラスタへのアクセスを承認できる制御メカニズムの実装は、私たちのロードマップにあります。現時点では、エンジニアはクラスタへのオンデマンドアクセスを取得するために、内部のエスカレーションプロセスを経なければなりません。これは、私たちのセキュリティチームによってログ記録され、監査されます。

#### What is the size of the VPC IP range created? {#what-is-the-size-of-the-vpc-ip-range-created}

デフォルトでは、BYOC VPCには`10.0.0.0/16`を使用します。将来のスケーリングに備えて少なくとも/22を予約することをお勧めしますが、サイズを制限したい場合は、30のサーバーポッドに制限される可能性がある場合は/23を使用することも可能です。

#### Can I decide maintenance frequency {#can-i-decide-maintenance-frequency}

サポートに連絡して、メンテナンスウィンドウをスケジュールしてください。最低でも週に1回の更新スケジュールが期待されます。

## Observability {#observability}

### Built-in Monitoring Tools {#built-in-monitoring-tools}

#### Observability Dashboard {#observability-dashboard}

ClickHouse Cloudには、メモリ使用量、クエリレート、I/Oなどのメトリクスを表示する高度な可観測性ダッシュボードが含まれています。これは、ClickHouse Cloudのウェブコンソールの**監視**セクションでアクセスできます。

<br />

<Image img={byoc3} size="lg" alt="Observability dashboard" border />

<br />

#### Advanced Dashboard {#advanced-dashboard}

`system.metrics`、`system.events`、`system.asynchronous_metrics`などのシステムテーブルからメトリクスを使用して、サーバーのパフォーマンスやリソース利用状況を詳細に監視するためにダッシュボードをカスタマイズできます。

<br />

<Image img={byoc4} size="lg" alt="Advanced dashboard" border />

<br />

#### Prometheus Integration {#prometheus-integration}

ClickHouse Cloudは、監視のためにメトリクスをスクレイプするのに使用できるPrometheusエンドポイントを提供します。これにより、GrafanaやDatadogなどのツールとの統合が可能になります。

**HTTPSエンドポイントを介したサンプルリクエスト /metrics_all**

```bash
curl --user <username>:<password> https://i6ro4qarho.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud:8443/metrics_all
```

**サンプルレスポンス**

```bash

# HELP ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes ディスク`s3disk`に保存されているバイト数

# TYPE ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes gauge
ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes{hostname="c-jet-ax-16-server-43d5baj-0"} 62660929

# HELP ClickHouse_CustomMetric_NumberOfBrokenDetachedParts 壊れたデタッチパーツの数

# TYPE ClickHouse_CustomMetric_NumberOfBrokenDetachedParts gauge
ClickHouse_CustomMetric_NumberOfBrokenDetachedParts{hostname="c-jet-ax-16-server-43d5baj-0"} 0

# HELP ClickHouse_CustomMetric_LostPartCount 最も古いミューテーションの年齢（秒単位）

# TYPE ClickHouse_CustomMetric_LostPartCount gauge
ClickHouse_CustomMetric_LostPartCount{hostname="c-jet-ax-16-server-43d5baj-0"} 0

# HELP ClickHouse_CustomMetric_NumberOfWarnings サーバーによって発行された警告の数。これは通常、誤った設定を示します

# TYPE ClickHouse_CustomMetric_NumberOfWarnings gauge
ClickHouse_CustomMetric_NumberOfWarnings{hostname="c-jet-ax-16-server-43d5baj-0"} 2

# HELP ClickHouseErrorMetric_FILE_DOESNT_EXIST FILE_DOESNT_EXIST

# TYPE ClickHouseErrorMetric_FILE_DOESNT_EXIST counter
ClickHouseErrorMetric_FILE_DOESNT_EXIST{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 1

# HELP ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE UNKNOWN_ACCESS_TYPE

# TYPE ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE counter
ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 8

# HELP ClickHouse_CustomMetric_TotalNumberOfErrors サーバーの最後の再起動以降のエラーの合計数

# TYPE ClickHouse_CustomMetric_TotalNumberOfErrors gauge
ClickHouse_CustomMetric_TotalNumberOfErrors{hostname="c-jet-ax-16-server-43d5baj-0"} 9
```

**認証**

ClickHouseのユーザー名とパスワードのペアを使用して認証できます。メトリクスをスクレイプするために最小限の権限を持つ専用ユーザーを作成することをお勧めします。少なくとも、レプリカ間で`system.custom_metrics`テーブルに対する`READ`権限が必要です。例えば：

```sql
GRANT REMOTE ON *.* TO scraping_user
GRANT SELECT ON system.custom_metrics TO scraping_user
```

**Prometheusの設定**

以下に例の設定を示します。`targets`エンドポイントは、ClickHouseサービスにアクセスするのに使用される同じものです。

```bash
global:
 scrape_interval: 15s

scrape_configs:
 - job_name: "prometheus"
   static_configs:
   - targets: ["localhost:9090"]
 - job_name: "clickhouse"
   static_configs:
     - targets: ["<subdomain1>.<subdomain2>.aws.byoc.clickhouse.cloud:8443"]
   scheme: https
   metrics_path: "/metrics_all"
   basic_auth:
     username: <KEY_ID>
     password: <KEY_SECRET>
   honor_labels: true
```

また、[このブログ投稿](https://clickhouse.com/blog/clickhouse-cloud-now-supports-prometheus-monitoring)および[ClickHouseのPrometheus設定ドキュメント](/integrations/prometheus)もご覧ください。

