---
description: 'MergeTree 테이블에서 분리(detach)된 파트에 대한 정보를 포함하는 시스템 테이블입니다.'
keywords: ['system table', 'detached_parts']
slug: /operations/system-tables/detached_parts
title: 'system.detached_parts'
doc_type: 'reference'
---

[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블에서 분리(detach)된 파트에 대한 정보를 포함합니다. `reason` 컬럼은 해당 파트가 분리된 이유를 나타냅니다.

사용자가 분리한 파트의 경우 `reason` 값은 비어 있습니다. 이러한 파트는 [ALTER TABLE ATTACH PARTITION\|PART](/sql-reference/statements/alter/partition#attach-partitionpart) 명령으로 다시 연결할 수 있습니다.

다른 컬럼에 대한 설명은 [system.parts](../../operations/system-tables/parts.md)를 참조하십시오.

파트 이름이 잘못된 경우 일부 컬럼의 값이 `NULL`일 수 있습니다. 이러한 파트는 [ALTER TABLE DROP DETACHED PART](/sql-reference/statements/alter/partition#drop-detached-partitionpart) 명령으로 삭제할 수 있습니다.