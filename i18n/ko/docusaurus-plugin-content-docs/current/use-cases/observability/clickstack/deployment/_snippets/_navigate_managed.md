import Image from '@theme/IdealImage';
import clickstack_managed_ui from '@site/static/images/clickstack/getting-started/clickstack_managed_ui.png';
import create_vector_datasource from '@site/static/images/clickstack/create-vector-datasource.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

&#39;Launch ClickStack&#39;를 선택하여 ClickStack UI(HyperDX)에 액세스합니다. 자동으로 인증된 후 리디렉션됩니다.

<Tabs groupId="click-stackui-data-sources">
  <TabItem value="open-telemetry" label="OpenTelemetry" default>
    OpenTelemetry 데이터에 대해서는 데이터 소스가 미리 생성되어 있습니다.

    <Image img={clickstack_managed_ui} size="lg" alt="ClickStack UI" />
  </TabItem>

  <TabItem value="vector" label="Vector" default>
    Vector를 사용하는 경우 데이터 소스를 직접 생성해야 합니다. 첫 로그인 시 데이터 소스를 생성하라는 안내가 표시됩니다. 아래에는 로그 데이터 소스 예제 구성을 보여 줍니다.

    <Image img={create_vector_datasource} alt="Create datasource - vector" size="lg" />

    이 구성은 `time_local` 컬럼을 타임스탬프로 사용하는 Nginx 스타일 스키마를 가정합니다. 가능하다면 기본 키에 선언된 타임스탬프 컬럼을 사용해야 합니다. **이 컬럼은 필수입니다**.

    또한 로그 뷰에서 반환할 컬럼을 명시적으로 정의하도록 `Default SELECT`를 수정하는 것을 권장합니다. 서비스 이름, 로그 레벨, 본문 컬럼 등 추가 필드가 있다면 이들도 함께 구성할 수 있습니다. 타임스탬프 표시 컬럼이 테이블 기본 키에 사용된 컬럼과 다를 경우, 위에서 구성한 것과 별도로 이 컬럼을 재정의할 수도 있습니다.

    위 예제에서는 데이터에 `Body` 컬럼이 존재하지 않습니다. 대신 사용 가능한 필드를 이용해 Nginx 로그 라인을 재구성하는 SQL 표현식으로 해당 컬럼을 정의합니다.

    사용할 수 있는 다른 옵션은 [구성 레퍼런스](/use-cases/observability/clickstack/config)를 참조하십시오.

    데이터 소스를 생성한 후에는 검색 뷰로 이동하며, 즉시 데이터를 탐색할 수 있습니다.

    <Image img={clickstack_managed_ui} size="lg" alt="ClickStack UI" />
  </TabItem>
</Tabs>

<br />

이것으로 모든 준비가 완료되었습니다. 🎉

이제 ClickStack을 탐색해 보십시오. 로그와 트레이스를 검색하고, 로그·트레이스·메트릭이 실시간으로 어떻게 연관되는지 확인하며, 대시보드를 구성하고, 서비스 맵을 탐색하고, 이벤트 델타와 패턴을 분석하고, 경보를 설정하여 문제를 선제적으로 감지하십시오.
