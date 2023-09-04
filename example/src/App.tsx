import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import Boundary, { Events } from 'react-native-geofence';
import Geolocation from '@react-native-community/geolocation';

export default function App() {
  const [location, setLocation] = React.useState<string | null>(null);
  const [currentPosition, setCurrentPosition] = React.useState<any>('');
  const [error, setError] = React.useState<any>('');

  React.useEffect(() => {
    Geolocation.getCurrentPosition((info) => {
      console.log(info);
      setCurrentPosition(
        `Lattice: ${info.coords.latitude}, Longitude: ${info.coords.longitude}`
      );
    });

    Boundary.add({
      lat: 21.1490667,
      lng: 72.7984001,
      radius: 10, // in meters
      id: 'Chipotle',
    })
      .then(() => console.log('success!'))
      .catch((e: any) => {
        console.error('error :', e);
        setError(`error adding : ${e}`);
      });
    Boundary.on(Events.ENTER, (id: any) => {
      // Prints 'Get out of my Chipotle!!'
      setLocation(`inside radius ${id}!!`);

      console.log(`Get out of my ${id}!!`);
    });
    Boundary.on(Events.EXIT, (id: any) => {
      // Prints 'Ya! You better get out of my Chipotle!!'
      setLocation(`outside radius ${id}!!`);

      console.log(`Ya! You better get out of my ${id}!!`);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text>My Current Location: {currentPosition}</Text>

      <Text>Result: {location}</Text>
      <Text>ERROR: {error}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
