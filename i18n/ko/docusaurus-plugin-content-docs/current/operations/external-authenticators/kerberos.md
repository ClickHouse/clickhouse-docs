---
'description': '기존의 적절하게 구성된 ClickHouse 사용자들은 Kerberos 인증 프로토콜을 통해 인증될 수 있습니다.'
'slug': '/operations/external-authenticators/kerberos'
'title': 'Kerberos'
'doc_type': 'reference'
---

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';


# Kerberos

<SelfManaged />

기존의 적절하게 구성된 ClickHouse 사용자는 Kerberos 인증 프로토콜을 통해 인증될 수 있습니다.

현재 Kerberos는 `users.xml`에 정의된 기존 사용자 또는 로컬 접근 제어 경로에 정의된 사용자에 대한 외부 인증자로만 사용될 수 있습니다. 이러한 사용자는 HTTP 요청만 사용할 수 있으며 GSS-SPNEGO 메커니즘을 사용하여 인증해야 합니다.

이 접근 방식을 위해 Kerberos는 시스템에서 구성되어야 하며 ClickHouse 구성에서 활성화되어야 합니다.

## ClickHouse에서 Kerberos 활성화 {#enabling-kerberos-in-clickhouse}

Kerberos를 활성화하려면 `config.xml`에 `kerberos` 섹션을 포함해야 합니다. 이 섹션은 추가 매개변수를 포함할 수 있습니다.

#### 매개변수 {#parameters}

- `principal` - 보안 컨텍스트를 수락할 때 얻고 사용할 정규 서비스 주체 이름입니다.
  - 이 매개변수는 선택 사항이며 생략할 경우 기본 주체가 사용됩니다.

- `realm` - 인증을 제한하는 데 사용될 영역으로, 이 영역의 주체와 요청자의 영역이 일치하는 요청만을 포함합니다.
  - 이 매개변수는 선택 사항이며 생략할 경우 영역에 대한 추가 필터링은 적용되지 않습니다.

- `keytab` - 서비스 키탭 파일의 경로입니다.
  - 이 매개변수는 선택 사항이며 생략할 경우 서비스 키탭 파일의 경로는 `KRB5_KTNAME` 환경 변수에 설정되어야 합니다.

예시 (`config.xml`에 포함):

```xml
<clickhouse>
    <!- ... -->
    <kerberos />
</clickhouse>
```

주체 지정이 있는 경우:

```xml
<clickhouse>
    <!- ... -->
    <kerberos>
        <principal>HTTP/clickhouse.example.com@EXAMPLE.COM</principal>
    </kerberos>
</clickhouse>
```

영역에 의한 필터링이 있는 경우:

```xml
<clickhouse>
    <!- ... -->
    <kerberos>
        <realm>EXAMPLE.COM</realm>
    </kerberos>
</clickhouse>
```

:::note
`kerberos` 섹션은 한 개만 정의할 수 있습니다. 여러 개의 `kerberos` 섹션이 있을 경우 ClickHouse는 Kerberos 인증을 비활성화합니다.
:::

:::note
`principal`과 `realm` 섹션은 동시에 지정할 수 없습니다. `principal`과 `realm` 섹션이 모두 존재할 경우 ClickHouse는 Kerberos 인증을 비활성화합니다.
:::

## 기존 사용자에 대한 외부 인증자로서의 Kerberos {#kerberos-as-an-external-authenticator-for-existing-users}

Kerberos는 로컬에 정의된 사용자( `users.xml`에 정의된 사용자 또는 로컬 접근 제어 경로에 정의된 사용자)의 신원을 확인하는 방법으로 사용될 수 있습니다. 현재 **오직** HTTP 인터페이스를 통한 요청만이 *kerberized*될 수 있습니다(GSS-SPNEGO 메커니즘을 통해).

Kerberos 주체 이름 형식은 일반적으로 다음 패턴을 따릅니다:

- *primary/instance@REALM*

* /instance* 부분은 0번 이상 발생할 수 있습니다. **인증이 성공하려면 요청자의 정규 주체 이름의 *primary* 부분이 kerberized 사용자 이름과 일치해야 합니다.**

### `users.xml`에서 Kerberos 활성화 {#enabling-kerberos-in-users-xml}

사용자에 대한 Kerberos 인증을 활성화하려면 사용자 정의에서 `password` 또는 유사한 섹션 대신 `kerberos` 섹션을 지정합니다.

매개변수:

- `realm` - 인증을 제한하는 데 사용될 영역으로, 이 영역의 주체와 요청자의 영역이 일치하는 요청만을 포함합니다.
  - 이 매개변수는 선택 사항이며 생략할 경우 영역에 대한 추가 필터링은 적용되지 않습니다.

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
Kerberos 인증은 다른 인증 메커니즘과 함께 사용할 수 없습니다. `kerberos`와 함께 `password`와 같은 다른 섹션이 존재할 경우 ClickHouse는 종료됩니다.
:::

:::info Reminder
현재 `my_user` 사용자가 `kerberos`를 사용하는 경우, 이전에 설명한 대로 메인 `config.xml` 파일에서 Kerberos를 활성화해야 합니다.
:::

### SQL을 사용한 Kerberos 활성화 {#enabling-kerberos-using-sql}

[SQL 기반 접근 제어 및 계정 관리](/operations/access-rights#access-control-usage)가 ClickHouse에서 활성화되면, Kerberos로 식별된 사용자도 SQL 문을 사용하여 생성할 수 있습니다.

```sql
CREATE USER my_user IDENTIFIED WITH kerberos REALM 'EXAMPLE.COM'
```

...또는 영역에 의한 필터링 없이:

```sql
CREATE USER my_user IDENTIFIED WITH kerberos
```
