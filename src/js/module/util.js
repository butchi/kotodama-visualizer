export const inv = (n) => {
  if(n === 0) {
    return 0;
  } else {
    return 1 / (n * Math.PI);
  }
}

export const normalize = (val) => {
  return (val - 128) / 128;
}

export const maxIndexOf = (arr) => {
  return _.indexOf(arr, _.max(arr));
}

// from http://shnya.jp/blog/?p=323
export const mod = (i, j) => {
  return i % j + ((i < 0) ? j : 0);
}
