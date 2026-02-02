---
slug: /use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud
title: 'マネージド版'
pagination_prev: null
pagination_next: null
sidebar_position: 1
description: 'マネージド ClickStack のデプロイ'
doc_type: 'ガイド'
keywords: ['clickstack', 'デプロイメント', 'セットアップ', '構成', 'オブザーバビリティ']
---

import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';
import hyperdx_cloud_datasource from '@site/static/images/use-cases/observability/hyperdx_cloud_datasource.png';
import hyperdx_create_new_source from '@site/static/images/use-cases/observability/hyperdx_create_new_source.png';
import hyperdx_create_trace_datasource from '@site/static/images/use-cases/observability/hyperdx_create_trace_datasource.png';
import read_only from '@site/static/images/clickstack/read-only-access.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import select_service from '@site/static/images/clickstack/select_service.png';
import JSONSupport from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';
import SetupManagedIngestion from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_setup_managed_ingestion.md';
import StartManagedIngestion from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_start_managed_ingestion.md';
import NavigateClickStackUI from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_navigate_managed.md';
import ProviderSelection from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_select_provider.md';
import UseCaseSelector from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_select_usecase.md';
import new_service from '@site/static/images/clickstack/getting-started/new_service.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<BetaBadge />

::::note[ベータ機能]
この機能は ClickHouse Cloud のベータ版です。
::::

この**ガイドは既存の ClickHouse Cloud ユーザー向けです**。ClickHouse Cloud を初めて利用する場合は、Managed ClickStack 向けの [入門ガイド](/use-cases/observability/clickstack/getting-started/managed) を参照してください。

このデプロイメントパターンでは、ClickHouse と ClickStack UI (HyperDX) の両方が ClickHouse Cloud 上でホストされ、ユーザーがセルフホストする必要があるコンポーネント数を最小限に抑えられます。

インフラ管理を削減するだけでなく、このデプロイメントパターンでは認証が ClickHouse Cloud の SSO/SAML と統合されます。セルフホスト型のデプロイメントとは異なり、ダッシュボード、保存済み検索、ユーザー設定、アラートといったアプリケーション状態を保存するための MongoDB インスタンスをプロビジョニングする必要もありません。ユーザーは次のような利点も得られます:

* ストレージとは独立したコンピュートの自動スケーリング
* オブジェクトストレージに基づいた低コストかつ事実上無制限の保持期間
* Warehouse を用いて読み取りと書き込みのワークロードを個別に分離できる機能
* 統合された認証
* 自動バックアップ
* セキュリティおよびコンプライアンス機能
* シームレスなアップグレード

このモードでは、データのインジェストは完全にユーザー側で行います。Managed ClickStack へのデータのインジェストには、独自にホストした OpenTelemetry collector、クライアントライブラリからの直接インジェスト、ClickHouse ネイティブのテーブルエンジン (Kafka や S3 など)、ETL パイプライン、あるいは ClickHouse Cloud のマネージドインジェストサービスである ClickPipes を利用できます。このアプローチは、ClickStack を運用するうえで最もシンプルかつ高性能な方法です。


### 適しているケース \{#suitable-for\}

このデプロイメントパターンは、次のようなシナリオに最適です。

1. すでに ClickHouse Cloud 上にオブザーバビリティデータがあり、それを ClickStack を使って可視化したい場合。
2. 大規模なオブザーバビリティデプロイメントを運用しており、ClickHouse Cloud 上で動作する ClickStack による専用の高いパフォーマンスとスケーラビリティが必要な場合。
3. すでに分析用途で ClickHouse Cloud を利用しており、ClickStack のインストルメンテーションライブラリを使ってアプリケーションを計測し、同じクラスタにデータを送信したい場合。この場合、オブザーバビリティワークロード用のコンピュートを分離するために、[warehouses](/cloud/reference/warehouses) の利用を推奨します。

## セットアップ手順 \{#setup-steps\}

このガイドでは、すでに ClickHouse Cloud サービスを作成済みであることを前提としています。まだサービスを作成していない場合は、Managed ClickStack 用の [はじめに](/use-cases/observability/clickstack/getting-started/managed) ガイドに従ってください。これにより、本ガイドと同じ状態、すなわち ClickStack が有効化され、オブザーバビリティデータをインジェストする準備が整ったサービスが用意されます。

<Tabs groupId="service-create-select">
<TabItem value="select" label="既存サービスを使用する" default>

<VerticalStepper headerLevel="h3">

### サービスを選択する \{#select-service\}

ClickHouse Cloud のランディングページから、Managed ClickStack を有効化したいサービスを選択します。

:::important リソース見積もり
このガイドでは、ClickStack を使ってインジェストおよびクエリを行う予定のオブザーバビリティデータのボリュームを処理できるだけの十分なリソースをプロビジョニング済みであることを前提としています。必要なリソースの見積もりについては、[本番環境ガイド](/use-cases/observability/clickstack/production#estimating-resources) を参照してください。 

ClickHouse サービスがすでにリアルタイムアプリケーション分析などの既存ワークロードをホストしている場合は、オブザーバビリティワークロードを分離するために、[ClickHouse Cloud の warehouses 機能](/cloud/reference/warehouses) を使用して子サービスを作成することを推奨します。これにより、既存アプリケーションを中断させることなく、両方のサービスから同じデータセットへアクセスできるようになります。
:::

<Image img={select_service} alt="サービスを選択" size="md"/>

左側のナビゲーションメニューから「ClickStack」を選択します。

### インジェストの設定 \{#setup-ingestion\}

<SetupManagedIngestion/>

### インジェストを開始する \{#start-ingestion\}

<StartManagedIngestion/>

### ClickStack UI に移動する \{#navigate-to-clickstack-ui-cloud\}

<NavigateClickStackUI/>

</VerticalStepper>

</TabItem>
<TabItem value="create" label="新しいサービスを作成する" default>

<VerticalStepper headerLevel="h3">

### 新しいサービスを作成する \{#create-a-service\}

ClickHouse Cloud のランディングページから、`New service` を選択して新しいサービスを作成します。

<Image img={new_service} size="md" alt='新しいサービス' border/>

### ユースケースを選択する \{#select-your-use-case\}

<UseCaseSelector/>

### プロバイダ、リージョン、およびデータサイズを指定する \{#specify-your-data-size\}

<ProviderSelection/>

### インジェストの設定 \{#setup-ingestion-create-new\}

<SetupManagedIngestion/>

### インジェストを開始する \{#start-ingestion-create-new\}

<StartManagedIngestion/>

### ClickStack UI に移動する \{#navigate-to-clickstack-ui-cloud-create-new\}

<NavigateClickStackUI/>

</VerticalStepper>

</TabItem>
</Tabs>

## 追加の作業 \{#additional-tasks\}

### Managed ClickStack へのアクセス権を付与する \{#configure-access\}

1. ClickHouse Cloud コンソールで対象のサービスに移動します
2. **Settings** → **SQL Console Access** を開きます
3. 各ユーザーに対して適切な権限レベルを設定します:
   - **Service Admin → Full Access** - アラートを有効化するために必須
   - **Service Read Only → Read Only** - オブザーバビリティデータの閲覧とダッシュボードの作成が可能
   - **No access** - HyperDX にアクセスできない

<Image img={read_only} alt="ClickHouse Cloud Read Only" size="md"/>

:::important アラートには管理者アクセスが必要です
アラートを有効化するには、少なくとも 1 人の **Service Admin** 権限を持つユーザー（SQL Console Access のドロップダウンで **Full Access** にマッピング）が、少なくとも一度は HyperDX にログインしている必要があります。これにより、アラートクエリを実行する専用ユーザーがデータベース内にプロビジョニングされます。
:::

### さらにデータソースを追加する \{#adding-data-sources\}

ClickStack は OpenTelemetry ネイティブですが、OpenTelemetry 専用ではありません。必要に応じて独自のテーブルスキーマを使用できます。

以下では、自動的に設定されるもの以外に、ユーザーが追加のデータソースを構成する方法について説明します。

#### OpenTelemetry スキーマの使用  \{#using-otel-schemas\}

OTel collector を使用して ClickHouse 内にデータベースおよびテーブルを作成している場合は、ソース作成画面のデフォルト値はすべて保持し、`Table` フィールドに `otel_logs` を入力してログソースを作成します。その他の設定はすべて自動検出されるため、`Save New Source` をクリックできます。

<Image img={hyperdx_cloud_datasource} alt="ClickHouse Cloud HyperDX Datasource" size="lg"/>

トレースおよび OTel メトリクス用のソースを作成するには、上部メニューから `Create New Source` を選択します。

<Image img={hyperdx_create_new_source} alt="ClickStack create new source" size="lg"/>

ここから、必要なソースタイプを選択し、続いて適切なテーブルを選択します。例えばトレースの場合は、テーブル `otel_traces` を選択します。すべての設定は自動検出されます。

<Image img={hyperdx_create_trace_datasource} alt="ClickStack create trace source" size="lg"/>

:::note ソースの相関付け
ClickStack 内の異なるデータソース（ログやトレースなど）は、互いに相関付けることができます。これを有効にするには、各ソースで追加の設定が必要です。例えば、ログソースでは対応するトレースソースを指定でき、逆にトレースソース側でもログソースを指定できます。詳細は [「相関ソース」](/use-cases/observability/clickstack/config#correlated-sources) を参照してください。
:::

#### カスタムスキーマの使用 \{#using-custom-schemas\}

既存のサービスの既存データに HyperDX を接続したいユーザーは、必要に応じてデータベースおよびテーブルの設定を行えます。テーブルが ClickHouse 向けの OpenTelemetry スキーマに準拠している場合、設定は自動検出されます。

独自スキーマを使用する場合は、必須フィールドが指定されていることを確認したうえで Logs ソースを作成することを推奨します。詳細は「[Log source settings](/use-cases/observability/clickstack/config#logs)」を参照してください。

<JSONSupport/>

加えて、ClickHouse Cloud サービスで JSON が有効化されていることを確認するため、support@clickhouse.com にお問い合わせください。