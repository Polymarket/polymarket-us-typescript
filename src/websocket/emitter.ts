type EventListener<Events, EventType extends keyof Events> = Events[EventType];

type EventListenerEntry<Events, EventType extends keyof Events> = {
  listener: EventListener<Events, EventType>;
  once?: boolean;
};

export type EventParameters<
  Events,
  EventType extends keyof Events,
> = Events[EventType] extends (...args: infer P) => unknown ? P : never;

// biome-ignore lint/suspicious/noExplicitAny: complex generics needed for type-safe event emitter
export class EventEmitter<
  EventTypes extends Record<string, (...args: any[]) => any>,
> {
  #listeners: {
    [Event in keyof EventTypes]?: EventListenerEntry<EventTypes, Event>[];
  } = {};

  on<Event extends keyof EventTypes>(
    event: Event,
    listener: EventListener<EventTypes, Event>,
  ): this {
    if (!this.#listeners[event]) {
      this.#listeners[event] = [];
    }
    this.#listeners[event].push({ listener });
    return this;
  }

  off<Event extends keyof EventTypes>(
    event: Event,
    listener: EventListener<EventTypes, Event>,
  ): this {
    const listeners = this.#listeners[event];
    if (!listeners) return this;
    const index = listeners.findIndex((l) => l.listener === listener);
    if (index >= 0) listeners.splice(index, 1);
    return this;
  }

  once<Event extends keyof EventTypes>(
    event: Event,
    listener: EventListener<EventTypes, Event>,
  ): this {
    if (!this.#listeners[event]) {
      this.#listeners[event] = [];
    }
    this.#listeners[event].push({ listener, once: true });
    return this;
  }

  protected _emit<Event extends keyof EventTypes>(
    event: Event,
    ...args: EventParameters<EventTypes, Event>
  ) {
    const listeners = this.#listeners[event];
    if (listeners) {
      this.#listeners[event] = listeners.filter((l) => !l.once);
      for (const { listener } of listeners) {
        listener(...args);
      }
    }
  }

  protected _hasListener(event: keyof EventTypes): boolean {
    const listeners = this.#listeners[event];
    return !!listeners && listeners.length > 0;
  }
}
