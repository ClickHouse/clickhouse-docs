import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Установка ClickHouse на Debian/Ubuntu \\{#install-from-deb-packages\\}

> Рекомендуется использовать официальные предкомпилированные пакеты `deb` для **Debian** или **Ubuntu**.

<VerticalStepper>

## Настройка репозитория Debian \\{#setup-the-debian-repository\\}

Чтобы установить ClickHouse, выполните следующие команды:

```bash
# Install prerequisite packages
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg

# Download the ClickHouse GPG key and store it in the keyring
curl -fsSL 'https://packages.clickhouse.com/rpm/lts/repodata/repomd.xml.key' | sudo gpg --dearmor -o /usr/share/keyrings/clickhouse-keyring.gpg

# Get the system architecture
ARCH=$(dpkg --print-architecture)

# Add the ClickHouse repository to apt sources
echo "deb [signed-by=/usr/share/keyrings/clickhouse-keyring.gpg arch=${ARCH}] https://packages.clickhouse.com/deb stable main" | sudo tee /etc/apt/sources.list.d/clickhouse.list

# Update apt package lists
sudo apt-get update
```

- Вы можете заменить `stable` на `lts`, чтобы использовать различные [типы релизов](/knowledgebase/production) в зависимости от ваших потребностей.
- Вы можете скачать и установить пакеты вручную с [packages.clickhouse.com](https://packages.clickhouse.com/deb/pool/main/c/).
<br/>
<details>
<summary>Устаревший метод установки deb-пакетов для дистрибутивов</summary>

```bash
# Install prerequisite packages
sudo apt-get install apt-transport-https ca-certificates dirmngr

# Add the ClickHouse GPG key to authenticate packages
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 8919F6BD2B48D754

# Add the ClickHouse repository to apt sources
echo "deb https://packages.clickhouse.com/deb stable main" | sudo tee \
    /etc/apt/sources.list.d/clickhouse.list

    
# Update apt package lists
sudo apt-get update

# Install ClickHouse server and client packages
sudo apt-get install -y clickhouse-server clickhouse-client

# Start the ClickHouse server service
sudo service clickhouse-server start

# Launch the ClickHouse command line client
clickhouse-client # or "clickhouse-client --password" if you set up a password.
```

</details>

## Установка сервера и клиента ClickHouse \\{#install-clickhouse-server-and-client\\}

```bash
sudo apt-get install -y clickhouse-server clickhouse-client
```

## Запуск ClickHouse \\{#start-clickhouse-server\\}

Чтобы запустить сервер ClickHouse, выполните следующую команду:

```bash
sudo service clickhouse-server start
```

Чтобы запустить клиент ClickHouse, выполните:

```bash
clickhouse-client
```

Если вы задали пароль для своего сервера, вам потребуется выполнить:

```bash
clickhouse-client --password
```

## Установка автономного ClickHouse Keeper \\{#install-standalone-clickhouse-keeper\\}

:::tip
В производственных средах настоятельно рекомендуется запускать ClickHouse Keeper на выделенных узлах.
В тестовых средах, если вы решите запускать ClickHouse Server и ClickHouse Keeper на одном сервере,
то вам не нужно отдельно устанавливать ClickHouse Keeper, так как он включён в ClickHouse Server.
:::

Чтобы установить `clickhouse-keeper` на автономные серверы ClickHouse Keeper, выполните:

```bash
sudo apt-get install -y clickhouse-keeper
```

## Включение и запуск ClickHouse Keeper \\{#enable-and-start-clickhouse-keeper\\}

```bash
sudo systemctl enable clickhouse-keeper
sudo systemctl start clickhouse-keeper
sudo systemctl status clickhouse-keeper
```

</VerticalStepper>

## Пакеты \\{#packages\\}

Доступные deb-пакеты описаны ниже:

| Package                        | Description                                                                                                                                                                                                                                                                            |
|--------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `clickhouse-common-static`     | Устанавливает скомпилированные бинарные файлы ClickHouse.                                                                                                                                                                                                                             |
| `clickhouse-server`            | Создает символическую ссылку для `clickhouse-server` и устанавливает конфигурацию сервера по умолчанию.                                                                                                                                                                               |
| `clickhouse-client`            | Создает символическую ссылку для `clickhouse-client` и другие клиентские утилиты, а также устанавливает файлы конфигурации клиента.                                                                                                                                                   |
| `clickhouse-common-static-dbg` | Устанавливает скомпилированные бинарные файлы ClickHouse с отладочной информацией.                                                                                                                                                                                                    |
| `clickhouse-keeper`            | Используется для установки ClickHouse Keeper на выделенные узлы ClickHouse Keeper. Если вы запускаете ClickHouse Keeper на том же сервере, что и сервер ClickHouse, устанавливать этот пакет не нужно. Устанавливает ClickHouse Keeper и конфигурационные файлы ClickHouse Keeper по умолчанию. |

<br/>
:::info
Если вам нужно установить определенную версию ClickHouse, необходимо установить все пакеты одной и той же версии:
`sudo apt-get install clickhouse-server=21.8.5.7 clickhouse-client=21.8.5.7 clickhouse-common-static=21.8.5.7`
:::
