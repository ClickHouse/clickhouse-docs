---
title: 'AWS向けBYOCオンボーディング'
slug: /cloud/reference/byoc/onboarding/aws
sidebar_label: 'AWS'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'AWS']
description: '自社のクラウドインフラストラクチャにClickHouseをデプロイ'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_vpcpeering from '@site/static/images/cloud/reference/byoc-vpcpeering-1.png';
import byoc_vpcpeering2 from '@site/static/images/cloud/reference/byoc-vpcpeering-2.png';
import byoc_vpcpeering3 from '@site/static/images/cloud/reference/byoc-vpcpeering-3.png';
import byoc_vpcpeering4 from '@site/static/images/cloud/reference/byoc-vpcpeering-4.png';
import byoc_subnet_1 from '@site/static/images/cloud/reference/byoc-subnet-1.png';
import byoc_subnet_2 from '@site/static/images/cloud/reference/byoc-subnet-2.png';
import byoc_s3_endpoint from '@site/static/images/cloud/reference/byoc-s3-endpoint.png'


## オンボーディングプロセス {#onboarding-process}

お客様は[こちら](https://clickhouse.com/cloud/bring-your-own-cloud)からお問い合わせいただくことで、オンボーディングプロセスを開始できます。専用のAWSアカウントをご用意いただき、使用するリージョンを事前に決定しておく必要があります。現時点では、ClickHouse Cloudでサポートしているリージョンでのみ、BYOCサービスの起動が可能です。

### AWSアカウントの準備 {#prepare-an-aws-account}

ClickHouse BYOCデプロイメントをホストするための専用AWSアカウントを準備することで、より優れた分離性を確保できます。ただし、共有アカウントや既存のVPCを使用することも可能です。詳細については、以下の「_BYOCインフラストラクチャのセットアップ_」を参照してください。

このアカウントと初期組織管理者のメールアドレスをご用意の上、ClickHouseサポートまでお問い合わせください。

### BYOCセットアップの初期化 {#initialize-byoc-setup}

初期BYOCセットアップは、CloudFormationテンプレートまたはTerraformモジュールのいずれかを使用して実行できます。どちらの方法でも同じIAMロールが作成され、ClickHouse CloudのBYOCコントローラーがお客様のインフラストラクチャを管理できるようになります。なお、ClickHouseの実行に必要なS3、VPC、およびコンピュートリソースは、この初期セットアップには含まれません。

#### CloudFormationテンプレート {#cloudformation-template}

[BYOC CloudFormationテンプレート](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml)

#### Terraformモジュール {#terraform-module}

[BYOC Terraformモジュール](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz)

```hcl
module "clickhouse_onboarding" {
  source   = "https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz"
  byoc_env = "production"
}
```

<!-- TODO: Add Screenshot for the rest of onboarding, once self-served onboarding is implemented. -->

### BYOCインフラストラクチャのセットアップ {#setup-byoc-infrastructure}

CloudFormationスタックを作成した後、クラウドコンソールからS3、VPC、EKSクラスターを含むインフラストラクチャのセットアップが求められます。一部の設定はこの段階で決定する必要があり、後から変更することはできません。具体的には以下の通りです：

- **使用するリージョン**：ClickHouse Cloudで提供している[パブリックリージョン](/cloud/reference/supported-regions)のいずれかを選択できます。
- **BYOCのVPC CIDR範囲**：デフォルトでは、BYOC VPCのCIDR範囲として`10.0.0.0/16`を使用します。別のアカウントとのVPCピアリングを使用する予定がある場合は、CIDR範囲が重複しないようにしてください。必要なワークロードに対応するため、最小サイズ`/22`の適切なCIDR範囲をBYOCに割り当ててください。
- **BYOC VPCのアベイラビリティーゾーン**：VPCピアリングを使用する予定がある場合、ソースアカウントとBYOCアカウント間でアベイラビリティーゾーンを揃えることで、クロスAZトラフィックコストを削減できます。AWSでは、アベイラビリティーゾーンのサフィックス（`a, b, c`）がアカウント間で異なる物理ゾーンIDを表す場合があります。詳細については、[AWSガイド](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html)を参照してください。

#### お客様管理のVPC {#customer-managed-vpc}

デフォルトでは、ClickHouse CloudはBYOCデプロイメントでより優れた分離性を実現するために専用のVPCをプロビジョニングします。ただし、アカウント内の既存のVPCを使用することも可能です。これには特定の設定が必要であり、ClickHouseサポートを通じて調整する必要があります。

**既存のVPCの設定**

1. ClickHouse Cloudが使用できるように、3つの異なるアベイラビリティーゾーンにまたがる少なくとも3つのプライベートサブネットを割り当てます。
2. ClickHouseデプロイメントに十分なIPアドレスを提供するため、各サブネットが最小CIDR範囲`/23`（例：10.0.0.0/23）を持つようにします。
3. 適切なロードバランサー設定を有効にするため、各サブネットに`kubernetes.io/role/internal-elb=1`タグを追加します。

<br />

<Image img={byoc_subnet_1} size='lg' alt='BYOC VPCサブネット' background='black' />

<br />

<br />

<Image
  img={byoc_subnet_2}
  size='lg'
  alt='BYOC VPCサブネットタグ'
  background='black'
/>

<br />

4. S3ゲートウェイエンドポイントの設定
   VPCにS3ゲートウェイエンドポイントがまだ設定されていない場合は、VPCとAmazon S3間の安全でプライベートな通信を可能にするために作成する必要があります。このエンドポイントにより、ClickHouseサービスはパブリックインターネットを経由せずにS3にアクセスできます。設定例については、以下のスクリーンショットを参照してください。

<br />


<Image
  img={byoc_s3_endpoint}
  size='lg'
  alt='BYOC S3エンドポイント'
  background='black'
/>

<br />

**ClickHouseサポートへの連絡**  
以下の情報を含むサポートチケットを作成してください:

- AWSアカウントID
- サービスをデプロイするAWSリージョン
- VPC ID
- ClickHouse用に割り当てたプライベートサブネットID
- これらのサブネットが配置されているアベイラビリティーゾーン

### オプション: VPCピアリングの設定 {#optional-setup-vpc-peering}

ClickHouse BYOC用のVPCピアリングを作成または削除するには、以下の手順に従ってください:

#### ステップ1: ClickHouse BYOC用のプライベートロードバランサーを有効化 {#step-1-enable-private-load-balancer-for-clickhouse-byoc}

プライベートロードバランサーを有効化するには、ClickHouseサポートに連絡してください。

#### ステップ2: ピアリング接続の作成 {#step-2-create-a-peering-connection}

1. ClickHouse BYOCアカウントのVPCダッシュボードに移動します。
2. Peering Connectionsを選択します。
3. Create Peering Connectionをクリックします。
4. VPC RequesterをClickHouse VPC IDに設定します。
5. VPC Accepterをターゲット VPC IDに設定します。(該当する場合は別のアカウントを選択)
6. Create Peering Connectionをクリックします。

<br />

<Image
  img={byoc_vpcpeering}
  size='lg'
  alt='BYOCピアリング接続の作成'
  border
/>

<br />

#### ステップ3: ピアリング接続リクエストの承認 {#step-3-accept-the-peering-connection-request}

ピアリングアカウントに移動し、(VPC -> Peering connections -> Actions -> Accept request)ページでこのVPCピアリングリクエストを承認できます。

<br />

<Image
  img={byoc_vpcpeering2}
  size='lg'
  alt='BYOCピアリング接続の承認'
  border
/>

<br />

#### ステップ4: ClickHouse VPCルートテーブルへの宛先追加 {#step-4-add-destination-to-clickhouse-vpc-route-tables}

ClickHouse BYOCアカウントで、

1. VPCダッシュボードでRoute Tablesを選択します。
2. ClickHouse VPC IDを検索します。プライベートサブネットに関連付けられている各ルートテーブルを編集します。
3. RoutesタブのEditボタンをクリックします。
4. Add another routeをクリックします。
5. DestinationにターゲットVPCのCIDR範囲を入力します。
6. Targetに「Peering Connection」とピアリング接続のIDを選択します。

<br />

<Image img={byoc_vpcpeering3} size='lg' alt='BYOCルートテーブルの追加' border />

<br />

#### ステップ5: ターゲットVPCルートテーブルへの宛先追加 {#step-5-add-destination-to-the-target-vpc-route-tables}

ピアリングAWSアカウントで、

1. VPCダッシュボードでRoute Tablesを選択します。
2. ターゲットVPC IDを検索します。
3. RoutesタブのEditボタンをクリックします。
4. Add another routeをクリックします。
5. DestinationにClickHouse VPCのCIDR範囲を入力します。
6. Targetに「Peering Connection」とピアリング接続のIDを選択します。

<br />

<Image img={byoc_vpcpeering4} size='lg' alt='BYOCルートテーブルの追加' border />

<br />

#### ステップ6: ピアリングVPCアクセスを許可するためのセキュリティグループの編集 {#step-6-edit-security-group-to-allow-peered-vpc-access}

ClickHouse BYOCアカウントで、ピアリングVPCからのトラフィックを許可するためにセキュリティグループの設定を更新する必要があります。ピアリングVPCのCIDR範囲を含むインバウンドルールの追加を依頼するには、ClickHouseサポートに連絡してください。

---

これでClickHouseサービスがピアリングVPCからアクセス可能になります。

ClickHouseにプライベートアクセスするために、ユーザーのピアリングVPCからの安全な接続用にプライベートロードバランサーとエンドポイントがプロビジョニングされます。プライベートエンドポイントは、パブリックエンドポイントの形式に`-private`サフィックスを付けたものになります。例:

- **パブリックエンドポイント**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
- **プライベートエンドポイント**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

オプションとして、ピアリングが正常に動作していることを確認した後、ClickHouse BYOC用のパブリックロードバランサーの削除を依頼できます。


## アップグレードプロセス {#upgrade-process}

ClickHouseデータベースのバージョンアップグレード、ClickHouse Operator、EKS、その他のコンポーネントを含むソフトウェアを定期的にアップグレードしています。

シームレスなアップグレード(ローリングアップグレードや再起動など)を目指していますが、ClickHouseバージョンの変更やEKSノードのアップグレードなど、一部のアップグレードはサービスに影響を与える可能性があります。お客様はメンテナンスウィンドウ(例:毎週火曜日午前1時PDT)を指定することで、このようなアップグレードをスケジュールされた時間内にのみ実行することができます。

:::note
メンテナンスウィンドウはセキュリティおよび脆弱性の修正には適用されません。これらは定期外アップグレードとして処理され、適切な時間を調整し運用への影響を最小限に抑えるため、タイムリーなコミュニケーションが行われます。
:::


## CloudFormation IAMロール {#cloudformation-iam-roles}

### ブートストラップIAMロール {#bootstrap-iam-role}

ブートストラップIAMロールには以下の権限があります:

- **EC2およびVPC操作**: VPCおよびEKSクラスタのセットアップに必要です。
- **S3操作(例:`s3:CreateBucket`)**: ClickHouse BYOCストレージ用のバケット作成に必要です。
- **`route53:*`権限**: 外部DNSがRoute 53でレコードを設定するために必要です。
- **IAM操作(例:`iam:CreatePolicy`)**: コントローラが追加のロールを作成するために必要です(詳細は次のセクションを参照)。
- **EKS操作**: `clickhouse-cloud`プレフィックスで始まる名前のリソースに限定されます。

### コントローラによって作成される追加のIAMロール {#additional-iam-roles-created-by-the-controller}

CloudFormationで作成される`ClickHouseManagementRole`に加えて、コントローラはいくつかの追加ロールを作成します。

これらのロールは、顧客のEKSクラスタ内で実行されるアプリケーションによって引き受けられます:

- **State Exporterロール**
  - サービスヘルス情報をClickHouse Cloudに報告するClickHouseコンポーネント。
  - ClickHouse Cloudが所有するSQSキューへの書き込み権限が必要です。
- **Load-Balancer Controller**
  - 標準のAWSロードバランサーコントローラ。
  - ClickHouseサービス用のボリュームを管理するEBS CSI Controller。
- **External-DNS**
  - DNS設定をRoute 53に伝播します。
- **Cert-Manager**
  - BYOCサービスドメイン用のTLS証明書をプロビジョニングします。
- **Cluster Autoscaler**
  - 必要に応じてノードグループのサイズを調整します。

**K8s-control-plane**および**k8s-worker**ロールは、AWS EKSサービスによって引き受けられることを想定しています。

最後に、**`data-plane-mgmt`**は、ClickHouse Cloud Control Planeコンポーネントが`ClickHouseCluster`やIstio Virtual Service/Gatewayなどの必要なカスタムリソースを調整できるようにします。


## ネットワーク境界 {#network-boundaries}

このセクションでは、顧客のBYOC VPCとの間で発生するさまざまなネットワークトラフィックについて説明します：

- **インバウンド**: 顧客のBYOC VPCに入るトラフィック。
- **アウトバウンド**: 顧客のBYOC VPCから発信され、外部の宛先に送信されるトラフィック。
- **パブリック**: パブリックインターネットからアクセス可能なネットワークエンドポイント。
- **プライベート**: VPCピアリング、VPC Private Link、Tailscaleなどのプライベート接続を通じてのみアクセス可能なネットワークエンドポイント。

**Istio ingressは、ClickHouseクライアントトラフィックを受け入れるためにAWS NLBの背後にデプロイされています。**

_インバウンド、パブリック（プライベート可）_

Istio ingressゲートウェイはTLSを終端します。Let's Encryptを使用してCertManagerによってプロビジョニングされた証明書は、EKSクラスター内にシークレットとして保存されます。IstioとClickHouse間のトラフィックは、同じVPC内に存在するため[AWSによって暗号化](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/encrypting-data-at-rest-and--in-transit.html#:~:text=All%20network%20traffic%20between%20AWS,supported%20Amazon%20EC2%20instance%20types)されます。

デフォルトでは、ingressはIP許可リストフィルタリングを使用してパブリックにアクセス可能です。顧客はVPCピアリングを設定してプライベートにし、パブリック接続を無効にすることができます。アクセスを制限するために[IPフィルター](/cloud/security/setting-ip-filters)の設定を強く推奨します。

### トラブルシューティングアクセス {#troubleshooting-access}

_インバウンド、パブリック（プライベート可）_

ClickHouse Cloudのエンジニアは、Tailscale経由でトラブルシューティングアクセスを必要とします。BYOCデプロイメントに対しては、ジャストインタイムの証明書ベース認証がプロビジョニングされます。

### 課金スクレイパー {#billing-scraper}

_アウトバウンド、プライベート_

課金スクレイパーは、ClickHouseから課金データを収集し、ClickHouse Cloudが所有するS3バケットに送信します。

これはClickHouseサーバーコンテナと並行してサイドカーとして実行され、定期的にCPUとメモリのメトリクスをスクレイピングします。同一リージョン内のリクエストは、VPCゲートウェイサービスエンドポイントを経由してルーティングされます。

### アラート {#alerts}

_アウトバウンド、パブリック_

AlertManagerは、顧客のClickHouseクラスターが正常でない場合にClickHouse Cloudにアラートを送信するように設定されています。

メトリクスとログは顧客のBYOC VPC内に保存されます。ログは現在EBSにローカルで保存されています。今後のアップデートでは、BYOC VPC内のClickHouseサービスであるLogHouseに保存される予定です。メトリクスはPrometheusとThanosスタックを使用し、BYOC VPC内にローカルで保存されます。

### サービス状態 {#service-state}

_アウトバウンド_

State Exporterは、ClickHouseサービスの状態情報をClickHouse Cloudが所有するSQSに送信します。
