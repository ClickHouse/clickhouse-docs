---
slug: /use-cases/observability/clickstack/deployment/helm-configuration-v1
title: 'Конфигурация Helm (v1.x)'
pagination_prev: null
pagination_next: null
sidebar_position: 11
description: 'Настройка API-ключей, секретов и входного шлюза для Helm-развертываний ClickStack v1.x'
doc_type: 'guide'
keywords: ['конфигурация ClickStack', 'секреты Helm', 'настройка API-ключей', 'конфигурация входного шлюза', 'настройка TLS']
---

:::warning Устарело — чарт v1.x
На этой странице описана конфигурация inline-template Helm-чарта **v1.x**, который находится в режиме поддержки. Сведения о чарте v2.x см. в разделе [Конфигурация Helm](/docs/use-cases/observability/clickstack/deployment/helm-configuration). Инструкции по миграции см. в [руководстве по обновлению](/docs/use-cases/observability/clickstack/deployment/helm-upgrade).
:::

В этом руководстве рассматриваются настройки для Helm-развертываний ClickStack. Сведения о базовой установке см. в [основном руководстве по развертыванию Helm](/docs/use-cases/observability/clickstack/deployment/helm-v1).

## Настройка API-ключа \{#api-key-setup\}

После успешного развертывания ClickStack настройте API-ключ, чтобы включить сбор телеметрии:

1. **Откройте экземпляр HyperDX** через настроенный входной шлюз или конечную точку сервиса
2. **Войдите в дашборд HyperDX** и перейдите в Team settings, чтобы сгенерировать или получить API-ключ
3. **Обновите развертывание** с API-ключом одним из следующих способов:

### Метод 1: обновление через Helm upgrade с использованием файла values \{#api-key-values-file\}

Добавьте API-ключ в `values.yaml`:

```yaml
hyperdx:
  apiKey: "your-api-key-here"
```

Затем обновите развертывание:

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

### Метод 2: Обновление с помощью команды helm upgrade с флагом --set \{#api-key-set-flag\}

```shell
helm upgrade my-clickstack clickstack/clickstack --set hyperdx.apiKey="your-api-key-here"
```

### Перезапустите поды, чтобы применить изменения \{#restart-pods\}

После обновления API-ключа перезапустите поды, чтобы они загрузили новую конфигурацию:

```shell
kubectl rollout restart deployment my-clickstack-clickstack-app my-clickstack-clickstack-otel-collector
```

:::note
Чарт автоматически создаёт секрет Kubernetes (`<release-name>-app-secrets`) с вашим API-ключом. Дополнительная настройка секрета не требуется, если только вы не планируете использовать внешний секрет.
:::

## Управление секретами \{#secret-management\}

Для хранения конфиденциальных данных, таких как API-ключи или учетные данные базы данных, используйте секреты Kubernetes.

### Использование преднастроенных секретов \{#using-pre-configured-secrets\}

Helm-чарт содержит шаблон секрета по умолчанию, расположенный по адресу [`charts/clickstack/templates/secrets.yaml`](https://github.com/hyperdxio/helm-charts/blob/main/charts/clickstack/templates/secrets.yaml). Этот файл служит базовой структурой для управления секретами.

Если вам нужно вручную применить секрет, измените и примените предоставленный шаблон `secrets.yaml`:

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

### Создание собственного секрета \{#creating-a-custom-secret\}

Создайте собственный секрет Kubernetes вручную:

```shell
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=my-secret-api-key
```

### Указание секрета в values.yaml \{#referencing-a-secret\}

```yaml
hyperdx:
  apiKey:
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: API_KEY
```

## Настройка входного шлюза \{#ingress-setup\}

Чтобы открыть доступ к интерфейсу HyperDX и API по доменному имени, включите входной шлюз в файле `values.yaml`.

### Общие настройки входного шлюза \{#general-ingress-configuration\}

```yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com"  # Must match ingress host
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
```

:::note Важное примечание по настройке
`hyperdx.frontendUrl` должен совпадать с хостом входного шлюза и включать протокол (например, `https://hyperdx.yourdomain.com`). Это гарантирует корректную работу всех создаваемых ссылок, файлов cookie и перенаправлений.
:::

### Включение TLS (HTTPS) \{#enabling-tls\}

Чтобы защитить развертывание с помощью HTTPS:

**1. Создайте TLS-секрет с сертификатом и ключом:**

```shell
kubectl create secret tls hyperdx-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key
```

**2. Включите TLS в конфигурации входного шлюза:**

```yaml
hyperdx:
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
    tls:
      enabled: true
      tlsSecretName: "hyperdx-tls"
```

### Пример конфигурации входного шлюза \{#example-ingress-configuration\}

Для справки ниже показано, как выглядит сгенерированный ресурс входного шлюза:

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

### Типичные проблемы с входным шлюзом \{#common-ingress-pitfalls\}

**Настройка пути и rewrite:**

* Для Next.js и других SPA всегда используйте путь Regex и аннотацию rewrite, как показано выше
* Не используйте только `path: /` без rewrite, иначе нарушится раздача статических ресурсов

**Несоответствие `frontendUrl` и `ingress.host`:**

* Если они не совпадают, возможны проблемы с cookie, перенаправлениями и загрузкой ресурсов

**Неправильная настройка TLS:**

* Убедитесь, что секрет TLS действителен и правильно указан во входном шлюзе
* Браузеры могут блокировать небезопасный контент, если вы открываете приложение по HTTP при включенном TLS

**Версия контроллера входного шлюза:**

* Некоторые возможности (например, пути Regex и rewrite) требуют свежих версий контроллера входного шлюза nginx
* Проверьте версию командой:

```shell
kubectl -n ingress-nginx get pods -l app.kubernetes.io/name=ingress-nginx -o jsonpath="{.items[0].spec.containers[0].image}"
```

## Входной шлюз для OTel collector \{#otel-collector-ingress\}

Если вам нужно предоставить доступ к конечным точкам вашего OTel collector (для трейсов, метрик и логов) через входной шлюз, используйте конфигурацию `additionalIngresses`. Это полезно, если вы отправляете телеметрические данные извне кластера или используете для collector собственный домен.

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

* При этом создается отдельный ресурс входного шлюза для конечных точек OTel collector
* Вы можете использовать другой домен, настроить конкретные параметры TLS и добавить пользовательские аннотации
* Правило пути Regex позволяет направлять все сигналы OTLP (трейсы, метрики, логи) через одно правило

:::note
Если вам не нужно открывать OTel collector для внешнего доступа, эту конфигурацию можно пропустить. Для большинства пользователей достаточно общей настройки входного шлюза.
:::

## Устранение неполадок входного шлюза \{#troubleshooting-ingress\}

**Проверьте ресурс входного шлюза:**

```shell
kubectl get ingress -A
kubectl describe ingress <ingress-name>
```

**Проверьте логи контроллера входного шлюза:**

```shell
kubectl logs -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx
```

**Тестовые URL-адреса ресурсов:**

Используйте `curl`, чтобы проверить, что статические ресурсы отдаются как JS, а не как HTML:

```shell
curl -I https://hyperdx.yourdomain.com/_next/static/chunks/main-xxxx.js
# Should return Content-Type: application/javascript
```

**Инструменты разработчика в браузере:**

* Проверьте вкладку Network: нет ли ответов 404 или ресурсов, для которых вместо JS возвращается HTML
* Проверьте, нет ли в консоли ошибок вроде `Unexpected token <` (это означает, что вместо JS вернулся HTML)

**Проверьте переписывание путей:**

* Убедитесь, что входной шлюз не удаляет части путей к ресурсам и не переписывает их некорректно

**Очистите кэш браузера и CDN:**

* После внесения изменений очистите кэш браузера и кэш CDN/прокси, чтобы избежать использования устаревших ресурсов

## Настройка значений \{#customizing-values\}

Вы можете изменить настройки с помощью флагов `--set`:

```shell
helm install my-clickstack clickstack/clickstack --set key=value
```

Либо создайте собственный `values.yaml`. Чтобы получить значения по умолчанию:

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

Примените собственные значения:

```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
```

## Следующие шаги \{#next-steps\}

* [Варианты развёртывания (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options-v1) — Внешние системы и минимальные развёртывания
* [Развёртывание в Cloud (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1) — Конфигурации GKE, EKS и AKS
* [Основное руководство по Helm (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-v1) — Базовая установка
* [Конфигурация Helm (v2.x)](/docs/use-cases/observability/clickstack/deployment/helm-configuration) — Руководство по настройке v2.x
* [Руководство по обновлению](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) — Миграция с v1.x на v2.x