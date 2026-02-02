Если у вас уже есть приложения или инфраструктура, которые нужно инструментировать, перейдите к соответствующим руководствам, ссылки на которые доступны в UI. 

Чтобы инструментировать приложения для сбора трейсов и логов, используйте [поддерживаемые языковые SDKs](/use-cases/observability/clickstack/sdks), которые отправляют данные в ваш OpenTelemetry Collector, выполняющий роль шлюза для ингестии в Managed ClickStack. 

Логи могут [собираться с помощью OpenTelemetry Collectors](/use-cases/observability/clickstack/integrations/host-logs), запускаемых в режиме агента и пересылающих данные в тот же коллектор. Для мониторинга Kubernetes следуйте [специальному руководству](/use-cases/observability/clickstack/integrations/kubernetes). Для других интеграций см. наши [руководства по быстрому старту](/use-cases/observability/clickstack/integration-guides).

### Демонстрационные данные \{#demo-data\}

Если у вас нет собственных данных, попробуйте один из наших примерных наборов данных.

- [Пример набора данных](/use-cases/observability/clickstack/getting-started/sample-data) - Загрузите пример набора данных из нашего публичного демо и выполните диагностику простой проблемы.
- [Локальные файлы и метрики](/use-cases/observability/clickstack/getting-started/local-data) - Загрузите локальные файлы и отслеживайте состояние системы на macOS или Linux с помощью локального OTel collector.