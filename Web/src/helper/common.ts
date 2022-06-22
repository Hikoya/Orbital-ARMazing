export const checkerString = (data: string): boolean => {
  if (data !== null && data !== undefined) {
    const res = data.trim();
    return res !== '';
  } else {
    return false;
  }
};

export const checkerNumber = (data: number): boolean => {
  return !Number.isNaN(data) && data !== null && data !== undefined;
};

export const filterDuplicates = (data: any[]): any[] => {
  const uniqueArray = data.filter(function (item, pos) {
    return data.indexOf(item) == pos;
  });

  return uniqueArray;
};
