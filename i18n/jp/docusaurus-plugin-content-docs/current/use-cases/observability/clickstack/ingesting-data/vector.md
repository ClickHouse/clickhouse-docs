---
slug: /use-cases/observability/clickstack/ingesting-data/vector
pagination_prev: null
pagination_next: null
description: 'ClickStack 向け Vector を使用したデータインジェスト - ClickHouse オブザーバビリティスタック'
title: 'Vector を使用したインジェスト'
toc_max_heading_level: 2
doc_type: 'guide'
keywords: ['clickstack', 'vector', 'traces', 'observability', 'telemetry']
---

import Image from '@theme/IdealImage';
import InstallingVector from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/ingesting-data/_snippets/_installing_vector.md';
import VectorSampleData from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/ingesting-data/_snippets/_vector_sample_data.md';
import ingestion_key from '@site/static/images/clickstack/clickstack-ingestion-key.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import create_vector_datasource from '@site/static/images/clickstack/create-vector-datasource.png';
import create_vector_datasource_oss from '@site/static/images/clickstack/create-vector-datasource-oss.png';
import nginx_logs_vector_search from '@site/static/images/clickstack/nginx-logs-vector-search.png';
import launch_clickstack_vector from '@site/static/images/clickstack/launch-clickstack-vector.png';
import play_ui from '@site/static/images/clickstack/play-ui-clickstack.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

[Vector](https://vector.dev) は、高性能でベンダーニュートラルなオブザーバビリティ向けデータパイプラインです。幅広いソースからログやメトリクスを収集・変換・ルーティングするためによく使われており、とくに柔軟性と低いリソースフットプリントから、ログのインジェスト用途で人気があります。

ClickStack と組み合わせて Vector を使用する場合、スキーマ定義の責任はユーザー側にあります。これらのスキーマは OpenTelemetry のコンベンションに従うこともできますが、ユーザー定義のイベント構造を表す、完全に独自のものにすることも可能です。実際には、Vector によるインジェストは、**ログ** に対して最も一般的に利用されており、データが ClickHouse に書き込まれる前に、ユーザーがパースやエンリッチメントを完全に制御したいケースで使われます。

このガイドは、ClickStack オープンソース版およびマネージド版 ClickStack の両方に対して、Vector を用いてデータを ClickStack に取り込む方法に焦点を当てています。説明を簡潔にするため、Vector のソースやパイプライン設定の詳細は扱いません。その代わり、データを ClickHouse に書き込む **sink** の設定と、その結果として得られるスキーマが ClickStack と互換性を持つようにする点に重点を置きます。

ClickStack における唯一の厳格な要件は、オープンソース版かマネージドデプロイメントかに関わらず、データに **タイムスタンプカラム**（または同等の時間フィールド）が含まれていることです。これは ClickStack の UI でデータソースを設定する際に宣言できます。


## Vector を使ったデータ送信 \{#sending-data-with-vector\}

<br/>

<Tabs groupId="vector-options">
  <TabItem value="managed-clickstack" label="マネージド版 ClickStack" default>
    以下のガイドは、Managed ClickStackサービスを既に作成し、サービス認証情報を記録済みであることを前提としています。まだ作成していない場合は、Managed ClickStackの[はじめに](/use-cases/observability/clickstack/getting-started/managed)ガイドに従い、Vectorの設定を促されるまで進めてください。

    <VerticalStepper headerLevel="h3">
      ### データベースとテーブルを作成する

      Vectorでは、データをインジェストする前にテーブルとスキーマを定義しておく必要があります。

      まず、データベースを作成します。これは [ClickHouse Cloud コンソール](/cloud/get-started/sql-console)で実行できます。

      以下の例では `logs` を使用します:

      ```sql
      CREATE DATABASE IF NOT EXISTS logs
      ```

      データ用のテーブルを作成します。これはデータの出力スキーマと一致させる必要があります。以下の例では、標準的なNginx構造を想定しています。[スキーマのベストプラクティス](/best-practices/select-data-types)に従い、データに応じて適宜調整してください。[プライマリキーの概念](/primary-indexes)を理解した上で、[こちら](/use-cases/observability/clickstack/performance_tuning#choosing-a-primary-key)に記載されているガイドラインに基づいてプライマリキーを選択することを**強く推奨**します。

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
      ORDER BY (toStartOfMinute(time_local), status, remote_addr)
      ```

      :::note Nginx プライマリキー
      上記のプライマリキーは、ClickStack UI における Nginx ログの典型的なアクセスパターンを想定していますが、本番環境のワークロードによっては調整が必要になる場合があります。
      :::

      ### Vector設定にClickHouseシンクを追加する

      Vectorの設定を変更してClickHouseシンクを含めるようにし、既存のパイプラインからイベントを受信できるよう`inputs`フィールドを更新します。

      この設定は、上流のVectorパイプラインが既に**対象のClickHouseスキーマに合わせてデータを準備済み**であることを前提としています。つまり、フィールドが解析され、正しく命名され、挿入に適した型が付与されている必要があります。生のログ行を解析してClickStackに適したスキーマに正規化する完全な例については、[**以下のNginxの例**](#example-dataset-with-vector)を参照してください。

      ```yaml
      sinks:
        clickhouse:
          type: clickhouse
          inputs:
            - your_input
          endpoint: "<CLICKHOUSE_ENDPOINT>"
          database: logs
          format: json_each_row
          table: nginx_logs
          skip_unknown_fields: true
          auth:
            strategy: "basic"
            user: "default"
            password: "<CLICKHOUSE_PASSWORD>"
      ```

      デフォルトでは、**`json_each_row`** 形式の使用を推奨します。この形式は、各イベントを1行につき1つのJSONオブジェクトとしてエンコードします。これはClickStackでJSONデータを取り込む際のデフォルトかつ推奨される形式であり、文字列としてエンコードされたJSONオブジェクトなどの代替形式よりも優先すべきです。

      ClickHouseシンクは**Arrowストリームエンコーディング**もサポートしています(現在ベータ版)。これにより高いスループットを実現できますが、重要な制約があります。データベースとテーブルは静的である必要があり、スキーマは起動時に一度だけ取得されるため、動的ルーティングはサポートされていません。このため、Arrowエンコーディングは、固定された明確に定義されたインジェストパイプラインに最適です。

      利用可能なシンク設定オプションについては、[Vectorドキュメント](https://vector.dev/docs/reference/configuration/sinks/clickhouse)を確認してください:

      :::note
      上記の例では、Managed ClickStack のデフォルトユーザーを使用しています。本番環境へのデプロイメントでは、適切な権限と制限を持つ[専用のインジェストユーザーの作成](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)を推奨します。
      :::

      ### ClickStack UIに移動する

      マネージドClickStackサービスに移動し、左側のメニューから「ClickStack」を選択します。オンボーディングが既に完了している場合は、新しいタブでClickStack UIが起動し、自動的に認証されます。完了していない場合は、オンボーディングを進め、入力ソースとしてVectorを選択した後に「Launch ClickStack」を選択します。

      <Image img={launch_clickstack_vector} alt="Vector 用の ClickStack を起動する" size="lg" />

      ### データソースの作成

      ログデータソースを作成します。データソースが存在しない場合、初回ログイン時に作成を求められます。それ以外の場合は、チーム設定に移動し、新しいデータソースを追加してください。

      <Image img={create_vector_datasource} alt="データソースの作成 - Vector" size="lg" />

      上記の設定は、タイムスタンプとして使用される `time_local` カラムを持つNginx形式のスキーマを前提としています。このカラムは、可能な限りプライマリキーで宣言されたタイムスタンプカラムである必要があります。このカラムは必須です。

      また、`Default SELECT`を更新して、ログビューで返されるカラムを明示的に定義することを推奨します。サービス名、ログレベル、bodyカラムなどの追加フィールドが利用可能な場合は、これらも設定できます。タイムスタンプ表示カラムは、テーブルのプライマリキーで使用されるカラムと異なる場合、上記で設定したカラムを上書きすることもできます。

      上記の例では、データ内に`Body`カラムは存在しません。代わりに、利用可能なフィールドからNginxログ行を再構築するSQL式を使用して定義されています。

      その他の利用可能なオプションについては、[設定リファレンス](/use-cases/observability/clickstack/config)を参照してください。

      ### データを探索する

      ログビューに移動してデータを確認し、ClickStackの使用を開始します。

      <Image img={nginx_logs_vector_search} alt="ClickStack での Nginx ログ" size="lg" />
    </VerticalStepper>
  </TabItem>

  <TabItem value="oss-clickstack" label="オープンソース版 ClickStack">
    <VerticalStepper headerLevel="h3">
      ### データベースとテーブルを作成する

      Vectorでは、データをインジェストする前にテーブルとスキーマを定義しておく必要があります。

      まずデータベースを作成します。これは [http://localhost:8123/play](http://localhost:8123/play) の [ClickHouse Web ユーザーインターフェース](/interfaces/http#web-ui) から実行できます。デフォルトのユーザー名とパスワード `api:api` を使用します。

      <Image img={play_ui} alt="UI から ClickStack を試す" size="lg" />

      以下の例では `logs` を使用します:

      ```sql
      CREATE DATABASE IF NOT EXISTS logs
      ```

      データ用のテーブルを作成します。これはデータの出力スキーマと一致させる必要があります。以下の例では、標準的なNginx構造を想定しています。[スキーマのベストプラクティス](/best-practices/select-data-types)に従い、データに応じて適宜調整してください。[プライマリキーの概念](/primary-indexes)を理解した上で、[こちら](/use-cases/observability/clickstack/performance_tuning#choosing-a-primary-key)に記載されているガイドラインに基づいてプライマリキーを選択することを**強く推奨**します。

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
      ORDER BY (toStartOfMinute(time_local), status, remote_addr)
      ```

      :::note Nginx プライマリキー
      上記のプライマリキーは、ClickStack UI における Nginx ログの典型的なアクセスパターンを想定していますが、本番環境のワークロードによっては調整が必要になる場合があります。
      :::

      ### Vector設定にClickHouseシンクを追加する

      VectorからClickStackへのインジェストは、コレクターが公開するOTLPエンドポイントをバイパスし、ClickHouseに直接行う必要があります。

      Vectorの設定を変更してClickHouseシンクを含めるようにし、既存のパイプラインからイベントを受信するように`inputs`フィールドを更新します。

      この設定は、上流のVectorパイプラインが既に**対象のClickHouseスキーマに合わせてデータを準備済み**であることを前提としています。つまり、フィールドが解析され、正しく命名され、挿入に適した型が付与されている必要があります。生のログ行を解析してClickStackに適したスキーマに正規化する完全な例については、[**以下のNginxの例**](#example-dataset-with-vector)を参照してください。

      ```yaml
      sinks:
        clickhouse:
          type: clickhouse
          inputs:
            - your_input
          endpoint: "http://localhost:8123"
          database: logs
          format: json_each_row
          table: nginx_logs
          skip_unknown_fields: true
          auth:
            strategy: "basic"
            user: "api"
            password: "api"
      ```

      デフォルトでは、**`json_each_row`** フォーマットの使用を推奨します。このフォーマットは、各イベントを行ごとに単一のJSONオブジェクトとしてエンコードします。これは、ClickStackでJSONデータを取り込む際のデフォルトかつ推奨されるフォーマットであり、文字列としてエンコードされたJSONオブジェクトなどの代替フォーマットよりも優先して使用してください。

      ClickHouseシンクは**Arrowストリームエンコーディング**もサポートしています(現在ベータ版)。これにより高いスループットを実現できますが、重要な制約があります。データベースとテーブルは静的である必要があり、スキーマは起動時に一度だけ取得されるため、動的ルーティングはサポートされていません。このため、Arrowエンコーディングは、固定された明確に定義されたインジェストパイプラインに最適です。

      利用可能なシンク設定オプションについては、[Vectorドキュメント](https://vector.dev/docs/reference/configuration/sinks/clickhouse)を確認してください:

      :::note
      上記の例では、ClickStack Open Source の `api` ユーザーを使用しています。本番環境では、適切な権限と制限を持つ[専用のインジェストユーザーを作成](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)することを推奨します。また、上記の設定では Vector が ClickStack と同じホスト上で実行されていることを前提としています。本番環境では異なる構成になる可能性が高いため、セキュアな HTTPS ポート 8443 経由でデータを送信することを推奨します。
      :::

      ### ClickStack UIに移動する

      [http://localhost:8080](http://localhost:8080) のClickStack UIにアクセスします。オンボーディングが完了していない場合は、ユーザーを作成してください。

      <Image img={hyperdx_login} alt="ClickStack へのログイン" size="lg" />

      ### データソースの作成

      チーム設定に移動して、新しいデータソースを追加してください。

      <Image img={create_vector_datasource_oss} alt="データソースの作成 - Vector" size="lg" />

      上記の設定は、タイムスタンプとして使用される `time_local` カラムを持つNginx形式のスキーマを前提としています。このカラムは、可能な限りプライマリキーで宣言されたタイムスタンプカラムである必要があります。このカラムは必須です。

      また、`Default SELECT`を更新して、ログビューで返されるカラムを明示的に定義することを推奨します。サービス名、ログレベル、bodyカラムなどの追加フィールドが利用可能な場合は、これらも設定できます。タイムスタンプ表示カラムは、テーブルのプライマリキーで使用されるカラムと異なる場合、上記で設定したものを上書きすることもできます。

      上記の例では、データ内に`Body`カラムは存在しません。代わりに、利用可能なフィールドからNginxログ行を再構築するSQL式を使用して定義されています。

      その他のオプションについては、[設定リファレンス](/use-cases/observability/clickstack/config)を参照してください。

      ### データを探索する

      ログビューに移動してデータを確認し、ClickStackの使用を開始します。

      <Image img={nginx_logs_vector_search} alt="ClickStack における Nginx ログ" size="lg" />
    </VerticalStepper>
  </TabItem>
</Tabs>

## Vector を使用したサンプルデータセット {#example-dataset-with-vector}

より具体的な例として、以下では **Nginx のログファイル** を使用します。

<Tabs groupId="example-dataset-options">
  <TabItem value="managed-clickstack" label="マネージド版 ClickStack" default>
    以下のガイドは、Managed ClickStackサービスを既に作成し、サービス認証情報を記録済みであることを前提としています。まだ作成していない場合は、Managed ClickStackの[はじめに](/use-cases/observability/clickstack/getting-started/managed)ガイドに従い、Vectorの設定を促されるまで進めてください。

    <VerticalStepper headerLevel="h3">
      ### Vectorのインストール

      <InstallingVector />

      ### サンプルデータをダウンロードする

      <VectorSampleData />

      ### データベースとテーブルを作成する

      Vectorでは、データをインジェストする前にテーブルとスキーマを定義しておく必要があります。

      まずデータベースを作成します。これは [ClickHouse Cloud コンソール](/cloud/get-started/sql-console)から実行できます。

      データベース `logs` を作成します:

      ```sql
      CREATE DATABASE IF NOT EXISTS logs
      ```

      データ用のテーブルを作成してください。

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
      ORDER BY (toStartOfMinute(time_local), status, remote_addr)
      ```

      :::note Nginx プライマリキー
      上記のプライマリキーは、ClickStack UI における Nginx ログの典型的なアクセスパターンを想定していますが、本番環境のワークロードによっては調整が必要になる場合があります。
      :::

      ### Vector設定をコピー

      Vectorの設定をコピーし、`nginx.yaml`ファイルを作成した上で、`CLICKHOUSE_ENDPOINT`と`CLICKHOUSE_PASSWORD`を設定します。

      ```yaml
      data_dir: ./.vector-data
      sources:
        nginx_logs:
          type: file
          include:
            - access.log
          read_from: beginning

      transforms:
        decode_json:
          type: remap
          inputs:
            - nginx_logs
          source: |
            . = parse_json!(to_string!(.message))
            ts = parse_timestamp!(.time_local, format: "%d/%b/%Y:%H:%M:%S %z")
            # ClickHouse-friendly DateTime format
            .time_local = format_timestamp!(ts, format: "%F %T")

      sinks:
        clickhouse:
          type: clickhouse
          inputs:
            - decode_json
          endpoint: "<CLICKHOUSE_ENDPOINT>"
          database: logs
          format: json_each_row
          table: nginx_logs
          skip_unknown_fields: true
          auth:
            strategy: "basic"
            user: "default"
            password: "<CLICKHOUSE_PASSWORD>"
      ```

      :::note
      上記の例では、Managed ClickStackのデフォルトユーザーを使用しています。本番環境へのデプロイメントでは、適切な権限と制限を持つ[専用のインジェストユーザーの作成](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)を推奨します。
      :::

      ### Vectorを起動する

      以下のコマンドでVectorを起動します。その前に、ファイルオフセットを記録するためのデータディレクトリを作成してください。

      ```bash
      mkdir ./.vector-data
      vector --config nginx.yaml
      ```

      ### ClickStack UIに移動する

      Managed ClickStackサービスに移動し、左側のメニューから&quot;ClickStack&quot;を選択します。オンボーディングが既に完了している場合は、新しいタブでClickStack UIが起動し、自動的に認証されます。完了していない場合は、オンボーディングを進め、入力ソースとしてVectorを選択した後に「Launch ClickStack」を選択します。

      <Image img={launch_clickstack_vector} alt="Vector 向けに ClickStack を起動する" size="lg" />

      ### データソースの作成

      ログデータソースを作成します。データソースが存在しない場合、初回ログイン時に作成を促すメッセージが表示されます。既にデータソースが存在する場合は、チーム設定に移動して新しいデータソースを追加してください。

      <Image img={create_vector_datasource} alt="データソースの作成 - Vector" size="lg" />

      この設定は、タイムスタンプとして使用される`time_local`カラムを持つNginxスキーマを想定しています。これはプライマリキーで宣言されているタイムスタンプカラムです。このカラムは必須です。

      また、デフォルトの select を `time_local, remote_addr, status, request` に指定しており、これによりログビューで返されるカラムを定義しています。

      上記の例では、`Body`カラムはデータ内に存在しません。代わりに、SQL式として定義されています:

      ```sql
      concat(
        remote_addr, ' ',
        remote_user, ' ',
        '[', formatDateTime(time_local, '%d/%b/%Y:%H:%M:%S %z'), '] ',
        '"', request, '" ',
        toString(status), ' ',
        toString(body_bytes_sent), ' ',
        '"', http_referer, '" ',
        '"', http_user_agent, '" ',
        '"', http_x_forwarded_for, '" ',
        toString(request_time), ' ',
        toString(upstream_response_time), ' ',
        '"', http_host, '"'
      )
      ```

      構造化フィールドからログ行を再構築します。

      その他のオプションについては、[設定リファレンス](/use-cases/observability/clickstack/config)を参照してください。

      ### データを探索する

      `October 20th, 2025`の検索ビューに移動し、データを探索してClickStackの使用を開始します。

      <Image img={nginx_logs_vector_search} alt="HyperDX UI" size="lg" />
    </VerticalStepper>
  </TabItem>

  <TabItem value="oss-clickstack" label="オープンソース版 ClickStack">
    本ガイドは、[Getting Startedガイド](use-cases/observability/clickstack/getting-started/managed)を使用してClickStack Open Sourceをセットアップ済みであることを前提としています。

    <VerticalStepper headerLevel="h3">
      ### Vectorのインストール

      <InstallingVector />

      ### サンプルデータをダウンロードする

      <VectorSampleData />

      ### データベースとテーブルを作成する

      Vectorでは、データをインジェストする前にテーブルとスキーマを定義しておく必要があります。

      まずデータベースを作成します。これは [http://localhost:8123/play](http://localhost:8123/play) の [ClickHouse Web ユーザーインターフェース](/interfaces/http#web-ui)から実行できます。デフォルトのユーザー名とパスワード `api:api` を使用してください。

      <Image img={play_ui} alt="ClickStack の UI を試す" size="lg" />

      データベース `logs` を作成します:

      ```sql
      CREATE DATABASE IF NOT EXISTS logs
      ```

      データ用のテーブルを作成してください。

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
      ORDER BY (toStartOfMinute(time_local), status, remote_addr)
      ```

      :::note Nginx プライマリキー
      上記のプライマリキーは、ClickStack UI における Nginx ログの典型的なアクセスパターンを想定していますが、本番環境のワークロードによっては調整が必要になる場合があります。
      :::

      ### Vector設定をコピー

      VectorからClickStackへのインジェストは、コレクターが公開するOTLPエンドポイントをバイパスし、ClickHouseに直接行う必要があります。

      Vectorの設定をコピーして、`nginx.yaml`ファイルを作成してください。

      ```yaml
      data_dir: ./.vector-data
      sources:
        nginx_logs:
          type: file
          include:
            - access.log
          read_from: beginning

      transforms:
        decode_json:
          type: remap
          inputs:
            - nginx_logs
          source: |
            . = parse_json!(to_string!(.message))
            ts = parse_timestamp!(.time_local, format: "%d/%b/%Y:%H:%M:%S %z")
            # ClickHouse-friendly DateTime format
            .time_local = format_timestamp!(ts, format: "%F %T")

      sinks:
        clickhouse:
          type: clickhouse
          inputs:
            - decode_json
          endpoint: "http://localhost:8123"
          database: logs
          format: json_each_row
          table: nginx_logs
          skip_unknown_fields: true
          auth:
            strategy: "basic"
            user: "api"
            password: "api"
      ```

      :::note
      上記の例では、ClickStack Open Sourceの`api`ユーザーを使用しています。本番環境では、適切な権限と制限を持つ[専用のインジェストユーザーの作成](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)を推奨します。また、上記の設定では、VectorがClickStackと同じホスト上で実行されていることを前提としています。本番環境では、これは異なる可能性が高いです。セキュアなHTTPSポート8443経由でデータを送信することを推奨します。
      :::

      ### Vectorを起動する

      以下のコマンドでVectorを起動します。

      ```bash
      mkdir ./.vector-data
      vector --config nginx-local.yaml
      ```

      ### データソースの作成

      `Team -> Sources` からログデータソースを作成します

      <Image img={create_vector_datasource_oss} alt="Vector データソースの作成" size="lg" />

      この設定は、タイムスタンプとして使用される`time_local`カラムを持つNginxスキーマを想定しています。これはプライマリキーで宣言されているタイムスタンプカラムです。このカラムは必須です。

      また、デフォルトの選択を `time_local, remote_addr, status, request` に指定しており、これによりログビューで返されるカラムを定義しています。

      上記の例では、`Body`カラムはデータ内に存在しません。代わりに、SQL式として定義されています:

      ```sql
      concat(
        remote_addr, ' ',
        remote_user, ' ',
        '[', formatDateTime(time_local, '%d/%b/%Y:%H:%M:%S %z'), '] ',
        '"', request, '" ',
        toString(status), ' ',
        toString(body_bytes_sent), ' ',
        '"', http_referer, '" ',
        '"', http_user_agent, '" ',
        '"', http_x_forwarded_for, '" ',
        toString(request_time), ' ',
        toString(upstream_response_time), ' ',
        '"', http_host, '"'
      )
      ```

      構造化フィールドからログ行を再構築します。

      その他のオプションについては、[設定リファレンス](/use-cases/observability/clickstack/config)を参照してください。

      ### ClickStack UIに移動する

      [http://localhost:8080](http://localhost:8080) のClickStack UIにアクセスします。オンボーディングが完了していない場合は、ユーザーを作成してください。

      <Image img={hyperdx_login} alt="ClickStack へのログイン" size="lg" />

      ### データを探索する

      `October 20th, 2025`の検索ビューに移動し、データを探索してClickStackの使用を開始します。

      <Image img={nginx_logs_vector_search} alt="HyperDX の UI" size="lg" />
    </VerticalStepper>
  </TabItem>
</Tabs>