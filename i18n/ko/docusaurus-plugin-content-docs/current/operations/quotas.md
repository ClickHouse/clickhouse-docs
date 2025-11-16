---
'description': 'ClickHouse에서 리소스 사용 쿼터를 구성하고 관리하는 가이드'
'sidebar_label': '쿼터'
'sidebar_position': 51
'slug': '/operations/quotas'
'title': '쿼터'
'doc_type': 'guide'
---

:::note ClickHouse Cloud의 할당량
ClickHouse Cloud에서는 할당량이 지원되지만, [DDL 구문](/sql-reference/statements/create/quota)을 사용하여 생성해야 합니다. 아래에 문서화된 XML 구성 방법은 **지원되지 않습니다**.
:::

할당량은 일정 기간 동안 리소스 사용량을 제한하거나 리소스 사용을 추적할 수 있게 해줍니다. 할당량은 사용자 구성에서 설정되며, 일반적으로 'users.xml' 파일에 저장됩니다.

시스템은 단일 쿼리의 복잡성을 제한하는 기능도 갖추고 있습니다. [쿼리 복잡성에 대한 제한 사항](../operations/settings/query-complexity.md) 섹션을 참조하십시오.

쿼리 복잡성 제한에 비해 할당량은 다음과 같은 특징이 있습니다:

- 단일 쿼리를 제한하는 대신, 일정 기간 내에 실행할 수 있는 쿼리 세트에 제한을 둡니다.
- 분산 쿼리 처리를 위해 모든 원격 서버에서 소비된 리소스를 고려합니다.

할당량을 정의하는 'users.xml' 파일의 섹션을 살펴보겠습니다.

```xml
<!-- Quotas -->
<quotas>
    <!-- Quota name. -->
    <default>
        <!-- Restrictions for a time period. You can set many intervals with different restrictions. -->
        <interval>
            <!-- Length of the interval. -->
            <duration>3600</duration>

            <!-- Unlimited. Just collect data for the specified time interval. -->
            <queries>0</queries>
            <query_selects>0</query_selects>
            <query_inserts>0</query_inserts>
            <errors>0</errors>
            <result_rows>0</result_rows>
            <read_rows>0</read_rows>
            <execution_time>0</execution_time>
        </interval>
    </default>
```

기본적으로 할당량은 매시간 리소스 소비를 추적하며, 사용량을 제한하지 않습니다.
각 간격에 대해 계산된 리소스 소비는 각 요청 후 서버 로그에 출력됩니다.

```xml
<statbox>
    <!-- Restrictions for a time period. You can set many intervals with different restrictions. -->
    <interval>
        <!-- Length of the interval. -->
        <duration>3600</duration>

        <queries>1000</queries>
        <query_selects>100</query_selects>
        <query_inserts>100</query_inserts>
        <written_bytes>5000000</written_bytes>
        <errors>100</errors>
        <result_rows>1000000000</result_rows>
        <read_rows>100000000000</read_rows>
        <execution_time>900</execution_time>
        <failed_sequential_authentications>5</failed_sequential_authentications>
    </interval>

    <interval>
        <duration>86400</duration>

        <queries>10000</queries>
        <query_selects>10000</query_selects>
        <query_inserts>10000</query_inserts>
        <errors>1000</errors>
        <result_rows>5000000000</result_rows>
        <result_bytes>160000000000</result_bytes>
        <read_rows>500000000000</read_rows>
        <result_bytes>16000000000000</result_bytes>
        <execution_time>7200</execution_time>
    </interval>
</statbox>
```

'statbox' 할당량의 경우, 매시간 및 24시간마다 제한이 설정됩니다(86,400초). 시간 간격은 구현 정의 고정 시점부터 계산됩니다. 즉, 24시간 간격이 자정부터 시작할 필요는 없습니다.

간격이 끝나면 모든 수집된 값이 초기화됩니다. 다음 시간에 대해 할당량 계산이 다시 시작됩니다.

제한할 수 있는 양은 다음과 같습니다:

`queries` – 총 요청 수.

`query_selects` – 총 select 요청 수.

`query_inserts` – 총 insert 요청 수.

`errors` – 예외를 발생시킨 쿼리 수.

`result_rows` – 결과로 주어진 총 행 수.

`result_bytes` - 결과로 주어진 총 행 크기.

`read_rows` – 모든 원격 서버에서 쿼리를 실행하기 위해 테이블에서 읽은 원본 행의 총 수.

`read_bytes` - 모든 원격 서버에서 쿼리를 실행하기 위해 테이블에서 읽은 총 크기.

`written_bytes` - 쓰기 작업의 총 크기.

`execution_time` – 초 단위의 총 쿼리 실행 시간(월 시간).

`failed_sequential_authentications` - 총 연속 인증 오류 수.

하나의 시간 간격에서 제한을 초과하면, 어떤 제한이 초과되었는지, 어떤 간격인지, 새 간격이 언제 시작되는지(쿼리를 다시 보낼 수 있는 시점)와 관련된 메시지와 함께 예외가 발생합니다.

할당량은 "할당량 키" 기능을 사용하여 여러 키에 대한 리소스를 독립적으로 보고할 수 있습니다. 다음은 그 예입니다:

```xml
<!-- For the global reports designer. -->
<web_global>
    <!-- keyed – The quota_key "key" is passed in the query parameter,
            and the quota is tracked separately for each key value.
        For example, you can pass a username as the key,
            so the quota will be counted separately for each username.
        Using keys makes sense only if quota_key is transmitted by the program, not by a user.

        You can also write <keyed_by_ip />, so the IP address is used as the quota key.
        (But keep in mind that users can change the IPv6 address fairly easily.)
    -->
    <keyed />
```

할당량은 구성의 'users' 섹션에서 사용자에게 할당됩니다. "액세스 권한" 섹션을 참조하십시오.

분산 쿼리 처리를 위해 누적된 양은 요청 서버에 저장됩니다. 따라서 사용자가 다른 서버로 이동하면 해당 서버에서 할당량이 "다시 시작"됩니다.

서버가 재시작되면 할당량이 초기화됩니다.

## 관련 콘텐츠 {#related-content}

- 블로그: [ClickHouse를 사용한 단일 페이지 애플리케이션 구축](https://clickhouse.com/blog/building-single-page-applications-with-clickhouse-and-http)
