---
sidebar_label: 'Mitzu'
slug: /integrations/mitzu
keywords: ['clickhouse', 'Mitzu', 'connect', 'integrate', 'ui']
description: 'Mitzu는 코드 작성이 필요 없는 데이터 웨어하우스 네이티브 제품 분석 애플리케이션입니다.'
title: 'Mitzu를 ClickHouse에 연결하기'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
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


# Mitzu를 ClickHouse에 연결하기 \{#connecting-mitzu-to-clickhouse\}

<CommunityMaintainedBadge/>

Mitzu는 코드 작성이 필요 없는, 데이터 웨어하우스 네이티브 제품 분석(Product analytics) 애플리케이션입니다. Amplitude, Mixpanel, PostHog과 같은 도구와 유사하게, Mitzu는 SQL이나 Python 전문 지식 없이도 제품 사용 데이터를 분석할 수 있도록 합니다.

그러나 이러한 플랫폼들과 달리, Mitzu는 회사의 제품 사용 데이터를 복제하지 않습니다. 대신, 회사가 이미 보유한 데이터 웨어하우스나 데이터 레이크에서 네이티브 SQL 쿼리를 직접 생성합니다.

## 목표 \{#goal\}

이 가이드에서는 다음 내용을 다룹니다:

- 데이터 웨어하우스-네이티브 제품 분석
- Mitzu를 ClickHouse에 통합하는 방법

:::tip 예시 데이터 세트
Mitzu에 사용할 데이터셋이 없다면 NYC Taxi Data를 사용할 수 있습니다.
이 데이터셋은 ClickHouse Cloud에서 사용할 수 있으며, [다음 안내에 따라 로드할 수도 있습니다](/getting-started/example-datasets/nyc-taxi).
:::

이 가이드는 Mitzu 사용 방법에 대한 간단한 개요만 제공합니다. 보다 자세한 내용은 [Mitzu 문서](https://docs.mitzu.io/)를 참고하십시오.

## 1. 연결 정보 준비하기 \{#1-gather-your-connection-details\}

<ConnectionDetails />

## 2. Mitzu에 로그인 또는 가입하기 \{#2-sign-in-or-sign-up-to-mitzu\}

먼저 [https://app.mitzu.io](https://app.mitzu.io)에 접속해 회원 가입을 진행합니다.

<Image size="lg" img={mitzu_01} alt="이메일과 비밀번호 입력 필드가 있는 Mitzu 로그인 페이지" border />

## 3. 워크스페이스 구성하기 \{#3-configure-your-workspace\}

조직을 생성한 후 왼쪽 사이드바에서 `Set up your workspace` 온보딩 가이드를 따르십시오. 그다음 `Connect Mitzu with your data warehouse` 링크를 클릭하십시오.

<Image size="lg" img={mitzu_02} alt="온보딩 단계가 표시된 Mitzu 워크스페이스 설정 페이지" border />

## 4. Mitzu를 ClickHouse에 연결하기 \{#4-connect-mitzu-to-clickhouse\}

먼저 연결 유형에서 ClickHouse를 선택하고 연결 정보를 설정합니다. 그런 다음 `Test connection & Save` 버튼을 클릭하여 설정을 저장합니다.

<Image size="lg" img={mitzu_03} alt="구성 양식이 포함된 ClickHouse용 Mitzu 연결 설정 페이지" border />

## 5. 이벤트 테이블 구성 \{#5-configure-event-tables\}

연결을 저장한 후 `Event tables` 탭을 선택하고 `Add table` 버튼을 클릭합니다. 모달에서 데이터베이스를 선택하고 Mitzu에 추가할 테이블을 선택합니다.

체크박스를 사용하여 하나 이상의 테이블을 선택한 뒤 `Configure table` 버튼을 클릭합니다. 그러면 각 테이블에 대한 키 컬럼을 설정할 수 있는 모달 창이 열립니다.

<Image size="lg" img={mitzu_04} alt="데이터베이스 테이블을 보여 주는 Mitzu 테이블 선택 인터페이스" border />

<br/>

> ClickHouse 설정에서 제품 분석을 수행하려면 테이블에서 몇 개의 주요 컬럼을 지정해야 합니다.
>
> 다음과 같습니다.
>
> - **User ID** - 사용자를 고유하게 식별하는 값이 저장된 컬럼입니다.
> - **Event time** - 이벤트의 타임스탬프가 저장된 컬럼입니다.
> - 선택 사항 [**Event name**] - 테이블에 여러 이벤트 유형이 포함된 경우, 이 컬럼을 사용해 이벤트를 구분합니다.

<Image size="lg" img={mitzu_05} alt="컬럼 매핑 옵션을 보여 주는 Mitzu 이벤트 카탈로그 구성 화면" border />

<br/>

모든 테이블 구성이 완료되면 `Save & update event catalog` 버튼을 클릭합니다. 그러면 Mitzu가 앞에서 정의한 테이블에서 모든 이벤트와 해당 속성을 찾아냅니다. 이 단계는 데이터셋의 크기에 따라 몇 분 정도 소요될 수 있습니다.

## 4. 세그멘테이션 쿼리 실행 \{#4-run-segmentation-queries\}

Mitzu에서 사용자 세그멘테이션을 수행하는 것은 Amplitude, Mixpanel, PostHog에서 하는 것만큼 쉽습니다.

Explore 페이지의 왼쪽 선택 영역에서는 이벤트를 선택할 수 있고, 상단 영역에서는 시간 범위를 설정할 수 있습니다.

<Image size="lg" img={mitzu_06} alt="이벤트 선택과 시간 설정을 포함한 Mitzu 세그멘테이션 쿼리 인터페이스" border />

<br/>

:::tip 필터 및 분해(Breakdown)
필터링은 예상하는 것과 같습니다. 속성(ClickHouse 컬럼)을 선택하고, 드롭다운에서 필터링하려는 값을 선택하면 됩니다.
분해(Breakdown)에는 임의의 이벤트 속성이나 사용자 속성을 사용할 수 있습니다(사용자 속성을 통합하는 방법은 아래를 참고하십시오).
:::

## 5. 퍼널 쿼리 실행 \{#5-run-funnel-queries\}

퍼널에 대해 최대 9개의 단계를 선택합니다. 사용자가 퍼널을 완료할 수 있는 시간 범위를 선택합니다.
단 한 줄의 SQL 코드도 작성하지 않고 즉시 전환율 인사이트를 확인할 수 있습니다.

<Image size="lg" img={mitzu_07} alt="단계별 전환율을 보여주는 Mitzu 퍼널 분석 뷰" border />

<br/>

:::tip 추세 시각화
시간 경과에 따른 퍼널 추세를 시각화하려면 `Funnel trends`를 선택하십시오.
:::

## 6. 리텐션 쿼리 실행 \{#6-run-retention-queries\}

리텐션율을 계산하기 위해 최대 2개의 단계를 선택합니다. 반복 측정을 위한 리텐션 윈도우를 선택합니다.
한 줄의 SQL 코드도 작성하지 않고 즉시 전환율에 대한 인사이트를 얻을 수 있습니다.

<Image size="lg" img={mitzu_08} alt="코호트 리텐션율을 보여주는 Mitzu 리텐션 분석 화면" border />

<br/>

:::tip 코호트 리텐션
`Weekly cohort retention`을 선택하여 시간이 지남에 따라 리텐션율이 어떻게 변하는지 시각화합니다.
:::

## 7. 여정 쿼리 실행하기 \{#7-run-journey-queries\}

퍼널(funnel)을 구성할 최대 9개의 단계를 선택합니다. 사용자가 여정을 완료할 수 있는 시간 범위를 선택합니다. Mitzu 여정 차트는 선택한 이벤트를 통해 사용자가 거치는 모든 경로를 시각적으로 보여줍니다.

<Image size="lg" img={mitzu_09} alt="이벤트 간 사용자 경로 흐름을 보여주는 Mitzu 여정 시각화" border />

<br/>

:::tip 단계 세분화
동일한 단계 내에서 사용자를 구분하기 위해 세그먼트의 `Break down`에 사용할 속성을 선택할 수 있습니다.
:::

<br/>

## 8. 수익 쿼리 실행 \{#8-run-revenue-queries\}

수익 설정이 이미 구성되어 있으면 Mitzu는 결제 이벤트를 기반으로 총 MRR과 구독 건수를 계산할 수 있습니다.

<Image size="lg" img={mitzu_10} alt="MRR 지표를 보여주는 Mitzu 수익 분석 대시보드" border />

## 9. SQL 네이티브 \{#9-sql-native\}

Mitzu는 SQL 네이티브 방식으로 동작하며, Explore 페이지에서 선택한 구성에 따라 네이티브 SQL 코드를 생성합니다.

<Image size="lg" img={mitzu_11} alt="Mitzu SQL 코드 생성 화면에 표시된 네이티브 ClickHouse 쿼리" border />

<br/>

:::tip BI 도구에서 작업 이어가기
Mitzu UI에서 제약이 느껴지는 경우, SQL 코드를 복사하여 BI 도구에서 작업을 이어가십시오.
:::

## Mitzu 지원 \{#mitzu-support\}

혼란스러운 점이 있으면 언제든지 [support@mitzu.io](email://support@mitzu.io)로 문의하십시오.

또는 [여기](https://join.slack.com/t/mitzu-io/shared_invite/zt-1h1ykr93a-_VtVu0XshfspFjOg6sczKg)에서 Slack 커뮤니티에 참여할 수 있습니다.

## 더 알아보기 \{#learn-more\}

Mitzu에 대한 자세한 내용은 [mitzu.io](https://mitzu.io)에서 확인할 수 있습니다.

문서는 [docs.mitzu.io](https://docs.mitzu.io)에서 확인하십시오.