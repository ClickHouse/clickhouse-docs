import Image from "@theme/IdealImage";
import dev_error from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/dev-verification-error.png";
import privacy_default from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-default-view.png";
import privacy_allow from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-screen-allow-anyway.png";


# Установка ClickHouse с помощью Homebrew

<VerticalStepper>

## Установите с использованием формулы Homebrew от сообщества {#install-using-community-homebrew-formula}

Чтобы установить ClickHouse на macOS с помощью [Homebrew](https://brew.sh/), вы можете использовать
формулу ClickHouse от сообщества [homebrew formula](https://formulae.brew.sh/cask/clickhouse).

```bash
brew install --cask clickhouse
```

## Исправьте ошибку проверки разработчика в macOS {#fix-developer-verification-error-macos}

Если вы устанавливаете ClickHouse с помощью `brew`, вы можете столкнуться с ошибкой от MacOS.
По умолчанию MacOS не будет запускать приложения или инструменты, созданные разработчиком, который не может быть проверен.

При попытке выполнить любую команду `clickhouse` вы можете увидеть эту ошибку:

<Image img={dev_error} size="sm" alt="Диалоговое окно ошибки проверки разработчика MacOS" border />

Чтобы обойти эту ошибку проверки, вам нужно удалить приложение из карантина MacOS, либо найдя соответствующую настройку в окне настроек системы, используя терминал, либо переустановив ClickHouse.

### Процесс настройки системы {#system-settings-process}

Самый простой способ удалить исполняемый файл `clickhouse` из карантина — это:

1. Открыть **Настройки системы**.
1. Перейти в раздел **Конфиденциальность и безопасность**:

    <Image img={privacy_default} size="md" alt="Представление настроек конфиденциальности и безопасности MacOS по умолчанию" border />

1. Прокрутить внизу окна, чтобы найти сообщение, в котором говорится: _"clickhouse-macos-aarch64" был заблокирован для использования, так как он не от идентифицированного разработчика_.
1. Нажать **Разрешить в любом случае**.

    <Image img={privacy_allow} size="md" alt="Настройки конфиденциальности и безопасности MacOS с отображенной кнопкой Разрешить в любом случае" border />

1. Ввести пароль пользователя MacOS.

Теперь вы сможете выполнять команды `clickhouse` в вашем терминале.

### Процесс терминала {#terminal-process}

Иногда нажатие кнопки `Разрешить в любом случае` не устраняет эту проблему, в этом случае вы также можете выполнить этот процесс с помощью командной строки.
Или вы можете просто предпочесть использовать командную строку!

Сначала узнайте, где Homebrew установил исполняемый файл `clickhouse`:

```shell
which clickhouse
```

Это должно вывести что-то вроде:

```shell
/opt/homebrew/bin/clickhouse
```

Удалите `clickhouse` из карантина, выполнив `xattr -d com.apple.quarantine`, за которым следует путь из предыдущей команды:

```shell
xattr -d com.apple.quarantine /opt/homebrew/bin/clickhouse
```

Теперь вы сможете запустить исполняемый файл `clickhouse`:

```shell
clickhouse
```

Это должно вывести что-то вроде:

```bash
Use one of the following commands:
clickhouse local [args]
clickhouse client [args]
clickhouse benchmark [args]
```

## Исправьте проблему, переустановив ClickHouse {#fix-issue}

Brew имеет опцию командной строки, которая изначально избегает карантина установленных бинарников.

Сначала удалите ClickHouse:

```shell
brew uninstall clickhouse
```

Теперь переустановите ClickHouse с `--no-quarantine`:

```shell
brew install --no-quarantine clickhouse
```
</VerticalStepper>