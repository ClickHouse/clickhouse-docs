---
description: 'Установка ClickHouse'
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

- **[ClickHouse Cloud](https://clickhouse.com/cloud/):** Официальный ClickHouse как услуга, созданный, поддерживаемый и обслуживаемый создателями ClickHouse.
- **[Быстрая установка](#quick-install):** простой в загрузке бинарный файл для тестирования и разработки с ClickHouse.
- **[Рабочие развертывания](#available-installation-options):** ClickHouse может работать на любых системах Linux, FreeBSD или macOS с архитектурой процессора x86-64, современных ARM (ARMv8.2-A и выше) или PowerPC64LE.
- **[Docker-образ](https://hub.docker.com/_/clickhouse):** используйте официальный образ Docker из Docker Hub.

## ClickHouse Cloud {#clickhouse-cloud}

Самый быстрый и простой способ начать работать с ClickHouse — это создать новую службу в [ClickHouse Cloud](https://clickhouse.cloud/).

## Быстрая установка {#quick-install}

:::tip
Для развертываний в производственной среде с конкретной версией смотрите [варианты установки](#available-installation-options) ниже.
:::

На Linux, macOS и FreeBSD:

1. Если вы только начинаете и хотите увидеть, что может сделать ClickHouse, проще всего загрузить ClickHouse локально, выполнив следующую команду. Она загрузит единый бинарный файл для вашей операционной системы, который можно использовать для запуска сервера ClickHouse, `clickhouse-client`, `clickhouse-local`, ClickHouse Keeper и других инструментов:

   ```bash
   curl https://clickhouse.com/ | sh
   ```

   :::note
   Для пользователей Mac: Если вы получаете ошибки о том, что разработчик бинарного файла не может быть проверен, пожалуйста, смотрите [здесь](/knowledgebase/fix-developer-verification-error-in-macos).
   :::

2. Выполните следующую команду для запуска [clickhouse-local](../operations/utilities/clickhouse-local.md):

   ```bash
   ./clickhouse
   ```

   `clickhouse-local` позволяет обрабатывать локальные и удаленные файлы, используя мощный SQL ClickHouse и без необходимости конфигурирования. Данные таблицы хранятся во временном месте, что означает, что после перезапуска `clickhouse-local` ранее созданные таблицы больше недоступны.

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
    ClickHouse client version 24.5.1.117 (official build).
    Connecting to localhost:9000 as user default.
    Connected to ClickHouse server version 24.5.1.

    local-host :)
    ```

   Данные таблицы хранятся в текущем каталоге и все еще доступны после перезапуска сервера ClickHouse. При необходимости вы можете передать `-C config.xml` в качестве дополнительного аргумента командной строки для `./clickhouse server` и предоставить дальнейшую конфигурацию в файле конфигурации. Все доступные настройки конфигурации документированы [здесь](../operations/settings/settings.md) и в [шаблоне примера конфигурационного файла](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml).

   Вы готовы начать отправлять SQL-команды в ClickHouse!

:::tip
[Быстрый старт](/quick-start.mdx) проводит через шаги по созданию таблиц и вставке данных.
:::

## Рабочие развертывания {#available-installation-options}

Для развертываний ClickHouse в производственной среде выберите один из следующих вариантов установки.

### Из пакетов DEB {#install-from-deb-packages}

Рекомендуется использовать официальные предварительно скомпилированные `deb` пакеты для Debian или Ubuntu. Выполните эти команды для установки пакетов:

#### Настройка репозитория Debian {#setup-the-debian-repository}
```bash
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg
curl -fsSL 'https://packages.clickhouse.com/rpm/lts/repodata/repomd.xml.key' | sudo gpg --dearmor -o /usr/share/keyrings/clickhouse-keyring.gpg

ARCH=$(dpkg --print-architecture)
echo "deb [signed-by=/usr/share/keyrings/clickhouse-keyring.gpg arch=${ARCH}] https://packages.clickhouse.com/deb stable main" | sudo tee /etc/apt/sources.list.d/clickhouse.list
sudo apt-get update
```

#### Установка сервера и клиента ClickHouse {#install-clickhouse-server-and-client}
```bash
sudo apt-get install -y clickhouse-server clickhouse-client
```

#### Запуск сервера ClickHouse {#start-clickhouse-server}

```bash
sudo service clickhouse-server start
clickhouse-client # или "clickhouse-client --password", если вы настроили пароль.
```

<details>
<summary>Старый метод дистрибуции для установки deb-пакетов</summary>

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

Вы можете также скачать и установить пакеты вручную [здесь](https://packages.clickhouse.com/deb/pool/main/c/).

#### Установка отдельного ClickHouse Keeper {#install-standalone-clickhouse-keeper}

:::tip
В производственной среде мы настоятельно рекомендуем запускать ClickHouse Keeper на выделенных узлах.
В тестовых средах, если вы решите запустить сервер ClickHouse и ClickHouse Keeper на одном и том же сервере, вам не нужно устанавливать ClickHouse Keeper, так как он включен в сервер ClickHouse.
Эта команда необходима только на отдельных серверах ClickHouse Keeper.
:::

```bash
sudo apt-get install -y clickhouse-keeper
```

#### Включение и запуск ClickHouse Keeper {#enable-and-start-clickhouse-keeper}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

#### Пакеты {#packages}

- `clickhouse-common-static` — Устанавливает скомпилированные бинарные файлы ClickHouse.
- `clickhouse-server` — Создает символическую ссылку для `clickhouse-server` и устанавливает конфигурацию сервера по умолчанию.
- `clickhouse-client` — Создает символическую ссылку для `clickhouse-client` и других клиентских инструментов и устанавливает конфигурационные файлы клиента.
- `clickhouse-common-static-dbg` — Устанавливает скомпилированные бинарные файлы ClickHouse с отладочной информацией.
- `clickhouse-keeper` - Используется для установки ClickHouse Keeper на выделенные узлы ClickHouse Keeper. Если вы запускаете ClickHouse Keeper на том же сервере, что и сервер ClickHouse, тогда вам не нужно устанавливать этот пакет. Устанавливает ClickHouse Keeper и конфигурационные файлы по умолчанию для ClickHouse Keeper.

:::info
Если вы хотите установить конкретную версию ClickHouse, вам нужно установить все пакеты с одной и той же версией:
`sudo apt-get install clickhouse-server=21.8.5.7 clickhouse-client=21.8.5.7 clickhouse-common-static=21.8.5.7`
:::

### Из пакетов RPM {#from-rpm-packages}

Рекомендуется использовать официальные предварительно скомпилированные `rpm` пакеты для CentOS, RedHat и всех других дистрибутивов Linux на основе RPM.

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

Позже любую `yum install` можно заменить на `zypper install`. Чтобы указать конкретную версию, добавьте `-$VERSION` в конец имени пакета, например `clickhouse-client-22.2.2.22`.

#### Установка сервера и клиента ClickHouse {#install-clickhouse-server-and-client-1}

```bash
sudo yum install -y clickhouse-server clickhouse-client
```

#### Запуск сервера ClickHouse {#start-clickhouse-server-1}

```bash
sudo systemctl enable clickhouse-server
sudo systemctl start clickhouse-server
sudo systemctl status clickhouse-server
clickhouse-client # или "clickhouse-client --password", если вы настроили пароль.
```

#### Установка отдельного ClickHouse Keeper {#install-standalone-clickhouse-keeper-1}

:::tip
В производственной среде мы настоятельно рекомендуем запускать ClickHouse Keeper на выделенных узлах.
В тестовых средах, если вы решите запустить сервер ClickHouse и ClickHouse Keeper на одном и том же сервере, вам не нужно устанавливать ClickHouse Keeper, так как он включен в сервер ClickHouse.
Эта команда необходима только на отдельных серверах ClickHouse Keeper.
:::

```bash
sudo yum install -y clickhouse-keeper
```

#### Включение и запуск ClickHouse Keeper {#enable-and-start-clickhouse-keeper-1}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

Вы можете заменить `stable` на `lts`, чтобы использовать разные [типы релизов](/knowledgebase/production) в зависимости от ваших нужд.

Затем выполните эти команды для установки пакетов:

```bash
sudo yum install clickhouse-server clickhouse-client
```

Вы также можете скачать и установить пакеты вручную [здесь](https://packages.clickhouse.com/rpm/stable).

### Из архивов Tgz {#from-tgz-archives}

Рекомендуется использовать официальные предварительно скомпилированные `tgz` архивы для всех дистрибутивов Linux, где установка `deb` или `rpm` пакетов невозможна.

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

Для производственных сред рекомендуется использовать последнюю стабильную версию. Вы можете найти ее номер на странице GitHub https://github.com/ClickHouse/ClickHouse/tags с постфиксом `-stable`.

### Из Docker-образа {#from-docker-image}

Чтобы запустить ClickHouse внутри Docker, следуйте руководству на [Docker Hub](https://hub.docker.com/r/clickhouse/clickhouse-server/). Эти образы используют официальные `deb` пакеты внутри.

## Непроизводственные развертывания (Расширенные) {#non-production-deployments-advanced}

### Компиляция из исходных кодов {#from-sources}

Чтобы вручную скомпилировать ClickHouse, следуйте инструкциям для [Linux](/development/build.md) или [macOS](/development/build-osx.md).

Вы можете скомпилировать пакеты и установить их или использовать программы без установки пакетов.

```xml
Клиент: <build_directory>/programs/clickhouse-client
Сервер: <build_directory>/programs/clickhouse-server
```

Вам нужно будет вручную создать папки для данных и метаданных и выполнить `chown` для нужного пользователя. Их пути можно изменить в конфигурационном файле сервера (src/programs/server/config.xml), по умолчанию они:

```bash
/var/lib/clickhouse/data/default/
/var/lib/clickhouse/metadata/default/
```

На Gentoo вы можете просто использовать `emerge clickhouse`, чтобы установить ClickHouse из исходных кодов.

### Установка бинарного файла, сгенерированного CI {#install-a-ci-generated-binary}

Инфраструктура непрерывной интеграции (CI) ClickHouse производит специализированные сборки для каждой коммита в [репозитории ClickHouse](https://github.com/clickhouse/clickhouse/), например, [санитайзированные](https://github.com/google/sanitizers) сборки, не оптимизированные (Debug) сборки, кросс-компилированные сборки и др. Хотя такие сборки обычно полезны только в процессе разработки, в некоторых случаях они могут быть интересны и для пользователей.

:::note
Поскольку CI ClickHouse со временем развивается, точные шаги для загрузки сборок, сгенерированных CI, могут варьироваться.
Также CI может удалять слишком старые артефакты сборок, делая их недоступными для загрузки.
:::

Например, чтобы загрузить aarch64 бинарный файл для ClickHouse v23.4, следуйте этим шагам:

- Найдите запрос на слияние GitHub для релиза v23.4: [Запрос на слияние релиза для ветки 23.4](https://github.com/ClickHouse/ClickHouse/pull/49238)
- Нажмите "Commits", затем нажмите на коммит, похожий на "Обновить автоматически сгенерированную версию до 23.4.2.1 и участников", для конкретной версии, которую вы хотите установить.
- Нажмите на зеленую галочку / желтую точку / красный крестик, чтобы открыть список проверок CI.
- Нажмите "Подробности" рядом с "Сборками" в списке, это откроет страницу, аналогичную [этой странице](https://s3.amazonaws.com/clickhouse-test-reports/46793/b460eb70bf29b19eadd19a1f959b15d186705394/clickhouse_build_check/report.html)
- Найдите строки с компилятором = "clang-*-aarch64" - их несколько.
- Загрузите артефакты для этих сборок.

### Только для macOS: Установка с Homebrew {#macos-only-install-with-homebrew}

Чтобы установить ClickHouse на macOS с использованием [homebrew](https://brew.sh/), смотрите [формулу сообщества ClickHouse на homebrew](https://formulae.brew.sh/cask/clickhouse).

:::note
Для пользователей Mac: Если вы получаете ошибки о том, что разработчик бинарного файла не может быть проверен, пожалуйста, смотрите [здесь](/knowledgebase/fix-developer-verification-error-in-macos).
:::

## Запуск {#launch}

Чтобы запустить сервер как демона, выполните:

```bash
$ clickhouse start
```

Существуют и другие способы запустить ClickHouse:

```bash
$ sudo service clickhouse-server start
```

Если у вас нет команды `service`, запустите как

```bash
$ sudo /etc/init.d/clickhouse-server start
```

Если у вас есть команда `systemctl`, запустите как

```bash
$ sudo systemctl start clickhouse-server.service
```

Смотрите логи в директории `/var/log/clickhouse-server/`.

Если сервер не запускается, проверьте конфигурации в файле `/etc/clickhouse-server/config.xml`.

Вы также можете вручную запустить сервер из консоли:

```bash
$ clickhouse-server --config-file=/etc/clickhouse-server/config.xml
```

В этом случае лог будет напечатан в консоли, что удобно в процессе разработки.
Если конфигурационный файл находится в текущем каталоге, вам не нужно указывать параметр `--config-file`. По умолчанию используется `./config.xml`.

ClickHouse поддерживает настройки ограничения доступа. Они находятся в файле `users.xml` (рядом с `config.xml`).
По умолчанию доступ разрешен отовсюду для пользователя `default` без пароля. Смотрите `user/default/networks`.
Для получения дополнительной информации смотрите раздел ["Файлы конфигурации"](/operations/configuration-files.md).

После запуска сервера вы можете использовать клиент командной строки для подключения к нему:

```bash
$ clickhouse-client
```

По умолчанию он подключается к `localhost:9000` от имени пользователя `default` без пароля. Также может быть использован для подключения к удаленному серверу с использованием аргумента `--host`.

Терминал должен использовать кодировку UTF-8.
Для дополнительной информации смотрите раздел ["Клиент командной строки"](/interfaces/cli.md).

Пример:

```bash
$ ./clickhouse-client
ClickHouse client version 0.0.18749.
Connecting to localhost:9000.
Connected to ClickHouse server version 0.0.18749.

:) SELECT 1

SELECT 1

┌─1─┐
│ 1 │
└───┘

1 rows in set. Elapsed: 0.003 sec.

:)
```

**Поздравляю, система работает!**

Чтобы продолжить экспериментировать, вы можете скачать один из тестовых наборов данных или пройти через [учебник](/tutorial.md).

## Рекомендации для самоуправляемого ClickHouse {#recommendations-for-self-managed-clickhouse}

ClickHouse может работать на любых системах Linux, FreeBSD или macOS с архитектурой процессора x86-64, ARM или PowerPC64LE.

ClickHouse использует все аппаратные ресурсы для обработки данных.

ClickHouse, как правило, работает более эффективно с большим количеством ядер на более низкой тактовой частоте, чем с меньшим количеством ядер на более высокой тактовой частоте.

Рекомендуем использовать минимум 4 ГБ оперативной памяти для выполнения нетривиальных запросов. Сервер ClickHouse может работать с гораздо меньшим объемом оперативной памяти, но запросы тогда будут часто прерываться.

Необходимый объем RAM в общем зависит от:

- Сложности запросов.
- Объема данных, которые обрабатываются в запросах.

Чтобы рассчитать необходимый объем RAM, вы можете оценить размер временных данных для [GROUP BY](/sql-reference/statements/select/group-by), [DISTINCT](/sql-reference/statements/select/distinct), [JOIN](/sql-reference/statements/select/join) и других операций, которые вы используете.

Чтобы снизить потребление памяти, ClickHouse может обменивать временные данные на внешнее хранилище. Смотрите [GROUP BY в внешней памяти](/sql-reference/statements/select/group-by#group-by-in-external-memory) для подробностей.

Рекомендуем отключить файл подкачки операционной системы в производственных средах.

Бинарный файл ClickHouse требует как минимум 2.5 ГБ дискового пространства для установки.

Объем хранилища, необходимый для ваших данных, может быть рассчитан отдельно на основе

- оценки объема данных.

    Вы можете выполнить выборку данных и получить средний размер строки из нее. Затем умножьте значение на количество строк, которые вы планируете хранить.

- Коэффициента сжатия данных.

    Чтобы оценить коэффициент сжатия данных, загрузите выборку ваших данных в ClickHouse и сравните фактический размер данных с размером хранимой таблицы. Например, данные о потоках кликов обычно сжимаются в 6-10 раз.

Чтобы рассчитать конечный объем данных для хранения, примените коэффициент сжатия к оцененному объему данных. Если вы планируете хранить данные в нескольких репликах, то умножьте оцененный объем на количество реплик.

Для распределенных развертываний ClickHouse (кластеризация) мы рекомендуем подключение сети класса не менее 10 Гбит.

Пропускная способность сети критически важна для обработки распределенных запросов с большим количеством промежуточных данных. Кроме того, скорость сети влияет на процессы репликации.
