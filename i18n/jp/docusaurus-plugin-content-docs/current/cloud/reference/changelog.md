---
slug: /whats-new/cloud
sidebar_label: Cloud Changelog
title: Cloud Changelog
---

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
import prometheous from '@site/static/images/cloud/reference/june-28-prometheus.png';
import kafka_config from '@site/static/images/cloud/reference/june-13-kafka-config.png';
import fast_releases from '@site/static/images/cloud/reference/june-13-fast-releases.png';
import share_queries from '@site/static/images/cloud/reference/may-30-share-queries.png';
import query_endpoints from '@site/static/images/cloud/reference/may-17-query-endpoints.png';


この ClickHouse Cloud の変更履歴に加えて、[Cloud Compatibility](/cloud/reference/cloud-compatibility.md) ページもご覧ください。
## 2025年2月21日 {#february-21-2025}
### ClickHouse Bring Your Own Cloud (BYOC) for AWS が一般提供開始！ {#clickhouse-byoc-for-aws-ga}

このデプロイメントモデルでは、データプランコンポーネント（コンピュート、ストレージ、バックアップ、ログ、メトリック）が顧客の VPC で実行され、一方でコントロールプラン（ウェブアクセス、API、請求書）は ClickHouse の VPC 内に留まります。この設定は、厳格なデータ居住要件を遵守する必要がある大規模なワークロードに最適で、すべてのデータが安全な顧客環境内に留まることを保証します。

- 詳細については、BYOC の[ドキュメント](/cloud/reference/byoc)を参照するか、[発表ブログ記事](https://clickhouse.com/blog/announcing-general-availability-of-clickhouse-bring-your-own-cloud-on-aws)をお読みください。
- [お問い合わせ](https://clickhouse.com/cloud/bring-your-own-cloud)してアクセスをリクエストしてください。
### Postgres CDC コネクタ for ClickPipes {#postgres-cdc-connector-for-clickpipes}

ClickPipes 用の Postgres CDC コネクタが現在公開ベータ版にあります。この機能により、ユーザーは Postgres データベースを ClickHouse Cloud にシームレスにレプリケートすることができます。

- 始めるには、ClickPipes Postgres CDC コネクタの[ドキュメント](https://clickhouse.com/docs/integrations/clickpipes/postgres)を参照してください。
- 顧客のユースケースや機能についての詳細は、[ランディングページ](https://clickhouse.com/cloud/clickpipes/postgres-cdc-connector)と[発表ブログ](https://clickhouse.com/blog/postgres-cdc-connector-clickpipes-public-beta)をご覧ください。
### ClickHouse Cloud on AWS の PCI 準拠 {#pci-compliance-for-clickhouse-cloud-on-aws}

ClickHouse Cloud では、**企業向け**の**PCI 準拠サービス**を **us-east-1** および **us-west-2** リージョン向けにサポートしています。PCI 準拠の環境でサービスを立ち上げたいユーザーは、[サポート](https://clickhouse.com/support/program)に連絡して支援を求めてください。
### Google Cloud Platform での透過的データ暗号化と顧客管理暗号化キー {#tde-and-cmek-on-gcp}

**透過的データ暗号化 (TDE)** と **顧客管理暗号化キー (CMEK)** のサポートが、**Google Cloud Platform (GCP)** の ClickHouse Cloud に対して利用可能になりました。

- これらの機能に関する詳細は[ドキュメント](https://clickhouse.com/docs/cloud/security/cmek#transparent-data-encryption-tde)を参照してください。
### AWS 中東（UAE）での利用可能性 {#aws-middle-east-uae-availability}

ClickHouse Cloud に新しいリージョンサポートが追加され、**AWS 中東（UAE）me-central-1** リージョンで利用可能になりました。
### ClickHouse Cloud ガードレール {#clickhouse-cloud-guardrails}

ClickHouse Cloud の安定使用を促進し、ベストプラクティスを確保するために、使用中のテーブル、データベース、パーティションおよびパーツの数に対するガードレールを導入しています。

- 詳細については、[使用制限](https://clickhouse.com/docs/cloud/bestpractices/usage-limits) セクションのドキュメントを参照してください。
- あなたのサービスがすでにこれらの制限を超えている場合、10% 増加を許可します。質問がある場合は、[サポート](https://clickhouse.com/support/program)にお問い合わせください。
## 2025年1月27日 {#january-27-2025}
### ClickHouse Cloud tiers の変更 {#changes-to-clickhouse-cloud-tiers}

私たちは、製品を常に変化する顧客の要求に適応させることに専念しています。GA での導入から過去2年間で、ClickHouse Cloud は大きく進化し、私たちの顧客がクラウドサービスをどのように活用しているかについて貴重な洞察を得ました。

私たちは、ワークロードのための ClickHouse Cloud サービスのサイズおよびコスト効率を最適化するための新機能を導入しています。これには、**コンピュート・コンピュートの分離**、高性能のインスタンスタイプ、および **シングルレプリカサービス** が含まれます。さらに、自動スケーリングと管理されたアップグレードの進化を通じて、よりシームレスで反応的な実行を実現しています。

私たちは、業界特有のセキュリティおよびコンプライアンス機能、基盤ハードウェアとアップグレードに対するさらなるコントロール、および高度な災害復旧機能に重点を置いた、最も要件の厳しい顧客とワークロードのニーズに応えるために、**新しいエンタープライズティア** を追加しています。

これらの変更をサポートするために、私たちは、進化する顧客基盤が私たちの提供をどのように利用しているかにより近づけるために、現在の **開発** と **生産** ティアを再構築しています。新しい **ベーシック** ティアを導入し、新しいアイデアやプロジェクトを試しているユーザー向けに、 **スケール** ティアを、プロダクションワークロードやスケールでのデータを扱うユーザーに合わせています。

これらやその他の機能的変更については、[ブログ](https://clickhouse.com/blog/evolution-of-clickhouse-cloud-new-features-superior-performance-tailored-offerings)をお読みください。既存の顧客は、[新しいプラン](https://clickhouse.com/pricing)を選択するためのアクションを取る必要があります。顧客向けのコミュニケーションは、組織の管理者にメールで送信され、以下の[FAQ](/cloud/manage/jan-2025-faq/summary) は主要な変更点とタイムラインをカバーしています。
### 倉庫：コンピュート・コンピュート分離（GA） {#warehouses-compute-compute-separation-ga}

コンピュート・コンピュートの分離（「倉庫」としても知られる）は一般提供開始されました。詳細については[ブログ](https://clickhouse.com/blog/introducing-warehouses-compute-compute-separation-in-clickhouse-cloud)と[ドキュメント](/cloud/reference/warehouses)をご覧ください。
### シングルレプリカサービス {#single-replica-services}

「シングルレプリカサービス」という概念を、スタンドアロン提供としても倉庫内で導入しています。スタンドアロン提供として、シングルレプリカサービスはサイズ制限があり、小規模のテストワークロード用に使用されることを意図しています。倉庫内では、シングルレプリカサービスはより大きなサイズで展開され、高可用性が不要なワークロード、たとえば再起動可能な ETL ジョブなどで利用されます。
### 垂直方向の自動スケーリング改善 {#vertical-auto-scaling-improvements}

私たちは、コンピュートレプリカに対する新しい垂直スケーリングメカニズムを導入しています。これを「Make Before Break (MBB)」と呼んでいます。このアプローチでは、古いレプリカを削除する前に、新しいサイズの1つ以上のレプリカが追加され、スケーリング操作中に容量の損失を防ぎます。既存のレプリカを削除し、新しいレプリカを追加する間のギャップを排除することで、MBB はよりシームレスで中断の少ないスケーリングプロセスを作り出します。これは、リソースの高い利用が追加の容量を必要とするスケールアップシナリオで特に有益で、早期にレプリカを削除することはリソースの制約をさらに悪化させるだけです。
### 水平方向のスケーリング（GA） {#horizontal-scaling-ga}

水平方向のスケーリングが一般提供開始されました。ユーザーは、API やクラウドコンソールを通じてサービスをスケールアウトするために追加のレプリカを追加できます。詳細については[ドキュメント](/manage/scaling#self-serve-horizontal-scaling)を参照してください。
### 構成可能なバックアップ {#configurable-backups}

顧客が自分のクラウドアカウントにバックアップをエクスポートする能力をサポートするようになりました。追加の情報については[ドキュメント](/cloud/manage/backups#configurable-backups)をご覧ください。
### 管理されたアップグレードの改善 {#managed-upgrade-improvements}

安全な管理されたアップグレードは、データベースが新機能を追加する際に最新の状態を維持することを可能にすることで、私たちのユーザーに大きな価値を提供します。このロールアウトでは、アップグレードに対して「make before break」（または MBB）アプローチを適用し、稼働中のワークロードへの影響をさらに減らしています。
### HIPAA サポート {#hipaa-support}

私たちは、AWS の `us-east-1`、`us-west-2` および GCP の `us-central1`、`us-east1` を含む準拠地域で HIPAA をサポートしています。オンボードを希望する顧客は、ビジネスパートナー契約 (BAA) に署名し、準拠版の地域にデプロイする必要があります。HIPAA に関する詳細については、[ドキュメント](/cloud/security/security-and-compliance)をご覧ください。
### スケジュールされたアップグレード {#scheduled-upgrades}

ユーザーはサービスのアップグレードをスケジュールできるようになりました。この機能は、エンタープライズティアのサービスのみサポートされています。スケジュールされたアップグレードの詳細については[ドキュメント](/manage/updates)を参照してください。
### 複雑なタイプに対する言語クライアントのサポート {#language-client-support-for-complex-types}

[Golang](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.30.1)、[Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.11)、および [NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.1) クライアントがダイナミック、バリアント、および JSON タイプをサポートしました。
### 更新可能なマテリアライズドビューに対する DBT サポート {#dbt-support-for-refreshable-materialized-views}

DBT は、`1.8.7` リリースで[更新可能なマテリアライズドビュー](https://github.com/ClickHouse/dbt-clickhouse/releases/tag/v1.8.7)をサポートしました。
### JWT トークンサポート {#jwt-token-support}

JDBC ドライバ v2、clickhouse-java、[Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.12)、および [NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.0) クライアントに JWT ベースの認証サポートが追加されました。

JDBC / Java は、リリース時に[0.8.0](https://github.com/ClickHouse/clickhouse-java/releases/tag/v0.8.0)に組み込まれる予定です - ETA は未定です。
### Prometheus 統合の改善 {#prometheus-integration-improvements}

Prometheus 統合のためにいくつかの強化が追加されました。

- **組織レベルのエンドポイント**。ClickHouse Cloud の Prometheus 統合において、サービスレベルメトリックに加えて、**組織レベルメトリック**のためのエンドポイントを API に追加しました。この新しいエンドポイントは、組織内のすべてのサービスのメトリックを自動的に収集し、Prometheus コレクタにメトリックをエクスポートするプロセスを簡略化します。これらのメトリックは、Grafana や Datadog のような可視化ツールと統合され、組織のパフォーマンスをより包括的に可視化することができます。

  この機能はすべてのユーザーで利用可能です。詳細は[こちら](/integrations/prometheus)をご覧ください。

- **フィルタリングされたメトリック**。ClickHouse Cloud の Prometheus 統合において、フィルタリングされたメトリックリストを返すサポートを追加しました。この機能により、サービスの健康状態を監視するために重要なメトリックに焦点を当てることで、応答ペイロードのサイズを削減します。

  この機能は API のオプションのクエリパラメータを介して利用可能であり、データ収集を最適化し、Grafana や Datadog などのツールとの統合を簡易化することができます。

  フィルタリングされたメトリック機能はすべてのユーザーで利用可能です。詳細は[こちら](/integrations/prometheus)をご覧ください。
## 2024年12月20日 {#december-20-2024}
### マーケットプレイスサブスクリプション組織の添付 {#marketplace-subscription-organization-attachment}

新しいマーケットプレイスサブスクリプションを既存の ClickHouse Cloud 組織に添付できるようになりました。マーケットプレイスへのサブスクリプションを完了し、ClickHouse Cloud にリダイレクトされると、過去に作成された既存の組織を新しいマーケットプレイスサブスクリプションに接続することができます。この時点から、組織内のリソースはマーケットプレイス経由で請求されます。 

<img alt="Add marketplace subscription"
  style={{width: '600px'}}
  src={add_marketplace} />
### OpenAPI キーの有効期限の強制 {#force-openapi-key-expiration}

API キーの有効期限オプションを制限し、無期限の OpenAPI キーを作成しないようにすることが可能になりました。これらの制限を組織に対して有効にするには、ClickHouse Cloud サポートチームに連絡してください。
### 通知用のカスタムメール {#custom-emails-for-notifications}

組織の管理者は、特定の通知に追加の受取人として他のメールアドレスを追加できるようになりました。これは、エイリアスに通知を送信したり、ClickHouse Cloud のユーザーでない組織内の他のユーザーに通知を送信したりする場合に便利です。これを構成するには、クラウドコンソールの通知設定に移動し、メール通知を受け取るアドレスを編集します。
## 2024年12月6日 {#december-6-2024}
### BYOC (ベータ) {#byoc-beta}

AWS 用の Bring Your Own Cloud が現在ベータ版で利用可能です。このデプロイメントモデルでは、ClickHouse Cloud を自分の AWS アカウントにデプロイして実行できます。11 以上の AWS リージョンでデプロイメントをサポートしており、さらに多くの地域が近日中に追加される予定です。アクセスを希望する場合は、[サポートにお問い合わせ](https://clickhouse.com/support/program)ください。このデプロイメントは大規模デプロイメントのために予約されています。
### Postgres Change-Data-Capture (CDC) コネクタ in ClickPipes (公開ベータ) {#postgres-change-data-capture-cdc-connector-in-clickpipes-public-beta}

このターンキー統合により、顧客はクリック数回で Postgres データベースを ClickHouse Cloud にレプリケートし、ClickHouse を利用して超高速の分析を行えるようになります。このコネクタを使って、Postgres から継続的なレプリケーションと一度きりの移行の両方を行うことができます。
### ダッシュボード（ベータ） {#dashboards-beta}

今週、ClickHouse Cloud におけるダッシュボードのベータ版の発表を嬉しく思います。ダッシュボードを使用すると、ユーザーは保存したクエリを視覚化に変換し、視覚化をダッシュボードに整理し、クエリパラメータを使用してダッシュボードと対話できます。始めるには、[ダッシュボードのドキュメント](/cloud/manage/dashboards)を参照してください。

<img alt="Dashboards Beta"
  style={{width: '600px'}}
  src={beta_dashboards} />
### クエリ API エンドポイント（GA） {#query-api-endpoints-ga}

クエリ API エンドポイントの ClickHouse Cloud における一般提供開始をお知らせします。クエリ API エンドポイントを使用して、保存されたクエリのための RESTful API エンドポイントを数回のクリックで立ち上げ、言語クライアントや認証の複雑さを回避してアプリケーションでデータを取得し始めることができます。初期のリリース以降、以下の改善が行われました。

* エンドポイントのレイテンシを削減、特にコールドスタート時
* エンドポイントの RBAC コントロールの増加
* 構成可能な CORS 許可ドメイン
* 結果ストリーミング
* すべての ClickHouse 互換の出力形式をサポート

これらの改善に加えて、当社の既存のフレームワークを活用した一般的なクエリ API エンドポイントが実装され、ClickHouse Cloud サービスに対して任意の SQL クエリを実行できるようになりました。一般的なエンドポイントは、サービス設定ページから有効化および構成できます。

始めるには、[クエリ API エンドポイントのドキュメント](/cloud/get-started/query-endpoints)を参照してください。

<img alt="API Endpoints"
  style={{width: '600px'}}
  src={api_endpoints} />
### ネイティブ JSON サポート（ベータ） {#native-json-support-beta}

ClickHouse Cloud においてネイティブ JSON サポートのベータ版を開始します。始めるには、[サポートに連絡してクラウドサービスを有効化してください](/cloud/support)。
### ベクトル検索のためのベクトル類似インデックス使用（早期アクセス） {#vector-search-using-vector-similarity-indexes-early-access}

ベクトル類似インデックスによる近似ベクトル検索の早期アクセスを発表します！

ClickHouse はすでに、さまざまな[距離関数](https://clickhouse.com/blog/reinvent-2024-product-announcements#vector-search-using-vector-similarity-indexes-early-access)とリニアスキャンの実行能力で、ベクトルベースのユースケースを強力にサポートしています。さらに最近、[usearch](https://github.com/unum-cloud/usearch) ライブラリおよび階層的ナビゲーション可能な小さな世界（HNSW）近似最寄りの隣接検索アルゴリズムに基づいた実験的な[近似ベクトル検索](/engines/table-engines/mergetree-family/annindexes)アプローチが追加されました。

始めるには、[早期アクセスの待機リストにサインアップしてください](https://clickhouse.com/cloud/vector-search-index-waitlist)。
### ClickHouse-Connect (Python) および ClickHouse-Kafka-Connect ユーザー {#clickhouse-connect-python-and-clickhouse-kafka-connect-users}

`MEMORY_LIMIT_EXCEEDED` 例外に直面した顧客に通知メールが送信されました。

アップグレードをおすすめします：
- Kafka-Connect: > 1.2.5
- ClickHouse-Connect (Java): > 0.8.6
### ClickPipes が AWS でのクロス VPC リソースアクセスをサポート {#clickpipes-now-supports-cross-vpc-resource-access-on-aws}

特定のデータソース（例えば AWS MSK）への一方向アクセスを付与できるようになりました。AWS PrivateLink および VPC Lattice によるクロス VPC リソースアクセスを使用すると、プライバシーとセキュリティを損なうことなく、VPC やアカウントの境界、さらにはオンプレミスネットワークから個別のリソースを共有できます。リソース共有を開始し設定するには、[発表記事](https://clickhouse.com/blog/clickpipes-crossvpc-resource-endpoints?utm_medium=web&utm_source=changelog)をご覧ください。

<img alt="VPC ClickPipes"
  style={{width: '600px'}}
  src={cross_vpc} />
### ClickPipes が AWS MSK の IAM をサポート {#clickpipes-now-supports-iam-for-aws-msk}

AWS MSK ClickPipes に接続するために IAM 認証を使用できるようになりました。始めるには、[ドキュメント](/integrations/clickpipes/kafka#iam)を確認してください。
### 新しいサービスの最大レプリカサイズ（AWS） {#maximum-replica-size-for-new-services-on-aws}

今後、AWS で作成される新しいサービスは、最大で 236 GiB のレプリカサイズを許可します。
## 2024年11月22日 {#november-22-2024}
### ClickHouse Cloud 用の内蔵高度可視化ダッシュボード {#built-in-advanced-observability-dashboard-for-clickhouse-cloud}

以前は、ClickHouse サーバーメトリックとハードウェアリソースの使用状況を監視するための高度可視化ダッシュボードはオープンソースの ClickHouse のみで利用可能でした。この機能が ClickHouse Cloud コンソールで利用できるようになったことをお知らせします！

このダッシュボードを使用すると、[system.dashboards](/operations/system-tables/dashboards) テーブルに基づいてクエリを一つの UI で表示できます。**モニタリング > サービスの健康**ページを訪れ、今日から高度可視化ダッシュボードを使用し始めてください。

<img alt="Advanced Observability Dashboard"
  style={{width: '600px'}}
  src={nov_22} />
### AI 搭載の SQL 自動補完 {#ai-powered-sql-autocomplete}

新しい AI Copilot を使用してクエリを書く際にインライン SQL 完成を取得できるように、オートコンプリートが大幅に改善されました！ この機能は、ClickHouse Cloud のサービスに対して**「インラインコード補完を有効にする」**設定を切り替えることで有効にできます。

<img alt="AI Copilot SQL autocomplete"
  style={{width: '600px'}}
  src={copilot} />
### 新しい「請求」ロール {#new-billing-role}

組織のユーザーに新しい **請求** ロールを割り当てることができるようになり、これによりサービスを構成または管理する権限を与えずに請求情報を表示し管理できるようになります。新しいユーザーを招待するか、既存のユーザーのロールを編集して **請求** ロールを割り当ててください。
## 2024年11月8日 {#november-8-2024}
### ClickHouse Cloud での顧客通知 {#customer-notifications-in-clickhouse-cloud}

ClickHouse Cloud は、いくつかの請求やスケーリングイベントのためのインコンソールおよびメール通知を提供します。顧客は、クラウドコンソールの通知センターを介して、UI にのみ表示されるようにするか、メールを受信するか、両方に設定できます。サービスレベルで受信する通知のカテゴリーと重大性を構成することができます。

今後、他のイベントに対する通知や、通知を受信するための追加の方法が追加される予定です。

[ClickHouse ドキュメント](/cloud/notifications)を参照して、サービスの通知を有効にする方法を確認してください。

<img alt="Customer notifications UI"
  style={{width: '600px'}}
  src={notifications} />

<br />
## 2024年10月4日 {#october-4-2024}
### ClickHouse Cloud が GCP の HIPAA 準拠サービスをベータ版で提供開始 {#clickhouse-cloud-now-offers-hipaa-ready-services-in-beta-for-gcp}

保護された健康情報（PHI）のセキュリティを強化したい顧客は、[Google Cloud Platform (GCP)](https://cloud.google.com/)に ClickHouse Cloud にオンボードできるようになりました。 ClickHouse は、[HIPAA セキュリティルール](https://www.hhs.gov/hipaa/for-professionals/security/index.html) に従い、管理上、物理的および技術的な保護を実施しており、使用ケースやワークロードに応じて実装できる構成可能なセキュリティ設定を持つようになりました。利用可能なセキュリティ設定については、[セキュリティ共有責任モデル](/cloud/security/shared-responsibility-model)をご覧ください。

このサービスは GCP の `us-central-1` で、**専用**サービスタイプを持つ顧客向けに提供され、ビジネスパートナー契約 (BAA) が必要です。この機能にアクセスをリクエストしたり、他の GCP、AWS、Azure リージョンの待機リストに参加するには、[営業](mailto:sales@clickhouse.com)または[サポート](https://clickhouse.com/support/program)にお問い合わせください。
### コンピュート・コンピュート分離が GCP および Azure のプライベートプレビューに {#compute-compute-separation-is-now-in-private-preview-for-gcp-and-azure}

最近、AWS 向けのコンピュート・コンピュートの分離に関するプライベートプレビューを発表しましたが、これが GCP および Azure でも利用可能になったことをお知らせします。

コンピュート・コンピュートの分離により、特定のサービスを読み取り専用または読み取り書き込み可能として指定し、コストとパフォーマンスを最適化するための最適なコンピュート構成を設計できるようになります。詳細については、[ドキュメント](/cloud/reference/compute-compute-separation)をご覧ください。
### セルフサービス MFA 回復コード {#self-service-mfa-recovery-codes}

多要素認証を使用する顧客は、電話を紛失した場合やトークンを誤って削除した場合に使用できる回復コードを取得できるようになりました。最初に MFA に登録する顧客は、設定時にコードが提供されます。既存の MFA を持つ顧客は、既存の MFA トークンを削除し、新しいトークンを追加することで回復コードを取得できます。
### ClickPipes 更新：カスタム証明書、レイテンシインサイトなど！ {#clickpipes-update-custom-certificates-latency-insights-and-more}

データを ClickHouse サービスに取り込む最も簡単な方法である ClickPipes の最新の更新をお知らせできることに興奮しています！ これらの新機能は、データの取り込みの制御を強化し、パフォーマンスメトリックの可視化を向上させるために設計されています。

*Kafka 用のカスタム認証証明書*

ClickPipes for Kafka では、SASL & public SSL/TLS を使用して Kafka ブローカーのためのカスタム認証証明書をサポートしています。ClickPipe セットアップ時に SSL 証明書セクションに自分の証明書を簡単にアップロードでき、Kafka へのより安全な接続を確保します。

*Kafka および Kinesis のためのレイテンシメトリックの導入*

パフォーマンスの可視化は重要です。ClickPipes では、メッセージの生成（Kafka トピックまたは Kinesis ストリームから）と ClickHouse Cloud への取り込みの間の時間を提供するレイテンシグラフが追加されました。この新しいメトリックを使用することで、データパイプラインのパフォーマンスをより注意深く監視し、最適化できます。

<img alt="Latency Metrics graph"
  style={{width: '600px'}}
  src={latency_insights} />

<br />

*Kafka および Kinesis のスケーリングコントロール（プライベートベータ）*

高スループットは、データ量とレイテンシのニーズに応じて追加のリソースを必要とする場合があります。ClickPipes の水平方向のスケーリングを導入し、クラウドコンソールを介して利用可能にしました。この機能は現在プライベートベータ版であり、ユーザーの要件に応じてリソースをより効果的にスケールすることを可能にします。プライベートベータに参加するには、[サポート](https://clickhouse.com/support/program)にお問い合わせください。

*Kafka および Kinesis の生メッセージ取り込み*

メッセージを解析せずに、Kafka または Kinesis メッセージ全体を取り込むことが可能になりました。ClickPipes は、ユーザーが生データを必要に応じて操作できるようにする `_raw_message` [仮想カラム](/integrations/clickpipes/kafka#kafka-virtual-columns)のサポートを追加しました。
## 2024年8月29日 {#august-29-2024}
### 新しい Terraform プロバイダー バージョン - v1.0.0 {#new-terraform-provider-version---v100}

Terraform を使用すると、ClickHouse Cloud サービスをプログラムで制御し、構成をコードとして保存できます。私たちの Terraform プロバイダーは、20 万回以上のダウンロードを達成し、公式に v1.0.0 になりました！ この新バージョンには、改善されたリトライロジックや ClickHouse Cloud サービスにプライベートエンドポイントを接続するための新しいリソースが含まれています。 [Terraform プロバイダーをこちらからダウンロード](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest)し、[完全な変更履歴をこちらから確認](https://github.com/ClickHouse/terraform-provider-clickhouse/releases/tag/v1.0.0)してください。
### 2024 SOC 2 Type II レポートおよび更新された ISO 27001 証明書 {#2024-soc-2-type-ii-report-and-updated-iso-27001-certificate}

2024年の SOC 2 Type II レポートおよび更新された ISO 27001 証明書の提供開始をお知らせします。両方の文書には、最近開始した Azure サービスが含まれており、引き続き AWS および GCP におけるサービスのカバレッジも提供されています。

私たちの SOC 2 Type II は、ClickHouse ユーザーに提供するサービスのセキュリティ、可用性、処理整合性、および機密性を達成するための継続的なコミットメントを示しています。詳細については、アメリカ公認会計士協会（AICPA）によって発行された[SOC 2 - サービス組織に対する SOC：信用供与基準](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services)と[ISO/IEC 27001とは](https://www.iso.org/standard/27001)を確認してください。

また、[Trust Center](https://trust.clickhouse.com/)を確認して、セキュリティおよびコンプライアンスの文書やレポートをご覧ください。
## 2024年8月15日 {#august-15-2024}
### コンピュート・コンピュート分離が AWS のプライベートプレビューに {#compute-compute-separation-is-now-in-private-preview-for-aws}

既存の ClickHouse Cloud サービスでは、レプリカが読み取りと書き込みの両方を処理しており、特定のレプリカを特定の種類の操作のみに設定する方法はありません。特定のサービスを読み取り専用または読み取り書き込み可能として指定できる「コンピュート・コンピュート分離」と呼ばれる新機能が登場します。これにより、コストとパフォーマンスを最適化するための最適なコンピュート構成を設計できます。

新しいコンピュート・コンピュート分離機能により、同じオブジェクトストレージフォルダーを使用し、同じテーブル、ビューなどを持つ複数のコンピュートノードグループを作成することができます。詳細については、[コンピュート・コンピュートの分離をこちらでご覧ください](/cloud/reference/compute-compute-separation)。プライベートプレビューでこの機能にアクセスしたい場合は、[サポートにお問い合わせ](https://clickhouse.com/support/program)ください。

<img alt="Example architecture for compute-compute separation"
  style={{width: '600px'}}
  src={cloud_console_2} />
### S3 および GCS 用の ClickPipes が GA に、継続モードのサポート {#clickpipes-for-s3-and-gcs-now-in-ga-continuous-mode-support}

ClickPipes は、ClickHouse Cloud へのデータ取り込みの最も簡単な方法です。[ClickPipes](https://clickhouse.com/cloud/clickpipes) が S3 と GCS で一般提供を開始したことを嬉しく思います。ClickPipes は、一度きりのバッチ取り込みと「継続モード」の両方をサポートしています。取り込みタスクは、特定のリモートバケットから特定のパターンに一致するすべてのファイルを ClickHouse の宛先テーブルにロードします。「継続モード」では、ClickPipes のジョブは常に実行され、リモートオブジェクトストレージバケットに追加される一致するファイルを取り込むことができます。これにより、ユーザーはオブジェクトストレージバケットを ClickHouse Cloud へのデータ取り込みのための本格的なステージングエリアに変換できます。ClickPipes の詳細は[ドキュメント](/integrations/clickpipes)をご覧ください。
## 2024年7月18日 {#july-18-2024}
### Prometheus メトリック用エンドポイントが一般提供開始 {#prometheus-endpoint-for-metrics-is-now-generally-available}

前回のクラウド変更履歴で、ClickHouse Cloud からの[Prometheus](https://prometheus.io/) メトリックのエクスポートに関するプライベートプレビューを発表しました。この機能により、[ClickHouse Cloud API](/cloud/manage/api/api-overview)を使用して、[Grafana](https://grafana.com/) および [Datadog](https://www.datadoghq.com/)などのツールにメトリックを取得し、視覚化できます。この機能が一般提供開始されたことをお知らせします。詳細については[ドキュメント](/integrations/prometheus)をご覧ください。
### Cloud Consoleのテーブルインスペクタ {#table-inspector-in-cloud-console}

ClickHouseには、テーブルのスキーマを調査するための[`DESCRIBE`](/sql-reference/statements/describe-table)のようなコマンドがあり、これを使ってテーブルを調査することができます。これらのコマンドはコンソールに出力されますが、すべてのテーブルとカラムに関する重要なデータを取得するためには、複数のクエリを組み合わせる必要があり、便利ではありません。

最近、SQLを記述することなくUIでテーブルやカラムの重要な情報を取得できる**テーブルインスペクタ**をクラウドコンソールに導入しました。クラウドコンソールをチェックして、あなたのサービスでテーブルインスペクタを試してみてください。これは、スキーマ、ストレージ、圧縮などに関する情報を、一元化されたインターフェイスで提供します。

<img alt="テーブルインスペクタ UI"
  style={{width: '800px', marginLeft: 0}}
  src={compute_compute} />
### 新しいJavaクライアントAPI {#new-java-client-api}

私たちの[Java Client](https://github.com/ClickHouse/clickhouse-java)は、ClickHouseに接続するためにユーザーが使用する最も人気のあるクライアントの1つです。APIを再設計し、さまざまなパフォーマンス最適化を含めることで、使いやすさと直感的な操作性をさらに向上させたいと考えています。これらの変更により、JavaアプリケーションからClickHouseに接続するのが非常に簡単になります。更新されたJava Clientの使用方法については、この[ブログ記事](https://clickhouse.com/blog/java-client-sequel)をお読みください。
### 新しいアナライザーがデフォルトで有効に {#new-analyzer-is-enabled-by-default}

過去数年間、クエリ分析と最適化のための新しいアナライザーに取り組んできました。このアナライザーは、クエリのパフォーマンスを改善し、より迅速で効率的な`JOIN`を含むさらなる最適化を可能にします。以前は、新しいユーザーが`allow_experimental_analyzer`設定を使用してこの機能を有効にする必要がありました。この改善されたアナライザーは、現在、新しいClickHouse Cloudサービスでデフォルトで利用可能です。

さらに多くの最適化を計画しているので、アナライザーの改善にぜひご期待ください！
## 2024年6月28日 {#june-28-2024}
### Microsoft Azure向けのClickHouse Cloudが一般提供開始！ {#clickhouse-cloud-for-microsoft-azure-is-now-generally-available}

私たちは今年の5月にMicrosoft Azureのサポートをベータ版として最初に発表しました[こちらをご覧ください](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta)。この最新のクラウドリリースでは、Azureのサポートがベータ版から一般提供に移行したことをお知らせできることを嬉しく思います。ClickHouse Cloudは、現在、AWS、Google Cloud Platform、そしてMicrosoft Azureの主要な3つのクラウドプラットフォームで利用できます。

このリリースには、[Microsoft Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/clickhouse.clickhouse_cloud)を介してのサブスクリプションサポートも含まれています。このサービスは、次の地域で最初にサポートされる予定です：
- アメリカ合衆国：西部 US 3（アリゾナ）
- アメリカ合衆国：東部 US 2（バージニア）
- ヨーロッパ：ドイツ西部（フランクフルト）

特定の地域のサポートを希望される場合は、ぜひ[お問い合わせ](https://clickhouse.com/support/program)ください。
### クエリログインサイト {#query-log-insights}

クラウドコンソールに新しいクエリインサイトUIを導入し、ClickHouseの組み込みクエリログの使用が簡単になりました。ClickHouseの`system.query_log`テーブルは、クエリの最適化、デバッグ、および全体的なクラスターの健全性とパフォーマンスの監視にとって重要な情報源です。ただし、70以上のフィールドとクエリごとの複数のレコードがあるため、クエリログを解釈するには急な学習曲線があります。このクエリインサイトの初版は、クエリのデバッグや最適化パターンを簡素化するための将来の作業の青写真を提供します。機能の改善を続ける中で、皆様のフィードバックをお待ちしておりますので、ぜひご連絡ください。皆様のご意見をいただけると幸いです！

<img alt="クエリインサイトUI"
  style={{width: '600px', marginLeft: 0}}
  src={query_insights} />
### メトリクス用Prometheusエンドポイント（プライベートプレビュー） {#prometheus-endpoint-for-metrics-private-preview}

私たちのおそらく最もリクエストの多かった機能：ClickHouse Cloudから[Prometheus](https://prometheus.io/)メトリクスをエクスポートして[Grafana](https://grafana.com/)や[Datadog](https://www.datadoghq.com/)で可視化できるようになりました。Prometheusは、ClickHouseを監視し、カスタムアラートを設定するためのオープンソースのソリューションを提供します。ClickHouse CloudサービスのPrometheusメトリクスへのアクセスは、[ClickHouse Cloud API](/integrations/prometheus)を介して利用可能です。この機能は現在プライベートプレビュー中です。組織のためにこの機能を有効にするには、[サポートチーム](https://clickhouse.com/support/program)にご連絡ください。

<img alt="GrafanaによるPrometheusメトリクス"
  style={{width: '600px', marginLeft: 0}}
  src={prometheous} />
### その他の機能： {#other-features}
- [構成可能バックアップ](/cloud/manage/backups#configurable-backups)は、頻度、保持期間、スケジュールのようなカスタムバックアップポリシーの設定が一般提供を開始しました。
## 2024年6月13日 {#june-13-2024}
### Kafka ClickPipesコネクタの構成可能オフセット（ベータ） {#configurable-offsets-for-kafka-clickpipes-connector-beta}

最近まで、新しい[Kafka Connector for ClickPipes](/integrations/clickpipes/kafka)を設定すると、常にKafkaトピックの最初からデータを消費していました。この状況では、履歴データを再処理したり、新たに入ってくるデータを監視したり、正確なポイントから再開したりする必要がある場合に、柔軟性が不足しています。

ClickPipes for Kafkaは、新しい機能を追加し、Kafkaトピックからのデータ消費に対する柔軟性と制御を向上させました。これにより、データを消費するオフセットを構成できるようになりました。

利用可能なオプションは次のとおりです：
- 最初から：Kafkaトピックの最初からデータを消費し始めます。このオプションは、すべての履歴データを再処理する必要があるユーザーに最適です。
- 最新から：最も最近のオフセットからデータを消費し始めます。新しいメッセージのみに関心があるユーザーに便利です。
- タイムスタンプから：特定のタイムスタンプ以降に生成されたメッセージからデータの消費を開始します。この機能により、より正確な制御が可能になり、ユーザーは正確な時点から処理を再開できます。

<img alt="Kafkaコネクタのオフセットを構成する"
  style={{width: '600px', marginLeft: 0}}
  src={kafka_config} />
### サービスを高速リリースチャンネルに登録 {#enroll-services-to-the-fast-release-channel}

高速リリースチャンネルは、サービスがリリーススケジュールの前に更新を受け取ることを可能にします。以前は、この機能を有効にするにはサポートチームの支援が必要でした。今は、ClickHouse Cloudコンソールを使用して、直接サービスのためにこの機能を有効にすることができます。単純に**設定**に移動し、**高速リリースに登録**をクリックしてください。これにより、あなたのサービスは新しい更新が利用可能になり次第、受け取ることができます！

<img alt="高速リリースに登録"
  style={{width: '500px', marginLeft: 0}}
  src={fast_releases} />
### 水平スケーリングのためのTerraformサポート {#terraform-support-for-horizontal-scaling}

ClickHouse Cloudは[水平スケーリング](/manage/scaling#vertical-and-horizontal-scaling)をサポートしており、同じサイズの追加レプリカをサービスに追加する能力を提供しています。水平スケーリングは、並行クエリをサポートするためにパフォーマンスと並列処理を向上させます。以前は、より多くのレプリカを追加するにはClickHouse CloudコンソールまたはAPIを使用する必要がありました。現在はTerraformを使用して、サービスからレプリカを追加または削除できるようになり、必要に応じてClickHouseサービスをプログラム的にスケーリングできます。

詳細については[ClickHouse Terraformプロバイダー](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)をご覧ください。
## 2024年5月30日 {#may-30-2024}
### チームメンバーとクエリを共有 {#share-queries-with-your-teammates}

SQLクエリを書くと、チームの他の人もそのクエリを有用だと感じる可能性が高いです。以前は、クエリをSlackやメールで送信し、編集した場合にそのクエリの自動更新を受け取る方法はありませんでした。

今、新しくClickHouse Cloudコンソールを介して簡単にクエリを共有することができるようになりました。クエリエディタから、クエリをチーム全体または特定のチームメンバーと直接共有できます。また、読み取り専用または書き込み専用のアクセス権を指定することもできます。クエリエディタの**共有**ボタンをクリックして、新しい共有クエリ機能を試してみてください。

<img alt="クエリを共有する" style={{width: '500px', marginLeft: 0}} src={share_queries} />
### Microsoft Azure向けのClickHouse Cloudがベータ版としてリリース {#clickhouse-cloud-for-microsoft-azure-is-now-in-beta}

ClickHouse CloudサービスをMicrosoft Azure上で作成する能力をついに発表しました！すでに多くの顧客がプライベートプレビュープログラムの一環としてAzureでClickHouse Cloudを使用しています。現在、誰でもAzure上で独自のサービスを作成できます。AWSやGCPでサポートされているClickHouseのすべてのお気に入り機能は、Azureでも機能します。

私たちは、数週間以内にClickHouse Cloud for Azureを一般提供の準備を完了させる見込みです。[このブログ記事](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta)を読んで詳細を学ぶか、ClickHouse Cloudコンソールを介してAzureを使用して新しいサービスを作成してください。

注意：現在、Azureの**開発**サービスはサポートされていません。
### クラウドコンソールを介してプライベートリンクを設定 {#set-up-private-link-via-the-cloud-console}

私たちのプライベートリンク機能は、公共インターネットにトラフィックを送信することなく、クラウドプロバイダーアカウント内の内部サービスとClickHouse Cloudサービスを接続できるようにします。これにより、コストを削減し、セキュリティを向上させます。以前は、この設定は難しく、ClickHouse Cloud APIを使用する必要がありました。

現在は、ClickHouse Cloudコンソールからわずか数回のクリックでプライベートエンドポイントを構成できるようになりました。サービスの**設定**に移動し、**セキュリティ**セクションにアクセスして**プライベートエンドポイントを設定**をクリックしてください。

<img alt="プライベートエンドポイントを設定する" src={private_endpoint} />
## 2024年5月17日 {#may-17-2024}
### ClickPipesを使用したAmazon Kinesisからのデータ取り込み（ベータ） {#ingest-data-from-amazon-kinesis-using-clickpipes-beta}

ClickPipesは、コードなしでデータを取り込むためにClickHouse Cloudが提供する独自のサービスです。Amazon Kinesisは、データストリームを処理するために取り込み、保存するためのAWSのフルマネージドストリーミングサービスです。私たちは、最もリクエストが多かった統合の一つであるAmazon KinesisのClickPipesベータを発表できることを嬉しく思います。ClickPipesのさらなる統合を追加しようと考えているので、どのデータソースをサポートしてほしいか教えてください！この機能の詳細は[こちら](https://clickhouse.com/blog/clickpipes-amazon-kinesis)をご覧ください。

クラウドコンソールでClickPipesの新しいAmazon Kinesis統合を試してみてください：

<img alt="ClickPipesでのAmazon Kinesis"
  src={kenesis} />
### 構成可能バックアップ（プライベートプレビュー） {#configurable-backups-private-preview}

バックアップはすべてのデータベースにとって重要であり（どんなに信頼性があっても）、私たちはClickHouse Cloudの初日からバックアップに非常に真剣に取り組んできました。今週、バックアップの柔軟性を向上させる構成可能バックアップを導入しました。現在、開始時刻、保持期間、頻度を制御できます。この機能は**プロダクション**および**専用**サービスで利用でき、**開発**サービスでは利用できません。この機能はプライベートプレビュー中であるため、support@clickhouse.comに連絡してサービスを有効にしてください。構成可能バックアップの詳細は、[こちら](https://clickhouse.com/blog/configurable-backups-in-clickhouse-cloud)をご覧ください。
### SQLクエリからAPIを作成（ベータ） {#create-apis-from-your-sql-queries-beta}

ClickHouse用のSQLクエリを作成すると、アプリケーションにクエリを公開するためにドライバを介してClickHouseに接続する必要があります。今、私たちの新しい**クエリエンドポイント**機能を使えば、設定なしでAPIから直接SQLクエリを実行できます。クエリエンドポイントを指定して、JSON、CSV、またはTSVを返すようにできます。クラウドコンソールで"共有"ボタンをクリックして、この新機能をクエリと共にお試しください。クエリエンドポイントの詳細は[こちら](https://clickhouse.com/blog/automatic-query-endpoints)をご覧ください。

<img alt="クエリエンドポイントを設定する" style={{width: '450px', marginLeft: 0}} src={query_endpoints} />
### 公式ClickHouse認定が今すぐ取得可能 {#official-clickhouse-certification-is-now-available}

ClickHouse開発トレーニングコースには12の無料トレーニングモジュールがあります。今週以前は、ClickHouseの習得を証明する公式な方法はありませんでした。最近、**ClickHouse認定開発者**となるための公式試験を開始しました。この試験を完了することで、データの取り込み、モデリング、分析、パフォーマンスの最適化などのトピックに関するClickHouseの習得を現在および将来の雇用主と共有できます。試験は[こちら](https://clickhouse.com/learn/certification)で受けることができ、ClickHouse認定に関する詳細は[このブログ記事](https://clickhouse.com/blog/first-official-clickhouse-certification)をお読みください。
## 2024年4月25日 {#april-25-2024}
### ClickPipesを使用したS3およびGCSからのデータのロード {#load-data-from-s3-and-gcs-using-clickpipes}

最近リリースされたクラウドコンソールで「データソース」という新しいセクションがあることに気づいた方もいるかもしれません。「データソース」ページは、さまざまなソースからClickHouse Cloudにデータを簡単に挿入することを可能にするネイティブなClickHouse Cloud機能であるClickPipesによって活用されています。

最新のClickPipesのアップデートでは、Amazon S3およびGoogle Cloud Storageからデータを直接アップロードする能力が追加されました。組み込みのテーブル関数を使用することもできますが、ClickPipesは、わずか数回のクリックでS3およびGCSからデータを取り込むことを可能にする完全管理型サービスです。この機能は現在プライベートプレビュー中ですが、今日クラウドコンソールからお試しいただけます。

<img alt="ClickPipes S3およびGCS" src={s3_gcs} />
### 500以上のソースからClickHouse CloudにデータをロードするためのFivetranを使用 {#use-fivetran-to-load-data-from-500-sources-into-clickhouse-cloud}

ClickHouseはすべての大規模データセットを迅速にクエリできるものですが、もちろん、データは最初にClickHouseに挿入する必要があります。Fivetranの包括的なコネクタのおかげで、ユーザーは500以上のソースからデータを迅速にロードできるようになりました。Zendesk、Slack、またはお気に入りのアプリケーションのいずれかからデータをロードする必要がある場合、新しいClickHouse用のFivetranでは、ClickHouseをアプリケーションデータのターゲットデータベースとして使用できるようにしています。

これは、私たちの統合チームによる数ヶ月の努力の成果として作成されたオープンソース統合です。[こちらのリリースブログ](https://clickhouse.com/blog/fivetran-destination-clickhouse-cloud)と[GitHubリポジトリ](https://github.com/ClickHouse/clickhouse-fivetran-destination)をご覧ください。
### その他の変更 {#other-changes}

**コンソールの変更**
- SQLコンソールにおける出力フォーマットのサポート

**統合の変更**
- ClickPipes Kafkaコネクタがマルチブローカーセットアップをサポート
- PowerBIコネクタがODBCドライバ設定オプションを提供するようにサポート
## 2024年4月18日 {#april-18-2024}
### AWS東京リージョンがClickHouse Cloudで利用可能になりました {#aws-tokyo-region-is-now-available-for-clickhouse-cloud}

このリリースでは、ClickHouse Cloudの新しいAWS東京リージョン（`ap-northeast-1`）が導入されました。ClickHouseを最も速いデータベースにしたいと思っているため、各クラウドのレイテンシをできるだけ減らすために、常に新しいリージョンを追加しています。更新されたクラウドコンソールで東京に新しいサービスを作成することができます。

<img alt="東京サービスを作成する" src={tokyo} />

その他の変更：
### コンソールの変更 {#console-changes}
- ClickPipes for KafkaのAvroフォーマットサポートが一般提供開始
- Terraformプロバイダー用のリソース（サービスおよびプライベートエンドポイント）インポートの完全サポートを実装
### 統合の変更 {#integrations-changes}
- NodeJSクライアントの主要な安定版：クエリ+ResultSet、URL設定のための高度なTypeScriptサポート
- Kafkaコネクタ：DLQへの書き込み時に例外を無視するバグを修正し、Avro Enumタイプをサポート、[MSK](https://www.youtube.com/watch?v=6lKI_WlQ3-s)および[Confluent Cloud](https://www.youtube.com/watch?v=SQAiPVbd3gg)でのコネクタ使用ガイドを公開
- Grafana：UIでのNullable型サポートを修正、動的OTELトレーステーブル名のサポートを修正
- DBT：カスタムマテリアライゼーション用のモデル設定を修正。
- Javaクライアント：誤ったエラーコード解析に関するバグを修正
- Pythonクライアント：数値型のパラメータバインディングを修正し、クエリバインディングでの数値リストのバグを修正、SQLAlchemy Pointサポートを追加。
## 2024年4月4日 {#april-4-2024}
### 新しいClickHouse Cloudコンソールの導入 {#introducing-the-new-clickhouse-cloud-console}

このリリースでは、新しいクラウドコンソールのプライベートプレビューを導入します。

ClickHouseでは、開発者体験を改善する方法を常に考えています。最も速いリアルタイムデータウェアハウスを提供するだけでは不十分で、使いやすく管理しやすいものでなければなりません。

何千ものClickHouse Cloudユーザーが毎月数十億のクエリをSQLコンソール上で実行しているため、ClickHouse Cloudサービスとのインタラクションをこれまで以上に簡単にするために、世界クラスのコンソールに投資することに決めました。新しいクラウドコンソールの体験は、スタンドアロンのSQLエディタと管理コンソールを直感的なUIの中で組み合わせています。

選ばれた顧客が新しいクラウドコンソールの体験をプレビューできるようになります。ClickHouseでのデータを探求し管理するための統一された没入型の方法です。優先アクセスをご希望の場合は、support@clickhouse.comまでご連絡ください。

<img alt="新しいクラウドコンソール" src={cloud_console} />
## 2024年3月28日 {#march-28-2024}

このリリースでは、Microsoft Azureのサポート、APIを介した水平スケーリング、プライベートプレビューでのリリースチャンネルを導入します。
### 一般的な更新 {#general-updates}
- プライベートプレビューでのMicrosoft Azureのサポートを導入。アクセスが必要な場合は、アカウント管理またはサポートに連絡してください。また、[ウェイトリスト](https://clickhouse.com/cloud/azure-waitlist)に参加することもできます。
- リリースチャンネルの導入 – 環境タイプに基づいてアップグレードのタイミングを指定する能力。このリリースでは、「高速」リリースチャンネルを追加し、非プロダクション環境をプロダクション環境の前にアップグレードできるようにします（有効にするにはサポートに連絡してください）。
### 管理の変更 {#administration-changes}
- APIを介した水平スケーリングの設定をサポート（プライベートプレビュー、有効にするにはサポートに連絡してください）
- 起動時にメモリエラーが発生した場合にサービスをスケールアップするための自動スケーリングを改善
- Terraformプロバイダーを介してAWS用のCMEKのサポートを追加
### コンソールの変更 {#console-changes-1}
- Microsoftソーシャルログインのサポートを追加
- SQLコンソールでのパラメータ化されたクエリ共有機能を追加
- クエリエディタのパフォーマンスを大幅に改善（EUの一部地域で5秒から1.5秒の遅延に短縮）
### 統合の変更 {#integrations-changes-1}
- ClickHouse OpenTelemetryエクスポータ：[ClickHouseレプリケーションテーブルエンジン](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31920)のサポートを追加し、[統合テスト](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31896)を追加
- ClickHouse DBTアダプタ： [辞書用のマテリアライゼーションマクロ](https://github.com/ClickHouse/dbt-clickhouse/pull/255)のサポートを追加し、[TTL表現サポートのテスト](https://github.com/ClickHouse/dbt-clickhouse/pull/254)を追加
- ClickHouse Kafka Connect Sink：[Kafkaプラグインの自動検出との互換性](https://github.com/ClickHouse/clickhouse-kafka-connect/issues/350)を追加（コミュニティ貢献）
- ClickHouse Java Client：新しいクライアントAPI用の[新しいパッケージ](https://github.com/ClickHouse/clickhouse-java/pull/1574)を導入し、[Cloudテストのためのテストカバレッジ](https://github.com/ClickHouse/clickhouse-java/pull/1575)を追加
- ClickHouse NodeJS Client：新しいHTTP keep-aliveの動作に関するテストとドキュメントを拡張。v0.3.0リリース以来利用可能
- ClickHouse Golang Client：[MapでキーとしてEnumを使用するバグを修正し](https://github.com/ClickHouse/clickhouse-go/pull/1236)、接続プールにエラーが発生した接続が残る際のバグを修正した（コミュニティ貢献）
- ClickHouse Python Client：[PyArrowを介したクエリストリーミングのサポートを追加](https://github.com/ClickHouse/clickhouse-connect/issues/155)（コミュニティ貢献）
### セキュリティの更新 {#security-updates}
- ClickHouse Cloudを更新して、["ロールベースのアクセス制御がクエリキャッシングを有効にした場合にバイパスされる"問題を防止](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-45h5-f7g3-gr8r)（CVE-2024-22412）
## 2024年3月14日 {#march-14-2024}

このリリースでは、新しいクラウドコンソールの体験、S3およびGCSからのバルクロード用のClickPipes、KafkaでのClickPipesにおけるAvroフォーマットのサポートを早期アクセスとして提供します。また、ClickHouseデータベースのバージョンを24.1にアップグレードし、新しい関数のサポートやパフォーマンスおよびリソース使用の最適化をもたらします。
### コンソールの変更 {#console-changes-2}
- 新しいクラウドコンソールの体験が早期アクセスとして提供されています（参加したい場合はサポートにご連絡ください）。
- S3およびGCSからのバルクロード用のClickPipesが早期アクセスとして提供されています（参加したい場合はサポートにご連絡ください）。
- KafkaのClickPipesにおけるAvroフォーマットのサポートが早期アクセスとして利用可能です（参加したい場合はサポートにご連絡ください）。
### ClickHouseバージョンのアップグレード {#clickhouse-version-upgrade}
- FINALに対する最適化、ベクトル化の改善、より迅速な集計 - [23.12リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final)で詳細を確認してください。
- Punycodeの処理、文字列の類似性、外れ値の検出、マージおよびKeeperのメモリ最適化のための新しい関数を追加 - [24.1リリースブログ](https://clickhouse.com/blog/clickhouse-release-24-01)および[プレゼンテーション](https://presentations.clickhouse.com/release_24.1/)で詳細を確認してください。
- このClickHouseクラウドバージョンは24.1に基づいており、新機能、パフォーマンスの改善、バグ修正が数十件あります。コアデータベースの[changelog](/whats-new/changelog/2023#2312)で詳細を確認してください。
### 統合の変更 {#integrations-changes-2}
- Grafana：v4へのダッシュボードの移行、アドホックフィルタリングロジックを修正
- Tableauコネクタ：DATENAME関数および「実引数」での丸め処理を修正
- Kafkaコネクタ：接続初期化中のNPEを修正し、JDBCドライバオプションを指定する機能を追加
- Golangクライアント：応答処理のメモリフットプリントを削減し、Date32の極端な値を修正し、圧縮が有効な時のエラーレポートを改善
- Pythonクライアント：datetimeパラメータにおけるタイムゾーンのサポートを改善し、Pandas DataFrameのパフォーマンスを改善
## 2024年2月29日 {#february-29-2024}

このリリースでは、SQLコンソールアプリケーションのロード時間を改善し、ClickPipesでSCRAM-SHA-256認証をサポートし、Kafka Connectへのネスト構造のサポートを拡張します。
### コンソールの変更 {#console-changes-3}
- SQLコンソールアプリケーションの初期ロード時間を最適化
- SQLコンソールのレースコンディションにより「認証に失敗」エラーが発生していた問題を修正
- 指標ページの最近のメモリ割り当て値が時折不正確である問題を修正
- SQLコンソールで時折重複するKILL QUERYコマンドを発行する動作を修正
- KafkaベースのデータソースのためにClickPipesでSCRAM-SHA-256認証方法をサポート追加
### 統合の変更 {#integrations-changes-3}
- Kafkaコネクタ：複雑なネスト構造（Array、Map）のサポートを拡張し、FixedString型のサポートを追加し、複数のデータベースへの取り込みをサポート
- Metabase：ClickHouse 23.8未満との互換性に関する問題を修正
- DBT：モデル作成に設定を渡す機能を追加
- Node.jsクライアント：長時間実行されるクエリ（>1時間）および空の値の優雅な処理をサポート
## 2024年2月15日 {#february-15-2024}

このリリースでは、コアデータベースバージョンのアップグレード、Terraformを介したプライベートリンクの設定機能の追加、Kafka Connectを介した非同期挿入のための正確な一度セマンティクスのサポートを追加します。
### ClickHouseバージョンのアップグレード {#clickhouse-version-upgrade-1}
- S3からの継続的、定期的なデータロードのためのS3Queueテーブルエンジンがプロダクション準備完了 - [こちらをご覧ください](https://clickhouse.com/blog/clickhouse-release-23-11)。
- FINALとSIMD命令に対するベクトル化の改善により、クエリの速度向上 - [こちらをご確認ください](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final)。
- このClickHouseクラウドバージョンは23.12に基づいており、新機能、パフォーマンスの改善、バグ修正が数十件あります。コアデータベースの[changelog](/whats-new/changelog/2023#2312)で詳細を確認してください。
### コンソールの変更 {#console-changes-4}
- Terraformプロバイダーを介してAWSプライベートリンクとGCPプライベートサービスコネクトを設定する機能を追加
- リモートファイルデータインポートの耐障害性を改善
- すべてのデータインポートにインポートステータスの詳細フライアウトを追加
- S3データインポート用のキー/シークレットキー資格情報サポートを追加
### 統合の変更 {#integrations-changes-4}
* Kafka Connect
    * 完全に一度のサポートのためにasync_insertを追加（デフォルトでは無効）
* Golangクライアント
    * DateTimeのバインディング修正
    * バッチ挿入パフォーマンスの向上
* Javaクライアント
    * リクエスト圧縮の問題を修正
### 設定の変更 {#settings-changes}
* `use_mysql_types_in_show_columns`はもはや必要ありません。MySQLインターフェースを介して接続すると自動的に有効になります。
* `async_insert_max_data_size`のデフォルト値は`10 MiB`になりました。
## 2024年2月2日 {#february-2-2024}

このリリースでは、Azure Event Hub向けのClickPipesの利用可能性を高め、v4 ClickHouse Grafanaコネクタを使用したログやトレースのナビゲーションワークフローが大幅に改善され、FlywayおよびAtlasデータベーススキーマ管理ツールをサポートします。
### コンソールの変更 {#console-changes-5}
* Azure Event Hub向けのClickPipesのサポートを追加
* 新しいサービスは、デフォルトのアイドリング時間を15分に設定されます。
### 統合の変更 {#integrations-changes-5}
* [Grafana用のClickHouseデータソース](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/) v4リリース
  * SQLビルダーを完全に再構築し、テーブル、ログ、タイムシリーズ、トレース用の特化したエディタを持つ
  * より複雑でダイナミックなクエリをサポートするSQLジェネレーターを完全に再構築
  * ログおよびトレースビューでのOpenTelemetryのファーストクラスサポートを追加
  * ログおよびトレースのデフォルトテーブルおよびカラムを指定できるように設定を拡張
  * カスタムHTTPヘッダーを指定する能力を追加
  * さらに多くの改善点があります - 完全な[changelog](https://github.com/grafana/clickhouse-datasource/blob/main/CHANGELOG.md#400)を確認してください。
* データベーススキーマ管理ツール
  * [FlywayにClickHouseサポートが追加](https://github.com/flyway/flyway-community-db-support/packages/2037428)
  * [Ariga AtlasにClickHouseサポートが追加](https://atlasgo.io/blog/2023/12/19/atlas-v-0-16#clickhouse-beta-program)
* Kafkaコネクタのシンク
  * デフォルト値を持つテーブルへの取り込みを最適化
  * DateTime64における文字列ベースの日付のサポートを追加
* Metabase
  * 複数のデータベースへの接続のサポートを追加
## 2024年1月18日 {#january-18-2024}

このリリースでは、AWSの新しいリージョン（ロンドン/eu-west-2）が追加され、Redpanda、Upstash、およびWarpstreamに対するClickPipesのサポートが追加され、[is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted)コアデータベース機能の信頼性が向上しました。
### 一般的な変更 {#general-changes}
- 新しいAWSリージョン：ロンドン（eu-west-2）
### コンソールの変更 {#console-changes-6}
- Redpanda、Upstash、およびWarpstreamに対するClickPipesのサポートを追加
- ClickPipesの認証メカニズムをUIで設定可能に
### 統合の変更 {#integrations-changes-6}
- Javaクライアント：
  - 破壊的変更：呼び出し時にランダムURLハンドルを指定する機能を削除。これはClickHouseから削除されました。
  - 廃止：Java CLIクライアントおよびGRPCパッケージ
  - RowBinaryWithDefaultsフォーマットのサポートを追加し、バッチサイズとClickHouseインスタンスでの作業負荷を軽減（Exabeamによるリクエスト）
  - Date32およびDateTime64の範囲境界をClickHouseと互換性を持たせ、Spark Array文字列型との互換性、ノード選択メカニズム
- Kafkaコネクタ：Grafana用のJMX監視ダッシュボードを追加
- PowerBI：ODBCドライバ設定をUIで設定可能に
- JavaScriptクライアント：クエリサマリー情報を公開し、特定のカラムのサブセットを挿入するために提供し、ウェブクライアント用にkeep_aliveを設定可能に
- Pythonクライアント：SQLAlchemy用にNothing型サポートを追加
### 信頼性の向上 {#reliability-changes}
- ユーザー向けの後方互換性のない変更：以前は、特定の条件下で2つの機能（[is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted)および ``OPTIMIZE CLEANUP``）がClickHouse内のデータの破損を引き起こす可能性がありました。ユーザーのデータの整合性を保護し、機能のコアを保持するため、私たちはこの機能の動作を調整しました。具体的には、MergeTree設定の``clean_deleted_rows``は非推奨となり、もはや効果を持ちません。また、``CLEANUP``キーワードはデフォルトで許可されなくなります（これを使用するには``allow_experimental_replacing_merge_with_cleanup``を有効にする必要があります）。``CLEANUP``を使用することにした場合は、常に``FINAL``と一緒に使用することを確認し、``OPTIMIZE FINAL CLEANUP``を実行した後に古いバージョンの行が挿入されないことを保証する必要があります。
## 2023年12月18日 {#december-18-2023}

このリリースでは、GCPの新しいリージョン（us-east1）、セルフサービスの安全なエンドポイント接続の能力、DBT 1.7を含む追加の統合のサポート、および多数のバグ修正およびセキュリティ強化が追加されました。
### General changes {#general-changes-1}
- ClickHouse Cloud は現在 GCP us-east1 (サウスカロライナ) リージョンで利用可能です
- OpenAPI を介して AWS Private Link と GCP Private Service Connect を設定する機能を有効化しました
### Console changes {#console-changes-7}
- Developer ロールを持つユーザーが SQL コンソールにシームレスにログインできるようになりました
- オンボーディング中のアイドリングコントロール設定のワークフローを簡素化しました
### Integrations changes {#integrations-changes-7}
- DBT コネクタ: DBT バージョン 1.7 までのサポートを追加しました
- Metabase: Metabase v0.48 のサポートを追加しました
- PowerBI コネクタ: PowerBI Cloud での実行機能を追加しました
- ClickPipes 内部ユーザーの権限を設定可能にしました
- Kafka Connect
  - Nullable タイプの重複排除ロジックと取り込みを改善しました
  - テキストベース形式 (CSV, TSV) に対応しました
- Apache Beam: Boolean および LowCardinality タイプのサポートを追加しました
- Nodejs クライアント: Parquet フォーマットのサポートを追加しました
### Security announcements {#security-announcements}
- 3 つのセキュリティ脆弱性を修正しました。詳細は [security changelog](/whats-new/security-changelog) を参照してください:
  - CVE 2023-47118 (CVSS 7.0) - 9000/tcp ポートでデフォルトで実行されるネイティブインターフェースに影響するヒープバッファオーバーフロー脆弱性
  - CVE-2023-48704 (CVSS 7.0) - 9000/tcp ポートでデフォルトで実行されるネイティブインターフェースに影響するヒープバッファオーバーフロー脆弱性
  - CVE 2023-48298 (CVSS 5.9) - FPC 圧縮コーデックにおける整数アンダーフロー脆弱性
## November 22, 2023 {#november-22-2023}

このリリースではコアデータベースバージョンがアップグレードされ、ログインおよび認証フローの改善、Kafka Connect Sink へのプロキシサポートが追加されました。
### ClickHouse version upgrade {#clickhouse-version-upgrade-2}

- Parquet ファイルの読み取りパフォーマンスが大幅に改善されました。詳細は [23.8 release blog](https://clickhouse.com/blog/clickhouse-release-23-08) を参照してください。
- JSON の型推論サポートが追加されました。詳細は [23.9 release blog](https://clickhouse.com/blog/clickhouse-release-23-09) を参照してください。
- アナリスト向けの強力な関数 `ArrayFold` が導入されました。詳細は [23.10 release blog](https://clickhouse.com/blog/clickhouse-release-23-10) を参照してください。
- **ユーザ向けの後方互換性のない変更**: JSON 形式の文字列から数値を推測しないように `input_format_json_try_infer_numbers_from_strings` の設定をデフォルトで無効にしました。これにより、サンプルデータに数値に似た文字列が含まれる場合にパースエラーが発生する可能性があります。
- 数十の新機能、パフォーマンスの改善、バグ修正が行われました。詳細は [core database changelogs](/whats-new/changelog) を参照してください。
### Console changes {#console-changes-8}

- ログインおよび認証フローが改善されました。
- 大規模なスキーマをよりよくサポートするためのAIを用いたクエリ提案が改善されました。
### Integrations changes {#integrations-changes-8}

- Kafka Connect Sink: プロキシサポート、`topic-tablename` マッピング、Keeper _exactly-once_ 配信プロパティの設定が可能になりました。
- Node.js クライアント: Parquet フォーマットのサポートを追加しました。
- Metabase: `datetimeDiff` 関数のサポートを追加しました。
- Python クライアント: カラム名での特殊文字のサポートを追加しました。タイムゾーンパラメータバインディングを修正しました。
## November 2, 2023 {#november-2-2023}

このリリースでは、アジア地域での開発サービスの地域サポートが拡大し、顧客管理の暗号化キーに対してキー回転機能を導入し、請求コンソールでの税設定の粒度が改善され、サポートされている言語クライアントで多数のバグ修正が行われました。
### General updates {#general-updates-1}
- 開発サービスは現在 AWS の `ap-south-1` (ムンバイ) および `ap-southeast-1` (シンガポール) で利用可能です
- 顧客が管理する暗号化キー (CMEK) に対するキー回転のサポートを追加しました
### Console changes {#console-changes-9}
- クレジットカード追加時に細かい税設定を構成する機能を追加しました
### Integrations changes {#integrations-changes-9}
- MySQL
  - MySQL経由での Tableau Online と QuickSight サポートが改善されました
- Kafka コネクタ
  - テキストベース形式 (CSV, TSV) をサポートするための新しい StringConverter が導入されました
  - Bytes と Decimal データタイプのサポートを追加しました
  - Retryable Exceptions を常に再試行するように調整しました（errors.tolerance=all の場合も）
- Node.js クライアント
  - ストリームされた大規模データセットが破損した結果を提供する問題を修正しました
- Python クライアント
  - 大量挿入時のタイムアウトを修正しました
  - NumPy/Pandas Date32 の問題を修正しました
​​- Golang クライアント
  - JSON カラムへの空のマップの挿入、圧縮バッファのクリーンアップ、クエリエスケープ、IPv4 と IPv6 の zero/nil でパニックになる問題を修正しました
  - キャンセルされた挿入に対する watchdog を追加しました
- DBT
  - テストを用いた分散テーブルのサポートを改善しました
## October 19, 2023 {#october-19-2023}

このリリースは SQL コンソールの使いやすさとパフォーマンスの改善、Metabase コネクタにおける IP データ型の取り扱いの改善、Java および Node.js クライアントの新機能をもたらしました。
### Console changes {#console-changes-10}
- SQL コンソールの使いやすさが改善されました（例：クエリ実行間でのカラム幅の保持）
- SQL コンソールのパフォーマンスが改善されました
### Integrations changes {#integrations-changes-10}
- Java クライアント:
  - デフォルトのネットワークライブラリを切り替え、パフォーマンスを改善し、オープン接続を再利用します
  - プロキシサポートを追加しました
  - Trust Store を使用した安全な接続のサポートを追加しました
- Node.js クライアント: 挿入クエリのための keep-alive の挙動を修正しました
- Metabase: IPv4/IPv6 カラムのシリアル化を修正しました
## September 28, 2023 {#september-28-2023}

このリリースは Kafka、Confluent Cloud、および Amazon MSK の ClickPipes の一般提供をもたらし、Kafka Connect ClickHouse Sink、IAM ロールを介して Amazon S3 に対する安全なアクセスを提供し、AI によるクエリ提案 (プライベートプレビュー) を有効にします。
### Console changes {#console-changes-11}
- [Amazon S3 への IAM ロールを介した安全なアクセス](/cloud/security/secure-s3) のためのセルフサービスワークフローを追加しました
- プライベートプレビューで AI 支援のクエリ提案を導入しました（ぜひ [ClickHouse Cloud サポートに連絡](https://console.clickhouse.cloud/support)して試してみてください！）
### Integrations changes {#integrations-changes-11}
- ClickPipes の一般提供を発表しました - Kafka、Confluent Cloud、Amazon MSK 用のターンキーのデータ取り込みサービスです（[リリースブログ](https://clickhouse.com/blog/clickpipes-is-generally-available)を参照）
- Kafka Connect ClickHouse Sink の一般提供が開始されました
  - `clickhouse.settings` プロパティを使用してカスタマイズされた ClickHouse 設定のサポートが拡張されました
  - 動的フィールドを考慮した重複排除の動作が改善されました
  - ClickHouse からのテーブル変更を再取得するための `tableRefreshInterval` サポートが追加されました
- PowerBI と ClickHouse データ型間の SSL 接続問題とタイプマッピングの修正
## September 7, 2023 {#september-7-2023}

このリリースでは PowerBI Desktop公式コネクタのベータ版、インド向けのクレジットカード払い処理の改善、サポートされている言語クライアント間での複数の改善が導入されました。
### Console changes {#console-changes-12}
- インドからの課金をサポートするために残りのクレジットと支払いの再試行を追加しました
### Integrations changes {#integrations-changes-12}
- Kafka コネクタ: ClickHouse 設定の構成を追加し、error.tolerance 構成オプションを追加しました
- PowerBI Desktop: 公式コネクタのベータ版をリリースしました
- Grafana: Point 地理タイプのサポートを追加し、データアナリストダッシュボードでのパネルを修正し、timeInterval マクロを修正しました
- Python クライアント: Pandas 2.1.0 との互換性があり、Python 3.7 サポートを廃止し、Nullable JSON タイプのサポートを追加しました
- Node.js クライアント: default_format 設定サポートを追加しました
- Golang クライアント: bool タイプの扱いを修正し、文字列制限を削除しました
## Aug 24, 2023 {#aug-24-2023}

このリリースでは ClickHouse データベースに対する MySQL インターフェースのサポートを追加し、新しい公式 PowerBI コネクタを導入し、クラウドコンソールに「Running Queries」ビューを追加し、ClickHouse バージョンを 23.7 に更新しました。
### General updates {#general-updates-2}
- [MySQL wire protocol](/interfaces/mysql) のサポートを追加しました。これにより、さまざまな BI ツールとの互換性が実現されます。この機能を組織内で有効にするにはサポートにお問い合わせください。
- 新しい公式 PowerBI コネクタを導入しました
### Console changes {#console-changes-13}
- SQL コンソールに「Running Queries」ビューを追加しました
### ClickHouse 23.7 version upgrade {#clickhouse-237-version-upgrade}
- Azure Table 関数のサポートを追加し、地理データタイプを製品向けに準備し、ジョインのパフォーマンスを改善しました。詳細は 23.5 リリース [ブログ](https://clickhouse.com/blog/clickhouse-release-23-05) を参照してください。
- MongoDB 統合のサポートをバージョン 6.0 に拡張しました。23.6 リリース [ブログ](https://clickhouse.com/blog/clickhouse-release-23-06) を参照してください。
- Parquet フォーマットへの書き込みパフォーマンスを 6 倍改善し、PRQL クエリ言語のサポートを追加し、SQL 互換性を改善しました。詳細は 23.7 リリース [デッキ](https://presentations.clickhouse.com/release_23.7/) を参照してください。
- 数十の新機能、パフォーマンス改善、バグ修正が行われました。詳細は 23.5, 23.6, 23.7 の詳細な [changelogs](/whats-new/changelog) を参照してください。
### Integrations changes {#integrations-changes-13}
- Kafka コネクタ: Avro 日付および時間タイプのサポートを追加しました
- JavaScript クライアント: ウェブベースの環境用の安定版をリリースしました
- Grafana: フィルタロジック、データベース名の処理を改善し、サブ秒精度を持つ TimeInterval のサポートを追加しました
- Golang クライアント: バッチおよび非同期データロードの問題を修正しました
- Metabase: v0.47 のサポートを追加し、接続のなりすましを追加し、データ型マッピングを修正しました
## July 27, 2023 {#july-27-2023}

このリリースでは Kafka の ClickPipes プライベートプレビュー、新しいデータロードエクスペリエンス、クラウドコンソールを使用して URL からファイルをロードする機能が提供されます。
### Integrations changes {#integrations-changes-14}
- Kafka 用の [ClickPipes](https://clickhouse.com/cloud/clickpipes) のプライベートプレビューが導入されました。これは、Kafka および Confluent Cloud から大量のデータを取り込むことを簡素化するクラウドネイティブ統合エンジンです。この機能を利用するには待機リストにサインアップしてください [ここ](https://clickhouse.com/cloud/clickpipes#joinwaitlist)。
- JavaScript クライアント: ウェブベースの環境 (ブラウザ、Cloudflare ワーカー) のサポートをリリースしました。コードはコミュニティがカスタム環境用のコネクタを作成できるようにリファクタリングされています。
- Kafka コネクタ: Timestamp および Time Kafka タイプ用のインラインスキーマのサポートを追加しました
- Python クライアント: 挿入圧縮と LowCardinality の読み取り問題を修正しました
### Console changes {#console-changes-14}
- テーブル作成設定オプションを増やした新しいデータロードエクスペリエンスを追加しました
- クラウドコンソールを使用して URL からファイルをロードする機能を導入しました
- 異なる組織に参加するオプションやすべての未解決の招待状を表示する追加オプションを使って招待フローを改善しました
## July 14, 2023 {#july-14-2023}

このリリースでは、専用サービスを起動する機能、オーストラリアの新しい AWS リージョン、ディスク上のデータを暗号化するための独自の鍵を持ち込む機能が追加されます。
### General updates {#general-updates-3}
- 新しい AWS オーストラリアリージョン: シドニー (ap-southeast-2)
- 遅延に敏感な負荷に対応するための専用サービス tier (設定に関しては [support](https://console.clickhouse.cloud/support) にお問い合わせください)
- ディスク上のデータを暗号化するための独自のキー (BYOK) の持ち込み機能 (設定に関しては [support](https://console.clickhouse.cloud/support) にお問い合わせください)
### Console changes {#console-changes-15}
- 非同期挿入用の可観測性メトリクスダッシュボードを改善しました
- サポートとの統合のためのチャットボットの挙動を改善しました
### Integrations changes {#integrations-changes-15}
- NodeJS クライアント: ソケットタイムアウトによる接続失敗のバグを修正しました
- Python クライアント: 挿入クエリに QuerySummary を追加し、データベース名での特殊文字をサポートしました
- Metabase: JDBC ドライババージョンを更新し、DateTime64 のサポートを追加し、パフォーマンスを改善しました。
### Core database changes {#core-database-changes}
- [Query cache](/operations/query-cache) を ClickHouse Cloud で有効にできます。これが有効になっている場合、成功したクエリはデフォルトで 1 分間キャッシュされ、その後のクエリはキャッシュ結果を使用します。
## June 20, 2023 {#june-20-2023}

このリリースでは ClickHouse Cloud が GCP で一般提供され、Cloud API 用の Terraform プロバイダが導入され、ClickHouse のバージョンが 23.4 に更新されます。
### General updates {#general-updates-4}
- GCP での ClickHouse Cloud が GA になり、GCP Marketplace 統合、Private Service Connect のサポート、自動バックアップが追加されました（詳細は [ブログ](https://clickhouse.com/blog/clickhouse-cloud-on-google-cloud-platform-gcp-is-generally-available) と [プレスリリース](https://clickhouse.com/blog/clickhouse-cloud-expands-choice-with-launch-on-google-cloud-platform) を参照してください）
- [Terraform プロバイダ](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) が Cloud API のために利用可能になりました
### Console changes {#console-changes-16}
- サービス用の新しい統合設定ページが追加されました
- ストレージと計算のメータリング精度が調整されました
### Integrations changes {#integrations-changes-16}
- Python クライアント: 挿入パフォーマンスが改善され、内部依存関係がリファクタリングされてマルチプロセスをサポートしました
- Kafka コネクタ: Confluent Cloud にアップロードおよびインストールでき、接続問題のための再試行を追加し、自動的に不正なコネクタ状態をリセットします
### ClickHouse 23.4 version upgrade {#clickhouse-234-version-upgrade}
- 並列レプリカ用の JOIN サポートを追加しました (設定に関しては [support](https://console.clickhouse.cloud/support) にお問い合わせください)
- 軽量削除のパフォーマンスを改善しました
- 大規模挿入中の処理時のキャッシングが改善されました
### Administration changes {#administration-changes-1}
- "default" ユーザー以外のローカル辞書作成を拡張しました
## May 30, 2023 {#may-30-2023}

このリリースでは ClickHouse Cloud プログラム API の一般公開が行われ、Klipse の IAM ロールを使用した S3 アクセス、および追加のスケーリングオプションが提供されます。
### General changes {#general-changes-2}
- ClickHouse Cloud の API サポート。新しい Cloud API を使用することで、既存の CI/CD パイプラインにサービス管理を統合し、プログラムによってサービスを管理できます
- IAM ロールによる S3 アクセス。これにより、プライベートな Amazon Simple Storage Service (S3) バケットに安全にアクセスできます（設定に関してはサポートにお問い合わせください）
### Scaling changes {#scaling-changes}
- [Horizontal scaling](/manage/scaling#adding-more-nodes-horizontal-scaling)。より多くの並列化が必要なワークロードを最大 10 レプリカで構成できるようになりました（設定に関してはサポートにお問い合わせください）
- [CPU based autoscaling](/manage/scaling)。CPU バウンドのワークロードは、自動スケーリングポリシーのための追加のトリガーを利用できるようになりました
### Console changes {#console-changes-17}
- Dev サービスを Production サービスに移行する機能を追加しました（サポートにコンタクトして有効にしてください）
- インスタンス作成フロー中のスケーリング設定コントロールを追加しました
- デフォルトパスワードがメモリに存在しない場合の接続文字列を修正しました
### Integrations changes {#integrations-changes-17}
- Golang クライアント: ネイティブプロトコルでの不均衡な接続を引き起こす問題を修正し、ネイティブプロトコルでのカスタム設定のサポートを追加しました
- Nodejs クライアント: nodejs v14 のサポートを廃止し、v20 のサポートを追加しました
- Kafka コネクタ: LowCardinality タイプのサポートを追加しました
- Metabase: 時間範囲でのグループ化を修正し、ビルトイン Metabase 質問での整数のサポートを修正しました
### Performance and reliability {#performance-and-reliability}
- 書き込み重視のワークロードの効率とパフォーマンスが改善されました
- バックアップの速度と効率を向上させるために増分バックアップ戦略を展開しました
## May 11, 2023 {#may-11-2023}

このリリースでは ClickHouse Cloud が GCP で提供される~~パブリックベータ~~ (現在は GA です、上記の 6 月 20 日のエントリを参照) が導入され、管理者の権限がクエリの停止権限を付与する能力を拡張し、クラウドコンソールにおける MFA ユーザーの状態の可視化が追加されました。
### ClickHouse Cloud on GCP ~~(Public Beta)~~ (現在は GA です、上記の 6 月 20 日のエントリを参照) {#clickhouse-cloud-on-gcp-public-beta-now-ga-see-june-20th-entry-above}
- Google Compute と Google Cloud Storage の上に構築されたフルマネージドの分離ストレージおよびコンピュータ ClickHouse 提供を開始しました
- アイオワ (us-central1)、オランダ (europe-west4)、シンガポール (asia-southeast1) リージョンでの提供が開始されました
- これら 3 リージョンすべてで開発および本番サービスの両方をサポートします
- デフォルトで強力なセキュリティを提供します: 通信中のエンドツーエンド暗号化、データの暗号化、IP 許可リスト
### Integrations changes {#integrations-changes-18}
- Golang クライアント: プロキシ環境変数サポートを追加しました
- Grafana: Grafana データソース設定で ClickHouse のカスタム設定およびプロキシ環境変数を指定する機能を追加しました
- Kafka コネクタ: 空のレコードの取り扱いを改善しました
### Console changes {#console-changes-18}
- ユーザーリストにおける多要素認証 (MFA) の使用に関するインジケーターを追加しました
### Performance and reliability {#performance-and-reliability-1}
- 管理者のクエリ終了権限に対する制御をより詳細に追加しました
## May 4, 2023 {#may-4-2023}

このリリースでは新しいヒートマップチャートタイプを追加し、請求使用量ページを改善し、サービスの起動時間を短縮しました。
### Console changes {#console-changes-19}
- SQL コンソールにヒートマップチャートタイプを追加しました
- 請求使用量ページを改善し、各請求ディメンションごとの消費クレジットを表示します
### Integrations changes {#integrations-changes-19}
- Kafka コネクタ: 一時接続エラーのための再試行メカニズムを追加しました
- Python クライアント: HTTP 接続が永遠に再利用されないようにするための max_connection_age 設定を追加しました。これは特定の負荷分散問題に役立ちます
- Node.js クライアント: Node.js v20 のサポートを追加しました
- Java クライアント: クライアント証明書認証のサポートを改善し、ネストされた Tuple/Map/Nested タイプのサポートを追加しました
### Performance and reliability {#performance-and-reliability-2}
- 多数のパーツの存在下でのサービス起動時間が改善されました
- SQL コンソール内の長いクエリのキャンセルロジックが最適化されました
### Bug fixes {#bug-fixes}
- 「Cell Towers」サンプルデータセットのインポートが失敗するバグを修正しました
## April 20, 2023 {#april-20-2023}

このリリースでは ClickHouse のバージョンが 23.3 に更新され、コールドリードの速度が大幅に向上し、サポートとのリアルタイムチャットが可能になります。
### Console changes {#console-changes-20}
- サポートとのリアルタイムチャットのオプションを追加しました
### Integrations changes {#integrations-changes-20}
- Kafka コネクタ: Nullable タイプのサポートを追加しました
- Golang クライアント: 外部テーブルのサポート、boolean およびポインタタイプパラメータバインディングを追加しました
### Configuration changes {#configuration-changes}
- 大規模テーブルを削除する機能を追加しました - `max_table_size_to_drop` および `max_partition_size_to_drop` 設定を上書きすることで
### Performance and reliability {#performance-and-reliability-3}
- `allow_prefetched_read_pool_for_remote_filesystem` 設定を使用して S3 プリフェッチを行うことでコールドリードの速度を改善しました
### ClickHouse 23.3 version upgrade {#clickhouse-233-version-upgrade}
- 軽量削除が生産環境向けに準備されました - 詳細は 23.3 リリース [ブログ](https://clickhouse.com/blog/clickhouse-release-23-03) を参照してください
- マルチステージ PREWHERE サポートを追加しました - 詳細は 23.2 リリース [ブログ](https://clickhouse.com/blog/clickhouse-release-23-03) を参照してください
- 数十の新機能、パフォーマンスの改善、バグ修正が行われました - 詳細は 23.3 および 23.2 の詳細な [changelogs](/whats-new/changelog/index.md) を参照してください
## April 6, 2023 {#april-6-2023}

このリリースはクラウドエンドポイントを取得するための API、最小アイドルタイムアウトに対する高度なスケーリング制御、Python クライアントのクエリメソッドに対する外部データのサポートを提供します。
### API changes {#api-changes}
* [Cloud Endpoints API](//cloud/get-started/query-endpoints.md) を介して ClickHouse Cloud エンドポイントをプログラムでクエリする機能を追加しました
### Console changes {#console-changes-21}
- 高度なスケーリング設定に「最小アイドルタイムアウト」設定を追加しました
- データロードモーダルにおけるスキーマ推論のためのベストエフォート datetime 検出を追加しました
### Integrations changes {#integrations-changes-21}
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): 複数スキーマのサポートを追加しました
- [Go client](/integrations/language-clients/go/index.md): TLS 接続のアイドル接続の生存確認を修正しました
- [Python client](/integrations/language-clients/python/index.md)
  - クエリメソッドに対する外部データのサポートを追加しました
  - クエリ結果のタイムゾーンサポートを追加しました
  - `no_proxy`/`NO_PROXY` 環境変数のサポートを追加しました
  - Nullable タイプの NULL 値に対するサーバーサイドパラメータバインディングを修正しました
### Bug fixes {#bug-fixes-1}
* SQL コンソールから `INSERT INTO … SELECT …` を実行するときに行制限を誤って適用する動作を修正しました
## March 23, 2023 {#march-23-2023}

このリリースはデータベースパスワードの複雑さルール、大規模バックアップの復元速度の著しい向上、Grafana Trace View でのトレースの表示サポートをもたらします。
### Security and reliability {#security-and-reliability}
- コアデータベースのエンドポイントはパスワードの複雑さルールを強制します
- 大規模バックアップを復元する時間が改善されました
### Console changes {#console-changes-22}
- 新しいデフォルトとよりコンパクトなビューを導入し、オンボーディングフローを簡素化しました
- サインアップおよびサインインの遅延を縮小しました
### Integrations changes {#integrations-changes-22}
- Grafana:
  - ClickHouse に保存されたトレースデータを Trace View で表示するサポートを追加しました
  - 時間範囲フィルターを改善し、テーブル名内の特殊文字のサポートを追加しました
- Superset: ClickHouse のネイティブサポートを追加しました
- Kafka Connect Sink: 自動日付変換と Null カラム処理を追加しました
- Metabase: 一時テーブルへの挿入を修正し、Pandas Null のサポートを追加しました
- Golang クライアント: タイムゾーン付きの Date タイプを正規化しました
- Java クライアント
  - 圧縮、infile、outfile キーワードの SQL パーサーサポートを追加しました
  - 認証情報オーバーロードを追加しました
  - `ON CLUSTER` とのバッチサポートを修正しました
- Node.js クライアント
  - JSONStrings、JSONCompact、JSONCompactStrings、JSONColumnsWithMetadata フォーマットのサポートを追加しました
  - 全ての主要なクライアントメソッドに対して `query_id` を提供できるようになりました
### Bug fixes {#bug-fixes-2}
- 新サービスの初期プロビジョニングおよび起動時間が遅くなるバグを修正しました
- キャッシュの誤設定によりクエリパフォーマンスが低下するバグを修正しました
## March 9, 2023 {#march-9-2023}

このリリースは可観測性ダッシュボードの改善、大規模バックアップの作成速度の最適化を提供し、大規模なテーブルやパーティションを削除するために必要な設定を加えます。
### Console changes {#console-changes-23}
- 高度な可観測性ダッシュボード (プレビュー) を追加しました
- 可観測性ダッシュボードにメモリアロケーションチャートを追加しました
- SQL コンソールのスプレッドシートビューのスペーシングと改行処理を改善しました
### Reliability and performance {#reliability-and-performance}
- バックアップスケジュールを最適化し、データが変更された場合のみバックアップを実行します
- 大規模バックアップを完了する時間が改善されました
### Configuration changes {#configuration-changes-1}
- クエリまたは接続レベルでの `max_table_size_to_drop` および `max_partition_size_to_drop` 設定を上書きすることで、テーブルやパーティションを削除するための制限を引き上げる機能を追加しました
- ソース IP をクエリログに追加し、ソース IP に基づくクォータおよびアクセス制御の強制を可能にしました
### Integrations {#integrations}
- [Python client](/integrations/language-clients/python/index.md): Pandas のサポートを改善し、タイムゾーン関連の問題を修正しました
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): Metabase 0.46.x との互換性、および SimpleAggregateFunction のサポートを追加しました
- [Kafka-Connect](/integrations/data-ingestion/kafka/index.md): 暗黙の日付変換および Null カラムの改善された取り扱い
- [Java Client](https://github.com/ClickHouse/clickhouse-java): Java マップへのネストされた変換
## February 23, 2023 {#february-23-2023}

このリリースでは ClickHouse 23.1 コアリリースの機能の一部を有効にし、Amazon Managed Streaming for Apache Kafka (MSK) との相互運用性を提供し、アクティビティログで高度なスケーリングおよびアイドル調整を公開します。
### ClickHouse 23.1 version upgrade {#clickhouse-231-version-upgrade}

ClickHouse 23.1 の機能の一部をサポートします。例えば:
- Map タイプを使用した ARRAY JOIN
- SQL 標準の16進数とバイナリリテラル
- 新しい関数、`age()`, `quantileInterpolatedWeighted()`, `quantilesInterpolatedWeighted()`
- 引数なしでの `generateRandom` の挿入テーブルの構造の使用
- 以前の名前を再利用可能にするデータベース作成およびリネームロジックの改善
- 詳細は 23.1 リリースの [ウェビナー資料](https://presentations.clickhouse.com/release_23.1/#cover) 及び [23.1 リリースの changelog](/whats-new/changelog/index.md#clickhouse-release-231) を参照してください
### Integrations changes {#integrations-changes-23}
- [Kafka-Connect](/integrations/data-ingestion/kafka/index.md): Amazon MSK のサポートを追加しました
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): 最初の安定版となる 1.0.0
  - [Metabase Cloud](https://www.metabase.com/start/) で接続を利用可能にしました
  - 利用可能なすべてのデータベースを探求する機能を追加しました
  - AggregationFunction タイプのデータベースの同期を修正しました
- [DBT-clickhouse](/integrations/data-ingestion/etl-tools/dbt/index.md): 最新の DBT バージョン v1.4.1 のサポートを追加しました
- [Python client](/integrations/language-clients/python/index.md): プロキシ及び ssh トンネリングのサポートを改善し、Pandas DataFrames に対するいくつかの修正とパフォーマンス最適化を追加しました
- [Nodejs client](/integrations/language-clients/js.md): クエリ結果に `query_id` を添付する機能をリリースしました。これは `system.query_log` からクエリメトリクスを取得するのに使用できます
- [Golang client](/integrations/language-clients/go/index.md): ClickHouse Cloud とのネットワーク接続を最適化しました
### Console changes {#console-changes-24}
- アクティビティログに高度なスケーリングおよびアイドル設定の調整を追加しました
- パスワードリセットメールにユーザーエージェントと IP 情報を追加しました
- Google OAuth 用のサインアップフローを改善しました
### Reliability and performance {#reliability-and-performance-1}
- 大規模サービスのアイドルからの復元時間を短縮しました
- 多数のテーブルとパーティションを持つサービスの読み取り遅延を改善しました
### Bug fixes {#bug-fixes-3}
- サービスパスワードをリセットする際にパスワードポリシーに従わない動作を修正しました
- 組織招待メールのバリデーションを大文字と小文字を区別しないようにしました
## February 2, 2023 {#february-2-2023}

このリリースは公式にサポートされる Metabase 統合、主要な Java クライアント / JDBC ドライバのリリース、SQL コンソールにおけるビューとマテリアライズドビューのサポートをもたらします。
### Integrations changes {#integrations-changes-24}
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md) プラグイン: ClickHouse によりメンテナンスされる公式ソリューションとなりました
- [dbt](/integrations/data-ingestion/etl-tools/dbt/index.md) プラグイン: [複数スレッド](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md)のサポートを追加しました
- [Grafana](/integrations/data-visualization/grafana/index.md) プラグイン: 接続エラーの取り扱いを改善しました
- [Python](/integrations/language-clients/python/index.md) クライアント: 挿入操作に対する [ストリーミングサポート](/integrations/language-clients/python/index.md#streaming-queries)
- [Go](/integrations/language-clients/go/index.md) クライアント: [バグ修正](https://github.com/ClickHouse/clickhouse-go/blob/main/CHANGELOG.md): キャンセルされた接続のクローズ、接続エラーの処理を改善
- [JS](/integrations/language-clients/js.md) クライアント: exec/insert における[ブレイキングチェンジ](https://github.com/ClickHouse/clickhouse-js/releases/tag/0.0.12); 戻り値の型に query_id を公開
- [Java](https://github.com/ClickHouse/clickhouse-java#readme) クライアント / JDBC ドライバ major release
  - [ブレイキングチェンジ](https://github.com/ClickHouse/clickhouse-java/releases): 非推奨メソッド、クラス、パッケージが削除されました
  - R2DBC ドライバとファイル挿入のサポートを追加しました
### Console changes {#console-changes-25}
- SQL コンソールでのビューとマテリアライズドビューのサポートを追加しました
### Performance and reliability {#performance-and-reliability-4}
- 停止中またはアイドル中のインスタンスに対するパスワードリセット速度を改善しました
- 活動の追跡をより正確に行い、ダウンサイジングの動作を改善しました
- SQL コンソールの CSV エクスポートが切り捨てられるバグを修正しました
- サンプルデータのアップロード失敗が断続的に発生するバグを修正しました
## January 12, 2023 {#january-12-2023}

このリリースでは ClickHouse のバージョンが 22.12 に更新され、さまざまな新しいソースに対する辞書が有効化され、クエリパフォーマンスが向上しました。
### General changes {#general-changes-3}
- 外部 ClickHouse、Cassandra、MongoDB、MySQL、PostgreSQL、Redis など、追加のソースに対する辞書が有効化されました
### ClickHouse 22.12 version upgrade {#clickhouse-2212-version-upgrade}
- Grace Hash Join を含む JOIN サポートを拡張しました
- ファイル読み取りのための Binary JSON (BSON) サポートが追加されました
- GROUP BY ALL の標準 SQL 構文のサポートを追加しました
- 固定精度での小数演算のための新しい数学関数
- 完全な変更リストについては [22.12 リリースブログ](https://clickhouse.com/blog/clickhouse-release-22-12) および [詳細な 22.12 changelog](/whats-new/changelog/2022.md/#-clickhouse-release-2212-2022-12-15) を参照してください
### Console changes {#console-changes-26}
- SQL コンソール内のオートコンプリート機能を改善しました
- デフォルト地域は大陸の地方性を考慮します
- 請求使用ページを改善し、請求とウェブサイトの単位の両方を表示しました
### 統合の変更 {#integrations-changes-25}
- DBT リリース [v1.3.2](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md#release-132-2022-12-23)
  - delete+insert 増分戦略の実験的サポートを追加
  - 新しい s3source マクロ
- Python クライアント [v0.4.8](https://github.com/ClickHouse/clickhouse-connect/blob/main/CHANGELOG.md#048-2023-01-02)
  - ファイル挿入のサポート
  - サーバー側クエリ [パラメータバインディング](/interfaces/cli.md/#cli-queries-with-parameters)
- Go クライアント [v2.5.0](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.5.0)
  - 圧縮のためのメモリ使用量を削減
  - サーバー側クエリ [パラメータバインディング](/interfaces/cli.md/#cli-queries-with-parameters)

### 信頼性とパフォーマンス {#reliability-and-performance-2}
- オブジェクトストアから多数の小さなファイルを取得するクエリの読み取りパフォーマンスを改善
- 新しく開始されたサービスに対して、サービスが最初に起動されたバージョンの [互換性](/cloud/manage/upgrades.md/#use-the-default-settings-of-a-clickhouse-release) 設定を設定

### バグ修正 {#bug-fixes-4}
Advanced Scaling スライダーを使用してリソースを予約すると、すぐに効果が現れます。

## 2022年12月20日 {#december-20-2022}

このリリースでは、管理者が SQL コンソールにシームレスにログインできるようになり、コールドリードの読み取りパフォーマンスが改善され、ClickHouse Cloud 用の Metabase コネクタが改善されました。

### コンソールの変更 {#console-changes-27}
- 管理者ユーザーのために SQL コンソールへのシームレスアクセスを有効化
- 新しい招待者のデフォルトロールを「Administrator」に変更
- オンボーディング調査を追加

### 信頼性とパフォーマンス {#reliability-and-performance-3}
- ネットワーク障害が発生した場合に回復するために、長時間実行される挿入クエリのための再試行ロジックを追加
- コールドリードの読み取りパフォーマンスを改善

### 統合の変更 {#integrations-changes-26}
- [Metabase プラグイン](/integrations/data-visualization/metabase-and-clickhouse.md) が待望の v0.9.1 メジャーアップデートを受けました。これにより、最新の Metabase バージョンに対応し、ClickHouse Cloud に対して徹底的にテストされています。

## 2022年12月6日 - 一般提供 {#december-6-2022---general-availability}

ClickHouse Cloud は現在、SOC2 タイプ II 準拠、プロダクションワークロードの稼働時間 SLA、および公開ステータスページを備えた生産準備が整いました。このリリースには、AWS Marketplace統合、SQL コンソール - ClickHouse ユーザーのためのデータ探索作業台、ClickHouse Academy - ClickHouse Cloud における自己ペースの学習などの新機能が含まれています。この [ブログ](https://clickhouse.com/blog/clickhouse-cloud-generally-available) で詳細を学びましょう。

### 生産準備 {#production-ready}
- SOC2 タイプ II 準拠 (詳細は [ブログ](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant) と [Trust Center](https://trust.clickhouse.com/) を参照)
- ClickHouse Cloud 用の公開 [ステータスページ](https://status.clickhouse.com/)
- プロダクションユースケース向けの稼働時間 SLA 利用可能
- [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc) での入手可能性

### 主な新機能 {#major-new-capabilities}
- ClickHouse ユーザーのためのデータ探索作業台である SQL コンソールを導入
- 自己ペースの学習のための [ClickHouse Academy](https://learn.clickhouse.com/visitor_class_catalog) を開始

### 価格とメーターリングの変更 {#pricing-and-metering-changes}
- トライアル期間を30日間に延長
- スタータープロジェクトや開発/ステージング環境に適した固定容量、低月額支出の開発サービスを導入
- ClickHouse Cloud の運用とスケールを改善し続ける中で、プロダクションサービスの新しい割引価格を導入
- コンピュートメーターリングの際の粒度と忠実度を改善

### 統合の変更 {#integrations-changes-27}
- ClickHouse Postgres / MySQL 統合エンジンのサポートを有効化
- SQL ユーザー定義関数 (UDF) のサポートを追加
- Kafka Connect sink の高度な機能をベータ版の状態に
- バージョン、更新状況などのリッチメタデータを導入した統合 UI の改善

### コンソールの変更 {#console-changes-28}
- クラウドコンソールにおける多要素認証サポート
- モバイルデバイス向けのクラウドコンソールナビゲーションの改善

### ドキュメントの変更 {#documentation-changes}
- ClickHouse Cloud 用の専用 [ドキュメント](/cloud/overview) セクションを導入

### バグ修正 {#bug-fixes-5}
- バックアップからの復元が常に機能しない既知の問題に対処

## 2022年11月29日 {#november-29-2022}

このリリースでは、SOC2 タイプ II 準拠、ClickHouse バージョンの更新を行い、いくつかの ClickHouse クライアントと統合を改善しました。

### 一般的な変更 {#general-changes-4}
- SOC2 タイプ II 準拠を達成 (詳細は [ブログ](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant) と [Trust Center](https://trust.clickhouse.com) を参照)

### コンソールの変更 {#console-changes-29}
- サービスが自動的に一時停止されたことを示す「アイドル」ステータスインジケーターを追加

### ClickHouse 22.11 バージョンアップグレード {#clickhouse-2211-version-upgrade}
- Hudi および DeltaLake テーブルエンジンおよびテーブル関数のサポートを追加
- S3 の再帰的ディレクトリ走査を改善
- 複合時間間隔構文のサポートを追加
- 挿入時の信頼性を改善し、再試行を追加
- 完全な変更リストは [詳細な 22.11 チェンジログ](/whats-new/changelog/2022.md/#-clickhouse-release-2211-2022-11-17) を参照

### 統合 {#integrations-1}
- Python クライアント: v3.11 サポート、挿入パフォーマンスの改善
- Go クライアント: DateTime と Int64 サポートの修正
- JS クライアント: 相互 SSL 認証のサポート
- dbt-clickhouse: DBT v1.3 のサポート

### バグ修正 {#bug-fixes-6}
- アップグレード後に古い ClickHouse バージョンが表示されるバグを修正
- 「default」アカウントの権限変更がセッションを中断しなくなった
- 新しく作成された非管理者アカウントはデフォルトでシステムテーブルへのアクセス権を持たない

### このリリースの既知の問題 {#known-issues-in-this-release}
- バックアップからの復元が依存関係解決により機能しない可能性があります

## 2022年11月17日 {#november-17-2022}

このリリースでは、ローカル ClickHouse テーブルおよび HTTP ソースからの辞書のサポートが有効化され、ムンバイ地域のサポートが導入され、クラウドコンソールのユーザーエクスペリエンスが改善されました。

### 一般的な変更 {#general-changes-5}
- ローカル ClickHouse テーブルおよび HTTP ソースからの [辞書](/sql-reference/dictionaries/index.md) のサポートを追加
- ムンバイ [地域](/cloud/reference/supported-regions.md) のサポートを導入

### コンソールの変更 {#console-changes-30}
- 請求書のフォーマットを改善
- 支払い方法の取得に関するユーザーインターフェイスを簡素化
- バックアップのためのより詳細なアクティビティログを追加
- ファイルアップロード中のエラーハンドリングを改善

### バグ修正 {#bug-fixes-7}
- 一部のパーツに単一の大きなファイルがあるとバックアップが失敗する可能性があるバグを修正
- アクセスリストの変更が同時に適用された場合、バックアップからの復元が成功しないバグを修正

### 既知の問題 {#known-issues}
- バックアップからの復元が依存関係解決により機能しない可能性があります

## 2022年11月3日 {#november-3-2022}

このリリースでは、料金から読み取りおよび書き込み単位を削除し（詳細は [料金ページ](https://clickhouse.com/pricing) を参照）、ClickHouse バージョンを 22.10 に更新し、セルフサービス顧客向けにより高い垂直スケーリングのサポートを追加し、より良いデフォルトを通じて信頼性を向上させました。

### 一般的な変更 {#general-changes-6}
- 料金モデルから読み取り/書き込み単位を削除

### 設定の変更 {#configuration-changes-2}
- `allow_suspicious_low_cardinality_types`、`allow_suspicious_fixed_string_types`、`allow_suspicious_codecs` 設定は、安定性の理由からユーザーによって変更できなくなりました（デフォルトは偽）。

### コンソールの変更 {#console-changes-31}
- 有料顧客向けに垂直スケーリングのセルフサービス最大値を720GBメモリに増加
- バックアップからの復元ワークフローを改善し、IP アクセスリストルールとパスワードを設定
- サービス作成ダイアログに GCP および Azure の待機リストを追加
- ファイルアップロード中のエラーハンドリングを改善
- 請求管理のワークフローを改善

### ClickHouse 22.10 バージョンアップグレード {#clickhouse-2210-version-upgrade}
- 多数の大きなパーツ（少なくとも 10 GiB）の存在下で「パーツが多すぎる」しきい値を緩和することにより、オブジェクトストア上でのマージを改善。これにより、単一のテーブルの単一パーティションにペタバイトのデータを含めることができます。
- 特定の時間しきい値を超えた後にマージを強制するための `min_age_to_force_merge_seconds` 設定を使用して、マージの制御を改善。
- 設定をリセットするために MySQL 互換の構文 `SET setting_name = DEFAULT` を追加。
- モートン曲線エンコーディング、Java 整数ハッシュ、ランダム数生成のための関数を追加。
- 完全な変更リストは [詳細な 22.10 チェンジログ](/whats-new/changelog/2022.md/#-clickhouse-release-2210-2022-10-25) を参照。

## 2022年10月25日 {#october-25-2022}

このリリースでは、小規模なワークロードの計算消費が大幅に削減され、計算料金が引き下げられ（詳細は [料金](https://clickhouse.com/pricing) ページを参照）、より良いデフォルトを通じて安定性が改善され、ClickHouse Cloud コンソールの請求および使用状況ビューが強化されました。

### 一般的な変更 {#general-changes-7}
- 最小サービスメモリアロケーションを 24G に削減
- サービスアイドルタイムアウトを 30 分から 5 分に削減

### 設定の変更 {#configuration-changes-3}
- max_parts_in_total の上限を 100k から 10k に削減。MergeTree テーブルの `max_parts_in_total` 設定のデフォルト値が 100,000 から 10,000 に引き下げられました。この変更の理由は、大量のデータパーツがクラウドのサービスの起動時間を遅くする可能性があることが観察されたためです。大量のパーツは通常、あまりにも粒度の細かいパーティションキーの選択を示しており、これは通常偶発的に行われるべきではないことです。このデフォルトの変更により、これらのケースを早期に検出することが可能になります。

### コンソールの変更 {#console-changes-32}
- トライアルユーザー向けに請求ビューのクレジット使用詳細を強化
- 使用状況ビューに料金ページへのリンクを追加し、ツールチップとヘルプテキストを改善
- IP フィルタリングオプションの切り替え時のワークフローを改善
- クラウドコンソールに再送メール確認ボタンを追加

## 2022年10月4日 - ベータ {#october-4-2022---beta}

ClickHouse Cloud は 2022 年 10 月 4 日にパブリックベータを開始しました。この [ブログ](https://clickhouse.com/blog/clickhouse-cloud-public-beta) で詳細を学びましょう。

ClickHouse Cloud バージョンは、ClickHouse コア v22.10 に基づいています。互換性のある機能のリストについては、[Cloud Compatibility](/cloud/reference/cloud-compatibility.md) ガイドを参照してください。
