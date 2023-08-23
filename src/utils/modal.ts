export const dialogShowModalClick = (modalId: string) => {
  return () => {
    (window as any)[modalId]?.showModal();
  };
};

export const dialogHideModalClick = (modalId: string) => {
  return <Value = any>(value?: Value) => {
    (window as any)[modalId]?.close(value);
  };
};
