---
sidebar_label: 'Looker'
slug: /integrations/looker
keywords: ['clickhouse', 'looker', 'connect', 'integrate', 'ui']
description: 'Looker는 BI, 데이터 애플리케이션 및 임베디드 애널리틱스를 위한 엔터프라이즈 플랫폼으로, 인사이트를 실시간으로 탐색하고 공유할 수 있게 해줍니다.'
title: 'Looker'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import looker_01 from '@site/static/images/integrations/data-visualization/looker_01.png';
import looker_02 from '@site/static/images/integrations/data-visualization/looker_02.png';
import looker_03 from '@site/static/images/integrations/data-visualization/looker_03.png';
import looker_04 from '@site/static/images/integrations/data-visualization/looker_04.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Looker \{#looker\}

<PartnerBadge/>

Looker는 공식 ClickHouse 데이터 소스를 통해 ClickHouse Cloud 또는 온프레미스 배포 환경에 연결할 수 있습니다.

## 1. 연결 정보 확인 \{#1-gather-your-connection-details\}

<ConnectionDetails />

## 2. ClickHouse 데이터 소스 생성 \{#2-create-a-clickhouse-data-source\}

Admin -> Database -> Connections로 이동한 후 오른쪽 상단의 「Add Connection」 버튼을 클릭합니다.

<Image size="md" img={looker_01} alt="Looker의 데이터베이스 관리 인터페이스에서 새 연결을 추가하는 화면" border />

<br/>

데이터 소스 이름을 지정한 다음 Dialect 드롭다운에서 `ClickHouse`를 선택합니다. 양식에 자격 증명을 입력합니다.

<Image size="md" img={looker_02} alt="Looker 연결 양식에서 ClickHouse 자격 증명을 지정하는 화면" border />

<br/>

ClickHouse Cloud를 사용하거나 배포에 SSL이 필요한 경우, 추가 설정에서 SSL이 활성화되어 있는지 확인합니다.

<Image size="md" img={looker_03} alt="Looker 설정에서 ClickHouse 연결을 위해 SSL을 활성화하는 화면" border />

<br/>

연결을 먼저 테스트한 다음, 성공하면 새 ClickHouse 데이터 소스에 연결합니다.

<Image size="md" img={looker_04} alt="ClickHouse 데이터 소스를 테스트하고 연결하는 화면" border />

<br/>

이제 ClickHouse 데이터 소스를 Looker 프로젝트에 연결할 수 있습니다.

## 3. 알려진 제한 사항 \{#3-known-limitations\}

1. 다음 데이터 타입은 기본적으로 문자열로 처리됩니다.
   * Array - JDBC 드라이버의 제한으로 인해 직렬화가 예상대로 동작하지 않습니다
   * Decimal* - 모델에서 number로 변경할 수 있습니다
   * LowCardinality(...) - 모델에서 적절한 타입으로 변경할 수 있습니다
   * Enum8, Enum16
   * UUID
   * Tuple
   * Map
   * JSON
   * Nested
   * FixedString
   * Geo 타입
     * MultiPolygon
     * Polygon
     * Point
     * Ring
2. [Symmetric aggregate 기능](https://cloud.google.com/looker/docs/reference/param-explore-symmetric-aggregates)은 지원되지 않습니다
3. [Full outer join](https://cloud.google.com/looker/docs/reference/param-explore-join-type#full_outer)은 아직 드라이버에 구현되지 않았습니다