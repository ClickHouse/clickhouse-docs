---
'slug': '/whats-new/cloud'
'sidebar_label': 'クラウド変更履歴'
'title': 'クラウド変更履歴'
'description': '各ClickHouse Cloudリリースの新機能に関する説明を提供するClickHouse Cloud変更履歴'
---

import Image from '@theme/IdealImage';
import add_marketplace from '@site/static/images/cloud/reference/add_marketplace.png';
import beta_dashboards from '@site/static/images/cloud/reference/beta_dashboards.png';
import api_endpoints from '@site/static/images/cloud/reference/api_endpoints.png';
import cross_vpc from '@site/static/images/cloud/reference/cross-vpc-clickpipes.png';
import nov_22 from '@site/static/images/cloud/reference/nov-22-dashboard.png';
import private_endpoint from '@site/static/images/cloud/reference/may-30-private-endpoints.png';
import notifications from '@site/static/images/cloud/reference/nov-8-notifications.png';
import kenesis from '@site/static/images/cloud/reference/may-17-kinesis.png';
import s3_gcs from '@site/static/images/cloud/reference/clickpipes-s3-gcs.png';
import tokyo from '@site/static/images/cloud/reference/create-tokyo-service.png';
import cloud_console from '@site/static/images/cloud/reference/new-cloud-console.gif';
import copilot from '@site/static/images/cloud/reference/nov-22-copilot.gif';
import latency_insights from '@site/static/images/cloud/reference/oct-4-latency-insights.png';
import cloud_console_2 from '@site/static/images/cloud/reference/aug-15-compute-compute.png';
import compute_compute from '@site/static/images/cloud/reference/july-18-table-inspector.png';
import query_insights from '@site/static/images/cloud/reference/june-28-query-insights.png';
import prometheus from '@site/static/images/cloud/reference/june-28-prometheus.png';
import kafka_config from '@site/static/images/cloud/reference/june-13-kafka-config.png';
import fast_releases from '@site/static/images/cloud/reference/june-13-fast-releases.png';
import share_queries from '@site/static/images/cloud/reference/may-30-share-queries.png';
import query_endpoints from '@site/static/images/cloud/reference/may-17-query-endpoints.png';

In addition to this ClickHouse Cloud changelog, please see the [Cloud Compatibility](/cloud/reference/cloud-compatibility.md) page.
## May 16, 2025 {#may-16-2025}

- Resource Utilization Dashboardが導入され、ClickHouse Cloud内のサービスによって使用されるリソースのビューを提供します。以下のメトリクスはシステムテーブルから収集され、このダッシュボードに表示されます：
  * メモリとCPU： `CGroupMemoryTotal`（割り当てられたメモリ）、`CGroupMaxCPU`（割り当てられたCPU）、 `MemoryResident`（使用されるメモリ）、および `ProfileEvent_OSCPUVirtualTimeMicroseconds`（使用されるCPU）のグラフ
  * データ転送：ClickHouse Cloudからのデータの入出力を示すグラフ。詳細は[こちら](/cloud/manage/network-data-transfer)。
- 新しいClickHouse Cloud Prometheus/Grafanaミックスインのローンチを発表できることを嬉しく思います。このミックスインは、ClickHouse Cloudサービスの監視を簡素化するために作られています。
  このミックスインは、Prometheusに互換性のあるAPIエンドポイントを使用して、ClickHouseメトリクスを既存のPrometheusおよびGrafanaセットアップにシームレスに統合します。リアルタイムでサービスの健康状態とパフォーマンスを可視化するためのプリ構成されたダッシュボードが含まれています。詳細はローンチの[ブログ](https://clickhouse.com/blog/monitor-with-new-prometheus-grafana-mix-in)を参照してください。

## April 18, 2025 {#april-18-2025}

- 新しい**メンバー**組織レベルのロールと2つの新しいサービスレベルロール：**サービス管理者**および**サービス読み取り専用**を導入しました。
  **メンバー**はSAML SSOユーザーにデフォルトで割り当てられる組織レベルのロールで、サインインとプロファイル更新機能のみを提供します。**サービス管理者**と**サービス読み取り専用**ロールは、**メンバー**、**開発者**、または**請求管理者**ロールを持つユーザーに割り当てることができます。詳細は["ClickHouse Cloudのアクセス制御"](https://clickhouse.com/docs/cloud/security/cloud-access-management/overview)を参照してください。
- ClickHouse Cloudでは、以下のリージョンで**エンタープライズ**顧客向けに**HIPAA**および**PCI**サービスが提供されています：AWS eu-central-1、AWS eu-west-2、AWS us-east-2。
- **ClickPipesに対するユーザー向け通知**を導入しました。この機能は、ClickPipesの失敗について自動的に通知をメール、ClickHouse Cloud UI、およびSlack経由で送信します。メールおよびUIによる通知はデフォルトで有効になっており、各パイプごとに構成可能です。**Postgres CDC ClickPipes**の場合、通知はレプリケーションスロットの閾値（**設定**タブで構成可能）、特定のエラータイプ、失敗を解決するためのセルフサーブ手順もカバーします。
- **MySQL CDCプライベートプレビュー**がオープンになりました。これにより、顧客は数回のクリックでMySQLデータベースをClickHouse Cloudにレプリケートでき、高速分析が可能になり、外部ETLツールの必要がなくなります。このコネクタは、MySQLがクラウド（RDS、Aurora、Cloud SQL、Azureなど）にある場合でもオンプレミスにある場合でも、継続的なレプリケーションと1回限りのマイグレーションの両方をサポートします。プライベートプレビューには[こちらのリンク](https://clickhouse.com/cloud/clickpipes/mysql-cdc-connector)からサインアップできます。
- **ClickPipesに対するAWS PrivateLink**を導入しました。AWS PrivateLinkを使用して、VPC間、AWSサービス、オンプレミスシステム、ClickHouse Cloudとの間にセキュアな接続を確立できます。これにより、Postgres、MySQL、AWS上のMSKなどのソースからデータを移動する際に、公共インターネットにトラフィックを露出せずに行えます。また、VPCサービスエンドポイントを介してのクロスリージョンアクセスもサポートされています。PrivateLinkの接続設定は現在[完全セルフサービス](https://clickhouse.com/docs/integrations/clickpipes/aws-privatelink)でClickPipesを通じて行えます。

## April 4, 2025 {#april-4-2025}

- ClickHouse CloudのSlack通知：ClickHouse Cloudは、請求、スケーリング、ClickPipesイベントに関するSlack通知を、コンソール内およびメール通知に加えてサポートしました。これらの通知はClickHouse Cloud Slackアプリケーションを介して送信されます。組織の管理者は、通知センターを介して通知を構成し、通知を送信すべきSlackチャネルを指定できます。
- プロダクションおよび開発サービスを運用しているユーザーは、ClickPipesとデータ転送の使用料金を請求書に表示されるようになります。詳細については、2025年1月の[発表](/cloud/manage/jan-2025-faq/pricing-dimensions)を参照してください。

## March 21, 2025 {#march-21-2025}

- AWS上のクロスリージョンPrivate Link接続が現在ベータ版です。設定方法やサポートされているリージョンのリストについては、ClickHouse Cloudプライベートリンクの[ドキュメント](/manage/security/aws-privatelink)を参照してください。
- AWS上のサービスに対して利用可能な最大レプリカサイズは236 GiB RAMに設定されました。これにより、効率的な活用が可能になり、バックグラウンドプロセスにリソースが割り当てられることが保証されます。

## March 7, 2025 {#march-7-2025}

- 新しい`UsageCost` APIエンドポイント：API仕様は、新しいエンドポイントによる使用情報の取得をサポートしています。これは組織エンドポイントで、最大31日分の使用コストをクエリできます。取得可能なメトリクスはストレージ、コンピュート、データ転送、ClickPipesが含まれます。詳細については[ドキュメント](https://clickhouse.com/docs/cloud/manage/api/usageCost-api-reference)を参照してください。
- Terraformプロバイダー[v2.1.0](https://registry.terraform.io/providers/ClickHouse/clickhouse/2.1.0/docs/resources/service#nestedatt--endpoints_configuration)リリースによりMySQLエンドポイントの有効化がサポートされました。

## February 21, 2025 {#february-21-2025}
### ClickHouse Bring Your Own Cloud (BYOC) for AWS is now generally available! {#clickhouse-byoc-for-aws-ga}

このデプロイメントモデルでは、データプレーンコンポーネント（コンピュート、ストレージ、バックアップ、ログ、メトリクス）が顧客のVPC内で実行され、コントロールプレーン（Webアクセス、API、および請求）はClickHouse VPC内に残ります。この設定は、大量のワークロードが厳格なデータ居住要件を遵守するために理想的で、すべてのデータが安全な顧客環境内に留まることを保証します。

- 詳細については、BYOCの[ドキュメント](/cloud/reference/byoc)を参照するか、[発表ブログ記事](https://clickhouse.com/blog/announcing-general-availability-of-clickhouse-bring-your-own-cloud-on-aws)をお読みください。
- [お問い合わせ](https://clickhouse.com/cloud/bring-your-own-cloud)いただければ、アクセスをリクエストできます。

### Postgres CDC connector for ClickPipes {#postgres-cdc-connector-for-clickpipes}

ClickPipesのPostgres CDCコネクタが現在パブリックベータ版です。この機能により、ユーザーはPostgresデータベースをClickHouse Cloudにシームレスにレプリケートできます。

- 始めるには、ClickPipes Postgres CDCコネクタの[ドキュメント](https://clickhouse.com/docs/integrations/clickpipes/postgres)を参照してください。
- 顧客のユースケースと機能に関する詳細は、[ランディングページ](https://clickhouse.com/cloud/clickpipes/postgres-cdc-connector)および[ローンチブログ](https://clickhouse.com/blog/postgres-cdc-connector-clickpipes-public-beta)をご参照ください。

### PCI compliance for ClickHouse Cloud on AWS {#pci-compliance-for-clickhouse-cloud-on-aws}

ClickHouse Cloudは現在、**エンタープライズ層**顧客向けに**PCI-準拠サービス**を**us-east-1**および**us-west-2**リージョンでサポートしています。PCI準拠の環境でサービスを起動したいユーザーは、[サポート](https://clickhouse.com/support/program)に連絡して支援を受けてください。

### Transparent Data Encryption and Customer Managed Encryption Keys on Google Cloud Platform {#tde-and-cmek-on-gcp}

**透過的データ暗号化（TDE）**と**顧客管理の暗号化キー（CMEK）**のサポートが、**Google Cloud Platform（GCP）**におけるClickHouse Cloudで利用可能になりました。

- これらの機能に関する詳細情報は[ドキュメント](https://clickhouse.com/docs/cloud/security/cmek#transparent-data-encryption-tde)を参照してください。

### AWS Middle East (UAE) availability {#aws-middle-east-uae-availability}

ClickHouse Cloudに新たなリージョンサポートが追加され、**AWS Middle East (UAE) me-central-1**リージョンで利用可能になりました。

### ClickHouse Cloud guardrails {#clickhouse-cloud-guardrails}

ClickHouse Cloudの安定した使用を確保し、ベストプラクティスを促進するために、使用するテーブル、データベース、パーティション、およびパーツの数に関するガードレールを導入します。

- 詳細については、[使用制限](https://clickhouse.com/docs/cloud/bestpractices/usage-limits)セクションを参照してください。
- サービスが既にこれらの制限を超えている場合は、10％の増加を許可します。質問がある場合は、[サポート](https://clickhouse.com/support/program)にご連絡ください。

## January 27, 2025 {#january-27-2025}
### Changes to ClickHouse Cloud tiers {#changes-to-clickhouse-cloud-tiers}

私たちは、顧客の変化するニーズに応じて製品を適応させることに専念しています。GAでの導入以来、ClickHouse Cloudは大幅に進化し、顧客がどのように私たちのクラウド提供を利用しているかについて貴重な洞察を得ました。

私たちは、ClickHouse Cloudサービスのサイズとコスト効率を最適化するための新機能を導入しています。これには**コンピュート-コンピュート分離**、高性能なマシンタイプ、および**シングルレプリカサービス**が含まれます。また、よりシームレスで反応的な方法で自動スケーリングと管理されたアップグレードを実行するよう進化させています。

最も要求の厳しい顧客とワークロードのニーズに応えるために、業界特有のセキュリティおよびコンプライアンス機能に焦点を当て、基盤となるハードウェアやアップグレードに対するさらに多くのコントロール、そして高度な災害復旧機能を備えた**新しいエンタープライズ層**を導入します。

これらの変更をサポートするために、現在の**開発**および**プロダクション**層を、お客様の進化するニーズにより密接に一致させるよう再構築しています。新しいユーザー向けの**基本**層と、プロダクションワークロードおよび大規模なデータに取り組むユーザーに合わせた**スケール**層を導入します。

これらの機能変更については、この[ブログ](https://clickhouse.com/blog/evolution-of-clickhouse-cloud-new-features-superior-performance-tailored-offerings)でお読みいただけます。既存の顧客は、新しい[プラン](https://clickhouse.com/pricing)を選択するためのアクションを取る必要があります。顧客向けのコミュニケーションは組織の管理者にメールで送信され、以下の[FAQ](/cloud/manage/jan-2025-faq/summary)が主な変更点とタイムラインをカバーしています。

### Warehouses: Compute-compute separation (GA) {#warehouses-compute-compute-separation-ga}

コンピュート-コンピュートの分離（「倉庫」とも呼ばれる）は一般的に利用可能です。詳細については[ブログ](https://clickhouse.com/blog/introducing-warehouses-compute-compute-separation-in-clickhouse-cloud)と[ドキュメント](/cloud/reference/warehouses)を参照してください。

### Single-replica services {#single-replica-services}

「シングルレプリカサービス」の概念を導入します。これは独立した提供としても、倉庫内でも使用されます。独立した提供としては、シングルレプリカサービスはサイズ制限があり、小規模なテストワークロードに利用されることを意図しています。倉庫内ではシングルレプリカサービスをより大きなサイズで展開し、高可用性がスケールで要求されないワークロード（再起動可能なETLジョブなど）のために利用することができます。

### Vertical auto-scaling improvements {#vertical-auto-scaling-improvements}

コンピュートレプリカのための新しい垂直スケーリングメカニズム、「事前確保後削除（Make Before Break、MBB）」を導入します。このアプローチにより、古いレプリカを削除する前に、新しいサイズの1つ以上のレプリカを追加し、スケーリング操作中のキャパシティ損失を防ぎます。既存のレプリカを削除し新しいレプリカを追加する際のギャップを排除することで、よりシームレスで中断の少ないスケーリングプロセスを実現します。特に、リソースの高い利用度が追加のキャパシティの必要性を引き起こすスケールアップシナリオで有益です。既存のレプリカを早期に削除すると、リソース制約を悪化させるだけになります。

### Horizontal scaling (GA) {#horizontal-scaling-ga}

水平スケーリングが現在一般的に利用可能です。ユーザーはAPIやクラウドコンソールを介してサービスをスケールアウトするために追加のレプリカを追加できます。詳細については[ドキュメント](/manage/scaling#manual-horizontal-scaling)を参照してください。

### Configurable backups {#configurable-backups}

顧客は、独自のクラウドアカウントにバックアップをエクスポートする機能が今後サポートされます。詳細については[ドキュメント](/cloud/manage/backups/configurable-backups)を参照ください。

### Managed upgrade improvements {#managed-upgrade-improvements}

安全な管理されたアップグレードは、ユーザーが新機能を追加しながらデータベースを最新の状態に保つために大きな価値を提供します。この展開では、アップグレードに「事前確保後削除（MBB）」アプローチを適用し、実行中のワークロードに対する影響をさらに低減しました。

### HIPAA support {#hipaa-support}

私たちは、AWS `us-east-1`、`us-west-2`、およびGCP `us-central1`、`us-east1`を含むコンプライアントリージョンでHIPAAをサポートしています。オンボードを希望する顧客は、ビジネスアソシエイト契約（BAA）に署名し、リージョンのコンプライアント版にデプロイする必要があります。HIPAAに関する詳細情報は[ドキュメント](/cloud/security/security-and-compliance)を参照してください。

### Scheduled upgrades {#scheduled-upgrades}

ユーザーはサービスのアップグレードをスケジュールできます。この機能はエンタープライズ層のサービスのみでサポートされています。スケジュールされたアップグレードに関する詳細は[ドキュメント](/manage/updates)を参照してください。

### Language client support for complex types {#language-client-support-for-complex-types}

[Golang](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.30.1)、[Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.11)、および[NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.1)クライアントが、Dynamic、Variant、およびJSONタイプリクエストをサポートしました。

### DBT support for Refreshable Materialized Views {#dbt-support-for-refreshable-materialized-views}

DBTは、`1.8.7`リリースで[リフレッシュ可能なマテリアライズドビュー](https://github.com/ClickHouse/dbt-clickhouse/releases/tag/v1.8.7)をサポートしています。

### JWT token support {#jwt-token-support}

JDBCドライバv2、clickhouse-java、[Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.12)、および[NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.0)クライアントでJWTベースの認証がサポートされました。

JDBC / Javaは、リリース時に[0.8.0](https://github.com/ClickHouse/clickhouse-java/releases/tag/v0.8.0)で使用可能になります - リリース日時は未定です。

### Prometheus integration improvements {#prometheus-integration-improvements}

Prometheus統合のためにいくつかの改善を加えました：

- **組織レベルのエンドポイント**。ClickHouse Cloud用のPrometheus統合に改良が導入されました。サービスレベルのメトリクスに加えて、APIには**組織レベルメトリクス**のためのエンドポイントが含まれています。この新しいエンドポイントは、組織内のすべてのサービスのメトリクスを自動的に収集し、メトリクスをPrometheusコレクターにエクスポートするプロセスを簡素化します。これらのメトリクスは、GrafanaやDatadogなどの可視化ツールと統合し、組織のパフォーマンスをより包括的に把握するために使用できます。

  この機能はすでにすべてのユーザーが利用可能です。詳細は[こちら](/integrations/prometheus)をご覧ください。

- **フィルターされたメトリクス**。私たちのClickHouse CloudのPrometheus統合で、フィルタリストを返すためのサポートが追加されました。この機能は、サービスの健康状態を監視するために重要なメトリクスに焦点を合わせることを可能にし、応答ペイロードサイズを削減します。

  この機能はAPIのオプションのクエリパラメータとして利用可能で、データ収集を最適化し、GrafanaやDatadogとの統合を簡素化します。

  フィルタードメトリクス機能はすでにすべてのユーザーのために利用可能です。詳細は[こちら](/integrations/prometheus)をご覧ください。

## December 20, 2024 {#december-20-2024}
### Marketplace subscription organization attachment {#marketplace-subscription-organization-attachment}

新しいマーケットプレイスサブスクリプションを既存のClickHouse Cloud組織に添付できるようになりました。マーケットプレイスにサブスクライブしたら、ClickHouse Cloudにリダイレクトされ、過去に作成された既存の組織を新しいマーケットプレイスサブスクリプションに接続できるようになります。この時点から、組織内のリソースはマーケットプレイスを通じて請求されることになります。

<Image img={add_marketplace} size="md" alt="ClickHouse Cloud interface showing how to add a marketplace subscription to an existing organization" border />
### Force OpenAPI key expiration {#force-openapi-key-expiration}

APIキーの有効期限オプションを制限し、有効期限のないOpenAPIキーを作成しないようにできるようになりました。これらの制限を組織に対して有効にするには、ClickHouse Cloudサポートチームにお問い合わせください。

### Custom emails for notifications {#custom-emails-for-notifications}

組織管理者は、特定の通知に追加の受信者としてメールアドレスを追加できるようになりました。これは、通知をエイリアスやClickHouse Cloudのユーザーでない他の組織内のユーザーに送信したい場合に便利です。これを構成するには、クラウドコンソールの通知設定に移動し、メール通知を受信したいメールアドレスを編集します。

## December 6, 2024 {#december-6-2024}
### BYOC (Beta) {#byoc-beta}

AWS向けのBring Your Own Cloudが現在ベータ版で利用可能です。このデプロイメントモデルにより、ClickHouse Cloudを独自のAWSアカウントで展開および実行できます。11以上のAWSリージョンでのデプロイメントをサポートし、今後さらに追加される予定です。アクセスについては、[サポートにお問い合わせください](https://clickhouse.com/support/program)。このデプロイは、大規模なデプロイメントにのみ予約されています。

### Postgres Change-Data-Capture (CDC) Connector in ClickPipes {#postgres-change-data-capture-cdc-connector-in-clickpipes}

このターンキー統合により、顧客は数回のクリックでPostgresデータベースをClickHouse Cloudにレプリケートし、ClickHouseを利用して瞬時に分析できます。このコネクタを使用して、Postgresからの継続的なレプリケーションと1回限りのマイグレーションの両方を行うことができます。

### Dashboards (Beta) {#dashboards-beta}

今週、ClickHouse CloudでDashboardsをベータ版で発表できることを嬉しく思います。Dashboardsを使用すると、ユーザーは保存したクエリをビジュアライゼーションに変え、ビジュアライゼーションをダッシュボードに整理し、クエリパラメータを使用してダッシュボードと対話できます。始めるには、[ダッシュボードのドキュメント](/cloud/manage/dashboards)を参照してください。

<Image img={beta_dashboards} size="lg" alt="ClickHouse Cloud interface showing the new Dashboards Beta feature with visualizations" border />

### Query API endpoints (GA) {#query-api-endpoints-ga}

ClickHouse CloudでクエリAPIエンドポイントのGAリリースを発表できることを嬉しく思います。クエリAPIエンドポイントを使用すると、保存されたクエリのRESTful APIエンドポイントを数回のクリックで立ち上げ、言語クライアントや認証の複雑さを気にせずにアプリケーション内でデータを消費し始めることができます。初期のローンチ以来、次のような改善が加えられました：

* エンドポイントのレイテンシを削減、特にコールドスタート時
* エンドポイントRBACコントロールの強化
* CORS許可ドメインの設定可能性
* 結果ストリーミング
* ClickHouse互換出力形式のサポート

これらの改善に加えて、既存のフレームワークを活用し、ClickHouse Cloudサービスに対して任意のSQLクエリを実行することを可能にする一般的なクエリAPIエンドポイントを発表します。一般的なエンドポイントは、サービス設定ページから有効化および設定が可能です。

始めるには、[クエリAPIエンドポイントのドキュメント](/cloud/get-started/query-endpoints)を参照してください。

<Image img={api_endpoints} size="lg" alt="ClickHouse Cloud interface showing the API Endpoints configuration with various settings" border />

### Native JSON support (Beta) {#native-json-support-beta}

ClickHouse CloudでネイティブJSONサポートのベータ版を発表します。開始するには、サポートに連絡して、[クラウドサービスを有効化してください](/cloud/support)。

### Vector search using vector similarity indexes (Early Access) {#vector-search-using-vector-similarity-indexes-early-access}

近似ベクター検索のためのベクター類似性インデックスを早期アクセスで発表します！

ClickHouseは、幅広い[距離関数](https://clickhouse.com/blog/reinvent-2024-product-announcements#vector-search-using-vector-similarity-indexes-early-access)とリニアスキャンを実行する能力を備えて、ベクター型ユースケースを強力にサポートしています。最近、[usearch](https://github.com/unum-cloud/usearch)ライブラリと階層型ナビゲーション可能な小世界（HNSW）近似最近傍検索アルゴリズムを活用した実験的[近似ベクター検索](/engines/table-engines/mergetree-family/annindexes)アプローチを追加しました。

始めるには、[早期アクセスの待機リストにサインアップしてください](https://clickhouse.com/cloud/vector-search-index-waitlist)。

### ClickHouse-Connect (Python) and ClickHouse-Kafka-Connect Users {#clickhouse-connect-python-and-clickhouse-kafka-connect-users}

[`MEMORY_LIMIT_EXCEEDED`](https://docs.clickhouse.com/en/operations/events/#memory_limit_exceeded)例外が発生する可能性がある問題に苦しんでいた顧客に通知のメールが送信されました。

以下のバージョンにアップグレードしてください：
- Kafka-Connect: > 1.2.5
- ClickHouse-Connect (Java): > 0.8.6

### ClickPipes now supports cross-VPC resource access on AWS {#clickpipes-now-supports-cross-vpc-resource-access-on-aws}

特定のデータソース（たとえばAWS MSK）に対して一方向のアクセスを付与できるようになりました。AWS PrivateLinkとVPC Latticeを使用したクロスVPCリソースアクセスにより、VPCおよびアカウントの境界を越えて、または公共ネットワークを介らずにオンプレミスネットワークからリソースを共有できます。リソース共有の設定方法については、[発表記事](https://clickhouse.com/blog/clickpipes-crossvpc-resource-endpoints?utm_medium=web&utm_source=changelog)をお読みください。

<Image img={cross_vpc} size="lg" alt="Diagram showing the Cross-VPC resource access architecture for ClickPipes connecting to AWS MSK" border />

### ClickPipes now supports IAM for AWS MSK {#clickpipes-now-supports-iam-for-aws-msk}

AWS MSK ClickPipesを使用して、IAM認証を使用してMSKブローカーに接続できるようになりました。開始するには、[ドキュメント](/integrations/clickpipes/kafka#iam)を確認してください。

### Maximum replica size for new services on AWS {#maximum-replica-size-for-new-services-on-aws}

これから、新しく作成されたAWSのサービスは、最大236 GiBのレプリカサイズを許可します。

## November 22, 2024 {#november-22-2024}
### Built-in advanced observability dashboard for ClickHouse Cloud {#built-in-advanced-observability-dashboard-for-clickhouse-cloud}

以前は、ClickHouseサーバーメトリクスとハードウェアリソース利用状況を監視するための高度な可視化ダッシュボードは、オープンソースのClickHouseでのみ利用可能でした。この機能が現在、ClickHouse Cloudコンソールで利用可能になったことを嬉しく思います！

このダッシュボードでは、[system.dashboards](/operations/system-tables/dashboards)テーブルに基づいてクエリをすべて1つのUIで表示できます。今日から**モニタリング > サービスヘルス**ページを訪れて、高度な可視化ダッシュボードを使用してください。

<Image img={nov_22} size="lg" alt="ClickHouse Cloud advanced observability dashboard showing server metrics and resource utilization" border />

### AI-powered SQL autocomplete {#ai-powered-sql-autocomplete}

新しいAI Copilotとともに、クエリを記述するときにインラインSQL補完を受けることができるよう、オートコンプリートを大幅に改善しました！ この機能は、どのClickHouse Cloudサービスに対しても**「インラインコード補完を有効にする」**設定を切り替えて有効にすることができます。

<Image img={copilot} size="lg" alt="Animation showing the AI Copilot providing SQL autocompletion suggestions as a user types" border />

### New "Billing" role {#new-billing-role}

組織のユーザーに新しい**料金**ロールを割り当てて、サービスを構成または管理する能力を与えることなく請求情報を表示および管理させることができるようになりました。新しいユーザーを招待するか、既存のユーザーの役割を編集して**料金**ロールを割り当ててください。

## November 8, 2024 {#november-8-2024}
### Customer Notifications in ClickHouse Cloud {#customer-notifications-in-clickhouse-cloud}

ClickHouse Cloudは、いくつかの請求およびスケーリングイベントについてコンソール内およびメール通知を提供します。顧客はこれらの通知をクラウドコンソールの通知センターを介して構成し、UIでのみ表示したり、メールを受信したり、両方を実施したりできます。受け取る通知のカテゴリーおよび重要度をサービスレベルで構成できます。

今後、他のイベントの通知や、通知を受信するための追加の方法も追加する予定です。

サービスの通知を有効にする方法については、[ClickHouseドキュメント](/cloud/notifications)を参照してください。

<Image img={notifications} size="lg" alt="ClickHouse Cloud notification center interface showing configuration options for different notification types" border />

<br />
## October 4, 2024 {#october-4-2024}
### ClickHouse Cloud now offers HIPAA-ready services in Beta for GCP {#clickhouse-cloud-now-offers-hipaa-ready-services-in-beta-for-gcp}

保護された健康情報（PHI）へのセキュリティを強化したい顧客は、現在、[Google Cloud Platform (GCP)](https://cloud.google.com/)でClickHouse Cloudに登録できます。ClickHouseは、[HIPAAセキュリティルール](https://www.hhs.gov/hipaa/for-professionals/security/index.html)で規定された管理的、物理的および技術的な保護策を実装し、特定のユースケースやワークロードに応じて実装できる設定可能なセキュリティ設定を持っています。利用可能なセキュリティ設定についての詳細は、[セキュリティ共有責任モデル](/cloud/security/shared-responsibility-model)をご覧ください。

サービスは、**専用**サービスタイプを持つ顧客に対して、GCP `us-central-1`で利用可能で、ビジネスアソシエイト契約（BAA）が必要です。この機能へのアクセスをリクエストするには、[営業](mailto:sales@clickhouse.com)または[サポート](https://clickhouse.com/support/program)にお問い合わせください。

### Compute-Compute separation is now in Private Preview for GCP and Azure {#compute-compute-separation-is-now-in-private-preview-for-gcp-and-azure}

私たちは最近、AWSのコンピュート-コンピュート分離のプライベートプレビューを発表しました。今、GCPとAzureでも利用可能になったことを嬉しく思います。

コンピュート-コンピュート分離により、特定のサービスを読み書きまたは読み取り専用サービスとして指定できるため、アプリケーションに最適なコンピュート設定を設計してコストとパフォーマンスを最適化できます。詳細については、[ドキュメント](/cloud/reference/warehouses)をお読みください。

### Self-service MFA recovery codes {#self-service-mfa-recovery-codes}

多要素認証を使用している顧客は、電話を失ったりトークンを誤って削除した場合に使用できる回復コードを取得できるようになりました。初めてMFAに登録する顧客には、設定時にコードが提供されます。既存のMFAを持っている顧客は、既存のMFAトークンを削除し新しいトークンを追加することで回復コードを取得できます。

### ClickPipes Update: Custom Certificates, Latency Insights, and More! {#clickpipes-update-custom-certificates-latency-insights-and-more}

ClickPipes、データをClickHouseサービスに取り込むための最も簡単な方法に関する最新の更新情報をお知らせできることを嬉しく思います！これらの新機能は、データ取り込みの制御を強化し、パフォーマンスメトリクスへの可視化を提供することを目的としています。

*Kafka用のカスタム認証証明書*

ClickPipes for Kafkaでは、SASLと公開SSL/TLSを使用してKafkaブローカー用のカスタム認証証明書をサポートしています。ClickPipe設定中にSSL証明書セクションで独自の証明書を簡単にアップロードでき、Kafkaへのより安全な接続を実現します。

*KafkaおよびKinesisのレイテンシメトリクスを導入*

パフォーマンスの可視化は重要です。ClickPipesにはレイテンシグラフが新たに追加され、メッセージ生産（KafkaトピックまたはKinesisストリームからの）からClickHouse Cloudへの取り込みまでの時間を把握できます。この新しいメトリクスにより、データパイプラインのパフォーマンスをより細かく監視し、最適化が可能です。

<Image img={latency_insights} size="lg" alt="ClickPipes interface showing latency metrics graph for data ingestion performance" border />

<br />

*KafkaおよびKinesisのスケーリング制御（プライベートベータ）*

高スループットにより、データボリュームとレイテンシ要件を満たすために追加のリソースが必要になる場合があります。私たちはClickPipesの水平方向のスケーリングを導入しており、これによりクラウドコンソールを介して直接操作できます。この機能は現在プライベートベータ版で利用可能で、要件に応じてリソースをより効果的にスケールできます。プライベートベータ版に参加するには、[サポート]へお問い合わせください。

*KafkaおよびKinesisの生メッセージ取り込み*

今後、完全なKafkaまたはKinesisメッセージを解析なしに取り込むことが可能になりました。ClickPipesでは、ユーザーが完全なメッセージを単一の文字列カラムにマッピングできる[_raw_message](https://integrations/clickpipes/kafka#kafka-virtual-columns)仮想カラムのサポートが提供されています。これにより、必要に応じて生データと対話する柔軟性が得られます。

## August 29, 2024 {#august-29-2024}
### New Terraform provider version - v1.0.0 {#new-terraform-provider-version---v100}

Terraformを使用すると、ClickHouse Cloudサービスをプログラムで制御し、構成をコードとして保存できます。私たちのTerraformプロバイダーは20万ダウンロード以上を達成し、正式にv1.0.0になりました！この新しいバージョンには、再試行ロジックの改善や、ClickHouse Cloudサービスにプライベートエンドポイントを接続するための新しいリソースの追加が含まれています。[Terraformプロバイダーをこちらからダウンロード](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest)でき、[完全な変更履歴をこちらで確認](https://github.com/ClickHouse/terraform-provider-clickhouse/releases/tag/v1.0.0)できます。
### 2024 SOC 2 Type II レポートおよび更新された ISO 27001 証明書 {#2024-soc-2-type-ii-report-and-updated-iso-27001-certificate}

私たちは、2024 SOC 2 Type II レポートおよび更新された ISO 27001 証明書の提供を誇りに思います。どちらも、最近開始した Azure のサービスと、AWS および GCP でのサービスの継続的なカバレッジを含んでいます。

私たちの SOC 2 Type II は、ClickHouse ユーザーに提供するサービスのセキュリティ、可用性、処理の完全性、および機密性を達成するための継続的なコミットメントを示しています。詳細については、アメリカ公認会計士協会 (AICPA) が発行した [SOC 2 - サービス組織のための SOC: 信頼サービス基準](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services) および国際標準化機構 (ISO) の [ISO/IEC 27001 とは](https://www.iso.org/standard/27001) をご覧ください。

また、セキュリティおよびコンプライアンス文書やレポートについては、私たちの [Trust Center](https://trust.clickhouse.com/) をご覧ください。

## 2024年8月15日 {#august-15-2024}
### AWS のプライベートプレビューでのコンピュート間分離 {#compute-compute-separation-is-now-in-private-preview-for-aws}

既存の ClickHouse Cloud サービスでは、レプリカが読み取りと書き込みの両方を処理しており、特定のレプリカを特定の操作のみ処理するように構成する方法はありません。新機能であるコンピュート間分離を使用すると、特定のサービスを読み取り/書き込みまたは読み取り専用サービスとして指定できるため、コストとパフォーマンスを最適化するための最適なコンピュート構成を設計できます。

新しいコンピュート間分離機能を使用すると、同じオブジェクトストレージフォルダを使用している各エンドポイントを持つ複数のコンピュートノードグループを作成できます。これにより、同じテーブル、ビューなどを使用することができます。 [ここでコンピュート間分離について詳しく読みます](/cloud/reference/warehouses)。プライベートプレビューでこの機能にアクセスを希望する場合は、[サポートに連絡](https://clickhouse.com/support/program)してください。

<Image img={cloud_console_2} size="lg" alt="読み取り/書き込みおよび読み取り専用サービスグループを使用したコンピュート間分離の例を示す図" border />

### S3 および GCS 用 ClickPipes が GA、Continuous mode 対応 {#clickpipes-for-s3-and-gcs-now-in-ga-continuous-mode-support}

ClickPipes は、ClickHouse Cloud にデータを取り込む最も簡単な方法です。[ClickPipes](https://clickhouse.com/cloud/clickpipes) が S3 および GCS 用に **一般提供** されることを嬉しく思います。ClickPipes は、一度きりのバッチ取り込みと「連続モード」の両方をサポートしています。取り込みタスクは、特定のリモートバケット内のパターンに一致するすべてのファイルを ClickHouse の宛先テーブルに読み込みます。「連続モード」では、ClickPipesジョブが常に実行され、リモートオブジェクトストレージバケットに追加される一致するファイルを取り込みます。これにより、ユーザーは任意のオブジェクトストレージバケットを ClickHouse Cloud にデータを取り込むための完全に機能するステージングエリアに変えることができます。ClickPipes についての詳細は、[こちらのドキュメント](/integrations/clickpipes)をご覧ください。

## 2024年7月18日 {#july-18-2024}
### メトリクス用 Prometheus エンドポイントが一般提供中 {#prometheus-endpoint-for-metrics-is-now-generally-available}

前回のクラウドチェンジログで、ClickHouse Cloud からの [Prometheus](https://prometheus.io/) メトリクスのエクスポートに関するプライベートプレビューを発表しました。この機能では、[ClickHouse Cloud API](/cloud/manage/api/api-overview) を使用してメトリクスを [Grafana](https://grafana.com/) や [Datadog](https://www.datadoghq.com/) などのツールに取り込んで視覚化できます。この機能が現在 **一般提供** されていることを嬉しく思います。詳細については、[こちらのドキュメント](/integrations/prometheus) をご覧ください。

### クラウドコンソール内のテーブルインスペクタ {#table-inspector-in-cloud-console}

ClickHouse には、テーブルのスキーマを調べるための [`DESCRIBE`](/sql-reference/statements/describe-table) のようなコマンドがあります。これらのコマンドはコンソールに出力されますが、関連データ全体を取得するには複数のクエリを組み合わせる必要があるため、便利ではありません。

最近、SQL を記述せずに UI で重要なテーブルおよびカラム情報を取得できる **テーブルインスペクタ** をクラウドコンソールに導入しました。クラウドコンソールでサービスのテーブルインスペクタを試すことができます。このインターフェースは、スキーマ、ストレージ、圧縮などに関する情報を一元化して提供します。

<Image img={compute_compute} size="lg" alt="ClickHouse Cloud テーブルインスペクタインターフェースで、詳細なスキーマおよびストレージ情報を表示" border />

### 新しい Java クライアント API {#new-java-client-api}

私たちの [Java Client](https://github.com/ClickHouse/clickhouse-java) は、ClickHouse に接続するためにユーザーが使用する最も人気のあるクライアントの1つです。私たちは、再設計された API やさまざまなパフォーマンス最適化を含めて、より使いやすく直感的にすることを望んでいました。これにより、Java アプリケーションから ClickHouse に接続するのがはるかに簡単になります。更新された Java Client の使い方については、[このブログ投稿](https://clickhouse.com/blog/java-client-sequel)を参照してください。

### 新しいアナライザーがデフォルトで有効化されました {#new-analyzer-is-enabled-by-default}

ここ数年、クエリ分析と最適化のための新しいアナライザーの開発に取り組んできました。このアナライザーはクエリのパフォーマンスを向上させ、より迅速かつ効果的な `JOIN` を可能にします。以前は、新しいユーザーは `allow_experimental_analyzer` 設定を使用してこの機能を有効にする必要がありました。この改善されたアナライザーは、現在新しい ClickHouse Cloud サービスにデフォルトで備わっています。

さらなる最適化を行う予定があるので、アナライザーに関するさらなる改善にご期待ください！

## 2024年6月28日 {#june-28-2024}
### Microsoft Azure 向け ClickHouse Cloud が一般提供中！ {#clickhouse-cloud-for-microsoft-azure-is-now-generally-available}

先月、私たちは Microsoft Azure サポートをベータ版で発表しました[（先月）](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta)。最新のクラウドリリースにおいて、Azure のサポートがベータ版から一般提供へと移行したことを嬉しく思います。ClickHouse Cloud は、AWS、Google Cloud Platform、そして今や Microsoft Azure のすべての主要クラウドプラットフォームで利用可能です。

このリリースには、[Microsoft Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/clickhouse.clickhouse_cloud)を通じてのサブスクリプションのサポートも含まれています。サービスは以下の地域で初めてサポートされます：
- 米国：West US 3 (アリゾナ)
- 米国：East US 2 (バージニア)
- ヨーロッパ：Germany West Central（フランクフルト）

特定の地域のサポートを希望する場合は、[お問い合わせ](https://clickhouse.com/support/program)ください。

### クエリログインサイト {#query-log-insights}

クラウドコンソールに新しく追加されたクエリインサイト UI は、ClickHouse に内蔵されたクエリログを使いやすくします。ClickHouse の `system.query_log` テーブルは、クエリの最適化、デバッグ、および全体的なクラスタの健康とパフォーマンスの監視に関する情報の重要なソースです。ただし、70以上のフィールドと複数のレコードにわたるクエリから、クエリログの解釈が難しい場合があります。この初期版のクエリインサイトは、クエリデバッグと最適化パターンを簡素化するための青写真を提供します。この機能の改善を続けたいと思っており、お客様からのフィードバックをお待ちしておりますので、お気軽にご連絡ください。

<Image img={query_insights} size="lg" alt="ClickHouse Cloud クエリインサイト UI でクエリパフォーマンスメトリクスと分析を表示" border />

### メトリクス用 Prometheus エンドポイント (プライベートプレビュー) {#prometheus-endpoint-for-metrics-private-preview}

私たちの最もリクエストの多い機能の1つかもしれません：ClickHouse Cloud から [Prometheus](https://prometheus.io/) メトリクスをエクスポートし、[Grafana](https://grafana.com/) と [Datadog](https://www.datadoghq.com/) で視覚化することができます。Prometheus は ClickHouse を監視し、カスタムアラートを設定するためのオープンソースソリューションを提供します。ClickHouse Cloud サービスの Prometheus メトリクスへのアクセスは、[ClickHouse Cloud API](/integrations/prometheus) 経由で利用できます。この機能は現在プライベートプレビュー中ですので、[サポートチーム](https://clickhouse.com/support/program)にご連絡いただき、この機能を有効にしてください。

<Image img={prometheus} size="lg" alt="ClickHouse Cloud からの Prometheus メトリクスを表示する Grafana ダッシュボード" border />

### その他の機能: {#other-features}
- [構成可能なバックアップ](/cloud/manage/backups/configurable-backups)は、頻度、保持、およびスケジュールのカスタムバックアップポリシーを構成するために、現在一般提供されております。

## 2024年6月13日 {#june-13-2024}
### Kafka ClickPipes コネクタの構成可能なオフセット (ベータ) {#configurable-offsets-for-kafka-clickpipes-connector-beta}

最近まで、新しい [Kafka Connector for ClickPipes](/integrations/clickpipes/kafka) を設定すると、常に Kafka トピックの最初からデータを消費していました。この状況では、履歴データを再処理したり、新しい incoming データを監視したり、正確なポイントから再開する必要がある場合に、特定のユースケースに適合しないことがありました。

Kafka 用の ClickPipes では、Kafka トピックからのデータ消費に対する柔軟性とコントロールを向上させる新機能を追加しました。これにより、データが消費されるオフセットを構成できるようになります。

以下のオプションが利用可能です：
- 開始から：Kafka トピックの最初からデータの消費を開始します。このオプションは、すべての履歴データを再処理する必要があるユーザーに最適です。
- 最新から：最新のオフセットからデータの消費を開始します。これは、新しいメッセージのみに関心があるユーザーに便利です。
- タイムスタンプから：特定のタイムスタンプ以降に生成されたメッセージからデータの消費を開始します。この機能により、より正確なコントロールが可能になり、ユーザーが正確な時点から処理を再開できるようになります。

<Image img={kafka_config} size="lg" alt="オフセット選択オプションを示す ClickPipes Kafka コネクタ設定インターフェース" border />

### サービスをファストリリースチャンネルに登録 {#enroll-services-to-the-fast-release-channel}

ファストリリースチャンネルを使用すると、サービスはリリーススケジュールに先立って更新を受け取ることができます。以前は、この機能を有効にするにはサポートチームによる支援が必要でしたが、今では ClickHouse Cloud コンソールを使用して直接サービスのためにこの機能を有効にすることができます。「設定」に移動し、「ファストリリースに登録」をクリックするだけです。これにより、サービスは利用可能になるとすぐに更新を受け取ります！

<Image img={fast_releases} size="lg" alt="ファストリリースへの登録オプションを表示する ClickHouse Cloud 設定ページ" border />

### 水平方向のスケーリングのための Terraform サポート {#terraform-support-for-horizontal-scaling}

ClickHouse Cloud は [水平スケーリング](/manage/scaling#how-scaling-works-in-clickhouse-cloud) をサポートしており、サービスに同サイズの追加レプリカを追加する機能を提供します。水平スケーリングは、パフォーマンスを向上させ、並列処理をサポートします。以前は、レプリカを追加するために ClickHouse Cloud コンソールやAPIを使用する必要がありましたが、今では Terraform を使ってプログラム的に ClickHouse サービスのレプリカを追加または削除できるようになりました。

詳細については、[ClickHouse Terraform プロバイダー](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)をご覧ください。

## 2024年5月30日 {#may-30-2024}
### チームメイトとクエリを共有する {#share-queries-with-your-teammates}

SQL クエリを記述するとき、チームの他の人にとってもそのクエリが役立つ可能性が高いです。以前は、クエリを Slack やメールで送信する必要があり、クエリを編集したときにチームメイトが自動的にその更新を受け取る方法はありませんでした。

ClickHouse Cloud コンソールを通じて、クエリを簡単に共有できるようになりました。クエリエディタから、クエリをチーム全体または特定のチームメンバーと直接共有できます。また、読み取りまたは書き込みのみにアクセスできるかを指定することもできます。クエリエディタの **共有** ボタンをクリックして、新しい共有クエリ機能を試してみてください。

<Image img={share_queries} size="lg" alt="権限オプションを含む共有機能を表示する ClickHouse Cloud クエリエディタ" border />

### Microsoft Azure 向け ClickHouse Cloud がベータ版であります {#clickhouse-cloud-for-microsoft-azure-is-now-in-beta}

ついに、Microsoft Azure 上で ClickHouse Cloud サービスを作成できるようになりました！私たちのプライベートプレビュープログラムの一環として、すでに多くのお客様が Azure で ClickHouse Cloud を使用しています。今では、誰でも Azure 上で自分自身のサービスを作成できます。AWS および GCP でサポートされているお好みの ClickHouse 機能は、すべて Azure でも動作します。

今後数週間以内に、Azure 向け ClickHouse Cloud を一般提供する予定です。詳細を学ぶには、[こちらのブログ投稿](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta)をご覧いただくか、ClickHouse Cloud コンソールを使用して Azure 経由で新しいサービスを作成してください。

注意：現在、Azure 向けの **開発** サービスはサポートされていません。

### クラウドコンソールを介してプライベートリンクを設定する {#set-up-private-link-via-the-cloud-console}

プライベートリンク機能を使用すると、ClickHouse Cloud サービスをクラウドプロバイダーアカウント内の内部サービスと接続でき、公共インターネットへのトラフィックを指向することなくコストを節約し、安全性を高めることができます。以前は、これを設定するのが困難で、ClickHouse Cloud API を使用する必要がありました。

今、ClickHouse Cloud コンソールから数回のクリックでプライベートエンドポイントを構成できるようになりました。これには、サービスの **設定** に移動し、**セキュリティ** セクションに進み、**プライベートエンドポイントの設定** をクリックします。

<Image img={private_endpoint} size="lg" alt="セキュリティ設定内でのプライベートエンドポイント設定インターフェースを表示する ClickHouse Cloud コンソール" border />

## 2024年5月17日 {#may-17-2024}
### ClickPipes を使用して Amazon Kinesis からデータを取り込む (ベータ) {#ingest-data-from-amazon-kinesis-using-clickpipes-beta}

ClickPipes は、コードなしでデータを取り込むために ClickHouse Cloud が提供する独自のサービスです。Amazon Kinesis は、AWS のフルマネージドストリーミングサービスであり、処理のためにデータストリームを取り込み、保存します。ClickPipes の Amazon Kinesis ベータ版を発表できることを嬉しく思います。これは、私たちがよくリクエストされる統合の1つです。ClickPipes への新しい統合を追加する予定なので、サポートしてほしいデータソースがあれば教えてください！ [こちらで](https://clickhouse.com/blog/clickpipes-amazon-kinesis) この機能についてもっと読むことができます。

クラウドコンソールで新しい Amazon Kinesis 統合を試すことができます：

<Image img={kenesis} size="lg" alt="Amazon Kinesis 統合設定オプションを示す ClickPipes インターフェース" border />

### 構成可能なバックアップ (プライベートプレビュー) {#configurable-backups-private-preview}

バックアップはすべてのデータベースにとって重要です（どんなに信頼性が高くても）、ClickHouse Cloud の初日からバックアップの重要性を真剣に受け止めてきました。今週、私たちは構成可能なバックアップを開始しました。これにより、サービスのバックアップに対する柔軟性が大幅に向上します。これで、開始時間、保持、および頻度を制御できるようになりました。この機能は **Production**および **Dedicated** サービス用に利用可能で、**Development** サービス用には利用できません。この機能は現在プライベートプレビュー中ですので、サービスの有効化については support@clickhouse.com までご連絡ください。構成可能なバックアップについての詳細は、[こちら](https://clickhouse.com/blog/configurable-backups-in-clickhouse-cloud)でご覧いただけます。

### SQL クエリから API を作成する (ベータ) {#create-apis-from-your-sql-queries-beta}

ClickHouse 用の SQL クエリを書くと、アプリケーションにクエリを公開するにはドライバ経由で ClickHouse に接続する必要があります。しかし、現在の **クエリエンドポイント** 機能を使用すると、設定なしで API から直接 SQL クエリを実行できます。クエリエンドポイントを指定して、JSON、CSV、または TSV を返すように設定できます。クラウドコンソールで「共有」ボタンをクリックして、クエリでこの新機能を試してみてください。 [クエリエンドポイントについての詳細はこちら](https://clickhouse.com/blog/automatic-query-endpoints)をご覧ください。

<Image img={query_endpoints} size="lg" alt="出力形式オプションを持つクエリエンドポイント設定を示す ClickHouse Cloud インターフェース" border />

### 公式の ClickHouse 認証が提供されています {#official-clickhouse-certification-is-now-available}

ClickHouse 開発トレーニングコースには 12 の無料トレーニングモジュールがあります。この週の前には、ClickHouse での習熟度を証明する公式な方法はありませんでした。最近、**ClickHouse 認定開発者**になるための公式な試験を開始しました。この試験を完了すると、データの取り込み、モデリング、分析、パフォーマンスの最適化などのトピックに関する ClickHouse の習熟度を、現在および将来の雇用主に示すことができます。 [こちらで試験を受ける](https://clickhouse.com/learn/certification) か、ClickHouse 認証についての詳細は [このブログ投稿](https://clickhouse.com/blog/first-official-clickhouse-certification)をご覧ください。

## 2024年4月25日 {#april-25-2024}
### S3 および GCS からデータを ClickPipes を使用してロードする {#load-data-from-s3-and-gcs-using-clickpipes}

最近リリースされたクラウドコンソールには、「データソース」という新しいセクションがあることに気づいたかもしれません。「データソース」ページは、様々なソースから ClickHouse Cloud にデータを簡単に挿入できる ClickPipes というネイティブな ClickHouse Cloud 機能によってパワーされています。

最近の ClickPipes アップデートには、Amazon S3 および Google Cloud Storage からデータを直接アップロードする機能が追加されました。組み込みのテーブル関数を使用することもできますが、ClickPipes は、UI を介しての完全に管理されたサービスであり、数回のクリックで S3 および GCS からデータを取り込むことができます。この機能はまだプライベートプレビュー中ですが、クラウドコンソールで今すぐ試すことができます。

<Image img={s3_gcs} size="lg" alt="S3 および GCS バケットからデータをロードするための設定オプションを示す ClickPipes インターフェース" border />

### 500 以上のソースから ClickHouse Cloud へのデータを Fivetran を使用してロードする {#use-fivetran-to-load-data-from-500-sources-into-clickhouse-cloud}

ClickHouse は、すべての大規模データセットを迅速にクエリできますが、もちろん、データは最初に ClickHouse に挿入する必要があります。Fivetran の多様なコネクタのおかげで、ユーザーは 500 以上のソースからデータを迅速にロードできるようになりました。Zendesk、Slack、またはお気に入りのアプリケーションからデータをロードする必要がある場合、Fivetran の新しい ClickHouse 宛先を使用することで、ClickHouse をアプリケーションデータのターゲットデータベースとして使用できるようになります。

これは多くの月の努力の末、私たちの統合チームによって構築されたオープンソースの統合です。 [こちらのリリースブログ投稿](https://clickhouse.com/blog/fivetran-destination-clickhouse-cloud) と、[GitHub リポジトリ](https://github.com/ClickHouse/clickhouse-fivetran-destination)をここで確認できます。

### その他の変更 {#other-changes}

**コンソールの変更**
- SQL コンソールにおける出力形式のサポート

**統合の変更**
- ClickPipes Kafka コネクタがマルチブローカー設定をサポート
- PowerBI コネクタが ODBC ドライバ設定オプションを提供するサポートが追加

## 2024年4月18日 {#april-18-2024}
### AWS 東京リージョンが ClickHouse Cloud 用に利用可能になりました {#aws-tokyo-region-is-now-available-for-clickhouse-cloud}

このリリースでは、ClickHouse Cloud 用に新しい AWS 東京リージョン (`ap-northeast-1`) が導入されました。ClickHouse を最速のデータベースにしたいと考えているため、可能な限りレイテンシを削減するために、すべてのクラウドのリージョンを追加し続けています。更新されたクラウドコンソールで東京に新しいサービスを作成できます。

<Image img={tokyo} size="lg" alt="東京リージョン選択を表示する ClickHouse Cloud サービス作成インターフェース" border />

その他の変更：
### コンソールの変更 {#console-changes}
- ClickPipes for Kafka に対する Avro 形式のサポートが現在一般提供中
- Terraform プロバイダーに対してリソースのインポート（サービスとプライベートエンドポイント）の完全なサポートを実装

### 統合の変更 {#integrations-changes}
- NodeJS クライアントの主要な安定リリース: クエリ + ResultSet、URL 構成に対する高度な TypeScript サポート
- Kafka コネクタ: DLQ への書き込み時に例外を無視するバグを修正、Avro 列挙型をサポートする機能を追加、[MSK](https://www.youtube.com/watch?v=6lKI_WlQ3-s) および [Confluent Cloud](https://www.youtube.com/watch?v=SQAiPVbd3gg) でのコネクタ使用法ガイドを公開
- Grafana: UI で Nullable 型のサポートを修正、動的 OTEL トレーシングテーブル名のサポートを修正
- DBT: カスタムマテリアライゼーションのモデル設定を修正
- Java クライアント: 不正なエラーコード解析のバグを修正
- Python クライアント: 数値型のパラメータバインディングを修正、クエリバインディングの数値リストに関するバグを修正、SQLAlchemy Point サポートを追加

## 2024年4月4日 {#april-4-2024}
### 新しい ClickHouse Cloud コンソールの紹介 {#introducing-the-new-clickhouse-cloud-console}

このリリースでは、新しいクラウドコンソールのプライベートプレビューを導入します。

ClickHouse では、開発者エクスペリエンスの向上について常に考えています。最速のリアルタイムデータウェアハウスを提供するだけでは不十分で、それを使いやすく管理しやすくする必要があります。

数千人の ClickHouse Cloud ユーザーが毎月私たちの SQL コンソールで数十億のクエリを実行しているため、ClickHouse Cloud サービスとのインタラクションを以前よりも簡単にするために、世界クラスのコンソールに投資することに決めました。新しいクラウドコンソール体験は、スタンドアロンの SQL エディタと管理コンソールを直感的な UI 内で組み合わせています。

選ばれたお客様には、新しいクラウドコンソール体験をプレビューする機会が提供されます – ClickHouse 内のデータを探索し管理するための統合された没入型の方法です。優先アクセスを希望される場合は、support@clickhouse.com までご連絡ください。

<Image img={cloud_console} size="lg" alt="統合された SQL エディタと管理機能を持つ新しい ClickHouse Cloud コンソールインターフェースを示すアニメーション" border />

## 2024年3月28日 {#march-28-2024}

このリリースでは、Microsoft Azure のサポート、API からの水平スケーリング、プライベートプレビューでのリリースチャンネルを導入します。
### 一般的な更新 {#general-updates}
- Microsoft Azure へのサポートをプライベートプレビューで導入しました。アクセスを取得するには、アカウント管理またはサポートに連絡するか、[待機リスト](https://clickhouse.com/cloud/azure-waitlist)に参加してください。
- リリースチャンネルを導入しました – 環境タイプに基づいてアップグレードのタイミングを指定する機能。このリリースでは、「ファスト」リリースチャンネルを追加し、非本番環境を本番より先にアップグレードできるようにしました（有効にするにはサポートに連絡してください）。

### 管理の変更 {#administration-changes}
- API 経由での水平スケーリング構成のサポートを追加（プライベートプレビュー、サポートに連絡して有効にしてください）
- 起動時にメモリエラーが発生しているサービスのスケーリング上昇を改善
- Terraform プロバイダー経由で AWS に対する CMEK のサポートを追加

### コンソールの変更 {#console-changes-1}
- Microsoft ソーシャルログインをサポート
- SQL コンソールでのパラメータ化されたクエリ共有機能を追加
- クエリエディタのパフォーマンスを大幅に改善（一部の EU リージョンでのレイテンシが 5 秒から 1.5 秒に短縮）

### 統合の変更 {#integrations-changes-1}
- ClickHouse OpenTelemetry エクスポータ: ClickHouse のレプリケーショントランケーブルエンジンをサポートする [追加](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31920) および [統合テスト追加](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31896)
- ClickHouse DBT アダプタ: [辞書のマテリアライゼーションマクロのサポートを追加](https://github.com/ClickHouse/dbt-clickhouse/pull/255)し、[TTL 表現サポートのテストを追加](https://github.com/ClickHouse/dbt-clickhouse/pull/254)
- ClickHouse Kafka Connect Sink: [Kafka プラグイン発見との互換性を追加](https://github.com/ClickHouse/clickhouse-kafka-connect/issues/350)（コミュニティの寄与）
- ClickHouse Java Client: 新しいクライアント API 用の [新しいパッケージを導入](https://github.com/ClickHouse/clickhouse-java/pull/1574)し、[Cloud テストのためのテストカバレッジを追加](https://github.com/ClickHouse/clickhouse-java/pull/1575)
- ClickHouse NodeJS Client: 新しい HTTP keep-alive の動作に対するテストとドキュメントを拡張。v0.3.0 リリース以降のもの
- ClickHouse Golang Client: [Map 内のキーとして Enum のバグを修正](https://github.com/ClickHouse/clickhouse-go/pull/1236)、接続プール内にエラーのある接続が残らない場合のバグを修正 [（コミュニティの寄与）](https://github.com/ClickHouse/clickhouse-go/pull/1237)
- ClickHouse Python Client: [PyArrow を介してのクエリストリーミングを支援する](https://github.com/ClickHouse/clickhouse-connect/issues/155)（コミュニティ寄与）

### セキュリティ更新 {#security-updates}
- ClickHouse Cloud を更新して、["ロールベースのアクセス制御が有効な場合にクエリキャッシュがバイパスされる"](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-45h5-f7g3-gr8r)（CVE-2024-22412）を防止

## 2024年3月14日 {#march-14-2024}

このリリースでは、新しいクラウドコンソールの体験、S3 および GCS からのバルクローディング向けの ClickPipes、および Kafka 用の ClickPipes における Avro 形式のサポートが早期アクセスで提供されます。また、ClickHouse データベースバージョンが 24.1 にアップグレードされ、新機能のサポートやパフォーマンスおよびリソース使用の最適化を実現しています。
### コンソールの変更 {#console-changes-2}
- 新しいクラウドコンソール体験が早期アクセスで提供中（参加に興味がある場合はサポートに連絡してください）。
- S3 および GCS からのバルクローディング用 ClickPipes が早期アクセスで提供中（参加に興味がある場合はサポートに連絡してください）。
- Kafka 用 ClickPipes の Avro 形式のサポートが早期アクセスで提供中（参加に興味がある場合はサポートに連絡してください）。

### ClickHouse バージョンアップグレード {#clickhouse-version-upgrade}
- FINAL に対する最適化、ベクトル化の改善、より高速な集計 - 詳細は [23.12 リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final)を参照してください。
- punycode の処理、文字列の類似性、外れ値の検出、およびマージおよび Keeper のメモリ最適化に関する新機能 - 詳細は [24.1 リリースブログ](https://clickhouse.com/blog/clickhouse-release-24-01)および [プレゼンテーション](https://presentations.clickhouse.com/release_24.1/)を参照ください。
- この ClickHouse Cloud バージョンは 24.1 に基づいており、新機能、パフォーマンス改善、バグ修正が数十件あります。詳細はコアデータベースの [変更ログ](/whats-new/changelog/2023#2312)を参照ください。

### 統合の変更 {#integrations-changes-2}
- Grafana: v4 のダッシュボード移行とアドホックフィルタリングロジックを修正
- Tableau コネクタ: DATENAME 関数および「実際の」引数の丸めを修正
- Kafka コネクタ: 接続初期化時の NPE を修正、JDBC ドライバオプションを指定する機能を追加
- Golang クライアント: レスポンスのメモリフットプリントを減少、Date32 の極端な値を修正、圧縮が有効な場合のエラー報告を改善
- Python クライアント: 日時パラメータでのタイムゾーンのサポートを改善、Pandas DataFrame のパフォーマンスを改善

## 2024年2月29日 {#february-29-2024}

このリリースでは、SQL コンソールアプリケーションの読み込み時間を改善し、ClickPipes における SCRAM-SHA-256 認証をサポートし、Kafka Connect へのネスト構造サポートを拡張します。
### コンソールの変更 {#console-changes-3}
- SQL コンソールアプリケーションの初期読み込み時間を最適化
- SQL コンソール中のレースコンディションを修正し、「認証失敗」エラーを防止
- 最近のメモリ割り当て値が時折間違っている監視ページの動作を修正
- SQL コンソールが時折重複した KILL QUERY コマンドを発行する動作を修正
- ClickPipes における Kafka ベースのデータソース用に SCRAM-SHA-256 認証メソッドのサポートを追加

### 統合の変更 {#integrations-changes-3}
- Kafka コネクタ: 複雑なネスト構造（配列、マップ）へのサポートを拡張、FixedString 型のサポートを追加、複数のデータベースへの取り込みをサポート
- Metabase: ClickHouse バージョン 23.8 未満との互換性の修正
- DBT: モデル作成にパラメータを渡す機能を追加
- Node.js クライアント: 長時間実行されるクエリ (>1 時間) をサポートし、空の値を優雅に処理する機能を追加

## 2024年2月15日 {#february-15-2024}

このリリースはコアデータベースバージョンをアップグレードし、Terraform を介してプライベートリンクを設定する機能を追加し、Kafka Connect を介して非同期挿入の正確な一度のセマンティクスのサポートを追加します。

### ClickHouse バージョンアップグレード {#clickhouse-version-upgrade-1}
- S3Queue テーブルエンジンによる S3 からのデータの連続的でスケジュールされたロードが生産レベルで準備完了 - 詳細は [23.11 リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-11)を参照してください。
- FINAL に対する重要なパフォーマンスの改善と SIMD 命令によるベクトル化の改善があり、より高速なクエリの実現 - 詳細は [23.12 リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final)を参照してください。
- この ClickHouse Cloud バージョンは 23.12 に基づいており、多数の新機能、パフォーマンス向上、バグ修正が含まれています。 [コアデータベースの変更ログ](/whats-new/changelog/2023#2312)を確認してください。

### コンソールの変更 {#console-changes-4}
- Terraform プロバイダーを介して AWS Private Link および GCP Private Service Connect を設定する機能を追加
- リモートファイルデータ インポートの回復力を改善
- すべてのデータインポートにインポートステータスの詳細フライアウトを追加
- S3 データインポートにキー/シークレットキー認証情報のサポートを追加

### 統合の変更 {#integrations-changes-4}
* Kafka Connect
    * 正確な一度のための async_insert をサポート（デフォルトで無効）
* Golang クライアント
    * DateTime バインディングを修正
    * バッチ挿入性能を改善
* Java クライアント
    * リクエスト圧縮の問題を修正
### 設定の変更 {#settings-changes}
* `use_mysql_types_in_show_columns` はもはや必要ありません。MySQL インターフェースを通じて接続すると、自動的に有効になります。
* `async_insert_max_data_size` のデフォルト値が `10 MiB` になりました。
## 2024年2月2日 {#february-2-2024}

このリリースは、Azure Event Hub への ClickPipes の利用可能性をもたらし、v4 ClickHouse Grafana コネクタを使用したログおよびトレースナビゲーションのワークフローを劇的に改善し、Flyway と Atlas データベーススキーマ管理ツールのサポートを初めて導入します。
### コンソールの変更 {#console-changes-5}
* Azure Event Hub への ClickPipes サポートが追加されました。
* 新しいサービスは、デフォルトのアイドル時間が 15 分で開始されます。
### 統合の変更 {#integrations-changes-5}
* [ClickHouse データソース for Grafana](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/) v4 リリース
  * テーブル、ログ、タイムシリーズ、トレースのための専門のエディターを持つ完全に再構築されたクエリビルダー
  * より複雑で動的なクエリをサポートするために完全に再構築された SQL ジェネレーター
  * ログおよびトレースビューに対する OpenTelemetry のファーストクラスサポートの追加
  * ログおよびトレース用のデフォルトのテーブルやカラムを指定するための設定の拡張
  * カスタム HTTP ヘッダーを指定する能力の追加
  * さらに多くの改善点 - 完全な [変更ログ](https://github.com/grafana/clickhouse-datasource/blob/main/CHANGELOG.md#400)を確認してください。
* データベーススキーマ管理ツール
  * [Flyway に ClickHouse サポートが追加されました](https://github.com/flyway/flyway-community-db-support/packages/2037428)
  * [Ariga Atlas に ClickHouse サポートが追加されました](https://atlasgo.io/blog/2023/12/19/atlas-v-0-16#clickhouse-beta-program)
* Kafka Connector Sink
  * デフォルト値を持つテーブルへの取り込みを最適化しました。
  * DateTime64 における文字列ベースの日付のサポートが追加されました。
* Metabase
  * 複数のデータベースへの接続のサポートが追加されました。
## 2024年1月18日 {#january-18-2024}

このリリースは、AWS の新しいリージョン（ロンドン / eu-west-2）を追加し、Redpanda、Upstash、Warpstream に対する ClickPipes のサポートを追加し、[is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted) コアデータベース機能の信頼性を改善します。
### 一般的な変更 {#general-changes}
- 新しい AWS リージョン: ロンドン (eu-west-2)
### コンソールの変更 {#console-changes-6}
- Redpanda、Upstash、Warpstream に対する ClickPipes サポートが追加されました。
- ClickPipes 認証メカニズムが UI で構成可能になりました。
### 統合の変更 {#integrations-changes-6}
- Java クライアント:
  - 破壊的変更: 呼び出し時にランダムな URL ハンドルを指定する機能が削除されました。この機能は ClickHouse から削除されました。
  - 非推奨: Java CLI クライアントおよび GRPC パッケージ
  - ClickHouse インスタンスへのバッチサイズおよび負荷を減らすために RowBinaryWithDefaults 形式をサポート
  - Date32 および DateTime64 の範囲境界を ClickHouse と互換性のあるものにし、Spark Array 文字列型との互換性を持たせました。
- Kafka Connector: Grafana 向けの JMX 監視ダッシュボードが追加されました。
- PowerBI: ODBC ドライバー設定が UI で構成可能になりました。
- JavaScript クライアント: クエリの要約情報を公開し、挿入のために特定のカラムのサブセットを提供できるようにし、Web クライアントの keep_alive を構成可能にしました。
- Python クライアント: SQLAlchemy に対する Nothing 型のサポートが追加されました。
### 信頼性の変更 {#reliability-changes}
- ユーザー側の逆互換性のある変更: 以前は、2 つの機能 ([is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted) および ``OPTIMIZE CLEANUP``) が特定の条件下で ClickHouse のデータの破損を引き起こす可能性がありました。ユーザーのデータの整合性を守るために、機能のコアを維持しつつ、この機能の動作を調整しました。具体的には、MergeTree 設定の ``clean_deleted_rows`` は現在非推奨となり、もはや効果がないことになりました。``CLEANUP`` キーワードはデフォルトでは許可されていません（使用するには ``allow_experimental_replacing_merge_with_cleanup`` を有効にする必要があります）。``CLEANUP`` を使用することを決定した場合は、常に ``FINAL`` と一緒に使用されることを確認する必要があり、``OPTIMIZE FINAL CLEANUP`` を実行した後に古いバージョンを持つ行が挿入されないことを保証しなければなりません。
## 2023年12月18日 {#december-18-2023}

このリリースは、GCP の新しいリージョン（us-east1）、セキュアなエンドポイント接続の自己サービス機能、DBT 1.7 を含む追加の統合サポート、数多くのバグ修正およびセキュリティ強化を提供します。
### 一般的な変更 {#general-changes-1}
- ClickHouse Cloud は、GCP us-east1 (サウスカロライナ) リージョンで利用可能になりました。
- OpenAPI を介して AWS Private Link および GCP Private Service Connect を設定する機能が有効になりました。
### コンソールの変更 {#console-changes-7}
- 開発者ロールを持つユーザー向けの SQL コンソールへのシームレスなログインが可能になりました。
- オンボーディング中のアイドル制御の設定のワークフローが簡素化されました。
### 統合の変更 {#integrations-changes-7}
- DBT コネクタ: DBT の v1.7 までのサポートが追加されました。
- Metabase: Metabase v0.48 へのサポートが追加されました。
- PowerBI Connector: PowerBI Cloud での実行機能が追加されました。
- ClickPipes 内部ユーザーの権限を構成可能にしました。
- Kafka Connect
  - Nullable 型の重複排除ロジックと取り込みを改善しました。
  - テキストベースのフォーマット (CSV、TSV) のサポートが追加されました。
- Apache Beam: Boolean および LowCardinality 型のサポートが追加されました。
- Nodejs クライアント: Parquet 形式のサポートが追加されました。
### セキュリティのお知らせ {#security-announcements}
- 3 つのセキュリティ脆弱性が修正されました - 詳細は [セキュリティ変更ログ](/whats-new/security-changelog) を参照してください:
  - CVE 2023-47118 (CVSS 7.0) - デフォルトでポート 9000/tcp で実行されているネイティブインターフェースに影響を与えるヒープバッファオーバーフローの脆弱性
  - CVE-2023-48704 (CVSS 7.0) - デフォルトでポート 9000/tcp で実行されているネイティブインターフェースに影響を与えるヒープバッファオーバーフローの脆弱性
  - CVE 2023-48298 (CVSS 5.9) - FPC 圧縮コーデックの整数アンダーフローの脆弱性
## 2023年11月22日 {#november-22-2023}

このリリースは、コアデータベースバージョンをアップグレードし、ログインおよび認証フローを改善し、Kafka Connect Sink にプロキシサポートを追加します。
### ClickHouse バージョンアップグレード {#clickhouse-version-upgrade-2}

- Parquet ファイルの読み取りパフォーマンスが劇的に改善されました。詳細は [23.8 リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-08) を参照してください。
- JSON の型推論サポートが追加されました。詳細は [23.9 リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-09) を参照してください。
- `ArrayFold` のような強力なアナリスト向け関数が導入されました。詳細は [23.10 リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-10) を参照してください。
- **ユーザー側の逆互換性のある変更**: JSON 形式で文字列から数値を推論するのを避けるために、デフォルトで `input_format_json_try_infer_numbers_from_strings` 設定が無効化されました。これを行うと、サンプルデータに数値に似た文字列が含まれている場合にパースエラーが発生する可能性があります。
- 数十の新機能、パフォーマンス改善、バグ修正が行われました。詳細は [コアデータベースの変更ログ](/whats-new/changelog) を参照してください。
### コンソールの変更 {#console-changes-8}

- ログインおよび認証フローが改善されました。
- 大規模なスキーマをよりよくサポートするために AI ベースのクエリ提案が改善されました。
### 統合の変更 {#integrations-changes-8}

- Kafka Connect Sink: プロキシサポート、`topic-tablename` マッピング、Keeper の _exactly-once_ 配信プロパティの構成可能性が追加されました。
- Node.js クライアント: Parquet 形式のサポートが追加されました。
- Metabase: `datetimeDiff` 関数のサポートが追加されました。
- Python クライアント: カラム名での特殊文字のサポートが追加されました。タイムゾーンパラメータのバインディングが修正されました。
## 2023年11月2日 {#november-2-2023}

このリリースは、アジアにおける開発サービスのリージョナルサポートを拡大し、顧客管理の暗号化キーに対するキー回転機能を導入し、請求コンソールにおける税金設定の粒度を改善し、サポートされている言語クライアント全体にわたるいくつかのバグ修正を提供します。
### 一般的な更新 {#general-updates-1}
- 開発サービスが AWS の `ap-south-1` (ムンバイ) および `ap-southeast-1` (シンガポール) で利用可能になりました。
- 顧客管理の暗号化キー (CMEK) に対するキー回転のサポートが追加されました。
### コンソールの変更 {#console-changes-9}
- クレジットカードを追加する際に粒度の高い税金設定を構成する機能が追加されました。
### 統合の変更 {#integrations-changes-9}
- MySQL
  - MySQL 経由の Tableau Online および QuickSight のサポートが改善されました。
- Kafka Connector
  - テキストベースのフォーマット (CSV、TSV) のサポートを追加するために新しい StringConverter が導入されました。
  - Bytes および Decimal データ型のサポートが追加されました。
  - 再試行可能な例外を常に再試行されるように調整しました (errors.tolerance=all の場合でも)。
- Node.js クライアント
  - 大規模なデータセットをストリーミングした際の腐敗した結果をもたらす問題を修正しました。
- Python クライアント
  - 大規模な挿入のタイムアウトを修正しました。
  - NumPy/Pandas の Date32 問題を修正しました。
​- Golang クライアント
  - JSON カラムへの空のマップの挿入、圧縮バッファのクリーンアップ、クエリエスケープ、IPv4 および IPv6 のゼロ/nil に対するパニックを修正しました。
  - キャンセルされた挿入に対するウォッチドッグを追加しました。
- DBT
  - テストを伴う分散テーブルのサポートが改善されました。
## 2023年10月19日 {#october-19-2023}

このリリースは、SQL コンソールにおける使いやすさおよびパフォーマンスの改善、Metabase コネクタにおける IP データ型処理の改善、新しい機能を Java および Node.js クライアントに追加します。
### コンソールの変更 {#console-changes-10}
- SQL コンソールの使いやすさが改善されました (例: クエリ実行間でのカラム幅の保持)。
- SQL コンソールのパフォーマンスが改善されました。
### 統合の変更 {#integrations-changes-10}
- Java クライアント:
  - パフォーマンスを向上させ、オープン接続を再利用するためにデフォルトのネットワークライブラリを切り替えました。
  - プロキシのサポートが追加されました。
  - Trust Store を使用してセキュアな接続をサポートする機能が追加されました。
- Node.js クライアント: 挿入クエリの keep-alive 動作を修正しました。
- Metabase: IPv4/IPv6 カラムのシリアライゼーションが修正されました。
## 2023年9月28日 {#september-28-2023}

このリリースは、Kafka、Confluent Cloud、Amazon MSK に対する ClickPipes の一般提供をもたらし、Kafka Connect ClickHouse Sink、IAM ロールを介した Amazon S3 へのセキュアなアクセスの自己サービスワークフロー、AI 支援のクエリ提案 (プライベートプレビュー) を追加します。
### コンソールの変更 {#console-changes-11}
- IAM ロールを介して [Amazon S3 へのアクセスをセキュリティするための自己サービスワークフロー](/cloud/security/secure-s3) が追加されました。
- プライベートプレビューで AI 支援のクエリ提案が導入されました (試してみるには、[ClickHouse Cloud サポート](https://console.clickhouse.cloud/support) にお問い合わせください！)。
### 統合の変更 {#integrations-changes-11}
- ClickPipes の一般提供が発表されました - Kafka、Confluent Cloud、Amazon MSK に対するターンキーのデータ取り込みサービス (詳細は [リリースブログ](https://clickhouse.com/blog/clickpipes-is-generally-available) を参照)。
- Kafka Connect ClickHouse Sink の一般提供が達成されました。
  - `clickhouse.settings` プロパティを使用したカスタマイズされた ClickHouse 設定のサポートが拡張されました。
  - 動的フィールドを考慮した重複排除動作が改善されました。
  - ClickHouse からのテーブル変更を再取得するための `tableRefreshInterval` のサポートが追加されました。
- SSL 接続の問題および [PowerBI](/integrations/powerbi) と ClickHouse データ型間の型マッピングが修正されました。
## 2023年9月7日 {#september-7-2023}

このリリースでは、PowerBI Desktop 公式コネクタのベータ版リリース、インドにおけるクレジットカード決済処理の改善、およびサポートされている言語クライアント全体の複数の改善が行われます。
### コンソールの変更 {#console-changes-12}
- インドからの請求をサポートするために、残額および支払い再試行が追加されました。
### 統合の変更 {#integrations-changes-12}
- Kafka Connector: ClickHouse 設定の構成、および error.tolerance 構成オプションの追加がサポートされました。
- PowerBI Desktop: 公式コネクタのベータ版がリリースされました。
- Grafana: Point geo type のサポートが追加され、Data Analyst ダッシュボードの Panels が修正され、timeInterval マクロが修正されました。
- Python クライアント: Pandas 2.1.0 との互換性があり、Python 3.7 のサポートが打ち切られました。Nullable JSON 形式のサポートが追加されました。
- Node.js クライアント: default_format 設定のサポートが追加されました。
- Golang クライアント: bool 型の処理が修正され、文字列制限が削除されました。
## 2023年8月24日 {#aug-24-2023}

このリリースでは、ClickHouse データベースへの MySQL インターフェースのサポートを追加し、新しい公式 PowerBI コネクタを導入し、クラウドコンソールに新しい "Running Queries" ビューを追加し、ClickHouse バージョンを 23.7 に更新します。
### 一般的な更新 {#general-updates-2}
- [MySQL ワイヤプロトコル](/interfaces/mysql) のサポートが追加されました。このプロトコルにより、多くの既存の BI ツールとの互換性が実現します。この機能を組織のために有効化するには、サポートに連絡してください。
- 新しい公式 PowerBI コネクタが導入されました。
### コンソールの変更 {#console-changes-13}
- SQL コンソールに "Running Queries" ビューのサポートが追加されました。
### ClickHouse 23.7 バージョンアップグレード {#clickhouse-237-version-upgrade}
- Azure Table 機能のサポートが追加され、地理データ型が生産準備が整い、結合パフォーマンスが向上しました - 詳細は 23.5 リリース [ブログ](https://clickhouse.com/blog/clickhouse-release-23-05) を参照してください。
- MongoDB 統合サポートがバージョン 6.0 に拡張されました - 詳細は 23.6 リリース [ブログ](https://clickhouse.com/blog/clickhouse-release-23-06) を参照してください。
- Parquet 形式への書き込み性能が 6 倍向上し、PRQL クエリ言語がサポートされ、SQL 互換性が向上しました - 詳細は 23.7 リリース [デッキ](https://presentations.clickhouse.com/release_23.7/) を参照してください。
- 数十の新機能、パフォーマンス改善、バグ修正が行われました - 詳細な [変更ログ](/whats-new/changelog) は 23.5、23.6、23.7 を参照してください。
### 統合の変更 {#integrations-changes-13}
- Kafka Connector: Avro Date および Time 型のサポートが追加されました。
- JavaScript クライアント: ウェブベースの環境での安定版がリリースされました。
- Grafana: フィルターロジック、データベース名の処理が改善され、サブ秒精度を持つ TimeInterval のサポートが追加されました。
- Golang クライアント: バッチおよび非同期データロードの問題がいくつか修正されました。
- Metabase: v0.47 をサポートし、接続の偽装が追加され、データ型のマッピングが修正されました。
## 2023年7月27日 {#july-27-2023}

このリリースでは、Kafka 用の ClickPipes のプライベートプレビュー、新しいデータロード体験、クラウドコンソールを使用して URL からファイルをロードする機能が追加されます。
### 統合の変更 {#integrations-changes-14}
- Kafka 用の [ClickPipes](https://clickhouse.com/cloud/clickpipes) のプライベートプレビューが導入されました。これは、Kafka および Confluent Cloud からの大量のデータを簡単に取り込むことができるクラウドネイティブな統合エンジンです。待機リストにサインアップするには [こちら](https://clickhouse.com/cloud/clickpipes#joinwaitlist) をクリックしてください。
- JavaScript クライアント: ウェブベースの環境 (ブラウザ、Cloudflare ワーカー) 向けにサポートをリリースしました。コードは、コミュニティがカスタム環境用コネクタを作成できるようにリファクタリングされました。
- Kafka Connector: Timestamp および Time Kafka 型のインラインスキーマのサポートが追加されました。
- Python クライアント: 挿入圧縮および LowCardinality の読み取りの問題が修正されました。
### コンソールの変更 {#console-changes-14}
- より多くのテーブル作成構成オプションを持つ新しいデータロード体験が追加されました。
- クラウドコンソールを使用して URL からファイルをロードする機能が導入されました。
- 異なる組織に参加するための追加オプションや、すべての未解決の招待状を見るためのオプションを持つ招待フローが改善されました。
## 2023年7月14日 {#july-14-2023}

このリリースでは、専用サービスを立ち上げる機能、新しい AWS リージョン（オーストラリア）、およびディスク上のデータを暗号化するための独自のキーを持つことができるようになります。
### 一般的な更新 {#general-updates-3}
- 新しい AWS オーストラリアリージョン: シドニー (ap-southeast-2)
- 要求の厳しいレイテンシーセンサーなワークロード向けの専用サービス tier (セットアップするには [サポート](https://console.clickhouse.cloud/support) に連絡してください)
- ディスク上のデータを暗号化するための独自のキー (BYOK) を持つことができる (セットアップするには [サポート](https://console.clickhouse.cloud/support) に連絡してください)
### コンソールの変更 {#console-changes-15}
- 非同期挿入の監視メトリクスダッシュボードへの改善
- サポートとの統合のためのチャットボットの行動が改善されました。
### 統合の変更 {#integrations-changes-15}
- NodeJS クライアント: ソケットタイムアウトによる接続失敗に関するバグが修正されました。
- Python クライアント: 挿入クエリに QuerySummary を追加し、データベース名の特殊文字をサポートする機能が追加されました。
- Metabase: JDBC ドライバーのバージョンが更新され、DateTime64 サポートが追加され、パフォーマンス改善が行われました。
### コアデータベースの変更 {#core-database-changes}
- [クエリキャッシュ](/operations/query-cache) を ClickHouse Cloud で有効にすることができます。有効にすると、成功したクエリはデフォルトで 1 分間キャッシュされ、その後のクエリはキャッシュされた結果を使用します。
## 2023年6月20日 {#june-20-2023}

このリリースでは、ClickHouse Cloud が GCP で一般提供され、Cloud API 用の Terraform プロバイダが追加され、ClickHouse バージョンが 23.4 に更新されます。
### 一般的な更新 {#general-updates-4}
- ClickHouse Cloud が GCP で GA となり、GCP Marketplace 統合、Private Service Connect のサポート、自動バックアップが提供されます (詳細は [ブログ](https://clickhouse.com/blog/clickhouse-cloud-on-google-cloud-platform-gcp-is-generally-available) および [プレスリリース](https://clickhouse.com/blog/clickhouse-cloud-expands-choice-with-launch-on-google-cloud-platform) をご覧ください)
- Cloud API 用の [Terraform プロバイダー](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) が利用可能になりました。
### コンソールの変更 {#console-changes-16}
- サービスの新しい統合設定ページが追加されました。
- ストレージとコンピューティングのメーター精度が調整されました。
### 統合の変更 {#integrations-changes-16}
- Python クライアント: 挿入パフォーマンスが改善され、内部依存関係がリファクタリングされ、マルチプロセッシングがサポートされました。
- Kafka Connector: Confluent Cloud にアップロードしてインストールすることができ、接続の問題中に再試行が追加され、不正なコネクタ状態を自動的にリセットしました。
### ClickHouse 23.4 バージョンアップグレード {#clickhouse-234-version-upgrade}
- 平行レプリカ向けの JOIN サポートが追加されました (セットアップするには [サポート](https://console.clickhouse.cloud/support) に連絡してください)。
- 論理削除のパフォーマンスが向上しました。
- 大規模な挿入処理中のキャッシングが改善されました。
### 管理の変更 {#administration-changes-1}
- "default" ではないユーザー向けのローカルディクショナリ作成が拡張されました。
## 2023年5月30日 {#may-30-2023}

このリリースでは、ClickHouse Cloud のコントロールプレーン操作のためのプログラマティック API の一般公開 (詳細は [ブログ](https://clickhouse.com/blog/using-the-new-clickhouse-cloud-api-to-automate-deployments) を参照してください)、IAM ロールを使用した S3 アクセス、および追加のスケーリングオプションを提供します。
### 一般的な変更 {#general-changes-2}
- ClickHouse Cloud 用の API サポート。新しい Cloud API により、既存の CI/CD パイプラインでサービスの管理をシームレスに統合し、サービスをプログラム的に管理できます。
- IAM ロールを使用した S3 アクセス。IAM ロールを利用して、プライベートな Amazon Simple Storage Service (S3) バケットに安全にアクセスできるようになりました (セットアップするにはサポートに連絡してください)。
### スケーリングの変更 {#scaling-changes}
- [水平スケーリング](/manage/scaling#manual-horizontal-scaling)。より多くの並列化を必要とするワークロードは、最大 10 レプリカまで構成することができるようになりました (セットアップするにはサポートに連絡してください)。
- [CPU ベースのオートスケーリング](/manage/scaling)。CPU に依存するワークロードは、オートスケーリングポリシーのための追加のトリガーの恩恵を受けることができます。
### コンソールの変更 {#console-changes-17}
- Dev サービスを Production サービスに移行する機能を追加 (有効にするにはサポートに連絡してください)。
- インスタンス作成フロー中にスケーリング構成制御を追加しました。
- メモリにデフォルトパスワードが存在しない場合の接続文字列を修正しました。
### 統合の変更 {#integrations-changes-17}
- Golang クライアント: ネイティブプロトコルでの接続の不均衡につながる問題が修正され、ネイティブプロトコルでのカスタム設定のサポートが追加されました。
- Nodejs クライアント: nodejs v14 のサポートが中止され、v20 のサポートが追加されました。
- Kafka Connector: LowCardinality 型のサポートが追加されました。
- Metabase: 時間範囲でのグループ化の修正、メタベースの質問での整数のサポートの改善が行われました。
### パフォーマンスと信頼性 {#performance-and-reliability}
- 書き込みに重いワークロードの効率とパフォーマンスが改善されました。
- バックアップの速度と効率を向上させるために増分バックアップ戦略が導入されました。
## 2023年5月11日 {#may-11-2023}

このリリースは、GCP 上の ClickHouse Cloud の ~~パブリックベータ~~ (現在 GA、上記の 6 月 20 日のエントリーを参照) のための一般公開 (詳細は [ブログ](https://clickhouse.com/blog/clickhouse-cloud-on-gcp-available-in-public-beta) を参照) をもたらし、クエリの権限を終了する管理者権限を拡張し、Cloud コンソールにおける MFA ユーザーのステータスへのより良い可視性を追加します。
### ClickHouse Cloud on GCP ~~(パブリックベータ)~~ (現在 GA、上記の 6 月 20 日のエントリーを参照) {#clickhouse-cloud-on-gcp-public-beta-now-ga-see-june-20th-entry-above}
- 完全に管理された分離されたストレージとコンピューティングの ClickHouse 提供を立ち上げ、Google Compute と Google Cloud Storage 上で実行されます。
- アイオワ (us-central1)、オランダ (europe-west4)、シンガポール (asia-southeast1) リージョンで利用可能。
- 3 つの初期リージョンで開発サービスと本番サービスの両方をサポートします。
- デフォルトで強力なセキュリティを提供: 転送中のエンドツーエンドの暗号化、静止データの暗号化、IP アロウリスト。
### 統合の変更 {#integrations-changes-18}
- Golang クライアント: プロキシ環境変数のサポートが追加されました。
- Grafana: ClickHouse カスタム設定および Grafana データソースセットアップでのプロキシ環境変数の指定機能が追加されました。
- Kafka Connector: 空のレコードの処理が改善されました。
### コンソールの変更 {#console-changes-18}
- ユーザーリストにおける多要素認証 (MFA) の使用状況を示すインジケーターが追加されました。
### パフォーマンスと信頼性 {#performance-and-reliability-1}
- 管理者用のクエリ終了権限に対するより粒度の高い制御が追加されました。
## 2023年5月4日 {#may-4-2023}

このリリースは、新しいヒートマップチャートタイプを追加し、請求使用ページを改善し、サービスの起動時間を改善します。
### コンソールの変更 {#console-changes-19}
- SQL コンソールにヒートマップチャートタイプを追加しました。
- 各請求寸法における消費されたクレジットを表示するために請求使用ページが改善されました。
### 統合の変更 {#integrations-changes-19}
- Kafka コネクタ: 一時的な接続エラーのための再試行メカニズムが追加されました。
- Python クライアント: HTTP 接続が再利用されないように max_connection_age 設定が追加されました。これは、特定の負荷分散の問題に対処するのに役立ちます。
- Node.js クライアント: Node.js v20 のサポートが追加されました。
- Java クライアント: クライアント証明書認証のサポートが改善され、入れ子の Tuple/Map/ネストされた型のサポートが追加されました。
### パフォーマンスと信頼性 {#performance-and-reliability-2}
- 大量のパーツが存在する場合のサービスの起動時間が改善されました。
- SQL コンソールにおける長時間実行されるクエリのキャンセロジックが最適化されました。
### バグ修正 {#bug-fixes}
- 'Cell Towers' サンプルデータセットのインポートが失敗する原因となるバグが修正されました。
## 2023年4月20日 {#april-20-2023}

このリリースでは、ClickHouse バージョンが 23.3 に更新され、コールドリードの速度が大幅に改善され、サポートとのリアルタイムチャットが提供されています。
### コンソールの変更 {#console-changes-20}
- サポートとのリアルタイムチャットオプションが追加されました。
### 統合の変更 {#integrations-changes-20}
- Kafka コネクタ: Nullable 型のサポートが追加されました。
- Golang クライアント: 外部テーブルのサポートが追加され、boolean およびポインタ型パラメータのバインディングが改善されました。
### 設定の変更 {#configuration-changes}
- 大規模なテーブルを削除する機能が追加されました - `max_table_size_to_drop` および `max_partition_size_to_drop` 設定をオーバーライドします。
### パフォーマンスと信頼性 {#performance-and-reliability-3}
- S3 プリフェッチを利用してコールドリードの速度を向上させる設定を追加しました: `allow_prefetched_read_pool_for_remote_filesystem`。
### ClickHouse 23.3 バージョンアップグレード {#clickhouse-233-version-upgrade}
- 論理削除は生産準備が整いました - 詳細は 23.3 リリース [ブログ](https://clickhouse.com/blog/clickhouse-release-23-03) を参照ください。
- マルチステージ PREWHERE のサポートが追加されました - 詳細は 23.2 リリース [ブログ](https://clickhouse.com/blog/clickhouse-release-23-03) を参照してください。
- 数十の新機能、パフォーマンス改善、バグ修正が行われました - 詳細な [変更ログ](/whats-new/changelog/index.md) を 23.3 および 23.2 と共にご覧ください。
## 2023年4月6日 {#april-6-2023}

このリリースは、クラウドエンドポイントを取得するための API、最小アイドルタイムアウトのための高度なスケーリング制御、および Python クライアントのクエリメソッドでの外部データのサポートをもたらします。
### API の変更 {#api-changes}
* [Cloud Endpoints API](//cloud/get-started/query-endpoints.md) を介して ClickHouse Cloud エンドポイントをプログラムでクエリする機能が追加されました。
### コンソールの変更 {#console-changes-21}
- 高度なスケーリング設定に「最小アイドルタイムアウト」設定が追加されました。
- データ読み込みモーダルでのスキーマ推論に最善を尽くす日付時刻の検出が追加されました。
### 統合の変更 {#integrations-changes-21}
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): 複数スキーマのサポートが追加されました。
- [Go クライアント](/integrations/language-clients/go/index.md): TLS 接続のアイドル接続生存性検査が修正されました。
- [Python クライアント](/integrations/language-clients/python/index.md)
  - クエリメソッドに外部データのサポートが追加されました。
  - クエリ結果に対するタイムゾーンサポートが追加されました。
  - `no_proxy`/`NO_PROXY` 環境変数のサポートが追加されました。
  - Nullable 型に対する NULL 値のサーバー側パラメータバインディングが修正されました。
### バグ修正 {#bug-fixes-1}
* SQL コンソールから `INSERT INTO ... SELECT ...` を実行すると、SELECT クエリと同じ行制限が適用されるという動作が修正されました。
## 2023年3月23日 {#march-23-2023}

このリリースでは、データベースパスワードの複雑さルール、大規模バックアップの復元速度の大幅な向上、Grafana トレースビューでのトレースの表示に対するサポートを追加します。
### セキュリティと信頼性 {#security-and-reliability}
- コアデータベースエンドポイントは、パスワードの複雑さルールを強制します。
- 大規模バックアップの復元時間が改善されました。
### コンソールの変更 {#console-changes-22}
- オンボーディングフローが簡素化され、新しいデフォルトとよりコンパクトなビューが導入されました。
- サインアップおよびサインインの待機時間が短縮されました。
### 統合の変更 {#integrations-changes-22}
- Grafana:
  - ClickHouse に保存されたトレースデータをトレースビューで表示するサポートが追加されました。
  - 時間範囲フィルターが改善され、テーブル名に特殊文字のサポートが追加されました。
- Superset: ClickHouse のネイティブサポートが追加されました。
- Kafka Connect Sink: 自動日付変換と Null カラム処理が追加されました。
- Metabase: 一時テーブルへの挿入が修正され、Pandas Null のサポートが追加されました。
- Golang クライアント: タイムゾーンを持つ Date 型が正規化されました。
- Java クライアント
  - 圧縮、infile、outfile キーワードを SQL パーサーにサポートとして追加しました。
  - 認証情報のオーバーロードが追加されました。
  - `ON CLUSTER` とのバッチサポートが修正されました。
- Node.js クライアント
  - JSONStrings、JSONCompact、JSONCompactStrings、JSONColumnsWithMetadata 形式のサポートが追加されました。
  - `query_id` はすべての主要なクライアントメソッドで提供できるようになりました。
### バグ修正 {#bug-fixes-2}
- 新しいサービスの初期プロビジョニングと起動時間が遅くなる原因となるバグが修正されました。
- キャッシュの誤設定が原因でクエリのパフォーマンスが低下する結果となるバグが修正されました。
## 2023年3月9日 {#march-9-2023}

このリリースでは、可視性ダッシュボードが改善され、大規模バックアップの作成時間を最適化し、大規模テーブルやパーティションを削除するために必要な設定が追加されます。
### コンソールの変更 {#console-changes-23}
- 高度な可視性ダッシュボード (プレビュー) が追加されました。
- 可視性ダッシュボードにメモリアロケーションチャートが追加されました。
- SQL コンソールのスプレッドシートビューでのスペースおよび改行処理が改善されました。
### 信頼性およびパフォーマンス {#reliability-and-performance}
- バックアップスケジュールを最適化し、データが変更された場合のみバックアップを実行するようにしました。
- 大規模バックアップの完了時間が改善されました。
### 設定の変更 {#configuration-changes-1}
- 大規模なテーブルやパーティションを削除するための制限を設定をオーバーライドすることで増加させる機能が追加されました。これには `max_table_size_to_drop` および `max_partition_size_to_drop` 設定が含まれます。
- クエリログにソース IP を追加し、ソース IP に基づいたクォータおよびアクセス制御の強制を可能にしました。
### 統合 {#integrations}
- [Python クライアント](/integrations/language-clients/python/index.md): Pandas サポートが改善され、タイムゾーン関連の問題が修正されました。
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): Metabase 0.46.x 互換性および SimpleAggregateFunction のサポートが追加されました。
- [Kafka-Connect](/integrations/data-ingestion/kafka/index.md): 暗黙の日時変換および Null カラムの処理が改善されました。
- [Java クライアント](https://github.com/ClickHouse/clickhouse-java): Java マップへの入れ子の変換が追加されました。
## 2023年2月23日 {#february-23-2023}

このリリースでは、ClickHouse 23.1 のコアリリースのサブセットの機能が有効になり、Amazon Managed Streaming for Apache Kafka (MSK) との相互運用性が提供され、アクティビティログに高度なスケーリングおよびアイドル調整が公開されます。
### ClickHouse 23.1 バージョンアップグレード {#clickhouse-231-version-upgrade}

ClickHouse 23.1 の機能のサブセットを追加します。たとえば:
- Map 型を使用した ARRAY JOIN
- SQL 標準の16進およびバイナリリテラル
- `age()`、`quantileInterpolatedWeighted()`、`quantilesInterpolatedWeighted()` などの新機能
- 引数なしで `generateRandom` に挿入テーブルからの構造を使用する機能
- 以前の名前の再利用を可能にするデータベース作成および名前変更ロジックの改善
- より詳細については 23.1 リリース [ウェビナー スライド](https://presentations.clickhouse.com/release_23.1/#cover) および [23.1 リリース変更ログ](/whats-new/cloud#clickhouse-231-version-upgrade) を参照してください。
### Integrations changes {#integrations-changes-23}
- [Kafka-Connect](/integrations/data-ingestion/kafka/index.md): Amazon MSKのサポートを追加
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): 初の安定リリース1.0.0
  - [Metabase Cloud](https://www.metabase.com/start/)でコネクタが利用可能に
  - 利用可能なすべてのデータベースを探索する機能を追加
  - AggregationFunctionタイプのデータベースの同期を修正
- [DBT-clickhouse](/integrations/data-ingestion/etl-tools/dbt/index.md): 最新のDBTバージョンv1.4.1のサポートを追加
- [Python client](/integrations/language-clients/python/index.md): プロキシとSSHトンネリングのサポートを改善; Pandas DataFramesのためにいくつかの修正とパフォーマンス最適化を追加
- [Nodejs client](/integrations/language-clients/js.md): クエリ結果に`query_id`を添付する機能をリリースし、これを使用して`system.query_log`からクエリメトリクスを取得可能に
- [Golang client](/integrations/language-clients/go/index.md): ClickHouse Cloudとのネットワーク接続を最適化
### Console changes {#console-changes-24}
- アクティビティログに高度なスケーリングとアイドリング設定調整を追加
- パスワードリセットメールにユーザーエージェントとIP情報を追加
- Google OAuthのサインアップフローメカニズムを改善
### Reliability and performance {#reliability-and-performance-1}
- 大規模サービスのアイドルから再開する際の時間を短縮
- 大量のテーブルとパーティションを持つサービスの読み取りレイテンシを改善
### Bug fixes {#bug-fixes-3}
- サービスパスワードリセットがパスワードポリシーに従わない動作を修正
- 組織招待メールの検証を大文字小文字を区別しないように変更
## February 2, 2023 {#february-2-2023}

このリリースは公式にサポートされたMetabase統合、主要なJavaクライアント/JDBCドライバーリリース、およびSQLコンソールでのビューとMaterialized Viewのサポートをもたらします。
### Integrations changes {#integrations-changes-24}
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md)プラグイン: ClickHouseによって維持される公式ソリューションになりました
- [dbt](/integrations/data-ingestion/etl-tools/dbt/index.md)プラグイン: [複数スレッド](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md)のサポートを追加
- [Grafana](/integrations/data-visualization/grafana/index.md)プラグイン: 接続エラーの処理が改善されました
- [Python](/integrations/language-clients/python/index.md)クライアント: 挿入操作のための[ストリーミングサポート](/integrations/language-clients/python/index.md#streaming-queries)
- [Go](/integrations/language-clients/go/index.md)クライアント: [バグ修正](https://github.com/ClickHouse/clickhouse-go/blob/main/CHANGELOG.md): キャンセルされた接続を閉じ、接続エラーの処理を改善
- [JS](/integrations/language-clients/js.md)クライアント: [exec/insertの破壊的変更](https://github.com/ClickHouse/clickhouse-js/releases/tag/0.0.12); 戻り値の型でquery_idを公開
- [Java](https://github.com/ClickHouse/clickhouse-java#readme)クライアント/JDBCドライバーのメジャーリリース
  - [破壊的変更](https://github.com/ClickHouse/clickhouse-java/releases): 非推奨のメソッド、クラス、パッケージが削除されました
  - R2DBCドライバーとファイル挿入のサポートを追加
### Console changes {#console-changes-25}
- SQLコンソールでのビューとMaterialized Viewのサポートを追加
### Performance and reliability {#performance-and-reliability-4}
- 停止中/アイドル状態のインスタンスのパスワードリセットを迅速化
- より正確なアクティビティトラッキングによるスケールダウンの動作を改善
- SQLコンソールのCSVエクスポートがトリミングされるバグを修正
- インターミッテントなサンプルデータアップロードの失敗を引き起こすバグを修正
## January 12, 2023 {#january-12-2023}

このリリースはClickHouseバージョンを22.12に更新し、多くの新しいソースのための辞書を有効にし、クエリパフォーマンスを改善します。
### General changes {#general-changes-3}
- 外部ClickHouse、Cassandra、MongoDB、MySQL、PostgreSQL、Redisを含む追加のソースのために辞書を有効にしました
### ClickHouse 22.12 version upgrade {#clickhouse-2212-version-upgrade}
- JOINサポートをGrace Hash Joinを含むまで拡張
- ファイルを読み込むためのBinary JSON (BSON)サポートを追加
- GROUP BY ALL標準SQL構文のサポートを追加
- 固定精度での小数演算のための新しい数学関数
- 完全な変更リストについては[22.12リリースブログ](https://clickhouse.com/blog/clickhouse-release-22-12)と[詳細な22.12変更ログ](/whats-new/cloud#clickhouse-2212-version-upgrade)を参照してください
### Console changes {#console-changes-26}
- SQLコンソールのオートコンプリート機能を改善
- デフォルトのリージョンが大陸のローカリティを考慮に入れるようになりました
- 課金使用状況ページを改善し、請求ユニットとウェブサイトユニットの両方を表示
### Integrations changes {#integrations-changes-25}
- DBTリリース[v1.3.2](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md#release-132-2022-12-23)
  - delete+insertインクリメンタル戦略の実験的サポートを追加
  - 新しいs3sourceマクロ
- Python client[v0.4.8](https://github.com/ClickHouse/clickhouse-connect/blob/main/CHANGELOG.md#048-2023-01-02)
  - ファイル挿入のサポート
  - サーバー側クエリ[パラメータバインディング](/interfaces/cli.md/#cli-queries-with-parameters)
- Go client[v2.5.0](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.5.0)
  - 圧縮のためのメモリ使用量を削減
  - サーバー側クエリ[パラメータバインディング](/interfaces/cli.md/#cli-queries-with-parameters)
### Reliability and performance {#reliability-and-performance-2}
- オブジェクトストアで多数の小ファイルを取得するクエリの読み取りパフォーマンスを改善
- 新たに立ち上げるサービスに対して、サービスが最初に起動されたバージョンに対する[互換性](/operations/settings/settings#compatibility)設定を設定
### Bug fixes {#bug-fixes-4}
- 高度なスケーリングスライダーを使用してリソースを予約することが即時に効果を持つようになりました。
## December 20, 2022 {#december-20-2022}

このリリースは管理者がSQLコンソールにシームレスにログインできるようにし、コールドリードの読み取りパフォーマンスを改善し、ClickHouse Cloud用のMetabaseコネクタを改善します。
### Console changes {#console-changes-27}
- 管理者ユーザーに対してSQLコンソールへのシームレスアクセスを有効に
- 新しい招待者に対するデフォルトの役割を「管理者」に変更
- オンボーディングサーベイを追加
### Reliability and performance {#reliability-and-performance-3}
- ネットワーク障害が発生した場合にリカバリーするために、長時間実行される挿入クエリのための再試行ロジックを追加
- コールドリードの読み取りパフォーマンスを改善
### Integrations changes {#integrations-changes-26}
- [Metabaseプラグイン](/integrations/data-visualization/metabase-and-clickhouse.md)が長らく待たれたv0.9.1のメジャーアップデートを受けました。最新のMetabaseバージョンと互換性があり、ClickHouse Cloudに対して十分にテストされています。
## December 6, 2022 - General Availability {#december-6-2022---general-availability}

ClickHouse Cloudは、SOC2タイプIIのコンプライアンス、プロダクションワークロードの稼働時間SLA、および公開ステータスページをもって生産準備が整いました。このリリースには、AWS Marketplace統合、ClickHouseユーザーのためのデータ探索ワークベンチであるSQLコンソール、およびClickHouse Cloudでのセルフペースの学習を提供するClickHouse Academyなどの新しい大きな機能が含まれています。この[ブログ](https://clickhouse.com/blog/clickhouse-cloud-generally-available)で詳細を確認してください。
### Production-ready {#production-ready}
- SOC2タイプIIのコンプライアンス (詳細は[ブログ](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant)と[Trust Center](https://trust.clickhouse.com/)を参照)
- ClickHouse Cloud用の公開[ステータスページ](https://status.clickhouse.com/)
- プロダクションのユースケース向けの稼働時間SLAを提供
- [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc)での利用可能性
### Major new capabilities {#major-new-capabilities}
- ClickHouseユーザーのためのデータ探索ワークベンチであるSQLコンソールを導入
- 自己学習型ClickHouse Cloudである[ClickHouse Academy](https://learn.clickhouse.com/visitor_class_catalog)を開始
### Pricing and metering changes {#pricing-and-metering-changes}
- 試用期間を30日間に延長
- スタータープロジェクトや開発/ステージング環境に適した固定容量、低月額の開発サービスを導入
- ClickHouse Cloudの運用とスケーリングの改善に伴うプロダクションサービスの新たな低価格を導入
- コンピュートの計測精度と信頼性を改善
### Integrations changes {#integrations-changes-27}
- ClickHouse Postgres / MySQL統合エンジンのサポートを有効化
- SQLユーザー定義関数 (UDF) のサポートを追加
- 高度なKafka Connectシンクをベータステータスに
- バージョン、更新状況などのリッチなメタデータを導入し、統合UIを改善
### Console changes {#console-changes-28}

- クラウドコンソールでの多要素認証サポート
- モバイルデバイス向けのクラウドコンソールナビゲーションを改善
### Documentation changes {#documentation-changes}

- ClickHouse Cloud専用の[ドキュメント](/cloud/overview)セクションを導入
### Bug fixes {#bug-fixes-5}
- バックアップからの復元が依存関係の解決により常に成功しない既知の問題に対処しました
## November 29, 2022 {#november-29-2022}

このリリースはSOC2タイプIIコンプライアンスを達成し、ClickHouseバージョンを22.11に更新し、いくつかのClickHouseクライアントと統合を改善します。
### General changes {#general-changes-4}

- SOC2タイプIIコンプライアンスを達成 (詳細は[ブログ](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant)と[Trust Center](https://trust.clickhouse.com)を参照)
### Console changes {#console-changes-29}

- サービスが自動的に一時停止されていることを示す「アイドル」ステータスインジケーターを追加
### ClickHouse 22.11 version upgrade {#clickhouse-2211-version-upgrade}

- HudiおよびDeltaLakeテーブルエンジンとテーブル関数のサポートを追加
- S3に対する再帰的なディレクトリトラバースを改善
- 複合時間間隔構文のサポートを追加
- 挿入時の信頼性を改善
- 完全な変更リストについては[詳細な22.11変更ログ](/whats-new/cloud#clickhouse-2211-version-upgrade)を参照してください
### Integrations {#integrations-1}

- Python client: v3.11サポート、挿入パフォーマンスの改善
- Go client: DateTimeおよびInt64のサポートを修正
- JS client: 相互SSL認証のサポート
- dbt-clickhouse: DBT v1.3のサポート
### Bug fixes {#bug-fixes-6}

- アップグレード後に古いClickHouseバージョンが表示されるバグを修正
- 「default」アカウントの権限を変更してもセッションが中断されないように
- 新たに作成された非管理者アカウントはデフォルトでシステムテーブルアクセスが無効に
### Known issues in this release {#known-issues-in-this-release}

- バックアップからの復元が依存関係の解決により機能しない場合がある
## November 17, 2022 {#november-17-2022}

このリリースはローカルClickHouseテーブルおよびHTTPソースからの辞書を有効にし、ムンバイ地域のサポートを導入し、クラウドコンソールのユーザーエクスペリエンスを改善します。
### General changes {#general-changes-5}

- ローカルClickHouseテーブルおよびHTTPソースからの[dictionaries](/sql-reference/dictionaries/index.md)のサポートを追加
- ムンバイ[地域](/cloud/reference/supported-regions.md)のサポートを導入
### Console changes {#console-changes-30}

- 請求書のフォーマットを改善
- 支払い方法の取り込みのためのユーザーインターフェイスを合理化
- バックアップのためのより詳細なアクティビティロギングを追加
- ファイルアップロード中のエラーハンドリングを改善
### Bug fixes {#bug-fixes-7}
- 一部のパーツに単一の大きなファイルがある場合にバックアップが失敗する可能性のあるバグを修正
- アクセスリストの変更が同時に適用された場合にバックアップからの復元が成功しないバグを修正
### Known issues {#known-issues}
- バックアップからの復元が依存関係の解決により機能しない場合があります
## November 3, 2022 {#november-3-2022}

このリリースは、価格から読み取りおよび書き込みユニットを削除し（詳細は[料金ページ](https://clickhouse.com/pricing)を参照）、ClickHouseバージョンを22.10に更新し、セルフサービス顧客向けのより高い垂直スケーリングをサポートし、より良いデフォルトにより信頼性を向上させます。
### General changes {#general-changes-6}

- 価格モデルから読み取り/書き込みユニットを削除
### Configuration changes {#configuration-changes-2}

- `allow_suspicious_low_cardinality_types`、`allow_suspicious_fixed_string_types`、`allow_suspicious_codecs`の設定（デフォルトはfalse）は安定性の理由から変更できなくなりました。
### Console changes {#console-changes-31}

- 支払い顧客向けに垂直スケーリングのセルフサービス最大を720GBメモリに増加
- バックアップからの復元ワークフローを改善し、IPアクセスリストのルールおよびパスワードを設定
- サービス作成ダイアログにGCPとAzureの待機リストを紹介
- ファイルアップロード中のエラーハンドリングを改善
- 請求管理のワークフローを改善
### ClickHouse 22.10 version upgrade {#clickhouse-2210-version-upgrade}

- 多数の大きなパーツが存在する場合の「パーツが多すぎる」しきい値を緩和し、オブジェクトストア上のマージを改善しました（少なくとも10 GiB）。これにより、単一のテーブルの単一パーティション内にペタバイト単位のデータが可能になります。
- 一定の時間しきい値を超えた後にマージするために、`min_age_to_force_merge_seconds`設定でのマージの制御を改善。
- 設定をリセットするためにMySQL互換の構文を追加しました `SET setting_name = DEFAULT`。
- モートンカーブエンコーディング、Java整数ハッシュ、乱数生成用の関数を追加しました。
- 完全な変更リストについては[詳細な22.10変更ログ](/whats-new/cloud#clickhouse-2210-version-upgrade)を参照してください。
## October 25, 2022 {#october-25-2022}

このリリースは小さいワークロードの計算消費を大幅に削減し、計算価格を引き下げ（詳細は[料金](https://clickhouse.com/pricing)ページを参照）、より良いデフォルトによる安定性を改善し、ClickHouse Cloudコンソールの請求および使用状況ビューを向上させます。
### General changes {#general-changes-7}

- 最小サービスメモリアロケーションを24Gに削減
- サービスアイドルタイムアウトを30分から5分に削減
### Configuration changes {#configuration-changes-3}

- MergeTreeテーブルの`max_parts_in_total`設定のデフォルト値が100,000から10,000に引き下げられました。この変更の理由は、データパーツが大量にあると、クラウド内のサービスの起動時間が遅くなることが観察されたためです。大量のパーツは通常、誤ってあまりにも細かいパーティションキーを選択したことを示し、これは通常意図せず行われ、避けるべきです。デフォルトの変更により、これらのケースをより早く検出できるようになります。
### Console changes {#console-changes-32}

- 試用ユーザーの請求ビューでのクレジット使用詳細を強化
- ツールチップとヘルプテキストを改善し、使用状況ビューに料金ページへのリンクを追加
- IPフィルタリングオプションを切り替える際のワークフローを改善
- クラウドコンソールに再送信メール確認ボタンを追加
## October 4, 2022 - Beta {#october-4-2022---beta}

ClickHouse Cloudは2022年10月4日にパブリックベータを開始しました。この[ブログ](https://clickhouse.com/blog/clickhouse-cloud-public-beta)で詳細を学んでください。

ClickHouse CloudバージョンはClickHouseコアv22.10に基づいています。互換性のある機能のリストについては、[Cloud Compatibility](/cloud/reference/cloud-compatibility.md)ガイドを参照してください。
