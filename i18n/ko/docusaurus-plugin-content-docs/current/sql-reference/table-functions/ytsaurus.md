---
description: '테이블 함수는 YTsaurus 클러스터에서 데이터를 읽을 수 있게 합니다.'
sidebar_label: 'ytsaurus'
sidebar_position: 85
slug: /sql-reference/table-functions/ytsaurus
title: 'ytsaurus'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ytsaurus Table Function \{#ytsaurus-table-function\}

<ExperimentalBadge/>

이 table FUNCTION을 사용하면 YTsaurus 클러스터에서 데이터를 읽을 수 있습니다.



## 문법 \{#syntax\}

```sql
ytsaurus(http_proxy_url, cypress_path, oauth_token, format)
```

:::info
이는 실험적인 기능이며, 향후 릴리스에서 하위 호환성이 없는 방식으로 변경될 수 있습니다.
[allow&#95;experimental&#95;ytsaurus&#95;table&#95;function](/operations/settings/settings#allow_experimental_ytsaurus_table_engine) 설정을 사용하여
YTsaurus table function의 사용을 활성화합니다.
`set allow_experimental_ytsaurus_table_function = 1` 명령을 입력합니다.
:::


## Arguments \{#arguments\}

- `http_proxy_url` — YTsaurus HTTP proxy의 URL입니다.
- `cypress_path` — 데이터 소스에 대한 Cypress 경로입니다.
- `oauth_token` — OAuth 토큰입니다.
- `format` — 데이터 소스의 [format](/interfaces/formats)입니다.

**Returned value**

YTsaurus 클러스터의 지정된 ytsaurus cypress 경로에서 데이터를 읽을 수 있도록, 지정한 구조를 가진 테이블을 반환합니다.

**See Also**

- [ytsaurus 엔진](/engines/table-engines/integrations/ytsaurus.md)
