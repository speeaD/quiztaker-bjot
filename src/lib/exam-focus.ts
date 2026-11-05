// Visibility and window focus are independent: another window can cover an
// exam without hiding the tab, and a short tab switch is still a focus loss.
export function watchExamFocus(
  onFocusLost: () => void,
  page: Pick<Document, 'hidden' | 'addEventListener' | 'removeEventListener'> = document,
  browser: Pick<Window, 'addEventListener' | 'removeEventListener'> = window,
): () => void {
  let submitted = false;
  const submit = () => {
    if (submitted) return;
    submitted = true;
    onFocusLost();
  };
  const onVisibilityChange = () => {
    if (page.hidden) submit();
  };

  page.addEventListener('visibilitychange', onVisibilityChange);
  browser.addEventListener('blur', submit);
  onVisibilityChange();

  return () => {
    page.removeEventListener('visibilitychange', onVisibilityChange);
    browser.removeEventListener('blur', submit);
  };
}
