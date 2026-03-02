---
slug: /use-cases/observability/clickstack/getting-started/sample-data
title: 'サンプルのログ、トレース、メトリクス'
sidebar_position: 0
pagination_prev: null
pagination_next: null
description: 'ClickStack と、ログ、セッション、トレース、メトリクスを含むサンプルデータセットを使った始め方'
doc_type: 'guide'
toc_max_heading_level: 2
keywords: ['clickstack', 'サンプルデータ', 'サンプルデータセット', 'ログ', 'オブザーバビリティ']
---

import Image from '@theme/IdealImage';
import hyperdx from '@site/static/images/use-cases/observability/hyperdx.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import hyperdx_3 from '@site/static/images/use-cases/observability/hyperdx-3.png';
import hyperdx_4 from '@site/static/images/use-cases/observability/hyperdx-4.png';
import hyperdx_5 from '@site/static/images/use-cases/observability/hyperdx-5.png';
import hyperdx_6 from '@site/static/images/use-cases/observability/hyperdx-6.png';
import hyperdx_7 from '@site/static/images/use-cases/observability/hyperdx-7.png';
import hyperdx_8 from '@site/static/images/use-cases/observability/hyperdx-8.png';
import hyperdx_9 from '@site/static/images/use-cases/observability/hyperdx-9.png';
import hyperdx_10 from '@site/static/images/use-cases/observability/hyperdx-10.png';
import hyperdx_11 from '@site/static/images/use-cases/observability/hyperdx-11.png';
import hyperdx_12 from '@site/static/images/use-cases/observability/hyperdx-12.png';
import hyperdx_13 from '@site/static/images/use-cases/observability/hyperdx-13.png';
import hyperdx_14 from '@site/static/images/use-cases/observability/hyperdx-14.png';
import hyperdx_15 from '@site/static/images/use-cases/observability/hyperdx-15.png';
import hyperdx_16 from '@site/static/images/use-cases/observability/hyperdx-16.png';
import hyperdx_17 from '@site/static/images/use-cases/observability/hyperdx-17.png';
import hyperdx_18 from '@site/static/images/use-cases/observability/hyperdx-18.png';
import hyperdx_19 from '@site/static/images/use-cases/observability/hyperdx-19.png';
import copy_api_key from '@site/static/images/use-cases/observability/copy_api_key.png';
import select_service from '@site/static/images/clickstack/select_service.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# ClickStack - サンプルのログ、トレース、メトリクス \{#clickstack-sample-dataset\}

このガイドでは、サンプルデータセットを使用して、ClickStack Open Source と Managed ClickStack の両方を対象とした手順を説明します。

<Tabs groupId="sample-logs">
  <TabItem value="managed-clickstack" label="マネージド版 ClickStack" default>
    <VerticalStepper headerLevel="h3">
      このガイドは、[マネージドClickStackの入門ガイド](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud)を完了し、[接続認証情報を記録](/use-cases/observability/clickstack/getting-started/managed#next-steps)していることを前提としています。

      ### サービスを選択してください

      メインのClickHouse Cloudランディングページから、Managed ClickStackを使用するサービスを選択します。

      <Image img={select_service} alt="サービスを選択" size="lg" />

      ### ClickStack UI（HyperDX）に移動する

      左側のメニューから`ClickStack`を選択し、ClickStack UIに移動します。自動的に認証が行われます。

      <Image img={hyperdx} alt="ClickStack UI" size="lg" />

      ### サンプルデータのダウンロード

      UIにサンプルデータを投入するには、次のファイルをダウンロードしてください:

      [サンプルデータ](https://storage.googleapis.com/hyperdx/sample.tar.gz)

      ```shell
      # curl
      curl -O https://storage.googleapis.com/hyperdx/sample.tar.gz
      # or
      # wget https://storage.googleapis.com/hyperdx/sample.tar.gz
      ```

      このファイルには、当社の公開[OpenTelemetry demo](https://github.com/ClickHouse/opentelemetry-demo)からのログ、メトリクス、トレースのサンプルが含まれています。これはマイクロサービスで構成されたシンプルなeコマースストアです。このファイルを任意のディレクトリにコピーしてください。

      ### サンプルデータのロード

      このデータをロードするには、デプロイ済みのOpenTelemetry(OTel)コレクターのHTTPエンドポイントに送信するだけです。

      次のコマンドを実行して、OTel collectorにデータを送信します。

      ```shell
      for filename in $(tar -tf sample.tar.gz); do
        endpoint="http://localhost:4318/v1/${filename%.json}"
        echo "loading ${filename%.json}"
        tar -xOf sample.tar.gz "$filename" | while read -r line; do
          printf '%s\n' "$line" | curl -s -o /dev/null -X POST "$endpoint" \
          -H "Content-Type: application/json" \
          -H "authorization: ${CLICKSTACK_API_KEY}" \
          --data-binary @-
        done
      done
      ```

      これは、OTLP ログ、トレース、メトリクスのソースから OTel collector へデータを送信する動作をシミュレートします。本番環境では、これらのソースは言語クライアントまたは他の OTel collector である可能性があります。

      `Search` ビューに戻ると、データの読み込みが開始されていることを確認できます(データが表示されない場合は、時間枠を `Last 1 hour` に調整してください):

      <Image img={hyperdx_10} alt="HyperDX の検索" size="lg" />

      データの読み込みには数分かかります。次の手順に進む前に、読み込みが完了するまで待機してください。

      ### セッションを確認する

      ユーザーが商品の支払い時に問題を経験しているという報告があるとします。HyperDXのセッションリプレイ機能を使用して、そのユーザー体験を確認できます。

      左側のメニューから `Client Sessions` を選択します。

      <Image img={hyperdx_11} alt="セッション" size="lg" />

      このビューを使用すると、eコマースストアのフロントエンドセッションを確認できます。セッションは、ユーザーがチェックアウトして購入を完了しようとするまで匿名として扱われます。

      メールを含む一部のセッションには関連するエラーがあり、失敗したトランザクションの報告を裏付けている可能性があります。

      失敗と関連するメールを含むトレースを選択します。次の画面では、ユーザーのセッションを再生して問題を確認できます。再生ボタンを押してセッションを視聴してください。

      <Image img={hyperdx_12} alt="セッションリプレイ" size="lg" />

      リプレイには、ユーザーがサイトを閲覧し、カートに商品を追加する様子が表示されます。セッション後半の支払い完了を試みる箇所まで、自由にスキップしてください。

      :::tip
      エラーはタイムライン上に赤色で表示されます。
      :::

      ユーザーは注文を完了できませんでしたが、明確なエラーは表示されませんでした。左パネルの下部までスクロールして、ユーザーのブラウザからのネットワークイベントとコンソールイベントを確認してください。`/api/checkout` の呼び出し時に500エラーが発生していることが確認できます。

      <Image img={hyperdx_13} alt="セッション内のエラー" size="lg" />

      この`500`エラーを選択します。`Overview`も`カラム値`も、エラーが予期しないものであり`Internal Error`を引き起こしているという事実以外、問題の原因を示していません。

      ### トレースを探索する

      `Trace`タブに移動して、完全な分散トレースを確認します。

      <Image img={hyperdx_14} alt="セッショントレース" size="lg" />

      トレースを下にスクロールして、エラーの発生元である `checkout` サービススパンを確認します。次に、`Payment` サービススパンを選択してください。

      <Image img={hyperdx_15} alt="スパン" size="lg" />

      `Column Values`タブを選択し、下にスクロールします。キャッシュが満杯になっていることが原因であることが確認できます。

      <Image img={hyperdx_16} alt="カラム値" size="lg" />

      上にスクロールしてトレースに戻ると、先ほどの設定のおかげで、ログがスパンと相関付けられていることが確認できます。これにより、さらなるコンテキストが提供されます。

      <Image img={hyperdx_17} alt="相関付けられたログ" size="lg" />

      決済サービス内のキャッシュが満杯になり、決済処理の完了を妨げていることが確認されました。

      ### ログを確認する

      詳細については、`Search`に戻ります:

      ソースから`Logs`を選択し、`payment`サービスにフィルターを適用します。

      <Image img={hyperdx_18} alt="ログ" size="lg" />

      この問題は最近発生したものですが、影響を受けた決済の件数が多いことが確認できます。さらに、Visa決済に関連するキャッシュが問題の原因となっているようです。

      ### チャートのメトリクス

      コードに明らかにエラーが混入していますが、メトリクスを使用してキャッシュサイズを確認できます。`Chart Explorer`ビューに移動します。

      データソースとして`Metrics`を選択します。チャートビルダーで`visa_validation_cache.size (Gauge)`の`Maximum`をプロットし、再生ボタンを押します。キャッシュは最大サイズに達するまで増加し続け、その後エラーが発生していることが確認できます。

      <Image img={hyperdx_19} alt="メトリクス" size="lg" />
    </VerticalStepper>
  </TabItem>

  <TabItem value="oss-clickstack" label="ClickStack オープンソース版">
    以下の例では、[オールインワンイメージの手順](/use-cases/observability/clickstack/getting-started/oss)を使用してオープンソース版ClickStackを起動し、[ローカルClickHouseインスタンス](/use-cases/observability/clickstack/getting-started/oss#complete-connection-credentials)に接続済みであることを前提としています。

    <VerticalStepper headerLevel="h3">
      ### ClickStack UI（HyperDX）に移動する

      [http://localhost:8080](http://localhost:8080) にアクセスして ClickStack UI を開いてください。

      <Image img={hyperdx} alt="ClickStack UI" size="lg" />

      ### インジェスト API key をコピー

      [`Team Settings`](http://localhost:8080/team)に移動し、`API Keys`セクションから`Ingestion API Key`をコピーします。このAPI keyにより、OpenTelemetryコレクター経由のデータインジェストが安全に保護されます。

      <Image img={copy_api_key} alt="API キーをコピー" size="lg" />

      ### サンプルデータのダウンロード

      UIにサンプルデータを投入するには、次のファイルをダウンロードしてください:

      [サンプルデータ](https://storage.googleapis.com/hyperdx/sample.tar.gz)

      ```shell
      # curl
      curl -O https://storage.googleapis.com/hyperdx/sample.tar.gz
      # or
      # wget https://storage.googleapis.com/hyperdx/sample.tar.gz
      ```

      このファイルには、当社の公開[OpenTelemetry demo](https://github.com/ClickHouse/opentelemetry-demo)からのログ、メトリクス、トレースのサンプルが含まれています。これはマイクロサービスで構成されたシンプルなeコマースストアです。このファイルを任意のディレクトリにコピーしてください。

      ### サンプルデータのロード

      このデータをロードするには、デプロイ済みのOpenTelemetry(OTel)コレクターのHTTPエンドポイントに送信するだけです。

      まず、上記でコピーしたAPIキーをエクスポートしてください。

      ```shell
      # export API key
      export CLICKSTACK_API_KEY=<YOUR_INGESTION_API_KEY>
      ```

      次のコマンドを実行して、OTel collectorにデータを送信します。

      ```shell
      for filename in $(tar -tf sample.tar.gz); do
        endpoint="http://localhost:4318/v1/${filename%.json}"
        echo "loading ${filename%.json}"
        tar -xOf sample.tar.gz "$filename" | while read -r line; do
          printf '%s\n' "$line" | curl -s -o /dev/null -X POST "$endpoint" \
          -H "Content-Type: application/json" \
          -H "authorization: ${CLICKSTACK_API_KEY}" \
          --data-binary @-
        done
      done
      ```

      これは、OTLP ログ、トレース、メトリクスのソースから OTel collector へデータを送信する動作をシミュレートします。本番環境では、これらのソースは言語クライアントまたは他の OTel collector である可能性があります。

      `Search` ビューに戻ると、データの読み込みが開始されていることを確認できます(データが表示されない場合は、時間枠を `Last 1 hour` に調整してください):

      <Image img={hyperdx_10} alt="HyperDX の検索" size="lg" />

      データの読み込みには数分かかります。次の手順に進む前に、読み込みが完了するまで待機してください。

      ### セッションを確認する

      ユーザーが商品の支払い時に問題を経験しているという報告があるとします。HyperDXのセッションリプレイ機能を使用して、そのユーザー体験を確認できます。

      左側のメニューから [`Client Sessions`](http://localhost:8080/sessions?from=1747312320000\&to=1747312920000\&sessionSource=l1324572572) を選択します。

      <Image img={hyperdx_11} alt="セッション" size="lg" />

      このビューを使用すると、eコマースストアのフロントエンドセッションを確認できます。セッションは、ユーザーがチェックアウトして購入を完了しようとするまで匿名として扱われます。

      メールを含む一部のセッションには関連するエラーがあり、失敗したトランザクションの報告を裏付けている可能性があります。

      失敗と関連するメールを含むトレースを選択します。次の画面では、ユーザーのセッションを再生して問題を確認できます。再生ボタンを押してセッションを視聴してください。

      <Image img={hyperdx_12} alt="セッションリプレイ" size="lg" />

      リプレイには、ユーザーがサイトを閲覧し、カートに商品を追加する様子が表示されます。セッション後半の支払い完了を試みる箇所まで、自由にスキップしてください。

      :::tip
      エラーはタイムライン上に赤色で表示されます。
      :::

      ユーザーは注文を完了できませんでしたが、明確なエラーは表示されませんでした。左パネルの下部までスクロールして、ユーザーのブラウザからのネットワークイベントとコンソールイベントを確認してください。`/api/checkout` の呼び出し時に500エラーが発生していることが確認できます。

      <Image img={hyperdx_13} alt="セッション内のエラー" size="lg" />

      この`500`エラーを選択します。`Overview`も`カラム値`も、エラーが予期しないものであり`Internal Error`を引き起こしているという事実以外、問題の原因を示していません。

      ### トレースを探索する

      `Trace`タブに移動して、完全な分散トレースを確認します。

      <Image img={hyperdx_14} alt="セッショントレース" size="lg" />

      トレースを下にスクロールして、エラーの発生元である `checkout` サービススパンを確認します。次に、`Payment` サービススパンを選択してください。

      <Image img={hyperdx_15} alt="スパン" size="lg" />

      `Column Values`タブを選択し、下にスクロールします。キャッシュが満杯になっていることが原因であることが確認できます。

      <Image img={hyperdx_16} alt="カラム値" size="lg" />

      上にスクロールしてトレースに戻ると、先ほどの設定のおかげで、ログがスパンと相関付けられていることが確認できます。これにより、さらなるコンテキストが提供されます。

      <Image img={hyperdx_17} alt="相関付けられたログ" size="lg" />

      決済サービス内のキャッシュが満杯になり、決済処理の完了を妨げていることが確認されました。

      ### ログを確認する

      詳細については、[`Search` ビュー](http://localhost:8080/search)に戻ります:

      ソースから`Logs`を選択し、`payment`サービスにフィルターを適用します。

      <Image img={hyperdx_18} alt="ログ" size="lg" />

      この問題は最近発生したものですが、影響を受けた決済の件数が多いことが確認できます。さらに、Visa決済に関連するキャッシュが問題の原因となっているようです。

      ### チャートのメトリクス

      コードに明らかにエラーが混入していますが、メトリクスを使用してキャッシュサイズを確認できます。`Chart Explorer`ビューに移動します。

      データソースとして`Metrics`を選択します。チャートビルダーで`visa_validation_cache.size (Gauge)`の`Maximum`をプロットし、再生ボタンを押します。キャッシュは最大サイズに達するまで増加し続け、その後エラーが発生していることが確認できます。

      <Image img={hyperdx_19} alt="メトリクス" size="lg" />
    </VerticalStepper>
  </TabItem>
</Tabs>