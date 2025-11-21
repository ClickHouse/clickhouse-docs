import Image from '@theme/IdealImage';
import clickpipesPricingFaq1 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_1.png';
import clickpipesPricingFaq2 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_2.png';
import clickpipesPricingFaq3 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_3.png';

<details>
  <summary>ClickPipes レプリカとは何ですか？</summary>

  ClickPipes は、ClickHouse Cloud サービスとは独立して実行およびスケールする専用インフラストラクチャを介して、
  リモートデータソースからデータを取り込みます。
  このため、専用のコンピュートレプリカを使用します。
  以下の図は、簡略化したアーキテクチャを示しています。

  ストリーミング ClickPipes の場合、ClickPipes レプリカはリモートデータソース（例: Kafka ブローカー）にアクセスし、
  データを取得して処理し、宛先の ClickHouse サービスに取り込みます。

  <Image img={clickpipesPricingFaq1} size="lg" alt="ClickPipes レプリカ - ストリーミング ClickPipes" border force />

  オブジェクトストレージ ClickPipes の場合は、
  ClickPipes レプリカがデータロードタスク
  （コピー対象ファイルの特定、状態の維持、パーティションの移動）をオーケストレーションする一方で、
  データ自体は ClickHouse サービスから直接取得されます。

  <Image img={clickpipesPricingFaq2} size="lg" alt="ClickPipes レプリカ - オブジェクトストレージ ClickPipes" border force />
</details>

<details>
  <summary>デフォルトのレプリカ数とそのサイズはどのくらいですか？</summary>

  各 ClickPipe のデフォルトは 1 個のレプリカで、2 GiB の RAM と 0.5 vCPU が割り当てられます。
  これは **0.25** ClickHouse コンピュートユニットに相当します（1 ユニット = 8 GiB RAM、2 vCPU）。
</details>

<details>
  <summary>ClickPipes レプリカはスケールできますか？</summary>

  はい。ストリーミング用の ClickPipes は、水平方向と垂直方向の両方にスケール可能です。
  水平スケーリングではスループットを高めるためにレプリカを追加し、垂直スケーリングでは、より負荷の高いワークロードを処理できるよう各レプリカに割り当てるリソース（CPU と RAM）を増やします。
  これは ClickPipe の作成時、または任意のタイミングで **Settings** -&gt; **Advanced Settings** -&gt; **Scaling** から設定できます。
</details>

<details>
  <summary>ClickPipes レプリカは何個必要ですか？</summary>

  ワークロードのスループットおよびレイテンシ要件によって異なります。
  まずはデフォルト値である 1 レプリカから開始し、レイテンシを計測したうえで、必要に応じてレプリカを追加することを推奨します。
  Kafka ClickPipes の場合は、Kafka ブローカーのパーティションもそれに合わせてスケールする必要がある点に注意してください。
  スケーリングのコントロールは、各ストリーミング ClickPipe の **Settings** から利用できます。

  <Image img={clickpipesPricingFaq3} size="lg" alt="ClickPipes レプリカ - ClickPipes レプリカは何個必要か？" border force />
</details>

<details>
  <summary>ClickPipes の料金体系はどのようになっていますか？</summary>

  2 つの要素で構成されています：

  * **Compute**: 1 ユニットあたりの時間単価\
    Compute は、ClickPipes レプリカのポッドがデータを実際に取り込んでいるかどうかに関わらず、それを実行するコストを表します。
    これはすべての ClickPipes タイプに適用されます。
  * **Ingested data**: 1 GB あたりの料金\
    取り込まれたデータに対する料金は、レプリカポッド経由で転送されるデータについて、
    すべてのストリーミング ClickPipes（Kafka、Confluent、Amazon MSK、Amazon Kinesis、Redpanda、WarpStream、
    Azure Event Hubs）に適用されます。
    取り込まれたデータサイズ（GB）は、ソースから受信したバイト数（非圧縮または圧縮）に基づいて課金されます。
</details>

<details>
  <summary>ClickPipes の公開価格はいくらですか？</summary>

  * Compute: 1 ユニットあたり 1 時間 $0.20（1 レプリカあたり 1 時間 $0.05）
  * Ingested data: 1 GB あたり $0.04
</details>

<details>
  <summary>具体例ではどのようになりますか？</summary>

  たとえば、単一のレプリカ（0.25 コンピュートユニット）を使用し、Kafka コネクタで 24 時間にわたって 1 TB のデータを取り込む場合、コストは次のようになります：

  $$
  (0.25 \times 0.20 \times 24) + (0.04 \times 1000) = $41.2
  $$

  <br />

  オブジェクトストレージコネクタ（S3 と GCS）の場合は、
  ClickPipes ポッドはデータ処理ではなく、
  基盤となる ClickHouse サービスによって実行される転送のオーケストレーションのみを行うため、
  ClickPipes のコンピュートコストのみが発生します：

  $$
  0.25 \times 0.20 \times 24 = $1.2
  $$
</details>


<details>

<summary>ClickPipes の料金は市場と比べてどうなっていますか？</summary>

ClickPipes の料金設計の考え方は、
プラットフォームの運用コストをカバーしつつ、データを ClickHouse Cloud に移動するための簡単で信頼性の高い手段を提供することにあります。
この観点から市場分析を行ったところ、当社の価格設定は競争力があると判断しています。

</details>