---
'sidebar_label': '빠른 시작'
'sidebar_position': 1
'slug': '/integrations/grafana'
'description': 'Grafana와 함께 ClickHouse 사용에 대한 소개'
'title': 'ClickHouse 데이터 소스 플러그인 for Grafana'
'show_related_blogs': true
'doc_type': 'guide'
'integration':
- 'support_level': 'partner'
- 'category': 'data_visualization'
- 'website': 'https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/'
'keywords':
- 'Grafana'
- 'data visualization'
- 'dashboard'
- 'plugin'
- 'data source'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';
import search from '@site/static/images/integrations/data-visualization/grafana/search.png';
import install from '@site/static/images/integrations/data-visualization/grafana/install.png';
import add_new_ds from '@site/static/images/integrations/data-visualization/grafana/add_new_ds.png';
import quick_config from '@site/static/images/integrations/data-visualization/grafana/quick_config.png';
import valid_ds from '@site/static/images/integrations/data-visualization/grafana/valid_ds.png';
import Image from '@theme/IdealImage';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# ClickHouse 데이터 소스 플러그인 for Grafana

<ClickHouseSupportedBadge/>

Grafana를 사용하면 대시보드를 통해 모든 데이터를 탐색하고 공유할 수 있습니다. Grafana는 ClickHouse에 연결하기 위해 플러그인이 필요하며, 이는 그들의 UI 내에서 쉽게 설치할 수 있습니다.

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

## 1. 연결 세부정보 수집하기 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 읽기 전용 사용자 만들기 {#2-making-a-read-only-user}

Grafana와 같은 데이터 시각화 도구에 ClickHouse를 연결할 때는 원치 않는 수정으로부터 데이터를 보호하기 위해 읽기 전용 사용자를 만드는 것이 권장됩니다.

Grafana는 쿼리가 안전한지 검증하지 않습니다. 쿼리는 `DELETE` 및 `INSERT`를 포함한 모든 SQL 문을 포함할 수 있습니다.

읽기 전용 사용자를 구성하려면 다음 단계를 따르십시오:
1. [ClickHouse에서 사용자 및 역할 생성하기](/operations/access-rights) 가이드를 따라 `readonly` 사용자 프로필을 생성하십시오.
2. `readonly` 사용자가 기본 [clickhouse-go 클라이언트](https://github.com/ClickHouse/clickhouse-go)에서 요구하는 `max_execution_time` 설정을 수정할 수 있는 충분한 권한을 가지고 있는지 확인하십시오.
3. 공용 ClickHouse 인스턴스를 사용하는 경우 `readonly` 프로필에서 `readonly=2`로 설정하는 것은 권장하지 않습니다. 대신 `readonly=1`로 두고 `max_execution_time`의 제약 유형을 [changeable_in_readonly](/operations/settings/constraints-on-settings)로 설정하여 이 설정을 수정할 수 있도록 하십시오.

## 3. Grafana용 ClickHouse 플러그인 설치하기 {#3--install-the-clickhouse-plugin-for-grafana}

Grafana가 ClickHouse에 연결하기 전에 적절한 Grafana 플러그인을 설치해야 합니다. Grafana에 로그인되어 있다고 가정하고, 다음 단계를 따르십시오:

1. 사이드바의 **Connections** 페이지에서 **Add new connection** 탭을 선택합니다.

2. **ClickHouse**를 검색하고 Grafana Labs에서 서명한 플러그인을 클릭합니다:

    <Image size="md" img={search} alt="Connections 페이지에서 ClickHouse 플러그인 선택하기" border />

3. 다음 화면에서 **Install** 버튼을 클릭합니다:

    <Image size="md" img={install} alt="ClickHouse 플러그인 설치하기" border />

## 4. ClickHouse 데이터 소스 정의하기 {#4-define-a-clickhouse-data-source}

1. 설치가 완료되면 **Add new data source** 버튼을 클릭합니다. (또한 **Connections** 페이지의 **Data sources** 탭에서 데이터 소스를 추가할 수 있습니다.)

    <Image size="md" img={add_new_ds} alt="ClickHouse 데이터 소스 생성하기" border />

2. 아래로 스크롤하여 **ClickHouse** 데이터 소스 유형을 찾거나 **Add data source** 페이지의 검색창에서 검색할 수 있습니다. **ClickHouse** 데이터 소스를 선택하면 다음 페이지가 나타납니다:

  <Image size="md" img={quick_config} alt="연결 설정 페이지" border />

3. 서버 설정 및 자격 증명을 입력합니다. 주요 설정은 다음과 같습니다:

- **서버 호스트 주소:** ClickHouse 서비스의 호스트 이름입니다.
- **서버 포트:** ClickHouse 서비스의 포트. 서버 구성 및 프로토콜에 따라 다를 수 있습니다.
- **프로토콜:** ClickHouse 서비스에 연결하는 데 사용되는 프로토콜입니다.
- **보안 연결:** 서버에서 보안 연결이 필요하면 활성화합니다.
- **사용자 이름** 및 **비밀번호:** ClickHouse 사용자 자격 증명을 입력합니다. 사용자를 구성하지 않았다면 사용자 이름에 `default`를 시도하십시오. [읽기 전용 사용자 구성하기](#2-making-a-read-only-user)를 권장합니다.

더 많은 설정에 대해서는 [플러그인 구성](./config.md) 문서를 확인하십시오.

4. **Save & test** 버튼을 클릭하여 Grafana가 ClickHouse 서비스에 연결할 수 있는지 확인합니다. 성공하면 **Data source is working** 메시지가 표시됩니다:

    <Image size="md" img={valid_ds} alt="Save & test 선택하기" border />

## 5. 다음 단계 {#5-next-steps}

이제 데이터 소스를 사용할 준비가 완료되었습니다! [쿼리 빌더](./query-builder.md)를 사용하여 쿼리를 작성하는 방법에 대해 더 알아보십시오.

구성에 대한 자세한 내용은 [플러그인 구성](./config.md) 문서를 확인하십시오.

이 문서에 포함되지 않은 추가 정보를 찾고 있다면, [GitHub의 플러그인 저장소](https://github.com/grafana/clickhouse-datasource)를 확인하십시오.

## 플러그인 버전 업그레이드 {#upgrading-plugin-versions}

v4부터는 새로운 버전이 출시됨에 따라 구성 및 쿼리를 업그레이드할 수 있습니다.

v3의 구성 및 쿼리는 열릴 때 v4로 마이그레이션됩니다. 이전 구성 및 대시보드는 v4에서 로드되지만, 마이그레이션은 새 버전에서 다시 저장될 때까지 지속되지 않습니다. 이전 구성/쿼리를 열 때 문제가 발생하면 변경 사항을 무시하고 [GitHub에 문제 보고하기](https://github.com/grafana/clickhouse-datasource/issues) 바랍니다.

구성/쿼리가 최신 버전으로 생성된 경우 플러그인은 이전 버전으로 다운그레이드할 수 없습니다.
