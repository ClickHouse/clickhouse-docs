---
slug: /integrations/integration-development/documenting-your-integration
sidebar_label: '통합 문서 작성하기'
sidebar_position: 4
title: 'ClickHouse 통합 문서 작성하기'
description: '필수 섹션과 복사해 붙여 넣어 사용할 수 있는 템플릿을 포함해 clickhouse-docs에 통합 페이지를 기여하는 방법을 설명합니다.'
keywords: ['파트너', '통합', '문서 작성', '기여', '풀 리퀘스트', '통합 문서']
doc_type: 'guide'
---

# ClickHouse 통합 문서화 \{#documenting-your-clickhouse-integration\}

이 사이트의 통합 문서는 최종 사용자가 설정을 검토하고 문제를 해결할 수 있도록 한곳에서 관련 정보를 제공합니다. 이 페이지에서는 포함해야 할 내용, 파일을 두는 위치, Pull Request를 여는 방법을 설명합니다.

아직 확인하지 않았다면 [통합 빌드하기](/integrations/integration-development/building-integrations) 및 [통합 테스트하기](/integrations/integration-development/testing-your-integration)부터 시작하십시오.

## 문서 위치 \{#where-docs-live\}

* **리포지토리:** [`ClickHouse/clickhouse-docs`](https://github.com/ClickHouse/clickhouse-docs)
* **포맷:** Markdown, Docusaurus로 빌드
* **위치:** `/docs/integrations/<category>/<your-integration>/`, 여기서 `<category>`는 제품의 역할을 나타냅니다 (`data-visualization`, `data-ingestion`, `language-clients` 등)
* **프로세스:** `main` 대상으로 풀 리퀘스트를 생성하십시오. ClickHouse integrations 팀이 검토합니다. 첫 기여인 경우 PR에서 봇이 안내하면 Contributor License Agreement에 서명해야 합니다

이 리포지토리의 통합 페이지는 최종 사용자를 위한 기본 참고 자료입니다. 제품별 세부 사항은 통합 페이지에서 사이트의 보조 문서로 링크할 수 있습니다.

좋은 예시: [Tableau](/integrations/tableau) 및 [Metabase](/integrations/metabase).

## 카테고리 선택하기 \{#choosing-a-category\}

제품의 기능에 가장 잘 맞는 카테고리를 선택하세요. PR을 열기 전에 [Integrations](/integrations) 아래에 있는 기존 카테고리를 살펴보십시오. 확실하지 않다면 PR 설명에 제안하는 카테고리를 적어 두십시오. 그러면 Integrations 팀이 적절한 위치에 페이지를 배치할 수 있도록 도와드립니다.

## 필수 섹션 \{#required-sections\}

모든 통합 페이지는 가능하면 다음 순서로 아래 내용을 다루어야 합니다:

1. **목적.** 해당 통합이 어떤 문제를 해결하는지 두세 문장으로 설명합니다. 마케팅성 문구는 피하십시오. 독자는 대개 도입 범위를 검토하는 엔지니어입니다
2. **사전 요구 사항 및 지원 버전 매트릭스.** **ClickHouse Cloud와 자체 호스팅(오픈 소스)** 모두에 대해 필요한 설치 항목과 지원 버전을 설명합니다. 간단한 표를 사용하면 좋습니다
3. **설정 안내.** 정상적으로 동작하는 연결까지 단계별로 안내합니다. 차이가 있는 경우(호스트, 포트, TLS) **Cloud와 자체 호스팅을 나란히 비교해** 설명하십시오
4. **인증.** 지원하는 인증 방식이 무엇인지 설명합니다(TLS를 통한 사용자 이름과 비밀번호를 최소 기준으로 하고, 관련이 있다면 mTLS, SSL 클라이언트 인증서, IP 허용 목록 관련 참고 사항도 포함)
5. **엔드투엔드 예시.** 연결부터 의미 있는 결과까지 이어지는 현실적인 예시를 최소 하나 포함하십시오. 독자가 재현할 수 있도록 [ClickHouse example dataset](/getting-started/example-datasets)을 사용하십시오
6. **알려진 제한 사항 및 성능 특성.** 타입 시스템의 한계, 결과 집합 임계값, 처리량 관련 참고 사항, 지원되지 않는 기능을 설명합니다. 이 부분에서 솔직할수록 지원 부담을 줄일 수 있습니다
7. **문제 해결.** 일반적인 오류와 해결 방법을 설명합니다. 첫 버전에서는 자주 발생하는 사례 두세 가지면 충분합니다

## 스타일 참고 사항 \{#style-notes\}

* **Cloud와 자체 호스팅을 모두 표시하십시오.** Cloud는 일반적으로 포트 `8443`에서 HTTPS를, `9440`에서 네이티브 TCP를 사용합니다. 자체 호스팅의 기본 포트는 `8123` 및 `9000`입니다
* **굵은 문단 대신 Docusaurus admonitions** (`:::note`, `:::warning`, `:::tip`)**를 사용해 강조하십시오**
* **자세한 내용은 링크로 연결하십시오.** 데이터 타입, 포맷, JDBC, ClickPipes 및 유사한 주제는 다시 설명하지 말고 기존 문서에 링크하십시오
* **마케팅 내용은 포함하지 마십시오.** 이곳의 통합 페이지는 기술 참고 문서입니다. 홍보 콘텐츠는 자체 사이트에 두고, 필요하면 파트너 디렉터리에서 링크할 수 있습니다

## 복사해 붙여넣기용 틀 \{#copy-paste-skeleton\}

대괄호로 표시된 섹션을 채운 뒤 `/docs/integrations/<category>/<your-integration>/index.md`로 저장하고 PR을 생성하세요.

```markdown
# [Your product] and ClickHouse

[One to three sentences: what the integration does and why a
ClickHouse user would want it.]

## Prerequisites

- [Your product, version X.Y or later]
- ClickHouse Cloud, or self-hosted ClickHouse version [X.Y] or later
- [Anything else: driver, plugin, network access requirements]

### Version matrix

| [Your product] | ClickHouse Cloud | ClickHouse open source | Notes    |
| -------------- | ---------------- | ---------------------- | -------- |
| X.Y            | ✅               | ✅ 24.x+               | [if any] |

## Setup

### Connect to ClickHouse Cloud

1. In the ClickHouse Cloud console, select your service and click **Connect**.
2. Choose **HTTPS**. Copy the host, port (8443), username, and password.
3. In [your product], [steps to configure the connection].

### Connect to self-hosted ClickHouse

1. [How to point at a self-hosted instance — host, port 8123 or 9000, TLS notes.]
2. In [your product], [steps to configure the connection].

## Authentication

[List supported auth modes — username/password over TLS, mTLS, etc. — and how
to configure each.]

## Example: querying the [dataset] dataset

[Walkthrough using one of the ClickHouse example datasets, end-to-end.]

## Known limits

- [Types not yet supported, e.g., deeply nested JSON]
- [Result-set size thresholds or other performance notes]
- [Feature gaps]

## Troubleshooting

### [Common error message]

[Cause and resolution.]

### [Another common error]

[Cause and resolution.]
```

## 검토 \{#review\}

ClickHouse integrations 팀은 기술적 정확성, Cloud 및 자체 호스팅 지원 범위, 그리고 문서 스타일을 기준으로 PR을 검토합니다. 검토자의 승인을 받을 때까지 PR에서 필요한 수정을 반복하십시오. 이 승인이 머지 조건이 됩니다.