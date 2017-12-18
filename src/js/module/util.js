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

export const generateLines = (ptArr) => {
  return ptArr.reduce((txt, pt, i, arr) => {
    if (i > 0) {
      const prevPt = arr[i - 1];
      return txt + `<line x1="${prevPt.x}" y1="${prevPt.y}" x2="${pt.x}" y2="${pt.y}" stroke="#000"></line>`;
    }

    return '';
  });
}

export const generateCircles = (ptArr) => {
  return ptArr.reduce((txt, pt) => {
    return txt + `<circle cx="${pt.x}" cy="${pt.y}" r="1" fill="#000"></circle>`;
  }, '');
}

export const generatePolylinePoints = (ptArr) => {
  return ptArr.reduce((txt, pt) => {
    return txt + `${pt.x} ${pt.y} `;
  }, '');
}
