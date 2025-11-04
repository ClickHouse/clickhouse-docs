---
'title': 'AWSのBYOC (自分のクラウドを持ち込む)'
'slug': '/cloud/reference/byoc'
'sidebar_label': 'BYOC (自分のクラウドを持ち込む)'
'keywords':
- 'BYOC'
- 'cloud'
- 'bring your own cloud'
'description': '自分のクラウドインフラストラクチャ上にClickHouseをデプロイする'
'doc_type': 'reference'
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
import byoc_subnet_1 from '@site/static/images/cloud/reference/byoc-subnet-1.png';
import byoc_subnet_2 from '@site/static/images/cloud/reference/byoc-subnet-2.png';
import byoc_s3_endpoint from '@site/static/images/cloud/reference/byoc-s3-endpoint.png'


## 概要 {#overview}

BYOC (Bring Your Own Cloud) は、ClickHouse Cloud を自分自身のクラウドインフラストラクチャにデプロイすることを可能にします。これは、特定の要件や制約があり、ClickHouse Cloud のマネージドサービスを利用できない場合に便利です。

**アクセスをご希望の方は、[お問い合わせください](https://clickhouse.com/cloud/bring-your-own-cloud)。** 詳細は、[利用規約](https://clickhouse.com/legal/agreements/terms-of-service)を参照してください。

BYOC は現在、AWS のみでサポートされています。GCP および Azure の待機リストに参加するには、[こちら](https://clickhouse.com/cloud/bring-your-own-cloud)をクリックしてください。

:::note 
BYOC は大規模なデプロイメント向けに特別に設計されており、顧客はコミット契約に署名する必要があります。
:::

## 用語集 {#glossary}

- **ClickHouse VPC:** ClickHouse Cloud が所有する VPC。
- **顧客 BYOC VPC:** 顧客のクラウドアカウントが所有する VPC で、ClickHouse Cloud によってプロビジョニングおよび管理され、ClickHouse Cloud BYOC デプロイメントに専用されています。
- **顧客 VPC:** 顧客のクラウドアカウントが所有する他の VPC で、顧客 BYOC VPC に接続する必要のあるアプリケーションに使用されます。

## アーキテクチャ {#architecture}

メトリックとログは顧客の BYOC VPC 内に保存されます。ログは現在、EBS にローカルに保存されています。今後のアップデートでは、ログは顧客の BYOC VPC 内の ClickHouse サービスである LogHouse に保存される予定です。メトリックは、顧客の BYOC VPC 内にローカルに保存された Prometheus と Thanos スタックを介して実装されます。

<br />

<Image img={byoc1} size="lg" alt="BYOC アーキテクチャ" background='black'/>

<br />

## オンボーディングプロセス {#onboarding-process}

顧客は、[お問い合わせ](https://clickhouse.com/cloud/bring-your-own-cloud)を通じてオンボーディングプロセスを開始できます。顧客は専用の AWS アカウントを持ち、使用するリージョンを知っている必要があります。現時点では、ClickHouse Cloud がサポートしているリージョンでのみ BYOC サービスを起動することができます。

### AWS アカウントの準備 {#prepare-an-aws-account}

顧客は、ClickHouse BYOC デプロイメントをホスティングするために専用の AWS アカウントを準備することを推奨します。これにより、より良い隔離が確保されます。ただし、共有アカウントや既存の VPC を使用することも可能です。詳細は下記の *BYOC インフラストラクチャの設定* を参照してください。

このアカウントと初期の組織管理者のメールアドレスを使用して、ClickHouse サポートに連絡できます。

### BYOC セットアップの初期化 {#initialize-byoc-setup}

初期の BYOC セットアップは、CloudFormation テンプレートまたは Terraform モジュールを使用して実行できます。どちらのアプローチでも、ClickHouse Cloud の BYOC コントローラがインフラストラクチャを管理できるように、同じ IAM ロールが作成されます。ClickHouse を実行するために必要な S3、VPC、およびコンピューティングリソースは、この初期設定には含まれていないことに注意してください。

#### CloudFormation テンプレート {#cloudformation-template}

[BYOC CloudFormation テンプレート](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml)

#### Terraform モジュール {#terraform-module}

[BYOC Terraform モジュール](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz)

```hcl
module "clickhouse_onboarding" {
  source   = "https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz"
  byoc_env = "production"
}
```

<!-- TODO: Onboarding 残りのスクリーンショットを追加する。セルフサービスのオンボーディングが実装されたら。 -->

### BYOC インフラストラクチャの設定 {#setup-byoc-infrastructure}

CloudFormation スタックを作成した後、インフラストラクチャを設定するように求められます。これには S3、VPC、および EKS クラスターが含まれます。特定の設定はこの段階で決定する必要があります。後から変更できません。具体的には：

- **使用したいリージョン:** ClickHouse Cloud 用の任意の [公開リージョン](/cloud/reference/supported-regions) のいずれかを選択できます。
- **BYOC 用の VPC CIDR 範囲:** デフォルトでは、BYOC VPC CIDR 範囲に `10.0.0.0/16` を使用します。他のアカウントとの VPC ピアリングを行う予定の場合は、CIDR 範囲が重複しないように注意してください。BYOC 用に、必要なワークロードを収容できる最小サイズ `/22` の適切な CIDR 範囲を割り当ててください。
- **BYOC VPC のアベイラビリティゾーン:** VPC ピアリングを使用する予定の場合、ソースアカウントと BYOC アカウント間でアベイラビリティゾーンを揃えることで、クロス AZ トラフィックコストを削減できます。AWS では、アベイラビリティゾーンの接尾辞（`a, b, c`）は、アカウント間で異なる物理ゾーン ID を表す場合があります。詳細については、[AWS ガイド](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html)を参照してください。

#### 顧客管理 VPC {#customer-managed-vpc}
デフォルトでは、ClickHouse Cloud は BYOC デプロイメントのために専用の VPC をプロビジョニングします。ただし、アカウント内の既存の VPC を使用することもできます。これには特定の設定が必要で、ClickHouse サポートを通じて調整しなければなりません。

**既存の VPC の設定**
1. ClickHouse Cloud が使用するために、異なる 3 つのアベイラビリティゾーンにまたがって、少なくとも 3 つのプライベートサブネットを割り当ててください。
2. 各サブネットには、ClickHouse デプロイメントに十分な IP アドレスを提供するために、最小 CIDR 範囲 `/23`（例：10.0.0.0/23）を確保してください。
3. 各サブネットに `kubernetes.io/role/internal-elb=1` タグを追加して、適切なロードバランサーの設定を有効にしてください。

<br />

<Image img={byoc_subnet_1} size="lg" alt="BYOC VPC サブネット" background='black'/>

<br />

<br />

<Image img={byoc_subnet_2} size="lg" alt="BYOC VPC サブネットタグ" background='black'/>

<br />

4. S3 ゲートウェイエンドポイントを設定
VPC にすでに S3 ゲートウェイエンドポイントが設定されていない場合は、セキュアでプライベートな通信を有効にするために作成する必要があります。このエンドポイントにより、ClickHouse サービスは公共インターネットを経由せずに S3 にアクセスできます。以下のスクリーンショットを参照して、設定の例を確認してください。

<br />

<Image img={byoc_s3_endpoint} size="lg" alt="BYOC S3 エンドポイント" background='black'/>

<br />

**ClickHouse サポートに連絡する**
以下の情報を含むサポートチケットを作成します。

* あなたの AWS アカウント ID
* サービスをデプロイしたい AWS リージョン
* あなたの VPC ID
* ClickHouse のために割り当てたプライベートサブネット ID
* これらのサブネットがあるアベイラビリティゾーン

### オプション: VPC ピアリングの設定 {#optional-setup-vpc-peering}

ClickHouse BYOC のために VPC ピアリングを作成または削除するには、次の手順に従います。

#### ステップ 1: ClickHouse BYOC のためのプライベートロードバランサーを有効にする {#step-1-enable-private-load-balancer-for-clickhouse-byoc}
ClickHouse サポートに連絡して、プライベート ロードバランサーを有効にしてください。

#### ステップ 2: ピアリング接続を作成する {#step-2-create-a-peering-connection}
1. ClickHouse BYOC アカウントの VPC ダッシュボードに移動します。
2. ピアリング接続を選択します。
3. ピアリング接続を作成するをクリックします。
4. VPC リクエスターを ClickHouse VPC ID に設定します。
5. VPC アクセプターを対象の VPC ID に設定します。（適用可能な場合は別のアカウントを選択）
6. ピアリング接続の作成をクリックします。

<br />

<Image img={byoc_vpcpeering} size="lg" alt="BYOC ピアリング接続作成" border />

<br />

#### ステップ 3: ピアリング接続リクエストを承認する {#step-3-accept-the-peering-connection-request}
ピアリングアカウントに移動し、（VPC -> ピアリング接続 -> アクション -> リクエストを受け入れる）ページで顧客はこの VPC ピアリングリクエストを承認できます。

<br />

<Image img={byoc_vpcpeering2} size="lg" alt="BYOC ピアリング接続を受け入れる" border />

<br />

#### ステップ 4: ClickHouse VPC ルートテーブルに宛先を追加する {#step-4-add-destination-to-clickhouse-vpc-route-tables}
ClickHouse BYOC アカウント内で、
1. VPC ダッシュボードでルートテーブルを選択します。
2. ClickHouse VPC ID を検索します。プライベートサブネットに接続された各ルートテーブルを編集します。
3. ルートタブの下にある編集ボタンをクリックします。
4. もう 1 つのルートを追加をクリックします。
5. 宛先として対象 VPC の CIDR 範囲を入力します。
6. 「ピアリング接続」を選択し、ターゲットのためにピアリング接続の ID を選択します。

<br />

<Image img={byoc_vpcpeering3} size="lg" alt="BYOC ルートテーブルに追加" border />

<br />

#### ステップ 5: 対象 VPC ルートテーブルに宛先を追加する {#step-5-add-destination-to-the-target-vpc-route-tables}
ピアリング AWS アカウント内で、
1. VPC ダッシュボードでルートテーブルを選択します。
2. 対象 VPC ID を検索します。
3. ルートタブの下にある編集ボタンをクリックします。
4. もう 1 つのルートを追加をクリックします。
5. 宛先として ClickHouse VPC の CIDR 範囲を入力します。
6. 「ピアリング接続」を選択し、ターゲットのためにピアリング接続の ID を選択します。

<br />

<Image img={byoc_vpcpeering4} size="lg" alt="BYOC ルートテーブルに追加" border />

<br />

#### ステップ 6: ピアリング VPC アクセスを許可するようにセキュリティグループを編集する {#step-6-edit-security-group-to-allow-peered-vpc-access}
ClickHouse BYOC アカウント内では、ピアリング VPC からのトラフィックを許可するようにセキュリティグループの設定を更新する必要があります。ピアリング VPC の CIDR 範囲を含むインバウンドルールの追加をリクエストするには、ClickHouse サポートにお問い合わせください。

---
ClickHouse サービスは、ピアリングされた VPC からアクセス可能であるべきです。

ClickHouse にプライベートにアクセスするために、プライベート ロードバランサーとエンドポイントが、ユーザーのピアリング VPC からのセキュアな接続のためにプロビジョニングされます。プライベートエンドポイントは、公共エンドポイント形式に `-private` 接尾辞を付加したものです。例：
- **公共エンドポイント**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
- **プライベートエンドポイント**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

オプションとして、ピアリングが機能していることを確認した後、ClickHouse BYOC の公共ロードバランサーの削除をリクエストできます。

## アップグレードプロセス {#upgrade-process}

私たちは、ClickHouse データベースのバージョンアップグレード、ClickHouse オペレーター、EKS、その他のコンポーネントを含むソフトウェアのアップグレードを定期的に行っています。

シームレスなアップグレードを目指していますが（例えば、ローリングアップグレードや再起動）、ClickHouse のバージョン変更や EKS ノードのアップグレードなどの一部はサービスに影響を及ぼす可能性があります。顧客はメンテナンスウィンドウ（例：毎週火曜日 午前1時 PDT）を指定できます。これにより、これらのアップグレードは予定された時間にのみ行われることが保証されます。

:::note
メンテナンスウィンドウは、セキュリティや脆弱性の修正には適用されません。これらはオフサイクルアップグレードとして扱われ、適切な時間を調整するために迅速なコミュニケーションが行われ、運用への影響を最小限に抑えます。
:::

## CloudFormation IAM ロール {#cloudformation-iam-roles}

### ブートストラップ IAM ロール {#bootstrap-iam-role}

ブートストラップ IAM ロールには、以下の権限があります。

- **EC2 および VPC 操作**: VPC および EKS クラスターのセットアップに必要です。
- **S3 操作（例: `s3:CreateBucket`）**: ClickHouse BYOC ストレージ用のバケットを作成するために必要です。
- **`route53:*` 権限**: Route 53 にレコードを設定するための外部 DNS に必要です。
- **IAM 操作（例: `iam:CreatePolicy`）**: コントローラが追加のロールを作成するために必要です（詳細は次のセクションを参照）。
- **EKS 操作**: `clickhouse-cloud` プレフィックスで始まるリソースに制限されています。

### コントローラによって作成される追加 IAM ロール {#additional-iam-roles-created-by-the-controller}

CloudFormation によって作成された `ClickHouseManagementRole` に加えて、コントローラはいくつかの追加ロールを作成します。

これらのロールは、顧客の EKS クラスター内で実行されるアプリケーションによって引き受けられます：
- **ステートエクスポーターロール**
  - ClickHouse Cloud にサービス　ヘルス情報を報告する ClickHouse コンポーネント。
  - ClickHouse Cloud が所有する SQS キューに書き込むための権限が必要です。
- **ロードバランサーコントローラ**
  - 標準の AWS ロードバランサーコントローラ。
  - ClickHouse サービス用のボリュームを管理する EBS CSI コントローラ。
- **外部 DNS**
  - DNS 設定を Route 53 に伝播させます。
- **Cert-Manager**
  - BYOC サービス ドメインの TLS 証明書をプロビジョニングします。
- **クラスターオートスケーラー**
  - 必要に応じてノードグループのサイズを調整します。

**K8s-control-plane** および **k8s-worker** ロールは、AWS EKS サービスによって引き受けられることを意図しています。

最後に、**`data-plane-mgmt`** は、ClickHouse Cloud コントロールプレーンコンポーネントが、`ClickHouseCluster` や Istio 仮想サービス/ゲートウェイなどの必要なカスタムリソースを調整できるようにします。

## ネットワーク境界 {#network-boundaries}

このセクションでは、顧客の BYOC VPC への出入りするさまざまなネットワークトラフィックを扱います：

- **インバウンド**: 顧客の BYOC VPC に入るトラフィック。
- **アウトバウンド**: 顧客の BYOC VPC から発信されるトラフィックで、外部の宛先に送信されます。
- **パブリック**: 公共のインターネットからアクセス可能なネットワークエンドポイント。
- **プライベート**: VPC ピアリング、VPC プライベートリンク、または Tailscale などのプライベート接続を介してのみアクセス可能なネットワークエンドポイント。

**Istio ingress は、ClickHouse クライアントトラフィックを受け入れるために AWS NLB の背後にデプロイされています。**

*インバウンド、パブリック（プライベート可）*

Istio ingress ゲートウェイは TLS を終了します。証明書は、CertManager によって Let's Encrypt でプロビジョニングされ、EKS クラスター内のシークレットとして保存されます。Istio と ClickHouse の間のトラフィックは、同じ VPC に存在するため、[AWS によって暗号化されています](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/encrypting-data-at-rest-and--in-transit.html#:~:text=All%20network%20traffic%20between%20AWS,supported%20Amazon%20EC2%20instance%20types)。

デフォルトでは、インバウンドは IP アロウリストフィルタリングでパブリックにアクセス可能です。顧客は、VPC ピアリングを設定してプライベートにし、公共接続を無効にすることができます。[IP フィルタ](/cloud/security/setting-ip-filters)を設定してアクセスを制限することを強く推奨します。

### アクセスのトラブルシューティング {#troubleshooting-access}

*インバウンド、パブリック（プライベート可）*

ClickHouse Cloud エンジニアは、Tailscale 経由でトラブルシューティングアクセスを要求します。彼らは、BYOC デプロイメントのために、ジャストインタイム証明書ベースの認証でプロビジョニングされます。

### 請求クレイパー {#billing-scraper}

*アウトバウンド、プライベート*

請求クレイパーは、ClickHouse から請求データを収集し、ClickHouse Cloud が所有する S3 バケットに送信します。

それは、ClickHouse サーバーコンテナとともにサイドカーとして実行され、定期的に CPU およびメモリメトリックをスクレイピングします。同じリージョン内のリクエストは、VPC ゲートウェイサービスエンドポイントを経由します。

### アラート {#alerts}

*アウトバウンド、パブリック*

AlertManager は、顧客の ClickHouse クラスターが不健全な場合に ClickHouse Cloud にアラートを送信するように設定されています。

メトリックとログは顧客の BYOC VPC 内に保存されます。ログは現在、EBS にローカルに保存されています。今後のアップデートでは、これらは BYOC VPC 内の ClickHouse サービスである LogHouse に保存されます。メトリックは、顧客の BYOC VPC にローカルに保存された Prometheus と Thanos スタックを使用します。

### サービス状態 {#service-state}

*アウトバウンド*

ステートエクスポーターは、ClickHouse サービス状態情報を、ClickHouse Cloud が所有する SQS に送信します。

## 機能 {#features}

### サポートされている機能 {#supported-features}

- **SharedMergeTree**: ClickHouse Cloud と BYOC は同じバイナリと設定を使用します。したがって、SharedMergeTree などの ClickHouse コアからのすべての機能が BYOC でサポートされています。
- **サービス状態を管理するためのコンソールアクセス**:
  - 開始、停止、終了などの操作をサポートします。
  - サービスとステータスを表示します。
- **バックアップと復元**。
- **手動の垂直および水平スケーリング**。
- **アイドル状態**。
- **ウェアハウス**: コンピュータ・コンピュータ分離
- **Tailscale を介したゼロトラストネットワーク**。
- **監視**:
  - Cloud コンソールには、サービスの健康状態を監視するための組み込みヘルスダッシュボードが含まれています。
  - Prometheus スクレイピングによる Prometheus、Grafana、Datadog との集中監視。設定手順については、[Prometheus ドキュメント](/integrations/prometheus)を参照してください。
- **VPC ピアリング**。
- **統合**: フルリストは[こちら](/integrations)のページを参照してください。
- **セキュア S3**。
- **[AWS PrivateLink](https://aws.amazon.com/privatelink/)。**

### 計画された機能（現在サポートされていません） {#planned-features-currently-unsupported}

- [AWS KMS](https://aws.amazon.com/kms/)または CMEK（顧客管理暗号化キー）
- インジェスト用の ClickPipes
- オートスケーリング
- MySQL インターフェース

## FAQ {#faq}

### コンピュート {#compute}

#### この単一の EKS クラスターで複数のサービスを作成できますか？ {#can-i-create-multiple-services-in-this-single-eks-cluster}

はい。インフラストラクチャは、各 AWS アカウントおよびリージョンの組み合わせごとに一度だけプロビジョニングされる必要があります。

### BYOC のサポートリージョンはどれですか？ {#which-regions-do-you-support-for-byoc}

BYOC は ClickHouse Cloud と同じセットの [リージョン](/cloud/reference/supported-regions#aws-regions) をサポートします。

#### リソースオーバーヘッドはありますか？ ClickHouse インスタンス以外のサービスを実行するために必要なリソースは何ですか？ {#will-there-be-some-resource-overhead-what-are-the-resources-needed-to-run-services-other-than-clickhouse-instances}

ClickHouse インスタンス（ClickHouse サーバーと ClickHouse Keeper）以外に、`clickhouse-operator`、`aws-cluster-autoscaler`、Istio などのサービスを実行し、監視スタックを管理しています。

現在、これらのワークロードを実行するために専用ノードグループ内に 3 つの m5.xlarge ノード（各 AZ に 1 つ）があります。

### ネットワークとセキュリティ {#network-and-security}

#### セットアップ完了後にインストール時に設定した権限を取り消すことはできますか？ {#can-we-revoke-permissions-set-up-during-installation-after-setup-is-complete}

現状では、これは不可能です。

#### ClickHouse エンジニアがトラブルシューティングのために顧客インフラにアクセスするための将来のセキュリティ管理策を検討しましたか？ {#have-you-considered-some-future-security-controls-for-clickhouse-engineers-to-access-customer-infra-for-troubleshooting}

はい。顧客がエンジニアのクラスターへのアクセスを承認できる顧客制御メカニズムの実装は、私たちのロードマップにあります。現時点では、エンジニアはクラスターへのジャストインタイムアクセスを得るために内部エスカレーションプロセスを経る必要があります。これはログに記録され、私たちのセキュリティチームによって監査されます。

#### 作成された VPC IP 範囲のサイズはどれくらいですか？ {#what-is-the-size-of-the-vpc-ip-range-created}

デフォルトでは、BYOC VPC に `10.0.0.0/16` を使用します。将来のスケーリングのために少なくとも /22 を予約することを推奨しますが、制限を希望する場合は、30 のサーバーポッドに制限される可能性がある場合は /23 を使用することも可能です。

#### メンテナンスの頻度を決定できますか？ {#can-i-decide-maintenance-frequency}

メンテナンスウィンドウをスケジュールするにはサポートに連絡してください。最低でも週一回の更新スケジュールを期待してください。

## 可観測性 {#observability}

### 内蔵監視ツール {#built-in-monitoring-tools}
ClickHouse BYOC は、さまざまなユースケースに対応するいくつかのアプローチを提供します。

#### 可観測性ダッシュボード {#observability-dashboard}

ClickHouse Cloud には、メモリ使用量、クエリレート、I/O などのメトリックを表示する高度な可観測性ダッシュボードが含まれています。これは ClickHouse Cloud ウェブコンソールインターフェースの **監視** セクションでアクセスできます。

<br />

<Image img={byoc3} size="lg" alt="可観測性ダッシュボード" border />

<br />

#### 高度なダッシュボード {#advanced-dashboard}

`system.metrics`、`system.events`、`system.asynchronous_metrics` などのシステムテーブルからのメトリックを使用して、サーバーのパフォーマンスとリソース利用状況を詳細に監視するためにダッシュボードをカスタマイズできます。

<br />

<Image img={byoc4} size="lg" alt="高度なダッシュボード" border />

<br />

#### BYOC Prometheus スタックへのアクセス {#prometheus-access}
ClickHouse BYOC は、Kubernetes クラスターに Prometheus スタックをデプロイします。そこからメトリックにアクセスしてスクレイピングし、自分の監視スタックと統合できます。

ClickHouse サポートに連絡して、プライベートロードバランサーを有効にし、URL をリクエストしてください。この URL はプライベートネットワーク経由でのみアクセスでき、認証はサポートしていません。

**サンプル URL**
```bash
https://prometheus-internal.<subdomain>.<region>.aws.clickhouse-byoc.com/query
```

#### Prometheus 統合 {#prometheus-integration}

**非推奨:** 上記のセクションの Prometheus スタック統合を代わりに使用してください。ClickHouse Server メトリックの他に、K8S メトリックや他のサービスからのより多くのメトリックを提供します。

ClickHouse Cloud は、監視のためのメトリックをスクレイプするために使用できる Prometheus エンドポイントを提供します。これにより、Grafana や Datadog などのツールとの統合が可能になります。

**HTTPS エンドポイント /metrics_all 経由のサンプルリクエスト**

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

ClickHouse のユーザー名とパスワードのペアを、認証に使用できます。メトリックをスクレイプするために最低限の権限を持つ専用ユーザーを作成することをお勧めします。最低限、`system.custom_metrics` テーブルのレプリカ全体に対する `READ` 権限が必要です。例えば：

```sql
GRANT REMOTE ON *.* TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_custom_metrics_tables TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_database_replicated_recovery_time TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_failed_mutations TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_group TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_shared_catalog_recovery_time TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_table_read_only_duration_seconds TO scrapping_user;
GRANT SELECT ON system._custom_metrics_view_error_metrics TO scrapping_user;
GRANT SELECT ON system._custom_metrics_view_histograms TO scrapping_user;
GRANT SELECT ON system._custom_metrics_view_metrics_and_events TO scrapping_user;
GRANT SELECT(description, metric, value) ON system.asynchronous_metrics TO scrapping_user;
GRANT SELECT ON system.custom_metrics TO scrapping_user;
GRANT SELECT(name, value) ON system.errors TO scrapping_user;
GRANT SELECT(description, event, value) ON system.events TO scrapping_user;
GRANT SELECT(description, labels, metric, value) ON system.histogram_metrics TO scrapping_user;
GRANT SELECT(description, metric, value) ON system.metrics TO scrapping_user;
```

**Prometheus の設定**

以下に設定例を示します。`targets` エンドポイントは、ClickHouse サービスにアクセスするために使用されるものと同じです。

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

さらに、[このブログ記事](https://clickhouse.com/blog/clickhouse-cloud-now-supports-prometheus-monitoring)および [ClickHouse 用の Prometheus セットアップドキュメント](/integrations/prometheus)も参照してください。

### 稼働時間 SLA {#uptime-sla}

#### ClickHouse は BYOC に対して稼働時間 SLA を提供していますか？ {#uptime-sla-for-byoc}

いいえ、データプレーンは顧客のクラウド環境にホストされているため、サービスの可用性は ClickHouse の管理下にないリソースに依存します。したがって、ClickHouse は BYOC デプロイメントに対して正式な稼働時間 SLA を提供していません。追加の質問がある場合は、support@clickhouse.com にお問い合わせください。
