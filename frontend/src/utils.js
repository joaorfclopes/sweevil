export const options = ["about", "gallery", "contacts", "shop"];

export const sizes = ["xs", "s", "m", "l", "xl", "xxl"];

export const formatDateDayHour = (date) => {
  const day = date.substring(8, 10);
  const month = date.substring(5, 7);
  const year = date.substring(0, 4);
  const hour = date.substring(11, 16);
  const result = `${day}.${month}.${year}, ${hour}`;
  return result;
};

export const formatDateDay = (date) => {
  const day = date.substring(8, 10);
  const month = date.substring(5, 7);
  const year = date.substring(0, 4);
  const result = `${day}.${month}.${year}`;
  return result;
};

export const toPrice = (num) => Number(num.toFixed(2));

export const formatName = (name) => {
  if (/\s/.test(name)) {
    const firstName = name.substr(0, name.indexOf(" "));
    return firstName;
  } else {
    return name;
  }
};

export const isMobile = () => {
  if (window.innerWidth < 768) {
    return true;
  } else {
    return false;
  }
};
