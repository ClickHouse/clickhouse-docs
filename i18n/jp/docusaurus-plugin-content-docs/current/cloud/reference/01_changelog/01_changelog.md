---
slug: /whats-new/cloud
sidebar_label: 'Cloud 変更履歴'
title: 'Cloud 変更履歴'
description: '各 ClickHouse Cloud リリースにおける新機能や変更点をまとめた ClickHouse Cloud の変更履歴'
doc_type: 'changelog'
keywords: ['変更履歴', 'リリースノート', '更新', '新機能', 'クラウドの変更']
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

この ClickHouse Cloud の変更履歴に加えて、[Cloud Compatibility](/whats-new/cloud-compatibility) ページも参照してください。

:::tip[自動的に最新情報を入手！]

<a href="/docs/cloud/changelog-rss.xml">
  Cloud Changelog を RSS で購読する
</a>

:::


## 2025年12月19日 {#december-19-2025}

- AWS ap-south-1 で PCI 準拠のサービスを起動できるようになりました。
- **Unified user identity プライベートプレビュー**
  コンソールからデータベースユーザーを管理したいお客様は、SQL コンソール向けの新しい認証方式を有効化できます。
  これにより、コンソールにデータベースユーザー管理機能を追加する作業を進めている間も、新しい認証方式をお試しいただけます。
- **Unordered mode が S3 ClickPipes で利用可能に**:
  お客様は、Amazon S3 から ClickHouse Cloud へ、イベントドリブンな分析向けに任意の順序でデータを取り込むことができるようになりました。
  取り込み対象のファイルは、辞書順で並んでいる必要がなくなりました。詳細はアナウンスメントの[ブログ記事](https://clickhouse.com/blog/clickpipes-s3-unordered-mode)を参照してください。
- Fivetran コネクタは最近ベータ版に移行しました。Fivetran を使用していて、ClickHouse を宛先としてセットアップしたい場合は、こちらの[ドキュメント](https://fivetran.com/docs/destinations/clickhouse/setup-guide)を参照してください。

## 2025年12月12日 {#december-12-2025}

- **SAML SSO セルフサービス設定**

  エンタープライズのお客様は、サポートチケットを作成することなく、コンソールから SAML のセットアップを完了できるようになりました。
  さらに、SAML を利用するお客様は、IdP 経由で追加される新規ユーザーに割り当てるデフォルトロールを設定できるほか、カスタムのセッションタイムアウト設定も構成できます。
  詳細については、[ドキュメント](/cloud/security/saml-setup) を参照してください。
- **Azure における最大レプリカサイズとスケーリング制限**  

  お客様は、`eastus2` を除くすべての Azure リージョンで、最大レプリカサイズとして 356 GiB を設定できるようになりました。`eastus2` では、利用可能な最大レプリカサイズは 120 GiB です。

## 2025年11月21日 {#november-21-2025}

- ClickHouse Cloud が **AWS イスラエル (テルアビブ) — il-central-1** で利用可能になりました
- ClickHouse の組織を設定し、マーケットプレイスの従量課金サブスクリプションまたはプライベートオファーを請求先として利用できるようにするための、マーケットプレイスでのオンボーディング体験を改善しました。

## 2025年11月14日 {#november-14-2025}

- **ClickHouse Cloud** が新たに **2つのパブリックリージョン** で利用可能になりました:
  - **GCP Japan (asia-northeast1)**
  - **AWS Seoul (Asia Pacific, ap-northeast-2)** — **ClickPipes** でも新たにサポートされました

  これらのリージョンはこれまで **プライベートリージョン** としてのみ提供されていましたが、現在は **すべてのユーザーに公開** されています。
- Terraform と API で、サービスにタグを追加し、タグでサービスをフィルタリングできるようになりました。

## 2025年11月7日 {#november-7-2025}

- ClickHouse Cloud コンソールから、レプリカサイズを 1 vCPU、4 GiB 単位で設定できるようになりました。
  これらのオプションは、新しいサービスをセットアップする場合だけでなく、設定ページでレプリカサイズの最小値および最大値を設定する場合にも利用できます。
- カスタムハードウェアプロファイル（Enterprise ティアで利用可能）が、アイドル状態への移行をサポートするようになりました。
- ClickHouse Cloud は AWS Marketplace を通じて、[従量課金](https://aws.amazon.com/marketplace/pp/prodview-p4gwofrqpkltu?sr=0-2&ref_=beagle&applicationId=AWSMPContessa) と [コミット済み利用額契約](https://aws.amazon.com/marketplace/pp/prodview-4qyeihstyym2s?sr=0-3&ref_=beagle&applicationId=AWSMPContessa) を個別に選択できる、よりシンプルな購入体験を提供するようになりました。
- ClickHouse Cloud 上の ClickStack ユーザー向けに、アラート機能が利用可能になりました。
  これにより、追加のセットアップやインフラ／サービス、設定は一切不要で、HyperDX UI から直接、ログ、メトリクス、トレース全体にわたるアラートを作成・管理できるようになりました。アラートは Slack や PagerDuty などと連携します。
  詳細は [アラート機能のドキュメント](/use-cases/observability/clickstack/alerts) を参照してください。

## 2025年10月17日 {#october-17-2025}

- **サービスモニタリング - リソース利用状況ダッシュボード**  
  CPU 使用率とメモリ使用率のメトリクス表示は、平均値ではなく、指定期間中の最大使用率メトリクスを表示するように変更され、過少プロビジョニングの事例をより把握しやすくなりました。
  さらに、CPU 使用率メトリクスには、ClickHouse Cloud のオートスケーラーで使用されているメトリクスにより近い、Kubernetes レベルの CPU 使用率メトリクスが表示されるようになりました。 
- **外部バケット**  
  ClickHouse Cloud では、バックアップをお使いのクラウドサービスプロバイダのアカウントに直接エクスポートできるようになりました。
  外部ストレージバケット（AWS S3、Google Cloud Storage、Azure Blob Storage）を接続することで、バックアップ管理を自らの手で行えるようになります。

## 2025年8月29日 {#august-29-2025}

- [ClickHouse Cloud Azure Private Link](/cloud/security/azure-privatelink) は、リソース識別に使用するフィルターを Resource GUID から Resource ID フィルターへ切り替えました。従来の Resource GUID も引き続き使用でき、後方互換性がありますが、Resource ID フィルターへの移行を推奨します。移行の詳細については、Azure Private Link の[ドキュメント](/cloud/security/azure-privatelink#obtaining-private-endpoint-resourceid)を参照してください。

## 2025年8月22日 {#august-22-2025}

- **ClickHouse Connector for AWS Glue**  
  公式の [ClickHouse Connector for AWS Glue](/integrations/glue) を、[AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-eqvmuopqzdg7s) から利用できるようになりました。AWS Glue の Apache Spark ベースのサーバーレスエンジンを活用し、ClickHouse と他のデータソース間でデータの抽出・変換・ロード（ETL）を行えます。ClickHouse と Spark 間でテーブルを作成し、データの書き込みおよび読み取りを行う方法については、アナウンスメントの [ブログ記事](http://clickhouse.com/blog/clickhouse-connector-aws-glue) を参照して開始してください。
- **サービスにおける最小レプリカ数の変更**  
  スケールアップ済みのサービスは、[スケールダウン](/manage/scaling) により、最小で 1 レプリカまで縮小できるようになりました（以前の最小値は 2 レプリカでした）。注: 単一レプリカのサービスは可用性が低下するため、本番環境での利用は推奨されません。
- ClickHouse Cloud は、サービスのスケーリングおよびサービスバージョンのアップグレードに関する通知を、デフォルトで管理者ロールに対して送信するようになります。通知設定で通知の受信方法を調整できます。

## 2025年8月13日 {#august-13-2025}

- **MongoDB CDC 向け ClickPipes をプライベートプレビューで提供開始**
  MongoDB から ClickHouse Cloud へのデータレプリケーションを、ClickPipes を使って数回のクリックだけで実行できるようになり、
  外部の ETL ツールを利用せずにリアルタイム分析を行えるようになりました。コネクタは継続的なレプリケーションと
  一回限りの移行の両方をサポートし、MongoDB Atlas およびセルフホスト型 MongoDB デプロイメントと互換性があります。
  MongoDB CDC コネクタの概要については[ブログ記事](https://clickhouse.com/blog/mongodb-cdc-clickhouse-preview)を参照し、[こちらから早期アクセスにお申し込みください](https://clickhouse.com/cloud/clickpipes/mongodb-cdc-connector)。 

## August 8, 2025 {#august-08-2025}

- **Notifications**: お使いのサービスが新しい ClickHouse バージョンへのアップグレードを開始した際に、UI 通知を受け取るようになりました。追加のメールおよび Slack 通知は、通知センターから設定できます。
- **ClickPipes**: Azure Blob Storage (ABS) ClickPipes のサポートが ClickHouse Terraform プロバイダーに追加されました。ABS ClickPipe をプログラムから作成する方法の例については、プロバイダーのドキュメントを参照してください。
  - [Bug fix] Null engine を使用して宛先テーブルに書き込むオブジェクトストレージ ClickPipes が、UI 上で "Total records" および "Data ingested" メトリクスを報告するようになりました。
  - [Bug fix] UI のメトリクス用 "Time period" セレクターが、選択された期間に関わらずデフォルトで "24 hours" に設定されていました。この問題は修正され、UI は選択された期間に応じてグラフを正しく更新するようになりました。
- **Cross-region private link (AWS)** が一般提供 (GA) となりました。サポートされているリージョンの一覧については、[ドキュメント](/manage/security/aws-privatelink) を参照してください。

## 2025年7月31日 {#july-31-2025}

**ClickPipes の垂直スケーリングが利用可能に**

[ストリーミング ClickPipes で垂直スケーリングが利用可能になりました](https://clickhouse.com/blog/clickpipes-flexible-scaling-monitoring)。 
この機能により、レプリカ数（水平スケーリング）に加えて、各レプリカのサイズも制御できるようになります。各 ClickPipe の詳細ページには、レプリカごとの CPU およびメモリ使用率も表示されるようになり、ワークロードをより正確に把握し、自信を持ってリサイズ作業を計画できるようになります。

## 2025年7月24日 {#july-24-2025}

**MySQL CDC 向け ClickPipes がパブリックベータになりました**

ClickPipes の MySQL CDC コネクタが、パブリックベータ版として一般公開されました。数回クリックするだけで、
外部コンポーネントへの依存なしに、MySQL（または MariaDB）のデータをリアルタイムで直接 ClickHouse Cloud に
レプリケートし始めることができます。コネクタの概要については [ブログ記事](https://clickhouse.com/blog/mysql-cdc-connector-clickpipes-beta)
を参照し、[クイックスタート](https://clickhouse.com/docs/integrations/clickpipes/mysql)
に従ってセットアップを行ってください。

## July 11, 2025 {#june-11-2025}

- 新しいサービスでは、データベースとテーブルのメタデータを中央の **SharedCatalog** に保存するようになりました。  
  これは、オブジェクトのライフサイクル管理と調整のための新しいモデルであり、次のことを可能にします:
  - 高い同時実行時でもスケールする **クラウドスケールの DDL (Cloud-scale DDL)**
  - **堅牢な削除処理および新しい DDL 操作**
  - ステートレスノードがディスクへの依存なしで起動できることによる **高速なスピンアップとウェイクアップ**
  - Iceberg や Delta Lake を含む、ネイティブ形式とオープン形式の両方にわたる **ステートレスコンピュート**
  
  SharedCatalog の詳細は [ブログ](https://clickhouse.com/blog/clickhouse-cloud-stateless-compute) を参照してください。

- GCP `europe-west4` リージョンで、HIPAA 準拠のサービスを起動できるようになりました。

## 2025年6月27日 {#june-27-2025}

- データベース権限を管理するための Terraform provider を正式にサポートしました。これはセルフマネージドのデプロイメントにも対応しています。詳細については
  [ブログ](https://clickhouse.com/blog/new-terraform-provider-manage-clickhouse-database-users-roles-and-privileges-with-code)
  および
  [ドキュメント](https://registry.terraform.io/providers/ClickHouse/clickhousedbops/latest/docs)
  を参照してください。
- Enterprise ティアのサービスは、[slow release channel](/manage/updates/#slow-release-channel-deferred-upgrades) に登録することで、通常のリリースから 2 週間後までアップグレードを延期できるようになりました。これにより、テストのための追加期間を確保できます。

## June 13, 2025 {#june-13-2025}

- ClickHouse Cloud Dashboards の一般提供を開始しました。Dashboards を使用すると、ダッシュボード上でクエリ結果を可視化し、フィルターやクエリパラメータを通じてデータを操作し、共有を管理できます。
- API キーの IP フィルター: ClickHouse Cloud とのやり取りに対する追加の保護層を導入しました。API キーを生成する際に、API キーを使用できる場所を制限するための IP アドレス許可リストを設定できます。詳細は[ドキュメント](https://clickhouse.com/docs/cloud/security/setting-ip-filters)を参照してください。 

## 2025年5月30日 {#may-30-2025}

- ClickHouse Cloud 上で **ClickPipes for Postgres CDC** の一般提供を開始しました。わずかなクリック操作で Postgres
  データベースをレプリケートし、超高速なリアルタイム分析を実現できます。このコネクタは、
  より高速なデータ同期、数秒程度まで抑えられたレイテンシ、自動スキーマ変更、
  完全にセキュアな接続などを提供します。詳細は
  [ブログ](https://clickhouse.com/blog/postgres-cdc-connector-clickpipes-ga) を参照してください。開始手順については [こちら](https://clickhouse.com/docs/integrations/clickpipes/postgres) を参照してください。

- SQL コンソールのダッシュボードに以下の改善を導入しました：
  - 共有：チームメンバーとダッシュボードを共有できます。アクセスレベルは 4 段階あり、グローバルおよびユーザー単位の両方で調整できます：
    - _書き込みアクセス_：可視化の追加/編集、更新設定、フィルターを通じたダッシュボードとのインタラクション。
    - _オーナー_：ダッシュボードの共有、ダッシュボードの削除、および「書き込みアクセス」を持つユーザーのすべての権限。
    - _読み取り専用アクセス_：フィルターを通じてダッシュボードを閲覧および操作。
    - _アクセスなし_：ダッシュボードを閲覧できない。
  - すでに作成済みの既存のダッシュボードについては、Organization Administrator がそれらのダッシュボードのオーナーとして自らを設定できます。
  - SQL コンソールのクエリビューから、テーブルまたはチャートをダッシュボードに追加できるようになりました。

<Image img={dashboards} size="md" alt="ダッシュボードの改善" border />

- AWS および GCP 向けの [Distributed cache](https://clickhouse.com/cloud/distributed-cache-waitlist) の
  プレビュー参加者を募集しています。詳細は [ブログ](https://clickhouse.com/blog/building-a-distributed-cache-for-s3) を参照してください。

## 2025年5月16日 {#may-16-2025}

- ClickHouse Cloud 上のサービスで使用されているリソースを可視化する Resource Utilization Dashboard を導入しました。次のメトリクスがシステムテーブルからスクレイプされ、このダッシュボードに表示されます：
  * メモリ & CPU: `CGroupMemoryTotal`（割り当てメモリ）、`CGroupMaxCPU`（割り当て CPU）、
    `MemoryResident`（使用中メモリ）、`ProfileEvent_OSCPUVirtualTimeMicroseconds`（使用中 CPU）のグラフ
  * Data Transfer: ClickHouse Cloud へのデータのイングレスおよびエグレスを示すグラフ。詳細は[こちら](/cloud/manage/network-data-transfer)を参照してください。
- ClickHouse Cloud サービスのモニタリングを簡素化するために構築された、新しい ClickHouse Cloud Prometheus/Grafana ミックスインのリリースをお知らせします。
  このミックスインは、Prometheus 互換の API エンドポイントを使用して、
  ClickHouse のメトリクスを既存の Prometheus および Grafana 環境にシームレスに統合します。あらかじめ構成済みのダッシュボードが含まれており、
  サービスの正常性およびパフォーマンスをリアルタイムで可視化できます。詳細についてはリリース[ブログ](https://clickhouse.com/blog/monitor-with-new-prometheus-grafana-mix-in)を参照してください。

## 2025年4月18日 {#april-18-2025}

- 新しい組織レベルのロール **Member** と、2つの新しいサービスレベルのロール
  **Service Admin** および **Service Read Only** を導入しました。
  **Member** は、SAML SSO ユーザーにデフォルトで割り当てられる
  組織レベルのロールで、サインインとプロファイルの更新のみの権限を提供します。**Service Admin**
  および **Service Read Only** ロールは、1つ以上のサービスに対して、**Member**、
  **Developer**、または **Billing Admin** ロールを持つユーザーに割り当てることができます。詳細は
  ["Access control in ClickHouse Cloud"](https://clickhouse.com/docs/cloud/security/cloud-access-management/overview)
  を参照してください。
- ClickHouse Cloud は、**Enterprise** 顧客向けに、以下のリージョンで **HIPAA** および
  **PCI** 対応サービスを提供するようになりました:
  AWS eu-central-1、AWS eu-west-2、AWS us-east-2。
- **ClickPipes のユーザー向け通知** を導入しました。この機能は、
  ClickPipes の障害に対する自動アラートを、メール、ClickHouse Cloud UI、
  Slack 経由で送信します。メールおよび UI 経由の通知はデフォルトで有効化されており、
  パイプごとに設定できます。**Postgres CDC ClickPipes** では、レプリケーションスロットの
  しきい値（**Settings** タブで設定可能）、特定のエラー種別、
  および障害を解決するためのセルフサービス手順もアラートに含まれます。
- **MySQL CDC のプライベートプレビュー** を開始しました。これにより、お客様はわずか数クリックで
  MySQL データベースを ClickHouse Cloud にレプリケートでき、高速な分析を実現しつつ、
  外部の ETL ツールを不要にできます。このコネクタは、継続的なレプリケーションと
  一度きりの移行の両方をサポートしており、MySQL がクラウド（RDS、
  Aurora、Cloud SQL、Azure など）上かオンプレミスかを問いません。プライベートプレビューには、
  [このリンク](https://clickhouse.com/cloud/clickpipes/mysql-cdc-connector) から登録できます。
- **ClickPipes 向け AWS PrivateLink** を導入しました。AWS PrivateLink を使用して、
  VPC、AWS サービス、オンプレミスシステムと ClickHouse Cloud 間で
  セキュアな接続を確立できます。これにより、Postgres、MySQL、AWS 上の MSK といった
  ソースからデータを移動する際に、トラフィックをパブリックインターネットに
  さらす必要がなくなります。また、VPC サービスエンドポイントを通じた
  リージョン間アクセスもサポートします。PrivateLink 接続のセットアップは、
  ClickPipes 経由で[完全にセルフサービス](https://clickhouse.com/docs/integrations/clickpipes/aws-privatelink)
  で行えるようになりました。

## 2025年4月4日 {#april-4-2025}

- ClickHouse Cloud 向け Slack 通知: ClickHouse Cloud は、コンソールおよびメールでの通知に加えて、請求、スケーリング、ClickPipes イベントに関する Slack 通知をサポートするようになりました。これらの通知は ClickHouse Cloud の Slack アプリケーション経由で送信されます。Organization の管理者は、通知センターで通知を送信する Slack チャンネルを指定することで、これらの通知を設定できます。
- Production サービスおよび Development サービスを利用しているユーザーは、請求書に ClickPipes およびデータ転送の利用料金が表示されるようになりました。

## 2025年3月21日 {#march-21-2025}

- AWS 上でのリージョン間 PrivateLink 接続がベータ版になりました。設定方法およびサポートされているリージョン一覧については、
  ClickHouse Cloud Private Link の[ドキュメント](/manage/security/aws-privatelink)を参照してください。
- AWS 上のサービスで利用可能な最大レプリカサイズは、236 GiB RAM に設定されました。
  これにより、バックグラウンド処理向けのリソースを確保しつつ、効率的にリソースを利用できるようになります。

## 2025年3月7日 {#march-7-2025}

- 新しい `UsageCost` API エンドポイント：API 仕様で、利用状況に関する情報を取得するための
  新しいエンドポイントがサポートされるようになりました。これは組織レベルの
  エンドポイントであり、利用コストは最大31日分までクエリできます。取得可能な
  メトリクスには Storage、Compute、Data Transfer、ClickPipes が含まれます。詳細は
  [ドキュメント](https://clickhouse.com/docs/cloud/manage/api/usageCost-api-reference)を参照してください。
- Terraform provider [v2.1.0](https://registry.terraform.io/providers/ClickHouse/clickhouse/2.1.0/docs/resources/service#nestedatt--endpoints_configuration) がリリースされ、MySQL エンドポイントの有効化がサポートされました。

## 2025年2月21日 {#february-21-2025}

### ClickHouse Bring Your Own Cloud (BYOC) for AWS が一般提供になりました {#clickhouse-byoc-for-aws-ga}

このデプロイメントモデルでは、データプレーンコンポーネント（コンピュート、ストレージ、バックアップ、ログ、メトリクス）はカスタマー VPC 内で稼働し、一方でコントロールプレーン（Web アクセス、API、課金）は ClickHouse VPC 内に保持されます。この構成は、すべてのデータを安全なカスタマー環境内に保持することで、厳格なデータ所在地要件への準拠が必要な大規模ワークロードに最適です。

- 詳細については、BYOC の[ドキュメント](/cloud/reference/byoc/overview)を参照するか、[アナウンスブログ記事](https://clickhouse.com/blog/announcing-general-availability-of-clickhouse-bring-your-own-cloud-on-aws)をお読みください。
- アクセスをご希望の方は、[お問い合わせ](https://clickhouse.com/cloud/bring-your-own-cloud)ください。

### ClickPipes 向け Postgres CDC コネクタ {#postgres-cdc-connector-for-clickpipes}

ClickPipes 向け Postgres CDC コネクタにより、ユーザーは Postgres データベースを ClickHouse Cloud にシームレスにレプリケートできます。

- 利用を開始するには、ClickPipes Postgres CDC コネクタの[ドキュメント](https://clickhouse.com/docs/integrations/clickpipes/postgres)を参照してください。
- お客様のユースケースや機能の詳細については、[ランディングページ](https://clickhouse.com/cloud/clickpipes/postgres-cdc-connector)および[ローンチブログ](https://clickhouse.com/blog/postgres-cdc-connector-clickpipes-public-beta)を参照してください。

### AWS 上の ClickHouse Cloud における PCI 準拠 {#pci-compliance-for-clickhouse-cloud-on-aws}

ClickHouse Cloud は現在、**us-east-1** および **us-west-2** リージョンの **Enterprise ティア** のお客様向けに、**PCI 準拠サービス** をサポートしています。PCI 準拠環境でサービスを起動したい場合は、[サポート](https://clickhouse.com/support/program)までお問い合わせください。

### Google Cloud Platform における Transparent Data Encryption と Customer Managed Encryption Keys {#tde-and-cmek-on-gcp}

**Transparent Data Encryption (TDE)** および **Customer Managed
Encryption Keys (CMEK)** のサポートが、**Google Cloud Platform (GCP)** 上の ClickHouse Cloud で利用可能になりました。

- これらの機能の詳細については、[ドキュメント](https://clickhouse.com/docs/cloud/security/cmek#transparent-data-encryption-tde)を参照してください。

### AWS Middle East (UAE) リージョンでの提供開始 {#aws-middle-east-uae-availability}

ClickHouse Cloud に新しいリージョンサポートが追加され、**AWS Middle East (UAE) me-central-1** リージョンで利用可能になりました。

### ClickHouse Cloud のガードレール {#clickhouse-cloud-guardrails}

ClickHouse Cloud のベストプラクティスを推進し、安定した利用を確保するために、使用されるテーブル、データベース、パーティション、およびパーツの数に対するガードレールを導入します。

- 詳細については、ドキュメントの[使用制限](https://clickhouse.com/docs/cloud/bestpractices/usage-limits)セクションを参照してください。
- すでにこれらの制限を超えているサービスについては、10% までの増加を許容します。ご不明な点があれば[サポート](https://clickhouse.com/support/program)までお問い合わせください。

## 2025年1月27日 {#january-27-2025}

### ClickHouse Cloud ティアの変更 {#changes-to-clickhouse-cloud-tiers}

当社は、お客様の絶えず変化する要件に対応できるよう、自社プロダクトの改善に注力しています。過去2年間にわたり GA として提供してきた ClickHouse Cloud は大きく進化しており、お客様が当社のクラウドサービスをどのように活用しているかについて、非常に貴重な知見を得てきました。

今回、お客様のワークロードに対する ClickHouse Cloud サービスのサイズ調整とコスト効率を最適化するための新機能を導入します。これには **compute-compute 分離**、高性能なマシンタイプ、そして **単一レプリカサービス (single-replica services)** が含まれます。また、自動スケーリングとマネージドアップグレードも進化させ、よりシームレスかつリアクティブに実行されるようにします。

さらに、最も要求の厳しいお客様およびワークロードのニーズに応えるため、**新しい Enterprise ティア** を追加します。これは、業界特有のセキュリティおよびコンプライアンス機能、基盤ハードウェアやアップグレードに対する、これまで以上に細かな制御、高度な災害復旧機能に重点を置いたものです。

これらの変更を支えるため、現在の **Development** ティアおよび **Production** ティアを再構成し、進化し続けるお客様ベースによる実際の利用パターンに、より緊密に合わせます。新しいアイデアやプロジェクトを試行するユーザーを対象とした **Basic** ティアと、本番ワークロードおよび大規模データを扱うユーザー向けの **Scale** ティアを導入します。

これらおよびその他の機能変更については、この [ブログ](https://clickhouse.com/blog/evolution-of-clickhouse-cloud-new-features-superior-performance-tailored-offerings) を参照してください。既存のお客様は、[新しいプラン](https://clickhouse.com/pricing) を選択するための対応が必要があります。組織管理者の方には、お知らせをメールでお送りしています。

### Warehouses: Compute-compute 分離 (GA) {#warehouses-compute-compute-separation-ga}

compute-compute 分離（"Warehouses" とも呼ばれます）が Generally Available (GA) になりました。詳細は [ブログ](https://clickhouse.com/blog/introducing-warehouses-compute-compute-separation-in-clickhouse-cloud) および [ドキュメント](/cloud/reference/warehouses) を参照してください。

### 単一レプリカサービス {#single-replica-services}

スタンドアロンのオファリングとして、また Warehouses 内の構成要素として、「単一レプリカサービス (single-replica service)」という新しい概念を導入します。スタンドアロンオファリングとしての単一レプリカサービスはサイズに制限があり、小規模なテストワークロード向けを想定しています。Warehouses 内では、単一レプリカサービスをより大きなサイズでデプロイでき、高可用性を大規模には必要としないワークロード（再実行可能な ETL ジョブなど）に利用できます。

### 垂直オートスケーリングの改善 {#vertical-auto-scaling-improvements}

コンピュートレプリカ向けの新しい垂直スケーリングメカニズムを導入します。これは "Make Before Break" (MBB) と呼んでいます。この方式では、古いレプリカを削除する前に新しいサイズのレプリカを1つ以上追加することで、スケーリング操作中にキャパシティが失われることを防ぎます。既存レプリカの削除と新規レプリカの追加の間に存在するギャップをなくすことで、MBB はよりシームレスで影響の少ないスケーリングプロセスを実現します。特にスケールアップのシナリオにおいて効果的であり、高いリソース使用率が追加キャパシティの必要性をトリガーしている状況では、レプリカを早まって削除するとリソース制約を悪化させてしまうためです。

### 水平スケーリング (GA) {#horizontal-scaling-ga}

水平スケーリングが Generally Available になりました。ユーザーは API およびクラウドコンソールを通じてレプリカを追加し、サービスをスケールアウトできます。詳細については [ドキュメント](/manage/scaling#manual-horizontal-scaling) を参照してください。

### 設定可能なバックアップ {#configurable-backups}

お客様自身のクラウドアカウントにバックアップをエクスポートできるようになりました。詳細は [ドキュメント](/cloud/manage/backups/configurable-backups) を参照してください。

### マネージドアップグレードの改善 {#managed-upgrade-improvements}

安全なマネージドアップグレードは、新機能が追加されていくデータベースにユーザーが常に追従できるようにすることで、大きな価値を提供します。今回のリリースでは、アップグレードに対しても "make before break"（MBB）アプローチを適用し、実行中のワークロードへの影響をさらに軽減しています。

### HIPAA 対応 {#hipaa-support}

準拠リージョンにおいて HIPAA をサポートしています。対象は AWS `us-east-1`、`us-west-2` および GCP `us-central1`、`us-east1` です。オンボーディングを希望するお客様は Business Associate Agreement (BAA) に署名し、準拠対象となるリージョンの環境にデプロイする必要があります。HIPAA の詳細については [ドキュメント](/cloud/security/compliance-overview) を参照してください。

### スケジュールされたアップグレード {#scheduled-upgrades}

ユーザーは自分のサービスに対するアップグレードをスケジュールできます。この機能は Enterprise ティアのサービスのみに対応しています。スケジュールされたアップグレードの詳細については [ドキュメント](/manage/updates) を参照してください。

### 言語クライアントでの複合型サポート {#language-client-support-for-complex-types}

[Golang](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.30.1)、[Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.11)、および [NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.1) クライアントが Dynamic、Variant、JSON 型をサポートするようになりました。

### 更新可能なマテリアライズドビューに対する DBT サポート {#dbt-support-for-refreshable-materialized-views}

DBT は `1.8.7` リリースで、[更新可能なマテリアライズドビューをサポート](https://github.com/ClickHouse/dbt-clickhouse/releases/tag/v1.8.7) するようになりました。

### JWT トークン対応 {#jwt-token-support}

JDBC driver v2、clickhouse-java、[Python](https://github.com/ClickHouse/clickhouse-connect/releases/tag/v0.8.12)、および [NodeJS](https://github.com/ClickHouse/clickhouse-js/releases/tag/1.10.0) クライアントに、JWT ベースの認証サポートが追加されました。

JDBC / Java での対応は、リリース予定の [0.8.0](https://github.com/ClickHouse/clickhouse-java/releases/tag/v0.8.0) に含まれる予定です（リリース時期は未定です）。

### Prometheus 連携の改善 {#prometheus-integration-improvements}

Prometheus 連携にいくつかの機能強化を行いました。

- **組織レベルのエンドポイント**。ClickHouse Cloud 向けの Prometheus 連携に機能強化を導入しました。サービスレベルのメトリクスに加えて、API に **組織レベルのメトリクス** 用エンドポイントが追加されました。この新しいエンドポイントは、組織内のすべてのサービスのメトリクスを自動的に収集し、Prometheus コレクターへのメトリクスのエクスポートを効率化します。これらのメトリクスは、Grafana や Datadog などの可視化ツールと統合することで、組織全体のパフォーマンスをより包括的に把握することができます。

  この機能はすべてのユーザーがすでに利用可能です。詳細は[こちら](/integrations/prometheus)を参照してください。

- **フィルタリングされたメトリクス**。ClickHouse Cloud 向けの Prometheus 連携で、フィルタリングされたメトリクス一覧を返す機能を追加しました。この機能により、監視対象サービスのヘルスチェックに重要なメトリクスに絞り込むことで、レスポンスのペイロードサイズを削減できます。

  この機能は API のオプションのクエリパラメーターとして提供されており、データ収集を最適化し、Grafana や Datadog などのツールとの連携をさらに効率化しやすくなります。

  フィルタリングされたメトリクス機能は、すべてのユーザーが利用可能です。詳細は[こちら](/integrations/prometheus)を参照してください。

## 2024年12月20日 {#december-20-2024}

### Marketplace サブスクリプションの組織への関連付け {#marketplace-subscription-organization-attachment}

新しい Marketplace サブスクリプションを既存の ClickHouse Cloud 組織に関連付けられるようになりました。Marketplace での購読手続きを完了し、ClickHouse Cloud にリダイレクトされた後、過去に作成した既存の組織を新しい Marketplace サブスクリプションに接続できます。これ以降、その組織内のリソースは Marketplace 経由で課金されます。 

<Image img={add_marketplace} size="md" alt="ClickHouse Cloud インターフェイスで、既存の組織に Marketplace サブスクリプションを追加する方法を表示している画面" border />

### OpenAPI キー有効期限の強制設定 {#force-openapi-key-expiration}

API キーの有効期限の設定を制限し、無期限の OpenAPI キーを作成できないようにすることが可能になりました。これらの制限を組織に対して有効にするには、ClickHouse Cloud Support チームにお問い合わせください。

### 通知用カスタムメールアドレス {#custom-emails-for-notifications}

Org Admin は、特定の通知に対して追加の宛先として、複数のメールアドレスを追加できるようになりました。これは、通知をエイリアスや、ClickHouse Cloud のユーザーではない組織内の他のユーザーに送信したい場合に便利です。これを設定するには、Cloud コンソールの Notification Settings に移動し、メール通知を受信させたいメールアドレスの設定を編集してください。 

## 2024年12月6日 {#december-6-2024}

### BYOC（ベータ版） {#byoc-beta}

AWS 向けの BYOC（Bring Your Own Cloud）がベータ版として利用可能になりました。このデプロイメントモデルを使用すると、自身の AWS アカウント内に ClickHouse Cloud をデプロイして実行できます。現在 11 以上の AWS リージョンでのデプロイメントをサポートしており、今後さらに追加される予定です。アクセスをご希望の場合は[サポートにお問い合わせください](https://clickhouse.com/support/program)。なお、このデプロイメントは大規模な環境での利用を想定したものです。

### ClickPipes における Postgres Change Data Capture（CDC）コネクタ {#postgres-change-data-capture-cdc-connector-in-clickpipes}

このターンキー型の統合機能により、数クリックで Postgres データベースを ClickHouse Cloud にレプリケーションし、高速な分析に ClickHouse を活用できるようになります。このコネクタは、Postgres からの継続的なレプリケーションと一度限りのマイグレーションの両方に利用できます。

### ダッシュボード（ベータ版） {#dashboards-beta}

今週、ClickHouse Cloud におけるダッシュボード機能のベータ版リリースを発表します。ダッシュボードを使用すると、保存済みクエリを可視化に変換し、それらの可視化をダッシュボード上に整理し、クエリパラメータを使ってダッシュボードと対話できます。開始手順については、[ダッシュボードのドキュメント](/cloud/manage/dashboards)を参照してください。

<Image img={beta_dashboards} size="lg" alt="ClickHouse Cloud インターフェースに、新しいダッシュボードのベータ版機能と可視化が表示されている画面" border />

### Query API エンドポイント（GA） {#query-api-endpoints-ga}

ClickHouse Cloud における Query API エンドポイントの GA リリースをお知らせします。Query API エンドポイントを使用すると、保存済みクエリ向けの RESTful API エンドポイントを数クリックで立ち上げ、言語クライアントや認証の複雑さに煩わされることなく、アプリケーションでデータを利用し始めることができます。初回リリース以降、次のような多くの改善を行いました。

* エンドポイントのレイテンシ削減（特にコールドスタート時）
* エンドポイントの RBAC 制御の強化
* 設定可能な CORS 許可ドメイン
* 結果のストリーミング
* ClickHouse 互換のすべての出力フォーマットのサポート

これらの改善に加えて、既存のフレームワークを活用し、ClickHouse Cloud サービスに対して任意の SQL クエリを実行できる汎用 Query API エンドポイントを提供開始します。汎用エンドポイントは、サービスの設定ページから有効化および構成できます。

開始手順については、[Query API エンドポイントのドキュメント](/cloud/get-started/query-endpoints)を参照してください。

<Image img={api_endpoints} size="lg" alt="ClickHouse Cloud インターフェースに、さまざまな設定項目を含む API エンドポイントの設定画面が表示されている" border />

### ネイティブ JSON サポート（ベータ版） {#native-json-support-beta}

ClickHouse Cloud におけるネイティブ JSON サポートのベータ版を開始します。利用を開始するには、クラウドサービスの有効化について[サポート](/cloud/support)までお問い合わせください。

### ベクトル類似度インデックスを用いたベクトル検索（早期アクセス） {#vector-search-using-vector-similarity-indexes-early-access}

近似ベクトル検索向けのベクトル類似度インデックスを早期アクセスとして提供開始します。

ClickHouse はすでに、幅広い[距離関数](https://clickhouse.com/blog/reinvent-2024-product-announcements#vector-search-using-vector-similarity-indexes-early-access)と線形スキャンの実行機能により、ベクトルベースのユースケースを強力にサポートしています。さらに最近、[近似ベクトル検索](/engines/table-engines/mergetree-family/annindexes) の実験的アプローチを追加しました。これは [usearch](https://github.com/unum-cloud/usearch) ライブラリと、Hierarchical Navigable Small Worlds（HNSW）近似最近傍探索アルゴリズムによって実現されています。

利用を開始するには、[早期アクセスのウェイトリストに登録](https://clickhouse.com/cloud/vector-search-index-waitlist)してください。

### ClickHouse-connect（Python）および ClickHouse Kafka Connect ユーザーの方へ {#clickhouse-connect-python-and-clickhouse-kafka-connect-users}

クライアントが `MEMORY_LIMIT_EXCEEDED` 例外に遭遇する可能性のある問題を経験したお客様に、通知メールを送信しました。

以下のバージョン以降にアップグレードしてください。

- Kafka-Connect: > 1.2.5
- ClickHouse-Connect (Java): > 0.8.6

### ClickPipes が AWS 上での VPC 間リソースアクセスをサポート {#clickpipes-now-supports-cross-vpc-resource-access-on-aws}

AWS MSK のような特定のデータソースに対して、一方向のアクセスを付与できるようになりました。AWS PrivateLink と VPC Lattice を使用した VPC 間リソースアクセスにより、パブリックネットワーク経由であってもプライバシーとセキュリティを損なうことなく、VPC やアカウントをまたいで、あるいはオンプレミスネットワークからであっても、個別のリソースを共有できます。開始方法とリソース共有の設定手順については、[アナウンス記事](https://clickhouse.com/blog/clickpipes-crossvpc-resource-endpoints?utm_medium=web&utm_source=changelog)を参照してください。

<Image img={cross_vpc} size="lg" alt="ClickPipes が AWS MSK に接続する Cross-VPC リソースアクセスアーキテクチャを示した図" border />

### ClickPipes が AWS MSK 向け IAM をサポートしました {#clickpipes-now-supports-iam-for-aws-msk}

AWS MSK ClickPipes で、IAM 認証を使用して MSK ブローカーに接続できるようになりました。利用を開始するには、[ドキュメント](/integrations/clickpipes/kafka/best-practices/#iam)を参照してください。

### AWS 上の新規サービスの最大レプリカサイズ {#maximum-replica-size-for-new-services-on-aws}

今後、AWS 上で新たに作成されるサービスでは、利用可能な最大レプリカサイズは 236 GiB となります。

## 2024年11月22日 {#november-22-2024}

### ClickHouse Cloud 向け組み込みの高度なオブザーバビリティダッシュボード {#built-in-advanced-observability-dashboard-for-clickhouse-cloud}

これまで、ClickHouse サーバーのメトリクスやハードウェアリソース使用状況を監視できる高度なオブザーバビリティダッシュボードは、オープンソース版 ClickHouse でのみ利用可能でした。この機能が ClickHouse Cloud コンソールでも利用できるようになりました。

このダッシュボードでは、[system.dashboards](/operations/system-tables/dashboards) テーブルに基づくクエリを、オールインワンの UI で表示できます。**Monitoring > Service Health** ページにアクセスして、高度なオブザーバビリティダッシュボードを今すぐご利用ください。

<Image img={nov_22} size="lg" alt="サーバーメトリクスとリソース使用状況を表示する ClickHouse Cloud の高度なオブザーバビリティダッシュボード" border />

### AI を活用した SQL オートコンプリート {#ai-powered-sql-autocomplete}

新しい AI Copilot によりオートコンプリート機能を大幅に強化し、クエリを記述しながらインラインで SQL の補完候補を得られるようになりました。この機能は、任意の ClickHouse Cloud サービスで **「Enable Inline Code Completion」** 設定を有効化することで利用できます。

<Image img={copilot} size="lg" alt="ユーザーの入力に対して AI Copilot が SQL のオートコンプリート候補を提示するアニメーション" border />

### 新しい「Billing」ロール {#new-billing-role}

組織内のユーザーに新しい **Billing** ロールを割り当てられるようになりました。このロールを付与されたユーザーは、サービスの設定や管理権限を与えることなく、課金情報の閲覧および管理のみを行うことができます。新規ユーザーを招待するか、既存ユーザーのロールを編集して **Billing** ロールを割り当ててください。

## 2024年11月8日 {#november-8-2024}

### ClickHouse Cloud におけるお客様向け通知 {#customer-notifications-in-clickhouse-cloud}

ClickHouse Cloud では、複数の課金およびスケーリングイベントに対して、コンソール上およびメールでの通知を提供するようになりました。お客様は、Cloud コンソールの通知センターからこれらの通知を設定し、UI 上にのみ表示するか、メールで受信するか、またはその両方を選択できます。受信する通知のカテゴリと重要度は、サービス単位で設定できます。

将来的には、他のイベント向けの通知や、通知を受け取るための追加の方法も提供する予定です。

サービスで通知を有効にする方法の詳細については、[ClickHouse ドキュメント](/cloud/notifications)を参照してください。

<Image img={notifications} size="lg" alt="ClickHouse Cloud の通知センターのインターフェースで、さまざまな通知タイプの設定オプションを表示している画面" border />

<br />

## 2024年10月4日 {#october-4-2024}

### ClickHouse Cloud が GCP 向け HIPAA 対応サービス（ベータ版）を提供開始 {#clickhouse-cloud-now-offers-hipaa-ready-services-in-beta-for-gcp}

保護対象医療情報（PHI）のセキュリティ強化を求めるお客様は、[Google Cloud Platform (GCP)](https://cloud.google.com/) 上の ClickHouse Cloud をご利用いただけるようになりました。ClickHouse は、[HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html) に規定される管理的・物理的・技術的な保護対策を実装し、さらにお客様のユースケースやワークロードに応じて適用可能なセキュリティ設定を構成できるようになりました。利用可能なセキュリティ設定の詳細については、[Security features ページ](/cloud/security)を参照してください。

サービスは GCP の `us-central-1` リージョンで、**Dedicated** サービスタイプをご利用のお客様向けに提供され、Business Associate Agreement (BAA) の締結が必要です。この機能へのアクセスをリクエストする場合、あるいは他の GCP / AWS / Azure リージョン向けのウェイトリストに参加する場合は、[sales](mailto:sales@clickhouse.com) または [support](https://clickhouse.com/support/program) までお問い合わせください。

### Compute-compute separation が GCP および Azure 向けにプライベートプレビューとして利用可能に {#compute-compute-separation-is-now-in-private-preview-for-gcp-and-azure}

最近、AWS 向けの Compute-compute separation のプライベートプレビューを発表しましたが、これが GCP および Azure でも利用可能になりました。

Compute-compute separation により、特定のサービスを読み書き可能サービスまたは読み取り専用サービスとして指定でき、アプリケーションに最適なコンピュート構成を設計してコストとパフォーマンスを最適化できます。詳細については、[ドキュメント](/cloud/reference/warehouses)を参照してください。

### セルフサービスによる MFA リカバリーコード {#self-service-mfa-recovery-codes}

多要素認証 (MFA) を利用しているお客様は、携帯電話の紛失やトークンを誤って削除した場合に使用できるリカバリーコードを取得できるようになりました。初めて MFA を有効化するお客様には、セットアップ時にコードが提供されます。既に MFA を利用しているお客様は、既存の MFA トークンを削除して新しいトークンを追加することで、リカバリーコードを取得できます。

### ClickPipes アップデート: カスタム証明書、レイテンシインサイトなど {#clickpipes-update-custom-certificates-latency-insights-and-more}

ClickPipes は、ClickHouse サービスにデータをインジェストする最も簡単な方法です。今回、データインジェストに対する制御性を高め、パフォーマンスメトリクスへの可視性を向上させる新機能を追加しました。

*Kafka 向けカスタム認証証明書*

ClickPipes for Kafka は、SASL およびパブリック SSL/TLS を使用する Kafka ブローカー向けにカスタム認証証明書をサポートしました。ClickPipe のセットアップ時に SSL Certificate セクションから独自の証明書を簡単にアップロードでき、Kafka への接続をより安全にできます。

*Kafka および Kinesis 向けレイテンシメトリクスの導入*

パフォーマンスの可視性は重要です。ClickPipes にレイテンシグラフが追加され、Kafka Topic や Kinesis Stream からメッセージが生成されてから ClickHouse Cloud にインジェストされるまでの時間を把握できるようになりました。この新しいメトリクスにより、データパイプラインのパフォーマンスをより詳細に監視し、最適化できます。

<Image img={latency_insights} size="lg" alt="データインジェストのパフォーマンス向けレイテンシメトリクスグラフを表示している ClickPipes インターフェース" border />

<br />

*Kafka および Kinesis 向けスケーリング制御（プライベートベータ）*

高いスループット要件を満たすには、データ量やレイテンシ要件に応じて追加リソースが必要になる場合があります。ClickPipes に対して水平方向のスケーリングを導入し、クラウドコンソールから直接利用できるようにしました。この機能は現在プライベートベータで提供されており、要件に基づいてより効果的にリソースをスケールできます。ベータへの参加を希望される場合は、[support](https://clickhouse.com/support/program) までお問い合わせください。

*Kafka および Kinesis 向け Raw メッセージのインジェスト*

Kafka または Kinesis のメッセージ全体をパースせずにそのままインジェストできるようになりました。ClickPipes は `_raw_message` [virtual column](/integrations/clickpipes/kafka/reference/#kafka-virtual-columns) をサポートし、メッセージ全体を 1 つの String カラムにマッピングできます。これにより、必要に応じて Raw データを柔軟に扱うことができます。

## 2024年8月29日 {#august-29-2024}

### 新しい Terraform プロバイダーのバージョン - v1.0.0 {#new-terraform-provider-version---v100}

Terraform を使用すると、ClickHouse Cloud サービスをプログラムから制御し、その構成をコードとして保存できます。当社の Terraform プロバイダーはこれまでに約 200,000 回ダウンロードされており、このたび正式に v1.0.0 となりました。この新バージョンには、より優れたリトライロジックや、ClickHouse Cloud サービスにプライベートエンドポイントをアタッチするための新しいリソースなどの改善が含まれています。[Terraform プロバイダーはこちら](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest)からダウンロードでき、[全変更履歴はこちら](https://github.com/ClickHouse/terraform-provider-clickhouse/releases/tag/v1.0.0)で参照できます。

### 2024年 SOC 2 Type II レポートおよび更新された ISO 27001 認証 {#2024-soc-2-type-ii-report-and-updated-iso-27001-certificate}

2024年の SOC 2 Type II レポートおよび更新された ISO 27001 認証が利用可能になったことをお知らせいたします。これらには、最近 Azure 上でローンチしたサービスに加え、AWS および GCP 上のサービスに対する継続的な対象範囲も含まれます。

SOC 2 Type II は、ClickHouse ユーザーに提供するサービスにおけるセキュリティ、可用性、処理の完全性、機密性を実現するという、当社の継続的な取り組みを示すものです。詳細については、American Institute of Certified Public Accountants (AICPA) による [SOC 2 - SOC for Service Organizations: Trust Services Criteria](https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services) および International Standards Organization (ISO) による [What is ISO/IEC 27001](https://www.iso.org/standard/27001) を参照してください。

また、セキュリティおよびコンプライアンスに関する各種ドキュメントやレポートについては、[Trust Center](https://trust.clickhouse.com/) も併せてご確認ください。

## 2024年8月15日 {#august-15-2024}

### AWS 向けの Compute-compute separation が Private Preview になりました {#compute-compute-separation-is-now-in-private-preview-for-aws}

既存の ClickHouse Cloud サービスでは、レプリカは読み取りと書き込みの両方を処理し、特定のレプリカにどちらか一方の処理のみを担当させるように構成することはできません。まもなく提供予定の新機能である Compute-compute separation を利用すると、特定のサービスを読み取り/書き込みサービスまたは読み取り専用サービスとして指定できるようになり、アプリケーションに最適なコンピュート構成を設計してコストとパフォーマンスを最適化できます。

新しい Compute-compute separation 機能により、同じオブジェクトストレージのフォルダー（つまり同じテーブルやビューなど）を使用しつつ、それぞれに専用のエンドポイントを持つ複数のコンピュートノードグループを作成できます。[Compute-compute separation の詳細はこちら](/cloud/reference/warehouses)を参照してください。この機能の Private Preview へのアクセスをご希望の場合は[サポートまでお問い合わせ](https://clickhouse.com/support/program)ください。

<Image img={cloud_console_2} size="lg" alt="読み書きサービスグループと読み取り専用サービスグループを含む、Compute-compute separation のサンプルアーキテクチャを示した図" border />

### S3 および GCS 向け ClickPipes が GA に、Continuous mode もサポート {#clickpipes-for-s3-and-gcs-now-in-ga-continuous-mode-support}

ClickPipes は、ClickHouse Cloud にデータを取り込む最も簡単な方法です。[ClickPipes](https://clickhouse.com/cloud/clickpipes) の S3 および GCS 向けサポートが **一般提供 (GA)** になったことをお知らせします。ClickPipes は一度きりのバッチ取り込みと「continuous mode」の両方をサポートします。取り込みタスクは、指定したリモートバケットからパターンに一致するすべてのファイルを ClickHouse の宛先テーブルにロードします。「continuous mode」では、ClickPipes のジョブが常時実行され、リモートのオブジェクトストレージバケットに新たに追加される、一致するファイルを到着し次第取り込みます。これにより、任意のオブジェクトストレージバケットを、ClickHouse Cloud へのデータ取り込み用の本格的なステージング領域として利用できるようになります。ClickPipes の詳細については、[ドキュメント](/integrations/clickpipes)を参照してください。

## 2024年7月18日 {#july-18-2024}

### メトリクス用 Prometheus エンドポイントが一般提供になりました {#prometheus-endpoint-for-metrics-is-now-generally-available}

前回のクラウドのチェンジログでは、ClickHouse Cloud から [Prometheus](https://prometheus.io/) メトリクスをエクスポートする機能の Private Preview をお知らせしました。この機能により、[ClickHouse Cloud API](/cloud/manage/api/api-overview) を使ってメトリクスを [Grafana](https://grafana.com/) や [Datadog](https://www.datadoghq.com/) といった可視化ツールに取り込むことができます。この機能が **一般提供 (GA)** になったことをお知らせします。詳しくは[ドキュメント](/integrations/prometheus)をご覧ください。

### Cloud コンソールの Table Inspector {#table-inspector-in-cloud-console}

ClickHouse には、スキーマを確認するためにテーブルをインスペクトできる [`DESCRIBE`](/sql-reference/statements/describe-table) といったコマンドがあります。これらのコマンドはコンソールに出力されますが、テーブルやカラムに関するすべての関連情報を取得するには複数のクエリを組み合わせる必要があり、必ずしも使いやすいとは限りません。

最近、Cloud コンソールに **Table Inspector** を追加し、SQL を記述することなく UI 上で重要なテーブルおよびカラム情報を取得できるようにしました。Cloud コンソールにアクセスすることで、お使いのサービスで Table Inspector を試すことができます。スキーマ、ストレージ、圧縮方式などに関する情報を、1つの統合されたインターフェースで提供します。

<Image img={compute_compute} size="lg" alt="ClickHouse Cloud Table Inspector のインターフェースに、詳細なスキーマおよびストレージ情報が表示されている様子" border />

### 新しい Java Client API {#new-java-client-api}

私たちの [Java Client](https://github.com/ClickHouse/clickhouse-java) は、ClickHouse への接続に最も広く利用されているクライアントの 1 つです。今回、API の再設計や各種パフォーマンス最適化を行い、さらに簡単かつ直感的に使えるようにしました。これらの変更により、Java アプリケーションから ClickHouse へ接続する作業が大幅に容易になります。更新された Java Client の使い方については、この[ブログ記事](https://clickhouse.com/blog/java-client-sequel)で詳しく説明しています。

### 新しい Analyzer がデフォルトで有効化されました {#new-analyzer-is-enabled-by-default}

ここ数年にわたり、私たちはクエリ解析と最適化のための新しい analyzer に取り組んできました。この analyzer はクエリ性能を向上させ、`JOIN` の高速化や効率化を含む、さらなる最適化を行えるようにします。以前は、新しいユーザーがこの機能を利用するには `allow_experimental_analyzer` 設定を有効にする必要がありましたが、この改良された analyzer は、現在では新しい ClickHouse Cloud サービスでデフォルト有効になっています。

今後も多数の最適化を予定しており、analyzer のさらなる改善にご期待ください。

## 2024年6月28日 {#june-28-2024}

### Microsoft Azure 向け ClickHouse Cloud が一般提供となりました {#clickhouse-cloud-for-microsoft-azure-is-now-generally-available}

Microsoft Azure サポートの Beta 版は、[今年5月](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta)に最初のアナウンスを行いました。今回の最新クラウドリリースでは、Azure サポートが Beta から一般提供（GA）へ移行したことをお知らせします。これにより、ClickHouse Cloud は主要な 3 つのクラウドプラットフォームすべて、すなわち AWS、Google Cloud Platform、そして Microsoft Azure で利用可能になりました。

このリリースでは、[Microsoft Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/clickhouse.clickhouse_cloud) を通じたサブスクリプションにも対応しました。サービスはまず、以下のリージョンでサポートされます:
- アメリカ合衆国: West US 3 (アリゾナ)
- アメリカ合衆国: East US 2 (バージニア)
- ヨーロッパ: Germany West Central (フランクフルト)

特定のリージョンでのサポートをご希望の場合は、[お問い合わせ](https://clickhouse.com/support/program)ください。

### Query Insights によるクエリログの可視化 {#query-log-insights}

Cloud コンソールの新しい Query Insights UI により、ClickHouse に組み込まれているクエリログがはるかに使いやすくなりました。ClickHouse の `system.query_log` テーブルは、クエリ最適化、デバッグ、クラスタ全体のヘルスおよびパフォーマンス監視における主要な情報源です。ただし 70 以上のフィールドがあり、1 クエリあたり複数レコードが存在するため、クエリログを読み解くには急な学習曲線があります。この初期バージョンの Query Insights は、クエリのデバッグや最適化パターンを簡素化するための、今後の取り組みに向けた青写真となるものです。この機能は今後も継続的に改善していく予定のため、ぜひフィードバックをお寄せください。皆さまからのご意見を心よりお待ちしています。

<Image img={query_insights} size="lg" alt="ClickHouse Cloud Query Insights UI によるクエリパフォーマンス指標と分析の表示" border />

### メトリクス用 Prometheus エンドポイント（プライベートプレビュー） {#prometheus-endpoint-for-metrics-private-preview}

最も多くご要望を頂いた機能の 1 つとして、ClickHouse Cloud から [Grafana](https://grafana.com/) および [Datadog](https://www.datadoghq.com/) に対して [Prometheus](https://prometheus.io/) メトリクスをエクスポートできるようになりました。Prometheus は、ClickHouse を監視し、カスタムアラートを設定するためのオープンソースソリューションを提供します。お使いの ClickHouse Cloud サービスに対する Prometheus メトリクスへのアクセスは、[ClickHouse Cloud API](/integrations/prometheus) 経由で利用可能です。この機能は現在、プライベートプレビュー段階です。組織向けにこの機能を有効化するには、[サポートチーム](https://clickhouse.com/support/program)までお問い合わせください。

<Image img={prometheus} size="lg" alt="ClickHouse Cloud の Prometheus メトリクスを表示する Grafana ダッシュボード" border />

### その他の機能 {#other-features}

- 頻度、保持期間、スケジュールなどのカスタムバックアップポリシーを構成できる [Configurable backups](/cloud/manage/backups/configurable-backups) が、一般提供（GA）となりました。

## 2024年6月13日 {#june-13-2024}

### Kafka ClickPipes Connector 向けオフセット設定機能（ベータ版） {#configurable-offsets-for-kafka-clickpipes-connector-beta}

最近まで、新しい [Kafka Connector for ClickPipes](/integrations/clickpipes/kafka) をセットアップすると、常に Kafka トピックの先頭からデータを読み込んでいました。このため、履歴データの再処理、新規到着データの監視、あるいは特定のポイントからの再開といったユースケースには十分な柔軟性がありませんでした。

ClickPipes for Kafka に、Kafka トピックからのデータ読み取りに対する柔軟性と制御性を高める新機能が追加されました。データを読み込み始めるオフセットを設定できるようになりました。

利用可能なオプションは次のとおりです:
- From the beginning: Kafka トピックの最初からデータを読み込み始めます。このオプションは、すべての履歴データを再処理する必要があるユーザーに最適です。
- From latest: 最新のオフセットからデータを読み込み始めます。これは、新しいメッセージのみに関心があるユーザーに便利です。
- From a timestamp: 特定のタイムスタンプ以降、またはその時刻に生成されたメッセージからデータを読み込み始めます。この機能により、特定の時点から処理を再開できる、よりきめ細かい制御が可能になります。

<Image img={kafka_config} size="lg" alt="オフセット選択オプションを表示する ClickPipes Kafka コネクタの設定インターフェイス" border />

### サービスを Fast リリースチャネルに登録 {#enroll-services-to-the-fast-release-channel}

Fast リリースチャネルを利用すると、サービスは通常のリリーススケジュールよりも前倒しでアップデートを受け取ることができます。従来、この機能を有効化するにはサポートチームの支援が必要でしたが、今では ClickHouse Cloud コンソールから直接、この機能をサービス向けに有効化できます。**Settings** に移動し、**Enroll in fast releases** をクリックするだけです。これにより、利用可能になり次第、サービスはアップデートを受け取れるようになります。

<Image img={fast_releases} size="lg" alt="Fast リリースへの登録オプションを表示する ClickHouse Cloud の設定ページ" border />

### 横方向スケーリングに対する Terraform サポート {#terraform-support-for-horizontal-scaling}

ClickHouse Cloud は、同一サイズのレプリカをサービスに追加できる [横方向スケーリング](/manage/scaling#how-scaling-works-in-clickhouse-cloud) をサポートしています。横方向スケーリングにより、同時クエリをサポートするためのパフォーマンスおよび並列度が向上します。以前は、レプリカを追加するには ClickHouse Cloud コンソールまたは API を利用する必要がありましたが、今では Terraform を使用してサービスからレプリカを追加・削除できるため、必要に応じて ClickHouse サービスをプログラムからスケールさせることができます。

詳細については [ClickHouse Terraform provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) を参照してください。

## 2024年5月30日 {#may-30-2024}

### クエリをチームメンバーと共有する {#share-queries-with-your-teammates}

SQL クエリを書くと、そのクエリがチーム内の他のメンバーにとっても有用であることがよくあります。これまでは、Slack やメールでクエリを送る必要があり、あなたがクエリを編集しても、チームメンバーがその更新内容を自動的に受け取る方法はありませんでした。

現在、ClickHouse Cloud コンソールからクエリを簡単に共有できるようになりました。クエリエディタから、チーム全体、または特定のチームメンバーとクエリを直接共有できます。また、読み取り専用か書き込み権限かを指定することもできます。新しいクエリ共有機能を試すには、クエリエディタ内の **Share** ボタンをクリックしてください。

<Image img={share_queries} size="lg" alt="ClickHouse Cloud のクエリエディタで、権限オプション付きの共有機能を表示している画面" border />

### ClickHouse Cloud for Microsoft Azure がベータ版になりました {#clickhouse-cloud-for-microsoft-azure-is-now-in-beta}

Microsoft Azure 上で ClickHouse Cloud サービスを作成できるようになりました。すでに多くのお客様が、Private Preview プログラムの一環として、本番環境で Azure 上の ClickHouse Cloud を利用しています。現在では、誰でも Azure 上に自分のサービスを作成できます。AWS や GCP でサポートされているお気に入りの ClickHouse 機能は、Azure でも同様に利用できます。

今後数週間のうちに、Azure 向け ClickHouse Cloud を General Availability として提供開始できる見込みです。詳細については [このブログ記事](https://clickhouse.com/blog/clickhouse-cloud-is-now-on-azure-in-public-beta) を参照するか、ClickHouse Cloud コンソールから Azure を利用して新しいサービスを作成してください。

注記: 現時点では、Azure 向けの **Development** サービスはサポートされていません。

### Cloud コンソール経由で Private Link をセットアップする {#set-up-private-link-via-the-cloud-console}

Private Link 機能を利用すると、トラフィックをパブリックインターネットに出さずに、クラウドプロバイダアカウント内の内部サービスと ClickHouse Cloud サービスを接続でき、コスト削減とセキュリティ強化が可能になります。これまではセットアップが難しく、ClickHouse Cloud API を使用する必要がありました。

現在は、ClickHouse Cloud コンソールから数回クリックするだけでプライベートエンドポイントを設定できます。サービスの **Settings** に移動し、**Security** セクションに進んで **Set up private endpoint** をクリックするだけです。

<Image img={private_endpoint} size="lg" alt="ClickHouse Cloud コンソールのセキュリティ設定で、プライベートエンドポイントのセットアップ画面を表示している画面" border />

## 2024年5月17日 {#may-17-2024}

### ClickPipes（ベータ版）を使用して Amazon Kinesis からデータを取り込む {#ingest-data-from-amazon-kinesis-using-clickpipes-beta}

ClickPipes は、コードを書かずにデータを取り込むために ClickHouse Cloud が提供する専用サービスです。Amazon Kinesis は、データストリームを処理のためにインジェストおよび保存する、AWS のフルマネージドなストリーミングサービスです。多くのご要望をいただいていた統合のひとつである Amazon Kinesis 向け ClickPipes ベータ版をリリースできたことを大変うれしく思います。今後も ClickPipes との統合を拡充していく予定ですので、サポートしてほしいデータソースがあればぜひお知らせください。この機能の詳細は[こちら](https://clickhouse.com/blog/clickpipes-amazon-kinesis)をご覧ください。

ClickPipes 用の新しい Amazon Kinesis 連携は、クラウドコンソールでお試しいただけます。

<Image img={kenesis} size="lg" alt="Amazon Kinesis 連携の設定オプションを表示している ClickPipes インターフェイス" border />

### 設定可能なバックアップ（プライベートプレビュー） {#configurable-backups-private-preview}

バックアップはどれだけ信頼性が高くてもあらゆるデータベースにとって重要であり、ClickHouse Cloud では当初からバックアップを非常に重視してきました。今週、サービスのバックアップをこれまでより柔軟に制御できる「Configurable Backups（設定可能なバックアップ）」をリリースしました。これにより、開始時間、保持期間、実行頻度を制御できるようになりました。この機能は **Production** および **Dedicated** サービスで利用可能で、**Development** サービスでは利用できません。この機能は現在プライベートプレビューのため、ご自身のサービスで有効化するには support@clickhouse.com までお問い合わせください。設定可能なバックアップの詳細は[こちら](https://clickhouse.com/blog/configurable-backups-in-clickhouse-cloud)をご覧ください。

### SQL クエリから API を作成（ベータ版） {#create-apis-from-your-sql-queries-beta}

ClickHouse 向けに SQL クエリを書いた後、そのクエリをアプリケーションから利用できるようにするには、ドライバーを介して ClickHouse に接続する必要があります。今回新たに提供する **Query Endpoints** 機能により、追加の設定なしに API から直接 SQL クエリを実行できるようになりました。クエリエンドポイントのレスポンス形式として、JSON、CSV、または TSV を指定できます。クラウドコンソールの「Share」ボタンをクリックして、この新機能をお使いのクエリでお試しください。Query Endpoints の詳細は[こちら](https://clickhouse.com/blog/automatic-query-endpoints)をご覧ください。

<Image img={query_endpoints} size="lg" alt="出力フォーマットオプション付きの Query Endpoints 設定を表示している ClickHouse Cloud インターフェイス" border />

### 公式 ClickHouse 認定が利用可能になりました {#official-clickhouse-certification-is-now-available}

ClickHouse Develop トレーニングコースには、無料のトレーニングモジュールが 12 個含まれています。しかし今週まで、ClickHouse に関する習熟度を公式に証明する方法はありませんでした。今回、新たに **ClickHouse Certified Developer** になるための公式試験をリリースしました。この試験に合格することで、データのインジェスト、モデリング、分析、パフォーマンス最適化などを含む ClickHouse に関する習熟度を、現在および将来の雇用主と共有できるようになります。試験は[こちら](https://clickhouse.com/learn/certification)から受験でき、ClickHouse 認定の詳細は[こちらのブログ記事](https://clickhouse.com/blog/first-official-clickhouse-certification)からご覧いただけます。

## 2024年4月25日 {#april-25-2024}

### ClickPipes を使用して S3 と GCS からデータを読み込む {#load-data-from-s3-and-gcs-using-clickpipes}

新しくリリースされたクラウドコンソールで、「Data sources（データソース）」という新しいセクションにお気づきかもしれません。この「Data sources」ページは ClickPipes をバックエンドとしており、ClickHouse Cloud のネイティブ機能として、さまざまなソースから ClickHouse Cloud へ簡単にデータを取り込めます。

最新の ClickPipes アップデートでは、Amazon S3 と Google Cloud Storage からデータを直接アップロードできるようになりました。従来どおり組み込みのテーブル関数を使用することもできますが、ClickPipes は UI 経由で利用できるフルマネージドサービスであり、S3 および GCS からのデータを数クリックで取り込むことができます。この機能はまだ Private Preview 段階ですが、クラウドコンソールからすぐにお試しいただけます。

<Image img={s3_gcs} size="lg" alt="S3 および GCS バケットからデータを読み込むための設定オプションを表示している ClickPipes インターフェース" border />

### Fivetran を使って 500 以上のソースから ClickHouse Cloud にデータをロードする {#use-fivetran-to-load-data-from-500-sources-into-clickhouse-cloud}

ClickHouse は大規模なデータセットに対して高速にクエリを実行できますが、もちろんその前にデータが ClickHouse に取り込まれている必要があります。Fivetran の幅広いコネクタ群により、500 を超えるソースからデータを迅速にロードできるようになりました。Zendesk や Slack、その他お好みのアプリケーションからデータをロードする必要がある場合でも、Fivetran 向けの新しい ClickHouse 宛先を使用することで、アプリケーションデータのターゲットデータベースとして ClickHouse を利用できます。

これは、当社の Integrations チームが数か月にわたる多大な労力をかけて構築したオープンソースのインテグレーションです。[リリースブログ記事](https://clickhouse.com/blog/fivetran-destination-clickhouse-cloud)と [GitHub リポジトリ](https://github.com/ClickHouse/clickhouse-fivetran-destination)をぜひご覧ください。

### その他の変更 {#other-changes}

**コンソールの変更**

- SQL コンソールでの出力フォーマットのサポート

**インテグレーションの変更**

- ClickPipes Kafka コネクタでマルチブローカー構成をサポート
- Power BI コネクタで ODBC ドライバー設定オプションの指定をサポート

## 2024年4月18日 {#april-18-2024}

### ClickHouse Cloud で AWS 東京リージョンが利用可能になりました {#aws-tokyo-region-is-now-available-for-clickhouse-cloud}

このリリースでは、ClickHouse Cloud に新しい AWS 東京リージョン（`ap-northeast-1`）を追加しました。ClickHouse を最速のデータベースにするため、各クラウドで可能な限りレイテンシーを低減できるよう、対応リージョンを継続的に拡大しています。更新された Cloud コンソールから、東京リージョンに新しいサービスを作成できます。

<Image img={tokyo} size="lg" alt="東京リージョンの選択が表示された ClickHouse Cloud のサービス作成画面" border />

その他の変更点:

### コンソールの変更点 {#console-changes}

- Kafka 向け ClickPipes での Avro フォーマット対応が一般提供（GA）になりました
- Terraform プロバイダーにおいて、リソース（サービスおよびプライベートエンドポイント）のインポートを完全にサポートしました

### インテグレーションの変更点 {#integrations-changes}

- Node.js クライアントのメジャー安定版リリース: クエリおよび ResultSet 向けの高度な TypeScript サポート、URL 設定のサポート
- Kafka Connector: DLQ への書き込み時に例外を無視してしまう不具合を修正、Avro Enum 型のサポートを追加、[MSK](https://www.youtube.com/watch?v=6lKI_WlQ3-s) および [Confluent Cloud](https://www.youtube.com/watch?v=SQAiPVbd3gg) 上でコネクタを利用するためのガイドを公開
- Grafana: UI における Nullable 型のサポートを修正し、動的な OTel トレーステーブル名のサポートを修正
- DBT: カスタム materialization 向けのモデル設定を修正
- Java クライアント: エラーコードのパースが誤っていたバグを修正
- Python クライアント: 数値型のパラメータバインディングを修正し、クエリバインディングにおける数値リスト関連のバグを修正、SQLAlchemy の Point サポートを追加

## 2024年4月4日 {#april-4-2024}

### 新しい ClickHouse Cloud コンソールのご紹介 {#introducing-the-new-clickhouse-cloud-console}

このリリースでは、新しいクラウドコンソールのプライベートプレビューを提供します。

ClickHouse では、開発者エクスペリエンスをどのように改善できるかを常に考えています。最速のリアルタイム・データウェアハウスを提供するだけでは不十分であり、同時に使いやすく、管理しやすいものである必要があると認識しています。

数千人の ClickHouse Cloud ユーザーが、毎月 SQL コンソール上で数十億件のクエリを実行しています。そのため、ClickHouse Cloud サービスをこれまでになく簡単に操作できる世界水準のコンソールに投資することを決定しました。新しいクラウドコンソールでは、スタンドアロンの SQL エディタと管理コンソールを、直感的な単一の UI に統合しています。

一部のお客様には、新しいクラウドコンソール体験のプレビューをご提供します。これは、ClickHouse のデータを探索・管理するための、統合された没入型の新しい方法です。優先的なアクセスをご希望の場合は、support@clickhouse.com までお問い合わせください。

<Image img={cloud_console} size="lg" alt="統合された SQL エディタと管理機能を備えた、新しい ClickHouse Cloud コンソールインターフェースを示すアニメーション" border />

## 2024年3月28日 {#march-28-2024}

このリリースでは、Microsoft Azure のサポート、API を介した水平スケーリング、およびプライベートプレビューでのリリースチャネルを導入しました。

### 全般的な更新 {#general-updates}

- プライベートプレビューとして Microsoft Azure のサポートを導入しました。アクセス権を取得するには、アカウント管理担当またはサポートにお問い合わせいただくか、[ウェイトリスト](https://clickhouse.com/cloud/azure-waitlist)にご登録ください。
- リリースチャネルを導入しました。これは、環境タイプに基づいてアップグレードのタイミングを指定できる機能です。本リリースでは「fast」リリースチャネルを追加しており、本番環境に先立って非本番環境をアップグレードできるようになりました（有効化するにはサポートにお問い合わせください）。

### 管理に関する変更 {#administration-changes}

- API を介した水平スケーリング構成のサポートを追加しました（プライベートプレビュー。有効化するにはサポートにお問い合わせください）
- 起動時にメモリ不足エラーが発生しているサービスをスケールアップするようにオートスケーリングを改善しました
- Terraform プロバイダー経由で AWS 向け CMEK のサポートを追加しました

### コンソールに関する変更 {#console-changes-1}

- Microsoft ソーシャルログインのサポートを追加しました
- SQL コンソールでパラメータ化クエリの共有機能を追加しました
- クエリエディタのパフォーマンスを大幅に改善しました（一部の EU リージョンでレイテンシーを 5 秒から 1.5 秒に短縮）

### インテグレーションに関する変更 {#integrations-changes-1}

- ClickHouse OpenTelemetry exporter: ClickHouse レプリケーションテーブルエンジンの[サポートを追加](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31920)し、[インテグレーションテストを追加](https://github.com/open-telemetry/opentelemetry-collector-contrib/pull/31896)しました
- ClickHouse DBT adapter: [辞書向けマテリアライゼーションマクロ](https://github.com/ClickHouse/dbt-clickhouse/pull/255)、[TTL 式サポート用のテスト](https://github.com/ClickHouse/dbt-clickhouse/pull/254)のサポートを追加しました
- ClickHouse Kafka Connect Sink: Kafka プラグイン検出との[互換性を追加](https://github.com/ClickHouse/clickhouse-kafka-connect/issues/350)しました（コミュニティからの貢献）
- ClickHouse Java Client: 新しいクライアント API 向けの[新しいパッケージ](https://github.com/ClickHouse/clickhouse-java/pull/1574)を導入し、ClickHouse Cloud テスト向けの[テストカバレッジを追加](https://github.com/ClickHouse/clickhouse-java/pull/1575)しました
- ClickHouse NodeJS Client: 新しい HTTP keep-alive 動作に関するテストとドキュメントを拡充しました。v0.3.0 リリース以降で利用可能です
- ClickHouse Golang Client: Map のキーとしての Enum に関する[バグを修正](https://github.com/ClickHouse/clickhouse-go/pull/1236)し、エラーになった接続がコネクションプール内に残る[バグを修正](https://github.com/ClickHouse/clickhouse-go/pull/1237)しました（コミュニティからの貢献）
- ClickHouse Python Client: PyArrow を使用したクエリストリーミングの[サポートを追加](https://github.com/ClickHouse/clickhouse-connect/issues/155)しました（コミュニティからの貢献）

### セキュリティ更新 {#security-updates}

- ClickHouse Cloud を更新し、["Role-based Access Control is bypassed when query caching is enabled"](https://github.com/ClickHouse/ClickHouse/security/advisories/GHSA-45h5-f7g3-gr8r)（CVE-2024-22412）が発生しないようにしました

## 2024年3月14日 {#march-14-2024}

このリリースでは、新しい Cloud コンソールエクスペリエンス、S3 および GCS からの一括ロード用 ClickPipes、Kafka 向け ClickPipes における Avro 形式サポートを早期アクセスとして提供します。また、ClickHouse データベースのバージョンを 24.1 にアップグレードし、新しい関数の追加に加え、パフォーマンスおよびリソース使用の最適化を行っています。

### コンソールの変更点 {#console-changes-2}

- 新しい Cloud コンソールエクスペリエンスが早期アクセスで利用可能です（ご参加に関心がある場合はサポートまでご連絡ください）。
- S3 および GCS からの一括ロード用 ClickPipes が早期アクセスで利用可能です（ご参加に関心がある場合はサポートまでご連絡ください）。
- Kafka 向け ClickPipes における Avro 形式のサポートが早期アクセスで利用可能です（ご参加に関心がある場合はサポートまでご連絡ください）。

### ClickHouse バージョンのアップグレード {#clickhouse-version-upgrade}

- FINAL の最適化、ベクトル化の改善、高速な集計 — 詳細は [23.12 リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final) を参照してください。
- Punycode 処理、文字列類似度、外れ値検出用の新しい関数に加え、マージおよび Keeper 向けのメモリ最適化 — 詳細は [24.1 リリースブログ](https://clickhouse.com/blog/clickhouse-release-24-01) および [プレゼンテーション](https://presentations.clickhouse.com/release_24.1/) を参照してください。
- この ClickHouse Cloud バージョンは 24.1 をベースとしており、多数の新機能、パフォーマンス改善、バグ修正が含まれています。詳細はコアデータベースの [変更履歴](/whats-new/changelog/2023#2312) を参照してください。

### 連携機能の変更点 {#integrations-changes-2}

- Grafana: v4 におけるダッシュボード移行およびアドホックフィルタリングロジックを修正
- Tableau Connector: `DATENAME` 関数および "real" 引数に対する丸め処理を修正
- Kafka Connector: 接続初期化時の NPE を修正し、JDBC ドライバーオプションを指定できる機能を追加
- Golang クライアント: レスポンス処理時のメモリ使用量を削減し、`Date32` の極値を修正、圧縮有効時のエラー報告を修正
- Python クライアント: datetime パラメータにおけるタイムゾーンサポートを改善し、Pandas DataFrame に対するパフォーマンスを改善

## 2024年2月29日 {#february-29-2024}

このリリースでは、SQL コンソールアプリケーションの読み込み時間を改善し、ClickPipes での SCRAM-SHA-256 認証サポートを追加し、Kafka Connect に対するネスト構造のサポートを拡張しました。

### コンソールの変更点 {#console-changes-3}

- SQL コンソールアプリケーションの初回読み込み時間を最適化
- SQL コンソールのレースコンディションにより `authentication failed` エラーが発生していた問題を修正
- 直近のメモリ割り当て値が誤って表示される場合があった監視ページでの動作を修正
- SQL コンソールが重複した KILL QUERY コマンドを発行してしまう場合があった不具合を修正
- Kafka ベースのデータソースに対する SCRAM-SHA-256 認証方式のサポートを ClickPipes に追加

### インテグレーションの変更点 {#integrations-changes-3}

- Kafka Connector: 複雑なネスト構造（Array, Map）のサポートを拡張し、FixedString 型のサポートを追加、複数データベースへのインジェストをサポート
- Metabase: ClickHouse バージョン 23.8 未満との非互換性を修正
- DBT: モデル作成時に設定値を渡せる機能を追加
- Node.js クライアント: 長時間実行クエリ（>1時間）のサポートを追加し、空値の扱いを改善

## 2024年2月15日 {#february-15-2024}

このリリースでは、コア・データベースのバージョンをアップグレードし、Terraform を使用したプライベートリンクのセットアップ機能を追加するとともに、Kafka Connect を介した非同期挿入に対する「exactly once」セマンティクスのサポートを追加しました。

### ClickHouse バージョンのアップグレード {#clickhouse-version-upgrade-1}

- S3 からの継続的かつスケジュールされたデータロード用の S3Queue テーブルエンジンが本番利用可能になりました。詳細は [23.11 リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-11) を参照してください。
- FINAL の大幅なパフォーマンス改善および SIMD 命令のベクトル化改善により、クエリが高速化されています。詳細は [23.12 リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-12#optimizations-for-final) を参照してください。
- この ClickHouse Cloud のバージョンは 23.12 をベースとしており、多数の新機能、パフォーマンス改善、バグ修正が含まれています。詳細は [コアデータベースの変更履歴](/whats-new/changelog/2023#2312) を参照してください。

### コンソールの変更点 {#console-changes-4}

- Terraform Provider を通じて AWS PrivateLink および GCP Private Service Connect をセットアップできる機能を追加
- リモートファイルからのデータインポートの耐障害性を改善
- すべてのデータインポートにインポートステータスの詳細パネル（フライアウト）を追加
- S3 データインポートでアクセスキー / シークレットキー認証情報のサポートを追加

### 連携機能の変更点 {#integrations-changes-4}

* Kafka Connect
  * `async_insert` による exactly once セマンティクスをサポート（デフォルトでは無効）
* Golang クライアント
  * DateTime バインディングを修正
  * バッチ挿入パフォーマンスを改善
* Java クライアント
  * リクエスト圧縮に関する問題を修正

### 設定の変更点 {#settings-changes}

* `use_mysql_types_in_show_columns` は不要になりました。MySQL インターフェイス経由で接続した場合、自動的に有効になります。
* `async_insert_max_data_size` のデフォルト値は `10 MiB` になりました。

## 2024年2月2日 {#february-2-2024}

このリリースでは、Azure Event Hub 向けの ClickPipes が利用可能になり、v4 ClickHouse Grafana コネクタによってログおよびトレースのナビゲーション ワークフローが大幅に改善され、さらに Flyway と Atlas のデータベーススキーマ管理ツールのサポートが初登場しました。

### Console の変更点 {#console-changes-5}

* Azure Event Hub 向け ClickPipes のサポートを追加
* 新しいサービスは、デフォルトのアイドル時間 15 分で起動されるようになりました

### Integrations の変更点 {#integrations-changes-5}

* [Grafana 向け ClickHouse データソース](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/) v4 をリリース
  * Table、Logs、Time Series、Traces 用の専用エディタを備えるよう、クエリビルダーを全面的に再構築
  * より複雑かつ動的なクエリをサポートするため、SQL ジェネレーターを全面的に再構築
  * Logs および Traces ビューで OpenTelemetry の第一級サポートを追加
  * Logs および Traces 用のデフォルトテーブルおよびカラムを指定できるよう、設定を拡張
  * カスタム HTTP ヘッダーを指定する機能を追加
  * その他多数の改善については、完全な [変更履歴](https://github.com/grafana/clickhouse-datasource/blob/main/CHANGELOG.md#400)を参照してください
* データベーススキーマ管理ツール
  * [Flyway に ClickHouse サポートを追加](https://github.com/flyway/flyway-community-db-support/packages/2037428)
  * [Ariga Atlas に ClickHouse サポートを追加](https://atlasgo.io/blog/2023/12/19/atlas-v-0-16#clickhouse-beta-program)
* Kafka Connector Sink
  * デフォルト値を持つテーブルへのインジェスト処理を最適化
  * DateTime64 における文字列ベースの日付のサポートを追加
* Metabase
  * 複数データベースへの接続のサポートを追加

## January 18, 2024 {#january-18-2024}

このリリースでは、AWS に新しいリージョン（London / eu-west-2）が追加され、Redpanda、Upstash、Warpstream 向けの ClickPipes サポートが追加され、[is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted) コアデータベース機能の信頼性が向上しました。

### General changes {#general-changes}

- 新しい AWS リージョン: London (eu-west-2)

### Console changes {#console-changes-6}

- Redpanda、Upstash、Warpstream 向けの ClickPipes サポートを追加
- ClickPipes の認証方式を UI から設定可能に変更

### Integrations changes {#integrations-changes-6}

- Java クライアント:
  - 互換性を破る変更: 呼び出し時に任意の URL ハンドルを指定する機能を削除しました。この機能は ClickHouse から削除されました
  - 非推奨: Java CLI クライアントおよび GRPC パッケージ
  - ClickHouse インスタンスへの負荷とバッチサイズを削減するために RowBinaryWithDefaults フォーマットのサポートを追加（Exabeam からの要望）
  - Date32 および DateTime64 の範囲境界を ClickHouse と互換にし、Spark の Array string 型との互換性を改善し、ノード選択メカニズムも改善
- Kafka Connector: Grafana 向けの JMX 監視ダッシュボードを追加
- PowerBI: ODBC ドライバー設定を UI から構成可能に変更
- JavaScript クライアント: クエリのサマリー情報を公開し、挿入時に特定カラムのサブセットを指定できるようにし、Web クライアント向けに `keep_alive` を設定可能に変更
- Python クライアント: SQLAlchemy 向けに Nothing 型のサポートを追加

### Reliability changes {#reliability-changes}

- ユーザー向け後方互換性のない変更: 以前は、特定の条件下で 2 つの機能（[is_deleted](/engines/table-engines/mergetree-family/replacingmergetree#is_deleted) と ``OPTIMIZE CLEANUP``）が ClickHouse 内のデータ破損を引き起こす可能性がありました。ユーザーのデータの完全性を保護しつつ、機能の中核を維持するために、この機能の動作を調整しました。具体的には、MergeTree 設定 ``clean_deleted_rows`` は非推奨となり、もはや効果を持ちません。``CLEANUP`` キーワードはデフォルトでは許可されません（使用するには ``allow_experimental_replacing_merge_with_cleanup`` を有効にする必要があります）。``CLEANUP`` を使用する場合は、常に ``FINAL`` と一緒に使用しなければならず、``OPTIMIZE FINAL CLEANUP`` を実行した後に、古いバージョンを持つ行が挿入されないことを保証する必要があります。

## 2023年12月18日 {#december-18-2023}

このリリースでは、GCP の新リージョン（us-east1）、セキュアなエンドポイント接続をセルフサービスで設定できる機能、DBT 1.7 を含む追加のインテグレーション対応、ならびに多数のバグ修正とセキュリティ強化を提供します。

### 全般的な変更 {#general-changes-1}

- ClickHouse Cloud が GCP us-east1（サウスカロライナ）リージョンで利用可能になりました
- OpenAPI 経由で AWS Private Link および GCP Private Service Connect を設定可能になりました

### コンソールの変更 {#console-changes-7}

- Developer ロールのユーザー向けに、SQL コンソールへのシームレスなログインを有効化
- オンボーディング時にアイドル状態制御を設定するワークフローを改善

### インテグレーションの変更 {#integrations-changes-7}

- DBT コネクタ: DBT v1.7 までのサポートを追加
- Metabase: Metabase v0.48 のサポートを追加
- Power BI コネクタ: Power BI Cloud 上での実行をサポート
- ClickPipes 用内部ユーザーの権限を設定可能に変更
- Kafka Connect
  - 重複排除ロジックと Nullable 型のインジェストを改善
  - テキストベースフォーマット（CSV、TSV）のサポートを追加
- Apache Beam: Boolean 型および LowCardinality 型のサポートを追加
- Node.js クライアント: Parquet フォーマットのサポートを追加

### セキュリティに関するお知らせ {#security-announcements}

- 3 件のセキュリティ脆弱性を修正しました。詳細は [security changelog](/whats-new/security-changelog) を参照してください：
  - CVE-2023-47118（CVSS 7.0）- デフォルトで 9000/tcp ポート上で動作するネイティブインターフェイスに影響するヒープバッファオーバーフローの脆弱性
  - CVE-2023-48704（CVSS 7.0）- デフォルトで 9000/tcp ポート上で動作するネイティブインターフェイスに影響するヒープバッファオーバーフローの脆弱性
  - CVE-2023-48298（CVSS 5.9）- FPC 圧縮コーデックにおける整数アンダーフローの脆弱性

## 2023年11月22日 {#november-22-2023}

このリリースでは、コアデータベースのバージョンをアップグレードし、ログインおよび認証フローを改善し、Kafka Connect Sink にプロキシ対応を追加しました。

### ClickHouse バージョンのアップグレード {#clickhouse-version-upgrade-2}

- Parquet ファイル読み込みのパフォーマンスを大幅に改善しました。詳細は [23.8 リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-08) を参照してください。
- JSON に対する型推論のサポートを追加しました。詳細は [23.9 リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-09) を参照してください。
- `ArrayFold` など、アナリスト向けの強力な関数を導入しました。詳細は [23.10 リリースブログ](https://clickhouse.com/blog/clickhouse-release-23-10) を参照してください。
- **ユーザー向けの後方互換性のない変更**: JSON フォーマットで文字列から数値を推論しないようにするため、設定 `input_format_json_try_infer_numbers_from_strings` をデフォルトで無効化しました。これにより、サンプルデータに数値に似た文字列が含まれている場合に発生しうるパースエラーを防止します。
- その他にも多数の新機能、パフォーマンス改善、バグ修正を行いました。詳細は [コアデータベースの変更履歴](/whats-new/changelog) を参照してください。

### Console の変更点 {#console-changes-8}

- ログインおよび認証フローを改善しました。
- 大規模なスキーマをより適切にサポートできるよう、AI ベースのクエリ候補機能を改善しました。

### Integrations の変更点 {#integrations-changes-8}

- Kafka Connect Sink: プロキシ対応、`topic-tablename` マッピング、および Keeper の _exactly-once_ 配信プロパティの設定機能を追加しました。
- Node.js クライアント: Parquet フォーマットのサポートを追加しました。
- Metabase: `datetimeDiff` 関数のサポートを追加しました。
- Python クライアント: カラム名における特殊文字のサポートを追加しました。タイムゾーンパラメータのバインディングを修正しました。

## 2023年11月2日 {#november-2-2023}

このリリースでは、アジアにおける開発サービスのリージョン対応を拡充し、お客様管理の暗号鍵に対するキー・ローテーション機能を導入しました。また、請求コンソールでの税設定の粒度を改善し、サポート対象の各言語クライアントに対して複数のバグ修正を行いました。

### 一般的な更新 {#general-updates-1}

- 開発サービスが AWS の `ap-south-1`（ムンバイ）および `ap-southeast-1`（シンガポール）で利用可能になりました
- お客様管理の暗号鍵（CMEK）におけるキー・ローテーションをサポートしました

### コンソールの変更点 {#console-changes-9}

- クレジットカード追加時に、よりきめ細かな税設定を行えるようになりました

### インテグレーションの変更点 {#integrations-changes-9}

- MySQL
  - MySQL 経由での Tableau Online および QuickSight のサポートを改善しました
- Kafka Connector
  - テキストベース形式（CSV、TSV）をサポートする新しい StringConverter を導入しました
  - Bytes および Decimal データ型をサポートしました
  - Retryable Exceptions を調整し、`errors.tolerance=all` の場合でも常に再試行されるようにしました
- Node.js クライアント
  - ストリーミングされる大規模データセットで結果が破損する問題を修正しました
- Python クライアント
  - 大規模な挿入処理時のタイムアウトを修正しました
  - NumPy/Pandas の Date32 に関する問題を修正しました
- Golang クライアント
  - 空のマップを JSON カラムへ挿入する際の問題、圧縮バッファのクリーンアップ、クエリのエスケープ、IPv4/IPv6 でのゼロ／nil による panic の問題を修正しました
  - キャンセルされた挿入処理に対するウォッチドッグを追加しました
- DBT
  - テストを伴う分散テーブルのサポートを改善しました

## 2023年10月19日 {#october-19-2023}

このリリースでは、SQL コンソールのユーザビリティとパフォーマンスの改善、Metabase コネクタにおける IP データ型のハンドリング改善、Java および Node.js クライアントでの新機能が追加されています。

### コンソールの変更点 {#console-changes-10}

- SQL コンソールの使いやすさを改善（例: クエリ実行間で列幅を保持）
- SQL コンソールのパフォーマンスを改善

### 連携機能の変更点 {#integrations-changes-10}

- Java クライアント:
  - パフォーマンス向上と既存接続の再利用のため、デフォルトのネットワークライブラリを変更
  - プロキシのサポートを追加
  - Trust Store を使用したセキュア接続のサポートを追加
- Node.js クライアント: `INSERT` クエリに対する keep-alive の挙動を修正
- Metabase: IPv4/IPv6 カラムのシリアル化を修正

## 2023年9月28日 {#september-28-2023}

このリリースでは、Kafka、Confluent Cloud、Amazon MSK 向けの ClickPipes と Kafka Connect ClickHouse Sink の一般提供、IAM ロールを使用して Amazon S3 へのアクセスを保護するセルフサービス型ワークフロー、そして AI 支援クエリサジェスト（プライベートプレビュー）を提供します。

### Console の変更点 {#console-changes-11}

- [IAM ロールを使用した Amazon S3 へのアクセスの保護](/cloud/data-sources/secure-s3) のためのセルフサービス型ワークフローを追加
- プライベートプレビューとして AI 支援クエリサジェストを導入（お試しになる場合は [ClickHouse Cloud サポート](https://console.clickhouse.cloud/support) までお問い合わせください）

### Integrations の変更点 {#integrations-changes-11}

- Kafka、Confluent Cloud、Amazon MSK 向けの、ターンキー型データインジェストサービスである ClickPipes の一般提供を発表（[リリースブログ](https://clickhouse.com/blog/clickpipes-is-generally-available) を参照）
- Kafka Connect ClickHouse Sink の一般提供を開始
  - `clickhouse.settings` プロパティを使用したカスタマイズ可能な ClickHouse 設定のサポートを拡張
  - 動的フィールドを考慮できるよう重複排除の挙動を改善
  - ClickHouse からテーブルの変更を再取得するための `tableRefreshInterval` のサポートを追加
- [Power BI](/integrations/powerbi) と ClickHouse データ型間の SSL 接続の問題およびデータ型マッピングを修正

## 2023年9月7日 {#september-7-2023}

このリリースには、PowerBI Desktop 向け公式コネクタのベータ版、インド向けクレジットカード支払い処理の改善、およびサポート対象の各種言語クライアントに対する多数の改善が含まれます。

### Console の変更点 {#console-changes-12}

- インドからの請求に対応するため、残りクレジットおよび支払い再試行回数の表示を追加

### Integrations の変更点 {#integrations-changes-12}

- Kafka Connector: ClickHouse 設定の構成をサポートし、`error.tolerance` 設定オプションを追加
- PowerBI Desktop: 公式コネクタのベータ版をリリース
- Grafana: Point geo 型のサポートを追加し、Data Analyst ダッシュボードの Panels を修正、`timeInterval` マクロを修正
- Python クライアント: Pandas 2.1.0 と互換性を持つようにし、Python 3.7 のサポートを終了、nullable JSON 型のサポートを追加
- Node.js クライアント: `default_format` 設定のサポートを追加
- Golang クライアント: `bool` 型の処理を修正し、文字列長の制限を削除

## 2023年8月24日 {#aug-24-2023}

このリリースでは、ClickHouse データベースの MySQL インターフェースのサポートを追加し、新しい公式 PowerBI コネクタを導入し、クラウドコンソールに新しい「Running Queries」ビューを追加し、ClickHouse のバージョンを 23.7 に更新しました。

### 全般的な更新 {#general-updates-2}

- [MySQL wire protocol](/interfaces/mysql) のサポートを追加しました。これにより（その他のユースケースに加えて）、多くの既存の BI ツールとの互換性が得られます。この機能を組織で有効にするには、サポートチームまでお問い合わせください。
- 新しい公式 PowerBI コネクタを導入しました

### コンソールの変更 {#console-changes-13}

- SQL コンソールに「Running Queries」ビューのサポートを追加しました

### ClickHouse 23.7 へのバージョンアップグレード {#clickhouse-237-version-upgrade}

- Azure Table 関数のサポートを追加し、ジオ空間データ型を本番運用レベルに昇格させ、JOIN のパフォーマンスを改善しました。詳細は 23.5 リリースの[ブログ](https://clickhouse.com/blog/clickhouse-release-23-05)を参照してください
- MongoDB 連携のサポートをバージョン 6.0 まで拡張しました。詳細は 23.6 リリースの[ブログ](https://clickhouse.com/blog/clickhouse-release-23-06)を参照してください
- Parquet 形式への書き込みパフォーマンスを 6 倍に高速化し、PRQL クエリ言語のサポートを追加し、SQL 互換性を向上させました。詳細は 23.7 リリースの[資料](https://presentations.clickhouse.com/release_23.7/)を参照してください
- 多数の新機能、パフォーマンス改善、およびバグ修正を行いました。詳細は 23.5、23.6、23.7 の[チェンジログ](/whats-new/changelog)を参照してください

### 連携機能の変更 {#integrations-changes-13}

- Kafka Connector: Avro の Date および Time 型のサポートを追加しました
- JavaScript client: Web ベースの環境向けの安定版をリリースしました
- Grafana: フィルターロジックとデータベース名の扱いを改善し、サブ秒精度の TimeInteval をサポートしました
- Golang Client: 複数のバッチおよび非同期データロードの問題を修正しました
- Metabase: v0.47 をサポートし、接続インパーソネーション機能を追加し、データ型マッピングを修正しました

## 2023年7月27日 {#july-27-2023}

このリリースには、Kafka 向け ClickPipes のプライベートプレビュー、新しいデータ読み込みエクスペリエンス、そしてクラウドコンソールを使用して URL からファイルを読み込む機能が含まれます。

### インテグレーションの変更点 {#integrations-changes-14}

- Kafka 向けの [ClickPipes](https://clickhouse.com/cloud/clickpipes) のプライベートプレビューを導入しました。これは、Kafka や Confluent Cloud から膨大な量のデータを、数回クリックするだけで取り込むことができるクラウドネイティブなインテグレーションエンジンです。ウェイトリストへの登録は[こちら](https://clickhouse.com/cloud/clickpipes#joinwaitlist)から行ってください。
- JavaScript クライアント: Web ベースの環境（ブラウザ、Cloudflare Workers）をサポートしました。コミュニティがカスタム環境向けのコネクタを作成できるよう、コードをリファクタリングしました。
- Kafka Connector: Timestamp および Time の Kafka 型に対するインラインスキーマをサポートしました。
- Python クライアント: 挿入時の圧縮と LowCardinality 読み取りに関する問題を修正しました。

### コンソールの変更点 {#console-changes-14}

- より多くのテーブル作成設定オプションを備えた、新しいデータ読み込みエクスペリエンスを追加しました。
- クラウドコンソールを使用して、URL からファイルを読み込む機能を導入しました。
- 別の組織に参加するための追加オプションや、保留中の招待をすべて確認できる機能を追加し、招待プロセスを改善しました。

## 2023年7月14日 {#july-14-2023}

このリリースでは、Dedicated Services を立ち上げる機能、オーストラリアの新しい AWS リージョン、およびディスク上のデータ暗号化にお客様管理のキーを使用できる機能が追加されました。

### 一般的な更新 {#general-updates-3}

- 新しい AWS オーストラリア リージョン: シドニー (ap-southeast-2)
- レイテンシに敏感な高負荷ワークロード向けの Dedicated ティアサービス（セットアップするには [support](https://console.clickhouse.cloud/support) までお問い合わせください）
- ディスク上のデータ暗号化用のお客様管理キー（Bring Your Own Key, BYOK）（セットアップするには [support](https://console.clickhouse.cloud/support) までお問い合わせください）

### Console の変更点 {#console-changes-15}

- 非同期インサート向けのオブザーバビリティメトリクスダッシュボードを改善
- サポートとの連携におけるチャットボットの挙動を改善

### Integrations の変更点 {#integrations-changes-15}

- NodeJS クライアント: ソケットタイムアウトによる接続失敗のバグを修正
- Python クライアント: インサートクエリに QuerySummary を追加し、データベース名で特殊文字をサポート
- Metabase: JDBC ドライバーのバージョンを更新し、DateTime64 のサポートを追加、パフォーマンスを改善

### コアデータベースの変更点 {#core-database-changes}

- [Query cache](/operations/query-cache) を ClickHouse Cloud で有効化できるようになりました。有効化すると、成功したクエリはデフォルトで 1 分間キャッシュされ、後続のクエリはキャッシュされた結果を利用します。

## 2023年6月20日 {#june-20-2023}

このリリースでは、GCP 上の ClickHouse Cloud が一般提供となり、Cloud API 向けの Terraform プロバイダが追加され、ClickHouse のバージョンが 23.4 に更新されました。

### 全般的な更新 {#general-updates-4}

- GCP 上の ClickHouse Cloud が GA となり、GCP Marketplace との連携、Private Service Connect のサポート、自動バックアップを提供します（詳細は [ブログ](https://clickhouse.com/blog/clickhouse-cloud-on-google-cloud-platform-gcp-is-generally-available) と [プレスリリース](https://clickhouse.com/blog/clickhouse-cloud-expands-choice-with-launch-on-google-cloud-platform) を参照してください）
- Cloud API 向けの [Terraform provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) が利用可能になりました

### コンソールの変更 {#console-changes-16}

- サービス向けの新しい統合設定ページを追加しました
- ストレージおよびコンピュートの計測精度を調整しました

### 連携機能の変更 {#integrations-changes-16}

- Python クライアント: INSERT パフォーマンスを改善し、マルチプロセッシングをサポートするよう内部依存関係をリファクタリングしました
- Kafka Connector: Confluent Cloud にアップロードしてインストールできるようになり、一時的な接続障害に対するリトライを追加し、不正なコネクタ状態を自動的にリセットするようにしました

### ClickHouse 23.4 へのバージョンアップ {#clickhouse-234-version-upgrade}

- 並列レプリカでの JOIN をサポートしました（セットアップについては [support](https://console.clickhouse.cloud/support) までお問い合わせください）
- 論理削除のパフォーマンスを改善しました
- 大規模な INSERT 処理時のキャッシュを改善しました

### 管理機能の変更 {#administration-changes-1}

- "default" 以外のユーザーに対するローカル Dictionary 作成を拡張しました

## 2023年5月30日 {#may-30-2023}

このリリースでは、コントロールプレーン操作用の ClickHouse Cloud Programmatic API の一般公開（詳細は [ブログ](https://clickhouse.com/blog/using-the-new-clickhouse-cloud-api-to-automate-deployments) を参照）、IAM ロールを使用した S3 へのアクセス、そして追加のスケーリングオプションが導入されています。

### 一般的な変更点 {#general-changes-2}

- ClickHouse Cloud 向け API サポート。新しい Cloud API により、既存の CI/CD パイプラインにサービス管理をシームレスに統合し、サービスをプログラムから管理できるようになりました
- IAM ロールを使用した S3 アクセス。IAM ロールを利用して、プライベートな Amazon Simple Storage Service（S3）バケットへ安全にアクセスできるようになりました（セットアップについてはサポートまでお問い合わせください）

### スケーリングに関する変更点 {#scaling-changes}

- [水平スケーリング](/manage/scaling#manual-horizontal-scaling)。より高い並列性を必要とするワークロードに対して、最大 10 個のレプリカを設定できるようになりました（セットアップについてはサポートまでお問い合わせください）
- [CPU ベースのオートスケーリング](/manage/scaling)。CPU ボトルネックとなるワークロードに対して、オートスケーリングポリシーの追加トリガーを利用できるようになりました

### コンソールの変更点 {#console-changes-17}

- Dev サービスから Production サービスへの移行（有効化についてはサポートまでお問い合わせください）
- インスタンス作成フローにおけるスケーリング設定コントロールを追加
- デフォルトパスワードがメモリに存在しない場合の接続文字列を修正

### 連携機能の変更点 {#integrations-changes-17}

- Golang クライアント: ネイティブプロトコルで接続数に偏りが生じる問題を修正し、ネイティブプロトコルでのカスタム設定をサポート
- Node.js クライアント: Node.js v14 のサポートを終了し、v20 のサポートを追加
- Kafka Connector: LowCardinality 型のサポートを追加
- Metabase: 時間範囲によるグルーピングを修正し、組み込み Metabase 質問での整数サポートを修正

### パフォーマンスと信頼性 {#performance-and-reliability}

- 書き込み負荷の高いワークロードの効率とパフォーマンスを改善
- バックアップの速度と効率を高めるため、増分バックアップ戦略を導入

## 2023年5月11日 {#may-11-2023}

このリリースでは、GCP 上での ClickHouse Cloud のパブリックベータ版の提供
（詳細は[ブログ](https://clickhouse.com/blog/clickhouse-cloud-on-gcp-available-in-public-beta)を参照）、管理者がクエリ強制終了権限を付与できるようにするための権限拡張、
および Cloud コンソールでの MFA ユーザーのステータスに対する可視性の向上を行いました。

:::note Update
ClickHouse Cloud on GCP は現在 GA です。上記の 6 月 20 日の項目を参照してください。
:::

### ClickHouse Cloud on GCP がパブリックベータ版として利用可能に {#clickhouse-cloud-on-gcp-is-now-available-in-public-beta-now-ga-see-june-20th-entry-above}

:::note
ClickHouse Cloud on GCP は現在 GA です。上記の [6 月 20 日](#june-20-2023) の項目を参照してください。
:::

- Google Compute と Google Cloud Storage 上で動作する、ストレージとコンピュートが分離されたフルマネージドの ClickHouse サービスを提供
- アイオワ (us-central1)、オランダ (europe-west4)、シンガポール (asia-southeast1) の各リージョンで利用可能
- 上記 3 つの初期リージョンすべてで Development と Production サービスをサポート
- デフォルトで高いセキュリティを提供：転送中のエンドツーエンド暗号化、保存データの暗号化、IP 許可リスト

### インテグレーションの変更 {#integrations-changes-18}

- Golang クライアント: プロキシ環境変数のサポートを追加
- Grafana: Grafana のデータソース設定で ClickHouse のカスタム設定およびプロキシ環境変数を指定できる機能を追加
- Kafka Connector: 空レコードの処理を改善

### コンソールの変更 {#console-changes-18}

- ユーザー一覧に多要素認証 (MFA) の利用状況を示すインジケーターを追加

### パフォーマンスと信頼性 {#performance-and-reliability-1}

- 管理者向けのクエリ強制終了権限に対して、よりきめ細かな制御を追加

## 2023年5月4日 {#may-4-2023}

このリリースでは、新しいヒートマップチャートタイプの追加、請求の利用状況ページの改善、サービスの起動時間の短縮を行いました。

### Console の変更点 {#console-changes-19}

- SQL コンソールにヒートマップチャートタイプを追加
- 各請求ディメンションごとに消費クレジット数を表示できるよう、請求の利用状況ページを改善

### Integrations の変更点 {#integrations-changes-19}

- Kafka コネクタ: 一時的な接続エラーに対するリトライメカニズムを追加
- Python クライアント: HTTP 接続が無期限に再利用されないようにするため、`max_connection_age` 設定を追加。この設定は特定のロードバランシングに関する問題の軽減に役立ちます
- Node.js クライアント: Node.js v20 をサポート
- Java クライアント: クライアント証明書認証のサポートを改善し、ネストされた `Tuple` / `Map` / `Nested` 型のサポートを追加

### パフォーマンスと信頼性 {#performance-and-reliability-2}

- 多数のパーツが存在する場合のサービス起動時間を改善
- SQL コンソールにおける長時間実行クエリのキャンセルロジックを最適化

### バグ修正 {#bug-fixes}

- 「Cell Towers」サンプルデータセットのインポートが失敗するバグを修正

## 2023年4月20日 {#april-20-2023}

このリリースでは、ClickHouse のバージョンを 23.3 に更新し、コールドリードの速度を大幅に向上させ、サポートとのリアルタイムチャット機能を追加しました。

### Console の変更点 {#console-changes-20}

- サポートとのリアルタイムチャットオプションを追加

### Integrations の変更点 {#integrations-changes-20}

- Kafka コネクタ: Nullable 型のサポートを追加
- Golang クライアント: 外部テーブルのサポートを追加し、boolean 型およびポインタ型パラメータバインディングに対応

### Configuration の変更点 {#configuration-changes}

- `max_table_size_to_drop` および `max_partition_size_to_drop` 設定を上書きすることで、大きなテーブルを削除できるようにしました

### パフォーマンスと信頼性 {#performance-and-reliability-3}

- `allow_prefetched_read_pool_for_remote_filesystem` 設定による S3 プリフェッチを利用することで、コールドリードの速度を向上させる

### ClickHouse 23.3 へのバージョンアップ {#clickhouse-233-version-upgrade}

- 軽量削除が本番環境対応となりました — 詳細は 23.3 リリースの [ブログ](https://clickhouse.com/blog/clickhouse-release-23-03) を参照してください
- マルチステージ PREWHERE のサポートを追加 — 詳細は 23.2 リリースの [ブログ](https://clickhouse.com/blog/clickhouse-release-23-03) を参照してください
- 多数の新機能、パフォーマンスの向上、およびバグ修正 — 23.3 および 23.2 の詳細な変更点は [changelogs](/whats-new/changelog/index.md) を参照してください

## 2023年4月6日 {#april-6-2023}

このリリースでは、クラウドエンドポイントを取得するための API、最小アイドルタイムアウトの高度なスケーリング制御、Python クライアントのクエリメソッドにおける外部データのサポートが追加されています。

### API の変更 {#api-changes}

* [Cloud Endpoints API](//cloud/get-started/query-endpoints.md) を介して、ClickHouse Cloud エンドポイントをプログラムからクエリできる機能を追加

### コンソールの変更 {#console-changes-21}

- 高度なスケーリング設定に「minimum idle timeout」設定を追加
- データロードモーダルのスキーマ推論に、ベストエフォートの日時検出を追加

### 連携機能の変更 {#integrations-changes-21}

- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): 複数スキーマのサポートを追加
- [Go client](/integrations/language-clients/go/index.md): TLS 接続におけるアイドル接続の死活監視を修正
- [Python client](/integrations/language-clients/python/index.md)
  - クエリメソッドでの外部データのサポートを追加
  - クエリ結果に対するタイムゾーンのサポートを追加
  - `no_proxy`/`NO_PROXY` 環境変数のサポートを追加
  - Nullable 型に対する NULL 値のサーバーサイドパラメータバインディングを修正

### バグ修正 {#bug-fixes-1}

* SQL コンソールから `INSERT INTO ... SELECT ...` を実行した際に、SELECT クエリと同じ行数制限が誤って適用される動作を修正

## 2023年3月23日 {#march-23-2023}

このリリースでは、データベースパスワードの複雑さ要件、大規模バックアップ復元の大幅な高速化、そして Grafana Trace View でのトレース表示サポートを導入しました。

### セキュリティと信頼性 {#security-and-reliability}

- コアデータベースエンドポイントでパスワードの複雑さ要件を強制するようになりました
- 大規模バックアップの復元にかかる時間を短縮しました

### Console の変更点 {#console-changes-22}

- オンボーディングワークフローを合理化し、新しいデフォルト設定とよりコンパクトなビューを導入しました
- サインアップおよびサインインのレイテンシーを削減しました

### インテグレーションの変更点 {#integrations-changes-22}

- Grafana:
  - Trace View で ClickHouse に保存されたトレースデータを表示するサポートを追加しました
  - 時間範囲フィルターを改善し、テーブル名における特殊文字のサポートを追加しました
- Superset: ネイティブな ClickHouse サポートを追加しました
- Kafka Connect Sink: 日付の自動変換および Null 列の処理を追加しました
- Metabase: v0.46 との互換性を実装しました
- Python クライアント: 一時テーブルへの insert を修正し、Pandas の Null サポートを追加しました
- Golang クライアント: タイムゾーン付き Date 型を正規化しました
- Java クライアント
  - SQL パーサーに compression、infile、outfile キーワードのサポートを追加しました
  - 認証情報を受け取るメソッドのオーバーロードを追加しました
  - `ON CLUSTER` を用いたバッチサポートの不具合を修正しました
- Node.js クライアント
  - JSONStrings、JSONCompact、JSONCompactStrings、JSONColumnsWithMetadata フォーマットのサポートを追加しました
  - すべての主要なクライアントメソッドで `query_id` を指定できるようになりました

### バグ修正 {#bug-fixes-2}

- 新規サービスの初期プロビジョニングおよび起動時間が遅くなる不具合を修正しました
- キャッシュの誤った設定によりクエリパフォーマンスが低下していた不具合を修正しました

## 2023年3月9日 {#march-9-2023}

このリリースでは、オブザーバビリティダッシュボードの改善、大規模バックアップの作成時間の最適化に加え、大きなテーブルおよびパーティションを削除するために必要な設定を追加しました。

### コンソールの変更点 {#console-changes-23}

- 高度なオブザーバビリティダッシュボード（プレビュー）を追加
- オブザーバビリティダッシュボードにメモリ割り当てチャートを追加
- SQL Console のスプレッドシートビューにおける余白および改行処理を改善

### 信頼性とパフォーマンス {#reliability-and-performance}

- データが変更された場合にのみバックアップを実行するようにバックアップスケジュールを最適化
- 大規模バックアップ完了までの時間を短縮

### 設定の変更点 {#configuration-changes-1}

- クエリレベルまたは接続レベルで設定 `max_table_size_to_drop` および `max_partition_size_to_drop` を上書きすることで、テーブルおよびパーティションを削除できるサイズ上限を引き上げる機能を追加しました
- クエリログに送信元 IP を追加し、送信元 IP に基づくクォータおよびアクセス制御の適用を可能にしました

### 連携機能 {#integrations}

- [Python client](/integrations/language-clients/python/index.md): Pandas サポートを改善し、タイムゾーン関連の問題を修正
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): Metabase 0.46.x との互換性および SimpleAggregateFunction のサポートを追加
- [Kafka-Connect](/integrations/data-ingestion/kafka/index.md): 暗黙的な日付変換のサポートと、null カラムの処理の改善
- [Java Client](https://github.com/ClickHouse/clickhouse-java): Java のマップへのネストした変換をサポート

## 2023年2月23日 {#february-23-2023}

このリリースでは、ClickHouse 23.1 コアリリースの一部機能をサポートし、Amazon Managed Streaming for Apache Kafka (MSK) との相互運用性を追加するとともに、アクティビティログで高度なスケーリングおよびアイドル状態の調整が行えるようになりました。

### ClickHouse 23.1 バージョンアップグレード {#clickhouse-231-version-upgrade}

ClickHouse 23.1 の機能のサポートを一部追加しました。例:
- Map 型に対する ARRAY JOIN
- SQL 標準の 16 進数およびバイナリリテラル
- `age()`, `quantileInterpolatedWeighted()`, `quantilesInterpolatedWeighted()` を含む新しい関数
- 引数なしの `generateRandom` で、挿入テーブルの構造を使用できる機能
- 以前使用していたデータベース名を再利用できるようにする、データベース作成およびリネームロジックの改善
- 詳細については、23.1 リリースの[ウェビナースライド](https://presentations.clickhouse.com/release_23.1/#cover)および[23.1 リリースの変更履歴](/whats-new/cloud#clickhouse-231-version-upgrade)を参照してください

### インテグレーションの変更点 {#integrations-changes-23}

- [Kafka Connect](/integrations/data-ingestion/kafka/index.md): Amazon MSK のサポートを追加
- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md): 初の安定版リリース 1.0.0
  - コネクタが [Metabase Cloud](https://www.metabase.com/start/) 上で利用可能に
  - 利用可能なすべてのデータベースを探索できる機能を追加
  - AggregationFunction 型を持つデータベースの同期を修正
- [DBT-clickhouse](/integrations/data-ingestion/etl-tools/dbt/index.md): 最新の DBT バージョン v1.4.1 のサポートを追加
- [Python client](/integrations/language-clients/python/index.md): プロキシおよび SSH トンネリングのサポートを改善し、Pandas DataFrame 向けの多数の修正とパフォーマンス最適化を追加
- [Node.js client](/integrations/language-clients/js.md): クエリ結果に `query_id` を付与できるようにし、`system.query_log` からクエリメトリクスを取得可能に
- [Golang client](/integrations/language-clients/go/index.md): ClickHouse Cloud とのネットワーク接続を最適化

### コンソールの変更点 {#console-changes-24}

- アクティビティログに高度なスケーリングおよびアイドル状態に関する設定調整機能を追加
- パスワードリセットメールに User-Agent および IP 情報を追加
- Google OAuth 用のサインアップフローの挙動を改善

### 信頼性とパフォーマンス {#reliability-and-performance-1}

- 大規模サービスにおけるアイドル状態からの復帰時間を短縮
- 多数のテーブルとパーティションを持つサービスの読み取りレイテンシを改善

### バグ修正 {#bug-fixes-3}

- サービスパスワードをリセットした際に、パスワードポリシーに従わない動作を修正
- 組織招待メールの検証を大文字小文字を区別しないように変更

## 2023年2月2日 {#february-2-2023}

このリリースでは、正式サポートされた Metabase 連携、Java クライアント / JDBC ドライバーのメジャーリリース、そして SQL コンソールでのビューおよびマテリアライズドビューのサポートが追加されました。

### Integrations の変更点 {#integrations-changes-24}

- [Metabase](/integrations/data-visualization/metabase-and-clickhouse.md) プラグイン: ClickHouse によってメンテナンスされる公式ソリューションになりました
- [dbt](/integrations/data-ingestion/etl-tools/dbt/index.md) プラグイン: [マルチスレッド](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md) のサポートを追加
- [Grafana](/integrations/data-visualization/grafana/index.md) プラグイン: 接続エラーのハンドリングを改善
- [Python](/integrations/language-clients/python/index.md) クライアント: INSERT 操作向けの[ストリーミングサポート](/integrations/language-clients/python/advanced-querying.md#streaming-queries) を追加
- [Go](/integrations/language-clients/go/index.md) クライアント: [バグ修正](https://github.com/ClickHouse/clickhouse-go/blob/main/CHANGELOG.md): キャンセルされた接続のクローズおよび接続エラーのハンドリングを改善
- [JS](/integrations/language-clients/js.md) クライアント: [exec/insert における破壊的変更](https://github.com/ClickHouse/clickhouse-js/releases/tag/0.0.12); 戻り値型で query_id を公開
- [Java](https://github.com/ClickHouse/clickhouse-java#readme) クライアント / JDBC ドライバーのメジャーリリース
  - [破壊的変更](https://github.com/ClickHouse/clickhouse-java/releases): 非推奨だったメソッド、クラス、パッケージを削除
  - R2DBC ドライバーとファイルからの INSERT のサポートを追加

### Console の変更点 {#console-changes-25}

- SQL コンソールでビューおよび materialized view のサポートを追加

### パフォーマンスと信頼性 {#performance-and-reliability-4}

- 停止中／アイドル状態のインスタンスに対するパスワードリセットを高速化
- アクティビティトラッキングの精度向上によりスケールダウン動作を改善
- SQL コンソールの CSV エクスポートが切り捨てられるバグを修正
- サンプルデータのアップロードが断続的に失敗するバグを修正

## 2023年1月12日 {#january-12-2023}

このリリースでは ClickHouse のバージョンを 22.12 に更新し、多くの新しいソースで辞書を有効化し、クエリパフォーマンスを改善しました。

### 全般的な変更 {#general-changes-3}

- 外部 ClickHouse、Cassandra、MongoDB、MySQL、PostgreSQL、Redis などを含む、追加のソースで辞書を有効化しました

### ClickHouse 22.12 へのバージョンアップグレード {#clickhouse-2212-version-upgrade}

- JOIN のサポートを拡張し、Grace Hash Join を追加
- ファイル読み込み向けに Binary JSON (BSON) のサポートを追加
- GROUP BY ALL の標準 SQL 構文をサポート
- 固定精度の 10 進数演算向けの新しい数学関数を追加
- 変更点の完全な一覧は、[22.12 リリースブログ](https://clickhouse.com/blog/clickhouse-release-22-12)および[詳細な 22.12 変更履歴](/whats-new/cloud#clickhouse-2212-version-upgrade)を参照してください

### Console の変更 {#console-changes-26}

- SQL Console のオートコンプリート機能を改善
- デフォルトリージョンが大陸ローカリティを考慮するように変更
- Billing Usage ページを改善し、課金単位とウェブサイト単位の両方を表示

### Integrations の変更 {#integrations-changes-25}

- DBT リリース [v1.3.2](https://github.com/ClickHouse/dbt-clickhouse/blob/main/CHANGELOG.md#release-132-2022-12-23)
  - delete+insert 方式のインクリメンタルストラテジーに対する実験的サポートを追加
  - 新しい `s3source` マクロを追加
- Python クライアント [v0.4.8](https://github.com/ClickHouse/clickhouse-connect/blob/main/CHANGELOG.md#048-2023-01-02)
  - ファイル挿入のサポートを追加
  - サーバーサイドクエリの[パラメータバインディング](/interfaces/cli.md/#cli-queries-with-parameters)を追加
- Go クライアント [v2.5.0](https://github.com/ClickHouse/clickhouse-go/releases/tag/v2.5.0)
  - 圧縮処理におけるメモリ使用量を削減
  - サーバーサイドクエリの[パラメータバインディング](/interfaces/cli.md/#cli-queries-with-parameters)を追加

### 信頼性とパフォーマンス {#reliability-and-performance-2}

- オブジェクトストア上の多数の小さなファイルを取得するクエリの読み取り性能を改善
- 新しく起動したサービスについては、[compatibility](/operations/settings/settings#compatibility) 設定をサービスの初回起動時のバージョンに設定

### バグ修正 {#bug-fixes-4}
Advanced Scaling スライダーを使用してリソースを予約した場合、変更が即時に反映されるようになりました。

## 2022年12月20日 {#december-20-2022}

このリリースでは、管理者による SQL コンソールへのシームレスなログイン、コールドリード時の読み取りパフォーマンスの改善、および ClickHouse Cloud 向け Metabase コネクタの改良を導入しました。

### コンソールの変更点 {#console-changes-27}

- 管理者ユーザーによる SQL コンソールへのシームレスなアクセスを有効化
- 新規招待ユーザーのデフォルトロールを「Administrator」に変更
- オンボーディングアンケートを追加

### 信頼性とパフォーマンス {#reliability-and-performance-3}

- ネットワーク障害発生時に復旧できるよう、長時間実行される insert クエリ向けにリトライロジックを追加
- コールドリード時の読み取りパフォーマンスを改善

### 連携機能の変更点 {#integrations-changes-26}

- [Metabase プラグイン](/integrations/data-visualization/metabase-and-clickhouse.md) が待望の v0.9.1 メジャーアップデートを受けました。最新の Metabase バージョンと互換性があり、ClickHouse Cloud に対して徹底的にテストされています。

## 2022年12月6日 - 一般提供開始 {#december-6-2022---general-availability}

ClickHouse Cloud は、SOC2 Type II 準拠、本番ワークロード向けの稼働時間 SLA、パブリックなステータスページにより、本番運用に対応しました。このリリースには、AWS Marketplace での提供、ClickHouse ユーザー向けのデータ探索用ワークベンチである SQL console、ClickHouse Cloud 上での自習型学習プログラムである ClickHouse Academy などの主要な新機能が含まれます。詳細はこの[ブログ](https://clickhouse.com/blog/clickhouse-cloud-generally-available)をご覧ください。

### 本番運用対応 {#production-ready}

- SOC2 Type II 準拠（詳細は[ブログ](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant)および[Trust Center](https://trust.clickhouse.com/)を参照）
- ClickHouse Cloud 用のパブリックな[ステータスページ](https://status.clickhouse.com/)
- 本番ユースケース向けの稼働時間 SLA を提供
- [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-jettukeanwrfc) で提供

### 主な新機能 {#major-new-capabilities}

- ClickHouse ユーザー向けのデータ探索用ワークベンチである SQL console を導入
- ClickHouse Cloud 上での自習型学習プログラムである [ClickHouse Academy](https://learn.clickhouse.com/visitor_class_catalog) を開始

### 料金およびメータリングの変更 {#pricing-and-metering-changes}

- トライアル期間を 30 日間に延長
- 固定キャパシティで月額コストを抑えた Development Services を導入。スタータープロジェクトや開発／ステージング環境に最適
- ClickHouse Cloud の運用とスケーリングの継続的な改善に伴い、Production Services に新たな割引価格を導入
- コンピュートのメータリングにおける粒度と精度を向上

### インテグレーションの変更 {#integrations-changes-27}

- ClickHouse の Postgres / MySQL インテグレーションエンジンのサポートを有効化
- SQL ユーザー定義関数 (UDF) のサポートを追加
- Kafka Connect sink を Beta ステータスに昇格
- バージョン、更新状況などに関する詳細なメタデータを追加し、Integrations UI を改善

### コンソールの変更 {#console-changes-28}

- クラウドコンソールでの多要素認証 (MFA) をサポート
- モバイルデバイス向けにクラウドコンソールのナビゲーションを改善

### ドキュメントの変更 {#documentation-changes}

- ClickHouse Cloud の専用[ドキュメント](/cloud/overview)セクションを追加

### バグ修正 {#bug-fixes-5}

- 依存関係の解決により、バックアップからのリストアが常に正常に動作しない既知の問題を修正

## 2022年11月29日 {#november-29-2022}

このリリースでは、SOC2 Type II コンプライアンス準拠を達成し、ClickHouse のバージョンを 22.11 に更新し、複数の ClickHouse クライアントおよびインテグレーションを改善しました。

### 全般的な変更点 {#general-changes-4}

- SOC2 Type II コンプライアンス準拠を達成（詳細は [ブログ](https://clickhouse.com/blog/clickhouse-cloud-is-now-soc-2-type-ii-compliant) および [Trust Center](https://trust.clickhouse.com) を参照）

### Console の変更点 {#console-changes-29}

- サービスが自動的に一時停止されていることを示す "Idle" ステータスインジケーターを追加

### ClickHouse 22.11 へのバージョンアップ {#clickhouse-2211-version-upgrade}

- Hudi および DeltaLake のテーブルエンジンおよびテーブル関数のサポートを追加
- S3 向けの再帰的ディレクトリ走査を改善
- 複合時間間隔構文のサポートを追加
- INSERT のリトライにより INSERT の信頼性を向上
- 変更点の完全な一覧は、[詳細な 22.11 の変更履歴](/whats-new/cloud#clickhouse-2211-version-upgrade) を参照

### インテグレーション {#integrations-1}

- Python クライアント: v3.11 をサポートし、INSERT パフォーマンスを改善
- Go クライアント: DateTime および Int64 のサポートに関する不具合を修正
- JS クライアント: 相互 SSL 認証をサポート
- dbt-clickhouse: dbt v1.3 をサポート

### バグ修正 {#bug-fixes-6}

- アップグレード後に古い ClickHouse バージョンが表示されてしまうバグを修正
- "default" アカウントの権限変更によってセッションが中断されないよう修正
- 新規に作成された非管理者アカウントに、デフォルトで system テーブルへのアクセス権が付与されないよう修正

### このリリースにおける既知の問題 {#known-issues-in-this-release}

- 依存関係の解決の問題により、バックアップからのリストアが動作しない場合があります

## 2022年11月17日 {#november-17-2022}

このリリースでは、ローカルの ClickHouse テーブルおよび HTTP ソースからの辞書を利用可能にし、ムンバイリージョンのサポートを追加し、クラウドコンソールのユーザーエクスペリエンスを改善しました。

### 一般的な変更 {#general-changes-5}

- ローカルの ClickHouse テーブルおよび HTTP ソースからの[辞書](/sql-reference/dictionaries/index.md)のサポートを追加
- ムンバイ[リージョン](/cloud/reference/supported-regions)のサポートを追加

### コンソールの変更 {#console-changes-30}

- 請求書フォーマットを改善
- 支払い方法登録用のユーザーインターフェイスを簡素化
- バックアップ向けの、よりきめ細かいアクティビティログを追加
- ファイルアップロード時のエラー処理を改善

### 不具合修正 {#bug-fixes-7}

- 一部に単一の大きなファイルが含まれている場合にバックアップが失敗する可能性があった不具合を修正
- アクセスリストの変更が同時に適用された場合に、バックアップからの復元が成功しない不具合を修正

### 既知の問題 {#known-issues}

- 依存関係の解決の都合により、バックアップからの復元が行えない場合があります

## 2022年11月3日 {#november-3-2022}

このリリースでは、料金から読み取りおよび書き込みユニットを削除し（詳細は[料金ページ](https://clickhouse.com/pricing)を参照）、ClickHouse のバージョンを 22.10 に更新し、セルフサービス顧客向けにより高い垂直スケーリングをサポートし、より良いデフォルト設定により信頼性を向上しました。

### 一般的な変更点 {#general-changes-6}

- 料金モデルから読み取り／書き込みユニットを削除しました

### 設定の変更点 {#configuration-changes-2}

- 安定性確保のため、`allow_suspicious_low_cardinality_types`、`allow_suspicious_fixed_string_types`、`allow_suspicious_codecs`（デフォルトは false）の設定は、ユーザーが変更できなくなりました。

### Console の変更点 {#console-changes-31}

- 有料セルフサービス顧客向けの垂直スケーリングの最大値をメモリ 720GB に引き上げました
- バックアップからのリストア時のワークフローを改善し、IP Access List のルールとパスワードを設定できるようにしました
- サービス作成ダイアログに GCP および Azure 向けの待機リストを導入しました
- ファイルアップロード時のエラー処理を改善しました
- 課金管理ワークフローを改善しました

### ClickHouse 22.10 へのバージョンアップ {#clickhouse-2210-version-upgrade}

- 多数の大きなパーツ（少なくとも 10 GiB）が存在する場合に「パーツが多すぎる」というしきい値を緩和することで、オブジェクトストア上でのマージ処理を改善しました。これにより、単一テーブルの単一パーティション内で PB 規模のデータを格納できるようになります。
- 一定時間経過後にマージを行うための `min_age_to_force_merge_seconds` 設定により、マージ処理の制御を強化しました。
- 設定をリセットするための MySQL 互換の構文 `SET setting_name = DEFAULT` を追加しました。
- Morton 曲線エンコード、Java 整数ハッシュ、および乱数生成用の関数を追加しました。
- 変更点の完全な一覧については、[詳細な 22.10 の変更履歴](/whats-new/cloud#clickhouse-2210-version-upgrade)を参照してください。

## 2022年10月25日 {#october-25-2022}

このリリースでは、小規模なワークロードに対するコンピュート消費を大幅に削減し、コンピュートリソースの料金を引き下げ（詳細は [pricing](https://clickhouse.com/pricing) ページを参照）、より良いデフォルト設定による安定性の向上、および ClickHouse Cloud コンソール内の Billing と Usage ビューの改善を行いました。

### 一般的な変更点 {#general-changes-7}

- サービスの最小メモリ割り当てを 24G に削減
- サービスのアイドルタイムアウトを 30 分から 5 分に短縮

### 設定の変更点 {#configuration-changes-3}

- `max_parts_in_total` を 100k から 10k に削減。MergeTree テーブルに対する `max_parts_in_total` 設定のデフォルト値を 100,000 から 10,000 に引き下げました。この変更を行った理由は、クラウドにおいて多数のデータパートが存在すると、サービスの起動時間が遅くなりやすいことを確認したためです。パート数が多いことは、通常、パーティションキーを過度に細かく設定していることを示しており、これはしばしば意図せず行われる誤設定であり、避けるべきものです。デフォルト値の変更により、これらのケースをより早期に検出できるようになります。

### コンソールの変更点 {#console-changes-32}

- トライアルユーザー向けに、Billing ビューでのクレジット使用状況の詳細を強化
- Usage ビューでツールチップとヘルプテキストを改善し、pricing ページへのリンクを追加
- IP フィルタリングのオプションを切り替える際のワークフローを改善
- ClickHouse Cloud コンソールにメールアドレス確認の再送ボタンを追加

## 2022年10月4日 - ベータ {#october-4-2022---beta}

ClickHouse Cloud は 2022年10月4日にパブリックベータを開始しました。詳しくは[ブログ](https://clickhouse.com/blog/clickhouse-cloud-public-beta)をご覧ください。

ClickHouse Cloud のバージョンは、ClickHouse コア v22.10 をベースとしています。互換性のある機能一覧については、[Cloud Compatibility](/whats-new/cloud-compatibility) ガイドを参照してください。