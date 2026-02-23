import Image from "@theme/IdealImage";
import dev_error from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/dev-verification-error.png";
import privacy_default from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-default-view.png";
import privacy_allow from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-screen-allow-anyway.png";

# Homebrew를 사용하여 ClickHouse 설치 \{#install-clickhouse-using-homebrew\}

:::warning
Homebrew Formulae를 사용하는 설치 방식은 더 이상 권장되지 않으며 2026-09-01에 비활성화될 예정입니다.
대신 모든 플랫폼에서 동작하는 [빠른 설치](/install/quick-install-curl) 방법을 사용할 것을 권장합니다.
:::

<VerticalStepper>

## 커뮤니티 Homebrew formula를 사용하여 설치 \{#install-using-community-homebrew-formula\}

macOS에서 [Homebrew](https://brew.sh/)를 사용하여 ClickHouse를 설치하려면
ClickHouse 커뮤니티 [homebrew formula](https://formulae.brew.sh/cask/clickhouse)를 사용할 수 있습니다.

```bash
brew install --cask clickhouse
```

## macOS에서 개발자 검증 오류 해결 \{#fix-developer-verification-error-macos\}

`brew`를 사용하여 ClickHouse를 설치한 경우 macOS에서 오류가 발생할 수 있습니다.
기본적으로 macOS는 검증할 수 없는 개발자가 만든 애플리케이션이나 도구는 실행하지 않습니다.

`clickhouse` 명령을 실행하려고 하면 다음과 같은 오류가 표시될 수 있습니다:

<Image img={dev_error} size="sm" alt="macOS 개발자 검증 오류 대화 상자" border />

이 검증 오류를 해결하려면, System Settings 창에서 적절한 설정을 찾거나, 터미널을 사용하거나, ClickHouse를 다시 설치하여 macOS의 격리(quarantine) 영역에서 앱을 제거해야 합니다.

### 시스템 설정을 사용하는 방법 \{#system-settings-process\}

`clickhouse` 실행 파일을 격리 영역에서 제거하는 가장 쉬운 방법은 다음과 같습니다:

1. **System Settings**를 엽니다.
1. **Privacy & Security**로 이동합니다:

    <Image img={privacy_default} size="md" alt="macOS Privacy & Security 기본 보기 설정" border />

1. 창의 맨 아래로 스크롤하여 「"clickhouse-macos-aarch64" was blocked from use because it isn't from an identified developer」라는 메시지를 찾습니다.
1. **Allow Anyway**를 클릭합니다.

    <Image img={privacy_allow} size="md" alt="macOS Privacy & Security 설정에서 Allow Anyway 버튼을 표시하는 화면" border />

1. macOS 사용자 암호를 입력합니다.

이제 터미널에서 `clickhouse` 명령을 실행할 수 있습니다.

### 터미널을 사용하는 방법 \{#terminal-process\}

때때로 `Allow Anyway` 버튼을 눌러도 이 문제가 해결되지 않는 경우가 있으며, 이때는 명령줄을 사용하여 같은 처리를 수행할 수 있습니다.
또는 단순히 명령줄 사용을 선호할 수도 있습니다.

먼저 Homebrew가 `clickhouse` 실행 파일을 어디에 설치했는지 확인합니다:

```shell
which clickhouse
```

출력 예시는 다음과 같습니다:

```shell
/opt/homebrew/bin/clickhouse
```

이전 명령에서 얻은 경로를 사용하여 `xattr -d com.apple.quarantine`을 실행해 `clickhouse`를 격리 영역에서 제거합니다:

```shell
xattr -d com.apple.quarantine /opt/homebrew/bin/clickhouse
```

이제 `clickhouse` 실행 파일을 실행할 수 있습니다:

```shell
clickhouse
```

출력 예시는 다음과 같습니다:

```bash
Use one of the following commands:
clickhouse local [args]
clickhouse client [args]
clickhouse benchmark [args]
```

## ClickHouse를 재설치하여 문제 해결 \{#fix-issue\}

Brew에는 처음부터 설치된 바이너리가 격리 영역에 들어가지 않도록 하는 명령줄 옵션이 있습니다.

먼저 ClickHouse를 제거합니다:

```shell
brew uninstall clickhouse
```

이제 `--no-quarantine` 옵션을 사용하여 ClickHouse를 다시 설치합니다:

```shell
brew install --no-quarantine clickhouse
```
</VerticalStepper>