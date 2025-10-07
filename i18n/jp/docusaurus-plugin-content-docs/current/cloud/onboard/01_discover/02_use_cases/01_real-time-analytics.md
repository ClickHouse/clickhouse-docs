---
'slug': '/cloud/get-started/cloud/use-cases/real-time-analytics'
'title': 'リアルタイム分析'
'description': 'Learn how to build リアルタイム analytics applications with ClickHouse Cloud
  for instant insights and data-driven decision making'
'keywords':
- 'use cases'
- 'real-time analytics'
'sidebar_label': 'リアルタイム分析'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import rta_0 from '@site/static/images/cloud/onboard/discover/use_cases/0_rta.png';
import rta_1 from '@site/static/images/cloud/onboard/discover/use_cases/1_rta.png';
import rta_2 from '@site/static/images/cloud/onboard/discover/use_cases/2_rta.png';
import rta_3 from '@site/static/images/cloud/onboard/discover/use_cases/3_rta.png';

<iframe width="758" height="426" src="https://www.youtube.com/embed/SnFff0KYwuo?si=aNpGzSobzFhUlyX5" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## リアルタイム分析とは何ですか？ {#what-is-real-time-analytics}

リアルタイム分析とは、データが生成されるとすぐにエンドユーザーや顧客に洞察を提供するデータ処理を指します。これは、データがバッチで収集され、生成後に長い時間を経て処理される伝統的なバッチ分析とは異なります。

リアルタイム分析システムは、時間で順序付けられた一連のイベントからなるイベントストリームの上に構築されています。イベントとは、すでに発生した何かです。これは、eコマースウェブサイトのショッピングカートにアイテムが追加されたり、IoTセンサーからの読み取りが発信されたり、サッカーの試合でのシュートなどが含まれます。

以下は、架空のIoTセンサーからのイベントの例です：

```json
{
  "deviceId": "sensor-001",
  "timestamp": "2023-10-05T14:30:00Z",
  "eventType": "temperatureAlert",
  "data": {
    "temperature": 28.5,
    "unit": "Celsius",
    "thresholdExceeded": true
  }
}
```

組織は、このようなイベントを集約・分析することで、顧客に関する洞察を発見できます。これは従来、バッチ分析を使用して行われており、次のセクションではバッチ分析とリアルタイム分析を比較します。

## リアルタイム分析とバッチ分析の比較 {#real-time-analytics-vs-batch-analytics}

以下の図は、個々のイベントの観点から見た典型的なバッチ分析システムの様子を示しています：

<Image img={rta_0} size="md" border alt="バッチ分析のダイアグラム" />

イベントが発生してから処理し、洞察を得るまでにかなりのギャップがあることがわかります。従来、この方法が唯一のデータ分析手段であり、データをバッチで処理するために人工的な時間境界を作成する必要がありました。たとえば、私たちは1日の終わりに収集されたすべてのデータを処理するかもしれません。この方法は多くのユースケースには機能しましたが、他のケースでは古いデータを扱うため最適ではなく、迅速にデータに反応することができません。

対照的に、リアルタイム分析システムでは、イベントが発生するとすぐに反応します。以下の図に示すように：

<Image img={rta_1} size="md" border alt="リアルタイム分析のダイアグラム" />

生成されるとほぼ同時にイベントから洞察を導き出すことができます。しかし、これはなぜ有用なのでしょうか？

## リアルタイム分析の利点 {#benefits-of-real-time-analytics}

今日の急速に変化する世界では、組織はリアルタイム分析に依存して、常に変化する状況に敏捷に対応する必要があります。リアルタイム分析システムは、ビジネスに多くの利点をもたらすことができます。

### より良い意思決定 {#better-decision-making}

リアルタイム分析を通じて、実行可能な洞察にアクセスすることで意思決定が改善されます。ビジネスオペレーターがイベントが発生しているのを見れると、タイムリーな介入がはるかに容易になります。

例えば、アプリケーションに変更を加え、その変更がユーザーエクスペリエンスに悪影響を及ぼしているかどうかを知りたい場合、必要であれば変更を元に戻すために、この情報をできるだけ早く知りたいと思います。リアルタイムでないアプローチでは、次の日までこの分析を待たなければならないかもしれません。その頃には多くのユーザーが不満を持つことになってしまいます。

### 新しい製品と収益の流れ {#new-products-and-revenue-streams}

リアルタイム分析は、ビジネスが新しい収益の流れを生み出すのを助けることができます。組織は、ユーザーが分析クエリ機能にアクセスできる新しいデータ中心の製品やサービスを開発できます。これらの製品は、ユーザーがアクセスのために支払う価値があるほど魅力的です。

さらに、既存のアプリケーションはより魅力的にすることができ、ユーザーのエンゲージメントと維持を向上させます。これにより、アプリケーションの使用が増え、組織の収益が増えます。

### 改善された顧客体験 {#improved-customer-experience}

リアルタイム分析を使用することで、ビジネスは顧客の行動、好み、ニーズに関する瞬時の洞察を得ることができます。これにより、ビジネスはタイムリーな支援を提供し、インタラクションをパーソナライズし、顧客が再度訪れたくなるようなより魅力的な体験を創造できます。

## リアルタイム分析のユースケース {#real-time-analytics-use-cases}

リアルタイム分析の実際の価値は、その実用的な応用を考慮する際に明らかになります。いくつかのユースケースを見てみましょう。

### 不正検出 {#fraud-detection}

不正検出とは、偽アカウントから支払い詐欺までの不正なパターンを検出することです。この不正をできるだけ早く検出し、疑わしい活動をフラグ付けし、必要に応じて取引をブロックし、アカウントを無効にする必要があります。

このユースケースは、医療、デジタルバンキング、金融サービス、小売など、さまざまな業界で使われます。

[Instacart](https://www.instacart.com/)は、北米でのオンライン食料品購買のリーダーであり、数百万のアクティブな顧客とショッパーを持っています。彼らは、詐欺検出プラットフォームであるYodaの一部としてClickHouseを使用しています。上述の一般的な種類の詐欺の他に、顧客とショッパーの共謀を検出しようとしています。

<Image img={rta_2} size="md" border alt="不正検出のためのリアルタイム分析" />

彼らは、リアルタイムの不正検出を可能にするClickHouseの以下の特性を特定しました：

> ClickHouseは、LSMツリーに基づくMergeTreeファミリーエンジンをサポートしています。
> これらは書き込みに最適化されており、大量のデータをリアルタイムで取り込むことに適しています。

> ClickHouseは、分析クエリ専用に設計・最適化されており、詐欺を示すパターンを継続的に分析するアプリケーションのニーズに完璧に適合します。

### 時間を要する意思決定 {#ftime-sensitive-decision-making}

時間に敏感な意思決定とは、ユーザーや組織が最も新しい情報に基づいて迅速に情報に基づいた選択をする必要がある状況を指します。リアルタイム分析は、ユーザーが動的な環境で情報に基づいた選択を行えるようにします。例えば、市場の変動に反応するトレーダーや、購買決定を下す消費者、リアルタイムの運用変更に適応する専門家などです。

Coinhallは、自社のユーザーに時間を経た価格動向に関するリアルタイムの洞察を提供するキャンドルスティックチャートを提供しています。このチャートは、各取引期間の始値、高値、安値、終値を示しています。彼らは、このようなタイプのクエリを迅速に、大量の同時ユーザーで実行する必要がありました。

<Image img={rta_3} size="md" border alt="時間を要する意思決定のためのリアルタイム分析" />

> パフォーマンスに関して言えば、ClickHouseが明らかに勝者であり、キャンドルスティッククエリを20ミリ秒で実行し、他のデータベースの400ミリ秒以上に比べて有利でした。最新価格クエリは8ミリ秒で実行され、次に良い性能であるSingleStoreの45ミリ秒を上回りました。最後に、ASOF JOINクエリは50ミリ秒で処理され、Snowflakeは20分かかり、Rocksetはタイムアウトしました。
