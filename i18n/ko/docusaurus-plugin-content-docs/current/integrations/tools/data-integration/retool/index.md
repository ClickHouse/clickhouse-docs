---
'sidebar_label': 'Retool'
'slug': '/integrations/retool'
'keywords':
- 'clickhouse'
- 'retool'
- 'connect'
- 'integrate'
- 'ui'
- 'admin'
- 'panel'
- 'dashboard'
- 'nocode'
- 'no-code'
'description': '풍부한 사용자 인터페이스를 갖춘 웹 및 모바일 앱을 신속하게 구축하고, 복잡한 작업을 자동화하며, AI를 통합하세요—모두
  여러분의 데이터로 구동됩니다.'
'title': 'Retool을 ClickHouse에 연결하기'
'doc_type': 'guide'
'integration':
- 'support_level': 'partner'
- 'category': 'data_integration'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import retool_01 from '@site/static/images/integrations/tools/data-integration/retool/retool_01.png';
import retool_02 from '@site/static/images/integrations/tools/data-integration/retool/retool_02.png';
import retool_03 from '@site/static/images/integrations/tools/data-integration/retool/retool_03.png';
import retool_04 from '@site/static/images/integrations/tools/data-integration/retool/retool_04.png';
import retool_05 from '@site/static/images/integrations/tools/data-integration/retool/retool_05.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Retool을 ClickHouse에 연결하기

<PartnerBadge/>

## 1. 연결 세부정보 수집 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. ClickHouse 리소스 생성 {#2-create-a-clickhouse-resource}

Retool 계정에 로그인하고 _Resources_ 탭으로 이동합니다. "Create New" -> "Resource"를 선택합니다:

<Image img={retool_01} size="lg" border alt="새 리소스 생성" />
<br/>

사용 가능한 커넥터 목록에서 "JDBC"를 선택합니다:

<Image img={retool_02} size="lg" border alt="JDBC 커넥터 선택" />
<br/>

설정 마법사에서 "Driver name"으로 `com.clickhouse.jdbc.ClickHouseDriver`를 선택합니다:

<Image img={retool_03} size="lg" border alt="올바른 드라이버 선택" />
<br/>

다음 형식으로 ClickHouse 자격 증명을 입력합니다: `jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD`.
인스턴스가 SSL을 요구하거나 ClickHouse Cloud를 사용하는 경우, 연결 문자열에 `&ssl=true`를 추가하여 `jdbc:clickhouse://HOST:PORT/DATABASE?user=USERNAME&password=PASSWORD&ssl=true`와 같이 보이게 합니다.

<Image img={retool_04} size="lg" border alt="자격 증명 지정" />
<br/>

그 후, 연결을 테스트합니다:

<Image img={retool_05} size="lg" border alt="연결 테스트" />
<br/>

이제 ClickHouse 리소스를 사용하여 앱으로 진행할 수 있어야 합니다.
