---
sidebar_label: 'API 키 관리'
slug: /cloud/manage/openapi
title: 'API 키 관리'
description: 'ClickHouse Cloud는 OpenAPI를 사용하는 API를 제공하여 계정과 서비스의 여러 요소를 프로그래밍 방식으로 관리할 수 있도록 합니다.'
doc_type: 'guide'
keywords: ['api', 'openapi', 'rest api', 'documentation', 'cloud management']
---

import image_01 from '@site/static/images/cloud/manage/openapi1.png';
import image_02 from '@site/static/images/cloud/manage/openapi2.png';
import image_03 from '@site/static/images/cloud/manage/openapi3.png';
import image_04 from '@site/static/images/cloud/manage/openapi4.png';
import image_05 from '@site/static/images/cloud/manage/openapi5.png';
import Image from '@theme/IdealImage';


# API 키 관리 \{#managing-api-keys\}

ClickHouse Cloud는 OpenAPI를 사용하는 API를 제공하여 계정과 서비스의 여러 측면을 프로그래밍 방식으로 관리할 수 있습니다.

:::note
이 문서는 ClickHouse Cloud API를 다룹니다. 데이터베이스 API 엔드포인트는 [Cloud Endpoints API](/cloud/get-started/query-endpoints)를 참조하십시오.
:::

1. 왼쪽 메뉴의 **API Keys** 탭을 사용하여 API 키를 생성하고 관리할 수 있습니다.

<Image img={image_01} size="sm" alt="API Keys 탭" border />

2. **API Keys** 페이지는 처음에 아래와 같이 첫 번째 API 키를 생성하라는 메시지를 표시합니다. 첫 번째 키를 생성한 후에는 오른쪽 상단에 나타나는 `New API Key` 버튼을 사용하여 새 키를 생성할 수 있습니다.

<Image img={image_02} size="md" alt="API Keys 페이지" border />

3. API 키를 생성하려면 키 이름, 키에 대한 권한, 만료 시간을 지정한 다음 `Generate API Key`를 클릭합니다.

<br />

:::note
권한은 ClickHouse Cloud의 [사전 정의된 역할](/cloud/security/console-roles)에 기반합니다. developer 역할은 할당된 서비스에 대해 읽기 전용 권한을 가지며, admin 역할은 전체 읽기 및 쓰기 권한을 가집니다.
:::

:::tip Query API Endpoints 사용
[Query API Endpoints](/cloud/get-started/query-endpoints)에서 API 키를 사용하려면 Organization Role을 최소 `Member`로 설정하고, Service Role에 `Query Endpoints` 접근 권한을 부여하십시오.
:::

<Image img={image_03} size="md" alt="API 키 생성 양식" border />

4. 다음 화면에 Key ID와 Key secret이 표시됩니다. 이 값을 복사하여 vault와 같은 안전한 위치에 보관하십시오. 이 화면을 떠난 후에는 값이 다시 표시되지 않습니다.

<Image img={image_04} size="md" alt="API 키 세부 정보" border />

5. ClickHouse Cloud API는 [HTTP Basic Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)을 사용하여 API 키의 유효성을 검증합니다. 다음은 `curl`을 사용하여 ClickHouse Cloud API에 요청을 보내기 위해 API 키를 사용하는 방법의 예시입니다.

```bash
$ KEY_ID=mykeyid
$ KEY_SECRET=mykeysecret

$ curl --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations
```

6. **API Keys** 페이지로 돌아가면 키 이름, Key ID의 마지막 네 문자, 권한, 상태, 만료 날짜, 생성자를 확인할 수 있습니다. 이 화면에서 키 이름, 권한, 만료 날짜를 수정할 수 있습니다. 이 화면에서 키를 비활성화하거나 삭제할 수도 있습니다.

<br />

:::note
API 키 삭제는 되돌릴 수 없는 영구적인 작업입니다. 해당 키를 사용 중인 모든 서비스는 즉시 ClickHouse Cloud에 대한 액세스 권한을 잃게 됩니다.
:::

<Image img={image_05} size="md" alt="API Keys 관리 페이지" border />


## 엔드포인트 \{#endpoints\}

엔드포인트에 대한 자세한 내용은 [API reference](https://clickhouse.com/docs/cloud/manage/api/swagger)를 참조하십시오.  
기본 URL `https://api.clickhouse.cloud/v1`과 함께 API Key와 API Secret을 사용하십시오.