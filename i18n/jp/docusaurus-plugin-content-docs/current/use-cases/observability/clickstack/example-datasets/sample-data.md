---
slug: /use-cases/observability/clickstack/getting-started/sample-data
title: 'サンプルのログ、トレース、メトリクス'
sidebar_position: 0
pagination_prev: null
pagination_next: null
description: 'ClickStack と、ログ、セッション、トレース、メトリクスを含むサンプルデータセットの利用を開始する'
doc_type: 'guide'
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


# ClickStack - サンプルのログ、トレース、メトリクス \{#clickstack-sample-dataset\}

以下の例では、[オールインワンイメージ用の手順](/use-cases/observability/clickstack/getting-started)に従って ClickStack を起動し、[ローカルの ClickHouse インスタンス](/use-cases/observability/clickstack/getting-started#complete-connection-credentials)または [ClickHouse Cloud インスタンス](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)に接続していることを前提とします。

:::note ClickHouse Cloud における HyperDX
このサンプルデータセットは、記載のとおり手順に対してごくわずかな調整を行うだけで、ClickHouse Cloud における HyperDX でも利用できます。ClickHouse Cloud で HyperDX を使用する場合は、[このデプロイメントモデルの入門ガイド](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud)で説明されているように、ローカルで OpenTelemetry コレクターを実行しておく必要があります。
:::

<VerticalStepper>
  ## HyperDX UIへ移動する

  ローカルにデプロイする場合は、[http://localhost:8080](http://localhost:8080) にアクセスしてHyperDX UIを開きます。ClickHouse CloudでHyperDXを使用する場合は、サービスを選択し、左メニューから`HyperDX`を選択してください。

  <Image img={hyperdx} alt="HyperDX UI" size="lg" />

  ## インジェスト API key をコピーする

  :::note ClickHouse CloudのHyperDX
  ClickHouse CloudでHyperDXを使用する場合は、この手順は不要です。インジェストキーのサポートは現在提供されていません。
  :::

  [`Team Settings`](http://localhost:8080/team) に移動し、`API Keys` セクションから `Ingestion API Key` をコピーします。このインジェスト API key により、OpenTelemetry コレクターを通じたデータインジェストが安全に行われます。

  <Image img={copy_api_key} alt="API キーをコピー" size="lg" />

  ## サンプルデータのダウンロード

  UIにサンプルデータを投入するには、次のファイルをダウンロードしてください:

  [サンプルデータ](https://storage.googleapis.com/hyperdx/sample.tar.gz)

  ```shell
  # curl
  curl -O https://storage.googleapis.com/hyperdx/sample.tar.gz
  # または
  # wget https://storage.googleapis.com/hyperdx/sample.tar.gz
  ```

  このファイルには、当社の公開[OpenTelemetry demo](https://github.com/ClickHouse/opentelemetry-demo)（マイクロサービスで構成されたシンプルなeコマースストア）から取得したログ、メトリクス、トレースのサンプルが含まれています。このファイルを任意のディレクトリにコピーしてください。

  ## サンプルデータの読み込み

  このデータをロードするには、デプロイ済みのOpenTelemetry（OTel）コレクターのHTTPエンドポイントに送信するだけです。

  まず、上記でコピーしたAPIキーをエクスポートします。

  :::note ClickHouse CloudのHyperDX
  ClickHouse CloudでHyperDXを使用する場合は、この手順は不要です。インジェストキーのサポートは現在提供されていません。
  :::

  ```shell
  # API キーをエクスポート
  export CLICKSTACK_API_KEY=<YOUR_INGESTION_API_KEY>
  ```

  以下のコマンドを実行して、OTel collectorにデータを送信します。

  ```shell
  for filename in $(tar -tf sample.tar.gz); do
    endpoint="http://localhost:4318/v1/${filename%.json}"
    echo "${filename%.json} を読み込み中"
    tar -xOf sample.tar.gz "$filename" | while read -r line; do
      printf '%s\n' "$line" | curl -s -o /dev/null -X POST "$endpoint" \
      -H "Content-Type: application/json" \
      -H "authorization: ${CLICKSTACK_API_KEY}" \
      --data-binary @-
    done
  done
  ```

  これは、OTel collectorにデータを送信するOTLPログ、トレース、およびメトリクスのソースをシミュレートします。本番環境では、これらのソースは言語クライアントや他のOTel collectorになります。

  `Search`ビューに戻ると、データの読み込みが開始されていることが確認できます（データが表示されない場合は、時間枠を`Last 1 hour`に調整してください）：

  <Image img={hyperdx_10} alt="HyperDX 検索" size="lg" />

  データの読み込みには数分かかります。次の手順に進む前に、読み込みが完了するまで待機してください。

  ## セッションを確認する

  ユーザーが商品の決済時に問題を経験しているという報告を受けたとします。HyperDXのセッションリプレイ機能を使用して、その体験を確認することができます。

  左側のメニューから [`Client Sessions`](http://localhost:8080/sessions?from=1747312320000\&to=1747312920000\&sessionSource=l1324572572) を選択します。

  <Image img={hyperdx_11} alt="セッション" size="lg" />

  このビューでは、eコマースストアのフロントエンドセッションを確認できます。セッションは、ユーザーがチェックアウトして購入手続きを試みるまで匿名として扱われます。

  メールアドレスを含む一部のセッションにはエラーが関連付けられており、トランザクション失敗の報告を裏付けている可能性があります。

  失敗と関連するメールを含むトレースを選択します。次のビューでは、ユーザーのセッションを再生して問題を確認できます。再生ボタンを押してセッションを視聴します。

  <Image img={hyperdx_12} alt="セッションリプレイ" size="lg" />

  リプレイには、ユーザーがサイトを閲覧してカートに商品を追加する様子が表示されます。セッション後半の支払い完了を試行する箇所まで自由にスキップできます。

  :::tip
  エラーはタイムライン上に赤色で表示されます。
  :::

  ユーザーは明示的なエラーが表示されないまま注文を完了できませんでした。左パネルの最下部までスクロールし、ユーザーのブラウザから取得したネットワークイベントとコンソールイベントを確認してください。`/api/checkout` 呼び出し時に500エラーが発生していることが確認できます。

  <Image img={hyperdx_13} alt="セッション中にエラーが発生しました" size="lg" />

  この `500` エラーを選択します。`Overview` と `Column Values` のいずれも、エラーが予期しないものであり `Internal Error` を引き起こしているという事実以外、問題の原因を示していません。

  ## トレースを確認する

  `Trace`タブに移動して、完全な分散トレースを表示します。

  <Image img={hyperdx_14} alt="セッショントレース" size="lg" />

  トレースを下にスクロールして、エラーの発生元である `checkout` サービススパンを確認します。`Payment` サービススパンを選択します。

  <Image img={hyperdx_15} alt="スパン" size="lg" />

  `Column Values`タブを選択し、下にスクロールします。キャッシュが満杯になっていることが問題の原因であることが確認できます。

  <Image img={hyperdx_16} alt="カラム値" size="lg" />

  上にスクロールしてトレースに戻ると、先ほどの設定により、ログがスパンと相関付けられていることが確認できます。これにより、さらに詳しいコンテキストが得られます。

  <Image img={hyperdx_17} alt="相関ログ" size="lg" />

  決済サービス内のキャッシュが満杯になっており、決済の完了を妨げていることが確認されました。

  ## ログを確認する

  詳細については、[`Search` ビュー](http://localhost:8080/search)を参照してください:

  ソースから `Logs` を選択し、`payment` サービスにフィルターを適用します。

  <Image img={hyperdx_18} alt="ログ" size="lg" />

  この問題は最近発生したものですが、影響を受けた決済件数が多いことが確認できます。さらに、Visa決済に関連するキャッシュが問題の原因となっている可能性があります。

  ## チャートメトリクス

  コードに明らかにエラーが混入していますが、メトリクスを使用してキャッシュサイズを確認できます。`Chart Explorer`ビューに移動します。

  データソースとして`Metrics`を選択します。チャートビルダーで`visa_validation_cache.size (Gauge)`の`Maximum`をプロットし、再生ボタンを押します。キャッシュは最大サイズに達するまで増加し続け、その後エラーが発生していることが確認できます。

  <Image img={hyperdx_19} alt="メトリクス" size="lg" />
</VerticalStepper>