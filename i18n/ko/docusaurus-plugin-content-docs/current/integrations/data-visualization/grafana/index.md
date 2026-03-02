---
sidebar_label: '빠른 시작'
sidebar_position: 1
slug: /integrations/grafana
description: 'Grafana에서 ClickHouse를 사용하는 방법 소개'
title: 'Grafana용 ClickHouse 데이터 소스 플러그인'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
  - website: 'https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/'
keywords: ['Grafana', '데이터 시각화', '대시보드', '플러그인', '데이터 소스']
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';
import search from '@site/static/images/integrations/data-visualization/grafana/search.png';
import install from '@site/static/images/integrations/data-visualization/grafana/install.png';
import add_new_ds from '@site/static/images/integrations/data-visualization/grafana/add_new_ds.png';
import quick_config from '@site/static/images/integrations/data-visualization/grafana/quick_config.png';
import valid_ds from '@site/static/images/integrations/data-visualization/grafana/valid_ds.png';
import Image from '@theme/IdealImage';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Grafana용 ClickHouse 데이터 소스 플러그인 \{#clickhouse-data-source-plugin-for-grafana\}

<ClickHouseSupportedBadge/>

Grafana를 사용하면 대시보드를 통해 모든 데이터를 탐색하고 공유할 수 있습니다.
Grafana에서 ClickHouse에 연결하려면 플러그인이 필요하며, Grafana UI에서 쉽게 설치할 수 있습니다.

<div class='vimeo-container'>
  <iframe src="//www.youtube.com/embed/bRce9xWiqQM"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

## 1. 연결 정보 확인 \{#1-gather-your-connection-details\}

<ConnectionDetails />

## 2. 읽기 전용 사용자 만들기 \{#2-making-a-read-only-user\}

Grafana와 같은 데이터 시각화 도구에 ClickHouse를 연결할 때는, 원치 않는 데이터 변경으로부터 데이터를 보호하기 위해 읽기 전용 사용자를 만드는 것이 좋습니다.

Grafana는 쿼리가 안전한지 검증하지 않습니다. 쿼리에는 `DELETE` 및 `INSERT`를 포함해 어떤 SQL 문이든 포함될 수 있습니다.

읽기 전용 사용자를 구성하려면 다음 단계를 따르십시오.

1. [ClickHouse에서 사용자와 역할 만들기](/operations/access-rights) 가이드를 참고하여 `readonly` 사용자 프로파일을 만듭니다.
2. `readonly` 사용자가 내부적으로 사용하는 [clickhouse-go client](https://github.com/ClickHouse/clickhouse-go)에 의해 요구되는 `max_execution_time` 설정을 변경할 수 있을 만큼의 권한을 가지고 있는지 확인합니다.
3. 퍼블릭 ClickHouse 인스턴스를 사용하는 경우, `readonly` 프로파일에서 `readonly=2`를 설정하는 것은 권장되지 않습니다. 대신 `readonly=1`로 두고, 이 설정을 변경할 수 있도록 `max_execution_time`의 제약 조건 유형을 [changeable_in_readonly](/operations/settings/constraints-on-settings)로 설정합니다.

## 3. Grafana용 ClickHouse 플러그인 설치 \{#3--install-the-clickhouse-plugin-for-grafana\}

Grafana가 ClickHouse에 연결하려면 적절한 Grafana 플러그인을 설치해야 합니다. Grafana에 로그인한 상태에서 다음 단계를 따르십시오.

1. 사이드바의 **Connections** 페이지에서 **Add new connection** 탭을 선택합니다.

2. **ClickHouse**를 검색한 후 Grafana Labs에서 서명된 플러그인을 클릭합니다.

    <Image size="md" img={search} alt="Connections 페이지에서 ClickHouse 플러그인을 선택" border />

3. 다음 화면에서 **Install** 버튼을 클릭합니다.

    <Image size="md" img={install} alt="ClickHouse 플러그인을 설치" border />

## 4. ClickHouse 데이터 소스 정의 \{#4-define-a-clickhouse-data-source\}

1. 설치가 완료되면 **Add new data source** 버튼을 클릭합니다. (**Connections** 페이지의 **Data sources** 탭에서도 데이터 소스를 추가할 수 있습니다.)

    <Image size="md" img={add_new_ds} alt="ClickHouse 데이터 소스 생성" border />

2. 아래로 스크롤하여 **ClickHouse** 데이터 소스 유형을 찾거나, **Add data source** 페이지의 검색 창에서 검색합니다. **ClickHouse** 데이터 소스를 선택하면 다음 페이지가 표시됩니다:

<Image size="md" img={quick_config} alt="연결 구성 페이지" border />

3. 서버 설정과 자격 증명을 입력합니다. 주요 설정은 다음과 같습니다.

- **Server host address:** ClickHouse 서비스의 호스트 이름입니다.
- **Server port:** ClickHouse 서비스의 포트입니다. 서버 설정과 프로토콜에 따라 달라집니다.
- **Protocol:** ClickHouse 서비스에 연결하는 데 사용하는 프로토콜입니다.
- **Secure connection:** 서버에서 보안 연결을 요구하는 경우 활성화합니다.
- **Username** 과 **Password**: ClickHouse 사용자 자격 증명을 입력합니다. 사용자를 따로 설정하지 않았다면 사용자 이름으로 `default` 를 시도해 볼 수 있습니다. [읽기 전용 사용자 구성](#2-making-a-read-only-user)을 권장합니다.

추가 설정은 [plugin configuration](./config.md) 문서를 참고하십시오.

4. Grafana가 ClickHouse 서비스에 연결할 수 있는지 확인하려면 **Save & test** 버튼을 클릭합니다. 연결에 성공하면 **Data source is working** 메시지가 표시됩니다:

    <Image size="md" img={valid_ds} alt="Save & test 선택" border />

## 5. 다음 단계 \{#5-next-steps\}

이제 데이터 소스를 사용할 준비가 되었습니다! [query builder](./query-builder.md)를 사용하여 쿼리를 작성하는 방법을 자세히 알아보십시오.

구성에 대한 자세한 내용은 [plugin configuration](./config.md) 문서를 참고하십시오.

이 문서에서 다루지 않은 추가 정보가 필요하면 [GitHub의 플러그인 저장소](https://github.com/grafana/clickhouse-datasource)를 확인하십시오.

## 플러그인 버전 업그레이드 \{#upgrading-plugin-versions\}

v4부터는 새 버전이 출시될 때 설정 및 쿼리를 업그레이드할 수 있습니다.

v3에서 생성된 설정과 쿼리는 열리는 즉시 v4로 마이그레이션됩니다. 기존 설정과 대시보드는 v4에서 로드되지만, 새 버전에서 다시 저장하기 전까지는 마이그레이션 내용이 지속적으로 반영되지 않습니다. 이전 설정/쿼리를 열 때 문제가 발생하면 변경 내용을 취소하고 [GitHub에 이슈를 보고해 주십시오](https://github.com/grafana/clickhouse-datasource/issues).

설정/쿼리가 더 최신 버전에서 생성된 경우, 플러그인을 이전 버전으로 다운그레이드할 수 없습니다.