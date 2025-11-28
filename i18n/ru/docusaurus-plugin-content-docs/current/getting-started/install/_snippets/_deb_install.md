import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Установка ClickHouse на Debian/Ubuntu {#install-from-deb-packages}

> Рекомендуется использовать официальные предварительно скомпилированные `deb` пакеты для **Debian** или **Ubuntu**.

<VerticalStepper>

## Настройка репозитория Debian {#setup-the-debian-repository}

Для установки ClickHouse выполните следующие команды:
```bash
# Установка необходимых пакетов
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg

# Загрузка GPG ключа ClickHouse и сохранение его в связке ключей
curl -fsSL 'https://packages.clickhouse.com/rpm/lts/repodata/repomd.xml.key' | sudo gpg --dearmor -o /usr/share/keyrings/clickhouse-keyring.gpg

# Получение архитектуры системы
ARCH=$(dpkg --print-architecture)

# Добавление репозитория ClickHouse в источники apt
echo "deb [signed-by=/usr/share/keyrings/clickhouse-keyring.gpg arch=${ARCH}] https://packages.clickhouse.com/deb stable main" | sudo tee /etc/apt/sources.list.d/clickhouse.list

# Обновление списков пакетов apt
sudo apt-get update
```

- Вы можете заменить `stable` на `lts` для использования различных [типов релизов](/knowledgebase/production) в зависимости от ваших потребностей.
- Вы можете загрузить и установить пакеты вручную с [packages.clickhouse.com](https://packages.clickhouse.com/deb/pool/main/c/).
  <br/>
<details>
<summary>Старый метод для установки deb-пакетов для устаревших дистрибутивов</summary>
```bash
# Установка необходимых пакетов
sudo apt-get install apt-transport-https ca-certificates dirmngr

# Добавление GPG ключа ClickHouse для аутентификации пакетов
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 8919F6BD2B48D754

# Добавление репозитория ClickHouse в источники apt
echo "deb https://packages.clickhouse.com/deb stable main" | sudo tee \
/etc/apt/sources.list.d/clickhouse.list

# Обновление списков пакетов apt
sudo apt-get update

# Установка пакетов сервера и клиента ClickHouse
sudo apt-get install -y clickhouse-server clickhouse-client

# Запуск службы сервера ClickHouse
sudo service clickhouse-server start

# Запуск клиента командной строки ClickHouse
clickhouse-client # или "clickhouse-client --password", если вы установили пароль.
```

</details>

## Установка сервера и клиента ClickHouse {#install-clickhouse-server-and-client}
```bash
sudo apt-get install -y clickhouse-server clickhouse-client
```

## Запуск ClickHouse {#start-clickhouse-server}

Для запуска сервера ClickHouse выполните:
```bash
sudo service clickhouse-server start
```

Для запуска клиента ClickHouse выполните:
```bash
clickhouse-client
```

Если вы установили пароль для вашего сервера, то вам нужно будет выполнить:
```bash
clickhouse-client --password
```

## Установка автономного ClickHouse Keeper {#install-standalone-clickhouse-keeper}

:::tip
В производственных средах мы настоятельно рекомендуем запускать ClickHouse Keeper на выделенных узлах.
В тестовых средах, если вы решите запускать ClickHouse Server и ClickHouse Keeper на одном сервере,
то вам не нужно устанавливать ClickHouse Keeper, так как он включен в ClickHouse server.
:::

Для установки `clickhouse-keeper` на автономных серверах ClickHouse Keeper выполните:
```bash
sudo apt-get install -y clickhouse-keeper
```

## Включение и запуск ClickHouse Keeper {#enable-and-start-clickhouse-keeper}
```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

</VerticalStepper>

## Пакеты {#packages}

Ниже подробно описаны различные доступные deb пакеты:

| Пакет                          | Описание                                                                                                                                                                                                                                                                                 |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `clickhouse-common-static`     | Устанавливает скомпилированные бинарные файлы ClickHouse.                                                                                                                                                                                                                                |
| `clickhouse-server`            | Создает символическую ссылку для `clickhouse-server` и устанавливает конфигурацию сервера по умолчанию.                                                                                                                                                                                  |
| `clickhouse-client`            | Создает символическую ссылку для `clickhouse-client` и других инструментов, связанных с клиентом, и устанавливает файлы конфигурации клиента.                                                                                                                                            |
| `clickhouse-common-static-dbg` | Устанавливает скомпилированные бинарные файлы ClickHouse с отладочной информацией.                                                                                                                                                                                                       |
| `clickhouse-keeper`            | Используется для установки ClickHouse Keeper на выделенных узлах ClickHouse Keeper. Если вы запускаете ClickHouse Keeper на том же сервере, что и сервер ClickHouse, то вам не нужно устанавливать этот пакет. Устанавливает ClickHouse Keeper и файлы конфигурации ClickHouse Keeper по умолчанию. |

<br/>
:::info
Если вам нужно установить конкретную версию ClickHouse, вы должны установить все пакеты одной и той же версии:
`sudo apt-get install clickhouse-server=21.8.5.7 clickhouse-client=21.8.5.7 clickhouse-common-static=21.8.5.7`
:::