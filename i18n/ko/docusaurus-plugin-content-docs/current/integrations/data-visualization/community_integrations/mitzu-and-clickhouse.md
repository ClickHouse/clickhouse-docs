---
'sidebar_label': 'Mitzu'
'slug': '/integrations/mitzu'
'keywords':
- 'clickhouse'
- 'Mitzu'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Mitzu는 코드 없이 사용하는 웨어하우스 네이티브 제품 분석 애플리케이션입니다.'
'title': 'Mitzu를 ClickHouse에 연결하기'
'doc_type': 'guide'
'integration':
- 'support_level': 'partner'
- 'category': 'data_visualization'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import mitzu_01 from '@site/static/images/integrations/data-visualization/mitzu_01.png';
import mitzu_02 from '@site/static/images/integrations/data-visualization/mitzu_02.png';
import mitzu_03 from '@site/static/images/integrations/data-visualization/mitzu_03.png';
import mitzu_04 from '@site/static/images/integrations/data-visualization/mitzu_04.png';
import mitzu_05 from '@site/static/images/integrations/data-visualization/mitzu_05.png';
import mitzu_06 from '@site/static/images/integrations/data-visualization/mitzu_06.png';
import mitzu_07 from '@site/static/images/integrations/data-visualization/mitzu_07.png';
import mitzu_08 from '@site/static/images/integrations/data-visualization/mitzu_08.png';
import mitzu_09 from '@site/static/images/integrations/data-visualization/mitzu_09.png';
import mitzu_10 from '@site/static/images/integrations/data-visualization/mitzu_10.png';
import mitzu_11 from '@site/static/images/integrations/data-visualization/mitzu_11.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Connecting Mitzu to ClickHouse

<CommunityMaintainedBadge/>

Mitzu는 코드 없이 사용할 수 있는 웨어하우스 네이티브 제품 분석 애플리케이션입니다. Amplitude, Mixpanel, PostHog와 같은 도구와 유사하게 Mitzu는 사용자가 SQL 또는 Python 전문 지식 없이도 제품 사용 데이터를 분석할 수 있도록 지원합니다.

하지만 이러한 플랫폼들과 달리 Mitzu는 회사의 제품 사용 데이터를 중복 생성하지 않습니다. 대신, 회사의 기존 데이터 웨어하우스 또는 데이터 레이크에서 직접 네이티브 SQL 쿼리를 생성합니다.

## Goal {#goal}

이 가이드에서는 다음 항목을 다룰 것입니다:

- 웨어하우스 네이티브 제품 분석
- Mitzu를 ClickHouse에 통합하는 방법

:::tip 예제 데이터 세트
Mitzu에 사용할 데이터 세트가 없다면 NYC Taxi Data를 사용할 수 있습니다. 이 데이터 세트는 ClickHouse Cloud에서 사용할 수 있거나 [이 지침으로 로드할 수 있습니다](/getting-started/example-datasets/nyc-taxi).
:::

이 가이드는 Mitzu 사용에 대한 간단한 개요입니다. 더 자세한 정보는 [Mitzu 문서](https://docs.mitzu.io/)에서 찾을 수 있습니다.

## 1. 연결 세부정보 수집 {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. Mitzu에 로그인 또는 가입 {#2-sign-in-or-sign-up-to-mitzu}

첫 번째 단계로 [https://app.mitzu.io](https://app.mitzu.io)로 이동하여 가입하십시오.

<Image size="lg" img={mitzu_01} alt="Mitzu 로그인 페이지의 이메일 및 비밀번호 필드" border />

## 3. 작업 공간 구성 {#3-configure-your-workspace}

조직 생성을 완료한 후, 왼쪽 사이드바에서 `작업 공간 설정` 온보딩 가이드를 따릅니다. 그런 다음 `데이터 웨어하우스와 Mitzu 연결` 링크를 클릭하세요.

<Image size="lg" img={mitzu_02} alt="온보딩 단계를 보여주는 Mitzu 작업 공간 설정 페이지" border />

## 4. Mitzu를 ClickHouse에 연결 {#4-connect-mitzu-to-clickhouse}

먼저, 연결 유형으로 ClickHouse를 선택하고 연결 세부정보를 설정하세요. 그런 다음 `연결 테스트 및 저장` 버튼을 클릭하여 설정을 저장합니다.

<Image size="lg" img={mitzu_03} alt="구성 양식이 있는 ClickHouse에 대한 Mitzu 연결 설정 페이지" border />

## 5. 이벤트 테이블 구성 {#5-configure-event-tables}

연결이 저장되면, `이벤트 테이블` 탭을 선택하고 `테이블 추가` 버튼을 클릭합니다. 모달에서 데이터베이스와 Mitzu에 추가할 테이블을 선택합니다.

체크 박스를 사용하여 최소한 하나의 테이블을 선택하고 `테이블 구성` 버튼을 클릭합니다. 그러면 각 테이블의 키 컬럼을 설정할 수 있는 모달 창이 열립니다.

<Image size="lg" img={mitzu_04} alt="데이터베이스 테이블을 보여주는 Mitzu 테이블 선택 인터페이스" border />
<br/>

> ClickHouse 설정에서 제품 분석을 실행하려면 > 테이블에서 몇 가지 키 컬럼을 지정해야 합니다.
>
> 다음은 그 목록입니다:
>
> - **User id** - 사용자의 고유 식별자를 위한 컬럼.
> - **Event time** - 이벤트의 타임스탬프 컬럼.
> - 선택 사항 [**Event name**] - 이 컬럼은 테이블에 여러 이벤트 유형이 포함된 경우 이벤트를 세분화합니다.

<Image size="lg" img={mitzu_05} alt="컬럼 매핑 옵션을 보여주는 Mitzu 이벤트 카탈로그 구성" border />
<br/>
모든 테이블을 구성한 후, `저장 및 이벤트 카탈로그 업데이트` 버튼을 클릭하면 Mitzu는 위에서 정의한 테이블에서 모든 이벤트와 그 속성을 찾습니다. 이 단계는 데이터 세트의 크기에 따라 몇 분이 걸릴 수 있습니다.

## 4. 세분화 쿼리 실행 {#4-run-segmentation-queries}

Mitzu에서의 사용자 세분화는 Amplitude, Mixpanel 또는 PostHog에서처럼 쉽습니다.

탐색 페이지에는 왼쪽에 이벤트 선택 영역, 상단에는 시간 범위를 구성할 수 있는 섹션이 있습니다.

<Image size="lg" img={mitzu_06} alt="이벤트 선택 및 시간 구성을 보여주는 Mitzu 세분화 쿼리 인터페이스" border />

<br/>

:::tip 필터 및 분해
필터링은 예상대로 수행됩니다: 속성(ClickHouse 컬럼)을 선택하고 필터링하려는 값을 드롭다운에서 선택합니다.
분해를 위해서는 어떤 이벤트나 사용자 속성을 선택할 수 있습니다(아래에서 사용자 속성 통합 방법 참조).
:::

## 5. 퍼널 쿼리 실행 {#5-run-funnel-queries}

퍼널을 위한 최대 9단계를 선택하세요. 사용자가 퍼널을 완료할 수 있는 시간 창을 선택하세요.
SQL 코드를 한 줄도 작성하지 않고 즉각적인 전환율 통찰을 얻을 수 있습니다.

<Image size="lg" img={mitzu_07} alt="단계 간 전환율을 보여주는 Mitzu 퍼널 분석 보기" border />

<br/>

:::tip 추세 시각화
`퍼널 추세`를 선택하여 시간에 따른 퍼널 추세를 시각화합니다.
:::

## 6. 지속률 쿼리 실행 {#6-run-retention-queries}

지속률 계산을 위해 최대 2단계를 선택하세요. 반복 창을 위한 지속 창을 선택하세요.
SQL 코드를 한 줄도 작성하지 않고 즉각적인 전환율 통찰을 얻을 수 있습니다.

<Image size="lg" img={mitzu_08} alt="코호트 지속률을 보여주는 Mitzu 지속 분석" border />

<br/>

:::tip 코호트 지속률
`주간 코호트 지속률`을 선택하여 시간이 지남에 따라 지속률이 어떻게 변하는지 시각화합니다.
:::

## 7. 여정 쿼리 실행 {#7-run-journey-queries}
퍼널을 위한 최대 9단계를 선택하세요. 사용자가 여정을 완료할 수 있는 시간 창을 선택하세요. Mitzu 여정 차트는 사용자가 선택한 이벤트를 통해 가는 모든 경로의 시각적 지도를 제공합니다.

<Image size="lg" img={mitzu_09} alt="이벤트 간 사용자 경로 흐름을 보여주는 Mitzu 여정 시각화" border />
<br/>

:::tip 단계 세분화
`단계 분해`를 위한 속성을 선택하여 동일한 단계 내에서 사용자를 구분할 수 있습니다.
:::

<br/>

## 8. 수익 쿼리 실행 {#8-run-revenue-queries}
수익 설정이 구성된 경우, Mitzu는 귀하의 결제 이벤트를 기반으로 총 MRR과 구독 수를 계산할 수 있습니다.

<Image size="lg" img={mitzu_10} alt="MRR 메트릭을 보여주는 Mitzu 수익 분석 대시보드" border />

## 9. SQL 네이티브 {#9-sql-native}

Mitzu는 SQL 네이티브로, 탐색 페이지에서 선택한 구성으로부터 네이티브 SQL 코드를 생성합니다.

<Image size="lg" img={mitzu_11} alt="네이티브 ClickHouse 쿼리를 보여주는 Mitzu SQL 코드 생성 보기" border />

<br/>

:::tip BI 도구에서 작업 계속하기
Mitzu UI에서 제한에 직면하면 SQL 코드를 복사하여 BI 도구에서 작업을 계속하십시오.
:::

## Mitzu 지원 {#mitzu-support}

길을 잃으셨다면, [support@mitzu.io](email://support@mitzu.io)로 문의해 주세요.

또는 [여기에서](https://join.slack.com/t/mitzu-io/shared_invite/zt-1h1ykr93a-_VtVu0XshfspFjOg6sczKg) Slack 커뮤니티에 참여하십시오.

## 더 알아보기 {#learn-more}

Mitzu에 대한 더 많은 정보를 [mitzu.io](https://mitzu.io)에서 확인하세요.

문서 페이지는 [docs.mitzu.io](https://docs.mitzu.io)에서 방문할 수 있습니다.
