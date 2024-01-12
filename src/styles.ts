const bodyStyle = window.getComputedStyle(document.body);

export const darkBackgroundColor = bodyStyle.getPropertyValue('--dark-background') ?? '#e6e6fa';
export const defaultColor = bodyStyle.getPropertyValue('--default-color') ?? '#708090';
