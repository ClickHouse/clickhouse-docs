# Установка ClickHouse на NixOS \{#install-from-nix\}

> ClickHouse доступен в репозитории Nixpkgs и может быть установлен с помощью Nix в **Linux** и **macOS**.

<VerticalStepper>

## Установка ClickHouse с помощью Nix \{#install-clickhouse-using-nix\}

Вы можете использовать Nix, чтобы установить ClickHouse, не добавляя его в систему на постоянной основе:

```bash
# Установить последнюю стабильную версию
nix shell nixpkgs#clickhouse

# Или установить LTS-версию
nix shell nixpkgs#clickhouse-lts
```

После этого исполняемый файл `clickhouse` будет доступен в текущей сессии оболочки.

- Пакет `nixpkgs#clickhouse` предоставляет последнюю стабильную версию.
- Пакет `nixpkgs#clickhouse-lts` предоставляет версию с долгосрочной поддержкой (Long Term Support).
- Оба пакета работают в Linux и macOS.

## Постоянная установка \{#permanent-installation\}

Чтобы установить ClickHouse в систему на постоянной основе:

**Для пользователей NixOS** добавьте в `configuration.nix`:

```nix
environment.systemPackages = with pkgs; [
  clickhouse
];
```

Затем пересоберите систему:

```bash
sudo nixos-rebuild switch
```

**Для пользователей, не использующих NixOS**, установите с помощью профиля Nix:

```bash
# Установить последнюю стабильную версию
nix profile install nixpkgs#clickhouse

# Или установить LTS-версию
nix profile install nixpkgs#clickhouse-lts
```

## Запуск сервера ClickHouse \{#start-clickhouse-server\}

После установки вы можете запустить сервер ClickHouse:

```bash
clickhouse-server
```

По умолчанию сервер запустится с базовой конфигурацией и будет принимать подключения на `localhost:9000`.

Для использования в production-средах на NixOS вы можете настроить ClickHouse как системную службу. Обратитесь к [руководству NixOS](https://search.nixos.org/options?query=clickhouse) для доступных параметров конфигурации.

## Запуск клиента ClickHouse \{#start-clickhouse-client\}

Чтобы подключиться к серверу ClickHouse, откройте новый терминал и выполните:

```bash
clickhouse-client
```

</VerticalStepper>

## О пакете Nix \{#about-nix-package\}

Пакет ClickHouse в Nixpkgs содержит:

- `clickhouse-server` — сервер базы данных ClickHouse
- `clickhouse-client` — клиент командной строки для подключения к ClickHouse
- `clickhouse-local` — инструмент для выполнения SQL‑запросов по локальным файлам
- Другие утилиты ClickHouse

Для получения дополнительной информации о пакете ClickHouse в Nixpkgs посетите:

- [Пакет ClickHouse в Nixpkgs](https://search.nixos.org/packages?query=clickhouse)
- [Параметры службы ClickHouse в NixOS](https://search.nixos.org/options?query=clickhouse)