---
description: 'FORMAT 절 문서'
sidebar_label: 'FORMAT'
slug: /sql-reference/statements/select/format
title: 'FORMAT 절'
doc_type: 'reference'
---

# FORMAT 절 \{#format-clause\}

ClickHouse는 쿼리 결과를 비롯한 여러 용도에 사용할 수 있는 다양한 [직렬화 포맷](../../../interfaces/formats.md)을 지원합니다. `SELECT` 출력에 사용할 포맷을 선택하는 방법은 여러 가지가 있으며, 그중 하나는 쿼리 끝에 `FORMAT format`을 지정하여 결과 데이터를 특정 포맷으로 받는 것입니다.

특정 포맷은 편의성, 다른 시스템과의 통합 또는 성능 향상을 위해 사용할 수 있습니다.

## 기본 포맷 \{#default-format\}

`FORMAT` 절을 생략하면 기본 포맷이 사용되며, 이는 설정과 ClickHouse 서버에 액세스하기 위해 사용하는 인터페이스에 따라 결정됩니다. [HTTP 인터페이스](/interfaces/http)와 배치 모드의 [command-line client](../../../interfaces/cli.md)에서는 기본 포맷이 `TabSeparated`입니다. 대화형 모드의 command-line client에서는 기본 포맷이 `PrettyCompact`입니다(사람이 읽기 쉬운 compact 테이블을 생성합니다).

## 구현 세부 사항 \{#implementation-details\}

명령줄 클라이언트를 사용할 때 데이터는 항상 내부 효율적인 형식(`Native`)으로 네트워크를 통해 전달됩니다. 클라이언트는 쿼리의 `FORMAT` 절을 독립적으로 해석해 데이터를 직접 포맷합니다(이로써 네트워크와 서버에 추가 부하를 주지 않습니다).