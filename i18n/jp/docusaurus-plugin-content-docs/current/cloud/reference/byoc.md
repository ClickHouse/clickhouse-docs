---
'title': 'BYOC (Bring Your Own Cloud) for AWS'
'slug': '/cloud/reference/byoc'
'sidebar_label': 'BYOC (Bring Your Own Cloud)'
'keywords':
- 'BYOC'
- 'cloud'
- 'bring your own cloud'
'description': 'Deploy ClickHouse on your own cloud infrastructure'
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


## 概要 {#overview}

BYOC (Bring Your Own Cloud) を使用すると、独自のクラウドインフラストラクチャに ClickHouse Cloud をデプロイできます。これは、ClickHouse Cloud のマネージドサービスを利用することを妨げる特定の要件や制約がある場合に便利です。

**アクセスをご希望の場合は、[お問い合わせ](https://clickhouse.com/cloud/bring-your-own-cloud)ください。** 詳細情報については、[利用規約](https://clickhouse.com/legal/agreements/terms-of-service)をご参照ください。

BYOCは現在、AWS のみサポートされています。 GCP および Azure の待機リストには、[こちらから](https://clickhouse.com/cloud/bring-your-own-cloud)参加できます。

:::note
BYOCは大規模なデプロイメント専用に設計されており、顧客に対して契約を締結することが求められます。
:::

## 用語集 {#glossary}

- **ClickHouse VPC:** ClickHouse Cloud 所有の VPC です。
- **Customer BYOC VPC:** 顧客のクラウドアカウントが所有し、ClickHouse Cloud によってプロビジョニングおよび管理される VPC で、ClickHouse Cloud BYOC デプロイメント専用です。
- **Customer VPC:** 顧客のクラウドアカウントによって所有され、Customer BYOC VPC に接続が必要なアプリケーション用の他の VPC です。

## アーキテクチャ {#architecture}

メトリクスとログは、顧客の BYOC VPC 内に保存されます。ログは現在、EBS 内にローカルで保存されています。将来的な更新では、ログは顧客の BYOC VPC 内の ClickHouse サービスである LogHouse に保存されます。メトリクスは、顧客の BYOC VPC 内にローカルに保存された Prometheus および Thanos スタックを介して実装されます。

<br />

<Image img={byoc1} size="lg" alt="BYOC アーキテクチャ" background='black'/>

<br />

## オンボーディングプロセス {#onboarding-process}

顧客は、[こちらから](https://clickhouse.com/cloud/bring-your-own-cloud) お問い合わせいただくことで、オンボーディングプロセスを開始できます。顧客は専用の AWS アカウントを持ち、使用するリージョンを把握している必要があります。現在、ClickHouse Cloud に対してサポートしているリージョンのみで BYOC サービスを起動できるようになっています。

### 専用の AWS アカウントを準備する {#prepare-a-dedicated-aws-account}

顧客は、ClickHouse BYOC デプロイメントのホスティング用に専用の AWS アカウントを準備する必要があります。これにより、より良い分離が確保されます。これと初期の組織管理者のメールを用いて、ClickHouse サポートに連絡することができます。

### CloudFormation テンプレートを適用する {#apply-cloudformation-template}

BYOC セットアップは、[CloudFormation スタック](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml)を介して初期化され、これにより BYOC コントローラーがインフラストラクチャを管理できるようにするのみのロールが作成されます。ClickHouse を実行するための S3、VPC、コンピュートリソースはこのスタックには含まれていません。

<!-- TODO: Add Screenshot for the rest of onboarding, once self-served onboarding is implemented. -->

### BYOC インフラストラクチャを設定する {#setup-byoc-infrastructure}

CloudFormation スタックを作成した後、クラウドコンソールから S3、VPC、および EKS クラスターを含むインフラストラクチャの設定が求められます。この段階で特定の設定を決定する必要があります。なぜなら、後から変更することができないからです。具体的には：

- **使用したいリージョン**: ClickHouse Cloud のために用意された任意の[公開リージョン](/cloud/reference/supported-regions)から選択できます。
- **BYOC の VPC CIDR 範囲**: デフォルトでは、BYOC VPC CIDR 範囲には `10.0.0.0/16` を使用します。別のアカウントとの VPC ピアリングを使用する予定がある場合は、CIDR 範囲が重複しないようにしてください。BYOC 用に適切な CIDR 範囲を割り当て、必要なワークロードを収容できる最小サイズである `/22` を使用してください。
- **BYOC VPC のアベイラビリティゾーン**: VPC ピアリングを使用する場合、ソースアカウントと BYOC アカウント間でアベイラビリティゾーンを合わせることで、クロス AZ トラフィックコストを削減できます。AWS では、アベイラビリティゾーンのサフィックス（`a, b, c`）はアカウント間で異なる物理ゾーン ID を表す場合があります。詳細は[AWS ガイド](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html)を参照してください。

### オプション: VPC ピアリングを設定する {#optional-setup-vpc-peering}

ClickHouse BYOC のために VPC ピアリングを作成または削除するには、以下の手順に従います：

#### ステップ 1 ClickHouse BYOC のためにプライベートロードバランサーを有効にする {#step-1-enable-private-load-balancer-for-clickhouse-byoc}
ClickHouse サポートに連絡してプライベートロードバランサーを有効にしてください。

#### ステップ 2 ピアリング接続を作成する {#step-2-create-a-peering-connection}
1. ClickHouse BYOC アカウントの VPC ダッシュボードに移動します。
2. ピアリング接続を選択します。
3. ピアリング接続を作成するをクリックします。
4. VPC リクエスターを ClickHouse VPC ID に設定します。
5. VPC アクセプターをターゲット VPC ID に設定します。（該当する場合は他のアカウントを選択してください）
6. ピアリング接続を作成するをクリックします。

<br />

<Image img={byoc_vpcpeering} size="lg" alt="BYOC ピアリング接続の作成" border />

<br />

#### ステップ 3 ピアリング接続要求を承認する {#step-3-accept-the-peering-connection-request}
ピアリングアカウントに移動し、(VPC -> ピアリング接続 -> アクション -> 要求を承認) ページで顧客はこの VPC ピアリング要求を承認できます。

<br />

<Image img={byoc_vpcpeering2} size="lg" alt="BYOC ピアリング接続の承認" border />

<br />

#### ステップ 4 ClickHouse VPC ルートテーブルに宛先を追加する {#step-4-add-destination-to-clickhouse-vpc-route-tables}
ClickHouse BYOC アカウントで、
1. VPC ダッシュボードのルートテーブルを選択します。
2. ClickHouse VPC ID を検索します。プライベートサブネットに関連付けられた各ルートテーブルを編集します。
3. ルートタブの下にある編集ボタンをクリックします。
4. 別のルートを追加をクリックします。
5. 宛先の CIDR 範囲にターゲット VPC の CIDR 範囲を入力します。
6. 「ピアリング接続」を選択し、ターゲットのピアリング接続 ID を選択します。

<br />

<Image img={byoc_vpcpeering3} size="lg" alt="BYOC ルートテーブルに追加" border />

<br />

#### ステップ 5 ターゲット VPC ルートテーブルに宛先を追加する {#step-5-add-destination-to-the-target-vpc-route-tables}
ピアリングされた AWS アカウントで、
1. VPC ダッシュボードのルートテーブルを選択します。
2. ターゲット VPC ID を検索します。
3. ルートタブの下にある編集ボタンをクリックします。
4. 別のルートを追加をクリックします。
5. 宛先に ClickHouse VPC の CIDR 範囲を入力します。
6. 「ピアリング接続」を選択し、ターゲットのピアリング接続 ID を選択します。

<br />

<Image img={byoc_vpcpeering4} size="lg" alt="BYOC ルートテーブルに追加" border />

<br />

#### ステップ 6 ピアード VPC アクセスを許可するためにセキュリティグループを編集する {#step-6-edit-security-group-to-allow-peered-vpc-access}
ClickHouse BYOC アカウントで、
1. ClickHouse BYOC アカウントで、EC2 に移動し、infra-xx-xxx-ingress-private のような名前のプライベートロードバランサーを見つけます。

<br />

<Image img={byoc_plb} size="lg" alt="BYOC プライベートロードバランサー" border />

<br />

2. 詳細ページのセキュリティタブの下に、`k8s-istioing-istioing-xxxxxxxxx` のような命名パターンに従う関連付けられたセキュリティグループを見つけます。

<br />

<Image img={byoc_security} size="lg" alt="BYOC プライベートロードバランサーのセキュリティグループ" border />

<br />

3. このセキュリティグループのインバウンドルールを編集し、ピアリングされた VPC CIDR 範囲を追加します（または、必要に応じて必要な CIDR 範囲を指定します）。

<br />

<Image img={byoc_inbound} size="lg" alt="BYOC セキュリティグループのインバウンドルール" border />

<br />

---
ClickHouse サービスは、ピアリングされた VPC からアクセス可能になるはずです。

ClickHouse にプライベートにアクセスするために、ユーザーのピアリングされた VPC からの安全な接続のために、プライベートロードバランサーとエンドポイントがプロビジョニングされます。プライベートエンドポイントは、`-private` サフィックスを持つ公開エンドポイントフォーマットに従います。例えば：
- **公開エンドポイント**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
- **プライベートエンドポイント**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

オプションとして、ピアリングが正常に機能していることを確認した後、ClickHouse BYOC の公開ロードバランサーの削除をリクエストできます。

## アップグレードプロセス {#upgrade-process}

私たちは定期的にソフトウェアをアップグレードしており、ClickHouse データベースバージョンのアップグレード、ClickHouse オペレーター、EKS、その他のコンポーネントが含まれます。

シームレスなアップグレード（例：ローリングアップグレードや再起動）を目指していますが、ClickHouse バージョンの変更や EKS ノードのアップグレードに関してはサービスに影響を与える可能性があります。顧客はメンテナンスウィンドウ（例：毎週火曜日午前1:00 PDT）を指定でき、それによりそのようなアップグレードはスケジュールされた時間のみ実施されます。

:::note
メンテナンスウィンドウは、セキュリティや脆弱性の修正には適用されません。これらは、オフサイクルアップグレードとして扱われ、適切な時間を調整し業務への影響を最小限に抑えるための迅速なコミュニケーションが行われます。
:::

## CloudFormation IAM ロール {#cloudformation-iam-roles}

### ブートストラップ IAM ロール {#bootstrap-iam-role}

ブートストラップ IAM ロールには以下の権限があります：

- **EC2 および VPC 操作**: VPC および EKS クラスターの設定に必要です。
- **S3 操作 (例：`s3:CreateBucket`)**: ClickHouse BYOC ストレージ用のバケットを作成するために必要です。
- **`route53:*` 権限**: Route 53 にレコードを構成するための外部 DNS に必要です。
- **IAM 操作 (例：`iam:CreatePolicy`)**: コントローラーが追加のロールを作成するために必要です（詳細は次のセクションを参照）。
- **EKS 操作**: `clickhouse-cloud` プレフィックスで始まる名前のリソースに制限されます。

### コントローラーによって作成される追加の IAM ロール {#additional-iam-roles-created-by-the-controller}

CloudFormation を介して作成された `ClickHouseManagementRole` に加えて、コントローラーはさらにいくつかのロールを作成します。

これらのロールは、顧客の EKS クラスター内で実行されているアプリケーションによって想定されます：
- **State Exporter Role**
  - ClickHouse コンポーネントが ClickHouse Cloud にサービスのヘルス情報を報告します。
  - ClickHouse Cloud 所有の SQS キューに書き込む権限が必要です。
- **Load-Balancer Controller**
  - 標準の AWS ロードバランサーコントローラーです。
  - ClickHouse サービス用ボリュームを管理するための EBS CSI コントローラーです。
- **External-DNS**
  - DNS 構成を Route 53 に配布します。
- **Cert-Manager**
  - BYOC サービスドメイン用の TLS 証明書をプロビジョニングします。
- **Cluster Autoscaler**
  - 必要に応じてノードグループのサイズを調整します。

**K8s-control-plane** および **k8s-worker** ロールは AWS EKS サービスによって想定されます。

最後に、**`data-plane-mgmt`** により ClickHouse Cloud コントロールプレーンコンポーネントは、`ClickHouseCluster` および Istio の仮想サービス/ゲートウェイのような必要なカスタムリソースを調整できるようになります。

## ネットワーク境界 {#network-boundaries}

このセクションでは、顧客 BYOC VPC へのネットワークトラフィックと顧客 BYOC VPC からのトラフィックの異なる形式について説明します：

- **インバウンド**: 顧客 BYOC VPC に入ってくるトラフィック。
- **アウトバウンド**: 顧客 BYOC VPC から発生し、外部の宛先に送信されるトラフィック。
- **パブリック**: 公共のインターネットからアクセス可能なネットワークエンドポイント。
- **プライベート**: VPC ピアリングや VPC プライベートリンク、Tailscale のようなプライベート接続を介してのみアクセス可能なネットワークエンドポイント。

**Istio ingress は AWS NLB の背後にデプロイされ、ClickHouse クライアントトラフィックを受け入れます。**

*インバウンド、パブリック (プライベートとなる場合もある)*

Istio ingress ゲートウェイは TLS を終了します。Let's Encrypt によって CertManager でプロビジョニングされた証明書は、EKS クラスター内のシークレットとして保存されます。Istio と ClickHouse 間のトラフィックは[AWS](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/encrypting-data-at-rest-and--in-transit.html#:~:text=All%20network%20traffic%20between%20AWS,supported%20Amazon%20EC2%20instance%20types) によって暗号化されており、同じ VPC 内に存在するためです。

デフォルトでは、インバウンドは IP アロウリストフィルタリングでパブリックにアクセス可能です。顧客は VPC ピアリングを構成してプライベートにし、公共の接続を無効にすることができます。[IP フィルター](/cloud/security/setting-ip-filters)を設定してアクセスを制限することを強くお勧めします。

### アクセスのトラブルシューティング {#troubleshooting-access}

*インバウンド、パブリック (プライベートとなる場合もある)*

ClickHouse Cloud エンジニアは Tailscale 経由でトラブルシューティングアクセスを必要とします。彼らは BYOC デプロイメントのために、Just-in-Time の証明書ベースの認証をプロビジョニングされています。

### 請求スクリーパー {#billing-scraper}

*アウトバウンド、プライベート*

請求スクリーパーは ClickHouse から請求データを収集し、それを ClickHouse Cloud 所有の S3 バケットに送信します。

これは ClickHouse サーバーコンテナと一緒にサイドカーとして実行され、定期的に CPU およびメモリメトリクスをスクレイピングします。同じリージョン内のリクエストは、VPC ゲートウェイサービスエンドポイントを介してルーティングされます。

### アラート {#alerts}

*アウトバウンド、パブリック*

AlertManager は、顧客の ClickHouse クラスターが正常でない場合に ClickHouse Cloud にアラートを送信するように構成されています。

メトリクスとログは、顧客の BYOC VPC に保存されます。ログは現在、EBS 内でローカルに保存されています。将来的な更新では、BYOC VPC 内の ClickHouse サービスである LogHouse に保存される予定です。メトリクスは、BYOC VPC 内でローカルに保存された Prometheus および Thanos スタックを利用します。

### サービス状態 {#service-state}

*アウトバウンド*

State Exporter は、ClickHouse サービス状態情報を ClickHouse Cloud 所有の SQS に送信します。

## 機能 {#features}

### サポートされている機能 {#supported-features}

- **SharedMergeTree**: ClickHouse Cloud と BYOC は同じバイナリと構成を使用しています。したがって、SharedMergeTree などの ClickHouse コアのすべての機能が BYOC でサポートされています。
- **サービス状態を管理するためのコンソールアクセス**:
  - 開始、停止、および終了などの操作をサポートします。
  - サービスと状態を表示できます。
- **バックアップと復元。**
- **手動の垂直および水平方向のスケーリング。**
- **アイドル。**
- **倉庫**: コンピュートとコンピュートの分離
- **Tailscale を介したゼロトラストネットワーク。**
- **モニタリング**:
  - クラウドコンソールには、サービスヘルスのモニタリング用の組み込みヘルスダッシュボードが含まれています。
  - Prometheus、Grafana、Datadog との中央集計モニタリング用の Prometheus スクレイピング。設定手順については、[Prometheus ドキュメント](/integrations/prometheus)を参照してください。
- **VPC ピアリング。**
- **統合**: [このページ](/integrations)に完全なリストがあります。
- **安全な S3。**
- **[AWS PrivateLink](https://aws.amazon.com/privatelink/)。**

### 計画中の機能 (現在サポートされていません) {#planned-features-currently-unsupported}

- [AWS KMS](https://aws.amazon.com/kms/) 別名 CMEK (顧客管理暗号化キー)
- インジェスト用の ClickPipes
- オートスケーリング
- MySQL インターフェース

## FAQ {#faq}

### コンピュート {#compute}

#### この単一の EKS クラスターに複数のサービスを作成できますか？ {#can-i-create-multiple-services-in-this-single-eks-cluster}

はい。インフラストラクチャは、すべての AWS アカウントとリージョンの組み合わせについて一度だけプロビジョニングされる必要があります。

### BYOC のサポートリージョンはどこですか？ {#which-regions-do-you-support-for-byoc}

BYOC は ClickHouse Cloud と同じセットの [リージョン](/cloud/reference/supported-regions#aws-regions ) をサポートしています。

#### リソースのオーバーヘッドはありますか？ ClickHouse インスタンス以外のサービスを実行するために必要なリソースは何ですか？ {#will-there-be-some-resource-overhead-what-are-the-resources-needed-to-run-services-other-than-clickhouse-instances}

ClickHouse インスタンス (ClickHouse サーバーと ClickHouse Keeper) の他に、`clickhouse-operator`、`aws-cluster-autoscaler`、Istio などのサービスが実行され、モニタリングスタックも実行されます。

現在、これらのワークロードを実行するために、専用のノードグループに 3 つの m5.xlarge ノード (各 AZ に 1 つ) を持っています。

### ネットワークとセキュリティ {#network-and-security}

#### 設定完了後にインストール中に設定した権限を取り消すことはできますか？ {#can-we-revoke-permissions-set-up-during-installation-after-setup-is-complete}

現時点ではこれは不可能です。

#### ClickHouse エンジニアがトラブルシューティングのために顧客インフラにアクセスするための将来のセキュリティコントロールを検討していますか？ {#have-you-considered-some-future-security-controls-for-clickhouse-engineers-to-access-customer-infra-for-troubleshooting}

はい。顧客がエンジニアのクラスターアクセスを承認できる顧客制御のメカニズムの実装は私たちのロードマップ上にあります。現時点では、エンジニアはクラスタへの十分なアクセスを得るために、内部のエスカレーションプロセスを経なければなりません。これは、私たちのセキュリティチームによって記録され、監査されています。

#### 作成された VPC IP 範囲のサイズはどのくらいですか？ {#what-is-the-size-of-the-vpc-ip-range-created}

デフォルトでは、BYOC VPC には `10.0.0.0/16` を使用します。将来的なスケーリング可能性のために最低でも /22 を予約することをお勧めしますが、サイズを制限したい場合は、30 サーバーポッドに制限される可能性が高い場合に限り /23 を使用することが可能です。

#### メンテナンスの頻度を決定できますか？ {#can-i-decide-maintenance-frequency}

サポートに連絡してメンテナンスウィンドウをスケジュールしてください。少なくとも週間での更新スケジュールを期待してください。

## 可視性 {#observability}

### 組み込みのモニタリングツール {#built-in-monitoring-tools}

#### 可視性ダッシュボード {#observability-dashboard}

ClickHouse Cloud は、メモリ使用量、クエリレート、I/O などのメトリクスを表示する高度な可視性ダッシュボードを備えています。これは、ClickHouse Cloud ウェブコンソールインターフェースの **モニタリング** セクションからアクセスできます。

<br />

<Image img={byoc3} size="lg" alt="可視性ダッシュボード" border />

<br />

#### 高度なダッシュボード {#advanced-dashboard}

`system.metrics`、`system.events`、`system.asynchronous_metrics` などのシステムテーブルからのメトリクスを使用してダッシュボードをカスタマイズし、サーバーのパフォーマンスやリソース利用率を詳細に監視できます。

<br />

<Image img={byoc4} size="lg" alt="高度なダッシュボード" border />

<br />

#### Prometheus 統合 {#prometheus-integration}

ClickHouse Cloud は、モニタリング用のメトリクスをスクレイピングするために使用できる Prometheus エンドポイントを提供します。これにより、Grafana や Datadog などのツールと統合し、可視化を行うことができます。

**https エンドポイント /metrics_all を介したサンプルリクエスト**

```bash
curl --user <username>:<password> https://i6ro4qarho.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud:8443/metrics_all
```

**サンプルレスポンス**

```bash

# HELP ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes ディスク `s3disk` に保存されているバイト数

# TYPE ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes gauge
ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes{hostname="c-jet-ax-16-server-43d5baj-0"} 62660929

# HELP ClickHouse_CustomMetric_NumberOfBrokenDetachedParts 壊れたデタッチパーツの数

# TYPE ClickHouse_CustomMetric_NumberOfBrokenDetachedParts gauge
ClickHouse_CustomMetric_NumberOfBrokenDetachedParts{hostname="c-jet-ax-16-server-43d5baj-0"} 0

# HELP ClickHouse_CustomMetric_LostPartCount 最も古い変異の年齢 (秒)

# TYPE ClickHouse_CustomMetric_LostPartCount gauge
ClickHouse_CustomMetric_LostPartCount{hostname="c-jet-ax-16-server-43d5baj-0"} 0

# HELP ClickHouse_CustomMetric_NumberOfWarnings サーバーによって発行された警告の数。これは通常、誤った設定について示しています

# TYPE ClickHouse_CustomMetric_NumberOfWarnings gauge
ClickHouse_CustomMetric_NumberOfWarnings{hostname="c-jet-ax-16-server-43d5baj-0"} 2

# HELP ClickHouseErrorMetric_FILE_DOESNT_EXIST FILE_DOESNT_EXIST

# TYPE ClickHouseErrorMetric_FILE_DOESNT_EXIST counter
ClickHouseErrorMetric_FILE_DOESNT_EXIST{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 1

# HELP ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE UNKNOWN_ACCESS_TYPE

# TYPE ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE counter
ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 8

# HELP ClickHouse_CustomMetric_TotalNumberOfErrors 最後の再起動以降のサーバー上のエラーの合計数

# TYPE ClickHouse_CustomMetric_TotalNumberOfErrors gauge
ClickHouse_CustomMetric_TotalNumberOfErrors{hostname="c-jet-ax-16-server-43d5baj-0"} 9
```

**認証**

ClickHouse のユーザー名とパスワードのペアを使用して認証できます。メトリクスをスクレイピングするために最小限の権限を持つ専用ユーザーの作成をお勧めします。最小限、`system.custom_metrics` テーブルに対して `READ` 権限が必要です。例えば：

```sql
GRANT REMOTE ON *.* TO scraping_user
GRANT SELECT ON system.custom_metrics TO scraping_user
```

**Prometheus の設定**

以下は設定の例です。`targets` エンドポイントは、ClickHouse サービスにアクセスするために使用されるのと同じものです。

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

また、[このブログ投稿](https://clickhouse.com/blog/clickhouse-cloud-now-supports-prometheus-monitoring)および[ClickHouse 用の Prometheus 設定ドキュメント](/integrations/prometheus)もご覧ください。
