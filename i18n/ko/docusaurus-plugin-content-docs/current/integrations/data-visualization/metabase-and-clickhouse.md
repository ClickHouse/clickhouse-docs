---
sidebar_label: 'Metabase'
sidebar_position: 131
slug: /integrations/metabase
keywords: ['Metabase']
description: 'Metabase는 데이터에 대해 질문을 던지고 살펴볼 수 있는 사용하기 쉬운 오픈 소스 UI 도구입니다.'
title: 'Metabase를 ClickHouse에 연결하기'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
  - website: 'https://github.com/clickhouse/metabase-clickhouse-driver'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import metabase_01 from '@site/static/images/integrations/data-visualization/metabase_01.png';
import metabase_02 from '@site/static/images/integrations/data-visualization/metabase_02.png';
import metabase_03 from '@site/static/images/integrations/data-visualization/metabase_03.png';
import metabase_04 from '@site/static/images/integrations/data-visualization/metabase_04.png';
import metabase_06 from '@site/static/images/integrations/data-visualization/metabase_06.png';
import metabase_07 from '@site/static/images/integrations/data-visualization/metabase_07.png';
import metabase_08 from '@site/static/images/integrations/data-visualization/metabase_08.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Metabase를 ClickHouse에 연결하기 \{#connecting-metabase-to-clickhouse\}

<PartnerBadge/>

Metabase는 데이터에 대해 질문을 만들고 실행할 수 있는 사용하기 쉬운 오픈 소스 UI 도구입니다. Metabase는 <a href="https://www.metabase.com/start/oss/jar" target="_blank">JAR 파일을 다운로드</a>한 후 `java -jar metabase.jar`로 실행하기만 하면 되는 Java 애플리케이션입니다. Metabase는 JDBC 드라이버를 통해 ClickHouse에 연결하며, 이 드라이버를 다운로드하여 `plugins` 폴더에 넣으면 됩니다:

## 목표 \{#goal\}

이 가이드에서는 Metabase를 사용하여 ClickHouse 데이터에 대해 몇 가지 질의를 수행하고, 그 결과를 시각화합니다. 결과 중 하나는 다음과 같이 표시됩니다:

<Image size="md" img={metabase_08} alt="ClickHouse 데이터를 보여주는 Metabase 파이 차트 시각화" border />

<p/>

:::tip 데이터 추가
사용할 데이터셋이 없다면 예제 중 하나를 추가하면 됩니다. 이 가이드에서는 [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) 데이터셋을 사용하므로, 해당 데이터셋을 선택하는 것이 좋습니다. 동일한 문서 카테고리에서 살펴볼 수 있는 다른 예제들도 여러 개 있습니다.
:::

## 1. 연결 세부 정보 수집 \{#1-gather-your-connection-details\}

<ConnectionDetails />

## 2. Metabase용 ClickHouse 플러그인 다운로드 \{#2--download-the-clickhouse-plugin-for-metabase\}

1. `plugins` 폴더가 없다면 `metabase.jar`가 저장된 위치의 하위 폴더로 `plugins` 폴더를 생성합니다.

2. 플러그인은 `clickhouse.metabase-driver.jar`라는 이름의 JAR 파일입니다. 최신 버전의 JAR 파일은 <a href="https://github.com/clickhouse/metabase-clickhouse-driver/release" target="_blank">https://github.com/clickhouse/metabase-clickhouse-driver/releases/latest</a>에서 다운로드합니다.

3. `clickhouse.metabase-driver.jar`를 `plugins` 폴더에 저장합니다.

4. 드라이버가 올바르게 로드되도록 Metabase를 시작하거나 다시 시작합니다.

5. <a href="http://localhost:3000/" target="_blank">http://hostname:3000</a>에서 Metabase에 접속합니다. 최초 시작 시 환영 화면이 표시되며, 여러 질문에 순서대로 답변해야 합니다. 데이터베이스 선택을 요청받으면 "**나중에 데이터를 추가하겠습니다**"를 선택합니다:

## 3.  Metabase를 ClickHouse에 연결하기 \{#3--connect-metabase-to-clickhouse\}

1. 오른쪽 상단의 톱니바퀴 아이콘을 클릭하고 **Admin Settings**를 선택하여 <a href="http://localhost:3000/admin/settings/setup" target="_blank">Metabase 관리자 페이지</a>로 이동합니다.

2. **Add a database**를 클릭합니다. 또는 **Databases** 탭을 클릭한 다음 **Add database** 버튼을 선택합니다.

3. 드라이버 설치가 정상적으로 완료되었다면 **Database type** 드롭다운 목록에서 **ClickHouse**를 확인할 수 있습니다:

    <Image size="md" img={metabase_01} alt="ClickHouse가 옵션으로 표시된 Metabase 데이터베이스 선택 화면" border />

4. 데이터베이스의 **Display name**을 지정합니다. 이는 Metabase 설정이므로 원하는 이름을 사용하면 됩니다.

5. ClickHouse 데이터베이스의 연결 정보를 입력합니다. ClickHouse 서버가 SSL을 사용하도록 구성되어 있다면 보안 연결을 활성화합니다. 예시는 다음과 같습니다:

    <Image size="md" img={metabase_02} alt="ClickHouse 데이터베이스에 대한 Metabase 연결 정보 입력 폼" border />

6. **Save** 버튼을 클릭하면 Metabase가 데이터베이스를 스캔하여 테이블을 검색합니다.

## 4. SQL 쿼리 실행하기 \{#4-run-a-sql-query\}

1. 오른쪽 상단의 **Exit admin** 버튼을 클릭하여 **Admin settings** 화면을 종료합니다.

2. 오른쪽 상단에서 **+ New** 메뉴를 클릭하면, 질문을 생성하고 SQL 쿼리를 실행하며 대시보드를 구성할 수 있는 옵션이 표시됩니다:

    <Image size="sm" img={metabase_03} alt="질문, SQL 쿼리, 대시보드를 생성하는 옵션이 표시된 Metabase New 메뉴" border />

3. 예를 들어, 다음은 `uk_price_paid`라는 테이블에서 1995년부터 2022년까지 연도별 평균 지불 금액을 반환하는 SQL 쿼리입니다:

    <Image size="md" img={metabase_04} alt="영국 price paid 데이터에 대한 쿼리가 표시된 Metabase SQL 편집기" border />

## 5. 질문 만들기 \{#5-ask-a-question\}

1. **+ New**를 클릭한 뒤 **Question**을 선택합니다. 데이터베이스와 테이블을 선택하는 것부터 질문을 구성할 수 있습니다. 예를 들어, 다음 질문은 `default` 데이터베이스의 `uk_price_paid` 테이블을 대상으로 합니다. 다음은 Greater Manchester 카운티 내에서 마을(town)별 평균 가격을 계산하는 간단한 질문입니다:

    <Image size="md" img={metabase_06} alt="영국 가격 데이터를 사용한 Metabase 질문 빌더 인터페이스" border />

2. 결과를 표 형식으로 보려면 **Visualize** 버튼을 클릭합니다.

    <Image size="md" img={metabase_07} alt="마을별 평균 가격의 표 형식 결과를 보여주는 Metabase 시각화" border />

3. 결과 아래에서 **Visualization** 버튼을 클릭하여 시각화를 막대 차트(또는 제공되는 다른 옵션)로 변경합니다:

    <Image size="md" img={metabase_08} alt="Greater Manchester 지역의 마을별 평균 가격을 보여주는 Metabase 파이 차트 시각화" border />

## 더 알아보기 \{#learn-more\}

Metabase 및 대시보드를 만드는 방법에 대한 자세한 내용은 <a href="https://www.metabase.com/docs/latest/" target="_blank">Metabase 문서</a>를 방문하십시오.