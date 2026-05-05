---
description: '기존에 올바르게 구성된 ClickHouse 사용자 계정은 Kerberos 인증 프로토콜을 통해 인증할 수 있습니다.'
slug: /operations/external-authenticators/kerberos
title: 'Kerberos'
doc_type: 'reference'
---

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

# Kerberos \{#kerberos\}

<SelfManaged />

이미 존재하며 올바르게 구성된 ClickHouse 사용자 계정은 Kerberos 인증 프로토콜을 통해 인증할 수 있습니다.

현재 Kerberos는 `users.xml` 또는 로컬 액세스 제어 경로에 정의된 기존 사용자에 대한 외부 인증 수단으로만 사용할 수 있습니다. 이러한 사용자들은 HTTP 요청만 사용할 수 있으며, GSS-SPNEGO 메커니즘을 사용해 인증할 수 있어야 합니다.

이 방식에서는 시스템에 Kerberos가 구성되어 있어야 하고, ClickHouse 설정에서 Kerberos가 활성화되어 있어야 합니다.

## ClickHouse에서 Kerberos 활성화하기 \{#enabling-kerberos-in-clickhouse\}

Kerberos를 활성화하려면 `config.xml`에 `kerberos` 섹션을 포함해야 합니다. 이 섹션에는 추가 매개변수를 지정할 수 있습니다.

#### 매개변수 \{#parameters\}

* `principal` - 보안 컨텍스트를 수락할 때 사용하기 위해 획득하는 정규 서비스 principal 이름입니다.
  * 이 매개변수는 선택 사항이며, 생략하면 기본 principal이 사용됩니다.

* `realm` - 인증을 해당 realm과 일치하는 발신자 realm을 가진 요청으로만 제한하는 데 사용되는 realm입니다.
  * 이 매개변수는 선택 사항이며, 생략하면 realm 기준의 추가 필터링은 적용되지 않습니다.

* `keytab` - 서비스 keytab 파일의 경로입니다.
  * 이 매개변수는 선택 사항이며, 생략하는 경우 `KRB5_KTNAME` 환경 변수에 서비스 keytab 파일의 경로를 설정해야 합니다.

예시 (`config.xml`에 포함):

```xml
<clickhouse>
    <!- ... -->
    <kerberos />
</clickhouse>
```

프린시펄(principal)을 명시하여:

```xml
<clickhouse>
    <!- ... -->
    <kerberos>
        <principal>HTTP/clickhouse.example.com@EXAMPLE.COM</principal>
    </kerberos>
</clickhouse>
```

realm 기준 필터링:

```xml
<clickhouse>
    <!- ... -->
    <kerberos>
        <realm>EXAMPLE.COM</realm>
    </kerberos>
</clickhouse>
```

:::note
`kerberos` 섹션은 하나만 정의할 수 있습니다. 두 개 이상의 `kerberos` 섹션이 존재하면 ClickHouse는 Kerberos 인증을 비활성화합니다.
:::

:::note
`principal` 섹션과 `realm` 섹션은 동시에 지정할 수 없습니다. `principal` 섹션과 `realm` 섹션이 모두 존재하면 ClickHouse는 Kerberos 인증을 비활성화합니다.
:::

## 기존 사용자에 대한 외부 인증자로서의 Kerberos \{#kerberos-as-an-external-authenticator-for-existing-users\}

Kerberos는 로컬에 정의된 사용자(`users.xml` 이나 로컬 액세스 제어 경로에 정의된 사용자)의 신원을 검증하는 방법으로 사용할 수 있습니다. 현재 **오직** HTTP 인터페이스를 통한 요청만 GSS-SPNEGO 메커니즘을 통해 *kerberized*할 수 있습니다.

Kerberos 프린시펄(principal) 이름 형식은 일반적으로 다음 패턴을 따릅니다:

* *primary/instance@REALM*

*/instance* 부분은 0회 이상 등장할 수 있습니다. **인증이 성공하려면, 요청을 시작한 주체(initiator)의 정규 프린시펄 이름에서 *primary* 부분이 kerberized 사용자 이름과 일치해야 합니다.**

### `users.xml`에서 Kerberos 활성화 \{#enabling-kerberos-in-users-xml\}

사용자에 대해 Kerberos 인증을 활성화하려면, 사용자 정의에서 `password` 또는 이와 유사한 섹션 대신 `kerberos` 섹션을 지정합니다.

매개변수:

* `realm` - 이 realm과 일치하는 initiator의 realm을 가진 요청만 인증하도록 제한하는 데 사용되는 realm입니다.
  * 이 매개변수는 선택 사항이며, 생략하면 realm에 의한 추가 필터링은 적용되지 않습니다.

예시 (`users.xml`에 포함):

```xml
<clickhouse>
    <!- ... -->
    <users>
        <!- ... -->
        <my_user>
            <!- ... -->
            <kerberos>
                <realm>EXAMPLE.COM</realm>
            </kerberos>
        </my_user>
    </users>
</clickhouse>
```

:::note
Kerberos 인증은 다른 어떤 인증 메커니즘과도 함께 사용할 수 없습니다. `kerberos`와 함께 `password`와 같은 다른 섹션이 있으면 ClickHouse가 종료됩니다.
:::

:::info Reminder
이제 사용자 `my_user`가 `kerberos`를 사용하므로, 앞서 설명한 대로 Kerberos를 메인 `config.xml` 파일에서 반드시 활성화해야 합니다.
:::

### SQL을 사용하여 Kerberos 활성화 \{#enabling-kerberos-using-sql\}

ClickHouse에서 [SQL 기반 액세스 제어 및 계정 관리](/operations/access-rights#access-control-usage)가 활성화된 경우, Kerberos로 인증되는 사용자 계정도 SQL 문을 사용하여 생성할 수 있습니다.

```sql
CREATE USER my_user IDENTIFIED WITH kerberos REALM 'EXAMPLE.COM'
```

...또는 realm으로 필터링하지 않을 경우:

```sql
CREATE USER my_user IDENTIFIED WITH kerberos
```
