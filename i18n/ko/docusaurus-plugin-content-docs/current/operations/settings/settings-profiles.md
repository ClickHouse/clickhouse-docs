---
'description': '동일한 이름으로 그룹화된 설정 모음.'
'sidebar_label': '설정 프로필'
'sidebar_position': 61
'slug': '/operations/settings/settings-profiles'
'title': '설정 프로필'
'doc_type': 'reference'
---


# 설정 프로파일

설정 프로파일은 동일한 이름으로 그룹화된 설정의 모음입니다.

:::note
ClickHouse는 설정 프로파일 관리를 위한 [SQL 기반 워크플로우](/operations/access-rights#access-control-usage)도 지원합니다. 이를 사용하는 것을 권장합니다.
:::

프로파일은 아무 이름이나 가질 수 있습니다. 동일한 프로파일을 서로 다른 사용자에게 지정할 수 있습니다. 설정 프로파일에 작성할 수 있는 가장 중요한 것은 `readonly=1`으로, 이는 읽기 전용 액세스를 보장합니다.

설정 프로파일은 서로 상속받을 수 있습니다. 상속을 사용하려면, 프로파일에 나열된 다른 설정 전에 하나 이상의 `profile` 설정을 지정하십시오. 서로 다른 프로파일에 동일한 설정이 정의된 경우, 가장 최근에 정의된 것이 사용됩니다.

프로파일의 모든 설정을 적용하려면 `profile` 설정을 설정하십시오.

예:

`web` 프로파일을 설치합니다.

```sql
SET profile = 'web'
```

설정 프로파일은 사용자 구성 파일에 선언됩니다. 일반적으로 `users.xml`입니다.

예:

```xml
<!-- Settings profiles -->
<profiles>
    <!-- Default settings -->
    <default>
        <!-- The maximum number of threads when running a single query. -->
        <max_threads>8</max_threads>
    </default>

    <!-- Settings for queries from the user interface -->
    <web>
        <max_rows_to_read>1000000000</max_rows_to_read>
        <max_bytes_to_read>100000000000</max_bytes_to_read>

        <max_rows_to_group_by>1000000</max_rows_to_group_by>
        <group_by_overflow_mode>any</group_by_overflow_mode>

        <max_rows_to_sort>1000000</max_rows_to_sort>
        <max_bytes_to_sort>1000000000</max_bytes_to_sort>

        <max_result_rows>100000</max_result_rows>
        <max_result_bytes>100000000</max_result_bytes>
        <result_overflow_mode>break</result_overflow_mode>

        <max_execution_time>600</max_execution_time>
        <min_execution_speed>1000000</min_execution_speed>
        <timeout_before_checking_execution_speed>15</timeout_before_checking_execution_speed>

        <max_columns_to_read>25</max_columns_to_read>
        <max_temporary_columns>100</max_temporary_columns>
        <max_temporary_non_const_columns>50</max_temporary_non_const_columns>

        <max_subquery_depth>2</max_subquery_depth>
        <max_pipeline_depth>25</max_pipeline_depth>
        <max_ast_depth>50</max_ast_depth>
        <max_ast_elements>100</max_ast_elements>

        <max_sessions_for_user>4</max_sessions_for_user>

        <readonly>1</readonly>
    </web>
</profiles>
```

예제에서는 두 개의 프로파일을 지정합니다: `default`와 `web`.

`default` 프로파일은 특별한 목적을 가지고 있습니다: 항상 존재해야 하며 서버 시작 시 적용됩니다. 즉, `default` 프로파일은 기본 설정을 포함합니다.

`web` 프로파일은 `SET` 쿼리나 HTTP 쿼리의 URL 매개변수를 사용하여 설정할 수 있는 일반 프로파일입니다.
