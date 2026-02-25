---
description: '현재 사용자에 대한 세션 설정 정보를 포함하는 시스템 테이블입니다.'
keywords: ['system table', 'settings']
slug: /operations/system-tables/settings
title: 'system.settings'
doc_type: 'reference'
---

# system.settings \{#systemsettings\}

현재 사용자에 대한 세션 설정 정보를 포함합니다.

Columns:

* `name` ([String](../../sql-reference/data-types/string.md)) — 설정 이름.
* `value` ([String](../../sql-reference/data-types/string.md)) — 설정 값.
* `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 설정이 설정 파일에서 명시적으로 정의되었거나 명시적으로 변경되었는지 여부를 표시합니다.
* `description` ([String](../../sql-reference/data-types/string.md)) — 설정에 대한 짧은 설명.
* `min` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — [제약 조건](/operations/settings/constraints-on-settings)을 통해 최소값이 설정된 경우, 설정의 최소값입니다. 설정에 최소값이 없으면 [NULL](/operations/settings/formats#input_format_null_as_default)을 포함합니다.
* `max` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — [제약 조건](/operations/settings/constraints-on-settings)을 통해 최대값이 설정된 경우, 설정의 최대값입니다. 설정에 최대값이 없으면 [NULL](/operations/settings/formats#input_format_null_as_default)을 포함합니다.
* `disallowed_values` ([Array](/sql-reference/data-types/array)([String](../../sql-reference/data-types/string.md))) — 허용되지 않는 값 목록입니다.
* `readonly` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 현재 사용자가 설정을 변경할 수 있는지 여부를 표시합니다:
  * `0` — 현재 사용자가 설정을 변경할 수 있습니다.
  * `1` — 현재 사용자가 설정을 변경할 수 없습니다.
* `default` ([String](../../sql-reference/data-types/string.md)) — 설정의 기본값.
* `alias_for` ([String](../../sql-reference/data-types/string.md)) — 해당 설정이 다른 설정의 별칭인 경우, 원래 설정의 이름입니다.
* `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) - 설정이 사용 중단(obsolete)되었는지 여부를 표시합니다.
* `tier` ([Enum8](../../sql-reference/data-types/enum.md)) — 이 기능에 대한 지원 수준입니다. ClickHouse 기능은 개발의 현재 상태와 기능 사용 시 기대 수준에 따라 여러 티어(tier)로 구분됩니다. 값:
  * `'Production'` — 기능이 안정적이며 사용하기에 안전하고, 다른 **프로덕션** 기능과 상호 작용할 때 문제를 일으키지 않습니다.
  * `'Beta'` — 기능이 안정적이고 안전합니다. 다른 기능과 함께 사용할 때의 결과는 알려져 있지 않으며, 정확성이 보장되지 않습니다. 테스트 및 리포트를 환영합니다.
  * `'Experimental'` — 기능이 개발 중입니다. 개발자와 ClickHouse 애호가만을 위한 것입니다. 기능이 동작할 수도 있고 동작하지 않을 수도 있으며 언제든지 제거될 수 있습니다.
  * `'Obsolete'` — 더 이상 지원되지 않습니다. 이미 제거되었거나 향후 릴리스에서 제거될 예정입니다.

**예시**

다음 예시는 이름에 `min_i`가 포함된 설정에 대한 정보를 조회하는 방법을 보여줍니다.

```sql
SELECT *
FROM system.settings
WHERE name LIKE '%min_insert_block_size_%'
FORMAT Vertical
```

```text
Row 1:
──────
name:        min_insert_block_size_rows
value:       1048449
changed:     0
description: Sets the minimum number of rows in the block that can be inserted into a table by an `INSERT` query. Smaller-sized blocks are squashed into bigger ones.

Possible values:

- Positive integer.
- 0 — Squashing disabled.
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
default:     1048449
alias_for:   
is_obsolete: 0
tier:        Production

Row 2:
──────
name:        min_insert_block_size_bytes
value:       268402944
changed:     0
description: Sets the minimum number of bytes in the block which can be inserted into a table by an `INSERT` query. Smaller-sized blocks are squashed into bigger ones.

Possible values:

- Positive integer.
- 0 — Squashing disabled.
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
default:     268402944
alias_for:   
is_obsolete: 0
tier:        Production
```

Row 3:
──────
name:        min&#95;insert&#95;block&#95;size&#95;rows&#95;for&#95;materialized&#95;views
value:       0
changed:     0
description: `INSERT` 쿼리로 테이블에 삽입할 수 있는 블록의 최소 행 수를 설정합니다. 더 작은 블록은 더 큰 블록으로 병합됩니다. 이 설정은 [materialized view](../../sql-reference/statements/create/view.md)에 삽입되는 블록에만 적용됩니다. 이 설정을 조정하면 materialized view로 데이터를 푸시할 때 블록 병합 방식을 제어하여 과도한 메모리 사용을 방지할 수 있습니다.

Possible values:

* 임의의 양의 정수.
* 0 — 블록 병합 비활성화.

**See Also**

* [min&#95;insert&#95;block&#95;size&#95;rows](/operations/settings/settings#min_insert_block_size_rows)
  min:         ᴺᵁᴸᴸ
  max:         ᴺᵁᴸᴸ
  readonly:    0
  type:        UInt64
  default:     0
  alias&#95;for:
  is&#95;obsolete: 0
  tier:        Production

Row 4:
──────
name:        min&#95;insert&#95;block&#95;size&#95;bytes&#95;for&#95;materialized&#95;views
value:       0
changed:     0
description: `INSERT` 쿼리로 테이블에 삽입할 수 있는 블록의 최소 바이트 수를 설정합니다. 더 작은 블록은 더 큰 블록으로 병합됩니다. 이 설정은 [materialized view](../../sql-reference/statements/create/view.md)에 삽입되는 블록에만 적용됩니다. 이 설정을 조정하면 materialized view로 데이터를 푸시할 때 블록 병합 방식을 제어하여 과도한 메모리 사용을 방지할 수 있습니다.

Possible values:

* 임의의 양의 정수.
* 0 — 블록 병합 비활성화.

**See also**

* [min&#95;insert&#95;block&#95;size&#95;bytes](/operations/settings/settings#min_insert_block_size_bytes)
  min:         ᴺᵁᴸᴸ
  max:         ᴺᵁᴸᴸ
  readonly:    0
  type:        UInt64
  default:     0
  alias&#95;for:
  is&#95;obsolete: 0
  tier:        Production

````

Using of `WHERE changed` can be useful, for example, when you want to check:

- Whether settings in configuration files are loaded correctly and are in use.
- Settings that changed in the current session.

<!-- -->

```sql
SELECT * FROM system.settings WHERE changed AND name='load_balancing'
````

**관련 항목**

* [Settings](/operations/system-tables/overview#system-tables-introduction)
* [쿼리 권한(Permissions for Queries)](/operations/settings/permissions-for-queries)
* [Settings 제약 조건(Constraints on Settings)](../../operations/settings/constraints-on-settings.md)
* [SHOW SETTINGS](../../sql-reference/statements/show.md#show-settings) SQL 문
