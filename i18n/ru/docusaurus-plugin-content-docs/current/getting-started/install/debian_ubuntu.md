---
slug: '/install/debian_ubuntu'
sidebar_label: Debian/Ubuntu
description: 'Установить ClickHouse на Debian/Ubuntu Linux'
title: 'Установите ClickHouse на Debian/Ubuntu'
keywords: ['ClickHouse', 'установка', 'Debian', 'Ubuntu', 'deb']
doc_type: guide
hide_title: true
---
import DebianProd from './_snippets/_deb_install.md'

## Установка ClickHouse на Debian

### Шаг 1: Добавление репозитория

Для установки ClickHouse вам нужно добавить официальный репозиторий:

```bash
sudo apt-get install apt-transport-https
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv E0C56BD4
echo "deb https://repo.clickhouse.tech/deb/stable/ main/" | sudo tee /etc/apt/sources.list.d/clickhouse.list

### Шаг 2: Установка ClickHouse

После добавления репозитория, обновите список пакетов и установите ClickHouse:

```bash
sudo apt-get update
sudo apt-get install clickhouse-server clickhouse-client

### Шаг 3: Настройка ClickHouse

Перед запуском сервера, вы можете внести конфигурационные изменения в файл `/etc/clickhouse-server/config.xml`. Например, вы можете изменить параметры хранилища данных и настроить сетевые порты.

### Шаг 4: Запуск сервера

Для запуска ClickHouse сервера используйте следующую команду:

```bash
sudo service clickhouse-server start

### Шаг 5: Подключение к ClickHouse

После того, как сервер будет запущен, вы можете подключиться к нему с помощью клиента:

```bash
clickhouse-client

Теперь вы готовы выполнять запросы к ClickHouse и настраивать его под свои нужды.