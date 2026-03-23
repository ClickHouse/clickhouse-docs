import Image from '@theme/IdealImage';
import provider_selection from '@site/static/images/clickstack/getting-started/provider_selection.png';
import advanced_resources from '@site/static/images/clickstack/getting-started/advanced_resources.png';
import service_provisioned from '@site/static/images/clickstack/getting-started/service_provisioned.png';
import region_resources from '@site/static/images/clickstack/getting-started/region_resources.png';
import ResourceEstimation from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/managing/_snippets/_resource_estimation.md';

:::note Scale vs Enterprise
대부분의 ClickStack 워크로드에는 이 [Scale 티어](/cloud/manage/cloud-tiers)를 권장합니다. SAML, CMEK, HIPAA 컴플라이언스와 같은 고급 보안 기능이 필요하다면 Enterprise 티어를 선택하십시오. Enterprise 티어는 매우 대규모 ClickStack 배포를 위한 맞춤형 하드웨어 프로필도 제공합니다. 이러한 경우에는 지원팀에 문의하시기 바랍니다.
:::

Cloud 공급자와 리전을 선택합니다.

<Image img={region_resources} size="md" alt="리소스 선택기" border />

CPU와 메모리를 지정할 때에는 예상 ClickStack 수집 처리량을 기준으로 산정하십시오. 아래 표는 이러한 리소스 규모를 결정하는 데 참고할 수 있는 가이드를 제공합니다.

<ResourceEstimation />

요구 사항을 지정한 후 Managed ClickStack 서비스가 프로비저닝되는 데 몇 분 정도 소요됩니다. 프로비저닝을 기다리는 동안 [ClickHouse Cloud 콘솔](/cloud/overview)의 다른 부분을 탐색하십시오.

**프로비저닝이 완료되면 왼쪽 메뉴의 &#39;ClickStack&#39; 옵션이 활성화됩니다.**
