export const checkerString = (data: string): boolean => {
  if (data !== '' && data !== null && data !== undefined) {
    return true;
  } else {
    return false;
  }
};
