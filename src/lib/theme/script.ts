export const THEME_KEY = 'nomo-theme';

export const THEME_SCRIPT = `try{if(localStorage.getItem('${THEME_KEY}')==='dark'){var d=document.documentElement;d.dataset.theme='dark';d.style.colorScheme='dark'}}catch(e){}`;
