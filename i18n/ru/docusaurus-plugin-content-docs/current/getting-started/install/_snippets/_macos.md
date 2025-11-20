import Image from "@theme/IdealImage";
import dev_error from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/dev-verification-error.png";
import privacy_default from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-default-view.png";
import privacy_allow from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-screen-allow-anyway.png";



# Установка ClickHouse с помощью Homebrew

<VerticalStepper>


## Установка с использованием community-формулы Homebrew {#install-using-community-homebrew-formula}

Для установки ClickHouse на macOS с помощью [Homebrew](https://brew.sh/) можно использовать
[формулу homebrew](https://formulae.brew.sh/cask/clickhouse) от сообщества ClickHouse.

```bash
brew install --cask clickhouse
```


## Исправление ошибки верификации разработчика в macOS {#fix-developer-verification-error-macos}

Если вы устанавливаете ClickHouse с помощью `brew`, вы можете столкнуться с ошибкой со стороны macOS.
По умолчанию macOS не запускает приложения или инструменты, созданные неидентифицированным разработчиком.

При попытке выполнить любую команду `clickhouse` вы можете увидеть эту ошибку:

<Image
  img={dev_error}
  size='sm'
  alt='Диалог ошибки верификации разработчика в macOS'
  border
/>

Чтобы обойти эту ошибку верификации, вам нужно удалить приложение из карантина macOS: либо найдя соответствующую настройку в окне системных настроек, либо используя терминал, либо переустановив ClickHouse.

### Процесс через системные настройки {#system-settings-process}

Самый простой способ удалить исполняемый файл `clickhouse` из карантина — это:

1. Откройте **Системные настройки**.
1. Перейдите в **Конфиденциальность и безопасность**:

   <Image
     img={privacy_default}
     size='md'
     alt='Параметры конфиденциальности и безопасности macOS по умолчанию'
     border
   />

1. Прокрутите окно вниз, чтобы найти сообщение со словами: «clickhouse-macos-aarch64» заблокирован, поскольку он не от идентифицированного разработчика.
1. Нажмите **Разрешить в любом случае**.

   <Image
     img={privacy_allow}
     size='md'
     alt='Параметры конфиденциальности и безопасности macOS с кнопкой «Разрешить в любом случае»'
     border
   />

1. Введите пароль пользователя macOS.

Теперь вы сможете выполнять команды `clickhouse` в терминале.

### Процесс через терминал {#terminal-process}

Иногда нажатие кнопки «Разрешить в любом случае» не решает проблему, и в этом случае вы можете выполнить процесс с помощью командной строки.
Или вы просто предпочитаете работать в терминале!

Сначала узнайте, куда Homebrew установил исполняемый файл `clickhouse`:

```shell
which clickhouse
```

This should output something like:

```shell
/opt/homebrew/bin/clickhouse
```

Remove `clickhouse` from the quarantine bin by running `xattr -d com.apple.quarantine` followed by the path from the previous command:

```shell
xattr -d com.apple.quarantine /opt/homebrew/bin/clickhouse
```

Теперь вы сможете запустить исполняемый файл `clickhouse`:

```shell
clickhouse
```

This should output something like:

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
