---
slug: /use-cases/observability/clickstack/deployment/helm-configuration
title: 'Конфигурация Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'Настройка ключей API, секретов и ingress для развертываний ClickStack с помощью Helm'
doc_type: 'guide'
keywords: ['ClickStack configuration', 'Helm secrets', 'API key setup', 'ingress configuration', 'TLS setup']
---

Это руководство описывает параметры настройки для развертываний ClickStack с помощью Helm. Подробнее о базовой установке см. в [основном руководстве по развертыванию с использованием Helm](/docs/use-cases/observability/clickstack/deployment/helm).



## Настройка API-ключа {#api-key-setup}

После успешного развертывания ClickStack настройте API-ключ для включения сбора телеметрических данных:

1. **Получите доступ к экземпляру HyperDX** через настроенный ingress или конечную точку сервиса
2. **Войдите в панель управления HyperDX** и перейдите в настройки команды, чтобы сгенерировать или получить API-ключ
3. **Обновите развертывание**, добавив API-ключ одним из следующих способов:

### Способ 1: Обновление через Helm upgrade с файлом values {#api-key-values-file}

Добавьте API-ключ в файл `values.yaml`:

```yaml
hyperdx:
  apiKey: "ваш-api-ключ-здесь"
```

Затем обновите развертывание:

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

### Способ 2: Обновление через Helm upgrade с флагом --set {#api-key-set-flag}

```shell
helm upgrade my-clickstack clickstack/clickstack --set hyperdx.apiKey="ваш-api-ключ-здесь"
```

### Перезапуск подов для применения изменений {#restart-pods}

После обновления API-ключа перезапустите поды, чтобы применить новую конфигурацию:

```shell
kubectl rollout restart deployment my-clickstack-clickstack-app my-clickstack-clickstack-otel-collector
```

:::note
Чарт автоматически создает секрет Kubernetes (`<release-name>-app-secrets`) с вашим API-ключом. Дополнительная настройка секретов не требуется, если только вы не хотите использовать внешний секрет.
:::


## Управление секретами {#secret-management}

Для работы с конфиденциальными данными, такими как ключи API или учетные данные баз данных, используйте секреты Kubernetes.

### Использование предварительно настроенных секретов {#using-pre-configured-secrets}

Helm-чарт включает шаблон секрета по умолчанию, расположенный по адресу [`charts/clickstack/templates/secrets.yaml`](https://github.com/hyperdxio/helm-charts/blob/main/charts/clickstack/templates/secrets.yaml). Этот файл предоставляет базовую структуру для управления секретами.

Если необходимо применить секрет вручную, измените и примените предоставленный шаблон `secrets.yaml`:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: hyperdx-secret
  annotations:
    "helm.sh/resource-policy": keep
type: Opaque
data:
  API_KEY: <base64-encoded-api-key>
```

Примените секрет к кластеру:

```shell
kubectl apply -f secrets.yaml
```

### Создание пользовательского секрета {#creating-a-custom-secret}

Создайте пользовательский секрет Kubernetes вручную:

```shell
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=my-secret-api-key
```

### Ссылка на секрет в values.yaml {#referencing-a-secret}

```yaml
hyperdx:
  apiKey:
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: API_KEY
```


## Настройка Ingress {#ingress-setup}

Чтобы предоставить доступ к пользовательскому интерфейсу и API HyperDX через доменное имя, включите ingress в файле `values.yaml`.

### Общая конфигурация ingress {#general-ingress-configuration}

```yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com" # Должен совпадать с хостом ingress
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
```

:::note Важное замечание по конфигурации
Параметр `hyperdx.frontendUrl` должен совпадать с хостом ingress и включать протокол (например, `https://hyperdx.yourdomain.com`). Это обеспечивает корректную работу всех генерируемых ссылок, cookies и перенаправлений.
:::

### Включение TLS (HTTPS) {#enabling-tls}

Чтобы защитить развертывание с помощью HTTPS:

**1. Создайте TLS secret с вашим сертификатом и ключом:**

```shell
kubectl create secret tls hyperdx-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key
```

**2. Включите TLS в конфигурации ingress:**

```yaml
hyperdx:
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
    tls:
      enabled: true
      tlsSecretName: "hyperdx-tls"
```

### Пример конфигурации ingress {#example-ingress-configuration}

Для справки приведен пример сгенерированного ресурса ingress:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hyperdx-app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$1
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  ingressClassName: nginx
  rules:
    - host: hyperdx.yourdomain.com
      http:
        paths:
          - path: /(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: my-clickstack-clickstack-app
                port:
                  number: 3000
  tls:
    - hosts:
        - hyperdx.yourdomain.com
      secretName: hyperdx-tls
```

### Распространенные ошибки при настройке ingress {#common-ingress-pitfalls}

**Конфигурация путей и перезаписи:**

- Для Next.js и других одностраничных приложений всегда используйте путь с регулярным выражением и аннотацию перезаписи, как показано выше
- Не используйте просто `path: /` без перезаписи, так как это нарушит обслуживание статических ресурсов

**Несовпадение `frontendUrl` и `ingress.host`:**

- Если они не совпадают, могут возникнуть проблемы с cookies, перенаправлениями и загрузкой ресурсов

**Неправильная конфигурация TLS:**

- Убедитесь, что ваш TLS secret действителен и правильно указан в ingress
- Браузеры могут блокировать небезопасный контент, если вы обращаетесь к приложению по HTTP при включенном TLS

**Версия контроллера ingress:**

- Некоторые функции (такие как пути с регулярными выражениями и перезапись) требуют актуальных версий контроллера nginx ingress
- Проверьте версию с помощью команды:

```shell
kubectl -n ingress-nginx get pods -l app.kubernetes.io/name=ingress-nginx -o jsonpath="{.items[0].spec.containers[0].image}"
```


## Ingress для OTEL collector {#otel-collector-ingress}

Если необходимо предоставить доступ к конечным точкам OTEL collector (для трассировок, метрик, логов) через ingress, используйте конфигурацию `additionalIngresses`. Это полезно для отправки телеметрических данных из-за пределов кластера или использования пользовательского домена для collector.

```yaml
hyperdx:
  ingress:
    enabled: true
    additionalIngresses:
      - name: otel-collector
        annotations:
          nginx.ingress.kubernetes.io/ssl-redirect: "false"
          nginx.ingress.kubernetes.io/force-ssl-redirect: "false"
          nginx.ingress.kubernetes.io/use-regex: "true"
        ingressClassName: nginx
        hosts:
          - host: collector.yourdomain.com
            paths:
              - path: /v1/(traces|metrics|logs)
                pathType: Prefix
                port: 4318
                name: otel-collector
        tls:
          - hosts:
              - collector.yourdomain.com
            secretName: collector-tls
```

- Создается отдельный ресурс ingress для конечных точек OTEL collector
- Можно использовать другой домен, настроить специфичные параметры TLS и применить пользовательские аннотации
- Правило пути с регулярным выражением позволяет маршрутизировать все сигналы OTLP (трассировки, метрики, логи) через одно правило

:::note
Если не требуется предоставлять внешний доступ к OTEL collector, эту конфигурацию можно пропустить. Для большинства пользователей достаточно общей настройки ingress.
:::


## Устранение неполадок ingress {#troubleshooting-ingress}

**Проверка ресурса ingress:**

```shell
kubectl get ingress -A
kubectl describe ingress <ingress-name>
```

**Проверка журналов контроллера ingress:**

```shell
kubectl logs -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx
```

**Тестирование URL-адресов ресурсов:**


Используйте `curl`, чтобы убедиться, что статические ресурсы отдаются как JS, а не как HTML:

```shell
curl -I https://hyperdx.yourdomain.com/_next/static/chunks/main-xxxx.js
# Должен возвращать Content-Type: application/javascript
```

**Инструменты разработчика браузера (DevTools):**

* Проверьте вкладку «Network» на наличие ответов 404 или ресурсов, которые возвращают HTML вместо JS
* Ищите в консоли ошибки вроде `Unexpected token <` (указывает на то, что вместо JS возвращается HTML)

**Проверьте правила переписывания путей:**

* Убедитесь, что ingress не удаляет части путей и не переписывает пути к ресурсам некорректно

**Очистите кэш браузера и CDN:**

* После внесения изменений очистите кэш браузера и любой кэш CDN/прокси, чтобы избежать устаревших ассетов


## Настройка значений {#customizing-values}

Вы можете настроить параметры с помощью флагов `--set`:

```shell
helm install my-clickstack clickstack/clickstack --set key=value
```

Также можно создать пользовательский файл `values.yaml`. Чтобы получить значения по умолчанию:

```shell
helm show values clickstack/clickstack > values.yaml
```

Пример конфигурации:

```yaml
replicaCount: 2

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

hyperdx:
  ingress:
    enabled: true
    host: hyperdx.example.com
```

Примените пользовательские значения:

```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
```


## Следующие шаги {#next-steps}

- [Варианты развертывания](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) — внешние системы и минимальные развертывания
- [Облачные развертывания](/docs/use-cases/observability/clickstack/deployment/helm-cloud) — конфигурации GKE, EKS и AKS
- [Основное руководство по Helm](/docs/use-cases/observability/clickstack/deployment/helm) — базовая установка
