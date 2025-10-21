import { Bounce, toast, type ToastOptions } from "react-toastify";

export const baseUri = import.meta.env.VITE_APP_API_BASE_URL as string;
export const defaultTitle = "What's the job title?";

export const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

export const stripProtocol = (input: string): string => {
    try {
        const parsed = new URL(input);
        return parsed.host + parsed.pathname + parsed.search + parsed.hash;
    } catch {
        // Fallback if it's not a valid URL
        return input.replace(/^https?:\/\//, "");
    }
};

const toastConfig: ToastOptions<unknown> = {
    position: "bottom-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Bounce,
};

export const t = (
    msg: string,
    type?: "success" | "warning" | "info" | "error",
) => {
    if (type) {
        toastConfig.type = type;
    }
    toast(msg, toastConfig);
};

export const htmlListToArray = (html: string): string[] => {
    // Replace all <li> elements with new lines
    const text = html
        .replace(/<\/?ul>/g, "") // remove <ul> tags
        .replace(/<li>/g, "") // remove <li>
        .replace(/<\/li>/g, "\n") // replace </li> with newline
        .replace(/<[^>]+>/g, "") // strip any remaining HTML tags
        .trim();

    // Split by newlines and clean up spaces
    return text.split("\n").map((item) => item.trim()).filter(Boolean);
};
