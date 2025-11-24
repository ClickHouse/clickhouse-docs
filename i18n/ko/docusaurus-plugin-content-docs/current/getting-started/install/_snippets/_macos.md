import Image from "@theme/IdealImage";
import dev_error from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/dev-verification-error.png";
import privacy_default from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-default-view.png";
import privacy_allow from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-screen-allow-anyway.png";


# ClickHouse 설치하기 (Homebrew 사용)

<VerticalStepper>

## 커뮤니티 Homebrew 포뮬러를 사용하여 설치하기 {#install-using-community-homebrew-formula}

[Homebrew](https://brew.sh/)를 사용하여 macOS에 ClickHouse를 설치하려면 ClickHouse 커뮤니티 [homebrew 포뮬러](https://formulae.brew.sh/cask/clickhouse)를 사용할 수 있습니다.

```bash
brew install --cask clickhouse
```

## macOS에서 개발자 인증 오류 수정 {#fix-developer-verification-error-macos}

`brew`를 사용하여 ClickHouse를 설치하면 MacOS에서 오류가 발생할 수 있습니다. 기본적으로 MacOS는 인증되지 않은 개발자가 만든 애플리케이션이나 도구를 실행하지 않습니다.

`clickhouse` 명령을 실행하려고 할 때 다음과 같은 오류가 발생할 수 있습니다:

<Image img={dev_error} size="sm" alt="MacOS 개발자 인증 오류 다이얼로그" border />

이 인증 오류를 우회하려면 MacOS의 격리된 무에서 앱을 제거해야 합니다. 이를 위해 시스템 설정 창에서 적절한 설정을 찾거나, 터미널을 사용하거나, ClickHouse를 다시 설치할 수 있습니다.

### 시스템 설정 프로세스 {#system-settings-process}

`clickhouse` 실행 파일을 격리된 무에서 제거하는 가장 쉬운 방법은 다음과 같습니다:

1. **시스템 설정**을 엽니다.
1. **개인정보 보호 및 보안**으로 이동합니다:

    <Image img={privacy_default} size="md" alt="MacOS 개인정보 보호 및 보안 설정 기본 보기" border />

1. 창의 맨 아래로 스크롤하여 _"clickhouse-macos-aarch64"는 인증된 개발자가 아니므로 사용이 차단되었습니다._라는 메시지를 찾습니다.
1. **어쨌든 허용**을 클릭합니다.

    <Image img={privacy_allow} size="md" alt="MacOS 개인정보 보호 및 보안 설정의 어쨌든 허용 버튼 표시" border />

1. MacOS 사용자 비밀번호를 입력합니다.

이제 터미널에서 `clickhouse` 명령을 실행할 수 있습니다.

### 터미널 프로세스 {#terminal-process}

때때로 `어쨌든 허용` 버튼을 눌러도 문제가 해결되지 않을 수 있으며, 이 경우 명령줄을 사용하여도 이 과정을 수행할 수 있습니다. 또는 명령줄 사용을 선호할 수도 있습니다!

먼저 Homebrew가 `clickhouse` 실행 파일을 설치한 위치를 찾습니다:

```shell
which clickhouse
```

다음은 다음과 비슷한 출력이 됩니다:

```shell
/opt/homebrew/bin/clickhouse
```

`clickhouse`를 격리된 무에서 제거하려면 `xattr -d com.apple.quarantine`를 실행한 후 이전 명령에서 얻은 경로를 입력합니다:

```shell
xattr -d com.apple.quarantine /opt/homebrew/bin/clickhouse
```

이제 `clickhouse` 실행 파일을 실행할 수 있어야 합니다:

```shell
clickhouse
```

다음은 다음과 비슷한 출력이 됩니다:

```bash
Use one of the following commands:
clickhouse local [args]
clickhouse client [args]
clickhouse benchmark [args]
```

## ClickHouse를 재설치하여 문제 해결 {#fix-issue}

Brew에는 설치된 바이너리가 처음부터 격리되지 않도록 하는 명령줄 옵션이 있습니다.

먼저 ClickHouse를 제거합니다:

```shell
brew uninstall clickhouse
```

이제 `--no-quarantine`을 사용하여 ClickHouse를 다시 설치합니다:

```shell
brew install --no-quarantine clickhouse
```
</VerticalStepper>
