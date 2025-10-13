---
slug: '/install/macOS'
sidebar_label: MacOS
description: 'Установить ClickHouse на MacOS'
title: 'Установка ClickHouse с использованием Homebrew'
keywords: ['ClickHouse', 'установка', 'MacOS']
doc_type: guide
hide_title: true
---
import MacOSProd from './_snippets/_macos.md'

# Установка ClickHouse на macOS

Есть несколько вариантов установки ClickHouse на macOS:

- Использовать **Docker**
- Скомпилировать ClickHouse из исходников
- Установить через **Homebrew**

## Установка через Homebrew

1. Убедитесь, что у вас установлен Homebrew. Если нет, то установите его, выполнив следующую команду в терминале:

   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

2. Затем выполните следующую команду для установки ClickHouse:

   ```bash
   brew install clickhouse

3. После завершения установки, запустите ClickHouse сервер:

   ```bash
   brew services start clickhouse

4. Чтобы подключиться к серверу, используйте клиент:

   ```bash
   clickhouse-client

Теперь вы можете выполнять запросы к вашему серверу ClickHouse!

## Установка через Docker

Если у вас установлен Docker, можно установить ClickHouse легко с помощью следующей команды:

```bash
docker run -d --name clickhouse-server -p 8123:8123 -p 9000:9000 yandex/clickhouse-server

## Сборка из исходников

Для сборки ClickHouse из исходников, выполните следующие шаги:

1. Установите необходимые зависимости:

   ```bash
   brew install cmake ninja

2. Клонируйте репозиторий ClickHouse:

   ```bash
   git clone --recursive https://github.com/ClickHouse/ClickHouse.git
   cd ClickHouse

3. Постройте проект:

   ```bash
   mkdir build
   cd build
   cmake .. -G Ninja
   ninja clickhouse

После завершения сборки вы можете использовать ClickHouse, запустив сервер и клиент.

## Проверка установки

Чтобы проверить, что ClickHouse установлен правильно, выполните следующее:

```bash
clickhouse-client --version

При успешной установке вы увидите версию ClickHouse.