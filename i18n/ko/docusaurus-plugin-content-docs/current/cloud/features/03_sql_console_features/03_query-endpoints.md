---
sidebar_title: 'Query API endpoint'
slug: /cloud/features/query-api-endpoints
description: '저장된 쿼리로부터 REST API 엔드포인트를 손쉽게 생성합니다'
keywords: ['api', '쿼리 api 엔드포인트', '쿼리 엔드포인트', '쿼리 rest api']
title: 'Query API endpoint'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import console_api_keys from '@site/static/images/cloud/guides/query-endpoints/console-api-keys.png';
import edit_api_key from '@site/static/images/cloud/guides/query-endpoints/api-key-edit.png';
import specific_locations from '@site/static/images/cloud/guides/query-endpoints/specific-locations.png';

대화형 데이터 기반 애플리케이션을 구축하려면 빠른 데이터베이스, 잘 구조화된 데이터, 최적화된 쿼리만으로는 충분하지 않습니다.
프런트엔드와 마이크로서비스도 이러한 쿼리가 반환하는 데이터를, 가능하면 잘 구조화된 API를 통해 손쉽게 활용할 수 있어야 합니다.

**Query API endpoint** 기능을 사용하면 ClickHouse Cloud 콘솔에 저장된 모든 SQL 쿼리에서 API 엔드포인트를 직접 생성할 수 있습니다.
네이티브 드라이버로 ClickHouse Cloud 서비스에 연결할 필요 없이 HTTP를 통해 API 엔드포인트에 접근해 저장된 쿼리를 실행할 수 있습니다.

## IP Access Control \{#ip-access-control\}

Query API endpoint는 API 키 수준의 IP 허용 목록(whitelist)을 준수합니다. SQL Console과 마찬가지로 Query API endpoint는 ClickHouse 인프라 내부에서 요청을 프록시하므로, 서비스 수준의 IP 허용 목록 설정은 적용되지 않습니다.

Query API endpoint를 호출할 수 있는 클라이언트를 제한하려면 다음 단계를 수행합니다:

<VerticalStepper headerLevel="h4">
  #### API 키 설정 열기 \{#open-settings\}

  1. ClickHouse Cloud Console → **Organization** → **API Keys**로 이동합니다.

  <Image img={console_api_keys} size="md" alt="API Keys" />

  2. Query API endpoint에 사용되는 API 키 옆의 **Edit**를 클릭합니다.

  <Image img={edit_api_key} size="md" alt="Edit" />

  #### 허용할 IP 주소 추가 \{#add-ips\}

  1. **Allow access to this API Key** 섹션에서 **Specific locations**를 선택합니다.
  2. IP 주소 또는 CIDR 범위를 입력합니다(예: `203.0.113.1` 또는 `203.0.113.0/24`).
  3. 필요에 따라 여러 항목을 추가합니다.

  <Image img={specific_locations} size="md" alt="Specific locations" />

  Query API endpoint를 생성하려면 Admin Console Role과 적절한 권한이 부여된 API 키가 필요합니다.
</VerticalStepper>

:::tip Guide
몇 단계만으로 Query API endpoint를 설정하는 방법은 [Query API endpoints guide](/cloud/get-started/query-endpoints)를 참고하십시오.
:::