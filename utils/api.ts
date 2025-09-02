import axios from "axios";

export const API_URL =
  __DEV__
    ? process.env.EXPO_PUBLIC_API_URL_DEV
    : process.env.EXPO_PUBLIC_API_URL_PROD

export const axiosConfig = {
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
};

axios.defaults.timeout = 10000;
