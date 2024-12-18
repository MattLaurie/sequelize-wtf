export interface TrackingService {
    fetch(): Promise<void>;
}

export type Constructor<T> = new (...args: any[]) => T;

const SERVICE_LOOKUP = new Map<string, Constructor<TrackingService>>();

function Service<T extends TrackingService>(kind: string): (target: Constructor<T>) => void {
    return function (target: Constructor<T>): void {
        SERVICE_LOOKUP.set(kind, target);
    }
}

@Service('Debug.OCEAN_CONTAINER.v1')
class DebugTrackingService implements TrackingService {
    async fetch() {
        console.log('debug fetch called');
    }
}

(async () => {
    const ctor = SERVICE_LOOKUP.get('Debug.OCEAN_CONTAINER.v1');
    if (!ctor) {
        throw new Error('No service');
    }

    const svc = new ctor();
    await svc.fetch();
})();