---
slug: /use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud
title: 'マネージド版'
pagination_prev: null
pagination_next: null
sidebar_position: 1
toc_max_heading_level: 2
description: 'マネージド ClickStack のデプロイ'
doc_type: 'ガイド'
keywords: ['clickstack', 'デプロイメント', 'セットアップ', '構成', 'オブザーバビリティ']
---

import Image from '@theme/IdealImage';
import BetaBadge from '@theme/badges/BetaBadge';
import hyperdx_cloud_datasource from '@site/static/images/use-cases/observability/hyperdx_cloud_datasource.png';
import hyperdx_create_new_source from '@site/static/images/use-cases/observability/hyperdx_create_new_source.png';
import hyperdx_create_trace_datasource from '@site/static/images/use-cases/observability/hyperdx_create_trace_datasource.png';
import clickstack_ui_setup_ingestion from '@site/static/images/clickstack/clickstack-ui-setup-ingestion.png';
import read_only from '@site/static/images/clickstack/read-only-access.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import select_service from '@site/static/images/clickstack/select_service.png';
import select_source_clickstack_ui from '@site/static/images/clickstack/select-source-clickstack-ui.png';
import advanced_otel_collector_clickstack_ui from '@site/static/images/clickstack/advanced-otel-collector-clickstack-ui.png'
import otel_collector_start_clickstack_ui from '@site/static/images/clickstack/otel-collector-start-clickstack-ui.png';
import vector_config_clickstack_ui from '@site/static/images/clickstack/vector-config-clickstack-ui.png';
import clickstack_managed_ui from '@site/static/images/clickstack/getting-started/clickstack_managed_ui.png';
import JSONSupport from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';
import ExampleOTelConfig from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_config_example_otel.md';
import create_vector_datasource from '@site/static/images/clickstack/create-vector-datasource.png';
import SetupManagedIngestion from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_setup_managed_ingestion.md';
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
  <TabItem value="CREATE" label="新しいサービスを作成する" default>
    <br />

    <VerticalStepper headerLevel="h3">
      ### 新しいサービスを作成する

      ClickHouse Cloud のランディングページから `New service` を選択して、新しいサービスを作成します。

      <Image img={new_service} size="lg" alt="サービスの作成" border />

      ### プロバイダー、リージョン、リソースを指定する

      <ProviderSelection />

      ### インジェストをセットアップする

      サービスのプロビジョニングが完了したら、対象のサービスが選択されていることを確認し、左側のメニューから「ClickStack」をクリックします。

      <SetupManagedIngestion />

      ### ClickStack UI に移動する

      <NavigateClickStackUI />

      <br />
    </VerticalStepper>
  </TabItem>

  <TabItem value="選択する" label="既存のサービスを使用する">
    <br />

    <VerticalStepper headerLevel="h3">
      ### サービスを選択する

      ClickHouse Cloud のランディングページから、マネージド ClickStack を有効化したいサービスを選択します。

      :::important リソースの見積もり
      本ガイドは、ClickStackで取り込みとクエリを実行する予定のオブザーバビリティデータ量を処理するために、十分なリソースがプロビジョニング済みであることを前提としています。必要なリソースを見積もるには、[本番環境ガイド](/use-cases/observability/clickstack/production#estimating-resources)を参照してください。

      ClickHouseサービスが既にリアルタイムアプリケーション分析などの既存のワークロードをホストしている場合は、[ClickHouse Cloudのウェアハウス機能](/cloud/reference/warehouses)を使用して子サービスを作成し、オブザーバビリティワークロードを分離することを推奨します。これにより、既存のアプリケーションを中断することなく、両方のサービスからデータセットへのアクセスを維持できます。
      :::

      <Image img={select_service} alt="サービスを選択" size="lg" />

      ### ClickStack UI に移動する

      左側のナビゲーションメニューから&#39;ClickStack&#39;を選択します。ClickStack UIにリダイレクトされ、ClickHouse Cloudの権限に基づいて自動的に認証されます。

      サービス内に OpenTelemetry テーブルが既に存在する場合、自動的に検出され、対応するデータソースが作成されます。

      :::note データソースの自動検出
      自動検出は、ClickStack ディストリビューションの OpenTelemetry コレクターが提供する標準 OpenTelemetry テーブルスキーマに依存しています。最も完全なテーブルセットを持つデータベースに対してソースが作成されます。必要に応じて、追加のテーブルを[個別のデータソース](/use-cases/observability/clickstack/config#datasource-settings)として追加することができます。
      :::

      自動検出が成功すると、検索ビューに遷移し、すぐにデータの探索を開始できます。

      <Image img={clickstack_managed_ui} size="lg" alt="ClickStack UI" />

      このステップが成功した場合、これで完了です 🎉。そうでない場合は、インジェストのセットアップに進んでください。

      ### インジェストをセットアップする

      自動検出が失敗した場合、または既存のテーブルが存在しない場合は、インジェストの設定を求められます。

      <Image img={clickstack_ui_setup_ingestion} alt="ClickStack UI でのインジェスト設定" size="lg" />

      &quot;Start Ingestion&quot;を選択すると、インジェストソースの選択を求められます。マネージドClickStackは、主なインジェストソースとしてOpenTelemetryと[Vector](https://vector.dev/)をサポートしています。ただし、ユーザーは[ClickHouse Cloudサポート統合](/integrations)のいずれかを使用して、独自のスキーマでClickHouseに直接データを送信することも可能です。

      <Image img={select_source_clickstack_ui} size="lg" alt="ソースを選択 - ClickStack UI" border />

      :::note[OpenTelemetry推奨]
      インジェスト形式としてOpenTelemetryの使用を強く推奨します。
      ClickStackで効率的に動作するように特別に設計された標準スキーマを備えており、最もシンプルで最適化されたエクスペリエンスを提供します。
      :::

      <Tabs groupId="ingestion-sources-existing">
        <TabItem value="open-telemetry" label="OpenTelemetry" default>
          Managed ClickStack に OpenTelemetry データを送信するには、OpenTelemetry Collector を使用することが推奨されます。Collector はゲートウェイとして動作し、アプリケーション（および他の Collector）から OpenTelemetry データを受信し、それを ClickHouse Cloud に転送します。

          まだ Collector を稼働させていない場合は、以下の手順に従って Collector を起動してください。既存の Collector がある場合は、設定例も用意されています。

          ### Collector を起動する

          以下では、**ClickStack ディストリビューション版 OpenTelemetry Collector** を使用する推奨パスを前提とします。このディストリビューションには追加の処理が含まれており、ClickHouse Cloud 向けに最適化されています。独自の OpenTelemetry Collector を使用したい場合は、「[既存の Collector を設定する](#configure-existing-collectors)」を参照してください。

          すぐに開始するには、表示されている Docker コマンドをコピーして実行します。

          <Image img={otel_collector_start_clickstack_ui} size="md" alt="OTel collector のソース" />

          **このコマンドは、サービス作成時に記録したサービス認証情報に置き換えてから実行してください。**

          :::note[本番環境へのデプロイ]
          このコマンドでは `default` ユーザーを使って Managed ClickStack に接続していますが、[本番環境に移行する際](/use-cases/observability/clickstack/production#create-a-database-ingestion-user-managed)には専用のユーザーを作成し、それに合わせて設定を変更する必要があります。
          :::

          この 1 つのコマンドを実行すると、ClickStack Collector が起動し、ポート 4317（gRPC）および 4318（HTTP）で OTLP エンドポイントが公開されます。すでに OpenTelemetry のインストルメンテーションやエージェントがある場合は、すぐにこれらのエンドポイントにテレメトリーデータを送信し始めることができます。

          ### 既存の Collector を設定する

          既存の OpenTelemetry Collector を設定したり、独自のディストリビューションの Collector を使用したりすることも可能です。

          :::note[ClickHouse exporter が必須]
          独自のディストリビューションを使用する場合、たとえば [contrib イメージ](https://github.com/open-telemetry/opentelemetry-collector-contrib) を使う場合は、[ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) が含まれていることを確認してください。
          :::

          この目的のために、ClickHouse exporter を適切な設定で使用し、OTLP receiver を公開する OpenTelemetry Collector のサンプル設定を用意しています。この設定は、ClickStack ディストリビューションが想定するインターフェースと動作に一致しています。

          <ExampleOTelConfig />

          <Image img={advanced_otel_collector_clickstack_ui} size="lg" alt="高度な OTel collector のソース" />

          OpenTelemetry Collector の詳細な設定方法については、「[OpenTelemetry を使ったインジェスト](/use-cases/observability/clickstack/ingesting-data/opentelemetry)」を参照してください。

          ### インジェストを開始する（任意）

          すでに OpenTelemetry でインストルメントする対象となるアプリケーションやインフラストラクチャがある場合は、「Connect an application」からリンクされている関連ガイドを参照してください。

          アプリケーションをインストルメントしてトレースやログを収集するには、[サポートされている言語 SDKs](/use-cases/observability/clickstack/sdks) を使用します。これらはテレメトリーデータを、Managed ClickStack へのインジェストのゲートウェイとして動作する OpenTelemetry Collector に送信します。

          ログは、エージェントモードで稼働し、同じ Collector にデータを転送する [OpenTelemetry Collector を使用して収集](/use-cases/observability/clickstack/integrations/host-logs)できます。Kubernetes の監視については、[専用ガイド](/use-cases/observability/clickstack/integrations/kubernetes) に従ってください。その他の連携については、[クイックスタートガイド](/use-cases/observability/clickstack/integration-guides) を参照してください。

          <br />
        </TabItem>

        <TabItem value="vector" label="Vector" default>
          [Vector](https://vector.dev) は高性能でベンダーニュートラルなオブザーバビリティデータパイプラインであり、柔軟性と小さいリソースフットプリントにより、特にログのインジェストで高い人気があります。

          Vector を ClickStack と併用する場合、スキーマの定義はユーザーの責任となります。これらのスキーマは OpenTelemetry の規約に従っていてもよいですし、完全にカスタムで、ユーザー定義のイベント構造を表現していてもかまいません。

          :::note タイムスタンプが必須
          Managed ClickStack における唯一の厳格な要件は、データに **timestamp column**（または同等の時刻フィールド）が含まれていることです。これは ClickStack UI でデータソースを設定する際に宣言できます。
          :::

          以下では、Vector のインスタンスがすでに稼働しており、事前に設定されたインジェストパイプラインを通じてデータを送信しているものとします。

          ### データベースとテーブルを作成する

          Vector では、データのインジェスト前にテーブルとスキーマを定義しておく必要があります。

          まずデータベースを作成します。これは [ClickHouse Cloud コンソール](/cloud/get-started/sql-console) から実行できます。

          たとえば、ログ用のデータベースを作成します。

          ```sql
          CREATE DATABASE IF NOT EXISTS logs
          ```

          次に、ログデータの構造に一致するスキーマを持つテーブルを作成します。以下の例では、典型的な Nginx アクセスログ形式を想定しています。

          ```sql
          CREATE TABLE logs.nginx_logs
          (
              `time_local` DateTime,
              `remote_addr` IPv4,
              `remote_user` LowCardinality(String),
              `request` String,
              `status` UInt16,
              `body_bytes_sent` UInt64,
              `http_referer` String,
              `http_user_agent` String,
              `http_x_forwarded_for` LowCardinality(String),
              `request_time` Float32,
              `upstream_response_time` Float32,
              `http_host` String
          )
          ENGINE = MergeTree
          ORDER BY (toStartOfMinute(time_local), status, remote_addr);
          ```

          テーブルは、Vector が生成する出力スキーマに合致している必要があります。データに合わせて、必要に応じてスキーマを調整し、推奨される[スキーマのベストプラクティス](/docs/best-practices/select-data-types)に従ってください。

          ClickHouse における[Primary keys](/docs/primary-indexes)の仕組みを理解し、アクセスパターンに基づいて並び替えキーを選択することを強く推奨します。Primary key の選択については、[ClickStack 固有の](/use-cases/observability/clickstack/performance_tuning#choosing-a-primary-key)ガイドラインを参照してください。

          テーブルが作成できたら、表示されている設定スニペットをコピーします。既存のパイプラインを取り込めるように input セクションを調整し、必要に応じて対象テーブルおよびデータベースも変更します。クレデンシャルは事前に自動的に入力されているはずです。

          <Image img={vector_config_clickstack_ui} size="lg" alt="Vector configuration" />

          Vector を使ってデータを取り込む他の例については、「[Ingesting with Vector](/use-cases/observability/clickstack/ingesting-data/vector)」または高度なオプションについての [Vector ClickHouse sink ドキュメント](https://vector.dev/docs/reference/configuration/sinks/clickhouse/) を参照してください。

          <br />
        </TabItem>
      </Tabs>

      ### ClickStack UI に移動する

      インジェストの設定を完了し、データの送信を開始したら、&quot;Next&quot;を選択してください。

      <Tabs groupId="datsources-sources-existing">
        <TabItem value="open-telemetry" label="OpenTelemetry" default>
          このガイドに従って OpenTelemetry データを取り込んでいる場合、データソースは自動的に作成されるため、追加のセットアップは不要です。すぐに ClickStack の探索を開始できます。検索ビューに、自動的にデータソースが選択された状態で遷移するため、直ちにクエリを実行し始めることができます。

          <Image img={clickstack_managed_ui} size="lg" alt="ClickStack UI" />

          以上で完了です — これですべての準備が整いました 🎉。

          <br />
        </TabItem>

        <TabItem value="vector" label="Vector" default>
          Vector 経由でデータを取り込んだ場合や、別のソースから取り込んでいる場合は、データソースの設定を行うよう求められます。

          <Image img={create_vector_datasource} alt="Create datasource - vector" size="lg" />

          上記の設定は、`time_local` カラムをタイムスタンプとして使用する Nginx 形式のスキーマを前提としています。可能であれば、これはプライマリキーで宣言されているタイムスタンプカラムであるべきです。**このカラムは必須です**。

          また、`Default SELECT` を更新して、ログビューで返されるカラムを明示的に定義することを推奨します。サービス名、ログレベル、本文カラムなど、追加のフィールドが利用可能な場合は、それらも設定できます。テーブルのプライマリキーで使用しているカラムと異なる場合には、タイムスタンプの表示に使用するカラムも上書き可能です。

          上記の例では、データ内に `Body` カラムは存在しません。その代わりに、利用可能なフィールドから Nginx のログ行を再構成する SQL 式として定義しています。

          その他に利用可能なオプションについては、[configuration reference](/use-cases/observability/clickstack/config#hyperdx) を参照してください。

          データソースの設定が完了したら、「Save」をクリックして、データの探索を開始します。

          <Image img={clickstack_managed_ui} size="lg" alt="ClickStack UI" />

          <br />
        </TabItem>
      </Tabs>
    </VerticalStepper>
  </TabItem>
</Tabs>

## 追加の作業 {#additional-tasks}

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

### 読み取り専用コンピュート環境での ClickStack の利用 \{#clickstack-read-only-compute\}

ClickStack UI は、読み取り専用の ClickHouse Cloud サービス上のみで完結して動作させることができます。インジェストとクエリのワークロードを分離したい場合、この構成を推奨します。

#### ClickStack がコンピュートを選択する仕組み {#how-clickstack-selects-compute}

ClickStack UI は、ClickHouse Cloud コンソール内で起動元となった ClickHouse サービスに常に接続します。

これは次のことを意味します。

* 読み取り専用サービスから ClickStack を開いた場合、ClickStack UI が発行するすべてのクエリは、その読み取り専用コンピュート上で実行されます。
* 読み書き可能サービスから ClickStack を開いた場合は、ClickStack は代わりにそのコンピュートを使用します。

読み取り専用動作を強制するために、ClickStack 内で追加の設定を行う必要はありません。

#### 推奨セットアップ {#recommended-setup}

ClickStack を読み取り専用コンピュート上で実行するには：

1. 読み取り専用として構成された warehouse 内の ClickHouse Cloud サービスを作成するか特定します。
2. ClickHouse Cloud コンソールで、その読み取り専用サービスを選択します。
3. 左側のナビゲーションメニューから ClickStack を起動します。

起動後、ClickStack UI は自動的にこの読み取り専用サービスに関連付けられます。

### さらにデータソースを追加する \{#adding-data-sources\}

ClickStack は OpenTelemetry ネイティブですが、OpenTelemetry 専用ではありません。必要に応じて独自のテーブルスキーマを使用できます。

以下では、自動的に設定されるもの以外に、ユーザーが追加のデータソースを構成する方法について説明します。

#### OpenTelemetry スキーマの使用  {#using-otel-schemas}

OTel collector を使用して ClickHouse 内にデータベースおよびテーブルを作成している場合は、ソース作成画面のデフォルト値はすべて保持し、`Table` フィールドに `otel_logs` を入力してログソースを作成します。その他の設定はすべて自動検出されるため、`Save New Source` をクリックできます。

<Image img={hyperdx_cloud_datasource} alt="ClickHouse Cloud HyperDX Datasource" size="lg"/>

トレースおよび OTel メトリクス用のソースを作成するには、上部メニューから `Create New Source` を選択します。

<Image img={hyperdx_create_new_source} alt="ClickStack create new source" size="lg"/>

ここから、必要なソースタイプを選択し、続いて適切なテーブルを選択します。例えばトレースの場合は、テーブル `otel_traces` を選択します。すべての設定は自動検出されます。

<Image img={hyperdx_create_trace_datasource} alt="ClickStack create trace source" size="lg"/>

:::note ソースの相関付け
ClickStack 内の異なるデータソース（ログやトレースなど）は、互いに相関付けることができます。これを有効にするには、各ソースで追加の設定が必要です。例えば、ログソースでは対応するトレースソースを指定でき、逆にトレースソース側でもログソースを指定できます。詳細は [「相関ソース」](/use-cases/observability/clickstack/config#correlated-sources) を参照してください。
:::

#### カスタムスキーマの使用 {#using-custom-schemas}

既存のサービスの既存データに ClickStack を接続したいユーザーは、必要に応じてデータベースおよびテーブルの設定を行えます。テーブルが ClickHouse 向けの OpenTelemetry スキーマに準拠している場合、設定は自動検出されます。

独自スキーマを使用する場合は、必須フィールドが指定されていることを確認したうえで Logs ソースを作成することを推奨します。詳細は「[Log source settings](/use-cases/observability/clickstack/config#logs)」を参照してください。

<JSONSupport/>

加えて、ClickHouse Cloud サービスで JSON が有効化されていることを確認するため、support@clickhouse.com にお問い合わせください。