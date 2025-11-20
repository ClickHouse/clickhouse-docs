---
'description': '현재 사용자에 대한 세션 설정 정보를 포함하는 시스템 테이블.'
'keywords':
- 'system table'
- 'settings'
'slug': '/operations/system-tables/settings'
'title': 'system.settings'
'doc_type': 'reference'
---


# system.settings

현재 사용자의 세션 설정에 대한 정보를 포함합니다.

컬럼:

- `name` ([String](../../sql-reference/data-types/string.md)) — 설정 이름.
- `value` ([String](../../sql-reference/data-types/string.md)) — 설정 값.
- `changed` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 설정이 구성에서 명시적으로 정의되었는지 또는 명시적으로 변경되었는지를 나타냅니다.
- `description` ([String](../../sql-reference/data-types/string.md)) — 짧은 설정 설명.
- `min` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 설정의 최소 값, 설정이 [constraints](/operations/settings/constraints-on-settings)를 통해 설정된 경우. 설정에 최소 값이 없으면 [NULL](/operations/settings/formats#input_format_null_as_default)을 포함합니다.
- `max` ([Nullable](../../sql-reference/data-types/nullable.md)([String](../../sql-reference/data-types/string.md))) — 설정의 최대 값, 설정이 [constraints](/operations/settings/constraints-on-settings)를 통해 설정된 경우. 설정에 최대 값이 없으면 [NULL](/operations/settings/formats#input_format_null_as_default)을 포함합니다.
- `readonly` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 현재 사용자가 설정을 변경할 수 있는지 여부를 나타냅니다:
  - `0` — 현재 사용자가 설정을 변경할 수 있습니다.
  - `1` — 현재 사용자가 설정을 변경할 수 없습니다.
- `default` ([String](../../sql-reference/data-types/string.md)) — 설정의 기본값.
- `is_obsolete` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) - 설정이 더 이상 사용되지 않는지를 나타냅니다.
- `tier` ([Enum8](../../sql-reference/data-types/enum.md)) — 이 기능의 지원 수준. ClickHouse 기능은 개발의 현재 상태와 사용 시 기대되는 값을 기반으로 티어로 조직됩니다. 값:
  - `'Production'` — 기능이 안정적이며 안전하게 사용할 수 있고, 다른 **production** 기능과 상호 작용 시 문제가 없습니다.
  - `'Beta'` — 기능이 안정적이고 안전합니다. 다른 기능과 함께 사용할 때의 결과는 알 수 없으며 정확성이 보장되지 않습니다. 테스트 및 보고가 환영받습니다.
  - `'Experimental'` — 기능이 개발 중입니다. 오직 개발자와 ClickHouse 열성 팬을 위해 예정되었습니다. 기능은 작동할 수도 있고 작동하지 않을 수도 있으며 언제든지 제거될 수 있습니다.
  - `'Obsolete'` — 더 이상 지원되지 않습니다. 이미 제거되었거나 향후 릴리스에서 제거될 예정입니다.

**예시**

다음 예시는 이름에 `min_i`가 포함된 설정에 대한 정보를 얻는 방법을 보여줍니다.

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

Row 3:
──────
name:        min_insert_block_size_rows_for_materialized_views
value:       0
changed:     0
description: Sets the minimum number of rows in the block which can be inserted into a table by an `INSERT` query. Smaller-sized blocks are squashed into bigger ones. This setting is applied only for blocks inserted into [materialized view](../../sql-reference/statements/create/view.md). By adjusting this setting, you control blocks squashing while pushing to materialized view and avoid excessive memory usage.

Possible values:

- Any positive integer.
- 0 — Squashing disabled.

**See Also**

- [min_insert_block_size_rows](/operations/settings/settings#min_insert_block_size_rows)
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
default:     0
alias_for:   
is_obsolete: 0
tier:        Production

Row 4:
──────
name:        min_insert_block_size_bytes_for_materialized_views
value:       0
changed:     0
description: Sets the minimum number of bytes in the block which can be inserted into a table by an `INSERT` query. Smaller-sized blocks are squashed into bigger ones. This setting is applied only for blocks inserted into [materialized view](../../sql-reference/statements/create/view.md). By adjusting this setting, you control blocks squashing while pushing to materialized view and avoid excessive memory usage.

Possible values:

- Any positive integer.
- 0 — Squashing disabled.

**See also**

- [min_insert_block_size_bytes](/operations/settings/settings#min_insert_block_size_bytes)
min:         ᴺᵁᴸᴸ
max:         ᴺᵁᴸᴸ
readonly:    0
type:        UInt64
default:     0
alias_for:   
is_obsolete: 0
tier:        Production
```

`WHERE changed`를 사용하는 것은 유용할 수 있습니다. 예를 들어 확인하려는 경우:
- 구성 파일의 설정이 올바르게 로드되고 사용되고 있는지 여부.
- 현재 세션에서 변경된 설정.

<!-- -->

```sql
SELECT * FROM system.settings WHERE changed AND name='load_balancing'
```

**참조**

- [Settings](/operations/system-tables/overview#system-tables-introduction)
- [Permissions for Queries](/operations/settings/permissions-for-queries)
- [Constraints on Settings](../../operations/settings/constraints-on-settings.md)
- [SHOW SETTINGS](../../sql-reference/statements/show.md#show-settings) 문장
