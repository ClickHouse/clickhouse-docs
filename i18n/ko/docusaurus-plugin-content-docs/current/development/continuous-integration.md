---
description: 'ClickHouse 지속적 통합 시스템 개요'
sidebar_label: '지속적 통합 (CI)'
sidebar_position: 55
slug: /development/continuous-integration
title: '지속적 통합 (CI)'
doc_type: 'reference'
---

# Continuous Integration (CI) \{#continuous-integration-ci\}

풀 리퀘스트를 제출하면 ClickHouse [continuous integration (CI) 시스템](tests.md#test-automation)이 코드에 대해 일련의 자동 검사를 실행합니다.
이는 저장소 메인테이너(ClickHouse 팀 구성원)가 코드를 검토하고 풀 리퀘스트에 `can be tested` 라벨을 추가한 이후에 수행됩니다.
검사 결과는 [GitHub checks 문서](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-status-checks)에 설명된 것처럼 GitHub 풀 리퀘스트 페이지에 표시됩니다.
검사가 실패하면 이를 수정해야 할 수도 있습니다.
이 페이지에서는 마주칠 수 있는 각종 검사와, 이를 수정하기 위해 취할 수 있는 조치에 대해 개괄적으로 설명합니다.

검사 실패가 변경 사항과 관련이 없어 보인다면, 일시적인 실패 또는 인프라 문제일 수 있습니다.
CI 검사를 다시 시작하려면 풀 리퀘스트에 빈 커밋을 푸시하십시오:

```shell
git reset
git commit --allow-empty
git push
```

확실하지 않은 점이 있다면 메인테이너에게 도움을 요청하십시오.


## master와 병합 \{#merge-with-master\}

PR이 `master`에 병합될 수 있는지 확인합니다.
병합할 수 없는 경우 `Cannot fetch mergecommit` 메시지와 함께 실패합니다.
이 검사를 통과하려면 [GitHub 문서](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-on-github)에 설명된 대로 충돌을 해결하거나, git을 사용하여 `master` 브랜치를 pull request 브랜치에 병합합니다.

## Docs check \{#docs-check\}

ClickHouse 문서 웹사이트를 빌드하려고 시도합니다.
문서에서 일부 내용을 변경한 경우 이 검사가 실패할 수 있습니다.
가장 가능성 높은 원인은 문서의 교차 링크가 잘못되었기 때문입니다.
검사 보고서로 이동하여 `ERROR` 및 `WARNING` 메시지를 확인하십시오.

## 설명 확인 \{#description-check\}

Pull request의 설명이 템플릿 [PULL_REQUEST_TEMPLATE.md](https://github.com/ClickHouse/ClickHouse/blob/master/.github/PULL_REQUEST_TEMPLATE.md)을(를) 준수하는지 확인하십시오.
변경 사항에 대한 변경 로그(changelog) 범주(예: Bug Fix)를 지정하고, [CHANGELOG.md](../whats-new/changelog/index.md)에 들어갈 변경 내용에 대한 사용자용 설명 메시지를 작성해야 합니다.

## Docker 이미지 \{#docker-image\}

ClickHouse 서버와 Keeper Docker 이미지를 빌드하여 정상적으로 빌드되는지 확인합니다.

### 공식 Docker 라이브러리 테스트 \{#official-docker-library-tests\}

`clickhouse/clickhouse-server` Docker 이미지가 올바르게 동작하는지 확인하기 위해 [공식 Docker 라이브러리](https://github.com/docker-library/official-images/tree/master/test#alternate-config-files)의 테스트를 실행합니다.

새로운 테스트를 추가하려면 디렉터리 `ci/jobs/scripts/docker_server/tests/$test_name`를 생성하고, 해당 디렉터리 안에 `run.sh` 스크립트를 만듭니다.

테스트에 대한 추가 정보는 [CI jobs 스크립트 문서](https://github.com/ClickHouse/ClickHouse/tree/master/ci/jobs/scripts/docker_server)를 참조하십시오.

## 마커 체크 \{#marker-check\}

이 체크는 CI 시스템이 pull request 처리를 시작했음을 나타냅니다.
상태가 "pending"이면 아직 모든 체크가 시작되지 않았다는 뜻입니다.
모든 체크가 시작되면 상태가 "success"로 변경됩니다.

## 스타일 검사 \{#style-check\}

코드베이스에 대해 다양한 스타일 검사를 수행합니다.

Style Check 작업에서 수행되는 기본 검사 항목:

##### cpp \{#cpp\}

[`ci/jobs/scripts/check_style/check_cpp.sh`](https://github.com/ClickHouse/ClickHouse/blob/master/ci/jobs/scripts/check_style/check_cpp.sh) 스크립트를 사용하여(로컬에서도 실행 가능) 간단한 정규식 기반 코드 스타일 검사를 수행합니다.  
검사가 실패하면 [코드 스타일 가이드](style.md)에 따라 스타일 관련 문제를 수정하십시오.

##### codespell, aspell \{#codespell\}

문법 오류 및 오탈자를 검사합니다.

##### mypy \{#mypy\}

Python 코드에 대해 정적 타입 검사를 수행합니다.

### 스타일 검사 작업을 로컬에서 실행하기 \{#running-style-check-locally\}

전체 *Style Check* 작업을 다음 명령으로 Docker 컨테이너에서 로컬로 실행할 수 있습니다:

```sh
python -m ci.praktika run "Style check"
```

특정 검사를 실행하려면 (예: *cpp* 검사):

```sh
python -m ci.praktika run "Style check" --test cpp
```

다음 명령은 `clickhouse/style-test` Docker 이미지를 가져와 컨테이너화된 환경에서 작업을 실행합니다.
Python 3와 Docker 외에는 추가 종속성이 필요하지 않습니다.


## Fast test \{#fast-test\}

일반적으로 PR에 대해 가장 먼저 실행되는 검사입니다.
ClickHouse를 빌드하고 [stateless functional tests](tests.md#functional-tests)의 대부분을 실행하며, 일부는 건너뜁니다.
이 검사가 실패하면 문제가 해결될 때까지 이후 검사는 시작되지 않습니다.
어떤 테스트가 실패했는지 보고서를 확인한 후, [여기](/development/tests#running-a-test-locally)에 설명된 대로 로컬에서 해당 실패를 재현하십시오.

#### 로컬에서 빠른 테스트 실행하기: \{#running-fast-test-locally\}

```sh
python -m ci.praktika run "Fast test" [--test some_test_name]
```

이 명령어들은 `clickhouse/fast-test` Docker 이미지를 가져와 컨테이너 환경에서 작업을 실행합니다.
Python 3와 Docker만 있으면 되며, 그 외의 추가 종속성은 필요하지 않습니다.


## 빌드 확인 \{#build-check\}

다음 단계에서 사용할 수 있도록 여러 구성으로 ClickHouse를 빌드합니다.

### 로컬에서 빌드 실행하기 \{#running-builds-locally\}

CI와 유사한 환경에서 다음을 사용해 로컬 빌드를 실행할 수 있습니다.

```bash
python -m ci.praktika run "<BUILD_JOB_NAME>"
```

Python 3와 Docker 외에는 다른 종속성이 필요하지 않습니다.


#### 사용 가능한 빌드 잡 \{#available-build-jobs\}

빌드 잡 이름은 CI Report에 표시되는 것과 정확히 동일합니다:

**AMD64 빌드:**

- `Build (amd_debug)` - 심볼이 포함된 디버그 빌드
- `Build (amd_release)` - 최적화된 릴리스 빌드
- `Build (amd_asan)` - Address Sanitizer 빌드
- `Build (amd_tsan)` - Thread Sanitizer 빌드
- `Build (amd_msan)` - Memory Sanitizer 빌드
- `Build (amd_ubsan)` - Undefined Behavior Sanitizer 빌드
- `Build (amd_binary)` - Thin LTO 없이 빠르게 수행되는 릴리스 빌드 
- `Build (amd_compat)` - 구형 시스템용 호환성 빌드
- `Build (amd_musl)` - musl libc를 사용하는 빌드
- `Build (amd_darwin)` - macOS 빌드
- `Build (amd_freebsd)` - FreeBSD 빌드

**ARM64 빌드:**

- `Build (arm_release)` - ARM64 최적화 릴리스 빌드
- `Build (arm_asan)` - ARM64 Address Sanitizer 빌드
- `Build (arm_coverage)` - 커버리지 계측이 포함된 ARM64 빌드
- `Build (arm_binary)` - Thin LTO 없이 빠르게 수행되는 ARM64 릴리스 빌드
- `Build (arm_darwin)` - macOS ARM64 빌드
- `Build (arm_v80compat)` - ARMv8.0 호환성 빌드

**기타 아키텍처:**

- `Build (ppc64le)` - PowerPC 64비트 Little Endian
- `Build (riscv64)` - RISC-V 64비트
- `Build (s390x)` - IBM System/390 64비트
- `Build (loongarch64)` - LoongArch 64비트

잡이 성공적으로 완료되면 빌드 결과는 `<repo_root>/ci/tmp/build` 디렉터리에서 확인할 수 있습니다.

**참고:** 교차 컴파일을 사용하는 "기타 아키텍처" 범주에 속하지 않는 빌드를 수행할 때에는, `BUILD_JOB_NAME`에서 요청한 대로 빌드를 생성하려면 로컬 머신의 아키텍처가 빌드 타입과 일치해야 합니다.

#### 예제 \{#example-run-local\}

로컬 디버그 빌드를 실행하려면:

```bash
python -m ci.praktika run "Build (amd_debug)"
```

위의 방식이 적용되지 않는 경우, 빌드 로그에 표시된 CMake 옵션을 사용하고 [일반 빌드 절차](../development/build.md)를 따르십시오.


## stateless 기능 테스트 \{#functional-stateless-tests\}

여러 가지 구성(릴리스, 디버그, sanitizer 적용 등)으로 빌드된 ClickHouse 바이너리에 대해 [stateless 기능 테스트](tests.md#functional-tests)를 실행합니다.
어떤 테스트가 실패했는지 보고서를 확인한 다음, [여기](/development/tests#functional-tests)에 설명된 대로 로컬에서 실패를 재현합니다.
실패를 재현하려면 반드시 올바른 빌드 구성을 사용해야 합니다. 예를 들어 AddressSanitizer에서는 실패하지만 Debug 구성에서는 통과할 수 있습니다.
[CI build checks 페이지](/install/advanced)에서 바이너리를 다운로드하거나 로컬에서 직접 빌드합니다.

## 통합 테스트 \{#integration-tests\}

[통합 테스트](tests.md#integration-tests)를 수행합니다.

## 버그 수정 검증 체크 \{#bugfix-validate-check\}

새로운 테스트(기능 또는 통합 테스트)가 추가되었는지, 또는 master 브랜치에서 빌드한 바이너리로 실행할 때 실패하는 변경된 테스트가 있는지를 확인합니다.
이 체크는 pull request에 "pr-bugfix" 레이블이 지정되면 트리거됩니다.

## 스트레스 테스트 \{#stress-test\}

동시성 관련 오류를 탐지하기 위해 여러 클라이언트에서 상태를 저장하지 않는 기능 테스트를 동시에 실행합니다. 테스트가 실패한 경우:

* 다른 모든 테스트 실패를 먼저 수정합니다.
    * 리포트를 확인하여 서버 로그 위치를 파악하고, 오류 원인이 될 수 있는 내용을 확인합니다.

## 호환성 검사 \{#compatibility-check\}

`clickhouse` 바이너리가 구버전 libc를 사용하는 배포판에서 실행되는지 확인합니다.
검사가 실패하면 프로젝트 메인테이너에게 도움을 요청하십시오.

## AST 퍼저 \{#ast-fuzzer\}

프로그램 오류를 발견하기 위해 무작위로 생성된 쿼리를 실행합니다.
실패할 경우 메인테이너에게 도움을 요청하십시오.

## 성능 테스트 \{#performance-tests\}

쿼리 성능의 변화를 측정합니다.
이 검사는 실행에 약 6시간이 조금 안 걸리는, 가장 오래 걸리는 검사입니다.
성능 테스트 보고서에 대한 자세한 설명은 [여기](https://github.com/ClickHouse/ClickHouse/blob/master/tests/performance/scripts/README.md#how-to-read-the-report)를 참조하십시오.