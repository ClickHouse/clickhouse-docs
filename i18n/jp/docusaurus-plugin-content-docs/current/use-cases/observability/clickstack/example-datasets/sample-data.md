---
slug: /use-cases/observability/clickstack/getting-started/sample-data
title: 'サンプルログ、トレース、メトリクス'
sidebar_position: 0
pagination_prev: null
pagination_next: null
description: 'ClickStack とログ、セッション、トレース、メトリクスを含むサンプルデータセットの利用開始'
doc_type: 'guide'
keywords: ['clickstack', 'example data', 'sample dataset', 'logs', 'observability']
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
このサンプルデータセットは、ClickHouse CloudのHyperDXでも使用可能です。フローに若干の調整が必要となりますが、その詳細は記載されています。ClickHouse CloudでHyperDXを使用する場合、[このデプロイメントモデルの入門ガイド](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)に記載されているように、Open Telemetryコレクターをローカル環境で実行する必要があります。
:::

<VerticalStepper>


## HyperDX UIへのアクセス {#navigate-to-the-hyperdx-ui}

ローカルにデプロイしている場合は、[http://localhost:8080](http://localhost:8080)にアクセスしてHyperDX UIを開きます。ClickHouse CloudでHyperDXを使用している場合は、サービスを選択し、左側のメニューから`HyperDX`を選択してください。

<Image img={hyperdx} alt='HyperDX UI' size='lg' />


## 取り込みAPIキーのコピー {#copy-ingestion-api-key}

:::note ClickHouse CloudでのHyperDX
ClickHouse CloudでHyperDXを使用する場合、取り込みキーのサポートが現在提供されていないため、この手順は不要です。
:::

[`Team Settings`](http://localhost:8080/team)に移動し、`API Keys`セクションから`Ingestion API Key`をコピーしてください。このAPIキーにより、OpenTelemetryコレクターを介したデータ取り込みが安全に実行されます。

<Image img={copy_api_key} alt='APIキーのコピー' size='lg' />


## サンプルデータのダウンロード {#download-sample-data}

UIにサンプルデータを読み込むには、以下のファイルをダウンロードしてください:

[サンプルデータ](https://storage.googleapis.com/hyperdx/sample.tar.gz)


```shell
# curl
curl -O https://storage.googleapis.com/hyperdx/sample.tar.gz
# または
# wget https://storage.googleapis.com/hyperdx/sample.tar.gz
```

このファイルには、公開中の [OpenTelemetry デモ](https://github.com/ClickHouse/opentelemetry-demo)（マイクロサービスで構成されたシンプルな EC サイト）から取得したログ、メトリクス、トレースのサンプルが含まれています。このファイルを任意のディレクトリにコピーしてください。


## サンプルデータの読み込み {#load-sample-data}

このデータを読み込むには、デプロイ済みのOpenTelemetry（OTel）コレクターのHTTPエンドポイントに送信します。

まず、上記でコピーしたAPIキーをエクスポートします。

:::note ClickHouse CloudのHyperDX
ClickHouse CloudでHyperDXを使用する場合、この手順は不要です。現在、取り込みキーはサポートされていません。
:::


```shell
# APIキーをエクスポート
export CLICKSTACK_API_KEY=<YOUR_INGESTION_API_KEY>
```

次のコマンドを実行して、データを OTel コレクターに送信します。

```shell
for filename in $(tar -tf sample.tar.gz); do
  endpoint="http://localhost:4318/v1/${filename%.json}"
  echo "${filename%.json}を読み込み中"
  tar -xOf sample.tar.gz "$filename" | while read -r line; do
    printf '%s\n' "$line" | curl -s -o /dev/null -X POST "$endpoint" \
    -H "Content-Type: application/json" \
    -H "authorization: ${CLICKSTACK_API_KEY}" \
    --data-binary @-
  done
done
```

これは、OTLP 形式のログ、トレース、メトリクスの送信元が OTel コレクターにデータを送信する動作をシミュレートします。本番環境では、これらの送信元は各種言語クライアントや、他の OTel コレクターである場合もあります。

`Search` ビューに戻ると、データの読み込みが始まっているはずです（データが表示されない場合は、時間範囲を `Last 1 hour` に調整してください）:

<Image img={hyperdx_10} alt="HyperDX search" size="lg" />

データの読み込みには数分かかる場合があります。次のステップに進む前に、読み込みが完了するまでお待ちください。


## セッションの調査 {#explore-sessions}

ユーザーが商品の支払いに問題を抱えているという報告があるとします。HyperDXのセッションリプレイ機能を使用して、ユーザーの体験を確認できます。

左側のメニューから[`Client Sessions`](http://localhost:8080/sessions?from=1747312320000&to=1747312920000&sessionSource=l1324572572)を選択します。

<Image img={hyperdx_11} alt='Sessions' size='lg' />

このビューでは、eコマースストアのフロントエンドセッションを確認できます。セッションは、ユーザーがチェックアウトして購入を完了しようとするまで匿名のままです。

メールアドレスが関連付けられた一部のセッションにはエラーが発生しており、取引失敗の報告を裏付けている可能性があります。

失敗とメールアドレスが関連付けられたトレースを選択します。次のビューでは、ユーザーのセッションを再生して問題を確認できます。再生ボタンを押してセッションを視聴します。

<Image img={hyperdx_12} alt='Session replay' size='lg' />

リプレイでは、ユーザーがサイトを閲覧し、カートに商品を追加する様子が表示されます。セッションの後半で支払いを完了しようとする場面まで自由にスキップできます。

:::tip
すべてのエラーはタイムライン上に赤色で注釈されます。
:::

ユーザーは注文を完了できず、明確なエラーは表示されませんでした。ユーザーのブラウザからのネットワークイベントとコンソールイベントを含む左パネルの下部までスクロールします。`/api/checkout`の呼び出し時に500エラーが発生していることがわかります。

<Image img={hyperdx_13} alt='Error in session' size='lg' />

この`500`エラーを選択します。`Overview`も`Column Values`も、エラーが予期しないものであり`Internal Error`を引き起こしているという事実以外に、問題の原因を示していません。


## トレースの調査 {#explore-traces}

`Trace`タブに移動して、完全な分散トレースを表示します。

<Image img={hyperdx_14} alt='セッショントレース' size='lg' />

トレースを下にスクロールして、エラーの発生元である`checkout`サービススパンを確認します。`Payment`サービススパンを選択します。

<Image img={hyperdx_15} alt='スパン' size='lg' />

`Column Values`タブを選択して下にスクロールします。この問題はキャッシュが満杯になっていることに起因していることが確認できます。

<Image img={hyperdx_16} alt='カラム値' size='lg' />

上にスクロールしてトレースに戻ると、先ほどの設定により、ログがスパンと関連付けられていることが確認できます。これらは追加のコンテキストを提供します。

<Image img={hyperdx_17} alt='関連付けられたログ' size='lg' />

決済サービス内のキャッシュが満杯になっており、それが決済の完了を妨げていることが確認されました。


## ログの調査 {#explore-logs}

詳細を確認するには、[`Search` ビュー](http://localhost:8080/search)に戻ります:

ソースから `Logs` を選択し、`payment` サービスにフィルタを適用します。

<Image img={hyperdx_18} alt='Logs' size='lg' />

この問題は最近発生したものですが、影響を受けた決済の数が多いことが確認できます。さらに、Visa決済に関連するキャッシュが問題の原因となっているようです。


## チャートメトリクス {#chart-metrics}

コードに明らかにエラーが導入されていますが、メトリクスを使用してキャッシュサイズを確認できます。`Chart Explorer`ビューに移動します。

データソースとして`Metrics`を選択します。チャートビルダーを使用して`visa_validation_cache.size (Gauge)`の`Maximum`をプロットし、再生ボタンを押します。キャッシュは最大サイズに達するまで増加し続け、その後エラーが発生しました。

<Image img={hyperdx_19} alt='メトリクス' size='lg' />

</VerticalStepper>
