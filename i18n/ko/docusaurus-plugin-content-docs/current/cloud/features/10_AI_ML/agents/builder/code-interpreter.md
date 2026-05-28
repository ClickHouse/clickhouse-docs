---
sidebar_label: '코드 인터프리터'
sidebar_position: 2
slug: /cloud/features/ai-ml/agents/builder/code-interpreter
title: '코드 인터프리터'
description: 'ClickHouse Agents의 샌드박스 환경에서 코드 실행'
keywords: ['AI', 'ClickHouse Cloud', 'agents', '코드 인터프리터', '샌드박스', 'python']
doc_type: 'reference'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import runCode from '@site/static/images/cloud/agent-builder/run-code/run-code.png';

<BetaBadge />

코드 인터프리터를 사용하면 에이전트가 관리형 샌드박스에서 코드를 실행할 수 있습니다. 계산, 데이터 변환, 포맷 변환, 시각화, 그 밖에 자연어보다 코드로 수행하는 편이 더 적합한 작업에 사용하십시오.

## 코드 인터프리터 활성화하기 \{#enable-it\}

Agent Builder의 Capabilities 섹션에서 **Run Code**를 활성화한 다음 저장하십시오. 에이전트는 사용자 요청과 에이전트 지침에 따라 코드를 실행할 시점을 결정합니다.

<Image img={runCode} alt="Run Code 확인란이 활성화되어 있고 Upload to Code Environment 버튼이 있는 Capabilities 패널의 Run Code 섹션" size="sm" />

## 지원되는 언어 \{#supported-languages\}

샌드박스는 두 가지 범용 런타임과 몇 가지 셸 유틸리티를 제공하는 Unix 환경입니다:

* **Python 3** - 데이터 작업에 기본으로 사용됩니다.
* **Node.js (JavaScript)** - 에이전트가 작업에 JS를 선호하는 경우 사용됩니다.
* **Bash** 및 **sh** - 명령 연결과 빠른 I/O를 위한 셸 스크립팅입니다.
* **AWK** 및 **sed** - 줄 단위 텍스트 처리 도구입니다.
* **bc** - 임의 정밀도 수학 연산 도구입니다.

데이터 파싱, 변환 또는 계산이 필요한 작업에는 에이전트가 먼저 Python을 사용합니다.

:::tip
한 줄 명령으로 실질적인 이점이 있는 작업에만 셸 도구를 사용하십시오.
:::

## 파일 \{#files\}

사용자는 대화에 파일을 업로드할 수 있으며, 코드 인터프리터는 샌드박스 작업 디렉터리에서 해당 파일에 접근할 수 있습니다. 또한 코드는 출력 파일(CSV, 플롯, 아카이브)을 생성할 수 있으며, 이러한 파일은 대화에서 다운로드 가능한 첨부 파일로 표시됩니다.

## 샌드박스 격리 \{#sandbox-isolation\}

각 실행은 네트워크에 접근할 수 없고 영구 저장소도 없는 임시 샌드박스에서 실행됩니다. 세션은 상태를 공유하지 않습니다 — 한 실행에서 사용된 변수와 파일은 agent가 명시적으로 다시 로드하지 않는 한 다음 실행에 이어지지 않습니다.

플랜별 리소스 제한(메모리, 실행당 파일 수, 월별 요청 쿼터)이 적용됩니다. 오류와 stderr는 stdout과 함께 대화에 표시됩니다.

## 사용 시점 \{#when-to-use-it\}

답변에 언어 모델이 추론만으로는 안정적으로 처리할 수 없는 결정론적 계산이 필요한 경우 코드 인터프리터를 사용하십시오.
일반적인 사례는 다음과 같습니다.

* 사용자가 업로드한 CSV 또는 JSON 파일을 파싱하는 경우
* 요약 통계를 계산하거나 간단한 시뮬레이션을 실행하는 경우
* 포맷 간 변환을 수행하는 경우(Parquet, JSON, CSV)
* 쿼리 결과로부터 플롯을 생성하는 경우

:::tip
모델이 이미 문맥만으로 답변할 수 있는 작업에는 사용하지 마십시오.
코드 실행은 지연 시간을 늘리고 할당량을 소모합니다.
:::