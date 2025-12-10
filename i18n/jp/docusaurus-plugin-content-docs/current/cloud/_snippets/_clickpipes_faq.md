import Image from '@theme/IdealImage';
import clickpipesPricingFaq1 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_1.png';
import clickpipesPricingFaq2 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_2.png';
import clickpipesPricingFaq3 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_3.png';

<details>
  <summary>ClickPipes のレプリカとは何ですか？</summary>

  ClickPipes は、専用のインフラストラクチャを介してリモートのデータソースからデータを取り込みます。
  このインフラストラクチャは ClickHouse Cloud サービスとは独立して実行およびスケールします。
  このため、専用のコンピュートレプリカを使用します。
  以下の図は、簡略化したアーキテクチャを示しています。

  ストリーミング ClickPipes の場合、ClickPipes レプリカはリモートのデータソース（例: Kafka ブローカー）にアクセスし、
  データを取得して処理し、宛先の ClickHouse サービスに取り込みます。

  <Image img={clickpipesPricingFaq1} size="lg" alt="ClickPipes レプリカ - ストリーミング ClickPipes" border force />

  オブジェクトストレージ ClickPipes の場合は、
  ClickPipes レプリカがデータ読み込みタスク
  （コピーするファイルの特定、状態の維持、パーティションの移動）をオーケストレーションし、
  データ自体は ClickHouse サービスから直接取得されます。

  <Image img={clickpipesPricingFaq2} size="lg" alt="ClickPipes レプリカ - オブジェクトストレージ ClickPipes" border force />
</details>

<details>
  <summary>レプリカのデフォルト数とサイズはどうなっていますか？</summary>

  各 ClickPipe のデフォルトは 1 レプリカで、2 GiB の RAM と 0.5 vCPU が割り当てられています。
  これは **0.25** ClickHouse コンピュートユニット（1 ユニット = 8 GiB RAM、2 vCPU）に相当します。
</details>

<details>
  <summary>ClickPipes レプリカはスケールできますか？</summary>

  はい。ストリーミング用の ClickPipes は、水平方向・垂直方向の両方にスケールできます。
  水平スケーリングではスループットを高めるためにレプリカを追加し、垂直スケーリングでは各レプリカに割り当てられるリソース（CPU と RAM）を増やして、より負荷の高いワークロードを処理できるようにします。
  これは ClickPipe の作成時、またはその後いつでも **Settings** -&gt; **Advanced Settings** -&gt; **Scaling** から設定できます。
</details>

<details>
  <summary>ClickPipes レプリカはいくつ必要ですか？</summary>

  ワークロードのスループットおよびレイテンシ要件によって異なります。
  まずはデフォルト値の 1 レプリカから開始し、レイテンシを計測し、必要に応じてレプリカを追加することを推奨します。
  Kafka ClickPipes の場合は、Kafka ブローカーのパーティションもそれに合わせてスケールする必要がある点に注意してください。
  スケーリングのコントロールは、各ストリーミング ClickPipe の **Settings** から利用できます。

  <Image img={clickpipesPricingFaq3} size="lg" alt="ClickPipes レプリカ - ClickPipes レプリカはいくつ必要ですか？" border force />
</details>

<details>
  <summary>ClickPipes の料金体系はどのようになっていますか？</summary>

  2 つの要素で構成されています:

  * **Compute**: ユニットあたり時間単価\
    Compute は、ClickPipes レプリカのポッドが実際にデータを取り込んでいるかどうかに関わらず、稼働していることに対するコストを表します。
    これはすべての ClickPipes タイプに適用されます。
  * **Ingested data**: GB あたりの料金\
    取り込まれたデータレートは、すべてのストリーミング ClickPipes
    （Kafka、Confluent、Amazon MSK、Amazon Kinesis、Redpanda、WarpStream、
    Azure Event Hubs）で、レプリカのポッドを経由して転送されるデータに適用されます。
    取り込まれたデータサイズ（GB）は、ソースから受信したバイト数（非圧縮または圧縮）に基づいて課金されます。
</details>

<details>
  <summary>ClickPipes の公開価格はいくらですか？</summary>

  * Compute: ユニットあたり 1 時間 $0.20（レプリカあたり 1 時間 $0.05）
  * 取り込まれたデータ: 1 GB あたり $0.04
</details>

<details>
  <summary>概算の例はどのようになりますか？</summary>

  例として、Kafka コネクタを使用し、単一レプリカ（0.25 コンピュートユニット）で 24 時間に 1 TB のデータを取り込む場合のコストは次のとおりです。

  $$
  (0.25 \times 0.20 \times 24) + (0.04 \times 1000) = $41.2
  $$

  <br />

  オブジェクトストレージコネクタ（S3 および GCS）の場合、
  ClickPipes のポッドはデータを処理せず、
  基盤となる ClickHouse サービスによって実行される転送をオーケストレーションするだけなので、
  ClickPipes のコンピュートコストのみが発生します:

  $$
  0.25 \times 0.20 \times 24 = $1.2
  $$
</details>


<details>

<summary>ClickPipes の料金は市場水準と比べてどうですか？</summary>

ClickPipes の料金体系の基本的な考え方は、
プラットフォームの運用コストをカバーしつつ、ClickHouse Cloud へデータを移動するための簡単で信頼性の高い手段を提供することにあります。
その観点から実施した市場分析の結果、当社の料金設定は競争力があると考えています。

</details>