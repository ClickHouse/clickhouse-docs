:::important best practices
При настройке ClickHouse Server путем добавления или редактирования файлов конфигурации вы должны:
- Добавлять файлы в директорию `/etc/clickhouse-server/config.d/`
- Добавлять файлы в директорию `/etc/clickhouse-server/users.d/`
- Оставлять файл `/etc/clickhouse-server/config.xml` без изменений
- Оставлять файл `/etc/clickhouse-server/users.xml` без изменений
:::
