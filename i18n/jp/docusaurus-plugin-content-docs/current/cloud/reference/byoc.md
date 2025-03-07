---
title: AWS向けBYOC（Bring Your Own Cloud）
slug: /cloud/reference/byoc
sidebar_label: BYOC（お客様クラウド環境の活用）
keywords: [BYOC, cloud, bring your own cloud]
description: ClickHouseを独自のクラウドインフラストラクチャにデプロイします
---

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


## 概要 {#overview}

BYOC (Bring Your Own Cloud) は、独自のクラウドインフラストラクチャにClickHouse Cloudをデプロイできるようにします。これは、ClickHouse Cloudのマネージドサービスを利用できない特定の要件や制約がある場合に便利です。

**アクセスをご希望の場合は、[お問い合わせ](https://clickhouse.com/cloud/bring-your-own-cloud)ください。** 詳細については、[利用規約](https://clickhouse.com/legal/agreements/terms-of-service)を参照してください。

BYOCは現在、AWSのみでサポートされており、GCPとMicrosoft Azureは開発中です。

:::note
BYOCは大規模なデプロイメント専用に設計されており、顧客には契約の締結が求められます。
:::

## 用語集 {#glossary}

- **ClickHouse VPC:** ClickHouse Cloudが所有するVPC。
- **Customer BYOC VPC:** 顧客のクラウドアカウントに属し、ClickHouse Cloudによってプロビジョニングおよび管理される、ClickHouse Cloud BYOCデプロイメント専用のVPC。
- **Customer VPC:** 顧客のクラウドアカウントによって所有され、Customer BYOC VPCに接続する必要があるアプリケーション用のその他のVPC。

## アーキテクチャ {#architecture}

メトリクスとログは顧客のBYOC VPC内に保存されます。ログは現在、EBSにローカル保存されています。将来のアップデートでは、ログは顧客のBYOC VPC内のClickHouseサービスであるLogHouseに保存される予定です。メトリクスは、顧客のBYOC VPC内にローカルに保存されたPrometheusとThanosスタックを経由して実装されています。

<br />

<img src={byoc1}
    alt='BYOC Architecture'
    class='image'
    style={{width: '800px'}}
/>

<br />

## オンボーディングプロセス {#onboarding-process}

顧客は、[私たち](https://clickhouse.com/cloud/bring-your-own-cloud)に連絡することで、オンボーディングプロセスを開始できます。顧客は、専用のAWSアカウントを持ち、使用するリージョンを把握している必要があります。現在のところ、BYOCサービスは、ClickHouse Cloudでサポートされているリージョンでのみ立ち上げることが許可されています。

### 専用AWSアカウントの準備 {#prepare-a-dedicated-aws-account}

顧客は、ClickHouse BYOCデプロイメントをホスティングするための専用のAWSアカウントを準備する必要があります。これにより、より良い分離が保証されます。この情報と初期の組織管理者のメールがあれば、ClickHouseサポートに連絡できます。

### CloudFormationテンプレートの適用 {#apply-cloudformation-template}

BYOCセットアップは、[CloudFormationスタック](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml)を通じて初期化され、BYOCコントローラーをClickHouse Cloudからインフラストラクチャを管理するための役割を作成します。ClickHouseを実行するためのS3、VPC、およびコンピュートリソースはこのスタックには含まれていません。

<!-- TODO: Add Screenshot for the rest of onboarding, once self-served onboarding is implemented. -->

### BYOCインフラストラクチャのセットアップ {#setup-byoc-infrastructure}

CloudFormationスタックを作成した後、クラウドコンソールからS3、VPC、およびEKSクラスターなどのインフラストラクチャをセットアップするように促されます。この段階で特定の設定が決定される必要があります。なぜなら、後で変更することはできないからです。具体的には：

- **使用したいリージョン**: ClickHouse Cloudの[公開リージョン](/cloud/reference/supported-regions)のいずれかを選択できます。
- **BYOCのVPC CIDR範囲**: デフォルトでは、BYOC VPC CIDR範囲に`10.0.0.0/16`が使用されます。他のアカウントでVPCピアリングを使用する予定がある場合は、CIDR範囲が重複しないようにしてください。BYOC用に適切なCIDR範囲を割り当て、必要な作業負荷を収容できるように最小サイズを`/22`にしてください。
- **BYOC VPCのアベイラビリティゾーン**: VPCピアリングを使用する予定がある場合は、ソースおよびBYOCアカウント間でアベイラビリティゾーンを一致させることで、AZ間のトラフィックコストを削減できます。AWSでは、アベイラビリティゾーンのサフィックス（`a, b, c`）はアカウントにより異なる物理ゾーンIDを表す場合があります。詳しくは[AWSガイド](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html)を参照してください。

### オプション: VPCピアリングのセットアップ {#optional-setup-vpc-peering}

ClickHouse BYOCのためにVPCピアリングを作成または削除するには、以下の手順に従ってください。

#### ステップ1 ClickHouse BYOCのプライベートロードバランサーを有効にする {#step-1-enable-private-load-balancer-for-clickhouse-byoc}
ClickHouseサポートに連絡してプライベートロードバランサーを有効にします。

#### ステップ2 ピア接続を作成する {#step-2-create-a-peering-connection}
1. ClickHouse BYOCアカウントのVPCダッシュボードに移動します。
2. ピア接続を選択します。
3. ピア接続の作成をクリックします。
4. VPCリクエスターにClickHouse VPC IDを設定します。
5. VPCアセプターにターゲットVPC IDを設定します。（対象アカウントを選択します）
6. ピア接続の作成をクリックします。

<br />

<img src={byoc_vpcpeering}
    alt='BYOC Create Peering Connection'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### ステップ3 ピア接続リクエストを承認する {#step-3-accept-the-peering-connection-request}
ピアアカウントへ移動し、(VPC -> ピア接続 -> アクション -> リクエストを承認)ページで、顧客はこのVPCピアリングリクエストを承認できます。

<br />

<img src={byoc_vpcpeering2}
    alt='BYOC Accept Peering Connection'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### ステップ4 ClickHouse VPCのルートテーブルに宛先を追加する {#step-4-add-destination-to-clickhouse-vpc-route-tables}
ClickHouse BYOCアカウントで、
1. VPCダッシュボードのルートテーブルを選択します。
2. ClickHouse VPC IDを検索します。プライベートサブネットに接続されている各ルートテーブルを編集します。
3. ルートタブの下で編集ボタンをクリックします。
4. もう一つのルートを追加をクリックします。
5. ターゲットVPCのCIDR範囲を宛先として入力します。
6. ターゲットとして「ピア接続」を選択し、ピア接続のIDを指定します。

<br />

<img src={byoc_vpcpeering3}
    alt='BYOC Add route table'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### ステップ5 ターゲットVPCのルートテーブルに宛先を追加する {#step-5-add-destination-to-the-target-vpc-route-tables}
ピアAWSアカウントで、
1. VPCダッシュボードのルートテーブルを選択します。
2. ターゲットVPC IDを検索します。
3. ルートタブの下で編集ボタンをクリックします。
4. もう一つのルートを追加をクリックします。
5. ClickHouse VPCのCIDR範囲を宛先として入力します。
6. ターゲットとして「ピア接続」を選択し、ピア接続のIDを指定します。

<br />

<img src={byoc_vpcpeering4}
    alt='BYOC Add route table'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### ステップ6 セキュリティグループを編集してピアVPCアクセスを許可する {#step-6-edit-security-group-to-allow-peered-vpc-access}
ClickHouse BYOCアカウントで、
1. ClickHouse BYOCアカウントで、EC2に移動し、infra-xx-xxx-ingress-privateの名前のプライベートロードバランサーを見つけます。

<br />

<img src={byoc_plb}
    alt='BYOC Private Load Balancer'
    class='image'
    style={{width: '800px'}}
/>

<br />

2. 詳細ページのセキュリティタブの下で、名前のパターンが`k8s-istioing-istioing-xxxxxxxxx`の関連セキュリティグループを見つけます。

<br />

<img src={byoc_security}
    alt='BYOC Private Load Balancer Security Group'
    class='image'
    style={{width: '800px'}}
/>

<br />

3. このセキュリティグループのインバウンドルールを編集し、ピアVPC CIDR範囲（または必要に応じて必要なCIDR範囲）を追加します。

<br />

<img src={byoc_inbound}
    alt='BYOC Security Group Inbound Rule'
    class='image'
    style={{width: '800px'}}
/>

<br />

---
ClickHouseサービスは、ピアVPCからアクセスできるようになりました。

ClickHouseにプライベートにアクセスするために、ユーザーのピアVPCからの安全な接続のためにプライベートロードバランサーとエンドポイントがプロビジョニングされます。プライベートエンドポイントは、`-private`のサフィックス付きの公開エンドポイント形式に従います。例えば：
- **公開エンドポイント**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
- **プライベートエンドポイント**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

オプションとして、ピアリングが機能していることを確認した後、ClickHouse BYOCの公開ロードバランサーの削除をリクエストできます。

## アップグレードプロセス {#upgrade-process}

私たちは、ClickHouseデータベースバージョンのアップグレード、ClickHouse Operator、EKS、その他のコンポーネントを含むソフトウェアを定期的にアップグレードします。

シームレスなアップグレード（例：ロールアップグレードおよび再起動）を目指していますが、ClickHouseバージョンの変更やEKSノードのアップグレードなど、一部はサービスに影響を与える可能性があります。顧客は、メンテナンスウィンドウ（例：毎週火曜日午前1時PDT）を指定することができ、そうしたアップグレードはスケジュールされた時間内にのみ行われます。

:::note
メンテナンスウィンドウは、セキュリティと脆弱性修正には適用されません。これらはオフサイクルのアップグレードとして扱われ、適切な時期に調整するためのタイムリーなコミュニケーションが行われます。
:::

## CloudFormation IAMロール {#cloudformation-iam-roles}

### ブートストラップIAMロール {#bootstrap-iam-role}

ブートストラップIAMロールには、次の権限があります：

- **EC2およびVPC操作**: VPCおよびEKSクラスターのセットアップに必要です。
- **S3操作（例：`s3:CreateBucket`）**: ClickHouse BYOCストレージ用のバケットを作成するために必要です。
- **`route53:*`権限**: Route 53で外部DNSを構成するために必要です。
- **IAM操作（例：`iam:CreatePolicy`）**: コントローラーが追加の役割を作成するために必要です（詳細は次のセクションを参照）。
- **EKS操作**: `clickhouse-cloud`プレフィックスで始まるリソースに制限されます。

### コントローラーによって作成された追加IAMロール {#additional-iam-roles-created-by-the-controller}

CloudFormationを介して作成された`ClickHouseManagementRole`に加えて、コントローラーはいくつかの追加のロールを作成します。

これらのロールは、顧客のEKSクラスター内で実行されるアプリケーションによって引き受けられます：
- **ステートエクスポーターロール**
  - ClickHouseのコンポーネントで、サービスのヘルス情報をClickHouse Cloudに報告します。
  - ClickHouse Cloudが所有するSQSキューへの書き込み権限が必要です。
- **ロードバランサーコントローラー**
  - 標準のAWSロードバランサーコントローラー。
  - ClickHouseサービスのボリュームを管理するためのEBS CSIコントローラー。
- **External-DNS**
  - Route 53へのDNS設定を伝播します。
- **Cert-Manager**
  - BYOCサービスドメイン向けのTLS証明書を準備します。
- **Cluster Autoscaler**
  - 必要に応じてノードグループのサイズを調整します。

**K8s-control-plane**および**k8s-worker**ロールは、AWS EKSサービスによって引き受けられます。

最後に、**`data-plane-mgmt`**は、ClickHouse Cloudコントロールプレーンコンポーネントが`ClickHouseCluster`やIstio Virtual Service/Gatewayなどの必要なカスタムリソースを調整できるようにします。

## ネットワーク境界 {#network-boundaries}

このセクションでは、顧客BYOC VPCへの入出力トラフィックをカバーします：

- **インバウンド**: 顧客BYOC VPCに入るトラフィック。
- **アウトバウンド**: 顧客BYOC VPCから発生し、外部に送信されるトラフィック。
- **パブリック**: 公開インターネットからアクセスできるネットワークエンドポイント。
- **プライベート**: VPCピアリング、VPCプライベートリンク、またはTailscaleのようなプライベート接続を介してのみアクセス可能なネットワークエンドポイント。

**Istioのインバウンドは、ClickHouseクライアントトラフィックを受け入れるためにAWS NLBの背後にデプロイされます。**

*インバウンド、パブリック（プライベートである可能性あり）*

IstioインバウンドゲートウェイはTLSを終了します。CertManagerによりLet's Encryptから提供された証明書は、EKSクラスター内のシークレットとして保存されます。IstioとClickHouse間のトラフィックは、[AWSによって暗号化されています](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/encrypting-data-at-rest-and--in-transit.html#:~:text=All%20network%20traffic%20between%20AWS,supported%20Amazon%20EC2%20instance%20types)これは、同じVPC内にあるためです。

デフォルトでは、インバウンドは公開アクセス可能で、IP許可リストフィルタリングが行われます。顧客はVPCピアリングを設定してプライベートにし、公開接続を無効にすることができます。アクセスを制限するために[IPフィルター](/cloud/security/setting-ip-filters)を設定することを強くお勧めします。

### アクセスのトラブルシューティング {#troubleshooting-access}

*インバウンド、パブリック（プライベートである可能性あり）*

ClickHouse Cloudのエンジニアは、Tailscaleを介してトラブルシューティングアクセスが必要です。彼らはBYOCデプロイメントのために、時限的証明書ベースの認証を提供されています。

### 請求スキャパー {#billing-scraper}

*アウトバウンド、プライベート*

請求スキャパーは、ClickHouseから請求データを収集し、ClickHouse Cloudが所有するS3バケットに送信します。

これは、ClickHouseサーバーコンテナと一緒にサイドカーとして実行され、定期的にCPUとメモリのメトリクスをスキャンします。同じリージョン内のリクエストは、VPCゲートウェイサービスエンドポイントを通じてルーティングされます。

### アラート {#alerts}

*アウトバウンド、パブリック*

AlertManagerは、顧客のClickHouseクラスターが正常でない場合にClickHouse Cloudにアラートを送信するように設定されています。

メトリクスとログは顧客のBYOC VPC内に保存されます。ログは現在、EBSにローカルで保存されています。将来のアップデートでは、BYOC VPC内のClickHouseサービスであるLogHouseに保存される予定です。メトリクスは、BYOC VPCにローカルに保存されたPrometheusとThanosスタックを利用します。

### サービス状態 {#service-state}

*アウトバウンド*

ステートエクスポーターは、ClickHouseサービス状態情報をClickHouse Cloudが所有するSQSに送信します。

## 機能 {#features}

### サポートされている機能 {#supported-features}

- **SharedMergeTree**: ClickHouse CloudとBYOCは同じバイナリと設定を使用しています。したがって、SharedMergeTreeなど、ClickHouseコアのすべての機能がBYOCでサポートされています。
- **サービス状態を管理するためのコンソールアクセス**：
  - 開始、停止、終了などの操作をサポート。
  - サービスと状態を表示。
- **バックアップおよび復元。**
- **手動の垂直および水平スケーリング。**
- **アイドル状態。**
- **倉庫**: コンピュート-コンピュート分離。
- **Tailscaleを介したゼロトラストネットワーク。**
- **監視**:
  - クラウドコンソールにサービスの健康を監視するための組み込みの健康ダッシュボードが含まれています。
  - Prometheusを使用した中央集権的な監視のためのPrometheusスクリーピング、Grafana、およびDatadog。セットアップ手順については[Prometheusドキュメント](/integrations/prometheus)を参照してください。
- **VPCピアリング。**
- **統合**: 完全なリストは[このページ](/integrations)を参照してください。
- **安全なS3。**
- **[AWS PrivateLink](https://aws.amazon.com/privatelink/)。**

### 計画中の機能（現在未サポート） {#planned-features-currently-unsupported}

- [AWS KMS](https://aws.amazon.com/kms/)別名CMEK（顧客管理暗号化キー）。
- データの取り込みのためのClickPipes。
- オートスケーリング。
- MySQLインターフェース。

## FAQ {#faq}

### コンピュート {#compute}

#### この単一のEKSクラスターで複数のサービスを作成できますか？ {#can-i-create-multiple-services-in-this-single-eks-cluster}

はい。インフラストラクチャは、すべてのAWSアカウントとリージョンの組み合わせごとに、一度だけプロビジョニングする必要があります。

### BYOCでサポートされているリージョンはどれですか？ {#which-regions-do-you-support-for-byoc}

BYOCは、ClickHouse Cloudと同じセットの[リージョン](/cloud/reference/supported-regions#aws-regions)をサポートしています。

#### 資源オーバーヘッドはありますか？ ClickHouseインスタンス以外のサービスを運用するために必要なリソースは何ですか？ {#will-there-be-some-resource-overhead-what-are-the-resources-needed-to-run-services-other-than-clickhouse-instances}

ClickHouseインスタンス（ClickHouseサーバーとClickHouse Keeper）に加えて、`clickhouse-operator`、`aws-cluster-autoscaler`、Istioなど、監視スタックのサービスを実行します。

現在、このワークロードを実行するために、専用ノードグループに3つのm5.xlargeノード（各AZに1つ）があります。

### ネットワークとセキュリティ {#network-and-security}

#### インストール完了後、インストール中に設定された権限を取り消すことはできますか？ {#can-we-revoke-permissions-set-up-during-installation-after-setup-is-complete}

現時点では不可能です。

#### ClickHouseエンジニアが顧客のインフラにアクセスしてトラブルシューティングを行うための将来的なセキュリティコントロールについて検討していますか？ {#have-you-considered-some-future-security-controls-for-clickhouse-engineers-to-access-customer-infra-for-troubleshooting}

はい。顧客がエンジニアのクラスターへのアクセスを承認できる顧客管理メカニズムの実装が我々のロードマップに含まれています。現時点では、エンジニアはクラスターに短期間のアクセスを得るために、内部のエスカレーションプロセスを経なければなりません。これは、私たちのセキュリティチームによってログと監査されます。

#### 作成されたVPC IP範囲のサイズはどのくらいですか？ {#what-is-the-size-of-the-vpc-ip-range-created}

デフォルトでは、BYOC VPCに`10.0.0.0/16`を使用しています。将来のスケーリングの可能性を考慮して、少なくとも/22を予約することをお勧めしますが、サイズを制限したい場合は/23を使用することも可能です。ただし、サーバーポッドが30以内に制限される可能性がある場合は、/23を選択してください。

#### メンテナンスの頻度を決定できますか？ {#can-i-decide-maintenance-frequency}

サポートに連絡してメンテナンスウィンドウをスケジュールしてください。最低でも週に1回の更新計画が期待されます。

## 可視性 {#observability}

### 組み込みの監視ツール {#built-in-monitoring-tools}

#### 可視性ダッシュボード {#observability-dashboard}

ClickHouse Cloudには、メモリ使用量、クエリレート、I/Oなどのメトリクスを表示する高度な可視性ダッシュボードが含まれています。これは、ClickHouse CloudのWebコンソールインターフェースの**監視**セクションでアクセスできます。

<br />

<img src={byoc3}
    alt='Observability dashboard'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### 高度なダッシュボード {#advanced-dashboard}

`system.metrics`、`system.events`、`system.asynchronous_metrics`などのシステムテーブルからのメトリクスを使用して、サーバーのパフォーマンスおよびリソース利用状況を詳細に監視するダッシュボードをカスタマイズできます。

<br />

<img src={byoc4}
    alt='Advanced dashboard'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### Prometheus統合 {#prometheus-integration}

ClickHouse Cloudは、監視用のメトリクスをスクリーピングするために使用できるPrometheusエンドポイントを提供します。これにより、GrafanaやDatadog等のツールと統合して表示できます。

**HTTPSエンドポイント /metrics_all を介したサンプルリクエスト**

```bash
curl --user <username>:<password> https://i6ro4qarho.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud:8443/metrics_all
```

**サンプルレスポンス**

```bash

# HELP ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes The amount of bytes stored on disk `s3disk` in system database

# TYPE ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes gauge
ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes{hostname="c-jet-ax-16-server-43d5baj-0"} 62660929

# HELP ClickHouse_CustomMetric_NumberOfBrokenDetachedParts The number of broken detached parts

# TYPE ClickHouse_CustomMetric_NumberOfBrokenDetachedParts gauge
ClickHouse_CustomMetric_NumberOfBrokenDetachedParts{hostname="c-jet-ax-16-server-43d5baj-0"} 0

# HELP ClickHouse_CustomMetric_LostPartCount The age of the oldest mutation (in seconds)

# TYPE ClickHouse_CustomMetric_LostPartCount gauge
ClickHouse_CustomMetric_LostPartCount{hostname="c-jet-ax-16-server-43d5baj-0"} 0

# HELP ClickHouse_CustomMetric_NumberOfWarnings The number of warnings issued by the server. It usually indicates about possible misconfiguration

# TYPE ClickHouse_CustomMetric_NumberOfWarnings gauge
ClickHouse_CustomMetric_NumberOfWarnings{hostname="c-jet-ax-16-server-43d5baj-0"} 2

# HELP ClickHouseErrorMetric_FILE_DOESNT_EXIST FILE_DOESNT_EXIST

# TYPE ClickHouseErrorMetric_FILE_DOESNT_EXIST counter
ClickHouseErrorMetric_FILE_DOESNT_EXIST{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 1

# HELP ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE UNKNOWN_ACCESS_TYPE

# TYPE ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE counter
ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 8

# HELP ClickHouse_CustomMetric_TotalNumberOfErrors The total number of errors on server since the last restart

# TYPE ClickHouse_CustomMetric_TotalNumberOfErrors gauge
ClickHouse_CustomMetric_TotalNumberOfErrors{hostname="c-jet-ax-16-server-43d5baj-0"} 9
```

**認証**

ClickHouseのユーザー名とパスワードのペアを使用して認証できます。メトリクスをスクリーピングするために最小限の権限を持つ専用ユーザーを作成することをお勧めします。最低でも、レプリカ間の`system.custom_metrics`テーブルに対する`READ`権限が必要です。例えば：

```sql
GRANT REMOTE ON *.* TO scraping_user
GRANT SELECT ON system.custom_metrics TO scraping_user
```

**Prometheusの構成**

以下に示したのは、構成の一例です。`targets`エンドポイントは、ClickHouseサービスにアクセスするのと同じものです。

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

また、[このブログ投稿](https://clickhouse.com/blog/clickhouse-cloud-now-supports-prometheus-monitoring)および[ClickHouseのPrometheusセットアップドキュメント](/integrations/prometheus)もご覧ください。
