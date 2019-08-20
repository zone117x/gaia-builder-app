

export function domTest() {
  const el = document.getElementById('thing') as HTMLDivElement;
  el.innerText = 'works';
}
