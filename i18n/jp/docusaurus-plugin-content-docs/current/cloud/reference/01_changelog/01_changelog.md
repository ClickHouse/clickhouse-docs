---
slug: /whats-new/cloud
sidebar_label: 'Cloud 変更履歴'
title: 'Cloud 変更履歴'
description: '各 ClickHouse Cloud リリースの新機能を説明する ClickHouse Cloud の変更履歴'
doc_type: 'changelog'
keywords: ['changelog', 'release notes', 'updates', 'new features', 'cloud changes']
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
import dashboards from '@site/static/images/cloud/reference/may-30-dashboards.png';

この ClickHouse Cloud の変更履歴に加えて、[Cloud Compatibility](/whats-new/cloud-compatibility) ページもご覧ください。

:::tip[自動的に最新情報をチェックしましょう！]

<a href="/docs/cloud/changelog-rss.xml">
  Cloud Changelog を RSS で購読する
</a>

:::


## 2025年11月14日 {#november-14-2025}

- **ClickHouse Cloud**が**2つの追加パブリックリージョン**で利用可能になったことを発表いたします：
  - **GCP Japan (asia-northeast1)**
  - **AWS Seoul (Asia Pacific, ap-northeast-2)** — **ClickPipes**でもサポートされました

  これらのリージョンは以前**プライベートリージョン**として提供されていましたが、現在は**すべてのユーザー**が利用可能です。

- TerraformとAPIで、サービスへのタグ追加とタグによるサービスフィルタリングがサポートされました。


## 2025年11月7日 {#november-7-2025}

- ClickHouse Cloudコンソールで、レプリカサイズを1 vCPU、4 GiB単位で設定できるようになりました。
  これらのオプションは、新しいサービスのセットアップ時と、設定ページで最小および最大レプリカサイズを設定する際の両方で利用できます。
- カスタムハードウェアプロファイル(Enterpriseティアで利用可能)がアイドリングをサポートするようになりました。
- ClickHouse CloudがAWS Marketplaceを通じて簡素化された購入体験を提供するようになりました。[従量課金制](https://aws.amazon.com/marketplace/pp/prodview-p4gwofrqpkltu?sr=0-2&ref_=beagle&applicationId=AWSMPContessa)と[コミット支出契約](https://aws.amazon.com/marketplace/pp/prodview-4qyeihstyym2s?sr=0-3&ref_=beagle&applicationId=AWSMPContessa)の個別オプションが用意されています。
- ClickHouse CloudのClickStackユーザーがアラート機能を利用できるようになりました。
  ユーザーはHyperDX UIで直接アラートを作成・管理でき、ログ、メトリクス、トレース全体にわたって追加のセットアップ、インフラストラクチャ、サービス、設定なしで利用できます。アラートはSlack、PagerDutyなどと統合されます。
  詳細については、[アラートのドキュメント](/use-cases/observability/clickstack/alerts)を参照してください。


## 2025年10月17日 {#october-17-2025}

- **サービス監視 - リソース使用率ダッシュボード**  
  CPU使用率とメモリ使用率のメトリクス表示が変更され、平均値ではなく特定期間における最大使用率メトリクスを表示することで、リソース不足のインスタンスをより明確に把握できるようになります。
  また、CPU使用率メトリクスはKubernetesレベルのCPU使用率メトリクスを表示するようになり、ClickHouse Cloudのオートスケーラーが使用するメトリクスにより近い値が表示されます。
- **外部バケット**  
  ClickHouse Cloudでは、バックアップを独自のクラウドサービスプロバイダーアカウントに直接エクスポートできるようになりました。
  外部ストレージバケット（AWS S3、Google Cloud Storage、Azure Blob Storage）を接続し、バックアップ管理を自分で制御できます。


## 2025年8月29日 {#august-29-2025}

- [ClickHouse Cloud Azure Private Link](/cloud/security/azure-privatelink)は、リソース識別にResource GUIDの代わりにResource IDフィルターを使用するように変更されました。従来のResource GUIDは後方互換性があるため引き続き使用できますが、Resource IDフィルターへの切り替えを推奨します。移行の詳細については、Azure Private Linkの[ドキュメント](/cloud/security/azure-privatelink#obtaining-private-endpoint-resourceid)を参照してください。


## 2025年8月22日 {#august-22-2025}

- **ClickHouse Connector for AWS Glue**  
  [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-eqvmuopqzdg7s)から入手可能な公式の[ClickHouse Connector for AWS Glue](/integrations/glue)をご利用いただけるようになりました。AWS GlueのApache Sparkベースのサーバーレスエンジンを活用して、ClickHouseと他のデータソース間でデータの抽出、変換、ロード(ETL)を行うデータ統合を実現します。テーブルの作成方法やClickHouseとSpark間でのデータの書き込み・読み取り方法については、アナウンス[ブログ記事](http://clickhouse.com/blog/clickhouse-connector-aws-glue)をご参照ください。
- **サービスの最小レプリカ数の変更**  
  スケールアップされたサービスを、単一レプリカを使用するように[スケールダウン](/manage/scaling)できるようになりました(従来は最小2レプリカでした)。注意:単一レプリカサービスは可用性が低下するため、本番環境での使用は推奨されません。
- ClickHouse Cloudは、サービスのスケーリングとサービスバージョンのアップグレードに関する通知を、デフォルトで管理者ロールに送信するようになります。ユーザーは通知設定で通知の設定を調整できます。


## 2025年8月13日 {#august-13-2025}

- **MongoDB CDC用ClickPipesがプライベートプレビューで提供開始**
  ClickPipesを使用することで、数クリックでMongoDBからClickHouse Cloudへデータをレプリケートできるようになりました。外部ETLツールを必要とせず、リアルタイム分析が可能です。このコネクタは継続的なレプリケーションと一回限りのマイグレーションの両方に対応しており、MongoDB Atlasおよびセルフホスト型MongoDBデプロイメントと互換性があります。MongoDB CDCコネクタの概要については[ブログ記事](https://clickhouse.com/blog/mongodb-cdc-clickhouse-preview)をご覧ください。[早期アクセスの登録はこちら](https://clickhouse.com/cloud/clickpipes/mongodb-cdc-connector)から!


## 2025年8月8日 {#august-08-2025}

- **通知**: サービスが新しいClickHouseバージョンへのアップグレードを開始する際に、ユーザーはUI通知を受け取るようになりました。通知センターから追加のメールおよびSlack通知を設定できます。
- **ClickPipes**: ClickHouse TerraformプロバイダーにAzure Blob Storage (ABS) ClickPipesのサポートが追加されました。ABS ClickPipeをプログラムで作成する方法の例については、プロバイダーのドキュメントを参照してください。
  - [バグ修正] Nullエンジンを使用する宛先テーブルに書き込むオブジェクトストレージClickPipesが、UIで「Total records」および「Data ingested」メトリクスをレポートするようになりました。
  - [バグ修正] UIのメトリクス用「Time period」セレクターが、選択された期間に関係なく「24 hours」にデフォルト設定されていました。この問題は修正され、UIは選択された期間に応じてチャートを正しく更新するようになりました。
- **クロスリージョンプライベートリンク (AWS)** が一般提供開始となりました。サポートされているリージョンのリストについては、[ドキュメント](/manage/security/aws-privatelink)を参照してください。


## July 31, 2025 {#july-31-2025}

**ClickPipesの垂直スケーリングが利用可能になりました**

[ストリーミングClickPipesで垂直スケーリングが利用可能になりました](https://clickhouse.com/blog/clickpipes-flexible-scaling-monitoring)。
この機能により、レプリカ数(水平スケーリング)に加えて、各レプリカのサイズを制御できます。
各ClickPipeの詳細ページには、レプリカごとのCPUおよびメモリ使用率も表示されるようになり、ワークロードをより正確に把握し、サイズ変更操作を適切に計画できます。


## July 24, 2025 {#july-24-2025}

**ClickPipes for MySQL CDC がパブリックベータで提供開始**

ClickPipes の MySQL CDC コネクタがパブリックベータとして広く利用可能になりました。わずか数クリックで、
外部依存関係なしに MySQL(または MariaDB)のデータを ClickHouse Cloud へリアルタイムで直接レプリケーションを開始できます。
コネクタの概要については[ブログ記事](https://clickhouse.com/blog/mysql-cdc-connector-clickpipes-beta)をご覧いただき、
[クイックスタート](https://clickhouse.com/docs/integrations/clickpipes/mysql)に従ってすぐに使い始めることができます。


## 2025年7月11日 {#june-11-2025}

- 新しいサービスでは、データベースとテーブルのメタデータを中央の**SharedCatalog**に保存するようになりました。
  これは調整とオブジェクトライフサイクルの新しいモデルであり、以下を実現します：
  - 高い同時実行性の下でも動作する**クラウドスケールDDL**
  - **堅牢な削除と新しいDDL操作**
  - ステートレスノードがディスク依存なしで起動するようになったことによる**高速な起動とウェイクアップ**
  - IcebergやDelta Lakeを含む**ネイティブ形式とオープン形式の両方に対応したステートレスコンピュート**

  SharedCatalogの詳細については、[ブログ](https://clickhouse.com/blog/clickhouse-cloud-stateless-compute)をご覧ください

- GCP `europe-west4`でHIPAA準拠サービスを起動できるようになりました


## 2025年6月27日 {#june-27-2025}

- データベース権限を管理するためのTerraformプロバイダーの正式サポートを開始しました。
  このプロバイダーはセルフマネージド環境でも利用可能です。詳細については、
  [ブログ](https://clickhouse.com/blog/new-terraform-provider-manage-clickhouse-database-users-roles-and-privileges-with-code)
  および[ドキュメント](https://registry.terraform.io/providers/ClickHouse/clickhousedbops/latest/docs)
  をご参照ください。
- Enterpriseティアのサービスでは、[スローリリースチャネル](/manage/updates/#slow-release-channel-deferred-upgrades)を利用することで、
  通常リリースから2週間アップグレードを延期し、追加のテスト期間を確保できるようになりました。


## 2025年6月13日 {#june-13-2025}

- ClickHouse Cloud Dashboardsが正式版として提供開始されたことをお知らせします。Dashboardsを使用すると、ダッシュボード上でクエリを可視化し、フィルタやクエリパラメータを使用してデータを操作し、共有を管理できます。
- APIキーIPフィルタ: ClickHouse Cloudとのやり取りに対する保護層を追加しました。APIキーを生成する際に、IP許可リストを設定することで、APIキーを使用できる場所を制限できます。詳細については[ドキュメント](https://clickhouse.com/docs/cloud/security/setting-ip-filters)を参照してください。


## May 30, 2025 {#may-30-2025}

- ClickHouse Cloudにおける**ClickPipes for Postgres CDC**の一般提供開始を発表いたします。わずか数クリックで、Postgresデータベースをレプリケートし、超高速なリアルタイム分析を実現できます。このコネクタは、高速なデータ同期、数秒という低レイテンシ、自動スキーマ変更、完全にセキュアな接続などを提供します。詳細については[ブログ](https://clickhouse.com/blog/postgres-cdc-connector-clickpipes-ga)を参照してください。利用開始方法については、[こちら](https://clickhouse.com/docs/integrations/clickpipes/postgres)の手順を参照してください。

- SQLコンソールダッシュボードに新しい改善を導入しました:
  - 共有: ダッシュボードをチームメンバーと共有できます。4つのアクセスレベルがサポートされており、グローバルおよびユーザー単位で調整可能です:
    - _書き込みアクセス_: ビジュアライゼーションの追加/編集、更新設定、フィルタを介したダッシュボードの操作。
    - _オーナー_: ダッシュボードの共有、削除、および「書き込みアクセス」を持つユーザーのその他すべての権限。
    - _読み取り専用アクセス_: ダッシュボードの表示とフィルタを介した操作
    - _アクセス権なし_: ダッシュボードを表示できません
  - 既に作成されている既存のダッシュボードについては、組織管理者が既存のダッシュボードを自分自身にオーナーとして割り当てることができます。
  - クエリビューから、SQLコンソールのテーブルまたはチャートをダッシュボードに追加できるようになりました。

<Image img={dashboards} size='md' alt='ダッシュボードの改善' border />

- AWSおよびGCP向けの[分散キャッシュ](https://clickhouse.com/cloud/distributed-cache-waitlist)のプレビュー参加者を募集しています。詳細は[ブログ](https://clickhouse.com/blog/building-a-distributed-cache-for-s3)をご覧ください。


## 2025年5月16日 {#may-16-2025}

- ClickHouse Cloudのサービスで使用されているリソースを表示するリソース使用率ダッシュボードを導入しました。以下のメトリクスがシステムテーブルから収集され、このダッシュボードに表示されます:
  - メモリとCPU: `CGroupMemoryTotal`(割り当てメモリ)、`CGroupMaxCPU`(割り当てCPU)、`MemoryResident`(使用メモリ)、`ProfileEvent_OSCPUVirtualTimeMicroseconds`(使用CPU)のグラフ
  - データ転送: ClickHouse Cloudとの間のデータ受信と送信を示すグラフ。詳細は[こちら](/cloud/manage/network-data-transfer)をご覧ください。
- ClickHouse Cloudサービスの監視を簡素化するために開発された、新しいClickHouse Cloud Prometheus/Grafana mix-inのリリースを発表します。このmix-inは、Prometheus互換のAPIエンドポイントを使用して、ClickHouseメトリクスを既存のPrometheusおよびGrafanaセットアップにシームレスに統合します。サービスの健全性とパフォーマンスをリアルタイムで可視化できる事前設定済みのダッシュボードが含まれています。詳細については、リリース[ブログ](https://clickhouse.com/blog/monitor-with-new-prometheus-grafana-mix-in)をご参照ください。


## 2025年4月18日 {#april-18-2025}

- 新しい組織レベルロール **Member** と、2つの新しいサービスレベルロール **Service Admin** および **Service Read Only** を導入しました。
  **Member** は、SAML SSOユーザーにデフォルトで割り当てられる組織レベルロールで、サインインとプロフィール更新機能のみを提供します。**Service Admin** および **Service Read Only** ロールは、1つ以上のサービスに対して、**Member**、**Developer**、または **Billing Admin** ロールを持つユーザーに割り当てることができます。詳細については、["ClickHouse Cloudのアクセス制御"](https://clickhouse.com/docs/cloud/security/cloud-access-management/overview)を参照してください。
- ClickHouse Cloudは、**Enterprise** のお客様向けに、以下のリージョンで **HIPAA** および **PCI** サービスの提供を開始しました：AWS eu-central-1、AWS eu-west-2、AWS us-east-2。
- **ClickPipesのユーザー向け通知機能** を導入しました。この機能は、ClickPipesの障害に対する自動アラートを、メール、ClickHouse Cloud UI、およびSlackを通じて送信します。メールとUIによる通知はデフォルトで有効になっており、パイプごとに設定できます。**Postgres CDC ClickPipes** の場合、アラートはレプリケーションスロットのしきい値（**Settings** タブで設定可能）、特定のエラータイプ、および障害を解決するためのセルフサービス手順もカバーします。
- **MySQL CDCのプライベートプレビュー** が開始されました。これにより、お客様は数クリックでMySQLデータベースをClickHouse Cloudにレプリケートでき、高速な分析を可能にし、外部ETLツールの必要性を排除します。このコネクタは、MySQLがクラウド（RDS、Aurora、Cloud SQL、Azureなど）またはオンプレミスのいずれにある場合でも、継続的なレプリケーションと一回限りのマイグレーションの両方をサポートします。プライベートプレビューへの登録は、[こちらのリンク](https://clickhouse.com/cloud/clickpipes/mysql-cdc-connector)から行えます。
- **ClickPipes向けAWS PrivateLink** を導入しました。AWS PrivateLinkを使用して、VPC、AWSサービス、オンプレミスシステム、およびClickHouse Cloud間のセキュアな接続を確立できます。これにより、AWS上のPostgreSQL、MySQL、MSKなどのソースからデータを移動する際に、トラフィックをパブリックインターネットに公開することなく実行できます。また、VPCサービスエンドポイントを通じたクロスリージョンアクセスもサポートしています。PrivateLink接続のセットアップは、ClickPipesを通じて[完全にセルフサービス](https://clickhouse.com/docs/integrations/clickpipes/aws-privatelink)で行えるようになりました。


## 2025年4月4日 {#april-4-2025}

- ClickHouse CloudのSlack通知: ClickHouse Cloudは、コンソール内通知およびメール通知に加えて、課金、スケーリング、ClickPipesイベントに関するSlack通知をサポートするようになりました。これらの通知はClickHouse Cloud Slackアプリケーションを介して送信されます。組織管理者は、通知センターで通知を送信するSlackチャンネルを指定することで、これらの通知を設定できます。
- ProductionサービスおよびDevelopmentサービスを実行しているユーザーは、請求書にClickPipesおよびデータ転送の利用料金が表示されるようになります。


## 2025年3月21日 {#march-21-2025}

- AWSにおけるクロスリージョンPrivate Link接続がベータ版として提供開始されました。セットアップ方法およびサポート対象リージョンの詳細については、
  ClickHouse CloudのPrivate Link[ドキュメント](/manage/security/aws-privatelink)をご参照ください。
- AWS上のサービスで利用可能な最大レプリカサイズが236 GiB RAMに設定されました。
  これにより、バックグラウンドプロセスへのリソース割り当てを確保しながら、効率的な利用が可能になります。


## 2025年3月7日 {#march-7-2025}

- 新しい`UsageCost` APIエンドポイント: API仕様に、使用状況情報を取得するための新しいエンドポイントが追加されました。これは組織レベルのエンドポイントで、使用コストは最大31日間照会できます。取得可能なメトリクスには、ストレージ、コンピュート、データ転送、ClickPipesが含まれます。詳細については[ドキュメント](https://clickhouse.com/docs/cloud/manage/api/usageCost-api-reference)を参照してください。
- Terraformプロバイダー[v2.1.0](https://registry.terraform.io/providers/ClickHouse/clickhouse/2.1.0/docs/resources/service#nestedatt--endpoints_configuration)リリースで、MySQLエンドポイントの有効化がサポートされました。


## 2025年2月21日 {#february-21-2025}

### AWS向けClickHouse Bring Your Own Cloud (BYOC)が正式提供開始 {#clickhouse-byoc-for-aws-ga}

このデプロイメントモデルでは、データプレーンコンポーネント(コンピュート、ストレージ、バックアップ、ログ、メトリクス)は顧客VPC内で実行され、コントロールプレーン(Webアクセス、API、課金)はClickHouse VPC内に残ります。このセットアップは、すべてのデータを安全な顧客環境内に保持することで、厳格なデータレジデンシー要件への準拠が必要な大規模ワークロードに最適です。

- 詳細については、BYOCの[ドキュメント](/cloud/reference/byoc/overview)を参照するか、[発表ブログ記事](https://clickhouse.com/blog/announcing-general-availability-of-clickhouse-bring-your-own-cloud-on-aws)をご覧ください。
- アクセスをリクエストするには、[お問い合わせ](https://clickhouse.com/cloud/bring-your-own-cloud)ください。

### ClickPipes用Postgres CDCコネクタ {#postgres-cdc-connector-for-clickpipes}

ClickPipes用Postgres CDCコネクタにより、ユーザーはPostgresデータベースをClickHouse Cloudへシームレスにレプリケートできます。

- 開始するには、ClickPipes Postgres CDCコネクタの[ドキュメント](https://clickhouse.com/docs/integrations/clickpipes/postgres)を参照してください。
- 顧客のユースケースと機能の詳細については、[ランディングページ](https://clickhouse.com/cloud/clickpipes/postgres-cdc-connector)および[リリースブログ](https://clickhouse.com/blog/postgres-cdc-connector-clickpipes-public-beta)を参照してください。

### AWS上のClickHouse CloudのPCI準拠 {#pci-compliance-for-clickhouse-cloud-on-aws}

ClickHouse Cloudは、**us-east-1**および**us-west-2**リージョンの**Enterpriseティア**顧客向けに**PCI準拠サービス**をサポートするようになりました。PCI準拠環境でサービスを起動したいユーザーは、[サポート](https://clickhouse.com/support/program)に連絡してサポートを受けることができます。

### Google Cloud Platformでの透過的データ暗号化と顧客管理暗号化キー {#tde-and-cmek-on-gcp}

**Google Cloud Platform (GCP)**上のClickHouse Cloudで、**透過的データ暗号化(TDE)**および**顧客管理暗号化キー(CMEK)**のサポートが利用可能になりました。

- 詳細については、これらの機能の[ドキュメント](https://clickhouse.com/docs/cloud/security/cmek#transparent-data-encryption-tde)を参照してください。

### AWS中東(UAE)での提供開始 {#aws-middle-east-uae-availability}

ClickHouse Cloudに新しいリージョンサポートが追加され、**AWS中東(UAE) me-central-1**リージョンで利用可能になりました。

### ClickHouse Cloudガードレール {#clickhouse-cloud-guardrails}

ベストプラクティスを促進し、ClickHouse Cloudの安定した使用を確保するため、使用中のテーブル、データベース、パーティション、パーツの数に対するガードレールを導入します。

- 詳細については、ドキュメントの[使用制限](https://clickhouse.com/docs/cloud/bestpractices/usage-limits)セクションを参照してください。
- サービスがすでにこれらの制限を超えている場合、10%の増加を許可します。ご質問がある場合は、[サポート](https://clickhouse.com/support/program)にお問い合わせください。


## 2025年1月27日 {#january-27-2025}

### ClickHouse Cloudティアの変更 {#changes-to-clickhouse-cloud-tiers}

私たちは、お客様の絶えず変化する要件に対応するため、製品の適応に取り組んでいます。過去2年間の一般提供開始以来、ClickHouse Cloudは大幅に進化し、お客様がクラウドサービスをどのように活用しているかについて貴重な知見を得てきました。

お客様のワークロードに対するClickHouse Cloudサービスのサイジングとコスト効率を最適化するための新機能を導入します。これには、**コンピュート-コンピュート分離**、高性能マシンタイプ、**シングルレプリカサービス**が含まれます。また、自動スケーリングとマネージドアップグレードをより継ぎ目なく、反応的に実行できるよう進化させています。

最も要求の厳しいお客様とワークロードのニーズに応えるため、**新しいEnterpriseティア**を追加します。これは、業界固有のセキュリティとコンプライアンス機能、基盤となるハードウェアとアップグレードに対するさらなる制御、高度なディザスタリカバリ機能に焦点を当てています。

これらの変更をサポートするため、現在の**Development**ティアと**Production**ティアを再構築し、進化するお客様層によるサービスの利用実態により密接に対応させます。新しいアイデアやプロジェクトをテストするユーザー向けの**Basic**ティアと、本番ワークロードや大規模データを扱うユーザー向けの**Scale**ティアを導入します。

これらおよびその他の機能変更については、この[ブログ](https://clickhouse.com/blog/evolution-of-clickhouse-cloud-new-features-superior-performance-tailored-offerings)をご覧ください。既存のお客様は、[新しいプラン](https://clickhouse.com/pricing)を選択するための対応が必要です。組織管理者には、お客様向けの通知が電子メールで送信されました。

### Warehouses: コンピュート-コンピュート分離(GA) {#warehouses-compute-compute-separation-ga}

コンピュート-コンピュート分離(「Warehouses」とも呼ばれます)が一般提供されました。詳細については[ブログ](https://clickhouse.com/blog/introducing-warehouses-compute-compute-separation-in-clickhouse-cloud)および[ドキュメント](/cloud/reference/warehouses)を参照してください。

### シングルレプリカサービス {#single-replica-services}

「シングルレプリカサービス」の概念を、スタンドアロンサービスとしても、warehouses内でも導入します。スタンドアロンサービスとしては、シングルレプリカサービスはサイズが制限されており、小規模なテストワークロード向けに使用されることを想定しています。warehouses内では、シングルレプリカサービスをより大きなサイズでデプロイでき、再起動可能なETLジョブなど、大規模な高可用性を必要としないワークロードに利用できます。

### 垂直自動スケーリングの改善 {#vertical-auto-scaling-improvements}

コンピュートレプリカ向けの新しい垂直スケーリングメカニズムを導入します。これを「Make Before Break」(MBB)と呼んでいます。このアプローチは、古いレプリカを削除する前に新しいサイズのレプリカを1つ以上追加することで、スケーリング操作中の容量損失を防ぎます。既存のレプリカの削除と新しいレプリカの追加の間のギャップを排除することで、MBBはより継ぎ目のない、中断の少ないスケーリングプロセスを実現します。これは特にスケールアップシナリオで有益です。高いリソース使用率が追加容量の必要性を引き起こす場合、レプリカを早期に削除するとリソース制約をさらに悪化させるためです。

### 水平スケーリング(GA) {#horizontal-scaling-ga}

水平スケーリングが一般提供されました。ユーザーは、APIとクラウドコンソールを通じて追加のレプリカを追加し、サービスをスケールアウトできます。詳細については[ドキュメント](/manage/scaling#manual-horizontal-scaling)を参照してください。

### 設定可能なバックアップ {#configurable-backups}

お客様が自身のクラウドアカウントにバックアップをエクスポートする機能をサポートするようになりました。詳細については[ドキュメント](/cloud/manage/backups/configurable-backups)を参照してください。

### マネージドアップグレードの改善 {#managed-upgrade-improvements}

安全なマネージドアップグレードは、機能追加に伴うデータベースの進化に追従できるようにすることで、ユーザーに大きな価値を提供します。今回のロールアウトでは、アップグレードに「make before break」(MBB)アプローチを適用し、実行中のワークロードへの影響をさらに軽減しました。

### HIPAAサポート {#hipaa-support}

AWS `us-east-1`、`us-west-2`およびGCP `us-central1`、`us-east1`を含む準拠リージョンでHIPAAをサポートするようになりました。利用を希望するお客様は、Business Associate Agreement(BAA)に署名し、リージョンの準拠バージョンにデプロイする必要があります。HIPAAの詳細については、[ドキュメント](/cloud/security/compliance-overview)を参照してください。

### スケジュールされたアップグレード {#scheduled-upgrades}

ユーザーはサービスのアップグレードをスケジュールできます。この機能はEnterpriseティアサービスでのみサポートされています。スケジュールされたアップグレードの詳細については、[ドキュメント](/manage/updates)を参照してください。

### 複合型に対する言語クライアントサポート {#language-client-support-for-complex-types}


[Golang](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.30.1)、[Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.11)、および[NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.1)クライアントにDynamic型、Variant型、JSON型のサポートが追加されました。

### リフレッシュ可能なマテリアライズドビューのdbtサポート {#dbt-support-for-refreshable-materialized-views}

dbtは`1.8.7`リリースで[リフレッシュ可能なマテリアライズドビューをサポート](https://github.com/ClickHouse/dbt-clickhouse/releases/tag/v1.8.7)するようになりました。

### JWTトークンサポート {#jwt-token-support}

JDBCドライバv2、clickhouse-java、[Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.12)、および[ NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.0)クライアントにJWTベース認証のサポートが追加されました。

JDBC / Javaは[ 0.8.0](https://github.com/ClickHouse/clickhouse-java/releases/tag/v0.8.0)でリリース予定です - リリース時期は未定です。

### Prometheus統合の改善 {#prometheus-integration-improvements}

Prometheus統合にいくつかの機能強化を追加しました:

- **組織レベルのエンドポイント**。ClickHouse CloudのPrometheus統合に機能強化を導入しました。サービスレベルのメトリクスに加えて、APIに**組織レベルのメトリクス**用のエンドポイントが追加されました。この新しいエンドポイントは、組織内のすべてのサービスのメトリクスを自動的に収集し、Prometheusコレクターへのメトリクスエクスポートプロセスを効率化します。これらのメトリクスは、GrafanaやDatadogなどの可視化ツールと統合することで、組織のパフォーマンスをより包括的に把握できます。

  この機能は現在すべてのユーザーが利用できます。詳細は[こちら](/integrations/prometheus)をご覧ください。

- **フィルタリングされたメトリクス**。ClickHouse CloudのPrometheus統合で、フィルタリングされたメトリクスリストを返すサポートを追加しました。この機能により、サービスの健全性監視に重要なメトリクスに焦点を当てることができ、レスポンスペイロードサイズの削減に役立ちます。

  この機能はAPIのオプションのクエリパラメータを介して利用でき、データ収集の最適化やGrafanaやDatadogなどのツールとの統合の効率化が容易になります。

  フィルタリングされたメトリクス機能は現在すべてのユーザーが利用できます。詳細は[こちら](/integrations/prometheus)をご覧ください。


## 2024年12月20日 {#december-20-2024}

### マーケットプレイスサブスクリプションの組織への紐付け {#marketplace-subscription-organization-attachment}

新しいマーケットプレイスサブスクリプションを既存のClickHouse Cloud組織に紐付けることができるようになりました。マーケットプレイスでのサブスクリプション登録を完了し、ClickHouse Cloudにリダイレクトされた後、過去に作成した既存の組織を新しいマーケットプレイスサブスクリプションに接続できます。この時点以降、組織内のリソースはマーケットプレイス経由で請求されます。

<Image
  img={add_marketplace}
  size='md'
  alt='既存の組織にマーケットプレイスサブスクリプションを追加する方法を示すClickHouse Cloudインターフェース'
  border
/>

### OpenAPIキーの有効期限の強制 {#force-openapi-key-expiration}

APIキーの有効期限オプションを制限し、有効期限のないOpenAPIキーを作成できないようにすることが可能になりました。組織に対してこれらの制限を有効にするには、ClickHouse Cloudサポートチームにお問い合わせください。

### 通知用のカスタムメールアドレス {#custom-emails-for-notifications}

組織管理者は、特定の通知に追加の受信者としてメールアドレスを追加できるようになりました。これは、エイリアスや、ClickHouse Cloudのユーザーではない組織内の他のユーザーに通知を送信したい場合に便利です。設定するには、クラウドコンソールから通知設定に移動し、メール通知を受信したいメールアドレスを編集してください。


## 2024年12月6日 {#december-6-2024}

### BYOC（ベータ版） {#byoc-beta}

AWS向けBring Your Own Cloudがベータ版として利用可能になりました。このデプロイメントモデルでは、お客様自身のAWSアカウント内でClickHouse Cloudをデプロイおよび実行できます。11以上のAWSリージョンでのデプロイメントをサポートしており、今後さらに追加予定です。アクセスについては[サポートにお問い合わせ](https://clickhouse.com/support/program)ください。なお、このデプロイメントは大規模デプロイメント向けに提供されています。

### ClickPipesにおけるPostgres Change Data Capture（CDC）コネクタ {#postgres-change-data-capture-cdc-connector-in-clickpipes}

このターンキー統合により、お客様はわずか数クリックでPostgresデータベースをClickHouse Cloudにレプリケートし、ClickHouseを活用して超高速な分析を実現できます。このコネクタは、Postgresからの継続的なレプリケーションと一回限りのマイグレーションの両方に使用できます。

### ダッシュボード（ベータ版） {#dashboards-beta}

今週、ClickHouse Cloudにおけるダッシュボードのベータ版リリースを発表できることを嬉しく思います。ダッシュボードを使用すると、保存されたクエリを可視化に変換し、可視化をダッシュボード上に整理し、クエリパラメータを使用してダッシュボードと対話できます。開始するには、[ダッシュボードのドキュメント](/cloud/manage/dashboards)を参照してください。

<Image
  img={beta_dashboards}
  size='lg'
  alt='可視化を含む新しいダッシュボードベータ機能を表示するClickHouse Cloudインターフェース'
  border
/>

### Query APIエンドポイント（GA） {#query-api-endpoints-ga}

ClickHouse CloudにおけるQuery APIエンドポイントのGA版リリースを発表できることを嬉しく思います。Query APIエンドポイントを使用すると、わずか数クリックで保存されたクエリ用のRESTful APIエンドポイントを立ち上げ、言語クライアントや認証の複雑さに悩まされることなく、アプリケーションでデータの利用を開始できます。初回リリース以降、以下を含む多数の改善を提供してきました：

- エンドポイントのレイテンシの削減（特にコールドスタート時）
- エンドポイントのRBAC制御の強化
- 設定可能なCORS許可ドメイン
- 結果のストリーミング
- すべてのClickHouse互換出力フォーマットのサポート

これらの改善に加えて、既存のフレームワークを活用し、ClickHouse Cloudサービスに対して任意のSQLクエリを実行できる汎用クエリAPIエンドポイントを発表できることを嬉しく思います。汎用エンドポイントは、サービス設定ページから有効化および設定できます。

開始するには、[Query APIエンドポイントのドキュメント](/cloud/get-started/query-endpoints)を参照してください。

<Image
  img={api_endpoints}
  size='lg'
  alt='各種設定を含むAPIエンドポイント設定を表示するClickHouse Cloudインターフェース'
  border
/>

### ネイティブJSONサポート（ベータ版） {#native-json-support-beta}

ClickHouse CloudにおけるネイティブJSONサポートのベータ版をリリースします。開始するには、[クラウドサービスを有効化するためにサポートにお問い合わせ](/cloud/support)ください。

### ベクトル類似性インデックスを使用したベクトル検索（アーリーアクセス） {#vector-search-using-vector-similarity-indexes-early-access}

近似ベクトル検索のためのベクトル類似性インデックスをアーリーアクセスとして発表します。

ClickHouseは既に、幅広い[距離関数](https://clickhouse.com/blog/reinvent-2024-product-announcements#vector-search-using-vector-similarity-indexes-early-access)と線形スキャンを実行する機能により、ベクトルベースのユースケースに対する堅牢なサポートを提供しています。さらに最近では、[usearch](https://github.com/unum-cloud/usearch)ライブラリとHierarchical Navigable Small Worlds（HNSW）近似最近傍探索アルゴリズムを活用した実験的な[近似ベクトル検索](/engines/table-engines/mergetree-family/annindexes)アプローチを追加しました。

開始するには、[アーリーアクセスのウェイトリストにご登録ください](https://clickhouse.com/cloud/vector-search-index-waitlist)。

### ClickHouse-connect（Python）およびClickHouse Kafka Connectユーザー {#clickhouse-connect-python-and-clickhouse-kafka-connect-users}

クライアントが`MEMORY_LIMIT_EXCEEDED`例外に遭遇する可能性がある問題を経験されたお客様に通知メールを送信しました。

以下にアップグレードしてください：

- Kafka-Connect：> 1.2.5
- ClickHouse-Connect（Java）：> 0.8.6

### ClickPipesがAWSでのクロスVPCリソースアクセスをサポート {#clickpipes-now-supports-cross-vpc-resource-access-on-aws}

AWS MSKなどの特定のデータソースへの単方向アクセスを許可できるようになりました。AWS PrivateLinkおよびVPC Latticeを使用したクロスVPCリソースアクセスにより、パブリックネットワークを経由する際のプライバシーとセキュリティを損なうことなく、VPCやアカウントの境界を越えて、またはオンプレミスネットワークからでも、個別のリソースを共有できます。開始してリソース共有を設定するには、[発表記事](https://clickhouse.com/blog/clickpipes-crossvpc-resource-endpoints?utm_medium=web&utm_source=changelog)をお読みください。


<Image
  img={cross_vpc}
  size='lg'
  alt='AWS MSKに接続するClickPipesのクロスVPCリソースアクセスアーキテクチャを示す図'
  border
/>

### ClickPipesがAWS MSK向けIAM認証に対応 {#clickpipes-now-supports-iam-for-aws-msk}

AWS MSK ClickPipesでMSKブローカーへの接続にIAM認証を使用できるようになりました。詳細については、[ドキュメント](/integrations/clickpipes/kafka/best-practices/#iam)をご参照ください。

### AWS上の新規サービスにおける最大レプリカサイズ {#maximum-replica-size-for-new-services-on-aws}

今後、AWS上で作成される新規サービスでは、最大レプリカサイズが236 GiBまで利用可能になります。


## 2024年11月22日 {#november-22-2024}

### ClickHouse Cloud向け組み込み高度な可観測性ダッシュボード {#built-in-advanced-observability-dashboard-for-clickhouse-cloud}

これまで、ClickHouseサーバーのメトリクスとハードウェアリソース使用率を監視できる高度な可観測性ダッシュボードは、オープンソース版のClickHouseでのみ利用可能でした。この機能がClickHouse Cloudコンソールでも利用可能になったことをお知らせします。

このダッシュボードでは、[system.dashboards](/operations/system-tables/dashboards)テーブルに基づくクエリをオールインワンUIで表示できます。**Monitoring > Service Health**ページにアクセスして、高度な可観測性ダッシュボードを今すぐ使い始めましょう。

<Image
  img={nov_22}
  size='lg'
  alt='サーバーメトリクスとリソース使用率を表示するClickHouse Cloud高度な可観測性ダッシュボード'
  border
/>

### AI駆動のSQL自動補完 {#ai-powered-sql-autocomplete}

自動補完機能を大幅に改善し、新しいAI Copilotを使用してクエリを記述する際にインラインでSQLの補完候補を取得できるようになりました。この機能は、任意のClickHouse Cloudサービスで**「Enable Inline Code Completion」**設定を切り替えることで有効化できます。

<Image
  img={copilot}
  size='lg'
  alt='ユーザーが入力する際にAI CopilotがSQL自動補完候補を提供する様子を示すアニメーション'
  border
/>

### 新しい「billing」ロール {#new-billing-role}

組織内のユーザーに新しい**Billing**ロールを割り当てることができるようになりました。このロールでは、サービスの設定や管理権限を付与することなく、請求情報の閲覧と管理が可能です。新しいユーザーを招待するか、既存ユーザーのロールを編集して**Billing**ロールを割り当ててください。


## November 8, 2024 {#november-8-2024}

### ClickHouse Cloudの顧客通知機能 {#customer-notifications-in-clickhouse-cloud}

ClickHouse Cloudでは、課金やスケーリングに関する各種イベントについて、コンソール内通知とメール通知が利用できるようになりました。クラウドコンソールの通知センターから、UI上のみに表示、メールで受信、または両方を選択するよう設定できます。通知のカテゴリと重要度は、サービスレベルで設定可能です。

今後、他のイベントに対する通知や、通知を受信するための追加の方法を提供する予定です。

サービスの通知を有効にする方法の詳細については、[ClickHouseドキュメント](/cloud/notifications)を参照してください。

<Image
  img={notifications}
  size='lg'
  alt='各種通知タイプの設定オプションを表示するClickHouse Cloud通知センターのインターフェース'
  border
/>

<br />


## 2024年10月4日 {#october-4-2024}

### ClickHouse CloudがGCP向けにHIPAA対応サービスをベータ版で提供開始 {#clickhouse-cloud-now-offers-hipaa-ready-services-in-beta-for-gcp}

保護対象保健情報（PHI）のセキュリティ強化を求めるお客様は、[Google Cloud Platform (GCP)](https://cloud.google.com/)上でClickHouse Cloudをご利用いただけるようになりました。ClickHouseは[HIPAAセキュリティ規則](https://www.hhs.gov/hipaa/for-professionals/security/index.html)で規定された管理的、物理的、技術的保護措置を実装しており、お客様の特定のユースケースとワークロードに応じて設定可能なセキュリティ設定を提供しています。利用可能なセキュリティ設定の詳細については、[セキュリティ機能ページ](/cloud/security)をご確認ください。

サービスはGCPの`us-central-1`リージョンで**Dedicated**サービスタイプのお客様向けに提供されており、事業提携契約（BAA）が必要です。この機能へのアクセスをリクエストする場合、または追加のGCP、AWS、Azureリージョンのウェイトリストに参加する場合は、[営業](mailto:sales@clickhouse.com)または[サポート](https://clickhouse.com/support/program)までお問い合わせください。

### コンピュート分離機能がGCPとAzureでプライベートプレビュー開始 {#compute-compute-separation-is-now-in-private-preview-for-gcp-and-azure}

先日、AWS向けのコンピュート分離機能のプライベートプレビューを発表しました。このたび、GCPとAzureでも利用可能になったことをお知らせいたします。

コンピュート分離機能により、特定のサービスを読み書き用または読み取り専用サービスとして指定でき、アプリケーションに最適なコンピュート構成を設計してコストとパフォーマンスを最適化できます。詳細については[ドキュメント](/cloud/reference/warehouses)をご参照ください。

### セルフサービスMFAリカバリーコード {#self-service-mfa-recovery-codes}

多要素認証を使用しているお客様は、携帯電話の紛失やトークンの誤削除時に使用できるリカバリーコードを取得できるようになりました。MFAに初めて登録するお客様には、セットアップ時にコードが提供されます。既存のMFAをお持ちのお客様は、既存のMFAトークンを削除して新しいトークンを追加することでリカバリーコードを取得できます。

### ClickPipesアップデート：カスタム証明書、レイテンシインサイトなど {#clickpipes-update-custom-certificates-latency-insights-and-more}

ClickHouseサービスへのデータ取り込みを最も簡単に行える方法であるClickPipesの最新アップデートをお知らせします。これらの新機能は、データ取り込みの制御を強化し、パフォーマンスメトリクスの可視性を向上させるように設計されています。

_Kafka用カスタム認証証明書_

ClickPipes for Kafkaは、SASLおよびパブリックSSL/TLSを使用したKafkaブローカー向けのカスタム認証証明書をサポートするようになりました。ClickPipeのセットアップ時にSSL証明書セクションで独自の証明書を簡単にアップロードでき、Kafkaへのより安全な接続を確保できます。

_KafkaとKinesis向けレイテンシメトリクスの導入_

パフォーマンスの可視性は極めて重要です。ClickPipesにレイテンシグラフが追加され、メッセージの生成（KafkaトピックまたはKinesisストリームから）からClickHouse Cloudへの取り込みまでの時間を把握できるようになりました。この新しいメトリクスにより、データパイプラインのパフォーマンスをより詳細に監視し、それに応じて最適化できます。

<Image
  img={latency_insights}
  size='lg'
  alt='データ取り込みパフォーマンスのレイテンシメトリクスグラフを表示するClickPipesインターフェース'
  border
/>

<br />

_KafkaとKinesis向けスケーリング制御（プライベートベータ）_

高スループットは、データ量とレイテンシの要件を満たすために追加のリソースを必要とする場合があります。ClickPipesの水平スケーリング機能を導入し、クラウドコンソールから直接利用できるようになりました。この機能は現在プライベートベータ版であり、要件に基づいてリソースをより効果的にスケーリングできます。ベータ版への参加をご希望の場合は、[サポート](https://clickhouse.com/support/program)までお問い合わせください。

_KafkaとKinesis向け生メッセージ取り込み_

KafkaまたはKinesisメッセージ全体を解析せずに取り込むことが可能になりました。ClickPipesは`_raw_message`[仮想カラム](/integrations/clickpipes/kafka/reference/#kafka-virtual-columns)をサポートし、メッセージ全体を単一のString型カラムにマッピングできるようになりました。これにより、必要に応じて生データを柔軟に扱うことができます。


## 2024年8月29日 {#august-29-2024}

### 新しいTerraformプロバイダーバージョン - v1.0.0 {#new-terraform-provider-version---v100}

Terraformを使用すると、ClickHouse Cloudサービスをプログラムで制御し、構成をコードとして保存できます。当社のTerraformプロバイダーは約20万回のダウンロードを記録し、正式にv1.0.0となりました。この新バージョンには、改善されたリトライロジックや、ClickHouse Cloudサービスにプライベートエンドポイントを接続するための新しいリソースなどの改良が含まれています。[Terraformプロバイダーはこちら](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest)からダウンロードでき、[完全な変更履歴はこちら](https://github.com/ClickHouse/terraform-provider-clickhouse/releases/tag/v1.0.0)で確認できます。

### 2024年SOC 2 Type IIレポートおよび更新されたISO 27001認証 {#2024-soc-2-type-ii-report-and-updated-iso-27001-certificate}

2024年SOC 2 Type IIレポートおよび更新されたISO 27001認証の提供開始をお知らせいたします。これらには、最近開始したAzure上のサービスに加え、AWSおよびGCP上のサービスの継続的な対応範囲が含まれています。

当社のSOC 2 Type IIは、ClickHouseユーザーに提供するサービスのセキュリティ、可用性、処理の完全性、機密性を確保するための継続的なコミットメントを示しています。詳細については、米国公認会計士協会(AICPA)が発行する[SOC 2 - SOC for Service Organizations: Trust Services Criteria](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services)および国際標準化機構(ISO)の[What is ISO/IEC 27001](https://www.iso.org/standard/27001)をご確認ください。

セキュリティおよびコンプライアンスに関する文書とレポートについては、当社の[トラストセンター](https://trust.clickhouse.com/)もご確認ください。


## 2024年8月15日 {#august-15-2024}

### AWSでCompute-compute分離機能のプライベートプレビューを開始 {#compute-compute-separation-is-now-in-private-preview-for-aws}

既存のClickHouse Cloudサービスでは、レプリカが読み取りと書き込みの両方を処理しており、特定のレプリカを一方の操作のみに限定する設定方法はありませんでした。新たに提供されるCompute-compute分離機能では、特定のサービスを読み取り/書き込みサービスまたは読み取り専用サービスとして指定できるようになり、アプリケーションに最適なコンピュート構成を設計してコストとパフォーマンスを最適化できます。

この新しいCompute-compute分離機能により、同じオブジェクトストレージフォルダを使用する複数のコンピュートノードグループを作成できます。各グループは独自のエンドポイントを持ち、同じテーブルやビューなどを共有します。[Compute-compute分離の詳細はこちら](/cloud/reference/warehouses)をご覧ください。プライベートプレビューでこの機能へのアクセスをご希望の場合は、[サポートにお問い合わせ](https://clickhouse.com/support/program)ください。

<Image
  img={cloud_console_2}
  size='lg'
  alt='読み取り/書き込みサービスグループと読み取り専用サービスグループを使用したCompute-compute分離のアーキテクチャ例を示す図'
  border
/>

### S3およびGCS向けClickPipesが正式版として提供開始、継続モードに対応 {#clickpipes-for-s3-and-gcs-now-in-ga-continuous-mode-support}

ClickPipesは、ClickHouse Cloudへデータを取り込む最も簡単な方法です。S3およびGCS向けの[ClickPipes](https://clickhouse.com/cloud/clickpipes)が**正式版**として提供開始されたことをお知らせします。ClickPipesは、1回限りのバッチ取り込みと「継続モード」の両方に対応しています。取り込みタスクでは、特定のリモートバケットからパターンに一致するすべてのファイルをClickHouseの宛先テーブルにロードします。「継続モード」では、ClickPipesジョブが常時実行され、リモートオブジェクトストレージバケットに追加された一致するファイルを到着と同時に取り込みます。これにより、任意のオブジェクトストレージバケットをClickHouse Cloudへのデータ取り込み用の本格的なステージング領域として活用できます。ClickPipesの詳細については、[ドキュメント](/integrations/clickpipes)をご覧ください。


## 2024年7月18日 {#july-18-2024}

### メトリクス用Prometheusエンドポイントが正式提供開始 {#prometheus-endpoint-for-metrics-is-now-generally-available}

前回のクラウド変更履歴で、ClickHouse Cloudから[Prometheus](https://prometheus.io/)メトリクスをエクスポートするプライベートプレビューを発表しました。この機能により、[ClickHouse Cloud API](/cloud/manage/api/api-overview)を使用して、[Grafana](https://grafana.com/)や[Datadog](https://www.datadoghq.com/)などのツールにメトリクスを取り込み、可視化できます。この機能が**正式提供開始**となったことをお知らせします。詳細については、[ドキュメント](/integrations/prometheus)をご覧ください。

### クラウドコンソールのテーブルインスペクター {#table-inspector-in-cloud-console}

ClickHouseには、テーブルのスキーマを調査するための[`DESCRIBE`](/sql-reference/statements/describe-table)などのコマンドがあります。これらのコマンドはコンソールに出力されますが、テーブルやカラムに関する関連データをすべて取得するには複数のクエリを組み合わせる必要があるため、使い勝手が良くない場合があります。

最近、クラウドコンソールに**テーブルインスペクター**を導入しました。これにより、SQLを記述することなく、UI上で重要なテーブルとカラムの情報を取得できます。クラウドコンソールにアクセスして、お使いのサービスでテーブルインスペクターをお試しください。スキーマ、ストレージ、圧縮などの情報を統一されたインターフェースで提供します。

<Image
  img={compute_compute}
  size='lg'
  alt='詳細なスキーマとストレージ情報を表示するClickHouse Cloudテーブルインスペクターのインターフェース'
  border
/>

### 新しいJavaクライアントAPI {#new-java-client-api}

[Javaクライアント](https://github.com/ClickHouse/clickhouse-java)は、ユーザーがClickHouseに接続する際に最も人気のあるクライアントの1つです。再設計されたAPIやさまざまなパフォーマンス最適化を含め、さらに使いやすく直感的にすることを目指しました。これらの変更により、JavaアプリケーションからClickHouseへの接続が大幅に容易になります。更新されたJavaクライアントの使用方法の詳細については、こちらの[ブログ記事](https://clickhouse.com/blog/java-client-sequel)をご覧ください。

### 新しいアナライザーがデフォルトで有効化 {#new-analyzer-is-enabled-by-default}

過去数年間、クエリ解析と最適化のための新しいアナライザーの開発に取り組んできました。このアナライザーはクエリパフォーマンスを向上させ、より高速で効率的な`JOIN`を含む、さらなる最適化を可能にします。以前は、新規ユーザーが`allow_experimental_analyzer`設定を使用してこの機能を有効にする必要がありました。この改善されたアナライザーは、新しいClickHouse Cloudサービスでデフォルトで利用可能になりました。

さらに多くの最適化を計画しているため、アナライザーの今後の改善にご期待ください。


## 2024年6月28日 {#june-28-2024}

### ClickHouse Cloud for Microsoft Azureが正式リリース {#clickhouse-cloud-for-microsoft-azure-is-now-generally-available}

Microsoft Azureのサポートは[今年5月](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta)にベータ版として発表しました。この最新のクラウドリリースでは、Azureサポートがベータ版から正式リリースに移行したことをお知らせします。ClickHouse Cloudは、AWS、Google Cloud Platform、そしてMicrosoft Azureという3大クラウドプラットフォームすべてで利用可能になりました。

このリリースには、[Microsoft Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/clickhouse.clickhouse_cloud)経由でのサブスクリプションサポートも含まれています。サービスは当初、以下のリージョンでサポートされます:

- 米国: West US 3 (Arizona)
- 米国: East US 2 (Virginia)
- 欧州: Germany West Central (Frankfurt)

特定のリージョンのサポートをご希望の場合は、[お問い合わせください](https://clickhouse.com/support/program)。

### クエリログインサイト {#query-log-insights}

Cloudコンソールの新しいQuery Insights UIにより、ClickHouseの組み込みクエリログがはるかに使いやすくなりました。ClickHouseの`system.query_log`テーブルは、クエリの最適化、デバッグ、クラスタ全体の健全性とパフォーマンスの監視における重要な情報源です。ただし、1つ注意点があります。70以上のフィールドとクエリごとに複数のレコードがあるため、クエリログの解釈には習得に時間がかかります。このクエリインサイトの初期バージョンは、クエリのデバッグと最適化パターンを簡素化する今後の作業の基盤となります。この機能の改善を続ける中で、皆様のフィードバックをお待ちしています。ぜひご連絡ください。皆様のご意見は大変貴重です。

<Image
  img={query_insights}
  size='lg'
  alt='クエリパフォーマンスメトリクスと分析を表示するClickHouse Cloud Query Insights UI'
  border
/>

### メトリクス用Prometheusエンドポイント(プライベートプレビュー) {#prometheus-endpoint-for-metrics-private-preview}

最もリクエストの多かった機能の1つです。ClickHouse Cloudから[Prometheus](https://prometheus.io/)メトリクスを[Grafana](https://grafana.com/)や[Datadog](https://www.datadoghq.com/)にエクスポートして可視化できるようになりました。Prometheusは、ClickHouseを監視しカスタムアラートを設定するためのオープンソースソリューションを提供します。ClickHouse CloudサービスのPrometheusメトリクスへのアクセスは、[ClickHouse Cloud API](/integrations/prometheus)経由で利用できます。この機能は現在プライベートプレビュー中です。組織でこの機能を有効にするには、[サポートチーム](https://clickhouse.com/support/program)にお問い合わせください。

<Image
  img={prometheus}
  size='lg'
  alt='ClickHouse CloudからのPrometheusメトリクスを表示するGrafanaダッシュボード'
  border
/>

### その他の機能 {#other-features}

- 頻度、保持期間、スケジュールなどのカスタムバックアップポリシーを設定する[設定可能なバックアップ](/cloud/manage/backups/configurable-backups)が正式リリースされました。


## June 13, 2024 {#june-13-2024}

### Kafka ClickPipesコネクタのオフセット設定機能（ベータ版） {#configurable-offsets-for-kafka-clickpipes-connector-beta}

最近まで、[ClickPipes用Kafkaコネクタ](/integrations/clickpipes/kafka)を新規にセットアップすると、常にKafkaトピックの先頭からデータを消費していました。この仕様では、過去データの再処理、新規データの監視、または特定の地点からの再開が必要な場合に、十分な柔軟性が得られませんでした。

ClickPipes for Kafkaに、Kafkaトピックからのデータ消費における柔軟性と制御性を向上させる新機能が追加されました。データ消費を開始するオフセットを設定できるようになりました。

以下のオプションが利用可能です：

- 先頭から：Kafkaトピックの最初からデータの消費を開始します。このオプションは、すべての過去データを再処理する必要があるユーザーに最適です。
- 最新から：最新のオフセットからデータの消費を開始します。新しいメッセージのみに関心があるユーザーに有用です。
- タイムスタンプから：特定のタイムスタンプ以降に生成されたメッセージからデータの消費を開始します。この機能により、より精密な制御が可能になり、ユーザーは正確な時点から処理を再開できます。

<Image
  img={kafka_config}
  size='lg'
  alt='オフセット選択オプションを表示するClickPipes Kafkaコネクタ設定画面'
  border
/>

### Fastリリースチャネルへのサービス登録 {#enroll-services-to-the-fast-release-channel}

Fastリリースチャネルを使用すると、通常のリリーススケジュールより早くサービスのアップデートを受け取ることができます。以前は、この機能を有効にするにはサポートチームの支援が必要でした。現在は、ClickHouse Cloudコンソールを使用して、サービスに対してこの機能を直接有効化できます。**Settings**に移動し、**Enroll in fast releases**をクリックするだけです。サービスは利用可能になり次第、アップデートを受け取るようになります。

<Image
  img={fast_releases}
  size='lg'
  alt='Fastリリースへの登録オプションを表示するClickHouse Cloud設定ページ'
  border
/>

### 水平スケーリングのTerraformサポート {#terraform-support-for-horizontal-scaling}

ClickHouse Cloudは[水平スケーリング](/manage/scaling#how-scaling-works-in-clickhouse-cloud)、つまり同じサイズの追加レプリカをサービスに追加する機能をサポートしています。水平スケーリングは、並行クエリをサポートするためにパフォーマンスと並列処理を向上させます。以前は、レプリカの追加にはClickHouse CloudコンソールまたはAPIの使用が必要でした。現在は、Terraformを使用してサービスからレプリカを追加または削除できるようになり、必要に応じてClickHouseサービスをプログラムでスケーリングできます。

詳細については、[ClickHouse Terraformプロバイダー](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)を参照してください。


## 2024年5月30日 {#may-30-2024}

### チームメンバーとクエリを共有 {#share-queries-with-your-teammates}

SQLクエリを作成する際、チームの他のメンバーもそのクエリが役立つと感じる可能性が高いでしょう。以前は、SlackやEメールでクエリを送信する必要があり、クエリを編集してもチームメンバーが自動的に更新を受け取る方法はありませんでした。

ClickHouse Cloudコンソールを通じてクエリを簡単に共有できるようになったことをお知らせします。クエリエディタから、チーム全体または特定のチームメンバーに直接クエリを共有できます。また、読み取り専用または書き込みアクセスを指定することもできます。クエリエディタの**共有**ボタンをクリックして、新しい共有クエリ機能をお試しください。

<Image
  img={share_queries}
  size='lg'
  alt='権限オプション付きの共有機能を表示するClickHouse Cloudクエリエディタ'
  border
/>

### Microsoft Azure向けClickHouse Cloudがベータ版で提供開始 {#clickhouse-cloud-for-microsoft-azure-is-now-in-beta}

Microsoft Azure上でClickHouse Cloudサービスを作成できる機能をついにリリースしました。Private Previewプログラムの一環として、すでに多くのお客様が本番環境でAzure上のClickHouse Cloudを使用しています。現在は、誰でもAzure上で独自のサービスを作成できます。AWSとGCPでサポートされているすべてのClickHouse機能は、Azureでも動作します。

Azure向けClickHouse Cloudは、今後数週間以内に一般提供の準備が整う予定です。詳細については[このブログ記事](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta)をご覧いただくか、ClickHouse CloudコンソールからAzureを使用して新しいサービスを作成してください。

注意:現時点では、Azureで**開発**サービスはサポートされていません。

### Cloudコンソールを通じたPrivate Linkの設定 {#set-up-private-link-via-the-cloud-console}

Private Link機能を使用すると、パブリックインターネットにトラフィックを向けることなく、ClickHouse Cloudサービスをクラウドプロバイダーアカウント内の内部サービスと接続できるため、コストを削減し、セキュリティを強化できます。以前は、この設定が困難で、ClickHouse Cloud APIを使用する必要がありました。

ClickHouse Cloudコンソールから直接、わずか数クリックでプライベートエンドポイントを設定できるようになりました。サービスの**設定**に移動し、**セキュリティ**セクションに進んで**プライベートエンドポイントを設定**をクリックするだけです。

<Image
  img={private_endpoint}
  size='lg'
  alt='セキュリティ設定でプライベートエンドポイント設定インターフェースを表示するClickHouse Cloudコンソール'
  border
/>


## 2024年5月17日 {#may-17-2024}

### ClickPipes を使用した Amazon Kinesis からのデータ取り込み(ベータ版) {#ingest-data-from-amazon-kinesis-using-clickpipes-beta}

ClickPipes は、コード不要でデータを取り込むことができる ClickHouse Cloud 専用のサービスです。Amazon Kinesis は、データストリームの取り込みと処理用の保存を行う AWS のフルマネージドストリーミングサービスです。最もリクエストの多かった統合の一つである Amazon Kinesis 向けの ClickPipes ベータ版をリリースできることを大変嬉しく思います。ClickPipes にさらなる統合を追加していく予定ですので、サポートしてほしいデータソースをぜひお知らせください。この機能の詳細については[こちら](https://clickhouse.com/blog/clickpipes-amazon-kinesis)をご覧ください。

クラウドコンソールで ClickPipes の新しい Amazon Kinesis 統合を試すことができます:

<Image
  img={kenesis}
  size='lg'
  alt='Amazon Kinesis 統合の設定オプションを表示する ClickPipes インターフェース'
  border
/>

### 設定可能なバックアップ(プライベートプレビュー) {#configurable-backups-private-preview}

バックアップは(どれほど信頼性が高くても)すべてのデータベースにとって重要であり、ClickHouse Cloud の初日からバックアップを非常に重視してきました。今週、サービスのバックアップに対してより高い柔軟性を提供する設定可能なバックアップをリリースしました。開始時刻、保持期間、頻度を制御できるようになりました。この機能は **Production** および **Dedicated** サービスで利用可能で、**Development** サービスでは利用できません。この機能はプライベートプレビュー段階のため、サービスで有効化するには support@clickhouse.com までお問い合わせください。設定可能なバックアップの詳細については[こちら](https://clickhouse.com/blog/configurable-backups-in-clickhouse-cloud)をご覧ください。

### SQL クエリから API を作成(ベータ版) {#create-apis-from-your-sql-queries-beta}

ClickHouse 用の SQL クエリを記述する際、クエリをアプリケーションに公開するにはドライバー経由で ClickHouse に接続する必要がありました。新しい **Query Endpoints** 機能により、設定なしで API から直接 SQL クエリを実行できるようになりました。クエリエンドポイントが JSON、CSV、または TSV を返すように指定できます。クラウドコンソールの「Share」ボタンをクリックして、クエリでこの新機能を試してください。Query Endpoints の詳細については[こちら](https://clickhouse.com/blog/automatic-query-endpoints)をご覧ください。

<Image
  img={query_endpoints}
  size='lg'
  alt='出力形式オプションを含む Query Endpoints 設定を表示する ClickHouse Cloud インターフェース'
  border
/>

### 公式 ClickHouse 認定資格が利用可能に {#official-clickhouse-certification-is-now-available}

ClickHouse Develop トレーニングコースには12の無料トレーニングモジュールがあります。今週以前は、ClickHouse の習熟度を証明する公式な方法がありませんでした。このたび、**ClickHouse Certified Developer** になるための公式試験をリリースしました。この試験に合格することで、データ取り込み、モデリング、分析、パフォーマンス最適化などのトピックにおける ClickHouse の習熟度を、現在および将来の雇用主に示すことができます。試験は[こちら](https://clickhouse.com/learn/certification)から受験できます。また、ClickHouse 認定資格の詳細については、この[ブログ記事](https://clickhouse.com/blog/first-official-clickhouse-certification)をご覧ください。


## 2024年4月25日 {#april-25-2024}

### ClickPipesを使用したS3およびGCSからのデータ読み込み {#load-data-from-s3-and-gcs-using-clickpipes}

新しくリリースされたクラウドコンソールに「Data sources」という新しいセクションが追加されたことにお気づきかもしれません。「Data sources」ページはClickPipesによって提供されており、これはClickHouse Cloudのネイティブ機能で、さまざまなソースからClickHouse Cloudへ簡単にデータを挿入できます。

最新のClickPipesアップデートでは、Amazon S3およびGoogle Cloud Storageから直接データをアップロードする機能が追加されました。組み込みのテーブル関数を引き続き使用することもできますが、ClickPipesはUIを介したフルマネージドサービスであり、わずか数クリックでS3およびGCSからデータを取り込むことができます。この機能は現在プライベートプレビュー段階ですが、クラウドコンソールから今すぐお試しいただけます。

<Image
  img={s3_gcs}
  size='lg'
  alt='S3およびGCSバケットからデータを読み込むための設定オプションを表示するClickPipesインターフェース'
  border
/>

### Fivetranを使用して500以上のソースからClickHouse Cloudへデータを読み込む {#use-fivetran-to-load-data-from-500-sources-into-clickhouse-cloud}

ClickHouseは大規模なデータセットを高速にクエリできますが、もちろんデータは最初にClickHouseに挿入する必要があります。Fivetranの包括的なコネクタ群により、ユーザーは500以上のソースから迅速にデータを読み込むことができるようになりました。Zendesk、Slack、またはお気に入りのアプリケーションからデータを読み込む必要がある場合でも、Fivetran向けの新しいClickHouse destinationにより、アプリケーションデータのターゲットデータベースとしてClickHouseを使用できるようになりました。

これは、Integrationsチームが数か月にわたる懸命な作業によって構築したオープンソース統合です。[リリースブログ記事](https://clickhouse.com/blog/fivetran-destination-clickhouse-cloud)および[GitHubリポジトリ](https://github.com/ClickHouse/clickhouse-fivetran-destination)をご確認ください。

### その他の変更 {#other-changes}

**コンソールの変更**

- SQLコンソールでの出力フォーマットのサポート

**統合の変更**

- ClickPipes Kafkaコネクタがマルチブローカー構成をサポート
- PowerBIコネクタがODBCドライバー設定オプションの提供をサポート


## 2024年4月18日 {#april-18-2024}

### ClickHouse CloudでAWS東京リージョンが利用可能になりました {#aws-tokyo-region-is-now-available-for-clickhouse-cloud}

このリリースでは、ClickHouse Cloud向けに新しいAWS東京リージョン（`ap-northeast-1`）を導入しました。ClickHouseを最速のデータベースにするため、レイテンシを可能な限り削減できるよう、すべてのクラウドプロバイダーに対して継続的にリージョンを追加しています。更新されたクラウドコンソールから東京リージョンで新しいサービスを作成できます。

<Image
  img={tokyo}
  size='lg'
  alt='東京リージョン選択を表示するClickHouse Cloudサービス作成画面'
  border
/>

その他の変更:

### コンソールの変更 {#console-changes}

- Kafka用ClickPipesのAvroフォーマットサポートが正式版として利用可能になりました
- Terraformプロバイダーでのリソース（サービスおよびプライベートエンドポイント）のインポートに対する完全なサポートを実装しました

### 統合機能の変更 {#integrations-changes}

- NodeJSクライアントのメジャー安定版リリース: クエリ + ResultSetの高度なTypeScriptサポート、URL設定
- Kafkaコネクタ: DLQへの書き込み時に例外を無視するバグを修正、Avro Enum型のサポートを追加、[MSK](https://www.youtube.com/watch?v=6lKI_WlQ3-s)および[Confluent Cloud](https://www.youtube.com/watch?v=SQAiPVbd3gg)でコネクタを使用するためのガイドを公開しました
- Grafana: UIでのNullable型サポートを修正、動的なOTELトレーシングテーブル名のサポートを修正しました
- DBT: カスタムマテリアライゼーションのモデル設定を修正しました
- Javaクライアント: 誤ったエラーコード解析のバグを修正しました
- Pythonクライアント: 数値型のパラメータバインディングを修正、クエリバインディングでの数値リストのバグを修正、SQLAlchemy Pointサポートを追加しました


## 2024年4月4日 {#april-4-2024}

### 新しいClickHouse Cloudコンソールのご紹介 {#introducing-the-new-clickhouse-cloud-console}

本リリースでは、新しいクラウドコンソールのプライベートプレビューを提供します。

ClickHouseでは、開発者体験の向上を常に追求しています。最速のリアルタイムデータウェアハウスを提供するだけでは十分ではなく、使いやすく管理しやすいものでなければならないと考えています。

毎月、数千人のClickHouse CloudユーザーがSQLコンソールで数十億件のクエリを実行しています。そのため、ClickHouse Cloudサービスとのやり取りをこれまで以上に簡単にする世界クラスのコンソールへの投資を強化することを決定しました。新しいクラウドコンソールでは、スタンドアロンのSQLエディタと管理コンソールを1つの直感的なUIに統合しています。

選ばれたお客様には、新しいクラウドコンソールのプレビューをご提供します。これは、ClickHouseでデータを探索・管理するための統合された没入型の環境です。優先アクセスをご希望の場合は、support@clickhouse.comまでお問い合わせください。

<Image
  img={cloud_console}
  size='lg'
  alt='統合されたSQLエディタと管理機能を備えた新しいClickHouse Cloudコンソールインターフェースを示すアニメーション'
  border
/>


## March 28, 2024 {#march-28-2024}

このリリースでは、Microsoft Azure のサポート、API 経由の水平スケーリング、およびリリースチャネルがプライベートプレビューとして導入されました。

### 全般的な更新 {#general-updates}

- Microsoft Azure のサポートをプライベートプレビューとして導入しました。アクセスを取得するには、アカウント管理またはサポートにお問い合わせいただくか、[ウェイトリスト](https://clickhouse.com/cloud/azure-waitlist)にご登録ください。
- リリースチャネルを導入しました。これは、環境タイプに基づいてアップグレードのタイミングを指定できる機能です。このリリースでは、「fast」リリースチャネルを追加しました。これにより、本番環境より先に非本番環境をアップグレードできます(有効化するにはサポートにお問い合わせください)。

### 管理機能の変更 {#administration-changes}

- API 経由での水平スケーリング設定のサポートを追加しました(プライベートプレビュー、有効化するにはサポートにお問い合わせください)
- 起動時にメモリ不足エラーが発生したサービスをスケールアップするよう、オートスケーリングを改善しました
- Terraform プロバイダー経由での AWS 向け CMEK のサポートを追加しました

### コンソールの変更 {#console-changes-1}

- Microsoft ソーシャルログインのサポートを追加しました
- SQL コンソールにパラメータ化クエリの共有機能を追加しました
- クエリエディタのパフォーマンスを大幅に改善しました(一部の EU リージョンでレイテンシが 5 秒から 1.5 秒に短縮)

### インテグレーションの変更 {#integrations-changes-1}

- ClickHouse OpenTelemetry exporter: ClickHouse レプリケーションテーブルエンジンの[サポートを追加](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31920)し、[インテグレーションテストを追加](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31896)しました
- ClickHouse DBT adapter: [ディクショナリ用のマテリアライゼーションマクロ](https://github.com/ClickHouse/dbt-clickhouse/pull/255)のサポート、[TTL 式サポートのテスト](https://github.com/ClickHouse/dbt-clickhouse/pull/254)を追加しました
- ClickHouse Kafka Connect Sink: Kafka プラグイン検出との[互換性を追加](https://github.com/ClickHouse/clickhouse-kafka-connect/issues/350)しました(コミュニティ貢献)
- ClickHouse Java Client: 新しいクライアント API 用の[新しいパッケージを導入](https://github.com/ClickHouse/clickhouse-java/pull/1574)し、Cloud テスト用の[テストカバレッジを追加](https://github.com/ClickHouse/clickhouse-java/pull/1575)しました
- ClickHouse NodeJS Client: 新しい HTTP keep-alive 動作のテストとドキュメントを拡張しました。v0.3.0 リリース以降で利用可能です
- ClickHouse Golang Client: Map のキーとしての Enum に関する[バグを修正](https://github.com/ClickHouse/clickhouse-go/pull/1236)しました。エラーが発生した接続がコネクションプールに残る[バグを修正](https://github.com/ClickHouse/clickhouse-go/pull/1237)しました(コミュニティ貢献)
- ClickHouse Python Client: PyArrow 経由でのクエリストリーミングの[サポートを追加](https://github.com/ClickHouse/clickhouse-connect/issues/155)しました(コミュニティ貢献)

### セキュリティ更新 {#security-updates}

- ClickHouse Cloud を更新し、["クエリキャッシュが有効な場合にロールベースアクセス制御がバイパスされる"](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-45h5-f7g3-gr8r)問題を防止しました (CVE-2024-22412)


## 2024年3月14日 {#march-14-2024}

このリリースでは、新しい Cloud コンソールエクスペリエンス、S3 および GCS からの一括ロード用 ClickPipes、さらに Kafka 向け ClickPipes における Avro 形式のサポートが、アーリーアクセスとして利用可能になりました。また、ClickHouse データベースのバージョンを 24.1 にアップグレードし、新しい関数のサポートに加えて、パフォーマンスおよびリソース使用の最適化を行っています。

### コンソールの変更点 {#console-changes-2}

- 新しい Cloud コンソールエクスペリエンスがアーリーアクセスで利用可能です（参加を希望される場合はサポートまでお問い合わせください）。
- S3 および GCS からの一括ロード用 ClickPipes がアーリーアクセスで利用可能です（参加を希望される場合はサポートまでお問い合わせください）。
- Kafka 向け ClickPipes における Avro 形式のサポートがアーリーアクセスで利用可能です（参加を希望される場合はサポートまでお問い合わせください）。

### ClickHouse バージョンのアップグレード {#clickhouse-version-upgrade}

- FINAL に対する最適化、ベクトル化の改善、高速な集計などが含まれます。詳細は [23.12 リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final) を参照してください。
- Punycode の処理、文字列類似度、外れ値検出のための新しい関数に加え、マージ処理および Keeper 向けのメモリ最適化が含まれます。詳細は [24.1 リリースブログ](https://clickhouse.com/blog/clickhouse-release-24-01) および [プレゼンテーション](https://presentations.clickhouse.com/release_24.1/) を参照してください。
- この ClickHouse Cloud バージョンは 24.1 をベースとしており、数多くの新機能、パフォーマンス改善、およびバグ修正が含まれています。詳細はコアデータベースの [変更履歴](/whats-new/changelog/2023#2312) を参照してください。

### 連携機能の変更点 {#integrations-changes-2}

- Grafana: v4 向けダッシュボード移行およびアドホックフィルタリングロジックを修正
- Tableau Connector: DATENAME 関数および「real」型引数に対する丸め処理を修正
- Kafka Connector: 接続初期化時の NPE を修正し、JDBC ドライバーオプションを指定できる機能を追加
- Golang クライアント: レスポンス処理時のメモリ使用量を削減し、Date32 の極端な値を修正、圧縮有効時のエラー報告を修正
- Python クライアント: datetime パラメータにおけるタイムゾーン対応を改善し、Pandas DataFrame のパフォーマンスを向上


## 2024年2月29日 {#february-29-2024}

このリリースでは、SQLコンソールアプリケーションの読み込み時間が改善され、ClickPipesでSCRAM-SHA-256認証のサポートが追加され、Kafka Connectへのネスト構造サポートが拡張されました。

### コンソールの変更 {#console-changes-3}

- SQLコンソールアプリケーションの初期読み込み時間を最適化
- 「認証に失敗しました」エラーを引き起こすSQLコンソールの競合状態を修正
- 監視ページで最新のメモリ割り当て値が正しくない場合がある動作を修正
- SQLコンソールが重複したKILL QUERYコマンドを発行することがある動作を修正
- ClickPipesにKafkaベースのデータソース向けのSCRAM-SHA-256認証方式のサポートを追加

### 統合機能の変更 {#integrations-changes-3}

- Kafkaコネクタ: 複雑なネスト構造(Array、Map)のサポートを拡張、FixedString型のサポートを追加、複数データベースへの取り込みのサポートを追加
- Metabase: バージョン23.8未満のClickHouseとの非互換性を修正
- DBT: モデル作成時に設定を渡す機能を追加
- Node.jsクライアント: 長時間実行されるクエリ(1時間超)のサポートと空の値の適切な処理を追加


## 2024年2月15日 {#february-15-2024}

このリリースでは、コアデータベースバージョンのアップグレード、Terraformを介したプライベートリンクの設定機能の追加、およびKafka Connect経由の非同期インサートに対するexactly onceセマンティクスのサポートが追加されました。

### ClickHouseバージョンアップグレード {#clickhouse-version-upgrade-1}

- S3からの継続的かつスケジュールされたデータロードのためのS3Queueテーブルエンジンがプロダクション対応になりました - 詳細は[23.11リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-11)を参照してください。
- FINALの大幅なパフォーマンス改善とSIMD命令のベクトル化改善により、クエリが高速化されました - 詳細は[23.12リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final)を参照してください。
- このClickHouse Cloudバージョンは23.12をベースとしており、数十の新機能、パフォーマンス改善、バグ修正が含まれています。詳細は[コアデータベース変更履歴](/whats-new/changelog/2023#2312)を参照してください。

### コンソールの変更 {#console-changes-4}

- Terraformプロバイダーを介したAWS Private LinkおよびGCP Private Service Connectの設定機能を追加
- リモートファイルデータインポートの回復性を改善
- すべてのデータインポートにインポートステータス詳細フライアウトを追加
- S3データインポートにキー/シークレットキー認証情報のサポートを追加

### 統合の変更 {#integrations-changes-4}

- Kafka Connect
  - exactly onceのためのasync_insertをサポート(デフォルトでは無効)
- Golangクライアント
  - DateTimeバインディングを修正
  - バッチインサートのパフォーマンスを改善
- Javaクライアント
  - リクエスト圧縮の問題を修正

### 設定の変更 {#settings-changes}

- `use_mysql_types_in_show_columns`は不要になりました。MySQLインターフェース経由で接続すると自動的に有効になります。
- `async_insert_max_data_size`のデフォルト値が`10 MiB`になりました


## February 2, 2024 {#february-2-2024}

このリリースでは、Azure Event Hub向けClickPipesが利用可能になり、v4 ClickHouse Grafanaコネクタによるログとトレースのナビゲーションワークフローが大幅に改善され、FlywayとAtlasデータベーススキーマ管理ツールのサポートが初登場しました。

### コンソールの変更 {#console-changes-5}

- Azure Event Hub向けClickPipesサポートを追加
- 新しいサービスはデフォルトのアイドル時間15分で起動

### 統合機能の変更 {#integrations-changes-5}

- [ClickHouse data source for Grafana](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/) v4リリース
  - Table、Logs、Time Series、Tracesの専用エディタを備えたクエリビルダーを完全に再構築
  - より複雑で動的なクエリをサポートするためにSQLジェネレータを完全に再構築
  - LogビューとTraceビューにおけるOpenTelemetryのファーストクラスサポートを追加
  - LogsとTracesのデフォルトテーブルとカラムを指定できるように設定を拡張
  - カスタムHTTPヘッダーを指定する機能を追加
  - その他多数の改善 - 詳細は[変更履歴](https://github.com/grafana/clickhouse-datasource/blob/main/CHANGELOG.md#400)を参照
- データベーススキーマ管理ツール
  - [FlywayがClickHouseサポートを追加](https://github.com/flyway/flyway-community-db-support/packages/2037428)
  - [Ariga AtlasがClickHouseサポートを追加](https://atlasgo.io/blog/2023/12/19/atlas-v-0-16#clickhouse-beta-program)
- Kafka Connector Sink
  - デフォルト値を持つテーブルへの取り込みを最適化
  - DateTime64における文字列ベースの日付のサポートを追加
- Metabase
  - 複数データベースへの接続サポートを追加


## 2024年1月18日 {#january-18-2024}

このリリースでは、AWSに新しいリージョン（ロンドン / eu-west-2）が追加され、Redpanda、Upstash、WarpstreamのClickPipesサポートが追加され、[is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted)コアデータベース機能の信頼性が向上しました。

### 全般的な変更 {#general-changes}

- 新しいAWSリージョン：ロンドン（eu-west-2）

### コンソールの変更 {#console-changes-6}

- Redpanda、Upstash、WarpstreamのClickPipesサポートを追加
- UIでClickPipes認証メカニズムを設定可能に変更

### 統合の変更 {#integrations-changes-6}

- Javaクライアント：
  - 破壊的変更：呼び出しでランダムなURLハンドルを指定する機能を削除しました。この機能はClickHouseから削除されました
  - 非推奨：Java CLIクライアントおよびGRPCパッケージ
  - RowBinaryWithDefaults形式のサポートを追加し、ClickHouseインスタンスのバッチサイズとワークロードを削減しました（Exabeamからのリクエスト）
  - Date32およびDateTime64の範囲境界をClickHouseと互換性のあるものに変更、Spark配列文字列型との互換性、ノード選択メカニズムを追加
- Kafkaコネクタ：Grafana用のJMX監視ダッシュボードを追加
- PowerBI：UIでODBCドライバ設定を設定可能に変更
- JavaScriptクライアント：クエリサマリ情報を公開、挿入時に特定のカラムのサブセットを提供可能に変更、Webクライアントでkeep_aliveを設定可能に変更
- Pythonクライアント：SQLAlchemy用のNothing型サポートを追加

### 信頼性の変更 {#reliability-changes}

- ユーザー向けの後方互換性のない変更：以前は、2つの機能（[is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted)と`OPTIMIZE CLEANUP`）が特定の条件下でClickHouseのデータ破損を引き起こす可能性がありました。ユーザーのデータの整合性を保護するため、機能のコア部分を維持しながら、この機能の動作を調整しました。具体的には、MergeTree設定の`clean_deleted_rows`は非推奨となり、効果がなくなりました。`CLEANUP`キーワードはデフォルトでは許可されていません（使用するには`allow_experimental_replacing_merge_with_cleanup`を有効にする必要があります）。`CLEANUP`を使用する場合は、常に`FINAL`と一緒に使用することを確認し、`OPTIMIZE FINAL CLEANUP`を実行した後に古いバージョンの行が挿入されないことを保証する必要があります。


## December 18, 2023 {#december-18-2023}

このリリースでは、GCPの新しいリージョン（us-east1）、セキュアエンドポイント接続のセルフサービス機能、DBT 1.7を含む追加統合のサポート、および多数のバグ修正とセキュリティ強化が提供されます。

### 全般的な変更 {#general-changes-1}

- ClickHouse CloudがGCP us-east1（サウスカロライナ）リージョンで利用可能になりました
- OpenAPI経由でAWS Private LinkおよびGCP Private Service Connectを設定する機能を有効化しました

### コンソールの変更 {#console-changes-7}

- Developerロールを持つユーザーに対して、SQLコンソールへのシームレスなログインを有効化しました
- オンボーディング時のアイドリング制御設定のワークフローを効率化しました

### 統合の変更 {#integrations-changes-7}

- DBTコネクタ：DBT v1.7までのサポートを追加しました
- Metabase：Metabase v0.48のサポートを追加しました
- PowerBIコネクタ：PowerBI Cloud上での実行機能を追加しました
- ClickPipes内部ユーザーの権限を設定可能にしました
- Kafka Connect
  - 重複排除ロジックとNullable型の取り込みを改善しました
  - テキストベース形式（CSV、TSV）のサポートを追加しました
- Apache Beam：BooleanおよびLowCardinality型のサポートを追加しました
- Node.jsクライアント：Parquet形式のサポートを追加しました

### セキュリティに関するお知らせ {#security-announcements}

- 3件のセキュリティ脆弱性にパッチを適用しました - 詳細は[セキュリティ変更履歴](/whats-new/security-changelog)を参照してください：
  - CVE 2023-47118（CVSS 7.0） - デフォルトでポート9000/tcp上で実行されるネイティブインターフェースに影響するヒープバッファオーバーフローの脆弱性
  - CVE-2023-48704（CVSS 7.0） - デフォルトでポート9000/tcp上で実行されるネイティブインターフェースに影響するヒープバッファオーバーフローの脆弱性
  - CVE 2023-48298（CVSS 5.9） - FPC圧縮コーデックにおける整数アンダーフローの脆弱性


## November 22, 2023 {#november-22-2023}

このリリースでは、コアデータベースバージョンのアップグレード、ログインおよび認証フローの改善、Kafka Connect Sinkへのプロキシサポートの追加が行われました。

### ClickHouseバージョンアップグレード {#clickhouse-version-upgrade-2}

- Parquetファイルの読み取りパフォーマンスが大幅に向上しました。詳細は[23.8リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-08)をご覧ください。
- JSONの型推論サポートが追加されました。詳細は[23.9リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-09)をご覧ください。
- `ArrayFold`などの強力なアナリスト向け関数が導入されました。詳細は[23.10リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-10)をご覧ください。
- **ユーザー向け後方互換性のない変更**: JSON形式の文字列から数値を推論することを避けるため、設定`input_format_json_try_infer_numbers_from_strings`がデフォルトで無効化されました。サンプルデータに数値に似た文字列が含まれている場合に発生する可能性のある解析エラーを防ぐための変更です。
- 数十の新機能、パフォーマンス改善、バグ修正が含まれています。詳細は[コアデータベース変更履歴](/whats-new/changelog)をご覧ください。

### コンソールの変更 {#console-changes-8}

- ログインおよび認証フローが改善されました。
- 大規模スキーマをより適切にサポートするため、AIベースのクエリ提案が改善されました。

### 統合機能の変更 {#integrations-changes-8}

- Kafka Connect Sink: プロキシサポート、`topic-tablename`マッピング、Keeperの_exactly-once_配信プロパティの設定可能性が追加されました。
- Node.jsクライアント: Parquet形式のサポートが追加されました。
- Metabase: `datetimeDiff`関数のサポートが追加されました。
- Pythonクライアント: カラム名の特殊文字サポートが追加されました。タイムゾーンパラメータのバインディングが修正されました。


## 2023年11月2日 {#november-2-2023}

このリリースでは、アジアにおける開発サービスのリージョンサポートを拡大し、カスタマー管理暗号化キーへのキーローテーション機能の導入、請求コンソールにおける税設定の粒度向上、およびサポート対象の各言語クライアントにおける多数のバグ修正を行いました。

### 全般的な更新 {#general-updates-1}

- AWSの`ap-south-1`(ムンバイ)および`ap-southeast-1`(シンガポール)で開発サービスが利用可能になりました
- カスタマー管理暗号化キー(CMEK)におけるキーローテーションのサポートを追加しました

### コンソールの変更 {#console-changes-9}

- クレジットカード追加時に詳細な税設定を構成できる機能を追加しました

### 統合機能の変更 {#integrations-changes-9}

- MySQL
  - MySQL経由のTableau OnlineおよびQuickSightサポートを改善しました
- Kafka Connector
  - テキストベース形式(CSV、TSV)をサポートする新しいStringConverterを導入しました
  - BytesおよびDecimalデータ型のサポートを追加しました
  - リトライ可能な例外を常にリトライするように調整しました(errors.tolerance=allの場合も含む)
- Node.jsクライアント
  - ストリーミングされた大規模データセットで破損した結果が返される問題を修正しました
- Pythonクライアント
  - 大規模な挿入時のタイムアウトを修正しました
  - NumPy/PandasのDate32の問題を修正しました
    - Golangクライアント
  - JSON列への空のマップの挿入、圧縮バッファのクリーンアップ、クエリのエスケープ、IPv4およびIPv6のゼロ/nilでのパニックを修正しました
  - キャンセルされた挿入に対するウォッチドッグを追加しました
- DBT
  - テストを含む分散テーブルのサポートを改善しました


## 2023年10月19日 {#october-19-2023}

このリリースでは、SQLコンソールの使いやすさとパフォーマンスの向上、MetabaseコネクタにおけるIPデータ型処理の改善、JavaおよびNode.jsクライアントの新機能が提供されます。

### コンソールの変更 {#console-changes-10}

- SQLコンソールの使いやすさを向上(例: クエリ実行間でのカラム幅の保持)
- SQLコンソールのパフォーマンスを向上

### 統合機能の変更 {#integrations-changes-10}

- Javaクライアント:
  - パフォーマンス向上とオープン接続の再利用のため、デフォルトのネットワークライブラリを変更
  - プロキシサポートを追加
  - Trust Storeを使用したセキュア接続のサポートを追加
- Node.jsクライアント: INSERTクエリのキープアライブ動作を修正
- Metabase: IPv4/IPv6カラムのシリアライゼーションを修正


## September 28, 2023 {#september-28-2023}

このリリースでは、Kafka、Confluent Cloud、Amazon MSK向けのClickPipesおよびKafka Connect ClickHouse Sinkの一般提供開始、IAMロールによるAmazon S3への安全なアクセスを実現するセルフサービスワークフロー、AI支援クエリ提案機能(プライベートプレビュー)を提供します。

### コンソールの変更 {#console-changes-11}

- [IAMロールによるAmazon S3への安全なアクセス](/cloud/data-sources/secure-s3)を実現するセルフサービスワークフローを追加
- AI支援クエリ提案機能をプライベートプレビューとして導入(試用をご希望の場合は[ClickHouse Cloudサポートにお問い合わせ](https://console.clickhouse.cloud/support)ください)

### 統合機能の変更 {#integrations-changes-11}

- Kafka、Confluent Cloud、Amazon MSK向けのターンキー型データ取り込みサービスであるClickPipesの一般提供開始を発表([リリースブログ](https://clickhouse.com/blog/clickpipes-is-generally-available)を参照)
- Kafka Connect ClickHouse Sinkの一般提供を開始
  - `clickhouse.settings`プロパティを使用したカスタマイズされたClickHouse設定のサポートを拡張
  - 動的フィールドに対応するための重複排除動作を改善
  - ClickHouseからテーブルの変更を再取得するための`tableRefreshInterval`のサポートを追加
- [PowerBI](/integrations/powerbi)とClickHouseデータ型間のSSL接続の問題および型マッピングを修正


## September 7, 2023 {#september-7-2023}

このリリースでは、PowerBI Desktop公式コネクタのベータ版、インド向けクレジットカード決済処理の改善、およびサポート対象の各言語クライアントにおける複数の機能改善が提供されます。

### コンソールの変更 {#console-changes-12}

- インドからの課金をサポートするため、残高クレジットと支払いリトライ機能を追加

### 統合機能の変更 {#integrations-changes-12}

- Kafkaコネクタ: ClickHouse設定の構成サポートを追加、error.tolerance設定オプションを追加
- PowerBI Desktop: 公式コネクタのベータ版をリリース
- Grafana: Point geo型のサポートを追加、Data AnalystダッシュボードのPanelを修正、timeIntervalマクロを修正
- Pythonクライアント: Pandas 2.1.0に対応、Python 3.7のサポートを終了、nullable JSON型のサポートを追加
- Node.jsクライアント: default_format設定のサポートを追加
- Golangクライアント: bool型の処理を修正、文字列の制限を削除


## Aug 24, 2023 {#aug-24-2023}

このリリースでは、ClickHouseデータベースへのMySQLインターフェースのサポートが追加され、新しい公式PowerBIコネクタが導入され、クラウドコンソールに新しい「実行中のクエリ」ビューが追加され、ClickHouseバージョンが23.7に更新されました。

### 全般的な更新 {#general-updates-2}

- [MySQLワイヤプロトコル](/interfaces/mysql)のサポートが追加されました。これにより(他のユースケースに加えて)、既存の多くのBIツールとの互換性が実現されます。この機能を組織で有効にするには、サポートにお問い合わせください。
- 新しい公式PowerBIコネクタを導入しました

### コンソールの変更 {#console-changes-13}

- SQLコンソールに「実行中のクエリ」ビューのサポートを追加しました

### ClickHouse 23.7バージョンアップグレード {#clickhouse-237-version-upgrade}

- Azure Table関数のサポートを追加し、地理データ型を本番環境対応に昇格させ、結合パフォーマンスを改善しました - 詳細は23.5リリースの[ブログ](https://clickhouse.com/blog/clickhouse-release-23-05)を参照してください
- MongoDB統合サポートをバージョン6.0まで拡張しました - 詳細は23.6リリースの[ブログ](https://clickhouse.com/blog/clickhouse-release-23-06)を参照してください
- Parquet形式への書き込みパフォーマンスを6倍改善し、PRQLクエリ言語のサポートを追加し、SQL互換性を向上させました - 詳細は23.7リリースの[デッキ](https://presentations.clickhouse.com/release_23.7/)を参照してください
- 数十の新機能、パフォーマンス改善、バグ修正 - 23.5、23.6、23.7の詳細な[変更履歴](/whats-new/changelog)を参照してください

### 統合の変更 {#integrations-changes-13}

- Kafkaコネクタ: Avro DateおよびTime型のサポートを追加しました
- JavaScriptクライアント: Webベース環境向けの安定版をリリースしました
- Grafana: フィルタロジック、データベース名の処理を改善し、サブ秒精度のTimeIntervalサポートを追加しました
- Golangクライアント: バッチおよび非同期データロードに関するいくつかの問題を修正しました
- Metabase: v0.47をサポート、接続の偽装を追加、データ型マッピングを修正しました


## 2023年7月27日 {#july-27-2023}

このリリースでは、Kafka用ClickPipesのプライベートプレビュー、新しいデータ読み込み機能、およびクラウドコンソールを使用したURLからのファイル読み込み機能が提供されます。

### 統合機能の変更 {#integrations-changes-14}

- Kafka用[ClickPipes](https://clickhouse.com/cloud/clickpipes)のプライベートプレビューを導入しました。これは、KafkaおよびConfluent Cloudからの大量データの取り込みを数回のクリックで簡単に実行できるクラウドネイティブな統合エンジンです。ウェイトリストへの登録は[こちら](https://clickhouse.com/cloud/clickpipes#joinwaitlist)から行ってください。
- JavaScriptクライアント: Webベース環境（ブラウザ、Cloudflare workers）のサポートをリリースしました。コミュニティがカスタム環境用のコネクタを作成できるようにコードをリファクタリングしました。
- Kafkaコネクタ: TimestampおよびTime Kafkaタイプを使用したインラインスキーマのサポートを追加しました
- Pythonクライアント: 挿入時の圧縮とLowCardinality読み取りの問題を修正しました

### コンソールの変更 {#console-changes-14}

- より多くのテーブル作成設定オプションを備えた新しいデータ読み込み機能を追加しました
- クラウドコンソールを使用したURLからのファイル読み込み機能を導入しました
- 別の組織への参加オプションと未処理の招待をすべて確認できる機能を追加し、招待フローを改善しました


## July 14, 2023 {#july-14-2023}

このリリースでは、Dedicated Servicesの起動機能、オーストラリアの新しいAWSリージョン、およびディスク上のデータ暗号化用の独自キーの持ち込み機能が追加されました。

### 全般的な更新 {#general-updates-3}

- 新しいAWSオーストラリアリージョン:Sydney (ap-southeast-2)
- レイテンシに敏感な高負荷ワークロード向けのDedicatedティアサービス(設定については[サポート](https://console.clickhouse.cloud/support)にお問い合わせください)
- ディスク上のデータ暗号化用の独自キーの持ち込み(BYOK)(設定については[サポート](https://console.clickhouse.cloud/support)にお問い合わせください)

### コンソールの変更 {#console-changes-15}

- 非同期挿入の可観測性メトリクスダッシュボードの改善
- サポート統合のためのチャットボット動作の改善

### 統合の変更 {#integrations-changes-15}

- NodeJSクライアント:ソケットタイムアウトによる接続失敗のバグを修正
- Pythonクライアント:挿入クエリにQuerySummaryを追加、データベース名の特殊文字をサポート
- Metabase:JDBCドライバのバージョンを更新、DateTime64サポートを追加、パフォーマンスの改善

### コアデータベースの変更 {#core-database-changes}

- [クエリキャッシュ](/operations/query-cache)はClickHouse Cloudで有効化できます。有効化すると、成功したクエリはデフォルトで1分間キャッシュされ、後続のクエリはキャッシュされた結果を使用します。


## 2023年6月20日 {#june-20-2023}

このリリースでは、ClickHouse Cloud on GCPが一般提供開始となり、Cloud API用のTerraformプロバイダーが提供され、ClickHouseバージョンが23.4に更新されました。

### 全般的な更新 {#general-updates-4}

- ClickHouse Cloud on GCPが一般提供開始となり、GCP Marketplaceとの統合、Private Service Connectのサポート、自動バックアップが利用可能になりました(詳細は[ブログ](https://clickhouse.com/blog/clickhouse-cloud-on-google-cloud-platform-gcp-is-generally-available)および[プレスリリース](https://clickhouse.com/blog/clickhouse-cloud-expands-choice-with-launch-on-google-cloud-platform)を参照)
- Cloud API用の[Terraformプロバイダー](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)が利用可能になりました

### コンソールの変更 {#console-changes-16}

- サービス用の統合設定ページを新たに追加
- ストレージとコンピュートの計測精度を調整

### 統合機能の変更 {#integrations-changes-16}

- Pythonクライアント: 挿入パフォーマンスを改善し、マルチプロセッシングをサポートするために内部依存関係をリファクタリング
- Kafkaコネクタ: Confluent Cloudへのアップロードとインストールが可能になり、一時的な接続問題に対するリトライ機能を追加し、不正なコネクタ状態を自動的にリセット

### ClickHouse 23.4バージョンアップグレード {#clickhouse-234-version-upgrade}

- 並列レプリカに対するJOINサポートを追加(設定については[サポート](https://console.clickhouse.cloud/support)にお問い合わせください)
- 軽量削除のパフォーマンスを改善
- 大規模な挿入処理時のキャッシング機能を改善

### 管理機能の変更 {#administration-changes-1}

- "default"以外のユーザーに対するローカル辞書作成機能を拡張


## 2023年5月30日 {#may-30-2023}

このリリースでは、コントロールプレーン操作のためのClickHouse Cloud Programmatic APIの一般公開(詳細は[ブログ](https://clickhouse.com/blog/using-the-new-clickhouse-cloud-api-to-automate-deployments)を参照)、IAMロールを使用したS3アクセス、および追加のスケーリングオプションが提供されます。

### 全般的な変更 {#general-changes-2}

- ClickHouse CloudのAPIサポート。新しいCloud APIにより、既存のCI/CDパイプラインにサービス管理をシームレスに統合し、プログラムによるサービス管理が可能になります
- IAMロールを使用したS3アクセス。IAMロールを活用して、プライベートなAmazon Simple Storage Service (S3)バケットに安全にアクセスできるようになりました(設定についてはサポートにお問い合わせください)

### スケーリングの変更 {#scaling-changes}

- [水平スケーリング](/manage/scaling#manual-horizontal-scaling)。より多くの並列化が必要なワークロードは、最大10個のレプリカで構成できるようになりました(設定についてはサポートにお問い合わせください)
- [CPUベースのオートスケーリング](/manage/scaling)。CPU負荷の高いワークロードは、オートスケーリングポリシーの追加トリガーの恩恵を受けられるようになりました

### コンソールの変更 {#console-changes-17}

- 開発サービスから本番サービスへの移行(有効化についてはサポートにお問い合わせください)
- インスタンス作成フロー中にスケーリング設定コントロールを追加
- デフォルトパスワードがメモリに存在しない場合の接続文字列を修正

### 統合の変更 {#integrations-changes-17}

- Golangクライアント: ネイティブプロトコルでの接続の不均衡を引き起こす問題を修正、ネイティブプロトコルでのカスタム設定のサポートを追加
- Node.jsクライアント: Node.js v14のサポートを終了、v20のサポートを追加
- Kafkaコネクタ: LowCardinality型のサポートを追加
- Metabase: 時間範囲によるグループ化を修正、組み込みMetabaseクエリでの整数のサポートを修正

### パフォーマンスと信頼性 {#performance-and-reliability}

- 書き込み負荷の高いワークロードの効率とパフォーマンスを改善
- バックアップの速度と効率を向上させるために増分バックアップ戦略を導入


## 2023年5月11日 {#may-11-2023}

このリリースでは、ClickHouse Cloud on GCPのパブリックベータ版が提供開始されます
(詳細は[ブログ](https://clickhouse.com/blog/clickhouse-cloud-on-gcp-available-in-public-beta)を参照)。
また、管理者によるクエリ終了権限の付与機能が拡張され、Cloudコンソールにおける多要素認証ユーザーのステータスの可視性が向上しました。

:::note 更新
ClickHouse Cloud on GCPは現在GA(一般提供)となっています。上記の6月20日のエントリを参照してください。
:::

### ClickHouse Cloud on GCPがパブリックベータ版として提供開始 {#clickhouse-cloud-on-gcp-is-now-available-in-public-beta-now-ga-see-june-20th-entry-above}

:::note
ClickHouse Cloud on GCPは現在GA(一般提供)となっています。上記の[6月20日](#june-20-2023)のエントリを参照してください。
:::

- Google ComputeとGoogle Cloud Storage上で動作する、ストレージとコンピュートが分離されたフルマネージドのClickHouseサービスを提供開始
- Iowa (us-central1)、Netherlands (europe-west4)、Singapore (asia-southeast1)の各リージョンで利用可能
- 最初の3つのリージョンすべてで開発環境と本番環境の両サービスをサポート
- デフォルトで強固なセキュリティを提供: 転送中のエンドツーエンド暗号化、保管時のデータ暗号化、IP許可リスト

### 統合機能の変更 {#integrations-changes-18}

- Golangクライアント: プロキシ環境変数のサポートを追加
- Grafana: Grafanaデータソース設定でClickHouseカスタム設定とプロキシ環境変数を指定する機能を追加
- Kafkaコネクタ: 空のレコードの処理を改善

### コンソールの変更 {#console-changes-18}

- ユーザーリストに多要素認証(MFA)使用状況のインジケーターを追加

### パフォーマンスと信頼性 {#performance-and-reliability-1}

- 管理者向けにクエリ終了権限のより詳細な制御を追加


## 2023年5月4日 {#may-4-2023}

このリリースでは、新しいヒートマップチャートタイプの追加、課金使用状況ページの改善、およびサービス起動時間の改善が行われました。

### コンソールの変更 {#console-changes-19}

- SQLコンソールにヒートマップチャートタイプを追加
- 課金使用状況ページを改善し、各課金ディメンション内で消費されたクレジットを表示

### 統合機能の変更 {#integrations-changes-19}

- Kafkaコネクタ: 一時的な接続エラーに対するリトライメカニズムを追加
- Pythonクライアント: HTTP接続が永続的に再利用されないようにmax_connection_age設定を追加。これにより、特定のロードバランシングの問題を解決できます
- Node.jsクライアント: Node.js v20のサポートを追加
- Javaクライアント: クライアント証明書認証のサポートを改善し、ネストされたTuple/Map/Nestedタイプのサポートを追加

### パフォーマンスと信頼性 {#performance-and-reliability-2}

- 大量のパートが存在する場合のサービス起動時間を改善
- SQLコンソールにおける長時間実行クエリのキャンセルロジックを最適化

### バグ修正 {#bug-fixes}

- 'Cell Towers'サンプルデータセットのインポートが失敗する原因となっていたバグを修正


## April 20, 2023 {#april-20-2023}

このリリースでは、ClickHouseのバージョンを23.3に更新し、コールドリードの速度を大幅に改善し、サポートとのリアルタイムチャット機能を提供します。

### コンソールの変更 {#console-changes-20}

- サポートとのリアルタイムチャット機能を追加

### 統合の変更 {#integrations-changes-20}

- Kafkaコネクタ: Nullable型のサポートを追加
- Golangクライアント: 外部テーブルのサポート、ブール型およびポインタ型のパラメータバインディングのサポートを追加

### 設定の変更 {#configuration-changes}

- `max_table_size_to_drop`および`max_partition_size_to_drop`設定を上書きすることで、大規模なテーブルを削除する機能を追加

### パフォーマンスと信頼性 {#performance-and-reliability-3}

- `allow_prefetched_read_pool_for_remote_filesystem`設定によるS3プリフェッチを使用して、コールドリードの速度を改善

### ClickHouse 23.3バージョンアップグレード {#clickhouse-233-version-upgrade}

- 軽量削除が本番環境対応になりました。詳細は23.3リリースの[ブログ](https://clickhouse.com/blog/clickhouse-release-23-03)を参照してください
- 多段階PREWHEREのサポートを追加しました。詳細は23.2リリースの[ブログ](https://clickhouse.com/blog/clickhouse-release-23-03)を参照してください
- 数十の新機能、パフォーマンス改善、バグ修正が含まれています。詳細は23.3および23.2の[変更履歴](/whats-new/changelog/index.md)を参照してください


## 2023年4月6日 {#april-6-2023}

このリリースでは、クラウドエンドポイントを取得するためのAPI、最小アイドルタイムアウトの高度なスケーリング制御、およびPythonクライアントのクエリメソッドにおける外部データのサポートが提供されます。

### API変更 {#api-changes}

- [Cloud Endpoints API](//cloud/get-started/query-endpoints.md)を介してClickHouse Cloudエンドポイントをプログラムでクエリする機能を追加しました

### コンソール変更 {#console-changes-21}

- 高度なスケーリング設定に「最小アイドルタイムアウト」設定を追加しました
- データ読み込みモーダルのスキーマ推論にベストエフォート型の日時検出を追加しました

### インテグレーション変更 {#integrations-changes-21}

- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): 複数スキーマのサポートを追加しました
- [Go client](/integrations/language-clients/go/index.md): TLS接続のアイドル接続生存確認を修正しました
- [Python client](/integrations/language-clients/python/index.md)
  - クエリメソッドにおける外部データのサポートを追加しました
  - クエリ結果のタイムゾーンサポートを追加しました
  - `no_proxy`/`NO_PROXY`環境変数のサポートを追加しました
  - Nullable型のNULL値に対するサーバー側パラメータバインディングを修正しました

### バグ修正 {#bug-fixes-1}

- SQLコンソールから`INSERT INTO ... SELECT ...`を実行した際に、SELECTクエリと同じ行数制限が誤って適用される動作を修正しました


## March 23, 2023 {#march-23-2023}

このリリースでは、データベースパスワードの複雑性ルール、大規模バックアップの復元の大幅な高速化、Grafana Trace Viewでのトレース表示のサポートが追加されました。

### セキュリティと信頼性 {#security-and-reliability}

- コアデータベースエンドポイントでパスワード複雑性ルールが適用されるようになりました
- 大規模バックアップの復元時間を改善しました

### コンソールの変更 {#console-changes-22}

- オンボーディングワークフローを合理化し、新しいデフォルト設定とよりコンパクトなビューを導入しました
- サインアップとサインインのレイテンシを削減しました

### 統合機能の変更 {#integrations-changes-22}

- Grafana:
  - ClickHouseに保存されたトレースデータをTrace Viewで表示するサポートを追加しました
  - 時間範囲フィルタを改善し、テーブル名の特殊文字のサポートを追加しました
- Superset: ネイティブClickHouseサポートを追加しました
- Kafka Connect Sink: 自動日付変換とNull列の処理を追加しました
- Metabase: v0.46との互換性を実装しました
- Pythonクライアント: 一時テーブルへの挿入を修正し、Pandas Nullのサポートを追加しました
- Golangクライアント: タイムゾーン付きDate型を正規化しました
- Javaクライアント
  - SQLパーサーにcompression、infile、outfileキーワードのサポートを追加しました
  - 認証情報のオーバーロードを追加しました
  - `ON CLUSTER`でのバッチサポートを修正しました
- Node.jsクライアント
  - JSONStrings、JSONCompact、JSONCompactStrings、JSONColumnsWithMetadata形式のサポートを追加しました
  - すべての主要なクライアントメソッドで`query_id`を指定できるようになりました

### バグ修正 {#bug-fixes-2}

- 新しいサービスの初期プロビジョニングと起動時間が遅くなるバグを修正しました
- キャッシュの設定ミスによりクエリパフォーマンスが低下するバグを修正しました


## 2023年3月9日 {#march-9-2023}

このリリースでは、可観測性ダッシュボードの改善、大規模バックアップの作成時間の最適化、および大規模なテーブルとパーティションを削除するための設定の追加が行われました。

### コンソールの変更 {#console-changes-23}

- 高度な可観測性ダッシュボードを追加（プレビュー）
- 可観測性ダッシュボードにメモリ割り当てチャートを導入
- SQLコンソールのスプレッドシートビューにおける間隔と改行処理を改善

### 信頼性とパフォーマンス {#reliability-and-performance}

- データが変更された場合のみバックアップを実行するようバックアップスケジュールを最適化
- 大規模バックアップの完了時間を改善

### 設定の変更 {#configuration-changes-1}

- クエリまたは接続レベルで`max_table_size_to_drop`および`max_partition_size_to_drop`設定を上書きすることで、テーブルとパーティションを削除する際の制限値を増やす機能を追加
- ソースIPに基づくクォータとアクセス制御の適用を可能にするため、クエリログにソースIPを追加

### 統合 {#integrations}

- [Pythonクライアント](/integrations/language-clients/python/index.md): Pandasサポートの改善とタイムゾーン関連の問題を修正
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): Metabase 0.46.xとの互換性およびSimpleAggregateFunctionのサポート
- [Kafka-Connect](/integrations/data-ingestion/kafka/index.md): 暗黙的な日付変換とnullカラムの処理を改善
- [Javaクライアント](https://github.com/ClickHouse/clickhouse-java): ネストされたデータのJavaマップへの変換


## 2023年2月23日 {#february-23-2023}

このリリースでは、ClickHouse 23.1コアリリースの機能のサブセットが有効化され、Amazon Managed Streaming for Apache Kafka (MSK) との相互運用性が提供され、アクティビティログに高度なスケーリングとアイドリング調整が公開されます。

### ClickHouse 23.1バージョンアップグレード {#clickhouse-231-version-upgrade}

ClickHouse 23.1の機能のサブセットのサポートが追加されました。例:

- Map型を使用したARRAY JOIN
- SQL標準の16進数およびバイナリリテラル
- `age()`、`quantileInterpolatedWeighted()`、`quantilesInterpolatedWeighted()`を含む新しい関数
- 引数なしで`generateRandom`内の挿入テーブルから構造を使用する機能
- 以前の名前の再利用を可能にする、改善されたデータベース作成およびリネームロジック
- 詳細については、23.1リリースの[ウェビナースライド](https://presentations.clickhouse.com/release_23.1/#cover)および[23.1リリース変更履歴](/whats-new/cloud#clickhouse-231-version-upgrade)を参照してください

### 統合の変更 {#integrations-changes-23}

- [Kafka-Connect](/integrations/data-ingestion/kafka/index.md): Amazon MSKのサポートを追加
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): 最初の安定版リリース1.0.0
  - [Metabase Cloud](https://www.metabase.com/start/)でコネクタを利用可能にしました
  - 利用可能なすべてのデータベースを探索する機能を追加
  - AggregationFunction型のデータベースの同期を修正
- [DBT-clickhouse](/integrations/data-ingestion/etl-tools/dbt/index.md): 最新のDBTバージョンv1.4.1のサポートを追加
- [Pythonクライアント](/integrations/language-clients/python/index.md): プロキシおよびSSHトンネリングのサポートを改善し、Pandas DataFramesに対する多数の修正とパフォーマンス最適化を追加
- [Node.jsクライアント](/integrations/language-clients/js.md): クエリ結果に`query_id`を添付する機能をリリース。これは`system.query_log`からクエリメトリクスを取得するために使用できます
- [Golangクライアント](/integrations/language-clients/go/index.md): ClickHouse Cloudとのネットワーク接続を最適化

### コンソールの変更 {#console-changes-24}

- アクティビティログに高度なスケーリングとアイドリング設定の調整を追加
- パスワードリセットメールにユーザーエージェントとIP情報を追加
- Google OAuthのサインアップフローメカニクスを改善

### 信頼性とパフォーマンス {#reliability-and-performance-1}

- 大規模サービスのアイドル状態からの再開時間を高速化
- 多数のテーブルとパーティションを持つサービスの読み取りレイテンシを改善

### バグ修正 {#bug-fixes-3}

- サービスパスワードのリセットがパスワードポリシーに従わない動作を修正
- 組織招待メールの検証を大文字小文字を区別しないように変更


## 2023年2月2日 {#february-2-2023}

このリリースでは、公式サポートされたMetabase統合、Javaクライアント/JDBCドライバーのメジャーリリース、およびSQLコンソールでのビューとマテリアライズドビューのサポートが追加されました。

### 統合の変更 {#integrations-changes-24}

- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md)プラグイン: ClickHouseが保守する公式ソリューションになりました
- [dbt](/integrations/data-ingestion/etl-tools/dbt/index.md)プラグイン: [マルチスレッド](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md)のサポートを追加
- [Grafana](/integrations/data-visualization/grafana/index.md)プラグイン: 接続エラーの処理を改善
- [Python](/integrations/language-clients/python/index.md)クライアント: insert操作の[ストリーミングサポート](/integrations/language-clients/python/advanced-querying.md#streaming-queries)
- [Go](/integrations/language-clients/go/index.md)クライアント: [バグ修正](https://github.com/ClickHouse/clickhouse-go/blob/main/CHANGELOG.md): キャンセルされた接続のクローズ、接続エラーの処理を改善
- [JS](/integrations/language-clients/js.md)クライアント: [exec/insertにおける破壊的変更](https://github.com/ClickHouse/clickhouse-js/releases/tag/0.0.12); 戻り値の型でquery_idを公開
- [Java](https://github.com/ClickHouse/clickhouse-java#readme)クライアント/JDBCドライバーのメジャーリリース
  - [破壊的変更](https://github.com/ClickHouse/clickhouse-java/releases): 非推奨のメソッド、クラス、パッケージを削除
  - R2DBCドライバーとファイルinsertのサポートを追加

### コンソールの変更 {#console-changes-25}

- SQLコンソールでビューとマテリアライズドビューのサポートを追加

### パフォーマンスと信頼性 {#performance-and-reliability-4}

- 停止中/アイドル状態のインスタンスに対するパスワードリセットを高速化
- より正確なアクティビティ追跡によるスケールダウン動作を改善
- SQLコンソールのCSVエクスポートが切り詰められるバグを修正
- サンプルデータのアップロードが断続的に失敗するバグを修正


## 2023年1月12日 {#january-12-2023}

このリリースでは、ClickHouseのバージョンを22.12に更新し、多数の新しいソースに対してディクショナリを有効化し、クエリパフォーマンスを改善しました。

### 全般的な変更 {#general-changes-3}

- 外部ClickHouse、Cassandra、MongoDB、MySQL、PostgreSQL、Redisを含む追加のソースに対してディクショナリを有効化

### ClickHouse 22.12バージョンアップグレード {#clickhouse-2212-version-upgrade}

- JOINサポートを拡張し、Grace Hash Joinに対応
- ファイル読み取りのためのバイナリJSON(BSON)サポートを追加
- GROUP BY ALL標準SQL構文のサポートを追加
- 固定精度での小数演算のための新しい数学関数を追加
- 変更の完全なリストについては、[22.12リリースブログ](https://clickhouse.com/blog/clickhouse-release-22-12)および[詳細な22.12変更履歴](/whats-new/cloud#clickhouse-2212-version-upgrade)を参照してください

### コンソールの変更 {#console-changes-26}

- SQLコンソールのオートコンプリート機能を改善
- デフォルトリージョンが大陸の地域性を考慮するように変更
- 請求使用量ページを改善し、請求単位とウェブサイト単位の両方を表示

### 統合の変更 {#integrations-changes-25}

- DBTリリース [v1.3.2](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md#release-132-2022-12-23)
  - delete+insert増分戦略の実験的サポートを追加
  - 新しいs3sourceマクロを追加
- Pythonクライアント [v0.4.8](https://github.com/ClickHouse/clickhouse-connect/blob/main/CHANGELOG.md#048-2023-01-02)
  - ファイル挿入サポートを追加
  - サーバーサイドクエリ[パラメータバインディング](/interfaces/cli.md/#cli-queries-with-parameters)を追加
- Goクライアント [v2.5.0](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.5.0)
  - 圧縮時のメモリ使用量を削減
  - サーバーサイドクエリ[パラメータバインディング](/interfaces/cli.md/#cli-queries-with-parameters)を追加

### 信頼性とパフォーマンス {#reliability-and-performance-2}

- オブジェクトストア上の多数の小さなファイルを取得するクエリの読み取りパフォーマンスを改善
- 新しく起動されたサービスについて、[互換性](/operations/settings/settings#compatibility)設定をサービスが最初に起動されたバージョンに設定

### バグ修正 {#bug-fixes-4}

Advanced Scalingスライダーを使用してリソースを予約すると、即座に反映されるようになりました。


## 2022年12月20日 {#december-20-2022}

このリリースでは、管理者向けのSQLコンソールへのシームレスなログイン、コールドリードの読み取りパフォーマンスの向上、およびClickHouse Cloud向けの改善されたMetabaseコネクタが導入されました。

### コンソールの変更 {#console-changes-27}

- 管理者ユーザー向けにSQLコンソールへのシームレスなアクセスを有効化
- 新規招待ユーザーのデフォルトロールを「管理者」に変更
- オンボーディングアンケートを追加

### 信頼性とパフォーマンス {#reliability-and-performance-3}

- ネットワーク障害発生時に復旧するため、長時間実行されるINSERTクエリにリトライロジックを追加
- コールドリードの読み取りパフォーマンスを向上

### 統合の変更 {#integrations-changes-26}

- [Metabaseプラグイン](/integrations/data-visualization/metabase-and-clickhouse.md)が待望のv0.9.1メジャーアップデートを実施しました。最新のMetabaseバージョンと互換性があり、ClickHouse Cloudに対して徹底的にテストされています。


## 2022年12月6日 - 一般提供開始 {#december-6-2022---general-availability}

ClickHouse Cloudは、SOC2 Type II準拠、本番ワークロード向けの稼働時間SLA、および公開ステータスページを備え、本番環境での利用が可能になりました。このリリースには、AWS Marketplaceとの統合、SQLコンソール(ClickHouseユーザー向けのデータ探索ワークベンチ)、ClickHouse Academy(ClickHouse Cloudでのセルフペース学習)などの主要な新機能が含まれています。詳細は[ブログ](https://clickhouse.com/blog/clickhouse-cloud-generally-available)をご覧ください。

### 本番環境対応 {#production-ready}

- SOC2 Type II準拠(詳細は[ブログ](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant)および[Trust Center](https://trust.clickhouse.com/)を参照)
- ClickHouse Cloud向けの公開[ステータスページ](https://status.clickhouse.com/)
- 本番ユースケース向けの稼働時間SLAを提供
- [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc)での提供開始

### 主要な新機能 {#major-new-capabilities}

- ClickHouseユーザー向けのデータ探索ワークベンチであるSQLコンソールを導入
- ClickHouse Cloudでのセルフペース学習である[ClickHouse Academy](https://learn.clickhouse.com/visitor_class_catalog)を開始

### 価格設定と計測の変更 {#pricing-and-metering-changes}

- トライアル期間を30日間に延長
- 固定容量で月額費用が低いDevelopment Servicesを導入。スタータープロジェクトや開発/ステージング環境に最適
- ClickHouse Cloudの運用とスケーリングの改善を継続する中で、Production Servicesの新しい割引価格を導入
- コンピュート計測時の粒度と精度を向上

### 統合機能の変更 {#integrations-changes-27}

- ClickHouse Postgres / MySQL統合エンジンのサポートを有効化
- SQLユーザー定義関数(UDF)のサポートを追加
- Kafka Connect sinkをベータステータスに昇格
- バージョン、更新ステータスなどに関する豊富なメタデータを導入し、統合機能UIを改善

### コンソールの変更 {#console-changes-28}

- クラウドコンソールでの多要素認証のサポート
- モバイルデバイス向けのクラウドコンソールナビゲーションを改善

### ドキュメントの変更 {#documentation-changes}

- ClickHouse Cloud専用の[ドキュメント](/cloud/overview)セクションを導入

### バグ修正 {#bug-fixes-5}

- 依存関係の解決により、バックアップからの復元が常に機能しなかった既知の問題に対処


## 2022年11月29日 {#november-29-2022}

このリリースでは、SOC2 Type II準拠を達成し、ClickHouseバージョンを22.11に更新し、複数のClickHouseクライアントと統合機能を改善しました。

### 全般的な変更 {#general-changes-4}

- SOC2 Type II準拠を達成（詳細は[ブログ](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant)および[Trust Center](https://trust.clickhouse.com)を参照）

### コンソールの変更 {#console-changes-29}

- サービスが自動的に一時停止されたことを示す「Idle」ステータスインジケーターを追加

### ClickHouse 22.11バージョンアップグレード {#clickhouse-2211-version-upgrade}

- HudiおよびDeltaLakeテーブルエンジンとテーブル関数のサポートを追加
- S3の再帰的ディレクトリ走査を改善
- 複合時間間隔構文のサポートを追加
- 挿入時の再試行により挿入の信頼性を向上
- 変更の完全なリストについては、[詳細な22.11変更履歴](/whats-new/cloud#clickhouse-2211-version-upgrade)を参照してください

### 統合機能 {#integrations-1}

- Pythonクライアント：v3.11サポート、挿入パフォーマンスの向上
- Goクライアント：DateTimeおよびInt64サポートの修正
- JSクライアント：相互SSL認証のサポート
- dbt-clickhouse：DBT v1.3のサポート

### バグ修正 {#bug-fixes-6}

- アップグレード後に古いClickHouseバージョンが表示されるバグを修正
- 「default」アカウントの権限変更がセッションを中断しなくなりました
- 新規作成された非管理者アカウントはデフォルトでシステムテーブルへのアクセス権を持たなくなりました

### このリリースの既知の問題 {#known-issues-in-this-release}

- 依存関係の解決により、バックアップからの復元が機能しない場合があります


## 2022年11月17日 {#november-17-2022}

このリリースでは、ローカルClickHouseテーブルおよびHTTPソースからのディクショナリが有効化され、ムンバイリージョンのサポートが導入され、クラウドコンソールのユーザーエクスペリエンスが改善されました。

### 全般的な変更 {#general-changes-5}

- ローカルClickHouseテーブルおよびHTTPソースからの[ディクショナリ](/sql-reference/dictionaries/index.md)のサポートを追加
- ムンバイ[リージョン](/cloud/reference/supported-regions)のサポートを導入

### コンソールの変更 {#console-changes-30}

- 請求書のフォーマットを改善
- 支払い方法登録のユーザーインターフェースを合理化
- バックアップのアクティビティログをより詳細に記録
- ファイルアップロード時のエラーハンドリングを改善

### バグ修正 {#bug-fixes-7}

- 一部のパートに単一の大きなファイルが存在する場合にバックアップが失敗する可能性があったバグを修正
- アクセスリストの変更が同時に適用された場合にバックアップからの復元が成功しなかったバグを修正

### 既知の問題 {#known-issues}

- 依存関係の解決により、バックアップからの復元が機能しない場合があります


## November 3, 2022 {#november-3-2022}

このリリースでは、価格設定から読み取り・書き込みユニットが削除され(詳細は[価格ページ](https://clickhouse.com/pricing)を参照)、ClickHouseバージョンが22.10に更新され、セルフサービス顧客向けのより高度な垂直スケーリングのサポートが追加され、より適切なデフォルト設定により信頼性が向上しました。

### 全般的な変更 {#general-changes-6}

- 価格モデルから読み取り/書き込みユニットを削除

### 設定の変更 {#configuration-changes-2}

- 安定性の理由により、設定`allow_suspicious_low_cardinality_types`、`allow_suspicious_fixed_string_types`、`allow_suspicious_codecs`(デフォルトはfalse)はユーザーによる変更ができなくなりました。

### コンソールの変更 {#console-changes-31}

- 有料顧客向けに垂直スケーリングのセルフサービス上限をメモリ720GBに引き上げ
- バックアップからの復元ワークフローを改善し、IPアクセスリストルールとパスワードを設定可能に
- サービス作成ダイアログにGCPとAzure向けのウェイトリストを導入
- ファイルアップロード時のエラー処理を改善
- 請求管理のワークフローを改善

### ClickHouse 22.10バージョンアップグレード {#clickhouse-2210-version-upgrade}

- 多数の大きなパート(少なくとも10GiB)が存在する場合に「パートが多すぎる」しきい値を緩和することで、オブジェクトストア上でのマージを改善しました。これにより、単一テーブルの単一パーティションで最大ペタバイト規模のデータを扱えるようになりました。
- `min_age_to_force_merge_seconds`設定によるマージ制御を改善し、特定の時間しきい値後にマージを実行できるようになりました。
- 設定をリセットするためのMySQL互換構文`SET setting_name = DEFAULT`を追加しました。
- モートン曲線エンコーディング、Java整数ハッシュ化、乱数生成のための関数を追加しました。
- 変更の完全なリストについては、[詳細な22.10変更履歴](/whats-new/cloud#clickhouse-2210-version-upgrade)を参照してください。


## October 25, 2022 {#october-25-2022}

このリリースでは、小規模ワークロードのコンピュートリソース消費を大幅に削減し、コンピュート価格を引き下げ(詳細は[価格](https://clickhouse.com/pricing)ページを参照)、より適切なデフォルト設定により安定性を向上させ、ClickHouse Cloudコンソールの請求および使用状況ビューを強化しました。

### 全般的な変更 {#general-changes-7}

- サービスの最小メモリ割り当てを24GBに削減
- サービスのアイドルタイムアウトを30分から5分に短縮

### 設定の変更 {#configuration-changes-3}

- max_parts_in_totalを100kから10kに削減。MergeTreeテーブルの`max_parts_in_total`設定のデフォルト値を100,000から10,000に引き下げました。この変更の理由は、データパーツ数が多いとクラウド環境でのサービス起動時間が遅くなる傾向があることが確認されたためです。パーツ数が多い状態は、通常、パーティションキーが過度に細分化されていることを示しており、これは多くの場合意図せず設定されたもので避けるべきです。このデフォルト値の変更により、このような状況をより早期に検出できるようになります。

### コンソールの変更 {#console-changes-32}

- トライアルユーザー向けに請求ビューのクレジット使用状況の詳細を強化
- ツールチップとヘルプテキストを改善し、使用状況ビューに価格ページへのリンクを追加
- IPフィルタリングのオプション切り替え時のワークフローを改善
- クラウドコンソールにメール確認の再送信ボタンを追加


## 2022年10月4日 - ベータ版 {#october-4-2022---beta}

ClickHouse Cloudは2022年10月4日にパブリックベータを開始しました。詳細については、この[ブログ](https://clickhouse.com/blog/clickhouse-cloud-public-beta)をご覧ください。

ClickHouse Cloudのバージョンは、ClickHouseコアv22.10をベースにしています。互換性のある機能の一覧については、[クラウド互換性](/whats-new/cloud-compatibility)ガイドを参照してください。
