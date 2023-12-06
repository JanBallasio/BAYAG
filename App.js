import React, { useState, useEffect } from "react";
import {
  Button,
  StyleSheet,
  Text,
  View,
  Platform,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { db } from "./components/config";
import DateTimePicker from "@react-native-community/datetimepicker";
import { addDoc, collection } from "firebase/firestore";
import { getDocs, query, where } from "firebase/firestore";
import Icon from "react-native-vector-icons/FontAwesome";
import * as Notifications from "expo-notifications";


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [name, setName] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [notifyMinutes, setNotifyMinutes] = useState(0); 
  const [scheduledNotifications, setScheduledNotifications] = useState([]);
  const [notificationsScheduled, setNotificationsScheduled] = useState(false);


  async function scheduleNotification(name, seconds, isTimeUp = false, identifier) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: isTimeUp ? "Time's Up " + name : "Good Day " + name,
        body: isTimeUp ? "Yaks Natay" : "Matmatay Kan",
        data: { data: "goes here" },
      },
      trigger: { seconds },
    });
    setScheduledNotifications([...scheduledNotifications, identifier]);
  }
  
  async function fetchAndScheduleNotification() {
    const q = query(collection(db, "bolshet"));
    const querySnapshot = await getDocs(q);
    
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      const dateTime = data.date.toDate();
      const name = data.name;
      const diffInSeconds = (dateTime.getTime() - new Date().getTime()) / 1000;
      const identifierGoodDay = `${name}-${dateTime.getTime()}-goodday`;
      const identifierTimesUp = `${name}-${dateTime.getTime()}-timesup`;
  
      if (diffInSeconds > notifyMinutes * 60 && !scheduledNotifications.includes(identifierGoodDay)) {
        await scheduleNotification(name, diffInSeconds - notifyMinutes * 60, false, identifierGoodDay); 
        setScheduledNotifications([...scheduledNotifications, identifierGoodDay]);
      } else if (diffInSeconds > 0 && !scheduledNotifications.includes(identifierTimesUp)) {
        await scheduleNotification(name, diffInSeconds, true, identifierTimesUp); 
        setScheduledNotifications([...scheduledNotifications, identifierTimesUp]);
      }
    }
  }  
  useEffect(() => {
    if (!notificationsScheduled) {
      fetchAndScheduleNotification();
      setNotificationsScheduled(true);
    }
  }, [notificationsScheduled]);
  async function create() {
    const offset = -8;
    const hours = time.getHours() + offset;
    const dateTime = new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hours,
        time.getMinutes()
      )
    );

    await addDoc(collection(db, "bolshet"), {
      date: dateTime,
      time: dateTime,
      name: name,
    });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Good Day " + name,
        body:
          "You have created a schedule due on" +
          dateTime.toLocaleString(),
        data: { data: "goes here" },
      },
      trigger: { seconds: 1 },
    });
    fetchAndScheduleNotification();
  }
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDate(Platform.OS === "ios");
    setDate(currentDate);
  };

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTime(Platform.OS === "ios");
    setTime(currentTime);
  };

  const showDatepicker = () => {
    setShowDate(true);
  };

  const showTimepicker = () => {
    setShowTime(true);
  };

  //REALL TIME CHECKINGG WHEN FIRESHIT IS OPEN
  React.useEffect(() => {
    const intervalId = setInterval(fetchAndScheduleNotification, 60 * 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  return (
    <View style={styles.container}>
      <Text>Hello, World!</Text>
      <TextInput
        value={name}
        onChangeText={(name) => {
          setName(name);
        }}
        placeholder="Name"
        style={styles.textBoxes}
      ></TextInput>
      <View style={styles.datePicker}>
        <TextInput
          style={styles.textBoxes}
          value={date.toLocaleDateString()}
          editable={false}
        />
        <TouchableOpacity onPress={showDatepicker}>
          <Icon name="calendar" size={20} color="#000" />
        </TouchableOpacity>
      </View>
      {showDate && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onDateChange}
        />
      )}
      <View style={styles.datePicker}>
        <TextInput
          style={styles.textBoxes}
          value={`${time.getHours() % 12 || 12}:${
            time.getMinutes() < 10 ? "0" : ""
          }${time.getMinutes()} ${time.getHours() < 12 ? "AM" : "PM"}`}
          editable={false}
        />
        <TouchableOpacity onPress={showTimepicker}>
          <Icon name="calendar" size={20} color="#000" />
        </TouchableOpacity>
      </View>
      {showTime && (
        <DateTimePicker
          testID="dateTimePicker"
          value={time}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onTimeChange}
        />
      )}
      <Text>Notify me before  (Minutes)</Text>
      <TextInput
        value={notifyMinutes.toString()}
        onChangeText={(minutes) => {
          const parsedMinutes = parseInt(minutes);
          if (!isNaN(parsedMinutes)) {
            setNotifyMinutes(parsedMinutes);
          } else {
            setNotifyMinutes(0);
          }
        }}
        placeholder="Notify minutes before"
        style={styles.textBoxes}
      ></TextInput>
      <Button title="Set Reminder" onPress={create}></Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  textBoxes: {
    width: "90%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    margin: 5,
    padding: 5,
    textAlign: "center",
  },
  datePicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    height: 40,
    borderColor: "gray",
    margin: 5,
    padding: 5,
  },
});
