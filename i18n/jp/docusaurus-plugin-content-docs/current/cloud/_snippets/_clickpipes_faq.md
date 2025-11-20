import Image from '@theme/IdealImage';
import clickpipesPricingFaq1 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_1.png';
import clickpipesPricingFaq2 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_2.png';
import clickpipesPricingFaq3 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_3.png';

<details>
  <summary>ClickPipes レプリカとは何ですか？</summary>

  ClickPipes は、ClickHouse Cloud サービスとは独立して実行およびスケールする専用インフラストラクチャを介して、リモートデータソースからデータを取り込みます。
  このため、専用のコンピュートレプリカを使用します。
  以下の図は、簡略化したアーキテクチャを示しています。

  ストリーミング ClickPipes の場合、ClickPipes レプリカがリモートデータソース（例: Kafka ブローカー）にアクセスし、
  データを取得・処理して、宛先の ClickHouse サービスに取り込みます。

  <Image img={clickpipesPricingFaq1} size="lg" alt="ClickPipes レプリカ - ストリーミング ClickPipes" border force />

  オブジェクトストレージ ClickPipes の場合は、
  ClickPipes レプリカがデータロードタスク
  （コピー対象ファイルの特定、状態の維持、パーティションの移動）をオーケストレーションし、
  データ自体は ClickHouse サービスから直接取得されます。

  <Image img={clickpipesPricingFaq2} size="lg" alt="ClickPipes レプリカ - オブジェクトストレージ ClickPipes" border force />
</details>

<details>
  <summary>デフォルトのレプリカ数とサイズはどのくらいですか？</summary>

  各 ClickPipe のデフォルトはレプリカ 1 個で、2 GiB の RAM と 0.5 vCPU が割り当てられています。
  これは **0.25** ClickHouse コンピュートユニット（1 ユニット = 8 GiB RAM、2 vCPU）に相当します。
</details>

<details>
  <summary>ClickPipes レプリカはスケールできますか？</summary>

  はい。ストリーミング向けの ClickPipes は、水平方向と垂直方向の両方にスケールできます。
  水平スケーリングはスループットを増やすためにレプリカを追加し、垂直スケーリングは各レプリカに割り当てられるリソース（CPU と RAM）を増やして、より負荷の高いワークロードに対応します。
  これは ClickPipe の作成時、または任意のタイミングで **Settings** -&gt; **Advanced Settings** -&gt; **Scaling** から設定できます。
</details>

<details>
  <summary>ClickPipes レプリカはいくつ必要ですか？</summary>

  ワークロードのスループットとレイテンシ要件によって異なります。
  まずはレプリカ 1 個というデフォルト値から始めてレイテンシを計測し、必要に応じてレプリカを追加することをお勧めします。
  Kafka ClickPipes の場合には、Kafka ブローカーのパーティションもそれに応じてスケールさせる必要があることに注意してください。
  スケーリングのコントロールは、各ストリーミング ClickPipe の「settings」で利用できます。

  <Image img={clickpipesPricingFaq3} size="lg" alt="ClickPipes レプリカ - ClickPipes レプリカはいくつ必要ですか？" border force />
</details>

<details>
  <summary>ClickPipes の料金体系はどのようになっていますか？</summary>

  2 つの要素で構成されています:

  * **Compute**: 1 ユニットあたり 1 時間単位の料金\
    Compute は、ClickPipes レプリカ Pod がデータを実際に取り込んでいるかどうかに関わらず、それを実行するためのコストを表します。
    すべての種類の ClickPipes に適用されます。
  * **Ingested data**: 1 GB あたりの料金\
    取り込まれたデータ料金は、ストリーミング ClickPipes
    （Kafka、Confluent、Amazon MSK、Amazon Kinesis、Redpanda、WarpStream、
    Azure Event Hubs）において、レプリカ Pod を経由して転送されるデータに適用されます。
    取り込まれたデータサイズ（GB）は、ソースから受信したバイト数（非圧縮または圧縮）に基づいて課金されます。
</details>

<details>
  <summary>ClickPipes の公開価格はいくらですか？</summary>

  * Compute: 1 ユニットあたり 1 時間 $0.20（レプリカ 1 個あたり 1 時間 $0.05）
  * Ingested data: 1 GB あたり $0.04
</details>

<details>
  <summary>具体例ではどのようになりますか？</summary>

  例えば、単一レプリカ（0.25 コンピュートユニット）の Kafka コネクタを使用して、24 時間で 1 TB のデータを取り込む場合のコストは次のとおりです:

  $$
  (0.25 \times 0.20 \times 24) + (0.04 \times 1000) = $41.2
  $$

  <br />

  オブジェクトストレージコネクタ（S3 および GCS）の場合、
  ClickPipes Pod はデータ処理を行わず、
  基盤となる ClickHouse サービスによって実行される転送をオーケストレーションするだけなので、
  ClickPipes のコンピュートコストのみが発生します:

  $$
  0.25 \times 0.20 \times 24 = $1.2
  $$
</details>


<details>

<summary>ClickPipes の料金は市場と比べてどうですか？</summary>

ClickPipes の料金に関する基本的な考え方は、
プラットフォームの運用コストをまかないつつ、ClickHouse Cloud へデータを移動するための、簡便で信頼性の高い手段を提供することです。
こうした観点から市場分析を行った結果、当社の料金は競争力のある水準にあることが分かりました。

</details>