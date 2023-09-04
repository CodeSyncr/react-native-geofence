import {
  NativeModules,
  NativeEventEmitter,
  AppRegistry,
  Platform,
} from 'react-native';
import type { EmitterSubscription } from 'react-native';

const Geofence = NativeModules.Geofence
  ? NativeModules.Geofence
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

console.log('Geofence ::', Geofence);

const LINKING_ERROR =
  `The package 'react-native-geofence' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const TAG = 'Geofence';

const geofenceEventEmitter = new NativeEventEmitter(Geofence);

enum Events {
  EXIT = 'onExit',
  ENTER = 'onEnter',
}

export { Events };

const HeadlessBoundaryEventTask = async ({ event, ids }: any) => {
  console.log(event, ids);
  geofenceEventEmitter.emit(event, ids);
};

AppRegistry.registerHeadlessTask(
  'OnBoundaryEvent',
  () => HeadlessBoundaryEventTask
);

// interface Boundary {
//   id: string;
//   lat: number;
//   lng: number;
//   radius: number;
// }

export interface BoundaryStatic {
  add: (boundary: any) => Promise<string>;
  on: (
    event: Events,
    callback: (boundaries: string[]) => void
  ) => EmitterSubscription;
  off: (event: Events) => void;
  removeAll: () => Promise<null>;
  remove: (id: string) => Promise<null>;
}

export const Boundary: BoundaryStatic = {
  add: (boundary) => {
    console.log('boundary ::', boundary);
    if (
      !boundary ||
      (boundary.constructor !== Array && typeof boundary !== 'object')
    ) {
      throw new Error(TAG + ': a boundary must be an array or non-null object');
    }

    if (typeof boundary === 'object' && !boundary.id) {
      throw new Error(TAG + ': an id is required');
    }

    return Geofence.add(boundary);
  },

  on: (event, callback) => {
    if (typeof callback !== 'function') {
      throw new Error(TAG + ': callback function must be provided');
    }

    if (!Object.values(Events).find((e) => e === event)) {
      throw new Error(TAG + ': invalid event');
    }

    return geofenceEventEmitter.addListener(event, callback);
  },

  off: (event) => {
    if (!Object.values(Events).find((e) => e === event)) {
      throw new Error(TAG + ': invalid event');
    }

    return geofenceEventEmitter.removeAllListeners(event);
  },

  removeAll: () => {
    return Geofence.removeAll();
  },

  remove: (id) => {
    if (!id || (id.constructor !== Array && typeof id !== 'string')) {
      throw new Error(TAG + ': id must be a string');
    }

    return Geofence.remove(id);
  },
};

export default Boundary;
