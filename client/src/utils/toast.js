import { toast } from "react-toastify";

const toastOptions = {
  position: "top-right",
  autoClose: 3500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "colored",
};

export const showSuccess = (message) => {
  toast.success(message, toastOptions);
};

export const showError = (message) => {
  toast.error(message, toastOptions);
};

export const showInfo = (message) => {
  toast.info(message, toastOptions);
};