---
slug: /whats-new/cloud
sidebar_label: 'クラウド変更ログ'
title: 'クラウド変更ログ'
description: '各ClickHouse Cloudリリースの新機能の説明を提供するClickHouse Cloudの変更ログ'
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

このClickHouse Cloudの変更ログの他に、[Cloud Compatibility](/cloud/reference/cloud-compatibility.md) ページもご確認ください。
## 2025年5月16日 {#may-16-2025}

- ClickHouse Cloud内のサービスが使用しているリソースのビューを提供するResource Utilization Dashboardを導入しました。以下のメトリックがシステムテーブルからスクレイピングされ、このダッシュボードに表示されます：
  * メモリとCPU: `CGroupMemoryTotal` (割り当てられたメモリ)、`CGroupMaxCPU` (割り当てられたCPU)、`MemoryResident` (使用中のメモリ)、および `ProfileEvent_OSCPUVirtualTimeMicroseconds` (使用したCPU) のグラフ
  * データ転送: ClickHouse Cloudからのデータの出入りを示すグラフ。詳細は[こちら](/cloud/manage/network-data-transfer)をご覧ください。
- 新しいClickHouse CloudのPrometheus/Grafanaミックスインの立ち上げを発表できることを嬉しく思います。これは、ClickHouse Cloudサービスの監視を簡素化するために構築されました。このミックスインは、Prometheus互換のAPIエンドポイントを使用して、ClickHouseメトリックを既存のPrometheusおよびGrafanaセットアップにシームレスに統合します。健康状態とサービスのパフォーマンスをリアルタイムで可視化するプレビルドダッシュボードが含まれています。詳細は、[ブログ](https://clickhouse.com/blog/monitor-with-new-prometheus-grafana-mix-in)を参照してください。
## 2025年4月18日 {#april-18-2025}

- 新しい**Member**組織レベルの役割と二つの新しいサービスレベルの役割：**Service Admin**と**Service Read Only**を導入しました。
  **Member**は、SAML SSOユーザーにデフォルトで割り当てられる組織レベルの役割で、サインインおよびプロファイル更新機能のみを提供します。**Service Admin**および**Service Read Only**の役割は、**Member**、**Developer**、または**Billing Admin**の役割を持つユーザーに対しては任意のサービスに割り当てることができます。詳細については、["ClickHouse Cloudのアクセス管理"](https://clickhouse.com/docs/cloud/security/cloud-access-management/overview)をご覧ください。
- ClickHouse Cloudは、以下の地域で**Enterprise**顧客向けに**HIPAA**および**PCI**サービスを提供しています：AWS eu-central-1、AWS eu-west-2、AWS us-east-2。
- **ClickPipes用のユーザー向け通知**を導入しました。この機能は、ClickPipesの失敗に関する自動アラートをメール、ClickHouse Cloud UI、およびSlackで送信します。メールおよびUIでの通知はデフォルトで有効になっており、パイプごとに設定できます。**Postgres CDC ClickPipes**については、アラートにはレプリケーションスロットの閾値（**Settings**タブで設定可能）、特定のエラータイプ、および障害解決手順が含まれます。
- **MySQL CDCプライベートプレビュー**がオープンになりました。これにより、顧客は数回のクリックでMySQLデータベースをClickHouse Cloudにレプリケートでき、高速な分析を可能にし、外部ETLツールの必要性を排除します。このコネクタは、MySQLがクラウド（RDS、Aurora、Cloud SQL、Azureなど）またはオンプレミスの場合でも、連続レプリケーションと一度きりのマイグレーションの両方をサポートしています。プライベートプレビューに登録するには、[このリンク](https://clickhouse.com/cloud/clickpipes/mysql-cdc-connector)をクリックしてください。
- **AWS PrivateLink for ClickPipes**を導入しました。AWS PrivateLinkを使用して、VPC間、AWSサービス、オンプレミスのシステム、およびClickHouse Cloudとのセキュアな接続を確立できます。これにより、Postgres、MySQL、およびAWS上のMSKなどのソースからデータを移動する際に、公共インターネットにトラフィックを公開することなく行えます。また、VPCサービスエンドポイントを通じてクロスリージョンアクセスもサポートしています。PrivateLinkの接続設定は、ClickPipesを通じて[完全にセルフマネージド](https://clickhouse.com/docs/integrations/clickpipes/aws-privatelink)です。
## 2025年4月4日 {#april-4-2025}

- ClickHouse CloudのSlack通知: ClickHouse Cloudは、コンソール内およびメール通知に加えて、請求、スケーリング、およびClickPipesイベントのSlack通知をサポートするようになりました。これらの通知は、ClickHouse Cloud Slackアプリケーションを通じて送信されます。組織の管理者は、通知センターを介して通知が送信されるSlackチャンネルを指定することにより、これらの通知を設定できます。
- プロダクションおよび開発サービスを運営しているユーザーは、今後の請求書でClickPipesとデータ転送の使用料金が表示されるようになります。詳細については、2025年1月の[発表](/cloud/manage/jan-2025-faq/pricing-dimensions)をご覧ください。
## 2025年3月21日 {#march-21-2025}

- AWSのクロスリージョンPrivate Link接続がベータ版に入りました。接続を設定する方法やサポートされている地域のリストについては、ClickHouse Cloudのプライベートリンク[ドキュメント](/manage/security/aws-privatelink)をご覧ください。
- AWS上のサービスに対して利用可能な最大レプリカサイズが236 GiB RAMに設定されました。これにより、効率的な利用が促進され、バックグラウンドプロセスにリソースが割り当てられることが保証されます。
## 2025年3月7日 {#march-7-2025}

- 新しい `UsageCost` APIエンドポイント: API仕様は、使用情報を取得するための新しいエンドポイントをサポートしています。これは組織のエンドポイントで、使用コストは最大31日間クエリできます。取得可能なメトリックには、ストレージ、コンピュート、データ転送、ClickPipesが含まれます。詳細については、[ドキュメント](https://clickhouse.com/docs/cloud/manage/api/usageCost-api-reference)をご覧ください。
- Terraformプロバイダーの[v2.1.0](https://registry.terraform.io/providers/ClickHouse/clickhouse/2.1.0/docs/resources/service#nestedatt--endpoints_configuration)リリースは、MySQLエンドポイントの有効化をサポートします。
## 2025年2月21日 {#february-21-2025}
### AWS向けClickHouseの自分のクラウドを持ち寄る（BYOC）が一般に利用可能になりました！ {#clickhouse-byoc-for-aws-ga}

このデプロイメントモデルでは、データプレーンコンポーネント（コンピュート、ストレージ、バックアップ、ログ、メトリック）が顧客のVPC内で実行され、制御プレーン（ウェブアクセス、API、および請求）はClickHouse VPC内に保持されます。この構成は、すべてのデータが安全な顧客環境内に留まることを保証することにより、厳格なデータ居住要件に準拠する必要がある大規模なワークロードに最適です。

- さらに詳しい情報については、BYOC用の[ドキュメント](/cloud/reference/byoc)や、[発表ブログ記事](https://clickhouse.com/blog/announcing-general-availability-of-clickhouse-bring-your-own-cloud-on-aws)をご覧ください。
- [お問い合わせ](https://clickhouse.com/cloud/bring-your-own-cloud)を通じてアクセスをリクエストできます。
### ClickPipes用のPostgres CDCコネクタ {#postgres-cdc-connector-for-clickpipes}

ClickPipes用のPostgres CDCコネクタがパブリックベータに入りました。この機能により、ユーザーはPostgresデータベースをClickHouse Cloudにシームレスにレプリケートできます。

- 開始するには、ClickPipes Postgres CDCコネクタの[ドキュメント](https://clickhouse.com/docs/integrations/clickpipes/postgres)をご覧ください。
- 顧客のユースケースや機能に関する詳細については、[ランディングページ](https://clickhouse.com/cloud/clickpipes/postgres-cdc-connector)や[立ち上げブログ](https://clickhouse.com/blog/postgres-cdc-connector-clickpipes-public-beta)をご参照ください。
### ClickHouse CloudのAWS向けPCI準拠 {#pci-compliance-for-clickhouse-cloud-on-aws}

ClickHouse Cloudは、**Enterprise tier**顧客向けに**PCI準拠サービス**を**us-east-1**および**us-west-2**地域でサポートするようになりました。PCI準拠の環境でサービスを立ち上げようとするユーザーは、[サポート](https://clickhouse.com/support/program)に連絡して支援を受けることができます。
### Google Cloud Platformにおける透過的データ暗号化および顧客管理キー {#tde-and-cmek-on-gcp}

**透過的データ暗号化（TDE）**および**顧客管理キー（CMEK）**のサポートが、ClickHouse Cloudの**Google Cloud Platform (GCP)**で利用可能になりました。

- これらの機能についての詳細は、[ドキュメント](https://clickhouse.com/docs/cloud/security/cmek#transparent-data-encryption-tde)をご覧ください。
### AWS中東（UAE）の利用可能性 {#aws-middle-east-uae-availability}

ClickHouse Cloudに新しい地域サポートが追加され、**AWS中東（UAE）me-central-1**地域で利用可能になりました。
### ClickHouse Cloudガードレール {#clickhouse-cloud-guardrails}

最良のプラクティスを促進し、ClickHouse Cloudの安定した使用を保証するために、テーブル、データベース、パーティションおよびパーツの数に対するガードレールを設定します。

- 詳細については、ドキュメントの[使用制限](https://clickhouse.com/docs/cloud/bestpractices/usage-limits)セクションをご覧ください。
- 既にこれらの制限を超えているサービスについては、10％の増加が許可されます。質問がある場合は、[サポート](https://clickhouse.com/support/program)にご連絡ください。
## 2025年1月27日 {#january-27-2025}
### ClickHouse Cloudのティア変更 {#changes-to-clickhouse-cloud-tiers}

私たちは、顧客の絶え間ない要求に応えるために製品を適応させることに専念しています。GAで導入されてからの2年間でClickHouse Cloudは大幅に進化し、顧客が私たちのクラウドサービスをどのように利用しているかについて貴重な洞察を得ました。

ClickHouse Cloudサービスのサイズとコスト効率を最適化するために新機能を導入しています。これには、**コンピュート-コンピュートの分離**、高性能のマシンタイプ、および**シングルレプリカサービス**が含まれます。また、自動スケalingと管理アップグレードをよりシームレスかつ反応的に実行できるように進化させています。

最も要求の厳しい顧客やワークロードのニーズに応えるために**新しいEnterprise tier**が追加され、業界特有のセキュリティやコンプライアンス機能、基盤となるハードウェアやアップグレードに対するさらなるコントロール、高度な災害復旧機能に焦点を当てています。

これらの変更をサポートするために、現在の**Development**と**Production**のティアを顧客基盤の進化に合致させる形で再編成しています。新しいアイデアやプロジェクトを試すためのユーザー向けの**Basic**ティアと、プロダクションワークロードやデータを扱うユーザー向けの**Scale**ティアを導入します。

これらの機能変更については[ブログ](https://clickhouse.com/blog/evolution-of-clickhouse-cloud-new-features-superior-performance-tailored-offerings)をお読みください。既存の顧客は、新しい[プラン](https://clickhouse.com/pricing)を選択するためのアクションを取る必要があります。顧客向けのコミュニケーションは組織の管理者にメールで送信され、以下の[FAQ](/cloud/manage/jan-2025-faq/summary)が主要な変更とタイムラインをカバーしています。
### 倉庫: コンピュート-コンピュート分離（GA） {#warehouses-compute-compute-separation-ga}

コンピュート-コンピュート分離（「倉庫」とも呼ばれる）は一般に利用可能になりました。詳細については[ブログ](https://clickhouse.com/blog/introducing-warehouses-compute-compute-separation-in-clickhouse-cloud)や[ドキュメント](/cloud/reference/warehouses)をご覧ください。
### シングルレプリカサービス {#single-replica-services}

「シングルレプリカサービス」という概念を導入します。これはスタンドアロンの提供および倉庫の中で使用されます。スタンドアロンの提供として、シングルレプリカサービスはサイズ制限があり、小さなテストワークロードに使用されることを意図しています。倉庫内で、シングルレプリカサービスはより大きなサイズで展開でき、高可用性を必要としないワークロード（再起動可能なETLジョブなど）に利用されます。
### 垂直オートスケーリングの改善 {#vertical-auto-scaling-improvements}

コンピュートレプリカに対する新しい垂直スケーリングメカニズムを導入します。これを「Make Before Break」（MBB）と呼びます。このアプローチでは、古いレプリカを取り除く前に新しいサイズの1つ以上のレプリカを追加し、スケーリング操作中の容量損失を防ぎます。既存のレプリカを削除することと新しいレプリカを追加する間のギャップを排除し、MBBはよりシームレスで妨げの少ないスケーリングプロセスを創出します。特に高リソース利用率が追加容量の必要性を引き起こすスケールアップシナリオでは、レプリカを早期に削除することでリソース制約がさらに悪化する可能性があるため、特に有益です。
### 水平スケーリング（GA） {#horizontal-scaling-ga}

水平スケーリングが一般に利用可能になりました。ユーザーは、APIやクラウドコンソールを介してサービスの追加レプリカを追加してスケールアウトできます。詳細については[ドキュメント](/manage/scaling#manual-horizontal-scaling)をご参照ください。
### 設定可能なバックアップ {#configurable-backups}

顧客が自分のクラウドアカウントにバックアップをエクスポートできる機能をサポートします。詳細については[ドキュメント](/cloud/manage/backups/configurable-backups)をご覧ください。
### 管理されたアップグレードの改善 {#managed-upgrade-improvements}

安全な管理されたアップグレードは、データベースが機能を追加する際に最新の状態を維持できる重要な価値を提供します。このリリースでは、「Make Before Break」（MBB）のアプローチをアップグレードに適用し、実行中のワークロードへの影響をさらに減少させました。
### HIPAAサポート {#hipaa-support}

私たちは、AWSの`us-east-1`、`us-west-2`およびGCPの`us-central1`、`us-east1`を含む準拠地域でHIPAAをサポートしています。オンボードを希望する顧客は、ビジネスアソシエイト契約（BAA）にサインし、準拠した地域のバージョンに展開する必要があります。HIPAAについての詳細は[ドキュメント](/cloud/security/security-and-compliance)をご覧ください。
### スケジュールされたアップグレード {#scheduled-upgrades}

ユーザーはサービスのアップグレードをスケジュールできます。この機能はEnterprise tierサービスのみにサポートされています。スケジュールされたアップグレードの詳細については[ドキュメント](/manage/updates)をご覧ください。
### 複雑な型の言語クライアントサポート {#language-client-support-for-complex-types}

[Golang](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.30.1)、[Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.11)、および[NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.1)クライアントが動的、バリアント、およびJSON型のサポートを追加しました。
### DBTによるリフレッシュ可能なMaterialized Viewのサポート {#dbt-support-for-refreshable-materialized-views}

DBTは、`1.8.7`リリースで[リフレッシュ可能なMaterialized View](https://github.com/ClickHouse/dbt-clickhouse/releases/tag/v1.8.7)をサポートしました。
### JWTトークンのサポート {#jwt-token-support}

JDBCドライバーv2、clickhouse-java、[Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.12)、および[NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.0)クライアントにJWTベースの認証サポートが追加されました。

JDBC / Javaは、リリース時に[0.8.0](https://github.com/ClickHouse/clickhouse-java/releases/tag/v0.8.0)に入ります - ETAは保留中です。
### Prometheus統合の改善 {#prometheus-integration-improvements}

Prometheus統合のためにいくつかの改善を追加しました：

- **組織レベルのエンドポイント**。ClickHouse Cloud用のPrometheus統合に対する改善を導入しました。サービスレベルのメトリックに加えて、APIには**組織レベルのメトリック**用のエンドポイントが含まれています。この新しいエンドポイントは、組織内のすべてのサービスのメトリックを自動的に収集し、メトリックをPrometheusコレクタにエクスポートするプロセスを簡素化します。これらのメトリックは、GrafanaやDatadogなどの可視化ツールと統合して、組織のパフォーマンスを包括的に把握することができます。

  この機能はすでにすべてのユーザーに提供されています。詳細は[こちら](/integrations/prometheus)をご覧ください。

- **フィルタリングされたメトリック**。ClickHouse Cloud用のPrometheus統合において、フィルタリングされたメトリックのリストを返すことをサポートしました。この機能により、サービスの健康状態を監視するために重要なメトリックに焦点を当てられるため、応答ペイロードサイズを削減できます。

  この機能は、APIのオプションのクエリパラメータを介して利用でき、データ収集を最適化し、GrafanaやDatadogなどのツールとの統合を簡素化するのに役立ちます。

  フィルタリングされたメトリック機能はすでにすべてのユーザーに利用可能です。詳細は[こちら](/integrations/prometheus)をご覧ください。
## 2024年12月20日 {#december-20-2024}
### マーケットプレイスサブスクリプションの組織への添付 {#marketplace-subscription-organization-attachment}

新しいマーケットプレイスサブスクリプションを既存のClickHouse Cloud組織に添付できるようになりました。マーケットプレイスのサブスクリプションが完了し、ClickHouse Cloudにリダイレクトされたら、過去に作成された既存の組織を新しいマーケットプレイスサブスクリプションに接続できます。この時点から、組織内のリソースはマーケットプレイスを通じて請求されます。 

<Image img={add_marketplace} size="md" alt="ClickHouse Cloudインターフェースが既存の組織にマーケットプレイスサブスクリプションを追加する方法を示しています" border />
### OpenAPIキーの期限切れの強制 {#force-openapi-key-expiration}

APIキーの期限オプションを制限し、未期限のOpenAPIキーを作成しないようにすることが可能になりました。これらの制限を有効にするには、ClickHouse Cloudサポートチームにご連絡ください。
### 通知用のカスタムメール {#custom-emails-for-notifications}

組織管理者は、特定の通知に追加受信者としてメールアドレスを追加できるようになりました。これは、必要に応じて別名に通知を送信したり、ClickHouse Cloudのユーザーでない組織内の他のユーザーに通知を送信する際に便利です。これを設定するには、クラウドコンソールの通知設定に移動し、メール通知を受信したいメールアドレスを編集します。
## 2024年12月6日 {#december-6-2024}
### BYOC（ベータ） {#byoc-beta}

AWSの自分のクラウドを持ち寄る（BYOC）が現在ベータ版で利用可能です。このデプロイメントモデルにより、顧客は自分のAWSアカウントでClickHouse Cloudをデプロイおよび実行できます。11以上のAWS地域でのデプロイをサポートしており、今後さらに追加される予定です。[サポートに連絡](https://clickhouse.com/support/program)してアクセスしてください。このデプロイは大規模なデプロイメント専用です。
### Postgres Change-Data-Capture（CDC）コネクタのClickPipes（パブリックベータ） {#postgres-change-data-capture-cdc-connector-in-clickpipes-public-beta}

このターンキー統合により、顧客は数回のクリックでPostgresデータベースをClickHouse Cloudにレプリケートし、ClickHouseを利用して迅速な分析を行うことができます。このコネクタは、Postgresからの継続的レプリケーションおよび一度きりのマイグレーションの両方に使用できます。
### ダッシュボード（ベータ） {#dashboards-beta}

今週、ClickHouse Cloudにダッシュボードのベータ版が立ち上がることをお知らせできることを嬉しく思います。ダッシュボードを使用すると、ユーザーは保存されたクエリを視覚化に変換し、視覚化をダッシュボードに整理し、クエリパラメーターを使用してダッシュボードと対話できます。開始するには、[ダッシュボードのドキュメント](/cloud/manage/dashboards)を参照してください。

<Image img={beta_dashboards} size="lg" alt="ClickHouse Cloudインターフェースが新しいダッシュボードベータ機能を視覚化している様子を示しています" border />
### クエリAPIエンドポイント（GA） {#query-api-endpoints-ga}

ClickHouse CloudでのクエリAPIエンドポイントのGAリリースをお知らせできることを嬉しく思います。クエリAPIエンドポイントを使用すると、保存されたクエリのためのRESTful APIエンドポイントを数回のクリックで作成し、言語クライアントや認証の複雑さに悩まされることなくアプリケーションでデータを消費することができます。初期リリース以降、エンドポイントのレイテンシを減少させる、特にコールドスタート時、エンドポイントRBACコントロールを増加させる、設定可能なCORS許可ドメイン、結果ストリーミング、すべてのClickHouse互換出力形式をサポートするいくつかの改善を導入しました。

これらの改善に加え、既存のフレームワークを活用し、任意のSQLクエリをClickHouse Cloudサービスに対して実行できる一般的なクエリAPIエンドポイントを発表できることを嬉しく思います。一般的なエンドポイントは、サービス設定ページから有効化および構成できます。

開始するには、[クエリAPIエンドポイントのドキュメント](/cloud/get-started/query-endpoints)をご参照ください。

<Image img={api_endpoints} size="lg" alt="ClickHouse Cloudインターフェースがさまざまな設定を持つAPIエンドポイントの構成を示しています" border />
### ネイティブJSONサポート（ベータ） {#native-json-support-beta}

ClickHouse CloudにおけるネイティブJSONサポートのベータを開始します。開始するには、サポートに[連絡してクラウドサービスを有効にしてください](/cloud/support)。
### ベクトル検索：ベクトル類似インデックスを使用 {#vector-search-using-vector-similarity-indexes-early-access}

近似ベクトル検索のためのベクトル類似インデックスを早期アクセスで発表します！

ClickHouseは既に、広範な[距離関数](https://clickhouse.com/blog/reinvent-2024-product-announcements#vector-search-using-vector-similarity-indexes-early-access)や線形スキャンの能力を持つベクトルベースのユースケースを強力にサポートしています。さらに最近、[usearch](https://github.com/unum-cloud/usearch)ライブラリと階層型ナビゲーション小世界（HNSW）近似最近傍検索アルゴリズムを利用した実験的な[近似ベクトル検索](/engines/table-engines/mergetree-family/annindexes)アプローチを追加しました。

開始するには、[早期アクセスのウェイトリストにサインアップしてください](https://clickhouse.com/cloud/vector-search-index-waitlist)。
### ClickHouse-Connect（Python）およびClickHouse-Kafka-Connectユーザー {#clickhouse-connect-python-and-clickhouse-kafka-connect-users}

クライアントが`MEMORY_LIMIT_EXCEEDED`例外に遭遇する問題を経験した顧客に通知メールが送信されました。

アップグレードしてください：
- Kafka-Connect: > 1.2.5
- ClickHouse-Connect（Java）: > 0.8.6
### ClickPipesがAWSでのクロスVPCリソースアクセスをサポート {#clickpipes-now-supports-cross-vpc-resource-access-on-aws}

特定のデータソース（例えばAWS MSK）への単方向アクセスを付与できるようになりました。AWS PrivateLinkおよびVPC Latticeを使用したクロスVPCリソースアクセスにより、プライバシーとセキュリティを損なうことなく、VPCおよびアカウントの境界間、さらにはオンプレミスネットワークから公共ネットワークを通じて個々のリソースを共有できます。リソース共有を開始して設定するには、[発表記事を読んでください](https://clickhouse.com/blog/clickpipes-crossvpc-resource-endpoints?utm_medium=web&utm_source=changelog)。

<Image img={cross_vpc} size="lg" alt="ClickPipesがAWS MSKに接続するためのクロスVPCリソースアクセスアーキテクチャを示す図" border />
### ClickPipesがAWS MSKのIAMをサポート {#clickpipes-now-supports-iam-for-aws-msk}

AWS MSK ClickPipesを使用してMSKブローカーに接続するためにIAM認証を使用できるようになりました。開始するには、[ドキュメント](/integrations/clickpipes/kafka#iam)をご覧ください。
### AWSの新規サービスの最大レプリカサイズ {#maximum-replica-size-for-new-services-on-aws}

これからAWSで作成されるすべての新規サービスは、最大236 GiBのレプリカサイズを許可します。
## 2024年11月22日 {#november-22-2024}
### ClickHouse Cloudのための内蔵高度な可視性ダッシュボード {#built-in-advanced-observability-dashboard-for-clickhouse-cloud}

以前は、ClickHouseサーバーメトリックおよびハードウェアリソースの使用状況を監視するための高度な可視性ダッシュボードはオープンソースのClickHouseでのみ利用可能でした。この機能がClickHouse Cloudコンソールで利用可能になったことを喜んでお知らせします！

このダッシュボードでは、[system.dashboards](/operations/system-tables/dashboards)テーブルに基づいてクエリを一元的なUIで表示できます。「Monitoring > Service Health」ページを訪れて、今日から高度な可視性ダッシュボードを使用を開始してください。

<Image img={nov_22} size="lg" alt="ClickHouse Cloudの高度な可視性ダッシュボードがサーバーメトリックとリソース使用状況を示しています" border />
### AIによるSQL自動補完 {#ai-powered-sql-autocomplete}

自動補完を大幅に改善し、新しいAI Copilotを使ってクエリを作成する際にインラインSQL補完を得られるようになりました！この機能は、任意のClickHouse Cloudサービスの**「Enable Inline Code Completion」**設定を切り替えることで有効化できます。

<Image img={copilot} size="lg" alt="ユーザーが入力する際にSQL自動補完の提案を提供するAI Copilotのアニメーション" border />
### 新しい「Billing」役割 {#new-billing-role}

組織のユーザーに、サービスの設定や管理を行う権限を与えずに請求情報を表示および管理できる新しい**Billing**役割を割り当てることができるようになりました。新しいユーザーを招待するか、既存のユーザーの役割を編集して**Billing**役割を割り当てます。
## 2024年11月8日 {#november-8-2024}
### ClickHouse Cloudの顧客通知 {#customer-notifications-in-clickhouse-cloud}

ClickHouse Cloudは、いくつかの請求およびスケーリングイベントに対してコンソール内およびメール通知を提供します。顧客は、クラウドコンソールの通知センターを介して、UIにのみ表示する、メールを受信する、またはその両方を選択する形で通知を設定できます。通知を受信するサービスレベルでのカテゴリと重要度を設定できます。

今後、他のイベントに対する通知や、通知を受信するための追加の方法を追加する予定です。

サービスの通知を有効にする方法については、[ClickHouseドキュメント](/cloud/notifications)をご覧ください。

<Image img={notifications} size="lg" alt="さまざまな通知タイプの構成オプションを示すClickHouse Cloudの通知センターインターフェース" border />

<br />
## 2024年10月4日 {#october-4-2024}
### ClickHouse CloudがGCPのHIPAA対応サービスをベータで提供中 {#clickhouse-cloud-now-offers-hipaa-ready-services-in-beta-for-gcp}

保護された健康情報（PHI）のセキュリティを強化したい顧客は、Google Cloud Platform (GCP)のClickHouse Cloudにオンボードできるようになりました。ClickHouseは、[HIPAAセキュリティルール](https://www.hhs.gov/hipaa/for-professionals/security/index.html)で規定された管理的、物理的、技術的な保護措置を実施しており、特定のユースケースやワークロードに応じて実施できる設定可能なセキュリティ設定を現在提供しています。利用可能なセキュリティ設定に関する詳細は、[セキュリティ共有責任モデル](/cloud/security/shared-responsibility-model)をご覧ください。

サービスは、**Dedicated**サービスタイプを持つ顧客向けにGCP `us-central-1`で提供されており、ビジネスアソシエイト契約（BAA）が必要です。この機能へのアクセスリクエストやGCP、AWS、Azureの追加地域のウェイトリストへの参加については、[販売部門](mailto:sales@clickhouse.com)または[サポート](https://clickhouse.com/support/program)にお問い合わせください。
### コンピュート-コンピュート分離がGCPとAzureのプライベートプレビューに {#compute-compute-separation-is-now-in-private-preview-for-gcp-and-azure}

AWSのコンピュート-コンピュート分離のプライベートプレビューを最近発表しましたが、GCPとAzureでも利用可能になったことをお知らせできることを嬉しく思います。

コンピュート-コンピュート分離により、特定のサービスを読み書きまたは読み取り専用のサービスとして指定できるため、コストとパフォーマンスを最適化するための最適なコンピュート構成を設計できます。[詳細はドキュメント](/cloud/reference/warehouses)をご確認ください。
### セルフサービスMFAリカバリーコード {#self-service-mfa-recovery-codes}

多要素認証を使用している顧客は、電話を紛失した場合やトークンを誤って削除した場合に使用できるリカバリーコードを取得できるようになりました。初めてMFAに登録する顧客はセットアップ時にコードが提供され、既存のMFAを持つ顧客は、既存のMFAトークンを削除し、新しいものを追加することでリカバリーコードを取得できます。

### ClickPipes Update: カスタム証明書、レイテンシーインサイトなど！ {#clickpipes-update-custom-certificates-latency-insights-and-more}

私たちは、ClickHouseサービスにデータを取り込む最も簡単な方法であるClickPipesの最新の更新情報を共有することに興奮しています！これらの新機能は、データ取り込みに対する制御を強化し、パフォーマンスメトリックに対する可視性を向上させることを目的としています。

*Kafka用のカスタム認証証明書*

ClickPipesは現在、SASLおよび公開SSL/TLSを使用してKafkaブローカー用のカスタム認証証明書をサポートしています。ClickPipeの設定中にSSL証明書セクションで自分の証明書を簡単にアップロードすることができ、Kafkaへのより安全な接続を確保できます。

*KafkaおよびKinesisのレイテンシーメトリックを紹介*

パフォーマンスの可視性は重要です。ClickPipesには、メッセージ生産（KafkaトピックまたはKinesisストリームから）からClickHouse Cloudへの取り込みまでの時間を示すレイテンシーグラフが含まれています。この新しいメトリックにより、データパイプラインのパフォーマンスをより密に監視し、適切に最適化できます。

<Image img={latency_insights} size="lg" alt="データ取り込みパフォーマンスのレイテンシーメトリックグラフを示すClickPipesインターフェース" border />

<br />

*KafkaおよびKinesis用のスケーリングコントロール（プライベートベータ版）*

高スループットは、データボリュームとレイテンシーのニーズを満たすために追加のリソースを必要とする場合があります。ClickPipesの水平スケーリングを紹介します。これは、クラウドコンソールを通じて直接利用可能です。この機能は現在プライベートベータ版にあり、要件に基づいてリソースをより効果的にスケールできるようになります。ベータ参加希望の方は、[サポート](https://clickhouse.com/support/program)にご連絡ください。

*KafkaおよびKinesis用の生メッセージ取り込み*

KafkaまたはKinesisメッセージ全体をパースせずに取り込むことが可能になりました。ClickPipesは現在、ユーザーが完全なメッセージを単一のStringカラムにマッピングできる`_raw_message` [仮想カラム](/integrations/clickpipes/kafka#kafka-virtual-columns)をサポートしています。これにより、生データを必要に応じて扱う柔軟性が得られます。
## 2024年8月29日 {#august-29-2024}
### 新しいTerraformプロバイダーのバージョン - v1.0.0 {#new-terraform-provider-version---v100}

Terraformにより、ClickHouse Cloudサービスをプログラムで制御し、設定をコードとして保存できます。当社のTerraformプロバイダーは、ほぼ200,000ダウンロードを記録しており、現在公式にv1.0.0です！この新バージョンには、より良いリトライロジックや、ClickHouse Cloudサービスにプライベートエンドポイントを接続するための新しいリソースなどの改善が含まれています。[Terraformプロバイダーはこちらから](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest)ダウンロードできます。 [完全な変更ログはこちら](https://github.com/ClickHouse/terraform-provider-clickhouse/releases/tag/v1.0.0)で確認できます。
### 2024 SOC 2タイプIIレポートおよび更新されたISO 27001証明書 {#2024-soc-2-type-ii-report-and-updated-iso-27001-certificate}

私たちは、2024年のSOC 2タイプIIレポートおよび更新されたISO 27001証明書の提供を発表できることを誇りに思っています。これらには、最近開始したAzure上のサービスだけでなく、AWSおよびGCPでのサービスの継続的なカバレッジが含まれています。

私たちのSOC 2タイプIIは、ClickHouseユーザーに提供するサービスのセキュリティ、可用性、処理の完全性、および機密性を達成することへの継続的な取り組みを示しています。詳細については、米国公認会計士協会（AICPA）が発行した[SOC 2 - サービス機関のためのSOC: 信頼サービス基準](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services)や、国際標準化機構（ISO）の[ISO/IEC 27001とは](https://www.iso.org/standard/27001)をご覧ください。

また、セキュリティとコンプライアンスの文書やレポートについては、[Trust Center](https://trust.clickhouse.com/)をご覧ください。
## 2024年8月15日 {#august-15-2024}
### Compute-compute分離がAWSでプライベートプレビューに！ {#compute-compute-separation-is-now-in-private-preview-for-aws}

既存のClickHouse Cloudサービスでは、レプリカは読み取りと書き込みの両方を処理しており、特定のレプリカを単一の操作のみを処理するように構成する方法はありません。Compute-compute分離という新機能が登場します。これにより、特定のサービスを読み書きまたは読み取り専用サービスとして指定して、コストとパフォーマンスを最適化するための理想的なコンピューティング構成を設計できます。

新しいcompute-compute分離機能により、それぞれ独自のエンドポイントを持つ複数のコンピュートノードグループを作成でき、同じオブジェクトストレージフォルダを使用し、したがって同じテーブルやビューなどを持つことができます。 [Compute-compute分離の詳細はこちら](/cloud/reference/warehouses)をお読みください。プライベートプレビューでこの機能にアクセスしたい場合は、[サポートに連絡](https://clickhouse.com/support/program)してください。

<Image img={cloud_console_2} size="lg" alt="読み書きと読み取り専用のサービスグループでのcompute-compute分離の例を示す図" border />
### S3およびGCS用のClickPipesがGAになりました！継続モードサポート {#clickpipes-for-s3-and-gcs-now-in-ga-continuous-mode-support}

ClickPipesはClickHouse Cloudにデータを取り込む最も簡単な方法です。S3およびGCS用の[ClickPipes](https://clickhouse.com/cloud/clickpipes)が**一般に利用可能**になったことをお知らせします。ClickPipesは、一回限りのバッチ取り込みと「継続モード」の両方をサポートしています。取り込みタスクは、特定のリモートバケットからパターンに一致するすべてのファイルをClickHouseの宛先テーブルにロードします。「継続モード」では、ClickPipesジョブは常に実行され、リモートオブジェクトストレージバケットに追加される一致するファイルを取り込みます。これにより、ユーザーは任意のオブジェクトストレージバケットをClickHouse Cloudへのデータ取り込みのための完全なステージングエリアに変えることができます。ClickPipesの詳細については、[ドキュメント](/integrations/clickpipes)をご覧ください。
## 2024年7月18日 {#july-18-2024}
### メトリクス用のPrometheusエンドポイントが一般に利用可能になりました！ {#prometheus-endpoint-for-metrics-is-now-generally-available}

前回のクラウド変更ログでは、ClickHouse Cloudからの[Prometheus](https://prometheus.io/)メトリクスのエクスポートのプライベートプレビューを発表しました。この機能により、[ClickHouse Cloud API](/cloud/manage/api/api-overview)を使用して、[Grafana](https://grafana.com/)や[Datadog](https://www.datadoghq.com/)などのツールにメトリクスを取り込むことができます。この機能は現在**一般に利用可能です**。詳細については、[ドキュメント](/integrations/prometheus)をご覧ください。
### クラウドコンソールのテーブルインスペクター {#table-inspector-in-cloud-console}

ClickHouseには、スキーマを調査するための[`DESCRIBE`](/sql-reference/statements/describe-table)のようなコマンドがあります。これらのコマンドはコンソールに出力されますが、すべてのテーブルとカラムに関する重要なデータを取得するために複数のクエリを組み合わせる必要があるため、便利ではないことがよくあります。

最近、クラウドコンソールに**テーブルインスペクター**を導入しました。これにより、SQLを書かずにUIで重要なテーブルおよびカラム情報を取得できます。クラウドコンソールであなたのサービスのテーブルインスペクターを試すことができます。スキーマ、ストレージ、圧縮などの情報を1つの統一されたインターフェースで提供します。

<Image img={compute_compute} size="lg" alt="詳細なスキーマとストレージ情報を示すClickHouse Cloudテーブルインスペクターインターフェース" border />
### 新しいJavaクライアントAPI {#new-java-client-api}

私たちの[Javaクライアント](https://github.com/ClickHouse/clickhouse-java)は、多くのユーザーがClickHouseに接続するために使用する最も人気のあるクライアントの1つです。私たちは、それをさらに使いやすく、直感的にすることを目指し、APIを再設計し、さまざまなパフォーマンス最適化を行いました。これらの変更により、JavaアプリケーションからClickHouseに接続するのがはるかに簡単になります。更新されたJavaクライアントの使用方法については、この[ブログ記事](https://clickhouse.com/blog/java-client-sequel)をお読みください。
### 新しいアナライザーがデフォルトで有効に！ {#new-analyzer-is-enabled-by-default}

ここ数年、私たちはクエリ分析と最適化のための新しいアナライザーに取り組んできました。このアナライザーはクエリパフォーマンスを改善し、より迅速で効率的な`JOIN`を可能にします。以前は、新しいユーザーが`allow_experimental_analyzer`設定を使用してこの機能を有効にする必要がありました。この改善されたアナライザーは、新しいClickHouse Cloudサービスでデフォルトで利用可能です。

さらなる最適化が予定されているため、アナライザーの改善にご期待ください！
## 2024年6月28日 {#june-28-2024}
### ClickHouse CloudがMicrosoft Azureで一般に利用可能に！ {#clickhouse-cloud-for-microsoft-azure-is-now-generally-available}

私たちは、今年の5月にベータ版としてMicrosoft Azureサポートを最初に発表しました。最新のクラウドリリースでは、Azureサポートがベータから一般に利用可能に移行していることをお知らせします。ClickHouse Cloudは、AWS、Google Cloud Platform、そしてMicrosoft Azureの3つの主要なクラウドプラットフォームで利用可能になりました。

このリリースには、[Microsoft Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/clickhouse.clickhouse_cloud)を介したサブスクリプションのサポートも含まれています。サービスは、以下の地域で初期サポートされます：
- アメリカ合衆国：西部US 3（アリゾナ州）
- アメリカ合衆国：東部US 2（バージニア州）
- ヨーロッパ：ドイツ西中部（フランクフルト）

特定の地域に対応して欲しい場合は、[お問い合わせ](https://clickhouse.com/support/program)ください。
### クエリログインサイト {#query-log-insights}

私たちの新しいクエリインサイトUIは、ClickHouseの内蔵クエリログをより使いやすくします。ClickHouseの`system.query_log`テーブルは、クエリ最適化、デバッグ、クラスター全体の健全性とパフォーマンスの監視に必要不可欠な情報源です。ただし、注意点があります。70以上のフィールドとクエリごとの複数のレコードがあるため、クエリログを解釈するのは学習曲線が急です。この初期バージョンのクエリインサイトは、クエリデバッグおよび最適化パターンを簡素化するための将来の作業の青写真を提供します。この機能を改善するためにフィードバックをお待ちしておりますので、ぜひご意見をお聞かせください！

<Image img={query_insights} size="lg" alt="クエリパフォーマンスメトリックと分析を示すClickHouse CloudクエリインサイトUI" border />
### メトリクス用のPrometheusエンドポイント（プライベートプレビュー） {#prometheus-endpoint-for-metrics-private-preview}

おそらく最もリクエストの多い機能の一つ：ClickHouse Cloudから[Prometheus](https://prometheus.io/)メトリクスを[Grafana](https://grafana.com/)や[Datadog](https://www.datadoghq.com/)にエクスポートしてビジュアライズできるようになりました。Prometheusは、ClickHouseを監視し、カスタムアラートを設定するためのオープンソースのソリューションを提供します。ClickHouse CloudサービスへのPrometheusメトリクスへのアクセスは、[ClickHouse Cloud API](/integrations/prometheus)を介して利用可能です。この機能は現在プライベートプレビューです。この機能を組織のために有効にするには、[サポートチーム](https://clickhouse.com/support/program)にご連絡ください。

<Image img={prometheus} size="lg" alt="ClickHouse CloudのPrometheusメトリクスを表示するGrafanaダッシュボード" border />
### その他の機能: {#other-features}
- 頻度、保持、およびスケジュールなどのカスタムバックアップポリシーを構成するための[構成可能なバックアップ](/cloud/manage/backups/configurable-backups)が一般に利用可能になりました。
## 2024年6月13日 {#june-13-2024}
### Kafka ClickPipesコネクターの構成可能なオフセット（ベータ） {#configurable-offsets-for-kafka-clickpipes-connector-beta}

最近まで、新しい[Kafka Connector for ClickPipes](/integrations/clickpipes/kafka)をセットアップすると、常にKafkaトピックの最初からデータを消費していました。この状況では、特定のユースケースに適合する柔軟性が十分ではなく、履歴データを再処理したり、新しいデータのモニタリングを行ったり、正確なポイントから再開したりする必要がある場合がありました。

Kafka用のClickPipesは、新しい機能を追加しました。これにより、Kafkaトピックからのデータ消費に対する柔軟性と制御を強化しました。データを消費するオフセットを構成できるようになりました。

以下のオプションがあります：
- 最初から：Kafkaトピックの最初からデータの消費を開始します。このオプションは、すべての履歴データを再処理する必要があるユーザーに最適です。
- 最新から：最も最近のオフセットからデータの消費を開始します。これは、新しいメッセージのみに興味があるユーザーに役立ちます。
- タイムスタンプから：特定のタイムスタンプ以降に生成されたメッセージからデータの消費を開始します。この機能により、ユーザーは正確な時間から処理を再開するためのより正確な制御が得られます。

<Image img={kafka_config} size="lg" alt="オフセット選択オプションを示すClickPipes Kafkaコネクタ設定インターフェース" border />
### サービスをファストリリースチャンネルに登録する {#enroll-services-to-the-fast-release-channel}

ファストリリースチャンネルを利用すると、サービスがリリーススケジュールの前に更新を受け取ることができます。以前は、この機能を有効にするためにサポートチームの支援が必要でした。現在、ClickHouse Cloudコンソールを使用して、サービスのために直接この機能を有効にできます。単に**設定**に移動し、**ファストリリースに登録**をクリックしてください。サービスは今後、新しい更新が利用可能になるとすぐに受け取るようになります！

<Image img={fast_releases} size="lg" alt="ファストリリースに登録するオプションを示すClickHouse Cloud設定ページ" border />
### 水平スケーリングのためのTerraformサポート {#terraform-support-for-horizontal-scaling}

ClickHouse Cloudは[水平スケーリング](/manage/scaling#how-scaling-works-in-clickhouse-cloud)をサポートしており、サービスに同じサイズの追加レプリカを追加する機能があります。水平スケーリングは、同時クエリをサポートするためにパフォーマンスと並列処理を改善します。以前は、より多くのレプリカを追加するにはClickHouse CloudコンソールまたはAPIを使用する必要がありました。現在、Terraformを使用して、サービスからレプリカを追加または削除できるため、必要に応じてClickHouseサービスをプログラム的にスケールすることができます。

詳細については、[ClickHouse Terraformプロバイダー](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)をご覧ください。
## 2024年5月30日 {#may-30-2024}
### チームメンバーとクエリを共有する {#share-queries-with-your-teammates}

SQLクエリを書いたときに、チームの他の人もそのクエリを必要とする場合が多いです。以前は、クエリをSlackやメールで送信し、編集した場合に自動的にそのクエリの更新を受け取る方法はありませんでした。

ClickHouse Cloudコンソールを介してクエリを簡単に共有できることをお知らせします。クエリエディタから、クエリを直接チーム全体または特定のチームメンバーと共有できます。また、読み取り専用または書き込み専用のアクセス権を持つかどうかを指定することもできます。クエリエディタの**共有**ボタンをクリックして、新しい共有クエリ機能を試してみてください。

<Image img={share_queries} size="lg" alt="権限オプションと共に共有機能を示すClickHouse Cloudクエリエディタ" border />
### ClickHouse CloudがMicrosoft Azureでベータ版に！ {#clickhouse-cloud-for-microsoft-azure-is-now-in-beta}

ついに、Microsoft AzureでClickHouse Cloudサービスを作成する機能を立ち上げました！現在、多くの顧客が私たちのプライベートプレビュープログラムの一環としてAzureでClickHouse Cloudを使用しています。今や誰でもAzure上で独自のサービスを作成できます。AWSおよびGCPでサポートされるすべてのClickHouseの機能は、Azureでも動作します。

数週間中に、ClickHouse Cloud for Azureが一般利用可能になることを期待しています。詳細を知りたい方は[このブログ記事](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta)をお読みください。また、ClickHouse Cloudコンソールを介してAzureを使用して新しいサービスを作成してみてください。

注意: 現在、Azureの**開発用**サービスはサポートされていません。
### クラウドコンソール経由でプライベートリンクを設定する {#set-up-private-link-via-the-cloud-console}

私たちのプライベートリンク機能を使用すると、公共インターネットにトラフィックを送ることなく、クラウドプロバイダーアカウント内の内部サービスにClickHouse Cloudサービスを接続できます。これはコストを節約し、セキュリティを強化します。以前は、これを設定するのが難しく、ClickHouse Cloud APIを使用する必要がありました。

現在、ClickHouse Cloudコンソールから数回のクリックでプライベートエンドポイントを設定できます。サービスの**設定**に移動し、**セキュリティ**セクションに移動して、**プライベートエンドポイントを設定**をクリックします。

<Image img={private_endpoint} size="lg" alt="セキュリティ設定でのプライベートエンドポイント設定インターフェースを示すClickHouse Cloudコンソール" border />
## 2024年5月17日 {#may-17-2024}
### ClickPipesを使用してAmazon Kinesisからデータを取り込む（ベータ） {#ingest-data-from-amazon-kinesis-using-clickpipes-beta}

ClickPipesは、コードなしでデータを取り込むためにClickHouse Cloudが提供する専用サービスです。Amazon Kinesisは、処理のためにデータストリームを取得し保存するためのAWSのフルマネージドストリーミングサービスです。私たちは、最もリクエストの多かった統合の1つであるAmazon Kinesis向けのClickPipesベータ版を立ち上げることに興奮しています。ClickPipesに対する他の統合も追加予定ですので、どのデータソースをサポートしてほしいかお知らせください！この機能についての詳細を[こちら](https://clickhouse.com/blog/clickpipes-amazon-kinesis)でお読みください。

クラウドコンソールで新しいAmazon KinesisのClickPipes統合をお試しできます：

<Image img={kenesis} size="lg" alt="Amazon Kinesis統合設定オプションを示すClickPipesインターフェース" border />
### 構成可能なバックアップ（プライベートプレビュー） {#configurable-backups-private-preview}

バックアップはすべてのデータベースにとって重要です（どんなに信頼性が高くても）、私たちはClickHouse Cloudの第一日目からバックアップを非常に重要だと考えています。今週、私たちは構成可能なバックアップを立ち上げました。これにより、サービスのバックアップに対する柔軟性が大幅に向上しました。開始時刻、保持、および頻度をコントロールできるようになりました。この機能は**生産**および**専用**サービスで利用でき、**開発**サービスでは利用できません。この機能はプライベートプレビューのため、サービスに対して有効にするにはsupport@clickhouse.comまでご連絡ください。構成可能なバックアップについては[こちら](https://clickhouse.com/blog/configurable-backups-in-clickhouse-cloud)でご確認ください。
### SQLクエリからAPIを作成する（ベータ） {#create-apis-from-your-sql-queries-beta}

ClickHouse用のSQLクエリを書くと、アプリケーションにクエリを公開するために、ドライバーを介してClickHouseに接続する必要があります。現在、**クエリエンドポイント**機能を使用して、APIから直接SQLクエリを実行できるようになりました。設定は不要です。クエリエンドポイントを指定して、JSON、CSV、またはTSVを返すことができます。クラウドコンソールの「共有」ボタンをクリックして、クエリでこの新機能を試してみてください。クエリエンドポイントについての詳細は[こちら](https://clickhouse.com/blog/automatic-query-endpoints)をご覧ください。

<Image img={query_endpoints} size="lg" alt="出力形式オプションでクエリエンドポイント設定を示すClickHouse Cloudインターフェース" border />
### 公式ClickHouse認定が利用可能になりました！ {#official-clickhouse-certification-is-now-available}

ClickHouse開発トレーニングコースには12の無料トレーニングモジュールがあります。今週までは、ClickHouseでの習熟度を証明する公式な方法はありませんでした。私たちは最近、**ClickHouse認定開発者**になるための公式試験を立ち上げました。この試験を完了することにより、ClickHouseに関する習熟度を現在の雇用主および将来の雇用主と共有できます。トレーニングの内容にはデータ取り込み、モデリング、分析、パフォーマンス最適化などが含まれます。試験は[こちら](https://clickhouse.com/learn/certification)から受けることができます。また、ClickHouse認定については[このブログ記事](https://clickhouse.com/blog/first-official-clickhouse-certification)をお読みください。
## 2024年4月25日 {#april-25-2024}
### ClickPipesを使用してS3およびGCSからデータを取り込む {#load-data-from-s3-and-gcs-using-clickpipes}

新しくリリースされたクラウドコンソールに「データソース」という新しいセクションがあることに気付いたかもしれません。「データソース」ページは、ClickHouse Cloudのネイティブ機能であるClickPipesにできており、さまざまなソースからデータをClickHouse Cloudに簡単に挿入することができます。

最近のClickPipesの更新では、Amazon S3およびGoogle Cloud Storageからデータを直接アップロードする機能が追加されました。組み込みのテーブル機能を使用し続けることもできますが、ClickPipesはUIを介してデータをS3およびGCSからわずかなクリックで取り込むことができるフルマネージドサービスです。この機能はまだプライベートプレビューにあり、クラウドコンソールを介して今日お試しいただけます。

<Image img={s3_gcs} size="lg" alt="S3およびGCSバケットからデータを取り込む設定オプションを示すClickPipesインターフェース" border />
### Fivetranを使用して500以上のソースからClickHouse Cloudにデータを取り込む {#use-fivetran-to-load-data-from-500-sources-into-clickhouse-cloud}

ClickHouseは、大規模なデータセットをすばやくクエリできますが、もちろんデータをClickHouseに挿入する必要があります。Fivetranの包括的なコネクタの範囲のおかげで、ユーザーは500以上のソースからデータを迅速に取り込むことができるようになりました。Zendesk、Slack、またはお気に入りのアプリケーションからデータを取り込む必要がある場合、新しいClickHouseのFivetranデスティネーションを使用してアプリケーションデータのターゲットデータベースとしてClickHouseを利用できます。

これは、私たちの統合チームが数か月にわたって努力して構築したオープンソース統合です。リリースに関するブログ記事[こちら](https://clickhouse.com/blog/fivetran-destination-clickhouse-cloud)と[GitHubリポジトリ](https://github.com/ClickHouse/clickhouse-fivetran-destination)をご確認ください。
### その他の変更 {#other-changes}

**コンソールの変更**
- SQLコンソールでの出力フォーマットのサポート

**統合の変更**
- ClickPipes Kafkaコネクタはマルチブローカー設定をサポートします
- PowerBIコネクタは、ODBCドライバー設定オプションの提供をサポートします。
## 2024年4月18日 {#april-18-2024}
### AWS東京リージョンがClickHouse Cloudで利用可能になりました {#aws-tokyo-region-is-now-available-for-clickhouse-cloud}

このリリースでは、ClickHouse Cloud向けの新しいAWS東京リージョン（`ap-northeast-1`）が導入されます。ClickHouseを最速のデータベースにしたいと考えているため、レイテンシーを可能な限り低下させるためにすべてのクラウドのために新しいリージョンを追加し続けています。更新されたクラウドコンソールで東京に新しいサービスを作成できます。

<Image img={tokyo} size="lg" alt="東京リージョンの選択を示すClickHouse Cloudサービス作成インターフェース" border />

その他の変更：
### コンソールの変更 {#console-changes}
- Kafka用のClickPipesのAvroフォーマットのサポートが一般に利用可能になりました。
- Terraformプロバイダーのためのリソース（サービスとプライベートエンドポイント）のインポートを完全にサポートします。
### 統合の変更 {#integrations-changes}
- NodeJSクライアントのメジャー安定リリース：クエリとResultSetのための高度なTypeScriptサポート、URL設定
- Kafkaコネクタ：DLQに書き込む際に例外を無視するバグを修正、Avro Enum型のサポートを追加、[MSK](https://www.youtube.com/watch?v=6lKI_WlQ3-s)および[Confluent Cloud](https://www.youtube.com/watch?v=SQAiPVbd3gg)でのコネクタの使用に関するガイドを公開
- Grafana：UIのNullable型のサポートを修正、動的OTELトレーシングテーブル名のサポートを修正
- DBT：カスタムマテリアライゼーションのモデル設定を修正
- Javaクライアント：不正確なエラーコードの解析に関するバグを修正
- Pythonクライアント：数値型のパラメータ結合を修正、クエリ結合の数値リストに関するバグを修正、SQLAlchemy Pointのサポートを追加。
## 2024年4月4日 {#april-4-2024}
### 新しいClickHouse Cloudコンソールを紹介 {#introducing-the-new-clickhouse-cloud-console}

このリリースでは、新しいクラウドコンソールのプライベートプレビューが導入されます。

ClickHouseでは、開発者体験を改善する方法を常に考えています。最速のリアルタイムデータウェアハウスを提供するだけでは不十分であり、使いやすく、管理が容易である必要があります。

何千人ものClickHouse Cloudユーザーが毎月数十億のクエリを私たちのSQLコンソールで実行しているため、ClickHouse Cloudサービスとの対話をより容易にするために、世界クラスのコンソールに投資することを決定しました。新しいクラウドコンソール体験は、スタンドアロンSQLエディタと管理コンソールを直感的なUIに統合したものです。

特定の顧客が新しいクラウドコンソール体験のプレビューを受け取ります。ClickHouseのデータを探索し、管理するための統一的で没入感のある方法です。プライオリティアクセスを希望される場合は、support@clickhouse.comまでご連絡ください。

<Image img={cloud_console} size="lg" alt="新しいClickHouse Cloudコンソールインターフェース、統合されたSQLエディタと管理機能のアニメーション" border />
## 2024年3月28日 {#march-28-2024}

このリリースでは、Microsoft Azureのサポート、APIによる水平スケーリング、プライベートプレビューでのリリースチャンネルのサポートが導入されます。
### 一般的な更新 {#general-updates}
- プライベートプレビューでのMicrosoft Azureのサポートが導入されました。アクセスを得るには、アカウント管理またはサポートにご連絡いただくか、[ウェイトリストに参加](https://clickhouse.com/cloud/azure-waitlist)してください。
- リリースチャンネルの導入 – 環境タイプに基づいてアップグレードのタイミングを指定する機能。このリリースでは、「ファスト」リリースチャンネルを追加し、非生産環境を生産に先立ってアップグレードできるようにしています（有効にするにはサポートに連絡してください）。
### 管理の変更 {#administration-changes}
- APIによる水平スケーリング設定のサポートが追加されました（プライベートプレビュー、有効にするにはサポートに連絡してください）。
- スタートアップ時にメモリエラーが発生しているサービスのスケールアップのためのオートスケーリングを改善しました。
- Terraformプロバイダーを介してAWSのCMEKのサポートが追加されました。
### コンソールの変更 {#console-changes-1}
- Microsoftのソーシャルログインのサポートが追加されました。
- SQLコンソールでのパラメータ化クエリ共有機能が追加されました。
- クエリエディタ性能の大幅な改善（EUの一部地域において5秒から1.5秒のレイテンシに改善）。
### 統合の変更 {#integrations-changes-1}
- ClickHouse OpenTelemetryエクスポーター：ClickHouseレプリケーションテーブルエンジンのための[サポートが追加され](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31920)、[統合テストが追加されました](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31896)
- ClickHouse DBTアダプター：辞書の[マテリアライゼーションマクロのサポートが追加され](https://github.com/ClickHouse/dbt-clickhouse/pull/255)、TTL式のサポートに関する[テストが追加されました](https://github.com/ClickHouse/dbt-clickhouse/pull/254)
- ClickHouse Kafka Connect Sink：Kafkaプラグイン発見との[互換性が追加されました](https://github.com/ClickHouse/clickhouse-kafka-connect/issues/350)（コミュニティ貢献）
- ClickHouse Javaクライアント：新しいクライアントAPIのための[new packageが紹介され](https://github.com/ClickHouse/clickhouse-java/pull/1574)、[Cloudテストのテストカバレッジが追加されました](https://github.com/ClickHouse/clickhouse-java/pull/1575)
- ClickHouse NodeJSクライアント：新しいHTTP Keep-Alive挙動のためのテストとドキュメントが拡張されました。v0.3.0のリリースから利用可能です。
- ClickHouse Golangクライアント：Map内のキーとしてEnumを使用する際の[バグが修正され](https://github.com/ClickHouse/clickhouse-go/pull/1236)、接続プールにエラーがある接続が残るときの[バグが修正されました](https://github.com/ClickHouse/clickhouse-go/pull/1237)（コミュニティ貢献）。
- ClickHouse Pythonクライアント：PyArrowを介した[クエリストリーミングをサポートする](https://github.com/ClickHouse/clickhouse-connect/issues/155)ようになりました（コミュニティ貢献）。
### セキュリティの更新 {#security-updates}
- ClickHouse Cloudを更新して、["役割ベースのアクセス制御が、クエリキャッシングが有効になっているときにバイパスされる"](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-45h5-f7g3-gr8r)ことを防ぎました（CVE-2024-22412）。
```

## 2024年2月29日 {#february-29-2024}

このリリースでは、SQLコンソールアプリケーションのロード時間を改善し、ClickPipesでのSCRAM-SHA-256認証のサポートを追加し、Kafka Connectへのネスト構造のサポートを拡張しました。
### コンソールの変更 {#console-changes-3}
- SQLコンソールアプリケーションの初回ロード時間を最適化
- '認証に失敗しました'エラーを引き起こすSQLコンソールの競合状態を修正
- 最近のメモリアロケーション値が時々不正確であった監視ページの動作を修正
- SQLコンソールが時々重複したKILL QUERYコマンドを発行する動作を修正
- Kafkaベースのデータソースに対するSCRAM-SHA-256認証方式のClickPipesサポートを追加
### 統合の変更 {#integrations-changes-3}
- Kafka Connector: 複雑なネスト構造（Array、Map）のサポートを拡張; FixedString型のサポートを追加; 複数のデータベースへの取り込みのサポートを追加
- Metabase: ClickHouseのバージョン23.8未満との互換性の問題を修正
- DBT: モデル作成時に設定を渡す機能を追加
- Node.jsクライアント: 長時間実行されるクエリ（>1時間）と空の値の扱いを優雅に行うサポートを追加
## 2024年2月15日 {#february-15-2024}

このリリースでは、コアデータベースのバージョンをアップグレードし、Terraformを介してプライベートリンクを設定する機能を追加し、Kafka Connectを使用した非同期挿入に対する一度だけのセマンティクスをサポートするようになりました。
### ClickHouseバージョンのアップグレード {#clickhouse-version-upgrade-1}
- S3からの継続的かつスケジュールされたデータロードのためのS3Queueテーブルエンジンが生産環境で使用可能に - 詳細は[23.11リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-11)を参照してください。
- FINALおよびSIMD命令のベクトル化の改善により、クエリが高速化される重要なパフォーマンス向上 - 詳細は[23.12リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final)を参照してください。
- このClickHouseクラウドバージョンは23.12に基づいており、新しい機能、パフォーマンスの改善、バグ修正が多数追加されています。詳細は[コアデータベースの変更ログ](/whats-new/changelog/2023#2312)を参照してください。
### コンソールの変更 {#console-changes-4}
- Terraformプロバイダーを介してAWS Private LinkおよびGCP Private Service Connectを設定する機能を追加
- リモートファイルデータインポートの耐障害性を向上
- すべてのデータインポートにインポートステータス詳細のフライアウトを追加
- S3データインポートに対するキー/秘密キー認証情報のサポートを追加
### 統合の変更 {#integrations-changes-4}
* Kafka Connect
    * 一度だけの非同期挿入をサポート（デフォルトでは無効）
* Golangクライアント
    * DateTimeのバインディングを修正
    * バッチ挿入のパフォーマンスを改善
* Javaクライアント
    * リクエスト圧縮の問題を修正
## 2024年2月2日 {#february-2-2024}

このリリースでは、Azure Event Hub向けにClickPipesを提供し、v4 ClickHouse Grafanaコネクターを使用したログとトレースのナビゲーションワークフローを劇的に改善し、FlywayおよびAtlasデータベーススキーマ管理ツールに対するサポートを導入します。
### コンソールの変更 {#console-changes-5}
* Azure Event HubのためのClickPipesサポートを追加
* 新しいサービスはデフォルトのアイドル時間が15分で起動
### 統合の変更 {#integrations-changes-5}
* [ClickHouseデータソースのGrafana](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/) v4リリース
  * Table、Logs、Time Series、Traces専用のエディターを持つ完全に再構築されたクエリビルダー
  * より複雑で動的なクエリをサポートするように完全に再構築されたSQLジェネレーター
  * LogおよびTraceビューにおけるOpenTelemetryのファーストクラスサポートを追加
  * LogsおよびTraces用にデフォルトのテーブルとカラムを指定できるように設定を拡張
  * カスタムHTTPヘッダーを指定する機能を追加
  * その他多くの改善点 - 完全な[変更ログ](https://github.com/grafana/clickhouse-datasource/blob/main/CHANGELOG.md#400)を確認してください
* データベーススキーマ管理ツール
  * [FlywayがClickHouseサポートを追加](https://github.com/flyway/flyway-community-db-support/packages/2037428)
  * [Ariga AtlasがClickHouseサポートを追加](https://atlasgo.io/blog/2023/12/19/atlas-v-0-16#clickhouse-beta-program)
* Kafka Connector Sink
  * デフォルト値を持つテーブルへの取り込みを最適化
  * DateTime64での文字列ベースの日付をサポートする機能を追加
* Metabase
  * 複数のデータベースへの接続をサポートする機能を追加
## 2024年1月18日 {#january-18-2024}

このリリースでは、AWSの新しいリージョン（ロンドン / eu-west-2）が追加され、Redpanda、Upstash、Warpstreamに対するClickPipesのサポートが追加され、[is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted)コアデータベース機能の信頼性が向上します。
### 一般的な変更 {#general-changes}
- 新しいAWSリージョン：ロンドン（eu-west-2）
### コンソールの変更 {#console-changes-6}
- Redpanda、Upstash、Warpstream向けのClickPipesサポートを追加
- ClickPipesの認証メカニズムをUIで設定可能に
### 統合の変更 {#integrations-changes-6}
- Javaクライアント:
  - 破壊的変更: 呼び出し時にランダムなURLハンドルを指定する機能を削除。この機能はClickHouseから削除されました。
  - 非推奨: Java CLIクライアントおよびGRPCパッケージ
  - ClickHouseインスタンスでのバッチサイズとワークロードを軽減するためにRowBinaryWithDefaults形式をサポート
  - Date32およびDateTime64の範囲境界をClickHouseとの互換性を持たせ、Spark Array文字列型、ノード選択メカニズムとの互換性を持たせる
- Kafka Connector: Grafana用のJMX監視ダッシュボードを追加
- PowerBI: ODBCドライバー設定をUIで設定可能に
- JavaScriptクライアント: クエリ要約情報を公開し、挿入用に特定のカラムの部分集合を提供できるようにし、ウェブクライアント用のkeep_aliveを設定可能に
- Pythonクライアント: SQLAlchemy用のNothing型サポートを追加
### 信頼性の変更 {#reliability-changes}
- ユーザー向けの後方互換性がない変更: 以前は、特定の条件下で2つの機能（[is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted)および``OPTIMIZE CLEANUP``）がClickHouse内のデータが破損される可能性がありました。ユーザーのデータの整合性を保護しつつ機能のコアを維持するために、この機能の動作を調整しました。具体적으로、MergeTree設定``clean_deleted_rows``は現在非推奨で、もはや効果がありません。``CLEANUP``キーワードはデフォルトでは許可されておらず（使用するには``allow_experimental_replacing_merge_with_cleanup``を有効にする必要があります）。``CLEANUP``を使用する場合、常に``FINAL``と一緒に使用することを保証し、``OPTIMIZE FINAL CLEANUP``を実行した後に古いバージョンの行が挿入されないようにする必要があります。
## 2023年12月18日 {#december-18-2023}

このリリースでは、GCPの新しいリージョン（us-east1）、セルフサービスの安全なエンドポイント接続機能、DBT 1.7を含む追加の統合のサポート、数え切れないバグ修正とセキュリティ強化が行われます。
### 一般的な変更 {#general-changes-1}
- ClickHouse CloudがGCP us-east1（サウスカロライナ）リージョンで利用可能になりました
- OpenAPIを介してAWS Private LinkおよびGCP Private Service Connectの設定機能を有効にしました
### コンソールの変更 {#console-changes-7}
- 開発者ロールを持つユーザーのためにSQLコンソールへのシームレスなログインを可能にしました
- オンボーディング中のアイドル制御設定のワークフローを簡素化しました
### 統合の変更 {#integrations-changes-7}
- DBTコネクタ: DBT v1.7までのサポートを追加
- Metabase: Metabase v0.48へのサポートを追加
- PowerBIコネクタ: PowerBI Cloud上での実行機能を追加
- ClickPipes内部ユーザーのアクセス権を設定可能に
- Kafka Connect
  - Nullable型の重複排除ロジックと取り込みを改善。
  - CSV、TSVなどのテキストベースフォーマットのサポートを追加
- Apache Beam: BooleanおよびLowCardinality型のサポートを追加
- Nodejsクライアント: Parquet形式のサポートを追加
### セキュリティアナウンス {#security-announcements}
- 3件のセキュリティ脆弱性を修正 - 詳細は[セキュリティ変更ログ](/whats-new/security-changelog)を参照してください:
  - CVE 2023-47118 (CVSS 7.0) - デフォルトで9000/tcpポートで実行されるネイティブインターフェースに影響を与えるヒープバッファオーバーフロー脆弱性
  - CVE-2023-48704 (CVSS 7.0) - デフォルトで9000/tcpポートで実行されるネイティブインターフェースに影響を与えるヒープバッファオーバーフロー脆弱性
  - CVE 2023-48298 (CVSS 5.9) - FPC圧縮コーデックにおける整数アンダーフロー脆弱性
## 2023年11月22日 {#november-22-2023}

このリリースでは、コアデータベースのバージョンをアップグレードし、ログインおよび認証フローを改善し、Kafka Connect Sinkへのプロキシサポートを追加しました。
### ClickHouseバージョンのアップグレード {#clickhouse-version-upgrade-2}

- Parquetファイルの読み取り性能が大幅に向上しました。詳細は[23.8リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-08)を参照してください。
- JSONのための型推論サポートが追加されました。詳細は[23.9リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-09)を参照してください。
- `ArrayFold`のような強力な分析者向け機能が導入されました。詳細は[23.10リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-10)を参照してください。
- **ユーザー向けの後方互換性がない変更**: JSON形式の文字列から数字を推測しないようにするため、デフォルトで設定`input_format_json_try_infer_numbers_from_strings`を無効にしました。この操作は、サンプルデータに数字に似た文字列が含まれているときに解析エラーを引き起こす可能性があります。
- 新機能、パフォーマンス向上、バグ修正が数十件追加されました。詳細は[コアデータベースの変更ログ](/whats-new/changelog)を参照してください。
### コンソールの変更 {#console-changes-8}

- ログインおよび認証フローの改善。
- 大規模スキーマをより良くサポートするためにAIベースのクエリ提案を改善しました。
### 統合の変更 {#integrations-changes-8}

- Kafka Connect Sink: プロキシサポート、`topic-tablename`マッピング、Keeper _exactly-once_ 配信プロパティの設定が可能になりました。
- Node.jsクライアント: Parquet形式のサポートを追加。
- Metabase: `datetimeDiff`関数のサポートを追加。
- Pythonクライアント: カラム名の特殊文字サポートを追加。タイムゾーンパラメータのバインディングを修正。
## 2023年11月2日 {#november-2-2023}

このリリースでは、アジアにおける開発サービスの地域サポートが追加され、顧客管理の暗号化キーにキーのローテーション機能が導入され、請求コンソールでの税設定の粒度が改善され、さまざまな言語クライアントでのバグ修正が行われました。
### 一般的な更新 {#general-updates-1}
- 開発サービスがAWSの`ap-south-1`（ムンバイ）および`ap-southeast-1`（シンガポール）で利用可能になりました。
- 顧客管理の暗号化キー（CMEK）でキーのローテーションをサポートする機能を追加。
### コンソールの変更 {#console-changes-9}
- クレジットカード追加時に細かな税設定を構成できる機能を追加。
### 統合の変更 {#integrations-changes-9}
- MySQL
  - MySQLを介したTableau OnlineおよびQuickSightのサポートを改善。
- Kafka Connector
  - テキストベースのフォーマット（CSV、TSV）をサポートするために新しいStringConverterを導入。
  - BytesおよびDecimalデータ型のサポートを追加。
  - エラー.tolerance=allの場合でも再試行可能な例外が常に再試行されるよう調整。
- Node.jsクライアント
  - 常に非バランスな接続を引き起こす問題を修正。
- Pythonクライアント
  - 大規模挿入時のタイムアウトを修正。
  - NumPy/Pandas Date32の問題を修正。
- Golangクライアント
  - JSONカラムへの空のマップの挿入、圧縮バッファのクリーンアップ、クエリエスケープ、IPv4およびIPv6のゼロ/ヌルに対するパニックを修正。
  - キャンセルされた挿入用の監視機能を追加。
- DBT
  - テスト付きの分散テーブルサポートを改善。
## 2023年10月19日 {#october-19-2023}

このリリースでは、SQLコンソールでの使いやすさとパフォーマンスの改善、MetabaseコネクタでのIPデータ型の取り扱い改善、JavaおよびNode.jsクライアントにおける新機能が導入されました。
### コンソールの変更 {#console-changes-10}
- SQLコンソールの使いやすさを改善（例: クエリ実行間のカラム幅を保持）
- SQLコンソールのパフォーマンスを改善
### 統合の変更 {#integrations-changes-10}
- Javaクライアント:
  - パフォーマンスを改善し、オープン接続の再利用を可能にするためにデフォルトのネットワークライブラリを切り替え。
  - プロキシサポートを追加。
  - Trust Storeを使用した安全な接続のサポートを追加。
- Node.jsクライアント: 挿入クエリに対するkeep-alive動作を修正。
- Metabase: IPv4/IPv6カラムのシリアル化を修正。
## 2023年9月28日 {#september-28-2023}

このリリースでは、Kafka、Confluent Cloud、Amazon MSKおよびKafka Connect ClickHouse Sinkに対するClickPipesの一般提供が行われ、IAMロールを介してAmazon S3への安全アクセスのセルフサービスワークフローが追加され、AI支援のクエリ提案（プライベートプレビュー）が導入されます。
### コンソールの変更 {#console-changes-11}
- IAMロールを介してAmazon S3への[アクセスを安全にするためのセルフサービスワークフロー](/cloud/security/secure-s3)を追加
- プライベートプレビューのAI支援のクエリ提案を導入（試すには[ClickHouse Cloudサポートに連絡](https://console.clickhouse.cloud/support)してください！）
### 統合の変更 {#integrations-changes-11}
- ClickPipesの一般提供を発表 - Kafka、Confluent CloudおよびAmazon MSK用のターンキーデータ取り込みサービス - [リリースブログ](https://clickhouse.com/blog/clickpipes-is-generally-available)を参照してください。
- Kafka Connect ClickHouse Sinkの一般提供に到達
  - `clickhouse.settings`プロパティを使用してカスタマイズされたClickHouseの設定を拡張サポート。
  - 動的フィールドを考慮した重複排除動作を改善。
  - ClickHouseからのテーブル変更を再取得するための`tableRefreshInterval`のサポートを追加しました。
- SSL接続の問題と[PowerBI](/integrations/powerbi)とClickHouseデータ型間の型マッピングを修正。
## 2023年9月7日 {#september-7-2023}

このリリースでは、PowerBI Desktop公式コネクタのベータ版リリース、インド向けのクレジットカード決済処理の改善、サポートされている言語クライアントの複数の改善点が提供されます。
### コンソールの変更 {#console-changes-12}
- インドからの課金をサポートするために残りのクレジットと支払いの再試行を追加。
### 統合の変更 {#integrations-changes-12}
- Kafka Connector: ClickHouse設定の構成サポートを追加し、error.tolerance構成オプションを追加。
- PowerBI Desktop: 公式コネクタのベータ版をリリース。
- Grafana: Point geoタイプのサポートを追加し、データアナリストダッシュボードのパネルを修正、timeIntervalマクロを修正。
- Pythonクライアント: Pandas 2.1.0との互換性を確保し、Python 3.7のサポートを削除。Nullable JSON型のサポートを追加。
- Node.jsクライアント: default_format設定のサポートを追加。
- Golangクライアント: bool型の取り扱いを修正し、文字列の制限を削除。
## 2023年8月24日 {#aug-24-2023}

このリリースでは、ClickHouseデータベースにMySQLインターフェースのサポートを追加し、新しい公式PowerBIコネクタを導入し、クラウドコンソールに「実行中のクエリ」ビューを追加し、ClickHouseのバージョンを23.7に更新しました。
### 一般的な更新 {#general-updates-2}
- [MySQLワイヤプロトコル](/interfaces/mysql)のサポートを追加し、（他のユースケースと共に）多くの既存BIツールとの互換性を突然可能にします。この機能を組織で有効にするにはサポートに連絡してください。
- 新しい公式PowerBIコネクタを導入しました。
### コンソールの変更 {#console-changes-13}
- SQLコンソールに「実行中のクエリ」ビューのサポートを追加。
### ClickHouse 23.7バージョンアップグレード {#clickhouse-237-version-upgrade}
- Azure Table関数のサポートを追加し、地理データ型を生産環境に格上げし、結合性能を改善 - 詳細は23.5リリース[ブログ](https://clickhouse.com/blog/clickhouse-release-23-05)を参照してください。
- MongoDBとの統合サポートをバージョン6.0まで拡張 - 詳細は23.6リリース[ブログ](https://clickhouse.com/blog/clickhouse-release-23-06)を参照してください。
- Parquet形式への書き込み性能を6倍改善し、PRQLクエリ言語のサポートを追加し、SQLとの互換性を改善 - 詳細は23.7リリース[デック](https://presentations.clickhouse.com/release_23.7/)を参照してください。
- 数十件の新機能、パフォーマンス改善、およびバグ修正が含まれています - 詳細な[変更ログ](/whats-new/changelog)を23.5、23.6、23.7で確認してください。
### 統合の変更 {#integrations-changes-13}
- Kafka Connector: Avro DateおよびTime型のサポートを追加。
- JavaScriptクライアント: ウェブベース環境向けに安定したバージョンをリリース。
- Grafana: フィルターロジック、データベース名の処理を改善し、サブ秒精度でTimeIntervalのサポートを追加。
- Golang Client: バッチおよび非同期データ読み込みのいくつかの問題を修正。
- Metabase: v0.47をサポートし、接続のエミュレーションを追加、データ型マッピングを修正。
## 2023年7月27日 {#july-27-2023}

このリリースでは、Kafka向けのClickPipesのプライベートプレビュー、新しいデータロード体験、クラウドコンソールからURLを使用してファイルをロードする機能が追加されました。
### 統合の変更 {#integrations-changes-14}
- Kafka向けの[ClickPipes](https://clickhouse.com/cloud/clickpipes)プライベートプレビューを導入しました。これは、KafkaやConfluent Cloudから大量のデータを取り込むためのクラウドネイティブな統合エンジンであり、数回のボタンをクリックするだけで済みます。ウェイトリストに[ここからサインアップ](https://clickhouse.com/cloud/clickpipes#joinwaitlist)してください。
- JavaScriptクライアント: ウェブベース環境（ブラウザ、Cloudflareのワーカー）向けのサポートをリリースしました。コードは、コミュニティがカスタム環境に対するコネクタを作成できるようにリファクタリングされました。
- Kafka Connector: TimestampおよびTime Kafka型のインラインスキーマのサポートを追加しました。
- Pythonクライアント: 挿入圧縮およびLowCardinalityの読み取りの問題を修正。
### コンソールの変更 {#console-changes-14}
- より多くのテーブル作成設定オプションで新しいデータロード体験を追加しました。
- クラウドコンソールからURLを使用してファイルをロードする機能を導入しました。
- 別の組織に参加するための追加オプションと、未処理の招待をすべて見るためのフローを改善しました。
## 2023年7月14日 {#july-14-2023}

このリリースでは、専用サービスを立ち上げる機能、オーストラリアの新しいAWSリージョン、およびディスク上のデータを暗号化するための自社キーを持ち込むオプションが追加されました。
### 一般的な更新 {#general-updates-3}
- 新しいAWSオーストラリアリージョン: シドニー（ap-southeast-2）
- 遅延に対する厳しい要件を持つワークロードのための専用tierサービス（設定のために[サポート](https://console.clickhouse.cloud/support)に連絡してください）
- ディスク上のデータを暗号化するための自社キー（BYOK）（設定のために[サポート](https://console.clickhouse.cloud/support)に連絡してください）
### コンソールの変更 {#console-changes-15}
- 非同期挿入のための可観測性メトリクスダッシュボードの改善。
- サポートとの統合のためのチャットボットの動作を改善。
### 統合の変更 {#integrations-changes-15}
- NodeJSクライアント: ソケットタイムアウトによる接続失敗のバグを修正。
- Pythonクライアント: 挿入クエリにQuerySummaryを追加し、データベース名での特殊文字サポートを追加。
- Metabase: JDBCドライバーのバージョンを更新し、DateTime64サポートを追加し、パフォーマンスを改善しました。
### コアデータベースの変更 {#core-database-changes}
- [クエリキャッシュ](/operations/query-cache)はClickHouse Cloudで有効にできます。有効にすると、成功したクエリはデフォルトで1分間キャッシュされ、その後のクエリはキャッシュされた結果を使用します。
## 2023年6月20日 {#june-20-2023}

このリリースでは、ClickHouse CloudがGCPで一般提供され、Cloud API用のTerraformプロバイダーが提供され、ClickHouseのバージョンが23.4に更新されました。
### 一般的な更新 {#general-updates-4}
- ClickHouse CloudがGCPで利用可能になり、GCP Marketplaceとの統合、Private Service Connectのサポート、自動バックアップが追加されました（詳細は[ブログ](https://clickhouse.com/blog/clickhouse-cloud-on-google-cloud-platform-gcp-is-generally-available)および[プレスリリース](https://clickhouse.com/blog/clickhouse-cloud-expands-choice-with-launch-on-google-cloud-platform)を参照）。
- Cloud API用の[Terraformプロバイダー](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)が提供されます。
### コンソールの変更 {#console-changes-16}
- サービス用の新しい統合設定ページを追加しました。
- ストレージと計算のメーター精度を調整しました。
### 統合の変更 {#integrations-changes-16}
- Pythonクライアント: 挿入性能が改善され、内部の依存関係がリファクタリングされ、マルチプロセスをサポートしました。
- Kafka Connector: Confluent Cloudにアップロードおよびインストールでき、接続の問題の再試行を追加し、誤ったコネクタの状態を自動的にリセットすることができます。
### ClickHouse 23.4バージョンのアップグレード {#clickhouse-234-version-upgrade}
- 並列レプリカのJOINのサポートを追加しました（設定には[サポート](https://console.clickhouse.cloud/support)に連絡してください）。
- 軽量削除の性能を改善しました。
- 大きな挿入を処理する際のキャッシングを改善しました。
### 管理の変更 {#administration-changes-1}
- "default"でないユーザーのローカル辞書作成を拡充しました。
## 2023年5月30日 {#may-30-2023}

このリリースでは、ClickHouse Cloudのプログラム的APIの公開リリースを実施し（詳細は[ブログ](https://clickhouse.com/blog/using-the-new-clickhouse-cloud-api-to-automate-deployments)を参照）、IAMロールを使用したS3アクセスを可能にし、追加のスケーリングオプションを提供します。
### 一般的な変更 {#general-changes-2}
- ClickHouse Cloud用のAPIサポート。新しいCloud APIを使用すれば、既存のCI/CDパイプラインにサービスの管理をシームレスに統合し、プログラムからサービスを管理することができます。
- IAMロールを使用したS3アクセス。今すぐIAMロールを活用してプライベートなAmazon Simple Storage Service(S3)バケットに安全にアクセスできます（設定のためにサポートに連絡してください）。
### スケーリング変更 {#scaling-changes}
- [水平スケーリング](/manage/scaling#manual-horizontal-scaling)。より多くの並列化を必要とするワークロードに対して最大10のレプリカで構成可能です（設定のためにサポートに連絡してください）。
- [CPUベースの自動スケーリング](/manage/scaling)。CPUに依存するワークロードは、自動スケーリングポリシーのための追加トリガーを利用できるようになりました。
### コンソールの変更 {#console-changes-17}
- DevサービスをProductionサービスに移行する機能を追加（有効にするにはサポートに連絡してください）。
- インスタンス作成フロー中にスケーリング設定制御を追加。
- デフォルトのパスワードがメモリにない場合の接続文字列を修正。
### 統合の変更 {#integrations-changes-17}
- Golangクライアント: ネイティブプロトコルでの接続のバランスが崩れる問題を修正し、ネイティブプロトコルでのカスタム設定のサポートを追加。
- Nodejsクライアント: nodejs v14のサポートを削除し、v20のサポートを追加。
- Kafka Connector: LowCardinality型のサポートを追加。
- Metabase: 時間範囲によるグループ化を修正し、組み込みのMetabase質問における整数のサポートを修正。
### パフォーマンスと信頼性 {#performance-and-reliability}
- 書き込みが多いワークロードの効率性とパフォーマンスを改善しました。
- バックアップの速度と効率を向上させるために増分バックアップ戦略を導入しました。
## 2023年5月11日 {#may-11-2023}

このリリースでは、ClickHouse CloudがGCPでの~~公共ベータ版~~（現在はGA、上記の6月20日の項目を参照）の公開を行い、管理者の権限を拡張してクエリ終了のアクセス許可を付与し、CloudコンソールにおけるMFAユーザーの状態についての可視性を向上させます。
### ClickHouse Cloud on GCP ~~（公共ベータ版）~~（現在はGA、上記の6月20日の項目を参照） {#clickhouse-cloud-on-gcp-public-beta-now-ga-see-june-20th-entry-above}
- Google ComputeおよびGoogle Cloud Storageの上に構築された、完全に管理された分離ストレージと計算に基づくClickHouseオファリングを開始しました。
- アイオワ（us-central1）、オランダ（europe-west4）、シンガポール（asia-southeast1）リージョンで利用可能です。
- 3つの初期リージョンすべてで開発および生産サービスをサポートします。
- デフォルトで強力なセキュリティを提供: 転送中のエンドツーエンド暗号化、静止中のデータの暗号化、IP許可リスト。
### 統合の変更 {#integrations-changes-18}
- Golangクライアント: プロキシ環境変数のサポートを追加。
- Grafana: ClickHouseのカスタム設定およびプロキシ環境変数をGrafanaデータソース設定で指定する機能を追加しました。
- Kafka Connector: 空記録の処理を改善。
### コンソールの変更 {#console-changes-18}
- ユーザーリストでの多要素認証（MFA）使用のインジケーターを追加。
### パフォーマンスと信頼性 {#performance-and-reliability-1}
- 管理者に対するクエリ終了の許可の粒度を増しました。
## 2023年5月4日 {#may-4-2023}

このリリースでは、新しいヒートマップチャートタイプが追加され、請求使用状況ページが改善され、サービスの起動時間が改善されました。
### コンソールの変更 {#console-changes-19}
- SQLコンソールにヒートマップチャートタイプを追加しました。
- 請求使用状況ページが改善され、各請求ディメンション内の消費クレジットを表示するようになりました。
### 統合の変更 {#integrations-changes-19}
- Kafkaコネクタ: 一時的接続エラーに対する再試行メカニズムを追加。
- Pythonクライアント: max_connection_age設定を追加し、HTTP接続が永遠に再利用されないようにしました。これにより、特定の負荷分散問題に役立ちます。
- Node.jsクライアント: Node.js v20のサポートを追加。
- Javaクライアント: クライアント証明書認証のサポートを改善し、ネストされたTuple/Map/Nested型のサポートを追加。
### パフォーマンスと信頼性 {#performance-and-reliability-2}
- 多数のパーツが存在する場合のサービス起動時間を改善。
- SQLコンソールにおける長時間実行されるクエリのキャンセルロジックを最適化しました。
### バグ修正 {#bug-fixes}
- 'Cell Towers'サンプルデータセットのインポートに失敗するバグを修正しました。
## 2023年4月20日 {#april-20-2023}

このリリースでは、ClickHouseのバージョンを23.3に更新し、コールド読み取りの速度を大幅に改善し、サポートとのリアルタイムチャット機能が追加されました。
### コンソールの変更 {#console-changes-20}
- サポートとのリアルタイムチャット機能を追加しました。
### 統合の変更 {#integrations-changes-20}
- Kafkaコネクタ: Nullable型のサポートを追加。
- Golangクライアント: 外部テーブルのサポート、booleanおよびポインタ型のパラメータバインディングのサポートを追加しました。
### 設定の変更 {#configuration-changes}
- 大きなテーブルを削除するための能力を追加 – 設定`max_table_size_to_drop`および`max_partition_size_to_drop`を上書きすることで。
### パフォーマンスと信頼性 {#performance-and-reliability-3}
- `allow_prefetched_read_pool_for_remote_filesystem`設定を用いることで、S3プレフェッチを利用してコールドリードの速度を改善しました。
### ClickHouse 23.3バージョンアップグレード {#clickhouse-233-version-upgrade}
- 軽量削除が生産環境で使用可能 - 詳細は23.3リリース[ブログ](https://clickhouse.com/blog/clickhouse-release-23-03)を参照してください。
- マルチステージPREWHEREのサポートが追加されました - 詳細は23.2リリース[ブログ](https://clickhouse.com/blog/clickhouse-release-23-03)を参照してください。
- 数十件の新機能、パフォーマンス改善、バグ修正が含まれています - 詳細な[変更ログ](/whats-new/changelog/index.md)を23.3および23.2で確認してください。
## 2023年4月6日 {#april-6-2023}

このリリースでは、クラウドエンドポイントを取得するためのAPI、高度なスケーリング制御のための最小アイドルタイムアウト、Pythonクライアントのクエリメソッドでの外部データのサポートが導入されました。
### APIの変更 {#api-changes}
* ClickHouse Cloudエンドポイントをプログラム的にクエリする機能が[Cloud Endpoints API](//cloud/get-started/query-endpoints.md)を介して追加されました。
### コンソールの変更 {#console-changes-21}
- 高度なスケーリング設定に'最小アイドルタイムアウト'設定を追加しました。
- データロードモーダルでのスキーマ推論に対して最善努力の日付時刻検出を追加しました。
### 統合の変更 {#integrations-changes-21}
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): 複数スキーマのサポートを追加。
- [Goクライアント](/integrations/language-clients/go/index.md): TLS接続用のアイドル接続生存性チェックを修正しました。
- [Pythonクライアント](/integrations/language-clients/python/index.md)
  - クエリメソッドでの外部データのサポートを追加
  - クエリ結果のためのタイムゾーン対応を追加
  - `no_proxy`/`NO_PROXY`環境変数のサポートを追加
  - Nullable型のNULL値のサーバー側パラメータバインディングを修正しました。
### バグ修正 {#bug-fixes-1}
* SQLコンソールから`INSERT INTO ... SELECT ...`を実行すると、選択クエリと同じ行制限が誤って適用される動作を修正しました。
## 2023年3月23日 {#march-23-2023}

このリリースでは、データベースパスワードの複雑さルール、大きなバックアップの復元速度の向上、Grafana Trace Viewでトレースを表示するサポートが追加されました。
### セキュリティと信頼性 {#security-and-reliability}
- コアデータベースエンドポイントがパスワードの複雑さルールを強制します。
- 大規模バックアップの復元時間が改善されました。
### コンソールの変更 {#console-changes-22}
- オンボーディングワークフローを簡素化し、新しいデフォルトとよりコンパクトなビューデザインを導入しました。
- サインアップおよびサインイン遅延を短縮しました。
### 統合の変更 {#integrations-changes-22}
- Grafana:
  - ClickHouseに保存されたトレースデータをTrace Viewで表示するサポートを追加しました。
  - 時間範囲フィルターを改善し、テーブル名に特殊文字のサポートを追加しました。
- Superset: ClickHouseのネイティブサポートを追加。
- Kafka Connect Sink: 自動日付変換とNullカラムの処理を追加。
- Metabase: 一時テーブルへの挿入を修正し、Pandas Nullのサポートを追加。
- Golangクライアント: タイムゾーンを持つ日付型を正規化。
- Javaクライアント
  - 圧縮、infile、およびoutfileキーワードのサポートをSQLパーサーに追加。
  - 認証情報のオーバーロードを追加。
  - `ON CLUSTER`でのバッチサポートを修正。
- Node.jsクライアント
  - JSONStrings、JSONCompact、JSONCompactStrings、JSONColumnsWithMetadataフォーマットのサポートを追加。
  - すべてのメインクライアントメソッドに対して`query_id`を提供できるようになりました。
### バグ修正 {#bug-fixes-2}
- 新しいサービスの初期プロビジョニングおよび起動時間が遅くなるバグを修正しました。
- キャッシュ設定の誤設定によるクエリパフォーマンスの低下を引き起こすバグを修正しました。
## 2023年3月9日 {#march-9-2023}

このリリースでは、可観測性ダッシュボードの改善、大規模バックアップの作成時間を最適化し、テーブルおよびパーティションを削除するために必要な設定が追加されました。
### コンソールの変更 {#console-changes-23}
- 高度な可観測性ダッシュボード（プレビュー）を追加しました。
- 可観測性ダッシュボードにメモリアロケーションチャートを導入しました。
- SQLコンソールスプレッドシートビューでの間隔と改行処理を改善しました。
```
```yaml
title: '信頼性とパフォーマンス'
sidebar_label: '信頼性とパフォーマンス'
keywords: ['ClickHouse', 'バックアップ', 'パフォーマンス', '信頼性', 'インテグレーション']
description: 'ClickHouseの信頼性とパフォーマンスに関するアップデートと新機能を紹介します。'
```
### 信頼性とパフォーマンス {#reliability-and-performance}
- データが変更された場合のみバックアップを実行するように最適化されたバックアップスケジュール
- 大規模なバックアップの完了にかかる時間の改善
### 設定の変更 {#configuration-changes-1}
- クエリまたは接続レベルで設定 `max_table_size_to_drop` と `max_partition_size_to_drop` を上書きすることにより、テーブルやパーティションを削除する制限を引き上げる機能を追加
- ソースIPをクエリログに追加し、ソースIPに基づいたクオータとアクセス制御の強化を可能に
### インテグレーション {#integrations}
- [Pythonクライアント](/integrations/language-clients/python/index.md): Pandasサポートの改善とタイムゾーン関連の問題の修正
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): Metabase 0.46.x との互換性と SimpleAggregateFunction のサポート
- [Kafka-Connect](/integrations/data-ingestion/kafka/index.md): 暗黙の日時変換とnullカラムのより良い処理
- [Javaクライアント](https://github.com/ClickHouse/clickhouse-java): ネストされたデータをJavaマップに変換する機能
##  2023年2月23日 {#february-23-2023}

このリリースでは、ClickHouse 23.1 コアリリースの一部の機能を有効にし、Amazon Managed Streaming for Apache Kafka (MSK) との相互運用性を確保し、アクティビティログにおいて高度なスケーリングとアイドル調整を公開しました。
### ClickHouse 23.1 バージョンアップグレード {#clickhouse-231-version-upgrade}

ClickHouse 23.1 の一部の機能をサポートします。例えば:
- Map型での ARRAY JOIN
- SQL 標準の16進数およびバイナリリテラル
- `age()`, `quantileInterpolatedWeighted()`, `quantilesInterpolatedWeighted()` などの新しい関数
- 引数なしで `generateRandom` で挿入テーブルの構造を使用する機能
- 以前の名前を再利用できる improved database creation and rename ロジック
- 詳細については、23.1リリースの [ウェビナー スライド](https://presentations.clickhouse.com/release_23.1/#cover) と [23.1リリース変更履歴](/whats-new/cloud#clickhouse-231-version-upgrade) を参照してください
### インテグレーションの変更 {#integrations-changes-23}
- [Kafka-Connect](/integrations/data-ingestion/kafka/index.md): Amazon MSK のサポートを追加
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): 初の安定版リリース 1.0.0
  - コネクタが [Metabase Cloud](https://www.metabase.com/start/) で利用可能になりました
  - 利用可能な全データベースを探索する機能を追加
  - AggregationFunction型のデータベースの同期を修正
- [DBT-clickhouse](/integrations/data-ingestion/etl-tools/dbt/index.md): 最新の DBT バージョン v1.4.1 のサポートを追加
- [Pythonクライアント](/integrations/language-clients/python/index.md): プロキシとSSHトンネルのサポートを改善; Pandas DataFrames向けの多数の修正とパフォーマンス最適化を追加
- [Nodejsクライアント](/integrations/language-clients/js.md): クエリ結果に `query_id` を追加できる機能をリリースし、これを使用して `system.query_log` からクエリメトリクスを取得できます
- [Golangクライアント](/integrations/language-clients/go/index.md): ClickHouse Cloudとのネットワーク接続を最適化
### コンソールの変更 {#console-changes-24}
- アクティビティログに高度なスケーリングとアイドル設定の調整を追加
- パスワードリセットメールにユーザーエージェントとIP情報を追加
- Google OAuthのサインアップフローメカニズムを改善
### 信頼性とパフォーマンス {#reliability-and-performance-1}
- 大規模なサービスのアイドルからの再開時間を短縮
- 多数のテーブルとパーティションを持つサービスの読み取りレイテンシを改善
### バグ修正 {#bug-fixes-3}
- サービスパスワードのリセットがパスワードポリシーに従わない動作を修正
- 組織の招待メール検証を大文字小文字を区別しないように修正
## 2023年2月2日 {#february-2-2023}

このリリースでは、公式にサポートされたMetabase統合、大規模なJavaクライアント / JDBCドライバーリリース、SQLコンソールにおけるビューとマテリアライズドビューのサポートを提供します。
### インテグレーションの変更 {#integrations-changes-24}
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md) プラグイン: ClickHouse により管理される公式ソリューションになりました
- [dbt](/integrations/data-ingestion/etl-tools/dbt/index.md) プラグイン: [マルチスレッド](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md)のサポートを追加
- [Grafana](/integrations/data-visualization/grafana/index.md) プラグイン: 接続エラーの処理を改善
- [Python](/integrations/language-clients/python/index.md) クライアント: 挿入操作に対する [ストリーミングサポート](/integrations/language-clients/python/index.md#streaming-queries)
- [Go](/integrations/language-clients/go/index.md) クライアント: [バグ修正](https://github.com/ClickHouse/clickhouse-go/blob/main/CHANGELOG.md): キャンセルされた接続を閉じ、接続エラーの処理を改善
- [JS](/integrations/language-clients/js.md) クライアント: [exec/insertでの破壊的変更](https://github.com/ClickHouse/clickhouse-js/releases/tag/0.0.12); 戻り値タイプにおいて query_id を公開
- [Java](https://github.com/ClickHouse/clickhouse-java#readme) クライアント / JDBC ドライバーの大規模なリリース
  - [破壊的変更](https://github.com/ClickHouse/clickhouse-java/releases): 非推奨のメソッド、クラス、パッケージが削除されました
  - R2DBCドライバーとファイル挿入サポートを追加
### コンソールの変更 {#console-changes-25}
- SQLコンソールにおけるビューとマテリアライズドビューのサポートを追加
### パフォーマンスと信頼性 {#performance-and-reliability-4}
- 停止中/アイドル状態のインスタンスに対するパスワードリセットをさらに迅速化
- より正確な活動追跡を通じてスケールダウン動作を改善
- SQLコンソールのCSVエクスポートが切り捨てられるバグを修正
- サンプルデータのアップロードにおける断続的な失敗を引き起こすバグを修正
## 2023年1月12日 {#january-12-2023}

このリリースでは、ClickHouseのバージョンを22.12に更新し、多くの新しいソースに対するディクショナリを有効化し、クエリパフォーマンスを向上させました。
### 一般的な変更 {#general-changes-3}
- 外部ClickHouse、Cassandra、MongoDB、MySQL、PostgreSQL、Redisなど、追加のソースに対するディクショナリを有効化
### ClickHouse 22.12 バージョンアップグレード {#clickhouse-2212-version-upgrade}
- JOINサポートを拡張し、Grace Hash Joinを含む
- ファイルの読み取りに対するバイナリJSON (BSON) サポートを追加
- GROUP BY ALL 標準SQL構文のサポートを追加
- 固定精度の小数演算用の新しい数学関数
- 変更の完全なリストについては、[22.12リリースブログ](https://clickhouse.com/blog/clickhouse-release-22-12) および [詳細な22.12変更履歴](/whats-new/cloud#clickhouse-2212-version-upgrade) を参照してください
### コンソールの変更 {#console-changes-26}
- SQLコンソールでのオートコンプリート機能を改善
- デフォルトのリージョンが大陸のローカリティを考慮するようになりました
- 請求使用状況ページを改善し、請求とウェブサイトの単位の両方を表示
### インテグレーションの変更 {#integrations-changes-25}
- DBTリリース [v1.3.2](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md#release-132-2022-12-23)
  - delete+insert のインクリメンタル戦略に対する実験的サポートを追加
  - 新しい s3source マクロ
- Pythonクライアント [v0.4.8](https://github.com/ClickHouse/clickhouse-connect/blob/main/CHANGELOG.md#048-2023-01-02)
  - ファイル挿入サポート
  - サーバーサイドクエリ [パラメータバインディング](/interfaces/cli.md/#cli-queries-with-parameters)
- Goクライアント [v2.5.0](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.5.0)
  - 圧縮時のメモリ使用量を削減
  - サーバーサイドクエリ [パラメータバインディング](/interfaces/cli.md/#cli-queries-with-parameters)
### 信頼性とパフォーマンス {#reliability-and-performance-2}
- オブジェクトストア上の多数の小さなファイルを取得するクエリに対する読み取り性能を改善
- 新しく立ち上げたサービスに対して、サービスが最初に起動するバージョンに設定 [compatibility](/operations/settings/settings#compatibility) を設定
### バグ修正 {#bug-fixes-4}
高度なスケーリングスライダーを使用してリソースを予約すると、すぐに反映されるようになりました。
## 2022年12月20日 {#december-20-2022}

このリリースでは、管理者がSQLコンソールにシームレスにログインできるようにし、コールドリードの読み取り性能を改善し、ClickHouse Cloud用のMetabaseコネクタを改善しました。
### コンソールの変更 {#console-changes-27}
- 管理者ユーザー向けにSQLコンソールへのシームレスアクセスが有効になりました
- 新しい招待者のデフォルトロールを「Administrator」に変更
- オンボーディング調査を追加
### 信頼性とパフォーマンス {#reliability-and-performance-3}
- ネットワーク障害が発生した場合に回復するために、長時間実行されている挿入クエリに対してリトライロジックを追加
- コールドリードの読み取り性能を改善
### インテグレーションの変更 {#integrations-changes-26}
- [Metabaseプラグイン](/integrations/data-visualization/metabase-and-clickhouse.md) が待望のv0.9.1の大規模な更新を果たしました。最新のMetabaseバージョンと互換性があり、ClickHouse Cloudに対して徹底的なテストが行われました。
## 2022年12月6日 - 一般提供 {#december-6-2022---general-availability}

ClickHouse Cloudは、SOC2タイプIIのコンプライアンス、稼働時間SLAによる本番ワークロードへの対応、パブリックステータスページを含むプロダクションに準備が整った状態です。このリリースでは、AWSマーケットプレイス統合、ClickHouseユーザーのためのデータ探索作業台であるSQLコンソール、ClickHouse Academy - ClickHouse Cloudにおける自己学習などの新しい重要な機能が含まれています。詳細はこの [ブログ](https://clickhouse.com/blog/clickhouse-cloud-generally-available) で学べます。
### プロダクション準備完了 {#production-ready}
- SOC2タイプIIのコンプライアンス (詳細は [ブログ](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant) と [Trust Center](https://trust.clickhouse.com/) を参照)
- ClickHouse Cloudの公的 [ステータスページ](https://status.clickhouse.com/)
- 本番使用例向けに稼働時間SLAを提供
- [AWSマーケットプレイス](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc)での利用可能性
### 新しい主要機能 {#major-new-capabilities}
- ClickHouseユーザーのためのデータ探索作業台であるSQLコンソールを導入
- [ClickHouse Academy](https://learn.clickhouse.com/visitor_class_catalog)、ClickHouse Cloudでの自己学習を開始
### 価格とメーター変更 {#pricing-and-metering-changes}
- トライアル期間を30日間に延長
- スタータープロジェクトや開発/ステージング環境に適した固定容量、低月額支出の開発サービスを導入
- ClickHouse Cloudの運用とスケーリングの改善を続ける中で、プロダクションサービスの新しい削減価格を導入
- 計算メーターについての粒度と正確さが向上
### インテグレーションの変更 {#integrations-changes-27}
- ClickHouse Postgres / MySQL統合エンジンのサポートを有効化
- SQLユーザー定義関数 (UDF) のサポートを追加
- 高度なKafka Connectシンクをベータ版に
- バージョン、更新状況などのリッチメタデータを導入することにより、インテグレーションUIを改善
### コンソールの変更 {#console-changes-28}

- クラウドコンソールでの多要素認証のサポート
- モバイルデバイス向けのクラウドコンソールナビゲーションを改善
### ドキュメントの変更 {#documentation-changes}

- ClickHouse Cloud用の専用 [ドキュメント](/cloud/overview) セクションを導入
### バグ修正 {#bug-fixes-5}
- 依存関係の解決により、バックアップからの復元が常に成功しない既知の問題に対処
## 2022年11月29日 {#november-29-2022}

このリリースでは、SOC2タイプIIのコンプライアンスを達成し、ClickHouseのバージョンを22.11に更新し、多くのClickHouseクライアントとインテグレーションを改善しました。
### 一般的な変更 {#general-changes-4}

- SOC2タイプIIのコンプライアンスを達成 (詳細は [ブログ](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant) と [Trust Center](https://trust.clickhouse.com) を参照)
### コンソールの変更 {#console-changes-29}

- サービスが自動的に一時停止されていることを示す「アイドル」ステータスインジケータを追加
### ClickHouse 22.11 バージョンアップグレード {#clickhouse-2211-version-upgrade}

- HudiおよびDeltaLakeテーブルエンジンとテーブル関数のサポートを追加
- S3用の再帰的ディレクトリトラバーサルを改善
- 複合時間間隔構文のサポートを追加
- 挿入の信頼性を改善し、挿入時にリトライを行う
- 変更の完全なリストについては、[詳細な22.11変更履歴](/whats-new/cloud#clickhouse-2211-version-upgrade)を参照
### インテグレーション {#integrations-1}

- Pythonクライアント: v3.11サポート、挿入性能が改善
- Goクライアント: DateTimeおよびInt64サポートの修正
- JSクライアント: 相互SSL認証のサポート
- dbt-clickhouse: DBT v1.3のサポート
### バグ修正 {#bug-fixes-6}

- アップグレード後に古いClickHouseバージョンが表示されるバグを修正
- 「default」アカウントの権限を変更してもセッションが中断されなくなりました
- 新たに作成された非管理者アカウントは、デフォルトでシステムテーブルへのアクセスを持たなくなりました
### このリリースにおける既知の問題 {#known-issues-in-this-release}

- 依存関係の解決により、バックアップからの復元が機能しない可能性があります
## 2022年11月17日 {#november-17-2022}

このリリースでは、ローカルClickHouseテーブルおよびHTTPソースからのディクショナリを有効にし、ムンバイ地域のサポートを導入し、クラウドコンソールユーザーエクスペリエンスを改善しました。
### 一般的な変更 {#general-changes-5}

- ローカルClickHouseテーブルおよびHTTPソースからの[ディクショナリ](/sql-reference/dictionaries/index.md)のサポートを追加
- ムンバイ[地域](/cloud/reference/supported-regions.md)のサポートを導入
### コンソールの変更 {#console-changes-30}

- 請求書フォーマットを改善
- 支払い方法のキャプチャのためにユーザーインターフェースを合理化
- バックアップのためのより細かな活動ログを追加
- ファイルアップロード中のエラーハンドリングを改善
### バグ修正 {#bug-fixes-7}
- 一部のパーツに大きな単一ファイルがある場合に、バックアップに失敗する可能性があるバグを修正
- アクセスリストの変更が同時に適用された場合、バックアップからの復元に成功しないバグを修正
### 既知の問題 {#known-issues}
- 依存関係の解決により、バックアップからの復元が機能しない可能性があります
## 2022年11月3日 {#november-3-2022}

このリリースでは、価格から読み取りおよび書き込みユニットを削除し (詳細は [価格ページ](https://clickhouse.com/pricing) を参照)、ClickHouseのバージョンを22.10に更新し、セルフサービス顧客向けにより高い垂直スケーリングをサポートし、より良いデフォルトにより信頼性を向上させました。
### 一般的な変更 {#general-changes-6}

- 価格モデルから読み取り/書き込みユニットを削除
### 設定の変更 {#configuration-changes-2}

- 安定性の理由から、設定 `allow_suspicious_low_cardinality_types`, `allow_suspicious_fixed_string_types` および `allow_suspicious_codecs` (デフォルトは false) をユーザーが変更できなくなりました。
### コンソールの変更 {#console-changes-31}

- 有料顧客向けの垂直スケーリングの最大制限を720GBメモリに引き上げ
- IPアクセスリストのルールとパスワードを設定するために、バックアップからの復元のワークフローを改善
- サービス作成ダイアログにてGCPおよびAzure用のウェイトリストを導入
- ファイルアップロード中のエラーハンドリングを改善
- 請求管理のワークフローを改善
### ClickHouse 22.10 バージョンアップグレード {#clickhouse-2210-version-upgrade}

- 多数の大きなパーツが存在する場合に「パーツが多すぎる」という閾値を緩めることにより、オブジェクトストア上のマージを改善しました (少なくとも10 GiB)。これにより、単一のテーブルの単一パーティション内にペタバイトのデータを格納できます。
- 一定の時間閾値を超えた後にマージを強制するための設定 `min_age_to_force_merge_seconds` を用いて、マージ制御を改善。
- 設定をリセットするためのMySQL互換構文 `SET setting_name = DEFAULT` を追加しました。
- モートン曲線エンコーディング、Java整数ハッシュ、および乱数生成のための関数を追加しました。
- 変更の完全なリストについては、[詳細な22.10変更履歴](/whats-new/cloud#clickhouse-2210-version-upgrade)を参照してください。
## 2022年10月25日 {#october-25-2022}

このリリースでは、小さなワークロードに対する計算消費を大幅に削減し、計算価格を引き下げ (詳細は [価格ページ](https://clickhouse.com/pricing) を参照)、より良いデフォルトによって安定性を向上させ、ClickHouse Cloudコンソール内の請求および使用状況ビューを強化しました。
### 一般的な変更 {#general-changes-7}

- 最低サービスメモリ割り当てを24Gに削減
- サービスのアイドルタイムアウトを30分から5分に削減
### 設定の変更 {#configuration-changes-3}

- max_parts_in_total を100kから10kに削減しました。MergeTreeテーブル用の設定 `max_parts_in_total` のデフォルト値が100,000から10,000に引き下げられました。この変更の理由は、大量のデータパーツがクラウドでのサービス起動時間を遅くする可能性があるためです。大量のパーツが存在することは、意図せずに選択されたあまりにも細かいパーティションキーを示すことが多く、これを避けるためにデフォルトを変更することで、これらのケースの検出を早期に行えるようになります。
### コンソールの変更 {#console-changes-32}

- トライアルユーザー向けに請求ビュー内のクレジット使用状況の詳細を強化
- 使用状況ビュー内でのツールチップやヘルプテキストを改善し、価格ページへのリンクを追加
- IPフィルタリングのオプションを切り替える際のワークフローを改善
- クラウドコンソールに再送信の確認ボタンを追加
## 2022年10月4日 - ベータ {#october-4-2022---beta}

ClickHouse Cloudは2022年10月4日にパブリックベータを開始しました。この [ブログ](https://clickhouse.com/blog/clickhouse-cloud-public-beta) で詳細を学べます。

ClickHouse Cloudバージョンは、ClickHouseコアv22.10に基づいています。互換性のある機能のリストは、[Cloud Compatibility](/cloud/reference/cloud-compatibility.md)ガイドを参照してください。
