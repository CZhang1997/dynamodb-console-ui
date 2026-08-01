export function setLocalStorageItem(key, item) {
  localStorage.setItem(key, JSON.stringify(item));
}

export function getLocalStorageItem(key) {
  const item = localStorage.getItem(key);
  if (item) {
    try {
      return JSON.parse(item);
    } catch (err) {
      console.log(err.message);
    }
  }
  return null;
}

export function generateRandomId() {
  return Math.random().toString(36).slice(2);
}

export function getTimeSinceDate(date) {
  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  return Math.floor(seconds) + " seconds ago";
}

export function get2DigitNumber(sum) {
  return Math.round(sum * 100) / 100;
}

export const dubugTest = () => {
  // const intervalId = setInterval(() => {
  //   debugger;
  // }, 10);
  // return () => {
  //   clearInterval(intervalId);
  // };
};
