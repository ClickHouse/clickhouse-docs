---
title: BYOC (Bring Your Own Cloud) for AWS
slug: /cloud/reference/byoc
sidebar_label: BYOC (Bring Your Own Cloud)
keywords: [BYOC, cloud, bring your own cloud]
description: 自分のクラウドインフラストラクチャにClickHouseをデプロイする
---

## 概要 {#overview}

BYOC (Bring Your Own Cloud)は、ClickHouse Cloudを自分のクラウドインフラストラクチャにデプロイできるようにします。これは、ClickHouse Cloudのマネージドサービスを使用することができない特定の要件や制約がある場合に便利です。

**アクセスをご希望の方は、[お問い合わせください](https://clickhouse.com/cloud/bring-your-own-cloud)。** 詳細については、[利用規約](https://clickhouse.com/legal/agreements/terms-of-service)をご覧ください。

BYOCは現在、AWS専用でサポートされており、GCPとMicrosoft Azureは開発中です。

:::note 
BYOCは、大規模なデプロイメントのために特別に設計されています。
:::

## 用語集 {#glossary}

- **ClickHouse VPC:** ClickHouse Cloudが所有するVPC。 
- **カスタマーBYOC VPC:** 顧客のクラウドアカウントが所有するVPCで、ClickHouse Cloudによってプロビジョニングされ、ClickHouse Cloud BYOCデプロイメント専用。 
- **カスタマーVPC:** 顧客クラウドアカウントが所有する他のVPCで、カスタマーBYOC VPCに接続する必要があるアプリケーションに使用される。

## アーキテクチャ {#architecture}

メトリックとログはカスタマーのBYOC VPC内に保存されます。現在、ログはEBSにローカルに保存されています。将来のアップデートでは、ログはカスタマーのBYOC VPC内のClickHouseサービスであるLogHouseに保存される予定です。メトリックは、カスタマーのBYOC VPC内にローカルに保存されているPrometheusおよびThanosスタックを介して実装されています。

<br />

<img src={require('./images/byoc-1.png').default}
    alt='BYOC アーキテクチャ'
    class='image'
    style={{width: '800px'}}
/>

<br />

## オンボーディングプロセス {#onboarding-process}

顧客は、[私たちに連絡する](https://clickhouse.com/cloud/bring-your-own-cloud)ことでオンボーディングプロセスを開始できます。顧客は専用のAWSアカウントを持ち、使用するリージョンを知っている必要があります。現在、ClickHouse Cloudをサポートしているリージョンでのみ、ユーザーがBYOCサービスを起動できるようにしています。

### 専用AWSアカウントの準備 {#prepare-a-dedicated-aws-account}

顧客は、ClickHouse BYOCデプロイメントをホスティングするための専用のAWSアカウントを準備し、より良い分離を確保する必要があります。この準備が整ったら、初期の組織管理者のメールとともにClickHouseサポートに連絡できます。

### CloudFormationテンプレートの適用 {#apply-cloudformation-template}

BYOCの設定は、ClickHouse CloudからBYOCコントローラーがインフラストラクチャを管理するためのロールを作成する[CloudFormationスタック](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml)を介して初期化されます。このスタックには、ClickHouseを実行するためのS3、VPC、およびコンピューティングリソースは含まれていません。

<!-- TODO: オンボーディングの残りの部分のスクリーンショットを追加します。セルフサービスのオンボーディングが実装され次第。 -->

### BYOCインフラストラクチャのセットアップ {#setup-byoc-infrastructure}

CloudFormationスタックを作成した後、クラウドコンソールからS3、VPC、EKSクラスターを含むインフラストラクチャを設定するように求められます。この段階で特定の構成を決定する必要があります。後で変更できないため、特に注意が必要です。

- **使用したいリージョン**：ClickHouse Cloudの[パブリックリージョン](clickhouse.com/docs/cloud/reference/supported-regions)からお好きなものを選択できます。
- **BYOCのVPC CIDR範囲**：デフォルトでは、BYOC VPCのCIDR範囲には `10.0.0.0/16` を使用します。別のアカウントとVPCピアリングを使用する予定がある場合は、CIDR範囲が重ならないようにしてください。BYOC用に適切なCIDR範囲を割り当ててください。最小サイズは `/22` で、必要なワークロードを収容できるようにします。
- **BYOC VPCのアベイラビリティゾーン**：VPCピアリングを使用する予定である場合、ソースアカウントとBYOCアカウントの間でアベイラビリティゾーンを揃えることで、AZ間のトラフィックコストを削減できます。AWSでは、アベイラビリティゾーンのサフィックス（`a, b, c`）が異なる物理ゾーンIDを表すことがあります。詳細については、[AWSガイド](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html)を参照してください。

### オプション: VPCピアリングのセットアップ {#optional-setup-vpc-peering}

ClickHouse BYOCのVPCピアリングを作成または削除するには、以下の手順に従ってください。

#### ステップ1: ClickHouse BYOCのためのプライベートロードバランサーを有効にする {#step-1-enable-private-load-balancer-for-clickhouse-byoc}
ClickHouseサポートに連絡して、プライベートロードバランサーを有効にしてください。

#### ステップ2: ピア接続を作成する {#step-2-create-a-peering-connection}
1. ClickHouse BYOCアカウントのVPCダッシュボードに移動します。
2. ピア接続を選択します。
3. ピア接続の作成をクリックします。
4. VPCリクエスターをClickHouse VPC IDに設定します。
5. VPCアクセプターをターゲットVPC IDに設定します。（該当する場合は別のアカウントを選択）
6. ピア接続を作成をクリックします。

<br />

<img src={require('./images/byoc-vpcpeering-1.png').default}
    alt='BYOC ピア接続の作成'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### ステップ3: ピア接続リクエストを承諾する {#step-3-accept-the-peering-connection-request}
ピアリングアカウントに移動し、(VPC -> ピア接続 -> アクション -> リクエストを承諾) ページで顧客はこのVPCピアリングリクエストを承認できます。

<br />

<img src={require('./images/byoc-vpcpeering-2.png').default}
    alt='BYOC ピア接続の承諾'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### ステップ4: ClickHouse VPCルートテーブルに宛先を追加 {#step-4-add-destination-to-clickhouse-vpc-route-tables}
ClickHouse BYOCアカウントで、
1. VPCダッシュボードのルートテーブルを選択します。
2. ClickHouse VPC IDを検索します。プライベートサブネットに接続された各ルートテーブルを編集します。
3. ルートタブの下の編集ボタンをクリックします。
4. もう1つのルートを追加をクリックします。
5. 宛先にターゲットVPCのCIDR範囲を入力します。
6. “ピア接続”を選択し、ターゲットのピア接続IDを選択します。

<br />

<img src={require('./images/byoc-vpcpeering-3.png').default}
    alt='BYOC ルートテーブルの追加'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### ステップ5: ターゲットVPCルートテーブルに宛先を追加 {#step-5-add-destination-to-the-target-vpc-route-tables}
ピアリングAWSアカウントで、
1. VPCダッシュボードのルートテーブルを選択します。
2. ターゲットVPC IDを検索します。
3. ルートタブの下の編集ボタンをクリックします。
4. もう1つのルートを追加をクリックします。
5. 宛先にClickHouse VPCのCIDR範囲を入力します。
6. “ピア接続”を選択し、ターゲットのピア接続IDを選択します。

<br />

<img src={require('./images/byoc-vpcpeering-4.png').default}
    alt='BYOC ルートテーブルの追加'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### ステップ6: ピア接続アクセスを許可するためにセキュリティグループを編集 {#step-6-edit-security-group-to-allow-peered-vpc-access}
ClickHouse BYOCアカウントで、
1. ClickHouse BYOCアカウントで、EC2に移動し、infra-xx-xxx-ingress-privateという名前のプライベートロードバランサーを見つけます。

<br />

<img src={require('./images/byoc-plb.png').default}
    alt='BYOC プライベートロードバランサー'
    class='image'
    style={{width: '800px'}}
/>

<br />

2. 詳細ページのセキュリティタブの下で、`k8s-istioing-istioing-xxxxxxxxx`のような名前のパターンに従った関連セキュリティグループを見つけます。

<br />

<img src={require('./images/byoc-securitygroup.png').default}
    alt='BYOC プライベートロードバランサーセキュリティグループ'
    class='image'
    style={{width: '800px'}}
/>

<br />

3. このセキュリティグループのインバウンドルールを編集し、ピア接続VPC CIDR範囲を追加します（または必要に応じてCIDR範囲を指定します）。 

<br />

<img src={require('./images/byoc-inbound-rule.png').default}
    alt='BYOC セキュリティグループインバウンドルール'
    class='image'
    style={{width: '800px'}}
/>

<br />

---
これで、ClickHouseサービスはピア接続されたVPCからアクセス可能なはずです。

ClickHouseにプライベートにアクセスするために、プライベートロードバランサーとエンドポイントが、ユーザーのピア接続されたVPCからの安全な接続のためにプロビジョニングされます。プライベートエンドポイントは、パブリックエンドポイント形式に`-private`サフィックスが付いています。例えば:  
- **パブリックエンドポイント**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`  
- **プライベートエンドポイント**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

オプションで、ピアリングが正常に機能していることを確認した後、ClickHouse BYOCのパブリックロードバランサーの削除をリクエストできます。

## アップグレードプロセス {#upgrade-process}

私たちは、ClickHouseデータベースのバージョンアップグレード、ClickHouse Operator、EKS、およびその他のコンポーネントを含むソフトウェアを定期的にアップグレードしています。

シームレスなアップグレード（例: ローリングアップグレードや再起動）を目指していますが、ClickHouseのバージョン変更やEKSノードのアップグレードなど、一部はサービスに影響を与える可能性があります。顧客はメンテナンスウィンドウ（例: 毎週火曜日の午前1時PDT）を指定でき、この時間中のみそのようなアップグレードが実施されることを保証します。

:::note
メンテナンスウィンドウは、セキュリティと脆弱性の修正には適用されません。これらはオフサイクルアップグレードとして処理され、適切な時間を調整し、運用への影響を最小限に抑えるための迅速なコミュニケーションがあります。
:::

## CloudFormation IAMロール {#cloudformation-iam-roles}

### ブートストラップIAMロール {#bootstrap-iam-role}

ブートストラップIAMロールには以下の権限があります：

- **EC2およびVPC操作**：VPCおよびEKSクラスターのセットアップに必要。  
- **S3操作（例: `s3:CreateBucket`）**：ClickHouse BYOCストレージ用のバケット作成に必要。  
- **`route53:*` 権限**：Route 53でレコードを構成するための外部DNSに必要。  
- **IAM操作（例: `iam:CreatePolicy`）**：コントローラーが追加のロールを作成するために必要（詳細は次のセクションを参照）。  
- **EKS操作**：`clickhouse-cloud`プレフィックスで始まる名前のリソースに制限されます。

### コントローラーによって作成された追加IAMロール {#additional-iam-roles-created-by-the-controller}

CloudFormationを介して作成された `ClickHouseManagementRole` に加えて、コントローラーは複数の追加ロールを作成します。

これらのロールは、顧客のEKSクラスター内で実行されているアプリケーションによって引き受けられます：
- **ステートエクスポーターロール**  
  - ClickHouseのコンポーネントで、サービス健康情報をClickHouse Cloudに報告します。  
  - ClickHouse Cloudが所有するSQSキューに書き込みできる権限が必要です。  
- **ロードバランサーコントローラー**  
  - 標準のAWSロードバランサーコントローラー。  
  - ClickHouseサービスのボリュームを管理するためのEBS CSIコントローラー。  
- **External-DNS**  
  - DNS構成をRoute 53に伝播させます。  
- **Cert-Manager**  
  - BYOCサービスドメインのTLS証明書をプロビジョニングします。  
- **クラスターオートスケーラー**  
  - 必要に応じてノードグループのサイズを調整します。

**K8s-control-plane**および**k8s-worker**ロールは、AWS EKSサービスによって引き受けられることを意図しています。

最後に、**`data-plane-mgmt`**は、ClickHouse Cloudコントロールプレーンコンポーネントが`ClickHouseCluster`やIstioバーチャルサービス/ゲートウェイといった必要なカスタムリソースを調整できるようにします。

## ネットワーク境界 {#network-boundaries}

このセクションでは、顧客のBYOC VPCへのさまざまなネットワークトラフィックについて説明します：

- **インバウンド**: 顧客のBYOC VPCに入るトラフィック。  
- **アウトバウンド**: 顧客のBYOC VPCから発生し、外部の宛先に送信されるトラフィック。  
- **パブリック**: 公共のインターネットからアクセス可能なネットワークエンドポイント。  
- **プライベート**: VPCピアリング、VPCプライベイトリンク、またはTailscaleなどのプライベート接続を介してのみアクセス可能なネットワークエンドポイント。  

**IstioのイングレスはAWS NLBの背後にデプロイされ、ClickHouseクライアントトラフィックを受け入れます。**  

*インバウンド、パブリック（プライベートにすることも可能）*

IstioのイングレスゲートウェイはTLSを終了します。証明書はLet's EncryptによってCertManagerによりプロビジョニングされ、EKSクラスター内のシークレットとして保存されます。IstioとClickHouse間のトラフィックは、[AWSによって暗号化されています](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/encrypting-data-at-rest-and--in-transit.html#:~:text=All%20network%20traffic%20between%20AWS,supported%20Amazon%20EC2%20instance%20types) これは同じVPCに存在するためです。 

デフォルトでは、イングレスはIPホワイトリストフィルタリングを持つ公共にアクセス可能です。顧客はVPCピアリングを構成してこれをプライベートにし、公共接続を無効にすることができます。[IPフィルター](/cloud/security/setting-ip-filters)を設定してアクセスを制限することを強くお勧めします。

### アクセスのトラブルシューティング {#troubleshooting-access}

*インバウンド、パブリック（プライベートにすることも可能）*

ClickHouse Cloudエンジニアは、Tailscaleを介してトラブルシューティングアクセスを必要とします。BYOCデプロイメント用に、彼らにはジャストインタイムの証明書ベースの認証が提供されます。  

### 請求スクリーピング {#billing-scraper}

*アウトバウンド、プライベート*

請求スクリーパーは、ClickHouseから請求データを収集し、それをClickHouse Cloudが所有するS3バケットに送信します。  

これはClickHouseサーバコンテナと並行してサイドカーとして実行され、CPUおよびメモリメトリックを定期的にスクリーピングします。同じリージョン内の要求は、VPCゲートウェイサービスエンドポイントを介してルーティングされます。

### アラート {#alerts}

*アウトバウンド、パブリック*

AlertManagerは、顧客のClickHouseクラスターが不健康な場合にClickHouse Cloudにアラートを送信するように構成されています。  

メトリックとログはカスタマーのBYOC VPC内に保存されます。ログは現在、ローカルのEBSに保存されています。将来のアップデートでは、これらはBYOC VPC内のClickHouseサービスであるLogHouseに保存される予定です。メトリックは、BYOC VPC内にローカルに保存されているPrometheusおよびThanosスタックを使用します。  

### サービス状態 {#service-state}

*アウトバウンド*

ステートエクスポーターはClickHouseサービス状態情報をClickHouse Cloudが所有するSQSに送信します。

## 機能 {#features}

### サポートされている機能 {#supported-features}

- **SharedMergeTree**: ClickHouse CloudとBYOCは同じバイナリと設定を使用します。したがって、SharedMergeTreeなどClickHouseコアのすべての機能がBYOCでサポートされています。
- **サービス状態管理のためのコンソールアクセス**:  
  - 開始、停止、終了などの操作をサポートします。  
  - サービスとステータスを表示できます。  
- **バックアップおよび復元**。  
- **手動の垂直および水平スケーリング**。  
- **アイドリング**。  
- **ウェアハウス**: コンピュート-コンピュート分離  
- **Tailscaleによるゼロトラストネットワーク**。  
- **モニタリング**:  
  - クラウドコンソールには、サービスの健康を監視するための組み込みの健康ダッシュボードが含まれています。  
  - Prometheusによる中央集中的なモニタリングのためのスクリーピング、GrafanaおよびDatadog。セットアップの指示は[Prometheusドキュメント](/integrations/prometheus)を参照してください。  
- **VPCピアリング**。  
- **統合**: 完全なリストは[このページ](/integrations)を参照してください。  
- **安全なS3**。  
- **[AWS PrivateLink](https://aws.amazon.com/privatelink/)。**  

### 予定されている機能（現在はサポートされていません） {#planned-features-currently-unsupported}

- [AWS KMS](https://aws.amazon.com/kms/) 別名CMEK（顧客管理の暗号化キー）
- インジェスト用のClickPipes
- オートスケーリング
- MySQLインターフェース

## よくある質問 {#faq}

### コンピュート {#compute}

#### この単一のEKSクラスター内に複数のサービスを作成できますか？ {#can-i-create-multiple-services-in-this-single-eks-cluster}

はい。インフラストラクチャは、AWSアカウントとリージョンの組み合わせごとに一度プロビジョニングすれば十分です。

### BYOCにどのリージョンをサポートしていますか？ {#which-regions-do-you-support-for-byoc}

BYOCはClickHouse Cloudと同じセットの[リージョン](/cloud/reference/supported-regions#aws-regions)をサポートしています。

#### リソースのオーバーヘッドがあるでしょうか？ ClickHouseインスタンス以外のサービスを実行するために必要なリソースは何ですか？ {#will-there-be-some-resource-overhead-what-are-the-resources-needed-to-run-services-other-than-clickhouse-instances}

ClickHouseインスタンス（ClickHouseサーバーとClickHouse Keeper）に加えて、`clickhouse-operator`、`aws-cluster-autoscaler`、Istioなどのサービスを実行し、監視スタックも運用しています。

現在、これらのワークロードを実行するために、専用のノードグループで3つのm5.xlargeノード（各AZに1つ）を使用しています。

### ネットワークとセキュリティ {#network-and-security}

#### インストール時に設定された権限を、セットアップ後に取り消すことはできますか？ {#can-we-revoke-permissions-set-up-during-installation-after-setup-is-complete}

現時点では、これは不可能です。

#### ClickHouseのエンジニアがトラブルシューティングのために顧客のインフラにアクセスできるための将来のセキュリティコントロールを考慮していますか？ {#have-you-considered-some-future-security-controls-for-clickhouse-engineers-to-access-customer-infra-for-troubleshooting}

はい。顧客がエンジニアのクラスタへのアクセスを承認できる顧客制御メカニズムを実装することが、私たちのロードマップにあります。現時点では、エンジニアはジャストインタイムでクラスタにアクセスするために内部のエスカレーションプロセスを経る必要があります。これは、私たちのセキュリティチームによって記録され、監査されます。

#### 作成されるVPC IP範囲のサイズはどのくらいですか？ {#what-is-the-size-of-the-vpc-ip-range-created}

デフォルトでは、BYOC VPCに `10.0.0.0/16` を使用します。将来の拡張のために少なくとも/22を予約することをお勧めしますが、サイズを制限したい場合は、30のサーバポッドに制限される可能性が高い場合は/23を使用することも可能です。

#### メンテナンスの頻度を決められますか？ {#can-i-decide-maintenance-frequency}

サポートに連絡してメンテナンスウィンドウを設定してください。最低でも週に1回のアップデートスケジュールを期待してください。 

## 視認性 {#observability}

### 組み込みの監視ツール {#built-in-monitoring-tools}

#### 視認性ダッシュボード {#observability-dashboard}

ClickHouse Cloudには、メモリ使用量、クエリレート、I/Oなどのメトリックを表示する高度な視認性ダッシュボードが含まれています。これはClickHouse CloudのWebコンソールインターフェースの**監視**セクションからアクセスできます。

<br />

<img src={require('./images/byoc-3.png').default}
    alt='視認性ダッシュボード'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### 高度なダッシュボード {#advanced-dashboard}

`system.metrics`、`system.events`、`system.asynchronous_metrics`などのシステムテーブルからのメトリックを使用して、サーバのパフォーマンスとリソース使用状況を詳細に監視できるダッシュボードをカスタマイズできます。

<br />

<img src={require('./images/byoc-4.png').default}
    alt='高度なダッシュボード'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### Prometheus統合 {#prometheus-integration}

ClickHouse Cloudは、監視用にメトリックをスクリーピングするために使用できるPrometheusエンドポイントを提供します。これにより、GrafanaやDatadogなどのツールとの統合が可能になります。

**HTTPSエンドポイント `/metrics_all` を介したサンプルリクエスト**
    
```bash
curl --user <username>:<password> https://i6ro4qarho.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud:8443/metrics_all
```

**サンプルレスポンス**

```bash
# HELP ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes ディスクに保存されているバイト数 `s3disk` の
# TYPE ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes gauge
ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes{hostname="c-jet-ax-16-server-43d5baj-0"} 62660929
# HELP ClickHouse_CustomMetric_NumberOfBrokenDetachedParts 壊れた切り離されたパーツの数
# TYPE ClickHouse_CustomMetric_NumberOfBrokenDetachedParts gauge
ClickHouse_CustomMetric_NumberOfBrokenDetachedParts{hostname="c-jet-ax-16-server-43d5baj-0"} 0
# HELP ClickHouse_CustomMetric_LostPartCount 最も古い変異の年齢（秒数）
# TYPE ClickHouse_CustomMetric_LostPartCount gauge
ClickHouse_CustomMetric_LostPartCount{hostname="c-jet-ax-16-server-43d5baj-0"} 0
# HELP ClickHouse_CustomMetric_NumberOfWarnings サーバによって発行された警告の数。通常、設定ミスを示します。
# TYPE ClickHouse_CustomMetric_NumberOfWarnings gauge
ClickHouse_CustomMetric_NumberOfWarnings{hostname="c-jet-ax-16-server-43d5baj-0"} 2
# HELP ClickHouseErrorMetric_FILE_DOESNT_EXIST FILE_DOESNT_EXIST
# TYPE ClickHouseErrorMetric_FILE_DOESNT_EXIST counter
ClickHouseErrorMetric_FILE_DOESNT_EXIST{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 1
# HELP ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE UNKNOWN_ACCESS_TYPE
# TYPE ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE counter
ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 8
# HELP ClickHouse_CustomMetric_TotalNumberOfErrors サーバが最後に再起動されてからのエラーの総数
# TYPE ClickHouse_CustomMetric_TotalNumberOfErrors gauge
ClickHouse_CustomMetric_TotalNumberOfErrors{hostname="c-jet-ax-16-server-43d5baj-0"} 9
```

**認証**

ClickHouseのユーザー名とパスワードのペアを使用して認証できます。メトリックをスクリーピングするために、最小限の権限を持つ専用ユーザーの作成をお勧めします。最低限、レプリカ間で`system.custom_metrics`テーブルに対する`READ`権限が必要です。例えば：

```sql
GRANT REMOTE ON *.* TO scraping_user          
GRANT SELECT ON system.custom_metrics TO scraping_user
```

**Prometheusの構成**

以下は、サンプル構成です。`targets`エンドポイントは、ClickHouseサービスにアクセスするために使用されるエンドポイントと同じです。

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

詳細については、[このブログ記事](https://clickhouse.com/blog/clickhouse-cloud-now-supports-prometheus-monitoring)および[ClickHouse用のPrometheusセットアップドキュメント](/integrations/prometheus)もご覧ください。
