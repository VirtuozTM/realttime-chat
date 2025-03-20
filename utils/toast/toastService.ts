// src/services/ToastService.ts
import { Dimensions, Platform } from "react-native";
import Toast from "react-native-toast-message";

const { height } = Dimensions.get("window");
let paddingTop = Platform.OS == "ios" ? height * 0.06 : 50;

type ToastType = "success" | "error" | "info"; // Inclure tous les types que tu as définis

interface ToastOptions {
  type?: ToastType;
  text1: string;
  text2?: string;
  position?: "top" | "bottom";
  visibilityTime?: number;
  autoHide?: boolean;
  topOffset?: number;
  bottomOffset?: number;

  // Tu peux ajouter d'autres options personnalisées ici
}

const showToast = (options: ToastOptions) => {
  Toast.show({
    ...options,
    position: options.position || "top",
    topOffset: paddingTop,
  });
};

const hideToast = () => {
  Toast.hide();
};

export default {
  show: showToast,
  hide: hideToast,
};
