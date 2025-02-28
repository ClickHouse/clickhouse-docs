---
slug: /whats-new/cloud
sidebar_label: Cloud Changelog
title: Cloud Changelog
---

import ADD_MARKETPLACE from '@site/static/images/cloud/reference/add_marketplace.png';
import BETA_DASHBOARDS from '@site/static/images/cloud/reference/beta_dashboards.png';
import API_ENDPOINTS from '@site/static/images/cloud/reference/api_endpoints.png';
import CROSS_VPC from '@site/static/images/cloud/reference/cross-vpc-clickpipes.png';
import NOV_22 from '@site/static/images/cloud/reference/nov-22-dashboard.png';
import PRIVATE_ENDPOINT from '@site/static/images/cloud/reference/may-30-private-endpoints.png';
import NOTIFICATIONS from '@site/static/images/cloud/reference/nov-8-notifications.png';
import KENESIS from '@site/static/images/cloud/reference/may-17-kinesis.png';
import S3_GCS from '@site/static/images/cloud/reference/clickpipes-s3-gcs.png';
import TOKYO from '@site/static/images/cloud/reference/create-tokyo-service.png';
import CLOUD_CONSOLE from '@site/static/images/cloud/reference/new-cloud-console.gif';
import COPILOT from '@site/static/images/cloud/reference/nov-22-copilot.gif';
import LATENCY_INSIGHTS from '@site/static/images/cloud/reference/oct-4-latency-insights.png';
import CLOUD_CONSOLE_2 from '@site/static/images/cloud/reference/aug-15-compute-compute.png';
import COMPUTE_COMPUTE from '@site/static/images/cloud/reference/july-18-table-inspector.png';
import QUERY_INSIGHTS from '@site/static/images/cloud/reference/june-28-query-insights.png';
import PROMETHEOUS from '@site/static/images/cloud/reference/june-28-prometheus.png';
import KAFKA_CONFIG from '@site/static/images/cloud/reference/june-13-kafka-config.png';
import FAST_RELEASES from '@site/static/images/cloud/reference/june-13-fast-releases.png';
import SHARE_QUERIES from '@site/static/images/cloud/reference/may-30-share-queries.png';
import QUERY_ENDPOINTS from '@site/static/images/cloud/reference/may-17-query-endpoints.png';

この ClickHouse Cloud の変更ログに加えて、[Cloud Compatibility](/cloud/reference/cloud-compatibility.md) ページもご覧ください。
## 2025年2月21日 {#february-21-2025}
### ClickHouse Bring Your Own Cloud (BYOC) for AWS が一般提供開始！ {#clickhouse-byoc-for-aws-ga}

このデプロイモデルでは、データプレーンコンポーネント（計算、ストレージ、バックアップ、ログ、メトリクス）が顧客の VPC で実行され、コントロールプレーン（ウェブアクセス、API、および請求）は ClickHouse VPC 内に残ります。このセットアップは、すべてのデータが安全な顧客環境内に保たれることで、厳格なデータ居住要件に準拠する必要がある大規模なワークロードに最適です。

- 詳細については、[documentation](/cloud/reference/byoc) をご参照いただくか、[announcement blog post](https://clickhouse.com/blog/announcing-general-availability-of-clickhouse-bring-your-own-cloud-on-aws) をお読みください。
- [Contact us](https://clickhouse.com/cloud/bring-your-own-cloud) してアクセスをリクエストしてください。
### Postgres CDC コネクタ for ClickPipes {#postgres-cdc-connector-for-clickpipes}

Postgres CDC コネクタ for ClickPipes がパブリックベータ版としてリリースされました。この機能により、ユーザーは自分の Postgres データベースを ClickHouse Cloud にシームレスにレプリケートできます。

- 使用を開始するには、[documentation](https://clickhouse.com/docs/integrations/clickpipes/postgres) をご覧ください。
- 顧客のユースケースや機能についての詳細は、[landing page](https://clickhouse.com/cloud/clickpipes/postgres-cdc-connector) および [launch blog](https://clickhouse.com/blog/postgres-cdc-connector-clickpipes-public-beta) をご参照ください。
### AWS における ClickHouse Cloud の PCI 準拠 {#pci-compliance-for-clickhouse-cloud-on-aws}

ClickHouse Cloud は、**us-east-1** および **us-west-2** リージョンの **Enterprise tier** 顧客向けに **PCI 準拠サービス** をサポートしています。 PCI 準拠の環境でサービスを開始したいユーザーは、[support](https://clickhouse.com/support/program) に連絡して支援を受けてください。
### Google Cloud Platform における透明データ暗号化および顧客管理暗号化キー {#tde-and-cmek-on-gcp}

**透明データ暗号化（TDE）** および **顧客管理暗号化キー（CMEK）** のサポートが、Google Cloud Platform (GCP) における ClickHouse Cloud に対して利用可能になりました。

- これらの機能についての詳細は、[documentation](https://clickhouse.com/docs/cloud/security/cmek#transparent-data-encryption-tde) をご参照ください。
### AWS 中東 (UAE) の可用性 {#aws-middle-east-uae-availability}

新しいリージョンのサポートが追加され、ClickHouse Cloud は **AWS 中東 (UAE) me-central-1** リージョンで利用できるようになりました。
### ClickHouse Cloud ガードレール {#clickhouse-cloud-guardrails}

ClickHouse Cloud のベストプラクティスを促進し、安定した使用を確保するために、使用するテーブル、データベース、パーティション、パーツの数に対するガードレールを導入します。

- 詳細については、[usage limits](https://clickhouse.com/docs/cloud/bestpractices/usage-limits) セクションのドキュメントをご参照ください。
- すでにこれらの制限を超えている場合は、10％の増加を許可します。質問がある場合は、[support](https://clickhouse.com/support/program) に連絡してください。
## 2025年1月27日 {#january-27-2025}
### ClickHouse Cloud tiers の変更 {#changes-to-clickhouse-cloud-tiers}

私たちは、顧客の変化し続ける要件に合わせて製品を適応させることに専念しています。GA での導入から過去2年間で、ClickHouse Cloud は大きく進化し、私たちのクラウドサービスをどのように活用しているかについて貴重な洞察を得ました。

ワークロードに対して ClickHouse Cloud サービスのサイズとコスト効率を最適化する新機能を導入します。これには、**計算-計算の分離**、高性能のマシンタイプ、および **単一レプリカサービス**が含まれます。また、自動スケーリングと管理されたアップグレードが、よりシームレスで反応的に実行されるように進化しています。

私たちは、最も要求の厳しい顧客とワークロードのニーズを満たすために、業界特有のセキュリティおよびコンプライアンス機能に焦点を当て、基盤となるハードウェアおよびアップグレードに対するより多くの制御、高度な災害復旧機能を備えた **新しいエンタープライズティア**を追加します。

これらの変更をサポートするために、現在の **Development** および **Production** tiers を、進化する顧客基盤の仕様により密接に一致するよう再構築します。新しいアイデアやプロジェクトをテストしているユーザーを対象とした **Basic** tier と、製品ワークロードおよびスケールのデータを扱うユーザーに合わせた **Scale** tier を導入します。

これらおよびその他の機能変更については、[blog](https://clickhouse.com/blog/evolution-of-clickhouse-cloud-new-features-superior-performance-tailored-offerings) をお読みください。既存の顧客は、[new plan](https://clickhouse.com/pricing) を選択するためにアクションを取る必要があります。顧客向けのコミュニケーションは、組織の管理者にメールで送信され、以下の [FAQ](/cloud/manage/jan-2025-faq/summary) には主な変更点とタイムラインが含まれています。
### 倉庫: 計算-計算の分離 (GA) {#warehouses-compute-compute-separation-ga}

計算-計算の分離（「倉庫」とも呼ばれます）が一般提供されています。詳細については、[blog](https://clickhouse.com/blog/introducing-warehouses-compute-compute-separation-in-clickhouse-cloud) を参照してください。[documentation](/cloud/reference/warehouses) もご覧ください。
### 単一レプリカサービス {#single-replica-services}

「単一レプリカサービス」の概念を導入します。これは、スタンドアロンのオファリングと倉庫内の両方で利用できます。スタンドアロンのオファリングとして、単一レプリカサービスはサイズが制限されており、小さなテストワークロードに使用されることを意図しています。倉庫内では、単一レプリカサービスはより大きなサイズでデプロイでき、高可用性を必要としないワークロード（再起動可能な ETL ジョブなど）に利用されます。
### 垂直自動スケーリングの改善 {#vertical-auto-scaling-improvements}

「Make Before Break」（MBB）と呼ばれる新しい垂直スケーリングメカニズムを計算レプリカに導入します。このアプローチでは、古いレプリカを削除する前に新しいサイズのレプリカを1つ以上追加し、スケーリング操作中の容量の損失を防ぎます。既存のレプリカを削除し、新しいレプリカを追加する間のギャップを排除することで、MBB はよりシームレスで破壊的でないスケーリングプロセスを作成します。これは、高リソース使用率が追加容量の必要性を引き起こすスケールアップシナリオに特に有益であり、レプリカを早期に削除するとリソース制約が悪化するだけだからです。
### 水平スケーリング (GA) {#horizontal-scaling-ga}

水平スケーリングが一般提供されました。ユーザーは、API およびクラウドコンソールを通じてサービスをスケールアウトするために追加のレプリカを追加できます。[documentation](/manage/scaling#self-serve-horizontal-scaling) をご覧ください。
### 構成可能なバックアップ {#configurable-backups}

顧客がバックアップを自分のクラウドアカウントにエクスポートできる機能をサポートしています。詳しくは、[documentation](/cloud/manage/backups#configurable-backups) をご覧ください。
### 管理されたアップグレードの改善 {#managed-upgrade-improvements}

安全な管理されたアップグレードは、データベースが機能を追加する際に現在の状態を保つことを可能にすることで、ユーザーに大きな価値を提供します。この展開により、アップグレードに「Make Before Break」（MBB）アプローチを適用し、実行中のワークロードへの影響をさらに減少させました。
### HIPAA サポート {#hipaa-support}

現在、AWS の `us-east-1`、`us-west-2` および GCP の `us-central1`、`us-east1` の準拠リージョンで HIPAA をサポートしています。オンボードを希望する顧客は、ビジネスアソシエイト契約（BAA）にサインし、準拠したバージョンのリージョンにデプロイする必要があります。HIPAA に関する詳細は、[documentation](/cloud/security/security-and-compliance) をご覧ください。
### スケジュールされたアップグレード {#scheduled-upgrades}

ユーザーはサービスのアップグレードをスケジュールできます。この機能は、エンタープライズティアサービスのみにサポートされています。スケジュールされたアップグレードに関する詳細は、[documentation](/manage/updates) をご覧ください。
### 複雑な型への言語クライアントサポート {#language-client-support-for-complex-types}

[Golang](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.30.1)、[Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.11)、および [NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.1) クライアントが Dynamic、Variant、および JSON 型をサポートしました。
### DBT Refreshable Materialized Views サポート {#dbt-support-for-refreshable-materialized-views}

DBT は `1.8.7` リリースで [Refreshable Materialized Views](https://github.com/ClickHouse/dbt-clickhouse/releases/tag/v1.8.7) をサポートしています。
### JWT トークンサポート {#jwt-token-support}

JDBC ドライバー v2、clickhouse-java、[Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.12)、および [NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.0) クライアントで JWT ベースの認証がサポートされました。

JDBC / Java はリリース時に [0.8.0](https://github.com/ClickHouse/clickhouse-java/releases/tag/v0.8.0) になります - 発表予定。
### Prometheus 統合の改善 {#prometheus-integration-improvements}

Prometheus 統合のためにいくつかの改善を加えました。

- **組織レベルのエンドポイント**。ClickHouse Cloud 向けの Prometheus 統合に対する改善を導入しました。サービスレベルのメトリクスに加えて、API には **組織レベルのメトリクス** のエンドポイントも含まれています。この新しいエンドポイントは、組織内のすべてのサービスのメトリクスを自動的に収集し、メトリクスを Prometheus コレクターにエクスポートするプロセスを簡素化します。これらのメトリクスは、Grafana や Datadog のような可視化ツールと統合することで、組織のパフォーマンスの包括的なビューを提供できます。

  この機能はすでにすべてのユーザーに利用可能です。詳細は[こちら](/integrations/prometheus)をご覧ください。

- **フィルターされたメトリクス**。ClickHouse Cloud 向けの Prometheus 統合において、メトリクスのフィルターされたリストを返すサポートが追加されました。この機能により、サービスの健全性を監視するために重要なメトリクスに焦点を当てることができ、応答ペイロードサイズを削減できます。

  この機能は、API のオプションのクエリパラメータを介して利用でき、データ収集を最適化し、Grafana や Datadog などのツールとの統合を簡素化します。
  
  フィルターされたメトリクス機能はすでにすべてのユーザーに利用可能です。詳細は[こちら](/integrations/prometheus)をご覧ください。
## 2024年12月20日 {#december-20-2024}
### マーケットプレイスサブスクリプション組織添付 {#marketplace-subscription-organization-attachment}

新しいマーケットプレイスサブスクリプションを既存の ClickHouse Cloud 組織に添付できるようになりました。マーケットプレイスへの購読を終え、ClickHouse Cloud にリダイレクトされた後、過去に作成した既存の組織を新しいマーケットプレイスサブスクリプションに接続できます。この時点から、組織内のリソースはマーケットプレイス経由で請求されます。

<img alt="Add marketplace subscription"
  style={{width: '600px'}}
  src={ADD_MARKETPLACE} />
### OpenAPI キーの期限切れ強制 {#force-openapi-key-expiration}

API キーの期限切れオプションを制限し、有効期限のない OpenAPI キーを作成しないようにすることが可能です。これらの制限を組織に対して有効にするには、ClickHouse Cloud サポートチームにご連絡ください。
### 通知用のカスタムメール {#custom-emails-for-notifications}

組織の管理者は、特定の通知に対して追加の受信者としてより多くのメールアドレスを追加できるようになりました。これは、通知をエイリアスや ClickHouse Cloud のユーザーでない組織内の他のユーザーに送信したい場合に便利です。これを構成するには、クラウドコンソールの通知設定に移動し、メール通知を受信したいメールアドレスを編集してください。
## 2024年12月6日 {#december-6-2024}
### BYOC (ベータ版) {#byoc-beta}

AWS の Bring Your Own Cloud が現在ベータ版で利用可能です。このデプロイモデルを使用すると、ClickHouse Cloud を独自の AWS アカウントでデプロイし、実行できるようになります。11 以上の AWS リージョンでのデプロイをサポートしており、さらに多くのリージョンが追加される予定です。アクセスを希望される方は、[support](https://clickhouse.com/support/program) までご連絡ください。このデプロイは、大規模なデプロイメント専用であることに注意してください。
### Postgres Change-Data-Capture (CDC) Connector in ClickPipes (パブリックベータ版) {#postgres-change-data-capture-cdc-connector-in-clickpipes-public-beta}

このターンキー統合により、顧客は数回のクリックで自分の Postgres データベースを ClickHouse Cloud にレプリケートし、ClickHouse を使用して超高速な分析を実行できます。このコネクタは、Postgres からの継続的なレプリケーションと一度限りの移行の両方に使用できます。
### ダッシュボード (ベータ版) {#dashboards-beta}

今週、ClickHouse Cloud でダッシュボードのベータ版を発表できることを嬉しく思います。ダッシュボードを使用すると、ユーザーは保存されたクエリを視覚化に変換し、視覚化をダッシュボードに整理し、クエリパラメータを使ってダッシュボードと対話できます。使用を開始するには、[dashboards documentation](/cloud/manage/dashboards) をご参照ください。

<img alt="Dashboards Beta"
  style={{width: '600px'}}
  src={BETA_DASHBOARDS} />
### クエリ API エンドポイント (GA) {#query-api-endpoints-ga}

ClickHouse Cloud におけるクエリ API エンドポイントの GA リリースを発表できることを嬉しく思います。クエリ API エンドポイントを使用すると、保存されたクエリのための RESTful API エンドポイントを数回のクリックで立ち上げ、言語クライアントや認証の複雑さに悩まされることなく、アプリケーション内でデータを消費し始めることができます。最初のローンチ以来、多くの改善が施されています。

* エンドポイントのレイテンシを低減、特にコールドスタート時
* エンドポイント RBAC コントロールの増加
* 構成可能な CORS 許可ドメイン
* 結果ストリーミング
* すべての ClickHouse 互換出力フォーマットのサポート

これらの改善に加えて、現在のフレームワークを利用し、ClickHouse Cloud サービスに対して任意の SQL クエリを実行できる汎用クエリ API エンドポイントを導入できることを嬉しく思います。汎用エンドポイントは、サービス設定ページから有効化および構成できます。

使用を開始するには、[Query API Endpoints documentation](/cloud/get-started/query-endpoints) をご参照ください。

<img alt="API Endpoints"
  style={{width: '600px'}}
  src={API_ENDPOINTS} />
### ネイティブ JSON サポート (ベータ版) {#native-json-support-beta}

ClickHouse Cloud におけるネイティブ JSON サポートのベータ版を開始します。使用を開始するには、[support](https://clickhouse.com/cloud/support) に連絡し、クラウドサービスを有効にしてください。
### ベクトル類似性インデックスを使用したベクトル検索 (早期アクセス) {#vector-search-using-vector-similarity-indexes-early-access}

近似したベクトル検索のためのベクトル類似性インデックスを早期アクセスとして発表します！

ClickHouse は既に、さまざまな [距離関数](https://clickhouse.com/blog/reinvent-2024-product-announcements#vector-search-using-vector-similarity-indexes-early-access) に対する堅牢なサポートを提供しており、線形スキャンを実行する機能もあります。最近では、[usearch](https://github.com/unum-cloud/usearch) ライブラリと階層的ナビゲーション可能な小世界 (HNSW) 近似最近傍検索アルゴリズムを利用した実験的な[近似ベクトル検索](/engines/table-engines/mergetree-family/annindexes)アプローチも追加しました。

使用を開始するには、[early access waitlist](https://clickhouse.com/cloud/vector-search-index-waitlist) にサインアップしてください。
### ClickHouse-Connect (Python) および ClickHouse-Kafka-Connect ユーザー {#clickhouse-connect-python-and-clickhouse-kafka-connect-users}

`MEMORY_LIMIT_EXCEEDED` 例外に遭遇する可能性のあるクライアントに関する問題を抱えた顧客に通知メールが送信されました。

以下にアップグレードしてください：
- Kafka-Connect: > 1.2.5
- ClickHouse-Connect (Java): > 0.8.6
### ClickPipes が AWS のクロス VPC リソースアクセスをサポート {#clickpipes-now-supports-cross-vpc-resource-access-on-aws}

特定のデータソース（例えば AWS MSK）への一方向のアクセスを付与できるようになりました。AWS PrivateLink および VPC Lattice を使用したクロス VPC リソースアクセスにより、個々のリソースを VPC およびアカウント境界を越えて共有したり、プライバシーとセキュリティを損なうことなく、オンプレミス ネットワークからのアクセスを行ったりできます。リソース共有の設定を開始するには、[announcement post](https://clickhouse.com/blog/clickpipes-crossvpc-resource-endpoints?utm_medium=web&utm_source=changelog) をお読みください。

<img alt="VPC ClickPipes"
  style={{width: '600px'}}
  src={CROSS_VPC} />
### ClickPipes が AWS MSK の IAM をサポート {#clickpipes-now-supports-iam-for-aws-msk}

AWS MSK ClickPipes で MSK ブローカーへの IAM 認証の使用が可能になりました。使用を開始するには、[documentation](/integrations/clickpipes/kafka#iam) を確認してください。
### AWS での新しいサービスの最大レプリカサイズ {#maximum-replica-size-for-new-services-on-aws}

今後、AWS で作成される新しいサービスには、最大利用可能レプリカサイズとして 236 GiB が許可されます。
## 2024年11月22日 {#november-22-2024}
### ClickHouse Cloud 用の組み込みの高度な可観測性ダッシュボード {#built-in-advanced-observability-dashboard-for-clickhouse-cloud}

以前は、ClickHouse サーバーのメトリクスやハードウェアリソースの利用状況を監視するための高度な可観測性ダッシュボードは、オープンソースの ClickHouse にのみ利用可能でした。この機能が ClickHouse Cloud コンソールでも利用可能になったことをお知らせします！

このダッシュボードでは、[system.dashboards](/operations/system-tables/dashboards) テーブルに基づいてクエリを表示できるオールインワンの UI を提供します。**Monitoring > Service Health** ページにアクセスして、今日から高度な可観測性ダッシュボードを使用開始してください。

<img alt="Advanced Observability Dashboard"
  style={{width: '600px'}}
  src={NOV_22} />
### AI による SQL オートコンプリート {#ai-powered-sql-autocomplete}

新しい AI Copilot を使用して、クエリを記述する際にインラインの SQL 完成を取得できるように、オートコンプリートを大幅に改善しました。この機能は、任意の ClickHouse Cloud サービスのために **「インラインコード補完を有効にする」** 設定を切り替えることで有効にできます。

<img alt="AI Copilot SQL autocomplete"
  style={{width: '600px'}}
  src={COPILOT} />
### 新しい「Billing」役割 {#new-billing-role}

今後、組織内のユーザーに **Billing** 役割を割り当てることができるようになり、サービスの構成や管理を行うことなく請求情報を表示および管理できます。新しいユーザーを招待するか、既存のユーザーの役割を編集して **Billing** 役割を割り当ててください。
## 2024年11月8日 {#november-8-2024}
### ClickHouse Cloud における顧客通知 {#customer-notifications-in-clickhouse-cloud}

ClickHouse Cloud は、いくつかの請求およびスケーリングイベントに対して、コンソール内およびメール通知を提供します。顧客は、クラウドコンソールの通知センターを介して、UI でのみ表示されるようにする、メールを受信する、またはその両方を選択して、これらの通知を構成できます。サービスレベルで受信する通知のカテゴリと重要性を設定できます。

将来的には、他のイベントに対する通知を追加し、通知を受け取るための追加の方法も提供します。

通知をサービスに対して有効にする方法については、[ClickHouse docs](/cloud/notifications) をご覧ください。

<img alt="Customer notifications UI"
  style={{width: '600px'}}
  src={NOTIFICATIONS} />

<br />
## 2024年10月4日 {#october-4-2024}
### ClickHouse Cloud が GCP における HIPAA 準拠サービスをベータ版で提供開始 {#clickhouse-cloud-now-offers-hipaa-ready-services-in-beta-for-gcp}

保護された健康情報 (PHI) のセキュリティを高めたい顧客は、[Google Cloud Platform (GCP)](https://cloud.google.com/) にオンボードできるようになりました。ClickHouse は、[HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html) により求められる管理的、物理的、技術的な保護措置を実装しており、特定のユースケースとワークロードに応じた設定可能なセキュリティ設定を提供しています。利用可能なセキュリティ設定に関する詳細は、[Security Shared Responsibility Model](/cloud/security/shared-responsibility-model) をご覧ください。

サービスは、**Dedicated** サービスタイプの顧客に GCP `us-central-1` で提供されており、ビジネスアソシエイト契約 (BAA) が必要です。この機能へのアクセスをリクエストしたり、GCP、AWS、Azure の追加リージョンの待機リストに参加したりするには、[sales](mailto:sales@clickhouse.com) または [support](https://clickhouse.com/support/program) にご連絡ください。
### 計算-計算の分離が GCP および Azure でプライベートプレビューに {#compute-compute-separation-is-now-in-private-preview-for-gcp-and-azure}

最近、AWS 向けの計算-計算の分離に関するプライベートプレビューを発表しました。GCP および Azure でも利用可能になったことをお知らせします。

計算-計算の分離により、特定のサービスを読み書き可能または読み取り専用サービスとして指定できるため、コストとパフォーマンスを最適化するための最適な計算構成を設計できます。詳細については、[read the docs](/cloud/reference/compute-compute-separation)をご覧ください。
### セルフサービス MFA リカバリーコード {#self-service-mfa-recovery-codes}

多要素認証を使用している顧客は、電話を失ったりトークンを誤って削除した場合に使用できるリカバリーコードを取得できるようになりました。MFA に初めて登録する顧客には、セットアップ時にコードが提供されます。すでに MFA を使用している顧客は、既存の MFA トークンを削除し、新しいものを追加することでリカバリーコードを取得できます。
### ClickPipes 更新: カスタム証明書、レイテンシインサイトなど {#clickpipes-update-custom-certificates-latency-insights-and-more}

ClickPipes に関する最新のアップデートを共有できることを嬉しく思います。これらの新機能は、データ取込みに対する管理を強化し、パフォーマンスメトリクスへの可視性を提供するように設計されています。

*Kafka 用のカスタム認証証明書*

ClickPipes for Kafka は、SASL および公開 SSL/TLS を使用した Kafka ブローカーのためのカスタム認証証明書をサポートするようになりました。ClickPipe のセットアップ中に SSL 証明書セクションで自分の証明書を簡単にアップロードでき、安全な接続を Kafka に確保できます。

*Kafka および Kinesis のレイテンシメトリクスを導入*

パフォーマンスの可視性は重要です。ClickPipes には、メッセージの生成（Kafka トピックまたは Kinesis ストリームから）から ClickHouse Cloud への取込みまでの時間を示すレイテンシグラフが追加されました。 この新しいメトリクスを使用することで、データパイプラインのパフォーマンスをより密接に監視し、最適化を図ることができます。

<img alt="Latency Metrics graph"
  style={{width: '600px'}}
  src={LATENCY_INSIGHTS} />

<br />

*Kafka および Kinesis のスケーリングコントロール (プライベートベータ版)*

高いスループットは、データ量やレイテンシのニーズを満たすために追加のリソースを要求する場合があります。ClickPipes に対して、クラウドコンソールを介して直接利用可能な水平スケーリングを導入します。この機能は現在プライベートベータ版であり、お客様の要件に基づいてリソースをより効果的にスケールすることができます。ベータテストに参加するには、[support](https://clickhouse.com/support/program) にご連絡ください。

*Kafka および Kinesis 用の生メッセージ取込み*

解析しなくても、Kafka または Kinesis のメッセージ全体を取込むことが可能になりました。ClickPipes は、ユーザーが生データを必要に応じて動かす柔軟性を提供する `_raw_message` [仮想カラム](/integrations/clickpipes/kafka#kafka-virtual-columns) のサポートを追加しました。
## 2024年8月29日 {#august-29-2024}
### 新しい Terraform プロバイダーバージョン - v1.0.0 {#new-terraform-provider-version---v100}

Terraform を使用すると、ClickHouse Cloud サービスをプログラムによって制御し、構成をコードとして保存できます。私たちの Terraform プロバイダーは、約 200,000 のダウンロードを誇り、正式に v1.0.0 となりました！この新しいバージョンには、より良いリトライロジックや、ClickHouse Cloud サービスにプライベートエンドポイントを接続するための新しいリソースなどの改善が含まれています。ここから [Terraform provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest) をダウンロードし、[フルチェンジログ](https://github.com/ClickHouse/terraform-provider-clickhouse/releases/tag/v1.0.0) を確認できます。
### 2024 SOC 2 Type II レポートおよび更新された ISO 27001 証明書 {#2024-soc-2-type-ii-report-and-updated-iso-27001-certificate}

2024 SOC 2 Type II レポートおよび更新された ISO 27001 証明書の提供をお知らせできることを誇りに思います。これらには、最近開始した Azure 上のサービスと、AWS および GCP におけるサービスの継続的なカバレッジが含まれています。

SOC 2 Type II は、ClickHouse ユーザーに提供するサービスのセキュリティ、可用性、処理の整合性、機密性への継続的なコミットメントを示しています。詳細については、[SOC 2 - SOC for Service Organizations: Trust Services Criteria](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services) (公認会計士協会によって発行) および [What is ISO/IEC 27001](https://www.iso.org/standard/27001) (国際標準化機構から) をご覧ください。

セキュリティおよびコンプライアンスに関する文書やレポートについては、[Trust Center](https://trust.clickhouse.com/) をご覧ください。
## 2024年8月15日 {#august-15-2024}
### 計算-計算の分離が AWS でプライベートプレビューに {#compute-compute-separation-is-now-in-private-preview-for-aws}

既存の ClickHouse Cloud サービスでは、レプリカは読み取りと書き込みの両方を処理し、特定のレプリカが単一の操作のみを処理するように設定する方法はありません。計算-計算の分離と呼ばれる新しい機能を導入し、特定のサービスを読み書き可能または読み取り専用サービスとして指定できるようになります。これにより、コストとパフォーマンスを最適化するための最適な計算構成を設計できます。

新しい計算-計算の分離機能により、同じオブジェクトストレージフォルダーを使用する複数の計算ノードグループを作成でき、それぞれ独自のエンドポイントを持ち、同じテーブル、ビューなどを使用できます。[計算-計算の分離についてはこちら](/cloud/reference/compute-compute-separation)をご覧ください。このプライベートプレビュー機能にアクセスしたい場合は、[support](https://clickhouse.com/support/program) までご連絡ください。

<img alt="Example architecture for compute-compute separation"
  style={{width: '600px'}}
  src={CLOUD_CONSOLE_2} />
### ClickPipes for S3 と GCS が GA になり、継続的モードサポートを開始 {#clickpipes-for-s3-and-gcs-now-in-ga-continuous-mode-support}

ClickPipes は ClickHouse Cloud にデータを取り込む最も簡単な方法です。私たちは、S3 および GCS のための [ClickPipes](https://clickhouse.com/cloud/clickpipes) が **一般提供開始** されたことをお知らせできることを嬉しく思います。ClickPipes は一度限りのバッチ取り込みと「継続的モード」の両方をサポートしています。取り込みタスクは、特定のリモートバケットからパターンに一致するすべてのファイルを ClickHouse の宛先テーブルにロードします。「継続的モード」では、ClickPipes のジョブが常に稼働し、新しいリモートオブジェクトストレージバケットに追加された一致するファイルを取り込みます。これにより、ユーザーは任意のオブジェクトストレージバケットを完全に発展したステージングエリアとして使用して ClickHouse Cloud にデータを取り込むことができます。ClickPipes の詳細は、[documentation](/integrations/clickpipes)をご覧ください。
## 2024年7月18日 {#july-18-2024}
### Prometheus 用のメトリクスエンドポイントが一般提供開始 {#prometheus-endpoint-for-metrics-is-now-generally-available}

前回のクラウド変更ログで、ClickHouse Cloud からメトリクスをエクスポートするためのプライベートプレビューを発表しました。この機能を使用すると、[ClickHouse Cloud API](/cloud/manage/api/api-overview) を使用して、[Grafana](https://grafana.com/) や [Datadog](https://www.datadoghq.com/) などのツールにメトリクスを取得し、可視化することができます。この機能が **一般提供開始** されたことをお知らせできることを嬉しく思います。詳細については [our docs](/integrations/prometheus) をご覧ください。
```
### Cloud Console のテーブルインスペクター {#table-inspector-in-cloud-console}

ClickHouseには、テーブルのスキーマを調査するための[`DESCRIBE`](/sql-reference/statements/describe-table)のようなコマンドがあります。これらのコマンドはコンソールに出力されますが、すべての関連データを取得するために複数のクエリを組み合わせる必要があるため、使用が便利でないことがしばしばあります。

最近、SQLを記述することなくUIから重要なテーブルやカラムの情報を取得できる**テーブルインスペクター**をクラウドコンソールに導入しました。クラウドコンソールをチェックして、あなたのサービス用のテーブルインスペクターを試してみてください。これにより、スキーマ、ストレージ、圧縮などに関する情報を一つの統一されたインターフェイスで提供します。

<img alt="テーブルインスペクター UI"
  style={{width: '800px', marginLeft: 0}}
  src={COMPUTE_COMPUTE} />
### 新しい Java クライアント API {#new-java-client-api}

私たちの[Java クライアント](https://github.com/ClickHouse/clickhouse-java)は、ユーザーがClickHouseに接続するために使用する最も人気のあるクライアントの一つです。私たちは、再設計されたAPIと様々なパフォーマンス最適化を含め、使いやすく直感的にすることを目指しました。これらの変更により、Java アプリケーションからClickHouseに接続するのがずっと簡単になります。更新されたJavaクライアントの使用方法については、この[ブログ投稿](https://clickhouse.com/blog/java-client-sequel)をお読みください。
### 新しいアナライザーがデフォルトで有効に {#new-analyzer-is-enabled-by-default}

ここ数年、クエリ分析と最適化のための新しいアナライザーに取り組んできました。このアナライザーはクエリのパフォーマンスを向上させ、より高速で効率的な`JOIN`を可能にします。以前は、新しいユーザーが`allow_experimental_analyzer`の設定を使用してこの機能を有効にする必要がありました。この改善されたアナライザーは、現在、新しいClickHouse Cloud サービスでデフォルトで利用可能です。

さらなる改善が計画されているため、アナライザーについての改善にご期待ください！

## 2024年6月28日 {#june-28-2024}
### ClickHouse Cloud for Microsoft Azure が一般提供されました！ {#clickhouse-cloud-for-microsoft-azure-is-now-generally-available}

私たちは、先月の5月にベータ版でMicrosoft Azureのサポートを最初に発表しました[こちら](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta)。この最新のクラウドリリースでは、Azureのサポートがベータ版から一般提供に移行することを嬉しく思います。ClickHouse Cloudは、AWS、Google Cloud Platform、および現在Microsoft Azureのすべての3つの主要クラウドプラットフォームで利用可能です。

このリリースには、[Microsoft Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/clickhouse.clickhouse_cloud)を通じたサブスクリプションのサポートも含まれています。サービスは最初に以下の地域でサポートされます：
- アメリカ合衆国: ウエストUS 3（アリゾナ）
- アメリカ合衆国: イーストUS 2（バージニア）
- ヨーロッパ: ドイツ西部中央（フランクフルト）

特定の地域をサポートしてほしい場合は、[お問い合わせ](https://clickhouse.com/support/program)ください。

### クエリログインサイト {#query-log-insights}

クラウドコンソールの新しいクエリインサイトUIは、ClickHouseの組み込みクエリログを使いやすくします。ClickHouseの`system.query_log`テーブルは、クエリ最適化、デバッグ、全体的なクラスターの健康状態やパフォーマンスを監視するための重要な情報源です。ただし、一つだけ注意点があります。70以上のフィールドとクエリごとの複数のレコードがあるため、クエリログを解釈することは急峻な学習曲線があります。この初期版のクエリインサイトは、クエリのデバッグと最適化パターンを簡素化するための将来の作業の青写真を提供します。この機能を改善し続けるために、あなたのフィードバックをお聞かせいただければ幸いです。

<img alt="クエリインサイトUI"
  style={{width: '600px', marginLeft: 0}}
  src={QUERY_INSIGHTS} />
### メトリック用のPrometheusエンドポイント（プライベートプレビュー） {#prometheus-endpoint-for-metrics-private-preview}

最もリクエストの多かった機能の一つ：ClickHouse Cloudから[Prometheus](https://prometheus.io/)メトリックを[Grafana](https://grafana.com/)および[Datadog](https://www.datadoghq.com/)にエクスポートして可視化できます。Prometheusは、ClickHouseを監視し、カスタムアラートを設定するためのオープンソースソリューションを提供します。ClickHouse CloudサービスのPrometheusメトリックへのアクセスは、[ClickHouse Cloud API](/integrations/prometheus)を通じて利用可能です。この機能は現在プライベートプレビュー中です。機能を組織で有効にするためには、[サポートチーム](https://clickhouse.com/support/program)にお問い合わせください。

<img alt="GrafanaによるPrometheusメトリック"
  style={{width: '600px', marginLeft: 0}}
  src={PROMETHEOUS} />
### その他の機能: {#other-features}
- [設定可能なバックアップ](/cloud/manage/backups#configurable-backups)が一般提供され、カスタムバックアップポリシー（頻度、保持、スケジュールなど）を構成できます。

## 2024年6月13日 {#june-13-2024}
### Kafka ClickPipes コネクタのための設定可能なオフセット（ベータ） {#configurable-offsets-for-kafka-clickpipes-connector-beta}

最近まで、新しい[Kafka ClickPipesコネクタ](/integrations/clickpipes/kafka)を設定すると、常にKafkaトピックの最初からデータを消費していました。この場合、過去のデータを再処理したり、新しいデータの監視を行ったり、正確なポイントから再開する必要がある特定のユースケースにフィットするには柔軟性が不足しているかもしれません。

Kafka用のClickPipesは、Kafkaトピックからのデータ消費に対する柔軟性と制御を強化する新機能を追加しました。データの消費を開始するオフセットを構成できるようになりました。

以下のオプションが利用可能です：
- 最初から: Kafkaトピックの開始時点からデータを消費し始めます。このオプションは、すべての過去のデータを再処理する必要があるユーザーに最適です。
- 最新から: 最も最近のオフセットからデータの消費を開始します。これは、新しいメッセージのみに関心があるユーザーに役立ちます。
- タイムスタンプから: 特定のタイムスタンプ以降に生成されたメッセージからデータを消費し始めます。この機能により、より正確な制御が可能になり、ユーザーは特定の時点からの処理を再開することができます。

<img alt="Kafkaコネクタのオフセットを構成"
  style={{width: '600px', marginLeft: 0}}
  src={KAFKA_CONFIG} />
### サービスのファストリリースチャネルへの登録 {#enroll-services-to-the-fast-release-channel}

ファストリリースチャネルでは、リリーススケジュールより早くサービスに更新を受け取ることができます。以前は、この機能を有効にするためにサポートチームの支援が必要でした。現在、ClickHouse Cloudコンソールを使用して、サービスに直接この機能を有効にできます。**設定**に移動し、**ファストリリースに登録**をクリックするだけです。あなたのサービスは、入手可能な更新をすぐに受け取るようになります！

<img alt="ファストリリースに登録"
  style={{width: '500px', marginLeft: 0}}
  src={FAST_RELEASES} />
### 水平スケーリングのためのTerraformサポート {#terraform-support-for-horizontal-scaling}

ClickHouse Cloudは、[水平スケーリング](/manage/scaling#vertical-and-horizontal-scaling)をサポートしており、同じサイズの追加のレプリカをサービスに追加することができます。水平スケーリングは、同時クエリをサポートするためにパフォーマンスと並行性を改善します。以前は、追加のレプリカを追加するにはClickHouse CloudコンソールまたはAPIを使用する必要がありましたが、今ではTerraformを使用してサービスからレプリカを追加または削除できるようになり、必要に応じてClickHouseサービスをプログラム的にスケールすることができます。

詳しくは、[ClickHouse Terraformプロバイダー](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)をご覧ください。

## 2024年5月30日 {#may-30-2024}
### チームメイトとクエリを共有 {#share-queries-with-your-teammates}

SQLクエリを書くとき、あなたのチームの他の人もそのクエリを便利だと感じる可能性が高いです。以前は、クエリをSlackやメールで送信する必要があり、もしあなたがクエリを編集しても、チームメイトがそのクエリの更新を自動的に受け取る方法がありませんでした。

今、ClickHouse Cloudコンソールを通じて簡単にクエリを共有できるようになったことをお知らせします。クエリエディタから、チーム全体または特定のチームメンバーにクエリを直接共有できます。また、読み取り専用または書き込み専用のアクセス権を指定することもできます。クエリエディタで**共有**ボタンをクリックして、新しい共有クエリ機能を試してみてください。

<img alt="クエリを共有" style={{width: '500px', marginLeft: 0}} src={SHARE_QUERIES} />
### ClickHouse Cloud for Microsoft Azure がベータ版で利用可能に {#clickhouse-cloud-for-microsoft-azure-is-now-in-beta}

ClickHouse CloudサービスをMicrosoft Azure 上に作成する機能をついに導入しました！すでに、プライベートプレビュープログラムの一環として、Many customers are using ClickHouse Cloud on Azure in production. 今や誰でもAzure上に自分のサービスを作成できます。AWSやGCPでサポートされているすべてのお気に入りのClickHouse機能もAzureで利用可能です。

次の数週間でClickHouse Cloud for Azureが一般提供される予定です。[このブログ投稿](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta)を読んで詳細を学ぶか、ClickHouse Cloudコンソールを介してAzureを使用して新しいサービスを作成してください。

注意：Azure の**開発**サービスは、現時点ではサポートされていません。

### クラウドコンソールを介してプライベートリンクを設定 {#set-up-private-link-via-the-cloud-console}

私たちのプライベートリンク機能により、公共インターネットにトラフィックを直接向けることなく、あなたのClickHouse Cloudサービスをクラウドプロバイダーの内部サービスと接続できます。これによりコストを削減し、セキュリティを強化できます。以前はこれを設定するのが難しく、ClickHouse Cloud APIを使用する必要がありました。

現在、ClickHouse Cloudコンソールから数回のクリックでプライベートエンドポイントを構成できます。サービスの**設定**に移動し、**セキュリティ**セクションに進んで、**プライベートエンドポイントの設定**をクリックするだけです。

<img alt="プライベートエンドポイントを設定" src={PRIVATE_ENDPOINT} />
## 2024年5月17日 {#may-17-2024}
### ClickPipes を使用してAmazon Kinesisからデータを取り込む（ベータ） {#ingest-data-from-amazon-kinesis-using-clickpipes-beta}

ClickPipesは、コードなしでデータを取り込むためにClickHouse Cloudが提供する専用のサービスです。Amazon Kinesisは、AWSのフルマネージドストリーミングサービスで、データストリームを取り込んで保存し、処理します。私たちは、リクエストの多かったAmazon Kinesis向けのClickPipesベータ版を発表できることを嬉しく思います。ClickPipesにさらに多くの統合を追加する予定なので、どのデータソースをサポートしてほしいかお知らせください！この機能の詳細については[こちら](https://clickhouse.com/blog/clickpipes-amazon-kinesis)をお読みください。

クラウドコンソールで新しいAmazon Kinesis統合をお試しいただけます：

<img alt="ClickPipesのAmazon Kinesis"
  src={KENESIS} />
### 設定可能なバックアップ（プライベートプレビュー） {#configurable-backups-private-preview}

バックアップはすべてのデータベースにとって重要ですが（信頼性のあるデータベースでも）、私たちはClickHouse Cloudの初日からバックアップを非常に真剣に受け止めています。今週、私たちは設定可能なバックアップを導入し、サービスのバックアップに対してはるかに大きな柔軟性を提供しています。開始時刻、保持、頻度を制御できるようになりました。この機能は**本番**および**専用**サービスで利用可能ですが、**開発**サービスでは利用できません。この機能はプライベートプレビュー中であるため、あなたのサービスに対して有効にするにはsupport@clickhouse.comにお問い合わせください。設定可能なバックアップに関する詳しい情報は[こちら](https://clickhouse.com/blog/configurable-backups-in-clickhouse-cloud)をご覧ください。

### SQLクエリからAPIを作成する（ベータ） {#create-apis-from-your-sql-queries-beta}

ClickHouse用にSQLクエリを書くとき、アプリケーションにクエリを公開するには、依然としてドライバを介してClickHouseに接続する必要があります。今、当社の新しい**クエリエンドポイント**機能を使えば、構成なしでAPIからSQLクエリを直接実行できます。クエリエンドポイントは、JSON、CSV、TSVを返すように指定できます。クラウドコンソールで**共有**ボタンをクリックして、この新しい機能をクエリで試してみてください。クエリエンドポイントの詳細は[こちら](https://clickhouse.com/blog/automatic-query-endpoints)でご覧ください。

<img alt="クエリエンドポイントを構成" style={{width: '450px', marginLeft: 0}} src={QUERY_ENDPOINTS} />
### 公式のClickHouse認定が利用可能になりました {#official-clickhouse-certification-is-now-available}

ClickHouse開発トレーニングコースに12の無料トレーニングモジュールがあります。今週前まで、ClickHouseにおけるあなたの習熟度を証明する正式な方法はありませんでした。私たちは最近、**ClickHouse認定開発者**となるための公式試験を導入しました。この試験を受けることで、データ取り込み、モデリング、分析、パフォーマンス最適化などのトピックにおけるClickHouseの習熟度を、現在および将来の雇用主と共有できます。試験は[こちら](https://clickhouse.com/learn/certification)で受けることができます。また、ClickHouse認定についての詳細はこの[ブログ投稿](https://clickhouse.com/blog/first-official-clickhouse-certification)をお読みください。

## 2024年4月25日 {#april-25-2024}
### ClickPipesを利用してS3およびGCSからデータを読み込む {#load-data-from-s3-and-gcs-using-clickpipes}

新しくリリースされたクラウドコンソールには、「データソース」という新しいセクションがあることにお気づきかもしれません。「データソース」ページは、様々なソースからClickHouse Cloudにデータを簡単に挿入することを可能にする、ネイティブなClickHouse Cloud機能であるClickPipesによって提供されています。

最新のClickPipesの更新により、Amazon S3およびGoogle Cloud Storageから直接データをアップロードできるようになりました。私たちの組み込みテーブル関数を使用し続けることもできますが、ClickPipesはUIを介して完全に管理されるサービスであり、わずか数回のクリックでS3およびGCSからデータを取り込むことができます。この機能はまだプライベートプレビュー中ですが、今日はクラウドコンソールを介して試してみることができます。

<img alt="ClickPipes S3およびGCS" src={S3_GCS} />
### 500以上のソースからClickHouse Cloudにデータを読み込むためにFivetranを使用する {#use-fivetran-to-load-data-from-500-sources-into-clickhouse-cloud}

ClickHouseは、すべての大規模データセットを迅速にクエリできますが、もちろん、データは最初にClickHouseに挿入される必要があります。Fivetranの包括的なコネクタのおかげで、ユーザーは現在500以上のソースからデータを迅速にロードできます。Zendesk、Slack、またはお気に入りのアプリケーションからデータをロードする必要がある場合は、Fivetranの新しいClickHouseデスティネーションを使用すると、アプリケーションデータのターゲットデータベースとしてClickHouseを利用できます。

これは、私たちの統合チームによる数ヶ月の努力によって構築されたオープンソースの統合です。ここで、[リリースブログ投稿](https://clickhouse.com/blog/fivetran-destination-clickhouse-cloud)や[GitHubリポジトリ](https://github.com/ClickHouse/clickhouse-fivetran-destination)をご確認ください。

### その他の変更 {#other-changes}

**コンソールの変更**
- SQLコンソールでの出力形式のサポート

**統合の変更**
- ClickPipes Kafkaコネクタはマルチブローカーセットアップをサポート
- PowerBIコネクタはODBCドライバの構成オプションを提供するサポートを追加

## 2024年4月18日 {#april-18-2024}
### ClickHouse CloudのAWS東京リージョンが利用可能になりました {#aws-tokyo-region-is-now-available-for-clickhouse-cloud}

このリリースでは、ClickHouse Cloudの新しいAWS東京リージョン（`ap-northeast-1`）が導入されました。ClickHouseが最速のデータベースとなることを目指して、私たちはあらゆるクラウド用により多くのリージョンを追加し、遅延を可能な限り削減するよう努めています。更新されたクラウドコンソールで東京に新しいサービスを作成できます。

<img alt="東京サービスを作成" src={TOKYO} />

その他の変更：
### コンソールの変更 {#console-changes}
- ClickPipes for KafkaのAvroフォーマットサポートが一般提供されました
- Terraformプロバイダーのリソース（サービスとプライベートエンドポイント）のインポートに対する完全サポートを実装しました

### 統合の変更 {#integrations-changes}
- NodeJSクライアントのメジャー安定リリース: クエリ + ResultSetの高度なTypeScriptサポート、URL構成
- Kafkaコネクタ: DLQへの書き込み時に例外を無視するバグを修正、Avro Enumタイプのサポートを追加、[MSK](https://www.youtube.com/watch?v=6lKI_WlQ3-s)および[Confluent Cloud](https://www.youtube.com/watch?v=SQAiPVbd3gg)でのコネクタ使用のガイドを公開
- Grafana: UIでNullableタイプサポートを修正、動的OTELトレーステーブル名のサポートを修正
- DBT: カスタムマテリアライゼーションのモデル設定を修正
- Javaクライアント: 不正確なエラーコード解析のバグを修正
- Pythonクライアント: 数値タイプのバインディング用のパラメータを修正、クエリバインディングでの数値リストのバグを修正、SQLAlchemy Pointサポートを追加

## 2024年4月4日 {#april-4-2024}
### 新しいClickHouse Cloudコンソールの導入 {#introducing-the-new-clickhouse-cloud-console}

このリリースは、新しいクラウドコンソールのプライベートプレビューを導入します。

ClickHouseでは、開発者体験を改善する方法について常に考えています。リアルタイムデータウェアハウスを最速に提供するだけでは不十分で、使いやすく管理しやすい必要があります。

何千人ものClickHouse Cloudユーザーが毎月数十億のクエリをSQLコンソールで実行しているため、ClickHouse Cloudサービスとやりとりをこれまで以上に簡単にするために、世界クラスのコンソールに投資することを決定しました。新しいクラウドコンソール体験は、スタンドアロンのSQLエディタと管理コンソールを統一された直感的なUIに融合させています。

選ばれた顧客は新しいクラウドコンソール体験のプレビューを受け取ります—ClickHouseでデータを探検し管理するための統一された没入的な方法です。優先的なアクセスを希望される場合は、support@clickhouse.comまでお問い合わせください。

<img alt="新しいクラウドコンソール" src={CLOUD_CONSOLE} />
## 2024年3月28日 {#march-28-2024}

このリリースでは、Microsoft Azureのサポート、APIを介した水平スケーリング、およびプライベートプレビュー内のリリースチャネルを導入します。
### 一般的なアップデート {#general-updates}
- プライベートプレビューでMicrosoft Azureのサポートを導入しました。アクセスを取得するには、アカウント管理またはサポートに連絡するか、[ウェイトリスト](https://clickhouse.com/cloud/azure-waitlist)に参加してください。
- リリースチャネルを導入しました—環境タイプに基づいてアップグレードのタイミングを指定する能力。今回のリリースでは、非生産環境を本番より先にアップグレード可能にする「ファスト」リリースチャネルを追加しました（有効にするにはサポートに連絡してください）。

### 管理の変更 {#administration-changes}
- APIを介した水平スケーリング設定のサポートを追加（プライベートプレビュー、サポートに連絡して有効にしてください）
- 起動時にメモリ不足エラーが発生するサービスをスケールアップするためのオートスケーリングを改善
- Terraformプロバイダー経由でAWSのCMEKのサポートを追加

### コンソールの変更 {#console-changes-1}
- Microsoftソーシャルログインをサポート
- SQLコンソールでのパラメータ化されたクエリ共有機能を追加
- クエリエディタのパフォーマンスを大幅に改善（いくつかのEU地域で5秒から1.5秒のレイテンシに）

### 統合の変更 {#integrations-changes-1}
- ClickHouse OpenTelemetryエクスポータ: ClickHouseレプリケーショントーブルエンジンのサポートを[追加](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31920)し、[統合テストを追加](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31896)
- ClickHouse DBTアダプタ: 辞書用の[マテリアライゼーションマクロのサポートを追加](https://github.com/ClickHouse/dbt-clickhouse/pull/255)、[TTL式サポートのテストを追加](https://github.com/ClickHouse/dbt-clickhouse/pull/254) 
- ClickHouse Kafka Connectシンク: Kafkaプラグインの発見に[互換性を追加](https://github.com/ClickHouse/clickhouse-kafka-connect/issues/350)（コミュニティ貢献）
- ClickHouse Javaクライアント: 新しいクライアントAPI用の[新しいパッケージを導入](https://github.com/ClickHouse/clickhouse-java/pull/1574)し、[クラウドテスト用のテストカバレッジを追加](https://github.com/ClickHouse/clickhouse-java/pull/1575)
- ClickHouse NodeJSクライアント: 新しいHTTPキープアライブ動作に対するテストとドキュメントを拡張しました。v0.3.0リリース以降利用可能です。
- ClickHouse Golangクライアント: マップ内のキーとしてのEnumの[バグを修正](https://github.com/ClickHouse/clickhouse-go/pull/1236) ; 接続プール内にエラーのある接続が残るという[バグを修正](https://github.com/ClickHouse/clickhouse-go/pull/1237)（コミュニティ貢献）
- ClickHouse Pythonクライアント: PyArrow経由のクエリストリーミングの[サポートを追加](https://github.com/ClickHouse/clickhouse-connect/issues/155)（コミュニティ貢献）

### セキュリティのアップデート {#security-updates}
- ClickHouse Cloudを更新し、["ロールベースアクセス制御の回避を防止"](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-45h5-f7g3-gr8r)（CVE-2024-22412）

## 2024年3月14日 {#march-14-2024}

このリリースでは、新しいクラウドコンソール体験、S3およびGCSからのバルクロードのためのClickPipes、ClickPipes用のAvroフォーマットのサポートが早期アクセスとして提供され、ClickHouseデータベースバージョンを24.1にアップグレードします。新しい関数をサポートするとともに、パフォーマンスやリソースの使用量が最適化されています。

### コンソールの変更 {#console-changes-2}
- 新しいクラウドコンソール体験が早期アクセスとして利用可能です（参加に興味がある場合はサポートにお問い合わせください）。
- S3およびGCSからのバルクロード用のClickPipesが早期アクセスとして利用可能です（参加に興味がある場合はサポートにお問い合わせください）。
- ClickPipes for Kafka用のAvroフォーマットのサポートが早期アクセスとして利用可能です（参加に興味がある場合はサポートにお問い合わせください）。

### ClickHouseバージョンのアップグレード {#clickhouse-version-upgrade}
- FINALへの最適化、ベクトル化の改善、より高速な集計 - 詳細については[23.12リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final)を参照してください。
- punycodeの処理、文字列類似度の検出、外れ値の検出に関する新しい関数、およびマージとKeeper用のメモリ最適化 - 詳細については[24.1リリースブログ](https://clickhouse.com/blog/clickhouse-release-24-01)および[プレゼンテーション](https://presentations.clickhouse.com/release_24.1/)を参照してください。
- このClickHouseクラウドバージョンは24.1を基にしており、数十の新機能、パフォーマンス改善、バグ修正を見ることができます。コアデータベースの[変更履歴](/whats-new/changelog/2023#2312)を参照してください。

### 統合の変更 {#integrations-changes-2}
- Grafana: v4のダッシュボード移行、アドホックフィルタリングロジックを修正
- Tableauコネクタ: DATENAME機能および「実数」引数のラウンド処理を修正
- Kafkaコネクタ: 接続初期化時のNPEを修正、JDBCドライバオプションを指定できる機能を追加
- Golangクライアント: レスポンス処理のためのメモリフットプリントを削減、Date32の極端な値を修正、圧縮時のエラー報告を修正
- Pythonクライアント: datetimeパラメータ内のタイムゾーンサポートを改善、Pandas DataFrame用のパフォーマンスを改善

## 2024年2月29日 {#february-29-2024}

このリリースでは、SQLコンソールアプリケーションの読み込み時間を改善し、ClickPipesにおけるSCRAM-SHA-256認証をサポートし、Kafka Connectへのネスト構造のサポートを拡張します。

### コンソールの変更 {#console-changes-3}
- SQLコンソールアプリケーションの初期読み込み時間を最適化
- SQLコンソールでのレース条件により「認証失敗」エラーが発生する問題を修正
- 監視ページにおいて、最新のメモリアロケーション値が時折不正確である問題を修正
- SQLコンソールで時折KILL QUERYコマンドが重複して発行される問題を修正
- Kafkaベースのデータソース用にClickPipesでSCRAM-SHA-256認証メソッドのサポートを追加

### 統合の変更 {#integrations-changes-3}
- Kafkaコネクタ: 複雑なネスト構造（Array, Map）へのサポートを拡張；FixedStringタイプのサポートを追加；複数のデータベースへの取り込みをサポート
- Metabase: ClickHouseのバージョン23.8未満との互換性を修正
- DBT: モデル作成に設定を渡す機能を追加
- Node.jsクライアント: 長期にわたるクエリ（>1時間）のサポートと空の値の処理を改善

## 2024年2月15日 {#february-15-2024}

このリリースでは、コアデータベースバージョンをアップグレードし、Terraformを通じてプライベートリンクを設定する機能を追加し、Kafka Connectを介した非同期挿入に対してまったく一度のみのセマンティクスへのサポートを追加します。

### ClickHouseバージョンのアップグレード {#clickhouse-version-upgrade-1}
- S3からの連続的かつスケジュールされたデータローディングのためのS3Queueテーブルエンジンが本番準備完了 - 詳細については[23.11リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-11)を参照してください。
- FINALやベクトル化に対する大幅なパフォーマンス改善があり、SIMD命令が高速なクエリを生成 - 詳細については[23.12リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final)を参照してください。
- このClickHouseクラウドバージョンは23.12を基にしており、数十の新機能、パフォーマンス改善、バグ修正を見ることができます。コアデータベースの[変更履歴](/whats-new/changelog/2023#2312)を参照してください。

### コンソールの変更 {#console-changes-4}
- Terraformプロバイダーを通じてAWS Private LinkおよびGCP Private Service Connectを設定する機能を追加
- リモートファイルデータのインポートのためのレジリエンシーを改善
- すべてのデータインポートにインポートステータス詳細のひな形を追加
- S3データインポートへのキー/シークレットキー資格情報のサポートを追加

### 統合の変更 {#integrations-changes-4}
* Kafka Connect
    * exactly onceのためのasync_insertをサポート（デフォルトでは無効）
* Golangクライアント
    * DateTimeバインディングを修正 
    * バッチ挿入のパフォーマンスを改善
* Javaクライアント
    * リクエスト圧縮の問題を修正

### 設定の変更 {#settings-changes}
* `use_mysql_types_in_show_columns`はもはや必要ありません。MySQLインターフェイスを介して接続すると自動的に有効になります。
* `async_insert_max_data_size`のデフォルト値は`10 MiB`になりました。

## 2024年2月2日 {#february-2-2024}

このリリースでは、Azure Event Hub用のClickPipesの利用可能性を提供し、v4 ClickHouse Grafanaコネクタを使用してログとトレースのナビゲーションを大幅に改善し、FlywayやAtlasデータベーススキーマ管理ツールのサポートを導入します。

### コンソールの変更 {#console-changes-5}
* Azure Event Hub用のClickPipesサポートを追加
* 新しいサービスはデフォルトのアイドリング時間が15分に設定されます

### 統合の変更 {#integrations-changes-5}
* [Grafana用ClickHouseデータソース](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/) v4リリース
  * テーブル、ログ、タイムシリーズ、およびトレース用の専門エディタを持つ完全に再構築されたクエリビルダー
  * より複雑で動的なクエリをサポートする完全に再構築されたSQLジェネレーター
  * ログとトレースビューでOpenTelemetryのファーストクラスサポートを追加
  * ログとトレース用のデフォルトのテーブルとカラムを指定するための設定を拡張
  * カスタムHTTPヘッダーを指定する機能を追加
  * その他多くの改善点 - 完全な[変更履歴](https://github.com/grafana/clickhouse-datasource/blob/main/CHANGELOG.md#400)を確認してください
* データベーススキーマ管理ツール
  * [FlywayがClickHouseサポートを追加](https://github.com/flyway/flyway-community-db-support/packages/2037428)
  * [Ariga AtlasがClickHouseサポートを追加](https://atlasgo.io/blog/2023/12/19/atlas-v-0-16#clickhouse-beta-program) 
* Kafkaコネクタシンク
  * デフォルト値を持つテーブルへの取り込みを最適化
  * DateTime64での日付ベースの文字列をサポート

## 2024年1月18日 {#january-18-2024}

このリリースでは、AWSの新しいリージョン（ロンドン / eu-west-2）が追加され、ClickPipesがRedpanda、Upstash、Warpstreamをサポートし、[is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted)コアデータベース機能の信頼性が向上しました。

### 一般的な変更 {#general-changes}
- 新しいAWSリージョン: ロンドン (eu-west-2)

### コンソールの変更 {#console-changes-6}
- ClickPipesがRedpanda、Upstash、およびWarpstreamをサポート
- ClickPipesの認証メカニズムをUIで構成可能にしました

### 統合の変更 {#integrations-changes-6}
- Javaクライアント:
  - 破壊的変更: 呼び出しにおけるランダムURLハンドルの指定能力を削除しました。この機能はClickHouseから削除されました
  - 非推奨: Java CLIクライアントおよびGRPCパッケージ
  - ClickHouseインスタンスへのバッチサイズと作業負荷を減らすためにRowBinaryWithDefaults形式のサポートを追加しました（Exabeamの要請による）
  - Date32およびDateTime64の範囲境界がClickHouseと互換性があるように、Spark Array文字列タイプ、ノード選択メカニズムとの互換性を持たせました
- Kafkaコネクタ: Grafana用のJMX監視ダッシュボードを追加
- PowerBI: UIでODBCドライバ設定が構成可能になりました
- JavaScriptクライアント: クエリ概要情報を公開し、挿入用に特定のカラムのサブセットを提供できるようにし、Webクライアント用にkeep_aliveを構成可能にしました
- Pythonクライアント: SQLAlchemy用にNothingタイプサポートを追加

### 信頼性の変更 {#reliability-changes}
- ユーザーに影響を与える後方互換性のない変更: 以前は、2つの機能（[is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted)および``OPTIMIZE CLEANUP``）が特定の条件下でClickHouse内のデータの破損を引き起こすことがありました。ユーザーのデータの整合性を保護するために、機能のコアを維持しつつ、この機能の動作を調整しました。具体的には、MergeTreeの設定``clean_deleted_rows``は現在非推奨であり、もはや影響を及ぼしません。``CLEANUP``キーワードはデフォルトでは許可されていません（使用する場合は``allow_experimental_replacing_merge_with_cleanup``を有効にする必要があります）。``CLEANUP``を使用することに決定した場合、常に``FINAL``と一緒に使用しなければならず、``OPTIMIZE FINAL CLEANUP``を実行した後に古いバージョンの行が挿入されないことを保証する必要があります。

## 2023年12月18日 {#december-18-2023}

このリリースでは、新しいGCPリージョン（us-east1）、自己サービスのセキュアエンドポイント接続、DBT 1.7を含む追加の統合のサポート、数多くのバグ修正とセキュリティ強化が追加されました。
### 一般的な変更 {#general-changes-1}
- ClickHouse CloudはGCPのus-east1（サウスカロライナ）リージョンで利用可能になりました。
- OpenAPIを介してAWS Private LinkおよびGCP Private Service Connectを設定する機能が有効化されました。

### コンソールの変更 {#console-changes-7}
- Developerロールを持つユーザーのためにSQLコンソールへのシームレスなログインが可能になりました。
- オンボーディング中のアイドリング制御設定のワークフローが streamlined されました。

### 統合の変更 {#integrations-changes-7}
- DBTコネクタ: DBT v1.7までのサポートが追加されました。
- Metabase: Metabase v0.48のサポートが追加されました。
- PowerBIコネクタ: PowerBI Cloudでの実行が可能になりました。
- ClickPipes内部ユーザーの権限を構成可能にしました。
- Kafka Connect
  - Nullable型の重複排除ロジックと取り込みが改善されました。
  - テキストベースのフォーマット（CSV、TSV）をサポートしました。
- Apache Beam: BooleanおよびLowCardinality型のサポートが追加されました。
- Node.jsクライアント: Parquetフォーマットのサポートが追加されました。

### セキュリティの発表 {#security-announcements}
- 3つのセキュリティ脆弱性が修正されました。詳細は[セキュリティ変更ログ](/whats-new/security-changelog)をご覧ください。
  - CVE 2023-47118 (CVSS 7.0) - デフォルトでポート9000/tcpで動作するネイティブインターフェースに影響を与えるヒープバッファオーバーフローの脆弱性。
  - CVE-2023-48704 (CVSS 7.0) - デフォルトでポート9000/tcpで動作するネイティブインターフェースに影響を与えるヒープバッファオーバーフローの脆弱性。
  - CVE 2023-48298 (CVSS 5.9) - FPC圧縮コーデックにおける整数アンダーフローの脆弱性。

## 2023年11月22日 {#november-22-2023}

このリリースはコアデータベースのバージョンをアップグレードし、ログインおよび認証フローを改善し、Kafka Connect Sinkにプロキシサポートを追加します。

### ClickHouseバージョンアップグレード {#clickhouse-version-upgrade-2}

- Parquetファイルの読み取り性能が大幅に向上しました。詳細は[23.8リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-08)をご覧ください。
- JSONの型推論サポートが追加されました。詳細は[23.9リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-09)をご覧ください。
- アナリスト向けの強力な関数`ArrayFold`が導入されました。詳細は[23.10リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-10)をご覧ください。
- **ユーザー向けの後方互換性のない変更**: JSONフォーマットでの文字列から数字の推論を避けるために、デフォルトで設定`input_format_json_try_infer_numbers_from_strings`が無効化されました。サンプルデータに数字に似た文字列が含まれると、パースエラーが発生する可能性があります。
- 新機能、パフォーマンス改善、およびバグ修正が多数追加されました。詳細は[コアデータベースの変更ログ](/whats-new/changelog)をご覧ください。

### コンソールの変更 {#console-changes-8}

- ログインおよび認証フローが改善されました。
- 大規模なスキーマをよりうまくサポートするために、AIベースのクエリ提案が改善されました。

### 統合の変更 {#integrations-changes-8}

- Kafka Connect Sink: プロキシサポート、`topic-tablename`マッピング、Keeperの_exactly-once_デリバリー属性の構成可能性が追加されました。
- Node.jsクライアント: Parquetフォーマットのサポートが追加されました。
- Metabase: `datetimeDiff`関数のサポートが追加されました。
- Pythonクライアント: カラム名に特殊文字をサポートし、タイムゾーンパラメータのバインディングが修正されました。

## 2023年11月2日 {#november-2-2023}

このリリースはアジアにおける開発サービスの地域支援を拡大し、顧客管理暗号化キーへのキー回転機能を導入し、請求コンソールの税設定の粒度を改善し、サポートされている言語クライアント全体で多数のバグ修正を行いました。

### 一般的な更新 {#general-updates-1}
- 開発サービスがAWSの`ap-south-1`（ムンバイ）および`ap-southeast-1`（シンガポール）で利用可能になりました。
- 顧客管理暗号化キー（CMEK）のキー回転をサポートしました。

### コンソールの変更 {#console-changes-9}
- クレジットカードを追加する際に、詳細な税設定を構成する機能が追加されました。

### 統合の変更 {#integrations-changes-9}
- MySQL 
  - MySQLを介したTableau OnlineおよびQuickSightのサポートが改善されました。
- Kafka Connector
  - テキストベースのフォーマット（CSV、TSV）をサポートする新しいStringConverterが導入されました。
  - BytesおよびDecimalデータ型のサポートが追加されました。
  - Retryable Exceptionsが常に再試行されるように調整されました（errors.tolerance=allの場合でも）。
- Node.jsクライアント
  - 大規模なデータセットをストリーミングするときに提供される結果が破損する問題が修正されました。
- Pythonクライアント
  - 大規模な挿入のタイムアウトが修正されました。
  - NumPy/Pandas Date32の問題が修正されました。
- Golangクライアント 
  - JSONカラムへの空のマップの挿入、圧縮バッファのクリーンアップ、クエリのエスケープ、IPv4およびIPv6のゼロ/nilに関するパニックが修正されました。
  - 中止された挿入に対する監視機能が追加されました。
- DBT
  - テストを用意して分散テーブルのサポートが改善されました。

## 2023年10月19日 {#october-19-2023}

このリリースはSQLコンソールの使いやすさとパフォーマンスの改善、MetabaseコネクタにおけるIPデータ型処理の改善、およびJavaおよびNode.jsクライアントの新機能をもたらします。

### コンソールの変更 {#console-changes-10}
- SQLコンソールの使いやすさが改善されました（例：クエリの実行間でカラム幅を維持）。
- SQLコンソールの性能が改善されました。

### 統合の変更 {#integrations-changes-10}
- Javaクライアント:
  - パフォーマンスを向上させるためにデフォルトのネットワークライブラリが変更され、オープン接続が再利用されるよう改善されました。
  - プロキシサポートが追加されました。
  - Trust Storeを使用した安全な接続サポートが追加されました。
- Node.jsクライアント: 挿入クエリに対するkeep-alive動作が修正されました。
- Metabase: IPv4/IPv6カラムのシリアライズが修正されました。 

## 2023年9月28日 {#september-28-2023}

このリリースはClickPipesのKafka、Confluent Cloud、Amazon MSKでの一般提供をもたらし、Kafka Connect ClickHouse Sinkの提供、IAMロールを介したAmazon S3への安全なアクセスのためのセルフサービスワークフロー、およびAI支援のクエリ提案（プライベートプレビュー）を導入します。

### コンソールの変更 {#console-changes-11}
- IAMロールを介して[Amazon S3へのアクセスを安全に](https://cloud/security/secure-s3)するためのセルフサービスワークフローが追加されました。
- プライベートプレビューでAI支援のクエリ提案が導入されました（試してみたい方は[ClickHouse Cloudサポートにお問い合わせください](https://console.clickhouse.cloud/support)！）。

### 統合の変更 {#integrations-changes-11}
- ClickPipesの一般提供が発表されました - Kafka、Confluent Cloud、Amazon MSK用のターンキーデータ取り込みサービス（[リリースブログ](https://clickhouse.com/blog/clickpipes-is-generally-available)を参照）。
- Kafka Connect ClickHouse Sinkが一般提供に達しました。
  - `clickhouse.settings`プロパティを使用してカスタマイズされたClickHouse設定をサポート。
  - 動的フィールドを考慮した重複排除動作が改善されました。
  - ClickHouseからテーブル変更を再取得するための`tableRefreshInterval`のサポートが追加されました。
- [PowerBI](/integrations/powerbi)とClickHouseデータ型間のSSL接続問題と型マッピングが修正されました。

## 2023年9月7日 {#september-7-2023}

このリリースはPowerBI Desktopの公式コネクタのベータ版、インドにおけるクレジットカード決済処理の改善、およびサポートされている言語クライアント全体での多数の改善をもたらします。

### コンソールの変更 {#console-changes-12}
- インドからの請求をサポートするために、残りのクレジットと支払いの再試行が追加されました。

### 統合の変更 {#integrations-changes-12}
- Kafkaコネクタ: ClickHouse設定の構成、error.tolerance構成オプションの追加サポートが追加されました。
- PowerBI Desktop: 公式コネクタのベータ版がリリースされました。
- Grafana: Point geoタイプのサポートが追加され、Data Analystダッシュボード内のPanelsが修正されました。timeIntervalマクロが修正されました。
- Pythonクライアント: Pandas 2.1.0との互換性があり、Python 3.7サポートが削除されました。nullable JSON型のサポートが追加されました。
- Node.jsクライアント: default_format設定のサポートが追加されました。
- Golangクライアント: bool型処理が修正され、文字列制限が削除されました。

## 2023年8月24日 {#aug-24-2023}

このリリースはClickHouseデータベースのMySQLインターフェースをサポートし、新しい公式PowerBIコネクタを導入し、クラウドコンソールに「実行中のクエリ」ビューを追加し、ClickHouseのバージョンを23.7に更新します。

### 一般的な更新 {#general-updates-2}
- [MySQLワイヤプロトコル](/interfaces/mysql)のサポートが追加されました。これにより、多くの既存のBIツールとの互換性が実現します。この機能をお使いの組織で有効にするには、サポートに連絡してください。
- 新しい公式PowerBIコネクタが導入されました。

### コンソールの変更 {#console-changes-13}
- SQLコンソールに「実行中のクエリ」ビューのサポートが追加されました。

### ClickHouse 23.7バージョンアップグレード {#clickhouse-237-version-upgrade}
- Azure Table関数をサポートし、地理データ型を生産準備完了に昇格させ、結合性能を改善しました。詳細は23.5リリースの[ブログ](https://clickhouse.com/blog/clickhouse-release-23-05)を参照してください。
- MongoDB統合サポートがバージョン6.0に拡張されました。詳細は23.6リリースの[ブログ](https://clickhouse.com/blog/clickhouse-release-23-06)を参照してください。
- Parquetフォーマットへの書き込み性能が6倍向上し、PRQLクエリ言語のサポートが追加され、SQL互換性も改善されました。詳細は23.7リリースの[デッキ](https://presentations.clickhouse.com/release_23.7/)を参照してください。
- 新機能、パフォーマンス改善、バグ修正が多数追加されました。詳細は[23.5、23.6、23.7の詳細な変更ログ](/whats-new/changelog)を参照してください。

### 統合の変更 {#integrations-changes-13}
- Kafkaコネクタ: Avro DateおよびTime型のサポートが追加されました。
- JavaScriptクライアント: ウェブベースの環境向けに安定版がリリースされました。
- Grafana: フィルタロジック、データベース名の管理が改善され、サブ秒精度でTimeIntervalのサポートが追加されました。
- Golangクライアント: 複数のバッチおよび非同期データローディングの問題が修正されました。
- Metabase: v0.47をサポートし、接続の偽装、データタイプのマッピングが修正されました。

## 2023年7月27日 {#july-27-2023}

このリリースはKafka向けのClickPipesのプライベートプレビュー、新しいデータローディング体験、およびクラウドコンソールを使用してURLからファイルをロードする機能をもたらします。

### 統合の変更 {#integrations-changes-14}
- Kafka向けの[ClickPipes](https://clickhouse.com/cloud/clickpipes)のプライベートプレビューが導入され、KafkaおよびConfluent Cloudから大量のデータを取り込むのを簡単にするクラウドネイティブな統合エンジンです。この機能を試すためのウェイトリストに[こちら](https://clickhouse.com/cloud/clickpipes#joinwaitlist)からサインアップしてください。
- JavaScriptクライアント: ウェブベースの環境（ブラウザ、Cloudflareワーカー）のサポートが追加されました。コードがリファクタリングされ、コミュニティがカスタム環境向けのコネクタを作成できるようになりました。
- Kafkaコネクタ: TimestampおよびTime Kafkaタイプが含まれるインラインスキーマのサポートが追加されました。
- Pythonクライアント: 挿入圧縮およびLowCardinality読み取りの問題が修正されました。

### コンソールの変更 {#console-changes-14}
- より多くのテーブル作成設定オプションを持つ新しいデータローディング体験が追加されました。
- クラウドコンソールを使用してURLからファイルをロードする機能が導入されました。
- 別の組織に参加し、すべての未処理の招待を確認するための追加オプションを持つ招待フローが改善されました。

## 2023年7月14日 {#july-14-2023}

このリリースはDedicated Servicesを起動する機能、新しいAWSリージョン（オーストラリア）、およびディスク上でデータを暗号化するための独自のキーを持ち込む機能をもたらします。

### 一般的な更新 {#general-updates-3}
- 新しいAWSオーストラリアリージョン: シドニー（ap-southeast-2）
- レイテンシに敏感なワークロード向けのDedicated tierサービス（設定するには[サポート](https://console.clickhouse.cloud/support)に連絡してください）。
- ディスク上でデータを暗号化するための独自のキーを持ち込む（BYOK）機能（設定するには[サポート](https://console.clickhouse.cloud/support)に連絡してください）。

### コンソールの変更 {#console-changes-15}
- 非同期挿入に対する可観測性メトリクスダッシュボードが改善されました。
- サポートとの統合のためにチャットボットの動作が改善されました。

### 統合の変更 {#integrations-changes-15}
- NodeJSクライアント: ソケットタイムアウトによる接続失敗に関するバグが修正されました。
- Pythonクライアント: 挿入クエリにQuerySummaryを追加し、データベース名に特殊文字をサポートしました。
- Metabase: JDBCドライバのバージョンが更新され、DateTime64のサポートおよび性能の改善が施されました。

### コアデータベースの変更 {#core-database-changes}
- [クエリキャッシュ](/operations/query-cache)がClickHouse Cloudで有効化可能です。有効化されると、成功したクエリはデフォルトで1分間キャッシュされ、以降のクエリではキャッシュされた結果が使用されます。

## 2023年6月20日 {#june-20-2023}

このリリースはClickHouse CloudがGCPで一般に提供されるようになり、Cloud API用のTerraformプロバイダーが追加され、ClickHouseのバージョンが23.4に更新されます。

### 一般的な更新 {#general-updates-4}
- ClickHouse CloudがGCPで一般提供されるようになり、GCP Marketplaceの統合、Private Service Connectのサポート、自動バックアップを提供します（[ブログ](https://clickhouse.com/blog/clickhouse-cloud-on-google-cloud-platform-gcp-is-generally-available)および[プレスリリース](https://clickhouse.com/blog/clickhouse-cloud-expands-choice-with-launch-on-google-cloud-platform)を参照）。
- [Terraformプロバイダー](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)がCloud API用に利用可能になりました。

### コンソールの変更 {#console-changes-16}
- サービスのための新しい統合設定ページが追加されました。
- ストレージと計算のメータリング精度が調整されました。

### 統合の変更 {#integrations-changes-16}
- Pythonクライアント: 挿入パフォーマンスが改善され、内部依存関係がリファクタリングされてマルチプロセスがサポートされました。
- Kafkaコネクタ: Confluent Cloudにアップロードしてインストールできるようになり、間欠的な接続問題への再試行が追加され、不正なコネクタの状態が自動でリセットされます。

### ClickHouse 23.4バージョンアップグレード {#clickhouse-234-version-upgrade}
- 平行レプリカを用いたJOINがサポートされます（設定するには[サポート](https://console.clickhouse.cloud/support)に連絡してください）。
- Lightweight deletesの性能が改善されました。
- 大規模な挿入処理中のキャッシングが改善されました。

### 管理の変更 {#administration-changes-1}
- "default"ではないユーザー向けのローカル辞書作成機能が拡張されました。

## 2023年5月30日 {#may-30-2023}

このリリースはClickHouse Cloud制御プレーン操作のためのプログラムAPIの一般公開（[ブログ](https://clickhouse.com/blog/using-the-new-clickhouse-cloud-api-to-automate-deployments)参照）、IAMロールを使用したS3アクセス、そして追加のスケーリングオプションをもたらします。

### 一般的な変更 {#general-changes-2}
- ClickHouse Cloud用のAPIサポート。新しいCloud APIを使用することで、既存のCI/CDパイプラインでサービスの管理をシームレスに統合し、プログラム的にサービスを管理できます。
- IAMロールを介したS3アクセス。プライベートのAmazon Simple Storage Service (S3)バケットに安全にアクセスするためにIAMロールを利用できるようになりました（設定するにはサポートに連絡してください）。

### スケーリングの変更 {#scaling-changes}
- [水平スケーリング](/manage/scaling#adding-more-nodes-horizontal-scaling)。多くの平行性が必要なワークロードは、最大10レプリカで構成できるようになりました（設定するにはサポートに連絡してください）。
- [CPUベースの自動スケーリング](/manage/scaling)。CPUに依存するワークロードは、自動スケーリングポリシーの追加トリガーの恩恵を受けることができるようになりました。

### コンソールの変更 {#console-changes-17}
- DevサービスをProductionサービスに移行（有効にするにはサポートに連絡してください）。
- インスタンス作成フロー中のスケーリング設定コントロールが追加されました。
- デフォルトパスワードがメモリ内に存在しない場合の接続文字列を修正しました。

### 統合の変更 {#integrations-changes-17}
- Golangクライアント: ネイティブプロトコルでの不均衡な接続につながる問題が修正され、ネイティブプロトコルでのカスタム設定のサポートが追加されました。
- Nodejsクライアント: Nodejs v14のサポートが削除され、v20のサポートが追加されました。
- Kafkaコネクタ: LowCardinality型のサポートが追加されました。
- Metabase: 時間範囲によるグループ化が修正され、Metabaseの組み込み質問における整数のサポートが修正されました。

### パフォーマンスと信頼性 {#performance-and-reliability}
- 書き込みが重いワークロードの効率と性能が改善されました。
- バックアップの速度と効率を向上させるために、段階的バックアップ戦略が導入されました。

## 2023年5月11日 {#may-11-2023}

このリリースはClickHouse CloudのGCPでの~~公開ベータ~~（現在GA、上記の6月20日のエントリ参照）の提供をもたらし、管理者権限を委任してクエリ終了権限を付与する機能を拡張し、MFAユーザーのステータスをクラウドコンソールでより視覚化できるようにしました。

### ClickHouse Cloud on GCP ~~(公開ベータ)~~ (現在GA、上記の6月20日のエントリ参照) {#clickhouse-cloud-on-gcp-public-beta-now-ga-see-june-20th-entry-above}
- Google ComputeおよびGoogle Cloud Storage上で動作する、完全に管理された分離ストレージと計算のClickHouse提供を開始しました。
- アイオワ州（us-central1）、オランダ（europe-west4）、およびシンガポール（asia-southeast1）リージョンで利用可能です。
- すべての3つの初期リージョンで開発サービスおよび本番サービスをサポートしています。
- デフォルトで強力なセキュリティを提供します：トランジット中のエンドツーエンド暗号化、保存データの暗号化、IP許可リスト。

### 統合の変更 {#integrations-changes-18}
- Golangクライアント: プロキシ環境変数のサポートが追加されました。
- Grafana: Grafanaデータソース設定でClickHouseカスタム設定とプロキシ環境変数を指定する機能が追加されました。
- Kafkaコネクタ: 空のレコードの処理が改善されました。

### コンソールの変更 {#console-changes-18}
- ユーザーリストで多要素認証（MFA）使用のインジケーターが追加されました。

### パフォーマンスと信頼性 {#performance-and-reliability-1}
- 管理者に対するクエリ終了権限のより細かい制御が追加されました。

## 2023年5月4日 {#may-4-2023}

このリリースは新しいヒートマップチャートタイプを追加し、請求利用ページを改善し、サービスの起動時間を短縮します。

### コンソールの変更 {#console-changes-19}
- SQLコンソールにヒートマップチャートタイプが追加されました。
- 各請求次元内で消費されたクレジットを表示するため、請求利用ページが改善されました。

### 統合の変更 {#integrations-changes-19}
- Kafkaコネクタ: 一時的な接続エラーへの再試行メカニズムが追加されました。
- Pythonクライアント: HTTP接続が永遠に再利用されないようにするためのmax_connection_age設定が追加されました。これは特定のロードバランシングの問題に役立つことがあります。
- Node.jsクライアント: Node.js v20のサポートが追加されました。
- Javaクライアント: クライアント証明書認証のサポートが改善され、ネストされたTuple/Map/Nested型のサポートが追加されました。

### パフォーマンスと信頼性 {#performance-and-reliability-2}
- 多数のパーツが存在する場合のサービス起動時間が改善されました。
- SQLコンソールでの長時間実行されるクエリのキャンセルロジックが最適化されました。

### バグ修正 {#bug-fixes}
- 'Cell Towers'サンプルデータセットのインポートが失敗するバグが修正されました。

## 2023年4月20日 {#april-20-2023}

このリリースはClickHouseのバージョンを23.3に更新し、コールドリードの速度を大幅に改善し、サポートとのリアルタイムチャットを提供します。

### コンソールの変更 {#console-changes-20}
- サポートとのリアルタイムチャットオプションが追加されました。

### 統合の変更 {#integrations-changes-20}
- Kafkaコネクタ: Nullable型のサポートが追加されました。
- Golangクライアント: 外部テーブルのサポートが追加され、boolean型およびポインタ型のパラメータバインディングがサポートされました。

### 設定変更 {#configuration-changes}
- 大規模テーブルを削除する能力が追加されました—`max_table_size_to_drop`および`max_partition_size_to_drop`設定をオーバーライドします。

### パフォーマンスと信頼性 {#performance-and-reliability-3}
- `allow_prefetched_read_pool_for_remote_filesystem`設定を使用してS3プレフェッチを介してコールドリードの速度が改善されています。

### ClickHouse 23.3バージョンアップグレード {#clickhouse-233-version-upgrade}
- Lightweight deletesが生産準備完了となりました—詳細は23.3リリースの[ブログ](https://clickhouse.com/blog/clickhouse-release-23-03)を参照してください。
- マルチステージPREWHEREのサポートが追加されました—詳細は23.2リリースの[ブログ](https://clickhouse.com/blog/clickhouse-release-23-03)を参照してください。
- 新機能、パフォーマンス改善、バグ修正が多数追加されました—詳細は23.3および23.2の詳細な[変更ログ](/whats-new/changelog/index.md)を参照。

## 2023年4月6日 {#april-6-2023}

このリリースはクラウドエンドポイントを取得するためのAPI、最小アイドルタイムアウトのための高度なスケーリング制御、およびPythonクライアントのクエリメソッドにおける外部データのサポートをもたらします。

### APIの変更 {#api-changes}
* ClickHouse Cloudエンドポイントをプログラム的にクエリする能力が追加されました。[Cloud Endpoints API](//cloud/get-started/query-endpoints.md)を介して。

### コンソールの変更 {#console-changes-21}
- 高度なスケーリング設定に'最低アイドルタイムアウト'の設定が追加されました。
- データローディングモーダルにおけるスキーマ推論に最善の努力による日時検出が追加されました。

### 統合の変更 {#integrations-changes-21}
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): 複数のスキーマのサポートが追加されました。
- [Goクライアント](/integrations/language-clients/go/index.md): TLS接続のアイドル接続の生存チェックが修正されました。
- [Pythonクライアント](/integrations/language-clients/python/index.md)
  - クエリメソッドにおける外部データのサポートが追加されました。
  - クエリ結果のタイムゾーンサポートが追加されました。
  - `no_proxy`/`NO_PROXY`環境変数のサポートが追加されました。
  - Nullable型のNULL値のサーバーサイドパラメータバインディングが修正されました。

### バグ修正 {#bug-fixes-1}
* SQLコンソールから`INSERT INTO … SELECT …`を実行する際に、正しく同じ行制限が適用されない動作が修正されました。

## 2023年3月23日 {#march-23-2023}

このリリースは、データベースのパスワード複雑性ルール、大規模バックアップの復元速度の大幅な向上、Grafana Trace Viewでのトレース表示のサポートをもたらします。

### セキュリティと信頼性 {#security-and-reliability}
- コアデータベースエンドポイントでパスワード複雑性ルールが適用されるようになりました。
- 大規模バックアップの復元時間が改善されました。

### コンソールの変更 {#console-changes-22}
- オンボーディングワークフローが効率化され、新しいデフォルトとよりコンパクトなビューが導入されました。
- サインアップおよびサインインのレイテンシが減少しました。

### 統合の変更 {#integrations-changes-22}
- Grafana: 
  - ClickHouseに保存されたトレースデータをトレースビューに表示するためのサポートが追加されました。  
  - 時間範囲フィルターが改善され、テーブル名の特殊文字のサポートが追加されました。
- Superset: ClickHouseのネイティブサポートが追加されました。
- Kafka Connect Sink: 自動日付変換およびNullカラム処理が追加されました。
- Metabase: v0.46との互換性が実装されました。
- Pythonクライアント: 一時テーブルへの挿入が修正され、PandasのNullサポートが追加されました。
- Golangクライアント: タイムゾーン付きDate型が正規化されました。
- Javaクライアント
  - SQLパーサーへの圧縮、infile、outfileキーワードのサポートが追加されました。
  - 認証情報のオーバーロードが追加されました。
  - `ON CLUSTER`でのバッチサポートが修正されました。
- Node.jsクライアント
  - JSONStrings、JSONCompact、JSONCompactStrings、JSONColumnsWithMetadata形式のサポートが追加されました。
  - `query_id`はすべての主要なクライアントメソッドで提供可能になりました。

### バグ修正 {#bug-fixes-2}
- 新しいサービスの初期プロビジョニングおよび起動時間が遅くなるバグが修正されました。
- キャッシュの誤設定によりクエリ性能が低下するバグが修正されました。

## 2023年3月9日 {#march-9-2023}

このリリースは可観測性ダッシュボードを改善し、大規模バックアップの作成速度を最適化し、大規模テーブルやパーティションを削除するための設定が追加されました。

### コンソールの変更 {#console-changes-23}
- 高度な可観測性ダッシュボード（プレビュー）が追加されました。
- 可観測性ダッシュボードにメモリ割り当てチャートが導入されました。
- SQLコンソールのスプレッドシートビュー内のスペースと改行処理が改善されました。

### 信頼性と性能 {#reliability-and-performance}
- バックアップスケジュールが最適化され、データが変更されない限りバックアップが実行されるようになりました。
- 大規模バックアップの完了時間が改善されました。

### 設定変更 {#configuration-changes-1}
- クエリや接続レベルで`max_table_size_to_drop`および`max_partition_size_to_drop`の設定をオーバーライドすることで、テーブルやパーティションを削除する制限を増加させる能力が追加されました。
- クエリログにソースIPが追加され、ソースIPに基づくクォータおよびアクセス制御が可能になりました。

### 統合 {#integrations}
- [Pythonクライアント](/integrations/language-clients/python/index.md): Pandasサポートが改善され、タイムゾーン関連の問題が修正されました。
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): Metabase 0.46.xとの互換性およびSimpleAggregateFunctionのサポートが追加されました。
- [Kafka-Connect](/integrations/data-ingestion/kafka/index.md): 暗黙の日付変換とnullカラムの処理が改善されました。
- [Javaクライアント](https://github.com/ClickHouse/clickhouse-java): ネストされたJavaマップへの変換が追加されました。

## 2023年2月23日 {#february-23-2023}

このリリースはClickHouse 23.1コアリリースのサブセットの機能を有効化し、Amazon Managed Streaming for Apache Kafka (MSK)との相互運用性をもたらし、活動ログに高度なスケーリングおよびアイドリング調整を公開します。

### ClickHouse 23.1バージョンアップグレード {#clickhouse-231-version-upgrade}

ClickHouse 23.1の機能のサブセットがサポートされました。例えば：
- Map型とのARRAY JOIN
- SQL標準の16進数およびバイナリリテラル
- 新しい関数、`age()`、`quantileInterpolatedWeighted()`、`quantilesInterpolatedWeighted()`
- 引数なしで`generateRandom`で挿入テーブルからの構造を使用する能力
- 以前の名前の再利用を許可するデータベース作成およびリネームロジックの改善
- さらに詳細については、23.1リリースの[ウェビナー資料](https://presentations.clickhouse.com/release_23.1/#cover)および[23.1リリース変更ログ](/whats-new/changelog/index.md#clickhouse-release-231)をご覧ください。

### 統合の変更 {#integrations-changes-23}
- [Kafka-Connect](/integrations/data-ingestion/kafka/index.md): Amazon MSKのサポートが追加されました。
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): 最初の安定版1.0.0がリリースされました。
  - 接続が[Metabase Cloud](https://www.metabase.com/start/)上で利用可能になりました。
  - すべての利用可能なデータベースを探索する機能が追加されました。
  - AggregationFunction型のデータベースとの同期の問題が修正されました。
- [DBT-clickhouse](/integrations/data-ingestion/etl-tools/dbt/index.md): 最新のDBTバージョンv1.4.1のサポートが追加されました。
- [Pythonクライアント](/integrations/language-clients/python/index.md): プロキシとSSHトンネリングのサポートが改善され、Pandas DataFrame用の修正および性能最適化が追加されました。
- [Nodejsクライアント](/integrations/language-clients/js.md): `query_id`をクエリ結果に付与する能力がリリースされ、これを使用して`system.query_log`からクエリメトリクスを取得できます。
- [Golangクライアント](/integrations/language-clients/go/index.md): ClickHouse Cloudとのネットワーク接続が最適化されました。

### コンソールの変更 {#console-changes-24}
- アクティビティログに高度なスケーリングおよびアイドリング設定の調整が追加されました。
- パスワードリセットメールにユーザーエージェントおよびIP情報が追加されました。
- Google OAuthのためのサインアップフローのメカニクスが改善されました。

### 信頼性とパフォーマンス {#reliability-and-performance-1}
- 大規模サービスからのアイドル復元時の速度が向上しました。
- 多数のテーブルとパーティションを持つサービスの読み取り遅延が改善されました。

### バグ修正 {#bug-fixes-3}
- サービスパスワードのリセットがパスワードポリシーに従わない動作が修正されました。
- 組織招待メールの検証を大文字小文字を区別しないように修正されました。

## 2023年2月2日 {#february-2-2023}

このリリースは正式にサポートされたMetabase統合、Javaクライアント/JDBCドライバの大規模なリリース、およびSQLコンソールにおけるビューとマテリアライズドビューのサポートをもたらします。

### 統合の変更 {#integrations-changes-24}
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md)プラグイン: ClickHouseによって管理される公式ソリューションとなりました。
- [dbt](/integrations/data-ingestion/etl-tools/dbt/index.md)プラグイン: [複数スレッド](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md)のサポートが追加されました。
- [Grafana](/integrations/data-visualization/grafana/index.md)プラグイン: 接続エラーの処理が改善されました。
- [Python](/integrations/language-clients/python/index.md)クライアント: 挿入操作のための[ストリーミングサポート](/integrations/language-clients/python/index.md#streaming-queries)が追加されました。
- [Go](/integrations/language-clients/go/index.md)クライアント: [バグ修正](https://github.com/ClickHouse/clickhouse-go/blob/main/CHANGELOG.md): キャンセルされた接続のクローズ、接続エラーの改善。
- [JS](/integrations/language-clients/js.md)クライアント: [exec/insertにおける破壊的変更](https://github.com/ClickHouse/clickhouse-js/releases/tag/0.0.12)；戻り値型でのquery_idの公開。
- [Java](https://github.com/ClickHouse/clickhouse-java#readme)クライアント/JDBCドライバの大規模リリース
  - [破壊的変更](https://github.com/ClickHouse/clickhouse-java/releases): 非推奨のメソッド、クラス、およびパッケージが削除されました。
  - R2DBCドライバとファイル挿入のサポートが追加されました。

### コンソールの変更 {#console-changes-25}
- SQLコンソールでのビューおよびマテリアライズドビューに対するサポートが追加されました。

### パフォーマンスと信頼性 {#performance-and-reliability-4}
- 停止した/アイドル状態のインスタンスに対するパスワードリセットがより速くなりました。
- より正確な活動追跡を介してスケールダウンの動作が改善されました。
- SQLコンソールでのCSVエクスポートが切り捨てられるバグが修正されました。
- サンプルデータのアップロード失敗を引き起こす intermittent なバグが修正されました。

## 2023年1月12日 {#january-12-2023}

このリリースはClickHouseのバージョンを22.12に更新し、多くの新しいソースに対して辞書を有効化し、クエリ性能を改善します。

### 一般的な変更 {#general-changes-3}
- 外部ClickHouse、Cassandra、MongoDB、MySQL、PostgreSQL、Redisを含む追加ソースに対して辞書が有効化されました。

### ClickHouse 22.12バージョンアップグレード {#clickhouse-2212-version-upgrade}
- JOINサポートがGrace Hash Joinを含むように拡張されました。
- ファイルを読み取るためのBinary JSON (BSON)サポートが追加されました。
- SQL標準構文のGROUP BY ALLサポートが追加されました。
- 固定精度の小数演算のための新しい数学関数が追加されました。
- 変更の完全なリストについては、[22.12リリースブログ](https://clickhouse.com/blog/clickhouse-release-22-12)および[詳細22.12変更ログ](/whats-new/changelog/2022.md/#-clickhouse-release-2212-2022-12-15)をご覧ください。

### コンソールの変更 {#console-changes-26}
- SQLコンソールにおけるオートコンプリート機能が改善されました。
- デフォルトのリージョンが大陸の地域性を考慮するようになりました。
- 請求利用ページが請求およびウェブサイトのユニット両方を表示するよう改善されました。
### 統合の変更 {#integrations-changes-25}
- DBT リリース [v1.3.2](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md#release-132-2022-12-23)
  - delete+insert 増分戦略の実験的サポートを追加
  - 新しい s3source マクロ
- Python クライアント [v0.4.8](https://github.com/ClickHouse/clickhouse-connect/blob/main/CHANGELOG.md#048-2023-01-02)
  - ファイル挿入サポート
  - サーバー側クエリ [パラメータバインディング](/interfaces/cli.md/#cli-queries-with-parameters)
- Go クライアント [v2.5.0](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.5.0)
  - 圧縮のためのメモリ使用量を削減
  - サーバー側クエリ [パラメータバインディング](/interfaces/cli.md/#cli-queries-with-parameters)

### 信頼性とパフォーマンス {#reliability-and-performance-2}
- オブジェクトストアから多数の小さなファイルを取得するクエリの読み取りパフォーマンスを改善
- 新たに立ち上げたサービスについて、サービスが最初に起動されるバージョンに [互換性](/cloud/manage/upgrades.md/#use-the-default-settings-of-a-clickhouse-release) 設定を設定

### バグ修正 {#bug-fixes-4}
Advanced Scaling スライダーを使ってリソースを予約することが、すぐに反映されるようになりました。

## 2022年12月20日 {#december-20-2022}

このリリースでは、SQL コンソールへの管理者のシームレスなログイン、コールドリードの読み取りパフォーマンスの向上、ClickHouse Cloud 用の改善された Metabase コネクタが導入されました。

### コンソールの変更 {#console-changes-27}
- 管理者ユーザーのために SQL コンソールへのシームレスなアクセスを有効化
- 新たに招待されたユーザーのデフォルトロールを「管理者」に変更
- オンボーディング調査を追加

### 信頼性とパフォーマンス {#reliability-and-performance-3}
- ネットワーク障害が発生した場合に回復するために、長時間実行される挿入クエリへのリトライロジックを追加
- コールドリードの読み取りパフォーマンスを改善

### 統合の変更 {#integrations-changes-26}
- [Metabase プラグイン](/integrations/data-visualization/metabase-and-clickhouse.md) が長らく待たれていた v0.9.1 のメジャーアップデートを受けました。最新の Metabase バージョンと互換性があり、ClickHouse Cloud に対して徹底的にテストされています。

## 2022年12月6日 - 一般提供 {#december-6-2022---general-availability}

ClickHouse Cloud は、SOC2 タイプ II への準拠、プロダクションワークロードの稼働時間 SLA、公開ステータスページを備えたプロダクション対応となりました。このリリースには、AWS Marketplace 統合、ClickHouse ユーザーのためのデータ探索ワークベンチである SQL コンソール、ClickHouse Cloud での自己学習を支援する ClickHouse Academy などの大規模な新機能が含まれています。詳しくはこの [ブログ](https://clickhouse.com/blog/clickhouse-cloud-generally-available) をご覧ください。

### プロダクション対応 {#production-ready}
- SOC2 タイプ II 準拠（詳細は [ブログ](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant) および [Trust Center](https://trust.clickhouse.com/) を参照）
- ClickHouse Cloud の公開 [ステータスページ](https://status.clickhouse.com/)
- プロダクションユースケース向けの稼働時間 SLA
- [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc) での利用可能性

### 新しい主要機能 {#major-new-capabilities}
- ClickHouse ユーザーのためのデータ探索ワークベンチである SQL コンソールを導入
- ClickHouse Cloud での自己学習を支援する [ClickHouse Academy](https://learn.clickhouse.com/visitor_class_catalog) を開始

### 価格設定とメータリングの変更 {#pricing-and-metering-changes}
- トライアルを 30 日に延長
- スタータープロジェクトや開発／ステージング環境に適した固定容量、低月額使用の開発サービスを導入
- ClickHouse Cloud の運用とスケールアップを改善し続ける中で、プロダクションサービスの新しい割引価格を導入
- コンピュートのメータリング時に粒度と忠実度を改善

### 統合の変更 {#integrations-changes-27}
- ClickHouse Postgres / MySQL 統合エンジンのサポートを有効化
- SQL ユーザー定義関数（UDF）のサポートを追加
- Kafka Connect シンクのベータステータスを確立
- バージョン、更新ステータスなどのリッチメタデータを導入し、統合 UI を改善

### コンソールの変更 {#console-changes-28}
- クラウドコンソールにおける多要素認証のサポート
- モバイルデバイス向けにクラウドコンソールのナビゲーションを改善

### ドキュメントの変更 {#documentation-changes}
- ClickHouse Cloud のための専用 [ドキュメント](/cloud/overview) セクションを導入

### バグ修正 {#bug-fixes-5}
- バックアップからの復元が依存関係の解決により常に成功しないという既知の問題に対処

## 2022年11月29日 {#november-29-2022}

このリリースは、SOC2 タイプ II 準拠を実現し、ClickHouse のバージョンを 22.11 に更新し、いくつかの ClickHouse クライアントおよび統合を改善します。

### 一般的な変更 {#general-changes-4}
- SOC2 タイプ II 準拠を達成 （詳細は [ブログ](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant) および [Trust Center](https://trust.clickhouse.com) を参照）

### コンソールの変更 {#console-changes-29}
- サービスが自動的に一時停止されていることを示す「アイドル」ステータスインジケーターを追加

### ClickHouse 22.11 バージョンのアップグレード {#clickhouse-2211-version-upgrade}
- Hudi および DeltaLake テーブルエンジンとテーブル関数のサポートを追加
- S3 に対する再帰的ディレクトリトラバースを改善
- 複合時間間隔構文のサポートを追加
- 挿入における信頼性を改善するためにリトライを追加
- 変更の完全なリストについては [詳細な 22.11 の変更ログ](/whats-new/changelog/2022.md/#-clickhouse-release-2211-2022-11-17) を参照

### 統合 {#integrations-1}
- Python クライアント：v3.11 サポート、挿入パフォーマンスを改善
- Go クライアント：DateTime および Int64 サポートの修正
- JS クライアント：双方向 SSL 認証のサポート
- dbt-clickhouse：DBT v1.3 のサポート

### バグ修正 {#bug-fixes-6}
- アップグレード後に古い ClickHouse バージョンを表示するバグを修正
- 「default」アカウントの権限変更がセッションに影響を与えることはなくなりました
- 新しく作成された非管理者アカウントはデフォルトでシステムテーブルへのアクセスを持たなくなりました

### このリリースの既知の問題 {#known-issues-in-this-release}
- バックアップからの復元が依存関係の解決により機能しないことがあります

## 2022年11月17日 {#november-17-2022}

このリリースでは、ローカル ClickHouse テーブルと HTTP ソースからの辞書のサポートが追加され、ムンバイ地域のサポートが導入され、クラウドコンソールのユーザーエクスペリエンスが改善されました。

### 一般的な変更 {#general-changes-5}
- ローカル ClickHouse テーブルおよび HTTP ソースからの [辞書](/sql-reference/dictionaries/index.md) のサポートを追加
- ムンバイ [地域](/cloud/reference/supported-regions.md) のサポートを導入

### コンソールの変更 {#console-changes-30}
- 請求書のフォーマットを改善
- 支払い方法の取得のためのユーザーインターフェースを合理化
- バックアップのためのより詳細なアクティビティロギングを追加
- ファイルアップロード中のエラーハンドリングを改善

### バグ修正 {#bug-fixes-7}
- 一部のパーツに単一の大きなファイルがあるとバックアップに失敗する可能性のあるバグを修正
- アクセスリストの変更が同時に適用された場合、バックアップからの復元が成功しないというバグを修正

### 既知の問題 {#known-issues}
- バックアップからの復元が依存関係の解決により機能しない場合があります

## 2022年11月3日 {#november-3-2022}

このリリースでは、価格設定から読み取りおよび書き込みユニットを削除し（詳細は [価格ページ](https://clickhouse.com/pricing) を参照）、ClickHouse のバージョンを 22.10 に更新し、セルフサービス顧客向けに垂直スケーリングのサポートを強化し、より良いデフォルトを通じて信頼性を向上させています。

### 一般的な変更 {#general-changes-6}
- 価格モデルから読み取り/書き込みユニットを削除

### 設定の変更 {#configuration-changes-2}
- `allow_suspicious_low_cardinality_types`、`allow_suspicious_fixed_string_types`、および `allow_suspicious_codecs`（デフォルトは false）の設定は、安定性の理由からユーザーによって変更できなくなりました。

### コンソールの変更 {#console-changes-31}
- 有料顧客のために、セルフサービスの垂直スケーリングの最大値を 720GB に増加
- バックアップからの復元ワークフローを改善し、IP アクセスリストのルールとパスワードを設定
- サービス作成ダイアログに GCP および Azure の待機リストを導入
- ファイルアップロード中のエラーハンドリングを改善
- 請求管理のワークフローを改善

### ClickHouse 22.10 バージョンのアップグレード {#clickhouse-2210-version-upgrade}
- 大きなパーツ（最大 10 GiB）の存在下で「パーツが多すぎる」閾値を緩和することにより、オブジェクトストア上でのマージを改善。これにより、単一テーブルの単一パーティションでペタバイトのデータを有効にします。
- 一定の時間閾値を超えてマージするために、`min_age_to_force_merge_seconds` 設定を使用してマージ制御を改善。
- 設定をリセットするために、MySQL 互換の構文を追加 `SET setting_name = DEFAULT`。
- モートン曲線エンコーディング、Java 整数ハッシュ、乱数生成のための機能を追加。
- 変更の完全なリストについては [詳細な 22.10 の変更ログ](/whats-new/changelog/2022.md/#-clickhouse-release-2210-2022-10-25) を参照。

## 2022年10月25日 {#october-25-2022}

このリリースでは、小規模なワークロードに対するコンピュート消費を大幅に削減し、コンピュート料金を引き下げ（詳細は [価格](https://clickhouse.com/pricing) ページを参照）、より良いデフォルトを通じて安定性を向上させ、ClickHouse Cloud コンソールの請求と使用状況ビューを強化しました。

### 一般的な変更 {#general-changes-7}
- サービスの最小メモリアロケーションを 24GB に削減
- サービスのアイドルタイムアウトを 30 分から 5 分に削減

### 設定の変更 {#configuration-changes-3}
- `max_parts_in_total` の最大値を 100k から 10k に削減。MergeTree テーブルの `max_parts_in_total` 設定のデフォルト値は 100,000 から 10,000 に引き下げられました。この変更の理由は、多数のデータパーツがクラウド内のサービスの起動時間を遅延させる可能性があることを観察したためです。多くのパーツは通常、粒度の細かすぎるパーティションキーの選択が原因であり、これは通常偶然に行われ、避けるべきです。このデフォルトの変更により、これらのケースをより早く検出できるようになります。

### コンソールの変更 {#console-changes-32}
- トライアルユーザー向けに請求ビューでのクレジット使用の詳細を強化
- ツールチップとヘルプテキストを改善し、使用状況ビューに価格ページへのリンクを追加
- IP フィルタリングオプションの切り替え時のワークフローを改善
- クラウドコンソールにメール確認の再送信ボタンを追加

## 2022年10月4日 - ベータ {#october-4-2022---beta}

ClickHouse Cloud は2022年10月4日に公開ベータを開始しました。詳しくはこの [ブログ](https://clickhouse.com/blog/clickhouse-cloud-public-beta) をご覧ください。

ClickHouse Cloud バージョンは ClickHouse コア v22.10 を基にしています。対応する機能のリストは [Cloud Compatibility](/cloud/reference/cloud-compatibility.md) ガイドを参照してください。
