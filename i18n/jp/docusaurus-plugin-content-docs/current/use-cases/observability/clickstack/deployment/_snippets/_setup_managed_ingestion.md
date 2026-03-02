import Image from '@theme/IdealImage';
import select_source from '@site/static/images/clickstack/getting-started/select_source.png';
import start_ingestion from '@site/static/images/clickstack/getting-started/start_ingestion.png';
import otel_collector_start from '@site/static/images/clickstack/getting-started/otel_collector_start.png';
import advanced_otel_collector from '@site/static/images/clickstack/getting-started/advanced_otel_collector.png';
import vector_config from '@site/static/images/clickstack/getting-started/vector_config.png';
import ExampleOTelConfig from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_config_example_otel.md';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Image img={start_ingestion} size="lg" alt="インジェストを開始" border />

「Start Ingestion」を選択すると、インジェストソースの選択を求められます。Managed ClickStack は、主なインジェストソースとして OpenTelemetry と [Vector](https://vector.dev/) をサポートしています。ただし、ユーザーは任意の [ClickHouse Cloud support integrations](/integrations) を利用して、独自のスキーマで ClickHouse に直接データを送信することもできます。

<Image img={select_source} size="lg" alt="ソースを選択" border />

:::note[OpenTelemetry の利用を推奨]
インジェスト形式としては、OpenTelemetry の利用を強く推奨します。
ClickStack と効率的に連携するよう特別に設計された、すぐに利用可能なスキーマを備えており、もっともシンプルかつ最適化された利用体験を提供します。
:::

<Tabs groupId="ingestion-sources">
  <TabItem value="open-telemetry" label="OpenTelemetry" default>
    Managed ClickStackにOpenTelemetryデータを送信する場合は、OpenTelemetry Collectorを使用することを推奨します。コレクターは、アプリケーション(および他のコレクター)からOpenTelemetryデータを受信し、それを ClickHouse Cloud に転送するゲートウェイとして機能します。

    まだコレクターが動作していない場合は、以下の手順でコレクターを起動してください。既存のコレクターがある場合は、設定例も提供しています。

    ### コレクターを起動する \{#start-a-collector\}

    以下では、追加の処理を含み、ClickHouse Cloud向けに最適化された **ClickStack distribution of the OpenTelemetry Collector** を使用する推奨パスを前提としています。独自のOpenTelemetry Collectorを使用する場合は、[「既存のコレクターの設定」](#configure-existing-collectors)を参照してください。

    すぐに開始するには、表示されているDockerコマンドをコピーして実行します。

    <Image img={otel_collector_start} size="md" alt="OTel collector のソース" />

    このコマンドには、接続認証情報があらかじめ埋め込まれています。

    :::note[本番環境へのデプロイ]
    このコマンドはManaged ClickStackへの接続に`default`ユーザーを使用していますが、[本番環境に移行する](/use-cases/observability/clickstack/production#create-a-database-ingestion-user-managed)際には専用ユーザーを作成し、設定を変更してください。
    :::

    このコマンドを1回実行するだけで、ポート4317(gRPC)および4318(HTTP)でOTLPエンドポイントが公開されたClickStackコレクターが起動します。既にOpenTelemetryインストルメンテーションとエージェントを使用している場合は、これらのエンドポイントへのテレメトリデータ送信を直ちに開始できます。

    ### 既存のコレクターの設定 \{#configure-existing-collectors\}

    既存のOpenTelemetryコレクターを設定したり、独自のコレクターディストリビューションを使用したりすることも可能です。

    :::note[ClickHouse exporter required]
    独自のディストリビューション(例: [contrib イメージ](https://github.com/open-telemetry/opentelemetry-collector-contrib))を使用している場合は、[ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter) が含まれていることを確認してください。
    :::

    この目的のために、適切な設定でClickHouseエクスポーターを使用し、OTLPレシーバーを公開するOpenTelemetry Collectorの設定例が提供されています。この設定は、ClickStackディストリビューションが期待するインターフェースと動作に一致します。

    <ExampleOTelConfig />

    <Image img={advanced_otel_collector} size="lg" alt="高度な OTel collector のソース" border />

    OpenTelemetryコレクターの設定の詳細については、[「OpenTelemetryでのデータ取り込み」](/use-cases/observability/clickstack/ingesting-data/opentelemetry)を参照してください。

    ### インジェストを開始する(任意) \{#start-ingestion-create-new\}

    既存のアプリケーションやインフラストラクチャでOpenTelemetryによるインストルメンテーションを行う場合は、UIからリンクされている該当ガイドに進んでください。

    アプリケーションをインストルメントしてトレースとログを収集するには、[サポートされている言語SDK](/use-cases/observability/clickstack/sdks)を使用します。これらは、Managed ClickStackへのインジェストのためのゲートウェイとして動作するOpenTelemetry Collectorにデータを送信します。

    ログは、エージェントモードで動作し同じコレクターにデータを転送する[OpenTelemetry Collectorを使用して収集](/use-cases/observability/clickstack/integrations/host-logs)できます。Kubernetesの監視については、[専用ガイド](/use-cases/observability/clickstack/integrations/kubernetes)に従ってください。他のインテグレーションについては、[クイックスタートガイド](/use-cases/observability/clickstack/integration-guides)を参照してください。

    ### デモデータ \{#demo-data\}

    あるいは、既存データがない場合は、サンプルデータセットのいずれかを試すこともできます。

    * [Example dataset](/use-cases/observability/clickstack/getting-started/sample-data) - 公開デモからサンプルデータセットをロードし、簡単な問題の診断を行います。
    * [Local files and metrics](/use-cases/observability/clickstack/getting-started/local-data) - ローカルのOTel collectorを使用して、OSXまたはLinux上でローカルファイルを読み込み、システムを監視します。

    <br />
  </TabItem>

  <TabItem value="Vector" label="Vector" default>
    [Vector](https://vector.dev) は、高性能でベンダーに依存しないオブザーバビリティデータパイプラインであり、柔軟性とリソース消費の少なさから、特にログのインジェスト用途で広く利用されています。

    ClickStack と併用する場合、Vector ではスキーマ定義をユーザー自身が行う必要があります。これらのスキーマは OpenTelemetry の規約に従ってもよいですし、ユーザー定義イベント構造を表す完全にカスタムなものでも構いません。

    :::note タイムスタンプ必須
    Managed ClickStack における唯一の厳密な要件は、データに **タイムスタンプカラム**（または同等の時刻フィールド）が含まれていることです。これは ClickStack UI でデータソースを設定する際に宣言できます。
    :::

    以下では、データを配信するためのインジェストパイプラインが事前に設定された Vector インスタンスが稼働していることを前提とします。

    ### データベースとテーブルを作成する \{#create-database-and-tables\}

    Vector では、データをインジェストする前にテーブルとスキーマを定義しておく必要があります。

    まずデータベースを作成します。これは [ClickHouse Cloud console](/cloud/get-started/sql-console) から行えます。

    たとえば、ログ用のデータベースを作成します。

    ```sql
    CREATE DATABASE IF NOT EXISTS logs
    ```

    次に、ログデータの構造に合致するスキーマのテーブルを作成します。以下の例では、典型的な Nginx アクセスログ形式を想定しています。

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

    テーブルは、Vector によって生成される出力スキーマと一致している必要があります。推奨される[スキーマ設計のベストプラクティス](/docs/best-practices/select-data-types)に従い、データに合わせてスキーマを調整してください。

    ClickHouse における[Primary keys](/docs/primary-indexes)の動作を理解し、アクセスパターンに基づいて順序キーを選択することを強く推奨します。主キーの選択については、[ClickStack 固有の](/use-cases/observability/clickstack/performance_tuning#choosing-a-primary-key)ガイダンスを参照してください。

    テーブルを作成したら、表示されている設定スニペットをコピーします。既存のパイプラインを取り込めるよう入力を調整し、必要に応じて対象テーブルおよびデータベースも変更してください。認証情報は事前に入力されているはずです。

    <Image img={vector_config} size="lg" alt="Vector の設定" />

    Vector を用いたデータ取り込みの例については、[&quot;Ingesting with Vector&quot;](/use-cases/observability/clickstack/ingesting-data/vector) または高度なオプションについて [Vector ClickHouse sink documentation](https://vector.dev/docs/reference/configuration/sinks/clickhouse/) を参照してください。

    <br />
  </TabItem>
</Tabs>