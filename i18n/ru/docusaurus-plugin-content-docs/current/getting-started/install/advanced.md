---
description: 'Инструкции по компиляции ClickHouse из исходников или установке бинарного файла, сгенерированного CI'
keywords: ['ClickHouse', 'установка', 'дополнительно', 'компиляция из исходников', 'бинарный файл CI']
sidebar_label: 'Расширенная установка'
slug: /install/advanced
title: 'Методы расширенной установки'
hide_title: false
---

## Компиляция из исходников {#compile-from-source}

Чтобы вручную скомпилировать ClickHouse, следуйте инструкциям для [Linux](/development/build.md) или [macOS](/development/build-osx.md).

Вы можете компилировать пакеты и устанавливать их или использовать программы без установки пакетов.

```xml
Клиент: <build_directory>/programs/clickhouse-client
Сервер: <build_directory>/programs/clickhouse-server
```

Вам нужно будет вручную создать папки данных и метаданных и `chown` их для нужного пользователя. Их пути можно изменить в конфигурации сервера (src/programs/server/config.xml), по умолчанию они следующие:

```bash
/var/lib/clickhouse/data/default/
/var/lib/clickhouse/metadata/default/
```

На Gentoo вы можете просто использовать `emerge clickhouse`, чтобы установить ClickHouse из исходников.

## Установка бинарного файла, сгенерированного CI {#install-a-ci-generated-binary}

Инфраструктура непрерывной интеграции (CI) ClickHouse производит специализированные сборки для каждого коммита в [репозитории ClickHouse](https://github.com/clickhouse/clickhouse/), например, [санитаризированные](https://github.com/google/sanitizers) сборки, не оптимизированные (Debug) сборки, кросс-компилированные сборки и т.д. Хотя такие сборки обычно полезны только во время разработки, они могут в определенных ситуациях также быть интересны пользователям.

:::note
Поскольку CI ClickHouse развивается со временем, точные шаги для загрузки сборок, сгенерированных CI, могут варьироваться.
Также CI может удалить слишком старые артефакты сборки, делая их недоступными для загрузки.
:::

Например, чтобы загрузить бинарный файл aarch64 для ClickHouse v23.4, выполните следующие шаги:

- Найдите запрос на слияние GitHub для релиза v23.4: [Запрос на слияние для релиза ветки 23.4](https://github.com/ClickHouse/ClickHouse/pull/49238)
- Нажмите "Commits", затем нажмите на коммит, похожий на "Обновить автогенерируемую версию до 23.4.2.1 и контрибьюторов" для нужной версии, которую вы хотите установить.
- Нажмите зеленую галочку / желтую точку / красный крестик, чтобы открыть список проверок CI.
- Нажмите "Details" рядом с "Builds" в списке, это откроет страницу, аналогичную [этой странице](https://s3.amazonaws.com/clickhouse-test-reports/46793/b460eb70bf29b19eadd19a1f959b15d186705394/clickhouse_build_check/report.html)
- Найдите строки с компилятором = "clang-*-aarch64" - таких строк несколько.
- Загрузите артефакты для этих сборок.
