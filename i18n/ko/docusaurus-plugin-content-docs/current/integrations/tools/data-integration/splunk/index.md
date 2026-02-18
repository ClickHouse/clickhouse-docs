---
sidebar_label: 'Splunk'
slug: /integrations/audit-splunk
keywords: ['clickhouse', 'Splunk', 'audit', 'cloud']
description: 'ClickHouse Cloud 감사 로그를 Splunk에 저장합니다.'
title: 'ClickHouse Cloud 감사 로그를 Splunk에 저장하기'
doc_type: 'guide'
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


# ClickHouse Cloud 감사 로그를 Splunk에 저장하기 \{#storing-clickhouse-cloud-audit-logs-into-splunk\}

<PartnerBadge/>

[Splunk](https://www.splunk.com/)은 데이터 분석 및 모니터링 플랫폼입니다.

이 애드온을 사용하면 [ClickHouse Cloud 감사 로그](/cloud/security/audit-logging)를 Splunk에 저장할 수 있습니다. 감사 로그를 다운로드하기 위해 [ClickHouse Cloud API](/cloud/manage/api/api-overview)를 사용합니다.

이 애드온에는 모듈형 입력(modular input)만 포함되어 있으며, 추가 UI는 제공되지 않습니다.

# 설치 \{#installation\}

## Splunk Enterprise용 \{#for-splunk-enterprise\}

[Splunkbase](https://splunkbase.splunk.com/app/7709)에서 Splunk용 ClickHouse Cloud Audit Add-on을 다운로드합니다.

<Image img={splunk_001} size="lg" alt="Splunk용 ClickHouse Cloud Audit Add-on 다운로드 페이지를 보여주는 Splunkbase 웹사이트" border />

Splunk Enterprise에서 Apps -> Manage로 이동한 다음, 「Install app from file」을 클릭합니다.

<Image img={splunk_002} size="lg" alt="「Install app from file」 옵션이 있는 Apps 관리 페이지를 보여주는 Splunk Enterprise 인터페이스" border />

Splunkbase에서 다운로드한 압축 파일을 선택하고 「Upload」를 클릭합니다.

<Image img={splunk_003} size="lg" alt="ClickHouse Add-on을 업로드하기 위한 Splunk 앱 설치 대화 상자" border />

설치가 정상적으로 완료되면 ClickHouse Audit logs 애플리케이션이 설치된 것을 확인할 수 있습니다. 그렇지 않은 경우 Splunkd 로그에서 오류를 확인하십시오.

# 모듈형 입력 구성 \{#modular-input-configuration\}

모듈형 입력을 구성하려면 먼저 ClickHouse Cloud 배포에서 다음 정보를 가져와야 합니다:

- 조직 ID
- 관리자 [API Key](/cloud/manage/openapi)

## ClickHouse Cloud에서 정보 가져오기 \{#getting-information-from-clickhouse-cloud\}

[ClickHouse Cloud console](https://console.clickhouse.cloud/)에 로그인합니다.

Organization -> Organization details로 이동합니다. 여기에서 Organization ID를 복사할 수 있습니다.

<Image img={splunk_004} size="lg" alt="Organization ID가 포함된 Organization details 페이지를 보여주는 ClickHouse Cloud console" border />

그런 다음 왼쪽 메뉴에서 API Keys 항목으로 이동합니다.

<Image img={splunk_005} size="lg" alt="왼쪽 내비게이션 메뉴에서 API Keys 섹션을 보여주는 ClickHouse Cloud console" border />

API Key를 생성하고 의미 있는 이름을 지정한 뒤 `Admin` 권한을 선택합니다. 그런 다음 Generate API Key를 클릭합니다.

<Image img={splunk_006} size="lg" alt="Admin 권한이 선택된 API Key 생성 인터페이스를 보여주는 ClickHouse Cloud console" border />

생성된 API Key와 secret을 안전한 위치에 저장합니다.

<Image img={splunk_007} size="lg" alt="저장해야 할 생성된 API Key와 secret을 보여주는 ClickHouse Cloud console" border />

## Splunk에서 데이터 입력 구성하기 \{#configure-data-input-in-splunk\}

Splunk로 돌아가서 Settings -> Data inputs로 이동합니다.

<Image img={splunk_008} size="lg" alt="Data inputs 옵션이 포함된 Settings 메뉴를 표시하는 Splunk 인터페이스" border />

ClickHouse Cloud Audit Logs 데이터 입력을 선택합니다.

<Image img={splunk_009} size="lg" alt="ClickHouse Cloud Audit Logs 옵션이 표시된 Splunk Data inputs 페이지" border />

새 데이터 입력 인스턴스를 구성하려면 「New」를 클릭합니다.

<Image img={splunk_010} size="lg" alt="새 ClickHouse Cloud Audit Logs 데이터 입력을 구성하는 Splunk 인터페이스" border />

모든 정보를 입력한 후 「Next」를 클릭합니다.

<Image img={splunk_011} size="lg" alt="ClickHouse 데이터 입력 설정이 완료된 Splunk 구성 페이지" border />

데이터 입력 구성이 완료되면 감사 로그를 조회할 수 있습니다.

# 사용 \{#usage\}

모듈형 입력은 데이터를 Splunk에 저장합니다. 데이터를 조회하려면 Splunk의 일반 검색 뷰를 사용합니다.

<Image img={splunk_012} size="lg" alt="ClickHouse 감사 로그 데이터를 표시하는 Splunk 검색 인터페이스" border />