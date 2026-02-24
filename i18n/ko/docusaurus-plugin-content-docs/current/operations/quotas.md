---
description: 'ClickHouse에서 리소스 사용 쿼터를 설정하고 관리하는 방법 안내'
sidebar_label: 'Quotas'
sidebar_position: 51
slug: /operations/quotas
title: 'Quotas'
doc_type: 'guide'
---

:::note ClickHouse Cloud의 Quotas
Quotas는 ClickHouse Cloud에서 지원되지만, [DDL 구문](/sql-reference/statements/create/quota)을 사용하여 생성해야 합니다. 아래에 설명한 XML 구성 방식은 **지원되지 않습니다**.
:::

Quotas를 사용하면 일정 기간 동안 리소스 사용량을 제한하거나 리소스 사용량을 추적할 수 있습니다.
Quotas는 일반적으로 &#39;users.xml&#39;인 사용자 설정에서 구성합니다.

시스템에는 단일 쿼리의 복잡성을 제한하는 기능도 있습니다. [쿼리 복잡성에 대한 제한](../operations/settings/query-complexity.md) 섹션을 참고하십시오.

쿼리 복잡성 제한과 달리 Quotas는 다음과 같습니다.

* 단일 쿼리를 제한하는 대신, 일정 기간 동안 실행할 수 있는 쿼리 집합에 제한을 둡니다.
* 분산 쿼리 처리 시 모든 원격 서버에서 사용된 리소스를 합산합니다.

이제 Quotas를 정의하는 &#39;users.xml&#39; 파일의 섹션을 살펴보겠습니다.

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

기본적으로 QUOTA는 리소스 사용량을 제한하지 않고 매 시간마다 이를 추적합니다.
각 구간별로 계산된 리소스 사용량은 각 요청 이후 서버 로그에 기록됩니다.

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

&#39;statbox&#39; QUOTA의 경우, 제한은 매 1시간과 매 24시간(86,400초)에 대해 설정됩니다. 시간 간격은 구현에 따라 정의된 고정된 시점부터 계산됩니다. 즉, 24시간 간격이 자정부터 시작된다고 보장되지는 않습니다.

간격이 끝나면 수집된 값은 모두 초기화됩니다. 다음 1시간에 대해서는 QUOTA 계산이 다시 처음부터 시작됩니다.

제한을 설정할 수 있는 항목은 다음과 같습니다:

`queries` – 전체 요청 수.

`query_selects` – select 요청의 전체 개수.

`query_inserts` – insert 요청의 전체 개수.

`errors` – 예외를 발생시킨 쿼리 개수.

`result_rows` – 결과로 반환된 행의 전체 개수.

`result_bytes` - 결과로 반환된 행의 전체 크기.

`read_rows` – 모든 원격 서버에서 쿼리를 실행하기 위해 테이블에서 읽은 원본 행의 전체 개수.

`read_bytes` - 모든 원격 서버에서 쿼리를 실행하기 위해 테이블에서 읽은 데이터의 전체 크기.

`written_bytes` - 쓰기 작업의 전체 크기.

`execution_time` – 쿼리 실행 시간의 합계(초 단위, 경과 시간(wall time)).

`failed_sequential_authentications` - 연속된 인증 오류의 전체 개수.


하나 이상의 시간 구간에서 제한을 초과하면, 어떤 제한을 어떤 구간에서 초과했는지와 새 구간이 언제 시작되는지(언제 다시 쿼리를 전송할 수 있는지)를 설명하는 텍스트와 함께 예외가 발생합니다.

QUOTA는 &quot;quota key&quot; 기능을 사용하여 여러 키별 리소스 사용량을 서로 독립적으로 보고할 수 있습니다. 다음은 이에 대한 예시입니다:

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

쿼터는 config의 &#39;users&#39; 섹션에서 사용자에게 할당됩니다. 「Access rights」 섹션을 참고하십시오.

분산 쿼리 처리의 경우 누적된 값은 요청을 수신한 서버에 저장됩니다. 따라서 사용자가 다른 서버로 이동하면 해당 서버의 쿼터는 「처음부터 다시」 시작됩니다.

서버를 다시 시작하면 쿼터가 초기화됩니다.


## 관련 콘텐츠 \{#related-content\}

- 블로그: [ClickHouse로 싱글 페이지 애플리케이션 구축하기](https://clickhouse.com/blog/building-single-page-applications-with-clickhouse-and-http)
