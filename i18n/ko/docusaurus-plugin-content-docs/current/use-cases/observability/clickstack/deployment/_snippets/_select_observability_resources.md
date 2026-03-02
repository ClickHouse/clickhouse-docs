import Image from '@theme/IdealImage';
import provider_selection from '@site/static/images/clickstack/getting-started/provider_selection.png';
import advanced_resources from '@site/static/images/clickstack/getting-started/advanced_resources.png';
import service_provisioned from '@site/static/images/clickstack/getting-started/service_provisioned.png';

클라우드 공급자, 배포할 리전, 그리고 &#39;Memory and Scaling&#39; 드롭다운에서 월별 데이터 볼륨을 선택합니다.

이는 압축되지 않은 형태의 로그 또는 트레이스 데이터 양을 대략적으로 추산한 값이면 됩니다.

<Image img={provider_selection} size="md" alt="리소스 선택기" border />

이 추정치는 Managed ClickStack 서비스에 할당할 컴퓨트 리소스 규모를 산정하는 데 사용됩니다. 기본적으로 새 조직은 [Scale 티어](/cloud/manage/cloud-tiers)에 배치됩니다. [Vertical autoscaling](/manage/scaling#vertical-auto-scaling)은 Scale 티어에서 기본적으로 활성화됩니다. 조직 티어는 이후 &#39;Plans&#39; 페이지에서 변경할 수 있습니다.

요구 사항을 잘 이해하고 있는 고급 사용자는 &#39;Memory and Scaling&#39; 드롭다운에서 &#39;Custom Configuration&#39;을 선택하여, 프로비저닝할 정확한 리소스와 엔터프라이즈 기능을 직접 지정할 수 있습니다.

<Image img={advanced_resources} size="md" alt="고급 리소스 선택기" border />

요구 사항을 모두 지정하면 Managed ClickStack 서비스가 프로비저닝되는 데 몇 분 정도 소요됩니다. 프로비저닝이 완료되면 이어지는 &#39;ClickStack&#39; 페이지에서 이를 확인할 수 있습니다. 기다리는 동안 [ClickHouse Cloud 콘솔](/cloud/overview)의 다른 영역을 살펴봐도 됩니다.

<Image img={service_provisioned} size="md" alt="서비스 프로비저닝 완료" border />

프로비저닝이 완료되면 &#39;Start Ingestion&#39;을 선택합니다.
