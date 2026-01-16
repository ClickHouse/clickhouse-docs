import Image from "@theme/IdealImage";
import dev_error from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/dev-verification-error.png";
import privacy_default from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-default-view.png";
import privacy_allow from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-screen-allow-anyway.png";

# Установка ClickHouse с помощью Homebrew \{#install-clickhouse-using-homebrew\}

:::warning
Установка с использованием формулы Homebrew устарела и будет отключена 2026-09-01.
Мы рекомендуем вместо этого использовать метод [быстрой установки](/install/quick-install-curl), который работает на любой платформе.
:::

<VerticalStepper>

## Установка с использованием community-формулы Homebrew \\{#install-using-community-homebrew-formula\\}

Чтобы установить ClickHouse на macOS с помощью [Homebrew](https://brew.sh/), вы можете использовать
[формулу Homebrew](https://formulae.brew.sh/cask/clickhouse), поддерживаемую сообществом ClickHouse.

```bash
brew install --cask clickhouse
```

## Исправление ошибки проверки разработчика в macOS \\{#fix-developer-verification-error-macos\\}

Если вы устанавливаете ClickHouse с помощью `brew`, вы можете столкнуться с ошибкой со стороны macOS.
По умолчанию macOS не запускает приложения или инструменты, созданные разработчиком, подлинность которого не может быть подтверждена.

При попытке выполнить любую команду `clickhouse` вы можете увидеть такую ошибку:

<Image img={dev_error} size="sm" alt="Диалоговое окно ошибки проверки разработчика в macOS" border />

Чтобы обойти эту ошибку проверки, нужно убрать приложение из карантина macOS — либо найдя соответствующую настройку в окне **System Settings**, используя терминал, либо переустановив ClickHouse.

### Процесс через системные настройки \\{#system-settings-process\\}

Самый простой способ убрать исполняемый файл `clickhouse` из карантина:

1. Откройте **System Settings**.

2. Перейдите в **Privacy &amp; Security**:

   <Image img={privacy_default} size="md" alt="Стандартный вид настроек Privacy & Security в macOS" border />

3. Пролистайте окно вниз до сообщения вида _"clickhouse-macos-aarch64" was blocked from use because it is not from an identified developer"_.

4. Нажмите **Allow Anyway**.

   <Image img={privacy_allow} size="md" alt="Настройки Privacy & Security в macOS с кнопкой Allow Anyway" border />

5. Введите пароль пользователя macOS.

Теперь вы должны иметь возможность запускать команды `clickhouse` в терминале.

### Процесс через терминал \\{#terminal-process\\}

Иногда нажатие кнопки `Allow Anyway` не решает эту проблему, и в этом случае вы можете выполнить этот процесс через командную строку.
Или вы можете просто предпочитать использовать командную строку!

Сначала выясните, куда Homebrew установил исполняемый файл `clickhouse`:

```shell
which clickhouse
```

Должно получиться что-то вроде этого:

```shell
/opt/homebrew/bin/clickhouse
```

Удалите файл `clickhouse` из карантина, выполнив `xattr -d com.apple.quarantine` с путем, полученным из предыдущей команды:

```shell
xattr -d com.apple.quarantine /opt/homebrew/bin/clickhouse
```

Теперь вы можете запустить исполняемый файл `clickhouse`:

```shell
clickhouse
```

Должно получиться примерно следующее:

```bash
Use one of the following commands:
clickhouse local [args]
clickhouse client [args]
clickhouse benchmark [args]
```

## Устранение проблемы путем повторной установки ClickHouse \\{#fix-issue\\}

В brew есть параметр командной строки, который изначально предотвращает помещение установленных бинарных файлов в карантин.

Сначала удалите ClickHouse:

```shell
brew uninstall clickhouse
```

Теперь переустановите ClickHouse с параметром `--no-quarantine`:

```shell
brew install --no-quarantine clickhouse
```
</VerticalStepper>