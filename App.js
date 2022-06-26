import React, { useEffect, useState } from "react";
import { View, FlatList, Text, Button, TextInput, Alert } from "react-native";
import {
  NavigationContainer,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Platform } from "react-native";

import { styles } from "./styles/styles";
import ContentOfList from "./components/ContentOfList";
import { db, firestore, auth } from "./FirebaseConfig";
import { ref, push, getDatabase, onValue, set } from "firebase/database";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import DropDownPicker from "react-native-dropdown-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { async } from "@firebase/util";

export const LoginScreen = () => {
  const [registrationEmail, setRegistrationEmail] = useState("");
  const [registrationPassword, setRegistrationPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const auth = getAuth();
  const navigation = useNavigation();

  const registerWithFirebase = () => {
    if (registrationEmail.length < 4) {
      Alert.alert("Please enter an email address.");
      return;
    }

    if (registrationPassword.length < 4) {
      Alert.alert("Please enter a password.");
      return;
    }

    createUserWithEmailAndPassword(
      auth,
      registrationEmail,
      registrationPassword
    )
      .then((userCredential) => {
        Alert.alert("user registered!");

        setRegistrationEmail("");
        setRegistrationPassword("");
      })
      .catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;

        if (errorCode == "auth/weak-password") {
          Alert.alert("The password is too weak.");
        } else {
          Alert.alert(errorMessage);
        }
        console.log(error);
      });
  };

  const loginWithFirebase = () => {
    if (loginEmail.length < 4) {
      Alert.alert("Please enter an email address.");
      return;
    }

    if (loginPassword.length < 4) {
      Alert.alert("Please enter a password.");
      return;
    }
    const moveToNextScreen = () => {
      setUserMaxAllowance();
      navigation.navigate("FirstScreen");
    };

    signInWithEmailAndPassword(auth, loginEmail, loginPassword)
      .then(function (_firebaseUser) {
        if (_firebaseUser) {
          Alert.alert("user logged in!");
          setLoggedIn(true);
          moveToNextScreen();
        }
      })

      .catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;

        if (errorCode === "auth/wrong-password") {
          Alert.alert("Wrong password.");
        } else {
          Alert.alert(errorMessage);
        }
      });
  };

  const setUserMaxAllowance = async () => {
    try {
      var num = 300;
      await AsyncStorage.setItem("userMaxAllowance", JSON.stringify(num));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.form1}>
      <View style={styles.View1}>
        <Text style={styles.label}>Register with Firebase</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={(value) => setRegistrationEmail(value)}
          autoCapitalize="none"
          autoCorrect={false}
          autoCompleteType="email"
          keyboardType="email-address"
          placeholder="email"
        />
        <TextInput
          style={styles.textInput}
          onChangeText={(value) => setRegistrationPassword(value)}
          autoCapitalize="none"
          autoCorrect={false}
          autoCompleteType="password"
          keyboardType="visible-password"
          placeholder="password"
        />
        <Button
          style={styles.button}
          title="Register"
          onPress={registerWithFirebase}
        />
      </View>
      <View>
        <Text style={styles.label}>Sign In with Firebase</Text>
        <TextInput
          style={styles.textInput}
          onChangeText={(value) => setLoginEmail(value)}
          autoCapitalize="none"
          autoCorrect={false}
          autoCompleteType="email"
          keyboardType="email-address"
          placeholder="email"
        />
        <TextInput
          style={styles.textInput}
          onChangeText={(value) => setLoginPassword(value)}
          autoCapitalize="none"
          autoCorrect={false}
          autoCompleteType="password"
          keyboardType="visible-password"
          placeholder="password"
        />
        <Button
          style={styles.button}
          title="Login"
          onPress={loginWithFirebase}
        />
      </View>
    </View>
  );
};
//------------------------------------------------------------------------------------------------------
export const FirstScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [readData, setReadData] = useState([]);
  const [UserAllowanceBalance, setUserAllowanceBalance] = useState(300);

  const auth = getAuth();
  const signoutWithFirebase = () => {
    signOut(auth)
      .then(() => {
        // if logout was successful
        if (!auth.currentUser) {
          Alert.alert("user was logged out!");
          //setLoggedIn(false);
        }
      })
      .then(() => {
        navigation.navigate("LoginScreen");
      });
  };

  const onNewNoteSaved = (noteItem) => {
    calculateDataAfterAddNew(noteItem.price, noteItem.enterValue);

    setReadData((prev) => [
      ...prev,
      {
        Key: noteItem.key,
        EnterValue: noteItem.enterValue,
        Type: noteItem.type,
        Price: noteItem.price,
      },
    ]);
  };

  function calculateDataAfterAddNew(price, value) {
    var OrderPrice = price * value;
    var result = UserAllowanceBalance - OrderPrice;
    setUserMaxAllowance(result);
    setUserAllowanceBalance(result);
  }
  const setUserMaxAllowance = async (value) => {
    try {
      await AsyncStorage.setItem("userMaxAllowance", JSON.stringify(value));
    } catch (error) {
      console.log(error);
    }
  };

  const removeData = (itemID) => {
    var removeObject = readData.filter((data) => data.Key == itemID);
    var result =
      UserAllowanceBalance + removeObject[0].Price * removeObject[0].EnterValue;
    setUserMaxAllowance(result);
    setUserAllowanceBalance(result);
    let filterArray = readData.filter((data) => data.Key != itemID);
    setReadData(filterArray);
  };

  return (
    <View style={styles.form}>
      <View style={styles.button1}>
        <Button
          style={styles.createListButton}
          title="Create List"
          onPress={() =>
            navigation.navigate("SecondScreen", { onSee: onNewNoteSaved })
          }
        />
      </View>
      <Text style={styles.labelsecond}>
        User Allowance Remaining: ${UserAllowanceBalance}
      </Text>
      <FlatList
        data={readData}
        renderItem={(itemData) => (
          <ContentOfList
            id={itemData.item.Key}
            type={"Fuel Type: " + itemData.item.Type}
            use={"Fuel Used: " + itemData.item.EnterValue}
            price={"Price: " + itemData.item.Price}
            onPress={removeData}
          />
        )}
      />
      <Button
        style={styles.signOutButton}
        title="Sign Out"
        onPress={signoutWithFirebase}
      />
    </View>
  );
};
//------------------------------------------------------------------------------------------------------
export const SecondScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [enteredValue, setenteredValue] = useState();
  const [UserAllowanceBalance, setUserAllowanceBalance] = useState();
  const [open, setOpen] = useState(false);
  const [valueData, setValueData] = useState(null);
  const [items, setItems] = useState([
    { label: "Petro", value: 30 },
    { label: "Diesel", value: 40 },
    { label: "BatteryCharge", value: 10 },
  ]);
  var fuelType;
  //var UserAllowanceBalance = 300;

  useEffect(() => {
    getUserMaxAllowance();
  }, []);

  const valueInputHandler = (value1) => {
    setenteredValue(value1);
  };

  function predictItems() {
    if (valueData == 30) {
      fuelType = "Petro";
    } else if (valueData == 40) {
      fuelType = "Diesel";
    } else if (valueData == 10) {
      fuelType = "BatteryCharge";
    }
  }

  const getUserMaxAllowance = async () => {
    try {
      const savedValue = await AsyncStorage.getItem("userMaxAllowance");
      var Balance = JSON.parse(savedValue);
      setUserAllowanceBalance(Balance);
    } catch (error) {
      console.log(error);
    }
  };

  const addItemHandler = async () => {
    getUserMaxAllowance();
    var doesUserHasEnoughBalance = enteredValue * valueData;
    console.log(doesUserHasEnoughBalance);
    console.log(UserAllowanceBalance);
    if (UserAllowanceBalance >= doesUserHasEnoughBalance) {
      predictItems();
      route.params.onSee({
        key: Math.random(),
        enterValue: enteredValue,
        type: fuelType,
        price: valueData,
      });
      navigation.goBack();
    } else {
      Alert.alert("Exceed Your Allowance Balance");
    }
  };

  return (
    <View style={styles.form3}>
      <DropDownPicker
        placeholder="Fuel Type"
        open={open}
        value={valueData}
        items={items}
        setOpen={setOpen}
        setValue={setValueData}
        setItems={setItems}
      />

      <TextInput
        placeholder="Enter Litres/ Charge unit here"
        style={styles.inputsecond2}
        onChangeText={valueInputHandler}
        value={enteredValue}
      />
      <View style={styles.button2}>
        <Button
          style={styles.buttonsecond}
          title="SAVE"
          onPress={addItemHandler}
        />
      </View>
    </View>
  );
};

SecondScreen.navigationOptions = {
  headerTitle: "Add Place",
};
//------------------------------------------------------------------------------------------------------
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{
            title: "Login",
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="FirstScreen"
          component={FirstScreen}
          options={{
            title: "List",
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="SecondScreen"
          component={SecondScreen}
          options={{
            title: "Input",
            headerTitleAlign: "center",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
