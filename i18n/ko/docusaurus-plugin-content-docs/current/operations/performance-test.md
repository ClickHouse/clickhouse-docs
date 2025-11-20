---
'description': 'ClickHouse를 사용한 하드웨어 성능 테스트 및 벤치마크 가이드'
'sidebar_label': '하드웨어 테스트'
'sidebar_position': 54
'slug': '/operations/performance-test'
'title': 'ClickHouse로 하드웨어 테스트하는 방법'
'doc_type': 'guide'
---

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

어떠한 서버에서도 ClickHouse 패키지를 설치하지 않고 기본 ClickHouse 성능 테스트를 실행할 수 있습니다.

## 자동 실행 {#automated-run}

단일 스크립트를 사용하여 벤치마크를 실행할 수 있습니다.

1. 스크립트를 다운로드합니다.
```bash
wget https://raw.githubusercontent.com/ClickHouse/ClickBench/main/hardware/hardware.sh
```

2. 스크립트를 실행합니다.
```bash
chmod a+x ./hardware.sh
./hardware.sh
```

3. 출력을 복사하여 feedback@clickhouse.com으로 보냅니다.

모든 결과는 여기에 게시됩니다: https://clickhouse.com/benchmark/hardware/
