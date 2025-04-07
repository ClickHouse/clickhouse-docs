---
description: 'Установить ClickHouse'
keywords: ['clickhouse', 'установка', 'начало работы', 'быстрый старт']
sidebar_label: 'Установка'
slug: /install
title: 'Установка ClickHouse'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# Установка ClickHouse

У вас есть четыре варианта, чтобы начать работать с ClickHouse:

- **[ClickHouse Cloud](https://clickhouse.com/cloud/):** Официальный ClickHouse как услуга, разработанный, поддерживаемый и поддерживающийся создателями ClickHouse
- **[Быстрая установка](#quick-install):** легковесный бинарный файл для тестирования и разработки с ClickHouse
- **[Промышленные развертывания](#available-installation-options):** ClickHouse может работать на любом Linux, FreeBSD или macOS с архитектурой CPU x86-64, современный ARM (ARMv8.2-A и выше) или PowerPC64LE
- **[Docker-образ](https://hub.docker.com/_/clickhouse):** используйте официальный Docker-образ в Docker Hub

## ClickHouse Cloud {#clickhouse-cloud}

Самый быстрый и простой способ начать работать с ClickHouse - создать новую услугу в [ClickHouse Cloud](https://clickhouse.cloud/).

## Быстрая установка {#quick-install}

:::tip
Для промышленных установок конкретной версии смотрите [варианты установки](#available-installation-options) ниже.
:::

На Linux, macOS и FreeBSD:

1. Если вы только начинаете и хотите увидеть, что может сделать ClickHouse, самый простой способ загрузить ClickHouse локально - запустить следующую команду. Она загружает один бинарный файл для вашей операционной системы, который может быть использован для запуска сервера ClickHouse, `clickhouse-client`, `clickhouse-local`, ClickHouse Keeper и других инструментов:

   ```bash
   curl https://clickhouse.com/ | sh
   ```

   :::note
   Для пользователей Mac: если вы получаете ошибки, что разработчик бинарного файла не может быть проверен, пожалуйста, смотрите [здесь](/knowledgebase/fix-developer-verification-error-in-macos).
   :::

2. Выполните следующую команду, чтобы запустить [clickhouse-local](../operations/utilities/clickhouse-local.md):

   ```bash
   ./clickhouse
   ```

   `clickhouse-local` позволяет вам обрабатывать локальные и удаленные файлы, используя мощный SQL ClickHouse, без необходимости в конфигурации. Данные таблицы хранятся во временном месте, что означает, что после перезапуска `clickhouse-local` ранее созданные таблицы более не доступны.

   В качестве альтернативы вы можете запустить сервер ClickHouse с помощью этой команды ...

    ```bash
    ./clickhouse server
    ```

   ... и открыть новый терминал для подключения к серверу с помощью `clickhouse-client`:

    ```bash
    ./clickhouse client
    ```

    ```response
    ./clickhouse client
    ClickHouse client version 24.5.1.117 (официальная сборка).
    Подключение к localhost:9000 как пользователь default.
    Подключено к версии сервера ClickHouse 24.5.1.

    local-host :)
    ```

   Данные таблицы хранятся в текущем каталоге и все еще доступны после перезапуска сервера ClickHouse. При необходимости вы можете передать `-C config.xml` в качестве дополнительного аргумента командной строки к `./clickhouse server` и предоставить дальнейшую конфигурацию в файле конфигурации. Все доступные настройки конфигурации документированы [здесь](../operations/settings/settings.md) и в [шаблоне примерного файла конфигурации](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml).

   Вы готовы отправлять SQL-команды в ClickHouse!

:::tip
[Быстрый старт](/quick-start.mdx) описывает шаги для создания таблиц и вставки данных.
:::

## Промышленные развертывания {#available-installation-options}

Для промышленных развертываний ClickHouse выберите один из следующих вариантов установки.

### Из пакетов DEB {#install-from-deb-packages}

Рекомендуется использовать официальные предварительно скомпилированные `deb` пакеты для Debian или Ubuntu. Запустите эти команды для установки пакетов:

#### Настройка репозитория Debian {#setup-the-debian-repository}
```bash
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg
curl -fsSL 'https://packages.clickhouse.com/rpm/lts/repodata/repomd.xml.key' | sudo gpg --dearmor -o /usr/share/keyrings/clickhouse-keyring.gpg

ARCH=$(dpkg --print-architecture)
echo "deb [signed-by=/usr/share/keyrings/clickhouse-keyring.gpg arch=${ARCH}] https://packages.clickhouse.com/deb stable main" | sudo tee /etc/apt/sources.list.d/clickhouse.list
sudo apt-get update
```

#### Установить сервер и клиент ClickHouse {#install-clickhouse-server-and-client}
```bash
sudo apt-get install -y clickhouse-server clickhouse-client
```

#### Запустить сервер ClickHouse {#start-clickhouse-server}

```bash
sudo service clickhouse-server start
clickhouse-client # или "clickhouse-client --password", если вы настроили пароль.
```

<details>
<summary>Старый метод установки deb-пакетов</summary>

```bash
sudo apt-get install apt-transport-https ca-certificates dirmngr
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 8919F6BD2B48D754
echo "deb https://packages.clickhouse.com/deb stable main" | sudo tee \
    /etc/apt/sources.list.d/clickhouse.list
sudo apt-get update

sudo apt-get install -y clickhouse-server clickhouse-client

sudo service clickhouse-server start
clickhouse-client # или "clickhouse-client --password", если вы настроили пароль.
```

</details>

Вы можете заменить `stable` на `lts`, чтобы использовать другие [типы релизов](/knowledgebase/production) в зависимости от ваших нужд.

Вы также можете загрузить и установить пакеты вручную [здесь](https://packages.clickhouse.com/deb/pool/main/c/).

#### Установить отдельный ClickHouse Keeper {#install-standalone-clickhouse-keeper}

:::tip
В производственной среде мы настоятельно рекомендуем запускать ClickHouse Keeper на выделенных узлах.
В тестовых средах, если вы решите запустить сервер ClickHouse и ClickHouse Keeper на одном и том же сервере, вам не нужно устанавливать ClickHouse Keeper, так как он включен в сервер ClickHouse.
Эта команда нужна только на отдельном сервере ClickHouse Keeper.
:::

```bash
sudo apt-get install -y clickhouse-keeper
```

#### Включить и запустить ClickHouse Keeper {#enable-and-start-clickhouse-keeper}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

#### Пакеты {#packages}

- `clickhouse-common-static` — Устанавливает скомпилированные бинарные файлы ClickHouse.
- `clickhouse-server` — Создает символическую ссылку для `clickhouse-server` и устанавливает конфигурацию сервера по умолчанию.
- `clickhouse-client` — Создает символическую ссылку для `clickhouse-client` и других связанных с клиентом инструментов. Устанавливает файлы конфигурации клиента.
- `clickhouse-common-static-dbg` — Устанавливает скомпилированные бинарные файлы ClickHouse с отладочной информацией.
- `clickhouse-keeper` - Используется для установки ClickHouse Keeper на выделенных узлах ClickHouse Keeper. Если вы запускаете ClickHouse Keeper на том же сервере, что и сервер ClickHouse, то вам не нужно устанавливать этот пакет. Устанавливает ClickHouse Keeper и файлы конфигурации ClickHouse Keeper по умолчанию.

:::info
Если вам нужно установить конкретную версию ClickHouse, вы должны установить все пакеты с одной и той же версией:
`sudo apt-get install clickhouse-server=21.8.5.7 clickhouse-client=21.8.5.7 clickhouse-common-static=21.8.5.7`
:::

### Из пакетов RPM {#from-rpm-packages}

Рекомендуется использовать официальные предварительно скомпилированные `rpm` пакеты для CentOS, RedHat и всех других дистрибутивов Linux на базе rpm.

#### Настройка репозитория RPM {#setup-the-rpm-repository}
Сначала вам нужно добавить официальный репозиторий:

```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://packages.clickhouse.com/rpm/clickhouse.repo
```

Для систем с менеджером пакетов `zypper` (openSUSE, SLES):

```bash
sudo zypper addrepo -r https://packages.clickhouse.com/rpm/clickhouse.repo -g
sudo zypper --gpg-auto-import-keys refresh clickhouse-stable
```

Позже любую команду `yum install` можно заменить на `zypper install`. Чтобы указать конкретную версию, добавьте `-$VERSION` к концу имени пакета, например, `clickhouse-client-22.2.2.22`.

#### Установить сервер и клиент ClickHouse {#install-clickhouse-server-and-client-1}

```bash
sudo yum install -y clickhouse-server clickhouse-client
```

#### Запустить сервер ClickHouse {#start-clickhouse-server-1}

```bash
sudo systemctl enable clickhouse-server
sudo systemctl start clickhouse-server
sudo systemctl status clickhouse-server
clickhouse-client # или "clickhouse-client --password", если вы настроили пароль.
```

#### Установить отдельный ClickHouse Keeper {#install-standalone-clickhouse-keeper-1}

:::tip
В производственной среде мы настоятельно рекомендуем запускать ClickHouse Keeper на выделенных узлах.
В тестовых средах, если вы решите запустить сервер ClickHouse и ClickHouse Keeper на одном и том же сервере, вам не нужно устанавливать ClickHouse Keeper, так как он включен в сервер ClickHouse.
Эта команда нужна только на отдельных серверах ClickHouse Keeper.
:::

```bash
sudo yum install -y clickhouse-keeper
```

#### Включить и запустить ClickHouse Keeper {#enable-and-start-clickhouse-keeper-1}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

Вы можете заменить `stable` на `lts`, чтобы использовать различные [типы релизов](/knowledgebase/production) в зависимости от ваших нужд.

Затем выполните команды для установки пакетов:

```bash
sudo yum install clickhouse-server clickhouse-client
```

Вы также можете загрузить и установить пакеты вручную [здесь](https://packages.clickhouse.com/rpm/stable).

### Из архивов Tgz {#from-tgz-archives}

Рекомендуется использовать официальные предварительно скомпилированные `tgz` архивы для всех дистрибутивов Linux, где установка пакетов `deb` или `rpm` невозможна.

Необходимую версию можно загрузить с помощью `curl` или `wget` из репозитория https://packages.clickhouse.com/tgz/.
После этого загруженные архивы должны быть распакованы и установлены с помощью установочных скриптов. Пример для последней стабильной версии:

```bash
LATEST_VERSION=$(curl -s https://raw.githubusercontent.com/ClickHouse/ClickHouse/master/utils/list-versions/version_date.tsv | \
    grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | sort -V -r | head -n 1)
export LATEST_VERSION

case $(uname -m) in
  x86_64) ARCH=amd64 ;;
  aarch64) ARCH=arm64 ;;
  *) echo "Неизвестная архитектура $(uname -m)"; exit 1 ;;
esac

for PKG in clickhouse-common-static clickhouse-common-static-dbg clickhouse-server clickhouse-client clickhouse-keeper
do
  curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION-${ARCH}.tgz" \
    || curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION.tgz"
done

tar -xzvf "clickhouse-common-static-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-$LATEST_VERSION/install/doinst.sh"

tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-dbg-$LATEST_VERSION/install/doinst.sh"

tar -xzvf "clickhouse-server-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-server-$LATEST_VERSION.tgz"
sudo "clickhouse-server-$LATEST_VERSION/install/doinst.sh" configure
sudo /etc/init.d/clickhouse-server start

tar -xzvf "clickhouse-client-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-client-$LATEST_VERSION.tgz"
sudo "clickhouse-client-$LATEST_VERSION/install/doinst.sh"
```

Для производственных сред рекомендуется использовать последнюю версию `stable`. Вы можете найти её номер на странице GitHub https://github.com/ClickHouse/ClickHouse/tags с постфиксом `-stable`.

### Из Docker-образа {#from-docker-image}

Чтобы запустить ClickHouse внутри Docker, следуйте руководству на [Docker Hub](https://hub.docker.com/r/clickhouse/clickhouse-server/). Эти образы используют официальные `deb` пакеты внутри.

## Непромышленные развертывания (расширенные) {#non-production-deployments-advanced}

### Компиляция из исходников {#from-sources}

Чтобы вручную скомпилировать ClickHouse, следуйте инструкциям для [Linux](/development/build.md) или [macOS](/development/build-osx.md).

Вы можете скомпилировать пакеты и установить их или использовать программы без установки пакетов.

```xml
Клиент: <build_directory>/programs/clickhouse-client
Сервер: <build_directory>/programs/clickhouse-server
```

Вам нужно будет вручную создать папки данных и метаданных и выполнить для них команду `chown` для желаемого пользователя. Их пути могут быть изменены в конфигурации сервера (src/programs/server/config.xml), по умолчанию они следующие:

```bash
/var/lib/clickhouse/data/default/
/var/lib/clickhouse/metadata/default/
```

На Gentoo вы можете просто использовать `emerge clickhouse`, чтобы установить ClickHouse из исходников.

### Установка бинарного файла, сгенерированного CI {#install-a-ci-generated-binary}

Инфраструктура непрерывной интеграции (CI) ClickHouse производит специализированные сборки для каждого коммита в [репозитории ClickHouse](https://github.com/clickhouse/clickhouse/), например, [санизированные](https://github.com/google/sanitizers) сборки, не оптимизированные (Debug) сборки, кросс-компилированные сборки и т.д. Хотя такие сборки обычно полезны только в процессе разработки, в некоторых ситуациях они также могут быть интересны пользователям.

:::note
Поскольку CI ClickHouse со временем развивается, точные шаги для загрузки сборок, сгенерированных CI, могут варьироваться.
Кроме того, CI может удалить слишком старые артефакты сборки, что делает их недоступными для загрузки.
:::

Например, чтобы загрузить бинарный файл aarch64 для ClickHouse v23.4, выполните следующие шаги:

- Найдите запрос на выставление релиза для v23.4: [Запрос на выставление релиза для ветки 23.4](https://github.com/ClickHouse/ClickHouse/pull/49238)
- Нажмите "Commits", затем нажмите коммит, похожий на "Обновление сгенерированной версии на 23.4.2.1 и contributors" для версии, которую вы хотите установить.
- Нажмите зеленую галочку / желтую точку / красный крест, чтобы открыть список проверок CI.
- Нажмите "Details" рядом с "Builds" в списке, это откроет страницу, аналогичную [этой странице](https://s3.amazonaws.com/clickhouse-test-reports/46793/b460eb70bf29b19eadd19a1f959b15d186705394/clickhouse_build_check/report.html)
- Найдите строки с компилятором = "clang-*-aarch64" - там несколько строк.
- Загрузите артефакты для этих сборок.

### Только для macOS: установка через Homebrew {#macos-only-install-with-homebrew}

Чтобы установить ClickHouse на macOS с использованием [homebrew](https://brew.sh/), пожалуйста, смотрите [сообщество формулы homebrew ClickHouse](https://formulae.brew.sh/cask/clickhouse).

:::note
Для пользователей Mac: если вы получаете ошибки, что разработчик бинарного файла не может быть проверен, пожалуйста, смотрите [здесь](/knowledgebase/fix-developer-verification-error-in-macos).
:::

## Запуск {#launch}

Чтобы запустить сервер как демон, выполните:

```bash
$ clickhouse start
```

Существует также другие способы запустить ClickHouse:

```bash
$ sudo service clickhouse-server start
```

Если у вас нет команды `service`, выполните

```bash
$ sudo /etc/init.d/clickhouse-server start
```

Если у вас есть команда `systemctl`, выполните

```bash
$ sudo systemctl start clickhouse-server.service
```

Смотрите журналы в директории `/var/log/clickhouse-server/`.

Если сервер не запускается, проверьте конфигурации в файле `/etc/clickhouse-server/config.xml`.

Вы также можете вручную запустить сервер из консоли:

```bash
$ clickhouse-server --config-file=/etc/clickhouse-server/config.xml
```

В этом случае журнал будет выведен в консоль, что удобно во время разработки.
Если файл конфигурации находится в текущем каталоге, вам не нужно указывать параметр `--config-file`. По умолчанию используется `./config.xml`.

ClickHouse поддерживает настройки ограничения доступа. Они находятся в файле `users.xml` (рядом с `config.xml`).
По умолчанию доступ разрешен отовсюду для пользователя `default`, без пароля. Смотрите `user/default/networks`.
Для получения дополнительной информации смотрите раздел ["Файлы конфигурации"](/operations/configuration-files.md).

После запуска сервера вы можете использовать клиент командной строки, чтобы подключиться к нему:

```bash
$ clickhouse-client
```

По умолчанию он подключается к `localhost:9000` от имени пользователя `default` без пароля. Его также можно использовать для подключения к удаленному серверу с помощью аргумента `--host`.

Терминал должен использовать кодировку UTF-8.
Для получения дополнительной информации смотрите раздел ["Клиент командной строки"](/interfaces/cli.md).

Пример:

```bash
$ ./clickhouse-client
ClickHouse client version 0.0.18749.
Подключение к localhost:9000.
Подключено к серверу ClickHouse версии 0.0.18749.

:) SELECT 1

SELECT 1

┌─1─┐
│ 1 │
└───┘

1 строка в наборе. Затраченное время: 0.003 сек.

:)
```

**Поздравляю, система работает!**

Чтобы продолжить эксперименты, вы можете загрузить один из тестовых наборов данных или пройти [учебник](/tutorial.md).

## Рекомендации для самоуправляемого ClickHouse {#recommendations-for-self-managed-clickhouse}

ClickHouse может работать на любом Linux, FreeBSD или macOS с архитектурой CPU x86-64, ARM или PowerPC64LE.

ClickHouse использует все доступные аппаратные ресурсы для обработки данных.

ClickHouse, как правило, работает более эффективно с большим количеством ядер при более низкой частоте, чем с меньшим количеством ядер при более высокой частоте.

Рекомендуемое количество оперативной памяти составляет минимум 4 ГБ для выполнения нетривиальных запросов. Сервер ClickHouse может работать с гораздо меньшим объемом ОЗУ, но в этом случае запросы будут часто прерываться.

Необходимый объем ОЗУ в общем зависит от:

- Сложности запросов.
- Объема данных, обрабатываемых в запросах.

Чтобы рассчитать необходимый объем ОЗУ, вы можете оценить размер временных данных для [GROUP BY](/sql-reference/statements/select/group-by), [DISTINCT](/sql-reference/statements/select/distinct), [JOIN](/sql-reference/statements/select/join) и других операций, которые вы используете.

Чтобы уменьшить потребление памяти, ClickHouse может перемещать временные данные на внешнее хранилище. Смотрите [GROUP BY в внешней памяти](/sql-reference/statements/select/group-by#group-by-in-external-memory) для получения деталей.

Мы рекомендуем отключить файл подкачки операционной системы в производственных средах.

Бинарный файл ClickHouse требует как минимум 2,5 ГБ дискового пространства для установки.

Объем хранилища, необходимый для ваших данных, можно рассчитать отдельно на основе

- оценок объема данных.

    Вы можете взять образец данных и получить средний размер строки из него. Затем умножьте это значение на количество строк, которые вы планируете хранить.

- Коэффициента сжатия данных.

    Чтобы оценить коэффициент сжатия данных, загрузите образец ваших данных в ClickHouse и сравните фактический размер данных с размером хранимой таблицы. Например, данные о кликах обычно сжимаются в 6-10 раз.

Чтобы рассчитать итоговый объем данных, которые необходимо хранить, примените коэффициент сжатия к оцененному объему данных. Если вы планируете хранить данные в нескольких репликах, умножьте оцененный объем на количество реплик.

Для распределенных развертываний ClickHouse (кластеризация) мы рекомендуем сетевую связь по классу не менее 10G.

Пропускная способность сети имеет критическое значение для обработки распределённых запросов с большим объёмом промежуточных данных. Кроме того, скорость сети влияет на процессы репликации.
