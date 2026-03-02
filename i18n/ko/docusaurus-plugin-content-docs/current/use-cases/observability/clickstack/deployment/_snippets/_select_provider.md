import Image from '@theme/IdealImage';
import provider_selection from '@site/static/images/clickstack/getting-started/provider_selection.png';
import advanced_resources from '@site/static/images/clickstack/getting-started/advanced_resources.png';
import service_provisioned from '@site/static/images/clickstack/getting-started/service_provisioned.png';
import region_resources from '@site/static/images/clickstack/getting-started/region_resources.png';

:::note Scale vs Enterprise
대부분의 ClickStack 워크로드에는 이 [Scale 티어](/cloud/manage/cloud-tiers)를 권장합니다. SAML, CMEK, HIPAA 컴플라이언스와 같은 고급 보안 기능이 필요하다면 Enterprise 티어를 선택하십시오. Enterprise 티어는 매우 대규모 ClickStack 배포를 위한 맞춤형 하드웨어 프로필도 제공합니다. 이러한 경우에는 지원팀에 문의하시기 바랍니다.
:::

Cloud 공급자와 리전을 선택합니다.

<Image img={region_resources} size="md" alt="리소스 선택기" border />

CPU와 메모리를 지정할 때에는 예상 ClickStack 수집 처리량을 기준으로 산정하십시오. 아래 표는 이러한 리소스 규모를 결정하는 데 참고할 수 있는 가이드를 제공합니다.

| 월별 수집량             | 권장 컴퓨트 리소스       |
| ------------------ | ---------------- |
| &lt; 10 TB / month | 2 vCPU × 3 레플리카  |
| 10–50 TB / month   | 4 vCPU × 3 레플리카  |
| 50–100 TB / month  | 8 vCPU × 3 레플리카  |
| 100–500 TB / month | 30 vCPU × 3 레플리카 |
| 1 PB+ / month      | 59 vCPU × 3 레플리카 |

이 권장 사항은 다음과 같은 가정을 기반으로 합니다.

* 데이터 볼륨은 한 달 기준 **압축되지 않은 수집량**을 의미하며, 로그와 트레이스 모두에 적용됩니다.
* 쿼리 패턴은 관측성 사용 사례에서 일반적인 형태이며, 대부분의 쿼리는 보통 최근 24시간과 같은 **최신 데이터**를 대상으로 합니다.
* 수집은 한 달 동안 비교적 **균일하게 발생**한다고 가정합니다. 버스트 트래픽이나 스파이크가 예상된다면 추가 여유 용량을 확보해야 합니다.
* 스토리지는 ClickHouse Cloud 객체 스토리지를 통해 별도로 처리되며, 보존 기간을 제한하는 요소가 아닙니다. 장기간 보존되는 데이터는 드물게 조회된다고 가정합니다.

더 긴 기간을 자주 조회하거나, 무거운 집계 작업을 수행하거나, 동시 접속 사용자가 많은 액세스 패턴을 지원하려면 더 많은 컴퓨트 리소스가 필요할 수 있습니다.

두 개의 레플리카로도 주어진 수집 처리량에 필요한 CPU와 메모리 요구 사항을 충족할 수 있지만, 가능한 경우에는 동일한 총 용량을 유지하면서 서비스 중복성을 높이기 위해 세 개의 레플리카 사용을 권장합니다.

:::note
이 값들은 **추정치일 뿐**이며 초기 기준선으로만 사용해야 합니다. 실제 요구 사항은 쿼리 복잡도, 동시성, 보존 정책, 수집 처리량 변동에 따라 달라집니다. 리소스 사용량을 항상 모니터링하고 필요에 따라 확장하십시오.
:::

요구 사항을 지정한 후 Managed ClickStack 서비스가 프로비저닝되는 데 몇 분 정도 소요됩니다. 프로비저닝을 기다리는 동안 [ClickHouse Cloud 콘솔](/cloud/overview)의 다른 부분을 탐색하십시오.

**프로비저닝이 완료되면 왼쪽 메뉴의 &#39;ClickStack&#39; 옵션이 활성화됩니다.**
