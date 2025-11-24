---
'sidebar_label': 'API 키 관리'
'slug': '/cloud/manage/openapi'
'title': 'API 키 관리'
'description': 'ClickHouse Cloud는 OpenAPI를 활용하여 계정 및 서비스의 다양한 측면을 프로그래밍 방식으로 관리할 수
  있는 API를 제공합니다.'
'doc_type': 'guide'
'keywords':
- 'api'
- 'openapi'
- 'rest api'
- 'documentation'
- 'cloud management'
---

import image_01 from '@site/static/images/cloud/manage/openapi1.png';
import image_02 from '@site/static/images/cloud/manage/openapi2.png';
import image_03 from '@site/static/images/cloud/manage/openapi3.png';
import image_04 from '@site/static/images/cloud/manage/openapi4.png';
import image_05 from '@site/static/images/cloud/manage/openapi5.png';
import Image from '@theme/IdealImage';


# API 키 관리

ClickHouse Cloud는 OpenAPI를 활용하여 프로그램적으로 귀하의 계정 및 서비스의 여러 측면을 관리할 수 있는 API를 제공합니다.

:::note
이 문서는 ClickHouse Cloud API를 다룹니다. 데이터베이스 API 엔드포인트에 대한 내용은 [Cloud Endpoints API](/cloud/get-started/query-endpoints)를 참조하십시오.
:::

1. 왼쪽 메뉴의 **API Keys** 탭을 사용하여 API 키를 생성하고 관리할 수 있습니다.

  <Image img={image_01} size="sm" alt="API Keys tab" border/>

2. **API Keys** 페이지는 처음에는 아래와 같이 첫 번째 API 키를 생성하라는 메시지를 표시합니다. 첫 번째 키가 생성된 후에는 오른쪽 상단에 표시되는 `New API Key` 버튼을 사용하여 새로운 키를 생성할 수 있습니다.

  <Image img={image_02} size="md" alt="API Keys page" border/>
  
3. API 키를 생성하려면 키 이름, 키에 대한 권한 및 만료 시간을 지정한 후 `Generate API Key`를 클릭합니다.
<br/>
:::note
권한은 ClickHouse Cloud [사전 정의된 역할](/cloud/security/console-roles)과 일치합니다. 개발자 역할은 할당된 서비스에 대해 읽기 전용 권한을 가지며, 관리자 역할은 전체 읽기 및 쓰기 권한을 가집니다.
:::

:::tip 쿼리 API 엔드포인트
[Query API Endpoints](/cloud/get-started/query-endpoints)와 함께 API 키를 사용하려면 조직 역할을 `Member`(최소)로 설정하고 서비스 역할에 `Query Endpoints` 접근 권한을 부여하십시오.
:::

  <Image img={image_03} size="md" alt="Create API key form" border/>

4. 다음 화면에는 Key ID 및 Key secret가 표시됩니다. 이 값을 복사하여 금고와 같은 안전한 곳에 보관하십시오. 화면을 떠나면 값이 더 이상 표시되지 않습니다.

  <Image img={image_04} size="md" alt="API key details" border/>

5. ClickHouse Cloud API는 [HTTP Basic Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)을 사용하여 API 키의 유효성을 확인합니다. 다음은 `curl`을 사용하여 ClickHouse Cloud API에 요청을 보내기 위한 API 키 사용 예제입니다:

```bash
$ KEY_ID=mykeyid
$ KEY_SECRET=mykeysecret

$ curl --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations
```

6. **API Keys** 페이지로 돌아가면 키 이름, Key ID의 마지막 네 글자, 권한, 상태, 만료 날짜 및 생성자를 확인할 수 있습니다. 이 화면에서 키 이름, 권한 및 만료를 편집할 수 있습니다. 이 화면에서 키를 비활성화하거나 삭제할 수도 있습니다.
<br/>
:::note
API 키 삭제는 영구적인 작업입니다. 해당 키를 사용하는 서비스는 ClickHouse Cloud에 대한 접근 권한을 즉시 잃게 됩니다.
:::

  <Image img={image_05} size="md" alt="API Keys management page" border/>

## 엔드포인트 {#endpoints}

엔드포인트에 대한 세부정보는 [API 참조](https://clickhouse.com/docs/cloud/manage/api/swagger)를 참조하십시오. 
귀하의 API Key 및 API Secret를 사용하여 기본 URL `https://api.clickhouse.cloud/v1`에 접근하십시오.
