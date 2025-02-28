---
title: BYOC (Bring Your Own Cloud) for AWS
slug: /cloud/reference/byoc
sidebar_label: BYOC (Bring Your Own Cloud)
keywords: [BYOC, cloud, bring your own cloud]
description: ClickHouseを自分のクラウドインフラストラクチャにデプロイする
---

import BYOC1 from '@site/static/images/cloud/reference/byoc-1.png';
import BYOC4 from '@site/static/images/cloud/reference/byoc-4.png';
import BYOC3 from '@site/static/images/cloud/reference/byoc-3.png';
import BYOC_VPCPeering from '@site/static/images/cloud/reference/byoc-vpcpeering-1.png';
import BYOC_VPCPeering2 from '@site/static/images/cloud/reference/byoc-vpcpeering-2.png';
import BYOC_VPCPeering3 from '@site/static/images/cloud/reference/byoc-vpcpeering-3.png';
import BYOC_VPCPeering4 from '@site/static/images/cloud/reference/byoc-vpcpeering-4.png';
import BYOC_PLB from '@site/static/images/cloud/reference/byoc-plb.png';
import BYOC_SECURITY from '@site/static/images/cloud/reference/byoc-securitygroup.png';
import BYOC_INBOUND from '@site/static/images/cloud/reference/byoc-inbound-rule.png';

## 概要 {#overview}

BYOC (Bring Your Own Cloud)を使用すると、ClickHouse Cloudを自分のクラウドインフラストラクチャにデプロイできます。これは、特定の要件や制約があり、ClickHouse Cloudのマネージドサービスを使用できない場合に便利です。

**アクセスを希望される場合は、[お問い合わせ](https://clickhouse.com/cloud/bring-your-own-cloud)ください。** 追加情報については、[利用規約](https://clickhouse.com/legal/agreements/terms-of-service)をご参照ください。

BYOCは現在、AWSでのみサポートされており、GCPおよびMicrosoft Azureは開発中です。

:::note 
BYOCは、大規模展開向けに特別に設計されています。
:::
## 用語集 {#glossary}

- **ClickHouse VPC:** ClickHouse Cloudが所有するVPC。
- **カスタマーBYOC VPC:** 顧客のクラウドアカウントが所有するVPCで、ClickHouse Cloudによりプロビジョニングおよび管理され、ClickHouse CloudのBYOC展開に専用されています。
- **カスタマーVPC:** カスタマーBYOC VPCに接続する必要があるアプリケーション用にカスタマーのクラウドアカウントが所有する他のVPC。
## アーキテクチャ {#architecture}

メトリクスとログは、顧客のBYOC VPCに保存されます。ログは現在、EBSにローカルで保存されています。将来の更新では、ログは顧客のBYOC VPC内のClickHouseサービスであるLogHouseに保存される予定です。メトリクスは、顧客のBYOC VPC内にローカルに保存されたPrometheusおよびThanosスタックを介して実装されています。

<br />

<img src={BYOC1}
    alt='BYOCアーキテクチャ'
    class='image'
    style={{width: '800px'}}
/>

<br />
## オンボーディングプロセス {#onboarding-process}

顧客は、[お問い合せ](https://clickhouse.com/cloud/bring-your-own-cloud)を行うことでオンボーディングプロセスを開始できます。顧客は、専用のAWSアカウントを持ち、使用するリージョンを知っている必要があります。この時点では、ClickHouse Cloudのサポート対象のリージョンでのみ、ユーザーがBYOCサービスを起動できるようになっています。
### 専用AWSアカウントを準備する {#prepare-a-dedicated-aws-account}

顧客は、ClickHouse BYOC展開をホスティングするために専用のAWSアカウントを準備し、より良い分離を確保する必要があります。このアカウントと初期の組織管理者メールアドレスで、ClickHouseサポートに連絡できます。
### CloudFormationテンプレートを適用する {#apply-cloudformation-template}

BYOCセットアップは、[CloudFormationスタック](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml)を介して初期化され、ClickHouse CloudからのBYOCコントローラーがインフラストラクチャを管理するための役割を作成します。 S3、VPC、およびClickHouseを実行するためのコンピューティングリソースは、このスタックには含まれていません。

<!-- TODO: Add Screenshot for the rest of onboarding, once self-served onboarding is implemented. -->
### BYOCインフラストラクチャをセットアップする {#setup-byoc-infrastructure}

CloudFormationスタックを作成した後、S3、VPC、EKSクラスターなどのインフラストラクチャをクラウドコンソールから設定するように求められます。この段階で特定の構成を決定する必要があります。これらは後で変更できません。具体的には：

- **使用したいリージョン**: ClickHouse Cloudのためにある任意の[公開リージョン](/cloud/reference/supported-regions)のいずれかを選択できます。
- **BYOCのVPC CIDR範囲**: デフォルトでは、BYOC VPC CIDR範囲に`10.0.0.0/16`を使用します。別のアカウントとのVPCピアリングを使用する予定がある場合、CIDR範囲が重複しないことを確認してください。必要なワークロードを収容するために、最小サイズ`/22`の適切なCIDR範囲をBYOCに割り当ててください。
- **BYOC VPCのアベイラビリティゾーン**: VPCピアリングを使用する予定がある場合、ソースアカウントとBYOCアカウント間でアベイラビリティゾーンを整合させることで、AZ間のトラフィックコストを削減できます。AWSでは、アベイラビリティゾーンのサフィックス（`a, b, c`）がアカウントごとに異なる物理ゾーンIDを表す場合があります。詳細は[AWSガイド](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html)を参照してください。
### オプション: VPCピアリングのセットアップ {#optional-setup-vpc-peering}

ClickHouse BYOCのためにVPCピアリングを作成または削除するには、以下の手順に従います。
#### ステップ1 ClickHouse BYOCのプライベートロードバランサーを有効にする {#step-1-enable-private-load-balancer-for-clickhouse-byoc}
ClickHouseサポートに連絡してプライベートロードバランサーを有効にします。
#### ステップ2 ピア接続を作成する {#step-2-create-a-peering-connection}
1. ClickHouse BYOCアカウントのVPCダッシュボードに移動します。
2. ピア接続を選択します。
3. ピア接続を作成をクリックします。
4. VPCリクエスターにClickHouse VPC IDを設定します。
5. VPCアセプターにターゲットVPC IDを設定します。（適用される場合は別のアカウントを選択）
6. ピア接続を作成をクリックします。

<br />

<img src={BYOC_VPCPeering}
    alt='BYOC ピア接続の作成'
    class='image'
    style={{width: '800px'}}
/>

<br />
#### ステップ3 ピア接続リクエストを承認する {#step-3-accept-the-peering-connection-request}
ピア接続アカウントの(VPC -> ピア接続 -> アクション -> リクエストを承認)ページに移動し、顧客はこのVPCピア接続リクエストを承認できます。

<br />

<img src={BYOC_VPCPeering2}
    alt='BYOC ピア接続の承認'
    class='image'
    style={{width: '800px'}}
/>

<br />
#### ステップ4 ClickHouse VPCルートテーブルに宛先を追加する {#step-4-add-destination-to-clickhouse-vpc-route-tables}
ClickHouse BYOCアカウントで、
1. VPCダッシュボードのルートテーブルを選択します。
2. ClickHouse VPC IDを検索します。プライベートサブネットに接続された各ルートテーブルを編集します。
3. ルートタブの下で編集ボタンをクリックします。
4. 別のルートを追加をクリックします。
5. 宛先のCIDR範囲にターゲットVPCのCIDR範囲を入力します。
6. “ピア接続”を選択し、ターゲットのピア接続のIDを設定します。

<br />

<img src={BYOC_VPCPeering3}
    alt='BYOC ルートテーブルの追加'
    class='image'
    style={{width: '800px'}}
/>

<br />
#### ステップ5 ターゲットVPCルートテーブルに宛先を追加する {#step-5-add-destination-to-the-target-vpc-route-tables}
ピア接続AWSアカウントで、
1. VPCダッシュボードのルートテーブルを選択します。
2. ターゲットVPC IDを検索します。
3. ルートタブの下で編集ボタンをクリックします。
4. 別のルートを追加をクリックします。
5. ClickHouse VPCのCIDR範囲を宛先に入力します。
6. “ピア接続”を選択し、ターゲットのピア接続のIDを設定します。

<br />

<img src={BYOC_VPCPeering4}
    alt='BYOC ルートテーブルの追加'
    class='image'
    style={{width: '800px'}}
/>

<br />
#### ステップ6 セキュリティグループを編集してピア接続VPCアクセスを許可する {#step-6-edit-security-group-to-allow-peered-vpc-access}
ClickHouse BYOCアカウントで、
1. ClickHouse BYOCアカウントのEC2に移動し、名前が「infra-xx-xxx-ingress-private」であるプライベートロードバランサーを見つけます。

<br />

<img src={BYOC_PLB}
    alt='BYOC プライベートロードバランサー'
    class='image'
    style={{width: '800px'}}
/>

<br />

2. 詳細ページのセキュリティタブで、`k8s-istioing-istioing-xxxxxxxxx`のような命名パターンに従う関連付けられたセキュリティグループを見つけます。

<br />

<img src={BYOC_SECURITY}
    alt='BYOC プライベートロードバランサーセキュリティグループ'
    class='image'
    style={{width: '800px'}}
/>

<br />

3. このセキュリティグループのインバウンドルールを編集し、ピア接続VPC CIDR範囲（または必要に応じて必要なCIDR範囲）を追加します。

<br />

<img src={BYOC_INBOUND}
    alt='BYOC セキュリティグループインバウンドルール'
    class='image'
    style={{width: '800px'}}
/>

<br />

---
ClickHouseサービスは、ピア接続VPCからアクセス可能になっているはずです。

ClickHouseにプライベートにアクセスするために、プライベートロードバランサーとエンドポイントがプロビジョニングされ、ユーザーのピア接続VPCからの安全な接続が提供されます。プライベートエンドポイントは、`-private`サフィックスを持つ公開エンドポイント形式に従います。例えば：  
- **公開エンドポイント**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`  
- **プライベートエンドポイント**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

オプションとして、ピアリングが機能していることを確認した後、ClickHouse BYOCのための公開ロードバランサーの削除をリクエストできます。
## アップグレードプロセス {#upgrade-process}

私たちは定期的にソフトウェアをアップグレードし、ClickHouseデータベースのバージョンアップグレード、ClickHouse Operator、EKS、および他のコンポーネントを含みます。

シームレスなアップグレード（例：ローリングアップグレードおよび再起動）を目指していますが、ClickHouseのバージョン変更やEKSノードのアップグレードなど、サービスに影響を与える場合があります。顧客は保守ウィンドウを指定できる（例：毎週火曜日の午前1時PDT）ため、その時間帯にのみそのようなアップグレードが行われるようにします。

:::note
保守ウィンドウは、セキュリティおよび脆弱性修正には適用されません。これらはオフサイクルのアップグレードとして扱われ、タイムリーにコミュニケーションを行い、適切な時間を調整し、運用への影響を最小限に抑えます。
:::
## CloudFormation IAMロール {#cloudformation-iam-roles}
### ブートストラップIAMロール {#bootstrap-iam-role}

ブートストラップIAMロールには、以下の権限があります：

- **EC2およびVPC操作**: VPCおよびEKSクラスターをセットアップするために必要です。  
- **S3操作（例：`s3:CreateBucket`）**: ClickHouse BYOCストレージ用のバケットを作成するために必要です。  
- **`route53:*`権限**: Route 53にレコードを構成するための外部DNSに必要です。  
- **IAM操作（例：`iam:CreatePolicy`）**: コントローラーが追加のロールを作成するために必要です（詳細については次のセクションを参照）。  
- **EKS操作**: `clickhouse-cloud`プレフィックスで始まるリソースに制限されています。
### コントローラーによって作成される追加IAMロール {#additional-iam-roles-created-by-the-controller}

CloudFormationを介して作成された`ClickHouseManagementRole`に加えて、コントローラーは複数の追加ロールを作成します。

これらのロールは、顧客のEKSクラスター内で実行されるアプリケーションによって引き受けられます：
- **ステートエクスポーターロール**  
  - ClickHouseのコンポーネントで、サービスのヘルス情報をClickHouse Cloudに報告します。  
  - ClickHouse Cloudが所有するSQSキューに書き込む権限が必要です。  
- **ロードバランサーコントローラー**  
  - 標準のAWSロードバランサーコントローラー。  
  - ClickHouseサービス用のボリュームを管理するためのEBS CSIコントローラー。  
- **外部DNS**  
  - DNS構成をRoute 53に伝播させます。  
- **Cert-Manager**  
  - BYOCサービスドメイン用のTLS証明書をプロビジョニングします。  
- **クラスターオートスケーラー**  
  - 必要に応じてノードグループのサイズを調整します。

**k8s-control-plane**および**k8s-worker**ロールは、AWS EKSサービスによって引き受けられることを意図しています。

最後に、**`data-plane-mgmt`**は、ClickHouse Cloud制御プレーンコンポーネントが`ClickHouseCluster`やIstioの仮想サービス/ゲートウェイなどの必要なカスタムリソースを調整できるようにします。
## ネットワーク境界 {#network-boundaries}

このセクションでは、顧客のBYOC VPCへのトラフィックとそこから出るトラフィックの異なるタイプについて説明します：

- **インバウンド**: 顧客のBYOC VPCに入るトラフィック。  
- **アウトバウンド**: 顧客のBYOC VPCから発生し、外部の宛先に送られるトラフィック。  
- **パブリック**: 公共インターネットからアクセス可能なネットワークエンドポイント。  
- **プライベート**: VPCピアリング、VPCプライベートリンク、またはTailscaleなどのプライベート接続を介してのみアクセス可能なネットワークエンドポイント。

**Istioインバウンドは、ClickHouseクライアントトラフィックを受け入れるためにAWS NLBの背後にデプロイされます。**  

*インバウンド、パブリック（プライベートにすることも可能）*

IstioインバウンドゲートウェイはTLSを終端します。証明書は、Lets Encryptを使用してCertManagerによってプロビジョニングされ、EKSクラスター内のシークレットとして保存されます。IstioとClickHouseの間のトラフィックは、[AWSによって暗号化されます](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/encrypting-data-at-rest-and--in-transit.html#:~:text=All%20network%20traffic%20between%20AWS,supported%20Amazon%20EC2%20instance%20types)。
デフォルトでは、インバウンドはIP許可リストフィルタリングで公開されます。顧客は、VPCピアリングを構成してプライベートにし、公共接続を無効にすることができます。アクセス制限のために[IPフィルター](/cloud/security/setting-ip-filters)を設定することを強く推奨します。
### アクセスのトラoubleshooting {#troubleshooting-access}

*インバウンド、パブリック（プライベートにすることも可能）*

ClickHouse Cloudエンジニアは、Tailscaleを介してトラブルシューティングアクセスを必要とします。彼らは、BYOC展開のために、適時証明書ベースの認証を受け取ります。
### 請求スクリーパー {#billing-scraper}

*アウトバウンド、プライベート*

請求スクリーパーは、ClickHouseから請求データを収集し、ClickHouse Cloudが所有するS3バケットに送信します。

それは、ClickHouseサーバーコンテナとともにサイドカーとして実行され、CPUとメモリメトリクスを定期的にスクリーピングします。同じリージョン内のリクエストは、VPCゲートウェイサービスのエンドポイントを通じてルーティングされます。
### アラート {#alerts}

*アウトバウンド、パブリック*

AlertManagerは、顧客のClickHouseクラスターが正常でない場合にClickHouse Cloudにアラートを送信するように構成されています。

メトリクスとログは、顧客のBYOC VPCに保存されます。ログは現在、EBSにローカルで保存されています。将来の更新では、BYOC VPC内のClickHouseサービスであるLogHouseに保存される予定です。メトリクスは、BYOC VPC内にローカルに保存されたPrometheusおよびThanosスタックを使用します。
### サービス状態 {#service-state}

*アウトバウンド*

ステートエクスポーターは、ClickHouseサービス状態情報をClickHouse Cloudが所有するSQSに送信します。
## 機能 {#features}
### サポートされている機能 {#supported-features}

- **SharedMergeTree**: ClickHouse CloudとBYOCは同じバイナリと設定を使用しています。したがって、SharedMergeTreeなど、ClickHouseコアのすべての機能がBYOCでサポートされています。
- **サービス状態を管理するためのコンソールアクセス**:  
  - 開始、停止、終了などの操作をサポートします。  
  - サービスと状態を表示します。  
- **バックアップと復元。**  
- **手動の垂直および水平方向のスケーリング。**
- **アイドル状態。**  
- **倉庫**: コンピューティング-コンピューティング分離
- **Tailscaleを介したゼロトラストネットワーク。**  
- **監視**:  
  - クラウドコンソールには、サービスの健康を監視するための組み込みのヘルスダッシュボードが含まれています。  
  - Prometheus、Grafana、およびDatadogを使用した集中監視のためのPrometheusスクリーピング。設定手順については、[Prometheusドキュメント](/integrations/prometheus)を参照してください。  
- **VPCピアリング。**  
- **統合**: [このページ](/integrations)での完全なリストをご覧ください。  
- **安全なS3。**  
- **[AWS PrivateLink](https://aws.amazon.com/privatelink/)。**
### 計画された機能（現在サポートされていない） {#planned-features-currently-unsupported}

- [AWS KMS](https://aws.amazon.com/kms/)別名CMEK（顧客管理の暗号化キー）
- インジェスト用のClickPipes
- オートスケーリング
- MySQLインターフェース
## FAQ {#faq}
### コンピュート {#compute}
#### この単一のEKSクラスターで複数のサービスを作成できますか？ {#can-i-create-multiple-services-in-this-single-eks-cluster}

はい。インフラストラクチャは、すべてのAWSアカウントとリージョンの組み合わせで1回のみプロビジョニングする必要があります。
### BYOCでどのリージョンをサポートしていますか？ {#which-regions-do-you-support-for-byoc}

BYOCはClickHouse Cloudと同じセットの[リージョン](/cloud/reference/supported-regions#aws-regions )をサポートしています。
#### リソースオーバーヘッドはありますか？ ClickHouseインスタンス以外のサービスを実行するために必要なリソースは何ですか？ {#will-there-be-some-resource-overhead-what-are-the-resources-needed-to-run-services-other-than-clickhouse-instances}

ClickHouseインスタンス（ClickHouseサーバーおよびClickHouse Keeper）に加えて、`clickhouse-operator`、`aws-cluster-autoscaler`、Istioなどのサービスと、監視スタックを実行します。

現在、これらのワークロードを実行するために、専用のノードグループに3つのm5.xlargeノード（各AZに1つ）があります。
### ネットワークとセキュリティ {#network-and-security}
#### インストール中に設定された権限を、セットアップが完了した後に取り消すことはできますか？ {#can-we-revoke-permissions-set-up-during-installation-after-setup-is-complete}

現時点ではこれは不可能です。
#### ClickHouseエンジニアがトラブルシューティングのために顧客のインフラにアクセスするための将来のセキュリティ制御について検討していますか？ {#have-you-considered-some-future-security-controls-for-clickhouse-engineers-to-access-customer-infra-for-troubleshooting}

はい。顧客がエンジニアのクラスターへのアクセスを承認できる顧客制御メカニズムを実装することは、私たちのロードマップにあります。現時点では、エンジニアはクラスターへの適時のアクセスを得るために内部のエスカレーションプロセスを経る必要があります。これは私たちのセキュリティチームによってログ記録および監査されます。
#### 作成されたVPC IP範囲のサイズはどのくらいですか？ {#what-is-the-size-of-the-vpc-ip-range-created}

デフォルトでは、BYOC VPCには`10.0.0.0/16`を使用します。将来の拡張のために、少なくとも/22を予約することをお勧めしますが、サイズを制限したい場合は、30サーバーポッドに制限される可能性がある場合、/23を使用することも可能です。
#### メンテナンス頻度を決定できますか {#can-i-decide-maintenance-frequency}

保守ウィンドウをスケジュールするにはサポートに連絡してください。最低でも週1回のアップデートスケジュールを期待してください。
## 可視性 {#observability}
### 組み込みの監視ツール {#built-in-monitoring-tools}
#### 可視性ダッシュボード {#observability-dashboard}

ClickHouse Cloudには、メモリ使用量、クエリレート、I/Oなどのメトリクスを表示する高度な可視性ダッシュボードが含まれています。これは、ClickHouse Cloudウェブコンソールインターフェースの**監視**セクションでアクセスできます。

<br />

<img src={BYOC3}
    alt='可視性ダッシュボード'
    class='image'
    style={{width: '800px'}}
/>

<br />
#### 高度なダッシュボード {#advanced-dashboard}

`system.metrics`、`system.events`、`system.asynchronous_metrics`などのシステムテーブルのメトリクスを使用してダッシュボードをカスタマイズし、サーバーのパフォーマンスやリソースの利用状況を詳しく監視できます。

<br />

<img src={BYOC4}
    alt='高度なダッシュボード'
    class='image'
    style={{width: '800px'}}
/>

<br />
#### Prometheus統合 {#prometheus-integration}

ClickHouse Cloudは、監視用のメトリクスをスクレイピングするために使用できるPrometheusエンドポイントを提供します。これにより、GrafanaやDatadogなどのツールとの統合が可能になります。

**httpsエンドポイント/metrics_allによるサンプルリクエスト**
    
```bash
curl --user <username>:<password> https://i6ro4qarho.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud:8443/metrics_all
```

**サンプルレスポンス**

```bash
# HELP ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes ディスク's3disk'に保存されているバイト数
# TYPE ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes gauge
ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes{hostname="c-jet-ax-16-server-43d5baj-0"} 62660929
# HELP ClickHouse_CustomMetric_NumberOfBrokenDetachedParts 壊れたデタッチパーツの数
# TYPE ClickHouse_CustomMetric_NumberOfBrokenDetachedParts gauge
ClickHouse_CustomMetric_NumberOfBrokenDetachedParts{hostname="c-jet-ax-16-server-43d5baj-0"} 0
# HELP ClickHouse_CustomMetric_LostPartCount 最も古いミューテーションの年齢（秒数）
# TYPE ClickHouse_CustomMetric_LostPartCount gauge
ClickHouse_CustomMetric_LostPartCount{hostname="c-jet-ax-16-server-43d5baj-0"} 0
# HELP ClickHouse_CustomMetric_NumberOfWarnings サーバーによって発行された警告の数。通常は設定ミスに関することを示します。
# TYPE ClickHouse_CustomMetric_NumberOfWarnings gauge
ClickHouse_CustomMetric_NumberOfWarnings{hostname="c-jet-ax-16-server-43d5baj-0"} 2
# HELP ClickHouseErrorMetric_FILE_DOESNT_EXIST FILE_DOESNT_EXIST
# TYPE ClickHouseErrorMetric_FILE_DOESNT_EXIST counter
ClickHouseErrorMetric_FILE_DOESNT_EXIST{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 1
# HELP ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE UNKNOWN_ACCESS_TYPE
# TYPE ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE counter
ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 8
# HELP ClickHouse_CustomMetric_TotalNumberOfErrors サーバーが最後に再起動してからのエラーの総数
# TYPE ClickHouse_CustomMetric_TotalNumberOfErrors gauge
ClickHouse_CustomMetric_TotalNumberOfErrors{hostname="c-jet-ax-16-server-43d5baj-0"} 9
```

**認証**

ClickHouseのユーザー名とパスワードのペアを使用して認証できます。メトリクスをスクレイピングするために最小限の権限を持つ専用ユーザーを作成することをお勧めします。最低限、レプリカ間の`system.custom_metrics`テーブルに対して`READ`権限が必要です。例えば：

```sql
GRANT REMOTE ON *.* TO scraping_user          
GRANT SELECT ON system.custom_metrics TO scraping_user
```

**Prometheusの設定**

以下に例の構成を示します。`targets`エンドポイントは、ClickHouseサービスにアクセスするために使用されるものと同じです。

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

また、[このブログ投稿](https://clickhouse.com/blog/clickhouse-cloud-now-supports-prometheus-monitoring)および[ClickHouseのためのPrometheus設定ドキュメント](/integrations/prometheus)もご覧ください。
