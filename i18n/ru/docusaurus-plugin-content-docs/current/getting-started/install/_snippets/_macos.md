import Image from "@theme/IdealImage";
import dev_error from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/dev-verification-error.png";
import privacy_default from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-default-view.png";
import privacy_allow from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-screen-allow-anyway.png";



# Установка ClickHouse с помощью Homebrew

<VerticalStepper>


## Установка с использованием community-формулы Homebrew {#install-using-community-homebrew-formula}

Для установки ClickHouse на macOS с помощью [Homebrew](https://brew.sh/) можно использовать
community-[формулу homebrew](https://formulae.brew.sh/cask/clickhouse) ClickHouse.

```bash
brew install --cask clickhouse
```


## Исправление ошибки проверки разработчика в macOS {#fix-developer-verification-error-macos}

При установке ClickHouse с помощью `brew` вы можете столкнуться с ошибкой macOS.
По умолчанию macOS не запускает приложения или инструменты, созданные неподтверждённым разработчиком.

При попытке выполнить любую команду `clickhouse` может появиться следующая ошибка:

<Image
  img={dev_error}
  size='sm'
  alt='Диалоговое окно ошибки проверки разработчика macOS'
  border
/>

Чтобы обойти эту ошибку проверки, необходимо удалить приложение из карантина macOS. Это можно сделать через соответствующую настройку в системных настройках, с помощью терминала или путём переустановки ClickHouse.

### Через системные настройки {#system-settings-process}

Самый простой способ удалить исполняемый файл `clickhouse` из карантина:

1. Откройте **Системные настройки**.
1. Перейдите в раздел **Конфиденциальность и безопасность**:

   <Image
     img={privacy_default}
     size='md'
     alt='Настройки конфиденциальности и безопасности macOS, вид по умолчанию'
     border
   />

1. Прокрутите окно вниз до сообщения \_"clickhouse-macos-aarch64" был заблокирован, так как он создан неподтверждённым разработчиком".
1. Нажмите **Разрешить в любом случае**.

   <Image
     img={privacy_allow}
     size='md'
     alt='Настройки конфиденциальности и безопасности macOS с кнопкой «Разрешить в любом случае»'
     border
   />

1. Введите пароль пользователя macOS.

Теперь вы сможете выполнять команды `clickhouse` в терминале.

### Через терминал {#terminal-process}

Иногда нажатие кнопки `Разрешить в любом случае` не решает проблему. В таком случае можно выполнить эту процедуру через командную строку.
Или вы просто предпочитаете работать в командной строке!

Сначала узнайте, куда Homebrew установил исполняемый файл `clickhouse`:

```shell
which clickhouse
```

Вывод должен быть примерно таким:

```shell
/opt/homebrew/bin/clickhouse
```

Удалите `clickhouse` из карантина, выполнив команду `xattr -d com.apple.quarantine` с указанием пути из предыдущей команды:

```shell
xattr -d com.apple.quarantine /opt/homebrew/bin/clickhouse
```

Теперь вы сможете запустить исполняемый файл `clickhouse`:

```shell
clickhouse
```

Вывод должен быть примерно таким:

```bash
Use one of the following commands:
clickhouse local [args]
clickhouse client [args]
clickhouse benchmark [args]
```


## Устранение проблемы путём переустановки ClickHouse {#fix-issue}

Brew имеет параметр командной строки, который предотвращает помещение устанавливаемых бинарных файлов в карантин.

Сначала удалите ClickHouse:

```shell
brew uninstall clickhouse
```

Теперь переустановите ClickHouse с параметром `--no-quarantine`:

```shell
brew install --no-quarantine clickhouse
```

</VerticalStepper>
