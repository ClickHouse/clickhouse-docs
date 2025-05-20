import Image from "@theme/IdealImage";
import dev_error from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/dev-verification-error.png";
import privacy_default from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-default-view.png";
import privacy_allow from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-screen-allow-anyway.png";

# Установка ClickHouse с помощью Homebrew

<VerticalStepper>

## Установка с использованием формулы Homebrew от сообщества {#install-using-community-homebrew-formula}

Для установки ClickHouse на macOS с использованием [Homebrew](https://brew.sh/), вы можете воспользоваться формулой ClickHouse от сообщества [homebrew](https://formulae.brew.sh/cask/clickhouse).

```bash
brew install --cask clickhouse
```

## Исправление ошибки проверки разработчика в MacOS {#fix-developer-verification-error-macos}

Если вы установили ClickHouse с помощью `brew`, вы можете столкнуться с ошибкой от MacOS.
По умолчанию MacOS не будет запускать приложения или инструменты, созданные разработчиком, которого не удается проверить.

При попытке выполнить любую команду `clickhouse` вы можете увидеть эту ошибку:

<Image img={dev_error} size="sm" alt="Диалог ошибки проверки разработчика в MacOS" border />

Чтобы обойти эту ошибку проверки, вам нужно удалить приложение из корзины ожидания MacOS, либо найдя соответствующую настройку в окне настроек системы, используя терминал, либо переустановив ClickHouse.

### Процесс настроек системы {#system-settings-process}

Самый простой способ удалить исполняемый файл `clickhouse` из корзины ожидания:

1. Откройте **Системные настройки**.
1. Перейдите в **Конфиденциальность и безопасность**:

    <Image img={privacy_default} size="md" alt="По умолчанию окно настроек Конфиденциальности и безопасности MacOS" border />

1. Прокрутите вниз до конца окна, чтобы найти сообщение о том, что _"clickhouse-macos-aarch64" был заблокирован для использования, так как он не от идентифицированного разработчика_.
1. Нажмите **Разрешить В любом случае**.

    <Image img={privacy_allow} size="md" alt="Настройки конфиденциальности и безопасности MacOS с кнопкой Разрешить В любом случае" border />

1. Введите пароль пользователя MacOS.

Теперь вы должны иметь возможность выполнять команды `clickhouse` в терминале.

### Процесс терминала {#terminal-process}

Иногда нажатие кнопки `Разрешить В любом случае` не решает эту проблему, в этом случае вы также можете выполнить этот процесс, используя командную строку.
Или вы просто можете предпочесть использовать командную строку!

Сначала узнайте, где Homebrew установил исполняемый файл `clickhouse`:

```shell
which clickhouse
```

Это должно вывести что-то вроде:

```shell
/opt/homebrew/bin/clickhouse
```

Удалите `clickhouse` из корзины ожидания, выполнив `xattr -d com.apple.quarantine`, после чего укажите путь из предыдущей команды:

```shell
xattr -d com.apple.quarantine /opt/homebrew/bin/clickhouse
```

Теперь вы должны иметь возможность запускать исполняемый файл `clickhouse`:

```shell
clickhouse
```

Это должно вывести что-то вроде:

```bash
Используйте одну из следующих команд:
clickhouse local [args]
clickhouse client [args]
clickhouse benchmark [args]
...

## Исправление проблемы путем переустановки ClickHouse {#fix-issue}

Brew имеет параметр командной строки, который избегает помещать установленные двоичные файлы в корзину ожидания с самого начала.

Сначала удалите ClickHouse:

```shell
brew uninstall clickhouse
```

Теперь переустановите ClickHouse с параметром `--no-quarantine`:

```shell
brew install --no-quarantine clickhouse
```
</VerticalStepper>
