---
description: '같은 이름 아래에 그룹화된 설정 모음입니다.'
sidebar_label: '설정 프로필'
sidebar_position: 61
slug: /operations/settings/settings-profiles
title: '설정 프로필'
doc_type: 'reference'
---

# 설정 프로필 \{#settings-profiles\}

설정 프로필은 동일한 이름 아래에 묶인 설정들의 모음입니다.

:::note
ClickHouse는 설정 프로필을 관리하기 위한 [SQL 기반 워크플로](/operations/access-rights#access-control-usage)도 지원합니다. 이 방식을 사용할 것을 권장합니다.
:::

프로필 이름은 임의로 지정할 수 있습니다. 서로 다른 사용자에게 동일한 프로필을 지정할 수 있습니다. 설정 프로필에서 가장 중요한 설정은 `readonly=1`이며, 읽기 전용 액세스를 보장합니다.

설정 프로필은 서로 상속될 수 있습니다. 상속을 사용하려면, 프로필에 나열된 다른 설정들보다 앞에 하나 이상의 `profile` 설정을 지정하면 됩니다. 동일한 설정이 서로 다른 프로필에서 정의된 경우, 가장 나중에 정의된 설정이 사용됩니다.

프로필에 있는 모든 설정을 적용하려면 `profile` 설정을 지정합니다.

예:

`web` 프로필을 설정하십시오.

```sql
SET profile = 'web'
```

Settings 프로필은 사용자 설정 파일에 선언됩니다. 일반적으로 `users.xml` 파일입니다.

예:

```xml
<!-- Settings profiles -->
<profiles>
    <!-- Default settings -->
    <default>
        <!-- The maximum number of threads when running a single query. -->
        <max_threads>8</max_threads>
    </default>

    <!-- Background operations settings -->
    <background>
        <!-- Re-defining maximum number of threads for background operations -->
        <max_threads>12</max_threads>
    </background>

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

이 예시에서는 `default`와 `web` 두 개의 프로필을 지정합니다.

`default` 프로필은 특수한 목적을 가진 프로필입니다. 항상 존재해야 하며 서버를 시작할 때 적용됩니다. 즉, `default` 프로필에는 기본 설정이 포함됩니다. 기본 프로필의 이름은 `default_profile` 서버 설정을 통해 변경할 수 있습니다.

`background` 프로필도 특수한 목적을 가진 프로필로, 백그라운드 작업에 대한 설정을 재정의하기 위해 존재할 수 있습니다. 이 파라미터는 선택 사항이며, 이름은 `background_profile` 서버 설정을 통해 변경할 수 있습니다.

`web` 프로필은 일반 프로필이며, `SET` 쿼리를 사용하거나 HTTP 요청의 URL 파라미터를 사용하여 설정할 수 있습니다.
