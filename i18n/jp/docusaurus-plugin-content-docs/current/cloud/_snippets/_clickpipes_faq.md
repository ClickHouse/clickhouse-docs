

import Image from '@theme/IdealImage';
import clickpipesPricingFaq1 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_1.png';
import clickpipesPricingFaq2 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_2.png';
import clickpipesPricingFaq3 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_3.png';

<details>

<summary>ClickPipesのレプリカとは何ですか？</summary>

ClickPipesは、ClickHouse Cloudサービスとは独立して実行およびスケーリングされる専用のインフラストラクチャを介して、リモートデータソースからデータを取り込みます。
この理由から、専用の計算レプリカを使用します。
以下の図は、簡略化されたアーキテクチャを示しています。

ストリーミング ClickPipesの場合、ClickPipesレプリカはリモートデータソース（例：Kafkaブローカー）にアクセスし、
データを取得して処理し、宛先のClickHouseサービスに取り込みます。

<Image img={clickpipesPricingFaq1} size="lg" alt="ClickPipes レプリカ - ストリーミング ClickPipes" border force/>

オブジェクトストレージ ClickPipesの場合、
ClickPipesレプリカはデータロードタスクを調整します
（コピーするファイルを特定し、状態を維持し、パーティションを移動する）、
データはClickHouseサービスから直接取得されます。

<Image img={clickpipesPricingFaq2} size="lg" alt="ClickPipes レプリカ - オブジェクトストレージ ClickPipes" border force/>

</details>

<details>

<summary>デフォルトのレプリカ数とそのサイズはどのようになりますか？</summary>

各ClickPipeは、2 GiBのRAMと0.5 vCPUを備えた1つのレプリカがデフォルトです。
これは、**0.25** ClickHouseの計算ユニットに相当します（1ユニット = 8 GiB RAM、2 vCPU）。

</details>

<details>

<summary>ClickPipesのレプリカはスケールできますか？</summary>

はい、ストリーミングのClickPipesは、水平および垂直にスケール可能です。
水平スケーリングは、スループットを増加させるために追加のレプリカを加え、垂直スケーリングは、より集中的なワークロードを処理するために各レプリカに割り当てるリソース（CPUとRAM）を増加させます。
これはClickPipeの作成時や、**設定** -> **高度な設定** -> **スケーリング**の任意の時点で構成できます。

</details>

<details>

<summary>ClickPipesのレプリカはどのくらい必要ですか？</summary>

これは、ワークロードのスループットとレイテンシ要件によります。
デフォルトの1レプリカから始め、レイテンシを測定し、必要に応じてレプリカを追加することをお勧めします。
Kafka ClickPipesの場合、Kafkaブローカーパーティションもそれに応じてスケールする必要があることに注意してください。
スケーリングコントロールは、各ストリーミングClickPipeの「設定」の下にあります。

<Image img={clickpipesPricingFaq3} size="lg" alt="ClickPipes レプリカ - ClickPipesのレプリカはいくつ必要ですか？" border force/>

</details>

<details>

<summary>ClickPipesの価格構造はどうなっていますか？</summary>

価格は2つの次元から構成されています：
- **計算**：時間単位ごとの価格
  計算は、ClickPipesレプリカポッドがデータを積極的に取り込んでいるときでもそうでないときでも、ClickPipesレプリカポッドの実行コストを表します。
  これはすべてのClickPipesタイプに適用されます。
- **取り込まれたデータ**：GBごとの価格
  取り込まれたデータレートは、すべてのストリーミングClickPipes（Kafka、Confluent、Amazon MSK、Amazon Kinesis、Redpanda、WarpStream、Azure Event Hubs）に適用され、
  レプリカポッドを介して転送されたデータに関連しています。
  取り込まれたデータサイズ（GB）は、ソースから受信したバイト数（圧縮または非圧縮）に基づいて請求されます。

</details>

<details>

<summary>ClickPipesの公開価格はどうなっていますか？</summary>

- 計算：\$0.20 per unit per hour（\$0.05 per replica per hour）
- 取り込まれたデータ：\$0.04 per GB

</details>

<details>

<summary>例を挙げるとどうなりますか？</summary>

例えば、1つのレプリカ（0.25計算ユニット）を使用して、Kafkaコネクタを介して24時間で1TBのデータを取り込むと、コストは次のようになります：

$$
(0.25 \times 0.20 \times 24) + (0.04 \times 1000) = \$41.2
$$
<br/>

オブジェクトストレージコネクタ（S3およびGCS）の場合、
ClickPipesポッドはデータを処理しておらず、
基盤のClickHouseサービスによって操作される転送を調整しているだけなので、
ClickPipes計算コストのみが発生します：

$$
0.25 \times 0,20 \times 24 = \$1.2
$$

</details>

<details>

<summary>ClickPipesの価格は市場と比べてどうですか？</summary>

ClickPipesの価格に関する哲学は、
プラットフォームの運営コストをカバーしつつ、ClickHouse Cloudへのデータ移動を簡単かつ信頼できる方法で提供することです。
その観点から、私たちの市場分析は、競争力のある位置にあることを明らかにしました。

</details>
