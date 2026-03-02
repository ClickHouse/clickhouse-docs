import Image from '@theme/IdealImage';
import clickpipesPricingFaq1 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_1.png';
import clickpipesPricingFaq2 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_2.png';
import clickpipesPricingFaq3 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_3.png';

<details>
  <summary>ClickPipes 레플리카란 무엇입니까?</summary>

  ClickPipes는 전용 인프라를 통해 원격 데이터 소스에서 데이터를 수집하며,
  이 인프라는 ClickHouse Cloud 서비스와 독립적으로 실행되고 확장됩니다.
  이러한 이유로 전용 컴퓨트 레플리카를 사용합니다.
  아래 다이어그램은 단순화된 아키텍처를 보여줍니다.

  스트리밍 ClickPipes의 경우 ClickPipes 레플리카가 원격 데이터 소스(예: Kafka 브로커)에 접근하여
  데이터를 가져와 처리한 뒤 대상 ClickHouse 서비스로 수집합니다.

  <Image img={clickpipesPricingFaq1} size="lg" alt="ClickPipes 레플리카 - 스트리밍 ClickPipes" border force />

  객체 스토리지 ClickPipes의 경우,
  ClickPipes 레플리카가 데이터 로딩 작업
  (복사할 파일 식별, 상태 유지, 파티션 이동)을 오케스트레이션하며,
  데이터 자체는 ClickHouse 서비스에서 직접 가져옵니다.

  <Image img={clickpipesPricingFaq2} size="lg" alt="ClickPipes 레플리카 - 객체 스토리지 ClickPipes" border force />
</details>

<details>
  <summary>기본 레플리카 개수와 크기는 어떻게 됩니까?</summary>

  각 ClickPipe는 기본적으로 1개의 레플리카를 사용하며,
  이 레플리카에는 2 GiB RAM과 0.5 vCPU가 제공됩니다.
  이는 **0.25** ClickHouse 컴퓨트 유닛(1 유닛 = 8 GiB RAM, 2 vCPU)에 해당합니다.
</details>

<details>
  <summary>ClickPipes 레플리카를 확장할 수 있습니까?</summary>

  예, 스트리밍용 ClickPipes는 수평 및 수직 확장이 모두 가능합니다.
  수평 확장은 처리량을 늘리기 위해 레플리카를 더 추가하는 것이고,
  수직 확장은 더 높은 부하를 처리할 수 있도록 각 레플리카에 할당된 리소스(CPU 및 RAM)를 늘리는 것입니다.
  이는 ClickPipe를 생성하는 동안 또는 이후 언제든지 **Settings** -&gt; **Advanced Settings** -&gt; **Scaling**에서 구성할 수 있습니다.
</details>

<details>
  <summary>ClickPipes 레플리카는 몇 개가 필요합니까?</summary>

  워크로드의 처리량과 지연 시간 요구 사항에 따라 달라집니다.
  기본값인 1개 레플리카로 시작한 후 지연 시간을 측정하고, 필요하면 레플리카를 추가하는 것을 권장합니다.
  Kafka ClickPipes의 경우 Kafka 브로커 파티션도 이에 맞게 확장해야 합니다.
  각 스트리밍 ClickPipe에 대해 &quot;settings&quot;에서 확장 제어를 사용할 수 있습니다.

  <Image img={clickpipesPricingFaq3} size="lg" alt="ClickPipes 레플리카 - ClickPipes 레플리카는 몇 개가 필요합니까?" border force />
</details>

<details>
  <summary>ClickPipes 요금 구조는 어떻게 됩니까?</summary>

  두 가지 요소로 구성됩니다:

  * **Compute**: 유닛당 시간당 가격
    Compute는 ClickPipes 레플리카 파드가 실제로 데이터를 수집하는지 여부와 관계없이 실행되는 비용을 의미합니다.
    이는 모든 유형의 ClickPipes에 적용됩니다.
  * **수집된 데이터**: GB당 가격
    수집된 데이터 요율은 모든 스트리밍 ClickPipes
    (Kafka, Confluent, Amazon MSK, Amazon Kinesis, Redpanda, WarpStream,
    Azure Event Hubs)에 적용되며, 레플리카 파드를 통해 전송된 데이터에 대한 요율입니다.
    수집된 데이터 크기(GB)는 소스에서 수신한 바이트(압축 여부와 무관하게)에 따라 과금됩니다.
</details>

<details>
  <summary>ClickPipes의 공개 요금은 어떻게 됩니까?</summary>

  * Compute: 유닛당 시간당 $0.20 (레플리카당 시간당 $0.05)
  * 수집된 데이터: GB당 $0.04
</details>

<details>
  <summary>예시로 보면 어떻게 됩니까?</summary>

  예를 들어, 단일 레플리카(0.25 컴퓨트 유닛)를 사용해 Kafka 커넥터로
  24시간 동안 1 TB의 데이터를 수집하는 비용은 다음과 같습니다:

  $$
  (0.25 \times 0.20 \times 24) + (0.04 \times 1000) = $41.2
  $$

  <br />

  객체 스토리지 커넥터(S3 및 GCS)의 경우,
  ClickPipes 파드가 데이터를 직접 처리하지 않고
  기본 ClickHouse 서비스가 수행하는 전송을 오케스트레이션만 하므로
  ClickPipes 컴퓨트 비용만 발생합니다:

  $$
  0.25 \times 0,20 \times 24 = $1.2
  $$
</details>


<details>

<summary>시장과 비교했을 때 ClickPipes 요금은 어떻습니까?</summary>

ClickPipes 요금에 대한 철학은
플랫폼의 운영 비용을 충당하면서도 데이터를 ClickHouse Cloud로 손쉽고 안정적으로 전송할 수 있는 방법을 제공하는 데 있습니다.
이러한 관점에서 볼 때, 시장 분석 결과 ClickPipes 요금은 경쟁력 있는 수준에 위치해 있습니다.

</details>