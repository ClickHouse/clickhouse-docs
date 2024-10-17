import { logFns } from '../logging';

export const GALAXY_API_PATH = 'galaxy';

export class GalaxyClient {

  constructor({
    httpClient,
    errorHandler,
    tags,
    application,
    apiHost,
    getUserId,
    getSessionId,
    getContext
  }) {
    this.tags = tags ?? [];
    this.httpClient = httpClient;
    this.errorHandler = errorHandler;
    this.application = application;
    this.apiHost = apiHost;
    this.getUserId = getUserId;
    this.getSessionId = getSessionId;
    this.getContext = getContext;

    this.eventsQueue = [];
  }

  setApiHost(apiHost) {
    this.apiHost = apiHost;
  }

  getPayloadProperties() {
    return {
      application: this.application,
      ...this.getContext()
    };
  }

  track(event, properties) {
    const { interaction, ...eventProperties } = properties ?? {
      interaction: 'click'
    };
    const [namespace, component, eventName] = event.split('.');
    const payloadProperties = this.getPayloadProperties();
    const galaxyEvent = {
      application: this.application,
      timestamp: new Date().getTime(),
      userId: this.getUserId(),
      namespace,
      component,
      interaction,
      orgId: payloadProperties['orgId'],
      event: eventName,
      message: eventName,
      properties: {
        properties: payloadProperties,
        ...(eventProperties ?? {})
      }
    };

    this.eventsQueue.push(galaxyEvent);
  }

  extractServiceIdFromLastArg(arg) {
    if (arg && (typeof arg !== 'object' || Array.isArray(arg))) {
      return {
        serviceId: null,
        orgId: null
      };
    }

    const { serviceId, orgId } = arg;

    return {
      serviceId: typeof serviceId === 'string' ? serviceId : null,
      orgId: typeof orgId === 'string' ? orgId : null
    };
  }

  log(level, ...args) {
    try {
      const message = [this.tags ? this.tags.map((tag) => `[${tag}]`).join('') : ''];

      const serializedArgs = args.map((arg) => {
        if (arg instanceof Error) {
          return arg.stack || arg.message;
        } else {
          return arg;
        }
      });

      if (typeof serializedArgs[0] === 'string') {
        const part = serializedArgs.shift();
        message.push(part);
      }

      const data = {
        component: level,
        namespace: 'logs'
      };

      if (serializedArgs.length > 0) {
        data['values'] = serializedArgs;
      }

      const payloadProperties = this.getPayloadProperties();
      const messageString = message.join(' ').slice(0, 200);

      const logEvent = {
        timestamp: new Date().getTime(),
        namespace: 'logs',
        component: level,
        interaction: 'trigger',
        message: messageString,
        orgId: payloadProperties['orgId'],
        properties: {
          properties: payloadProperties,
          ...data
        },
        event: 'trace',
        application: this.application,
        userId: this.getUserId()
      };

      this.eventsQueue.push(logEvent);
    } catch (error) {
      logFns.error('Could not log to galaxy', error);
    }
  }

  forensic(event) {
    const { properties, ...rest } = event;
    const payloadProperties = this.getPayloadProperties();
    const decoratedEvent = {
      application: this.application,
      timestamp: new Date().getTime(),
      namespace: 'forensics',
      userId: this.getUserId(),
      orgId: payloadProperties['orgId'],
      properties: {
        application: this.application,
        properties: {
          ...properties,
          ...payloadProperties
        }
      },
      ...rest
    };
    this.eventsQueue.push(decoratedEvent);
  }

  async sendEvents(rpcCall, queue) {
    try {
      const numEvents = queue.length;
      if (numEvents > 0) {
        const request = {
          rpcAction: rpcCall,
          galaxySessionId: this.getSessionId(),
          data: queue.slice(0, numEvents)
        };
        await this.httpClient.post(`${this.apiHost}/api/${GALAXY_API_PATH}?${rpcCall}`, request);
        queue.splice(0, numEvents);
      }
    } catch (error) {
      this.captureException(error);
    }
  }

  async sendGalaxyEvents() {
    return await this.sendEvents('sendGalaxyForensicEvent', this.eventsQueue);
  }

  captureException(error) {
    if (this.errorHandler) {
      this.errorHandler.captureException(error);
    }
  }

  cleanup() {
    return this.flushEvents();
  }

  async flushEvents() {
    try {
      await this.sendGalaxyEvents();
    } catch (error) {
      this.captureException(error);
    }
  }
}
