import { toast, type ToastT } from "sonner";

export const baseUri = import.meta.env.VITE_APP_API_BASE_URL as string;
export const defaultTitle = "Job title";

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

export const t = (conf: {
  message: string;
  icon?: React.ReactNode;
  description?: string;
}) => {
  const config: ToastT = {
    duration: 5000,
    id: Date.now(),
  };
  if (conf.icon) {
    config.icon = conf.icon;
  }

  if (conf.description) {
    config.description = conf.description;
  }
  toast(conf.message, config);
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
  return text
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
};
