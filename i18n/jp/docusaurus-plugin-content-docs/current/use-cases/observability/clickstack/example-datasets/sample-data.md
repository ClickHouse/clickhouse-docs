---
slug: /use-cases/observability/clickstack/getting-started/sample-data
title: 'ログ、トレース、メトリクスのサンプル'
sidebar_position: 0
pagination_prev: null
pagination_next: null
description: 'ClickStack と、ログ、セッション、トレース、メトリクスを含むサンプルデータセットを使って始める'
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


# ClickStack - サンプルログ、トレース、メトリクス {#clickstack-sample-dataset}

以下の例では、[オールインワンイメージの手順](/use-cases/observability/clickstack/getting-started)を使用してClickStackを起動し、[ローカルClickHouseインスタンス](/use-cases/observability/clickstack/getting-started#complete-connection-credentials)または[ClickHouse Cloudインスタンス](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)に接続済みであることを前提としています。

:::note ClickHouse CloudでのHyperDX
このサンプルデータセットは、ClickHouse CloudのHyperDXでも使用可能です。フローに若干の調整が必要となる点については、記載の通りです。ClickHouse CloudでHyperDXを使用する場合、[このデプロイメントモデルの入門ガイド](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)に記載されているように、OpenTelemetryコレクターをローカルで実行する必要があります。
:::

<VerticalStepper>


## HyperDX UI に移動する {#navigate-to-the-hyperdx-ui}

ローカル環境にデプロイしている場合は、[http://localhost:8080](http://localhost:8080) にアクセスして HyperDX UI を表示します。ClickHouse Cloud 上で HyperDX を利用している場合は、対象のサービスを選択し、左側のメニューから `HyperDX` を選択します。

<Image img={hyperdx} alt="HyperDX UI" size="lg"/>



## インジェスト API key をコピーする {#copy-ingestion-api-key}

:::note ClickHouse Cloud 上の HyperDX
ClickHouse Cloud 上で HyperDX を利用している場合、現在インジェスト API key はサポートされていないため、この手順は不要です。
:::

[`Team Settings`](http://localhost:8080/team) に移動し、`API Keys` セクションから `Ingestion API Key` をコピーします。この API key によって、OpenTelemetry collector を経由したデータのインジェストが安全に行われます。

<Image img={copy_api_key} alt="API key をコピーする" size="lg"/>



## サンプルデータをダウンロードする {#download-sample-data}

UI にサンプルデータを表示するために、次のファイルをダウンロードします。

[サンプルデータ](https://storage.googleapis.com/hyperdx/sample.tar.gz)



```shell
# curl の場合
curl -O https://storage.googleapis.com/hyperdx/sample.tar.gz
# または
# wget の場合
wget https://storage.googleapis.com/hyperdx/sample.tar.gz
```

このファイルには、公開されている [OpenTelemetry demo](https://github.com/ClickHouse/opentelemetry-demo)（マイクロサービスで構成されたシンプルな EC サイト）からのログ、メトリクス、トレースのサンプルが含まれています。このファイルを任意のディレクトリにコピーしてください。


## サンプルデータの読み込み {#load-sample-data}

このデータを読み込むには、デプロイ済みの OpenTelemetry (OTel) Collector の HTTP エンドポイントに送信するだけです。

まず、上でコピーした API キーをエクスポートします。

:::note ClickHouse Cloud 上の HyperDX
ClickHouse Cloud 上の HyperDX を使用している場合、この手順は不要です。インジェストキーは現在サポートされていません。
:::



```shell
# APIキーをエクスポート
export CLICKSTACK_API_KEY=<YOUR_INGESTION_API_KEY>
```

以下のコマンドを実行してデータを OTel collector に送信します。

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

これは、OTLP のログ、トレース、およびメトリクスのソースが OTel collector にデータを送信することをシミュレートします。本番環境では、これらのソースは各種言語向けクライアントライブラリや、他の OTel collector などになる場合があります。

`Search` ビューに戻ると、データの読み込みが開始されているはずです（データが表示されない場合は、時間範囲を `Last 1 hour` に調整してください）:

<Image img={hyperdx_10} alt="HyperDX search" size="lg" />

データの読み込みには数分かかります。次の手順に進む前に、読み込みが完了するまで待ってください。


## セッションを探索する {#explore-sessions}

ユーザーから、商品代金の支払い時に問題が発生しているという報告があったとします。HyperDX のセッションリプレイ機能を使って、ユーザーの体験を確認できます。

左側のメニューから [`Client Sessions`](http://localhost:8080/sessions?from=1747312320000&to=1747312920000&sessionSource=l1324572572) を選択します。

<Image img={hyperdx_11} alt="Sessions" size="lg"/>

このビューでは、EC ストアのフロントエンドセッションを確認できます。ユーザーがチェックアウトして購入を完了しようとするまで、セッションは Anonymous のままです。

メールアドレス付きの一部のセッションにはエラーが関連付けられており、失敗したトランザクションに関する報告を裏付けている可能性があります。

失敗していて、メールアドレスが関連付けられているトレースを選択します。続くビューでは、ユーザーセッションをリプレイして問題を確認できます。再生ボタンを押してセッションを再生します。

<Image img={hyperdx_12} alt="Session replay" size="lg"/>

リプレイでは、ユーザーがサイトを操作し、カートに商品を追加していく様子が表示されます。支払いを完了しようとしているセッション後半までスキップしても構いません。

:::tip
タイムライン上のエラーは赤で注釈表示されます。
:::

ユーザーは明確なエラー表示もないまま注文を確定できませんでした。左ペインの一番下までスクロールします。ここには、ユーザーのブラウザからのネットワークおよびコンソールイベントが含まれています。`/api/checkout` 呼び出し時に 500 エラーが発生していることに気付くはずです。

<Image img={hyperdx_13} alt="Error in session" size="lg"/>

この `500` エラーを選択します。`Overview` と `Column Values` のどちらにも、`Internal Error` を引き起こす予期しないエラーであること以外には、問題の原因は示されていません。



## トレースを探索する {#explore-traces}

`Trace` タブに移動して、完全な分散トレースを確認します。 

<Image img={hyperdx_14} alt="セッショントレース" size="lg"/>

トレースを下にスクロールして、エラーの発生元である `checkout` サービスのスパンを確認します。続いて `Payment` サービスのスパンを選択します。 

<Image img={hyperdx_15} alt="スパン" size="lg"/>

`Column Values` タブを選択して下にスクロールします。キャッシュがいっぱいになっていることが問題に関連していると分かります。

<Image img={hyperdx_16} alt="カラム値" size="lg"/>

トレースビューに戻って上にスクロールすると、先ほど行った設定により、ログがスパンと相関付けられていることが分かります。これにより、より詳細な状況を把握できます。

<Image img={hyperdx_17} alt="相関付けられたログ" size="lg"/>

これにより、`payment` サービスでキャッシュが埋まってしまい、そのせいで支払い処理が完了しなくなっていることが分かりました。 



## ログを探索する {#explore-logs}

詳細を確認するには、[`Search` ビュー](http://localhost:8080/search) に戻ります。

ソースから `Logs` を選択し、`payment` サービスでフィルターをかけます。

<Image img={hyperdx_18} alt="Logs" size="lg"/>

問題は最近発生したものですが、影響を受けた決済件数が多いことがわかります。さらに、Visa 決済に関連するキャッシュが原因となっているように見受けられます。



## チャートメトリクス {#chart-metrics}

コードに明らかにエラーが導入されていますが、メトリクスを使用してキャッシュサイズを確認できます。`Chart Explorer`ビューに移動します。

データソースとして`Metrics`を選択します。チャートビルダーで`visa_validation_cache.size (Gauge)`の`Maximum`をプロットし、再生ボタンを押します。キャッシュは最大サイズに達するまで増加し続け、その後エラーが生成されました。

<Image img={hyperdx_19} alt='Metrics' size='lg' />

</VerticalStepper>
