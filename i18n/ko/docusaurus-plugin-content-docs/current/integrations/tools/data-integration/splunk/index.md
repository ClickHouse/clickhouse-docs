---
'sidebar_label': 'Splunk'
'slug': '/integrations/audit-splunk'
'keywords':
- 'clickhouse'
- 'Splunk'
- 'audit'
- 'cloud'
'description': 'ClickHouse Cloud 감사 로그를 Splunk에 저장합니다.'
'title': 'ClickHouse Cloud 감사 로그를 Splunk에 저장하기'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import splunk_001 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_001.png';
import splunk_002 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_002.png';
import splunk_003 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_003.png';
import splunk_004 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_004.png';
import splunk_005 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_005.png';
import splunk_006 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_006.png';
import splunk_007 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_007.png';
import splunk_008 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_008.png';
import splunk_009 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_009.png';
import splunk_010 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_010.png';
import splunk_011 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_011.png';
import splunk_012 from '@site/static/images/integrations/tools/data-integration/splunk/splunk_012.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# ClickHouse Cloud 감사 로그를 Splunk에 저장하기

<PartnerBadge/>

[Splunk](https://www.splunk.com/)는 데이터 분석 및 모니터링 플랫폼입니다.

이 애드온은 사용자가 [ClickHouse Cloud 감사 로그](/cloud/security/audit-logging)를 Splunk에 저장할 수 있도록 합니다. 이 애드온은 [ClickHouse Cloud API](/cloud/manage/api/api-overview)를 사용하여 감사 로그를 다운로드합니다.

이 애드온은 오직 모듈형 입력만 포함되어 있으며, 추가적인 UI는 제공되지 않습니다.


# 설치

## Splunk Enterprise의 경우 {#for-splunk-enterprise}

[Splunkbase](https://splunkbase.splunk.com/app/7709)에서 ClickHouse Cloud 감사 애드온을 다운로드합니다.

<Image img={splunk_001} size="lg" alt="ClickHouse Cloud 감사 애드온 다운로드 페이지를 보여주는 Splunkbase 웹사이트" border />

Splunk Enterprise에서 Apps -> Manage로 이동합니다. 그런 다음 파일에서 앱 설치를 클릭합니다.

<Image img={splunk_002} size="lg" alt="파일에서 앱 설치 옵션을 보여주는 Splunk Enterprise 인터페이스" border />

Splunkbase에서 다운로드한 압축 파일을 선택하고 업로드를 클릭합니다.

<Image img={splunk_003} size="lg" alt="ClickHouse 애드온을 업로드하기 위한 Splunk 앱 설치 대화상자" border />

모든 것이 잘 진행되면 ClickHouse 감사 로그 애플리케이션이 설치된 것을 볼 수 있어야 합니다. 그렇지 않은 경우 Splunkd 로그에서 오류를 확인하세요.


# 모듈형 입력 구성

모듈형 입력을 구성하려면 ClickHouse Cloud 배포에서 정보를 먼저 확보해야 합니다:

- 조직 ID
- 관리자 [API 키](/cloud/manage/openapi)

## ClickHouse Cloud에서 정보 가져오기 {#getting-information-from-clickhouse-cloud}

[ClickHouse Cloud 콘솔](https://console.clickhouse.cloud/)에 로그인합니다.

조직 -> 조직 세부정보로 이동합니다. 거기서 조직 ID를 복사할 수 있습니다.

<Image img={splunk_004} size="lg" alt="조직 ID가 있는 조직 세부정보 페이지를 보여주는 ClickHouse Cloud 콘솔" border />

그런 다음 왼쪽 메뉴에서 API 키로 이동합니다.

<Image img={splunk_005} size="lg" alt="왼쪽 탐색 메뉴에서 API 키 섹션을 보여주는 ClickHouse Cloud 콘솔" border />

API 키를 생성하고, 의미 있는 이름을 부여하며 `Admin` 권한을 선택합니다. API 키 생성을 클릭합니다.

<Image img={splunk_006} size="lg" alt="관리자 권한이 선택된 API 키 생성 인터페이스를 보여주는 ClickHouse Cloud 콘솔" border />

API 키와 비밀을 안전한 곳에 저장합니다.

<Image img={splunk_007} size="lg" alt="생성된 API 키와 비밀을 저장해야 하는 ClickHouse Cloud 콘솔" border />

## Splunk에서 데이터 입력 구성 {#configure-data-input-in-splunk}

Splunk로 돌아가서 Settings -> Data inputs로 이동합니다.

<Image img={splunk_008} size="lg" alt="데이터 입력 옵션을 보여주는 Splunk 인터페이스의 설정 메뉴" border />

ClickHouse Cloud 감사 로그 데이터 입력을 선택합니다.

<Image img={splunk_009} size="lg" alt="ClickHouse Cloud 감사 로그 옵션을 보여주는 Splunk 데이터 입력 페이지" border />

"새로 만들기"를 클릭하여 데이터 입력의 새 인스턴스를 구성합니다.

<Image img={splunk_010} size="lg" alt="새 ClickHouse Cloud 감사 로그 데이터 입력을 구성하기 위한 Splunk 인터페이스" border />

모든 정보를 입력한 후 다음을 클릭합니다.

<Image img={splunk_011} size="lg" alt="완료된 ClickHouse 데이터 입력 설정을 보여주는 Splunk 구성 페이지" border />

입력이 구성되었으며, 감사 로그를 탐색할 수 있습니다.


# 사용법

모듈형 입력은 데이터를 Splunk에 저장합니다. 데이터를 보려면 Splunk의 일반 검색 뷰를 사용할 수 있습니다.

<Image img={splunk_012} size="lg" alt="ClickHouse 감사 로그 데이터를 보여주는 Splunk 검색 인터페이스" border />
