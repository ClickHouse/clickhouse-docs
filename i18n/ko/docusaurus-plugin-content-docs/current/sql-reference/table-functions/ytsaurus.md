---
'description': '테이블 함수는 YTsaurus 클러스터에서 데이터를 읽을 수 있게 해줍니다.'
'sidebar_label': 'ytsaurus'
'sidebar_position': 85
'slug': '/sql-reference/table-functions/ytsaurus'
'title': 'ytsaurus'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ytsaurus 테이블 함수

<ExperimentalBadge/>

테이블 함수는 YTsaurus 클러스터에서 데이터를 읽을 수 있게 해줍니다.

## 구문 {#syntax}

```sql
ytsaurus(http_proxy_url, cypress_path, oauth_token, format)
```

:::info
이 기능은 실험적 기능으로, 향후 릴리스에서 비호환적인 방식으로 변경될 수 있습니다.
YTsaurus 테이블 함수 사용을 활성화하려면
[allow_experimental_ytsaurus_table_function](/operations/settings/settings#allow_experimental_ytsaurus_table_engine) 설정을 사용하세요.
명령어 `set allow_experimental_ytsaurus_table_function = 1`을 입력하세요.
:::

## 인수 {#arguments}

- `http_proxy_url` — YTsaurus http 프록시의 URL.
- `cypress_path` — 데이터 소스에 대한 Cypress 경로.
- `oauth_token` — OAuth 토큰.
- `format` — 데이터 소스의 [형식](/interfaces/formats).

**반환 값**

YTsaurus 클러스터 내에서 지정된 ytsaurus cypress 경로에서 데이터를 읽기 위한 지정된 구조의 테이블입니다.

**참고**

- [ytsaurus 엔진](/engines/table-engines/integrations/ytsaurus.md)
