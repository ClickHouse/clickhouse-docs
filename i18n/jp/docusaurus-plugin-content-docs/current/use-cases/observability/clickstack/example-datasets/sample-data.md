---
'slug': '/use-cases/observability/clickstack/getting-started/sample-data'
'title': 'サンプルログ、トレースおよびメトリクス'
'sidebar_position': 0
'pagination_prev': null
'pagination_next': null
'description': 'ClickStackを使用して、ログ、セッション、トレースおよびメトリクスを含むサンプルデータセットを使用して始めましょう'
'doc_type': 'guide'
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



# ClickStack - サンプルログ、トレース、およびメトリクス {#clickstack-sample-dataset}

以下の例は、[オールインワンイメージのインストラクション](/use-cases/observability/clickstack/getting-started)を使用してClickStackを開始し、[ローカルClickHouseインスタンス](/use-cases/observability/clickstack/getting-started#complete-connection-credentials)または[ClickHouse Cloudインスタンス](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)に接続したことを前提としています。

:::note ClickHouse CloudにおけるHyperDX
このサンプルデータセットは、HyperDXをClickHouse Cloudで使用する場合にも利用できます。流れに若干の調整が必要ですが記載されています。ClickHouse CloudでHyperDXを使用する場合、ユーザーは[このデプロイメントモデルのための始め方ガイド](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)で説明されているように、ローカルでOpen Telemetryコレクターを実行する必要があります。
:::

<VerticalStepper>

## HyperDX UIに移動する {#navigate-to-the-hyperdx-ui}

ローカルにデプロイしている場合は、[http://localhost:8080](http://localhost:8080)にアクセスしてHyperDX UIを開きます。ClickHouse CloudでHyperDXを使用している場合は、左のメニューからサービスと`HyperDX`を選択します。

<Image img={hyperdx} alt="HyperDX UI" size="lg"/>

## 取り込みAPIキーをコピーする {#copy-ingestion-api-key}

:::note ClickHouse CloudにおけるHyperDX
ClickHouse CloudでHyperDXを使用している場合、このステップは必要ありません。そこでは現在、取り込みキーのサポートがありません。
:::

[`チーム設定`](http://localhost:8080/team)に移動し、`APIキー`セクションから`取り込みAPIキー`をコピーします。このAPIキーは、OpenTelemetryコレクターを通じたデータ取り込みのセキュリティを保証します。

<Image img={copy_api_key} alt="APIキーをコピー" size="lg"/>

## サンプルデータをダウンロードする {#download-sample-data}

UIにサンプルデータを表示するために、以下のファイルをダウンロードします：

[サンプルデータ](https://storage.googleapis.com/hyperdx/sample.tar.gz)

```shell

# curl
curl -O https://storage.googleapis.com/hyperdx/sample.tar.gz

# or

# wget https://storage.googleapis.com/hyperdx/sample.tar.gz
```

このファイルには、私たちの公開された[OpenTelemetryデモ](https://github.com/ClickHouse/opentelemetry-demo)からの例示的なログ、メトリクス、トレースが含まれています。これは、マイクロサービスを持つシンプルなeコマースストアです。このファイルをお好みのディレクトリにコピーしてください。

## サンプルデータをロードする {#load-sample-data}

このデータをロードするために、展開したOpenTelemetry (OTel) コレクターのHTTPエンドポイントに送信します。

まず、上記でコピーしたAPIキーをエクスポートします。

:::note ClickHouse CloudにおけるHyperDX
ClickHouse CloudでHyperDXを使用している場合、このステップは必要ありません。そこでは現在、取り込みキーのサポートがありません。
:::

```shell

# export API key
export CLICKSTACK_API_KEY=<YOUR_INGESTION_API_KEY>
```

次のコマンドを実行してデータをOTelコレクターに送信します：

```shell
for filename in $(tar -tf sample.tar.gz); do
  endpoint="http://localhost:4318/v1/${filename%.json}"
  echo "loading ${filename%.json}"
  tar -xOf sample.tar.gz "$filename" | while read -r line; do
    echo "$line" | curl -s -o /dev/null -X POST "$endpoint" \
    -H "Content-Type: application/json" \
    -H "authorization: ${CLICKSTACK_API_KEY}" \
    --data-binary @-
  done
done
```

これにより、OTLPログ、トレース、およびメトリックソースがOTelコレクターにデータを送信することをシミュレートします。製品環境では、これらのソースは言語クライアントまたは他のOTelコレクターである可能性があります。

`サーチ`ビューに戻ると、データのロードが始まっていることが確認できるはずです（データが表示されない場合は、時間枠を`直近1時間`に調整してください）。

<Image img={hyperdx_10} alt="HyperDX サーチ" size="lg"/>

データのロードには数分かかりますので、次のステップに進む前にロードが完了するのを待ってください。

## セッションを探る {#explore-sessions}

ユーザーが商品購入時に問題を抱えているとの報告があるとしましょう。私たちはHyperDXのセッションリプレイ機能を使用して、彼らの体験を確認できます。

左のメニューから[`クライアントセッション`](http://localhost:8080/sessions?from=1747312320000&to=1747312920000&sessionSource=l1324572572)を選択します。

<Image img={hyperdx_11} alt="セッション" size="lg"/>

このビューでは、当社のeコマースストアのフロントエンドセッションを確認できます。ユーザーがチェックアウトし、購入を完了しようとするまで、セッションは匿名のままです。

メールアドレスを含むセッションの中には、取引の失敗の報告を確認しかねない関連エラーが発生しているものがあります。

失敗と関連するメールを選択したトレースを選ぶと、ユーザーのセッションを再生し、問題を確認することができます。再生ボタンを押してセッションを視聴しましょう。

<Image img={hyperdx_12} alt="セッションリプレイ" size="lg"/>

再生では、ユーザーがサイトを巡回し、カートにアイテムを追加する様子が表示されます。支払いを完了しようとするセッションの後半にスキップしても構いません。

:::tip
エラーは赤色でタイムラインに注釈が付けられています。
:::

ユーザーは、明らかなエラーもなく、注文を出すことができませんでした。左パネルの下部にスクロールして、ユーザーのブラウザからのネットワークおよびコンソールイベントが含まれている部分を確認してください。`/api/checkout`の呼び出し時に500エラーが発生したことがわかります。

<Image img={hyperdx_13} alt="セッション内のエラー" size="lg"/>

この`500`エラーを選択します。`概要`および`カラム値`は、問題の原因を示すものではなく、エラーが予期しないものであり、`内部エラー`を引き起こす可能性があることのみを示しています。

## トレースを探る {#explore-traces}

`トレース`タブに移動して、全体の分散トレースを確認します。

<Image img={hyperdx_14} alt="セッション トレース" size="lg"/>

トレースを下にスクロールして、エラーの発生源である`checkout`サービススパンを確認します。`Payment`サービススパンを選択します。

<Image img={hyperdx_15} alt="スパン" size="lg"/>

`カラム値`タブを選択し、下にスクロールします。ここでは、キャッシュが満杯であることに関連する問題が示されています。

<Image img={hyperdx_16} alt="カラム値" size="lg"/>

上にスクロールしてトレースに戻ると、前回の設定のおかげでスパンに関連付けられたログが確認できます。これらはさらなる文脈を提供します。

<Image img={hyperdx_17} alt="関連付けられたログ" size="lg"/>

キャッシュが決済サービスで満杯になっていることが確認できており、それが決済の完了を妨げています。

## ログを探る {#explore-logs}

さらに詳細を知るために、[`サーチ`ビュー](http://localhost:8080/search)に戻ります：

ソースから`ログ`を選択し、`payment`サービスにフィルターを適用します。

<Image img={hyperdx_18} alt="ログ" size="lg"/>

問題は最近発生していますが、影響を受けた決済の数は多いことがわかります。さらに、Visa決済に関連するキャッシュが問題を引き起こしているようです。

## メトリクスをチャート表示する {#chart-metrics}

コード内に明らかなエラーが導入されていることは間違いありませんが、メトリクスを使用してキャッシュサイズを確認できます。`チャートエクスプローラー`ビューに移動します。

データソースとして`メトリクス`を選択します。`visa_validation_cache.size (Gauge)`の`最大値`をプロットするためにチャートビルダーを完成させ、再生ボタンを押します。キャッシュは明らかに最大サイズに達する前に増加しており、その後エラーが生成されました。

<Image img={hyperdx_19} alt="メトリクス" size="lg"/>

</VerticalStepper>
