import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../styles/styles";

const ContentOfList = (props) => {
  return (
    <View style={styles.listItem1}>
      <View style={styles.listItem}>
        <Text style={styles.label0}>{props.type}</Text>
        <Text style={styles.label1}>{props.use}</Text>
      </View>

      <View style={styles.listItem}>
        <Text>{props.price}</Text>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={props.onPress.bind(this, props.id)}
        >
          <Text style={styles.label2}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ContentOfList;
