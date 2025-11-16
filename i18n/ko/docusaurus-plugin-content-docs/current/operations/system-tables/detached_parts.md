---
'description': '시스템 테이블은 MergeTree 테이블의 분리된 파트에 대한 정보를 포함하고 있습니다.'
'keywords':
- 'system table'
- 'detached_parts'
'slug': '/operations/system-tables/detached_parts'
'title': 'system.detached_parts'
'doc_type': 'reference'
---

Contains information about detached parts of [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) tables. The `reason` column specifies why the part was detached.

사용자에 의해 분리된 파트의 경우, 사유는 비어 있습니다. 이러한 파트는 [ALTER TABLE ATTACH PARTITION\|PART](/sql-reference/statements/alter/partition#attach-partitionpart) 명령으로 다시 연결할 수 있습니다.

다른 컬럼의 설명은 [system.parts](../../operations/system-tables/parts.md)를 참조하세요.

파트 이름이 유효하지 않은 경우, 일부 컬럼의 값은 `NULL`일 수 있습니다. 이러한 파트는 [ALTER TABLE DROP DETACHED PART](/sql-reference/statements/alter/partition#drop-detached-partitionpart) 명령으로 삭제할 수 있습니다.
