---
'description': 'ClickHouse 지속적인 통합 시스템 개요'
'sidebar_label': '지속적인 통합 (CI)'
'sidebar_position': 55
'slug': '/development/continuous-integration'
'title': '지속적인 통합 (CI)'
'doc_type': 'reference'
---


# 지속적 통합 (CI)

풀 리퀘스트를 제출하면 ClickHouse [지속적 통합 (CI) 시스템](tests.md#test-automation)에 의해 코드에 대한 자동화된 검사가 실행됩니다. 이는 리포지토리 유지 관리자가 (ClickHouse 팀의 누군가) 당신의 코드를 검토하고 풀 리퀘스트에 `can be tested` 레이블을 추가한 후에 발생합니다. 검사의 결과는 [GitHub 검사 문서](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/about-status-checks)에서 설명된 대로 GitHub 풀 리퀘스트 페이지에 나열됩니다. 검사가 실패하면 이를 수정해야 할 수도 있습니다. 이 페이지는 마주칠 수 있는 검사에 대한 개요와 이를 수정할 수 있는 방법을 제공합니다.

검사 실패가 당신의 변경 사항과 관련이 없는 것처럼 보이면, 이는 일시적인 실패나 인프라 문제일 수 있습니다. CI 검사를 재시작하기 위해 풀 리퀘스트에 빈 커밋을 푸시하십시오:

```shell
git reset
git commit --allow-empty
git push
```

무엇을 해야 할지 확실하지 않으면, 유지 관리자에게 도움을 요청하세요.

## 마스터와의 병합 {#merge-with-master}

PR이 마스터에 병합될 수 있는지 확인합니다. 그렇지 않으면 `Cannot fetch mergecommit` 메시지와 함께 실패합니다. 이 검사를 수정하려면 [GitHub 문서](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-on-github)에 설명된 대로 충돌을 해결하거나 `master` 브랜치를 당신의 풀 리퀘스트 브랜치에 병합하십시오.

## 문서 검사 {#docs-check}

ClickHouse 문서 웹사이트를 빌드하려고 시도합니다. 문서에서 무언가를 변경했을 경우 실패할 수 있습니다. 가장 가능성이 높은 이유는 문서의 어떤 교차 링크가 잘못되었기 때문입니다. 검사 보고서로 가서 `ERROR` 및 `WARNING` 메시지를 찾으세요.

## 설명 검사 {#description-check}

풀 리퀘스트의 설명이 [PULL_REQUEST_TEMPLATE.md](https://github.com/ClickHouse/ClickHouse/blob/master/.github/PULL_REQUEST_TEMPLATE.md) 템플릿에 부합하는지 확인합니다. 변경 사항에 대한 변경 로그 카테고리를 지정해야 하며 (예: 버그 수정), [CHANGELOG.md](../whats-new/changelog/index.md)를 위해 변경 사항을 설명하는 사용자 가독성 메시지를 작성해야 합니다.

## Docker 이미지 {#docker-image}

ClickHouse 서버와 키퍼의 Docker 이미지를 빌드하여 올바르게 빌드되는지 확인합니다.

### 공식 도커 라이브러리 테스트 {#official-docker-library-tests}

`clickhouse/clickhouse-server` Docker 이미지가 올바르게 작동하는지 확인하기 위해 [공식 Docker 라이브러리](https://github.com/docker-library/official-images/tree/master/test#alternate-config-files)의 테스트를 실행합니다.

새로운 테스트를 추가하려면 `ci/jobs/scripts/docker_server/tests/$test_name` 디렉토리를 만들고 그곳에 `run.sh` 스크립트를 추가하세요.

테스트에 대한 추가 세부 정보는 [CI 작업 스크립트 문서](https://github.com/ClickHouse/ClickHouse/tree/master/ci/jobs/scripts/docker_server)에서 확인할 수 있습니다.

## 마커 검사 {#marker-check}

이 검사는 CI 시스템이 풀 리퀘스트를 처리하기 시작했음을 의미합니다. 'pending' 상태일 때는 모든 검사가 아직 시작되지 않았음을 의미합니다. 모든 검사가 시작된 후 상태는 'success'로 변경됩니다.

## 스타일 검사 {#style-check}

코드 베이스에 대해 다양한 스타일 검사를 수행합니다.

스타일 검사 작업의 기본 검사:

##### cpp {#cpp}
[`ci/jobs/scripts/check_style/check_cpp.sh`](https://github.com/ClickHouse/ClickHouse/blob/master/ci/jobs/scripts/check_style/check_cpp.sh) 스크립트를 사용하여 간단한 정규 표현식 기반 코드 스타일 검사를 수행합니다 (로컬에서 실행할 수도 있음).  
실패할 경우 [코드 스타일 가이드](style.md)에 따라 스타일 문제를 수정하십시오.

##### codespell, aspell {#codespell}
문법 오류 및 오타를 검사합니다.

##### mypy {#mypy}
Python 코드에 대한 정적 타입 검사를 수행합니다.

### 로컬에서 스타일 검사 작업 실행하기 {#running-style-check-locally}

전체 _스타일 검사_ 작업은 다음과 같이 Docker 컨테이너에서 로컬로 실행할 수 있습니다:

```sh
python -m ci.praktika run "Style check"
```

특정 검사를 실행하려면 (예: _cpp_ 검사):
```sh
python -m ci.praktika run "Style check" --test cpp
```

이 명령은 `clickhouse/style-test` Docker 이미지를 당기고 컨테이너화된 환경에서 작업을 실행합니다. Python 3과 Docker 외에 다른 종속성은 필요하지 않습니다.

## 빠른 테스트 {#fast-test}

정상적으로 이는 PR에 대해 실행되는 첫 번째 검사입니다. ClickHouse를 빌드하고 대부분의 [무상태 기능 테스트](tests.md#functional-tests)를 실행하며, 일부는 생략합니다. 실패할 경우 수정될 때까지 추가 검사가 시작되지 않습니다. 보고서를 확인하여 어떤 테스트가 실패하는지 확인한 후, [여기](#running-fast-test-locally)에 설명된 대로 로컬에서 실패를 재현하십시오.

#### 로컬에서 빠른 테스트 실행하기: {#running-fast-test-locally}

```sh
python -m ci.praktika run "Fast test" [--test some_test_name]
```

이 명령은 `clickhouse/fast-test` Docker 이미지를 당기고 컨테이너화된 환경에서 작업을 실행합니다. Python 3과 Docker 외에 다른 종속성은 필요하지 않습니다.

## 빌드 검사 {#build-check}

추후 단계에서 사용하기 위해 다양한 구성에서 ClickHouse를 빌드합니다.

### 로컬에서 빌드 실행 {#running-builds-locally}

CI와 유사한 환경에서 빌드를 다음과 같이 실행할 수 있습니다:

```bash
python -m ci.praktika run "<BUILD_JOB_NAME>"
```

Python 3과 Docker 외에 다른 종속성은 필요하지 않습니다.

#### 사용 가능한 빌드 작업 {#available-build-jobs}

빌드 작업 이름은 CI 보고서에 나타나는 것과 정확히 동일합니다:

**AMD64 빌드:**
- `Build (amd_debug)` - 심볼이 포함된 디버그 빌드
- `Build (amd_release)` - 최적화된 릴리스 빌드
- `Build (amd_asan)` - 주소 소독기 빌드
- `Build (amd_tsan)` - 스레드 소독기 빌드
- `Build (amd_msan)` - 메모리 소독기 빌드
- `Build (amd_ubsan)` - 정의되지 않은 동작 소독기 빌드
- `Build (amd_binary)` - 얇은 LTO 없이 빠른 릴리스 빌드
- `Build (amd_compat)` - 오래된 시스템을 위한 호환성 빌드
- `Build (amd_musl)` - musl libc로 빌드
- `Build (amd_darwin)` - macOS 빌드
- `Build (amd_freebsd)` - FreeBSD 빌드

**ARM64 빌드:**
- `Build (arm_release)` - ARM64 최적화된 릴리스 빌드
- `Build (arm_asan)` - ARM64 주소 소독기 빌드
- `Build (arm_coverage)` - 커버리지 계측이 포함된 ARM64 빌드
- `Build (arm_binary)` - ARM64 얇은 LTO 없이 빠른 릴리스 빌드
- `Build (arm_darwin)` - macOS ARM64 빌드
- `Build (arm_v80compat)` - ARMv8.0 호환성 빌드

**기타 아키텍처:**
- `Build (ppc64le)` - PowerPC 64비트 리틀엔디안
- `Build (riscv64)` - RISC-V 64비트
- `Build (s390x)` - IBM System/390 64비트
- `Build (loongarch64)` - LoongArch 64비트

작업이 성공하면 빌드 결과는 `<repo_root>/ci/tmp/build` 디렉토리에서 사용할 수 있습니다.

**참고:** "기타 아키텍처" 카테고리에 없는 빌드(크로스 컴파일을 사용하는 경우)의 경우, 로컬 머신 아키텍처는 `BUILD_JOB_NAME`에 의해 요청된 빌드를 생성하기 위해 빌드 유형과 일치해야 합니다.

#### 예시 {#example-run-local}

로컬 디버그 빌드를 실행하려면:

```bash
python -m ci.praktika run "Build (amd_debug)"
```

위의 접근 방식이 작동하지 않으면 빌드 로그에서 cmake 옵션을 사용하고 [일반 빌드 프로세스](../development/build.md)를 따르십시오.

## 무상태 기능 테스트 {#functional-stateless-tests}

다양한 구성으로 빌드된 ClickHouse 이진 파일에 대해 [무상태 기능 테스트](tests.md#functional-tests)를 실행합니다. 보고서를 확인하여 어떤 테스트가 실패하는지 확인한 후, [여기](#functional-stateless-tests)에 설명된 대로 로컬에서 실패를 재현하십시오. 주소 소독기에서 실패할 수 있으므로 올바른 빌드 구성을 사용해야 합니다. [CI 빌드 검사 페이지](/install/advanced)에서 이진파일을 다운로드하거나 로컬에서 빌드하십시오.

## 통합 테스트 {#integration-tests}

[통합 테스트](tests.md#integration-tests)를 실행합니다.

## 버그 수정 검증 체크 {#bugfix-validate-check}

새로운 테스트(기능 또는 통합)가 있거나 마스터 브랜치에서 빌드된 이진 파일에서 실패하는 변경된 테스트가 있는지 확인합니다. 이 검사는 풀 리퀘스트에 "pr-bugfix" 레이블이 있을 때 트리거됩니다.

## 스트레스 테스트 {#stress-test}

여러 클라이언트에서 동시에 무상태 기능 테스트를 실행하여 동시성과 관련된 오류를 감지합니다. 실패할 경우:

* 먼저 모든 다른 테스트 실패를 수정하십시오;
* 보고서를 확인하여 서버 로그를 찾아 가능한 오류 원인을 확인하십시오.

## 호환성 검증 {#compatibility-check}

`clickhouse` 이진 파일이 오래된 libc 버전이 있는 배포판에서 실행되는지 확인합니다. 실패할 경우 유지 관리자에게 도움을 요청하십시오.

## AST 퍼저 {#ast-fuzzer}

무작위로 생성된 쿼리를 실행하여 프로그램 오류를 잡아냅니다. 실패할 경우 유지 관리자에게 도움을 요청하십시오.

## 성능 테스트 {#performance-tests}

쿼리 성능의 변화를 측정합니다. 이는 실행하는 데 약 6시간이 걸리는 가장 긴 검사입니다. 성능 테스트 보고서는 [여기](https://github.com/ClickHouse/ClickHouse/tree/master/docker/test/performance-comparison#how-to-read-the-report)에서 자세히 설명되어 있습니다.
