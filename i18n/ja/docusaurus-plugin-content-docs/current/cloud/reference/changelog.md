---
slug: /whats-new/cloud
sidebar_label: Cloud Changelog
title: Cloud Changelog
---

このClickHouse Cloud変更履歴に加え、[Cloud Compatibility](/cloud/reference/cloud-compatibility.md)ページをご覧ください。

## 2025年2月21日 {#february-21-2025}

### AWS向けClickHouse BYOC（Bring Your Own Cloud）が一般提供開始！ {#clickhouse-byoc-for-aws-ga}

このデプロイメントモデルでは、データプレーンコンポーネント（コンピュート、ストレージ、バックアップ、ログ、メトリック）が顧客のVPC内で動作し、コントロールプレーン（Webアクセス、API、請求）はClickHouseのVPC内に残ります。このセットアップは、すべてのデータが安全な顧客環境内に留まることを保証し、厳格なデータ居住要件を遵守する必要がある大規模なワークロードに最適です。

- 詳細については、BYOCに関する[ドキュメント](/cloud/reference/byoc)を参照するか、[発表ブログ記事](https://clickhouse.com/blog/announcing-general-availability-of-clickhouse-bring-your-own-cloud-on-aws)をお読みください。
- アクセスを希望される方は、[お問い合わせ](https://clickhouse.com/cloud/bring-your-own-cloud)ください。

### ClickPipesのPostgres CDCコネクタ {#postgres-cdc-connector-for-clickpipes}

ClickPipesのPostgres CDCコネクタが一般公開ベータ版となりました。この機能により、ユーザーはPostgresデータベースをClickHouse Cloudにシームレスに複製できます。

- 始めるには、ClickPipesのPostgres CDCコネクタに関する[ドキュメント](https://clickhouse.com/docs/integrations/clickpipes/postgres)を参照してください。
- 顧客のユースケースや機能に関する詳細は、[ランディングページ](https://clickhouse.com/cloud/clickpipes/postgres-cdc-connector)や[ローンチブログ](https://clickhouse.com/blog/postgres-cdc-connector-clickpipes-public-beta)をご覧ください。

### AWSでのClickHouse CloudのPCI準拠 {#pci-compliance-for-clickhouse-cloud-on-aws}

ClickHouse Cloudは、**us-east-1**および**us-west-2**地域の**エンタープライズ層**のお客様向けに**PCI準拠サービス**をサポートしています。PCI準拠環境でサービスを立ち上げたいユーザーは、[サポート](https://clickhouse.com/support/program)に連絡して支援を受けてください。

### Google Cloud Platformにおける透明データ暗号化と顧客管理暗号化キー {#tde-and-cmek-on-gcp}

**透明データ暗号化（TDE）**および**顧客管理暗号化キー（CMEK）**のサポートが、ClickHouse Cloudの**Google Cloud Platform（GCP）**で利用可能になりました。

- 詳細については、これらの機能に関する[ドキュメント](https://clickhouse.com/docs/cloud/security/cmek#transparent-data-encryption-tde)を参照してください。

### AWS中東（UAE）での利用可能性 {#aws-middle-east-uae-availability}

ClickHouse Cloudに新しい地域サポートが追加され、**AWS中東（UAE）me-central-1**地域で利用可能になりました。

### ClickHouse Cloudガードレール {#clickhouse-cloud-guardrails}

ClickHouse Cloudのベストプラクティスを促進し、安定した利用を確保するために、テーブル、データベース、パーティション、パーツの数に対するガードレールを導入しています。

- 詳細は、ドキュメントの[利用制限](https://clickhouse.com/docs/cloud/bestpractices/usage-limits)セクションを参照してください。
- 既にこれらの制限を超えている場合、10%の増加を許可します。質問がある場合は、[サポート](https://clickhouse.com/support/program)にご連絡ください。

## 2025年1月27日 {#january-27-2025}

### ClickHouse Cloudティアの変更 {#changes-to-clickhouse-cloud-tiers}

私たちは、顧客の変化していくニーズに対応するために製品を適応させることに専念しています。GA導入からの2年間で、ClickHouse Cloudは大きく進化し、顧客がどのようにクラウドサービスを活用しているかについて貴重な洞察を得ました。

ClickHouse Cloudサービスのサイズとコスト効率を最適化する新機能を導入します。これには、**コンピュート-コンピュート分離**、高性能マシンタイプ、**シングルレプリカサービス**が含まれます。また、自動スケーリングおよび管理されたアップグレードも、よりシームレスで反応的な方式で実行されるよう進化しています。

最も要求の厳しい顧客やワークロードのニーズに応えるため、業界特有のセキュリティおよびコンプライアンス機能に焦点を当て、基盤となるハードウェアやアップグレードに対するさらなるコントロール、高度な災害復旧機能を持つ**新しいエンタープライズティア**を追加します。

これらの変更をサポートするために、現在の**開発**および**本番**ティアを、進化する顧客ベースの使用方法により密接に一致させるように再構成します。新しいアイデアやプロジェクトを試すユーザー向けの**基本**ティア、ならびに、本番のワークロードや大規模データを扱うユーザーにマッチする**スケール**ティアを導入します。

これらの機能やその他の変更については、この[ブログ](https://clickhouse.com/blog/evolution-of-clickhouse-cloud-new-features-superior-performance-tailored-offerings)でお読みいただけます。既存の顧客は、新しい[プラン](https://clickhouse.com/pricing)を選択するためにアクションを取る必要があります。顧客向けのコミュニケーションは組織の管理者に電子メールで送信され、以下の[FAQ](/cloud/manage/jan-2025-faq/summary)では重要な変更とタイムラインをカバーしています。

### 倉庫：コンピュート-コンピュート分離（GA） {#warehouses-compute-compute-separation-ga}

コンピュート-コンピュート分離（「倉庫」とも呼ばれる）が一般公開されました。詳細については、[ブログ](https://clickhouse.com/blog/introducing-warehouses-compute-compute-separation-in-clickhouse-cloud)および[ドキュメント](/cloud/reference/warehouses)を参照してください。

### シングルレプリカサービス {#single-replica-services}

「シングルレプリカサービス」のコンセプトを両方のスタンドアロンオファリングとして、及び倉庫内で導入します。スタンドアロンオファリングとして、シングルレプリカサービスはサイズが制限されており、小規模なテストワークロードに使用されることを意図しています。倉庫内では、シングルレプリカサービスをより大きなサイズで展開し、高可用性を必要としないワークロード（例えば、再起動可能なETLジョブ）に活用できます。

### 垂直自動スケーリングの改善 {#vertical-auto-scaling-improvements}

「Make Before Break（MBB）」と呼ぶコンピュートレプリカのための新しい垂直スケーリングメカニズムを導入します。このアプローチでは、古いレプリカを取り除く前に新しいサイズの一つまたは複数のレプリカを追加することで、スケーリング操作中の能力損失を防ぎます。既存のレプリカを取り除く間のギャップをなくすことで、MBBはよりシームレスで中断の少ないスケーリングプロセスを実現します。特に、リソース利用率が高くなることで追加能力が必要になるスケールアップシナリオで利益があります。なぜなら、早期にレプリカを削除するとリソース制約がさらに悪化するからです。

### 水平スケーリング（GA） {#horizontal-scaling-ga}

水平スケーリングが一般公開されました。ユーザーは、APIおよびクラウドコンソールを通じてサービスをスケールアウトするために追加のレプリカを追加できます。詳細については、[ドキュメント](/manage/scaling#self-serve-horizontal-scaling)を参照してください。

### 設定可能なバックアップ {#configurable-backups}

顧客がバックアップを自身のクラウドアカウントにエクスポートする機能をサポート開始しました。詳細については、[ドキュメント](/cloud/manage/backups#configurable-backups)を参照してください。

### 管理されたアップグレードの改善 {#managed-upgrade-improvements}

安全な管理されたアップグレードは、データベースが新機能を追加しながら最新の状態を保つことを可能にし、ユーザーに大きな価値を提供します。この導入により、アップグレードにも「make before break」（またはMBB）アプローチを適用し、実行中のワークロードへの影響をさらに低減しました。

### HIPAAサポート {#hipaa-support}

HIPAAに準拠した地域（AWS `us-east-1`、`us-west-2`とGCP `us-central1`、`us-east1`）で現在HIPAAをサポートします。オンボーディングを希望する顧客は、ビジネスアソシエイト契約（BAA）に署名し、準拠したバージョンの地域にデプロイする必要があります。HIPAAに関する詳細は、[ドキュメント](/cloud/security/security-and-compliance)をご覧ください。

### スケジュールされたアップグレード {#scheduled-upgrades}

ユーザーはサービスのアップグレードをスケジュールできます。この機能はエンタープライズ層のサービスのみサポートされています。スケジュールされたアップグレードに関する詳細は、[ドキュメント](/manage/updates)を参照してください。

### 複雑な型のための言語クライアントサポート {#language-client-support-for-complex-types}

[Golang](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.30.1)、[Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.11)、および[NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.1)クライアントがDynamic、Variant、およびJSON型のサポートを追加しました。

### Refreshable Materialized ViewsのためのDBTサポート {#dbt-support-for-refreshable-materialized-views}

DBTは、`1.8.7`リリースで[Refreshable Materialized Views](https://github.com/ClickHouse/dbt-clickhouse/releases/tag/v1.8.7)をサポートするようになりました。

### JWTトークンサポート {#jwt-token-support}

JDBCドライバv2、clickhouse-java、[Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.12)および[NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.0)クライアントでJWTベースの認証のサポートが追加されました。

JDBC / Javaは、リリース時に[0.8.0](https://github.com/ClickHouse/clickhouse-java/releases/tag/v0.8.0)となる予定です - ETAは未定です。

### Prometheus統合の改善 {#prometheus-integration-improvements}

Prometheusへの統合にいくつかの拡張機能を追加しました。

- **組織レベルのエンドポイント**。ClickHouse CloudのPrometheus統合への拡張機能を導入しました。サービスレベルのメトリックに加えて、APIには**組織レベルのメトリック**用のエンドポイントが含まれています。この新しいエンドポイントは、組織内のすべてのサービスのメトリックを自動的に収集し、Prometheusコレクターへのメトリックをエクスポートするプロセスを簡素化します。これらのメトリックは、GrafanaやDatadogなどの可視化ツールと統合され、組織のパフォーマンスのより包括的なビューを提供します。

  この機能はすべてのユーザーに提供されています。詳細は[こちら](/integrations/prometheus)をご覧ください。

- **フィルタリングされたメトリック**。ClickHouse CloudのPrometheus統合において、フィルタリングされたメトリックリストを返すことに対するサポートが追加されました。この機能は、サービスの健全性を監視するために重要なメトリックに焦点を当てることを可能にし、レスポンスペイロードのサイズを削減します。

  この機能はAPIのオプションクエリパラメータを介して利用可能であり、データ収集の最適化やGrafanaやDatadogなどのツールとの統合を簡素化します。
  
  フィルタリングされたメトリック機能は現在すべてのユーザーに利用可能です。詳細は[こちら](/integrations/prometheus)をご覧ください。

## 2024年12月20日 {#december-20-2024}

### マーケットプレイスのサブスクリプション組織添付 {#marketplace-subscription-organization-attachment}

新しいマーケットプレイスのサブスクリプションを既存のClickHouse Cloud組織に添付できるようになりました。マーケットプレイスへのサブスクリプションが完了し、ClickHouse Cloudにリダイレクトされると、過去に作成された既存の組織を新しいマーケットプレイスのサブスクリプションに接続できます。この時点から、組織内のリソースはマーケットプレイスを介して請求されます。 

<img alt="Add marketplace subscription"
  style={{width: '600px'}}
  src={require('./images/add_marketplace.png').default} />

### OpenAPIキーの有効期限強制 {#force-openapi-key-expiration}

APIキーの有効期限オプションを制限し、有効期限が切れていないOpenAPIキーを作成しないようにすることが可能になりました。この制限を有効にするには、ClickHouse Cloudサポートチームに連絡してください。

### 通知用のカスタムメール {#custom-emails-for-notifications}

組織の管理者は、特定の通知に追加の受信者として別のメールアドレスを追加できるようになりました。これは、エイリアスに通知を送信したり、ClickHouse Cloudのユーザーでない組織内の他のユーザーに通知を送信したりする場合に便利です。この設定をするには、クラウドコンソールの通知設定に移動し、通知を受信したいメールアドレスを編集してください。  

## 2024年12月6日 {#december-6-2024}

### BYOC（ベータ） {#byoc-beta}

AWS向けのBring Your Own Cloudがベータ版で利用可能になりました。このデプロイメントモデルでは、ClickHouse Cloudを自分のAWSアカウント内でデプロイして実行できます。11以上のAWSリージョンでのデプロイをサポートしており、今後さらに追加される予定です。アクセスが必要な場合は、[サポートにお問い合わせ](https://clickhouse.com/support/program)ください。このデプロイメントは大規模デプロイメントに限定されています。

### ClickPipesのPostgres変更データキャプチャ（CDC）コネクタ（一般ベータ） {#postgres-change-data-capture-cdc-connector-in-clickpipes-public-beta}

このターンキー統合により、顧客はPostgresデータベースをClickHouse Cloudに数回のクリックで複製し、ClickHouseを利用した超高速分析が可能になります。このコネクタを使用して、Postgresからの継続的な複製や一時的なマイグレーションの両方が可能です。

### ダッシュボード（ベータ） {#dashboards-beta}

今週、ClickHouse Cloudにおけるダッシュボードのベータ版ローンチを発表できることを嬉しく思います。ダッシュボードを使用すると、ユーザーは保存したクエリを可視化に変換し、可視化をダッシュボードに整理し、クエリパラメータを使用してダッシュボードと対話できます。始めるには、[ダッシュボードドキュメント](/cloud/manage/dashboards)に従ってください。

<img alt="Dashboards Beta"
  style={{width: '600px'}}
  src={require('./images/beta_dashboards.png').default} />

### クエリAPIエンドポイント（GA） {#query-api-endpoints-ga}

ClickHouse CloudでのクエリAPIエンドポイントのGAリリースを発表できることを嬉しく思います。クエリAPIエンドポイントにより、保存したクエリのためのRESTful APIエンドポイントを数回のクリックでセットアップし、言語クライアントや認証の複雑さを経ずにアプリケーション内のデータを消費し始めることができます。初期のローンチ以降、レイテンシの低減（特にコールドスタート）、エンドポイントのRBAC制御の増加、設定可能なCORS許可ドメイン、結果ストリーミング、すべてのClickHouse互換出力形式のサポートなど、多くの改善を行ってきました。

これらの改善に加え、汎用クエリAPIエンドポイントを発表します。このエンドポイントは、既存のフレームワークを利用して、ClickHouse Cloudサービスに対して任意のSQLクエリを実行することを可能にします。汎用エンドポイントはサービス設定ページから有効化および構成することができます。

始めるには、[クエリAPIエンドポイントのドキュメント](/cloud/get-started/query-endpoints)を参照してください。

<img alt="API Endpoints"
  style={{width: '600px'}}
  src={require('./images/api_endpoints.png').default} />

### ネイティブJSONサポート（ベータ） {#native-json-support-beta}

ClickHouse CloudのネイティブJSONサポートのベータ版を開始します。始めるには、[サポートに連絡](https://clickhouse.com/cloud/support)して、クラウドサービスを有効にしてください。

### ベクトル検索：ベクトル類似性インデックスによる（早期アクセス） {#vector-search-using-vector-similarity-indexes-early-access}

近似ベクトル検索のためのベクトル類似性インデックスを早期アクセスで発表します！

ClickHouseはすでにベクトルベースのユースケースに対して強力なサポートを提供しており、さまざまな[距離関数](https://clickhouse.com/blog/reinvent-2024-product-announcements#vector-search-using-vector-similarity-indexes-early-access)および線形スキャンの機能を備えています。最近では、[usearch](https://github.com/unum-cloud/usearch)ライブラリと階層ナビゲーション可能な小さな世界（HNSW）近似最近傍探索アルゴリズムを使用した実験的な[近似ベクトル検索](/engines/table-engines/mergetree-family/annindexes)アプローチも追加しました。

始めるには、[早期アクセスのウェイトリストにサインアップ](https://clickhouse.com/cloud/vector-search-index-waitlist)してください。

### ClickHouse-Connect（Python）およびClickHouse-Kafka-Connectユーザー {#clickhouse-connect-python-and-clickhouse-kafka-connect-users}

クライアントが`MEMORY_LIMIT_EXCEEDED`例外に遭遇する問題が発生した顧客に通知メールが送信されました。

以下にアップグレードしてください：
- Kafka-Connect: > 1.2.5
- ClickHouse-Connect（Java）: > 0.8.6

### ClickPipesはAWSでのVPC間リソースアクセスをサポートするようになりました {#clickpipes-now-supports-cross-vpc-resource-access-on-aws}

特定のデータソース（例：AWS MSK）への一方向アクセスを付与できるようになりました。AWS PrivateLinkとVPC Latticeを用いたVPC間リソースアクセスにより、パブリックネットワークを介してプライバシーやセキュリティを損なうことなく、VPCおよびアカウントの境界を超えて個別のリソースを共有することができます。リソース共有を設定するには、[発表記事](https://clickhouse.com/blog/clickpipes-crossvpc-resource-endpoints?utm_medium=web&utm_source=changelog)をお読みください。

<img alt="VPC ClickPipes"
  style={{width: '600px'}}
  src={require('./images/cross-vpc-clickpipes.png').default} />

### ClickPipesはAWS MSK向けにIAMをサポートするようになりました {#clickpipes-now-supports-iam-for-aws-msk}

AWS MSK ClickPipesを使用してMSKブローカーに接続するためにIAM認証を利用できるようになりました。始めるには、[ドキュメント](/integrations/clickpipes/kafka#iam)を参照してください。

### AWSでの新サービスのための最大レプリカサイズ {#maximum-replica-size-for-new-services-on-aws}

今後、AWS上で作成される新サービスは最大レプリカサイズ236 GiBを許可します。

## 2024年11月22日 {#november-22-2024}

### ClickHouse Cloudのための標準装備された高度な可観測性ダッシュボード {#built-in-advanced-observability-dashboard-for-clickhouse-cloud}

以前は、ClickHouseサーバーメトリックとハードウェアリソース利用を監視できる高度な可観測性ダッシュボードはオープンソースのClickHouseにのみ提供されていました。この機能が現在ClickHouse Cloudコンソールで利用可能になったことを嬉しく思います！

このダッシュボードを使用すると、[system.dashboards](/operations/system-tables/dashboards)テーブルに基づいてクエリを表示することができ、すべてを一つのUIで管理できます。**Monitoring > Service Health**ページにアクセスして、高度な可観測性ダッシュボードを今日から使用開始してください。

<img alt="Advanced Observability Dashboard"
  style={{width: '600px'}}
  src={require('./images/nov-22-dashboard.png').default} />

### AIによるSQLオートコンプリート {#ai-powered-sql-autocomplete}

AIコパイロットによる新しいSQLオートコンプリート機能を搭載し、あなたがクエリを記述する際にインラインでSQLを補完することができるようになりました！ この機能は、ClickHouse Cloudサービスの**"Enable Inline Code Completion"**設定を切り替えることで有効化できます。

<img alt="AI Copilot SQL autocomplete"
  style={{width: '600px'}}
  src={require('./images/nov-22-copilot.gif').default} />

### 新しい「Billing」ロール {#new-billing-role}

組織内のユーザーに、請求情報を表示および管理する権限を与える新しい**Billing**ロールを割り当てることができるようになりました。このロールは、サービスの設定や管理の権限を与えることなく請求情報を管理できます。新しいユーザーを招待するか、既存ユーザーのロールを編集して**Billing**ロールを割り当てます。

## 2024年11月8日 {#november-8-2024}

### ClickHouse Cloudの顧客通知 {#customer-notifications-in-clickhouse-cloud}

ClickHouse Cloudでは、請求およびスケーリングイベントに関するいくつかのインコンソール通知およびメール通知を提供しています。顧客はこれらの通知をクラウドコンソールの通知センターを介して、UIにのみ表示されるようにするか、メールを受信するか、その両方を指定することができます。サービスレベルで受信する通知のカテゴリおよび重要度を設定できます。

将来的には、他のイベントに関する通知も追加し、通知を受信するための追加の方法を提供する予定です。

通知の有効化に関する詳細は、[ClickHouseドキュメント](/cloud/notifications)をご覧ください。

<img alt="Customer notifications UI"
  style={{width: '600px'}}
  src={require('./images/nov-8-notifications.png').default} />

<br />

## 2024年10月4日 {#october-4-2024}

### ClickHouse CloudはGCP向けにHIPAA対応サービスをベータ版で提供開始 {#clickhouse-cloud-now-offers-hipaa-ready-services-in-beta-for-gcp}

保護された健康情報（PHI）に対するセキュリティを強化したい顧客は、現在ClickHouse Cloudの[Google Cloud Platform（GCP）](https://cloud.google.com/)にオンボーディングすることができます。ClickHouseは[HIPAAセキュリティールール](https://www.hhs.gov/hipaa/for-professionals/security/index.html)に規定された管理的、物理的、技術的保護手段を実装し、特定のユースケースやワークロードに基づいて構成可能なセキュリティ設定が提供されています。利用可能なセキュリティ設定に関する詳細は、[Security Shared Responsibility Model](/cloud/security/shared-responsibility-model)をご確認ください。

サービスはGCP `us-central-1`で**Dedicated**サービスタイプの顧客向けに提供され、ビジネスアソシエイト契約（BAA）が必要です。この機能へのアクセスを求める場合や、GCP、AWS、およびAzureの追加リージョンのウェイトリストに参加したい場合は、[営業](mailto:sales@clickhouse.com)または[サポート](https://clickhouse.com/support/program)に連絡してください。

### コンピュート-コンピュート分離がGCPおよびAzureのプライベートプレビューで利用可能に {#compute-compute-separation-is-now-in-private-preview-for-gcp-and-azure}

AWSにおけるコンピュート-コンピュート分離のプライベートプレビューを最近発表しました。嬉しいことに、これがGCPとAzureでも利用できるようになりました。

コンピュート-コンピュート分離により、特定のサービスを読み取り/書き込みサービスまたは読み取り専用サービスとして指定でき、成本とパフォーマンスを最適化するための最適なコンピュート構成をデザインできます。詳細については、[ドキュメントをお読みください](/cloud/reference/compute-compute-separation)。

### セルフサービスMFAリカバリーコード {#self-service-mfa-recovery-codes}

マルチファクター認証を使用している顧客は、電話を紛失したりトークンを誤って削除したりした際に使用できるリカバリーコードを取得できるようになりました。初めてMFAに登録する顧客には、セットアップ時にコードが提供されます。既存のMFAを持つ顧客は、既存のMFAトークンを削除し、新しいトークンを追加することでリカバリーコードを取得できます。

### ClickPipesの更新：カスタム証明書、レイテンシインサイトなど！ {#clickpipes-update-custom-certificates-latency-insights-and-more}

データをClickHouseサービスに取り込む最も簡単な方法であるClickPipesの最新の更新を共有できることに興奮しています！これらの新機能は、データ取り込みに対する制御を強化し、パフォーマンス指標の可視化を提供するために設計されています。

*Kafka用のカスタム認証証明書*

ClickPipes for Kafkaは、SASLおよび公開SSL/TLSを使用してKafkaブローカーのカスタム認証証明書をサポートするようになりました。ClickPipeセットアップ中にSSL証明書セクションで自身の証明書を簡単にアップロードすることができ、Kafkaへのより安全な接続が保証されます。

*Kafka及びKinesisのレイテンシメトリックの導入*

パフォーマンスの可視化は非常に重要です。ClickPipesにはレイテンシグラフが追加され、メッセージが生成されてからClickHouse Cloudに取り込まれるまでの時間を洞察できます。この新しいメトリックにより、データパイプラインのパフォーマンスをより詳細に監視し、適切に最適化できます。

<img alt="Latency Metrics graph"
  style={{width: '600px'}}
  src={require('./images/oct-4-latency-insights.png').default} />

<br />

*KafkaとKinesis用スケーリングコントロール（プライベートベータ）*

高スループットには、データ量とレイテンシの要件を満たすために追加のリソースが必要になることがあります。ClickPipesに向けた水平スケーリングを、クラウドコンソールを通じて直接利用できるようになりました。この機能は現在プライベートベータ版として提供されており、必要に応じてリソースをより効果的にスケールさせることができます。ベータ版に参加するには、[サポートにお問い合わせ](https://clickhouse.com/support/program)ください。

*KafkaとKinesisの生メッセージの取り込み*

解析せずにKafkaまたはKinesisメッセージ全体を取り込むことが可能になりました。ClickPipesでは、ユーザーが生のデータで作業する柔軟性を提供するために、完全なメッセージを単一のStringカラムにマッピングできる`_raw_message` [仮想カラム](/integrations/clickpipes/kafka#kafka-virtual-columns)をサポートします。

## 2024年8月29日 {#august-29-2024}

### 新しいTerraformプロバイダーのバージョン - v1.0.0 {#new-terraform-provider-version---v100}

Terraformを使用すると、ClickHouse Cloudサービスをプログラムで制御し、構成をコードとして保存できます。私たちのTerraformプロバイダーは約200,000回ダウンロードされていますが、正式にv1.0.0に達しました！この新しいバージョンには、より良い再試行ロジックやClickHouse Cloudサービスにプライベートエンドポイントを添付するための新しいリソースなどの改善が含まれています。[Terraformプロバイダーはこちら](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest)からダウンロードでき、[完全な変更履歴はこちら](https://github.com/ClickHouse/terraform-provider-clickhouse/releases/tag/v1.0.0)で確認できます。

### 2024年SOC 2 Type IIレポートおよび更新ISO 27001証明書 {#2024-soc-2-type-ii-report-and-updated-iso-27001-certificate}

私たちの2024年のSOC 2 Type IIレポートと更新されたISO 27001証明書の利用可能性を発表できることを嬉しく思います。これには、最近開始されたAzureでのサービス、AWSおよびGCPのサービスも含まれています。

SOC 2 Type IIは、ClickHouseユーザーに提供するサービスのセキュリティ、可用性、処理の整合性、機密性を達成するための当社の継続的なコミットメントを示しています。詳細については、アメリカ公認会計士協会（AICPA）が発行した[SOC 2 - Service Organizations: Trust Services Criteria](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services)および国際標準化機構（ISO）の[ISO/IEC 27001とは](https://www.iso.org/standard/27001)をご覧ください。

また、[Trust Center](https://trust.clickhouse.com/)でセキュリティおよびコンプライアンスの文書やレポートをご確認ください。

## 2024年8月15日 {#august-15-2024}

### コンピュート-コンピュート分離がAWSのプライベートプレビューで利用可能に {#compute-compute-separation-is-now-in-private-preview-for-aws}

既存のClickHouse Cloudサービスでは、レプリカが読み書きの両方を処理し、特定のレプリカを一つの操作のみに設定する方法はありませんでした。新しい機能「コンピュート-コンピュート分離」は、特定のサービスを読み取り/書き込みまたは読み取り専用に指定できるようにし、アプリケーションのための最適なコンピュート構成を設計することを可能にします。

この新機能により、同じオブジェクトストレージフォルダーを使用して複数のコンピュートノードグループを作成できます。詳細については、[コンピュート-コンピュート分離についてはこちら](/cloud/reference/compute-compute-separation)をご覧ください。この機能のプライベートプレビューに参加したい場合は、[サポート](https://clickhouse.com/support/program)にお問い合わせください。

<img alt="Example architecture for compute-compute separation"
  style={{width: '600px'}}
  src={require('./images/aug-15-compute-compute.png').default} />

### ClickPipes for S3およびGCSがGAになり、連続モードサポートを開始 {#clickpipes-for-s3-and-gcs-now-in-ga-continuous-mode-support}

ClickPipesは、ClickHouse Cloudにデータを取り込む最も簡単な方法です。[ClickPipes](https://clickhouse.com/cloud/clickpipes) for S3およびGCSが**一般公開**になったことをお知らせできることを嬉しく思います。ClickPipesは、単発バッチ取り込みと「連続モード」をサポートしています。取り込みタスクは、特定のリモートバケットからパターンに一致するすべてのファイルをClickHouseの宛先テーブルに読み込みます。「連続モード」では、ClickPipesジョブが常に実行されて、新たに追加されたファイルを取り込みます。これにより、ユーザーは任意のオブジェクトストレージバケットをClickHouse Cloudにデータを取り込むための完全なステージングエリアに変換できます。[ClickPipesに関する詳細は、こちらのドキュメント](/integrations/clickpipes)をご覧ください。

## 2024年7月18日 {#july-18-2024}

### メトリック用のPrometheusエンドポイントが一般公開されました {#prometheus-endpoint-for-metrics-is-now-generally-available}

前回のクラウド変更履歴で、ClickHouse Cloudからの[Prometheus](https://prometheus.io/)メトリックをエクスポートするためのプライベートプレビューを発表しました。この機能により、[ClickHouse Cloud API](/cloud/manage/api/api-overview)を使用して、GrafanaやDatadogなどの可視化ツールにメトリックを取り込むことが可能になります。この機能は現在**一般公開**されています。詳細については[こちらのドキュメント](/integrations/prometheus)をご覧ください。

### クラウドコンソール内のテーブルインスペクタ {#table-inspector-in-cloud-console}

ClickHouseには、スキーマを調査するためにテーブルを調べることを可能にする[`DESCRIBE`](/sql-reference/statements/describe-table)コマンドなどがあります。これらのコマンドはコンソールに出力されますが、すべてのテーブルやカラムに関する関連データを取得するために、いくつかのクエリを組み合わせる必要があるため、便利ではありません。

最近、クラウドコンソールに**テーブルインスペクタ**を導入しました。これを使用すると、SQLを書くことなくUIで重要なテーブルおよびカラム情報を取得できます。クラウドコンソールでサービスのテーブルインスペクタを試してみてください。スキーマ、ストレージ、圧縮などに関する情報を、1つの統一されたインターフェースで提供します。

<img alt="Table Inspector UI"
  style={{width: '800px', marginLeft: 0}}
  src={require('./images/july-18-table-inspector.png').default} />

### 新しいJavaクライアントAPI {#new-java-client-api}

私たちの[Javaクライアント](https://github.com/ClickHouse/clickhouse-java)は、ユーザーがClickHouseに接続するために使用する最も人気のあるクライアントの1つです。私たちは、APIを再設計し、さまざまなパフォーマンスの最適化を行うことで、より簡単で直感的に使用できるようにしました。これにより、JavaアプリケーションからClickHouseに接続する際が大幅に容易になります。更新されたJavaクライアントの使い方については、この[ブログ記事](https://clickhouse.com/blog/java-client-sequel)をご覧ください。
### 新しいアナライザーがデフォルトで有効になりました {#new-analyzer-is-enabled-by-default}

ここ数年、私たちはクエリ分析と最適化のための新しいアナライザーに取り組んできました。このアナライザーはクエリ性能を向上させ、より迅速かつ効率的な `JOIN` の最適化を可能にします。以前は、新しいユーザーが `allow_experimental_analyzer` 設定を使用してこの機能を有効にする必要がありました。しかし、この改善されたアナライザーは、新しい ClickHouse Cloud サービスでデフォルトで利用可能になりました。

さらなる改善をお楽しみに！私たちはさらなる最適化を計画中です。

## 2024年6月28日 {#june-28-2024}

### Microsoft Azure向けのClickHouse Cloudが一般提供開始！ {#clickhouse-cloud-for-microsoft-azure-is-now-generally-available}

私たちはこの5月にベータ版で Microsoft Azure のサポートを初めて発表しました。最新のクラウドリリースでは、Azure のサポートがベータ版から一般提供に移行されたことをお知らせできることを嬉しく思います。ClickHouse Cloud は、AWS、Google Cloud Platform、および Microsoft Azure の3大クラウドプラットフォームすべてで利用可能です。

このリリースには、[Microsoft Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/clickhouse.clickhouse_cloud) を通じてのサブスクリプションサポートも含まれています。サービスは以下の地域で初めてサポートされます：
- アメリカ合衆国：ウェスト US 3 (アリゾナ)
- アメリカ合衆国：イースト US 2 (バージニア)
- ヨーロッパ：ドイツ西中部 (フランクフルト)

特定の地域でのサポートを希望される場合は、ぜひ[お問い合わせください](https://clickhouse.com/support/program)。

### クエリログインサイト {#query-log-insights}

新しいクエリインサイト UI は、ClickHouse の組み込みクエリログを使用しやすくします。ClickHouse の `system.query_log` テーブルは、クエリ最適化、デバッグ、全体的なクラスターの健康状態および性能を監視するための重要な情報源です。唯一の注意点は、70 以上のフィールドとクエリごとの複数のレコードがあるため、クエリログを解釈するには急な学習曲線があることです。このクエリインサイトの初期バージョンは、クエリデバッグと最適化パターンを簡素化するための今後の作業のための青写真を提供します。この機能の改善を継続する中で、皆様のフィードバックをお待ちしておりますので、お気軽にご連絡ください—皆様の意見を心より感謝いたします！

<img alt="Query Insights UI"
  style={{width: '600px', marginLeft: 0}}
  src={require('./images/june-28-query-insights.png').default} />

### メトリック用のPrometheusエンドポイント (プライベートプレビュー) {#prometheus-endpoint-for-metrics-private-preview}

私たちの最も要望が多かった機能のひとつ：ClickHouse Cloud から [Prometheus](https://prometheus.io/) メトリックを [Grafana](https://grafana.com/) および [Datadog](https://www.datadoghq.com/) にエクスポートできるようになりました。Prometheus は ClickHouse を監視し、カスタムアラートを設定するためのオープンソースソリューションを提供します。ClickHouse Cloud サービスの Prometheus メトリックへのアクセスは、[ClickHouse Cloud API](/integrations/prometheus) を介して利用可能です。この機能は現在プライベートプレビュー中です。組織のためにこの機能を有効にするには、[サポートチーム](https://clickhouse.com/support/program) にお問い合わせください。

<img alt="Prometheus Metrics with Grafana"
  style={{width: '600px', marginLeft: 0}}
  src={require('./images/june-28-prometheus.png').default} />

### その他の機能: {#other-features}
- [設定可能なバックアップ](/cloud/manage/backups#configurable-backups) により、頻度、保持、およびスケジュールなどのカスタムバックアップポリシーを設定できるようになりました。

## 2024年6月13日 {#june-13-2024}

### Kafka ClickPipesコネクタの設定可能なオフセット (ベータ) {#configurable-offsets-for-kafka-clickpipes-connector-beta}

最近まで、新しい [Kafka Connector for ClickPipes](/integrations/clickpipes/kafka) を設定すると、常に Kafka トピックの先頭からデータを消費していました。この状況では、過去のデータを再処理したり、新規データを監視したり、正確なポイントから再開したりする必要がある場合に柔軟性が不足している可能性があります。

Kafka 用の ClickPipes は、Kafka トピックからのデータ消費に対する柔軟性と制御を高める新機能を追加しました。これにより、データを消費するオフセットを設定できるようになりました。

以下のオプションが利用可能です：
- 最初から：Kafka トピックの最初からデータを消費し始めます。このオプションは、すべての過去データを再処理する必要があるユーザーに最適です。
- 最新から：最新のオフセットからデータの消費を開始します。これは、新しいメッセージのみに関心があるユーザーに便利です。
- タイムスタンプから：特定のタイムスタンプ以降に生成されたメッセージからデータの消費を開始します。この機能により、正確なポイントからの処理を再開するためのより厳密な制御が可能になります。

<img alt="Configure offsets for Kafka connector"
  style={{width: '600px', marginLeft: 0}}
  src={require('./images/june-13-kafka-config.png').default} />

### サービスをファストリリースチャネルに登録 {#enroll-services-to-the-fast-release-channel}

ファストリリースチャネルを使用すると、サービスがリリーススケジュールの前に更新を受け取ることができます。以前は、この機能を有効にするにはサポートチームの支援が必要でした。現在は、ClickHouse Cloud コンソールを使用して、この機能を直接サービスに対して有効にできるようになりました。単に **設定** に移動し、 **ファストリリースに登録** をクリックしてください。これで、サービスは利用可能な更新をすぐに受け取ることができます！

<img alt="Enroll in Fast releases"
  style={{width: '500px', marginLeft: 0}}
  src={require('./images/june-13-fast-releases.png').default} />

### 水平スケーリングのためのTerraformサポート {#terraform-support-for-horizontal-scaling}

ClickHouse Cloud は、[水平スケーリング](/manage/scaling#vertical-and-horizontal-scaling) をサポートしており、同じサイズの追加レプリカをサービスに追加する能力を提供します。水平スケーリングは、並行クエリをサポートするための性能向上と並列処理を改善します。以前は、レプリカを追加するには ClickHouse Cloud コンソールまたは API を使用する必要がありました。これにより、Terraform を使用してサービスからレプリカを追加または削除できるようになり、必要に応じて ClickHouse サービスをプログラムでスケールできます。

詳細については、[ClickHouse Terraform プロバイダー](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)をご覧ください。

## 2024年5月30日 {#may-30-2024}

### チームメイトとクエリを共有 {#share-queries-with-your-teammates}

SQLクエリを書くと、チームの他のメンバーもそのクエリが有用だと感じる可能性が高いです。以前は、Slack やメール経由でクエリを送信する必要があり、クエリを編集した場合にチームメイトがそのクエリに対する自動更新を受け取る方法はありませんでした。

このたび、ClickHouse Cloud コンソールを介してクエリを簡単に共有できるようになったことをお知らせできることを嬉しく思います。クエリエディターから、全チームまたは特定のチームメンバーと直接クエリを共有できます。また、彼らが読み取り専用または書き込み専用のアクセス権を持っているかどうかを指定することもできます。クエリエディターの **共有** ボタンをクリックして、新しい共有クエリ機能をお試しください。

<img alt="Share queries" style={{width: '500px', marginLeft: 0}} src={require('./images/may-30-share-queries.png').default} />

### Microsoft Azure向けのClickHouse Cloudがベータ版に {#clickhouse-cloud-for-microsoft-azure-is-now-in-beta}

ついに、Microsoft Azure上に ClickHouse Cloud サービスを作成する能力を実現しました！私たちはすでにプライベートプレビュー プログラムの一環として Azure で ClickHouse Cloud を使用している多くの顧客を獲得しています。今では、誰でも Azure で自分のサービスを作成できるようになりました。AWS および GCP でサポートされているお気に入りの ClickHouse 機能のすべてが Azure でも利用可能です。

次の数週間で、ClickHouse Cloud for Azure を一般提供できると期待しています。[このブログ記事をお読みください](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta) でさらに詳しく学ぶか、ClickHouse Cloud コンソールを介して Azure の新しいサービスを作成してください。

注意：**開発**サービスに関しては、現時点ではサポートされていません。

### クラウドコンソールを介してプライベートリンクを設定 {#set-up-private-link-via-the-cloud-console}

私たちのプライベートリンク機能を使用すると、公開インターネットにトラフィックを指向することなく、クラウドプロバイダアカウント内の内部サービスと ClickHouse Cloud サービスを接続できます。これにより、コストを節約し、セキュリティを強化できます。以前は、これを設定するのが難しく、ClickHouse Cloud API を使用する必要がありました。

今では、ClickHouse Cloud コンソールから直接数回のクリックでプライベートエンドポイントを設定できます。サービスの **設定** に移動し、 **セキュリティ** セクションに移動して **プライベートエンドポイントを設定** をクリックしてください。

![Set up private endpoint](./images/may-30-private-endpoints.png)

## 2024年5月17日 {#may-17-2024}

### ClickPipesを使用してAmazon Kinesisからデータを取り込む (ベータ) {#ingest-data-from-amazon-kinesis-using-clickpipes-beta}

ClickPipes は、コーディングなしでデータを取り込むための ClickHouse Cloud 専用サービスです。Amazon Kinesis は、ストリーミングデータを取り込み、処理のために保存するための AWS の完全管理型サービスです。私たちは、最も要望の多かった統合のひとつである Amazon Kinesis の ClickPipes ベータ版を発表できることを嬉しく思います。ClickPipes にさらに多くの統合を追加する予定ですので、サポートしてほしいデータソースをぜひお知らせください！この機能の詳細については[こちらでお読みください](https://clickhouse.com/blog/clickpipes-amazon-kinesis)。

Cloud コンソールで ClickPipes 用の新しい Amazon Kinesis 統合をお試しいただけます：

![Amazon Kinesis on ClickPipes](./images/may-17-kinesis.png)

### 設定可能なバックアップ (プライベートプレビュー) {#configurable-backups-private-preview}

バックアップはすべてのデータベースにとって重要です（どんなに信頼できるものであっても）、私たちは ClickHouse Cloud の最初からバックアップを非常に重視しています。今週、設定可能なバックアップを導入しました。これにより、サービスのバックアップに対してはるかに多くの柔軟性が提供されます。開始時間、保持期間、および頻度を制御できるようになりました。この機能は **生産**および **専用**サービスで利用可能で、**開発**サービスでは利用できません。この機能はプライベートプレビュー中ですので、サービスを有効にするには support@clickhouse.com にお問い合わせください。この設定可能なバックアップの詳細については[こちらでお読みください](https://clickhouse.com/blog/configurable-backups-in-clickhouse-cloud)。

### SQLクエリからAPIを作成する (ベータ) {#create-apis-from-your-sql-queries-beta}

ClickHouse 用の SQL クエリを書いても、アプリケーションにクエリを公開するには、ドライバを介して ClickHouse に接続する必要があります。今では **クエリエンドポイント** 機能を使用して、本設定なしで API から直接 SQL クエリを実行できるようになりました。クエリエンドポイントを指定して、JSON、CSV、またはTSVを返すことができます。クラウドコンソールの "共有" ボタンをクリックして、この新機能をクエリと一緒にお試しください。このクエリエンドポイントについての詳細は[こちらでお読みいただけます](https://clickhouse.com/blog/automatic-query-endpoints)。

<img alt="Configure query endpoints" style={{width: '450px', marginLeft: 0}} src={require('./images/may-17-query-endpoints.png').default} />

### 公式のClickHouse認証が利用可能になりました {#official-clickhouse-certification-is-now-available}

ClickHouse 開発トレーニングコースには、12の無料トレーニングモジュールがあります。今週までは、ClickHouse の習熟度を証明する公式の方法はありませんでした。最近、**ClickHouse認定開発者**になるための公式試験を開始しました。この試験をクリアすることで、データ取り込み、モデリング、分析、パフォーマンス最適化などのトピックに関する ClickHouse の習熟度を現在および将来の雇用主と共有できます。この試験は[こちらで受けられます](https://clickhouse.com/learn/certification)、またはこの[ブログ記事](https://clickhouse.com/blog/first-official-clickhouse-certification)で ClickHouse 認証の詳細をご覧ください。

## 2024年4月25日 {#april-25-2024}

### ClickPipesを使用してS3およびGCSからデータを取り込む {#load-data-from-s3-and-gcs-using-clickpipes}

新しくリリースされたクラウドコンソールには、「データソース」という新しいセクションが追加されていることに気づいたかもしれません。「データソース」ページは、ClickPipes によって構築されているもので、さまざまなソースから ClickHouse Cloud にデータを簡単に挿入できる機能を提供します。

最近の ClickPipes のアップデートでは、Amazon S3 および Google Cloud Storage からの直接データアップロード機能が追加されました。組み込みのテーブル関数を使用することもできますが、ClickPipes は、ユーザーインターフェースを介して S3 および GCS からデータを取り込むための完全管理型サービスです。この機能はまだプライベートプレビュー中ですが、今すぐクラウドコンソールでお試しいただけます。

![ClickPipes S3 and GCS](./images/clickpipes-s3-gcs.png)

### 500以上のソースからClickHouse CloudにデータをロードするためのFivetranの使用 {#use-fivetran-to-load-data-from-500-sources-into-clickhouse-cloud}

ClickHouse は、すべての大規模データセットを迅速にクエリできますが、データは最初に ClickHouse に挿入する必要があります。Fivetran の包括的なコネクタのおかげで、ユーザーは500を超えるソースから迅速にデータをロードできるようになりました。Zendesk、Slack、またはお気に入りのアプリケーションからデータをロードする必要がある場合、Fivetran用の新しいClickHouse宛先が追加されることで、アプリケーションデータのターゲットデータベースとしてClickHouseを使用できるようになります。

これは、統合チームの多くの努力によって構築されたオープンソース統合です。私たちの[リリースブログ記事](https://clickhouse.com/blog/fivetran-destination-clickhouse-cloud)をチェックしたり、[GitHubリポジトリ](https://github.com/ClickHouse/clickhouse-fivetran-destination)にアクセスしてみてください。

### その他の変更 {#other-changes}

**コンソールの変更**
- SQLコンソールでの出力フォーマットのサポート

**統合の変更**
- ClickPipes Kafkaコネクタがマルチブローカー設定をサポート
- PowerBI コネクタが ODBC ドライバー設定オプションを提供することをサポート 

## 2024年4月18日 {#april-18-2024}

### AWS東京リージョンがClickHouse Cloudに新たに追加されました {#aws-tokyo-region-is-now-available-for-clickhouse-cloud}

このリリースでは、ClickHouse Cloud 向けに新たに AWS 東京リージョン (`ap-northeast-1`) が追加されました。ClickHouse を最速のデータベースにするために、私たちはラテンサを可能な限り低減するために各クラウドの地域を継続的に追加しています。更新されたクラウドコンソールで東京に新しいサービスを作成できます。

![Create Tokyo Service](./images/create-tokyo-service.png)

その他の変更：

### コンソールの変更 {#console-changes}
- ClickPipes for Kafka での Avro フォーマットのサポートが一般提供開始
- Terraform プロバイダー用のリソース（サービスとプライベートエンドポイント）をインポートするための完全なサポートを実装

### 統合の変更 {#integrations-changes}
- NodeJS クライアントの大規模安定リリース: クエリ + ResultSet の高度な TypeScript サポート、URL 設定
- Kafka コネクタ: DLQ に書き込む際の例外を無視していたバグを修正、Avro Enum 型のサポートを追加、[MSK](https://www.youtube.com/watch?v=6lKI_WlQ3-s) および [Confluent Cloud](https://www.youtube.com/watch?v=SQAiPVbd3gg) でのコネクタ使用ガイドを公開
- Grafana: UIでの Nullable 型のサポートを修正、動的 OTEL トレーステーブル名のサポートを修正
- DBT: カスタムマテリアライゼーションのモデル設定を修正
- Java クライアント: 不正確なエラーコード解析のバグを修正
- Python クライアント: 数値型のパラメーター結合を修正、クエリ結合での数値リストのバグを修正、SQLAlchemy Point のサポートを追加

## 2024年4月4日 {#april-4-2024}

### 新しい ClickHouse Cloud コンソールを紹介します {#introducing-the-new-clickhouse-cloud-console}

このリリースでは、新しいクラウドコンソールのプライベートプレビューを導入します。

ClickHouse では、開発者の体験を向上させることを常に考えています。私たちは、リアルタイムデータウェアハウスでの最速を提供するだけでは不十分で、使いやすさと管理のしやすさも必要であることを認識しています。

何千人もの ClickHouse Cloud ユーザーが毎月数十億のクエリを SQL コンソールで実行しているため、私たちは ClickHouse Cloud サービスとの対話をかつてないほど簡素化するための世界クラスのコンソールに投資することを決定しました。新しいクラウドコンソール体験は、スタンドアロン SQL エディターを管理コンソールと組み合わせた直感的な UI になります。

選ばれた顧客には、新しいクラウドコンソール体験のプレビューが提供されます - ClickHouse でのデータの探索と管理をユニファイドで没入型の方法で行うことができます。優先的なアクセスをご希望の方は、support@clickhouse.com までご連絡ください。

![New Cloud Console](./images/new-cloud-console.gif)

## 2024年3月28日 {#march-28-2024}

このリリースでは、Microsoft Azure、APIを介した水平スケーリング、およびプライベートプレビューのリリースチャネルのサポートを導入します。

### 一般的な更新 {#general-updates}
- プライベートプレビューでMicrosoft Azureのサポートを導入しました。アクセスを得るには、アカウント管理またはサポートにお問い合わせいただくか、[待機リスト](https://clickhouse.com/cloud/azure-waitlist)に参加してください。
- リリースチャネルの導入 - 環境タイプに基づいてアップグレードのタイミングを指定する機能。このリリースでは、「ファスト」リリースチャネルを追加しました。これにより、非生産環境を本番環境より先にアップグレードできます（有効にするにはサポートに問い合わせてください）。

### 管理の変更 {#administration-changes}
- API経由での水平スケーリング設定サポートを追加（プライベートプレビュー中、有効にするにはサポートに問い合わせてください）
- スタートアップ時にメモリエラーに遭遇したサービスを拡大するためのオートスケーリングを改善
- Terraformプロバイダーを介してAWSのCMEKのサポートを追加

### コンソールの変更 {#console-changes-1}
- Microsoftのソーシャルログインのサポートを追加
- SQLコンソールでのパラメータ化されたクエリ共有機能を追加
- クエリエディターのパフォーマンスを大幅に向上させました（いくつかのEU地域で5秒から1.5秒のレイテンシに短縮）

### 統合の変更 {#integrations-changes-1}
- ClickHouse OpenTelemetryエクスポータ: ClickHouse レプリケーションテーブルエンジンと統合テストのサポートを追加
- ClickHouse DBTアダプター: 辞書のマテリアライゼーションマクロのサポートを追加、TTL式サポートのテストを追加
- ClickHouse Kafka Connect Sink: Kafkaプラグインの発見との互換性を追加
- ClickHouse Java Client: 新しいクライアントAPI用の新パッケージを導入し、クラウドテスト用のテストカバレッジを追加
- ClickHouse NodeJS Client: 新しいHTTP keep-alive動作のためのテストとドキュメントを拡張。v0.3.0リリース以降利用可能
- ClickHouse Golang Client: マップ内のキーとしてのEnumのバグを修正; 接続プール内でエラーが発生した接続が残るバグを修正
- ClickHouse Python Client: SQLAlchemy用にNothing型のサポートを追加

### セキュリティ更新 {#security-updates}
- ClickHouse Cloudを更新し、「クエリキャッシュが有効なときにロールベースのアクセス制御がバイパスされる」を防ぐ (CVE-2024-22412) 

## 2024年3月14日 {#march-14-2024}

このリリースでは、新しいクラウドコンソール体験、S3およびGCSからのバルクロードのためのClickPipes、ClickPipesのKafka向けのAvroフォーマットサポートが早期アクセスで利用可能になりました。また、ClickHouseデータベースのバージョン24.1にアップグレードされ、機能追加やパフォーマンスおよびリソース使用の最適化が行われています。

### コンソールの変更 {#console-changes-2}
- 新しいクラウドコンソール体験が早期アクセスで利用可能（参加希望の方はサポートにお問い合わせください）。
- S3およびGCSからのバルクロードのためのClickPipesが早期アクセスで利用可能（参加希望の方はサポートにお問い合わせください）。
- ClickPipesのKafka向けのAvroフォーマットのサポートが早期アクセスで利用可能（参加希望の方はサポートにお問い合わせください）。

### ClickHouse バージョンのアップグレード {#clickhouse-version-upgrade}
- FINAL の最適化、ベクトル化の改善、より速い集約 - 詳細については [23.12 リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final) を参照ください。
- punycode、文字列の類似性、外れ値検出、マージとKeeperのメモリ最適化のための新機能 - 詳細については [24.1 リリースブログ](https://clickhouse.com/blog/clickhouse-release-24-01)および[プレゼンテーション](https://presentations.clickhouse.com/release_24.1/) を参照してください。
- この ClickHouse Cloud バージョンは 24.1 に基づいており、新機能、性能改善、バグ修正が数十件含まれています。コアデータベースの[変更履歴](/whats-new/changelog/2023#2312)で詳細を確認できます。

### 統合の変更 {#integrations-changes-2}
- Grafana: v4のダッシュボード移行、アドホックフィルタリングロジックの修正
- Tableau コネクタ: DATENAME 関数および "real" 引数の丸めを修正
- Kafka コネクタ: 接続初期化時の NPE を修正、JDBC ドライバーオプションの指定機能を追加
- Golang クライアント: レスポンス処理のメモリフットプリントを減らし、Date32 極端値を修正、圧縮が有効なときのエラー報告を修正
- Python クライアント: 日付パラメータにおけるタイムゾーンのサポートを向上させ、Pandas DataFrameのパフォーマンスを改善

## 2024年2月29日 {#february-29-2024}

このリリースでは、SQLコンソールアプリケーションのロード時間を改善し、ClickPipesにSCRAM-SHA-256認証のサポートを追加し、Kafka Connectのネスト構造サポートを拡張します。

### コンソールの変更 {#console-changes-3}
- SQLコンソールアプリケーションの初期ロード時間を最適化
- SQLコンソールのレース条件を修正し、「認証に失敗しました」のエラーを修正
- モニタリングページでの最近のメモリアロケーション値が時折不正確であることを修正
- SQLコンソールで時折発生する重複KILL QUERYコマンドの発行を修正
- ClickPipesでのKafkaデータソース用のSCRAM-SHA-256認証方法のサポートを追加

### 統合の変更 {#integrations-changes-3}
- Kafka コネクタ: 複雑なネストされた構造（Array、Map）のサポートを拡張; FixedString型のサポートを追加; 複数のデータベースへの取り込みのサポートを追加
- Metabase: ClickHouse 23.8未満との非互換性を修正
- DBT: モデル作成に設定を渡す機能を追加
- Node.js クライアント: 長時間のクエリ（>1時間）および空の値の処理を優雅に扱うサポートを追加

## 2024年2月15日 {#february-15-2024}

このリリースでは、コアデータベースのバージョンがアップグレードされ、Terraformを介してプライベートリンクを設定する機能が追加され、Kafka Connectを介して非同期挿入の正確な一度のセマンティクスのサポートが追加されます。

### ClickHouse バージョンのアップグレード {#clickhouse-version-upgrade-1}
- S3Queue テーブルエンジンは、S3 からの連続的かつスケジュールされたデータのロードのために生産準備が整いました - 詳細は [23.11 リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-11) を参照してください。
- FINAL のための重要なパフォーマンス向上と、ベクトル化の改善に伴うクエリの高速化 - 詳細は [23.12 リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final) をご覧ください。
- この ClickHouse Cloud バージョンは 23.12 に基づいており、新機能、性能改善、バグ修正が数十件含まれています。[コアデータベースの変更履歴](/whats-new/changelog/2023#2312)で詳細を確認できます。

### コンソールの変更 {#console-changes-4}
- Terraform プロバイダーを介してAWSプライベートリンクとGCPプライベートサービスコネクトを設定する機能を追加
- リモートファイルデータのインポートの強靭性を向上
- すべてのデータインポートにインポートステータス詳細フライアウトを追加
- s3 データのインポートにキー/シークレットキー認証情報のサポートを追加 

### 統合の変更 {#integrations-changes-4}
* Kafka Connect
    * 正確な一度のためのasync_insertサポート（デフォルトでは無効）
* Golang クライアント
    * DateTime結合の修正 
    * バッチ挿入のパフォーマンス向上
* Java クライアント
    * リクエストの圧縮に関する問題を修正 
 
### 設定の変更 {#settings-changes}
* `use_mysql_types_in_show_columns` はもはや必要ありません。MySQLインターフェースから接続すると自動的に有効になります。
* `async_insert_max_data_size` のデフォルト値が `10 MiB` になりました。

## 2024年2月2日 {#february-2-2024}

このリリースでは、Azure Event Hub に対する ClickPipes の利用可能性がもたらされ、v4 ClickHouse Grafana コネクタを使用したログやトレースのナビゲーションのワークフローが大幅に改善され、Flyway および Atlas データベーススキーマ管理ツールのサポートが初登場します。

### コンソールの変更 {#console-changes-5}
* Azure Event Hub のための ClickPipes サポートが追加されました
* 新しいサービスは、デフォルトのアイドル時間が 15 分に設定されます

### 統合の変更 {#integrations-changes-5}
* [Grafana 用の ClickHouse データソース](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/) v4 リリース
  * テーブル、ログ、タイムシリーズ、トレース用の専門的なエディターを持つクエリビルダーを完全に再構築
  * より複雑かつ動的なクエリをサポートするために完全に再構築されたSQLジェネレーター
  * ログとトレースビューの OpenTelemetry のファーストクラスサポートを追加
  * ログとトレースのデフォルトテーブルおよびカラムを指定できるように構成を拡張
  * カスタム HTTP ヘッダーを指定する機能を追加
  * さらに多くの改善 - 完全な[変更履歴](https://github.com/grafana/clickhouse-datasource/blob/main/CHANGELOG.md#400)を確認してください
* データベーススキーマ管理ツール
  * [FlywayがClickHouseのサポートを追加](https://github.com/flyway/flyway-community-db-support/packages/2037428)
  * [Ariga Atlas が ClickHouse サポートを追加](https://atlasgo.io/blog/2023/12/19/atlas-v-0-16#clickhouse-beta-program) 
* Kafka コネクタシンク
  * デフォルト値を持つテーブルへの取り込みを最適化
  * DateTime64 における文字列ベースの日付のサポートを追加
* Metabase
  * 複数のデータベースへの接続のサポートを追加


## 2024年1月18日 {#january-18-2024}

このリリースでは、AWS の新しいリージョン（ロンドン / eu-west-2）が追加され、ClickPipes に Redpanda、Upstash、および Warpstream のサポートが追加され、[is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted) コアデータベース機能の信頼性が向上しました。 

### 一般の変更 {#general-changes}
- 新しい AWS リージョン：ロンドン（eu-west-2）

### コンソールの変更 {#console-changes-6}
- ClickPipes に Redpanda、Upstash、および Warpstream のサポートを追加
- ClickPipes 認証メカニズムを UI で構成可能にしました

### 統合の変更 {#integrations-changes-6}
- Java クライアント:
  - ブレイキング変更: コール内でランダムな URL ハンドルを指定する機能が削除されました。この機能は ClickHouse から削除されました。
  - 非推奨: Java CLI クライアントおよび GRPC パッケージ
  - ClickHouse インスタンスのバッチサイズとワークロードを減らすために RowBinaryWithDefaults 形式のサポートを追加（Exabeamからのリクエスト）
  - Date32 および DateTime64 範囲の境界を ClickHouse と互換性を持たせ、Spark Array 文字列型との互換性を持たせました。
- Kafka コネクタ: Grafana の JMX モニタリングダッシュボードを追加
- PowerBI: ODBC ドライバの設定を UI で構成可能にしました
- JavaScript クライアント: クエリ要約情報を公開し、挿入用に特定のカラムの部分集合を提供できるようにし、Web クライアントの keep_alive を構成可能にしました。
- Python クライアント: SQLAlchemy のために Nothing 型のサポートを追加

### 信頼性の変更 {#reliability-changes}
- ユーザーに対する互換性のない変更: 以前、ある条件下で二つの機能 （[is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted) と ``OPTIMIZE CLEANUP``）が ClickHouse のデータの破損を引き起こす可能性がありました。ユーザーデータの整合性を保ちながら、機能のコアを維持するために、私たちはこの機能の動作を調整しました。具体的には、MergeTree 設定の ``clean_deleted_rows`` は非推奨となりもはや無効です。 ``CLEANUP`` キーワードはデフォルトでは許可されていません（使用するには ``allow_experimental_replacing_merge_with_cleanup`` を有効にする必要があります）。 ``CLEANUP`` を使用することに決定した場合は、必ず ``FINAL`` と一緒に使用し、 ``OPTIMIZE FINAL CLEANUP`` を実行した後に古いバージョンの行が挿入されないことを保証する必要があります。

## 2023年12月18日 {#december-18-2023}

このリリースでは、GCP の新しいリージョン (us-east1) が追加され、自己サービスでの安全なエンドポイント接続が可能になり、DBT 1.7 などの追加統合のサポートや多数のバグ修正およびセキュリティ強化が行われました。

### 一般的な変更 {#general-changes-1}
- ClickHouse Cloud が GCP us-east1 (サウスカロライナ) リージョンで利用可能になりました
- AWS プライベートリンクおよび GCP プライベートサービスコネクトを OpenAPI 経由で設定する機能が有効になりました 

### コンソールの変更 {#console-changes-7}
- 開発者ロールを持つユーザー向けに SQL コンソールへのシームレスなログイン機能が有効になりました
- オンボーディング中のアイドル制御の設定ワークフローを簡素化しました

### 統合の変更 {#integrations-changes-7}
- DBT コネクタ: DBT v1.7 までのサポートを追加 
- Metabase: Metabase v0.48 へのサポートを追加
- PowerBI コネクタ: PowerBI Cloud での実行機能を追加
- ClickPipes 内部ユーザーの権限を構成可能にしました
- Kafka Connect
  - Nullable 型の重複排除ロジックと取り込みを改善しました。
  - テキストベースのフォーマット（CSV、TSV）のサポートを追加
- Apache Beam: Boolean および LowCardinality 型のサポートを追加
- Nodejs クライアント: Parquet 形式のサポートを追加
```html
  - CVE-2023-48704 (CVSS 7.0) - ヒープバッファオーバーフローの脆弱性で、デフォルトでポート9000/tcpで動作するネイティブインターフェースに影響を与えます。
  - CVE 2023-48298 (CVSS 5.9) - FPC圧縮コーデックにおける整数アンダーフローの脆弱性です。

## 2023年11月22日 {#november-22-2023}

このリリースでは、コアデータベースバージョンがアップグレードされ、ログインと認証フローが改善され、Kafka Connect Sinkへのプロキシサポートが追加されました。

### ClickHouseバージョンアップグレード {#clickhouse-version-upgrade-2}

- Parquetファイルの読み取り性能が劇的に改善されました。詳細については[23.8リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-08)をご覧ください。
- JSONの型推論サポートが追加されました。詳細については[23.9リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-09)をご覧ください。
- アナリスト向けの強力な関数がいくつか追加されました（例：`ArrayFold`）。詳細については[23.10リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-10)をご覧ください。
- **ユーザー向けの後方互換性を破る変更**: JSON形式での文字列からの数値推定を避けるために、`input_format_json_try_infer_numbers_from_strings`の設定がデフォルトで無効になりました。サンプルデータに数値に似た文字列が含まれていると、解析エラーの可能性が生じることがあります。
- 数十の新機能、性能改善、バグ修正が含まれています。詳細については[コアデータベースの変更ログ](/whats-new/changelog)をご覧ください。

### コンソールの変更 {#console-changes-8}

- ログインと認証フローが改善されました。
- 大規模なスキーマをよりサポートするために、AIベースのクエリ提案が改善されました。

### 統合の変更 {#integrations-changes-8}

- Kafka Connect Sink: プロキシサポート、`topic-tablename`マッピング、Keeperの_exactly-once_配信プロパティの構成可能性が追加されました。
- Node.jsクライアント: Parquet形式のサポートが追加されました。
- Metabase: `datetimeDiff`関数サポートが追加されました。
- Pythonクライアント: カラム名における特殊文字のサポートが追加されました。タイムゾーンパラメータのバインディングが修正されました。

## 2023年11月2日 {#november-2-2023}

このリリースでは、アジアの開発サービスの地域サポートが増強され、顧客管理の暗号化キーへのキーのローテーション機能が導入され、請求コンソールの税設定の粒度が向上し、サポートされている言語クライアント全体にわたっていくつかのバグ修正が行われました。

### 一般的な更新 {#general-updates-1}

- 開発サービスがAWSの`ap-south-1`（ムンバイ）および`ap-southeast-1`（シンガポール）で利用可能になりました。
- 顧客管理の暗号化キー（CMEK）でのキーのローテーションがサポートされるようになりました。

### コンソールの変更 {#console-changes-9}

- クレジットカードを追加する際に、粒度のある税設定を構成する機能が追加されました。

### 統合の変更 {#integrations-changes-9}

- MySQL 
  - MySQL経由でのTableau OnlineおよびQuickSightのサポートが改善されました。
- Kafka Connector
  - テキストベースのフォーマット（CSV、TSV）をサポートするために新しいStringConverterが導入されました。
  - BytesおよびDecimalデータ型のサポートが追加されました。
  - Retryable Exceptionsが常に再試行されるように調整されました（エラー.tolerance = allの場合でも）。
- Node.jsクライアント
  - 大規模なデータセットのストリーミングにより、破損した結果が提供される問題を修正しました。
- Pythonクライアント
  - 大規模な挿入でのタイムアウトを修正しました。
  - NumPy/Pandas Date32の問題が修正されました。
- Golangクライアント 
  - JSONカラムへの空のマップの挿入、圧縮バッファのクリーンアップ、クエリのエスケープ、IPv4およびIPv6用のゼロ/nilでのパニックを修正しました。
  - キャンセルされた挿入に対するウォッチドッグが追加されました。
- DBT
  - テストを伴う分散テーブルのサポートが改善されました。

## 2023年10月19日 {#october-19-2023}

このリリースでは、SQLコンソールにおけるユーザビリティとパフォーマンスが向上し、MetabaseコネクタにおけるIPデータ型の取り扱いが改善され、JavaおよびNode.jsクライアントに新機能が追加されました。

### コンソールの変更 {#console-changes-10}

- SQLコンソールのユーザビリティが改善されました（例：クエリの実行間でカラム幅を保持）。
- SQLコンソールのパフォーマンスが改善されました。

### 統合の変更 {#integrations-changes-10}

- Javaクライアント:
  - パフォーマンスを改善し、オープンな接続を再利用するためにデフォルトのネットワークライブラリが切り替えられました。
  - プロキシサポートが追加されました。
  - Trust Storeを使用した安全な接続のサポートが追加されました。
- Node.jsクライアント: 挿入クエリのためのkeep-alive動作が修正されました。
- Metabase: IPv4/IPv6カラムのシリアライズが修正されました。

## 2023年9月28日 {#september-28-2023}

このリリースでは、Kafka、Confluent Cloud、Amazon MSKのClickPipesの一般公開が行われ、Kafka Connect ClickHouse Sink、IAMロールを介したAmazon S3への安全なアクセスを提供するセルフサービスワークフロー、AIを利用したクエリ提案（プライベートプレビュー）が導入されました。

### コンソールの変更 {#console-changes-11}

- IAMロールを介してAmazon S3への[アクセスを保護するためのセルフサービスワークフロー](/cloud/security/secure-s3)が追加されました。
- プライベートプレビューでAI-assistedクエリ提案が導入されました（使用するには[ClickHouse Cloudサポート](https://console.clickhouse.cloud/support)に連絡してください！）。

### 統合の変更 {#integrations-changes-11}

- ClickPipesの一般公開が発表されました。これはKafka、Confluent Cloud、Amazon MSK用のターンキーのデータ取り込みサービスです（[リリースブログ](https://clickhouse.com/blog/clickpipes-is-generally-available)を参照）。
- Kafka Connect ClickHouse Sinkの一般公開が達成されました。
  - `clickhouse.settings`プロパティを使用してカスタマイズされたClickHouse設定のサポートが拡張されました。
  - 動的フィールドを考慮した重複排除動作が改善されました。
  - ClickHouseからテーブルの変更を再取得するための`tableRefreshInterval`のサポートが追加されました。
- SSL接続の問題と[PowerBI](/integrations/powerbi)とClickHouseデータ型間の型マッピングが修正されました。

## 2023年9月7日 {#september-7-2023}

このリリースでは、PowerBI Desktop公式コネクタのベータリリース、インドにおけるクレジットカード決済処理の改善、およびサポートされている言語クライアント全体での複数の改善が行われました。

### コンソールの変更 {#console-changes-12}

- インドからの請求にサポートするために、残高クレジットと支払い再試行が追加されました。

### 統合の変更 {#integrations-changes-12}

- Kafka Connector: ClickHouse設定の構成のサポートが追加され、error.tolerance構成オプションが追加されました。
- PowerBI Desktop: 公式コネクタのベータ版がリリースされました。
- Grafana: Point geo typeのサポートが追加され、Data Analystダッシュボードでのパネルが修正され、timeIntervalマクロが修正されました。
- Pythonクライアント: Pandas 2.1.0に対応し、Python 3.7のサポートが削除され、nullable JSON型のサポートが追加されました。
- Node.jsクライアント: default_format設定のサポートが追加されました。
- Golangクライアント: bool型の取り扱いを修正し、文字列制限が削除されました。

## 2023年8月24日 {#aug-24-2023}

このリリースでは、ClickHouseデータベースへのMySQLインターフェースのサポートが追加され、公式のPowerBIコネクタが新たに導入され、クラウドコンソールに「実行中のクエリ」の新しいビューが追加され、ClickHouseバージョンが23.7に更新されました。

### 一般的な更新 {#general-updates-2}

- [MySQLワイヤプロトコル](/interfaces/mysql)のサポートが追加されました。これにより（他の用途の中でも）、多くの既存BIツールとの互換性が強化されます。この機能を組織に対して有効にするためにサポートに連絡してください。
- 公式のPowerBIコネクタが新たに導入されました。 

### コンソールの変更 {#console-changes-13}

- SQLコンソールに新しい「実行中のクエリ」ビューのサポートが追加されました。

### ClickHouse 23.7バージョンアップグレード {#clickhouse-237-version-upgrade}

- Azure Table関数のサポートが追加され、地理型データが生産準備完了となり、結合性能が改善されました。詳細については23.5リリースの[ブログ](https://clickhouse.com/blog/clickhouse-release-23-05)をご覧ください。
- MongoDB統合サポートがバージョン6.0に拡張されました。詳細については23.6リリースの[ブログ](https://clickhouse.com/blog/clickhouse-release-23-06)をご覧ください。
- Parquet形式への書き込み性能が6倍改善され、PRQLクエリ言語のサポートが追加され、SQL互換性が改善されました。詳細については23.7リリースの[プレゼンテーション](https://presentations.clickhouse.com/release_23.7/)をご覧ください。
- 数十の新機能、性能改善、バグ修正が行われました。詳細な[変更ログ](/whats-new/changelog)は23.5、23.6、23.7のものをご覧ください。

### 統合の変更 {#integrations-changes-13}

- Kafka Connector: Avro日付および時間型のサポートが追加されました。
- JavaScriptクライアント: ウェブベースの環境のための安定版がリリースされました。
- Grafana: フィルターロジック、データベース名の取り扱いが改善され、サブ秒精度でのTimeIntervalサポートが追加されました。
- Golangクライアント: バッチおよび非同期データロードの問題が修正されました。
- Metabase: v0.47をサポートし、接続の代行が追加され、データ型のマッピングが修正されました。

## 2023年7月27日 {#july-27-2023}

このリリースでは、Kafka用のClickPipesのプライベートプレビュー、新しいデータ読み込み体験、クラウドコンソールを使用したURLからのファイルロード機能が追加されました。

### 統合の変更 {#integrations-changes-14}

- Kafka用の[ClickPipes](https://clickhouse.com/cloud/clickpipes)のプライベートプレビューが導入されました。これは、KafkaおよびConfluent Cloudからの大量データの取り込みを簡単に行うためのクラウドネイティブ統合エンジンです。待機リストのサインアップは[こちら](https://clickhouse.com/cloud/clickpipes#joinwaitlist)にて。
- JavaScriptクライアント: ウェブベースの環境（ブラウザ、Cloudflareワーカー）に対応したサポートがリリースされました。コミュニティがカスタム環境用のコネクタを作成できるようにコードがリファクタリングされました。
- Kafka Connector: タイムスタンプおよびTime Kafka型でのインラインスキーマのサポートが追加されました。
- Pythonクライアント: 挿入の圧縮とLowCardinalityの読み取りの問題を修正しました。

### コンソールの変更 {#console-changes-14}

- より多くのテーブル作成構成オプションとともに新しいデータ読み込み体験が追加されました。
- クラウドコンソールを使用してURLからのファイルを読み込む機能が導入されました。
- 別の組織に参加するオプションや、未使用の招待状をすべて見るオプションが追加され、招待フローが改善されました。

## 2023年7月14日 {#july-14-2023}

このリリースでは、専用サービスの立ち上げ、オーストラリアの新しいAWSリージョン、ディスク上のデータを暗号化するための独自のキーを持ち込む機能が追加されました。

### 一般的な更新 {#general-updates-3}

- 新しいAWSオーストラリアリージョン: シドニー（ap-southeast-2）
- 高いレイテンシに敏感なワークロード向けの専用サービス（設定するにはサポートに連絡してください）
- ディスク上のデータを暗号化するための独自のキーを持ち込む（設定するにはサポートに連絡してください）

### コンソールの変更 {#console-changes-15}

- 非同期挿入のための可視性メトリクスダッシュボードが改善されました。
- サポートとの統合のためのチャットボットの動作が改善されました。

### 統合の変更 {#integrations-changes-15}

- Node.jsクライアント: ソケットタイムアウトによる接続失敗のバグを修正しました。
- Pythonクライアント: 挿入クエリにQuerySummaryを追加し、データベース名における特殊文字のサポートを追加しました。
- Metabase: JDBCドライバのバージョンが更新され、DateTime64のサポートが追加され、パフォーマンスが向上しました。

### コアデータベースの変更 {#core-database-changes}

- [クエリキャッシュ](/operations/query-cache)はClickHouse Cloudで有効にできます。有効にすると、成功したクエリがデフォルトで1分間キャッシュされ、以後のクエリはキャッシュされた結果を使用します。

## 2023年6月20日 {#june-20-2023}

このリリースでは、GCP上のClickHouse Cloudが一般公開され、Cloud API用のTerraformプロバイダーが導入され、ClickHouseのバージョンが23.4に更新されました。

### 一般的な更新 {#general-updates-4}

- GCP上のClickHouse CloudがGAとなり、GCPマーケットプレイス統合、プライベートサービス接続のサポート、自動バックアップを提供します（詳細については[ブログ](https://clickhouse.com/blog/clickhouse-cloud-on-google-cloud-platform-gcp-is-generally-available)および[プレスリリース](https://clickhouse.com/blog/clickhouse-cloud-expands-choice-with-launch-on-google-cloud-platform)をご覧ください）。
- Cloud API用の[Terraformプロバイダー](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)が利用可能になりました。

### コンソールの変更 {#console-changes-16}

- サービスの新しい統合設定ページが追加されました。
- ストレージとコンピュートのメーターの精度が調整されました。

### 統合の変更 {#integrations-changes-16}

- Pythonクライアント: 挿入パフォーマンスの改善、内部依存関係のリファクタリングによるマルチプロセスのサポート。
- Kafka Connector: Confluent Cloudにアップロードし、インターチャネルの接続問題に対する再試行を追加し、誤ったコネクタの状態を自動的にリセットします。

### ClickHouse 23.4バージョンアップグレード {#clickhouse-234-version-upgrade}

- パラレルレプリカ用のJOINサポートが追加されました (設定するにはサポートに連絡してください)。
- 軽量削除のパフォーマンスが改善されました。
- 大規模な挿入処理中のキャッシングが改善されました。

### 管理の変更 {#administration-changes-1}

- 非「デフォルト」ユーザー用のローカル辞書作成が拡張されました。

## 2023年5月30日 {#may-30-2023}

このリリースでは、ClickHouse CloudプログラムAPIのパブリックリリース、IAMロールを使用したS3アクセス、追加のスケーリングオプションが提供されます。

### 一般的な変更 {#general-changes-2}

- ClickHouse Cloud用のAPIサポート。この新しいCloud APIを使用して、既存のCI/CDパイプラインにサービス管理を統合し、サービスをプログラムで管理できます。
- IAMロールを使用したS3アクセスが可能になりました。これを使用して、プライベートなAmazon Simple Storage Service（S3）バケットに安全にアクセスできます（設定するにはサポートに連絡してください）。

### スケーリングの変更 {#scaling-changes}

- [水平スケーリング](/manage/scaling#adding-more-nodes-horizontal-scaling): より多くの並行性を必要とするワークロードのために最大10のレプリカに構成できるようになりました（設定するにはサポートに連絡してください）。
- [CPUベースのオートスケーリング](/manage/scaling): CPUバウンドのワークロード向けにオートスケーリングポリシーのトリガーが追加されました。

### コンソールの変更 {#console-changes-17}

- 開発サービスをプロダクションサービスに移行します（有効にするにはサポートに連絡してください）。
- インスタンス作成フロー中のスケーリング構成制御が追加されました。
- メモリ内にデフォルトパスワードが存在しない場合の接続文字列の修正。

### 統合の変更 {#integrations-changes-17}

- Golangクライアント: ネイティブプロトコルにおける不均衡な接続の問題を修正し、ネイティブプロトコル内でのカスタム設定のサポートを追加しました。
- Nodejsクライアント: Node.js v14のサポートを削除し、v20のサポートが追加されました。
- Kafka Connector: LowCardinality型のサポートが追加されました。
- Metabase: 時間範囲によるグループ化の修正、メタバス質問における整数のサポートが修正されました。

### パフォーマンスと信頼性 {#performance-and-reliability}

- 書き込みの多いワークロードの効率とパフォーマンスが改善されました。
- バックアップの速度と効率を増加させるための増分バックアップ戦略が展開されました。

## 2023年5月11日 {#may-11-2023}

このリリースでは、ClickHouse Cloud on GCPの~~パブリックベータ~~（現在GA、上記の6月20日のエントリを参照）を更新し、終了クエリ権限を付与するための管理者権限の拡張およびCloudコンソールにおけるMFAユーザーのステータスへのさらなる可視性が追加されました。

### ClickHouse Cloud on GCP ~~(パブリックベータ)~~ (現在GA、上記の6月20日のエントリを参照) {#clickhouse-cloud-on-gcp-public-beta-now-ga-see-june-20th-entry-above}

- Google ComputeおよびGoogle Cloud Storageの上に構築された、完全管理型の別個なストレージおよびコンピュートのClickHouseオファリングが立ち上げられました。
- アイオワ（us-central1）、オランダ（europe-west4）、シンガポール（asia-southeast1）リージョンで利用可能です。
- 初期の三つのリージョンすべてで開発及び生産サービスをサポートします。 
- デフォルトで強いセキュリティを提供: 伝送中のエンドツーエンド暗号化、保管データの暗号化、IP許可リスト。

### 統合の変更 {#integrations-changes-18}

- Golangクライアント: プロキシ環境変数のサポートを追加しました。 
- Grafana: Grafanaデータソース設定におけるClickHouseのカスタム設定とプロキシ環境変数を指定する能力が追加されました。
- Kafka Connector: 空のレコードの取り扱いが改善されました。

### コンソールの変更 {#console-changes-18}

- ユーザーリストで多要素認証（MFA）の使用状況を示すインジケーターが追加されました。

### パフォーマンスと信頼性 {#performance-and-reliability-1}

- 管理者向けの終了クエリ権限に対するより詳細な制御が追加されました。

## 2023年5月4日 {#may-4-2023}

このリリースでは、新しいヒートマップチャートタイプの追加、請求使用量ページの改善、およびサービスの起動時間の改善が行われました。

### コンソールの変更 {#console-changes-19}

- SQLコンソールにヒートマップチャートタイプが追加されました。
- 各請求ディメンション内で消費されたクレジットを表示するために、請求使用量ページが改善されました。

### 統合の変更 {#integrations-changes-19}

- Kafkaコネクタ: 一時的接続エラーに対する再試行メカニズムが追加されました。
- Pythonクライアント: HTTP接続が永遠に再利用されないようにするmax_connection_age設定が追加されました。これにより、特定の負荷分散の問題が解決される可能性があります。
- Node.jsクライアント: Node.js v20のサポートが追加されました。
- Javaクライアント: クライアント証明書認証のサポートが改善され、ネストされたTuple/Map/Nested型のサポートが追加されました。

### パフォーマンスと信頼性 {#performance-and-reliability-2}

- 大量のパーツを持つ場合におけるサービスの起動時間が改善されました。
- SQLコンソールでの長時間実行されるクエリのキャンセルロジックが最適化されました。

### バグ修正 {#bug-fixes}

- 'Cell Towers'サンプルデータセットのインポートが失敗する原因となるバグが修正されました。

## 2023年4月20日 {#april-20-2023}

このリリースでは、ClickHouseのバージョンを23.3に更新し、冷却リードの速度を大幅に改善し、サポートとのリアルタイムチャット機能が追加されました。

### コンソールの変更 {#console-changes-20}

- サポートとのリアルタイムチャットの選択肢が追加されました。

### 統合の変更 {#integrations-changes-20}

- Kafkaコネクタ: Nullable型のサポートが追加されました。
- Golangクライアント: 外部テーブルのサポートが追加され、booleanおよびポインタ型のパラメータバインディングがサポートされました。

### 設定の変更 {#configuration-changes}

- 大規模なテーブルをドロップする機能が追加されました：`max_table_size_to_drop`および`max_partition_size_to_drop`設定をオーバーライドします。

### パフォーマンスと信頼性 {#performance-and-reliability-3}

- S3のプリフェッチを通じた冷却リードの速度を改善しました。`allow_prefetched_read_pool_for_remote_filesystem`設定を使用します。

### ClickHouse 23.3バージョンアップグレード {#clickhouse-233-version-upgrade}

- 軽量削除が生産レベルで準備完了になりました — 23.3リリースの[ブログ](https://clickhouse.com/blog/clickhouse-release-23-03)を見てください。
- 多段PREWHEREのサポートが追加されました — 23.2リリースの[ブログ](https://clickhouse.com/blog/clickhouse-release-23-03)を参照してください。
- 数十の新機能、パフォーマンス改善、バグ修正 — 23.3および23.2に関する詳細な[変更ログ](/whats-new/changelog/index.md)をご覧ください。

## 2023年4月6日 {#april-6-2023}

このリリースでは、クラウドエンドポイントを取得するためのAPI、最小アイドルタイムアウトの高度なスケーリング制御、およびPythonクライアントのクエリメソッドにおける外部データのサポートが追加されました。

### APIの変更 {#api-changes}

* [Cloud Endpoints API](/cloud/security/cloud-endpoints-api.md)を通じてClickHouse Cloudエンドポイントをプログラム的にクエリする機能が追加されました。

### コンソールの変更 {#console-changes-21}

- 高度なスケーリング設定に「最小アイドルタイムアウト」設定が追加されました。
- データローディングモードでのスキーマ推論にベストエフォートの日時検出が追加されました。

### 統合の変更 {#integrations-changes-21}

- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): 複数のスキーマのサポートが追加されました。
- [Goクライアント](/integrations/language-clients/go/index.md): TLS接続のアイドル接続の生存確認チェックが修正されました。
- [Pythonクライアント](/integrations/language-clients/python/index.md)
  - クエリメソッドにおける外部データのサポートが追加されました。
  - クエリ結果に関するタイムゾーンのサポートが追加されました。
  - `no_proxy` / `NO_PROXY` 環境変数のサポートが追加されました。
  - Nullable型に対するNULL値のサーバー側パラメータバインディングが修正されました。

### バグ修正 {#bug-fixes-1}

* SQLコンソールからの`INSERT INTO … SELECT …`の実行時に、選択クエリと同じ行制限が誤って適用される動作が修正されました。

## 2023年3月23日 {#march-23-2023}

このリリースでは、データベースのパスワード複雑性ルール、大規模バックアップの復元速度の大幅な向上、およびGrafana Trace Viewでのトレースの表示サポートが提供されます。

### セキュリティと信頼性 {#security-and-reliability}

- コアデータベースのエンドポイントでパスワード複雑性ルールが施行されるようになりました。
- 大規模バックアップを復元する時間が改善されました。

### コンソールの変更 {#console-changes-22}

- オンボーディングワークフローが簡素化され、新しいデフォルトやよりコンパクトなビューが導入されました。
- サインアップとサインインの遅延が減少しました。

### 統合の変更 {#integrations-changes-22}

- Grafana: 
  - ClickHouseに保存されたトレースデータをTrace Viewで表示するサポートが追加されました。  
  - 時間範囲フィルターの改善が行われ、テーブル名に特殊文字のサポートが追加されました。
- Superset: ClickHouseのネイティブサポートが追加されました。
- Kafka Connect Sink: 自動日付変換とNullカラムの取り扱いが追加されました。
- Metabase: v0.46との互換性が実装されました。
- Pythonクライアント: 一時テーブルでの挿入を修正し、Pandas Nullのサポートが追加されました。
- Golangクライアント: タイムゾーン対応のDate型が標準化されました。
- Javaクライアント
  - 圧縮、infile、outfileキーワードのサポートをSQLパーサーに追加しました。
  - 認証情報のオーバーロードが追加されました。
  - `ON CLUSTER`とのバッチサポートが修正されました。
- Node.jsクライアント
  - JSONStrings、JSONCompact、JSONCompactStrings、JSONColumnsWithMetadata形式のサポートが追加されました。
  - `query_id`がすべての主要なクライアントメソッド用に提供されるようになりました。

### バグ修正 {#bug-fixes-2}

- 新しいサービスに対して遅い初期プロビジョニングおよび起動時間を引き起こすバグが修正されました。
- キャッシュの設定ミスによりクエリパフォーマンスが遅くなるバグが修正されました。

## 2023年3月9日 {#march-9-2023}

このリリースでは、可視性ダッシュボードが改善され、大規模バックアップの作成時間が最適化され、テーブルおよびパーティションをドロップするための設定が追加されました。

### コンソールの変更 {#console-changes-23}

- 高度な可視性ダッシュボード（プレビュー）が追加されました。
- 可視性ダッシュボードにメモリアロケーションチャートが導入されました。
- SQLコンソールスプレッドシートビューでのスペーシングと改行の処理が改善されました。

### 信頼性とパフォーマンス {#reliability-and-performance}

- データが変更された場合のみバックアップを実行するようにバックアップスケジュールが最適化されました。
- 大規模バックアップを完了するまでの時間が改善されました。

### 設定の変更 {#configuration-changes-1}

- テーブルおよびパーティションをドロップする制限を引き上げる能力が追加され、`max_table_size_to_drop`および`max_partition_size_to_drop`設定をクエリまたは接続レベルでオーバーライドできます。
- クエリログにソースIPが追加され、ソースIPに基づくクォータおよびアクセス制御を強制できるようにしました。

### 統合 {#integrations}

- [Pythonクライアント](/integrations/language-clients/python/index.md): Pandasサポートが改善され、タイムゾーン関連の問題が修正されました。
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): Metabase 0.46.xとの互換性およびSimpleAggregateFunctionのサポートが追加されました。
- [Kafka-Connect](/integrations/data-ingestion/kafka/index.md): 暗黙的な日付変換およびNullカラムに対するより良い取り扱いが行われました。
- [Javaクライアント](https://github.com/ClickHouse/clickhouse-java): Javaマップへのネスト変換が追加されました。

## 2023年2月23日 {#february-23-2023}

このリリースでは、ClickHouse 23.1コアリリースのサブセット機能、Amazon Managed Streaming for Apache Kafka（MSK）との相互運用性、およびアクティビティログにおける高度なスケーリングおよびアイドル調整が公開されます。

### ClickHouse 23.1バージョンアップグレード {#clickhouse-231-version-upgrade}

ClickHouse 23.1の機能のサブセットについてのサポートが追加され、例えば次のようなものがあります：
- Map型を用いたARRAY JOIN
- SQL標準の16進数およびバイナリリテラル
- `age()`、`quantileInterpolatedWeighted()`、`quantilesInterpolatedWeighted()`などの新しい関数。
- 引数なしで`generateRandom`での挿入テーブルからの構造の利用が可能になりました。
- 前の名前の再使用を可能にしたデータベースの作成およびリネームロジックの改善。
- 詳細については23.1リリースの[ウェビナー資料](https://presentations.clickhouse.com/release_23.1/#cover)や[23.1リリースの変更ログ](/whats-new/changelog/index.md#clickhouse-release-231)をご覧ください。

### 統合の変更 {#integrations-changes-23}

- [Kafka-Connect](/integrations/data-ingestion/kafka/index.md): Amazon MSKのサポートが追加されました。
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): 初の安定版1.0.0がリリースされました。
  - Metabase Cloudで利用可能なコネクタが追加されました。
  - 利用可能なデータベースをすべて探求できる機能が追加されました。
  - 集約関数型とデータベースの同期の修正が行われました。
- [DBT-clickhouse](/integrations/data-ingestion/etl-tools/dbt/index.md): 最新DBTバージョンv1.4.1のサポートが追加されました。
- [Pythonクライアント](/integrations/language-clients/python/index.md): プロキシとSSHトンネリングのサポートが改善され、Pandas DataFrame向けに多数の修正とパフォーマンスの最適化が行われました。
- [Nodejsクライアント](/integrations/language-clients/js.md): クエリ結果に`query_id`を添付する機能がリリースされ、`system.query_log`からクエリメトリクスを取得するために使用できるようになりました。
- [Golangクライアント](/integrations/language-clients/go/index.md): ClickHouse Cloudとのネットワーク接続が最適化されました。

### コンソールの変更 {#console-changes-24}

- アクティビティログに高度なスケーリングおよびアイドル設定調整が追加されました。
- パスワードリセットメールにユーザーエージェントおよびIP情報が追加されました。
- Google OAuthのサインアップフローメカニクスが改善されました。

### 信頼性とパフォーマンス {#reliability-and-performance-1}

- 大規模サービスのアイドル状態からの再開時の時間が短縮されました。
- テーブルやパーティションの数が多いサービスについては、読み取りのレイテンシが改善されました。

### バグ修正 {#bug-fixes-3}

- サービスパスワードのリセットがパスワードポリシーに従わなかった挙動が修正されました。
- 組織招待メールの検証が大文字と小文字を区別しないように修正されました。

## 2023年2月2日 {#february-2-2023}

このリリースでは、公式のMetabase統合が追加され、Javaクライアント/JDBCドライバのメジャーリリースが行われ、SQLコンソールにおけるビューとマテリアライズドビューのサポートが追加されました。

### 統合の変更 {#integrations-changes-24}

- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md)プラグイン: ClickHouseが維持する公式のソリューションとなりました。
- [dbt](/integrations/data-ingestion/etl-tools/dbt/index.md)プラグイン: [複数スレッド](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md)のサポートが追加されました。
- [Grafana](/integrations/data-visualization/grafana/index.md)プラグイン: 接続エラーの処理が改善されました。
- [Python](/integrations/language-clients/python/index.md)クライアント: 挿入操作のための[ストリーミングサポート](/integrations/language-clients/python/index.md#streaming-queries)が追加されました。
- [Go](/integrations/language-clients/go/index.md)クライアント: [バグ修正](https://github.com/ClickHouse/clickhouse-go/blob/main/CHANGELOG.md): キャンセルされた接続のクローズ、接続エラーの処理が改善されました。
- [JS](/integrations/language-clients/js.md)クライアント: [exec/insertにおけるブレイキング変更](https://github.com/ClickHouse/clickhouse-js/releases/tag/0.0.12); 戻り型でのquery_idの公開。
- [Java](https://github.com/ClickHouse/clickhouse-java#readme)クライアント / JDBCドライバのメジャーリリース
  - [ブレイキング変更](https://github.com/ClickHouse/clickhouse-java/releases): 非推奨のメソッド、クラス、パッケージが削除されました。
  - R2DBCドライバとファイル挿入のサポートが追加されました。

### コンソールの変更 {#console-changes-25}

- SQLコンソールにビューとマテリアライズドビューのサポートが追加されました。

### パフォーマンスと信頼性 {#performance-and-reliability-4}

- 停止中/アイドル状態のインスタンスに対するパスワードリセットが迅速になりました。
- より正確なアクティビティトラッキングによってスケールダウンの動作が改善されました。
- SQLコンソールのCSVエクスポートが切り捨てられるバグが修正されました。
- サンプルデータのアップロード失敗が不定期に発生するバグが修正されました。

## 2023年1月12日 {#january-12-2023}

このリリースでは、ClickHouseのバージョンが22.12に更新され、新しいソースに対して辞書が有効化され、クエリパフォーマンスが改善されました。

### 一般的な変更 {#general-changes-3}

- 外部ClickHouse、Cassandra、MongoDB、MySQL、PostgreSQL、Redisを含む追加ソース用の辞書が有効化されました。

### ClickHouse 22.12バージョンアップグレード {#clickhouse-2212-version-upgrade}

- JOINサポートがGrace Hash Joinを含むように拡張されました。
- バイナリJSON（BSON）ファイルの読读に対するサポートが追加されました。
- GROUP BY ALL標準SQL構文のサポートが追加されました。
- 固定精度での数学的関数による小数演算の新しいメソッドが追加されました。
- 完全な変更のリストについては、[22.12リリースブログ](https://clickhouse.com/blog/clickhouse-release-22-12)および詳細な[22.12変更ログ](/whats-new/changelog/2022.md/#-clickhouse-release-2212-2022-12-15)をご覧ください。

### コンソールの変更 {#console-changes-26}

- SQLコンソールのオートコンプリート機能が改善されました。
- デフォルトリージョンが大陸の地方性を考慮するようになりました。
- 請求およびウェブサイトの単位の両方を表示するために請求使用量ページが改善されました。

### 統合の変更 {#integrations-changes-25}

- DBTリリース[v1.3.2](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md#release-132-2022-12-23)
  - delete+insertの増分戦略に対する実験的サポートが追加されました。
  - 新しいs3sourceマクロ。
- Pythonクライアント[v0.4.8](https://github.com/ClickHouse/clickhouse-connect/blob/main/CHANGELOG.md#048-2023-01-02)
  - ファイル挿入のサポートが追加されました。
  - サーバーサイドのクエリ[パラメータのバインディング](/interfaces/cli.md/#cli-queries-with-parameters)が追加されました。
- Goクライアント[v2.5.0](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.5.0)
  - 圧縮のためのメモリ使用量が減少しました。
  - サーバーサイドのクエリ[パラメータのバインディング](/interfaces/cli.md/#cli-queries-with-parameters)が追加されました。

### 信頼性とパフォーマンス {#reliability-and-performance-2}

- 大量の小さなファイルをオブジェクトストアから取得するクエリの読み取りパフォーマンスが改善されました。
- 新しく立ち上げられたサービスに対して、サービスが最初に立ち上げられたバージョンに合わせて[互換性](/cloud/manage/upgrades.md/#use-the-default-settings-of-a-clickhouse-release)設定が設定されるようになりました。

### バグ修正 {#bug-fixes-4}

- 高度なスケーリングスライダーを用いてリソースを予約することで、即座に反映されるようになりました。
```
- 新しい招待者のデフォルト役割を「Administrator」に変更
- オンボーディング調査を追加

### 信頼性と性能 {#reliability-and-performance-3}
- ネットワーク障害が発生した場合に長時間実行される挿入クエリのための再試行ロジックを追加
- コールドリードの読み取り性能を改善

### 統合の変更 {#integrations-changes-26}
- [Metabaseプラグイン](/integrations/data-visualization/metabase-and-clickhouse.md)が待望のバージョン0.9.1の大規模アップデートを受けました。最新のMetabaseバージョンとの互換性があり、ClickHouse Cloudに対して徹底的にテストされています。

## 2022年12月6日 - 一般提供 {#december-6-2022---general-availability}

ClickHouse Cloudは、SOC2 Type IIコンプライアンス、プロダクションワークロードのための稼働時間SLA、および公開状態ページを備え、現在本番稼働の準備が整いました。このリリースには、AWS Marketplace統合、ClickHouseユーザーのためのデータ探索ワークベンチであるSQLコンソール、ClickHouse Cloudでの自己学習のためのClickHouse Academyなどの主要な新機能が含まれています。詳細はこの[ブログ](https://clickhouse.com/blog/clickhouse-cloud-generally-available)をご覧ください。

### 本番稼働向け {#production-ready}
- SOC2 Type IIコンプライアンス（詳細は[ブログ](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant)および[Trust Center](https://trust.clickhouse.com/)を参照）
- ClickHouse Cloudの公開[状態ページ](https://status.clickhouse.com/)
- プロダクションユースケース向けの稼働時間SLA
- [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc)での利用可能性

### 主要な新機能 {#major-new-capabilities}
- ClickHouseユーザーのためのデータ探索ワークベンチであるSQLコンソールを導入
- ClickHouse Cloudでの自己学習のための[ClickHouse Academy](https://learn.clickhouse.com/visitor_class_catalog)を開始

### 価格およびメータリングの変更 {#pricing-and-metering-changes}
- 無料トライアルを30日間に延長
- 初期プロジェクトや開発／ステージング環境に適した固定容量の低コスト月額開発サービスを導入
- ClickHouse Cloudの運用とスケーリングを改善し続ける中で、プロダクションサービスの新しい削減価格を導入
- コンピュートのメータリング時の粒度と忠実度を改善

### 統合の変更 {#integrations-changes-27}
- ClickHouse Postgres / MySQL統合エンジンのサポートを有効化
- SQLユーザー定義関数（UDF）のサポートを追加
- Kafka Connectシンクをベータ版に進化
- バージョン、更新状況などに関するリッチなメタデータを導入した統合UIの改善

### コンソールの変更 {#console-changes-28}

- クラウドコンソールでの多要素認証サポート
- モバイルデバイス向けのクラウドコンソールナビゲーションを改善

### ドキュメンテーションの変更 {#documentation-changes}

- ClickHouse Cloudのための専用の[ドキュメンテーション](/cloud/overview)セクションを導入

### バグ修正 {#bug-fixes-5}
- バックアップからの復元時に依存関係の解決のためにうまく動作しない既知の問題を解決

## 2022年11月29日 {#november-29-2022}

このリリースはSOC2 Type IIコンプライアンスをもたらし、ClickHouseのバージョンを22.11に更新し、多くのClickHouseクライアントと統合を改善しました。

### 一般的な変更 {#general-changes-4}

- SOC2 Type IIコンプライアンスを達成（詳細は[ブログ](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant)および[Trust Center](https://trust.clickhouse.com)を参照）

### コンソールの変更 {#console-changes-29}

- サービスが自動的に一時停止されたことを示す「Idle」ステータスインジケーターを追加

### ClickHouse 22.11バージョンアップグレード {#clickhouse-2211-version-upgrade}

- HudiおよびDeltaLakeテーブルエンジンとテーブル関数のサポートを追加
- S3の再帰的ディレクトリトラバースを改善
- 合成時間間隔構文のサポートを追加
- 挿入の再試行を利用して挿入の信頼性を向上
- 変更の完全なリストについては[詳細な22.11の変更ログ](/whats-new/changelog/2022.md/#-clickhouse-release-2211-2022-11-17)をご覧ください

### 統合 {#integrations-1}

- Pythonクライアント：v3.11のサポート、挿入性能の改善
- Goクライアント：DateTimeおよびInt64のサポートを修正
- JSクライアント：相互SSL認証のサポート
- dbt-clickhouse：DBT v1.3のサポート

### バグ修正 {#bug-fixes-6}

- アップグレード後に古いClickHouseバージョンが表示されるバグを修正
- 「default」アカウントの権限変更がセッションを中断しなくなりました
- 新しく作成された非管理者アカウントはデフォルトでシステムテーブルへのアクセスがなくなりました

### このリリースでの既知の問題 {#known-issues-in-this-release}

- バックアップからの復元が依存関係の解決のためにうまく動作しないことがあります

## 2022年11月17日 {#november-17-2022}

このリリースでは、ローカルClickHouseテーブルおよびHTTPソースからの辞書の利用を可能にし、ムンバイ地域のサポートを導入し、クラウドコンソールのユーザーエクスペリエンスを改善しました。

### 一般的な変更 {#general-changes-5}

- ローカルClickHouseテーブルおよびHTTPソースからの[dictionaries](/sql-reference/dictionaries/index.md)のサポートを追加
- ムンバイ[地域](/cloud/reference/supported-regions.md)のサポートを導入

### コンソールの変更 {#console-changes-30}

- 請求書フォーマットの改善
- 支払い方法取得のためのユーザーインターフェイスを合理化
- バックアップのためのより細かなアクティビティログの追加
- ファイルアップロード時のエラーハンドリングを改善

### バグ修正 {#bug-fixes-7}
- 一部のパーツに大きな単一ファイルが含まれている場合、バックアップ失敗を引き起こす可能性のあるバグを修正
- アクセスリストの変更と同時にバックアップからの復元が成功しないバグを修正

### 既知の問題 {#known-issues}
- バックアップからの復元が依存関係の解決のためにうまく動作しないことがあります

## 2022年11月3日 {#november-3-2022}

このリリースでは、料金から読み取り＆書き込みユニットが削除され（詳細は[料金ページ](https://clickhouse.com/pricing)を参照）、ClickHouseのバージョンが22.10に更新され、セルフサービス顧客のためのより高い垂直スケーリングのサポートが追加され、デフォルト設定の改善を通じて信頼性が向上しました。

### 一般的な変更 {#general-changes-6}

- 料金モデルから読み取り/書き込みユニットを削除

### 設定の変更 {#configuration-changes-2}

- 安定性の理由から、設定`allow_suspicious_low_cardinality_types`、`allow_suspicious_fixed_string_types`、`allow_suspicious_codecs`（デフォルトはfalse）をユーザーが変更できなくなりました。

### コンソールの変更 {#console-changes-31}

- 有料顧客のためにセルフサービスの最大垂直スケーリングを720GBメモリに増加
- IPアクセスリストルールとパスワードを設定するためのバックアップからの復元ワークフローを改善
- サービス作成ダイアログでGCPおよびAzureの待機リストを導入
- ファイルアップロード時のエラーハンドリングを改善
- 請求管理のワークフローを改善

### ClickHouse 22.10バージョンアップグレード {#clickhouse-2210-version-upgrade}

- 多くの大きなパーツが存在する場合に、「パーツが多すぎる」という閾値を緩和することによって、オブジェクトストアの上でのマージを改善しました（少なくとも10 GiB）。これにより、単一のテーブルの単一パーティション内にペタバイトのデータを格納できるようになります。
- 特定の時間閾値を超えた後にマージするために、`min_age_to_force_merge_seconds`設定を利用してマージコントロールを改善
- 設定をリセットするためのMySQL互換構文`SET setting_name = DEFAULT`を追加
- モートン曲線エンコーディング、Java整数ハッシュ化、ランダム数生成のための関数を追加
- 変更の完全なリストについては[詳細な22.10の変更ログ](/whats-new/changelog/2022.md/#-clickhouse-release-2210-2022-10-25)をご覧ください。 

## 2022年10月25日 {#october-25-2022}

このリリースは、小規模ワークロードの計算消費を大幅に削減し、計算料金を引き下げ（詳細は[料金](https://clickhouse.com/pricing)ページを参照）、デフォルト設定の改善を通じて安定性を向上させ、ClickHouse Cloudコンソールにおける請求および使用状況のビューを強化しました。

### 一般的な変更 {#general-changes-7}

- サービスの最小メモリアロケーションを24Gに削減
- サービスのアイドルタイムアウトを30分から5分に短縮

### 設定の変更 {#configuration-changes-3}

- `max_parts_in_total`の最大値を100kから10kに削減しました。MergeTreeテーブルの`max_parts_in_total`設定のデフォルト値は100,000から10,000に下げられました。この変更の理由は、大量のデータパーツがクラウドサービスの起動時間を遅くする可能性があるためです。大量のパーツは通常、あまりにも粒度の細かいパーティションキーの選択を示しており、これを避ける必要があります。このデフォルト値の変更により、これらのケースを早期に検出できるようになります。

### コンソールの変更 {#console-changes-32}

- トライアルユーザーの請求ビューにおけるクレジット使用の詳細を強化
- ツールチップおよびヘルプテキストの改善、使用状況ビューに料金ページへのリンクを追加
- IPフィルタリングのオプション切り替え時のワークフローを改善
- クラウドコンソールに再送メール確認ボタンを追加

## 2022年10月4日 - ベータ {#october-4-2022---beta}

ClickHouse Cloudは、2022年10月4日にパブリックベータを開始しました。詳細はこの[ブログ](https://clickhouse.com/blog/clickhouse-cloud-public-beta)をご覧ください。

ClickHouse CloudのバージョンはClickHouse core v22.10に基づいています。互換性のある機能のリストについては、[Cloud Compatibility](/cloud/reference/cloud-compatibility.md)ガイドを参照してください。
