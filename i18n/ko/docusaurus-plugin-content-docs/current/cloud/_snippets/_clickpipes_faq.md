import Image from '@theme/IdealImage';
import clickpipesPricingFaq1 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_1.png';
import clickpipesPricingFaq2 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_2.png';
import clickpipesPricingFaq3 from '@site/static/images/cloud/manage/jan2025_faq/external_clickpipes_pricing_faq_3.png';

<details>

<summary>ClickPipes 복제본이란 무엇인가요?</summary>

ClickPipes는 ClickHouse Cloud 서비스와 독립적으로 실행되고 확장되는 전용 인프라를 통해 원격 데이터 소스에서 데이터를 수집합니다. 이러한 이유로 ClickPipes는 전용 컴퓨팅 복제본을 사용합니다. 아래 다이어그램은 단순화된 아키텍처를 보여줍니다.

스트리밍 ClickPipes의 경우, ClickPipes 복제본은 원격 데이터 소스(예: Kafka 브로커)에 접근하여 데이터를 가져오고 처리하여 목적지 ClickHouse 서비스로 삽입합니다.

<Image img={clickpipesPricingFaq1} size="lg" alt="ClickPipes Replicas - Streaming ClickPipes" border force/>

객체 저장소 ClickPipes의 경우, ClickPipes 복제본은 데이터 로딩 작업을 조정합니다(복사할 파일 식별, 상태 유지 및 파티션 이동) . 이때 데이터는 ClickHouse 서비스에서 직접 가져옵니다.

<Image img={clickpipesPricingFaq2} size="lg" alt="ClickPipes Replicas - Object Storage ClickPipes" border force/>

</details>

<details>

<summary>기본 복제본 수와 그 크기는 어떻게 되나요?</summary>

각 ClickPipe는 기본적으로 2GiB의 RAM과 0.5 vCPU가 제공되는 1개의 복제본을 갖습니다. 이는 **0.25** ClickHouse 컴퓨팅 단위에 해당합니다(1 단위 = 8GiB RAM, 2 vCPU).

</details>

<details>

<summary>ClickPipes 복제본을 확장할 수 있나요?</summary>

네, 스트리밍을 위한 ClickPipes는 수평 및 수직으로 확장할 수 있습니다. 수평 확장은 처리량을 늘리기 위해 더 많은 복제본을 추가하고, 수직 확장은 더 집약적인 작업을 처리하기 위해 각 복제본에 할당된 리소스(CPU 및 RAM)를 증가시킵니다. 이는 ClickPipe 생성 중 또는 다른 시점에서 **Settings** -> **Advanced Settings** -> **Scaling**에서 구성할 수 있습니다.

</details>

<details>

<summary>나는 몇 개의 ClickPipes 복제본이 필요한가요?</summary>

이는 작업 부하의 처리량 및 지연 요구 사항에 따라 다릅니다. 기본값인 1개의 복제본으로 시작하고, 지연 시간을 측정한 후 필요에 따라 복제본을 추가하는 것을 권장합니다. Kafka ClickPipes의 경우, Kafka 브로커 파티션도 적절히 확장해야 한다는 점을 명심하세요. 각 스트리밍 ClickPipe의 "settings"에서 확장 제어를 사용할 수 있습니다.

<Image img={clickpipesPricingFaq3} size="lg" alt="ClickPipes Replicas - How many ClickPipes replicas do I need?" border force/>

</details>

<details>

<summary>ClickPipes 가격 구조는 어떻게 되나요?</summary>

가격은 두 가지 차원으로 구성됩니다:
- **Compute**: 시간당 단위 가격
  컴퓨트는 ClickPipes 복제본 팟이 데이터를 적극적으로 수집하든 아니든 실행되는 비용을 나타냅니다. 모든 ClickPipes 유형에 적용됩니다.
- **Ingested data**: GB당 가격
  수집된 데이터 요금은 모든 스트리밍 ClickPipes(Kafka, Confluent, Amazon MSK, Amazon Kinesis, Redpanda, WarpStream, Azure Event Hubs)의 복제본 팟을 통해 전송되는 데이터에 적용됩니다. 수집된 데이터 크기(GB)는 소스에서 수신된 바이트 수(압축되지 않거나 압축된)를 기준으로 청구됩니다.

</details>

<details>

<summary>ClickPipes의 공개 가격은 어떻게 되나요?</summary>

- Compute: 시간당 $0.20 per unit ($0.05 per replica per hour)
- Ingested data: GB당 $0.04

</details>

<details>

<summary>예시로 설명하면 어떻게 되나요?</summary>

예를 들어, 단일 복제본(0.25 컴퓨트 단위)을 사용하여 Kafka 커넥터를 통해 24시간에 걸쳐 1TB의 데이터를 수집하는 데 드는 비용은 다음과 같습니다:

$$
(0.25 \times 0.20 \times 24) + (0.04 \times 1000) = \$41.2
$$
<br/>

객체 저장소 커넥터(S3 및 GCS)의 경우, ClickPipes 팟은 데이터를 처리하지 않고 전송만 조정하므로 ClickPipes의 컴퓨트 비용만 발생합니다. 따라서:

$$
0.25 \times 0.20 \times 24 = \$1.2
$$

</details>

<details>

<summary>ClickPipes의 가격은 시장에서 어떻게 비교되나요?</summary>

ClickPipes 가격 책정의 철학은 플랫폼 운영 비용을 충당하면서 ClickHouse Cloud에 데이터를 쉽게 이전할 수 있는 신뢰할 수 있는 방법을 제공하는 것입니다. 이러한 관점에서 우리의 시장 분석 결과, 우리는 경쟁력 있는 위치에 있는 것으로 나타났습니다.

</details>
