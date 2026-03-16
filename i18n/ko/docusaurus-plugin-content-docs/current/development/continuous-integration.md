---
description: 'ClickHouse 지속적 통합 시스템 개요'
sidebar_label: '지속적 통합 (CI)'
sidebar_position: 55
slug: /development/continuous-integration
title: '지속적 통합 (CI)'
doc_type: 'reference'
---

# 지속적 통합 (CI) \{#continuous-integration-ci\}

pull request를 제출하면 ClickHouse [지속적 통합 (CI) 시스템](tests.md#test-automation)이 코드에 대해 몇 가지 자동 검사를 실행합니다.
이 작업은 저장소 메인테이너(ClickHouse 팀 구성원)가 코드를 검토하고 pull request에 `can be tested` 레이블을 추가한 후에 이루어집니다.
검사 결과는 [GitHub checks 문서](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-status-checks)에 설명된 대로 GitHub pull request 페이지에 표시됩니다.
검사에 실패하면 이를 수정해야 할 수도 있습니다.
이 페이지에서는 마주칠 수 있는 검사와 이를 수정하기 위해 할 수 있는 일에 대한 개요를 제공합니다.

검사 실패가 변경 사항과 관련이 없어 보인다면, 일시적인 실패이거나 인프라 문제일 수 있습니다.
CI 검사를 다시 시작하려면 pull request에 빈 커밋을 푸시하세요:

```shell
git commit --allow-empty
git push
```

어떻게 해야 할지 잘 모르겠다면 메인테이너에게 도움을 요청하세요.

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


## Running stateless tests \{#running-stateless-tests\}

기본 설정으로 로컬에 설치된 ClickHouse는 특정 테스트 사례에서는 작동할 수 있지만, 모든 테스트 쿼리를 올바르게 실행할 수는 없습니다. CI에서는 각 작업이 특정 ClickHouse 구성(예: S3 스토리지, Parallel Replicas)을 설치하므로, 이를 수동으로 재현하는 것은 번거로울 수 있습니다. 이를 피하려면 CI와 동일한 오케스트레이션을 사용해 어떤 CI 작업이든 로컬에서 재현할 수 있습니다 — 수동 구성은 필요하지 않습니다.

#### 사전 준비 사항 \{#ci-prerequisites\}

* Python 3 (표준 라이브러리만)
* Docker

필요한 경우 Ubuntu에 Docker를 설치한 후 다시 로그인하십시오:

```sh
sudo apt-get update
sudo apt-get install docker.io
sudo usermod -aG docker "$USER"
sudo tee /etc/docker/daemon.json <<'EOF'
{
  "ipv6": true,
  "ip6tables": true
}
EOF
sudo systemctl restart docker
```


#### CI Job을 로컬에서 실행하기 \{#run-ci-job-locally\}

CI 리포트에서 아무 Job 이름이나 선택한 다음 로컬에서 실행하세요:

```bash
python -m ci.praktika run "<JOB_NAME>"
```

* 작업 이름은 CI 보고서에 표시된 그대로(공백과 쉼표가 포함될 수 있음) 반드시 정확히 따옴표로 감싸십시오. 예: `"Stateless tests (amd_debug, parallel)"`. 이렇게 하면 CI와 동일한 ClickHouse 구성이 설정되고 동일한 테스트가 실행됩니다.
* 작업 이름에 포함된 아키텍처와 빌드 유형(예: `amd_debug`)은 CI 전용 레이블입니다. 로컬에서 실행할 때는 영향을 주지 않습니다 — 제공한 바이너리와 현재 실행 중인 아키텍처가 그대로 사용됩니다. 작업 이름은 ClickHouse 구성과 테스트 세트만 결정합니다(`--test`로 재정의하지 않는 한).
* CI에서는 리소스를 더 효율적으로 활용하기 위해 기능 테스트를 여러 배치로 나눕니다. 예를 들어, `"Stateless tests (amd_debug, parallel)"`와 `"Stateless tests (amd_debug, sequential)"`를 함께 실행하면 전체 범위를 모두 포괄합니다. 병렬 실행이 가능한 테스트는 동시에 실행되고, 나머지는 순차적으로 실행됩니다. 이러한 분할은 가능한 곳에서 병렬성을 최대화하여 전체 CI 시간을 줄입니다. 로컬에서 전체 테스트 범위를 재현하려면 두 배치를 모두 실행하십시오.
* 또한 기본적인 ClickHouse 기능을 검증하기 위해 제한된 범위의 기능 테스트를 실행하는 `"Fast test"` CI 작업도 있습니다 — 이 작업은 모든 선택적 모듈이 포함되지 않은 빌드를 사용하며, 회귀를 가장 빠르게 포착할 수 있는 방법입니다. 로컬에서도 같은 방식으로 실행할 수 있습니다. ClickHouse 바이너리를 기본 검색 경로 중 하나(`./ci/tmp/clickhouse`, `./build/programs/clickhouse`, 또는 `./clickhouse`)에 배치하십시오. 그렇지 않으면 작업이 먼저 ClickHouse를 빌드하려고 시도합니다:
  ```bash
  python -m ci.praktika run "Fast test"
  ```


#### CI 작업 내에서 특정 테스트 실행 \{#run-specific-tests-within-ci-job\}

`--test`를 사용하면 작업에서 CI에 사용되는 것과 동일한 ClickHouse 설정을 준비하고, 선택한 테스트만 실행합니다.

```bash
python -m ci.praktika run "Stateless tests (amd_debug, parallel)" \
  --test 00001_select1
```

* 여러 테스트 이름을 지정할 수 있습니다:
  ```bash
  python -m ci.praktika run "Stateless tests (amd_debug, parallel)" \
    --test 00001_select1 00002_log_and_exception_messages_formatting
  ```
* 팁: 아무 ClickHouse 구성이나 사용해도 되고 특정 테스트만 실행하면 되는 경우, 전체 작업 이름 대신 별칭 `functional`을 사용하십시오:
  ```bash
  python -m ci.praktika run functional --test 00001_select1
  ```


#### 추가 사용자 지정 옵션 \{#additional-customization-options\}

* `--path PATH` — ClickHouse 바이너리에 대한 사용자 지정 경로입니다. 기본적으로 러너는 `./ci/tmp/clickhouse`, `./build/programs/clickhouse`, `./clickhouse` 순서로 검색합니다.
* `--count N` — 각 테스트를 N번 반복합니다.
* `--workers N` — 시스템 용량을 기준으로 자동 계산된 병렬 작업자 수를 재정의합니다.

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