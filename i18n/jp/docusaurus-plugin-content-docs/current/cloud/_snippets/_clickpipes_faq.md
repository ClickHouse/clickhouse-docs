import Image from '@theme/IdealImage';
import clickpipesPricingFaq1 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_1.png';
import clickpipesPricingFaq2 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_2.png';
import clickpipesPricingFaq3 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_3.png';

<details>
  <summary>ClickPipes のレプリカとは何ですか？</summary>

  ClickPipes は、ClickHouse Cloud サービスとは独立して実行およびスケールする専用インフラストラクチャ経由で、
  リモートのデータソースからデータを取り込みます。
  このため、専用のコンピュートレプリカを使用します。
  以下の図は、アーキテクチャを簡略化して示したものです。

  ストリーミング ClickPipes の場合、ClickPipes レプリカはリモートデータソース（例：Kafka ブローカー）にアクセスし、
  データを取得して処理し、宛先の ClickHouse サービスに取り込みます。

  <Image img={clickpipesPricingFaq1} size="lg" alt="ClickPipes レプリカ - ストリーミング ClickPipes" border force />

  オブジェクトストレージ ClickPipes の場合は、
  ClickPipes レプリカがデータロードタスク
  （コピー対象ファイルの特定、状態の維持、パーティションの移動）をオーケストレーションし、
  データ自体は ClickHouse サービスから直接取得されます。

  <Image img={clickpipesPricingFaq2} size="lg" alt="ClickPipes レプリカ - オブジェクトストレージ ClickPipes" border force />
</details>

<details>
  <summary>デフォルトのレプリカ数とサイズはどのくらいですか？</summary>

  各 ClickPipe のデフォルトはレプリカ 1 基で、2 GiB の RAM と 0.5 vCPU が割り当てられます。
  これは **0.25** ClickHouse コンピュートユニット（1 ユニット = 8 GiB RAM、2 vCPU）に相当します。
</details>

<details>
  <summary>ClickPipes レプリカはスケールできますか？</summary>

  はい。ストリーミング用の ClickPipes は、水平方向と垂直方向の両方にスケールできます。
  水平スケーリングではスループット向上のためにレプリカ数を増やし、垂直スケーリングでは各レプリカに割り当てるリソース（CPU と RAM）を増やして、より負荷の高いワークロードに対応します。
  これは ClickPipe 作成時、またはそれ以外の任意のタイミングで **Settings** -&gt; **Advanced Settings** -&gt; **Scaling** から設定できます。
</details>

<details>
  <summary>ClickPipes レプリカはいくつ必要ですか？</summary>

  ワークロードのスループットおよびレイテンシ要件によって異なります。
  まずはデフォルト値のレプリカ 1 基から開始し、レイテンシを計測したうえで、必要に応じてレプリカを追加することをお勧めします。
  Kafka ClickPipes の場合は、Kafka ブローカーのパーティションも同様にスケールさせる必要があることに注意してください。
  スケーリングのコントロールは、各ストリーミング ClickPipe の「settings」から利用できます。

  <Image img={clickpipesPricingFaq3} size="lg" alt="ClickPipes レプリカ - ClickPipes レプリカはいくつ必要ですか？" border force />
</details>

<details>
  <summary>ClickPipes の料金体系はどのようになっていますか？</summary>

  2 つの要素で構成されています：

  * **Compute**: ユニットあたりの時間単価\
    Compute は、ClickPipes レプリカの pod が実際にデータを取り込んでいるかどうかにかかわらず、その実行コストを表します。
    これはすべての ClickPipes タイプに適用されます。
  * **Ingested data**: GB あたりの単価\
    取り込まれたデータレートは、レプリカの pod を経由して転送されるデータについて、すべてのストリーミング ClickPipes
    （Kafka、Confluent、Amazon MSK、Amazon Kinesis、Redpanda、WarpStream、
    Azure Event Hubs）に適用されます。
    取り込まれたデータサイズ（GB）は、ソースから受信したバイト数（非圧縮・圧縮いずれの場合も）に基づいて課金されます。
</details>

<details>
  <summary>ClickPipes のパブリック価格はいくらですか？</summary>

  * Compute: ユニットあたり 1 時間 $0.20（レプリカあたり 1 時間 $0.05）
  * 取り込まれたデータ: 1 GB あたり $0.04
</details>

<details>
  <summary>具体例ではどのようになりますか？</summary>

  たとえば、Kafka コネクタを使用し、単一レプリカ（0.25 compute unit）で 24 時間にわたって 1 TB のデータを取り込む場合のコストは次のとおりです：

  $$
  (0.25 \times 0.20 \times 24) + (0.04 \times 1000) = $41.2
  $$

  <br />

  オブジェクトストレージコネクタ（S3 および GCS）の場合、
  ClickPipes の pod はデータを処理せず、
  基盤となる ClickHouse サービスが実行する転送をオーケストレーションするだけなので、
  ClickPipes の compute コストのみが発生します：

  $$
  0.25 \times 0.20 \times 24 = $1.2
  $$
</details>


<details>

<summary>ClickPipes の料金は市場と比べてどうですか？</summary>

ClickPipes の料金設計の基本的な考え方は、
プラットフォームの運用コストをまかないつつ、データを ClickHouse Cloud に移行するための簡単で信頼性の高い方法を提供することです。
この観点から市場を分析した結果、当社の価格設定は十分に競争力があると判断しています。

</details>