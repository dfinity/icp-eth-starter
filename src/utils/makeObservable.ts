// Lightweight observable value implementation

type Listener<T> = (value: T) => void;

export class ObservableValue<T> {
  private _value: T;
  private _listeners: Listener<T>[];

  constructor(value: T) {
    this._value = value;
    this._listeners = [];
  }

  get() {
    return this._value;
  }

  set(newValue: T) {
    if (this._value === newValue) {
      return;
    }
    this._value = newValue;
    this._listeners.forEach((fn) => fn(this._value));
  }

  subscribe(listenerFn: Listener<T>) {
    this._listeners.push(listenerFn);
    return () => this.unsubscribe(listenerFn);
  }

  callAndSubscribe(listenerFn: Listener<T>) {
    listenerFn(this._value);
    return this.subscribe(listenerFn);
  }

  unsubscribe(listenerFn: Listener<T>) {
    this._listeners = this._listeners.filter((fn) => fn !== listenerFn);
  }
}

export default function makeObservable<T>(value: T): ObservableValue<T>;
export default function makeObservable<T>(
  value?: T,
): ObservableValue<T | undefined>;
export default function makeObservable<T>(value: T): ObservableValue<T> {
  return new ObservableValue(value);
}
