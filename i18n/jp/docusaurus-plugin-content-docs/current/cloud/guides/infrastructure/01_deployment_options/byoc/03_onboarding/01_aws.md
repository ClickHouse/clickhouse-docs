---
title: 'AWS 向け BYOC オンボーディング'
slug: /cloud/reference/byoc/onboarding/aws
sidebar_label: 'AWS'
keywords: ['BYOC', 'cloud', '独自クラウド', 'AWS']
description: 'ClickHouse を独自のクラウドインフラストラクチャ上にデプロイする方法'
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


## オンボーディングプロセス

お客様は、[こちら](https://clickhouse.com/cloud/bring-your-own-cloud) からお問い合わせいただくことで、オンボーディングプロセスを開始できます。専用の AWS アカウントと、利用予定のリージョンをあらかじめご用意いただく必要があります。現時点では、ClickHouse Cloud がサポートしているリージョンでのみ BYOC サービスを起動できます。

### AWS アカウントの準備

ClickHouse BYOC デプロイメントをホストするために、より高い分離を確保する目的で、専用の AWS アカウントを用意することを推奨します。ただし、共有アカウントや既存の VPC を使用することも可能です。詳細は、後述の *Setup BYOC Infrastructure* を参照してください。

このアカウントと組織の初期管理者のメールアドレスを用意したら、ClickHouse サポートまでお問い合わせください。

### BYOC セットアップの初期化

初期の BYOC セットアップは、CloudFormation テンプレートまたは Terraform モジュールのいずれかを使用して実行できます。どちらの方法でも同じ IAM ロールが作成され、ClickHouse Cloud からの BYOC コントローラーがインフラストラクチャを管理できるようになります。なお、ClickHouse の実行に必要な S3、VPC、およびコンピューティングリソースは、この初期セットアップには含まれません。

#### CloudFormation テンプレート

[BYOC CloudFormation テンプレート](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml)

#### Terraform モジュール

[BYOC Terraform モジュール](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz)

```hcl
module "clickhouse_onboarding" {
  source   = "https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz"
  byoc_env = "production"
}
```

{/* TODO: セルフサービス型オンボーディングが実装されたら、残りのオンボーディング手順のスクリーンショットを追加する。 */ }

### BYOC インフラストラクチャのセットアップ

CloudFormation スタックを作成すると、クラウドコンソールから S3、VPC、EKS クラスターを含むインフラストラクチャのセットアップを求められます。この段階で決定しなければならない設定がいくつかあり、後から変更することはできません。具体的には次のとおりです。

* **使用するリージョン**: ClickHouse Cloud が提供している[パブリックリージョン](/cloud/reference/supported-regions)のいずれか 1 つを選択します。
* **BYOC 用の VPC CIDR 範囲**: 既定では、BYOC VPC の CIDR 範囲として `10.0.0.0/16` を使用します。別アカウントとの VPC ピアリングを行う予定がある場合は、CIDR 範囲が重複しないようにしてください。必要なワークロードを収容できるよう、BYOC 用に最小でも `/22` のサイズを持つ適切な CIDR 範囲を割り当ててください。
* **BYOC VPC のアベイラビリティーゾーン**: VPC ピアリングを利用する予定がある場合、送信元アカウントと BYOC アカウント間でアベイラビリティーゾーンを揃えると、AZ 間トラフィックのコスト削減に役立ちます。AWS では、アベイラビリティーゾーンのサフィックス (`a, b, c`) は、アカウントごとに異なる物理ゾーン ID を表すことがあります。詳細については [AWS ガイド](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html)を参照してください。

#### お客様管理の VPC

既定では、ClickHouse Cloud は BYOC デプロイメントにおいて分離性を高めるため、専用の VPC をプロビジョニングします。ただし、アカウント内に既存の VPC がある場合は、それを利用することも可能です。その場合は特定の設定が必要となり、ClickHouse Support を通じて調整する必要があります。

**既存の VPC を構成する**

1. ClickHouse Cloud が使用できるように、少なくとも 3 つの異なるアベイラビリティーゾーンにまたがって、合計 3 つ以上のプライベートサブネットを割り当てます。
2. 各サブネットには、ClickHouse デプロイメントに十分な IP アドレスを確保するため、最小でも `/23` (例: 10.0.0.0/23) の CIDR 範囲を設定してください。
3. 適切なロードバランサー構成を有効にするため、各サブネットに `kubernetes.io/role/internal-elb=1` というタグを追加します。

<br />

<Image img={byoc_subnet_1} size="lg" alt="BYOC VPC サブネット" background="black" />

<br />

<br />

<Image img={byoc_subnet_2} size="lg" alt="BYOC VPC サブネットのタグ" background="black" />

<br />

4. S3 ゲートウェイエンドポイントを構成する\
   VPC にまだ S3 ゲートウェイエンドポイントが構成されていない場合は、VPC と Amazon S3 間のセキュアでプライベートな通信を有効にするために、1 つ作成する必要があります。このエンドポイントにより、ClickHouse のサービスはパブリックインターネットを経由せずに S3 にアクセスできます。構成例については、以下のスクリーンショットを参照してください。

<br />


<Image img={byoc_s3_endpoint} size="lg" alt="BYOC S3 エンドポイント" background='black'/>

<br />

**ClickHouse サポートへの連絡**  
次の情報を記載してサポートチケットを作成します:

* AWS アカウント ID
* サービスをデプロイしたい AWS リージョン
* VPC ID
* ClickHouse 用に割り当てたプライベートサブネット ID
* これらのサブネットが属しているアベイラビリティゾーン

### オプション: VPC ピアリングのセットアップ {#optional-setup-vpc-peering}

ClickHouse BYOC の VPC ピアリングを作成または削除するには、次の手順に従います:

#### ステップ 1: ClickHouse BYOC 用のプライベートロードバランサーを有効化する {#step-1-enable-private-load-balancer-for-clickhouse-byoc}
ClickHouse サポートに連絡し、プライベートロードバランサーの有効化を依頼します。

#### ステップ 2 ピアリング接続を作成する {#step-2-create-a-peering-connection}
1. ClickHouse BYOC アカウントで VPC ダッシュボードに移動します。
2. 「Peering Connections」を選択します。
3. 「Create Peering Connection」をクリックします。
4. VPC Requester に ClickHouse の VPC ID を設定します。
5. VPC Accepter に対象 VPC ID を設定します（必要に応じて別アカウントを選択）。
6. 「Create Peering Connection」をクリックします。

<br />

<Image img={byoc_vpcpeering} size="lg" alt="BYOC ピアリング接続の作成" border />

<br />

#### ステップ 3 ピアリング接続リクエストを承認する {#step-3-accept-the-peering-connection-request}
ピアリング先アカウントの (VPC -> Peering connections -> Actions -> Accept request) ページに移動し、この VPC ピアリングリクエストを承認します。

<br />

<Image img={byoc_vpcpeering2} size="lg" alt="BYOC ピアリング接続の承認" border />

<br />

#### ステップ 4 ClickHouse VPC のルートテーブルに宛先を追加する {#step-4-add-destination-to-clickhouse-vpc-route-tables}
ClickHouse BYOC アカウントで、
1. VPC ダッシュボードで「Route Tables」を選択します。
2. ClickHouse の VPC ID を検索し、プライベートサブネットに関連付けられている各ルートテーブルを編集します。
3. 「Routes」タブの「Edit」ボタンをクリックします。
4. 「Add another route」をクリックします。
5. Destination に対象 VPC の CIDR 範囲を入力します。
6. Target に「Peering Connection」と、そのピアリング接続の ID を選択します。

<br />

<Image img={byoc_vpcpeering3} size="lg" alt="BYOC ルートテーブルの追加" border />

<br />

#### ステップ 5 対象 VPC のルートテーブルに宛先を追加する {#step-5-add-destination-to-the-target-vpc-route-tables}
ピアリング先の AWS アカウントで、
1. VPC ダッシュボードで「Route Tables」を選択します。
2. 対象 VPC ID を検索します。
3. 「Routes」タブの「Edit」ボタンをクリックします。
4. 「Add another route」をクリックします。
5. Destination に ClickHouse VPC の CIDR 範囲を入力します。
6. Target に「Peering Connection」と、そのピアリング接続の ID を選択します。

<br />

<Image img={byoc_vpcpeering4} size="lg" alt="BYOC ルートテーブルの追加" border />

<br />

#### ステップ 6: セキュリティグループを編集してピアリングされた VPC からのアクセスを許可する {#step-6-edit-security-group-to-allow-peered-vpc-access}
ClickHouse BYOC アカウントで、ピアリングされた VPC からのトラフィックを許可するように Security Group の設定を更新する必要があります。ピアリングされた VPC の CIDR 範囲を含むインバウンドルールの追加を依頼するため、ClickHouse サポートに連絡してください。

---
これで、ピアリングされた VPC から ClickHouse サービスにアクセスできるようになります。

ClickHouse にプライベートアクセスするために、ユーザーのピアリングされた VPC からのセキュアな接続性を提供するプライベートロードバランサーとエンドポイントがプロビジョニングされます。プライベートエンドポイントは、パブリックエンドポイントの形式に `-private` というサフィックスを付与したものになります。例:
- **パブリックエンドポイント**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
- **プライベートエンドポイント**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

任意ですが、ピアリングが正常に機能していることを確認した後に、ClickHouse BYOC のパブリックロードバランサーの削除を依頼できます。



## アップグレードプロセス {#upgrade-process}

ClickHouse データベースバージョンのアップグレード、ClickHouse Operator、EKS などのコンポーネントを含め、ソフトウェアを定期的にアップグレードしています。

ローリングアップグレードやローリングリスタートなど、可能な限りシームレスなアップグレードを目指していますが、ClickHouse のバージョン変更や EKS ノードのアップグレードなど、一部の作業はサービスに影響を与える可能性があります。お客様はメンテナンスウィンドウ（例: 毎週火曜日 午前 1:00 PDT）を指定でき、その時間帯にのみこうしたアップグレードが実施されるようにできます。

:::note
メンテナンスウィンドウは、セキュリティおよび脆弱性修正には適用されません。これらは通常のスケジュール外のアップグレードとして対応し、運用への影響を最小限に抑えられるよう、適切な時間を調整するためのタイムリーなコミュニケーションを行います。
:::



## CloudFormation IAM ロール {#cloudformation-iam-roles}

### ブートストラップ IAM ロール {#bootstrap-iam-role}

ブートストラップ IAM ロールには、次の権限があります。

- **EC2 および VPC の操作**: VPC と EKS クラスターをセットアップするために必要です。
- **S3 の操作（例: `s3:CreateBucket`）**: ClickHouse BYOC ストレージ用のバケットを作成するために必要です。
- **`route53:*` 権限**: External-DNS が Route 53 内のレコードを設定するために必要です。
- **IAM の操作（例: `iam:CreatePolicy`）**: コントローラーが追加のロールを作成するために必要です（詳細は次のセクションを参照してください）。
- **EKS の操作**: 名前が `clickhouse-cloud` プレフィックスで始まるリソースに限定されます。

### コントローラーによって作成される追加の IAM ロール {#additional-iam-roles-created-by-the-controller}

CloudFormation で作成される `ClickHouseManagementRole` に加えて、コントローラーは複数の追加ロールを作成します。

これらのロールは、顧客の EKS クラスター内で動作するアプリケーションによって引き受けられます。
- **State Exporter Role**
  - ClickHouse Cloud にサービスのヘルス情報を報告する ClickHouse コンポーネントです。
  - ClickHouse Cloud が所有する SQS キューへ書き込む権限が必要です。
- **Load-Balancer Controller**
  - 標準的な AWS ロードバランサーコントローラーです。
  - ClickHouse サービス向けのボリュームを管理する EBS CSI Controller です。
- **External-DNS**
  - DNS 設定を Route 53 に伝搬します。
- **Cert-Manager**
  - BYOC サービスドメイン向けの TLS 証明書をプロビジョニングします。
- **Cluster Autoscaler**
  - 必要に応じてノードグループのサイズを調整します。

**K8s-control-plane** ロールと **k8s-worker** ロールは、AWS EKS サービスによって引き受けられることを意図したものです。

最後に、**`data-plane-mgmt`** は、ClickHouse Cloud コントロールプレーンコンポーネントが `ClickHouseCluster` や Istio Virtual Service/Gateway などの必要なカスタムリソースを調整できるようにします。



## ネットワーク境界 {#network-boundaries}

このセクションでは、顧客の BYOC VPC との間を流れるさまざまなネットワークトラフィックについて説明します。

- **Inbound**: 顧客の BYOC VPC に入ってくるトラフィック。
- **Outbound**: 顧客の BYOC VPC を起点として外部の宛先に送信されるトラフィック。
- **Public**: パブリックインターネットからアクセス可能なネットワークエンドポイント。
- **Private**: VPC ピアリング、VPC Private Link、Tailscale などのプライベート接続経由でのみアクセス可能なネットワークエンドポイント。

**Istio イングレスは AWS NLB の背後にデプロイされており、ClickHouse クライアントトラフィックを受け付けます。**

*Inbound, Public (Private にすることも可能)*

Istio イングレスゲートウェイは TLS を終端します。Let's Encrypt を用いて CertManager によりプロビジョニングされた証明書は、EKS クラスター内の Secret として保存されます。Istio と ClickHouse は同じ VPC 内に存在するため、それらの間のトラフィックは [AWS によって暗号化されます](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/encrypting-data-at-rest-and--in-transit.html#:~:text=All%20network%20traffic%20between%20AWS,supported%20Amazon%20EC2%20instance%20types)。

デフォルトでは、イングレスは IP 許可リストによるフィルタリング付きでパブリックに公開されています。顧客は VPC ピアリングを構成してプライベート接続にし、パブリック接続を無効化できます。アクセスを制限するため、[IP フィルター](/cloud/security/setting-ip-filters) の設定を強く推奨します。

### アクセスのトラブルシューティング {#troubleshooting-access}

*Inbound, Public (Private にすることも可能)*

ClickHouse Cloud のエンジニアは、Tailscale を介したトラブルシューティング用アクセスを必要とします。彼らには、BYOC デプロイメント向けにジャストインタイムの証明書ベース認証がプロビジョニングされます。

### Billing scraper {#billing-scraper}

*Outbound, Private*

Billing scraper は ClickHouse から課金データを収集し、ClickHouse Cloud が所有する S3 バケットに送信します。

これは ClickHouse サーバーコンテナのサイドカーとして動作し、CPU とメモリのメトリクスを定期的にスクレイピングします。同一リージョン内のリクエストは VPC ゲートウェイサービスエンドポイント経由でルーティングされます。

### アラート {#alerts}

*Outbound, Public*

AlertManager は、顧客の ClickHouse クラスターの状態が異常な場合に、ClickHouse Cloud へアラートを送信するよう構成されています。

メトリクスとログは顧客の BYOC VPC 内に保存されます。ログは現在、ローカルの EBS に保存されています。今後のアップデートでは、BYOC VPC 内の ClickHouse サービスである LogHouse に保存される予定です。メトリクスは Prometheus と Thanos のスタックを使用し、BYOC VPC 内にローカル保存されます。

### サービス状態 {#service-state}

*Outbound*

State Exporter は、ClickHouse のサービス状態情報を ClickHouse Cloud が所有する SQS に送信します。
