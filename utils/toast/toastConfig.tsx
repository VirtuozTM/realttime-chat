// src/services/toastConfig.ts
import React from "react";
import { StyleSheet } from "react-native";
import {
  BaseToast,
  ErrorToast,
  InfoToast,
  ToastConfig,
  ToastConfigParams,
} from "react-native-toast-message";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

// Définir la configuration des toasts avec types génériques
const toastConfig: ToastConfig = {
  // Surcharger le type 'success' avec des styles personnalisés
  success: (props: ToastConfigParams<any>) => (
    <BaseToast
      {...props}
      style={styles.successToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1Success}
      text2Style={styles.text2Success}
      text1NumberOfLines={1}
      text2NumberOfLines={3}
      renderLeadingIcon={() => (
        <MaterialIcons
          name="check-circle"
          size={20}
          color="#4CAF50"
          style={{ marginLeft: 10, marginTop: 15 }}
        />
      )}
    />
  ),

  // Surcharger le type 'error' avec des styles personnalisés
  error: (props: ToastConfigParams<any>) => (
    <ErrorToast
      {...props}
      style={styles.errorToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1Error}
      text2Style={styles.text2Error}
      text1NumberOfLines={1}
      text2NumberOfLines={3}
      renderLeadingIcon={() => (
        <MaterialIcons
          name="error"
          size={20}
          color="#F44336"
          style={{ marginLeft: 10, marginTop: 15 }}
        />
      )}
    />
  ),

  // Surcharger le type 'info' avec des styles personnalisés
  info: (props: ToastConfigParams<any>) => (
    <InfoToast
      {...props}
      style={styles.infoToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1Info}
      text2Style={styles.text2Info}
      text1NumberOfLines={1}
      text2NumberOfLines={3}
      renderLeadingIcon={() => (
        <MaterialIcons
          name="info"
          size={20}
          color="#2196F3"
          style={{ marginLeft: 10, marginTop: 15 }}
        />
      )}
    />
  ),
};

// Définir les styles personnalisés
const styles = StyleSheet.create({
  successToast: {
    borderLeftColor: "#4CAF50", // Vert plus doux
    backgroundColor: "#E8F5E9", // Vert clair pour le fond
    paddingVertical: 10,
    height: "auto",
  },
  errorToast: {
    borderLeftColor: "#F44336", // Rouge moins agressif
    backgroundColor: "#FDECEA", // Rouge clair pour le fond
    paddingVertical: 10,
    height: "auto",
  },
  infoToast: {
    borderLeftColor: "#2196F3", // Bleu agréable
    backgroundColor: "#E3F2FD", // Bleu clair pour le fond
    paddingVertical: 10,
    height: "auto",
  },
  contentContainer: {
    paddingHorizontal: 10,
  },
  text1Success: {
    fontSize: 16,
    fontWeight: "bold",
  },
  text2Success: {
    fontSize: 14,
    color: colors.neutral600,
  },
  text1Error: {
    fontSize: 16,
    fontWeight: "bold",
  },
  text2Error: {
    fontSize: 14,
    color: colors.neutral600,
  },
  text1Info: {
    fontSize: 16,
    fontWeight: "bold",
  },
  text2Info: {
    fontSize: 14,
    color: colors.neutral600,
  },
});

export default toastConfig;
