export default class Emitter {
    private bindings: any = {};
    private triggeredFlags: any = {};

    public on(eventName: string, fn: Function): void {
        this.bindings[eventName] = this.bindings[eventName] || [];
        this.bindings[eventName] = [
            ...this.bindings[eventName],
            fn,
        ];
    }

    protected emit(eventName: string, ...data: any[]): void {
        if (this.triggeredFlags[eventName]) { return; }
        this.triggeredFlags[eventName] = true;

        requestAnimationFrame(() => {
            (this.bindings[eventName] || []).forEach(act => act(...data));
            delete this.triggeredFlags[eventName];
        });
    }
}