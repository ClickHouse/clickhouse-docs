---
sidebar_label: Установка
keywords: [clickhouse, установка, начало работы, быстрый старт]
description: Установка ClickHouse
slug: /install
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# Установка ClickHouse

У вас есть четыре варианта, чтобы начать работу с ClickHouse:

- **[ClickHouse Cloud](https://clickhouse.com/cloud/):** Официальный ClickHouse как услуга, разработанный, поддерживаемый и обслуживаемый создателями ClickHouse
- **[Быстрая установка](#quick-install):** легкий для загрузки бинарный файл для тестирования и разработки с ClickHouse
- **[Производственные развертывания](#available-installation-options):** ClickHouse может работать на любом Linux, FreeBSD или macOS с архитектурой процессора x86-64, современным ARM (ARMv8.2-A и выше) или PowerPC64LE
- **[Docker Image](https://hub.docker.com/_/clickhouse):** используйте официальный Docker образ на Docker Hub

## ClickHouse Cloud {#clickhouse-cloud}

Самый быстрый и простой способ начать работу с ClickHouse - создать новую службу в [ClickHouse Cloud](https://clickhouse.cloud/).

## Быстрая установка {#quick-install}

:::tip
Для производственных установок конкретной версии смотрите [варианты установки](#available-installation-options) ниже.
:::

На Linux, macOS и FreeBSD:

1. Если вы только начинаете и хотите увидеть, на что способен ClickHouse, самый простой способ загрузить его локально - запустить следующую команду. Это загрузит один бинарный файл для вашей операционной системы, который можно использовать для запуска сервера ClickHouse, `clickhouse-client`, `clickhouse-local`, ClickHouse Keeper и других инструментов:

   ```bash
   curl https://clickhouse.com/ | sh
   ```

   :::note
   Для пользователей Mac: Если вы получаете ошибки, что разработчик бинарного файла не может быть подтвержден, пожалуйста, смотрите [здесь](/knowledgebase/fix-developer-verification-error-in-macos).
   :::

2. Запустите следующую команду для старта [clickhouse-local](../operations/utilities/clickhouse-local.md):

   ```bash
   ./clickhouse
   ```

   `clickhouse-local` позволяет обрабатывать локальные и удаленные файлы с помощью мощного SQL ClickHouse и без необходимости конфигурации. Данные таблицы хранятся во временном месте, что означает, что после перезапуска `clickhouse-local` ранее созданные таблицы больше не доступны.

   В качестве альтернативы вы можете запустить сервер ClickHouse с помощью этой команды...

   ```bash
   ./clickhouse server
   ```

   ... и открыть новый терминал, чтобы подключиться к серверу с `clickhouse-client`:

   ```bash
   ./clickhouse client
   ```

    ```response
    ./clickhouse client
    ClickHouse client version 24.5.1.117 (официальная сборка).
    Подключение к localhost:9000 как пользователь default.
    Подключено к серверу ClickHouse версии 24.5.1.

    local-host :)
    ```

   Данные таблицы хранятся в текущем каталоге и по-прежнему доступны после перезапуска сервера ClickHouse. Если необходимо, вы можете передать `-C config.xml` в качестве дополнительного аргумента командной строки к `./clickhouse server` и предоставить дальнейшую конфигурацию в конфигурационном файле. Все доступные параметры конфигурации документированы [здесь](../operations/settings/settings.md) и в [шаблоне примерного конфигурационного файла](https://github.com/ClickHouse/ClickHouse/blob/master/programs/server/config.xml).

   Вы готовы начать отправлять SQL запросы в ClickHouse!

:::tip
[Быстрый старт](/quick-start.mdx) описывает шаги для создания таблиц и вставки данных.
:::

## Производственные развертывания {#available-installation-options}

Для производственных развертываний ClickHouse выберите один из следующих вариантов установки.

### Из DEB пакетов {#install-from-deb-packages}

Рекомендуется использовать официальные предварительно собранные `deb` пакеты для Debian или Ubuntu. Запустите эти команды для установки пакетов:

#### Настройка репозитория Debian {#setup-the-debian-repository}
``` bash
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
clickhouse-client # или "clickhouse-client --password", если вы установили пароль.
```

<details>
<summary>Метод старых дистрибутивов для установки deb-пакетов</summary>

```bash
sudo apt-get install apt-transport-https ca-certificates dirmngr
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 8919F6BD2B48D754
echo "deb https://packages.clickhouse.com/deb stable main" | sudo tee \
    /etc/apt/sources.list.d/clickhouse.list
sudo apt-get update

sudo apt-get install -y clickhouse-server clickhouse-client

sudo service clickhouse-server start
clickhouse-client # или "clickhouse-client --password", если вы установили пароль.
```

</details>

Вы можете заменить `stable` на `lts`, чтобы использовать разные [типы релиза](/knowledgebase/production) в зависимости от ваших нужд.

Вы также можете вручную загрузить и установить пакеты [отсюда](https://packages.clickhouse.com/deb/pool/main/c/).

#### Установка независимого ClickHouse Keeper {#install-standalone-clickhouse-keeper}

:::tip
В производственной среде мы настоятельно рекомендуем запускать ClickHouse Keeper на выделенных узлах.
В тестовых средах, если вы решите запустить ClickHouse Server и ClickHouse Keeper на одном сервере, вам не нужно устанавливать ClickHouse Keeper, так как он включен в сервер ClickHouse.
Эта команда нужна только на независимых серверах ClickHouse Keeper.
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
- `clickhouse-client` — Создает символическую ссылку для `clickhouse-client` и других инструментов, связанных с клиентом, а также устанавливает конфигурационные файлы клиента.
- `clickhouse-common-static-dbg` — Устанавливает скомпилированные бинарные файлы ClickHouse с отладочной информацией.
- `clickhouse-keeper` - Используется для установки ClickHouse Keeper на выделенные узлы ClickHouse Keeper. Если вы запускаете ClickHouse Keeper на том же сервере, что и сервер ClickHouse, то устанавливать этот пакет не нужно. Устанавливает ClickHouse Keeper и файлы конфигурации по умолчанию.

:::info
Если вам необходимо установить определенную версию ClickHouse, вам нужно установить все пакеты одной версии:
`sudo apt-get install clickhouse-server=21.8.5.7 clickhouse-client=21.8.5.7 clickhouse-common-static=21.8.5.7`
:::

### Из RPM пакетов {#from-rpm-packages}

Рекомендуется использовать официальные предварительно собранные `rpm` пакеты для CentOS, RedHat и всех других дистрибутивов Linux на базе rpm.

#### Настройка RPM репозитория {#setup-the-rpm-repository}
Сначала вам нужно добавить официальный репозиторий:

``` bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://packages.clickhouse.com/rpm/clickhouse.repo
```

Для систем с менеджером пакетов `zypper` (openSUSE, SLES):

``` bash
sudo zypper addrepo -r https://packages.clickhouse.com/rpm/clickhouse.repo -g
sudo zypper --gpg-auto-import-keys refresh clickhouse-stable
```

В дальнейшем любые команды `yum install` могут быть заменены на `zypper install`. Для указания конкретной версии добавьте `-$VERSION` в конце имени пакета, например `clickhouse-client-22.2.2.22`.

#### Установка сервера и клиента ClickHouse {#install-clickhouse-server-and-client-1}

```bash
sudo yum install -y clickhouse-server clickhouse-client
```

#### Запуск сервера ClickHouse {#start-clickhouse-server-1}

```bash
sudo systemctl enable clickhouse-server
sudo systemctl start clickhouse-server
sudo systemctl status clickhouse-server
clickhouse-client # или "clickhouse-client --password", если вы установили пароль.
```

#### Установка независимого ClickHouse Keeper {#install-standalone-clickhouse-keeper-1}

:::tip
В производственной среде мы настоятельно рекомендуем запускать ClickHouse Keeper на выделенных узлах.
В тестовых средах, если вы решите запустить ClickHouse Server и ClickHouse Keeper на одном сервере, вам не нужно устанавливать ClickHouse Keeper, так как он включен в сервер ClickHouse.
Эта команда нужна только на независимых серверах ClickHouse Keeper.
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

Вы можете заменить `stable` на `lts`, чтобы использовать разные [типы релиза](/knowledgebase/production) в зависимости от ваших нужд.

Затем выполните следующие команды для установки пакетов:

``` bash
sudo yum install clickhouse-server clickhouse-client
```

Вы также можете вручную загрузить и установить пакеты от [сюда](https://packages.clickhouse.com/rpm/stable).

### Из Tgz архивов {#from-tgz-archives}

Рекомендуется использовать официальные предварительно собранные `tgz` архивы для всех дистрибутивов Linux, где невозможно установить `deb` или `rpm` пакеты.

Необходимую версию можно загрузить с помощью `curl` или `wget` из репозитория https://packages.clickhouse.com/tgz/.
После этого загруженные архивы следует распаковать и установить с помощью установочных скриптов. Пример для последней стабильной версии:

``` bash
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

Для производственных сред рекомендуется использовать последнюю `stable` версию. Вы можете найти ее номер на странице GitHub https://github.com/ClickHouse/ClickHouse/tags с постфиксом `-stable`.

### Из Docker Image {#from-docker-image}

Для запуска ClickHouse в Docker следуйте руководству на [Docker Hub](https://hub.docker.com/r/clickhouse/clickhouse-server/). Эти образы используют официальные `deb` пакеты внутри.

## Непроизводственные развертывания (расширенный режим) {#non-production-deployments-advanced}

### Компиляция из исходников {#from-sources}

Чтобы вручную скомпилировать ClickHouse, следуйте инструкциям для [Linux](/development/build.md) или [macOS](/development/build-osx.md).

Вы можете компилировать пакеты и устанавливать их, или использовать программы без установки пакетов.

```xml
Клиент: <build_directory>/programs/clickhouse-client
Сервер: <build_directory>/programs/clickhouse-server
```

Вам необходимо будет вручную создать каталоги данных и метаданных и поменять их владельца на нужного пользователя. Их пути можно изменить в конфигурации сервера (src/programs/server/config.xml), по умолчанию они следующие:

```bash
/var/lib/clickhouse/data/default/
/var/lib/clickhouse/metadata/default/
```

На Gentoo вы можете просто использовать `emerge clickhouse` для установки ClickHouse из исходников.

### Установка бинарного файла, сгенерированного CI {#install-a-ci-generated-binary}

Инфраструктура непрерывной интеграции (CI) ClickHouse производит специализированные сборки для каждого коммита в [репозитории ClickHouse](https://github.com/clickhouse/clickhouse/), например, [санитизированные](https://github.com/google/sanitizers) сборки, неоптимизированные (Debug) сборки и т.д. Хотя такие сборки обычно полезны только в процессе разработки, в определённых ситуациях они также могут быть интересны пользователям.

:::note
Поскольку CI ClickHouse со временем развивается, точные шаги для загрузки сборок, сгенерированных CI, могут меняться.
Также, CI может удалить слишком старые артефакты сборки, делая их недоступными для загрузки.
:::

Например, чтобы загрузить aarch64 бинарный файл для ClickHouse v23.4, выполните следующие шаги:

- Найдите запрос на вытягивание GitHub для релиза v23.4: [Запрос на вытягивание для ветки 23.4](https://github.com/ClickHouse/ClickHouse/pull/49238)
- Нажмите "Commits", затем нажмите на коммит, похожий на "Обновить сгенерированную версию до 23.4.2.1 и участников" для версии, которую вы хотите установить.
- Нажмите зеленую галочку / желтую точку / красный крест, чтобы открыть список проверок CI.
- Нажмите "Детали" рядом с "Сборками" в списке, это откроет страницу, подобную [этой странице](https://s3.amazonaws.com/clickhouse-test-reports/46793/b460eb70bf29b19eadd19a1f959b15d186705394/clickhouse_build_check/report.html)
- Найдите строки с компилятором = "clang-*-aarch64" - их несколько.
- Загрузите артефакты для этих сборок.

### Только для macOS: Установка с Homebrew {#macos-only-install-with-homebrew}

Чтобы установить ClickHouse на macOS с помощью [homebrew](https://brew.sh/), смотрите формулу [сообщества homebrew ClickHouse](https://formulae.brew.sh/cask/clickhouse).

:::note
Для пользователей Mac: Если вы получаете ошибки, что разработчик бинарного файла не может быть подтвержден, пожалуйста, смотрите [здесь](/knowledgebase/fix-developer-verification-error-in-macos).
:::

## Запуск {#launch}

Чтобы запустить сервер как демон, выполните:

``` bash
$ clickhouse start
```

Существует также другие способы запуска ClickHouse:

``` bash
$ sudo service clickhouse-server start
```

Если у вас нет команды `service`, выполните как

``` bash
$ sudo /etc/init.d/clickhouse-server start
```

Если у вас есть команда `systemctl`, выполните как

``` bash
$ sudo systemctl start clickhouse-server.service
```

Смотрите логи в каталоге `/var/log/clickhouse-server/`.

Если сервер не запускается, проверьте конфигурации в файле `/etc/clickhouse-server/config.xml`.

Вы также можете вручную запустить сервер из консоли:

``` bash
$ clickhouse-server --config-file=/etc/clickhouse-server/config.xml
```

В этом случае лог будет напечатан в консоли, что удобно во время разработки.
Если конфигурационный файл находится в текущем каталоге, вам не нужно указывать параметр `--config-file`. По умолчанию используется `./config.xml`.

ClickHouse поддерживает настройки ограничения доступа. Они находятся в файле `users.xml` (рядом с `config.xml`).
По умолчанию доступ разрешен отовсюду для пользователя `default`, без пароля. Смотрите `user/default/networks`.
Для получения дополнительной информации смотрите раздел ["Файлы конфигурации"](/operations/configuration-files.md).

После запуска сервера вы можете использовать клиент командной строки для подключения к нему:

``` bash
$ clickhouse-client
```

По умолчанию он подключается к `localhost:9000` от имени пользователя `default` без пароля. Его также можно использовать для подключения к удаленному серверу с помощью аргумента `--host`.

Терминал должен использовать кодировку UTF-8.
Для получения дополнительной информации смотрите раздел ["Клиент командной строки"](/interfaces/cli.md).

Пример:

```bash
$ ./clickhouse-client
Клиент ClickHouse версия 0.0.18749.
Подключение к localhost:9000.
Подключено к серверу ClickHouse версии 0.0.18749.

:) SELECT 1

SELECT 1

┌─1─┐
│ 1 │
└───┘

1 строк в результате. Время: 0.003 сек.

:)
```

**Поздравляем, система работает!**

Чтобы продолжить эксперименты, вы можете скачать один из тестовых наборов данных или пройти [учебник](/tutorial.md).

## Рекомендации для самостоятельного управления ClickHouse {#recommendations-for-self-managed-clickhouse}

ClickHouse может работать на любом Linux, FreeBSD или macOS с архитектурой процессора x86-64, ARM или PowerPC64LE.

ClickHouse использует все доступные аппаратные ресурсы для обработки данных.

ClickHouse, как правило, работает более эффективно с большим количеством ядер на более низкой тактовой частоте, чем с меньшим количеством ядер на более высокой тактовой частоте.

Мы рекомендуем использовать минимум 4 ГБ ОЗУ для выполнения нетривиальных запросов. Сервер ClickHouse может работать с гораздо меньшим объемом ОЗУ, но в этом случае запросы будут часто отменяться.

Необходимый объем оперативной памяти в целом зависит от:

- Сложности запросов.
- Объема данных, обрабатываемых в запросах.

Чтобы рассчитать необходимый объем ОЗУ, вы можете оценить размер временных данных для [GROUP BY](/sql-reference/statements/select/group-by), [DISTINCT](/sql-reference/statements/select/distinct), [JOIN](/sql-reference/statements/select/join) и других операций, которые вы используете.

Чтобы уменьшить потребление памяти, ClickHouse может перемещать временные данные на внешнее хранилище. Смотрите [GROUP BY в внешней памяти](/sql-reference/statements/select/group-by#group-by-in-external-memory) для получения подробной информации.

Рекомендуем отключить файл подкачки операционной системы в производственных средах.

Бинарный файл ClickHouse требует как минимум 2.5 ГБ дискового пространства для установки.

Объем хранилища, необходимый для ваших данных, может быть рассчитан отдельно на основе

- оценки объема данных.

    Вы можете взять выборку данных и получить средний размер строки из нее. Затем умножьте значение на количество строк, которые вы планируете хранить.

- коэффициента сжатия данных.

    Чтобы оценить коэффициент сжатия данных, загрузите выборку ваших данных в ClickHouse и сравните реальный размер данных с размером хранимой таблицы. Например, данные потоков кликов обычно сжимаются в 6-10 раз.

Чтобы рассчитать окончательный объем данных, которые будут храниться, примените коэффициент сжатия к оцененному объему данных. Если вы планируете хранить данные в нескольких репликах, умножьте оценочный объем на количество реплик.

Для распределенных развертываний ClickHouse (кластеризация) мы рекомендуем как минимум сетевое соединение класса 10G.

Пропускная способность сети имеет критическое значение для обработки распределенных запросов с большим объемом промежуточных данных. Кроме того, скорость сети влияет на процессы репликации.
