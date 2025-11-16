---
'description': '설정에 대한 제약 조건은 `user.xml` 구성 파일의 `profiles` 섹션에 정의될 수 있으며 사용자가 `SET`
  쿼리로 일부 설정을 변경하는 것을 금지합니다.'
'sidebar_label': '설정에 대한 제약 조건'
'sidebar_position': 62
'slug': '/operations/settings/constraints-on-settings'
'title': '설정에 대한 제약 조건'
'doc_type': 'reference'
---


# 설정에 대한 제약

## 개요 {#overview}

ClickHouse에서 "설정에 대한 제약"은 설정에 할당할 수 있는 제한 사항과 규칙을 의미합니다. 이러한 제약은 데이터베이스의 안정성, 보안 및 예측 가능한 동작을 유지하는 데 적용할 수 있습니다.

## 제약 정의하기 {#defining-constraints}

설정에 대한 제약은 `user.xml` 구성 파일의 `profiles` 섹션에서 정의할 수 있습니다. 이러한 제약은 사용자가 [`SET`](/sql-reference/statements/set) 문을 사용하여 일부 설정을 변경하는 것을 금지합니다.

제약은 다음과 같이 정의됩니다:

```xml
<profiles>
  <user_name>
    <constraints>
      <setting_name_1>
        <min>lower_boundary</min>
      </setting_name_1>
      <setting_name_2>
        <max>upper_boundary</max>
      </setting_name_2>
      <setting_name_3>
        <min>lower_boundary</min>
        <max>upper_boundary</max>
      </setting_name_3>
      <setting_name_4>
        <readonly/>
      </setting_name_4>
      <setting_name_5>
        <min>lower_boundary</min>
        <max>upper_boundary</max>
        <changeable_in_readonly/>
      </setting_name_5>
      <setting_name_6>
        <min>lower_boundary</min>
        <max>upper_boundary</max>
        <disallowed>value1</disallowed>
        <disallowed>value2</disallowed>
        <disallowed>value3</disallowed>
        <changeable_in_readonly/>
      </setting_name_6>
    </constraints>
  </user_name>
</profiles>
```

사용자가 제약을 위반하려고 하면 예외가 발생하고 설정은 변경되지 않습니다.

## 제약의 유형 {#types-of-constraints}

ClickHouse에서 지원하는 몇 가지 유형의 제약이 있습니다:
- `min`
- `max`
- `disallowed`
- `readonly` (별칭 `const`)
- `changeable_in_readonly`

`min` 및 `max` 제약은 숫자 설정의 상한 및 하한을 지정하며 서로 결합하여 사용할 수 있습니다.

`disallowed` 제약은 특정 설정에 대해 허용되지 않아야 하는 특정 값들을 지정하는 데 사용할 수 있습니다.

`readonly` 또는 `const` 제약은 사용자가 해당 설정을 전혀 변경할 수 없음을 지정합니다.

`changeable_in_readonly` 제약 유형은 사용자가 `readonly` 설정이 `1`로 설정되었더라도 `min`/`max` 범위 내에서 설정을 변경할 수 있도록 허용합니다. 그렇지 않으면 `readonly=1` 모드에서는 설정 변경이 허용되지 않습니다.

:::note
`changeable_in_readonly`는 `settings_constraints_replace_previous`가 활성화된 경우에만 지원됩니다:

```xml
<access_control_improvements>
  <settings_constraints_replace_previous>true</settings_constraints_replace_previous>
</access_control_improvements>
```
:::

## 여러 제약 프로필 {#multiple-constraint-profiles}

사용자에게 활성화된 프로필이 여러 개인 경우, 제약이 병합됩니다. 병합 과정은 `settings_constraints_replace_previous`에 따라 다릅니다:
- **true** (권장): 동일한 설정에 대한 제약은 병합 중에 대체되어 마지막 제약이 사용되고 이전의 모든 제약은 무시됩니다. 새 제약에서 설정되지 않은 필드도 포함됩니다.
- **false** (기본값): 동일한 설정에 대한 제약은 이전 프로필에서 가져온 모든 설정되지 않은 제약과 새로운 프로필의 값을 통해 대체된 설정된 제약 방식으로 병합됩니다.

## 읽기 전용 모드 {#read-only}

읽기 전용 모드는 `readonly` 설정에 의해 활성화되며, 이는 `readonly` 제약 유형과 혼동해서는 안 됩니다:
- `readonly=0`: 읽기 전용 제한 없음.
- `readonly=1`: 읽기 쿼리만 허용되며 `changeable_in_readonly`가 설정되지 않는 한 설정을 변경할 수 없습니다.
- `readonly=2`: 읽기 쿼리만 허용되지만 `readonly` 설정 자체를 제외한 설정을 변경할 수 있습니다.

### 예제 {#example-read-only}

`users.xml`에 다음 줄이 포함되어 있다고 가정합니다:

```xml
<profiles>
  <default>
    <max_memory_usage>10000000000</max_memory_usage>
    <force_index_by_date>0</force_index_by_date>
    ...
    <constraints>
      <max_memory_usage>
        <min>5000000000</min>
        <max>20000000000</max>
      </max_memory_usage>
      <force_index_by_date>
        <readonly/>
      </force_index_by_date>
    </constraints>
  </default>
</profiles>
```

다음 쿼리는 모두 예외를 발생시킵니다:

```sql
SET max_memory_usage=20000000001;
SET max_memory_usage=4999999999;
SET force_index_by_date=1;
```

```text
Code: 452, e.displayText() = DB::Exception: Setting max_memory_usage should not be greater than 20000000000.
Code: 452, e.displayText() = DB::Exception: Setting max_memory_usage should not be less than 5000000000.
Code: 452, e.displayText() = DB::Exception: Setting force_index_by_date should not be changed.
```

:::note
`default` 프로필은 고유하게 처리됩니다: `default` 프로필에 대해 정의된 모든 제약은 기본 제약이 되어 사용자를 제약하며, 사용자를 위해 명시적으로 재정의될 때까지 적용됩니다.
:::

## MergeTree 설정에 대한 제약 {#constraints-on-merge-tree-settings}

[merge tree settings](merge-tree-settings.md)에 대한 제약을 설정할 수 있습니다. 이러한 제약은 MergeTree 엔진을 가진 테이블이 생성되거나 저장소 설정이 변경될 때 적용됩니다.

Merge tree 설정의 이름은 `<constraints>` 섹션에서 참조할 때 `merge_tree_` 접두사가 추가되어야 합니다.

### 예제 {#example-mergetree}

명시적으로 지정된 `storage_policy`로 새로운 테이블 생성을 금지할 수 있습니다.

```xml
<profiles>
  <default>
    <constraints>
      <merge_tree_storage_policy>
        <const/>
      </merge_tree_storage_policy>
    </constraints>
  </default>
</profiles>
```
